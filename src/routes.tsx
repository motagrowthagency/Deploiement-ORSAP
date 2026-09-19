import { createBrowserRouter, Navigate } from "react-router"
import Root from "@/layout/Root"
import Home from "@/pages/Home"
import About from "@/pages/About"
import Solutions from "@/pages/Solutions"
import SolutionDetail from "@/pages/SolutionDetail"
import PreventionPage from "@/pages/PreventionPage"
import Services from "@/pages/Services"
import ServiceDetail from "@/pages/ServiceDetail"
import Brands from "@/pages/Brands"
import BrandDetail from "@/pages/BrandDetail"
import Testimonials from "@/pages/Testimonials"
import TestimonialDetail from "@/pages/TestimonialDetail"
import Devis from "@/pages/Devis"
import ComingSoon from "@/pages/ComingSoon"
import Blog from "@/pages/Blog"
import BlogDetail from "@/pages/BlogDetail"
import Contact from "@/pages/Contact"
import Recruitment from "@/pages/Recruitment"
import EspaceClient from "@/pages/EspaceClient"
import Admin from "@/pages/Admin"
import PrivacyPolicy from "@/pages/PrivacyPolicy"
import TermsAndConditions from "@/pages/TermsAndConditions"
import CookiePolicy from "@/pages/CookiePolicy"
import RefundPolicy from "@/pages/RefundPolicy"

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "a-propos", Component: About },
      
      // Redirects for legacy catalogue/produits routes to B2B solutions
      { path: "catalogue", element: <Navigate to="/solutions" replace /> },
      { path: "produits", element: <Navigate to="/solutions" replace /> },
      { path: "produits/:category", Component: SolutionDetail },
      { path: "produits/:category/:sub", Component: SolutionDetail },
      
      // Solutions architecture
      { path: "solutions", Component: Solutions },
      { path: "solutions/:category", Component: SolutionDetail },
      { path: "solutions/:category/:sub", Component: SolutionDetail },
      { path: "solutions/:category/:sub/:sub2", Component: SolutionDetail },

      // Prevention & HSE Hubs
      { path: "blog/prevention", Component: PreventionPage },
      { path: "blog/prevention/ergonomie", Component: PreventionPage },
      { path: "blog/prevention/tms", Component: PreventionPage },

      { path: "services", Component: Services },
      { path: "services/:service", Component: ServiceDetail },
      { path: "marques", Component: Brands },
      { path: "marques/:brand", Component: BrandDetail },
      { path: "temoignages", Component: Testimonials },
      { path: "temoignages/:client", Component: TestimonialDetail },
      { path: "devis", Component: Devis },
      { path: "blog", Component: Blog },
      { path: "blog/:id", Component: BlogDetail },
      { path: "recrutement", Component: Recruitment },
      { path: "contact", Component: Contact },
      { path: "espace-client", Component: EspaceClient },
      { path: "espace-client/verify", Component: EspaceClient },
      { path: "admin", Component: Admin },

      // Legal & Compliance Routes
      { path: "politique-de-confidentialite", Component: PrivacyPolicy },
      { path: "conditions-generales", Component: TermsAndConditions },
      { path: "mentions-legales", element: <Navigate to="/conditions-generales" replace /> },
      { path: "politique-des-cookies", Component: CookiePolicy },
      { path: "politique-de-retour", Component: RefundPolicy },

      {
        path: "intranet",
        element: (
          <ComingSoon title="Intranet" description="Très prochainement" />
        ),
      },
      {
        path: "*",
        element: (
          <ComingSoon
            title="Erreur 404"
            description="La page que vous cherchez est introuvable."
          />
        ),
      },
    ],
  },
])
