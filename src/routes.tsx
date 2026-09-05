import { createBrowserRouter, Navigate } from "react-router"
import Root from "@/layout/Root"
import Home from "@/pages/Home"
import About from "@/pages/About"
import Products from "@/pages/Products"
import ProductCategory from "@/pages/ProductCategory"
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
import BlogMaker from "@/pages/BlogMaker"

export const router = createBrowserRouter([
  { path: "/blogmaker", Component: BlogMaker },
  { path: "/blog-maker", Component: BlogMaker },
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "a-propos", Component: About },
      { path: "produits", Component: Products },
      { path: "produits/:category", Component: ProductCategory },
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
