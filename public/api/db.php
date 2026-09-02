<?php
/**
 * ORSAP - Couche de données PDO MySQL
 */

function getDbConnection() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
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
        ]);

        initTables($pdo);
        return $pdo;
    } catch (PDOException $e) {
        error_log('Erreur connexion MySQL ORSAP: ' . $e->getMessage());
        return null;
    }
}

function initTables(PDO $pdo) {
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

    // Check if blogs table is empty, auto-seed from JSON if available
    $stmt = $pdo->query("SELECT COUNT(*) AS cnt FROM `blogs`");
    $count = (int) $stmt->fetchColumn();
    if ($count === 0) {
        $jsonPaths = [
            __DIR__ . '/../../data/blogs.json',
            __DIR__ . '/../../data/blogs.backup.json',
            __DIR__ . '/../data/blogs.json'
        ];
        foreach ($jsonPaths as $p) {
            if (file_exists($p)) {
                $raw = file_get_contents($p);
                $blogs = json_decode($raw, true);
                if (is_array($blogs) && count($blogs) > 0) {
                    $insert = $pdo->prepare("INSERT INTO `blogs` (`id`, `date`, `title`, `summary`, `content`, `image`, `pdf`, `pdf_name`, `updated_at`)
                        VALUES (:id, :date, :title, :summary, :content, :image, :pdf, :pdf_name, :updated_at)
                        ON DUPLICATE KEY UPDATE `title` = VALUES(`title`)");
                    foreach ($blogs as $b) {
                        $insert->execute([
                            ':id' => $b['id'] ?? uniqid('blog_'),
                            ':date' => isset($b['date']) ? date('Y-m-d H:i:s', strtotime($b['date'])) : date('Y-m-d H:i:s'),
                            ':title' => $b['title'] ?? '',
                            ':summary' => $b['summary'] ?? '',
                            ':content' => $b['content'] ?? '',
                            ':image' => $b['image'] ?? null,
                            ':pdf' => $b['pdf'] ?? null,
                            ':pdf_name' => $b['pdfName'] ?? null,
                            ':updated_at' => isset($b['updatedAt']) ? date('Y-m-d H:i:s', strtotime($b['updatedAt'])) : null,
                        ]);
                    }
                    break;
                }
            }
        }
    }
}
