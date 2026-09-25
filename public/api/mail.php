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

function sendDevisCustomerConfirmationEmailPHP(array $entry, ?string $toOverride = null) {
    $config = require __DIR__ . '/config.php';
    $from = $config['from_email'] ?? 'orsap@orsap.ma';
    $to = $toOverride ?: ($entry['email'] ?? '');

    if (empty($to)) {
        return ['success' => false, 'error' => 'No recipient email'];
    }

    $isPro = ($entry['clientType'] ?? '') === 'professional';
    $clientTypeLabel = $isPro ? 'Professionnel (Entreprise)' : 'Particulier';
    $name = htmlspecialchars($entry['name'] ?? 'Madame, Monsieur', ENT_QUOTES, 'UTF-8');
    $company = htmlspecialchars($entry['company'] ?? '', ENT_QUOTES, 'UTF-8');
    $phone = htmlspecialchars($entry['phone'] ?? '—', ENT_QUOTES, 'UTF-8');
    $email = htmlspecialchars($entry['email'] ?? '—', ENT_QUOTES, 'UTF-8');
    $message = nl2br(htmlspecialchars($entry['message'] ?? 'Demande d\'information et offre tarifaire.', ENT_QUOTES, 'UTF-8'));
    $devisId = htmlspecialchars($entry['id'] ?? ('DEV-' . date('Ymd') . '-' . substr(md5(uniqid()), 0, 4)), ENT_QUOTES, 'UTF-8');
    $dateFormatted = date('d/m/Y à H:i');

    $solutions = $entry['solutions'] ?? [];
    $solutionsHtml = !empty($solutions) ? implode(', ', array_map('htmlspecialchars', $solutions)) : 'Travail en hauteur / Équipements Pro';

    $sectors = $entry['sectors'] ?? [];
    $sectorsHtml = !empty($sectors) ? implode(', ', array_map('htmlspecialchars', $sectors)) : '—';

    // WhatsApp quick contact
    $waText = rawurlencode("Bonjour, je vous contacte concernant ma demande de devis n° " . $devisId . " pour " . ($company ?: $name));
    $waUrl = "https://wa.me/212644203030?text=" . $waText;

    $subject = "=?UTF-8?B?" . base64_encode("Confirmation de réception de votre demande de devis [" . $devisId . "] — ORSAP Maroc") . "?=";

    $html = <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de demande de devis - ORSAP</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; color: #1e293b; line-height: 1.6; }
    .wrapper { width: 100%; max-width: 640px; margin: 30px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .top-bar { height: 5px; background: linear-gradient(90deg, #d3121a 0%, #b91c1c 100%); }
    .header { background-color: #14171a; padding: 32px 30px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; color: #ffffff; }
    .header .subtitle { margin: 6px 0 0 0; font-size: 12px; color: #e2e8f0; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; }
    .hero-badge { display: inline-block; background-color: #d3121a; color: #ffffff; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 16px; }
    
    .body-content { padding: 36px 32px; }
    .greeting { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
    .intro-text { font-size: 15px; color: #475569; margin-bottom: 24px; line-height: 1.6; }
    
    .card-recap { background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 5px solid #d3121a; border-radius: 8px; padding: 22px; margin-bottom: 28px; }
    .card-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    .card-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
    .card-table td { padding: 6px 0; vertical-align: top; }
    .card-label { width: 150px; font-weight: 600; color: #64748b; }
    .card-value { color: #0f172a; font-weight: 700; }
    
    .demande-box { background-color: #ffffff; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 14px 16px; margin-top: 12px; font-size: 14px; color: #1e293b; font-weight: 600; line-height: 1.5; white-space: pre-wrap; }
    
    .timeline { margin: 28px 0; background: #ffffff; border-radius: 8px; border: 1px solid #f1f5f9; padding: 20px 22px; }
    .timeline-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin-bottom: 14px; }
    .timeline-step { display: flex; align-items: flex-start; margin-bottom: 14px; font-size: 13.5px; }
    .timeline-step:last-child { margin-bottom: 0; }
    .step-icon { width: 26px; height: 26px; background-color: #fee2e2; color: #d3121a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; margin-right: 12px; flex-shrink: 0; }
    .step-text { color: #334155; }
    .step-text strong { color: #0f172a; }
    
    .cta-container { text-align: center; margin: 32px 0 20px 0; }
    .btn-wa { display: inline-block; background-color: #25d366; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 12px rgba(37,211,102,0.3); margin: 6px; }
    .btn-phone { display: inline-block; background-color: #14171a; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin: 6px; }
    
    .footer { background-color: #fafbfc; border-top: 1px solid #e2e8f0; padding: 26px 30px; text-align: center; font-size: 12px; color: #64748b; line-height: 1.7; }
    .footer-links a { color: #d3121a; text-decoration: none; font-weight: 700; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="top-bar"></div>
    <div class="header">
      <h1>ORSAP MAROC</h1>
      <div class="subtitle">Fournitures Industrielles, Quincaillerie &amp; Équipements Pro</div>
      <div><span class="hero-badge">Demande de devis enregistrée</span></div>
    </div>
    <div class="body-content">
      <div class="greeting">Bonjour {$name},</div>
      <p class="intro-text">
        Nous vous confirmons la bonne réception de votre demande de devis sur notre plateforme <strong>ORSAP Maroc</strong>. Notre équipe commerciale et nos spécialistes techniques sont d'ores et déjà mobilisés pour analyser vos spécifications techniques et vous transmettre notre meilleure proposition.
      </p>

      <div class="card-recap">
        <div class="card-title">📋 Récapitulatif de votre demande — Réf : {$devisId}</div>
        <table class="card-table">
          <tr>
            <td class="card-label">Date :</td>
            <td class="card-value">{$dateFormatted}</td>
          </tr>
          <tr>
            <td class="card-label">Entreprise :</td>
            <td class="card-value">{$company}</td>
          </tr>
          <tr>
            <td class="card-label">Interlocuteur :</td>
            <td class="card-value">{$name}</td>
          </tr>
          <tr>
            <td class="card-label">Téléphone direct :</td>
            <td class="card-value">{$phone}</td>
          </tr>
          <tr>
            <td class="card-label">Email :</td>
            <td class="card-value">{$email}</td>
          </tr>
          <tr>
            <td class="card-label">Domaine / Solution :</td>
            <td class="card-value">{$solutionsHtml}</td>
          </tr>
          <tr>
            <td class="card-label">Secteur(s) :</td>
            <td class="card-value">{$sectorsHtml}</td>
          </tr>
        </table>
        
        <div style="margin-top: 14px;">
          <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Détail de votre besoin / Spécifications :</span>
          <div class="demande-box">{$message}</div>
        </div>
      </div>

      <div style="margin: 28px 0; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 20px 22px;">
        <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin-bottom: 16px; letter-spacing: 0.05em;">⚡ Prochaines étapes de traitement de votre dossier :</div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px;">
          <tr>
            <td style="width: 34px; vertical-align: top; padding-right: 12px; padding-top: 1px;">
              <table cellpadding="0" cellspacing="0" style="width: 24px; height: 24px; background-color: #fee2e2; border-radius: 12px; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center; vertical-align: middle; color: #d3121a; font-weight: 900; font-size: 12px; line-height: 24px; width: 24px; height: 24px; padding: 0;">1</td>
                </tr>
              </table>
            </td>
            <td style="vertical-align: top; font-size: 13.5px; color: #334155; line-height: 1.5;">
              <strong style="color: #0f172a;">Étude technique &amp; dimensionnement</strong> : Nos experts vérifient la conformité aux normes (sécurité, charge utile, hauteur de travail) et les accessoires recommandés.
            </td>
          </tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px;">
          <tr>
            <td style="width: 34px; vertical-align: top; padding-right: 12px; padding-top: 1px;">
              <table cellpadding="0" cellspacing="0" style="width: 24px; height: 24px; background-color: #fee2e2; border-radius: 12px; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center; vertical-align: middle; color: #d3121a; font-weight: 900; font-size: 12px; line-height: 24px; width: 24px; height: 24px; padding: 0;">2</td>
                </tr>
              </table>
            </td>
            <td style="vertical-align: top; font-size: 13.5px; color: #334155; line-height: 1.5;">
              <strong style="color: #0f172a;">Offre chiffrée sous 24h</strong> : Vous recevrez par email et WhatsApp notre devis pro formalisé avec nos meilleurs tarifs préférentiels.
            </td>
          </tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 0;">
          <tr>
            <td style="width: 34px; vertical-align: top; padding-right: 12px; padding-top: 1px;">
              <table cellpadding="0" cellspacing="0" style="width: 24px; height: 24px; background-color: #fee2e2; border-radius: 12px; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center; vertical-align: middle; color: #d3121a; font-weight: 900; font-size: 12px; line-height: 24px; width: 24px; height: 24px; padding: 0;">3</td>
                </tr>
              </table>
            </td>
            <td style="vertical-align: top; font-size: 13.5px; color: #334155; line-height: 1.5;">
              <strong style="color: #0f172a;">Expédition rapide</strong> : Livraison sécurisée partout au Maroc et assistance à la mise en service.
            </td>
          </tr>
        </table>
      </div>

      <div style="background-color: #f1f5f9; border-radius: 8px; padding: 18px; text-align: center; margin-top: 24px;">
        <p style="margin: 0 0 12px 0; font-size: 13.5px; font-weight: 700; color: #1e293b;">
          Besoin d'une réponse urgente ou d'un conseil immédiat ?
        </p>
        <div>
          <a href="{$waUrl}" class="btn-wa" target="_blank">💬 Échanger sur WhatsApp</a>
          <a href="tel:+212644203030" class="btn-phone">📞 +212 6 44 20 30 30</a>
        </div>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 8px 0; font-weight: 700; color: #14171a;">ORSAP MAROC — Importateur &amp; Distributeur Équipements Professionnels</p>
      <p style="margin: 0 0 12px 0;">Casablanca, Maroc · Service Commercial : <a href="tel:+212644203030" style="color:#d3121a; text-decoration:none;">+212 6 44 20 30 30</a> · <a href="mailto:orsap@orsap.ma" style="color:#d3121a; text-decoration:none;">orsap@orsap.ma</a></p>
      <div class="footer-links">
        <a href="https://orsap.ma" target="_blank">Visiter notre catalogue en ligne : orsap.ma</a>
      </div>
    </div>
  </div>
</body>
</html>
HTML;

    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ORSAP Maroc <' . $from . '>',
        'Reply-To: ' . $from,
        'X-Mailer: PHP/' . phpversion()
    ];

    $sent = @mail($to, $subject, $html, implode("\r\n", $headers));
    return [
        'success' => $sent,
        'to' => $to,
        'subject' => $subject,
        'devisId' => $devisId,
        'html' => $html
    ];
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

function sendVerificationEmailPHP($to, $name, $token, $code) {
    $config = require __DIR__ . '/config.php';
    $from = $config['from_email'] ?? 'orsap@orsap.ma';
    $appUrl = getenv('APP_URL') ?: 'https://orsap.ma';
    $verifyUrl = rtrim($appUrl, '/') . '/espace-client/verify?token=' . urlencode($token);

    $safeName = htmlspecialchars($name ?: 'Cher client', ENT_QUOTES, 'UTF-8');
    $safeCode = htmlspecialchars($code, ENT_QUOTES, 'UTF-8');

    $subject = "=?UTF-8?B?" . base64_encode("Activez votre compte — ORSAP Espace Client") . "?=";

    $html = <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f2f0ec; margin: 0; padding: 0; color: #14171a; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border-top: 5px solid #d3121a; }
    .header { background: #14171a; padding: 25px 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.05em; }
    .header p { color: #d3121a; font-size: 13px; font-weight: 700; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 0.1em; }
    .content { padding: 35px 30px; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #14171a; }
    .btn-container { text-align: center; margin: 30px 0; }
    .btn { display: inline-block; background-color: #d3121a; color: #ffffff !important; padding: 14px 32px; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
    .code-box { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0; }
    .code-box .label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
    .code-box .code { font-size: 28px; font-weight: 900; letter-spacing: 6px; color: #14171a; font-family: monospace; }
    .footer { background: #fafbfc; border-top: 1px solid #e2e8f0; padding: 20px 30px; text-align: center; font-size: 12px; color: #64748b; }
    .footer a { color: #d3121a; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ORSAP</h1>
      <p>Espace Client &amp; Services Industriels</p>
    </div>
    <div class="content">
      <div class="greeting">Bonjour {$safeName},</div>
      <p>Nous vous remercions pour votre inscription à l'<strong>Espace Client ORSAP</strong>.</p>
      <p>Pour finaliser la création de votre compte et accéder à vos demandes de devis, fiches techniques et services personnalisés, veuillez valider votre adresse email :</p>
      
      <div class="btn-container">
        <a href="{$verifyUrl}" class="btn" target="_blank">Activer mon compte</a>
      </div>

      <p style="font-size: 13px; color: #64748b; text-align: center;">Ou utilisez votre code de validation à 6 chiffres :</p>
      
      <div class="code-box">
        <div class="label">Code de confirmation</div>
        <div class="code">{$safeCode}</div>
      </div>

      <p style="font-size: 13px; color: #94a3b8; margin-top: 25px;">
        Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité. Ce lien expire dans 24 heures.
      </p>
    </div>
    <div class="footer">
      <p>ORSAP — Import, distribution &amp; services aux industries</p>
      <p>Casablanca, Maroc · <a href="tel:+212644203030">+212 6 44 20 30 30</a> · <a href="mailto:orsap@orsap.ma">orsap@orsap.ma</a></p>
    </div>
  </div>
</body>
</html>
HTML;

    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ORSAP Maroc <' . $from . '>',
        'Reply-To: ' . $from,
        'X-Mailer: PHP/' . phpversion()
    ];

    @mail($to, $subject, $html, implode("\r\n", $headers));
    return ['success' => true, 'previewUrl' => $verifyUrl];
}

function sendPasswordResetEmailPHP($to, $name, $token) {
    $config = require __DIR__ . '/config.php';
    $from = $config['from_email'] ?? 'orsap@orsap.ma';
    $appUrl = getenv('APP_URL') ?: 'https://orsap.ma';
    $resetUrl = rtrim($appUrl, '/') . '/espace-client?resetToken=' . urlencode($token);

    $safeName = htmlspecialchars($name ?: 'Cher client', ENT_QUOTES, 'UTF-8');

    $subject = "=?UTF-8?B?" . base64_encode("Réinitialisation de votre mot de passe — ORSAP") . "?=";

    $html = <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f2f0ec; margin: 0; padding: 0; color: #14171a; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border-top: 5px solid #d3121a; }
    .header { background: #14171a; padding: 25px 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.05em; }
    .content { padding: 35px 30px; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #14171a; }
    .btn-container { text-align: center; margin: 30px 0; }
    .btn { display: inline-block; background-color: #d3121a; color: #ffffff !important; padding: 14px 32px; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 6px; text-transform: uppercase; }
    .footer { background: #fafbfc; border-top: 1px solid #e2e8f0; padding: 20px 30px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ORSAP</h1>
    </div>
    <div class="content">
      <div class="greeting">Bonjour {$safeName},</div>
      <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre Espace Client ORSAP.</p>
      <div class="btn-container">
        <a href="{$resetUrl}" class="btn" target="_blank">Réinitialiser mon mot de passe</a>
      </div>
      <p style="font-size: 13px; color: #94a3b8;">Ce lien expirera dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
    </div>
    <div class="footer">
      <p>ORSAP — Import, distribution &amp; services aux industries</p>
    </div>
  </div>
</body>
</html>
HTML;

    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ORSAP Maroc <' . $from . '>',
        'Reply-To: ' . $from,
        'X-Mailer: PHP/' . phpversion()
    ];

    @mail($to, $subject, $html, implode("\r\n", $headers));
    return ['success' => true];
}

function sendCatalogueDevisEmailsPHP(array $data) {
    $config = require __DIR__ . '/config.php';
    $toTeam = $config['notification_email'] ?? 'orsap@orsap.ma';
    $from = $config['from_email'] ?? 'no-reply@orsap.ma';

    $devisId = htmlspecialchars($data['devisId'] ?? '', ENT_QUOTES, 'UTF-8');
    $user = $data['user'] ?? [];
    $name = htmlspecialchars($user['name'] ?? 'Client', ENT_QUOTES, 'UTF-8');
    $email = htmlspecialchars($user['email'] ?? '', ENT_QUOTES, 'UTF-8');
    $phone = htmlspecialchars($user['phone'] ?? '', ENT_QUOTES, 'UTF-8');
    $company = htmlspecialchars($user['company'] ?? '', ENT_QUOTES, 'UTF-8');
    $note = nl2br(htmlspecialchars($data['note'] ?? '', ENT_QUOTES, 'UTF-8'));
    $items = $data['items'] ?? [];

    $totalHt = 0.0;
    $totalTtc = 0.0;
    $rowsHtml = '';
    foreach ($items as $idx => $it) {
        $pht = (float)($it['priceHt'] ?? 0);
        $pttc = (float)($it['priceTtc'] ?? 0);
        $qty = max(1, (int)($it['quantity'] ?? 1));
        $lineHt = $pht * $qty;
        $totalHt += $lineHt;
        $totalTtc += $pttc * $qty;

        $bg = ($idx % 2 === 0) ? '#ffffff' : '#f8fafc';
        $code = !empty($it['isCustom'])
            ? '<span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 10px;">SUR-MESURE</span>'
            : htmlspecialchars($it['articleCode'] ?? '', ENT_QUOTES, 'UTF-8');
        $desig = htmlspecialchars($it['designation'] ?? '', ENT_QUOTES, 'UTF-8');
        $unitDisplay = $pht > 0 ? number_format($pht, 2, ',', ' ') . ' MAD' : 'Sur devis';
        $lineDisplay = $pht > 0 ? number_format($lineHt, 2, ',', ' ') . ' MAD' : 'Sur devis';

        $rowsHtml .= "
        <tr style=\"border-bottom: 1px solid #e2e8f0; background: {$bg};\">
          <td style=\"padding: 10px; font-family: monospace; font-size: 12px; font-weight: bold;\">{$code}</td>
          <td style=\"padding: 10px; font-size: 13px; color: #334155;\">{$desig}</td>
          <td style=\"padding: 10px; text-align: center; font-weight: bold; font-size: 13px;\">{$qty}</td>
          <td style=\"padding: 10px; text-align: right; font-size: 13px; font-weight: 600;\">{$unitDisplay}</td>
          <td style=\"padding: 10px; text-align: right; font-size: 13px; font-weight: bold; color: #d3121a;\">{$lineDisplay}</td>
        </tr>";
    }

    $tvaAmount = $totalTtc - $totalHt;
    $totalHtFormatted = number_format($totalHt, 2, ',', ' ') . ' MAD';
    $tvaFormatted = number_format($tvaAmount, 2, ',', ' ') . ' MAD';
    $totalTtcFormatted = number_format($totalTtc, 2, ',', ' ') . ' MAD';

    $noteBlock = !empty($note) ? "<div style=\"background: #f8fafc; border-left: 4px solid #d3121a; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #475569;\"><strong>Vos précisions :</strong><br>{$note}</div>" : "";

    $html = <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f2f0ec; margin: 0; padding: 0; color: #14171a; }
    .container { max-width: 680px; margin: 30px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border-top: 5px solid #d3121a; }
    .header { background: #14171a; padding: 25px 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.05em; }
    .content { padding: 30px; line-height: 1.6; }
    .ref-badge { display: inline-block; background: #fee2e2; color: #991b1b; padding: 6px 14px; border-radius: 9999px; font-weight: 800; font-size: 13px; margin: 10px 0 20px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    th { background: #14171a; color: #ffffff; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; }
    .totals { margin-top: 20px; border-top: 2px solid #14171a; padding-top: 15px; }
    .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
    .total-main { font-size: 16px; font-weight: 900; color: #d3121a; border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-top: 4px; }
    .footer { background: #fafbfc; border-top: 1px solid #e2e8f0; padding: 20px 30px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ORSAP</h1>
      <p style="color: #d3121a; font-size: 13px; font-weight: bold; margin: 5px 0 0; text-transform: uppercase;">Demande de Devis Produits</p>
    </div>
    <div class="content">
      <div style="font-size: 18px; font-weight: bold; color: #14171a;">Bonjour {$name},</div>
      <p>Votre demande de devis a bien été enregistrée sous la référence ci-dessous :</p>
      
      <div>Référence : <span class="ref-badge">{$devisId}</span></div>

      <table>
        <thead>
          <tr>
            <th>Réf.</th>
            <th>Désignation</th>
            <th style="text-align: center;">Qté</th>
            <th style="text-align: right;">P.U HT</th>
            <th style="text-align: right;">Total HT</th>
          </tr>
        </thead>
        <tbody>
          {$rowsHtml}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row"><span>Total HT estimé :</span><strong>{$totalHtFormatted}</strong></div>
        <div class="total-row"><span>TVA (20%) :</span><strong>{$tvaFormatted}</strong></div>
        <div class="total-row total-main"><span>TOTAL ESTIMÉ TTC :</span><span>{$totalTtcFormatted}</span></div>
      </div>

      {$noteBlock}

      <p style="margin-top: 25px; font-size: 13px; color: #475569;">
        Un conseiller commercial ORSAP vous contactera rapidement pour vous accompagner dans votre commande.
      </p>
    </div>
    <div class="footer">
      <p>ORSAP — Fournitures Industrielles, Quincaillerie &amp; Équipements Pro</p>
      <p>Casablanca, Maroc · <a href="tel:+212644203030" style="color: #d3121a;">+212 6 44 20 30 30</a> · <a href="mailto:orsap@orsap.ma" style="color: #d3121a;">orsap@orsap.ma</a></p>
    </div>
  </div>
</body>
</html>
HTML;

    // Send to client
    if (!empty($email)) {
        $headersClient = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=UTF-8',
            'From: ORSAP Maroc <' . $from . '>',
            'Reply-To: ' . $toTeam,
            'X-Mailer: PHP/' . phpversion()
        ];
        $subjClient = "=?UTF-8?B?" . base64_encode("Confirmation de votre demande de devis [{$devisId}] — ORSAP") . "?=";
        @mail($email, $subjClient, $html, implode("\r\n", $headersClient));
    }

    // Send to team
    $headersTeam = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ORSAP Notifications <' . $from . '>',
        'Reply-To: ' . ($email ?: $from),
        'X-Mailer: PHP/' . phpversion()
    ];
    $subjTeam = "=?UTF-8?B?" . base64_encode("🔔 Devis catalogue [{$devisId}] de {$name}") . "?=";
    @mail($toTeam, $subjTeam, $html, implode("\r\n", $headersTeam));

    return ['success' => true];
}

