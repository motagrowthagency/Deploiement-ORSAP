import "dotenv/config"
import nodemailer from "nodemailer"

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = Number(process.env.SMTP_PORT) || 465
const SMTP_SECURE = process.env.SMTP_SECURE === "true" || SMTP_PORT === 465
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const SMTP_FROM = process.env.SMTP_FROM || '"ORSAP Maroc" <orsap@orsap.ma>'
const APP_URL = process.env.APP_URL || "http://localhost:3001"
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || "orsap@orsap.ma"

let transporter = null

if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  try {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
    console.log(`📧 Service SMTP configuré (${SMTP_USER}@${SMTP_HOST}:${SMTP_PORT})`)
  } catch (err) {
    console.error("❌ Erreur d'initialisation SMTP:", err.message)
    transporter = null
  }
} else {
  console.log("ℹ️  SMTP non configuré dans .env — les emails et liens d'activation seront affichés dans la console.")
}

/**
 * Send an account verification email to a newly registered user
 */
export async function sendVerificationEmail({ to, name, token, code }) {
  const verifyUrl = `${APP_URL}/espace-client/verify?token=${encodeURIComponent(token)}`

  const subject = "Activez votre compte — ORSAP Espace Client"
  const html = `
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
      <div class="greeting">Bonjour ${name || "Cher client"},</div>
      <p>Nous vous remercions pour votre inscription à l'<strong>Espace Client ORSAP</strong>.</p>
      <p>Pour finaliser la création de votre compte et accéder à vos demandes de devis, fiches techniques et services personnalisés, veuillez valider votre adresse email :</p>
      
      <div class="btn-container">
        <a href="${verifyUrl}" class="btn" target="_blank">Activer mon compte</a>
      </div>

      <p style="font-size: 13px; color: #64748b; text-align: center;">Ou utilisez votre code de validation à 6 chiffres :</p>
      
      <div class="code-box">
        <div class="label">Code de confirmation</div>
        <div class="code">${code}</div>
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
  `

  console.log(`\n📬 ═════════════════════════════════════════════════════`)
  console.log(`✉️  EMAIL DE VÉRIFICATION GÉNÉRÉ POUR : ${to}`)
  console.log(`🔑  Code : ${code}`)
  console.log(`🔗  Lien : ${verifyUrl}`)
  console.log(`═════════════════════════════════════════════════════\n`)

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: SMTP_FROM,
        to,
        subject,
        html,
      })
      console.log(`✅ Email envoyé avec succès à ${to} (MessageId: ${info.messageId})`)
      return { success: true, messageId: info.messageId, previewUrl: verifyUrl }
    } catch (err) {
      console.error(`❌ Échec d'envoi SMTP à ${to}:`, err.message)
      return { success: false, error: err.message, previewUrl: verifyUrl }
    }
  }

  return { success: true, mocked: true, previewUrl: verifyUrl }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail({ to, name, token }) {
  const resetUrl = `${APP_URL}/espace-client?resetToken=${encodeURIComponent(token)}`
  const subject = "Réinitialisation de votre mot de passe — ORSAP"
  const html = `
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
      <div class="greeting">Bonjour ${name || "Cher client"},</div>
      <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre Espace Client ORSAP.</p>
      <div class="btn-container">
        <a href="${resetUrl}" class="btn" target="_blank">Réinitialiser mon mot de passe</a>
      </div>
      <p style="font-size: 13px; color: #94a3b8;">Ce lien expirera dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
    </div>
    <div class="footer">
      <p>ORSAP — Import, distribution &amp; services aux industries</p>
    </div>
  </div>
</body>
</html>
  `

  console.log(`\n📬 ═════════════════════════════════════════════════════`)
  console.log(`🔑  RÉINITIALISATION DE MOT DE PASSE POUR : ${to}`)
  console.log(`🔗  Lien : ${resetUrl}`)
  console.log(`═════════════════════════════════════════════════════\n`)

  if (transporter) {
    try {
      await transporter.sendMail({
        from: SMTP_FROM,
        to,
        subject,
        html,
      })
      return { success: true }
    } catch (err) {
      console.error(`❌ Échec d'envoi SMTP reset:`, err.message)
      return { success: false, error: err.message }
    }
  }
  return { success: true, mocked: true }
}

function formatMAD(n) {
  return `${Number(n).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`
}

function itemsTableRows(items) {
  return items
    .map(
      (it) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-family:monospace;font-size:12px;color:#64748b;">${it.articleCode}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#14171a;">${it.designation}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#14171a;text-align:center;">${it.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#14171a;text-align:right;">${formatMAD(it.priceTtc)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#14171a;text-align:right;font-weight:700;">${formatMAD(it.priceTtc * it.quantity)}</td>
        </tr>`
    )
    .join("")
}

/**
 * Send an itemized catalogue devis to the sales team, and a confirmation
 * copy to the client. Called after a devis is created via the Espace
 * Client catalogue/devis builder.
 */
export async function sendCatalogueDevisEmails({ devisId, user, items, note }) {
  const total = items.reduce((sum, it) => sum + it.priceTtc * it.quantity, 0)
  const tableHeader = `
    <tr style="background:#f8fafc;">
      <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;">Code</th>
      <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;">Article</th>
      <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;">Qté</th>
      <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;">PU TTC</th>
      <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;">Total</th>
    </tr>`

  const rows = itemsTableRows(items)

  const baseStyle = `
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f2f0ec; margin: 0; padding: 0; color: #14171a; }
    .container { max-width: 680px; margin: 30px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border-top: 5px solid #d3121a; }
    .header { background: #14171a; padding: 25px 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.05em; }
    .header p { color: #d3121a; font-size: 13px; font-weight: 700; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 0.1em; }
    .content { padding: 30px; line-height: 1.6; }
    .meta { font-size: 13px; color: #3c434b; margin-bottom: 20px; }
    .meta b { color: #14171a; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .total-row td { padding: 14px 12px; font-size: 15px; font-weight: 900; color: #14171a; border-top: 2px solid #14171a; }
    .note-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; margin-top: 20px; font-size: 13px; color: #3c434b; }
    .footer { background: #fafbfc; border-top: 1px solid #e2e8f0; padding: 20px 30px; text-align: center; font-size: 12px; color: #64748b; }
    .footer a { color: #d3121a; text-decoration: none; }
  `

  const clientMeta = `
    <div class="meta">
      <div><b>Référence :</b> ${devisId.toUpperCase()}</div>
      <div><b>Client :</b> ${user.name}${user.company ? ` — ${user.company}` : ""}</div>
      <div><b>Email :</b> ${user.email} &nbsp;·&nbsp; <b>Téléphone :</b> ${user.phone}</div>
    </div>`

  const tableHtml = `
    <table>
      <thead>${tableHeader}</thead>
      <tbody>
        ${rows}
        <tr class="total-row">
          <td colspan="4" style="text-align:right;">Total estimé (TTC)</td>
          <td style="text-align:right;">${formatMAD(total)}</td>
        </tr>
      </tbody>
    </table>`

  const noteHtml = note
    ? `<div class="note-box"><b>Message du client :</b><br/>${String(note).replace(/</g, "&lt;")}</div>`
    : ""

  // ── Email to the sales team ──────────────────────────────────────
  const salesHtml = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><style>${baseStyle}</style></head>
<body>
  <div class="container">
    <div class="header"><h1>ORSAP</h1><p>Nouvelle demande de devis — Catalogue</p></div>
    <div class="content">
      ${clientMeta}
      ${tableHtml}
      ${noteHtml}
    </div>
    <div class="footer">
      <p>Demande transmise depuis l'Espace Client ORSAP · <a href="${APP_URL}/admin">Ouvrir le tableau de bord</a></p>
    </div>
  </div>
</body>
</html>`

  // ── Confirmation email to the client ─────────────────────────────
  const clientHtml = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><style>${baseStyle}</style></head>
<body>
  <div class="container">
    <div class="header"><h1>ORSAP</h1><p>Confirmation de votre demande de devis</p></div>
    <div class="content">
      <p>Bonjour ${user.name},</p>
      <p>Nous avons bien reçu votre demande de devis (réf. <b>${devisId.toUpperCase()}</b>) portant sur ${items.length} article(s). Un expert ORSAP vous recontactera très prochainement avec une offre personnalisée.</p>
      ${tableHtml}
      ${noteHtml}
      <p style="font-size:13px;color:#94a3b8;margin-top:25px;">Les prix affichés sont indicatifs (TTC) et seront confirmés dans votre devis final, sous réserve de disponibilité.</p>
    </div>
    <div class="footer">
      <p>ORSAP — Import, distribution &amp; services aux industries</p>
      <p>Casablanca, Maroc · <a href="tel:+212644203030">+212 6 44 20 30 30</a> · <a href="mailto:orsap@orsap.ma">orsap@orsap.ma</a></p>
    </div>
  </div>
</body>
</html>`

  console.log(`\n📬 ═════════════════════════════════════════════════════`)
  console.log(`🛒  DEVIS CATALOGUE ${devisId.toUpperCase()} — ${items.length} article(s) — ${formatMAD(total)}`)
  console.log(`👤  ${user.name} (${user.email})`)
  console.log(`═════════════════════════════════════════════════════\n`)

  if (!transporter) {
    return { success: true, mocked: true }
  }

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: NOTIFICATION_EMAIL,
      subject: `🛒 Nouveau devis catalogue — ${user.name} (${items.length} articles)`,
      html: salesHtml,
    })
  } catch (err) {
    console.error("❌ Échec d'envoi SMTP (équipe ventes):", err.message)
  }

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: user.email,
      subject: `Confirmation de votre demande de devis — ${devisId.toUpperCase()}`,
      html: clientHtml,
    })
  } catch (err) {
    console.error("❌ Échec d'envoi SMTP (confirmation client):", err.message)
  }

  return { success: true }
}
