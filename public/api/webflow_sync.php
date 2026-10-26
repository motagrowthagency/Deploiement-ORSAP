<?php
/**
 * ORSAP - Webflow Headless CMS Integration & Synchronization
 * 
 * Supports:
 * 1. Webflow Webhooks (collection_item_created, collection_item_changed, collection_item_deleted)
 * 2. Manual / Automated Full Sync via Webflow REST API v2
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/github_sync.php';

function getWebflowConfig() {
    $cfg = require __DIR__ . '/config.php';
    return [
        'api_token' => $cfg['webflow_api_token'] ?? getenv('WEBFLOW_API_TOKEN') ?: '',
        'collection_id' => $cfg['webflow_collection_id'] ?? getenv('WEBFLOW_COLLECTION_ID') ?: '',
        'webhook_secret' => $cfg['webflow_webhook_secret'] ?? getenv('WEBFLOW_WEBHOOK_SECRET') ?: '',
        'admin_password' => $cfg['admin_password'] ?? getenv('ADMIN_PASSWORD') ?: '',
    ];
}

/**
 * Normalizes an item from Webflow API v2 or Webhook payload into ORSAP's BlogPost schema
 */
function normalizeWebflowItem($rawItem) {
    if (!is_array($rawItem)) return null;

    // Check if wrapped in payload (Webhook v2 format)
    $item = $rawItem['payload'] ?? $rawItem;
    $fieldData = $item['fieldData'] ?? $item;

    // Check draft / archived
    $isDraft = !empty($item['isDraft']) || !empty($fieldData['isDraft']) || !empty($item['_draft']);
    $isArchived = !empty($item['isArchived']) || !empty($fieldData['isArchived']) || !empty($item['_archived']);
    if ($isDraft || $isArchived) {
        return [
            '_should_delete' => true,
            'id' => $fieldData['slug'] ?? ($item['slug'] ?? ($item['id'] ?? ($item['_id'] ?? ''))),
        ];
    }

    $title = trim($fieldData['name'] ?? ($fieldData['title'] ?? ($item['name'] ?? '')));
    if (empty($title)) return null;

    // Generate or clean slug for URL
    $slug = trim($fieldData['slug'] ?? ($item['slug'] ?? ''));
    if (empty($slug)) {
        $slug = preg_replace('/[^a-z0-9]+/i', '-', strtolower($title));
        $slug = trim($slug, '-');
    }

    // Rich text HTML content
    $content = $fieldData['post-body'] 
        ?? ($fieldData['body'] 
        ?? ($fieldData['content'] 
        ?? ($fieldData['rich-text'] 
        ?? ($fieldData['article'] ?? ($item['post-body'] ?? '')))));

    // Summary / excerpt
    $summary = $fieldData['post-summary'] 
        ?? ($fieldData['summary'] 
        ?? ($fieldData['excerpt'] 
        ?? ($fieldData['meta-description'] ?? ($item['post-summary'] ?? ''))));

    if (empty($summary) && !empty($content)) {
        // Fallback: clean plain text from first 160 characters of content
        $clean = trim(preg_replace('/\s+/', ' ', strip_tags($content)));
        $summary = mb_substr($clean, 0, 160) . (mb_strlen($clean) > 160 ? '...' : '');
    }

    // Main image
    $image = null;
    $imgField = $fieldData['main-image'] 
        ?? ($fieldData['image'] 
        ?? ($fieldData['cover-image'] 
        ?? ($fieldData['thumbnail-image'] ?? ($item['main-image'] ?? null))));

    if (is_array($imgField)) {
        $image = $imgField['url'] ?? null;
    } elseif (is_string($imgField) && !empty($imgField)) {
        $image = $imgField;
    }

    // PDF attachment (optional)
    $pdf = null;
    $pdfField = $fieldData['pdf'] ?? ($fieldData['pdf-file'] ?? ($fieldData['document'] ?? null));
    if (is_array($pdfField)) {
        $pdf = $pdfField['url'] ?? null;
    } elseif (is_string($pdfField) && !empty($pdfField)) {
        $pdf = $pdfField;
    }

    $pdfName = $fieldData['pdf-name'] ?? ($fieldData['document-name'] ?? null);
    if ($pdf && empty($pdfName)) {
        $pdfName = basename(parse_url($pdf, PHP_URL_PATH));
    }

    // Publication date
    $date = $item['lastPublished'] 
        ?? ($item['published-on'] 
        ?? ($item['createdOn'] 
        ?? ($fieldData['date'] ?? date('Y-m-d H:i:s'))));

    return [
        'id' => $slug,
        'webflow_id' => $item['id'] ?? ($item['_id'] ?? null),
        'title' => $title,
        'summary' => $summary ?: '',
        'content' => $content ?: '',
        'date' => date('Y-m-d H:i:s', strtotime($date)),
        'image' => $image,
        'pdf' => $pdf,
        'pdfName' => $pdfName,
        'updatedAt' => date('Y-m-d H:i:s')
    ];
}

/**
 * Saves or updates a single blog post in both MySQL and blogs.json
 */
function upsertWebflowPost(array $post) {
    global $pdo;

    // 1. Update blogs.json
    $blogs = readJsonFile('blogs.json');
    $found = false;

    foreach ($blogs as $idx => $b) {
        if (($b['id'] ?? '') === $post['id']) {
            $blogs[$idx] = array_merge($b, $post);
            $found = true;
            break;
        }
    }
    if (!$found) {
        array_unshift($blogs, $post);
    }
    writeJsonFile('blogs.json', $blogs);

    // 2. Update MySQL database if available
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("
                INSERT INTO `blogs` (`id`, `date`, `title`, `summary`, `content`, `image`, `pdf`, `pdf_name`, `updated_at`)
                VALUES (:id, :date, :title, :summary, :content, :image, :pdf, :pdf_name, :updated_at)
                ON DUPLICATE KEY UPDATE
                    `title` = VALUES(`title`),
                    `summary` = VALUES(`summary`),
                    `content` = VALUES(`content`),
                    `image` = VALUES(`image`),
                    `pdf` = VALUES(`pdf`),
                    `pdf_name` = VALUES(`pdf_name`),
                    `updated_at` = VALUES(`updated_at`)
            ");
            $stmt->execute([
                ':id' => $post['id'],
                ':date' => $post['date'],
                ':title' => $post['title'],
                ':summary' => $post['summary'],
                ':content' => $post['content'],
                ':image' => $post['image'],
                ':pdf' => $post['pdf'],
                ':pdf_name' => $post['pdfName'],
                ':updated_at' => $post['updatedAt']
            ]);
        } catch (Exception $e) {
            error_log("❌ Erreur MySQL upsertWebflowPost: " . $e->getMessage());
        }
    }

    return true;
}

/**
 * Removes a post by ID from both MySQL and blogs.json
 */
function removeWebflowPost($id) {
    global $pdo;
    if (empty($id)) return false;

    $blogs = readJsonFile('blogs.json');
    $filtered = array_values(array_filter($blogs, function($b) use ($id) {
        return ($b['id'] ?? '') !== $id;
    }));
    writeJsonFile('blogs.json', $filtered);

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("DELETE FROM `blogs` WHERE `id` = :id");
            $stmt->execute([':id' => $id]);
        } catch (Exception $e) {
            error_log("❌ Erreur MySQL removeWebflowPost: " . $e->getMessage());
        }
    }

    return true;
}

/**
 * Handles incoming Webflow Webhooks
 */
function handleWebflowWebhook() {
    $config = getWebflowConfig();
    $rawInput = file_get_contents('php://input');

    // 1. Signature / Token verification
    $signature = $_SERVER['HTTP_X_WEBFLOW_SIGNATURE'] ?? '';
    $secret = $config['webhook_secret'];
    $queryToken = $_GET['token'] ?? '';

    if (!empty($secret)) {
        if (!empty($signature)) {
            $expected = hash_hmac('sha256', $rawInput, $secret);
            if (!hash_equals($expected, $signature)) {
                http_response_code(403);
                echo json_encode(['error' => 'Signature invalide']);
                exit;
            }
        } elseif ($queryToken !== $secret) {
            http_response_code(403);
            echo json_encode(['error' => 'Jeton secret invalide']);
            exit;
        }
    }

    $data = json_decode($rawInput, true);
    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'Corps JSON invalide']);
        exit;
    }

    $eventType = $data['type'] ?? ($data['event'] ?? 'collection_item_changed');

    // Deletion / Unpublish events
    if (
        $eventType === 'collection_item_deleted' || 
        $eventType === 'collection_item_unpublished'
    ) {
        $id = $data['payload']['slug'] ?? ($data['payload']['id'] ?? ($data['slug'] ?? ($data['_id'] ?? null)));
        if ($id) {
            removeWebflowPost($id);
            @syncBlogsToGitHub();
            echo json_encode(['success' => true, 'action' => 'deleted', 'id' => $id]);
            exit;
        }
    }

    // Create / Change events
    $normalized = normalizeWebflowItem($data);
    if (!$normalized) {
        http_response_code(422);
        echo json_encode(['error' => 'Impossible d\'extraire les champs de l\'article']);
        exit;
    }

    if (!empty($normalized['_should_delete'])) {
        removeWebflowPost($normalized['id']);
        @syncBlogsToGitHub();
        echo json_encode(['success' => true, 'action' => 'deleted_draft_or_archived', 'id' => $normalized['id']]);
        exit;
    }

    upsertWebflowPost($normalized);
    @syncBlogsToGitHub();

    echo json_encode(['success' => true, 'action' => 'upserted', 'blog' => $normalized]);
    exit;
}

/**
 * Performs a full fetch & synchronization of all articles in the Webflow Collection
 */
function syncAllWebflowArticles() {
    $config = getWebflowConfig();
    $apiToken = $config['api_token'];
    $collectionId = $config['collection_id'];

    if (empty($apiToken) || empty($collectionId)) {
        return [
            'success' => false,
            'error' => 'WEBFLOW_API_TOKEN ou WEBFLOW_COLLECTION_ID manquant dans la configuration (.env).'
        ];
    }

    $imported = [];
    $offset = 0;
    $limit = 100;
    $hasMore = true;

    while ($hasMore) {
        $url = "https://api.webflow.com/v2/collections/{$collectionId}/items?offset={$offset}&limit={$limit}";

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$apiToken}",
            "Accept: application/json",
            "User-Agent: ORSAP-Sync-Engine/1.0"
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        $resp = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || !$resp) {
            return [
                'success' => false,
                'error' => "Échec de l'appel API Webflow (HTTP {$httpCode}): " . substr($resp, 0, 300)
            ];
        }

        $resJson = json_decode($resp, true);
        $items = $resJson['items'] ?? [];

        if (empty($items)) {
            break;
        }

        foreach ($items as $item) {
            $norm = normalizeWebflowItem($item);
            if ($norm && empty($norm['_should_delete'])) {
                upsertWebflowPost($norm);
                $imported[] = $norm['id'];
            } elseif ($norm && !empty($norm['_should_delete'])) {
                removeWebflowPost($norm['id']);
            }
        }

        $pagination = $resJson['pagination'] ?? [];
        $total = $pagination['total'] ?? count($items);
        $offset += count($items);
        if ($offset >= $total || count($items) === 0) {
            $hasMore = false;
        }
    }

    @syncBlogsToGitHub();

    return [
        'success' => true,
        'count' => count($imported),
        'items' => $imported
    ];
}
