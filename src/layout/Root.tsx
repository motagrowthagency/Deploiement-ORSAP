import { useEffect, useState } from "react"
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from "react-router"
import orsapIcon from "@/imports/logo.jpg"
import { NAV } from "@/layout/nav"
import ClientListPopup from "@/components/ClientListPopup"
import CookieConsentBanner from "@/components/CookieConsentBanner"
import GlobalCartDrawer from "@/components/GlobalCartDrawer"
import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext"
import { initAttribution } from "@/utils/attribution"
import {
  trackPageView,
  trackPhoneClick,
  trackWhatsAppClick,
  trackEmailClick,
  trackCtaClick,
} from "@/utils/analytics"

function OrsapMark() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <img
        src={orsapIcon}
        alt="ORSAP"
        className="size-9 rounded-[7px] object-contain"
      />
      <div className="font-display text-[20px] font-black leading-none tracking-[-0.03em] text-ink">
        ORSAP
      </div>
    </Link>
  )
}

export default function Root() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()
  const { totalCount, totalHt, setCartDrawerOpen } = useCart()
  const location = useLocation()

  // Initialize attribution and track SPA virtual pageviews
  useEffect(() => {
    initAttribution()
    trackPageView(location.pathname + location.search)
  }, [location.pathname, location.search])

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      {/* Utility strip */}
      <div className="hidden bg-ink text-paper md:block">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-2 text-[12px]">
          <span className="text-white/60">
            EPI · Travail en hauteur · Manutention · Personnalisation de vêtement de travail
          </span>
          <div className="flex items-center gap-5 text-white/70">
            <a
              href="tel:+212644203030"
              onClick={() => trackPhoneClick("+212644203030", "top_utility_bar")}
              className="hover:text-white"
            >
              +212 6 44 20 30 30
            </a>
            <span className="text-white/25">/</span>
            <Link to="/espace-client" className="inline-flex items-center gap-1.5 hover:text-white transition">
              {user ? (
                <>
                  <span className="size-2 rounded-full bg-emerald-400 inline-block" />
                  <span className="text-white font-semibold">{user.name ? user.name.split(" ")[0] : "Mon Espace"}</span>
                  <span className="text-white/60">(Espace client)</span>
                </>
              ) : (
                <span>Espace client</span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-hairline bg-paper/95 backdrop-blur">
        <nav className="mx-auto grid max-w-[1240px] grid-cols-[auto_1fr_auto] items-center gap-4 px-6 py-3.5">
          <OrsapMark />
          <ul className="hidden min-w-0 items-center justify-center gap-x-5 gap-y-1 whitespace-nowrap xl:flex">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `text-[13px] font-medium tracking-[-0.005em] transition-colors ${
                      isActive
                        ? "text-orsap-red"
                        : "text-ink-soft hover:text-orsap-red"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setCartDrawerOpen(true)}
              title="Ouvrir le panier de devis B2B"
              className={`relative inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 font-display text-[12.5px] font-bold uppercase tracking-wider transition shadow-xs cursor-pointer ${
                totalCount > 0
                  ? "border border-orsap-red bg-orsap-red text-white shadow-md shadow-orsap-red/25 hover:bg-orsap-red-deep"
                  : "border border-hairline bg-paper text-ink-soft hover:border-orsap-red hover:text-orsap-red"
              }`}
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Panier</span>
              <span
                className={`flex size-5 items-center justify-center rounded-full font-mono text-[10px] font-bold ${
                  totalCount > 0
                    ? "bg-white text-orsap-red"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {totalCount}
              </span>
              {totalHt > 0 && (
                <span className="hidden sm:inline font-mono font-normal opacity-90 text-[11px] ml-0.5">
                  · {totalHt.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} DH
                </span>
              )}
            </button>

            <Link
              to="/devis"
              onClick={() => trackCtaClick("Demander un devis", "/devis", "header_desktop")}
              className="hidden bg-orsap-red px-5 py-2.5 font-display text-[13px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-orsap-red-deep sm:inline-block"
            >
              Demander un devis
            </Link>
            <button
              type="button"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="grid size-11 place-items-center border border-hairline text-ink xl:hidden cursor-pointer"
            >
              <span className="relative block h-4 w-5">
                <span
                  className={`absolute left-0 h-0.5 w-5 bg-current transition-all ${
                    menuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 bg-current transition-opacity ${
                    menuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 h-0.5 w-5 bg-current transition-all ${
                    menuOpen
                      ? "top-1/2 -translate-y-1/2 -rotate-45"
                      : "bottom-0"
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-hairline bg-paper xl:hidden">
            <ul className="mx-auto max-w-[1240px] px-6 py-3">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `block border-b border-hairline/60 py-3.5 text-[15px] font-medium transition-colors ${
                        isActive
                          ? "text-orsap-red"
                          : "text-ink hover:text-orsap-red"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <NavLink
                  to="/espace-client"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block border-b border-hairline/60 py-3.5 text-[15px] font-semibold transition-colors ${
                      isActive
                        ? "text-orsap-red"
                        : "text-ink hover:text-orsap-red"
                    }`
                  }
                >
                  {user ? `Mon Espace (${user.name})` : "Espace Client (Connexion / Inscription)"}
                </NavLink>
              </li>
              {totalCount > 0 && (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      setCartDrawerOpen(true)
                    }}
                    className="w-full flex items-center justify-between border-b border-hairline/60 py-3.5 text-[15px] font-bold text-orsap-red text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span>Mon Panier B2B ({totalCount} articles)</span>
                    </span>
                    <span className="font-mono text-sm">{totalHt.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} DH HT</span>
                  </button>
                </li>
              )}
            </ul>
            <div className="mx-auto max-w-[1240px] px-6 pb-4">
              <Link
                to="/devis"
                onClick={() => {
                  trackCtaClick("Demander un devis", "/devis", "header_mobile")
                  setMenuOpen(false)
                }}
                className="block bg-orsap-red px-5 py-3.5 text-center font-display text-[14px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-orsap-red-deep"
              >
                Demander un devis
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline bg-ink text-paper">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <img
                src={orsapIcon}
                alt="Logo ORSAP"
                className="size-8 rounded-[6px] object-contain"
              />
              <span className="font-display text-[18px] font-black tracking-[-0.03em] text-white">
                ORSAP SARL
              </span>
            </div>
            <p className="mt-4 max-w-sm text-[14px] leading-[1.6] text-white/60">
              Importation, distribution technique et services aux industries. Plus de 15 000
              références et 300 marques au service des industriels, professionnels du BTP et artisans au Maroc.
            </p>
            <div className="mt-4 text-xs text-white/40 space-y-1">
              <p>Casablanca, Royaume du Maroc</p>
              <p className="text-[11px] leading-relaxed">
                Traitement des données conforme à la loi marocaine n° 09-08 (CNDP).
              </p>
            </div>
          </div>

          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">
              Solutions & Services
            </div>
            <ul className="mt-4 space-y-2">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className="text-[14px] text-white/70 transition-colors hover:text-white"
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">
              Informations Légales
            </div>
            <ul className="mt-4 space-y-2 text-[14px] text-white/70">
              <li>
                <Link to="/conditions-generales" className="hover:text-white transition-colors">
                  Mentions Légales & CGV
                </Link>
              </li>
              <li>
                <Link to="/politique-de-confidentialite" className="hover:text-white transition-colors">
                  Politique de Confidentialité
                </Link>
              </li>
              <li>
                <Link to="/politique-des-cookies" className="hover:text-white transition-colors">
                  Gestion des Cookies
                </Link>
              </li>
              <li>
                <Link to="/politique-de-retour" className="hover:text-white transition-colors">
                  Retours & Garanties
                </Link>
              </li>
              <li className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("open-cookie-banner"))
                  }}
                  className="text-xs text-white/50 hover:text-orsap-red transition-colors"
                >
                  Gérer les préférences de cookies
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">
              Contact Direct
            </div>
            <ul className="mt-4 space-y-2 text-[14px] text-white/70">
              <li>Casablanca, Maroc</li>
              <li>
                <a
                  href="tel:+212644203030"
                  onClick={() => trackPhoneClick("+212644203030", "footer")}
                  className="hover:text-white transition-colors"
                >
                  +212 6 44 20 30 30
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/212644203030"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick("footer")}
                  className="hover:text-white transition-colors"
                >
                  WhatsApp : +212 6 44 20 30 30
                </a>
              </li>
              <li>
                <a
                  href="mailto:orsap@orsap.ma"
                  onClick={() => trackEmailClick("orsap@orsap.ma", "footer")}
                  className="hover:text-white transition-colors"
                >
                  orsap@orsap.ma
                </a>
              </li>
              <li className="pt-2">
                <Link
                  to="/devis"
                  onClick={() => trackCtaClick("Demander un devis", "/devis", "footer")}
                  className="inline-flex items-center gap-1 font-bold text-orsap-red hover:text-white transition-colors"
                >
                  Demander un devis →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-[1240px] flex-col gap-2 px-6 py-5 text-[12px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <div>
              © {new Date().getFullYear()} ORSAP SARL. Tous droits réservés.
            </div>
            <div className="text-[11px] text-white/30">
              Les marques, logos et visuels cités sont la propriété exclusive de leurs détenteurs respectifs.
            </div>
          </div>
        </div>
      </footer>

      <ClientListPopup />
      <CookieConsentBanner />
      <GlobalCartDrawer />
      <ScrollRestoration />
    </div>
  )
}
