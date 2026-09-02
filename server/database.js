import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
// The database is located in the root 'data' folder (one level above this server folder)
const DATA_DIR = process.env.DATA_DIR || join(__dirname, "..", "data")
const DB_PATH = join(DATA_DIR, "submissions.json")
const BLOG_DB_PATH = join(DATA_DIR, "blogs.json")
const BLOG_BACKUP_PATH = join(DATA_DIR, "blogs.backup.json")
const BACKUP_DIR = join(DATA_DIR, "backups")

// Ensure data and backup directories exist
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}
if (!existsSync(BACKUP_DIR)) {
  mkdirSync(BACKUP_DIR, { recursive: true })
}

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

export function loadSubmissions() {
  if (!existsSync(DB_PATH)) return []
  try {
    return JSON.parse(readFileSync(DB_PATH, "utf-8"))
  } catch {
    return []
  }
}

export function saveSubmissions(data) {
  try {
    writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8")
  } catch (err) {
    console.error("❌ Erreur sauvegarde submissions:", err)
  }
}

function isLegacySeedOnly(blogs) {
  if (!Array.isArray(blogs) || blogs.length === 0) return true
  const dummyIds = new Set(["echafaudage-securite-maroc", "optimiser-air-comprime"])
  return blogs.every((b) => dummyIds.has(b.id))
}

export function loadBlogs() {
  // 1. Try reading primary blog database
  if (existsSync(BLOG_DB_PATH)) {
    try {
      const content = readFileSync(BLOG_DB_PATH, "utf-8")
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed) && parsed.length > 0 && !isLegacySeedOnly(parsed)) {
        return parsed
      }
    } catch (err) {
      console.warn("⚠️  Attention: Erreur lecture blogs.json, tentative de secours via backup...", err.message)
    }
  }

  // 2. Try reading backup if primary is empty or unreadable
  if (existsSync(BLOG_BACKUP_PATH)) {
    try {
      const backupContent = readFileSync(BLOG_BACKUP_PATH, "utf-8")
      const backupParsed = JSON.parse(backupContent)
      if (Array.isArray(backupParsed) && backupParsed.length > 0 && !isLegacySeedOnly(backupParsed)) {
        console.log("✅  Restauration automatique depuis blogs.backup.json réussie.")
        saveBlogs(backupParsed)
        return backupParsed
      }
    } catch {
      // ignore backup parse failure
    }
  }

  // 3. Fallback to bundled repository blogs (the 2 real uploaded articles with PDFs)
  const bundled = getBundledBlogs()
  if (bundled.length > 0) {
    console.log(`✅  Restauration automatique depuis les articles réels du dépôt (${bundled.length} articles).`)
    saveBlogs(bundled)
    return bundled
  }

  return []
}

export function saveBlogs(data) {
  if (!Array.isArray(data)) return
  try {
    const jsonStr = JSON.stringify(data, null, 2)
    // Write primary database file
    writeFileSync(BLOG_DB_PATH, jsonStr, "utf-8")
    // Write redundant backup file
    writeFileSync(BLOG_BACKUP_PATH, jsonStr, "utf-8")
    // Also sync to repo data path if different
    if (REPO_DATA_PATH !== BLOG_DB_PATH) {
      try {
        writeFileSync(REPO_DATA_PATH, jsonStr, "utf-8")
        writeFileSync(REPO_BACKUP_PATH, jsonStr, "utf-8")
      } catch {}
    }
  } catch (err) {
    console.error("❌ Erreur sauvegarde blogs:", err)
  }
}

const APP_DB_PATH = join(DATA_DIR, "applications.json")

export function loadApplications() {
  if (!existsSync(APP_DB_PATH)) return []
  try {
    return JSON.parse(readFileSync(APP_DB_PATH, "utf-8"))
  } catch {
    return []
  }
}

export function saveApplications(data) {
  writeFileSync(APP_DB_PATH, JSON.stringify(data, null, 2), "utf-8")
}
