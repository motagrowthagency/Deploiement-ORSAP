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
        __DIR__ . '/data/github_token.key',
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
        __DIR__ . '/../../data',
        __DIR__ . '/data'
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

function httpGitHubRequest($url, $method = 'GET', $token = '', $payload = null) {
    $headers = [
        'User-Agent: ORSAP-Blog-Sync',
        'Authorization: Bearer ' . $token,
        'Accept: application/vnd.github+json',
        'X-GitHub-Api-Version: 2022-11-28'
    ];
    if ($payload !== null) {
        $headers[] = 'Content-Type: application/json';
    }

    $curlErr = null;

    // 1. Try cURL first if extension is available
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        $options = [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 25,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => 0,
            CURLOPT_FOLLOWLOCATION => true,
        ];
        if (defined('CURLOPT_IPRESOLVE') && defined('CURL_IPRESOLVE_V4')) {
            $options[CURLOPT_IPRESOLVE] = CURL_IPRESOLVE_V4;
        }
        if ($payload !== null) {
            $options[CURLOPT_POSTFIELDS] = is_string($payload) ? $payload : json_encode($payload);
        }

        curl_setopt_array($ch, $options);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr = curl_error($ch);
        curl_close($ch);

        if ($httpCode > 0) {
            return ['code' => $httpCode, 'body' => $response, 'error' => null];
        }
    }

    // 2. Fallback to PHP Stream Context (file_get_contents)
    $contextOpts = [
        'http' => [
            'method' => $method,
            'header' => implode("\r\n", $headers) . "\r\n",
            'timeout' => 25,
            'ignore_errors' => true,
        ],
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true,
        ]
    ];
    if ($payload !== null) {
        $contextOpts['http']['content'] = is_string($payload) ? $payload : json_encode($payload);
    }

    $context = stream_context_create($contextOpts);
    $response = @file_get_contents($url, false, $context);

    $httpCode = 0;
    if (isset($http_response_header) && is_array($http_response_header)) {
        foreach ($http_response_header as $hdr) {
            if (preg_match('#HTTP/[0-9\.]+\s+([0-9]+)#i', $hdr, $m)) {
                $httpCode = intval($m[1]);
            }
        }
    }

    return [
        'code' => $httpCode,
        'body' => $response,
        'error' => $httpCode === 0 ? ($curlErr ?: 'Impossible d\'établir une connexion sortante HTTPS vers api.github.com depuis l\'hébergement.') : null
    ];
}

function syncBlogsToGitHub(?array $blogs = null) {
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
        $blogs = function_exists('readJsonFile') ? readJsonFile('blogs.json') : [];
        if (function_exists('getDbConnection')) {
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
    }

    $jsonContent = json_encode($blogs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $base64Content = base64_encode($jsonContent);

    // 1. Check existing file SHA on GitHub
    $sha = null;
    $getUrl = "https://api.github.com/repos/{$repo}/contents/{$path}?ref={$branch}";
    $getRes = httpGitHubRequest($getUrl, 'GET', $token);

    if ($getRes['code'] === 200 && !empty($getRes['body'])) {
        $data = json_decode($getRes['body'], true);
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

    $putRes = httpGitHubRequest($putUrl, 'PUT', $token, $payload);

    if ($putRes['code'] === 200 || $putRes['code'] === 201) {
        return [
            'success' => true,
            'configured' => true,
            'repo' => $repo,
            'branch' => $branch,
            'count' => count($blogs),
            'message' => 'Synchronisation réussie avec GitHub (' . $repo . ' @ ' . $branch . ')'
        ];
    } else {
        $respData = !empty($putRes['body']) ? json_decode($putRes['body'], true) : [];
        $errMsg = $respData['message'] ?? ($putRes['error'] ?: ("Erreur HTTP " . $putRes['code']));
        return [
            'success' => false,
            'configured' => true,
            'httpCode' => $putRes['code'],
            'error' => 'Échec de synchronisation GitHub : ' . $errMsg
        ];
    }
}
