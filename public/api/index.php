<?php
/**
 * ORSAP - API REST Router (PHP / MySQL / JSON Fallback) & Email Notifications
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Cookie');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/mail.php';
require_once __DIR__ . '/github_sync.php';
$pdo = getDbConnection();

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Helper to send JSON response
function sendJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Helper to get JSON request body
function getJsonBody() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?: [];
}

// ── Devis API ───────────────────────────────────────────────────────
if ($uri === '/api/devis' || $uri === '/api/devis/') {
    if ($method === 'GET') {
        if ($pdo) {
            try {
                $stmt = $pdo->query("SELECT * FROM `submissions` ORDER BY `created_at` DESC");
                $rows = $stmt->fetchAll();
                if (!empty($rows)) {
                    $formatted = array_map(function($r) {
                        return [
                            'id' => $r['id'],
                            'createdAt' => $r['created_at'],
                            'clientType' => $r['client_type'],
                            'name' => $r['name'],
                            'company' => $r['company'],
                            'email' => $r['email'],
                            'phone' => $r['phone'],
                            'solutions' => is_string($r['solutions']) ? (json_decode($r['solutions'], true) ?: []) : ($r['solutions'] ?? []),
                            'sectors' => is_string($r['sectors']) ? (json_decode($r['sectors'], true) ?: []) : ($r['sectors'] ?? []),
                            'message' => $r['message'],
                        ];
                    }, $rows);
                    sendJson($formatted);
                }
            } catch (Exception $e) {}
        }
        sendJson(readJsonFile('submissions.json'));
    }

    if ($method === 'POST') {
        $body = getJsonBody();
        $name = trim($body['name'] ?? '');
        $phone = trim($body['phone'] ?? '');
        $clientType = $body['clientType'] ?? 'professional';
        $company = trim($body['company'] ?? '');
        $email = trim($body['email'] ?? '');
        $message = trim($body['message'] ?? '');
        $solutions = $body['solutions'] ?? [];
        $sectors = $body['sectors'] ?? [];

        if (empty($name) || empty($phone)) {
            sendJson(['error' => 'Nom et téléphone sont obligatoires.'], 400);
        }
        if ($clientType === 'professional' && (empty($company) || empty($email))) {
            sendJson(['error' => 'Entreprise et email sont obligatoires pour un professionnel.'], 400);
        }

        $id = dechex(time()) . substr(md5(uniqid(mt_rand(), true)), 0, 5);
        $createdAt = date('Y-m-d H:i:s');

        $entry = [
            'id' => $id,
            'createdAt' => $createdAt,
            'clientType' => $clientType,
            'name' => $name,
            'company' => $company ?: null,
            'email' => $email ?: null,
            'phone' => $phone,
            'solutions' => $clientType === 'professional' ? $solutions : [],
            'sectors' => $clientType === 'professional' ? $sectors : [],
            'message' => $message ?: null,
        ];

        saveSubmissionEntry($entry);
        @sendDevisNotificationEmail($entry);
        sendJson(['success' => true, 'id' => $id], 201);
    }
}

if (preg_match('#^/api/devis/([^/]+)$#', $uri, $matches)) {
    $id = $matches[1];
    if ($method === 'DELETE') {
        $subs = readJsonFile('submissions.json');
        $filtered = array_values(array_filter($subs, function($s) use ($id) {
            return ($s['id'] ?? '') !== $id;
        }));
        writeJsonFile('submissions.json', $filtered);

        if ($pdo) {
            try {
                $stmt = $pdo->prepare("DELETE FROM `submissions` WHERE `id` = :id");
                $stmt->execute([':id' => $id]);
            } catch (Exception $e) {}
        }
        sendJson(['success' => true]);
    }
}

// ── Recruitment API ─────────────────────────────────────────────────
if ($uri === '/api/recrutement' || $uri === '/api/recrutement/') {
    if ($method === 'GET') {
        if ($pdo) {
            try {
                $stmt = $pdo->query("SELECT `id`, `created_at`, `name`, `email`, `phone`, `position`, `message`, `cv_name` FROM `applications` ORDER BY `created_at` DESC");
                $rows = $stmt->fetchAll();
                if (!empty($rows)) {
                    $formatted = array_map(function($r) {
                        return [
                            'id' => $r['id'],
                            'createdAt' => $r['created_at'],
                            'name' => $r['name'],
                            'email' => $r['email'],
                            'phone' => $r['phone'],
                            'position' => $r['position'],
                            'message' => $r['message'],
                            'cvName' => $r['cv_name'],
                        ];
                    }, $rows);
                    sendJson($formatted);
                }
            } catch (Exception $e) {}
        }
        sendJson(readJsonFile('applications.json'));
    }

    if ($method === 'POST') {
        $body = getJsonBody();
        $name = trim($body['name'] ?? '');
        $email = trim($body['email'] ?? '');
        $phone = trim($body['phone'] ?? '');
        $position = trim($body['position'] ?? '');
        $message = trim($body['message'] ?? '');
        $cv = $body['cv'] ?? '';
        $cvName = trim($body['cvName'] ?? 'cv.pdf');

        if (empty($name) || empty($email) || empty($phone) || empty($position) || empty($cv)) {
            sendJson(['error' => 'Tous les champs obligatoires (nom, email, téléphone, poste, CV) doivent être remplis.'], 400);
        }

        $id = dechex(time()) . substr(md5(uniqid(mt_rand(), true)), 0, 5);
        $createdAt = date('Y-m-d H:i:s');

        $entry = [
            'id' => $id,
            'createdAt' => $createdAt,
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'position' => $position,
            'message' => $message ?: null,
            'cv' => $cv,
            'cvName' => $cvName,
        ];

        saveApplicationEntry($entry);
        @sendApplicationNotificationEmail($entry);
        sendJson(['success' => true, 'id' => $id], 201);
    }
}

if (preg_match('#^/api/recrutement/([^/]+)/cv$#', $uri, $matches)) {
    $id = $matches[1];
    $cvBase64 = null;
    $cvName = 'cv.pdf';

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT `cv`, `cv_name` FROM `applications` WHERE `id` = :id");
            $stmt->execute([':id' => $id]);
            $row = $stmt->fetch();
            if ($row && !empty($row['cv'])) {
                $cvBase64 = $row['cv'];
                $cvName = $row['cv_name'] ?: 'cv.pdf';
            }
        } catch (Exception $e) {}
    }

    if (!$cvBase64) {
        $apps = readJsonFile('applications.json');
        foreach ($apps as $a) {
            if (($a['id'] ?? '') === $id && !empty($a['cv'])) {
                $cvBase64 = $a['cv'];
                $cvName = $a['cvName'] ?? ($a['cv_name'] ?? 'cv.pdf');
                break;
            }
        }
    }

    if ($cvBase64 && preg_match('#^data:([^;]+);base64,(.+)$#', $cvBase64, $m)) {
        $contentType = $m[1];
        $binary = base64_decode($m[2]);
        header('Content-Type: ' . $contentType);
        header('Content-Disposition: attachment; filename="' . rawurlencode($cvName) . '"');
        echo $binary;
        exit;
    }

    http_response_code(404);
    echo "CV introuvable.";
    exit;
}

if (preg_match('#^/api/recrutement/([^/]+)$#', $uri, $matches)) {
    $id = $matches[1];
    if ($method === 'DELETE') {
        $apps = readJsonFile('applications.json');
        $filtered = array_values(array_filter($apps, function($a) use ($id) {
            return ($a['id'] ?? '') !== $id;
        }));
        writeJsonFile('applications.json', $filtered);

        if ($pdo) {
            try {
                $stmt = $pdo->prepare("DELETE FROM `applications` WHERE `id` = :id");
                $stmt->execute([':id' => $id]);
            } catch (Exception $e) {}
        }
        sendJson(['success' => true]);
    }
}

// ── Blogs API ───────────────────────────────────────────────────────
if ($uri === '/api/blogs' || $uri === '/api/blogs/') {
    if ($method === 'GET') {
        if ($pdo) {
            try {
                $stmt = $pdo->query("SELECT * FROM `blogs` ORDER BY `date` DESC");
                $rows = $stmt->fetchAll();
                if (!empty($rows)) {
                    $formatted = array_map(function($r) {
                        return [
                            'id' => $r['id'],
                            'date' => $r['date'],
                            'title' => $r['title'],
                            'summary' => $r['summary'],
                            'content' => $r['content'],
                            'image' => $r['image'],
                            'pdf' => $r['pdf'],
                            'pdfName' => $r['pdf_name'],
                            'updatedAt' => $r['updated_at'],
                        ];
                    }, $rows);
                    sendJson($formatted);
                }
            } catch (Exception $e) {}
        }
        sendJson(readJsonFile('blogs.json'));
    }

    if ($method === 'POST') {
        $body = getJsonBody();
        $title = trim($body['title'] ?? '');
        $summary = trim($body['summary'] ?? '');
        $content = trim($body['content'] ?? '');
        $image = $body['image'] ?? null;
        $pdf = $body['pdf'] ?? null;
        $pdfName = $body['pdfName'] ?? null;

        if (empty($title) || empty($summary) || empty($content)) {
            sendJson(['error' => 'Titre, résumé et contenu sont requis.'], 400);
        }

        $slug = strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', $title), '-'));
        $id = $slug . '-' . substr(md5(uniqid(mt_rand(), true)), 0, 4);
        $date = date('Y-m-d H:i:s');

        $newPost = [
            'id' => $id,
            'date' => $date,
            'title' => $title,
            'summary' => $summary,
            'content' => $content,
            'image' => $image,
            'pdf' => $pdf,
            'pdfName' => $pdfName,
        ];

        // Save JSON
        $blogs = readJsonFile('blogs.json');
        array_unshift($blogs, $newPost);
        writeJsonFile('blogs.json', $blogs);

        // Save MySQL
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("INSERT INTO `blogs` (`id`, `date`, `title`, `summary`, `content`, `image`, `pdf`, `pdf_name`)
                    VALUES (:id, :date, :title, :summary, :content, :image, :pdf, :pdf_name)");
                $stmt->execute([
                    ':id' => $id,
                    ':date' => $date,
                    ':title' => $title,
                    ':summary' => $summary,
                    ':content' => $content,
                    ':image' => $image,
                    ':pdf' => $pdf,
                    ':pdf_name' => $pdfName,
                ]);
            } catch (Exception $e) {}
        }

        // Auto-sync to GitHub if token configured
        @syncBlogsToGitHub();

        sendJson(['success' => true, 'blog' => $newPost], 201);
    }
}

if (preg_match('#^/api/blogs/([^/]+)$#', $uri, $matches)) {
    $id = $matches[1];

    if ($method === 'GET') {
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("SELECT * FROM `blogs` WHERE `id` = :id");
                $stmt->execute([':id' => $id]);
                $row = $stmt->fetch();
                if ($row) {
                    sendJson([
                        'id' => $row['id'],
                        'date' => $row['date'],
                        'title' => $row['title'],
                        'summary' => $row['summary'],
                        'content' => $row['content'],
                        'image' => $row['image'],
                        'pdf' => $row['pdf'],
                        'pdfName' => $row['pdf_name'],
                        'updatedAt' => $row['updated_at'],
                    ]);
                }
            } catch (Exception $e) {}
        }
        $blogs = readJsonFile('blogs.json');
        foreach ($blogs as $b) {
            if (($b['id'] ?? '') === $id) {
                sendJson($b);
            }
        }
        sendJson(['error' => 'Article introuvable.'], 404);
    }

    if ($method === 'PUT') {
        $body = getJsonBody();
        $title = trim($body['title'] ?? '');
        $summary = trim($body['summary'] ?? '');
        $content = trim($body['content'] ?? '');

        if (empty($title) || empty($summary) || empty($content)) {
            sendJson(['error' => 'Titre, résumé et contenu sont requis.'], 400);
        }

        $blogs = readJsonFile('blogs.json');
        $updatedItem = null;
        foreach ($blogs as $k => $b) {
            if (($b['id'] ?? '') === $id) {
                $blogs[$k]['title'] = $title;
                $blogs[$k]['summary'] = $summary;
                $blogs[$k]['content'] = $content;
                if (array_key_exists('image', $body)) $blogs[$k]['image'] = $body['image'];
                if (array_key_exists('pdf', $body)) $blogs[$k]['pdf'] = $body['pdf'];
                if (array_key_exists('pdfName', $body)) $blogs[$k]['pdfName'] = $body['pdfName'];
                $blogs[$k]['updatedAt'] = date('Y-m-d H:i:s');
                $updatedItem = $blogs[$k];
                break;
            }
        }
        if ($updatedItem) {
            writeJsonFile('blogs.json', $blogs);
        }

        if ($pdo) {
            try {
                $stmt = $pdo->prepare("SELECT * FROM `blogs` WHERE `id` = :id");
                $stmt->execute([':id' => $id]);
                $cur = $stmt->fetch();
                if ($cur) {
                    $image = array_key_exists('image', $body) ? $body['image'] : $cur['image'];
                    $pdf = array_key_exists('pdf', $body) ? $body['pdf'] : $cur['pdf'];
                    $pdfName = array_key_exists('pdfName', $body) ? $body['pdfName'] : $cur['pdf_name'];
                    $updatedAt = date('Y-m-d H:i:s');

                    $update = $pdo->prepare("UPDATE `blogs` SET `title` = :title, `summary` = :summary, `content` = :content, `image` = :image, `pdf` = :pdf, `pdf_name` = :pdf_name, `updated_at` = :updated_at WHERE `id` = :id");
                    $update->execute([
                        ':title' => $title,
                        ':summary' => $summary,
                        ':content' => $content,
                        ':image' => $image,
                        ':pdf' => $pdf,
                        ':pdf_name' => $pdfName,
                        ':updated_at' => $updatedAt,
                        ':id' => $id,
                    ]);
                }
            } catch (Exception $e) {}
        }

        // Auto-sync to GitHub
        @syncBlogsToGitHub();

        if ($updatedItem) {
            sendJson(['success' => true, 'blog' => $updatedItem]);
        }
        sendJson(['error' => 'Article introuvable.'], 404);
    }

    if ($method === 'DELETE') {
        $blogs = readJsonFile('blogs.json');
        $filtered = array_values(array_filter($blogs, function($b) use ($id) {
            return ($b['id'] ?? '') !== $id;
        }));
        writeJsonFile('blogs.json', $filtered);

        if ($pdo) {
            try {
                $stmt = $pdo->prepare("DELETE FROM `blogs` WHERE `id` = :id");
                $stmt->execute([':id' => $id]);
            } catch (Exception $e) {}
        }

        // Auto-sync to GitHub
        @syncBlogsToGitHub();

        sendJson(['success' => true]);
    }
}

// ── Admin Export, Import & GitHub Sync ──────────────────────────────
if ($uri === '/api/admin/export/blogs') {
    $blogs = readJsonFile('blogs.json');
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT * FROM `blogs` ORDER BY `date` DESC");
            $rows = $stmt->fetchAll();
            if (!empty($rows)) $blogs = $rows;
        } catch (Exception $e) {}
    }
    
    // Auto-sync to GitHub when downloading/exporting
    @syncBlogsToGitHub($blogs);

    $dateStr = date('Y-m-d');
    header('Content-Type: application/json; charset=utf-8');
    header('Content-Disposition: attachment; filename=orsap_blogs_backup_' . $dateStr . '.json');
    echo json_encode($blogs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($uri === '/api/admin/import/blogs' && $method === 'POST') {
    $imported = getJsonBody();
    if (empty($imported)) {
        sendJson(['error' => 'Corps de la requête vide.'], 400);
    }
    if (!is_array($imported)) {
        sendJson(['error' => 'Format invalide.'], 400);
    }
    if (isset($imported['blogs'])) $imported = $imported['blogs'];

    $blogs = readJsonFile('blogs.json');
    $map = [];
    foreach ($blogs as $b) {
        if (!empty($b['id'])) $map[$b['id']] = $b;
    }
    foreach ($imported as $b) {
        $id = $b['id'] ?? (strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', $b['title'] ?? 'article'), '-')) . '-' . substr(md5(uniqid()), 0, 4));
        $map[$id] = [
            'id' => $id,
            'date' => $b['date'] ?? date('Y-m-d H:i:s'),
            'title' => $b['title'] ?? '',
            'summary' => $b['summary'] ?? '',
            'content' => $b['content'] ?? '',
            'image' => $b['image'] ?? null,
            'pdf' => $b['pdf'] ?? null,
            'pdfName' => $b['pdfName'] ?? ($b['pdf_name'] ?? null),
        ];
    }
    $merged = array_values($map);
    writeJsonFile('blogs.json', $merged);

    if ($pdo) {
        try {
            $insert = $pdo->prepare("INSERT INTO `blogs` (`id`, `date`, `title`, `summary`, `content`, `image`, `pdf`, `pdf_name`, `updated_at`)
                VALUES (:id, :date, :title, :summary, :content, :image, :pdf, :pdf_name, :updated_at)
                ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `summary` = VALUES(`summary`), `content` = VALUES(`content`), `image` = VALUES(`image`), `pdf` = VALUES(`pdf`), `pdf_name` = VALUES(`pdf_name`), `updated_at` = VALUES(`updated_at`)");
            foreach ($merged as $b) {
                $insert->execute([
                    ':id' => $b['id'],
                    ':date' => date('Y-m-d H:i:s', strtotime($b['date'])),
                    ':title' => $b['title'],
                    ':summary' => $b['summary'],
                    ':content' => $b['content'],
                    ':image' => $b['image'],
                    ':pdf' => $b['pdf'],
                    ':pdf_name' => $b['pdfName'],
                    ':updated_at' => null,
                ]);
            }
        } catch (Exception $e) {}
    }

    // Auto-sync to GitHub
    $syncRes = syncBlogsToGitHub($merged);

    sendJson([
        'success' => true, 
        'count' => count($merged),
        'github_sync' => $syncRes
    ]);
}

// Dedicated GitHub Sync Endpoint
if ($uri === '/api/admin/sync/github' && $method === 'POST') {
    $res = syncBlogsToGitHub();
    sendJson($res, $res['success'] ? 200 : 400);
}

// GitHub Token Configuration Endpoint
if ($uri === '/api/admin/config/github') {
    if ($method === 'GET') {
        $token = getGitHubToken();
        $config = require __DIR__ . '/config.php';
        sendJson([
            'configured' => !empty($token),
            'repo' => $config['github_repo'] ?? 'motagrowthagency/Deploiement-ORSAP',
            'branch' => $config['github_branch'] ?? 'main',
            'path' => $config['github_path'] ?? 'data/blogs.json'
        ]);
    }

    if ($method === 'POST') {
        $body = getJsonBody();
        $token = trim($body['token'] ?? '');
        if (empty($token)) {
            sendJson(['error' => 'Token vide.'], 400);
        }
        saveGitHubToken($token);
        // Test sync immediately
        $syncResult = syncBlogsToGitHub();
        sendJson([
            'success' => true,
            'message' => 'Token GitHub enregistré avec succès.',
            'sync' => $syncResult
        ]);
    }
}

// Fallback 404
sendJson(['error' => 'Endpoint introuvable'], 404);

