import { Link } from "react-router"
import SEO from "@/components/SEO"

export default function CookiePolicy() {
  return (
    <div className="bg-paper text-ink">
      <SEO
        title="Politique de Gestion des Cookies | ORSAP Maroc"
        description="Découvrez comment le site orsap.ma utilise les cookies et traceurs techniques pour assurer son bon fonctionnement et mesurer son audience dans le respect de votre vie privée."
        keywords={[
          "politique cookies orsap",
          "gestion des cookies maroc",
          "cookies techniques orsap.ma",
          "confidentialite traceurs casablanca"
        ]}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Politique des cookies", url: "/politique-des-cookies" }
        ]}
      />

      {/* Header Banner */}
      <section className="border-b border-hairline bg-card py-14 lg:py-20">
        <div className="mx-auto max-w-[1240px] px-6">
          <nav className="mb-6 flex items-center gap-2 text-[12.5px] text-ink-soft">
            <Link to="/" className="hover:text-orsap-red focus-visible:ring-2 focus-visible:ring-orsap-red rounded">
              Accueil
            </Link>
            <span className="text-hairline">/</span>
            <span className="text-ink font-medium">Politique des cookies</span>
          </nav>
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orsap-red">
              <span className="h-px w-6 bg-orsap-red" />
              Transparence & Traceurs
            </div>
            <h1 className="font-display text-[clamp(2rem,3.5vw,3.2rem)] font-black leading-tight tracking-tight text-ink">
              Politique des Cookies
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              Lors de votre navigation sur le site <strong>orsap.ma</strong>, des informations relatives à votre terminal (ordinateur, tablette, smartphone) peuvent être enregistrées sous forme de fichiers texte dénommés « cookies ». Cette page vous explique leur fonctionnement et vos moyens de contrôle.
            </p>
            <div className="mt-4 text-xs text-ink-soft font-mono">
              Dernière mise à jour : 17 Septembre 2026
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-[900px] px-6 space-y-10 text-[15px] leading-relaxed text-ink/90">

          {/* Section 1 */}
          <div className="rounded-xl border border-hairline bg-white p-7 shadow-xs">
            <h2 className="font-display text-xl font-bold text-ink mb-4 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-orsap-red/10 text-xs font-bold text-orsap-red">1</span>
              Qu&apos;est-ce qu&apos;un Cookie ?
            </h2>
            <p className="text-ink-soft">
              Un cookie est un petit fichier texte déposé sur votre navigateur lors de la consultation d&apos;un site web. Il permet au site de mémoriser vos préférences (session de connexion, panier de devis en cours, préférences d&apos;affichage) pour faciliter votre navigation et assurer les fonctionnalités essentielles.
            </p>
          </div>

          {/* Section 2 */}
          <div className="rounded-xl border border-hairline bg-white p-7 shadow-xs">
            <h2 className="font-display text-xl font-bold text-ink mb-4 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-orsap-red/10 text-xs font-bold text-orsap-red">2</span>
              Les Cookies Utilisés sur ORSAP.ma
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-paper border border-hairline/60">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-block size-2.5 rounded-full bg-emerald-500" />
                  <strong className="text-ink font-display text-base">Cookies Strictement Nécessaires (Non désactivables)</strong>
                </div>
                <p className="text-xs text-ink-soft leading-relaxed">
                  Ces cookies sont indispensables au fonctionnement technique du site orsap.ma. Ils gèrent le maintien sécurisé de votre session dans l&apos;Espace Client B2B, l&apos;enregistrement temporaire des articles sélectionnés pour votre demande de devis et la mémorisation de votre choix de consentement cookie.
                </p>
                <div className="mt-2 text-[11px] font-mono text-steel">
                  Exemples : <code>orsap_session</code>, <code>orsap_auth_token</code>, <code>orsap_cookie_consent</code>.
                </div>
              </div>

              <div className="p-4 rounded-lg bg-paper border border-hairline/60">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-block size-2.5 rounded-full bg-blue-500" />
                  <strong className="text-ink font-display text-base">Cookies de Mesure d&apos;Audience & Performance (Optionnels)</strong>
                </div>
                <p className="text-xs text-ink-soft leading-relaxed">
                  Ces cookies permettent d&apos;établir des statistiques anonymes de fréquentation (volumes de visites, pages les plus consultées, détection d&apos;éventuelles erreurs de navigation) afin d&apos;améliorer l&apos;expérience utilisateur. Ils ne collectent aucune information nominative directe et ne sont activés qu&apos;avec votre accord.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="rounded-xl border border-hairline bg-white p-7 shadow-xs">
            <h2 className="font-display text-xl font-bold text-ink mb-4 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-orsap-red/10 text-xs font-bold text-orsap-red">3</span>
              Gestion & Paramétrage de vos Préférences
            </h2>
            <p className="text-ink-soft">
              Vous pouvez à tout moment accepter, refuser ou modifier vos préférences en matière de cookies :
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-cookie-banner"))
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-paper hover:bg-orsap-red transition focus-visible:ring-2 focus-visible:ring-orsap-red focus-visible:outline-none"
              >
                ⚙️ Modifier mes préférences cookies
              </button>
            </div>
            <p className="mt-4 text-xs text-steel">
              Vous pouvez également configurer votre navigateur pour bloquer systématiquement les cookies (Chrome : Paramètres &gt; Confidentialité ; Firefox : Options &gt; Vie privée ; Safari : Préférences &gt; Confidentialité). Le blocage des cookies nécessaires peut toutefois dégrader le fonctionnement de l&apos;Espace Client et de la sélection de devis.
            </p>
          </div>

          {/* Section 4 */}
          <div className="rounded-xl border border-hairline bg-white p-7 shadow-xs">
            <h2 className="font-display text-xl font-bold text-ink mb-4 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg bg-orsap-red/10 text-xs font-bold text-orsap-red">4</span>
              Durée de Conservation
            </h2>
            <p className="text-ink-soft">
              Votre choix de consentement est conservé sur votre navigateur pendant une durée maximale de <strong>13 mois</strong>, au terme de laquelle votre consentement vous sera à nouveau sollicité.
            </p>
          </div>

        </div>
      </section>
    </div>
  )
}
