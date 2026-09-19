import { useEffect, useState, type ReactNode } from "react"
import { Link, useParams } from "react-router"
import { INITIAL_BLOGS, type BlogPost } from "@/data/blogs"
import SEO from "@/components/SEO"

function renderFormattedText(text: string): ReactNode {
  // Support bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-ink">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

export default function BlogDetail() {
  const { id } = useParams()
  const [post, setPost] = useState<BlogPost | null>(() => {
    try {
      const cachedList = localStorage.getItem("orsap_cached_blogs")
      if (cachedList) {
        const parsed = JSON.parse(cachedList)
        const found = parsed.find((b: BlogPost) => b.id === id)
        if (found) return found
      }
    } catch {}
    return INITIAL_BLOGS.find((b) => b.id === id) || null
  })
  const [loading, setLoading] = useState(!post)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/blogs/${id}`)
        if (res.ok) {
          const data = await res.json()
          if (data && data.id === id) {
            setPost(data)
            setError(null)
          }
        }
      } catch (err: unknown) {
        // Silently preserve instant bundled/cached article
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [id])

  return (
    <div>
      {post ? (
        <SEO
          title={`${post.title} | Blog Technique ORSAP`}
          description={post.summary || post.content.replace(/<[^>]+>/g, "").slice(0, 160)}
          image={post.image || undefined}
          type="article"
          breadcrumbs={[
            { name: "Accueil", url: "/" },
            { name: "Blog", url: "/blog" },
            { name: post.title, url: `/blog/${post.id}` }
          ]}
          jsonLd={{
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.summary,
            "datePublished": post.date,
            "image": post.image ? (post.image.startsWith("http") ? post.image : `https://orsap.ma${post.image}`) : undefined,
            "author": {
              "@type": "Organization",
              "name": "ORSAP"
            },
            "publisher": {
              "@type": "Organization",
              "name": "ORSAP",
              "logo": {
                "@type": "ImageObject",
                "url": "https://orsap.ma/apple-touch-icon.png"
              }
            }
          }}
        />
      ) : (
        <SEO title="Article introuvable | Blog ORSAP" noIndex={true} />
      )}

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
      <section className="mx-auto max-w-[880px] px-6 py-12 lg:py-20">
        <Link
          to="/blog"
          className="group mb-8 inline-flex items-center gap-2 font-display text-[13px] font-bold uppercase tracking-[0.06em] text-ink-soft transition-colors hover:text-orsap-red"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span> Retour aux articles
        </Link>

        {loading ? (
          <div className="py-24 text-center font-display text-[16px] font-bold text-ink-soft">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-orsap-red border-t-transparent mb-3" />
            <div>Chargement de l&apos;article...</div>
          </div>
        ) : error ? (
          <div className="border border-orsap-red/30 bg-orsap-red/5 p-8 text-center text-[15px] text-orsap-red rounded-sm">
            {error}
          </div>
        ) : post ? (
          <div className="prose max-w-none">
            {/* Featured Image if present */}
            {post.image && (
              <div className="mb-10 overflow-hidden border border-hairline aspect-video max-h-[480px] rounded-sm shadow-sm">
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* PDF Banner if present */}
            {post.pdf && (
              <div className="my-8 border border-hairline bg-surface rounded-sm overflow-hidden shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 border-b border-hairline bg-paper/80">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-orsap-red/10 text-orsap-red font-bold text-[12px]">
                      PDF
                    </div>
                    <div>
                      <h3 className="font-display text-[15px] font-bold text-ink leading-tight">
                        {post.pdfName || "Document technique ORSAP"}
                      </h3>
                      <p className="text-[12px] text-ink-soft">
                        Document officiel • Consultation &amp; Téléchargement
                      </p>
                    </div>
                  </div>
                  <a
                    href={post.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-bold uppercase tracking-[0.06em] text-white bg-ink hover:bg-orsap-red transition-colors rounded-sm"
                  >
                    Ouvrir le PDF <span>↗</span>
                  </a>
                </div>

                <div className="w-full bg-paper overflow-hidden border-t border-hairline">
                  <iframe
                    src={`${post.pdf}#toolbar=0`}
                    title={post.pdfName || "Document"}
                    className="w-full h-[640px] border-none"
                  />
                </div>
              </div>
            )}

            {/* Article Body Content */}
            {post.summary && (
              <div className="mb-8 border-l-4 border-orsap-red bg-paper/90 p-5 text-[16px] font-medium leading-[1.6] text-ink shadow-sm rounded-r-sm">
                {post.summary}
              </div>
            )}

            {post.content && (
              <div className="space-y-6 text-[16px] leading-[1.8] text-ink/90">
                {post.content.split("\n\n").map((block, idx) => {
                  const trimmed = block.trim()
                  if (trimmed.startsWith("### ")) {
                    return (
                      <h3
                        key={idx}
                        className="font-display text-[22px] font-black text-ink mt-10 mb-4 pt-4 border-t border-hairline first:border-none first:pt-0"
                      >
                        {trimmed.replace(/^###\s+/, "")}
                      </h3>
                    )
                  }
                  if (trimmed.startsWith("## ")) {
                    return (
                      <h2
                        key={idx}
                        className="font-display text-[26px] font-black text-ink mt-12 mb-5"
                      >
                        {trimmed.replace(/^##\s+/, "")}
                      </h2>
                    )
                  }
                  if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                    const items = trimmed.split("\n").filter((l) => l.trim().length > 0)
                    return (
                      <ul key={idx} className="my-4 space-y-2 pl-5 list-disc text-ink/90">
                        {items.map((it, iIdx) => {
                          const cleanText = it.replace(/^[-*]\s+/, "")
                          return (
                            <li key={iIdx} className="leading-[1.7]">
                              {renderFormattedText(cleanText)}
                            </li>
                          )
                        })}
                      </ul>
                    )
                  }
                  if (/^\d+\.\s+/.test(trimmed)) {
                    const items = trimmed.split("\n").filter((l) => l.trim().length > 0)
                    return (
                      <ol key={idx} className="my-4 space-y-2 pl-5 list-decimal text-ink/90">
                        {items.map((it, iIdx) => {
                          const cleanText = it.replace(/^\d+\.\s+/, "")
                          return (
                            <li key={iIdx} className="leading-[1.7]">
                              {renderFormattedText(cleanText)}
                            </li>
                          )
                        })}
                      </ol>
                    )
                  }
                  return (
                    <p key={idx} className="leading-[1.8]">
                      {renderFormattedText(trimmed)}
                    </p>
                  )
                })}
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
