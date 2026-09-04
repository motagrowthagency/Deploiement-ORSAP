<?php
/**
 * ORSAP - Service d'envoi d'emails de notification
 */

function sendDevisNotificationEmail(array $entry) {
    $config = require __DIR__ . '/config.php';
    $to = $config['notification_email'] ?? 'orsap@orsap.ma';
    $from = $config['from_email'] ?? 'no-reply@orsap.ma';

    $isPro = ($entry['clientType'] ?? '') === 'professional';
    $clientTypeLabel = $isPro ? 'Professionnel (Entreprise)' : 'Particulier';
    $name = htmlspecialchars($entry['name'] ?? '—', ENT_QUOTES, 'UTF-8');
    $company = htmlspecialchars($entry['company'] ?? '—', ENT_QUOTES, 'UTF-8');
    $email = htmlspecialchars($entry['email'] ?? '—', ENT_QUOTES, 'UTF-8');
    $phone = htmlspecialchars($entry['phone'] ?? '—', ENT_QUOTES, 'UTF-8');
    $message = nl2br(htmlspecialchars($entry['message'] ?? 'Aucun message particulier.', ENT_QUOTES, 'UTF-8'));
    
    $solutions = $entry['solutions'] ?? [];
    $solutionsHtml = !empty($solutions) ? implode(', ', array_map('htmlspecialchars', $solutions)) : '—';
    
    $sectors = $entry['sectors'] ?? [];
    $sectorsHtml = !empty($sectors) ? implode(', ', array_map('htmlspecialchars', $sectors)) : '—';

    $subject = "=?UTF-8?B?" . base64_encode("🔔 Nouvelle demande de devis : " . ($entry['name'] ?? 'Client') . " (" . $clientTypeLabel . ")") . "?=";

    $html = <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: #14171a; padding: 24px; text-align: center; border-bottom: 4px solid #d3121a; }
    .header h1 { color: #ffffff; font-size: 20px; margin: 0; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }
    .badge { display: inline-block; background: #d3121a; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 8px; }
    .content { padding: 28px; }
    .section-title { font-size: 14px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
    .row { display: flex; margin-bottom: 12px; font-size: 14px; }
    .label { width: 150px; font-weight: 700; color: #475569; }
    .value { flex: 1; color: #0f172a; font-weight: 600; }
    .msg-box { background: #f8fafc; border-left: 3px solid #d3121a; padding: 14px; border-radius: 4px; font-size: 13.5px; line-height: 1.6; color: #334155; margin-top: 14px; }
    .footer { background: #fafafa; padding: 18px 28px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
    .btn { display: inline-block; background: #d3121a; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 13px; text-transform: uppercase; margin-top: 18px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ORSAP Services</h1>
      <span class="badge">Nouvelle demande de devis</span>
    </div>
    <div class="content">
      <div class="section-title">Coordonnées du Contact</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
        <tr>
          <td style="padding: 6px 0; width: 140px; font-weight: bold; color: #64748b;">Type de client :</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">{$clientTypeLabel}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Nom & Prénom :</td>
          <td style="padding: 6px 0; font-weight: 700; color: #0f172a; font-size: 15px;">{$name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Entreprise :</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">{$company}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Téléphone :</td>
          <td style="padding: 6px 0; font-weight: bold; color: #d3121a;"><a href="tel:{$phone}" style="color: #d3121a; text-decoration: none;">{$phone}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Email :</td>
          <td style="padding: 6px 0;"><a href="mailto:{$email}" style="color: #2563eb; text-decoration: none;">{$email}</a></td>
        </tr>
      </table>

      <div class="section-title">Besoins exprimés</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
        <tr>
          <td style="padding: 6px 0; width: 140px; font-weight: bold; color: #64748b;">Solutions :</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">{$solutionsHtml}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Secteur d'activité :</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">{$sectorsHtml}</td>
        </tr>
      </table>

      <div class="section-title">Message / Précisions</div>
      <div class="msg-box">{$message}</div>

      <div style="text-align: center;">
        <a href="https://orsap.ma/admin" class="btn">Accéder au Panneau d'Administration</a>
      </div>
    </div>
    <div class="footer">
      Notification automatique générée par le site web ORSAP (orsap.ma).
    </div>
  </div>
</body>
</html>
HTML;

    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ORSAP Notifications <' . $from . '>',
        'Reply-To: ' . (!empty($entry['email']) ? $entry['email'] : $from),
        'X-Mailer: PHP/' . phpversion()
    ];

    @mail($to, $subject, $html, implode("\r\n", $headers));
}

function sendApplicationNotificationEmail(array $entry) {
    $config = require __DIR__ . '/config.php';
    $to = $config['notification_email'] ?? 'orsap@orsap.ma';
    $from = $config['from_email'] ?? 'no-reply@orsap.ma';

    $name = htmlspecialchars($entry['name'] ?? '—', ENT_QUOTES, 'UTF-8');
    $position = htmlspecialchars($entry['position'] ?? '—', ENT_QUOTES, 'UTF-8');
    $email = htmlspecialchars($entry['email'] ?? '—', ENT_QUOTES, 'UTF-8');
    $phone = htmlspecialchars($entry['phone'] ?? '—', ENT_QUOTES, 'UTF-8');
    $message = nl2br(htmlspecialchars($entry['message'] ?? 'Aucun message joint.', ENT_QUOTES, 'UTF-8'));
    $cvName = htmlspecialchars($entry['cvName'] ?? 'cv.pdf', ENT_QUOTES, 'UTF-8');

    $subject = "=?UTF-8?B?" . base64_encode("📄 Nouvelle Candidature : " . $name . " (" . $position . ")") . "?=";

    $html = <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: #14171a; padding: 24px; text-align: center; border-bottom: 4px solid #d3121a; }
    .header h1 { color: #ffffff; font-size: 20px; margin: 0; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }
    .badge { display: inline-block; background: #2563eb; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 8px; }
    .content { padding: 28px; }
    .section-title { font-size: 14px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
    .msg-box { background: #f8fafc; border-left: 3px solid #2563eb; padding: 14px; border-radius: 4px; font-size: 13.5px; line-height: 1.6; color: #334155; margin-top: 14px; }
    .footer { background: #fafafa; padding: 18px 28px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
    .btn { display: inline-block; background: #d3121a; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 13px; text-transform: uppercase; margin-top: 18px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ORSAP Recrutement</h1>
      <span class="badge">Nouvelle Candidature</span>
    </div>
    <div class="content">
      <div class="section-title">Informations du Candidat</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
        <tr>
          <td style="padding: 6px 0; width: 140px; font-weight: bold; color: #64748b;">Poste souhaité :</td>
          <td style="padding: 6px 0; font-weight: 700; color: #d3121a; font-size: 15px;">{$position}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Nom complet :</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">{$name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Téléphone :</td>
          <td style="padding: 6px 0; font-weight: bold;"><a href="tel:{$phone}" style="color: #0f172a; text-decoration: none;">{$phone}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Email :</td>
          <td style="padding: 6px 0;"><a href="mailto:{$email}" style="color: #2563eb; text-decoration: none;">{$email}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #64748b;">CV Joint :</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">{$cvName}</td>
        </tr>
      </table>

      <div class="section-title">Message de motivation</div>
      <div class="msg-box">{$message}</div>

      <div style="text-align: center;">
        <a href="https://orsap.ma/admin?tab=recrutement" class="btn">Consulter et Télécharger le CV</a>
      </div>
    </div>
    <div class="footer">
      Notification automatique générée par le site web ORSAP (orsap.ma).
    </div>
  </div>
</body>
</html>
HTML;

    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ORSAP Recrutement <' . $from . '>',
        'Reply-To: ' . (!empty($entry['email']) ? $entry['email'] : $from),
        'X-Mailer: PHP/' . phpversion()
    ];

    @mail($to, $subject, $html, implode("\r\n", $headers));
}

function sendSubscriberNotificationEmail(array $entry) {
    $config = require __DIR__ . '/config.php';
    $to = $config['notification_email'] ?? 'orsap@orsap.ma';
    $from = $config['from_email'] ?? 'no-reply@orsap.ma';

    $isPro = ($entry['clientType'] ?? '') === 'professional';
    $clientTypeLabel = $isPro ? 'Professionnel (Entreprise)' : 'Artisan / Particulier';
    $email = htmlspecialchars($entry['email'] ?? '—', ENT_QUOTES, 'UTF-8');
    $name = htmlspecialchars($entry['name'] ?? '—', ENT_QUOTES, 'UTF-8');
    $company = htmlspecialchars($entry['company'] ?? '—', ENT_QUOTES, 'UTF-8');
    $phone = htmlspecialchars($entry['phone'] ?? '—', ENT_QUOTES, 'UTF-8');
    $createdAt = htmlspecialchars($entry['createdAt'] ?? date('Y-m-d H:i:s'), ENT_QUOTES, 'UTF-8');

    $displayName = !empty($entry['name']) ? $entry['name'] : (!empty($entry['company']) ? $entry['company'] : $entry['email']);
    $subject = "=?UTF-8?B?" . base64_encode("🔔 Nouveau contact client (Pop-up Offres) : " . $displayName . " [" . $clientTypeLabel . "]") . "?=";

    $companyRow = $isPro ? "<tr><td style=\"padding: 8px 0; font-weight: bold; color: #64748b; width: 140px;\">Entreprise / Société :</td><td style=\"padding: 8px 0; font-weight: 600; color: #0f172a;\">{$company}</td></tr>" : "";
    $phoneRow = !empty($entry['phone']) ? "<tr><td style=\"padding: 8px 0; font-weight: bold; color: #64748b; width: 140px;\">Téléphone :</td><td style=\"padding: 8px 0; font-weight: bold; color: #d3121a;\"><a href=\"tel:{$phone}\" style=\"color: #d3121a; text-decoration: none;\">{$phone}</a></td></tr>" : "";

    $html = <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: #14171a; padding: 24px; text-align: center; border-bottom: 4px solid #d3121a; }
    .header h1 { color: #ffffff; font-size: 20px; margin: 0; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }
    .badge { display: inline-block; background: #10b981; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 8px; }
    .content { padding: 28px; }
    .section-title { font-size: 14px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
    .footer { background: #fafafa; padding: 18px 28px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
    .btn { display: inline-block; background: #d3121a; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 13px; text-transform: uppercase; margin-top: 18px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ORSAP — Inscription Client</h1>
      <span class="badge">Nouveau contact via pop-up</span>
    </div>
    <div class="content">
      <div class="section-title">Coordonnées du Client</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px 0; width: 140px; font-weight: bold; color: #64748b;">Type de client :</td>
          <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">{$clientTypeLabel}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Adresse Email :</td>
          <td style="padding: 8px 0; font-weight: 700;"><a href="mailto:{$email}" style="color: #2563eb; text-decoration: none; font-size: 15px;">{$email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Nom complet :</td>
          <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">{$name}</td>
        </tr>
        {$companyRow}
        {$phoneRow}
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Date d'inscription :</td>
          <td style="padding: 8px 0; font-weight: 600; color: #64748b;">{$createdAt}</td>
        </tr>
      </table>

      <div style="text-align: center;">
        <a href="https://orsap.ma/admin" class="btn">Consulter la liste clients (Admin)</a>
      </div>
    </div>
    <div class="footer">
      Notification automatique générée par le pop-up « Rejoindre la liste clients » sur ORSAP (orsap.ma).
    </div>
  </div>
</body>
</html>
HTML;

    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ORSAP Notifications <' . $from . '>',
        'Reply-To: ' . (!empty($entry['email']) ? $entry['email'] : $from),
        'X-Mailer: PHP/' . phpversion()
    ];

    @mail($to, $subject, $html, implode("\r\n", $headers));
}
