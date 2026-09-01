import { useEffect, useState } from "react"
import { Link } from "react-router"
import { INITIAL_BLOGS, type BlogPost } from "@/data/blogs"

export default function Blog() {
  const [blogs, setBlogs] = useState<BlogPost[]>(INITIAL_BLOGS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch("/api/blogs")
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setBlogs(data)
          }
        }
      } catch (err: unknown) {
        console.warn("Using bundled blogs fallback:", err)
      }
    }
    fetchBlogs()
  }, [])

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
            <span className="text-white">Blog</span>
          </nav>
          <div className="flex items-center gap-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-safety">
            <span className="h-px w-8 bg-safety" />
            Actualités &amp; Conseils
          </div>
          <h1 className="mt-6 max-w-3xl font-display text-[clamp(2.2rem,4.4vw,3.6rem)] font-black leading-[1.02] tracking-[-0.025em] text-white">
            Le Blog Technique ORSAP
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-[1.6] text-white/80">
            Retrouvez nos derniers articles, guides et recommandations pour vos
            équipements et services industriels.
          </p>
        </div>
      </section>

      {/* Blog list */}
      <section className="mx-auto max-w-[1240px] px-6 py-16 lg:py-24">
        {loading ? (
          <div className="py-20 text-center font-display text-[16px] font-bold text-ink-soft">
            Chargement des articles...
          </div>
        ) : error ? (
          <div className="mx-auto max-w-md border border-orsap-red/30 bg-orsap-red/5 p-6 text-center text-[15px] text-orsap-red">
            {error}
          </div>
        ) : blogs.length === 0 ? (
          <div className="py-20 text-center text-ink-soft">
            Aucun article publié pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((post) => (
              <article
                key={post.id}
                className="flex flex-col overflow-hidden border border-hairline bg-card transition-all hover:border-orsap-red hover:shadow-sm"
              >
                {post.image && (
                  <div className="aspect-video w-full overflow-hidden border-b border-hairline">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-8">
                  <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                    {new Date(post.date).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <h2 className="mt-4 font-display text-[20px] font-black leading-[1.3] tracking-[-0.01em] text-ink line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="mt-3 flex-1 text-[14.5px] leading-[1.6] text-ink-soft line-clamp-3">
                    {post.summary && !post.summary.includes(",") && post.summary !== post.title
                      ? post.summary
                      : "Consultez notre guide technique et nos recommandations d'experts."}
                  </p>
                  <Link
                    to={`/blog/${post.id}`}
                    className="mt-8 inline-flex items-center gap-2 font-display text-[13px] font-bold uppercase tracking-[0.06em] text-orsap-red transition-all hover:gap-3 hover:text-orsap-red-deep"
                  >
                    Lire l&apos;article <span>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
