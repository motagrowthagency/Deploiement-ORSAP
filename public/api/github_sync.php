<?php
/**
 * ORSAP - Synchronisation Automatique GitHub pour les Articles de Blog
 */

function getGitHubToken() {
    $config = require __DIR__ . '/config.php';
    if (!empty($config['github_token'])) {
        return trim($config['github_token']);
    }
    $tokenPaths = [
        __DIR__ . '/../data/github_token.key',
        __DIR__ . '/../../data/github_token.key',
    ];
    foreach ($tokenPaths as $p) {
        if (file_exists($p)) {
            $t = trim(@file_get_contents($p));
            if (!empty($t)) return $t;
        }
    }
    return '';
}

function saveGitHubToken($token) {
    $dirs = [
        __DIR__ . '/../data',
        __DIR__ . '/../../data'
    ];
    foreach ($dirs as $d) {
        if (!is_dir($d)) {
            @mkdir($d, 0777, true);
        }
        $keyPath = $d . '/github_token.key';
        @file_put_contents($keyPath, trim($token));
        @chmod($keyPath, 0600);
    }
    return true;
}

function syncBlogsToGitHub(array $blogs = null) {
    $token = getGitHubToken();
    $config = require __DIR__ . '/config.php';
    $repo = $config['github_repo'] ?? 'motagrowthagency/Deploiement-ORSAP';
    $branch = $config['github_branch'] ?? 'main';
    $path = $config['github_path'] ?? 'data/blogs.json';

    if (empty($token)) {
        return [
            'success' => false,
            'configured' => false,
            'error' => 'Token GitHub non configuré. Ajoutez un GitHub Personal Access Token dans les paramètres ou dans .env (GITHUB_TOKEN=...).'
        ];
    }

    if ($blogs === null) {
        $blogs = readJsonFile('blogs.json');
        $pdo = getDbConnection();
        if ($pdo) {
            try {
                $stmt = $pdo->query("SELECT * FROM `blogs` ORDER BY `date` DESC");
                $rows = $stmt->fetchAll();
                if (!empty($rows)) {
                    $blogs = array_map(function($r) {
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
                }
            } catch (Exception $e) {}
        }
    }

    $jsonContent = json_encode($blogs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $base64Content = base64_encode($jsonContent);

    // 1. Check existing file SHA on GitHub
    $sha = null;
    $getUrl = "https://api.github.com/repos/{$repo}/contents/{$path}?ref={$branch}";
    
    $ch = curl_init($getUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERAGENT => 'ORSAP-Blog-Sync',
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $token,
            'Accept: application/vnd.github+json',
            'X-GitHub-Api-Version: 2022-11-28'
        ],
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_TIMEOUT => 15
    ]);
    $getResponse = curl_exec($ch);
    $getHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($getHttpCode === 200) {
        $data = json_decode($getResponse, true);
        if (!empty($data['sha'])) {
            $sha = $data['sha'];
        }
    }

    // 2. Commit file to GitHub repository
    $putUrl = "https://api.github.com/repos/{$repo}/contents/{$path}";
    $payload = [
        'message' => '🔄 Auto-Sync: Update blogs.json from ORSAP Admin (' . date('Y-m-d H:i:s') . ')',
        'content' => $base64Content,
        'branch' => $branch
    ];
    if ($sha) {
        $payload['sha'] = $sha;
    }

    $ch = curl_init($putUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => 'PUT',
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_USERAGENT => 'ORSAP-Blog-Sync',
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $token,
            'Accept: application/vnd.github+json',
            'Content-Type: application/json',
            'X-GitHub-Api-Version: 2022-11-28'
        ],
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_TIMEOUT => 20
    ]);
    $putResponse = curl_exec($ch);
    $putHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($putHttpCode === 200 || $putHttpCode === 201) {
        return [
            'success' => true,
            'configured' => true,
            'repo' => $repo,
            'branch' => $branch,
            'count' => count($blogs),
            'message' => 'Synchronisation réussie avec GitHub (' . $repo . ' @ ' . $branch . ')'
        ];
    } else {
        $respData = json_decode($putResponse, true);
        $errMsg = $respData['message'] ?? ("Erreur HTTP " . $putHttpCode);
        return [
            'success' => false,
            'configured' => true,
            'httpCode' => $putHttpCode,
            'error' => 'Échec de synchronisation GitHub : ' . $errMsg
        ];
    }
}
