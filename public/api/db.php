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

        // 6. Article catalogue
        $pdo->exec("CREATE TABLE IF NOT EXISTS `articles` (
            `code` VARCHAR(32) NOT NULL PRIMARY KEY,
            `designation` VARCHAR(500) NOT NULL,
            `tva` TINYINT NOT NULL DEFAULT 20,
            `price_ttc` DECIMAL(12,2) NOT NULL DEFAULT 0,
            `rayon` VARCHAR(120) NOT NULL DEFAULT '',
            `famille` VARCHAR(120) NOT NULL DEFAULT '',
            KEY `idx_rayon` (`rayon`),
            KEY `idx_famille` (`famille`),
            KEY `idx_designation` (`designation`(191))
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        // 7. Itemized devis requests built from the article catalogue
        $pdo->exec("CREATE TABLE IF NOT EXISTS `devis_requests` (
            `id` VARCHAR(64) NOT NULL PRIMARY KEY,
            `created_at` DATETIME NOT NULL,
            `user_id` VARCHAR(64) NOT NULL,
            `name` VARCHAR(255) NOT NULL,
            `company` VARCHAR(255) DEFAULT NULL,
            `email` VARCHAR(255) NOT NULL,
            `phone` VARCHAR(64) NOT NULL,
            `note` TEXT DEFAULT NULL,
            `status` VARCHAR(32) NOT NULL DEFAULT 'pending',
            KEY `idx_user_id` (`user_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        $pdo->exec("CREATE TABLE IF NOT EXISTS `devis_items` (
            `id` VARCHAR(64) NOT NULL PRIMARY KEY,
            `devis_id` VARCHAR(64) NOT NULL,
            `article_code` VARCHAR(32) NOT NULL,
            `designation` VARCHAR(500) NOT NULL,
            `quantity` INT NOT NULL DEFAULT 1,
            `price_ttc` DECIMAL(12,2) NOT NULL DEFAULT 0,
            KEY `idx_devis_id` (`devis_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        // One-time seed of the article catalogue from the bundled JSON export
        $countStmt = $pdo->query("SELECT COUNT(*) AS cnt FROM `articles`");
        $countRow = $countStmt->fetch();
        if ((int)($countRow['cnt'] ?? 0) === 0) {
            $seed = readJsonFile('articles.json');
            if (!empty($seed)) {
                @set_time_limit(300);
                bulkUpsertArticles($pdo, $seed);
            }
        }
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

// ── Article Catalogue (Espace Client search & devis builder) ────────

function cleanArticleRow($r) {
    $code = trim((string)($r['code'] ?? ''));
    $designation = trim((string)($r['designation'] ?? ''));
    if ($code === '' || $designation === '') return null;
    return [
        'code' => $code,
        'designation' => $designation,
        'tva' => is_numeric($r['tva'] ?? null) ? (int)$r['tva'] : 20,
        'priceTtc' => is_numeric($r['priceTtc'] ?? null) ? (float)$r['priceTtc'] : 0,
        'rayon' => trim((string)($r['rayon'] ?? '')),
        'famille' => trim((string)($r['famille'] ?? '')),
    ];
}

/** Batched upsert straight into MySQL -- used for the initial catalogue seed. */
function bulkUpsertArticles(PDO $pdo, array $rows) {
    $clean = array_values(array_filter(array_map('cleanArticleRow', $rows)));
    if (empty($clean)) return 0;

    $chunkSize = 500;
    $total = count($clean);
    for ($i = 0; $i < $total; $i += $chunkSize) {
        $chunk = array_slice($clean, $i, $chunkSize);
        $placeholders = implode(', ', array_fill(0, count($chunk), '(?, ?, ?, ?, ?, ?)'));
        $params = [];
        foreach ($chunk as $row) {
            $params[] = $row['code'];
            $params[] = $row['designation'];
            $params[] = $row['tva'];
            $params[] = $row['priceTtc'];
            $params[] = $row['rayon'];
            $params[] = $row['famille'];
        }
        $sql = "INSERT INTO `articles` (`code`, `designation`, `tva`, `price_ttc`, `rayon`, `famille`)
            VALUES $placeholders
            ON DUPLICATE KEY UPDATE
                `designation` = VALUES(`designation`),
                `tva` = VALUES(`tva`),
                `price_ttc` = VALUES(`price_ttc`),
                `rayon` = VALUES(`rayon`),
                `famille` = VALUES(`famille`)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    }
    return $total;
}

/**
 * Bulk import/refresh articles -- used by the admin "add article" form,
 * price edits, and future CSV re-imports. Upserts by code in both MySQL
 * and the local JSON mirror.
 */
function importArticlesPHP(array $rows) {
    $clean = array_values(array_filter(array_map('cleanArticleRow', $rows)));
    if (empty($clean)) return ['imported' => 0, 'total' => countArticlesPHP()];

    $pdo = getDbConnection();
    if ($pdo) {
        try {
            @set_time_limit(300);
            bulkUpsertArticles($pdo, $clean);
        } catch (Exception $e) {
            error_log('Erreur importArticlesPHP MySQL: ' . $e->getMessage());
        }
    }

    $existing = readJsonFile('articles.json');
    $byCode = [];
    foreach ($existing as $a) {
        if (!empty($a['code'])) $byCode[$a['code']] = $a;
    }
    foreach ($clean as $a) {
        $byCode[$a['code']] = $a;
    }
    $merged = array_values($byCode);
    writeJsonFile('articles.json', $merged);

    return ['imported' => count($clean), 'total' => count($merged)];
}

/**
 * Keyword + category search across the article catalogue, paginated.
 * Every word in $q must appear somewhere in the code or designation.
 */
function searchArticlesPHP($q, $rayon, $famille, $page, $pageSize) {
    $page = max(1, (int)$page);
    $pageSize = min(60, max(1, (int)$pageSize ?: 24));
    $offset = ($page - 1) * $pageSize;
    $terms = array_slice(array_values(array_filter(preg_split('/\s+/', trim((string)$q)))), 0, 8);

    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $where = [];
            $params = [];
            $i = 0;
            foreach ($terms as $t) {
                $i++;
                $where[] = "(`designation` LIKE :d{$i} OR `code` LIKE :c{$i})";
                $params[":d{$i}"] = "%{$t}%";
                $params[":c{$i}"] = "%{$t}%";
            }
            if (!empty($rayon)) {
                $where[] = "`rayon` = :rayon";
                $params[':rayon'] = $rayon;
            }
            if (!empty($famille)) {
                $where[] = "`famille` = :famille";
                $params[':famille'] = $famille;
            }
            $whereSql = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

            $countStmt = $pdo->prepare("SELECT COUNT(*) AS cnt FROM `articles` {$whereSql}");
            $countStmt->execute($params);
            $total = (int)$countStmt->fetch()['cnt'];

            $stmt = $pdo->prepare("SELECT `code`, `designation`, `tva`, `price_ttc`, `rayon`, `famille`
                FROM `articles` {$whereSql} ORDER BY `designation` ASC LIMIT :limit OFFSET :offset");
            foreach ($params as $k => $v) $stmt->bindValue($k, $v);
            $stmt->bindValue(':limit', $pageSize, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $rows = $stmt->fetchAll();

            return [
                'items' => array_map(function($r) {
                    return [
                        'code' => $r['code'],
                        'designation' => $r['designation'],
                        'tva' => (int)$r['tva'],
                        'priceTtc' => (float)$r['price_ttc'],
                        'rayon' => $r['rayon'],
                        'famille' => $r['famille'],
                    ];
                }, $rows),
                'total' => $total,
                'page' => $page,
                'pageSize' => $pageSize,
            ];
        } catch (Exception $e) {
            error_log('Erreur searchArticlesPHP MySQL: ' . $e->getMessage());
        }
    }

    $all = readJsonFile('articles.json');
    $lowerTerms = array_map('mb_strtolower', $terms);
    $filtered = $all;
    if (!empty($lowerTerms)) {
        $filtered = array_values(array_filter($filtered, function($a) use ($lowerTerms) {
            $hay = mb_strtolower(($a['code'] ?? '') . ' ' . ($a['designation'] ?? ''));
            foreach ($lowerTerms as $t) {
                if (mb_strpos($hay, $t) === false) return false;
            }
            return true;
        }));
    }
    if (!empty($rayon)) {
        $filtered = array_values(array_filter($filtered, function($a) use ($rayon) { return ($a['rayon'] ?? '') === $rayon; }));
    }
    if (!empty($famille)) {
        $filtered = array_values(array_filter($filtered, function($a) use ($famille) { return ($a['famille'] ?? '') === $famille; }));
    }
    return [
        'items' => array_slice($filtered, $offset, $pageSize),
        'total' => count($filtered),
        'page' => $page,
        'pageSize' => $pageSize,
    ];
}

function findArticleByCodePHP($code) {
    if (empty($code)) return null;
    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM `articles` WHERE `code` = :code LIMIT 1");
            $stmt->execute([':code' => $code]);
            $r = $stmt->fetch();
            if ($r) {
                return [
                    'code' => $r['code'],
                    'designation' => $r['designation'],
                    'tva' => (int)$r['tva'],
                    'priceTtc' => (float)$r['price_ttc'],
                    'rayon' => $r['rayon'],
                    'famille' => $r['famille'],
                ];
            }
            return null;
        } catch (Exception $e) {
            error_log('Erreur findArticleByCodePHP MySQL: ' . $e->getMessage());
        }
    }
    $all = readJsonFile('articles.json');
    foreach ($all as $a) {
        if (($a['code'] ?? '') === $code) return $a;
    }
    return null;
}

function countArticlesPHP() {
    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) AS cnt FROM `articles`");
            return (int)$stmt->fetch()['cnt'];
        } catch (Exception $e) {
            error_log('Erreur countArticlesPHP MySQL: ' . $e->getMessage());
        }
    }
    return count(readJsonFile('articles.json'));
}

function deleteArticlePHP($code) {
    $pdo = getDbConnection();
    $deleted = false;
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("DELETE FROM `articles` WHERE `code` = :code");
            $stmt->execute([':code' => $code]);
            $deleted = $stmt->rowCount() > 0;
        } catch (Exception $e) {
            error_log('Erreur deleteArticlePHP MySQL: ' . $e->getMessage());
        }
    }
    $existing = readJsonFile('articles.json');
    $filtered = array_values(array_filter($existing, function($a) use ($code) { return ($a['code'] ?? '') !== $code; }));
    $jsonDeleted = count($filtered) < count($existing);
    writeJsonFile('articles.json', $filtered);
    return $deleted || $jsonDeleted;
}

/** Category / sub-category counts used to populate search filters. */
function getArticleFacetsPHP() {
    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT `rayon`, `famille`, COUNT(*) AS cnt FROM `articles` GROUP BY `rayon`, `famille`");
            $rows = $stmt->fetchAll();
            $rayonMap = [];
            $familles = [];
            foreach ($rows as $r) {
                $rayonMap[$r['rayon']] = ($rayonMap[$r['rayon']] ?? 0) + (int)$r['cnt'];
                $familles[] = ['name' => $r['famille'], 'rayon' => $r['rayon'], 'count' => (int)$r['cnt']];
            }
            $rayons = [];
            foreach ($rayonMap as $name => $count) $rayons[] = ['name' => $name, 'count' => $count];
            usort($rayons, function($a, $b) { return $b['count'] <=> $a['count']; });
            usort($familles, function($a, $b) { return $b['count'] <=> $a['count']; });
            return ['rayons' => $rayons, 'familles' => $familles];
        } catch (Exception $e) {
            error_log('Erreur getArticleFacetsPHP MySQL: ' . $e->getMessage());
        }
    }

    $all = readJsonFile('articles.json');
    $rayonMap = [];
    $familleMap = [];
    foreach ($all as $a) {
        $r = $a['rayon'] ?? '';
        $f = $a['famille'] ?? '';
        $rayonMap[$r] = ($rayonMap[$r] ?? 0) + 1;
        $key = $r . '|' . $f;
        $familleMap[$key] = ($familleMap[$key] ?? 0) + 1;
    }
    $rayons = [];
    foreach ($rayonMap as $name => $count) $rayons[] = ['name' => $name, 'count' => $count];
    usort($rayons, function($a, $b) { return $b['count'] <=> $a['count']; });
    $familles = [];
    foreach ($familleMap as $key => $count) {
        $parts = explode('|', $key, 2);
        $familles[] = ['name' => $parts[1] ?? '', 'rayon' => $parts[0] ?? '', 'count' => $count];
    }
    usort($familles, function($a, $b) { return $b['count'] <=> $a['count']; });
    return ['rayons' => $rayons, 'familles' => $familles];
}

// ── Itemized Devis Requests (built from the article catalogue) ──────

function mapDevisRequestRowPHP($r) {
    return [
        'id' => $r['id'],
        'createdAt' => $r['created_at'] ?? ($r['createdAt'] ?? date('Y-m-d H:i:s')),
        'userId' => $r['user_id'] ?? ($r['userId'] ?? ''),
        'name' => $r['name'],
        'company' => $r['company'] ?? null,
        'email' => $r['email'],
        'phone' => $r['phone'],
        'note' => $r['note'] ?? null,
        'status' => $r['status'] ?? 'pending',
    ];
}

function attachDevisItemsPHP(array $requests) {
    if (empty($requests)) return $requests;
    $ids = array_map(function($r) { return $r['id']; }, $requests);

    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $stmt = $pdo->prepare("SELECT * FROM `devis_items` WHERE `devis_id` IN ({$placeholders})");
            $stmt->execute($ids);
            $rows = $stmt->fetchAll();
            $itemsByDevis = [];
            foreach ($rows as $r) {
                $itemsByDevis[$r['devis_id']][] = [
                    'id' => $r['id'],
                    'articleCode' => $r['article_code'],
                    'designation' => $r['designation'],
                    'quantity' => (int)$r['quantity'],
                    'priceTtc' => (float)$r['price_ttc'],
                ];
            }
            return array_map(function($r) use ($itemsByDevis) {
                $r['items'] = $itemsByDevis[$r['id']] ?? [];
                return $r;
            }, $requests);
        } catch (Exception $e) {
            error_log('Erreur attachDevisItemsPHP MySQL: ' . $e->getMessage());
        }
    }

    $allItems = readJsonFile('devis_items.json');
    $itemsByDevis = [];
    foreach ($allItems as $it) {
        $itemsByDevis[$it['devisId'] ?? ''][] = $it;
    }
    return array_map(function($r) use ($itemsByDevis) {
        $r['items'] = $itemsByDevis[$r['id']] ?? [];
        return $r;
    }, $requests);
}

/** Create an itemized devis request + its line items (MySQL + JSON mirror). */
function createDevisRequestPHP(array $entry, array $items) {
    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("INSERT INTO `devis_requests` (`id`, `created_at`, `user_id`, `name`, `company`, `email`, `phone`, `note`, `status`)
                VALUES (:id, :created_at, :user_id, :name, :company, :email, :phone, :note, :status)");
            $stmt->execute([
                ':id' => $entry['id'],
                ':created_at' => $entry['createdAt'],
                ':user_id' => $entry['userId'],
                ':name' => $entry['name'],
                ':company' => $entry['company'] ?? null,
                ':email' => $entry['email'],
                ':phone' => $entry['phone'],
                ':note' => $entry['note'] ?? null,
                ':status' => $entry['status'] ?? 'pending',
            ]);
            $itemStmt = $pdo->prepare("INSERT INTO `devis_items` (`id`, `devis_id`, `article_code`, `designation`, `quantity`, `price_ttc`)
                VALUES (:id, :devis_id, :article_code, :designation, :quantity, :price_ttc)");
            foreach ($items as $it) {
                $itemStmt->execute([
                    ':id' => $it['id'],
                    ':devis_id' => $entry['id'],
                    ':article_code' => $it['articleCode'],
                    ':designation' => $it['designation'],
                    ':quantity' => $it['quantity'],
                    ':price_ttc' => $it['priceTtc'],
                ]);
            }
        } catch (Exception $e) {
            error_log('Erreur createDevisRequestPHP MySQL: ' . $e->getMessage());
        }
    }

    $reqs = readJsonFile('devis_requests.json');
    array_unshift($reqs, $entry);
    writeJsonFile('devis_requests.json', $reqs);

    $allItems = readJsonFile('devis_items.json');
    foreach ($items as $it) {
        $it['devisId'] = $entry['id'];
        $allItems[] = $it;
    }
    writeJsonFile('devis_items.json', $allItems);
}

function loadDevisRequestsForUserPHP($userId) {
    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM `devis_requests` WHERE `user_id` = :uid ORDER BY `created_at` DESC");
            $stmt->execute([':uid' => $userId]);
            $rows = array_map('mapDevisRequestRowPHP', $stmt->fetchAll());
            return attachDevisItemsPHP($rows);
        } catch (Exception $e) {
            error_log('Erreur loadDevisRequestsForUserPHP MySQL: ' . $e->getMessage());
        }
    }
    $reqs = readJsonFile('devis_requests.json');
    $filtered = array_values(array_filter($reqs, function($r) use ($userId) { return ($r['userId'] ?? '') === $userId; }));
    return attachDevisItemsPHP($filtered);
}

function loadAllDevisRequestsPHP() {
    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT * FROM `devis_requests` ORDER BY `created_at` DESC");
            $rows = array_map('mapDevisRequestRowPHP', $stmt->fetchAll());
            return attachDevisItemsPHP($rows);
        } catch (Exception $e) {
            error_log('Erreur loadAllDevisRequestsPHP MySQL: ' . $e->getMessage());
        }
    }
    return attachDevisItemsPHP(readJsonFile('devis_requests.json'));
}

function deleteDevisRequestPHP($id) {
    $pdo = getDbConnection();
    $deleted = false;
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("DELETE FROM `devis_requests` WHERE `id` = :id");
            $stmt->execute([':id' => $id]);
            $deleted = $stmt->rowCount() > 0;
            $pdo->prepare("DELETE FROM `devis_items` WHERE `devis_id` = :id")->execute([':id' => $id]);
        } catch (Exception $e) {
            error_log('Erreur deleteDevisRequestPHP MySQL: ' . $e->getMessage());
        }
    }
    $reqs = readJsonFile('devis_requests.json');
    $filteredReqs = array_values(array_filter($reqs, function($r) use ($id) { return ($r['id'] ?? '') !== $id; }));
    $jsonDeleted = count($filteredReqs) < count($reqs);
    writeJsonFile('devis_requests.json', $filteredReqs);
    $items = readJsonFile('devis_items.json');
    $items = array_values(array_filter($items, function($it) use ($id) { return ($it['devisId'] ?? '') !== $id; }));
    writeJsonFile('devis_items.json', $items);
    return $deleted || $jsonDeleted;
}

