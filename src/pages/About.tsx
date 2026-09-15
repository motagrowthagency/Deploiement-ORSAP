import { Link } from "react-router"
import aboutPhoto from "@/imports/plate_forme_Orsap-1.jpeg"
import SEO from "@/components/SEO"

const VALUES = [
  {
    title: "Expertise technique",
    body: "Nos équipes sont formées pour comprendre vos besoins, vous proposer les produits adaptés et vous accompagner dans la mise en œuvre.",
  },
  {
    title: "Qualité et sécurité",
    body: "Nous sélectionnons des marques reconnues et des produits conformes aux normes en vigueur, avec un accent particulier sur la sécurité des personnes et des installations.",
  },
  {
    title: "Réactivité et proximité",
    body: "Avec un délai de livraison maximum de 48h sur la plupart de nos références et une présence forte sur le terrain, nous savons être là quand vous en avez besoin.",
  },
  {
    title: "Engagement environnemental",
    body: "Nous privilégions des solutions et des partenaires qui maîtrisent leur impact environnemental et favorisent la durabilité.",
  },
  {
    title: "Relation de confiance",
    body: "Nous construisons des relations durables avec nos clients, fournisseurs et collaborateurs, basées sur l'honnêteté, la transparence et le respect des engagements.",
  },
]

const DIFFERENTIATORS = [
  {
    no: "01",
    title: "Une offre complète",
    body: "Plus de 15 000 produits, 300 marques et de multiples catégories pour couvrir l'ensemble des besoins industriels, du bâtiment et de l'agencement.",
  },
  {
    no: "02",
    title: "Un accompagnement de bout en bout",
    body: "De l'étude de votre projet à la livraison, en passant par l'installation, la maintenance et le service après-vente.",
  },
  {
    no: "03",
    title: "Une clientèle exigeante",
    body: "Nous travaillons avec plus de 100 grands comptes et de nombreuses PME/PMI pour leurs approvisionnements critiques et projets stratégiques.",
  },
  {
    no: "04",
    title: "Une capacité projet",
    body: "Études, installations et travaux — réseaux, compresseurs, postes de soudage, revêtements, plomberie, climatisation — pour des résultats concrets et mesurables.",
  },
]

const COMMITMENTS = [
  "Comprendre votre métier et vos contraintes.",
  "Vous proposer des solutions adaptées à votre budget et à vos objectifs.",
  "Vous livrer dans les délais annoncés, avec un suivi clair et transparent.",
  "Vous accompagner dans la durée, grâce à un SAV réactif et compétent.",
]

export default function About() {
  return (
    <div className="mx-auto max-w-[1240px] px-6 py-20 lg:py-28">
      <SEO
        title="À Propos d'ORSAP — Import & Solutions Industrielles au Maroc"
        description="Découvrez l'histoire, les engagements et l'expertise d'ORSAP : plus de 15 000 références et 300 marques au service des industriels et entreprises au Maroc."
        keywords={[
          "qui sommes nous ORSAP",
          "distributeur industriel Casablanca",
          "fournisseur EPI Maroc",
          "entreprise outillage et sécurité Maroc"
        ]}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "À propos", url: "/a-propos" }
        ]}
      />
      {/* Intro + image */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <div className="mb-6 flex items-center gap-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-orsap-red">
            <span className="h-px w-8 bg-orsap-red" />À propos d&apos;ORSAP
          </div>
          <h1 className="font-display text-[clamp(2rem,3.6vw,3rem)] font-black leading-[1.02] tracking-[-0.025em]">
            Un partenaire de confiance pour l&apos;industrie marocaine.
          </h1>
          <div className="mt-7 space-y-5 text-[16px] leading-[1.65] text-ink-soft">
            <p>
              Depuis sa création, ORSAP s&apos;est imposé comme un partenaire de
              confiance pour les industriels, les artisans et les particuliers
              au Maroc. Avec plus de 15&nbsp;000 références en stock et la
              représentation de plus de 300 marques internationales, nous
              accompagnons nos clients dans leurs projets d&apos;équipement, de
              maintenance et d&apos;aménagement — du simple besoin ponctuel aux
              chantiers les plus exigeants.
            </p>
            <p>
              Notre mission est simple :{" "}
              <span className="font-semibold text-ink">
                fournir des solutions techniques fiables, rapides et durables
              </span>
              , qui améliorent la productivité, la sécurité et le confort de nos
              clients. Selon vos besoins, protéger vos équipes contre tous les
              risques éventuels lors de l&apos;exécution de leurs missions,
              faciliter le travail en hauteur, ou encore fournir les produits de
              manutention les plus exigeants en termes de sécurité et de normes
              internationales.
            </p>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="relative">
            <div className="absolute -bottom-3 -right-3 hidden h-24 w-24 border-b-2 border-r-2 border-orsap-red lg:block" />
            <img
              src={aboutPhoto}
              alt="Équipe ORSAP installant des échafaudages sur un chantier de rénovation en hauteur"
              className="aspect-square w-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Notre histoire */}
      <div className="mt-20 grid grid-cols-1 gap-8 border-t border-hairline pt-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <h2 className="font-display text-[26px] font-black tracking-[-0.02em]">
            Notre histoire
          </h2>
        </div>
        <div className="space-y-5 text-[16px] leading-[1.65] text-ink-soft lg:col-span-8">
          <p>
            Né d&apos;une vision claire — rapprocher l&apos;industrie marocaine
            des meilleurs standards internationaux — ORSAP a progressivement
            construit une offre complète couvrant l&apos;importation et la
            distribution d&apos;équipements, ainsi que la prestation de services
            techniques sur site. Au fil des années, nous avons développé des
            compétences pointues : EPI, outillage à main et électroportatif,
            roulements et transmission, échafaudages et nacelles, manutention,
            plomberie et fluides, électricité industrielle et bâtiment,
            quincaillerie, revêtements de sols et murs, aménagement et
            équipement d&apos;ateliers.
          </p>
          <p>
            Cette évolution nous a permis de passer d&apos;un rôle de simple
            distributeur à celui de véritable partenaire de solution, capable de
            conseiller, d&apos;étudier et de réaliser des installations sur
            mesure, tout en garantissant un suivi après-vente rigoureux.
          </p>
        </div>
      </div>

      {/* Nos valeurs */}
      <div className="mt-20 border-t border-hairline pt-14">
        <h2 className="mb-10 font-display text-[26px] font-black tracking-[-0.02em]">
          Nos valeurs
        </h2>
        <div className="grid grid-cols-1 gap-px overflow-hidden border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="bg-card p-7">
              <h3 className="font-display text-[18px] font-bold tracking-[-0.01em]">
                {v.title}
              </h3>
              <p className="mt-3 text-[14.5px] leading-[1.6] text-ink-soft">
                {v.body}
              </p>
            </div>
          ))}
          <div className="hidden bg-orsap-red p-7 lg:block">
            <p className="font-display text-[18px] font-bold leading-snug text-white">
              Des solutions
              <br />
              opérationnelles, sûres
              <br />
              et durables.
            </p>
          </div>
        </div>
      </div>

      {/* Ce qui nous différencie */}
      <div className="mt-20 border-t border-hairline pt-14">
        <h2 className="mb-10 font-display text-[26px] font-black tracking-[-0.02em]">
          Ce qui nous différencie
        </h2>
        <div className="grid grid-cols-1 gap-x-14 gap-y-10 md:grid-cols-2">
          {DIFFERENTIATORS.map((d) => (
            <div key={d.no} className="flex gap-5">
              <span className="font-display text-[22px] font-black leading-none text-orsap-red">
                {d.no}
              </span>
              <div className="border-t border-ink pt-3">
                <h3 className="font-display text-[18px] font-bold tracking-[-0.01em]">
                  {d.title}
                </h3>
                <p className="mt-2 text-[14.5px] leading-[1.6] text-ink-soft">
                  {d.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notre engagement */}
      <div className="mt-20 grid grid-cols-1 gap-10 bg-ink p-10 text-paper lg:grid-cols-12 lg:gap-16 lg:p-14">
        <div className="lg:col-span-5">
          <h2 className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] font-black leading-[1.05] tracking-[-0.02em] text-white">
            Notre engagement envers vous
          </h2>
          <p className="mt-4 text-[15px] leading-[1.6] text-white/70">
            Que vous soyez industriel, artisan, promoteur, responsable de site
            ou particulier, notre équipe transforme vos besoins en solutions
            opérationnelles, sûres et durables.
          </p>
          <Link
            to="/devis"
            className="mt-7 inline-flex items-center justify-center bg-orsap-red px-7 py-4 font-display text-[14px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-orsap-red-deep"
          >
            Parler à un expert
          </Link>
        </div>
        <ul className="divide-y divide-white/15 lg:col-span-7">
          {COMMITMENTS.map((c, i) => (
            <li key={c} className="flex gap-5 py-4 first:pt-0">
              <span className="font-mono text-[13px] text-safety">
                0{i + 1}
              </span>
              <span className="text-[16px] leading-[1.5] text-white/90">
                {c}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
