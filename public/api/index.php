<?php
/**
 * ORSAP - API REST Router (PHP / MySQL)
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Cookie');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';
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
        if (!$pdo) sendJson([], 200);
        $stmt = $pdo->query("SELECT * FROM `submissions` ORDER BY `created_at` DESC");
        $rows = $stmt->fetchAll();
        $formatted = array_map(function($r) {
            return [
                'id' => $r['id'],
                'createdAt' => $r['created_at'],
                'clientType' => $r['client_type'],
                'name' => $r['name'],
                'company' => $r['company'],
                'email' => $r['email'],
                'phone' => $r['phone'],
                'solutions' => json_decode($r['solutions'] ?? '[]', true) ?: [],
                'sectors' => json_decode($r['sectors'] ?? '[]', true) ?: [],
                'message' => $r['message'],
            ];
        }, $rows);
        sendJson($formatted);
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

        if ($pdo) {
            $stmt = $pdo->prepare("INSERT INTO `submissions` (`id`, `created_at`, `client_type`, `name`, `company`, `email`, `phone`, `solutions`, `sectors`, `message`)
                VALUES (:id, :created_at, :client_type, :name, :company, :email, :phone, :solutions, :sectors, :message)");
            $stmt->execute([
                ':id' => $id,
                ':created_at' => $createdAt,
                ':client_type' => $clientType,
                ':name' => $name,
                ':company' => $company ?: null,
                ':email' => $email ?: null,
                ':phone' => $phone,
                ':solutions' => json_encode($solutions),
                ':sectors' => json_encode($sectors),
                ':message' => $message ?: null,
            ]);
        }

        sendJson(['success' => true, 'id' => $id], 201);
    }
}

if (preg_match('#^/api/devis/([^/]+)$#', $uri, $matches)) {
    $id = $matches[1];
    if ($method === 'DELETE') {
        if ($pdo) {
            $stmt = $pdo->prepare("DELETE FROM `submissions` WHERE `id` = :id");
            $stmt->execute([':id' => $id]);
            if ($stmt->rowCount() > 0) {
                sendJson(['success' => true]);
            }
        }
        sendJson(['error' => 'Not found'], 404);
    }
}

// ── Recruitment API ─────────────────────────────────────────────────
if ($uri === '/api/recrutement' || $uri === '/api/recrutement/') {
    if ($method === 'GET') {
        if (!$pdo) sendJson([], 200);
        $stmt = $pdo->query("SELECT `id`, `created_at`, `name`, `email`, `phone`, `position`, `message`, `cv_name` FROM `applications` ORDER BY `created_at` DESC");
        $rows = $stmt->fetchAll();
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

        if ($pdo) {
            $stmt = $pdo->prepare("INSERT INTO `applications` (`id`, `created_at`, `name`, `email`, `phone`, `position`, `message`, `cv`, `cv_name`)
                VALUES (:id, :created_at, :name, :email, :phone, :position, :message, :cv, :cv_name)");
            $stmt->execute([
                ':id' => $id,
                ':created_at' => $createdAt,
                ':name' => $name,
                ':email' => $email,
                ':phone' => $phone,
                ':position' => $position,
                ':message' => $message ?: null,
                ':cv' => $cv,
                ':cv_name' => $cvName,
            ]);
        }

        sendJson(['success' => true, 'id' => $id], 201);
    }
}

if (preg_match('#^/api/recrutement/([^/]+)/cv$#', $uri, $matches)) {
    $id = $matches[1];
    if ($pdo) {
        $stmt = $pdo->prepare("SELECT `cv`, `cv_name` FROM `applications` WHERE `id` = :id");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        if ($row && !empty($row['cv'])) {
            if (preg_match('#^data:([^;]+);base64,(.+)$#', $row['cv'], $m)) {
                $contentType = $m[1];
                $binary = base64_decode($m[2]);
                header('Content-Type: ' . $contentType);
                header('Content-Disposition: attachment; filename="' . rawurlencode($row['cv_name'] ?: 'cv.pdf') . '"');
                echo $binary;
                exit;
            }
        }
    }
    http_response_code(404);
    echo "CV introuvable.";
    exit;
}

if (preg_match('#^/api/recrutement/([^/]+)$#', $uri, $matches)) {
    $id = $matches[1];
    if ($method === 'DELETE') {
        if ($pdo) {
            $stmt = $pdo->prepare("DELETE FROM `applications` WHERE `id` = :id");
            $stmt->execute([':id' => $id]);
            if ($stmt->rowCount() > 0) {
                sendJson(['success' => true]);
            }
        }
        sendJson(['error' => 'Not found'], 404);
    }
}

// ── Blogs API ───────────────────────────────────────────────────────
if ($uri === '/api/blogs' || $uri === '/api/blogs/') {
    if ($method === 'GET') {
        if (!$pdo) sendJson([], 200);
        $stmt = $pdo->query("SELECT * FROM `blogs` ORDER BY `date` DESC");
        $rows = $stmt->fetchAll();
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

        if ($pdo) {
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
        }

        sendJson([
            'success' => true,
            'blog' => [
                'id' => $id,
                'date' => $date,
                'title' => $title,
                'summary' => $summary,
                'content' => $content,
                'image' => $image,
                'pdf' => $pdf,
                'pdfName' => $pdfName,
            ]
        ], 201);
    }
}

if (preg_match('#^/api/blogs/([^/]+)$#', $uri, $matches)) {
    $id = $matches[1];

    if ($method === 'GET') {
        if ($pdo) {
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

        if ($pdo) {
            $stmt = $pdo->prepare("SELECT * FROM `blogs` WHERE `id` = :id");
            $stmt->execute([':id' => $id]);
            $cur = $stmt->fetch();
            if (!$cur) {
                sendJson(['error' => 'Article introuvable.'], 404);
            }

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

            sendJson([
                'success' => true,
                'blog' => [
                    'id' => $id,
                    'date' => $cur['date'],
                    'title' => $title,
                    'summary' => $summary,
                    'content' => $content,
                    'image' => $image,
                    'pdf' => $pdf,
                    'pdfName' => $pdfName,
                    'updatedAt' => $updatedAt,
                ]
            ]);
        }
        sendJson(['error' => 'Article introuvable.'], 404);
    }

    if ($method === 'DELETE') {
        if ($pdo) {
            $stmt = $pdo->prepare("DELETE FROM `blogs` WHERE `id` = :id");
            $stmt->execute([':id' => $id]);
            if ($stmt->rowCount() > 0) {
                sendJson(['success' => true]);
            }
        }
        sendJson(['error' => 'Not found'], 404);
    }
}

// ── Admin Export & Import ───────────────────────────────────────────
if ($uri === '/api/admin/export/blogs') {
    if (!isset($_COOKIE['orsap_admin_session']) || $_COOKIE['orsap_admin_session'] !== 'authenticated') {
        sendJson(['error' => 'Non autorisé'], 401);
    }
    if ($pdo) {
        $stmt = $pdo->query("SELECT * FROM `blogs` ORDER BY `date` DESC");
        $rows = $stmt->fetchAll();
        $dateStr = date('Y-m-d');
        header('Content-Type: application/json; charset=utf-8');
        header('Content-Disposition: attachment; filename=orsap_blogs_backup_' . $dateStr . '.json');
        echo json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
    sendJson([], 200);
}

if ($uri === '/api/admin/import/blogs' && $method === 'POST') {
    if (!isset($_COOKIE['orsap_admin_session']) || $_COOKIE['orsap_admin_session'] !== 'authenticated') {
        sendJson(['error' => 'Session expirée. Veuillez vous reconnecter.'], 401);
    }
    $imported = getJsonBody();
    if (empty($imported)) {
        sendJson(['error' => 'Corps de la requête vide.'], 400);
    }
    if (!is_array($imported)) {
        sendJson(['error' => 'Format invalide.'], 400);
    }
    if (isset($imported['blogs'])) $imported = $imported['blogs'];

    if ($pdo) {
        $insert = $pdo->prepare("INSERT INTO `blogs` (`id`, `date`, `title`, `summary`, `content`, `image`, `pdf`, `pdf_name`, `updated_at`)
            VALUES (:id, :date, :title, :summary, :content, :image, :pdf, :pdf_name, :updated_at)
            ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `summary` = VALUES(`summary`), `content` = VALUES(`content`), `image` = VALUES(`image`), `pdf` = VALUES(`pdf`), `pdf_name` = VALUES(`pdf_name`), `updated_at` = VALUES(`updated_at`)");
        foreach ($imported as $b) {
            $id = $b['id'] ?? (strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', $b['title'] ?? 'article'), '-')) . '-' . substr(md5(uniqid()), 0, 4));
            $insert->execute([
                ':id' => $id,
                ':date' => isset($b['date']) ? date('Y-m-d H:i:s', strtotime($b['date'])) : date('Y-m-d H:i:s'),
                ':title' => $b['title'] ?? '',
                ':summary' => $b['summary'] ?? '',
                ':content' => $b['content'] ?? '',
                ':image' => $b['image'] ?? null,
                ':pdf' => $b['pdf'] ?? null,
                ':pdf_name' => $b['pdfName'] ?? ($b['pdf_name'] ?? null),
                ':updated_at' => isset($b['updatedAt']) ? date('Y-m-d H:i:s', strtotime($b['updatedAt'])) : null,
            ]);
        }
        $stmt = $pdo->query("SELECT COUNT(*) FROM `blogs`");
        sendJson(['success' => true, 'count' => (int)$stmt->fetchColumn()]);
    }
}

// Fallback 404
sendJson(['error' => 'Endpoint introuvable'], 404);
