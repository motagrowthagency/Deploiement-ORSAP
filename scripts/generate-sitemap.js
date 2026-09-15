import { writeFileSync, readFileSync, existsSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, "..")

const BASE_URL = "https://orsap.ma"
const currentDate = new Date().toISOString().split("T")[0]

const staticRoutes = [
  { url: "/", priority: "1.0", changefreq: "weekly" },
  { url: "/solutions", priority: "0.9", changefreq: "weekly" },
  { url: "/services", priority: "0.9", changefreq: "monthly" },
  { url: "/a-propos", priority: "0.7", changefreq: "monthly" },
  { url: "/devis", priority: "0.9", changefreq: "monthly" },
  { url: "/contact", priority: "0.8", changefreq: "monthly" },
  { url: "/marques", priority: "0.8", changefreq: "monthly" },
  { url: "/temoignages", priority: "0.7", changefreq: "monthly" },
  { url: "/blog", priority: "0.9", changefreq: "daily" },
  { url: "/blog/prevention", priority: "0.8", changefreq: "weekly" },
  { url: "/blog/prevention/ergonomie", priority: "0.8", changefreq: "weekly" },
  { url: "/blog/prevention/tms", priority: "0.8", changefreq: "weekly" },
  { url: "/recrutement", priority: "0.6", changefreq: "monthly" },
  { url: "/espace-client", priority: "0.5", changefreq: "monthly" },
]

// Solutions slugs
const solutionSlugs = [
  "epi",
  "epi/btp",
  "epi/casques",
  "epi/chaussures-securite",
  "epi/gants",
  "epi/gants/anti-coupure",
  "epi/gants/manutention",
  "epi/protection-auditive",
  "epi/protection-respiratoire",
  "epi/protection-yeux",
  "travail-en-hauteur",
  "travail-en-hauteur/ancrages",
  "travail-en-hauteur/harnais",
  "travail-en-hauteur/lignes-de-vie",
  "travail-en-hauteur/longes",
  "vetements-professionnels",
  "vetements-professionnels/pantalons",
  "vetements-professionnels/ete",
  "vetements-professionnels/intemperies",
  "vetements-professionnels/haute-visibilite",
  "vetements-professionnels/multirisques",
  "manutention",
  "manutention/transpalettes",
  "manutention/transpalettes-electriques",
  "manutention/gerbeurs",
  "manutention/levage",
  "logistique",
  "outillage",
  "roulements",
  "jardinage",
  "consommables",
  "luminaires",
  "climatisation",
  "electricite",
  "quincaillerie",
  "revetements"
]

// Services slugs
const serviceSlugs = [
  "importation-distribution",
  "etudes-realisations",
  "maintenance-sav",
  "revetements-sols-murs",
  "plomberie-fluides",
  "climatisation",
  "amenagement-ateliers"
]

// Brand slugs
const brandSlugs = [
  "facom", "bosch", "delta-plus", "petzl", "snickers-workwear", 
  "portwest", "3m", "ansell", "uvex", "honeywell", "dewalt", "makita"
]

// Extract blog posts from data/blogs.json or src/data/blogs.ts
let blogIds = []
const blogsJsonPath = resolve(rootDir, "data/blogs.json")
if (existsSync(blogsJsonPath)) {
  try {
    const blogs = JSON.parse(readFileSync(blogsJsonPath, "utf-8"))
    blogIds = blogs.map(b => b.id)
  } catch (err) {
    console.error("Error reading blogs.json:", err)
  }
}

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`

for (const route of staticRoutes) {
  xml += `  <url>\n    <loc>${BASE_URL}${route.url}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>\n`
}

for (const slug of solutionSlugs) {
  xml += `  <url>\n    <loc>${BASE_URL}/solutions/${slug}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.85</priority>\n  </url>\n`
}

for (const slug of serviceSlugs) {
  xml += `  <url>\n    <loc>${BASE_URL}/services/${slug}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.80</priority>\n  </url>\n`
}

for (const slug of brandSlugs) {
  xml += `  <url>\n    <loc>${BASE_URL}/marques/${slug}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.70</priority>\n  </url>\n`
}

for (const id of blogIds) {
  xml += `  <url>\n    <loc>${BASE_URL}/blog/${id}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.75</priority>\n  </url>\n`
}

xml += `</urlset>\n`

const sitemapPath = resolve(rootDir, "public/sitemap.xml")
writeFileSync(sitemapPath, xml, "utf-8")
console.log(`Generated sitemap.xml with ${staticRoutes.length + solutionSlugs.length + serviceSlugs.length + brandSlugs.length + blogIds.length} URLs.`)
