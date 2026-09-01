import express from "express"
import cors from "cors"
import { readFileSync, existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import {
  loadSubmissions,
  saveSubmissions,
  loadBlogs,
  saveBlogs,
  loadApplications,
  saveApplications,
} from "./server/database.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST_DIR = join(__dirname, "dist")
const ADMIN_TEMPLATE_PATH = join(__dirname, "server", "admin.html")
const PORT = process.env.PORT || 3001

const app = express()
app.use(cors())

// Increase body limit to support base64 images and PDFs
app.use(express.json({ limit: "25mb" }))
app.use(express.urlencoded({ limit: "25mb", extended: true }))

// HTML string escaping helper
function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

// ── Devis API Routes ────────────────────────────────────────────────
app.post("/api/devis", (req, res) => {
  const {
    clientType,
    name,
    company,
    email,
    phone,
    message,
    solutions,
    sectors,
  } = req.body

  if (!name || !phone) {
    return res
      .status(400)
      .json({ error: "Nom et téléphone sont obligatoires." })
  }
  if (clientType === "professional" && (!company || !email)) {
    return res.status(400).json({
      error: "Entreprise et email sont obligatoires pour un professionnel.",
    })
  }

  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    createdAt: new Date().toISOString(),
    clientType: clientType || "professional",
    name,
    company: company || null,
    email: email || null,
    phone,
    solutions: clientType === "professional" ? solutions || [] : [],
    sectors: clientType === "professional" ? sectors || [] : [],
    message: message || null,
  }

  const submissions = loadSubmissions()
  submissions.unshift(entry)
  saveSubmissions(submissions)

  console.log(`✅  New submission from ${name} (${clientType})`)
  return res.status(201).json({ success: true, id: entry.id })
})

app.get("/api/devis", (_req, res) => {
  return res.json(loadSubmissions())
})

app.delete("/api/devis/:id", (req, res) => {
  let submissions = loadSubmissions()
  const before = submissions.length
  submissions = submissions.filter((s) => s.id !== req.params.id)
  if (submissions.length === before) {
    return res.status(404).json({ error: "Not found" })
  }
  saveSubmissions(submissions)
  return res.json({ success: true })
})

// ── Recruitment API Routes ──────────────────────────────────────────
app.post("/api/recrutement", (req, res) => {
  const { name, email, phone, position, message, cv, cvName } = req.body

  if (!name || !email || !phone || !position || !cv) {
    return res.status(400).json({ error: "Tous les champs obligatoires (nom, email, téléphone, poste, CV) doivent être remplis." })
  }

  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    createdAt: new Date().toISOString(),
    name,
    email,
    phone,
    position,
    message: message || null,
    cv,
    cvName: cvName || "cv.pdf"
  }

  const apps = loadApplications()
  apps.unshift(entry)
  saveApplications(apps)

  console.log(`✅  New recruitment application from ${name} for position ${position}`)
  return res.status(201).json({ success: true, id: entry.id })
})

app.get("/api/recrutement", (_req, res) => {
  return res.json(loadApplications())
})

app.delete("/api/recrutement/:id", (req, res) => {
  let apps = loadApplications()
  const before = apps.length
  apps = apps.filter((a) => a.id !== req.params.id)
  if (apps.length === before) {
    return res.status(404).json({ error: "Not found" })
  }
  saveApplications(apps)
  return res.json({ success: true })
})

app.get("/api/recrutement/:id/cv", (req, res) => {
  const apps = loadApplications()
  const appEntry = apps.find((a) => a.id === req.params.id)
  if (!appEntry || !appEntry.cv) {
    return res.status(404).send("CV introuvable.")
  }

  const matches = appEntry.cv.match(/^data:([^;]+);base64,(.+)$/)
  if (!matches) {
    return res.status(400).send("Format de fichier invalide.")
  }

  const contentType = matches[1]
  const base64Data = matches[2]
  const buffer = Buffer.from(base64Data, "base64")

  res.setHeader("Content-Type", contentType)
  res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(appEntry.cvName)}"`)
  return res.send(buffer)
})

// ── Blog API Routes ─────────────────────────────────────────────────
app.get("/api/blogs", (_req, res) => {
  return res.json(loadBlogs())
})

app.get("/api/blogs/:id", (req, res) => {
  const blog = loadBlogs().find((b) => b.id === req.params.id)
  if (!blog) return res.status(404).json({ error: "Article introuvable." })
  return res.json(blog)
})

app.post("/api/blogs", (req, res) => {
  const { title, summary, content, image, pdf, pdfName } = req.body

  if (!title || !summary || !content) {
    return res
      .status(400)
      .json({ error: "Titre, résumé et contenu sont requis." })
  }

  const newPost = {
    id:
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Math.random().toString(36).slice(2, 6),
    date: new Date().toISOString(),
    title,
    summary,
    content,
    image: image || null,
    pdf: pdf || null,
    pdfName: pdfName || null,
  }

  const blogs = loadBlogs()
  blogs.unshift(newPost)
  saveBlogs(blogs)

  console.log(`📝  New blog post added: ${title}`)
  return res.status(201).json({ success: true, blog: newPost })
})

app.put("/api/blogs/:id", (req, res) => {
  const { title, summary, content, image, pdf, pdfName } = req.body

  if (!title || !summary || !content) {
    return res
      .status(400)
      .json({ error: "Titre, résumé et contenu sont requis." })
  }

  let blogs = loadBlogs()
  const idx = blogs.findIndex((b) => b.id === req.params.id)
  if (idx === -1) {
    return res.status(404).json({ error: "Article introuvable." })
  }

  blogs[idx] = {
    ...blogs[idx],
    title,
    summary,
    content,
    image: image !== undefined ? image : blogs[idx].image,
    pdf: pdf !== undefined ? pdf : blogs[idx].pdf,
    pdfName: pdfName !== undefined ? pdfName : blogs[idx].pdfName,
    updatedAt: new Date().toISOString(),
  }

  saveBlogs(blogs)
  console.log(`📝  Blog post updated: ${title} (${req.params.id})`)
  return res.json({ success: true, blog: blogs[idx] })
})

app.delete("/api/blogs/:id", (req, res) => {
  let blogs = loadBlogs()
  const before = blogs.length
  blogs = blogs.filter((b) => b.id !== req.params.id)
  if (blogs.length === before) {
    return res.status(404).json({ error: "Not found" })
  }
  saveBlogs(blogs)
  return res.json({ success: true })
})

// ── Admin Authentication ────────────────────────────────────────────
app.get("/admin/logo.jpg", (req, res) => {
  const logoPath = join(__dirname, "src", "imports", "logo.jpg")
  if (existsSync(logoPath)) {
    res.setHeader("Content-Type", "image/jpeg")
    return res.sendFile(logoPath)
  }
  return res.status(404).send("Logo missing.")
})

function renderLoginPage(res, errorMsg = "") {
  const errorHtml = errorMsg
    ? `<div class="error">${esc(errorMsg)}</div>`
    : ""

  const html = `<!DOCTYPE html>
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
    .logo-img { height: 60px; width: 60px; border-radius: 12px; object-fit: contain; }
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
    
    ${errorHtml}
    
    <form method="POST" action="/admin/login">
      <div class="form-group">
        <label for="password">Mot de passe de sécurité</label>
        <input type="password" id="password" name="password" required autofocus>
      </div>
      <button type="submit" class="btn">Se connecter</button>
    </form>
  </div>
</body>
</html>`

  res.setHeader("Content-Type", "text/html; charset=utf-8")
  return res.end(html)
}

app.post("/admin/login", (req, res) => {
  const { password } = req.body
  if (password === "MotaFouad223") {
    res.setHeader("Set-Cookie", "orsap_admin_session=authenticated; Path=/; Max-Age=604800; HttpOnly; SameSite=Strict")
    return res.redirect("/admin")
  } else {
    return renderLoginPage(res, "Mot de passe incorrect.")
  }
})

app.get("/admin/logout", (req, res) => {
  res.setHeader("Set-Cookie", "orsap_admin_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT")
  return res.redirect("/admin")
})

// ── Admin Dashboard ─────────────────────────────────────────────────
app.get("/admin", (req, res) => {
  const cookies = req.headers.cookie || ""
  if (!cookies.includes("orsap_admin_session=authenticated")) {
    return renderLoginPage(res)
  }

  const tab = req.query.tab || "devis"
  const submissions = loadSubmissions()
  const blogs = loadBlogs()
  const apps = loadApplications()

  // Generate rows for devis
  const devisRows = submissions
    .map(
      (s) => `
    <tr id="row-${s.id}">
      <td>${
        s.createdAt ? new Date(s.createdAt).toLocaleString("fr-FR") : "—"
      }</td>
      <td><span class="badge ${
        s.clientType === "professional" ? "pro" : "perso"
      }">${s.clientType === "professional" ? "Pro" : "Particulier"}</span></td>
      <td>${esc(s.name)}</td>
      <td>${esc(s.company || "—")}</td>
      <td>${
        s.email ? `<a href="mailto:${esc(s.email)}">${esc(s.email)}</a>` : "—"
      }</td>
      <td><a href="tel:${esc(s.phone)}">${esc(s.phone)}</a></td>
      <td>
        ${
          s.solutions && s.solutions.length > 0
            ? s.solutions
                .map(
                  (sol) =>
                    `<span class="badge pro" style="display:inline-block; margin:2px; font-size:10.5px;">${esc(sol)}</span>`,
                )
                .join("")
            : "—"
        }
      </td>
      <td>
        ${
          s.sectors && s.sectors.length > 0
            ? s.sectors
                .map(
                  (sec) =>
                    `<span class="badge pro" style="display:inline-block; margin:2px; font-size:10.5px; background: #14171a;">${esc(sec)}</span>`,
                )
                .join("")
            : "—"
        }
      </td>
      <td class="msg">${esc(s.message || "—")}</td>
      <td><button class="del-btn" onclick="deleteEntry('${s.id}')">Supprimer</button></td>
    </tr>`,
    )
    .join("")

  // Generate rows for blogs
  const blogRows = blogs
    .map(
      (b) => `
    <tr id="blog-${b.id}">
      <td>${new Date(b.date).toLocaleDateString("fr-FR")}</td>
      <td style="font-weight: 700;">${esc(b.title)}</td>
      <td class="msg">${esc(b.summary)}</td>
      <td>
        <a href="/blog/${b.id}" target="_blank" class="view-link">Voir</a>
        <button class="edit-btn" onclick="editBlog('${b.id}')">Modifier</button>
        <button class="del-btn" style="margin-left: 8px;" onclick="deleteBlog('${b.id}')">Supprimer</button>
      </td>
    </tr>`,
    )
    .join("")

  // Generate rows for applications (Recrutement)
  const appsRows = apps
    .map(
      (a) => `
    <tr id="app-${a.id}">
      <td>${a.createdAt ? new Date(a.createdAt).toLocaleString("fr-FR") : "—"}</td>
      <td style="font-weight: 700;">${esc(a.name)}</td>
      <td><span class="badge pro">${esc(a.position)}</span></td>
      <td>${a.email ? `<a href="mailto:${esc(a.email)}">${esc(a.email)}</a>` : "—"}</td>
      <td><a href="tel:${esc(a.phone)}">${esc(a.phone)}</a></td>
      <td class="msg">${esc(a.message || "—")}</td>
      <td>
        <a href="/api/recrutement/${a.id}/cv" class="view-link" style="display:inline-block; background:#14171a; color:#fff; padding:6px 12px; border-radius:4px; font-size:11.5px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em;">Télécharger CV</a>
      </td>
      <td><button class="del-btn" onclick="deleteApp('${a.id}')">Supprimer</button></td>
    </tr>`,
    )
    .join("")

  // Construct tab content
  let tabContent = ""
  if (tab === "devis") {
    tabContent = `
      <div class="wrap">
        <!-- TABLEAU DES DEVIS -->
        ${
          submissions.length === 0
            ? '<div class="empty">Aucune demande de devis pour le moment.</div>'
            : `<table>
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
          <tbody>${devisRows}</tbody>
        </table>`
        }
      </div>`
  } else if (tab === "recrutement") {
    tabContent = `
      <div class="wrap">
        <!-- TABLEAU DES CANDIDATURES -->
        ${
          apps.length === 0
            ? '<div class="empty">Aucune candidature reçue pour le moment.</div>'
            : `<table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Nom complet</th>
              <th>Poste souhaité</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Message</th>
              <th>CV (PDF/Word)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>${appsRows}</tbody>
        </table>`
        }
      </div>`
  } else {
    tabContent = `
      <div class="wrap">
        <!-- GESTION DU BLOG -->
        <section class="editor-section">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
            <h2 id="formTitle" style="margin-bottom: 0;">Rédiger un article de blog</h2>
            <button id="cancelBtn" type="button" class="cancel-btn" onclick="cancelEdit()">Annuler la modification</button>
          </div>
          <form id="blogForm" onsubmit="handleBlogSubmit(event)">
            <div class="form-group">
              <label>Titre de l\'article</label>
              <input type="text" id="blogTitle" required placeholder="Ex: L\'importance des normes de sécurité pour les échafaudages..." />
            </div>
            <div class="form-group">
              <label>Résumé de l\'article</label>
              <input type="text" id="blogSummary" required placeholder="Court résumé apparaissant dans la liste d\'articles..." />
            </div>
            <div class="form-group">
              <label>Image de l\'article</label>
              <input type="file" id="blogImage" accept="image/*" onchange="previewImage(event)" />
              <div class="image-preview-container">
                <img id="imagePreview" class="preview-img" alt="Aperçu" />
                <button type="button" id="removeImgBtn" style="display:none; font-size:12px; color:#d3121a; background:none; border:none; cursor:pointer; font-weight:600;" onclick="removeImage()">✕ Supprimer l\'image</button>
              </div>
            </div>
            <div class="form-group">
              <label>Fiche technique / Document (PDF)</label>
              <input type="file" id="blogPdf" accept="application/pdf" onchange="previewPdf(event)" />
              <div style="display: flex; align-items: center; gap: 12px; margin-top: 10px;">
                <div id="pdfName" style="font-size: 13px; font-weight: 600; color: #d3121a; display: none;"></div>
                <button type="button" id="removePdfBtn" style="display:none; font-size:12px; color:#d3121a; background:none; border:none; cursor:pointer; font-weight:600;" onclick="removePdf()">✕ Supprimer le PDF</button>
              </div>
            </div>
            <div class="form-group">
              <label>Contenu de l\'article / Mots-clés SEO</label>
              <textarea id="blogContent" rows="10" required placeholder="Rédigez le contenu complet ou vos mots-clés SEO ici..."></textarea>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
              <button type="submit" id="submitBtn" class="submit-btn">Publier l\'article</button>
            </div>
          </form>
        </section>

        <h2 style="font-size: 16px; font-weight: 800; text-transform: uppercase; margin-bottom: 15px;">Articles Publiés</h2>
        ${
          blogs.length === 0
            ? '<div class="empty">Aucun article publié pour le moment.</div>'
            : `<table>
          <thead>
            <tr>
              <th style="width: 120px;">Date</th>
              <th>Titre</th>
              <th>Résumé</th>
              <th style="width: 220px;">Actions</th>
            </tr>
          </thead>
          <tbody>${blogRows}</tbody>
        </table>`
        }
      </div>`
  }

  // Read template HTML and replace variables
  try {
    let html = readFileSync(ADMIN_TEMPLATE_PATH, "utf-8")
    html = html.replace("{{SUBMISSIONS_COUNT}}", submissions.length)
    html = html.replace("{{BLOGS_COUNT}}", blogs.length)
    html = html.replace("{{APPLICATIONS_COUNT}}", apps.length)
    html = html.replace("{{TAB_DEVIS_ACTIVE}}", tab === "devis" ? "active" : "")
    html = html.replace("{{TAB_RECRUTEMENT_ACTIVE}}", tab === "recrutement" ? "active" : "")
    html = html.replace("{{TAB_BLOG_ACTIVE}}", tab === "blog" ? "active" : "")
    html = html.replace("{{TAB_CONTENT}}", tabContent)

    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.end(html)
  } catch (error) {
    console.error("Error reading admin.html template:", error)
    res.status(500).send("Erreur interne du serveur (admin template).")
  }
})

// ── Serve frontend (production) ─────────────────────────────────────
if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
  // SPA fallback — serve index.html for all non-API routes
  app.get("/{*path}", (_req, res) => {
    res.sendFile(join(DIST_DIR, "index.html"))
  })
}

// ── Start ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  ORSAP server running on port ${PORT}`)
  console.log(`📋  Admin dashboard: /admin`)
  console.log(`📨  API endpoint:    /api/devis\n`)
})
