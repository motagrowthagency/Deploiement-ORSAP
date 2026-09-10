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

// ── JWT & User Helpers ──────────────────────────────────────────────
$JWT_SECRET = getenv('JWT_SECRET') ?: 'orsap-secure-jwt-secret-2026-auth';

function sanitizeUserPHP(array $u) {
    return [
        'id' => $u['id'] ?? '',
        'createdAt' => $u['createdAt'] ?? '',
        'email' => $u['email'] ?? '',
        'name' => $u['name'] ?? '',
        'company' => $u['company'] ?? null,
        'phone' => $u['phone'] ?? '',
        'clientType' => $u['clientType'] ?? 'professional',
        'isVerified' => !empty($u['isVerified']),
    ];
}

function generateJwtPHP(array $u) {
    global $JWT_SECRET;
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'id' => $u['id'] ?? '',
        'email' => $u['email'] ?? '',
        'name' => $u['name'] ?? '',
        'clientType' => $u['clientType'] ?? 'professional',
        'exp' => time() + (30 * 24 * 60 * 60)
    ]);
    $b64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $b64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    $sig = hash_hmac('sha256', $b64Header . "." . $b64Payload, $JWT_SECRET, true);
    $b64Sig = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($sig));
    return $b64Header . "." . $b64Payload . "." . $b64Sig;
}

function getAuthUserPHP() {
    global $JWT_SECRET;
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? ($headers['authorization'] ?? '');
    if (empty($auth) || strpos($auth, 'Bearer ') !== 0) return null;
    $token = trim(substr($auth, 7));
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    list($h64, $p64, $s64) = $parts;
    $expected = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(hash_hmac('sha256', $h64 . "." . $p64, $JWT_SECRET, true)));
    if (!hash_equals($expected, $s64)) return null;
    $payload = json_decode(base64_decode(strtr($p64, '-_', '+/')), true);
    if (!$payload || (isset($payload['exp']) && $payload['exp'] < time())) return null;
    if (empty($payload['id'])) return null;
    return findUserByIdPHP($payload['id']);
}

// ── Auth API Routes (Espace Client) ─────────────────────────────────

// Register
if ($uri === '/api/auth/register' || $uri === '/api/auth/register/') {
    if ($method === 'POST') {
        $body = getJsonBody();
        $name = trim($body['name'] ?? '');
        $email = trim(strtolower($body['email'] ?? ''));
        $phone = trim($body['phone'] ?? '');
        $company = trim($body['company'] ?? '');
        $password = $body['password'] ?? '';
        $clientType = $body['clientType'] ?? 'professional';

        if (empty($name) || empty($email) || empty($phone) || empty($password)) {
            sendJson(['error' => 'Tous les champs obligatoires (nom, email, téléphone, mot de passe) doivent être remplis.'], 400);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendJson(['error' => 'Adresse email invalide.'], 400);
        }
        if (strlen($password) < 6) {
            sendJson(['error' => 'Le mot de passe doit comporter au moins 6 caractères.'], 400);
        }

        $existing = findUserByEmailPHP($email);
        if ($existing) {
            if (!empty($existing['isVerified'])) {
                sendJson(['error' => 'Un compte vérifié existe déjà avec cette adresse email. Veuillez vous connecter.'], 400);
            }

            // Unverified user -> regenerate tokens & resend email
            $token = bin2hex(random_bytes(32));
            $code = (string)mt_rand(100000, 999999);
            $expiresAt = date('Y-m-d H:i:s', time() + 86400);
            $hash = password_hash($password, PASSWORD_BCRYPT);

            $updated = array_merge($existing, [
                'name' => $name,
                'phone' => $phone,
                'company' => $company ?: ($existing['company'] ?? null),
                'clientType' => $clientType,
                'passwordHash' => $hash,
                'verificationToken' => $token,
                'verificationCode' => $code,
                'verificationExpiresAt' => $expiresAt,
            ]);

            updateUserEntry($updated);
            $emailRes = @sendVerificationEmailPHP($email, $name, $token, $code);

            sendJson([
                'success' => true,
                'pendingVerification' => true,
                'email' => $email,
                'message' => 'Un nouvel email de vérification vous a été envoyé.',
                'previewUrl' => $emailRes['previewUrl'] ?? null,
            ]);
        }

        $id = dechex(time()) . substr(md5(uniqid(mt_rand(), true)), 0, 5);
        $token = bin2hex(random_bytes(32));
        $code = (string)mt_rand(100000, 999999);
        $expiresAt = date('Y-m-d H:i:s', time() + 86400);
        $hash = password_hash($password, PASSWORD_BCRYPT);

        $newUser = [
            'id' => $id,
            'createdAt' => date('Y-m-d H:i:s'),
            'email' => $email,
            'passwordHash' => $hash,
            'name' => $name,
            'company' => $company ?: null,
            'phone' => $phone,
            'clientType' => $clientType,
            'isVerified' => false,
            'verificationToken' => $token,
            'verificationCode' => $code,
            'verificationExpiresAt' => $expiresAt,
            'resetToken' => null,
            'resetExpiresAt' => null,
        ];

        saveUserEntry($newUser);

        // Also add to subscribers list
        saveSubscriberEntry([
            'id' => 'sub-' . $id,
            'createdAt' => date('Y-m-d H:i:s'),
            'email' => $email,
            'name' => $name,
            'company' => $company ?: null,
            'phone' => $phone,
            'clientType' => $clientType,
        ]);

        $emailRes = @sendVerificationEmailPHP($email, $name, $token, $code);

        sendJson([
            'success' => true,
            'pendingVerification' => true,
            'email' => $email,
            'message' => 'Compte créé ! Veuillez vérifier votre boîte de réception pour activer votre compte.',
            'previewUrl' => $emailRes['previewUrl'] ?? null,
        ], 201);
    }
}

// Verify with URL Token
if ($uri === '/api/auth/verify' || $uri === '/api/auth/verify/') {
    $token = $_GET['token'] ?? '';
    if (empty($token)) {
        sendJson(['error' => 'Jeton de validation manquant.'], 400);
    }

    $user = findUserByTokenPHP($token);
    if (!$user) {
        sendJson(['error' => 'Lien de confirmation invalide ou expiré.'], 400);
    }

    if (!empty($user['verificationExpiresAt']) && strtotime($user['verificationExpiresAt']) < time()) {
        sendJson(['error' => 'Ce lien de confirmation a expiré. Veuillez demander un nouvel email.', 'expired' => true, 'email' => $user['email']], 400);
    }

    $updated = array_merge($user, [
        'isVerified' => true,
        'verificationToken' => null,
        'verificationCode' => null,
        'verificationExpiresAt' => null,
    ]);

    updateUserEntry($updated);
    $jwt = generateJwtPHP($updated);

    sendJson([
        'success' => true,
        'message' => 'Votre compte a été activé avec succès !',
        'token' => $jwt,
        'user' => sanitizeUserPHP($updated),
    ]);
}

// Verify with 6-digit Code
if ($uri === '/api/auth/verify-code' || $uri === '/api/auth/verify-code/') {
    if ($method === 'POST') {
        $body = getJsonBody();
        $email = trim(strtolower($body['email'] ?? ''));
        $code = trim($body['code'] ?? '');

        if (empty($email) || empty($code)) {
            sendJson(['error' => 'Email et code de validation requis.'], 400);
        }

        $user = findUserByEmailPHP($email);
        if (!$user) {
            sendJson(['error' => 'Aucun compte trouvé avec cet email.'], 404);
        }

        if (!empty($user['isVerified'])) {
            $jwt = generateJwtPHP($user);
            sendJson([
                'success' => true,
                'message' => 'Compte déjà vérifié.',
                'token' => $jwt,
                'user' => sanitizeUserPHP($user),
            ]);
        }

        if (($user['verificationCode'] ?? '') !== $code) {
            sendJson(['error' => 'Code de confirmation incorrect.'], 400);
        }

        if (!empty($user['verificationExpiresAt']) && strtotime($user['verificationExpiresAt']) < time()) {
            sendJson(['error' => 'Ce code a expiré. Veuillez renvoyer un code.', 'expired' => true], 400);
        }

        $updated = array_merge($user, [
            'isVerified' => true,
            'verificationToken' => null,
            'verificationCode' => null,
            'verificationExpiresAt' => null,
        ]);

        updateUserEntry($updated);
        $jwt = generateJwtPHP($updated);

        sendJson([
            'success' => true,
            'message' => 'Votre compte a été activé avec succès !',
            'token' => $jwt,
            'user' => sanitizeUserPHP($updated),
        ]);
    }
}

// Resend Verification Email
if ($uri === '/api/auth/resend-verification' || $uri === '/api/auth/resend-verification/') {
    if ($method === 'POST') {
        $body = getJsonBody();
        $email = trim(strtolower($body['email'] ?? ''));
        if (empty($email)) {
            sendJson(['error' => 'Adresse email requise.'], 400);
        }

        $user = findUserByEmailPHP($email);
        if (!$user) {
            sendJson(['error' => 'Aucun compte associé à cette adresse.'], 404);
        }

        if (!empty($user['isVerified'])) {
            sendJson(['success' => true, 'message' => 'Ce compte est déjà vérifié.']);
        }

        $token = bin2hex(random_bytes(32));
        $code = (string)mt_rand(100000, 999999);
        $expiresAt = date('Y-m-d H:i:s', time() + 86400);

        $updated = array_merge($user, [
            'verificationToken' => $token,
            'verificationCode' => $code,
            'verificationExpiresAt' => $expiresAt,
        ]);

        updateUserEntry($updated);
        $emailRes = @sendVerificationEmailPHP($email, $user['name'] ?? '', $token, $code);

        sendJson([
            'success' => true,
            'message' => 'Un nouvel email de confirmation a été envoyé.',
            'previewUrl' => $emailRes['previewUrl'] ?? null,
        ]);
    }
}

// Login
if ($uri === '/api/auth/login' || $uri === '/api/auth/login/') {
    if ($method === 'POST') {
        $body = getJsonBody();
        $email = trim(strtolower($body['email'] ?? ''));
        $password = $body['password'] ?? '';

        if (empty($email) || empty($password)) {
            sendJson(['error' => 'Email et mot de passe requis.'], 400);
        }

        $user = findUserByEmailPHP($email);
        if (!$user || !password_verify($password, $user['passwordHash'] ?? '')) {
            sendJson(['error' => 'Email ou mot de passe incorrect.'], 401);
        }

        if (empty($user['isVerified'])) {
            sendJson([
                'error' => 'Votre compte n\'est pas encore activé. Veuillez vérifier vos emails.',
                'unverified' => true,
                'email' => $user['email'],
            ], 403);
        }

        $jwt = generateJwtPHP($user);
        sendJson([
            'success' => true,
            'token' => $jwt,
            'user' => sanitizeUserPHP($user),
        ]);
    }
}

// Me (Current authenticated user & quotes)
if ($uri === '/api/auth/me' || $uri === '/api/auth/me/') {
    $user = getAuthUserPHP();
    if (!$user) {
        sendJson(['error' => 'Non authentifié ou session expirée.'], 401);
    }

    $allSubs = readJsonFile('submissions.json');
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT * FROM `submissions` ORDER BY `created_at` DESC");
            $rows = $stmt->fetchAll();
            if (!empty($rows)) {
                $allSubs = array_map(function($r) {
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
            }
        } catch (Exception $e) {}
    }

    $uEmail = strtolower($user['email'] ?? '');
    $uPhone = preg_replace('/\D/', '', $user['phone'] ?? '');

    $clientSubs = array_values(array_filter($allSubs, function($s) use ($uEmail, $uPhone) {
        $sEmail = strtolower($s['email'] ?? '');
        $sPhone = preg_replace('/\D/', '', $s['phone'] ?? '');
        return ($sEmail && $sEmail === $uEmail) || ($uPhone && $sPhone && $sPhone === $uPhone);
    }));

    sendJson([
        'user' => sanitizeUserPHP($user),
        'submissions' => $clientSubs,
    ]);
}

// Profile update
if ($uri === '/api/auth/profile' || $uri === '/api/auth/profile/') {
    if ($method === 'PUT') {
        $user = getAuthUserPHP();
        if (!$user) {
            sendJson(['error' => 'Non authentifié.'], 401);
        }

        $body = getJsonBody();
        $name = trim($body['name'] ?? '');
        $phone = trim($body['phone'] ?? '');
        $company = trim($body['company'] ?? '');

        if (empty($name) || empty($phone)) {
            sendJson(['error' => 'Le nom et le téléphone sont obligatoires.'], 400);
        }

        $updated = array_merge($user, [
            'name' => $name,
            'phone' => $phone,
            'company' => $company ?: null,
        ]);

        updateUserEntry($updated);
        sendJson(['success' => true, 'user' => sanitizeUserPHP($updated)]);
    }
}

// Forgot password
if ($uri === '/api/auth/forgot-password' || $uri === '/api/auth/forgot-password/') {
    if ($method === 'POST') {
        $body = getJsonBody();
        $email = trim(strtolower($body['email'] ?? ''));
        if (empty($email)) {
            sendJson(['error' => 'Adresse email requise.'], 400);
        }

        $user = findUserByEmailPHP($email);
        if (!$user) {
            sendJson(['success' => true, 'message' => 'Si un compte existe avec cet email, un lien de réinitialisation vous a été envoyé.']);
        }

        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', time() + 3600);

        $updated = array_merge($user, [
            'resetToken' => $token,
            'resetExpiresAt' => $expiresAt,
        ]);

        updateUserEntry($updated);
        @sendPasswordResetEmailPHP($email, $user['name'] ?? '', $token);

        sendJson(['success' => true, 'message' => 'Si un compte existe avec cet email, un lien de réinitialisation vous a été envoyé.']);
    }
}

// Reset password
if ($uri === '/api/auth/reset-password' || $uri === '/api/auth/reset-password/') {
    if ($method === 'POST') {
        $body = getJsonBody();
        $token = $body['token'] ?? '';
        $newPassword = $body['newPassword'] ?? '';

        if (empty($token) || empty($newPassword)) {
            sendJson(['error' => 'Jeton et nouveau mot de passe requis.'], 400);
        }
        if (strlen($newPassword) < 6) {
            sendJson(['error' => 'Le mot de passe doit comporter au moins 6 caractères.'], 400);
        }

        $user = findUserByTokenPHP($token);
        if (!$user || ($user['resetToken'] ?? '') !== $token) {
            sendJson(['error' => 'Lien de réinitialisation invalide ou expiré.'], 400);
        }

        if (!empty($user['resetExpiresAt']) && strtotime($user['resetExpiresAt']) < time()) {
            sendJson(['error' => 'Ce lien de réinitialisation a expiré.'], 400);
        }

        $hash = password_hash($newPassword, PASSWORD_BCRYPT);
        $updated = array_merge($user, [
            'passwordHash' => $hash,
            'resetToken' => null,
            'resetExpiresAt' => null,
            'isVerified' => true,
        ]);

        updateUserEntry($updated);
        $jwt = generateJwtPHP($updated);

        sendJson([
            'success' => true,
            'message' => 'Mot de passe mis à jour avec succès !',
            'token' => $jwt,
            'user' => sanitizeUserPHP($updated),
        ]);
    }
}

// ── Admin Client Management Routes ──────────────────────────────────
if ($uri === '/api/admin/users' || $uri === '/api/admin/users/') {
    if ($method === 'GET') {
        $users = loadUsersList();
        sendJson(array_map('sanitizeUserPHP', $users));
    }
}

if (preg_match('#^/api/admin/users/([^/]+)$#', $uri, $matches)) {
    $id = $matches[1];
    if ($method === 'DELETE') {
        deleteUserEntry($id);
        sendJson(['success' => true]);
    }
}

if (preg_match('#^/api/admin/users/([^/]+)/verify$#', $uri, $matches)) {
    $id = $matches[1];
    if ($method === 'POST') {
        $user = findUserByIdPHP($id);
        if (!$user) {
            sendJson(['error' => 'Compte introuvable.'], 404);
        }
        $updated = array_merge($user, [
            'isVerified' => true,
            'verificationToken' => null,
            'verificationCode' => null,
            'verificationExpiresAt' => null,
        ]);
        updateUserEntry($updated);
        sendJson(['success' => true, 'user' => sanitizeUserPHP($updated)]);
    }
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

// ── Newsletter / Subscribers API ────────────────────────────────────
if ($uri === '/api/newsletter' || $uri === '/api/newsletter/') {
    if ($method === 'GET') {
        if ($pdo) {
            try {
                $stmt = $pdo->query("SELECT * FROM `subscribers` ORDER BY `created_at` DESC");
                $rows = $stmt->fetchAll();
                if (!empty($rows)) {
                    $formatted = array_map(function($r) {
                        return [
                            'id' => $r['id'],
                            'createdAt' => $r['created_at'],
                            'email' => $r['email'],
                            'name' => $r['name'],
                            'company' => $r['company'],
                            'phone' => $r['phone'],
                            'clientType' => $r['client_type'],
                        ];
                    }, $rows);
                    sendJson($formatted);
                }
            } catch (Exception $e) {}
        }
        sendJson(readJsonFile('subscribers.json'));
    }

    if ($method === 'POST') {
        $body = getJsonBody();
        $email = trim(strtolower($body['email'] ?? ''));
        $name = trim($body['name'] ?? '');
        $company = trim($body['company'] ?? '');
        $phone = trim($body['phone'] ?? '');
        $clientType = $body['clientType'] ?? 'professional';

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendJson(['error' => 'Une adresse email valide est obligatoire.'], 400);
        }
        if (empty($name) || empty($company) || empty($phone)) {
            sendJson(['error' => 'Le nom, la société et le numéro de téléphone sont obligatoires.'], 400);
        }

        $id = dechex(time()) . substr(md5(uniqid(mt_rand(), true)), 0, 5);
        $createdAt = date('Y-m-d H:i:s');

        $entry = [
            'id' => $id,
            'createdAt' => $createdAt,
            'email' => $email,
            'name' => $name ?: null,
            'company' => $company ?: null,
            'phone' => $phone ?: null,
            'clientType' => $clientType,
        ];

        saveSubscriberEntry($entry);
        @sendSubscriberNotificationEmail($entry);
        sendJson(['success' => true, 'id' => $id], 201);
    }
}

if (preg_match('#^/api/newsletter/([^/]+)$#', $uri, $matches)) {
    $id = $matches[1];
    if ($method === 'DELETE') {
        $subs = readJsonFile('subscribers.json');
        $filtered = array_values(array_filter($subs, function($s) use ($id) {
            return ($s['id'] ?? '') !== $id;
        }));
        writeJsonFile('subscribers.json', $filtered);

        if ($pdo) {
            try {
                $stmt = $pdo->prepare("DELETE FROM `subscribers` WHERE `id` = :id");
                $stmt->execute([':id' => $id]);
            } catch (Exception $e) {}
        }
        sendJson(['success' => true]);
    }
}

if ($uri === '/api/admin/export/subscribers' || $uri === '/api/admin/export/subscribers/') {
    $subs = [];
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT * FROM `subscribers` ORDER BY `created_at` DESC");
            $subs = $stmt->fetchAll();
        } catch (Exception $e) {}
    }
    if (empty($subs)) {
        $subs = readJsonFile('subscribers.json');
    }
    $dateStr = date('Y-m-d');
    $csv = "\xEF\xBB\xBFID,Date Inscription,Email,Nom,Societe,Telephone,Type Client\n";
    foreach ($subs as $s) {
        $csv .= sprintf('"%s","%s","%s","%s","%s","%s","%s"' . "\n",
            $s['id'] ?? '',
            $s['created_at'] ?? ($s['createdAt'] ?? ''),
            $s['email'] ?? '',
            str_replace('"', '""', $s['name'] ?? ''),
            str_replace('"', '""', $s['company'] ?? ''),
            $s['phone'] ?? '',
            $s['client_type'] ?? ($s['clientType'] ?? 'professional')
        );
    }
    header('Content-Disposition: attachment; filename="orsap_abonnes_' . $dateStr . '.csv"');
    header('Content-Type: text/csv; charset=utf-8');
    echo $csv;
    exit;
}

// ── Blogs API ───────────────────────────────────────────────────────
if ($uri === '/api/blogs' || $uri === '/api/blogs/') {
    if ($method === 'GET') {
        // Images/PDFs are now stored as real files (see saveBlogAsset()) and
        // blogs.json only holds their URL paths, so the list payload is tiny
        // -- no need to strip anything out anymore.
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
        $pdfName = $body['pdfName'] ?? null;

        if (empty($title) || empty($summary) || empty($content)) {
            sendJson(['error' => 'Titre, résumé et contenu sont requis.'], 400);
        }

        $slug = strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', $title), '-'));
        $id = $slug . '-' . substr(md5(uniqid(mt_rand(), true)), 0, 4);
        $date = date('Y-m-d H:i:s');

        // Decode & save any base64 image/PDF to a real file; blogs.json
        // only stores the resulting URL path, not the raw data.
        $image = saveBlogAsset($body['image'] ?? null, $id, 'image');
        $pdf = saveBlogAsset($body['pdf'] ?? null, $id, 'document');

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
                if (array_key_exists('image', $body)) $blogs[$k]['image'] = saveBlogAsset($body['image'], $id, 'image');
                if (array_key_exists('pdf', $body)) $blogs[$k]['pdf'] = saveBlogAsset($body['pdf'], $id, 'document');
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
                    // Reuse the already-saved-to-disk paths from the JSON
                    // branch above rather than re-decoding raw base64 again.
                    $image = $updatedItem['image'] ?? $cur['image'];
                    $pdf = $updatedItem['pdf'] ?? $cur['pdf'];
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
        deleteBlogAssets($id);

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

// One-time migration: move existing base64-embedded images/PDFs out of
// blogs.json into real files, replacing them with URL paths. Safe to run
// more than once -- already-migrated posts (image/pdf not a data: URI)
// are left untouched on a re-run.
if ($uri === '/api/admin/migrate-blog-assets' && $method === 'POST') {
    @set_time_limit(300);
    $blogs = readJsonFile('blogs.json');
    $migrated = 0;
    $skipped = 0;

    foreach ($blogs as $k => $b) {
        $id = $b['id'] ?? '';
        if (empty($id)) {
            $skipped++;
            continue;
        }

        $changed = false;
        if (!empty($b['image']) && strpos($b['image'], 'data:') === 0) {
            $newImage = saveBlogAsset($b['image'], $id, 'image');
            if ($newImage) {
                $blogs[$k]['image'] = $newImage;
                $changed = true;
            }
        }
        if (!empty($b['pdf']) && strpos($b['pdf'], 'data:') === 0) {
            $newPdf = saveBlogAsset($b['pdf'], $id, 'document');
            if ($newPdf) {
                $blogs[$k]['pdf'] = $newPdf;
                $changed = true;
            }
        }
        if ($changed) {
            $migrated++;
        } else {
            $skipped++;
        }
    }

    if ($migrated > 0) {
        $ok = writeJsonFile('blogs.json', $blogs);
        if (!$ok) {
            sendJson(['error' => "Échec de l'écriture de blogs.json après migration -- aucune donnée n'a été perdue, les fichiers d'origine sont intacts."], 500);
        }
    }

    sendJson(['success' => true, 'migrated' => $migrated, 'skipped' => $skipped, 'total' => count($blogs)]);
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

