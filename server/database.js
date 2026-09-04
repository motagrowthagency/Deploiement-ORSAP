import "dotenv/config"
import mysql from "mysql2/promise"
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.DATA_DIR || join(__dirname, "..", "data")
const DB_PATH = join(DATA_DIR, "submissions.json")
const BLOG_DB_PATH = join(DATA_DIR, "blogs.json")
const BLOG_BACKUP_PATH = join(DATA_DIR, "blogs.backup.json")
const APP_DB_PATH = join(DATA_DIR, "applications.json")
const SUB_DB_PATH = join(DATA_DIR, "subscribers.json")
const BACKUP_DIR = join(DATA_DIR, "backups")

// Ensure fallback data directories exist
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true })

const REPO_DATA_PATH = join(__dirname, "..", "data", "blogs.json")
const REPO_BACKUP_PATH = join(__dirname, "..", "data", "blogs.backup.json")

function getBundledBlogs() {
  if (existsSync(REPO_DATA_PATH)) {
    try {
      const data = JSON.parse(readFileSync(REPO_DATA_PATH, "utf-8"))
      if (Array.isArray(data) && data.length > 0) return data
    } catch {}
  }
  if (existsSync(REPO_BACKUP_PATH)) {
    try {
      const data = JSON.parse(readFileSync(REPO_BACKUP_PATH, "utf-8"))
      if (Array.isArray(data) && data.length > 0) return data
    } catch {}
  }
  return []
}

export const SEED_BLOGS = getBundledBlogs()

// ── MySQL Connection Pool ───────────────────────────────────────────
const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD || ""
const DB_NAME = process.env.DB_NAME
const DB_PORT = Number(process.env.DB_PORT) || 3306

let pool = null
export const isUsingMySQL = Boolean(DB_HOST && DB_USER && DB_NAME)

if (isUsingMySQL) {
  try {
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: "utf8mb4",
    })
    console.log(`🔌 Initialisation de la connexion MySQL (${DB_USER}@${DB_HOST}/${DB_NAME})...`)
  } catch (err) {
    console.error("❌ Erreur de création du pool MySQL:", err.message)
    pool = null
  }
} else {
  console.log("📁 Mode de stockage local JSON actif (aucune variable MySQL détectée).")
}

// ── Table Auto-Initialization & Data Seeding ────────────────────────
export async function initDatabase() {
  if (!pool) return

  try {
    const connection = await pool.getConnection()
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`submissions\` (
          \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
          \`created_at\` DATETIME NOT NULL,
          \`client_type\` VARCHAR(32) NOT NULL DEFAULT 'professional',
          \`name\` VARCHAR(255) NOT NULL,
          \`company\` VARCHAR(255) DEFAULT NULL,
          \`email\` VARCHAR(255) DEFAULT NULL,
          \`phone\` VARCHAR(64) NOT NULL,
          \`solutions\` JSON DEFAULT NULL,
          \`sectors\` JSON DEFAULT NULL,
          \`message\` TEXT DEFAULT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `)

      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`applications\` (
          \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
          \`created_at\` DATETIME NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`email\` VARCHAR(255) NOT NULL,
          \`phone\` VARCHAR(64) NOT NULL,
          \`position\` VARCHAR(255) NOT NULL,
          \`message\` TEXT DEFAULT NULL,
          \`cv\` LONGTEXT NOT NULL,
          \`cv_name\` VARCHAR(255) NOT NULL DEFAULT 'cv.pdf'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `)

      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`blogs\` (
          \`id\` VARCHAR(255) NOT NULL PRIMARY KEY,
          \`date\` DATETIME NOT NULL,
          \`title\` VARCHAR(500) NOT NULL,
          \`summary\` TEXT NOT NULL,
          \`content\` LONGTEXT NOT NULL,
          \`image\` LONGTEXT DEFAULT NULL,
          \`pdf\` LONGTEXT DEFAULT NULL,
          \`pdf_name\` VARCHAR(255) DEFAULT NULL,
          \`updated_at\` DATETIME DEFAULT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `)

      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`subscribers\` (
          \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
          \`created_at\` DATETIME NOT NULL,
          \`email\` VARCHAR(255) NOT NULL,
          \`name\` VARCHAR(255) DEFAULT NULL,
          \`company\` VARCHAR(255) DEFAULT NULL,
          \`phone\` VARCHAR(64) DEFAULT NULL,
          \`client_type\` VARCHAR(32) NOT NULL DEFAULT 'professional'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `)

      console.log("✅ Tables MySQL ORSAP vérifiées / créées avec succès.")

      // Check if blogs table is empty, auto-seed from JSON
      const [rows] = await connection.query("SELECT COUNT(*) AS cnt FROM `blogs`")
      if (rows[0].cnt === 0) {
        const initialBlogs = loadBlogsFromJSON()
        if (initialBlogs.length > 0) {
          console.log(`📥 Migration initiale de ${initialBlogs.length} articles vers MySQL...`)
          for (const blog of initialBlogs) {
            await connection.query(
              `INSERT INTO \`blogs\` (\`id\`, \`date\`, \`title\`, \`summary\`, \`content\`, \`image\`, \`pdf\`, \`pdf_name\`, \`updated_at\`)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE \`title\` = VALUES(\`title\`)`,
              [
                blog.id,
                blog.date ? new Date(blog.date) : new Date(),
                blog.title || "",
                blog.summary || "",
                blog.content || "",
                blog.image || null,
                blog.pdf || null,
                blog.pdfName || null,
                blog.updatedAt ? new Date(blog.updatedAt) : null,
              ]
            )
          }
          console.log("✅ Migration des articles vers MySQL terminée.")
        }
      }

      // Check if submissions table is empty, auto-seed from JSON if any
      const [subRows] = await connection.query("SELECT COUNT(*) AS cnt FROM `submissions`")
      if (subRows[0].cnt === 0) {
        const initialSubs = loadSubmissionsFromJSON()
        if (initialSubs.length > 0) {
          console.log(`📥 Migration de ${initialSubs.length} devis vers MySQL...`)
          for (const s of initialSubs) {
            await connection.query(
              `INSERT INTO \`submissions\` (\`id\`, \`created_at\`, \`client_type\`, \`name\`, \`company\`, \`email\`, \`phone\`, \`solutions\`, \`sectors\`, \`message\`)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                s.id,
                s.createdAt ? new Date(s.createdAt) : new Date(),
                s.clientType || "professional",
                s.name || "",
                s.company || null,
                s.email || null,
                s.phone || "",
                JSON.stringify(s.solutions || []),
                JSON.stringify(s.sectors || []),
                s.message || null,
              ]
            )
          }
        }
      }

      // Check if applications table is empty, auto-seed from JSON if any
      const [appRows] = await connection.query("SELECT COUNT(*) AS cnt FROM `applications`")
      if (appRows[0].cnt === 0) {
        const initialApps = loadApplicationsFromJSON()
        if (initialApps.length > 0) {
          console.log(`📥 Migration de ${initialApps.length} candidatures vers MySQL...`)
          for (const a of initialApps) {
            await connection.query(
              `INSERT INTO \`applications\` (\`id\`, \`created_at\`, \`name\`, \`email\`, \`phone\`, \`position\`, \`message\`, \`cv\`, \`cv_name\`)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                a.id,
                a.createdAt ? new Date(a.createdAt) : new Date(),
                a.name || "",
                a.email || "",
                a.phone || "",
                a.position || "",
                a.message || null,
                a.cv || "",
                a.cvName || "cv.pdf",
              ]
            )
          }
        }
      }

      // Check if subscribers table is empty, auto-seed from JSON if any
      const [subScriberRows] = await connection.query("SELECT COUNT(*) AS cnt FROM `subscribers`")
      if (subScriberRows[0].cnt === 0) {
        const initialSubscribers = loadSubscribersFromJSON()
        if (initialSubscribers.length > 0) {
          console.log(`📥 Migration de ${initialSubscribers.length} abonnés vers MySQL...`)
          for (const sub of initialSubscribers) {
            await connection.query(
              `INSERT INTO \`subscribers\` (\`id\`, \`created_at\`, \`email\`, \`name\`, \`company\`, \`phone\`, \`client_type\`)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                sub.id,
                sub.createdAt ? new Date(sub.createdAt) : new Date(),
                sub.email || "",
                sub.name || null,
                sub.company || null,
                sub.phone || null,
                sub.clientType || "professional",
              ]
            )
          }
        }
      }
    } finally {
      connection.release()
    }
  } catch (err) {
    console.error("❌ Erreur lors de l'initialisation de la base MySQL:", err)
  }
}

// ── JSON Helpers ────────────────────────────────────────────────────
function loadSubmissionsFromJSON() {
  if (!existsSync(DB_PATH)) return []
  try {
    return JSON.parse(readFileSync(DB_PATH, "utf-8"))
  } catch {
    return []
  }
}

function saveSubmissionsToJSON(data) {
  try {
    writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8")
  } catch (err) {
    console.error("❌ Erreur sauvegarde JSON submissions:", err)
  }
}

function loadBlogsFromJSON() {
  if (existsSync(BLOG_DB_PATH)) {
    try {
      const parsed = JSON.parse(readFileSync(BLOG_DB_PATH, "utf-8"))
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch {}
  }
  if (existsSync(BLOG_BACKUP_PATH)) {
    try {
      const backupParsed = JSON.parse(readFileSync(BLOG_BACKUP_PATH, "utf-8"))
      if (Array.isArray(backupParsed) && backupParsed.length > 0) return backupParsed
    } catch {}
  }
  return getBundledBlogs()
}

function saveBlogsToJSON(data) {
  if (!Array.isArray(data)) return
  try {
    const jsonStr = JSON.stringify(data, null, 2)
    writeFileSync(BLOG_DB_PATH, jsonStr, "utf-8")
    writeFileSync(BLOG_BACKUP_PATH, jsonStr, "utf-8")
  } catch (err) {
    console.error("❌ Erreur sauvegarde JSON blogs:", err)
  }
}

function loadApplicationsFromJSON() {
  if (!existsSync(APP_DB_PATH)) return []
  try {
    return JSON.parse(readFileSync(APP_DB_PATH, "utf-8"))
  } catch {
    return []
  }
}

function saveApplicationsToJSON(data) {
  try {
    writeFileSync(APP_DB_PATH, JSON.stringify(data, null, 2), "utf-8")
  } catch (err) {
    console.error("❌ Erreur sauvegarde JSON applications:", err)
  }
}

// ── Submissions API (Unified) ───────────────────────────────────────
export async function loadSubmissions() {
  if (pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM `submissions` ORDER BY `created_at` DESC")
      return rows.map((r) => ({
        id: r.id,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
        clientType: r.client_type,
        name: r.name,
        company: r.company,
        email: r.email,
        phone: r.phone,
        solutions: typeof r.solutions === "string" ? JSON.parse(r.solutions) : (r.solutions || []),
        sectors: typeof r.sectors === "string" ? JSON.parse(r.sectors) : (r.sectors || []),
        message: r.message,
      }))
    } catch (err) {
      console.error("❌ Erreur lecture submissions MySQL, repli sur JSON:", err.message)
    }
  }
  return loadSubmissionsFromJSON()
}

export async function saveSubmissions(data) {
  saveSubmissionsToJSON(data)
  if (pool && Array.isArray(data)) {
    try {
      // Overwrite or sync
      await pool.query("DELETE FROM `submissions`")
      for (const s of data) {
        await pool.query(
          `INSERT INTO ` +
            "`submissions` (`id`, `created_at`, `client_type`, `name`, `company`, `email`, `phone`, `solutions`, `sectors`, `message`)" +
            " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            s.id,
            s.createdAt ? new Date(s.createdAt) : new Date(),
            s.clientType || "professional",
            s.name || "",
            s.company || null,
            s.email || null,
            s.phone || "",
            JSON.stringify(s.solutions || []),
            JSON.stringify(s.sectors || []),
            s.message || null,
          ]
        )
      }
    } catch (err) {
      console.error("❌ Erreur saveSubmissions MySQL:", err.message)
    }
  }
}

export async function addSubmission(entry) {
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO \`submissions\` (\`id\`, \`created_at\`, \`client_type\`, \`name\`, \`company\`, \`email\`, \`phone\`, \`solutions\`, \`sectors\`, \`message\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.id,
          entry.createdAt ? new Date(entry.createdAt) : new Date(),
          entry.clientType || "professional",
          entry.name || "",
          entry.company || null,
          entry.email || null,
          entry.phone || "",
          JSON.stringify(entry.solutions || []),
          JSON.stringify(entry.sectors || []),
          entry.message || null,
        ]
      )
    } catch (err) {
      console.error("❌ Erreur addSubmission MySQL:", err.message)
    }
  }
  const subs = loadSubmissionsFromJSON()
  subs.unshift(entry)
  saveSubmissionsToJSON(subs)
}

export async function deleteSubmission(id) {
  if (pool) {
    try {
      const [res] = await pool.query("DELETE FROM `submissions` WHERE `id` = ?", [id])
      const subs = loadSubmissionsFromJSON().filter((s) => s.id !== id)
      saveSubmissionsToJSON(subs)
      return res.affectedRows > 0
    } catch (err) {
      console.error("❌ Erreur deleteSubmission MySQL:", err.message)
    }
  }
  const subs = loadSubmissionsFromJSON()
  const before = subs.length
  const filtered = subs.filter((s) => s.id !== id)
  saveSubmissionsToJSON(filtered)
  return filtered.length < before
}

// ── Applications API (Unified) ──────────────────────────────────────
export async function loadApplications() {
  if (pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM `applications` ORDER BY `created_at` DESC")
      return rows.map((r) => ({
        id: r.id,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
        name: r.name,
        email: r.email,
        phone: r.phone,
        position: r.position,
        message: r.message,
        cv: r.cv,
        cvName: r.cv_name,
      }))
    } catch (err) {
      console.error("❌ Erreur lecture applications MySQL, repli sur JSON:", err.message)
    }
  }
  return loadApplicationsFromJSON()
}

export async function saveApplications(data) {
  saveApplicationsToJSON(data)
  if (pool && Array.isArray(data)) {
    try {
      await pool.query("DELETE FROM `applications`")
      for (const a of data) {
        await pool.query(
          `INSERT INTO \`applications\` (\`id\`, \`created_at\`, \`name\`, \`email\`, \`phone\`, \`position\`, \`message\`, \`cv\`, \`cv_name\`)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            a.id,
            a.createdAt ? new Date(a.createdAt) : new Date(),
            a.name || "",
            a.email || "",
            a.phone || "",
            a.position || "",
            a.message || null,
            a.cv || "",
            a.cvName || "cv.pdf",
          ]
        )
      }
    } catch (err) {
      console.error("❌ Erreur saveApplications MySQL:", err.message)
    }
  }
}

export async function addApplication(entry) {
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO \`applications\` (\`id\`, \`created_at\`, \`name\`, \`email\`, \`phone\`, \`position\`, \`message\`, \`cv\`, \`cv_name\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.id,
          entry.createdAt ? new Date(entry.createdAt) : new Date(),
          entry.name || "",
          entry.email || "",
          entry.phone || "",
          entry.position || "",
          entry.message || null,
          entry.cv || "",
          entry.cvName || "cv.pdf",
        ]
      )
    } catch (err) {
      console.error("❌ Erreur addApplication MySQL:", err.message)
    }
  }
  const apps = loadApplicationsFromJSON()
  apps.unshift(entry)
  saveApplicationsToJSON(apps)
}

export async function deleteApplication(id) {
  if (pool) {
    try {
      const [res] = await pool.query("DELETE FROM `applications` WHERE `id` = ?", [id])
      const apps = loadApplicationsFromJSON().filter((a) => a.id !== id)
      saveApplicationsToJSON(apps)
      return res.affectedRows > 0
    } catch (err) {
      console.error("❌ Erreur deleteApplication MySQL:", err.message)
    }
  }
  const apps = loadApplicationsFromJSON()
  const before = apps.length
  const filtered = apps.filter((a) => a.id !== id)
  saveApplicationsToJSON(filtered)
  return filtered.length < before
}

// ── Blogs API (Unified) ─────────────────────────────────────────────
export async function loadBlogs() {
  if (pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM `blogs` ORDER BY `date` DESC")
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          date: r.date ? new Date(r.date).toISOString() : new Date().toISOString(),
          title: r.title,
          summary: r.summary,
          content: r.content,
          image: r.image,
          pdf: r.pdf,
          pdfName: r.pdf_name,
          updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : null,
        }))
      }
    } catch (err) {
      console.error("❌ Erreur lecture blogs MySQL, repli sur JSON:", err.message)
    }
  }
  return loadBlogsFromJSON()
}

export async function saveBlogs(data) {
  saveBlogsToJSON(data)
  if (pool && Array.isArray(data)) {
    try {
      await pool.query("DELETE FROM `blogs`")
      for (const b of data) {
        await pool.query(
          `INSERT INTO \`blogs\` (\`id\`, \`date\`, \`title\`, \`summary\`, \`content\`, \`image\`, \`pdf\`, \`pdf_name\`, \`updated_at\`)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            b.id,
            b.date ? new Date(b.date) : new Date(),
            b.title || "",
            b.summary || "",
            b.content || "",
            b.image || null,
            b.pdf || null,
            b.pdfName || null,
            b.updatedAt ? new Date(b.updatedAt) : null,
          ]
        )
      }
    } catch (err) {
      console.error("❌ Erreur saveBlogs MySQL:", err.message)
    }
  }
}

export async function addBlog(entry) {
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO \`blogs\` (\`id\`, \`date\`, \`title\`, \`summary\`, \`content\`, \`image\`, \`pdf\`, \`pdf_name\`, \`updated_at\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE \`title\` = VALUES(\`title\`), \`summary\` = VALUES(\`summary\`), \`content\` = VALUES(\`content\`), \`image\` = VALUES(\`image\`), \`pdf\` = VALUES(\`pdf\`), \`pdf_name\` = VALUES(\`pdf_name\`), \`updated_at\` = VALUES(\`updated_at\`)`,
        [
          entry.id,
          entry.date ? new Date(entry.date) : new Date(),
          entry.title || "",
          entry.summary || "",
          entry.content || "",
          entry.image || null,
          entry.pdf || null,
          entry.pdfName || null,
          entry.updatedAt ? new Date(entry.updatedAt) : null,
        ]
      )
    } catch (err) {
      console.error("❌ Erreur addBlog MySQL:", err.message)
    }
  }
  const blogs = loadBlogsFromJSON()
  blogs.unshift(entry)
  saveBlogsToJSON(blogs)
}

export async function updateBlog(id, updatedFields) {
  if (pool) {
    try {
      const [existing] = await pool.query("SELECT * FROM `blogs` WHERE `id` = ?", [id])
      if (existing.length > 0) {
        const cur = existing[0]
        const newTitle = updatedFields.title ?? cur.title
        const newSummary = updatedFields.summary ?? cur.summary
        const newContent = updatedFields.content ?? cur.content
        const newImage = updatedFields.image !== undefined ? updatedFields.image : cur.image
        const newPdf = updatedFields.pdf !== undefined ? updatedFields.pdf : cur.pdf
        const newPdfName = updatedFields.pdfName !== undefined ? updatedFields.pdfName : cur.pdf_name
        const newUpdatedAt = new Date()

        await pool.query(
          `UPDATE \`blogs\` SET \`title\` = ?, \`summary\` = ?, \`content\` = ?, \`image\` = ?, \`pdf\` = ?, \`pdf_name\` = ?, \`updated_at\` = ?
           WHERE \`id\` = ?`,
          [newTitle, newSummary, newContent, newImage, newPdf, newPdfName, newUpdatedAt, id]
        )
      }
    } catch (err) {
      console.error("❌ Erreur updateBlog MySQL:", err.message)
    }
  }
  const blogs = loadBlogsFromJSON()
  const idx = blogs.findIndex((b) => b.id === id)
  if (idx !== -1) {
    blogs[idx] = {
      ...blogs[idx],
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    }
    saveBlogsToJSON(blogs)
  }
}

export async function deleteBlog(id) {
  if (pool) {
    try {
      const [res] = await pool.query("DELETE FROM `blogs` WHERE `id` = ?", [id])
      const blogs = loadBlogsFromJSON().filter((b) => b.id !== id)
      saveBlogsToJSON(blogs)
      return res.affectedRows > 0
    } catch (err) {
      console.error("❌ Erreur deleteBlog MySQL:", err.message)
    }
  }
  const blogs = loadBlogsFromJSON()
  const before = blogs.length
  const filtered = blogs.filter((b) => b.id !== id)
  saveBlogsToJSON(filtered)
  return filtered.length < before
}

// ── Subscribers API (Unified) ───────────────────────────────────────
function loadSubscribersFromJSON() {
  if (!existsSync(SUB_DB_PATH)) return []
  try {
    return JSON.parse(readFileSync(SUB_DB_PATH, "utf-8"))
  } catch {
    return []
  }
}

function saveSubscribersToJSON(data) {
  try {
    writeFileSync(SUB_DB_PATH, JSON.stringify(data, null, 2), "utf-8")
  } catch (err) {
    console.error("❌ Erreur sauvegarde JSON subscribers:", err)
  }
}

export async function loadSubscribers() {
  if (pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM `subscribers` ORDER BY `created_at` DESC")
      return rows.map((r) => ({
        id: r.id,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
        email: r.email,
        name: r.name,
        company: r.company,
        phone: r.phone,
        clientType: r.client_type,
      }))
    } catch (err) {
      console.error("❌ Erreur lecture subscribers MySQL, repli sur JSON:", err.message)
    }
  }
  return loadSubscribersFromJSON()
}

export async function saveSubscribers(data) {
  saveSubscribersToJSON(data)
  if (pool && Array.isArray(data)) {
    try {
      await pool.query("DELETE FROM `subscribers`")
      for (const s of data) {
        await pool.query(
          `INSERT INTO \`subscribers\` (\`id\`, \`created_at\`, \`email\`, \`name\`, \`company\`, \`phone\`, \`client_type\`)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            s.id,
            s.createdAt ? new Date(s.createdAt) : new Date(),
            s.email || "",
            s.name || null,
            s.company || null,
            s.phone || null,
            s.clientType || "professional",
          ]
        )
      }
    } catch (err) {
      console.error("❌ Erreur saveSubscribers MySQL:", err.message)
    }
  }
}

export async function addSubscriber(entry) {
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO \`subscribers\` (\`id\`, \`created_at\`, \`email\`, \`name\`, \`company\`, \`phone\`, \`client_type\`)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.id,
          entry.createdAt ? new Date(entry.createdAt) : new Date(),
          entry.email || "",
          entry.name || null,
          entry.company || null,
          entry.phone || null,
          entry.clientType || "professional",
        ]
      )
    } catch (err) {
      console.error("❌ Erreur addSubscriber MySQL:", err.message)
    }
  }
  const subs = loadSubscribersFromJSON()
  // Avoid duplicate email at front if already exists
  const existingIdx = subs.findIndex((s) => s.email?.toLowerCase() === entry.email?.toLowerCase())
  if (existingIdx !== -1) {
    subs[existingIdx] = { ...subs[existingIdx], ...entry }
  } else {
    subs.unshift(entry)
  }
  saveSubscribersToJSON(subs)
}

export async function deleteSubscriber(id) {
  if (pool) {
    try {
      const [res] = await pool.query("DELETE FROM `subscribers` WHERE `id` = ?", [id])
      const subs = loadSubscribersFromJSON().filter((s) => s.id !== id)
      saveSubscribersToJSON(subs)
      return res.affectedRows > 0
    } catch (err) {
      console.error("❌ Erreur deleteSubscriber MySQL:", err.message)
    }
  }
  const subs = loadSubscribersFromJSON()
  const before = subs.length
  const filtered = subs.filter((s) => s.id !== id)
  saveSubscribersToJSON(filtered)
  return filtered.length < before
}

