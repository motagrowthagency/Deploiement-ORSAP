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

// Initial seed blog articles
export const SEED_BLOGS = [
  {
    id: "echafaudage-securite-maroc",
    date: new Date().toISOString(),
    title: "Sécurité & Conformité des Échafaudages en Milieu Industriel",
    summary:
      "Découvrez les normes de sécurité en vigueur au Maroc pour le montage et l'utilisation d'échafaudages sur vos chantiers et sites industriels.",
    content: `Le travail en hauteur reste l'une des principales causes d'accidents du travail dans le secteur de la construction et de l'industrie. L'utilisation d'échafaudages non conformes ou mal montés présente des risques majeurs. C'est pourquoi la conformité aux normes est un enjeu crucial pour toute entreprise soucieuse de la sécurité de ses collaborateurs.

Au Maroc, la réglementation impose des contrôles réguliers et l'utilisation d'équipements homologués. Chez ORSAP, tous nos échafaudages fixes et roulants répondent aux critères de sécurité les plus stricts.

Les règles d'or pour un chantier sécurisé :
1. Vérification de la stabilité du sol avant le montage.
2. Utilisation systématique de garde-corps et de plinthes de sécurité.
3. Respect strict de la charge maximale d'utilisation (CMU) indiquée par le fabricant.
4. Formation adéquate du personnel au montage et au démontage de la structure.

N'hésitez pas à contacter nos conseillers pour auditer vos besoins en échafaudages professionnels.`,
    image: null,
  },
  {
    id: "optimiser-air-comprime",
    date: new Date().toISOString(),
    title: "Comment optimiser l'efficacité de vos réseaux d'air comprimé ?",
    summary:
      "L'air comprimé est une ressource énergétique coûteuse. Voici 4 étapes clés pour détecter les fuites et optimiser le rendement de vos compresseurs.",
    content: `L'air comprimé est souvent qualifié de 'quatrième fluide' dans le secteur industriel. Cependant, c'est aussi l'une des formes d'énergie les plus coûteuses à produire. On estime qu'en moyenne, 20 à 30 % de la consommation électrique d'une usine est dédiée à la compression de l'air, et qu'une part importante de cette énergie est perdue sous forme de fuites.

Optimiser son réseau d'air comprimé permet non seulement de réduire sa facture d'électricité, mais aussi de prolonger la durée de vie des équipements.

Les 4 actions prioritaires à mener :
- La détection et la réparation méthodique des fuites d'air sur l'ensemble du réseau de distribution.
- Le réglage optimal de la pression de service (réduire la pression de 1 bar permet d'économiser environ 7% d'énergie).
- La mise en place d'un système de récupération de chaleur sur le compresseur pour chauffer l'eau ou les locaux.
- Un entretien rigoureux des filtres pour éviter les pertes de charge inutiles.

Chez ORSAP, nous proposons une large gamme de compresseurs industriels de dernière génération, équipés de variateurs de vitesse pour s'adapter précisément à votre consommation réelle.`,
    image: null,
  },
]

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

export function loadBlogs() {
  // 1. Try reading primary blog database
  if (existsSync(BLOG_DB_PATH)) {
    try {
      const content = readFileSync(BLOG_DB_PATH, "utf-8")
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed) && parsed.length > 0) {
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
      if (Array.isArray(backupParsed) && backupParsed.length > 0) {
        console.log("✅  Restauration automatique depuis blogs.backup.json réussie.")
        saveBlogs(backupParsed)
        return backupParsed
      }
    } catch {
      // ignore backup parse failure
    }
  }

  // 3. First-run fallback only
  saveBlogs(SEED_BLOGS)
  return SEED_BLOGS
}

export function saveBlogs(data) {
  if (!Array.isArray(data)) return
  try {
    const jsonStr = JSON.stringify(data, null, 2)
    // Write primary database file
    writeFileSync(BLOG_DB_PATH, jsonStr, "utf-8")
    // Write redundant backup file
    writeFileSync(BLOG_BACKUP_PATH, jsonStr, "utf-8")
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
