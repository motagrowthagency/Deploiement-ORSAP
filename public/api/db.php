<?php
/**
 * ORSAP - Couche de données PDO MySQL & JSON Redondant
 */

// blogs.json accumulates large base64-encoded images/PDFs; reading, decoding,
// modifying and re-encoding the whole file on every write needs well above
// PHP's default 256M. Raise it (best-effort -- ignored if the host locks
// memory_limit at PHP_INI_SYSTEM level).
@ini_set('memory_limit', '1024M');

$GLOBALS['db_status'] = 'Non initialisé';
$GLOBALS['db_error'] = '';

function getDbConnection() {
    static $pdo = null;
    static $hasTried = false;
    if ($pdo !== null) {
        return $pdo;
    }
    if ($hasTried) {
        return null;
    }
    $hasTried = true;

    // Fast check: if MySQL connection failed within the last 60 seconds, don't wait for timeout again
    $cacheFile = sys_get_temp_dir() . '/orsap_db_offline.flag';
    if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < 60) {
        $GLOBALS['db_status'] = 'Stockage JSON (MySQL hors ligne)';
        return null;
    }

    $config = require __DIR__ . '/config.php';

    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
        $config['db_host'],
        $config['db_port'],
        $config['db_name']
    );

    try {
        $pdo = new PDO($dsn, $config['db_user'], $config['db_pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_TIMEOUT => 1,
        ]);

        if (file_exists($cacheFile)) {
            @unlink($cacheFile);
        }

        initTables($pdo);
        $GLOBALS['db_status'] = 'MySQL Connecté (' . $config['db_name'] . ')';
        return $pdo;
    } catch (Exception $e) {
        @touch($cacheFile);
        $GLOBALS['db_status'] = 'Stockage JSON (MySQL hors ligne)';
        $GLOBALS['db_error'] = $e->getMessage();
        error_log('Erreur MySQL ORSAP: ' . $e->getMessage());
        return null;
    }
}


function initTables(PDO $pdo) {
    try {
        // 1. Submissions table
        $pdo->exec("CREATE TABLE IF NOT EXISTS `submissions` (
            `id` VARCHAR(64) NOT NULL PRIMARY KEY,
            `created_at` DATETIME NOT NULL,
            `client_type` VARCHAR(32) NOT NULL DEFAULT 'professional',
            `name` VARCHAR(255) NOT NULL,
            `company` VARCHAR(255) DEFAULT NULL,
            `email` VARCHAR(255) DEFAULT NULL,
            `phone` VARCHAR(64) NOT NULL,
            `solutions` JSON DEFAULT NULL,
            `sectors` JSON DEFAULT NULL,
            `message` TEXT DEFAULT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        // 2. Applications table
        $pdo->exec("CREATE TABLE IF NOT EXISTS `applications` (
            `id` VARCHAR(64) NOT NULL PRIMARY KEY,
            `created_at` DATETIME NOT NULL,
            `name` VARCHAR(255) NOT NULL,
            `email` VARCHAR(255) NOT NULL,
            `phone` VARCHAR(64) NOT NULL,
            `position` VARCHAR(255) NOT NULL,
            `message` TEXT DEFAULT NULL,
            `cv` LONGTEXT NOT NULL,
            `cv_name` VARCHAR(255) NOT NULL DEFAULT 'cv.pdf'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        // 3. Blogs table
        $pdo->exec("CREATE TABLE IF NOT EXISTS `blogs` (
            `id` VARCHAR(255) NOT NULL PRIMARY KEY,
            `date` DATETIME NOT NULL,
            `title` VARCHAR(500) NOT NULL,
            `summary` TEXT NOT NULL,
            `content` LONGTEXT NOT NULL,
            `image` LONGTEXT DEFAULT NULL,
            `pdf` LONGTEXT DEFAULT NULL,
            `pdf_name` VARCHAR(255) DEFAULT NULL,
            `updated_at` DATETIME DEFAULT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        // 4. Subscribers table
        $pdo->exec("CREATE TABLE IF NOT EXISTS `subscribers` (
            `id` VARCHAR(64) NOT NULL PRIMARY KEY,
            `created_at` DATETIME NOT NULL,
            `email` VARCHAR(255) NOT NULL,
            `name` VARCHAR(255) DEFAULT NULL,
            `company` VARCHAR(255) DEFAULT NULL,
            `phone` VARCHAR(64) DEFAULT NULL,
            `client_type` VARCHAR(32) NOT NULL DEFAULT 'professional'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        // 5. Users table
        $pdo->exec("CREATE TABLE IF NOT EXISTS `users` (
            `id` VARCHAR(64) NOT NULL PRIMARY KEY,
            `created_at` DATETIME NOT NULL,
            `email` VARCHAR(255) NOT NULL UNIQUE,
            `password_hash` VARCHAR(255) NOT NULL,
            `name` VARCHAR(255) NOT NULL,
            `company` VARCHAR(255) DEFAULT NULL,
            `phone` VARCHAR(64) NOT NULL,
            `client_type` VARCHAR(32) NOT NULL DEFAULT 'professional',
            `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
            `verification_token` VARCHAR(255) DEFAULT NULL,
            `verification_code` VARCHAR(10) DEFAULT NULL,
            `verification_expires_at` DATETIME DEFAULT NULL,
            `reset_token` VARCHAR(255) DEFAULT NULL,
            `reset_expires_at` DATETIME DEFAULT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    } catch (Exception $e) {
        error_log('Erreur initTables: ' . $e->getMessage());
    }
}

// ── JSON Helpers ────────────────────────────────────────────────────
function getDataFilePath($filename) {
    $dirs = [
        __DIR__ . '/../data',
        __DIR__ . '/../../data'
    ];
    foreach ($dirs as $d) {
        if (!is_dir($d)) {
            @mkdir($d, 0777, true);
        }
        if (is_dir($d) && is_writable($d)) {
            return $d . '/' . $filename;
        }
    }
    // Fallback to first directory
    $fallbackDir = __DIR__ . '/../data';
    if (!is_dir($fallbackDir)) {
        @mkdir($fallbackDir, 0777, true);
    }
    return $fallbackDir . '/' . $filename;
}

function readJsonFile($filename) {
    $path = getDataFilePath($filename);
    if (file_exists($path)) {
        $content = @file_get_contents($path);
        $data = json_decode($content, true);
        if (is_array($data)) return $data;
    }
    // Check secondary fallback path
    $altPath = __DIR__ . '/../../data/' . $filename;
    if (file_exists($altPath) && $altPath !== $path) {
        $content = @file_get_contents($altPath);
        $data = json_decode($content, true);
        if (is_array($data)) return $data;
    }
    return [];
}

function writeJsonFile($filename, array $data) {
    $path = getDataFilePath($filename);
    $dir = dirname($path);
    if (!is_dir($dir)) {
        @mkdir($dir, 0777, true);
    }

    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        // Never overwrite good data with a failed encode (e.g. memory
        // exhaustion) -- that's exactly what silently wiped blogs.json.
        error_log('writeJsonFile: json_encode failed for ' . $filename . ': ' . json_last_error_msg());
        return false;
    }

    // Write to a temp file and rename() over the target -- rename is atomic
    // on the same filesystem, so readers only ever see the fully-old or
    // fully-new file, never a truncated/partial one. (No flock() here:
    // it hangs indefinitely on this host's filesystem -- confirmed by
    // testing -- so atomic rename is the only safety net, which is
    // sufficient for a single-editor admin panel.)
    $tmpPath = $path . '.tmp.' . getmypid() . '.' . uniqid('', true);
    $written = @file_put_contents($tmpPath, $json);
    $ok = false;
    if ($written !== false && $written === strlen($json)) {
        @chmod($tmpPath, 0666);
        $ok = @rename($tmpPath, $path);
    }
    if (!$ok) {
        error_log('writeJsonFile: failed to write ' . $filename);
        @unlink($tmpPath);
    }

    return $ok;
}

// ── Blog Asset Storage (images/PDFs as real files, not base64-in-JSON) ──
// blogs.json used to embed every image/PDF as a base64 string, so a single
// article could carry tens of MB and every read/write had to move the
// whole file. Assets now live as real files under the web root, served
// directly and instantly by the webserver; blogs.json only stores the
// public URL path.
function getBlogUploadsDir() {
    $dir = __DIR__ . '/../uploads/blogs';
    if (!is_dir($dir)) {
        @mkdir($dir, 0777, true);
    }
    return $dir;
}

function mimeToExtension($mime) {
    $map = [
        'image/jpeg' => 'jpg',
        'image/jpg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
        'image/svg+xml' => 'svg',
        'application/pdf' => 'pdf',
    ];
    return $map[$mime] ?? 'bin';
}

// Accepts either a base64 data: URI (decodes and saves it to disk,
// returning the new public URL path) or an already-saved URL path
// (passed through unchanged, e.g. when editing a post without
// re-uploading its image). Returns null for empty input.
function saveBlogAsset($value, $blogId, $baseName) {
    if (empty($value)) return null;
    if (strpos($value, 'data:') !== 0) return $value; // already a path, or invalid -- leave as-is

    if (!preg_match('#^data:([^;]+);base64,(.+)$#', $value, $m)) return null;
    $binary = base64_decode($m[2]);
    if ($binary === false) return null;

    $dir = getBlogUploadsDir() . '/' . $blogId;
    if (!is_dir($dir)) {
        @mkdir($dir, 0777, true);
    }
    $filename = $baseName . '.' . mimeToExtension($m[1]);
    $path = $dir . '/' . $filename;
    $written = @file_put_contents($path, $binary);
    if ($written === false) return null;
    @chmod($path, 0644);

    return '/uploads/blogs/' . $blogId . '/' . $filename;
}

function deleteBlogAssets($blogId) {
    $dir = getBlogUploadsDir() . '/' . $blogId;
    if (is_dir($dir)) {
        foreach (glob($dir . '/*') ?: [] as $f) {
            @unlink($f);
        }
        @rmdir($dir);
    }
}

// ── Dual Save Operations ────────────────────────────────────────────
function saveSubmissionEntry(array $entry) {
    // 1. Save to JSON
    $subs = readJsonFile('submissions.json');
    array_unshift($subs, $entry);
    writeJsonFile('submissions.json', $subs);

    // 2. Save to MySQL if available
    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("INSERT INTO `submissions` (`id`, `created_at`, `client_type`, `name`, `company`, `email`, `phone`, `solutions`, `sectors`, `message`)
                VALUES (:id, :created_at, :client_type, :name, :company, :email, :phone, :solutions, :sectors, :message)");
            $stmt->execute([
                ':id' => $entry['id'],
                ':created_at' => $entry['createdAt'],
                ':client_type' => $entry['clientType'],
                ':name' => $entry['name'],
                ':company' => $entry['company'] ?? null,
                ':email' => $entry['email'] ?? null,
                ':phone' => $entry['phone'],
                ':solutions' => json_encode($entry['solutions'] ?? []),
                ':sectors' => json_encode($entry['sectors'] ?? []),
                ':message' => $entry['message'] ?? null,
            ]);
        } catch (Exception $e) {
            error_log('Erreur saveSubmissionEntry MySQL: ' . $e->getMessage());
        }
    }
}

function saveApplicationEntry(array $entry) {
    // 1. Save to JSON
    $apps = readJsonFile('applications.json');
    array_unshift($apps, $entry);
    writeJsonFile('applications.json', $apps);

    // 2. Save to MySQL if available
    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("INSERT INTO `applications` (`id`, `created_at`, `name`, `email`, `phone`, `position`, `message`, `cv`, `cv_name`)
                VALUES (:id, :created_at, :name, :email, :phone, :position, :message, :cv, :cv_name)");
            $stmt->execute([
                ':id' => $entry['id'],
                ':created_at' => $entry['createdAt'],
                ':name' => $entry['name'],
                ':email' => $entry['email'],
                ':phone' => $entry['phone'],
                ':position' => $entry['position'],
                ':message' => $entry['message'] ?? null,
                ':cv' => $entry['cv'],
                ':cv_name' => $entry['cvName'] ?? 'cv.pdf',
            ]);
        } catch (Exception $e) {
            error_log('Erreur saveApplicationEntry MySQL: ' . $e->getMessage());
        }
    }
}

function saveSubscriberEntry(array $entry) {
    // 1. Save to JSON
    $subs = readJsonFile('subscribers.json');
    $existingIdx = -1;
    foreach ($subs as $k => $item) {
        if (isset($item['email']) && strtolower($item['email']) === strtolower($entry['email'])) {
            $existingIdx = $k;
            break;
        }
    }
    if ($existingIdx !== -1) {
        $subs[$existingIdx] = array_merge($subs[$existingIdx], $entry);
    } else {
        array_unshift($subs, $entry);
    }
    writeJsonFile('subscribers.json', $subs);

    // 2. Save to MySQL if available
    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("INSERT INTO `subscribers` (`id`, `created_at`, `email`, `name`, `company`, `phone`, `client_type`)
                VALUES (:id, :created_at, :email, :name, :company, :phone, :client_type)");
            $stmt->execute([
                ':id' => $entry['id'],
                ':created_at' => $entry['createdAt'],
                ':email' => $entry['email'],
                ':name' => $entry['name'] ?? null,
                ':company' => $entry['company'] ?? null,
                ':phone' => $entry['phone'] ?? null,
                ':client_type' => $entry['clientType'] ?? 'professional',
            ]);
        } catch (Exception $e) {
            error_log('Erreur saveSubscriberEntry MySQL: ' . $e->getMessage());
        }
    }
}

// ── Users Database Operations ───────────────────────────────────────
function loadUsersList() {
    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT * FROM `users` ORDER BY `created_at` DESC");
            $rows = $stmt->fetchAll();
            if (!empty($rows)) {
                return array_map(function($r) {
                    return [
                        'id' => $r['id'],
                        'createdAt' => $r['created_at'],
                        'email' => $r['email'],
                        'passwordHash' => $r['password_hash'],
                        'name' => $r['name'],
                        'company' => $r['company'],
                        'phone' => $r['phone'],
                        'clientType' => $r['client_type'],
                        'isVerified' => (bool)$r['is_verified'],
                        'verificationToken' => $r['verification_token'],
                        'verificationCode' => $r['verification_code'],
                        'verificationExpiresAt' => $r['verification_expires_at'],
                        'resetToken' => $r['reset_token'],
                        'resetExpiresAt' => $r['reset_expires_at'],
                    ];
                }, $rows);
            }
        } catch (Exception $e) {}
    }
    return readJsonFile('users.json');
}

function findUserByEmailPHP($email) {
    if (empty($email)) return null;
    $clean = strtolower(trim($email));
    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM `users` WHERE LOWER(`email`) = :email LIMIT 1");
            $stmt->execute([':email' => $clean]);
            $r = $stmt->fetch();
            if ($r) {
                return [
                    'id' => $r['id'],
                    'createdAt' => $r['created_at'],
                    'email' => $r['email'],
                    'passwordHash' => $r['password_hash'],
                    'name' => $r['name'],
                    'company' => $r['company'],
                    'phone' => $r['phone'],
                    'clientType' => $r['client_type'],
                    'isVerified' => (bool)$r['is_verified'],
                    'verificationToken' => $r['verification_token'],
                    'verificationCode' => $r['verification_code'],
                    'verificationExpiresAt' => $r['verification_expires_at'],
                    'resetToken' => $r['reset_token'],
                    'resetExpiresAt' => $r['reset_expires_at'],
                ];
            }
        } catch (Exception $e) {}
    }
    $users = readJsonFile('users.json');
    foreach ($users as $u) {
        if (strtolower($u['email'] ?? '') === $clean) return $u;
    }
    return null;
}

function findUserByIdPHP($id) {
    if (empty($id)) return null;
    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM `users` WHERE `id` = :id LIMIT 1");
            $stmt->execute([':id' => $id]);
            $r = $stmt->fetch();
            if ($r) {
                return [
                    'id' => $r['id'],
                    'createdAt' => $r['created_at'],
                    'email' => $r['email'],
                    'passwordHash' => $r['password_hash'],
                    'name' => $r['name'],
                    'company' => $r['company'],
                    'phone' => $r['phone'],
                    'clientType' => $r['client_type'],
                    'isVerified' => (bool)$r['is_verified'],
                    'verificationToken' => $r['verification_token'],
                    'verificationCode' => $r['verification_code'],
                    'verificationExpiresAt' => $r['verification_expires_at'],
                    'resetToken' => $r['reset_token'],
                    'resetExpiresAt' => $r['reset_expires_at'],
                ];
            }
        } catch (Exception $e) {}
    }
    $users = readJsonFile('users.json');
    foreach ($users as $u) {
        if (($u['id'] ?? '') === $id) return $u;
    }
    return null;
}

function findUserByTokenPHP($token) {
    if (empty($token)) return null;
    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM `users` WHERE `verification_token` = :tok OR `reset_token` = :tok LIMIT 1");
            $stmt->execute([':tok' => $token]);
            $r = $stmt->fetch();
            if ($r) {
                return [
                    'id' => $r['id'],
                    'createdAt' => $r['created_at'],
                    'email' => $r['email'],
                    'passwordHash' => $r['password_hash'],
                    'name' => $r['name'],
                    'company' => $r['company'],
                    'phone' => $r['phone'],
                    'clientType' => $r['client_type'],
                    'isVerified' => (bool)$r['is_verified'],
                    'verificationToken' => $r['verification_token'],
                    'verificationCode' => $r['verification_code'],
                    'verificationExpiresAt' => $r['verification_expires_at'],
                    'resetToken' => $r['reset_token'],
                    'resetExpiresAt' => $r['reset_expires_at'],
                ];
            }
        } catch (Exception $e) {}
    }
    $users = readJsonFile('users.json');
    foreach ($users as $u) {
        if (($u['verificationToken'] ?? '') === $token || ($u['resetToken'] ?? '') === $token) return $u;
    }
    return null;
}

function saveUserEntry(array $user) {
    // 1. Save to JSON
    $users = readJsonFile('users.json');
    $existingIdx = -1;
    foreach ($users as $k => $u) {
        if (($u['id'] ?? '') === $user['id'] || strtolower($u['email'] ?? '') === strtolower($user['email'])) {
            $existingIdx = $k;
            break;
        }
    }
    if ($existingIdx !== -1) {
        $users[$existingIdx] = array_merge($users[$existingIdx], $user);
    } else {
        array_unshift($users, $user);
    }
    writeJsonFile('users.json', $users);

    // 2. Save to MySQL if available
    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("INSERT INTO `users` (
                `id`, `created_at`, `email`, `password_hash`, `name`, `company`, `phone`,
                `client_type`, `is_verified`, `verification_token`, `verification_code`, `verification_expires_at`
            ) VALUES (
                :id, :created_at, :email, :password_hash, :name, :company, :phone,
                :client_type, :is_verified, :verification_token, :verification_code, :verification_expires_at
            )");
            $stmt->execute([
                ':id' => $user['id'],
                ':created_at' => $user['createdAt'],
                ':email' => strtolower($user['email']),
                ':password_hash' => $user['passwordHash'],
                ':name' => $user['name'],
                ':company' => $user['company'] ?? null,
                ':phone' => $user['phone'],
                ':client_type' => $user['clientType'] ?? 'professional',
                ':is_verified' => !empty($user['isVerified']) ? 1 : 0,
                ':verification_token' => $user['verificationToken'] ?? null,
                ':verification_code' => $user['verificationCode'] ?? null,
                ':verification_expires_at' => $user['verificationExpiresAt'] ?? null,
            ]);
        } catch (Exception $e) {
            error_log('Erreur saveUserEntry MySQL: ' . $e->getMessage());
        }
    }
}

function updateUserEntry(array $user) {
    // 1. Update JSON
    $users = readJsonFile('users.json');
    foreach ($users as $k => $u) {
        if (($u['id'] ?? '') === $user['id']) {
            $users[$k] = array_merge($users[$k], $user);
            break;
        }
    }
    writeJsonFile('users.json', $users);

    // 2. Update MySQL
    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("UPDATE `users` SET
                `email` = :email,
                `password_hash` = :password_hash,
                `name` = :name,
                `company` = :company,
                `phone` = :phone,
                `client_type` = :client_type,
                `is_verified` = :is_verified,
                `verification_token` = :verification_token,
                `verification_code` = :verification_code,
                `verification_expires_at` = :verification_expires_at,
                `reset_token` = :reset_token,
                `reset_expires_at` = :reset_expires_at
                WHERE `id` = :id");
            $stmt->execute([
                ':id' => $user['id'],
                ':email' => strtolower($user['email']),
                ':password_hash' => $user['passwordHash'],
                ':name' => $user['name'],
                ':company' => $user['company'] ?? null,
                ':phone' => $user['phone'],
                ':client_type' => $user['clientType'] ?? 'professional',
                ':is_verified' => !empty($user['isVerified']) ? 1 : 0,
                ':verification_token' => $user['verificationToken'] ?? null,
                ':verification_code' => $user['verificationCode'] ?? null,
                ':verification_expires_at' => $user['verificationExpiresAt'] ?? null,
                ':reset_token' => $user['resetToken'] ?? null,
                ':reset_expires_at' => $user['resetExpiresAt'] ?? null,
            ]);
        } catch (Exception $e) {
            error_log('Erreur updateUserEntry MySQL: ' . $e->getMessage());
        }
    }
}

function deleteUserEntry($id) {
    $users = readJsonFile('users.json');
    $filtered = array_values(array_filter($users, function($u) use ($id) {
        return ($u['id'] ?? '') !== $id;
    }));
    writeJsonFile('users.json', $filtered);

    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("DELETE FROM `users` WHERE `id` = :id");
            $stmt->execute([':id' => $id]);
        } catch (Exception $e) {}
    }
    return true;
}

