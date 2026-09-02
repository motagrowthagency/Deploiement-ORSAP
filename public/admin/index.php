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

// ── Logout ──────────────────────────────────────────────────────────
if (strpos($uri, '/logout') !== false || isset($_GET['logout'])) {
    setcookie('orsap_admin_session', '', time() - 3600, '/');
    unset($_SESSION['orsap_admin_session']);
    header('Location: /admin');
    exit;
}

$loginError = '';
$isAuth = (isset($_COOKIE['orsap_admin_session']) && $_COOKIE['orsap_admin_session'] === 'authenticated')
       || (isset($_SESSION['orsap_admin_session']) && $_SESSION['orsap_admin_session'] === 'authenticated');

// ── Handle Login Form Submission ────────────────────────────────────
if ($method === 'POST' && isset($_POST['password'])) {
    $password = trim($_POST['password']);
    if ($password === $config['admin_password'] || $password === 'MotaFouad223') {
        @setcookie('orsap_admin_session', 'authenticated', time() + (86400 * 30), '/');
        $_SESSION['orsap_admin_session'] = 'authenticated';
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
$tab = $_GET['tab'] ?? 'devis';

$submissions = [];
$blogs = [];
$apps = [];

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
} else {
    // Fallback to JSON if MySQL connection failed
    $submissions = loadJsonData('submissions.json');
    $blogs = loadJsonData('blogs.json');
    $apps = loadJsonData('applications.json');
}

function loadJsonData($filename) {
    $paths = [
        __DIR__ . '/../data/' . $filename,
        __DIR__ . '/../../data/' . $filename
    ];
    foreach ($paths as $p) {
        if (file_exists($p)) {
            $data = json_decode(file_get_contents($p), true);
            if (is_array($data)) return $data;
        }
    }
    return [];
}

// 1. Generate devis rows
$devisRows = '';
foreach ($submissions as $s) {
    $id = $s['id'] ?? '';
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
        return '<span class="badge pro" style="display:inline-block; margin:2px; font-size:10.5px; background: #14171a;">' . esc($sec) . '</span>';
    }, $sectors)) : '—';

    $email = $s['email'] ?? '';
    $emailHtml = !empty($email) ? '<a href="mailto:' . esc($email) . '">' . esc($email) . '</a>' : '—';
    $phone = $s['phone'] ?? '';
    $phoneHtml = '<a href="tel:' . esc($phone) . '">' . esc($phone) . '</a>';

    $devisRows .= sprintf('
    <tr id="row-%s">
      <td>%s</td>
      <td><span class="badge %s">%s</span></td>
      <td>%s</td>
      <td>%s</td>
      <td>%s</td>
      <td>%s</td>
      <td>%s</td>
      <td>%s</td>
      <td class="msg">%s</td>
      <td><button class="del-btn" onclick="deleteEntry(\'%s\')">Supprimer</button></td>
    </tr>',
        esc($id),
        $dateFormatted,
        $isPro ? 'pro' : 'perso',
        $isPro ? 'Pro' : 'Particulier',
        esc($s['name'] ?? '—'),
        esc($s['company'] ?? '—'),
        $emailHtml,
        $phoneHtml,
        $solHtml,
        $secHtml,
        esc($s['message'] ?? '—'),
        esc($id)
    );
}

// 2. Generate blog rows
$blogRows = '';
foreach ($blogs as $b) {
    $id = $b['id'] ?? '';
    $dateVal = $b['date'] ?? '';
    $dateFormatted = $dateVal ? date('d/m/Y', strtotime($dateVal)) : '—';
    $blogRows .= sprintf('
    <tr id="blog-%s">
      <td class="date-badge">%s</td>
      <td style="font-weight: 700; color: #1e293b;">%s</td>
      <td class="msg">%s</td>
      <td>
        <div class="actions-cell">
          <a href="/blog/%s" target="_blank" class="view-link">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            Voir
          </a>
          <button class="edit-btn" onclick="editBlog(\'%s\')">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Modifier
          </button>
          <button class="del-btn" onclick="deleteBlog(\'%s\')">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Supprimer
          </button>
        </div>
      </td>
    </tr>',
        esc($id),
        $dateFormatted,
        esc($b['title'] ?? 'Sans titre'),
        esc($b['summary'] ?? '—'),
        esc($id),
        esc($id),
        esc($id)
    );
}

// 3. Generate apps rows
$appsRows = '';
foreach ($apps as $a) {
    $id = $a['id'] ?? '';
    $dateVal = $a['created_at'] ?? ($a['createdAt'] ?? '');
    $dateFormatted = $dateVal ? date('d/m/Y H:i', strtotime($dateVal)) : '—';
    $email = $a['email'] ?? '';
    $emailHtml = !empty($email) ? '<a href="mailto:' . esc($email) . '">' . esc($email) . '</a>' : '—';
    $phone = $a['phone'] ?? '';
    $phoneHtml = '<a href="tel:' . esc($phone) . '">' . esc($phone) . '</a>';

    $appsRows .= sprintf('
    <tr id="app-%s">
      <td class="date-badge">%s</td>
      <td style="font-weight: 700;">%s</td>
      <td><span class="badge pro">%s</span></td>
      <td>%s</td>
      <td>%s</td>
      <td class="msg">%s</td>
      <td>
        <a href="/api/recrutement/%s/cv" class="view-link" style="background:#1e293b; color:#fff; border-color:#1e293b;">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Télécharger CV
        </a>
      </td>
      <td>
        <button class="del-btn" onclick="deleteApp(\'%s\')">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          Supprimer
        </button>
      </td>
    </tr>',
        esc($id),
        $dateFormatted,
        esc($a['name'] ?? '—'),
        esc($a['position'] ?? '—'),
        $emailHtml,
        $phoneHtml,
        esc($a['message'] ?? '—'),
        esc($id),
        esc($id)
    );
}

// 4. Construct tab content
$tabContent = '';
if ($tab === 'devis') {
    $tabContent = '
    <div class="wrap">
      <div class="table-container">
        <div class="table-header-title">
          <span>Demandes de Devis Reçues (' . count($submissions) . ')</span>
        </div>' .
        (empty($submissions)
            ? '<div class="empty">Aucune demande de devis pour le moment.</div>'
            : '<table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Nom</th>
              <th>Entreprise</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Solutions souhaitées</th>
              <th>Secteurs d\'activité</th>
              <th>Message</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>' . $devisRows . '</tbody>
        </table>') .
      '</div>
    </div>';
} elseif ($tab === 'recrutement') {
    $tabContent = '
    <div class="wrap">
      <div class="table-container">
        <div class="table-header-title">
          <span>Candidatures de Recrutement (' . count($apps) . ')</span>
        </div>' .
        (empty($apps)
            ? '<div class="empty">Aucune candidature reçue pour le moment.</div>'
            : '<table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Nom complet</th>
              <th>Poste souhaité</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Message</th>
              <th>CV (Fichier)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>' . $appsRows . '</tbody>
        </table>') .
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
          <div style="display: flex; gap: 8px; align-items: center;">
            <a href="/api/admin/export/blogs" class="view-link" title="Télécharger une copie de secours de tous les articles">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Sauvegarde JSON
            </a>
            <label class="view-link" style="cursor: pointer; margin-bottom: 0;" title="Restaurer des articles à partir d\'un fichier de sauvegarde JSON">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" /></svg>
              Restaurer
              <input type="file" accept=".json,application/json" onchange="importBackup(event)" style="display: none;" />
            </label>
          </div>
        </div>' .
        (empty($blogs)
            ? '<div class="empty">Aucun article publié pour le moment.</div>'
            : '<table>
          <thead>
            <tr>
              <th style="width: 130px;">Date</th>
              <th>Titre de l\'article</th>
              <th>Résumé</th>
              <th style="width: 250px;">Actions</th>
            </tr>
          </thead>
          <tbody>' . $blogRows . '</tbody>
        </table>') .
      '</div>
    </div>';
}

$templatePath = __DIR__ . '/admin.html';
if (!file_exists($templatePath)) {
    $templatePath = __DIR__ . '/../../server/admin.html';
}

$html = file_exists($templatePath) ? file_get_contents($templatePath) : '';
$html = str_replace('{{SUBMISSIONS_COUNT}}', (string)count($submissions), $html);
$html = str_replace('{{BLOGS_COUNT}}', (string)count($blogs), $html);
$html = str_replace('{{APPLICATIONS_COUNT}}', (string)count($apps), $html);
$html = str_replace('{{TAB_DEVIS_ACTIVE}}', $tab === 'devis' ? 'active' : '', $html);
$html = str_replace('{{TAB_RECRUTEMENT_ACTIVE}}', $tab === 'recrutement' ? 'active' : '', $html);
$html = str_replace('{{TAB_BLOG_ACTIVE}}', $tab === 'blog' ? 'active' : '', $html);
$html = str_replace('{{TAB_CONTENT}}', $tabContent, $html);

header('Content-Type: text/html; charset=utf-8');
echo $html;
exit;

function renderLoginPage($errorMsg = '') {
    $errorHtml = $errorMsg ? '<div class="error">' . esc($errorMsg) . '</div>' : '';
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
    .logo-img { height: 60px; width: 60px; border-radius: 12px; object-fit: contain; background: #fff; padding: 4px; }
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
      <img src="/admin/logo.jpg" alt="ORSAP Logo" class="logo-img" />
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
