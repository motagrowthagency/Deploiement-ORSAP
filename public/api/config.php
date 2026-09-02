<?php
/**
 * ORSAP - Configuration de la base de données MySQL et Notifications Heberjahiz
 */

return [
    'db_host' => getenv('DB_HOST') ?: 'localhost',
    'db_port' => getenv('DB_PORT') ?: '3306',
    'db_name' => getenv('DB_NAME') ?: 'orsap_site',
    'db_user' => getenv('DB_USER') ?: 'orsap_admin',
    'db_pass' => getenv('DB_PASSWORD') ?: 'OrsapMysql2025!#',
    'admin_password' => getenv('ADMIN_PASSWORD') ?: 'MotaFouad223',
    'notification_email' => getenv('NOTIFICATION_EMAIL') ?: 'orsap@orsap.ma',
    'from_email' => 'no-reply@orsap.ma',
];
