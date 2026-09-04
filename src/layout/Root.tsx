import { useState } from "react"
import { Link, NavLink, Outlet, ScrollRestoration } from "react-router"
import orsapIcon from "@/imports/logo.jpg"
import { NAV } from "@/layout/nav"
import ClientListPopup from "@/components/ClientListPopup"

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

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      {/* Utility strip */}
      <div className="hidden bg-ink text-paper md:block">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-2 text-[12px]">
          <span className="text-white/60">
            Import &amp; distribution · Services aux industries · &nbsp; - EPI &nbsp; - Travail en Hauteur &nbsp; - Manutention &nbsp; - Personnalisation de vêtement de Travail
          </span>
          <div className="flex items-center gap-5 text-white/70">
            <a href="tel:+212644203030" className="hover:text-white">
              +212 6 44 20 30 30
            </a>
            <span className="text-white/25">/</span>
            <a href="#" className="hover:text-white">
              Espace client
            </a>
          </div>
        </div>
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-hairline bg-paper/95 backdrop-blur">
        <nav className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-4">
          <OrsapMark />
          <ul className="hidden items-center gap-8 lg:flex">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `text-[14px] font-medium transition-colors ${
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
          <div className="flex items-center gap-3">
            <Link
              to="/devis"
              className="hidden bg-orsap-red px-5 py-2.5 font-display text-[13px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-orsap-red-deep sm:inline-block"
            >
              Demander un devis
            </Link>
            <button
              type="button"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="grid size-11 place-items-center border border-hairline text-ink lg:hidden"
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
          <div className="border-t border-hairline bg-paper lg:hidden">
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
            </ul>
            <div className="mx-auto max-w-[1240px] px-6 pb-4">
              <Link
                to="/devis"
                onClick={() => setMenuOpen(false)}
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
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-10 px-6 py-14 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <img
                src={orsapIcon}
                alt="ORSAP"
                className="size-8 rounded-[6px] object-contain"
              />
              <span className="font-display text-[18px] font-black tracking-[-0.03em] text-white">
                ORSAP
              </span>
            </div>
            <p className="mt-4 max-w-sm text-[14px] leading-[1.6] text-white/60">
              Import, distribution et services aux industries. Plus de 15 000
              références et 300 marques au service des industriels, artisans et
              particuliers au Maroc.
            </p>
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">
              Navigation
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
              Contact
            </div>
            <ul className="mt-4 space-y-2 text-[14px] text-white/70">
              <li>Casablanca, Maroc</li>
              <li>
                <a href="tel:+212644203030" className="hover:text-white">
                  +212 6 44 20 30 30
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/212644203030"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  WhatsApp : +212 6 44 20 30 30
                </a>
              </li>
              <li>
                <a href="mailto:orsap@orsap.ma" className="hover:text-white">
                  orsap@orsap.ma
                </a>
              </li>
              <li>
                <Link to="/devis" className="text-white hover:text-orsap-red">
                  Demander un devis →
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-[1240px] px-6 py-5 text-[12px] text-white/40">
            © {new Date().getFullYear()} ORSAP. Tous droits réservés.
          </div>
        </div>
      </footer>

      <ClientListPopup />
      <ScrollRestoration />
    </div>
  )
}
