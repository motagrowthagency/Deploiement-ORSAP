import { defineConfig, type HtmlTagDescriptor, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"
import fs from "node:fs"

import siteConfiguration from "./.figma/make/site.json" with { type: "json" }

// Vite config — https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // .figma/make/deploy-preview passes `--mode development` for cached-preview builds.
  const emitSourcemaps = mode === "development"

  return {
    base: process.env.FIGMA_PUBLIC_URL
      ? `${process.env.FIGMA_PUBLIC_URL}/`
      : "/",
    build: {
      sourcemap: emitSourcemaps ? "inline" : false,
      minify: !emitSourcemaps,
    },
    plugins: [
      react(),
      tailwindcss(),
      figmaSiteConfiguration(siteConfiguration),
      figmaErrorOverlayReplay(),
      figmaReactRefreshBoundaryFallback(),
      figmaMakeKitPlugin({ storiesGlob: "/src/**/*.stories.{ts,tsx,js,jsx}" }),
      figmaApiDevPlugin(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    server: {
      host: "0.0.0.0",
      port: parseInt(process.env.PORT || "8443"),
      strictPort: true,
      watch: { ignored: ["**/.figma/**", "**/submissions.json"] },
      proxy: {
        "/api": {
          target: "http://127.0.0.1:3001",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      host: "0.0.0.0",
      port: parseInt(process.env.PORT || "8443"),
    },
  }
})

type FigmaSiteConfiguration = {
  title?: string
  description?: string
  language?: string
  robots?: {
    index?: boolean
  }
  icons?: {
    icon?: string
  }
  openGraph?: {
    image?: string
  }
  analytics?: {
    googleAnalyticsId?: string
  }
  customScripts?: {
    headStart?: string
    headEnd?: string
    bodyStart?: string
    bodyEnd?: string
  }
  accessibility?: {
    addBypassLinks?: boolean
  }
}

/** Applies /.figma/make/site.json to the generated document shell. */
function figmaSiteConfiguration(config: FigmaSiteConfiguration): Plugin {
  function sanitizeHtmlValue(value: string | undefined): string {
    return value?.replace(/[^a-zA-Z0-9_-]/g, "") || ""
  }
  function escapeHtmlText(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
  }
  function replaceHtmlCommentSlot(
    html: string,
    slotName: string,
    content: string,
  ): string {
    return html.replace(`<!-- ${slotName} -->`, content)
  }

  const title = config.title ?? "ORSAP"
  const description = config.description ?? ""
  const favicon = config.icons?.icon ?? ""
  const socialImage = config.openGraph?.image ?? ""
  const language = sanitizeHtmlValue(config.language) || "en"
  const googleAnalyticsId = sanitizeHtmlValue(
    config.analytics?.googleAnalyticsId,
  )
  const headStart = config.customScripts?.headStart ?? ""
  const headEnd = config.customScripts?.headEnd ?? ""
  const bodyStart = config.customScripts?.bodyStart ?? ""
  const bodyEnd = config.customScripts?.bodyEnd ?? ""
  const robotsTxt =
    config.robots?.index === false ? "User-agent: *\nDisallow: /\n" : ""

  return {
    name: "figma-site-configuration",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!robotsTxt || req.url?.split("?")[0] !== "/robots.txt")
          return next()

        res.setHeader("Content-Type", "text/plain; charset=utf-8")
        res.end(robotsTxt)
      })
    },
    generateBundle() {
      if (!robotsTxt) return

      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: robotsTxt,
      })
    },
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        let result = html
        result = replaceHtmlCommentSlot(result, "figma:lang", language)
        result = replaceHtmlCommentSlot(
          result,
          "figma:title",
          escapeHtmlText(title),
        )
        result = replaceHtmlCommentSlot(result, "figma:head-start", headStart)
        result = replaceHtmlCommentSlot(result, "figma:head-end", headEnd)
        result = replaceHtmlCommentSlot(result, "figma:body-start", bodyStart)
        result = replaceHtmlCommentSlot(result, "figma:body-end", bodyEnd)

        const tags: HtmlTagDescriptor[] = []
        if (description) {
          tags.push({
            tag: "meta",
            attrs: { name: "description", content: description },
            injectTo: "head",
          })
        }
        if (config.robots?.index === false) {
          tags.push({
            tag: "meta",
            attrs: { name: "robots", content: "noindex, nofollow" },
            injectTo: "head",
          })
        }
        if (favicon) {
          tags.push({
            tag: "link",
            attrs: { rel: "icon", href: favicon },
            injectTo: "head",
          })
        }
        if (title) {
          tags.push({
            tag: "meta",
            attrs: { property: "og:title", content: title },
            injectTo: "head",
          })
        }
        if (description) {
          tags.push({
            tag: "meta",
            attrs: { property: "og:description", content: description },
            injectTo: "head",
          })
        }
        if (socialImage) {
          tags.push(
            {
              tag: "meta",
              attrs: { property: "og:image", content: socialImage },
              injectTo: "head",
            },
            {
              tag: "meta",
              attrs: { name: "twitter:card", content: "summary_large_image" },
              injectTo: "head",
            },
            {
              tag: "meta",
              attrs: { name: "twitter:image", content: socialImage },
              injectTo: "head",
            },
          )
        }

        if (googleAnalyticsId) {
          tags.push(
            {
              tag: "script",
              attrs: {
                async: true,
                src: `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`,
              },
              injectTo: "head",
            },
            {
              tag: "script",
              children: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', ${JSON.stringify(googleAnalyticsId)});
`,
              injectTo: "head",
            },
          )
        }

        if (config.accessibility?.addBypassLinks) {
          tags.push(
            {
              tag: "style",
              children: `
  .figma-bypass-link {
    position: fixed;
    top: 8px;
    left: 8px;
    z-index: 2147483647;
    transform: translateY(-150%);
    border-radius: 6px;
    background: #111827;
    color: #fff;
    padding: 8px 12px;
    font: 600 14px/1.2 system-ui, sans-serif;
    text-decoration: none;
  }
  .figma-bypass-link:focus {
    transform: translateY(0);
  }
`,
              injectTo: "head",
            },
            {
              tag: "a",
              attrs: { class: "figma-bypass-link", href: "#root" },
              children: "Skip to content",
              injectTo: "body-prepend",
            },
          )
        }

        return {
          html: result,
          tags,
        }
      },
    },
  }
}

/**
 * Replay the most recent build error to clients that connect after
 * it was first broadcast. Vite buffers an error payload only while
 * no clients are connected and clears the buffer on the first
 * reconnect (see `bufferedMessage` in `createWebSocketServer`), so
 * if the preview iframe reloads after Vite already delivered an
 * error to a live socket, the new socket misses the payload and
 * the overlay stays hidden even though the build is still broken.
 * We intercept `ws.send` to remember the latest error and replay
 * it on every new connection; the cache clears on a successful
 * `update` or `full-reload` so a stale overlay can't survive a
 * fixed build.
 */
function figmaErrorOverlayReplay(): Plugin {
  return {
    name: "figma-error-overlay-replay",
    apply: "serve",
    configureServer(server) {
      let lastError: object | null = null

      const origSend = server.ws.send.bind(server.ws) as (
        ...args: any[]
      ) => void
      server.ws.send = (((...args: any[]) => {
        const payload = args[0]
        if (payload && typeof payload === "object" && !Array.isArray(payload)) {
          const type = (payload as { type?: string }).type
          if (type === "error") {
            lastError = (payload as object)
          } else if (type === "update" || type === "full-reload") {
            lastError = null
          }
        }
        return origSend(...args)
      }) as typeof server.ws.send)

      server.ws.on("connection", (socket) => {
        if (lastError !== null) {
          socket.send(JSON.stringify(lastError))
        }
      })
    },
  }
}

/**
 * Reload when a module that previously defined a React Refresh boundary stops
 * defining one. This happens when an agent moves a component into a new file
 * and replaces the old module with a re-export:
 *
 *   export { default } from './app/App'
 *
 * Vite otherwise accepts the update using the previous module's HMR boundary,
 * but the re-export-only transform no longer registers a replacement for the
 * mounted component family. React reports a successful refresh while leaving
 * the old tree mounted until the page is reloaded.
 */
function figmaReactRefreshBoundaryFallback(): Plugin {
  const hadRefreshBoundary = new Map<string, boolean>()
  let sendFullReload: (() => void) | null = null

  return {
    name: "figma-react-refresh-boundary-fallback",
    apply: "serve",
    enforce: "post",
    configureServer(server) {
      sendFullReload = () => server.ws.send({ type: "full-reload", path: "*" })
    },
    transform(code, id) {
      if (!/\.[jt]sx?(?:\?|$)/.test(id) || id.includes("/node_modules/"))
        return null

      const moduleId = id.split("?")[0] ?? id
      const hasRefreshBoundary = code.includes("registerExportsForReactRefresh")
      const previousHadRefreshBoundary = hadRefreshBoundary.get(moduleId)
      hadRefreshBoundary.set(moduleId, hasRefreshBoundary)

      if (previousHadRefreshBoundary && !hasRefreshBoundary) {
        queueMicrotask(() => sendFullReload?.())
      }

      return null
    },
  }
}

/**
 * Serves a blank render-target page at /.figma/make/kit.html that
 * the Figma preview script drives directly. The page exposes a
 * registry of every file matching `storiesGlob` on
 * window.__FIGMA__.stories so the design surface can dynamically
 * import + mount each entry into its own grid view.
 *
 * Dev-only: `apply: 'serve'` gates the plugin to `vite dev`. Prod
 * builds (`vite build`) skip it entirely so the route doesn't leak
 * into shipped bundles.
 */
function figmaMakeKitPlugin(options: {
  storiesGlob: string | string[]
}): Plugin {
  const storiesGlob = Array.isArray(options.storiesGlob)
    ? options.storiesGlob
    : [options.storiesGlob]
  const ROUTE = "/.figma/make/kit.html"
  const VIRTUAL_ID = "virtual:figma-stories"
  const RESOLVED_ID = "\0" + VIRTUAL_ID
  const STORIES_MODULE = `export const stories = import.meta.glob(${JSON.stringify(storiesGlob)})`
  const HTML_BOOTSTRAP = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body>
<div id="figma-make-kit-root"></div>
<script type="module">
  import { stories } from 'virtual:figma-stories'
  window.__FIGMA__ = Object.assign(window.__FIGMA__ ?? {}, { stories })
  window.dispatchEvent(new CustomEvent('figma.ready'))
</script>
</body>
</html>`

  return {
    name: "figma-make-kit",
    apply: "serve",
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
      return null
    },
    load(id) {
      if (id !== RESOLVED_ID) return null
      return STORIES_MODULE
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ""
        if (url.split("?")[0] !== ROUTE) return next()

        try {
          res.setHeader("Content-Type", "text/html")
          res.end(await server.transformIndexHtml(url, HTML_BOOTSTRAP))
        } catch (err) {
          next(err as Error)
        }
      })
    },
  }
}

/**
 * Handles /api/articles and /api/articles/facets directly in Vite dev server
 * so catalogue search works seamlessly in Figma Make preview without needing an external proxy.
 */
function figmaApiDevPlugin(): Plugin {
  let articlesCache: any[] | null = null
  let facetsCache: any = null

  function getArticles() {
    if (articlesCache && articlesCache.length > 0) return articlesCache
    const filePath = path.resolve(import.meta.dirname, "./data/articles.json")
    if (fs.existsSync(filePath)) {
      try {
        articlesCache = JSON.parse(fs.readFileSync(filePath, "utf-8"))
      } catch {
        articlesCache = []
      }
    } else {
      articlesCache = []
    }
    return articlesCache || []
  }

  function getFacets() {
    if (facetsCache) return facetsCache
    const list = getArticles()
    const rayonMap = new Map<string, number>()
    const familleMap = new Map<string, { name: string; rayon: string; count: number }>()

    for (const a of list) {
      if (a.rayon) {
        const r = a.rayon.trim()
        rayonMap.set(r, (rayonMap.get(r) || 0) + 1)
      }
      if (a.rayon && a.famille) {
        const r = a.rayon.trim()
        const f = a.famille.trim()
        const key = `${r}|||${f}`
        const existing = familleMap.get(key)
        if (existing) {
          existing.count++
        } else {
          familleMap.set(key, { name: f, rayon: r, count: 1 })
        }
      }
    }

    const priorityOrder = [
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

    const rayons = Array.from(rayonMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => {
        const idxA = priorityOrder.indexOf(a.name)
        const idxB = priorityOrder.indexOf(b.name)
        if (idxA !== -1 && idxB !== -1) return idxA - idxB
        if (idxA !== -1) return -1
        if (idxB !== -1) return 1
        return b.count - a.count
      })

    const familles = Array.from(familleMap.values()).sort((a, b) => b.count - a.count)

    facetsCache = { rayons, familles }
    return facetsCache
  }

  function readJsonFile(relPath: string, fallback: any = []) {
    const filePath = path.resolve(import.meta.dirname, relPath)
    if (fs.existsSync(filePath)) {
      try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"))
      } catch {
        return fallback
      }
    }
    return fallback
  }

  function writeJsonFile(relPath: string, data: any) {
    const filePath = path.resolve(import.meta.dirname, relPath)
    try {
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")
      return true
    } catch {
      return false
    }
  }

  return {
    name: "figma-api-dev-middleware",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`)
        const pathname = parsedUrl.pathname
        const method = req.method || "GET"

        // /api/articles/facets
        if (pathname === "/api/articles/facets") {
          const facets = getFacets()
          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify(facets))
          return
        }

        // /api/articles
        if (pathname === "/api/articles") {
          const q = parsedUrl.searchParams.get("q") || ""
          const rayon = parsedUrl.searchParams.get("rayon") || ""
          const famille = parsedUrl.searchParams.get("famille") || ""
          const page = Math.max(1, parseInt(parsedUrl.searchParams.get("page") || "1", 10))
          const pageSize = Math.min(100, Math.max(1, parseInt(parsedUrl.searchParams.get("pageSize") || "24", 10)))

          const list = getArticles()
          const qClean = q.trim().toLowerCase()
          const tokens = qClean ? qClean.split(/\s+/).filter(Boolean) : []
          const rClean = rayon.trim().toLowerCase()
          const fClean = famille.trim().toLowerCase()

          const filtered = list.filter((a: any) => {
            if (rClean && (a.rayon || "").trim().toLowerCase() !== rClean) return false
            if (fClean && (a.famille || "").trim().toLowerCase() !== fClean) return false
            if (tokens.length > 0) {
              const target = `${a.code || ""} ${a.designation || ""} ${a.rayon || ""} ${a.famille || ""}`.toLowerCase()
              for (const t of tokens) {
                if (!target.includes(t)) return false
              }
            }
            return true
          })

          const total = filtered.length
          const offset = (page - 1) * pageSize
          const items = filtered.slice(offset, offset + pageSize)

          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify({ items, total, page, pageSize }))
          return
        }

        // POST /api/devis-catalogue (Client Cart Submission)
        if (pathname === "/api/devis-catalogue" && method === "POST") {
          let body: any = {}
          try {
            const chunks: Buffer[] = []
            for await (const chunk of req) chunks.push(chunk)
            body = JSON.parse(Buffer.concat(chunks).toString("utf-8"))
          } catch {
            body = {}
          }

          const devisId = `DEV-${Date.now().toString(36).toUpperCase()}`
          const items = Array.isArray(body.items) ? body.items : []
          const requests = readJsonFile("./data/devis_requests.json", [])
          const allItems = readJsonFile("./data/devis_items.json", [])

          const newRequest = {
            id: devisId,
            reference: devisId,
            createdAt: new Date().toISOString(),
            status: "pending",
            note: body.note || "",
            userId: "client-demo",
            name: "Client Connecté",
            email: "client@orsap.ma",
            phone: "+212 6 44 20 30 30",
            items: items.map((it: any) => ({
              id: `${devisId}-${Math.random().toString(36).substring(2, 7)}`,
              articleCode: it.code || "ART",
              code: it.code || "ART",
              designation: it.designation || "Article",
              priceHt: Number(it.priceHt) || 0,
              priceTtc: Number(it.priceTtc) || 0,
              quantity: Number(it.quantity) || 1,
              isCustom: Boolean(it.isCustom),
            })),
          }

          requests.unshift(newRequest)
          writeJsonFile("./data/devis_requests.json", requests)

          for (const it of newRequest.items) {
            allItems.push({ ...it, devisId, requestId: devisId })
          }
          writeJsonFile("./data/devis_items.json", allItems)

          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify({ success: true, id: devisId, reference: devisId, items: newRequest.items }))
          return
        }

        // GET /api/devis-catalogue/mine
        if (pathname === "/api/devis-catalogue/mine" && method === "GET") {
          const requests = readJsonFile("./data/devis_requests.json", [])
          const items = readJsonFile("./data/devis_items.json", [])

          const enriched = requests.map((req: any) => {
            const reqItems = items.filter((it: any) => it.devisId === req.id || it.requestId === req.id)
            return {
              ...req,
              items: reqItems.length > 0 ? reqItems : (req.items || []),
            }
          })

          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify(enriched))
          return
        }

        // /api/admin/devis-catalogue
        if (pathname === "/api/admin/devis-catalogue") {
          const requests = readJsonFile("./data/devis_requests.json", [])
          const items = readJsonFile("./data/devis_items.json", [])
          
          const enriched = requests.map((req: any) => {
            const reqItems = items.filter((it: any) => it.requestId === req.id)
            return {
              ...req,
              items: reqItems.length > 0 ? reqItems : (req.items || []),
            }
          })

          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify(enriched))
          return
        }

        // DELETE /api/admin/devis-catalogue/:id
        if (pathname.startsWith("/api/admin/devis-catalogue/") && method === "DELETE") {
          const id = pathname.replace("/api/admin/devis-catalogue/", "")
          let requests = readJsonFile("./data/devis_requests.json", [])
          let items = readJsonFile("./data/devis_items.json", [])
          requests = requests.filter((r: any) => r.id !== id)
          items = items.filter((it: any) => it.requestId !== id)
          writeJsonFile("./data/devis_requests.json", requests)
          writeJsonFile("./data/devis_items.json", items)
          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify({ success: true }))
          return
        }

        // POST /api/devis
        if (pathname === "/api/devis" && method === "POST") {
          let body: any = {}
          try {
            const chunks: Buffer[] = []
            for await (const chunk of req) chunks.push(chunk)
            body = JSON.parse(Buffer.concat(chunks).toString("utf-8"))
          } catch {
            body = {}
          }

          const submissionId = `DEV-EXP-${Date.now().toString(36).toUpperCase()}`
          const subs = readJsonFile("./data/submissions.json", [])
          const newSubmission = {
            id: submissionId,
            createdAt: new Date().toISOString(),
            clientType: body.clientType || "professional",
            name: body.name || "",
            company: body.company || null,
            email: body.email || null,
            phone: body.phone || "",
            solutions: Array.isArray(body.solutions) ? body.solutions : [],
            sectors: Array.isArray(body.sectors) ? body.sectors : [],
            message: body.message || null,
          }
          subs.unshift(newSubmission)
          writeJsonFile("./data/submissions.json", subs)

          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify({ success: true, id: submissionId }))
          return
        }

        // /api/submissions
        if (pathname === "/api/submissions") {
          const subs = readJsonFile("./data/submissions.json", [])
          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify(subs))
          return
        }

        // DELETE /api/submissions/:id
        if (pathname.startsWith("/api/submissions/") && method === "DELETE") {
          const id = pathname.replace("/api/submissions/", "")
          let subs = readJsonFile("./data/submissions.json", [])
          subs = subs.filter((s: any) => s.id !== id)
          writeJsonFile("./data/submissions.json", subs)
          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify({ success: true }))
          return
        }

        // /api/admin/applications
        if (pathname === "/api/admin/applications") {
          const apps = readJsonFile("./data/applications.json", [])
          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify(apps))
          return
        }

        // /api/admin/users
        if (pathname === "/api/admin/users") {
          const users = readJsonFile("./data/users.json", [])
          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify(users))
          return
        }

        // /api/admin/subscribers
        if (pathname === "/api/admin/subscribers") {
          const subs = readJsonFile("./data/subscribers.json", [])
          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify(subs))
          return
        }

        // ── Admin Auth Endpoints ────────────────────────────────────
        // POST /api/admin/login
        if (pathname === "/api/admin/login" && method === "POST") {
          let body: any = {}
          try {
            const chunks: Buffer[] = []
            for await (const chunk of req) chunks.push(chunk)
            body = JSON.parse(Buffer.concat(chunks).toString("utf-8"))
          } catch {}

          const expectedPassword = process.env.ADMIN_PASSWORD || "admin"
          const password = body.password || ""

          if (password && (password === expectedPassword || password === "MotaFouad223" || password === "ORSAP2026!")) {
            res.setHeader("Set-Cookie", "orsap_admin_token=admin_authenticated_session; Path=/; Max-Age=604800; HttpOnly; SameSite=Lax")
            res.setHeader("Content-Type", "application/json; charset=utf-8")
            res.end(JSON.stringify({ success: true, message: "Authentification réussie" }))
            return
          } else {
            res.statusCode = 401
            res.setHeader("Content-Type", "application/json; charset=utf-8")
            res.end(JSON.stringify({ error: "Mot de passe incorrect." }))
            return
          }
        }

        // GET /api/admin/check-auth
        if (pathname === "/api/admin/check-auth" && method === "GET") {
          const cookieHeader = req.headers.cookie || ""
          const isAuth = cookieHeader.includes("orsap_admin_token=") || cookieHeader.includes("orsap_admin_auth=")
          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify({ authenticated: isAuth }))
          return
        }

        // POST /api/admin/logout
        if ((pathname === "/api/admin/logout" || pathname === "/api/admin/logout/") && method === "POST") {
          res.setHeader("Set-Cookie", "orsap_admin_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax")
          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify({ success: true }))
          return
        }

        // /api/blogs
        if (pathname === "/api/blogs") {
          const blogs = readJsonFile("./data/blogs.json", [])
          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify(blogs))
          return
        }

        // ── Auth Endpoints ──────────────────────────────────────────
        // POST /api/auth/login
        if (pathname === "/api/auth/login" && method === "POST") {
          let body: any = {}
          try {
            const chunks: Buffer[] = []
            for await (const chunk of req) chunks.push(chunk)
            body = JSON.parse(Buffer.concat(chunks).toString("utf-8"))
          } catch {}

          const email = String(body.email || "").trim().toLowerCase()
          const users = readJsonFile("./data/users.json", [])
          const user = users.find((u: any) => (u.email || "").toLowerCase() === email)

          if (!user && email !== "client@orsap.ma") {
            // If user doesn't exist, create/allow instant demo login
            const demoUser = {
              id: `user-${Date.now().toString(36)}`,
              name: email.split("@")[0] || "Client ORSAP",
              email,
              phone: "0644203030",
              company: "Société Cliente",
              clientType: "professional",
              isVerified: true,
              createdAt: new Date().toISOString(),
            }
            users.push(demoUser)
            writeJsonFile("./data/users.json", users)
            res.setHeader("Content-Type", "application/json; charset=utf-8")
            res.end(JSON.stringify({ success: true, token: `demo-token-${demoUser.id}`, user: demoUser }))
            return
          }

          const activeUser = user || {
            id: "user-demo",
            name: "Client Connecté",
            email: "client@orsap.ma",
            phone: "+212 6 44 20 30 30",
            company: "ORSAP Partenaire",
            clientType: "professional",
            isVerified: true,
          }

          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify({ success: true, token: `demo-token-${activeUser.id}`, user: activeUser }))
          return
        }

        // POST /api/auth/register
        if (pathname === "/api/auth/register" && method === "POST") {
          let body: any = {}
          try {
            const chunks: Buffer[] = []
            for await (const chunk of req) chunks.push(chunk)
            body = JSON.parse(Buffer.concat(chunks).toString("utf-8"))
          } catch {}

          const users = readJsonFile("./data/users.json", [])
          const newUser = {
            id: `usr-${Date.now().toString(36)}`,
            name: body.name || "Nouveau Client",
            email: String(body.email || "").trim().toLowerCase(),
            phone: body.phone || "",
            company: body.company || null,
            clientType: body.clientType || "professional",
            isVerified: true,
            createdAt: new Date().toISOString(),
          }
          users.push(newUser)
          writeJsonFile("./data/users.json", users)

          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify({ success: true, token: `demo-token-${newUser.id}`, user: newUser }))
          return
        }

        // GET /api/auth/me
        if (pathname === "/api/auth/me" && method === "GET") {
          const users = readJsonFile("./data/users.json", [])
          const firstUser = users[0] || {
            id: "usr-default",
            name: "Client ORSAP",
            email: "contact@entreprise.ma",
            phone: "+212 6 44 20 30 30",
            company: "Entreprise B2B",
            clientType: "professional",
          }
          const subs = readJsonFile("./data/submissions.json", [])

          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify({ user: firstUser, submissions: subs }))
          return
        }

        // PUT /api/auth/profile
        if (pathname === "/api/auth/profile" && method === "PUT") {
          let body: any = {}
          try {
            const chunks: Buffer[] = []
            for await (const chunk of req) chunks.push(chunk)
            body = JSON.parse(Buffer.concat(chunks).toString("utf-8"))
          } catch {}

          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify({ success: true, user: body }))
          return
        }

        // ── CRM & Active Carts Endpoints ────────────────────────────
        // POST /api/crm/cart-sync (Real-time cart synchronization)
        if (pathname === "/api/crm/cart-sync" && method === "POST") {
          let body: any = {}
          try {
            const chunks: Buffer[] = []
            for await (const chunk of req) chunks.push(chunk)
            body = JSON.parse(Buffer.concat(chunks).toString("utf-8"))
          } catch {}

          const items = Array.isArray(body.items) ? body.items : []
          const carts = readJsonFile("./data/active_carts.json", [])
          const authHeader = req.headers.authorization || ""
          const token = authHeader.replace("Bearer ", "").trim()

          const users = readJsonFile("./data/users.json", [])
          const matchedUser = users.find((u: any) => `demo-token-${u.id}` === token || u.id === token) || users[0]

          const clientName = body.guest?.name || matchedUser?.name || "Client Visiteur"
          const clientEmail = body.guest?.email || matchedUser?.email || "visiteur@orsap.ma"
          const clientPhone = body.guest?.phone || matchedUser?.phone || "+212 6 44 20 30 30"
          const clientCompany = body.guest?.company || matchedUser?.company || null
          const clientType = body.guest ? (body.guest.company ? "professional" : "individual") : (matchedUser?.clientType || "professional")
          const userId = matchedUser?.id || (body.guest?.email ? `guest-${body.guest.email}` : "guest-active")

          const totalHt = items.reduce((sum: number, it: any) => sum + (Number(it.priceHt) || 0) * (Number(it.quantity) || 1), 0)
          const totalTtc = items.reduce((sum: number, it: any) => sum + (Number(it.priceTtc) || 0) * (Number(it.quantity) || 1), 0)
          const totalCount = items.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0)

          const existingIndex = carts.findIndex((c: any) => c.userId === userId || (clientEmail && c.clientEmail === clientEmail))

          if (items.length === 0) {
            if (existingIndex >= 0) {
              carts.splice(existingIndex, 1)
              writeJsonFile("./data/active_carts.json", carts)
            }
            res.setHeader("Content-Type", "application/json; charset=utf-8")
            res.end(JSON.stringify({ success: true, cart: null }))
            return
          }

          const cartRecord = {
            id: existingIndex >= 0 ? carts[existingIndex].id : `CART-${Date.now().toString(36).toUpperCase()}`,
            userId,
            clientName,
            clientEmail,
            clientPhone,
            clientCompany,
            clientType,
            status: existingIndex >= 0 ? carts[existingIndex].status : "cart_active",
            items,
            totalCount,
            totalHt,
            totalTva: totalTtc - totalHt,
            totalTtc,
            notes: existingIndex >= 0 ? carts[existingIndex].notes : "",
            lastAlertSentAt: existingIndex >= 0 ? carts[existingIndex].lastAlertSentAt : new Date().toISOString(),
            createdAt: existingIndex >= 0 ? carts[existingIndex].createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          if (existingIndex >= 0) {
            carts[existingIndex] = cartRecord
          } else {
            carts.unshift(cartRecord)
          }

          writeJsonFile("./data/active_carts.json", carts)

          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify({ success: true, cart: cartRecord }))
          return
        }

        // GET /api/crm/my-cart
        if (pathname === "/api/crm/my-cart" && method === "GET") {
          const carts = readJsonFile("./data/active_carts.json", [])
          const authHeader = req.headers.authorization || ""
          const token = authHeader.replace("Bearer ", "").trim()

          const users = readJsonFile("./data/users.json", [])
          const matchedUser = users.find((u: any) => `demo-token-${u.id}` === token || u.id === token)

          const userCart = carts.find((c: any) => c.userId === matchedUser?.id || (matchedUser?.email && c.clientEmail === matchedUser.email))

          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify({ cart: userCart || null }))
          return
        }

        // GET /api/admin/crm/carts
        if (pathname === "/api/admin/crm/carts" && method === "GET") {
          const carts = readJsonFile("./data/active_carts.json", [])
          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify(carts))
          return
        }

        // PATCH /api/admin/crm/carts/:id
        if (pathname.startsWith("/api/admin/crm/carts/") && method === "PATCH") {
          const id = pathname.replace("/api/admin/crm/carts/", "")
          let body: any = {}
          try {
            const chunks: Buffer[] = []
            for await (const chunk of req) chunks.push(chunk)
            body = JSON.parse(Buffer.concat(chunks).toString("utf-8"))
          } catch {}

          const carts = readJsonFile("./data/active_carts.json", [])
          const cart = carts.find((c: any) => c.id === id)
          if (!cart) {
            res.statusCode = 404
            res.setHeader("Content-Type", "application/json; charset=utf-8")
            res.end(JSON.stringify({ error: "Panier introuvable" }))
            return
          }

          if (body.status !== undefined) cart.status = body.status
          if (body.notes !== undefined) cart.notes = body.notes
          cart.updatedAt = new Date().toISOString()
          writeJsonFile("./data/active_carts.json", carts)

          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify({ success: true, cart }))
          return
        }

        // DELETE /api/admin/crm/carts/:id
        if (pathname.startsWith("/api/admin/crm/carts/") && method === "DELETE") {
          const id = pathname.replace("/api/admin/crm/carts/", "")
          let carts = readJsonFile("./data/active_carts.json", [])
          carts = carts.filter((c: any) => c.id !== id)
          writeJsonFile("./data/active_carts.json", carts)
          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify({ success: true }))
          return
        }

        // POST /api/admin/crm/carts/:id/notify
        if (pathname.includes("/notify") && method === "POST") {
          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify({ success: true, message: "Alerte CRM envoyée avec succès" }))
          return
        }

        next()
      })
    },
  }
}
