<?php
/**
 * ORSAP - Couche de données PDO MySQL & JSON Redondant
 */

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
    @file_put_contents($path, $json);
    @chmod($path, 0666);
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
