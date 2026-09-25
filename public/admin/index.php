<?php
/**
 * ORSAP - Panneau d'Administration (PHP / MySQL / JSON Fallback)
 */

if (session_status() === PHP_SESSION_NONE) {
    @session_start();
}

require_once __DIR__ . '/../api/db.php';
$pdo = getDbConnection();
$config = require __DIR__ . '/../api/config.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Helper to escape HTML safely
function esc($str) {
    return htmlspecialchars((string)($str ?? ''), ENT_QUOTES, 'UTF-8');
}

function generateAdminTokenPHP($jwtSecret) {
    $time = time();
    $data = "orsap_admin:" . $time;
    $hash = hash_hmac('sha256', $data, $jwtSecret);
    return base64_encode($data . ":" . $hash);
}

function verifyAdminTokenPHP($token, $jwtSecret) {
    if (empty($token)) return false;
    $decoded = base64_decode($token);
    if (!$decoded) return false;
    $parts = explode(':', $decoded);
    if (count($parts) !== 3) return false;
    list($prefix, $time, $hash) = $parts;
    if ($prefix !== 'orsap_admin') return false;
    if (time() - intval($time) > (86400 * 7)) return false; // 7 days expiration
    $expectedHash = hash_hmac('sha256', $prefix . ":" . $time, $jwtSecret);
    return hash_equals($expectedHash, $hash);
}

// ── Logout ──────────────────────────────────────────────────────────
if (strpos($uri, '/logout') !== false || isset($_GET['logout'])) {
    setcookie('orsap_admin_token', '', time() - 3600, '/');
    unset($_SESSION['orsap_admin_auth']);
    header('Location: /admin');
    exit;
}

$loginError = '';
$cookieToken = $_COOKIE['orsap_admin_token'] ?? '';
$jwtSecret = $config['jwt_secret'] ?? 'orsap-secure-jwt-secret-2026-auth';
$isAuth = (isset($_SESSION['orsap_admin_auth']) && $_SESSION['orsap_admin_auth'] === true)
       || verifyAdminTokenPHP($cookieToken, $jwtSecret);

// ── Handle Login Form Submission ────────────────────────────────────
if ($method === 'POST' && isset($_POST['password'])) {
    $password = trim($_POST['password']);
    $expected = $config['admin_password'] ?? 'admin';
    if ($password && $password === $expected) {
        $token = generateAdminTokenPHP($jwtSecret);
        $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
        @setcookie('orsap_admin_token', $token, [
            'expires' => time() + (86400 * 7),
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
            'secure' => $secure
        ]);
        $_SESSION['orsap_admin_auth'] = true;
        $isAuth = true;
    } else {
        $loginError = "Mot de passe incorrect.";
    }
}

if (!$isAuth) {
    renderLoginPage($loginError);
    exit;
}

// ── Admin Dashboard ─────────────────────────────────────────────────
$tab = $_GET['tab'] ?? 'devis-catalogue';

function loadJsonData($filename) {
    $paths = [
        __DIR__ . '/../data/' . $filename,
        __DIR__ . '/../../data/' . $filename,
        __DIR__ . '/data/' . $filename,
        __DIR__ . '/../public/data/' . $filename
    ];
    foreach ($paths as $p) {
        if (file_exists($p)) {
            $data = json_decode(file_get_contents($p), true);
            if (is_array($data)) return $data;
        }
    }
    if (function_exists('readJsonFile')) {
        return readJsonFile($filename);
    }
    return [];
}

$submissions = [];
$catalogueDevis = loadAllDevisRequestsPHP();
$blogs = [];
$apps = [];
$subscribers = [];
$users = loadUsersList();

if ($pdo) {
    try {
        $stmt1 = $pdo->query("SELECT * FROM `submissions` ORDER BY `created_at` DESC");
        $submissions = $stmt1->fetchAll();
    } catch (Exception $e) {
        $submissions = loadJsonData('submissions.json');
    }

    try {
        $stmt2 = $pdo->query("SELECT * FROM `blogs` ORDER BY `date` DESC");
        $blogs = $stmt2->fetchAll();
    } catch (Exception $e) {
        $blogs = loadJsonData('blogs.json');
    }

    try {
        $stmt3 = $pdo->query("SELECT * FROM `applications` ORDER BY `created_at` DESC");
        $apps = $stmt3->fetchAll();
    } catch (Exception $e) {
        $apps = loadJsonData('applications.json');
    }

    try {
        $stmt4 = $pdo->query("SELECT * FROM `subscribers` ORDER BY `created_at` DESC");
        $subscribers = $stmt4->fetchAll();
    } catch (Exception $e) {
        $subscribers = loadJsonData('subscribers.json');
    }
} else {
    // Fallback to JSON if MySQL connection failed
    $submissions = loadJsonData('submissions.json');
    $blogs = loadJsonData('blogs.json');
    $apps = loadJsonData('applications.json');
    $subscribers = loadJsonData('subscribers.json');
}

// Fallback if empty array from MySQL
if (empty($submissions)) {
    $submissions = loadJsonData('submissions.json');
}
if (empty($catalogueDevis)) {
    $requests = loadJsonData('devis_requests.json');
    $items = loadJsonData('devis_items.json');
    $catalogueDevis = array_map(function($req) use ($items) {
        $reqId = $req['id'] ?? '';
        $reqItems = array_values(array_filter($items, function($it) use ($reqId) {
            return ($it['devisId'] ?? $it['requestId'] ?? '') === $reqId;
        }));
        $req['items'] = !empty($reqItems) ? $reqItems : ($req['items'] ?? []);
        return $req;
    }, $requests);
}

// 0. Generate catalogue devis rows
$catalogueDevisRows = '';
foreach ($catalogueDevis as $cd) {
    $cdId = esc($cd['id'] ?? '');
    $cdDate = $cd['createdAt'] ?? ($cd['created_at'] ?? '');
    $cdDateFormatted = $cdDate ? date('d/m/Y H:i', strtotime($cdDate)) : '—';
    $items = $cd['items'] ?? [];
    
    $totalHt = 0.0;
    $totalUnits = 0;
    foreach ($items as $it) {
        $qty = (int)($it['quantity'] ?? 1);
        $totalUnits += $qty;
        $totalHt += ((float)($it['priceHt'] ?? $it['price_ht'] ?? 0)) * $qty;
    }

    $itemsDetailHtml = '';
    $idx = 0;
    foreach ($items as $it) {
        $idx++;
        $isCustom = !empty($it['isCustom']) || !empty($it['is_custom']) || ($it['articleCode'] ?? $it['code'] ?? '') === 'CUSTOM';
        $code = $isCustom ? '<span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 10px;">SUR-MESURE</span>' : esc($it['articleCode'] ?? $it['code'] ?? '—');
        $designation = esc($it['designation'] ?? '');
        $qty = (int)($it['quantity'] ?? 1);
        $pUnit = (float)($it['priceHt'] ?? $it['price_ht'] ?? 0);
        $pTotal = $pUnit * $qty;
        $bg = $idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        $pUnitStr = $pUnit > 0 ? number_format($pUnit, 2, ',', ' ') . ' MAD' : 'Sur devis';
        $pTotalStr = $pTotal > 0 ? number_format($pTotal, 2, ',', ' ') . ' MAD' : 'Sur devis';

        $itemsDetailHtml .= '
        <tr style="background: ' . $bg . '; font-size: 12.5px;">
          <td style="padding: 8px 12px; font-family: monospace; font-weight: bold; color: #1e293b;">' . $code . '</td>
          <td style="padding: 8px 12px; font-weight: 600; color: #334155;">' . $designation . '</td>
          <td style="padding: 8px 12px; text-align: center; font-weight: bold;">' . $qty . '</td>
          <td style="padding: 8px 12px; text-align: right; color: #64748b;">' . $pUnitStr . '</td>
          <td style="padding: 8px 12px; text-align: right; font-weight: bold; color: #d3121a;">' . $pTotalStr . '</td>
        </tr>';
    }

    $email = $cd['email'] ?? '';
    $emailHtml = !empty($email) ? '<a href="mailto:' . esc($email) . '" style="color: #d3121a; font-weight: 700; text-decoration: none;">' . esc($email) . '</a>' : '—';
    $phone = $cd['phone'] ?? '';
    $phoneHtml = !empty($phone) ? '<a href="tel:' . esc($phone) . '">' . esc($phone) . '</a>' : '—';
    $note = $cd['note'] ?? '';
    $totalHtStr = $totalHt > 0 ? number_format($totalHt, 2, ',', ' ') . ' MAD HT' : 'Sur devis';
    $clientName = esc($cd['name'] ?? '—');
    $clientCompany = esc($cd['company'] ?? 'Particulier');
    $itemsCount = count($items);

    $noteHtml = !empty($note) ? '<div style="margin-bottom: 12px; padding: 10px 14px; background: #fffbeb; border-left: 4px solid #f59e0b; font-size: 12.5px; color: #92400e; border-radius: 4px;"><strong>Précisions / Note client :</strong> ' . esc($note) . '</div>' : '';

    $catalogueDevisRows .= '
    <tr id="catdevis-' . $cdId . '">
      <td class="chk-cell"><input type="checkbox" class="row-chk chk-catalogue-devis" value="' . $cdId . '" onchange="onRowCheck(\'catalogue-devis\')"></td>
      <td class="date-badge">' . $cdDateFormatted . '</td>
      <td><span class="badge" style="background:#fee2e2; color:#991b1b; font-weight:800; font-family:monospace;">' . strtoupper($cdId) . '</span></td>
      <td style="font-weight: 700;">' . $clientName . '</td>
      <td>' . $clientCompany . '</td>
      <td>' . $emailHtml . '</td>
      <td>' . $phoneHtml . '</td>
      <td><span class="badge" style="background:#f1f5f9; color:#1e293b; font-weight:700;">' . $itemsCount . ' réf. (' . $totalUnits . ' unités)</span></td>
      <td style="font-weight: 800; color: #d3121a;">' . $totalHtStr . '</td>
      <td>
        <div class="actions-cell">
          <button type="button" id="toggle-btn-' . $cdId . '" class="view-link" style="cursor:pointer; background:#1e293b; color:#fff; border-color:#1e293b; font-size:11px;" onclick="toggleDevisDetails(\'' . $cdId . '\')">
            ▼ Voir les articles (' . $itemsCount . ')
          </button>
          <button type="button" class="del-btn" style="padding: 5px 10px; font-size: 11px;" onclick="deleteCatalogueDevis(\'' . $cdId . '\')">✕</button>
        </div>
      </td>
    </tr>
    <tr id="details-' . $cdId . '" style="display: none; background: #f8fafc;">
      <td colspan="10" style="padding: 16px 24px; border-bottom: 2px solid #e2e8f0;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 800; font-size: 14px; color: #1e293b;">
              Détail chiffré des articles demandés (' . $itemsCount . ' références) — Client: ' . $clientName . ' (' . $clientCompany . ')
            </div>
            <div style="font-size: 13px; font-weight: 800; color: #d3121a;">
              Total estimatif : ' . $totalHtStr . '
            </div>
          </div>
          ' . $noteHtml . '
          <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
            <thead>
              <tr style="background: #1e293b; color: #ffffff; font-size: 11px; text-transform: uppercase;">
                <th style="padding: 8px 12px; color: #fff;">Code</th>
                <th style="padding: 8px 12px; color: #fff;">Désignation Produit</th>
                <th style="padding: 8px 12px; color: #fff; text-align: center;">Quantité</th>
                <th style="padding: 8px 12px; color: #fff; text-align: right;">P.U HT</th>
                <th style="padding: 8px 12px; color: #fff; text-align: right;">Total HT</th>
              </tr>
            </thead>
            <tbody>' . $itemsDetailHtml . '</tbody>
          </table>
        </div>
      </td>
    </tr>';
}

// 1. Generate devis rows
$devisRows = '';
foreach ($submissions as $s) {
    $id = esc($s['id'] ?? '');
    $dateVal = $s['created_at'] ?? ($s['createdAt'] ?? '');
    $dateFormatted = $dateVal ? date('d/m/Y H:i', strtotime($dateVal)) : '—';
    $clientType = $s['client_type'] ?? ($s['clientType'] ?? 'professional');
    $isPro = $clientType === 'professional';
    
    $solRaw = $s['solutions'] ?? [];
    $solutions = is_string($solRaw) ? (json_decode($solRaw, true) ?: []) : (array)$solRaw;
    
    $secRaw = $s['sectors'] ?? [];
    $sectors = is_string($secRaw) ? (json_decode($secRaw, true) ?: []) : (array)$secRaw;

    $solHtml = !empty($solutions) ? implode('', array_map(function($sol) {
        return '<span class="badge pro" style="display:inline-block; margin:2px; font-size:10.5px;">' . esc($sol) . '</span>';
    }, $solutions)) : '—';

    $secHtml = !empty($sectors) ? implode('', array_map(function($sec) {
        return '<span class="badge pro" style="display:inline-block; margin:2px; font-size:10.5px;">' . esc($sec) . '</span>';
    }, $sectors)) : '—';

    $email = $s['email'] ?? '';
    $emailHtml = !empty($email) ? '<a href="mailto:' . esc($email) . '">' . esc($email) . '</a>' : '—';
    $phone = $s['phone'] ?? '';
    $phoneHtml = !empty($phone) ? '<a href="tel:' . esc($phone) . '">' . esc($phone) . '</a>' : '—';
    $clientBadgeClass = $isPro ? 'pro' : 'perso';
    $clientBadgeLabel = $isPro ? 'Pro' : 'Particulier';
    $clientName = esc($s['name'] ?? '—');
    $clientCompany = esc($s['company'] ?? '—');
    $clientMsg = esc($s['message'] ?? 'Aucun message particulier.');

    // WhatsApp clean phone
    $cleanPhone = preg_replace('/[^\d+]/', '', (string)$phone);
    if (strpos($cleanPhone, '0') === 0) {
        $cleanPhone = '212' . substr($cleanPhone, 1);
    } elseif (strpos($cleanPhone, '+') === 0) {
        $cleanPhone = substr($cleanPhone, 1);
    } elseif (strpos($cleanPhone, '212') !== 0 && strlen($cleanPhone) === 9) {
        $cleanPhone = '212' . $cleanPhone;
    }
    $waUrl = !empty($cleanPhone) ? 'https://wa.me/' . $cleanPhone . '?text=' . rawurlencode("Bonjour " . ($s['name'] ?? 'Client') . ",\n\nNous faisons suite à votre demande de devis sur ORSAP Maroc.\n\nL'équipe ORSAP\nhttps://orsap.ma") : '';

    $devisRows .= '
    <tr id="row-' . $id . '">
      <td class="chk-cell"><input type="checkbox" class="row-chk chk-devis" value="' . $id . '" onchange="onRowCheck(\'devis\')"></td>
      <td>' . $dateFormatted . '</td>
      <td><span class="badge ' . $clientBadgeClass . '">' . $clientBadgeLabel . '</span></td>
      <td style="font-weight:700;">' . $clientName . '</td>
      <td>' . $clientCompany . '</td>
      <td>' . $emailHtml . '</td>
      <td>' . $phoneHtml . '</td>
      <td>' . $solHtml . '</td>
      <td>' . $secHtml . '</td>
      <td>
        <div class="msg-preview" onclick="toggleSubmissionDetails(\'' . $id . '\')" title="Cliquer pour déplier l\'intégralité du devis">
          ' . $clientMsg . '
        </div>
      </td>
      <td>
        <button type="button" id="toggle-btn-devis-' . $id . '" class="view-link" style="cursor:pointer; background:#1e293b; color:#fff; border-color:#1e293b; font-size:11px; white-space:nowrap; padding:5px 10px;" onclick="toggleSubmissionDetails(\'' . $id . '\')">
          ▼ Déplier
        </button>
      </td>
    </tr>
    <tr id="details-devis-' . $id . '" style="display: none; background: #f8fafc;">
      <td colspan="11" style="padding: 16px 24px; border-bottom: 2px solid #e2e8f0;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
            <div>
              <span style="font-weight: 800; font-size: 15px; color: #1e293b;">Demande de Devis Express</span>
              <span class="badge ' . $clientBadgeClass . '" style="margin-left: 8px;">' . $clientBadgeLabel . '</span>
              <span style="font-size: 13px; color: #64748b; margin-left: 10px;">Demandeur: <strong style="color:#0f172a;">' . $clientName . '</strong>' . ($clientCompany !== '—' ? ' — Société: <strong style="color:#0f172a;">' . $clientCompany . '</strong>' : '') . '</span>
            </div>
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              ' . (!empty($waUrl) ? '<a href="' . $waUrl . '" target="_blank" class="view-link" style="background:#22c55e; color:#fff; border-color:#22c55e; font-weight:700;">WhatsApp</a>' : '') . '
              ' . (!empty($phone) ? '<a href="tel:' . esc($phone) . '" class="view-link" style="background:#0284c7; color:#fff; border-color:#0284c7; font-weight:700;">Appeler (' . esc($phone) . ')</a>' : '') . '
              ' . (!empty($email) ? '<a href="mailto:' . esc($email) . '" class="view-link" style="font-weight:600;">Email</a>' : '') . '
            </div>
          </div>
          <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;">
            📄 Texte intégral &amp; Détails du devis :
          </div>
          <div style="background: #f8fafc; border-left: 4px solid #d3121a; padding: 16px 20px; border-radius: 6px; font-size: 14px; line-height: 1.65; color: #0f172a; white-space: pre-wrap; word-break: break-word; font-family: inherit;">' . $clientMsg . '</div>
        </div>
      </td>
    </tr>';
}

// 2. Generate blog rows
$blogRows = '';
foreach ($blogs as $b) {
    $id = esc($b['id'] ?? '');
    $dateVal = $b['date'] ?? '';
    $dateFormatted = $dateVal ? date('d/m/Y', strtotime($dateVal)) : '—';
    $title = esc($b['title'] ?? '');
    $summary = esc($b['summary'] ?? '');
    
    $blogRows .= '
    <tr id="blog-' . $id . '">
      <td class="chk-cell"><input type="checkbox" class="row-chk chk-blog" value="' . $id . '" onchange="onRowCheck(\'blog\')"></td>
      <td>
        <div class="actions-cell">
          <button type="button" class="edit-btn" onclick="editBlog(\'' . $id . '\')">Modifier</button>
          <button type="button" class="del-btn" onclick="deleteBlog(\'' . $id . '\')">✕</button>
        </div>
      </td>
      <td class="date-badge">' . $dateFormatted . '</td>
      <td style="font-weight: 700;">' . $title . '</td>
      <td class="msg">' . $summary . '</td>
    </tr>';
}

// 3. Generate applications rows
$appsRows = '';
foreach ($apps as $a) {
    $id = esc($a['id'] ?? '');
    $dateVal = $a['created_at'] ?? ($a['createdAt'] ?? '');
    $dateFormatted = $dateVal ? date('d/m/Y H:i', strtotime($dateVal)) : '—';
    $email = $a['email'] ?? '';
    $emailHtml = !empty($email) ? '<a href="mailto:' . esc($email) . '">' . esc($email) . '</a>' : '—';
    $phone = $a['phone'] ?? '';
    $phoneHtml = !empty($phone) ? '<a href="tel:' . esc($phone) . '">' . esc($phone) . '</a>' : '—';
    
    $cvHtml = '—';
    if (!empty($a['cv'])) {
        $cvHtml = '<a href="/api/recrutement/' . $id . '/cv" target="_blank" class="view-link">Télécharger CV</a>';
    } elseif (!empty($a['resumePath']) || !empty($a['resumeFileName'])) {
        $cvHtml = '<a href="/api/admin/download-resume/' . $id . '" target="_blank" class="view-link">Télécharger CV</a>';
    }

    $appsRows .= '
    <tr id="app-' . $id . '">
      <td class="chk-cell"><input type="checkbox" class="row-chk chk-recrutement" value="' . $id . '" onchange="onRowCheck(\'recrutement\')"></td>
      <td>' . $dateFormatted . '</td>
      <td style="font-weight: 700;">' . esc($a['name'] ?? '—') . '</td>
      <td><span class="badge pro">' . esc($a['position'] ?? '—') . '</span></td>
      <td>' . $emailHtml . '</td>
      <td>' . $phoneHtml . '</td>
      <td>' . $cvHtml . '</td>
      <td class="msg">' . esc($a['message'] ?? '—') . '</td>
    </tr>';
}

// 4. Generate subscribers rows
$subscribersRows = '';
$subIdx = 0;
foreach ($subscribers as $s) {
    $subIdx++;
    $email = $s['email'] ?? '';
    $emailHtml = !empty($email) ? '<a href="mailto:' . esc($email) . '">' . esc($email) . '</a>' : '—';
    $dateVal = $s['created_at'] ?? ($s['createdAt'] ?? '');
    $dateFormatted = $dateVal ? date('d/m/Y H:i', strtotime($dateVal)) : '—';
    $typeBadge = ($s['type'] ?? 'newsletter') === 'client'
        ? '<span class="badge pro">Client Contact</span>'
        : '<span class="badge perso">Newsletter</span>';

    $subscribersRows .= '
    <tr id="sub-' . $subIdx . '">
      <td class="chk-cell"><input type="checkbox" class="row-chk chk-subscribers" value="' . esc($email) . '" onchange="onRowCheck(\'subscribers\')"></td>
      <td>' . $dateFormatted . '</td>
      <td>' . $typeBadge . '</td>
      <td style="font-weight: 700;">' . $emailHtml . '</td>
      <td>' . esc($s['name'] ?? '—') . '</td>
      <td>' . esc($s['company'] ?? '—') . '</td>
      <td>' . esc($s['phone'] ?? '—') . '</td>
    </tr>';
}

// 5. Generate users rows
$usersRows = '';
foreach ($users as $u) {
    $id = esc($u['id'] ?? '');
    $dateVal = $u['created_at'] ?? ($u['createdAt'] ?? '');
    $dateFormatted = $dateVal ? date('d/m/Y H:i', strtotime($dateVal)) : '—';
    $type = ($u['type'] ?? 'professional') === 'professional' ? 'Entreprise' : 'Particulier';
    $typeBadge = '<span class="badge ' . (($u['type'] ?? '') === 'professional' ? 'pro' : 'perso') . '">' . $type . '</span>';
    $email = $u['email'] ?? '';
    $emailHtml = !empty($email) ? '<a href="mailto:' . esc($email) . '">' . esc($email) . '</a>' : '—';
    $phone = $u['phone'] ?? '';
    $phoneHtml = !empty($phone) ? '<a href="tel:' . esc($phone) . '">' . esc($phone) . '</a>' : '—';
    $isVerified = !empty($u['is_verified']) || !empty($u['isVerified']);
    $statusHtml = $isVerified
        ? '<span class="badge pro" style="background:#dcfce7; color:#15803d;">✓ Vérifié</span>'
        : '<span class="badge perso" style="background:#fef3c7; color:#b45309;">En attente</span>';

    $usersRows .= '
    <tr id="user-' . $id . '">
      <td class="chk-cell"><input type="checkbox" class="row-chk chk-users" value="' . $id . '" onchange="onRowCheck(\'users\')"></td>
      <td>' . $dateFormatted . '</td>
      <td>' . $typeBadge . '</td>
      <td style="font-weight: 700;">' . esc($u['name'] ?? '—') . '</td>
      <td>' . esc($u['company'] ?? '—') . '</td>
      <td>' . $emailHtml . '</td>
      <td>' . $phoneHtml . '</td>
      <td>' . $statusHtml . '</td>
    </tr>';
}

// 6. Construct tab content
$tabContent = '';
if ($tab === 'devis') {
    $tabContent = '
    <div class="wrap">
      <div class="table-container">
        <div class="table-header-title">
          <span>Demandes de Devis Reçues (' . count($submissions) . ')</span>
          <button id="bulk-btn-devis" class="bulk-del-btn" style="display: none;" onclick="handleBulkDelete(\'devis\', \'/api/devis\', \'demandes\')">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Supprimer (<span id="selected-count-devis">0</span>)
          </button>
        </div>' .
        (empty($submissions)
            ? '<div class="empty">Aucune demande de devis pour le moment.</div>'
            : '<div class="table-responsive"><table>
          <thead>
            <tr>
              <th class="chk-cell"><input type="checkbox" id="selectAll-devis" class="row-chk" onchange="toggleSelectAll(\'devis\', this.checked)"></th>
              <th>Date</th>
              <th>Type</th>
              <th>Nom</th>
              <th>Entreprise</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Solutions souhaitées</th>
              <th>Secteurs d\'activité</th>
              <th>Message</th>
              <th class="actions-col" style="width: 110px;">Détails</th>
            </tr>
          </thead>
          <tbody>' . $devisRows . '</tbody>
        </table></div>') .
      '</div>
    </div>';
} elseif ($tab === 'devis-catalogue') {
    $tabContent = '
    <div class="wrap">
      <div class="table-container">
        <div class="table-header-title">
          <span>Demandes de Devis Catalogue Chiffrées (' . count($catalogueDevis) . ')</span>
          <button id="bulk-btn-catalogue-devis" class="bulk-del-btn" style="display: none;" onclick="handleBulkDelete(\'catalogue-devis\', \'/api/admin/devis-catalogue\', \'devis catalogue\')">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Supprimer (<span id="selected-count-catalogue-devis">0</span>)
          </button>
        </div>' .
        (empty($catalogueDevis)
            ? '<div class="empty">Aucune demande de devis catalogue pour le moment.</div>'
            : '<div class="table-responsive"><table>
          <thead>
            <tr>
              <th class="chk-cell"><input type="checkbox" id="selectAll-catalogue-devis" class="row-chk" onchange="toggleSelectAll(\'catalogue-devis\', this.checked)" title="Tout sélectionner"></th>
              <th>Date</th>
              <th>Réf. Devis</th>
              <th>Nom Client</th>
              <th>Entreprise</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Articles</th>
              <th>Total Chiffré</th>
              <th class="actions-col" style="width: 170px;">Détails</th>
            </tr>
          </thead>
          <tbody>' . $catalogueDevisRows . '</tbody>
        </table></div>') .
      '</div>
    </div>';
} elseif ($tab === 'users') {
    $tabContent = '
    <div class="wrap">
      <div class="table-container">
        <div class="table-header-title">
          <span>Comptes Clients Inscrits (' . count($users) . ')</span>
          <button id="bulk-btn-users" class="bulk-del-btn" style="display: none;" onclick="handleBulkDelete(\'users\', \'/api/admin/users\', \'comptes\')">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Supprimer (<span id="selected-count-users">0</span>)
          </button>
        </div>' .
        (empty($users)
            ? '<div class="empty">Aucun compte client créé pour le moment.</div>'
            : '<div class="table-responsive"><table>
          <thead>
            <tr>
              <th class="chk-cell"><input type="checkbox" id="selectAll-users" class="row-chk" onchange="toggleSelectAll(\'users\', this.checked)"></th>
              <th>Date d\'inscription</th>
              <th>Type</th>
              <th>Nom complet</th>
              <th>Société</th>
              <th>Adresse Email</th>
              <th>Téléphone</th>
              <th>Statut Email</th>
            </tr>
          </thead>
          <tbody>' . $usersRows . '</tbody>
        </table></div>') .
      '</div>
    </div>';
} elseif ($tab === 'recrutement') {
    $tabContent = '
    <div class="wrap">
      <div class="table-container">
        <div class="table-header-title">
          <span>Candidatures de Recrutement (' . count($apps) . ')</span>
          <button id="bulk-btn-recrutement" class="bulk-del-btn" style="display: none;" onclick="handleBulkDelete(\'recrutement\', \'/api/recrutement\', \'candidatures\')">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Supprimer (<span id="selected-count-recrutement">0</span>)
          </button>
        </div>' .
        (empty($apps)
            ? '<div class="empty">Aucune candidature reçue pour le moment.</div>'
            : '<div class="table-responsive"><table>
          <thead>
            <tr>
              <th class="chk-cell"><input type="checkbox" id="selectAll-recrutement" class="row-chk" onchange="toggleSelectAll(\'recrutement\', this.checked)"></th>
              <th>Date</th>
              <th>Nom complet</th>
              <th>Poste souhaité</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>CV (Fichier)</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>' . $appsRows . '</tbody>
        </table></div>') .
      '</div>
    </div>';
} elseif ($tab === 'subscribers') {
    $tabContent = '
    <div class="wrap">
      <div class="table-container">
        <div class="table-header-title">
          <span>Liste Clients &amp; Abonnés (' . count($subscribers) . ')</span>
          <div style="display: flex; gap: 10px; align-items: center;">
            <button id="bulk-btn-subscribers" class="bulk-del-btn" style="display: none;" onclick="handleBulkDelete(\'subscribers\', \'/api/newsletter\', \'abonnés\')">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Supprimer (<span id="selected-count-subscribers">0</span>)
            </button>
            <a href="/api/admin/export/subscribers" class="view-link" title="Exporter la liste des abonnés au format CSV">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Exporter CSV
            </a>
          </div>
        </div>' .
        (empty($subscribers)
            ? '<div class="empty">Aucun abonné pour le moment.</div>'
            : '<div class="table-responsive"><table>
          <thead>
            <tr>
              <th class="chk-cell"><input type="checkbox" id="selectAll-subscribers" class="row-chk" onchange="toggleSelectAll(\'subscribers\', this.checked)"></th>
              <th>Date d\'inscription</th>
              <th>Type</th>
              <th>Adresse Email</th>
              <th>Nom complet</th>
              <th>Société</th>
              <th>Téléphone</th>
            </tr>
          </thead>
          <tbody>' . $subscribersRows . '</tbody>
        </table></div>') .
      '</div>
    </div>';
} else {
    $tabContent = '
    <div class="wrap">
      <section class="editor-section">
        <div class="editor-header">
          <h2 id="formTitle">
            <span class="mode-indicator"></span>
            Rédiger un nouvel article de blog
          </h2>
          <button id="cancelBtn" type="button" class="cancel-btn" onclick="cancelEdit()">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            Annuler la modification
          </button>
        </div>
        <form id="blogForm" onsubmit="handleBlogSubmit(event)" class="form-grid">
          <div class="form-group">
            <label>Titre de l\'article *</label>
            <input type="text" id="blogTitle" required placeholder="Ex: Sécurité & Conformité des Échafaudages Industriels..." />
          </div>
          <div class="form-group">
            <label>Résumé de l\'article (Aperçu catalogue) *</label>
            <input type="text" id="blogSummary" required placeholder="Court résumé synthétique de l\'article..." />
          </div>
          
          <div class="form-group">
            <label>Image d\'illustration (Optionnelle)</label>
            <label class="dropzone">
              <input type="file" id="blogImage" accept="image/*" onchange="previewImage(event)" />
              <div class="dropzone-label">
                <svg class="dropzone-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span class="dropzone-text">Cliquez pour téléverser une image</span>
                <span class="dropzone-hint">JPG, PNG, WebP jusqu\'à 10 Mo</span>
              </div>
            </label>
            <div id="imgPreviewCard" class="preview-card" style="display: none;">
              <img id="imagePreview" class="preview-thumb" alt="Aperçu" />
              <div class="preview-info">
                <div class="preview-title">Image sélectionnée</div>
                <span class="preview-badge">Prête à être enregistrée</span>
              </div>
              <button type="button" class="remove-btn" onclick="removeImage()">✕ Retirer</button>
            </div>
          </div>

          <div class="form-group">
            <label>Fiche technique / Document (PDF)</label>
            <label class="dropzone">
              <input type="file" id="blogPdf" accept="application/pdf" onchange="previewPdf(event)" />
              <div class="dropzone-label">
                <svg class="dropzone-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span class="dropzone-text">Cliquez pour joindre un document PDF</span>
                <span class="dropzone-hint">Visualisation intégrée dans l\'article</span>
              </div>
            </label>
            <div id="pdfPreviewCard" class="preview-card" style="display: none;">
              <div style="background: #fee2e2; border-radius: 8px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: #d3121a; font-weight: 800; font-size: 13px;">PDF</div>
              <div class="preview-info">
                <div id="pdfName" class="preview-title">document.pdf</div>
                <span class="preview-badge">Document joint</span>
              </div>
              <button type="button" class="remove-btn" onclick="removePdf()">✕ Retirer</button>
            </div>
          </div>

          <div class="form-group">
            <label>Contenu de l\'article / Mots-clés SEO *</label>
            <textarea id="blogContent" rows="8" required placeholder="Rédigez le texte complet ou collez vos mots-clés SEO..."></textarea>
          </div>

          <div class="btn-group">
            <button type="submit" id="submitBtn" class="submit-btn">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
              Publier l\'article
            </button>
          </div>
        </form>
      </section>

      <div class="table-container">
        <div class="table-header-title">
          <span>Articles Publiés (' . count($blogs) . ')</span>
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <button id="bulk-btn-blog" class="bulk-del-btn" style="display: none;" onclick="handleBulkDelete(\'blog\', \'/api/blogs\', \'articles\')">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Supprimer (<span id="selected-count-blog">0</span>)
            </button>
            <button type="button" onclick="triggerGitHubSync()" class="view-link" style="background: #22c55e; color: #fff; border-color: #22c55e; cursor: pointer;" title="Synchroniser immédiatement tous les articles avec GitHub et Heberjahiz">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Sync GitHub
            </button>
            <a href="/api/admin/export/blogs" onclick="onDownloadExport()" class="view-link" title="Télécharger le fichier JSON et synchroniser automatiquement avec GitHub et Heberjahiz">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Sauvegarde JSON
            </a>
            <label class="view-link" style="cursor: pointer; margin-bottom: 0;" title="Restaurer des articles à partir d\'un fichier JSON">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" /></svg>
              Restaurer
              <input type="file" accept=".json,application/json" onchange="importBackup(event)" style="display: none;" />
            </label>
            <button type="button" onclick="configureGitHubToken()" class="view-link" style="background: transparent; color: #64748b; border-color: #cbd5e1; cursor: pointer;" title="Configurer le Token GitHub pour la synchronisation automatique">
              ⚙️ Token GitHub
            </button>
          </div>
        </div>' .
        (empty($blogs)
            ? '<div class="empty">Aucun article publié pour le moment.</div>'
            : '<div class="table-responsive"><table>
          <thead>
            <tr>
              <th class="chk-cell"><input type="checkbox" id="selectAll-blog" class="row-chk" onchange="toggleSelectAll(\'blog\', this.checked)"></th>
              <th style="width: 170px;">Actions</th>
              <th style="width: 130px;">Date</th>
              <th>Titre de l\'article</th>
              <th>Résumé</th>
            </tr>
          </thead>
          <tbody>' . $blogRows . '</tbody>
        </table></div>') .
      '</div>
    </div>';
}

$templatePath = __DIR__ . '/admin.html';
if (!file_exists($templatePath)) {
    $templatePath = __DIR__ . '/../../server/admin.html';
}

if ($pdo) {
    $dbBadge = '<div style="display:inline-flex; align-items:center; gap:6px; background:rgba(34,197,94,0.15); border:1px solid rgba(34,197,94,0.4); color:#4ade80; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600;" title="Connecté à la base de données MySQL Heberjahiz"><span style="width:8px; height:8px; border-radius:50%; background:#22c55e; display:inline-block;"></span> MySQL Actif (' . esc($config['db_name']) . ')</div>';
} else {
    $dbBadge = '<div style="display:inline-flex; align-items:center; gap:6px; background:rgba(249,115,22,0.15); border:1px solid rgba(249,115,22,0.4); color:#fb923c; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600;" title="MySQL non connecté. Stockage sécurisé dans le fichier JSON sur le serveur."><span style="width:8px; height:8px; border-radius:50%; background:#f97316; display:inline-block;"></span> Stockage Fichier JSON (Sécurisé)</div>';
}

$html = file_exists($templatePath) ? file_get_contents($templatePath) : '';
$html = str_replace('{{DB_STATUS_BADGE}}', $dbBadge, $html);
$html = str_replace('{{SUBMISSIONS_COUNT}}', (string)count($submissions), $html);
$html = str_replace('{{CATALOGUE_DEVIS_COUNT}}', (string)count($catalogueDevis), $html);
$html = str_replace('{{BLOGS_COUNT}}', (string)count($blogs), $html);
$html = str_replace('{{APPLICATIONS_COUNT}}', (string)count($apps), $html);
$html = str_replace('{{SUBSCRIBERS_COUNT}}', (string)count($subscribers), $html);
$html = str_replace('{{USERS_COUNT}}', (string)count($users), $html);
$html = str_replace('{{TAB_DEVIS_ACTIVE}}', $tab === 'devis' ? 'active' : '', $html);
$html = str_replace('{{TAB_CATALOGUE_DEVIS_ACTIVE}}', $tab === 'devis-catalogue' ? 'active' : '', $html);
$html = str_replace('{{TAB_RECRUTEMENT_ACTIVE}}', $tab === 'recrutement' ? 'active' : '', $html);
$html = str_replace('{{TAB_BLOG_ACTIVE}}', $tab === 'blog' ? 'active' : '', $html);
$html = str_replace('{{TAB_SUBSCRIBERS_ACTIVE}}', $tab === 'subscribers' ? 'active' : '', $html);
function getOrsapLogoSrc() {
    $logoPaths = [
        __DIR__ . '/logo.jpg',
        __DIR__ . '/../logo.jpg',
        __DIR__ . '/../../src/imports/logo.jpg',
        __DIR__ . '/../src/imports/logo.jpg',
    ];
    foreach ($logoPaths as $lp) {
        if (file_exists($lp)) {
            $data = @file_get_contents($lp);
            if ($data) {
                return 'data:image/jpeg;base64,' . base64_encode($data);
            }
        }
    }
    return '/logo.jpg';
}

$logoSrc = getOrsapLogoSrc();

$html = str_replace('{{LOGO_SRC}}', $logoSrc, $html);
$html = str_replace('{{TAB_USERS_ACTIVE}}', $tab === 'users' ? 'active' : '', $html);
$html = str_replace('{{TAB_CONTENT}}', $tabContent, $html);

header('Content-Type: text/html; charset=utf-8');
echo $html;
exit;

function renderLoginPage($errorMsg = '') {
    $errorHtml = $errorMsg ? '<div class="error">' . esc($errorMsg) . '</div>' : '';
    $logoSrc = getOrsapLogoSrc();
    ?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ORSAP — Connexion Administration</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', system-ui, sans-serif; background: #14171a; color: #fff; display: grid; place-items: center; min-height: 100vh; padding: 20px; }
    .card { background: #1f2327; border: 1px solid rgba(255,255,255,0.08); padding: 40px; width: 100%; max-width: 420px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); border-radius: 8px; }
    .logo-container { display: flex; justify-content: center; margin-bottom: 24px; }
    .logo-img { height: 60px; width: 60px; border-radius: 12px; object-fit: contain; background: #fff; padding: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
    h2 { font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.6); margin-bottom: 20px; text-align: center; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; color: rgba(255,255,255,0.7); }
    .form-group input { width: 100%; padding: 12px; background: #14171a; border: 1px solid rgba(255,255,255,0.15); color: #fff; outline: none; font-size: 15px; text-align: center; letter-spacing: 0.15em; border-radius: 4px; }
    .form-group input:focus { border-color: #d3121a; }
    .btn { width: 100%; padding: 14px; background: #d3121a; color: #fff; border: none; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; cursor: pointer; transition: background 0.2s; border-radius: 4px; }
    .btn:hover { background: #a10e14; }
    .error { color: #d3121a; background: rgba(211,18,26,0.1); border-left: 3px solid #d3121a; padding: 12px; font-size: 13.5px; font-weight: 600; margin-bottom: 20px; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-container">
      <img src="<?= $logoSrc ?>" alt="ORSAP Logo" class="logo-img" onerror="this.onerror=null; this.src='/logo.jpg';" />
    </div>
    <h2>Accès Réservé</h2>
    <?= $errorHtml ?>
    <form method="POST" action="">
      <div class="form-group">
        <label for="password">Mot de passe de sécurité</label>
        <input type="password" id="password" name="password" required autofocus>
      </div>
      <button type="submit" class="btn">Se connecter</button>
    </form>
  </div>
</body>
</html>
    <?php
    exit;
}
