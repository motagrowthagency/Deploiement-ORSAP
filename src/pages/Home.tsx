import { Link } from "react-router"
import heroPhoto from "@/imports/Hero_Acceuil.jpeg"
import logoButec from "@/imports/logo_butec.svg"

const STATS = [
  { value: "+15 000", unit: "références", note: "disponibles en stock" },
  { value: "48h", unit: "délai max", note: "de livraison au Maroc" },
  { value: "+300", unit: "marques", note: "distribuées et sourcées" },
  { value: "+100", unit: "grands comptes", note: "industriels servis" },
]

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

      {/* Proof band */}
      <section className="border-t border-hairline bg-card">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="grid grid-cols-1 divide-y divide-hairline sm:grid-cols-2 sm:divide-y-0 sm:gap-6 lg:grid-cols-4 lg:divide-x lg:divide-hairline">
            {STATS.map((s, i) => (
              <div
                key={s.unit}
                className={`py-6 sm:py-8 lg:py-10 ${
                  i !== 0 ? "lg:pl-8" : ""
                }`}
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-display text-3xl sm:text-4xl lg:text-[clamp(2.2rem,3.2vw,2.8rem)] font-black leading-none tracking-[-0.03em] text-ink whitespace-nowrap">
                    {s.value}
                  </span>
                  <span className="font-display text-[14px] sm:text-[15px] font-bold text-orsap-red uppercase tracking-wider">
                    {s.unit}
                  </span>
                </div>
                <div className="mt-2 text-[14px] text-ink-soft leading-snug">{s.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="border-t border-hairline bg-paper py-16 lg:py-20">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center text-[12.5px] font-semibold uppercase tracking-[0.14em] text-orsap-red">
              <span className="flex items-center gap-3">
                <span className="h-px w-8 bg-orsap-red" />
                Témoignage Client
                <span className="h-px w-8 bg-orsap-red" />
              </span>
            </div>

            <blockquote className="font-display text-[clamp(1.1rem,1.9vw,1.4rem)] font-semibold italic leading-[1.5] tracking-tight text-ink">
              “ ORSAP est devenu notre partenaire de référence pour l’équipement
              EPI de nos 1 200 salariés, du travail en hauteur et de la
              manutention. Leur capacité à personnaliser et à livrer dans les
              délais, tout en respectant nos exigences de conformité, est
              remarquable. ”
            </blockquote>

            <div className="my-7 mx-auto h-px w-16 bg-hairline" />

            <div className="flex flex-col items-center justify-center gap-3.5">
              <img
                src={logoButec}
                alt="Logo BUTEC"
                className="h-8 w-auto object-contain opacity-90"
              />
              <div className="text-center">
                <div className="font-display text-[15px] font-bold text-ink">
                  M. Amine
                </div>
                <div className="text-[13px] font-medium text-ink-soft mt-0.5">
                  Responsable Achats, BUTEC
                </div>
                <div className="mt-3.5 inline-block rounded-full bg-white px-4 py-1 text-[11.5px] font-medium text-steel border border-hairline">
                  <span className="font-semibold text-ink-soft">Secteur :</span>{" "}
                  Maintenance multitechnique, efficacité énergétique & facility management
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="border-t border-hairline bg-card py-16 lg:py-24">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <div className="mb-6 flex items-center gap-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-orsap-red">
                <span className="h-px w-8 bg-orsap-red" />
                Présentation
              </div>
              <h2 className="font-display text-[clamp(1.8rem,3vw,2.4rem)] font-black leading-[1.1] tracking-[-0.02em]">
                Découvrez ORSAP en vidéo
              </h2>
              <div className="mt-5 space-y-4 text-[15.5px] leading-[1.65] text-ink-soft">
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
                  className="inline-flex items-center justify-center bg-ink px-6 py-3 font-display text-[13px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-ink-soft"
                >
                  À propos de nous
                </Link>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="relative w-full overflow-hidden rounded-xl border border-hairline bg-ink shadow-lg aspect-video">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src="https://www.youtube.com/embed/tXgG_JxqlSg"
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
