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

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "a-propos", Component: About },
      
      // Solutions architecture
      { path: "solutions", Component: Solutions },
      { path: "solutions/:category", Component: SolutionDetail },
      { path: "solutions/:category/:sub", Component: SolutionDetail },
      { path: "solutions/:category/:sub/:sub2", Component: SolutionDetail },

      // Prevention & HSE Hubs
      { path: "blog/prevention", Component: PreventionPage },
      { path: "blog/prevention/ergonomie", Component: PreventionPage },
      { path: "blog/prevention/tms", Component: PreventionPage },

      // Legacy products redirects & aliases
      { path: "produits", element: <Navigate to="/solutions" replace /> },
      { path: "produits/:category", Component: SolutionDetail },
      { path: "produits/:category/:sub", Component: SolutionDetail },

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
