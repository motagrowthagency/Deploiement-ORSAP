import "dotenv/config"
import nodemailer from "nodemailer"

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = Number(process.env.SMTP_PORT) || 465
const SMTP_SECURE = process.env.SMTP_SECURE === "true" || SMTP_PORT === 465
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const SMTP_FROM = process.env.SMTP_FROM || '"ORSAP Maroc" <orsap@orsap.ma>'
const APP_URL = process.env.APP_URL || "http://localhost:3001"

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

/**
 * Send itemized quote recap to client & notification to ORSAP team
 */
export async function sendCatalogueDevisEmails({ devisId, user, items, note }) {
  const totalHt = items.reduce((sum, it) => sum + (it.priceHt || 0) * (it.quantity || 1), 0)
  const totalTtc = items.reduce((sum, it) => sum + (it.priceTtc || 0) * (it.quantity || 1), 0)
  const tvaAmount = totalTtc - totalHt

  const itemRowsHtml = items
    .map(
      (it, idx) => `
    <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? "#ffffff" : "#f8fafc"};">
      <td style="padding: 10px; font-family: monospace; font-size: 12px; font-weight: bold; color: #14171a;">
        ${it.isCustom ? '<span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 10px;">SUR-MESURE</span>' : it.articleCode}
      </td>
      <td style="padding: 10px; font-size: 13px; color: #334155;">${it.designation}</td>
      <td style="padding: 10px; text-align: center; font-weight: bold; font-size: 13px;">${it.quantity}</td>
      <td style="padding: 10px; text-align: right; font-size: 13px; font-weight: 600;">
        ${it.priceHt ? it.priceHt.toFixed(2) + " MAD" : "Sur devis"}
      </td>
      <td style="padding: 10px; text-align: right; font-size: 13px; font-weight: bold; color: #d3121a;">
        ${it.priceHt ? (it.priceHt * it.quantity).toFixed(2) + " MAD" : "Sur devis"}
      </td>
    </tr>`
    )
    .join("")

  const clientHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f2f0ec; margin: 0; padding: 0; color: #14171a; }
    .container { max-width: 680px; margin: 30px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border-top: 5px solid #d3121a; }
    .header { background: #14171a; padding: 25px 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.05em; }
    .header p { color: #d3121a; font-size: 13px; font-weight: 700; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 0.1em; }
    .content { padding: 30px; line-height: 1.6; }
    .ref-badge { display: inline-block; background: #fee2e2; color: #991b1b; padding: 6px 14px; border-radius: 9999px; font-weight: 800; font-size: 13px; letter-spacing: 0.05em; margin: 10px 0 20px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    th { background: #14171a; color: #ffffff; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
    .totals { margin-top: 20px; border-top: 2px solid #14171a; padding-top: 15px; }
    .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
    .total-main { font-size: 16px; font-weight: 900; color: #d3121a; border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-top: 4px; }
    .note-box { background: #f8fafc; border-left: 4px solid #d3121a; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #475569; }
    .footer { background: #fafbfc; border-top: 1px solid #e2e8f0; padding: 20px 30px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ORSAP</h1>
      <p>Confirmation de Demande de Devis</p>
    </div>
    <div class="content">
      <div style="font-size: 18px; font-weight: bold; color: #14171a;">Bonjour ${user.name},</div>
      <p>Votre demande de devis a bien été enregistrée et transmise à notre service commercial.</p>
      
      <div>Référence de votre demande : <span class="ref-badge">${devisId.toUpperCase()}</span></div>

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
          ${itemRowsHtml}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row"><span>Total HT estimé :</span><strong>${totalHt.toFixed(2)} MAD</strong></div>
        <div class="total-row"><span>TVA (20%) :</span><strong>${tvaAmount.toFixed(2)} MAD</strong></div>
        <div class="total-row total-main"><span>TOTAL ESTIMÉ TTC :</span><span>${totalTtc.toFixed(2)} MAD</span></div>
      </div>

      ${note ? `<div class="note-box"><strong>Vos précisions :</strong><br>${note}</div>` : ""}

      <p style="margin-top: 25px; font-size: 13px; color: #475569;">
        Un conseiller technique ORSAP analyse votre demande et vous contactera dans les plus brefs délais avec une offre commerciale définitive.
      </p>
    </div>
    <div class="footer">
      <p>ORSAP — Fournitures Industrielles, Quincaillerie &amp; Équipements Pro</p>
      <p>Casablanca, Maroc · <a href="tel:+212644203030">+212 6 44 20 30 30</a> · <a href="mailto:orsap@orsap.ma">orsap@orsap.ma</a></p>
    </div>
  </div>
</body>
</html>
  `

  console.log(`\n📬 ═════════════════════════════════════════════════════`)
  console.log(`📋  NOUVELLE DEMANDE DE DEVIS ENREGISTRÉE : ${devisId.toUpperCase()}`)
  console.log(`👤  Client : ${user.name} (${user.email} · ${user.phone})`)
  console.log(`📦  Articles : ${items.length} lignes | Total HT : ${totalHt.toFixed(2)} MAD`)
  console.log(`═════════════════════════════════════════════════════\n`)

  if (transporter) {
    try {
      // 1. Email to client
      await transporter.sendMail({
        from: SMTP_FROM,
        to: user.email,
        subject: `Confirmation de votre demande de devis [${devisId.toUpperCase()}] — ORSAP`,
        html: clientHtml,
      })
      // 2. Email to ORSAP team
      await transporter.sendMail({
        from: SMTP_FROM,
        to: "orsap@orsap.ma",
        replyTo: user.email,
        subject: `🔔 Nouvelle demande de devis [${devisId.toUpperCase()}] de ${user.name}${user.company ? ` (${user.company})` : ""}`,
        html: clientHtml,
      })
      return { success: true }
    } catch (err) {
      console.error(`❌ Échec d'envoi email devis:`, err.message)
      return { success: false, error: err.message }
    }
  }
  return { success: true, mocked: true }
}
