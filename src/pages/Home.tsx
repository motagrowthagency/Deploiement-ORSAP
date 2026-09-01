import { Link } from "react-router"
import heroPhoto from "@/imports/Hero_Acceuil.jpeg"
import logoButec from "@/imports/logo_butec.svg"

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[calc(100svh-118px)] w-full overflow-hidden bg-ink">
        <img
          src={heroPhoto}
          alt="Technicien ORSAP en équipement de protection dans une installation industrielle"
          className="absolute inset-0 h-full w-full object-cover object-[72%_center] lg:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/55 to-ink/10" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink/80 to-transparent" />

        <div className="relative mx-auto flex min-h-[calc(100svh-118px)] max-w-[1240px] flex-col justify-center px-6 py-16 text-paper">
          <div className="mb-7 flex items-center gap-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-safety">
            <span className="h-px w-8 bg-safety" />
            Solution B2B industrielle
          </div>

          <h1 className="max-w-3xl font-display text-[clamp(2.5rem,5.5vw,4.2rem)] font-black leading-[1.05] tracking-[-0.025em] flex flex-col gap-3">
            <span className="text-white">Protégez vos équipes.</span>
            <span className="text-orsap-red">Équipez vos projets.</span>
          </h1>

          <p className="mt-7 max-w-xl text-[17px] leading-[1.6] text-white/80">
            Solutions EPI, travail en hauteur, manutention et personnalisation
            pour les grandes structures industrielles.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/devis"
              className="inline-flex items-center justify-center bg-orsap-red px-7 py-4 font-display text-[14px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-orsap-red-deep"
            >
              Demander un devis
            </Link>
            <Link
              to="/produits"
              className="inline-flex items-center justify-center border border-white/70 px-7 py-4 font-display text-[14px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-white hover:text-ink"
            >
              Parcourir le catalogue
            </Link>
          </div>
        </div>
      </section>

      {/* Presentation + Video Section */}
      <section className="border-t border-hairline bg-card py-16 lg:py-24">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <div className="mb-6 flex items-center gap-3 text-[12.5px] font-bold uppercase tracking-[0.14em] text-orsap-red">
                <span className="h-px w-8 bg-orsap-red" />
                Présentation
              </div>
              <h2 className="font-display text-[clamp(2.1rem,3.8vw,3.1rem)] font-black leading-[1.08] tracking-[-0.03em] text-ink">
                Découvrez ORSAP en vidéo
              </h2>
              <div className="mt-6 space-y-4 text-[15px] sm:text-[15.5px] leading-[1.65] text-ink-soft">
                <p>
                  Découvrez nos infrastructures, nos équipes et notre engagement à
                  vous fournir les meilleures solutions techniques et équipements
                  industriels au Maroc.
                </p>
                <p>
                  Quelque soit le marché dans lequel vous évoluez ou vos projets,
                  nos conseillers, tous experts dans un ou plusieurs domaines
                  (Équipement de Protection Individuelle EPI, Travail en
                  Hauteur, Manutention ou outillages...), sauront vous assister
                  et surtout vous apporter la meilleure solution.
                </p>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/a-propos"
                  className="inline-flex items-center justify-center bg-ink px-7 py-3.5 font-display text-[13px] font-bold uppercase tracking-[0.05em] text-white transition-colors hover:bg-ink-soft"
                >
                  À propos de nous
                </Link>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="relative w-full overflow-hidden rounded-2xl border border-hairline/70 bg-ink shadow-lg aspect-video">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src="https://www.youtube.com/embed/tXgG_JxqlSg"
                  title="Découvrez ORSAP en vidéo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Numbers / Stats Section */}
      <section className="border-y border-hairline bg-card">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="grid grid-cols-1 divide-y divide-hairline sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x lg:divide-hairline">
            <div className="py-8 sm:py-10 lg:py-12 lg:pr-8">
              <div className="font-display text-4xl sm:text-[44px] lg:text-[48px] font-black leading-none tracking-[-0.03em] text-ink">
                +15 000
              </div>
              <div className="mt-2.5 font-display text-[13.5px] font-bold uppercase tracking-wider text-orsap-red">
                RÉFÉRENCES
              </div>
              <div className="mt-1.5 text-[14px] text-ink-soft leading-snug">
                disponibles en stock
              </div>
            </div>

            <div className="py-8 sm:py-10 lg:py-12 sm:px-6 lg:px-8">
              <div className="flex items-baseline gap-2.5">
                <span className="font-display text-4xl sm:text-[44px] lg:text-[48px] font-black leading-none tracking-[-0.03em] text-ink">
                  48h
                </span>
                <span className="font-display text-[13.5px] font-bold uppercase tracking-wider text-orsap-red">
                  DÉLAI MAX
                </span>
              </div>
              <div className="mt-2.5 text-[14px] text-ink-soft leading-snug">
                de livraison au Maroc
              </div>
            </div>

            <div className="py-8 sm:py-10 lg:py-12 sm:px-6 lg:px-8">
              <div className="flex items-baseline gap-2.5">
                <span className="font-display text-4xl sm:text-[44px] lg:text-[48px] font-black leading-none tracking-[-0.03em] text-ink">
                  +300
                </span>
                <span className="font-display text-[13.5px] font-bold uppercase tracking-wider text-orsap-red">
                  MARQUES
                </span>
              </div>
              <div className="mt-2.5 text-[14px] text-ink-soft leading-snug">
                distribuées et sourcées
              </div>
            </div>

            <div className="py-8 sm:py-10 lg:py-12 sm:pl-6 lg:pl-8">
              <div className="font-display text-4xl sm:text-[44px] lg:text-[48px] font-black leading-none tracking-[-0.03em] text-ink">
                +100
              </div>
              <div className="mt-2.5 font-display text-[13.5px] font-bold uppercase tracking-wider text-orsap-red">
                GRANDS COMPTES
              </div>
              <div className="mt-1.5 text-[14px] text-ink-soft leading-snug">
                industriels servis
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="border-b border-hairline bg-paper py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 flex items-center justify-center gap-3 text-[12.5px] font-bold uppercase tracking-[0.14em] text-orsap-red">
              <span className="h-px w-8 bg-orsap-red" />
              Témoignage Client
              <span className="h-px w-8 bg-orsap-red" />
            </div>

            <blockquote className="font-display text-[clamp(1.15rem,2.1vw,1.45rem)] font-bold italic leading-[1.5] tracking-tight text-ink">
              “ ORSAP est devenu notre partenaire de référence pour l’équipement
              EPI de nos 1 200 salariés, du travail en hauteur et de la
              manutention. Leur capacité à personnaliser et à livrer dans les
              délais, tout en respectant nos exigences de conformité, est
              remarquable. ”
            </blockquote>

            <div className="mt-10 flex flex-col items-center justify-center">
              <img
                src={logoButec}
                alt="Logo BUTEC"
                className="h-9 w-auto object-contain"
              />
              <div className="mt-4 font-display text-[15.5px] font-bold text-ink">
                M. Amine
              </div>
              <div className="mt-0.5 text-[13px] font-medium text-ink-soft">
                Responsable Achats, BUTEC
              </div>
              <div className="mt-4 inline-block rounded-full bg-white px-5 py-1.5 text-[12px] font-medium text-steel border border-hairline shadow-2xs">
                <span className="font-semibold text-ink-soft">Secteur :</span>{" "}
                Maintenance multitechnique, efficacité énergétique & facility management
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

