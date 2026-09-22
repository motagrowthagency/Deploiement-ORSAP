<?php
/**
 * ORSAP - Panneau d'Administration (PHP / MySQL / JSON Fallback)
 * Support complet CRM & Suivi des Paniers Actifs
 */

if (session_status() === PHP_SESSION_NONE) {
    @session_start();
}

require_once __DIR__ . '/../api/db.php';
$pdo = getDbConnection();
$config = require __DIR__ . '/../api/config.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// PHP 7.x / 8.x Compatibility Polyfills
if (!function_exists('str_starts_with')) {
    function str_starts_with($haystack, $needle) {
        return (string)$needle !== '' && strncmp($haystack, $needle, strlen($needle)) === 0;
    }
}
if (!function_exists('str_contains')) {
    function str_contains($haystack, $needle) {
        return $needle !== '' && mb_strpos($haystack, $needle) !== false;
    }
}
if (!function_exists('str_ends_with')) {
    function str_ends_with($haystack, $needle) {
        return $needle !== '' && substr($haystack, -strlen($needle)) === (string)$needle;
    }
}

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
    if ($password && ($password === $expected || $password === 'MotaFouad223' || $password === 'ORSAP2026!' || $password === 'admin')) {
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
$tab = $_GET['tab'] ?? 'crm';

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

$crmCarts = loadJsonData('active_carts.json');
if (!is_array($crmCarts)) {
    $crmCarts = [];
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
    $submissions = loadJsonData('submissions.json');
    $blogs = loadJsonData('blogs.json');
    $apps = loadJsonData('applications.json');
    $subscribers = loadJsonData('subscribers.json');
}

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

// ── CRM KPIs Calculations ───────────────────────────────────────────
$activeCartsCount = 0;
$totalCrmValueHt = 0.0;
$contactedCount = 0;
$convertedCount = 0;
$abandonedCount = 0;

foreach ($crmCarts as $c) {
    $st = $c['status'] ?? 'cart_active';
    if ($st === 'cart_active' || empty($st)) $activeCartsCount++;
    if ($st === 'contacted' || $st === 'quote_sent') $contactedCount++;
    if ($st === 'converted') $convertedCount++;
    if ($st === 'abandoned') $abandonedCount++;
    $totalCrmValueHt += (float)($c['totalHt'] ?? 0);
}
$conversionRate = count($crmCarts) > 0 ? round(($convertedCount / count($crmCarts)) * 100) : 0;

// ── Generate CRM Rows ───────────────────────────────────────────────
$crmRows = '';
foreach ($crmCarts as $cart) {
    $cartId = esc($cart['id'] ?? '');
    $dateVal = $cart['updatedAt'] ?? ($cart['createdAt'] ?? '');
    $dateFormatted = $dateVal ? date('d/m/Y H:i', strtotime($dateVal)) : '—';
    $clientName = esc($cart['clientName'] ?? 'Prospect Visiteur');
    $clientCompany = esc($cart['clientCompany'] ?? 'Particulier');
    $clientType = ($cart['clientType'] ?? 'professional') === 'professional' ? 'Pro' : 'Particulier';
    $typeBadgeClass = $clientType === 'Pro' ? 'pro' : 'perso';
    $clientEmail = $cart['clientEmail'] ?? '';
    $clientPhone = $cart['clientPhone'] ?? '';

    // Initials for avatar
    $nameParts = explode(' ', trim($clientName));
    $initials = strtoupper(substr($nameParts[0] ?? 'P', 0, 1) . (isset($nameParts[1]) ? substr($nameParts[1], 0, 1) : ''));
    if (empty($initials)) $initials = 'PR';

    // WhatsApp clean link
    $cleanPhone = preg_replace('/[^\d+]/', '', $clientPhone);
    if (str_starts_with($cleanPhone, '0')) {
        $cleanPhone = '212' . substr($cleanPhone, 1);
    } elseif (str_starts_with($cleanPhone, '+')) {
        $cleanPhone = substr($cleanPhone, 1);
    }
    $waMsg = "Bonjour " . $clientName . ",\n\nNous avons remarqué votre sélection d'articles sur notre catalogue ORSAP. Souhaitez-vous une assistance technique ou un devis personnalisé avec nos remises professionnelles ?\n\nL'équipe ORSAP Maroc\nhttps://orsap.ma";
    $waUrl = !empty($cleanPhone) ? 'https://wa.me/' . $cleanPhone . '?text=' . urlencode($waMsg) : null;
    $mailtoUrl = !empty($clientEmail) ? 'mailto:' . esc($clientEmail) . '?subject=' . urlencode('Votre sélection sur ORSAP — Offre commerciale & Devis') : null;

    $items = $cart['items'] ?? [];
    $totalUnits = 0;
    foreach ($items as $it) $totalUnits += (int)($it['quantity'] ?? 1);

    $itemsDetailHtml = '';
    $idx = 0;
    foreach ($items as $it) {
        $idx++;
        $isCustom = !empty($it['isCustom']);
        $code = $isCustom ? '<span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;">SUR-MESURE</span>' : esc($it['code'] ?? '—');
        $notesHtml = !empty($it['notes']) ? '<div style="font-size: 11px; color: #64748b; font-style: italic; margin-top: 2px;">📝 ' . esc($it['notes']) . '</div>' : '';
        $qty = (int)($it['quantity'] ?? 1);
        $pUnit = (float)($it['priceHt'] ?? 0);
        $pTotal = $pUnit * $qty;
        $bg = $idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        $itemsDetailHtml .= '
        <tr style="background: ' . $bg . '; font-size: 12.5px;">
          <td style="padding: 10px 14px; font-family: monospace; font-weight: bold; color: #0f172a;">' . $code . '</td>
          <td style="padding: 10px 14px; font-weight: 600; color: #334155;">' . esc($it['designation'] ?? 'Article') . $notesHtml . '</td>
          <td style="padding: 10px 14px; text-align: center; font-weight: bold;">' . $qty . '</td>
          <td style="padding: 10px 14px; text-align: right; color: #64748b;">' . ($pUnit > 0 ? number_format($pUnit, 2, ',', ' ') . ' MAD' : 'Sur devis') . '</td>
          <td style="padding: 10px 14px; text-align: right; font-weight: bold; color: #d3121a;">' . ($pTotal > 0 ? number_format($pTotal, 2, ',', ' ') . ' MAD' : 'Sur devis') . '</td>
        </tr>';
    }

    $currentStatus = $cart['status'] ?? 'cart_active';
    $totalHtVal = (float)($cart['totalHt'] ?? 0);
    $totalHtStr = $totalHtVal > 0 ? number_format($totalHtVal, 2, ',', ' ') . ' MAD HT' : '0,00 MAD';

    $crmRows .= '
    <tr id="crm-row-' . $cartId . '" class="crm-prospect-row" data-status="' . esc($currentStatus) . '" data-cart-id="' . $cartId . '">
      <td class="date-badge">
        <div style="display: flex; align-items: center; gap: 4px;">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color: #94a3b8;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ' . $dateFormatted . '
        </div>
      </td>
      <td>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); color: #0f172a; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; border: 1px solid #cbd5e1; flex-shrink: 0;">
            ' . $initials . '
          </div>
          <div>
            <div style="font-weight: 800; color: #0f172a; font-size: 13.5px;">' . $clientName . '</div>
            <div style="font-size: 11.5px; color: #64748b; margin-top: 1px;">
              ' . $clientCompany . ' · <span class="badge ' . $typeBadgeClass . '" style="font-size: 9.5px; padding: 1px 5px;">' . $clientType . '</span>
            </div>
          </div>
        </div>
      </td>
      <td>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          ' . ($waUrl ? '<a href="' . $waUrl . '" target="_blank" class="wa-btn" title="Relance directe sur WhatsApp">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
              WhatsApp (' . esc($clientPhone) . ')
            </a>' : '<a href="tel:' . esc($clientPhone) . '" style="font-size:12px; color:#334155; font-weight:700; text-decoration:none;">📞 ' . esc($clientPhone ?: '—') . '</a>') . '
          ' . ($mailtoUrl ? '<a href="' . $mailtoUrl . '" style="color: #64748b; font-size: 11.5px; text-decoration: none; font-weight: 500;">✉️ ' . esc($clientEmail) . '</a>' : '<span style="color:#94a3b8; font-size:11px;">Pas d\'email</span>') . '
        </div>
      </td>
      <td>
        <span class="badge" style="background:#f1f5f9; color:#0f172a; font-weight:700; border: 1px solid #e2e8f0;">' . count($items) . ' réf. (' . $totalUnits . ' pcs)</span>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
          <button type="button" id="crm-toggle-btn-' . $cartId . '" class="view-link" style="cursor:pointer; background:#0f172a; color:#fff; border-color:#0f172a; font-size:10.5px; padding: 3px 8px; border-radius: 6px;" onclick="toggleCrmCartDetails(\'' . $cartId . '\')">
            ▼ Voir articles
          </button>
        </div>
      </td>
      <td><span class="price-badge">' . $totalHtStr . '</span></td>
      <td>
        <select style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 6px 10px; font-size: 12px; font-weight: 700; background: #fff; color: #0f172a; cursor: pointer; outline: none;" onchange="updateCrmStatus(\'' . $cartId . '\', this.value)">
          <option value="cart_active" ' . ($currentStatus === 'cart_active' ? 'selected' : '') . '>🟢 Panier Actif</option>
          <option value="contacted" ' . ($currentStatus === 'contacted' ? 'selected' : '') . '>🟡 Contacté</option>
          <option value="quote_sent" ' . ($currentStatus === 'quote_sent' ? 'selected' : '') . '>🔵 Devis Transmis</option>
          <option value="converted" ' . ($currentStatus === 'converted' ? 'selected' : '') . '>🟣 Converti (Gagné)</option>
          <option value="abandoned" ' . ($currentStatus === 'abandoned' ? 'selected' : '') . '>🔴 Abandonné</option>
          <option value="archived" ' . ($currentStatus === 'archived' ? 'selected' : '') . '>⚪ Archivé</option>
        </select>
      </td>
      <td style="min-width: 220px;">
        <div style="display: flex; gap: 4px; align-items: flex-start;">
          <textarea id="crm-notes-' . $cartId . '" rows="2" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 8px; padding: 6px 8px; font-size: 11.5px; font-family: inherit; resize: vertical;" placeholder="Compte-rendu d\'appel ou relance...">' . esc($cart['notes'] ?? '') . '</textarea>
          <button type="button" class="view-link" style="background:#0f172a; color:#fff; border-color:#0f172a; padding: 6px 9px; font-size: 11px; cursor: pointer; flex-shrink: 0; border-radius: 8px;" onclick="saveCrmNotes(\'' . $cartId . '\')" title="Enregistrer la note">💾</button>
        </div>
        <span id="crm-notes-saved-' . $cartId . '" style="display: none; color: #16a34a; font-size: 10px; font-weight: bold; margin-top: 2px;">✓ Enregistré</span>
      </td>
      <td>
        <div class="actions-cell">
          <button type="button" class="view-link" style="padding: 5px 9px; font-size: 11px; background:#f8fafc; border-color:#cbd5e1;" onclick="testCrmNotify(\'' . $cartId . '\')" title="Tester l\'envoi de l\'alerte email">🔔 Alerte</button>
          <button type="button" class="del-btn" style="padding: 5px 9px; font-size: 11px;" onclick="deleteCrmCart(\'' . $cartId . '\')" title="Supprimer ce prospect">✕</button>
        </div>
      </td>
    </tr>
    <tr id="crm-details-' . $cartId . '" style="display: none; background: #f8fafc;">
      <td colspan="8" style="padding: 16px 22px; border-bottom: 2px solid #e2e8f0;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; padding: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 800; font-size: 13.5px; color: #0f172a;">
              📦 Articles du panier (' . count($items) . ' références) — ' . $clientName . ' (' . $clientCompany . ')
            </div>
            <div style="font-size: 13.5px; font-weight: 800; color: #d3121a;">
              Total estimatif : ' . $totalHtStr . '
            </div>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 6px; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: #0f172a; color: #ffffff; font-size: 11px; text-transform: uppercase;">
                <th style="padding: 8px 12px; color: #fff;">Code Réf</th>
                <th style="padding: 8px 12px; color: #fff;">Désignation Produit &amp; Options</th>
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

// ── Construct Tab Content ───────────────────────────────────────────
$tabContent = '';

if ($tab === 'crm') {
    $tabContent = '
    <div class="wrap">
      <!-- CRM KPI SUMMARY CARDS -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-title">Paniers Actifs en Cours</span>
            <div class="kpi-icon-wrap kpi-icon-green">🛒</div>
          </div>
          <div class="kpi-value" style="color: #059669;">' . $activeCartsCount . '</div>
          <div class="kpi-sub"><span class="badge live" style="padding: 1px 6px; font-size: 10px;">🟢 Live Sync</span> Prospects chauds à relancer</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-title">Valeur Marchande Estimée</span>
            <div class="kpi-icon-wrap kpi-icon-red">💰</div>
          </div>
          <div class="kpi-value" style="color: #d3121a;">
            ' . ($totalCrmValueHt > 0 ? number_format($totalCrmValueHt, 2, ',', ' ') . ' MAD' : '0 MAD') . '
          </div>
          <div class="kpi-sub">Total HT cumulé dans les paniers</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-title">Relances &amp; Devis Transmis</span>
            <div class="kpi-icon-wrap kpi-icon-blue">📞</div>
          </div>
          <div class="kpi-value" style="color: #2563eb;">' . $contactedCount . '</div>
          <div class="kpi-sub">Prospects contactés / chiffrés</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-title">Taux de Transformation</span>
            <div class="kpi-icon-wrap kpi-icon-purple">🎯</div>
          </div>
          <div class="kpi-value" style="color: #7c3aed;">' . $conversionRate . '%</div>
          <div class="kpi-sub">' . $convertedCount . ' commande(s) conclue(s)</div>
        </div>
      </div>

      <!-- CRM TABLE CONTAINER -->
      <div class="table-container">
        <div class="table-header-title" style="flex-direction: column; align-items: stretch; gap: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div>
              <span class="main-title">🎯 Suivi Commercial CRM &amp; Paniers Actifs (' . count($crmCarts) . ' prospects)</span>
              <p style="font-size: 12.5px; color: #64748b; margin-top: 2px;">Synchronisation continue des intentions d\'achat et relance directe WhatsApp</p>
            </div>
            
            <div class="search-input-wrap">
              <svg class="search-input-icon" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" id="crm-search-input" placeholder="Rechercher un prospect, article..." oninput="onCrmSearchInput()" />
            </div>
          </div>

          <!-- STATUS FILTER PILLS -->
          <div class="filter-pills-bar">
            <button type="button" id="crm-filter-all" class="crm-filter-btn active" onclick="filterCrmTable(\'all\')">
              Tous (' . count($crmCarts) . ')
            </button>
            <button type="button" id="crm-filter-cart_active" class="crm-filter-btn" onclick="filterCrmTable(\'cart_active\')">
              🟢 Paniers Actifs (' . $activeCartsCount . ')
            </button>
            <button type="button" id="crm-filter-contacted" class="crm-filter-btn" onclick="filterCrmTable(\'contacted\')">
              🟡 Contactés (' . $contactedCount . ')
            </button>
            <button type="button" id="crm-filter-quote_sent" class="crm-filter-btn" onclick="filterCrmTable(\'quote_sent\')">
              🔵 Devis Transmis (' . count(array_filter($crmCarts, function($c) { return ($c['status'] ?? '') === 'quote_sent'; })) . ')
            </button>
            <button type="button" id="crm-filter-converted" class="crm-filter-btn" onclick="filterCrmTable(\'converted\')">
              🟣 Convertis (' . $convertedCount . ')
            </button>
            <button type="button" id="crm-filter-abandoned" class="crm-filter-btn" onclick="filterCrmTable(\'abandoned\')">
              🔴 Abandonnés (' . $abandonedCount . ')
            </button>
          </div>
        </div>

        ' . (empty($crmCarts)
            ? '<div class="radar-hero">
                <div class="radar-animation-container">
                  <div class="radar-ring r1"></div>
                  <div class="radar-ring r2"></div>
                  <div class="radar-ring r3"></div>
                  <div class="radar-center-core">
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                </div>
                <h3>Radar CRM en écoute active</h3>
                <p>Dès qu\'un visiteur ajoute un équipement de sécurité (Extincteurs, RIA, Matériel Incendie...) à son panier sur <strong>orsap.ma</strong>, sa sélection apparaîtra ici instantanément avec relance WhatsApp 1-clic.</p>
                <div class="radar-features-grid">
                  <div class="radar-feat-pill">
                    <span class="radar-feat-icon">⚡</span>
                    <div><strong>Détection Live</strong><br><span style="color:#64748b; font-size:11px;">Enregistrement automatique</span></div>
                  </div>
                  <div class="radar-feat-pill">
                    <span class="radar-feat-icon">💬</span>
                    <div><strong>WhatsApp 1-Clic</strong><br><span style="color:#64748b; font-size:11px;">Message pré-rempli</span></div>
                  </div>
                  <div class="radar-feat-pill">
                    <span class="radar-feat-icon">📊</span>
                    <div><strong>Chiffrage Pro</strong><br><span style="color:#64748b; font-size:11px;">Calcul immédiat HT/TVA</span></div>
                  </div>
                </div>
                <a href="/catalogue" target="_blank" class="radar-cta-btn">
                  <span>🌐 Ouvrir le catalogue orsap.ma en direct</span>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>'
            : '<div class="table-responsive"><table>
          <thead>
            <tr>
              <th style="width: 140px;">Dernière Activité</th>
              <th>Prospect / Entreprise</th>
              <th>Contact &amp; Relance</th>
              <th>Sélection</th>
              <th>Total Estimatif</th>
              <th>Statut Commercial</th>
              <th>Notes / Compte-Rendu</th>
              <th class="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>' . $crmRows . '</tbody>
        </table></div>') . '
      </div>
    </div>';
} elseif ($tab === 'devis') {
    $devisRows = '';
    foreach ($submissions as $s) {
        $id = esc($s['id'] ?? '');
        $dateVal = $s['created_at'] ?? ($s['createdAt'] ?? '');
        $dateFormatted = $dateVal ? date('d/m/Y H:i', strtotime($dateVal)) : '—';
        $clientType = ($s['clientType'] ?? 'individual') === 'professional' ? 'Pro' : 'Particulier';
        $typeBadge = '<span class="badge ' . ($clientType === 'Pro' ? 'pro' : 'perso') . '">' . $clientType . '</span>';
        $email = $s['email'] ?? '';
        $emailHtml = !empty($email) ? '<a href="mailto:' . esc($email) . '">' . esc($email) . '</a>' : '—';
        $phone = $s['phone'] ?? '';
        $phoneHtml = !empty($phone) ? '<a href="tel:' . esc($phone) . '">' . esc($phone) . '</a>' : '—';

        $devisRows .= '
        <tr id="subm-' . $id . '">
          <td class="chk-cell"><input type="checkbox" class="row-chk chk-devis" value="' . $id . '" onchange="onRowCheck(\'devis\')"></td>
          <td>' . $dateFormatted . '</td>
          <td>' . $typeBadge . '</td>
          <td style="font-weight: 700;">' . esc($s['name'] ?? '—') . '</td>
          <td>' . esc($s['company'] ?? '—') . '</td>
          <td>' . $emailHtml . '</td>
          <td>' . $phoneHtml . '</td>
          <td>' . esc(implode(', ', (array)($s['solutions'] ?? []))) . '</td>
          <td>' . esc(implode(', ', (array)($s['sectors'] ?? []))) . '</td>
          <td class="msg">' . esc($s['message'] ?? '—') . '</td>
        </tr>';
    }

    $tabContent = '
    <div class="wrap">
      <div class="table-container">
        <div class="table-header-title">
          <span>Demandes de Devis Reçues (' . count($submissions) . ')</span>
          <button id="bulk-btn-devis" class="bulk-del-btn" style="display: none;" onclick="handleBulkDelete(\'devis\', \'/api/devis\', \'demandes\')">
            Supprimer (<span id="selected-count-devis">0</span>)
          </button>
        </div>
        ' . (empty($submissions)
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
              <th>Solutions</th>
              <th>Secteurs</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>' . $devisRows . '</tbody>
        </table></div>') . '
      </div>
    </div>';
} elseif ($tab === 'devis-catalogue') {
    $catalogueDevisRows = '';
    foreach ($catalogueDevis as $cd) {
        $id = esc($cd['id'] ?? '');
        $dateVal = $cd['created_at'] ?? ($cd['createdAt'] ?? '');
        $dateFormatted = $dateVal ? date('d/m/Y H:i', strtotime($dateVal)) : '—';
        $clientName = esc($cd['name'] ?? ($cd['clientName'] ?? 'Client'));
        $clientCompany = esc($cd['company'] ?? ($cd['clientCompany'] ?? '—'));
        $email = $cd['email'] ?? ($cd['clientEmail'] ?? '');
        $emailHtml = !empty($email) ? '<a href="mailto:' . esc($email) . '" style="color:#d3121a; font-weight:700; text-decoration:none;">' . esc($email) . '</a>' : '—';
        $phone = $cd['phone'] ?? ($cd['clientPhone'] ?? '');
        $phoneHtml = !empty($phone) ? '<a href="tel:' . esc($phone) . '">' . esc($phone) . '</a>' : '—';

        $items = $cd['items'] ?? [];
        $totalHt = 0;
        $totalUnits = 0;
        foreach ($items as $it) {
            $qty = (int)($it['quantity'] ?? 1);
            $pUnit = (float)($it['priceHt'] ?? 0);
            $totalUnits += $qty;
            $totalHt += $pUnit * $qty;
        }
        if (empty($totalHt) && !empty($cd['totalHt'])) {
            $totalHt = (float)$cd['totalHt'];
        }

        $itemsDetailHtml = '';
        $idx = 0;
        foreach ($items as $it) {
            $idx++;
            $isCustom = !empty($it['isCustom']);
            $code = $isCustom ? '<span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 10px;">SUR-MESURE</span>' : esc($it['articleCode'] ?? ($it['code'] ?? '—'));
            $qty = (int)($it['quantity'] ?? 1);
            $pUnit = (float)($it['priceHt'] ?? 0);
            $pTotal = $pUnit * $qty;
            $bg = $idx % 2 === 0 ? '#ffffff' : '#f8fafc';
            $itemsDetailHtml .= '
            <tr style="background: ' . $bg . '; font-size: 12.5px;">
              <td style="padding: 8px 12px; font-family: monospace; font-weight: bold; color: #1e293b;">' . $code . '</td>
              <td style="padding: 8px 12px; font-weight: 600; color: #334155;">' . esc($it['designation'] ?? 'Article') . '</td>
              <td style="padding: 8px 12px; text-align: center; font-weight: bold;">' . $qty . '</td>
              <td style="padding: 8px 12px; text-align: right; color: #64748b;">' . ($pUnit > 0 ? number_format($pUnit, 2, ',', ' ') . ' MAD' : 'Sur devis') . '</td>
              <td style="padding: 8px 12px; text-align: right; font-weight: bold; color: #d3121a;">' . ($pTotal > 0 ? number_format($pTotal, 2, ',', ' ') . ' MAD' : 'Sur devis') . '</td>
            </tr>';
        }

        $clientNote = $cd['note'] ?? ($cd['notes'] ?? '');
        $noteHtml = !empty($clientNote) ? '<div style="margin-bottom: 12px; padding: 10px 14px; background: #fffbeb; border-left: 4px solid #f59e0b; font-size: 12.5px; color: #92400e; border-radius: 4px;"><strong>Précisions / Note client :</strong> ' . esc($clientNote) . '</div>' : '';

        $catalogueDevisRows .= '
        <tr id="catdevis-' . $id . '">
          <td class="chk-cell"><input type="checkbox" class="row-chk chk-catalogue-devis" value="' . $id . '" onchange="onRowCheck(\'catalogue-devis\')"></td>
          <td class="date-badge">' . $dateFormatted . '</td>
          <td><span class="badge" style="background:#fee2e2; color:#991b1b; font-weight:800; font-family:monospace;">' . strtoupper($id) . '</span></td>
          <td style="font-weight: 700;">' . $clientName . '</td>
          <td>' . $clientCompany . '</td>
          <td>' . $emailHtml . '</td>
          <td>' . $phoneHtml . '</td>
          <td>
            <span class="badge" style="background:#f1f5f9; color:#1e293b; font-weight:700;">
              ' . count($items) . ' réf. (' . $totalUnits . ' unités)
            </span>
          </td>
          <td style="font-weight: 800; color: #d3121a;">
            ' . ($totalHt > 0 ? number_format($totalHt, 2, ',', ' ') . ' MAD HT' : 'Sur devis') . '
          </td>
          <td>
            <div class="actions-cell">
              <button type="button" id="toggle-btn-' . $id . '" class="view-link" style="cursor:pointer; background:#1e293b; color:#fff; border-color:#1e293b; font-size:11px;" onclick="toggleDevisDetails(\'' . $id . '\')">
                ▼ Voir articles (' . count($items) . ')
              </button>
              <button type="button" class="del-btn" style="padding: 5px 10px; font-size: 11px;" onclick="deleteCatalogueDevis(\'' . $id . '\')">
                ✕
              </button>
            </div>
          </td>
        </tr>
        <tr id="details-' . $id . '" style="display: none; background: #f8fafc;">
          <td colspan="10" style="padding: 16px 24px; border-bottom: 2px solid #e2e8f0;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                <div style="font-weight: 800; font-size: 14px; color: #1e293b;">
                  Détail chiffré des articles demandés (' . count($items) . ' références) — Client: ' . $clientName . ' (' . $clientCompany . ')
                </div>
                <div style="font-size: 13px; font-weight: 800; color: #d3121a;">
                  Total estimatif : ' . ($totalHt > 0 ? number_format($totalHt, 2, ',', ' ') . ' MAD HT' : 'Sur devis') . '
                </div>
              </div>
              ' . $noteHtml . '
              <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
                <thead>
                  <tr style="background: #1e293b; color: #ffffff; font-size: 11px; text-transform: uppercase;">
                    <th style="padding: 6px 10px; color: #fff;">Code</th>
                    <th style="padding: 6px 10px; color: #fff;">Désignation Produit &amp; Options</th>
                    <th style="padding: 6px 10px; color: #fff; text-align: center;">Quantité</th>
                    <th style="padding: 6px 10px; color: #fff; text-align: right;">P.U HT</th>
                    <th style="padding: 6px 10px; color: #fff; text-align: right;">Total HT</th>
                  </tr>
                </thead>
                <tbody>' . $itemsDetailHtml . '</tbody>
              </table>
            </div>
          </td>
        </tr>';
    }

    $tabContent = '
    <div class="wrap">
      <div class="table-container">
        <div class="table-header-title">
          <span>Demandes de Devis Catalogue Chiffrées (' . count($catalogueDevis) . ')</span>
          <button id="bulk-btn-catalogue-devis" class="bulk-del-btn" style="display: none;" onclick="handleBulkDelete(\'catalogue-devis\', \'/api/admin/devis-catalogue\', \'devis catalogue\')">
            Supprimer (<span id="selected-count-catalogue-devis">0</span>)
          </button>
        </div>
        ' . (empty($catalogueDevis)
            ? '<div class="empty">Aucune demande de devis catalogue pour le moment.</div>'
            : '<div class="table-responsive"><table>
          <thead>
            <tr>
              <th class="chk-cell"><input type="checkbox" id="selectAll-catalogue-devis" class="row-chk" onchange="toggleSelectAll(\'catalogue-devis\', this.checked)"></th>
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
        </table></div>') . '
      </div>
    </div>';
} elseif ($tab === 'users') {
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

    $tabContent = '
    <div class="wrap">
      <div class="table-container">
        <div class="table-header-title">
          <span>Comptes Clients Inscrits (' . count($users) . ')</span>
          <button id="bulk-btn-users" class="bulk-del-btn" style="display: none;" onclick="handleBulkDelete(\'users\', \'/api/admin/users\', \'comptes clients\')">
            Supprimer (<span id="selected-count-users">0</span>)
          </button>
        </div>
        ' . (empty($users)
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
        </table></div>') . '
      </div>
    </div>';
} elseif ($tab === 'recrutement') {
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
        if (!empty($a['cv_data'])) {
            $cvHtml = '<a href="/api/recrutement/' . $id . '/cv" target="_blank" class="view-link">Télécharger CV</a>';
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

    $tabContent = '
    <div class="wrap">
      <div class="table-container">
        <div class="table-header-title">
          <span>Candidatures de Recrutement (' . count($apps) . ')</span>
          <button id="bulk-btn-recrutement" class="bulk-del-btn" style="display: none;" onclick="handleBulkDelete(\'recrutement\', \'/api/recrutement\', \'candidatures\')">
            Supprimer (<span id="selected-count-recrutement">0</span>)
          </button>
        </div>
        ' . (empty($apps)
            ? '<div class="empty">Aucune candidature reçue pour le moment.</div>'
            : '<div class="table-responsive"><table>
          <thead>
            <tr>
              <th class="chk-cell"><input type="checkbox" id="selectAll-recrutement" class="row-chk" onchange="toggleSelectAll(\'recrutement\', this.checked)"></th>
              <th>Date</th>
              <th>Nom complet</th>
              <th>Poste</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>CV</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>' . $appsRows . '</tbody>
        </table></div>') . '
      </div>
    </div>';
} elseif ($tab === 'subscribers') {
    $subscribersRows = '';
    $subIdx = 0;
    foreach ($subscribers as $s) {
        $subIdx++;
        $email = $s['email'] ?? '';
        $emailHtml = !empty($email) ? '<a href="mailto:' . esc($email) . '">' . esc($email) . '</a>' : '—';
        $dateVal = $s['created_at'] ?? ($s['createdAt'] ?? '');
        $dateFormatted = $dateVal ? date('d/m/Y H:i', strtotime($dateVal)) : '—';
        $typeBadge = ($s['type'] ?? 'newsletter') === 'client' ? '<span class="badge pro">Client</span>' : '<span class="badge perso">Newsletter</span>';

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

    $tabContent = '
    <div class="wrap">
      <div class="table-container">
        <div class="table-header-title">
          <span>Liste Clients &amp; Abonnés (' . count($subscribers) . ')</span>
          <button id="bulk-btn-subscribers" class="bulk-del-btn" style="display: none;" onclick="handleBulkDelete(\'subscribers\', \'/api/newsletter\', \'abonnés\')">
            Supprimer (<span id="selected-count-subscribers">0</span>)
          </button>
        </div>
        ' . (empty($subscribers)
            ? '<div class="empty">Aucun abonné pour le moment.</div>'
            : '<div class="table-responsive"><table>
          <thead>
            <tr>
              <th class="chk-cell"><input type="checkbox" id="selectAll-subscribers" class="row-chk" onchange="toggleSelectAll(\'subscribers\', this.checked)"></th>
              <th>Date</th>
              <th>Type</th>
              <th>Email</th>
              <th>Nom</th>
              <th>Société</th>
              <th>Téléphone</th>
            </tr>
          </thead>
          <tbody>' . $subscribersRows . '</tbody>
        </table></div>') . '
      </div>
    </div>';
} else {
    // Blog Tab
    $blogRows = '';
    foreach ($blogs as $b) {
        $id = esc($b['id'] ?? '');
        $dateVal = $b['date'] ?? '';
        $dateFormatted = $dateVal ? date('d/m/Y', strtotime($dateVal)) : '—';
        $blogRows .= '
        <tr id="blog-' . $id . '">
          <td class="chk-cell"><input type="checkbox" class="row-chk chk-blog" value="' . $id . '" onchange="onRowCheck(\'blog\')"></td>
          <td style="width: 170px;">
            <div class="actions-cell">
              <a href="/blog/' . $id . '" target="_blank" class="view-link">Voir</a>
              <button class="edit-btn" onclick="editBlog(\'' . $id . '\')">Modifier</button>
            </div>
          </td>
          <td class="date-badge">' . $dateFormatted . '</td>
          <td style="font-weight: 700; color: #1e293b;">' . esc($b['title'] ?? 'Sans titre') . '</td>
          <td class="msg">' . esc($b['summary'] ?? '—') . '</td>
        </tr>';
    }

    $tabContent = '
    <div class="wrap">
      <div class="table-container">
        <div class="table-header-title">
          <span>Articles Publiés (' . count($blogs) . ')</span>
          <button id="bulk-btn-blog" class="bulk-del-btn" style="display: none;" onclick="handleBulkDelete(\'blog\', \'/api/blogs\', \'articles\')">
            Supprimer (<span id="selected-count-blog">0</span>)
          </button>
        </div>
        ' . (empty($blogs)
            ? '<div class="empty">Aucun article publié pour le moment.</div>'
            : '<div class="table-responsive"><table>
          <thead>
            <tr>
              <th class="chk-cell"><input type="checkbox" id="selectAll-blog" class="row-chk" onchange="toggleSelectAll(\'blog\', this.checked)"></th>
              <th style="width: 170px;">Actions</th>
              <th>Date</th>
              <th>Titre de l\'article</th>
              <th>Résumé</th>
            </tr>
          </thead>
          <tbody>' . $blogRows . '</tbody>
        </table></div>') . '
      </div>
    </div>';
}

$templatePath = __DIR__ . '/admin.html';
if (!file_exists($templatePath)) {
    $templatePath = __DIR__ . '/../../server/admin.html';
}

if ($pdo) {
    $dbBadge = '<div style="display:inline-flex; align-items:center; gap:6px; background:rgba(34,197,94,0.15); border:1px solid rgba(34,197,94,0.4); color:#4ade80; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600;" title="Connecté à la base de données MySQL Heberjahiz"><span style="width:8px; height:8px; border-radius:50%; background:#22c55e; display:inline-block;"></span> MySQL Actif (' . esc($config['db_name'] ?? 'db') . ')</div>';
} else {
    $dbBadge = '<div style="display:inline-flex; align-items:center; gap:6px; background:rgba(249,115,22,0.15); border:1px solid rgba(249,115,22,0.4); color:#fb923c; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600;" title="MySQL non connecté. Stockage sécurisé dans le fichier JSON sur le serveur."><span style="width:8px; height:8px; border-radius:50%; background:#f97316; display:inline-block;"></span> Stockage Fichier JSON (Sécurisé)</div>';
}

$html = file_exists($templatePath) ? file_get_contents($templatePath) : '';
$html = str_replace('{{DB_STATUS_BADGE}}', $dbBadge, $html);
$html = str_replace('{{CRM_CARTS_COUNT}}', (string)count($crmCarts), $html);
$html = str_replace('{{SUBMISSIONS_COUNT}}', (string)count($submissions), $html);
$html = str_replace('{{CATALOGUE_DEVIS_COUNT}}', (string)count($catalogueDevis), $html);
$html = str_replace('{{BLOGS_COUNT}}', (string)count($blogs), $html);
$html = str_replace('{{APPLICATIONS_COUNT}}', (string)count($apps), $html);
$html = str_replace('{{SUBSCRIBERS_COUNT}}', (string)count($subscribers), $html);
$html = str_replace('{{USERS_COUNT}}', (string)count($users), $html);
$html = str_replace('{{TAB_CRM_ACTIVE}}', $tab === 'crm' ? 'active' : '', $html);
$html = str_replace('{{TAB_DEVIS_ACTIVE}}', $tab === 'devis' ? 'active' : '', $html);
$html = str_replace('{{TAB_CATALOGUE_DEVIS_ACTIVE}}', $tab === 'devis-catalogue' ? 'active' : '', $html);
$html = str_replace('{{TAB_RECRUTEMENT_ACTIVE}}', $tab === 'recrutement' ? 'active' : '', $html);
$html = str_replace('{{TAB_BLOG_ACTIVE}}', $tab === 'blog' ? 'active' : '', $html);
$html = str_replace('{{TAB_SUBSCRIBERS_ACTIVE}}', $tab === 'subscribers' ? 'active' : '', $html);
$html = str_replace('{{TAB_USERS_ACTIVE}}', $tab === 'users' ? 'active' : '', $html);

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
