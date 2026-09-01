import { useEffect, useState } from "react"
import { Link, useParams } from "react-router"

type BlogPost = {
  id: string
  title: string
  summary: string
  content: string
  date: string
  image?: string | null
  pdf?: string | null
  pdfName?: string | null
}

export default function BlogDetail() {
  const { id } = useParams()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/blogs/${id}`)
        if (!res.ok) throw new Error("Article introuvable.")
        const data = await res.json()
        setPost(data)
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue.",
        )
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [id])

  // Enhanced SEO optimization (Meta tags, keywords & Schema.org JSON-LD)
  useEffect(() => {
    if (!post) return

    const prevTitle = document.title
    document.title = `${post.title} | Blog Technique ORSAP`

    let metaDesc = document.querySelector('meta[name="description"]')
    const prevDesc = metaDesc?.getAttribute("content") || ""
    if (!metaDesc) {
      metaDesc = document.createElement("meta")
      metaDesc.setAttribute("name", "description")
      document.head.appendChild(metaDesc)
    }
    metaDesc.setAttribute("content", post.summary || post.content.slice(0, 160))

    let metaKeywords = document.querySelector('meta[name="keywords"]')
    const prevKeywords = metaKeywords?.getAttribute("content") || ""
    if (!metaKeywords) {
      metaKeywords = document.createElement("meta")
      metaKeywords.setAttribute("name", "keywords")
      document.head.appendChild(metaKeywords)
    }
    metaKeywords.setAttribute("content", post.content)

    // JSON-LD Structured Data for search engines
    const schemaScript = document.createElement("script")
    schemaScript.type = "application/ld+json"
    schemaScript.id = "blog-json-ld"
    schemaScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.summary,
      "articleBody": post.content,
      "datePublished": post.date,
      "keywords": post.content,
      "author": {
        "@type": "Organization",
        "name": "ORSAP"
      },
      "publisher": {
        "@type": "Organization",
        "name": "ORSAP"
      }
    })
    document.head.appendChild(schemaScript)

    return () => {
      document.title = prevTitle
      if (metaDesc) metaDesc.setAttribute("content", prevDesc)
      if (metaKeywords) metaKeywords.setAttribute("content", prevKeywords)
      const existingScript = document.getElementById("blog-json-ld")
      if (existingScript) existingScript.remove()
    }
  }, [post])

  return (
    <div>
      {/* Header */}
      <section className="border-b border-hairline bg-ink text-paper">
        <div className="mx-auto max-w-[1240px] px-6 py-16 lg:py-20">
          <nav className="mb-10 flex flex-wrap items-center gap-2 text-[12.5px] text-white/60">
            <Link to="/" className="hover:text-white">
              Accueil
            </Link>
            <span className="text-white/30">/</span>
            <Link to="/blog" className="hover:text-white">
              Blog
            </Link>
            <span className="text-white/30">/</span>
            <span className="text-white">Article</span>
          </nav>

          {post && (
            <>
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/60">
                Publié le{" "}
                {new Date(post.date).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <h1 className="mt-6 max-w-4xl font-display text-[clamp(2rem,4vw,3.2rem)] font-black leading-[1.1] tracking-[-0.025em] text-white">
                {post.title}
              </h1>
            </>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-[800px] px-6 py-16 lg:py-24">
        <Link
          to="/blog"
          className="mb-10 inline-flex items-center gap-2 font-display text-[13px] font-bold uppercase tracking-[0.06em] text-ink-soft transition-colors hover:text-orsap-red"
        >
          <span>←</span> Retour aux articles
        </Link>

        {loading ? (
          <div className="py-20 text-center font-display text-[16px] font-bold text-ink-soft">
            Chargement de l&apos;article...
          </div>
        ) : error ? (
          <div className="border border-orsap-red/30 bg-orsap-red/5 p-6 text-center text-[15px] text-orsap-red">
            {error}
          </div>
        ) : post ? (
          <div className="prose max-w-none">
            {/* Featured Image if present */}
            {post.image && (
              <div className="mb-8 overflow-hidden border border-hairline aspect-video max-h-[450px]">
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* PDF Viewer - Prominent at the top */}
            {post.pdf && (
              <div className="my-8 border border-hairline bg-paper overflow-hidden shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-b border-hairline bg-surface/40">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-6 h-6 text-orsap-red shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                    <div>
                      <h3 className="font-display text-[14.5px] font-bold text-ink leading-tight">
                        {post.pdfName || "Document joint"}
                      </h3>
                      <p className="text-[12px] text-ink-soft">
                        Visualisation en ligne (Téléchargement désactivé)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full bg-paper overflow-hidden">
                  <iframe
                    src={`${post.pdf}#toolbar=0`}
                    title={post.pdfName || "Document"}
                    className="w-full h-[650px] border-none"
                  />
                </div>
              </div>
            )}

            {/* Text block - Positioned AFTER the PDF (smaller & discreet) */}
            {(post.content || post.summary) && (
              <div className="mt-12 border-t border-hairline pt-8">
                <div className="space-y-4 text-[13px] leading-[1.7] text-ink-soft bg-paper/60 p-6 sm:p-8 border border-hairline rounded-sm">
                  {post.content && post.content.split("\n\n").map((para, idx) => (
                    <p key={idx} className="whitespace-pre-line">
                      {para}
                    </p>
                  ))}
                  {post.summary && post.summary !== post.content && post.summary !== post.title && (
                    <p className="whitespace-pre-line pt-3 text-[12.5px] text-ink-soft/80 border-t border-hairline/60">
                      {post.summary}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Semantic SEO Container for Googlebot & Search Engines (Hidden visually from website visitors) */}
            <div className="sr-only" aria-hidden="true">
              <h2>{post.title}</h2>
              {post.summary && <p>{post.summary}</p>}
              <div>{post.content}</div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
