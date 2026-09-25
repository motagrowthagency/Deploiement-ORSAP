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

/**
 * Send instant CRM alert to ORSAP commercial team when a logged-in client has an active cart
 */
export async function sendCrmActiveCartAlert({ user, items, totalHt, totalTtc }) {
  const calculatedHt = totalHt !== undefined ? totalHt : items.reduce((sum, it) => sum + (it.priceHt || 0) * (it.quantity || 1), 0)
  const calculatedTtc = totalTtc !== undefined ? totalTtc : items.reduce((sum, it) => sum + (it.priceTtc || 0) * (it.quantity || 1), 0)
  const tvaAmount = calculatedTtc - calculatedHt

  // Clean phone number for WhatsApp link
  let cleanPhone = String(user.phone || "").replace(/[^\d+]/g, "")
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "212" + cleanPhone.substring(1)
  } else if (cleanPhone.startsWith("+")) {
    cleanPhone = cleanPhone.substring(1)
  } else if (!cleanPhone.startsWith("212") && cleanPhone.length === 9) {
    cleanPhone = "212" + cleanPhone
  }

  const sampleArticles = items.slice(0, 3).map((it) => it.designation || it.code).join(", ")
  const waMessage = encodeURIComponent(
    `Bonjour ${user.name},\n\nNous avons remarqué votre sélection d'articles sur notre catalogue ORSAP (${items.length} article(s) : ${sampleArticles}${items.length > 3 ? '...' : ''}).\n\nSouhaitez-vous une assistance technique ou un devis personnalisé avec nos remises professionnelles ?\n\nL'équipe ORSAP Maroc\nhttps://orsap.ma`
  )
  const waUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`

  const mailtoSubject = encodeURIComponent(`Votre sélection sur ORSAP — Assistance & Offre commerciale`)
  const mailtoBody = encodeURIComponent(
    `Bonjour ${user.name},\n\nNous avons bien noté les articles ajoutés à votre panier sur l'Espace Client ORSAP.\n\nRestant à votre disposition pour vous transmettre notre meilleure offre de prix et délais de livraison.\n\nCordialement,\nService Commercial ORSAP`
  )
  const mailtoUrl = `mailto:${user.email}?subject=${mailtoSubject}&body=${mailtoBody}`
  const adminCrmUrl = `${APP_URL}/admin?tab=crm`

  const itemRowsHtml = items
    .map(
      (it, idx) => `
    <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? "#ffffff" : "#f8fafc"};">
      <td style="padding: 10px; font-family: monospace; font-size: 12px; font-weight: bold; color: #14171a;">
        ${it.isCustom ? '<span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 10px;">SUR-MESURE</span>' : (it.code || it.articleCode || "N/A")}
      </td>
      <td style="padding: 10px; font-size: 13px; color: #334155;">${it.designation}</td>
      <td style="padding: 10px; text-align: center; font-weight: bold; font-size: 13px;">${it.quantity || 1}</td>
      <td style="padding: 10px; text-align: right; font-size: 13px; font-weight: 600;">
        ${it.priceHt ? Number(it.priceHt).toFixed(2) + " MAD" : "Sur devis"}
      </td>
      <td style="padding: 10px; text-align: right; font-size: 13px; font-weight: bold; color: #d3121a;">
        ${it.priceHt ? (Number(it.priceHt) * (it.quantity || 1)).toFixed(2) + " MAD" : "Sur devis"}
      </td>
    </tr>`
    )
    .join("")

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f2f0ec; margin: 0; padding: 0; color: #14171a; }
    .container { max-width: 680px; margin: 30px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border-top: 5px solid #d3121a; }
    .header { background: #14171a; padding: 25px 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.05em; }
    .header .alert-tag { display: inline-block; background: #d3121a; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 8px; }
    .content { padding: 30px; line-height: 1.6; }
    
    .client-card { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 5px solid #14171a; border-radius: 6px; padding: 18px 22px; margin: 15px 0 25px 0; }
    .client-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 12px; }
    .client-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .client-label { color: #64748b; font-weight: 500; }
    .client-val { color: #0f172a; font-weight: 700; }
    
    .action-bar { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 25px 0; }
    .action-btn { display: block; text-align: center; padding: 14px 16px; border-radius: 8px; font-size: 13px; font-weight: 800; text-decoration: none; text-transform: uppercase; letter-spacing: 0.04em; }
    .btn-wa { background: #25d366; color: #ffffff !important; box-shadow: 0 4px 10px rgba(37,211,102,0.3); }
    .btn-call { background: #0284c7; color: #ffffff !important; box-shadow: 0 4px 10px rgba(2,132,199,0.3); }
    .btn-mail { background: #475569; color: #ffffff !important; }
    .btn-crm { background: #d3121a; color: #ffffff !important; box-shadow: 0 4px 10px rgba(211,18,26,0.3); }
    
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    th { background: #14171a; color: #ffffff; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
    .totals { margin-top: 15px; border-top: 2px solid #14171a; padding-top: 12px; }
    .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
    .total-main { font-size: 16px; font-weight: 900; color: #d3121a; border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-top: 4px; }
    
    .footer { background: #fafbfc; border-top: 1px solid #e2e8f0; padding: 18px 30px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ORSAP — CRM &amp; Lead Tracker</h1>
      <div class="alert-tag">🔔 Panier Actif Détecté sur l'Espace Client</div>
    </div>
    <div class="content">
      <p style="font-size: 15px; color: #1e293b; margin-top: 0;">
        Un client connecté a actuellement <strong>${items.length} article(s)</strong> dans son panier sur le site. Voici son dossier complet prêt pour une relance rapide :
      </p>

      <!-- Client Dossier -->
      <div class="client-card">
        <div class="client-title">👤 Fiche Contact Client (Espace Client)</div>
        <div class="client-row">
          <span class="client-label">Nom complet :</span>
          <span class="client-val">${user.name || "N/A"}</span>
        </div>
        ${user.company ? `
        <div class="client-row">
          <span class="client-label">Entreprise :</span>
          <span class="client-val">${user.company}</span>
        </div>` : ""}
        <div class="client-row">
          <span class="client-label">Téléphone direct :</span>
          <span class="client-val"><a href="tel:${user.phone}" style="color: #0284c7; text-decoration: none;">${user.phone || "N/A"}</a></span>
        </div>
        <div class="client-row">
          <span class="client-label">Email :</span>
          <span class="client-val"><a href="mailto:${user.email}" style="color: #0284c7; text-decoration: none;">${user.email || "N/A"}</a></span>
        </div>
        <div class="client-row">
          <span class="client-label">Profil :</span>
          <span class="client-val">${user.clientType === "individual" ? "👤 Particulier" : "🏢 Professionnel"}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 8px;">
        ⚡ Actions de Relance Commerciale Immédiate :
      </div>
      <table style="width: 100%; border: none; margin: 10px 0 25px 0;">
        <tr>
          <td style="padding: 6px; width: 50%;">
            <a href="${waUrl}" class="action-btn btn-wa" target="_blank">💬 Relancer sur WhatsApp</a>
          </td>
          <td style="padding: 6px; width: 50%;">
            <a href="tel:${user.phone}" class="action-btn btn-call">📞 Appeler au téléphone</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 6px; width: 50%;">
            <a href="${mailtoUrl}" class="action-btn btn-mail">✉️ Envoyer un Email</a>
          </td>
          <td style="padding: 6px; width: 50%;">
            <a href="${adminCrmUrl}" class="action-btn btn-crm" target="_blank">🎯 Ouvrir dans le CRM</a>
          </td>
        </tr>
      </table>

      <!-- Items in cart -->
      <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #14171a; margin-top: 25px;">
        🛒 Contenu du Panier Actif (${items.length} références) :
      </div>
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
        <div class="total-row"><span>Total HT estimé :</span><strong>${calculatedHt.toFixed(2)} MAD</strong></div>
        <div class="total-row"><span>TVA (20%) :</span><strong>${tvaAmount.toFixed(2)} MAD</strong></div>
        <div class="total-row total-main"><span>TOTAL ESTIMÉ TTC :</span><span>${calculatedTtc.toFixed(2)} MAD</span></div>
      </div>
    </div>
    <div class="footer">
      <p>ORSAP CRM Automatisé — Détection de Panier Actif en Temps Réel</p>
      <p>Casablanca, Maroc · <a href="mailto:orsap@orsap.ma">orsap@orsap.ma</a></p>
    </div>
  </div>
</body>
</html>
  `

  console.log(`\n📬 ═════════════════════════════════════════════════════`)
  console.log(`🚨  ALERTE CRM — PANIER ACTIF DÉTECTÉ POUR : ${user.name} (${user.email} · ${user.phone})`)
  console.log(`📦  Articles dans le panier : ${items.length} références | Total HT : ${calculatedHt.toFixed(2)} MAD`)
  console.log(`💬  Lien WhatsApp Direct : ${waUrl}`)
  console.log(`═════════════════════════════════════════════════════\n`)

  if (transporter) {
    try {
      await transporter.sendMail({
        from: SMTP_FROM,
        to: "orsap@orsap.ma",
        replyTo: user.email,
        subject: `🚨 [CRM ORSAP] Panier Actif en cours — ${user.name}${user.company ? ` (${user.company})` : ""} [${calculatedHt.toFixed(2)} MAD HT]`,
        html,
      })
      return { success: true }
    } catch (err) {
      console.error(`❌ Échec d'envoi alerte CRM email:`, err.message)
      return { success: false, error: err.message }
    }
  }

  return { success: true, mocked: true }
}

/**
 * Send corporate acknowledgment confirmation email to customer for quote / devis request
 */
export async function sendDevisCustomerConfirmationEmail(entry, toOverride = null) {
  const to = toOverride || entry.email
  if (!to) {
    return { success: false, error: "No recipient email" }
  }

  const isPro = entry.clientType === "professional"
  const name = entry.name || "Madame, Monsieur"
  const company = entry.company || ""
  const phone = entry.phone || "—"
  const email = entry.email || "—"
  const message = entry.message || "Demande d'information et offre tarifaire."
  const devisId = entry.id || `DEV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  
  const solutions = Array.isArray(entry.solutions) && entry.solutions.length > 0 
    ? entry.solutions.join(", ") 
    : "Travail en hauteur / Équipements Pro"

  const sectors = Array.isArray(entry.sectors) && entry.sectors.length > 0 
    ? entry.sectors.join(", ") 
    : "—"

  const waText = encodeURIComponent(`Bonjour, je vous contacte concernant ma demande de devis n° ${devisId} pour ${company || name}`)
  const waUrl = `https://wa.me/212644203030?text=${waText}`

  const subject = `Confirmation de réception de votre demande de devis [${devisId}] — ORSAP Maroc`

  const html = `
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
      <div class="greeting">Bonjour ${name},</div>
      <p class="intro-text">
        Nous vous confirmons la bonne réception de votre demande de devis sur notre plateforme <strong>ORSAP Maroc</strong>. Notre équipe commerciale et nos spécialistes techniques sont d'ores et déjà mobilisés pour analyser vos spécifications techniques et vous transmettre notre meilleure proposition.
      </p>

      <div class="card-recap">
        <div class="card-title">📋 Récapitulatif de votre demande — Réf : ${devisId}</div>
        <table class="card-table">
          <tr>
            <td class="card-label">Entreprise :</td>
            <td class="card-value">${company || "—"}</td>
          </tr>
          <tr>
            <td class="card-label">Interlocuteur :</td>
            <td class="card-value">${name}</td>
          </tr>
          <tr>
            <td class="card-label">Téléphone direct :</td>
            <td class="card-value">${phone}</td>
          </tr>
          <tr>
            <td class="card-label">Email :</td>
            <td class="card-value">${email}</td>
          </tr>
          <tr>
            <td class="card-label">Domaine / Solution :</td>
            <td class="card-value">${solutions}</td>
          </tr>
          <tr>
            <td class="card-label">Secteur(s) :</td>
            <td class="card-value">${sectors}</td>
          </tr>
        </table>
        
        <div style="margin-top: 14px;">
          <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Détail de votre besoin / Spécifications :</span>
          <div class="demande-box">${message}</div>
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
          <a href="${waUrl}" class="btn-wa" target="_blank">💬 Échanger sur WhatsApp</a>
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
`

  console.log(`\n📬 ═════════════════════════════════════════════════════`)
  console.log(`✉️  CONFIRMATION DE DEVIS ENVOYÉE AU CLIENT : ${to}`)
  console.log(`📋  Dossier : ${devisId} (${name} - ${company})`)
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
      return { success: true, messageId: info.messageId }
    } catch (err) {
      console.error(`❌ Échec d'envoi confirmation client à ${to}:`, err.message)
      return { success: false, error: err.message }
    }
  }

  return { success: true, mocked: true, html }
}


