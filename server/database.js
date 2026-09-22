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
const USERS_DB_PATH = join(DATA_DIR, "users.json")
const ARTICLES_DB_PATH = join(DATA_DIR, "articles.json")
const DEVIS_REQ_DB_PATH = join(DATA_DIR, "devis_requests.json")
const DEVIS_ITEMS_DB_PATH = join(DATA_DIR, "devis_items.json")
const ACTIVE_CARTS_DB_PATH = join(DATA_DIR, "active_carts.json")
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

      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`users\` (
          \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
          \`created_at\` DATETIME NOT NULL,
          \`email\` VARCHAR(255) NOT NULL UNIQUE,
          \`password_hash\` VARCHAR(255) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`company\` VARCHAR(255) DEFAULT NULL,
          \`phone\` VARCHAR(64) NOT NULL,
          \`client_type\` VARCHAR(32) NOT NULL DEFAULT 'professional',
          \`is_verified\` TINYINT(1) NOT NULL DEFAULT 0,
          \`verification_token\` VARCHAR(255) DEFAULT NULL,
          \`verification_code\` VARCHAR(10) DEFAULT NULL,
          \`verification_expires_at\` DATETIME DEFAULT NULL,
          \`reset_token\` VARCHAR(255) DEFAULT NULL,
          \`reset_expires_at\` DATETIME DEFAULT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `)

      // 6. Articles table (product catalogue)
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`articles\` (
          \`code\` VARCHAR(64) NOT NULL PRIMARY KEY,
          \`designation\` VARCHAR(500) NOT NULL,
          \`tva\` DECIMAL(5,2) NOT NULL DEFAULT 20.00,
          \`price_ht\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          \`price_ttc\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          \`rayon\` VARCHAR(255) NOT NULL DEFAULT '',
          \`famille\` VARCHAR(255) NOT NULL DEFAULT '',
          KEY \`idx_articles_rayon\` (\`rayon\`),
          KEY \`idx_articles_famille\` (\`famille\`),
          KEY \`idx_articles_designation\` (\`designation\`(191))
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `)

      // 7. Devis requests table (quotes submitted by clients)
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`devis_requests\` (
          \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
          \`created_at\` DATETIME NOT NULL,
          \`user_id\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`company\` VARCHAR(255) DEFAULT NULL,
          \`email\` VARCHAR(255) NOT NULL,
          \`phone\` VARCHAR(64) NOT NULL,
          \`note\` TEXT DEFAULT NULL,
          \`status\` VARCHAR(32) NOT NULL DEFAULT 'pending',
          KEY \`idx_devis_user\` (\`user_id\`),
          KEY \`idx_devis_created\` (\`created_at\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `)

      // 8. Devis items table (line items in a quote request)
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`devis_items\` (
          \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
          \`devis_id\` VARCHAR(64) NOT NULL,
          \`article_code\` VARCHAR(64) NOT NULL,
          \`designation\` VARCHAR(500) NOT NULL,
          \`quantity\` INT NOT NULL DEFAULT 1,
          \`price_ht\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          \`price_ttc\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          \`is_custom\` TINYINT(1) NOT NULL DEFAULT 0,
          KEY \`idx_items_devis\` (\`devis_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `)

      // 9. Active carts table (CRM leads & live cart sync)
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`active_carts\` (
          \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
          \`user_id\` VARCHAR(64) NOT NULL,
          \`created_at\` DATETIME NOT NULL,
          \`updated_at\` DATETIME NOT NULL,
          \`client_name\` VARCHAR(255) NOT NULL,
          \`client_email\` VARCHAR(255) NOT NULL,
          \`client_phone\` VARCHAR(64) NOT NULL,
          \`client_company\` VARCHAR(255) DEFAULT NULL,
          \`client_type\` VARCHAR(32) NOT NULL DEFAULT 'professional',
          \`total_count\` INT NOT NULL DEFAULT 0,
          \`total_ht\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          \`total_ttc\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          \`items\` JSON NOT NULL,
          \`status\` VARCHAR(32) NOT NULL DEFAULT 'cart_active',
          \`notes\` TEXT DEFAULT NULL,
          \`last_alert_sent_at\` DATETIME DEFAULT NULL,
          KEY \`idx_carts_user\` (\`user_id\`),
          KEY \`idx_carts_updated\` (\`updated_at\`),
          KEY \`idx_carts_status\` (\`status\`)
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

// ── Users Operations ────────────────────────────────────────────────
function loadUsersFromJSON() {
  try {
    if (existsSync(USERS_DB_PATH)) {
      const data = JSON.parse(readFileSync(USERS_DB_PATH, "utf-8"))
      return Array.isArray(data) ? data : []
    }
  } catch (err) {
    console.error("❌ Erreur lecture users.json:", err.message)
  }
  return []
}

function saveUsersToJSON(data) {
  try {
    writeFileSync(USERS_DB_PATH, JSON.stringify(data, null, 2), "utf-8")
  } catch (err) {
    console.error("❌ Erreur écriture users.json:", err.message)
  }
}

export async function loadUsers() {
  if (pool) {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM `users` ORDER BY `created_at` DESC"
      )
      return rows.map((r) => ({
        id: r.id,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        email: r.email,
        passwordHash: r.password_hash,
        name: r.name,
        company: r.company || null,
        phone: r.phone,
        clientType: r.client_type || "professional",
        isVerified: Boolean(r.is_verified),
        verificationToken: r.verification_token || null,
        verificationCode: r.verification_code || null,
        verificationExpiresAt: r.verification_expires_at ? new Date(r.verification_expires_at).toISOString() : null,
        resetToken: r.reset_token || null,
        resetExpiresAt: r.reset_expires_at ? new Date(r.reset_expires_at).toISOString() : null,
      }))
    } catch (err) {
      console.error("❌ Erreur loadUsers MySQL:", err.message)
    }
  }
  return loadUsersFromJSON()
}

export async function findUserByEmail(email) {
  if (!email) return null
  const cleanEmail = email.trim().toLowerCase()
  if (pool) {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM `users` WHERE LOWER(`email`) = ? LIMIT 1",
        [cleanEmail]
      )
      if (rows.length > 0) {
        const r = rows[0]
        return {
          id: r.id,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          email: r.email,
          passwordHash: r.password_hash,
          name: r.name,
          company: r.company || null,
          phone: r.phone,
          clientType: r.client_type || "professional",
          isVerified: Boolean(r.is_verified),
          verificationToken: r.verification_token || null,
          verificationCode: r.verification_code || null,
          verificationExpiresAt: r.verification_expires_at ? new Date(r.verification_expires_at).toISOString() : null,
          resetToken: r.reset_token || null,
          resetExpiresAt: r.reset_expires_at ? new Date(r.reset_expires_at).toISOString() : null,
        }
      }
      return null
    } catch (err) {
      console.error("❌ Erreur findUserByEmail MySQL:", err.message)
    }
  }
  const users = loadUsersFromJSON()
  return users.find((u) => u.email?.toLowerCase() === cleanEmail) || null
}

export async function findUserById(id) {
  if (!id) return null
  if (pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM `users` WHERE `id` = ? LIMIT 1", [id])
      if (rows.length > 0) {
        const r = rows[0]
        return {
          id: r.id,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          email: r.email,
          passwordHash: r.password_hash,
          name: r.name,
          company: r.company || null,
          phone: r.phone,
          clientType: r.client_type || "professional",
          isVerified: Boolean(r.is_verified),
          verificationToken: r.verification_token || null,
          verificationCode: r.verification_code || null,
          verificationExpiresAt: r.verification_expires_at ? new Date(r.verification_expires_at).toISOString() : null,
          resetToken: r.reset_token || null,
          resetExpiresAt: r.reset_expires_at ? new Date(r.reset_expires_at).toISOString() : null,
        }
      }
      return null
    } catch (err) {
      console.error("❌ Erreur findUserById MySQL:", err.message)
    }
  }
  const users = loadUsersFromJSON()
  return users.find((u) => u.id === id) || null
}

export async function findUserByToken(token) {
  if (!token) return null
  if (pool) {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM `users` WHERE `verification_token` = ? OR `reset_token` = ? LIMIT 1",
        [token, token]
      )
      if (rows.length > 0) {
        const r = rows[0]
        return {
          id: r.id,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          email: r.email,
          passwordHash: r.password_hash,
          name: r.name,
          company: r.company || null,
          phone: r.phone,
          clientType: r.client_type || "professional",
          isVerified: Boolean(r.is_verified),
          verificationToken: r.verification_token || null,
          verificationCode: r.verification_code || null,
          verificationExpiresAt: r.verification_expires_at ? new Date(r.verification_expires_at).toISOString() : null,
          resetToken: r.reset_token || null,
          resetExpiresAt: r.reset_expires_at ? new Date(r.reset_expires_at).toISOString() : null,
        }
      }
      return null
    } catch (err) {
      console.error("❌ Erreur findUserByToken MySQL:", err.message)
    }
  }
  const users = loadUsersFromJSON()
  return users.find((u) => u.verificationToken === token || u.resetToken === token) || null
}

export async function addUser(user) {
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO \`users\` (
          \`id\`, \`created_at\`, \`email\`, \`password_hash\`, \`name\`, \`company\`, \`phone\`,
          \`client_type\`, \`is_verified\`, \`verification_token\`, \`verification_code\`, \`verification_expires_at\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.createdAt ? new Date(user.createdAt) : new Date(),
          user.email.toLowerCase(),
          user.passwordHash,
          user.name,
          user.company || null,
          user.phone,
          user.clientType || "professional",
          user.isVerified ? 1 : 0,
          user.verificationToken || null,
          user.verificationCode || null,
          user.verificationExpiresAt ? new Date(user.verificationExpiresAt) : null,
        ]
      )
    } catch (err) {
      console.error("❌ Erreur addUser MySQL:", err.message)
    }
  }
  const users = loadUsersFromJSON()
  users.unshift(user)
  saveUsersToJSON(users)
}

export async function updateUser(user) {
  if (pool) {
    try {
      await pool.query(
        `UPDATE \`users\` SET
          \`email\` = ?,
          \`password_hash\` = ?,
          \`name\` = ?,
          \`company\` = ?,
          \`phone\` = ?,
          \`client_type\` = ?,
          \`is_verified\` = ?,
          \`verification_token\` = ?,
          \`verification_code\` = ?,
          \`verification_expires_at\` = ?,
          \`reset_token\` = ?,
          \`reset_expires_at\` = ?
        WHERE \`id\` = ?`,
        [
          user.email.toLowerCase(),
          user.passwordHash,
          user.name,
          user.company || null,
          user.phone,
          user.clientType || "professional",
          user.isVerified ? 1 : 0,
          user.verificationToken || null,
          user.verificationCode || null,
          user.verificationExpiresAt ? new Date(user.verificationExpiresAt) : null,
          user.resetToken || null,
          user.resetExpiresAt ? new Date(user.resetExpiresAt) : null,
          user.id,
        ]
      )
    } catch (err) {
      console.error("❌ Erreur updateUser MySQL:", err.message)
    }
  }
  const users = loadUsersFromJSON()
  const idx = users.findIndex((u) => u.id === user.id)
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...user }
    saveUsersToJSON(users)
  }
}

export async function deleteUser(id) {
  if (pool) {
    try {
      const [res] = await pool.query("DELETE FROM `users` WHERE `id` = ?", [id])
      const users = loadUsersFromJSON().filter((u) => u.id !== id)
      saveUsersToJSON(users)
      return res.affectedRows > 0
    } catch (err) {
      console.error("❌ Erreur deleteUser MySQL:", err.message)
    }
  }
  const users = loadUsersFromJSON()
  const before = users.length
  const filtered = users.filter((u) => u.id !== id)
  saveUsersToJSON(filtered)
  return filtered.length < before
}

// ── Article Catalogue (Espace Client search & devis builder) ────────

function loadArticlesFromJSON() {
  try {
    if (existsSync(ARTICLES_DB_PATH)) {
      const data = JSON.parse(readFileSync(ARTICLES_DB_PATH, "utf-8"))
      return Array.isArray(data) ? data : []
    }
  } catch (err) {
    console.error("❌ Erreur lecture articles.json:", err.message)
  }
  return []
}

let articlesCache = null

function getArticlesCache() {
  if (!articlesCache) {
    articlesCache = loadArticlesFromJSON()
    console.log(`📦 ${articlesCache.length} articles du catalogue chargés en mémoire.`)
  }
  return articlesCache
}

function normalizeArticleRow(r) {
  const tva = Number.isFinite(Number(r.tva)) ? Number(r.tva) : 20
  const priceTtc = Number.isFinite(Number(r.priceTtc)) ? Number(r.priceTtc) : 0
  const priceHt = Number.isFinite(Number(r.priceHt)) ? Number(r.priceHt) : (priceTtc > 0 ? Number((priceTtc / (1 + tva / 100)).toFixed(2)) : 0)
  return {
    code: String(r.code).trim(),
    designation: String(r.designation).trim(),
    tva,
    priceHt,
    priceTtc,
    rayon: String(r.rayon || "").trim(),
    famille: String(r.famille || "").trim(),
  }
}

export async function importArticles(rows) {
  const clean = (rows || [])
    .filter((r) => r && r.code && r.designation)
    .map(normalizeArticleRow)

  if (pool && clean.length > 0) {
    try {
      const chunkSize = 500
      for (let i = 0; i < clean.length; i += chunkSize) {
        const chunk = clean.slice(i, i + chunkSize)
        const placeholders = chunk.map(() => "(?, ?, ?, ?, ?, ?, ?)").join(", ")
        const params = chunk.flatMap((a) => [a.code, a.designation, a.tva, a.priceHt, a.priceTtc, a.rayon, a.famille])
        await pool.query(
          `INSERT INTO \`articles\` (\`code\`, \`designation\`, \`tva\`, \`price_ht\`, \`price_ttc\`, \`rayon\`, \`famille\`)
           VALUES ${placeholders}
           ON DUPLICATE KEY UPDATE
             \`designation\` = VALUES(\`designation\`),
             \`tva\` = VALUES(\`tva\`),
             \`price_ht\` = VALUES(\`price_ht\`),
             \`price_ttc\` = VALUES(\`price_ttc\`),
             \`rayon\` = VALUES(\`rayon\`),
             \`famille\` = VALUES(\`famille\`)`,
          params
        )
      }
      console.log(`✅ ${clean.length} articles importés/actualisés dans MySQL.`)
    } catch (err) {
      console.error("❌ Erreur importArticles MySQL:", err.message)
    }
  }

  const existing = loadArticlesFromJSON()
  const byCode = new Map(existing.map((a) => [a.code, a]))
  for (const a of clean) byCode.set(a.code, a)
  const merged = Array.from(byCode.values())
  writeFileSync(ARTICLES_DB_PATH, JSON.stringify(merged), "utf-8")
  articlesCache = merged

  return { imported: clean.length, total: merged.length }
}

export async function searchArticles({ q = "", rayon = "", famille = "", page = 1, pageSize = 24 } = {}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const size = Math.min(60, Math.max(1, parseInt(pageSize, 10) || 24))
  const offset = (pageNum - 1) * size
  const terms = String(q || "").trim().split(/\s+/).filter(Boolean).slice(0, 8)

  if (pool) {
    try {
      const where = []
      const params = []
      for (const t of terms) {
        where.push("(`designation` LIKE ? OR `code` LIKE ?)")
        params.push(`%${t}%`, `%${t}%`)
      }
      if (rayon) {
        where.push("`rayon` = ?")
        params.push(rayon)
      }
      if (famille) {
        where.push("`famille` = ?")
        params.push(famille)
      }
      const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : ""

      const [countRows] = await pool.query(`SELECT COUNT(*) AS cnt FROM \`articles\` ${whereSql}`, params)
      const total = countRows[0].cnt

      const [rows] = await pool.query(
        `SELECT \`code\`, \`designation\`, \`tva\`, \`price_ht\`, \`price_ttc\`, \`rayon\`, \`famille\`
         FROM \`articles\` ${whereSql}
         ORDER BY \`designation\` ASC
         LIMIT ? OFFSET ?`,
        [...params, size, offset]
      )

      return {
        items: rows.map((r) => ({
          code: r.code,
          designation: r.designation,
          tva: Number(r.tva),
          priceHt: Number(r.price_ht),
          priceTtc: Number(r.price_ttc),
          rayon: r.rayon,
          famille: r.famille,
        })),
        total,
        page: pageNum,
        pageSize: size,
      }
    } catch (err) {
      console.error("❌ Erreur searchArticles MySQL:", err.message)
    }
  }

  const all = getArticlesCache()
  const lowerTerms = terms.map((t) => t.toLowerCase())
  let filtered = all
  if (lowerTerms.length > 0) {
    filtered = filtered.filter((a) => {
      const hay = `${a.code} ${a.designation}`.toLowerCase()
      return lowerTerms.every((t) => hay.includes(t))
    })
  }
  if (rayon) filtered = filtered.filter((a) => a.rayon === rayon)
  if (famille) filtered = filtered.filter((a) => a.famille === famille)

  return {
    items: filtered.slice(offset, offset + size),
    total: filtered.length,
    page: pageNum,
    pageSize: size,
  }
}

export async function findArticleByCode(code) {
  if (!code) return null
  if (pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM `articles` WHERE `code` = ? LIMIT 1", [code])
      if (rows.length > 0) {
        const r = rows[0]
        return {
          code: r.code,
          designation: r.designation,
          tva: Number(r.tva),
          priceHt: Number(r.price_ht),
          priceTtc: Number(r.price_ttc),
          rayon: r.rayon,
          famille: r.famille,
        }
      }
      return null
    } catch (err) {
      console.error("❌ Erreur findArticleByCode MySQL:", err.message)
    }
  }
  return getArticlesCache().find((a) => a.code === code) || null
}

export async function countArticles() {
  if (pool) {
    try {
      const [rows] = await pool.query("SELECT COUNT(*) AS cnt FROM `articles`")
      return rows[0].cnt
    } catch (err) {
      console.error("❌ Erreur countArticles MySQL:", err.message)
    }
  }
  return getArticlesCache().length
}

export async function deleteArticle(code) {
  if (pool) {
    try {
      await pool.query("DELETE FROM `articles` WHERE `code` = ?", [code])
    } catch (err) {
      console.error("❌ Erreur deleteArticle MySQL:", err.message)
    }
  }
  const existing = loadArticlesFromJSON()
  const filtered = existing.filter((a) => a.code !== code)
  writeFileSync(ARTICLES_DB_PATH, JSON.stringify(filtered), "utf-8")
  articlesCache = filtered
  return filtered.length < existing.length
}

const FACETS_PRIORITY_ORDER = [
  "PROTECTION ET SECURITE (EPI)",
  "SIGNALISATION ET SECURITE CHANTIER",
  "ECHELLES ET ECHAFAUDAGES",
  "LEVAGE ET MANUTENTION",
  "OUTILLAGE ET RANGEMENT",
  "QUINCAILLERIE",
  "ELECTRICITE ET ECLAIRAGE",
  "DROGUERIE ET PEINTURE",
  "SANITAIRE ET ETANCHEITE",
  "LUMINAIRE",
  "JARDINAGE ET PLEIN AIR",
]

function sortRayonsByPriority(rayonsList) {
  return rayonsList.sort((a, b) => {
    const idxA = FACETS_PRIORITY_ORDER.indexOf(a.name)
    const idxB = FACETS_PRIORITY_ORDER.indexOf(b.name)
    if (idxA !== -1 && idxB !== -1) return idxA - idxB
    if (idxA !== -1) return -1
    if (idxB !== -1) return 1
    return b.count - a.count
  })
}

export async function getArticleFacets() {
  if (pool) {
    try {
      const [rows] = await pool.query(
        "SELECT `rayon`, `famille`, COUNT(*) AS cnt FROM `articles` GROUP BY `rayon`, `famille`"
      )
      const rayonMap = new Map()
      const familles = []
      for (const r of rows) {
        rayonMap.set(r.rayon, (rayonMap.get(r.rayon) || 0) + r.cnt)
        familles.push({ name: r.famille, rayon: r.rayon, count: r.cnt })
      }
      const sortedRayons = sortRayonsByPriority(
        Array.from(rayonMap.entries()).map(([name, count]) => ({ name, count }))
      )
      return {
        rayons: sortedRayons,
        familles: familles.sort((a, b) => b.count - a.count),
      }
    } catch (err) {
      console.error("❌ Erreur getArticleFacets MySQL:", err.message)
    }
  }

  const all = getArticlesCache()
  const rayonMap = new Map()
  const familleMap = new Map()
  for (const a of all) {
    if (a.rayon) {
      rayonMap.set(a.rayon, (rayonMap.get(a.rayon) || 0) + 1)
    }
    if (a.rayon && a.famille) {
      const key = `${a.rayon}|||${a.famille}`
      familleMap.set(key, (familleMap.get(key) || 0) + 1)
    }
  }
  const sortedRayons = sortRayonsByPriority(
    Array.from(rayonMap.entries()).map(([name, count]) => ({ name, count }))
  )
  return {
    rayons: sortedRayons,
    familles: Array.from(familleMap.entries())
      .map(([key, count]) => {
        const [rayon, name] = key.split("|||")
        return { name, rayon, count }
      })
      .sort((a, b) => b.count - a.count),
  }
}

// ── Itemized Devis Requests ─────────────────────────────────────────

function loadDevisRequestsFromJSON() {
  try {
    if (existsSync(DEVIS_REQ_DB_PATH)) {
      const data = JSON.parse(readFileSync(DEVIS_REQ_DB_PATH, "utf-8"))
      return Array.isArray(data) ? data : []
    }
  } catch (err) {
    console.error("❌ Erreur lecture devis_requests.json:", err.message)
  }
  return []
}

function saveDevisRequestsToJSON(data) {
  try {
    writeFileSync(DEVIS_REQ_DB_PATH, JSON.stringify(data, null, 2), "utf-8")
  } catch (err) {
    console.error("❌ Erreur écriture devis_requests.json:", err.message)
  }
}

function loadDevisItemsFromJSON() {
  try {
    if (existsSync(DEVIS_ITEMS_DB_PATH)) {
      const data = JSON.parse(readFileSync(DEVIS_ITEMS_DB_PATH, "utf-8"))
      return Array.isArray(data) ? data : []
    }
  } catch (err) {
    console.error("❌ Erreur lecture devis_items.json:", err.message)
  }
  return []
}

function saveDevisItemsToJSON(data) {
  try {
    writeFileSync(DEVIS_ITEMS_DB_PATH, JSON.stringify(data, null, 2), "utf-8")
  } catch (err) {
    console.error("❌ Erreur écriture devis_items.json:", err.message)
  }
}

function mapDevisRequestRow(r) {
  return {
    id: r.id,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    userId: r.user_id,
    name: r.name,
    company: r.company || null,
    email: r.email,
    phone: r.phone,
    note: r.note || null,
    status: r.status || "pending",
  }
}

async function attachDevisItems(requests) {
  if (requests.length === 0) return requests

  if (pool) {
    try {
      const ids = requests.map((r) => r.id)
      const [rows] = await pool.query(
        `SELECT * FROM \`devis_items\` WHERE \`devis_id\` IN (${ids.map(() => "?").join(",")})`,
        ids
      )
      const itemsByDevis = new Map()
      for (const r of rows) {
        const arr = itemsByDevis.get(r.devis_id) || []
        arr.push({
          id: r.id,
          articleCode: r.article_code,
          designation: r.designation,
          quantity: r.quantity,
          priceHt: Number(r.price_ht),
          priceTtc: Number(r.price_ttc),
          isCustom: Boolean(r.is_custom),
        })
        itemsByDevis.set(r.devis_id, arr)
      }
      return requests.map((r) => ({ ...r, items: itemsByDevis.get(r.id) || [] }))
    } catch (err) {
      console.error("❌ Erreur attachDevisItems MySQL:", err.message)
    }
  }

  const allItems = loadDevisItemsFromJSON()
  const itemsByDevis = new Map()
  for (const it of allItems) {
    const arr = itemsByDevis.get(it.devisId) || []
    arr.push(it)
    itemsByDevis.set(it.devisId, arr)
  }
  return requests.map((r) => ({ ...r, items: itemsByDevis.get(r.id) || [] }))
}

export async function createDevisRequest(entry, items) {
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO \`devis_requests\` (\`id\`, \`created_at\`, \`user_id\`, \`name\`, \`company\`, \`email\`, \`phone\`, \`note\`, \`status\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.id,
          entry.createdAt ? new Date(entry.createdAt) : new Date(),
          entry.userId,
          entry.name,
          entry.company || null,
          entry.email,
          entry.phone,
          entry.note || null,
          entry.status || "pending",
        ]
      )
      for (const it of items) {
        await pool.query(
          `INSERT INTO \`devis_items\` (\`id\`, \`devis_id\`, \`article_code\`, \`designation\`, \`quantity\`, \`price_ht\`, \`price_ttc\`, \`is_custom\`)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [it.id, entry.id, it.articleCode, it.designation, it.quantity, it.priceHt || 0, it.priceTtc || 0, it.isCustom ? 1 : 0]
        )
      }
    } catch (err) {
      console.error("❌ Erreur createDevisRequest MySQL:", err.message)
    }
  }

  const reqs = loadDevisRequestsFromJSON()
  reqs.unshift(entry)
  saveDevisRequestsToJSON(reqs)

  const allItems = loadDevisItemsFromJSON()
  allItems.push(...items.map((it) => ({ ...it, devisId: entry.id })))
  saveDevisItemsToJSON(allItems)
}

export async function loadDevisRequestsForUser(userId, email = null) {
  if (pool) {
    try {
      const emailClean = email ? String(email).trim().toLowerCase() : null
      const [rows] = await pool.query(
        "SELECT * FROM `devis_requests` WHERE `user_id` = ? OR (`email` IS NOT NULL AND LOWER(`email`) = ?) ORDER BY `created_at` DESC",
        [userId, emailClean || ""]
      )
      return attachDevisItems(rows.map(mapDevisRequestRow))
    } catch (err) {
      console.error("❌ Erreur loadDevisRequestsForUser MySQL:", err.message)
    }
  }
  const requests = loadDevisRequestsFromJSON().filter((r) => {
    if (r.userId === userId) return true
    if (email && r.email && r.email.toLowerCase() === email.toLowerCase()) return true
    return false
  })
  return attachDevisItems(requests)
}

export async function loadAllDevisRequests() {
  if (pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM `devis_requests` ORDER BY `created_at` DESC")
      return attachDevisItems(rows.map(mapDevisRequestRow))
    } catch (err) {
      console.error("❌ Erreur loadAllDevisRequests MySQL:", err.message)
    }
  }
  return attachDevisItems(loadDevisRequestsFromJSON())
}

export async function deleteDevisRequest(id) {
  if (pool) {
    try {
      const [res] = await pool.query("DELETE FROM `devis_requests` WHERE `id` = ?", [id])
      await pool.query("DELETE FROM `devis_items` WHERE `devis_id` = ?", [id])
      const reqs = loadDevisRequestsFromJSON().filter((r) => r.id !== id)
      saveDevisRequestsToJSON(reqs)
      const items = loadDevisItemsFromJSON().filter((it) => it.devisId !== id)
      saveDevisItemsToJSON(items)
      return res.affectedRows > 0
    } catch (err) {
      console.error("❌ Erreur deleteDevisRequest MySQL:", err.message)
    }
  }
  const reqs = loadDevisRequestsFromJSON()
  const before = reqs.length
  const filteredReqs = reqs.filter((r) => r.id !== id)
  saveDevisRequestsToJSON(filteredReqs)
  const items = loadDevisItemsFromJSON().filter((it) => it.devisId !== id)
  saveDevisItemsToJSON(items)
  return filteredReqs.length < before
}

// ── CRM & Active Carts Management ────────────────────────────────────

function loadActiveCartsFromJSON() {
  if (!existsSync(ACTIVE_CARTS_DB_PATH)) return []
  try {
    const raw = readFileSync(ACTIVE_CARTS_DB_PATH, "utf-8")
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.error("❌ Erreur lecture active_carts.json:", err.message)
    return []
  }
}

function saveActiveCartsToJSON(carts) {
  try {
    writeFileSync(ACTIVE_CARTS_DB_PATH, JSON.stringify(carts, null, 2), "utf-8")
  } catch (err) {
    console.error("❌ Erreur écriture active_carts.json:", err.message)
  }
}

function mapActiveCartRow(row) {
  if (!row) return null
  let items = []
  if (row.items) {
    try {
      items = typeof row.items === "string" ? JSON.parse(row.items) : row.items
    } catch {}
  }
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientPhone: row.client_phone,
    clientCompany: row.client_company,
    clientType: row.client_type || "professional",
    totalCount: Number(row.total_count) || (Array.isArray(items) ? items.reduce((s, it) => s + (it.quantity || 1), 0) : 0),
    totalHt: Number(row.total_ht) || 0,
    totalTtc: Number(row.total_ttc) || 0,
    items: Array.isArray(items) ? items : [],
    status: row.status || "cart_active",
    notes: row.notes || "",
    lastAlertSentAt: row.last_alert_sent_at instanceof Date ? row.last_alert_sent_at.toISOString() : row.last_alert_sent_at,
  }
}

export async function saveActiveCart({ userId, clientName, clientEmail, clientPhone, clientCompany, clientType, items, totalCount, totalHt, totalTtc }) {
  const now = new Date()
  const nowIso = now.toISOString()
  const cleanItems = Array.isArray(items) ? items : []
  const count = Number(totalCount) || cleanItems.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0)
  const ht = Number(totalHt) || cleanItems.reduce((sum, it) => sum + (Number(it.priceHt) || 0) * (Number(it.quantity) || 1), 0)
  const ttc = Number(totalTtc) || cleanItems.reduce((sum, it) => sum + (Number(it.priceTtc) || 0) * (Number(it.quantity) || 1), 0)

  // Load existing cart if any
  const existing = await loadActiveCartForUser(userId)
  const id = existing?.id || `cart_${userId}`
  const createdAt = existing?.createdAt || nowIso
  const status = existing?.status || "cart_active"
  const notes = existing?.notes || ""
  const lastAlertSentAt = existing?.lastAlertSentAt || null

  const cartRecord = {
    id,
    userId,
    createdAt,
    updatedAt: nowIso,
    clientName: clientName || existing?.clientName || "Client Espace Pro",
    clientEmail: clientEmail || existing?.clientEmail || "",
    clientPhone: clientPhone || existing?.clientPhone || "",
    clientCompany: clientCompany || existing?.clientCompany || null,
    clientType: clientType || existing?.clientType || "professional",
    totalCount: count,
    totalHt: ht,
    totalTtc: ttc,
    items: cleanItems,
    status,
    notes,
    lastAlertSentAt,
  }

  if (pool) {
    try {
      await pool.query(
        `INSERT INTO \`active_carts\` 
          (\`id\`, \`user_id\`, \`created_at\`, \`updated_at\`, \`client_name\`, \`client_email\`, \`client_phone\`, \`client_company\`, \`client_type\`, \`total_count\`, \`total_ht\`, \`total_ttc\`, \`items\`, \`status\`, \`notes\`, \`last_alert_sent_at\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
          \`updated_at\` = VALUES(\`updated_at\`),
          \`client_name\` = VALUES(\`client_name\`),
          \`client_email\` = VALUES(\`client_email\`),
          \`client_phone\` = VALUES(\`client_phone\`),
          \`client_company\` = VALUES(\`client_company\`),
          \`client_type\` = VALUES(\`client_type\`),
          \`total_count\` = VALUES(\`total_count\`),
          \`total_ht\` = VALUES(\`total_ht\`),
          \`total_ttc\` = VALUES(\`total_ttc\`),
          \`items\` = VALUES(\`items\`)`,
        [
          cartRecord.id,
          cartRecord.userId,
          new Date(cartRecord.createdAt),
          now,
          cartRecord.clientName,
          cartRecord.clientEmail,
          cartRecord.clientPhone,
          cartRecord.clientCompany,
          cartRecord.clientType,
          cartRecord.totalCount,
          cartRecord.totalHt,
          cartRecord.totalTtc,
          JSON.stringify(cartRecord.items),
          cartRecord.status,
          cartRecord.notes,
          cartRecord.lastAlertSentAt ? new Date(cartRecord.lastAlertSentAt) : null,
        ]
      )
    } catch (err) {
      console.error("❌ Erreur saveActiveCart MySQL:", err.message)
    }
  }

  const allCarts = loadActiveCartsFromJSON().filter((c) => c.userId !== userId && c.id !== id)
  allCarts.unshift(cartRecord)
  saveActiveCartsToJSON(allCarts)

  return cartRecord
}

export async function loadAllActiveCarts() {
  if (pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM `active_carts` ORDER BY `updated_at` DESC")
      return rows.map(mapActiveCartRow)
    } catch (err) {
      console.error("❌ Erreur loadAllActiveCarts MySQL:", err.message)
    }
  }
  return loadActiveCartsFromJSON()
}

export async function loadActiveCartForUser(userId) {
  if (!userId) return null
  if (pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM `active_carts` WHERE `user_id` = ? LIMIT 1", [userId])
      if (rows && rows.length > 0) return mapActiveCartRow(rows[0])
    } catch (err) {
      console.error("❌ Erreur loadActiveCartForUser MySQL:", err.message)
    }
  }
  const all = loadActiveCartsFromJSON()
  return all.find((c) => c.userId === userId) || null
}

export async function updateCrmCartStatus(id, { status, notes }) {
  const now = new Date()
  if (pool) {
    try {
      const updates = []
      const params = []
      if (status !== undefined) {
        updates.push("`status` = ?")
        params.push(status)
      }
      if (notes !== undefined) {
        updates.push("`notes` = ?")
        params.push(notes)
      }
      if (updates.length > 0) {
        updates.push("`updated_at` = ?")
        params.push(now)
        params.push(id)
        await pool.query(`UPDATE \`active_carts\` SET ${updates.join(", ")} WHERE \`id\` = ?`, params)
      }
    } catch (err) {
      console.error("❌ Erreur updateCrmCartStatus MySQL:", err.message)
    }
  }

  const all = loadActiveCartsFromJSON()
  const idx = all.findIndex((c) => c.id === id || c.userId === id)
  if (idx !== -1) {
    if (status !== undefined) all[idx].status = status
    if (notes !== undefined) all[idx].notes = notes
    all[idx].updatedAt = now.toISOString()
    saveActiveCartsToJSON(all)
    return all[idx]
  }
  return null
}

export async function markCartAlertSent(id) {
  const now = new Date()
  if (pool) {
    try {
      await pool.query("UPDATE `active_carts` SET `last_alert_sent_at` = ? WHERE `id` = ?", [now, id])
    } catch (err) {
      console.error("❌ Erreur markCartAlertSent MySQL:", err.message)
    }
  }
  const all = loadActiveCartsFromJSON()
  const idx = all.findIndex((c) => c.id === id || c.userId === id)
  if (idx !== -1) {
    all[idx].lastAlertSentAt = now.toISOString()
    saveActiveCartsToJSON(all)
  }
}

export async function deleteActiveCart(id) {
  if (pool) {
    try {
      const [res] = await pool.query("DELETE FROM `active_carts` WHERE `id` = ? OR `user_id` = ?", [id, id])
      const all = loadActiveCartsFromJSON().filter((c) => c.id !== id && c.userId !== id)
      saveActiveCartsToJSON(all)
      return res.affectedRows > 0
    } catch (err) {
      console.error("❌ Erreur deleteActiveCart MySQL:", err.message)
    }
  }
  const all = loadActiveCartsFromJSON()
  const before = all.length
  const filtered = all.filter((c) => c.id !== id && c.userId !== id)
  saveActiveCartsToJSON(filtered)
  return filtered.length < before
}



