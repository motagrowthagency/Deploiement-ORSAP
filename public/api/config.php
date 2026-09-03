<?php
/**
 * ORSAP - Configuration de la base de données MySQL et Notifications Heberjahiz
 */

// 1. Support config.local.php override if present on Heberjahiz
if (file_exists(__DIR__ . '/config.local.php')) {
    $localConfig = require __DIR__ . '/config.local.php';
    if (is_array($localConfig)) {
        return $localConfig;
    }
}

// 2. Simple .env parser helper
$envFile = null;
$possibleEnvs = [
    __DIR__ . '/../../.env',
    __DIR__ . '/../.env',
    __DIR__ . '/.env'
];
foreach ($possibleEnvs as $envPath) {
    if (file_exists($envPath)) {
        $envFile = $envPath;
        break;
    }
}

if ($envFile) {
    $lines = @file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines) {
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0 || strpos($line, '=') === false) continue;
            list($key, $val) = explode('=', $line, 2);
            $key = trim($key);
            $val = trim($val, " \t\n\r\0\x0B\"'");
            if (!empty($key) && getenv($key) === false) {
                putenv("$key=$val");
                $_ENV[$key] = $val;
            }
        }
    }
}

return [
    'db_host' => getenv('DB_HOST') ?: 'localhost',
    'db_port' => getenv('DB_PORT') ?: '3306',
    'db_name' => getenv('DB_NAME') ?: 'orsap_site',
    'db_user' => getenv('DB_USER') ?: 'orsap_admin',
    'db_pass' => getenv('DB_PASSWORD') ?: 'OrsapMysql2025!#',
    'admin_password' => getenv('ADMIN_PASSWORD') ?: 'MotaFouad223',
    'notification_email' => getenv('NOTIFICATION_EMAIL') ?: 'orsap@orsap.ma',
    'from_email' => 'no-reply@orsap.ma',
    'github_token' => getenv('GITHUB_TOKEN') ?: '',
    'github_repo' => getenv('GITHUB_REPO') ?: 'motagrowthagency/Deploiement-ORSAP',
    'github_branch' => getenv('GITHUB_BRANCH') ?: 'main',
    'github_path' => 'data/blogs.json',
];


