import React, { createContext, useContext, useState, useEffect, useRef, useMemo, ReactNode } from "react"
import { useAuth } from "@/context/AuthContext"

export interface CartLine {
  id: string
  code: string
  designation: string
  priceHt: number
  priceTtc: number
  quantity: number
  imageUrl?: string
  image?: string
  brand?: string
  rayon?: string
  famille?: string
  isCustom?: boolean
  notes?: string
}

export interface ArticleInput {
  id?: string
  code: string
  designation: string
  tva?: number
  priceHt: number
  priceTtc: number
  rayon?: string
  famille?: string
  imageUrl?: string
  image?: string
  brand?: string
  notes?: string
}

export interface CartContactDetails {
  name: string
  company: string
  email: string
  phone: string
  city?: string
  notes?: string
}

interface CartContextType {
  cart: Record<string, CartLine>
  cartItems: CartLine[]
  totalCount: number
  totalHt: number
  totalTva: number
  totalTtc: number
  contactDetails: CartContactDetails
  setContactDetails: React.Dispatch<React.SetStateAction<CartContactDetails>>
  updateContactField: (field: keyof CartContactDetails, value: string) => void
  cartDrawerOpen: boolean
  setCartDrawerOpen: (open: boolean) => void
  addToCart: (article: ArticleInput, qtyToAdd?: number, notes?: string) => void
  updateQuantity: (code: string, newQty: number) => void
  updateItemNotes: (code: string, notes: string) => void
  removeFromCart: (code: string) => void
  addCustomArticle: (name: string, qty?: number, notes?: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = "orsap_active_cart"
const CONTACT_STORAGE_KEY = "orsap_cart_contact_details"

const DEFAULT_CONTACT: CartContactDetails = {
  name: "",
  company: "",
  email: "",
  phone: "",
  city: "",
  notes: "",
}

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null
  try {
    const val = localStorage.getItem(key)
    if (val) return val
  } catch {}
  try {
    const val = sessionStorage.getItem(key)
    if (val) return val
  } catch {}
  return null
}

function writeStorage(key: string, value: string) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, value)
  } catch {}
  try {
    sessionStorage.setItem(key, value)
  } catch {}
}

function removeStorage(key: string) {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(key)
  } catch {}
  try {
    sessionStorage.removeItem(key)
  } catch {}
}

function getInitialCart(): Record<string, CartLine> {
  try {
    const saved =
      readStorage(CART_STORAGE_KEY) ||
      readStorage("orsap_b2b_cart") ||
      readStorage("orsap_saved_cart")

    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        const record: Record<string, CartLine> = {}
        for (const it of parsed) {
          if (it && typeof it === "object" && (it.code || it.id)) {
            const code = String(it.code || it.id).trim()
            record[code] = {
              id: it.id || code,
              code: code,
              designation: it.designation || code,
              priceHt: Number(it.priceHt) || 0,
              priceTtc: Number(it.priceTtc) || 0,
              quantity: Math.max(1, Number(it.quantity) || 1),
              imageUrl: it.imageUrl || it.image,
              brand: it.brand,
              rayon: it.rayon,
              famille: it.famille,
              isCustom: Boolean(it.isCustom),
              notes: it.notes,
            }
          }
        }
        return record
      } else if (parsed && typeof parsed === "object") {
        const record: Record<string, CartLine> = {}
        for (const [key, it] of Object.entries(parsed)) {
          if (it && typeof it === "object") {
            const raw = it as any
            const code = String(raw.code || raw.id || key).trim()
            record[code] = {
              id: raw.id || code,
              code: code,
              designation: raw.designation || code,
              priceHt: Number(raw.priceHt) || 0,
              priceTtc: Number(raw.priceTtc) || 0,
              quantity: Math.max(1, Number(raw.quantity) || 1),
              imageUrl: raw.imageUrl || raw.image,
              brand: raw.brand,
              rayon: raw.rayon,
              famille: raw.famille,
              isCustom: Boolean(raw.isCustom),
              notes: raw.notes,
            }
          }
        }
        return record
      }
    }
  } catch (e) {
    console.warn("Erreur lecture panier storage:", e)
  }
  return {}
}

function getInitialContact(): CartContactDetails {
  try {
    const saved = readStorage(CONTACT_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed && typeof parsed === "object") {
        return { ...DEFAULT_CONTACT, ...parsed }
      }
    }
  } catch (e) {
    console.warn("Erreur lecture contact details storage:", e)
  }
  return DEFAULT_CONTACT
}

function saveCartToStorage(cartData: Record<string, CartLine>) {
  try {
    if (cartData && typeof cartData === "object" && Object.keys(cartData).length > 0) {
      const serialized = JSON.stringify(cartData)
      writeStorage(CART_STORAGE_KEY, serialized)
      writeStorage("orsap_b2b_cart", serialized)
    } else {
      removeStorage(CART_STORAGE_KEY)
      removeStorage("orsap_b2b_cart")
    }
  } catch (e) {
    console.warn("Erreur écriture panier storage:", e)
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth()
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)

  // 1. Initialize cart synchronously from localStorage
  const [cart, setCart] = useState<Record<string, CartLine>>(getInitialCart)

  // 2. Initialize contact details synchronously from localStorage
  const [contactDetails, setContactDetails] = useState<CartContactDetails>(getInitialContact)

  const cartSyncDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialServerLoadedRef = useRef(false)

  // 3. Persist cart immediately to localStorage on every change
  useEffect(() => {
    saveCartToStorage(cart)
  }, [cart])

  // Sync across tabs via window storage event
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue)
            if (parsed && typeof parsed === "object") {
              setCart(parsed)
            }
          } catch {}
        } else {
          setCart({})
        }
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  // 4. Persist contact details immediately to localStorage on every change
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(contactDetails))
      }
    } catch {}
  }, [contactDetails])

  // 5. Update contact details if authenticated user changes
  useEffect(() => {
    if (user) {
      setContactDetails((prev) => ({
        name: prev.name || user.name || "",
        company: prev.company || user.company || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        city: prev.city || "",
        notes: prev.notes || "",
      }))
    }
  }, [user])

  // 6. Restore & merge active cart from server when user logs in
  useEffect(() => {
    if (!token) {
      initialServerLoadedRef.current = true
      return
    }

    fetch("/api/crm/my-cart", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.cart?.items && Array.isArray(data.cart.items) && data.cart.items.length > 0) {
          setCart((prev) => {
            const merged: Record<string, CartLine> = { ...prev }
            for (const it of data.cart.items) {
              if (it && it.code) {
                if (!merged[it.code]) {
                  merged[it.code] = {
                    id: it.id || it.code,
                    code: it.code,
                    designation: it.designation || it.code,
                    priceHt: Number(it.priceHt) || 0,
                    priceTtc: Number(it.priceTtc) || 0,
                    imageUrl: it.imageUrl || it.image,
                    brand: it.brand,
                    rayon: it.rayon,
                    famille: it.famille,
                    quantity: Math.max(1, Number(it.quantity) || 1),
                    isCustom: Boolean(it.isCustom),
                    notes: it.notes,
                  }
                }
              }
            }
            saveCartToStorage(merged)
            return merged
          })
        }
        if (data?.cart?.clientName && !contactDetails.name) {
          setContactDetails((prev) => ({
            name: prev.name || data.cart.clientName,
            company: prev.company || data.cart.clientCompany || "",
            email: prev.email || data.cart.clientEmail || "",
            phone: prev.phone || data.cart.clientPhone || "",
            city: prev.city || "",
            notes: prev.notes || data.cart.notes || "",
          }))
        }
      })
      .catch(() => {})
      .finally(() => {
        initialServerLoadedRef.current = true
      })
  }, [token])

  // 7. Cart calculations
  const { cartItems, totalCount, totalHt, totalTva, totalTtc } = useMemo(() => {
    const items = Object.values(cart)
    const count = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)
    const ht = items.reduce((sum, item) => sum + (Number(item.priceHt) || 0) * (Number(item.quantity) || 1), 0)
    const ttc = items.reduce((sum, item) => sum + (Number(item.priceTtc) || 0) * (Number(item.quantity) || 1), 0)
    const tva = ttc - ht
    return {
      cartItems: items,
      totalCount: count,
      totalHt: ht,
      totalTva: tva,
      totalTtc: ttc,
    }
  }, [cart])

  // 8. Debounced CRM Cloud Sync (for both logged-in users and guests with contact info)
  useEffect(() => {
    if (cartSyncDebounceRef.current) {
      clearTimeout(cartSyncDebounceRef.current)
    }

    // Do not sync until initial load has completed if token is present
    if (token && !initialServerLoadedRef.current) return

    const hasItems = cartItems.length > 0
    const hasContact = Boolean(user || contactDetails.phone.trim().length >= 6 || contactDetails.email.includes("@"))

    if (!hasItems && !token) return

    cartSyncDebounceRef.current = setTimeout(async () => {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" }
        if (token) headers["Authorization"] = `Bearer ${token}`

        await fetch("/api/crm/cart-sync", {
          method: "POST",
          headers,
          body: JSON.stringify({
            guest: !token && hasContact ? {
              name: contactDetails.name.trim() || "Visiteur Catalogue",
              company: contactDetails.company.trim() || null,
              email: contactDetails.email.trim() || null,
              phone: contactDetails.phone.trim() || null,
              city: contactDetails.city?.trim() || null,
              notes: contactDetails.notes?.trim() || null,
            } : undefined,
            items: cartItems.map((i) => ({
              code: i.code,
              designation: i.designation,
              priceHt: i.priceHt,
              priceTtc: i.priceTtc,
              quantity: i.quantity,
              imageUrl: i.imageUrl || i.image,
              brand: i.brand,
              rayon: i.rayon,
              famille: i.famille,
              isCustom: i.isCustom,
              notes: i.notes,
            })),
            totalCount,
            totalHt,
            totalTtc,
            notes: contactDetails.notes?.trim() || undefined,
          }),
        })
      } catch {}
    }, 1000)

    return () => {
      if (cartSyncDebounceRef.current) {
        clearTimeout(cartSyncDebounceRef.current)
      }
    }
  }, [cartItems, totalCount, totalHt, totalTtc, contactDetails, token, user])

  // 9. Operations
  const updateContactField = (field: keyof CartContactDetails, value: string) => {
    setContactDetails((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addToCart = (article: ArticleInput, qtyToAdd = 1, notes?: string) => {
    const code = String(article.code).trim()
    if (!code) return

    setCart((prev) => {
      const existing = prev[code]
      const newQty = existing ? existing.quantity + qtyToAdd : Math.max(1, qtyToAdd)
      const next: Record<string, CartLine> = {
        ...prev,
        [code]: {
          id: article.id || code,
          code: code,
          designation: article.designation || code,
          priceHt: Number(article.priceHt) || 0,
          priceTtc: Number(article.priceTtc) || 0,
          imageUrl: article.imageUrl || article.image,
          brand: article.brand,
          rayon: article.rayon,
          famille: article.famille,
          quantity: newQty,
          notes: notes !== undefined ? notes : (existing?.notes || article.notes),
        },
      }
      saveCartToStorage(next)
      return next
    })
  }

  const updateQuantity = (code: string, newQty: number) => {
    const trimmedCode = String(code).trim()
    if (newQty <= 0) {
      removeFromCart(trimmedCode)
      return
    }
    setCart((prev) => {
      if (!prev[trimmedCode]) return prev
      const next: Record<string, CartLine> = {
        ...prev,
        [trimmedCode]: { ...prev[trimmedCode], quantity: Math.max(1, newQty) },
      }
      saveCartToStorage(next)
      return next
    })
  }

  const updateItemNotes = (code: string, notes: string) => {
    const trimmedCode = String(code).trim()
    setCart((prev) => {
      if (!prev[trimmedCode]) return prev
      const next: Record<string, CartLine> = {
        ...prev,
        [trimmedCode]: { ...prev[trimmedCode], notes },
      }
      saveCartToStorage(next)
      return next
    })
  }

  const removeFromCart = (code: string) => {
    const trimmedCode = String(code).trim()
    setCart((prev) => {
      const copy = { ...prev }
      delete copy[trimmedCode]
      saveCartToStorage(copy)
      return copy
    })
  }

  const addCustomArticle = (name: string, qty = 1, notes?: string) => {
    if (!name.trim()) return
    const customCode = `SURMESURE-${Date.now()}`
    setCart((prev) => {
      const next: Record<string, CartLine> = {
        ...prev,
        [customCode]: {
          id: customCode,
          code: customCode,
          designation: name.trim(),
          priceHt: 0,
          priceTtc: 0,
          quantity: Math.max(1, qty),
          isCustom: true,
          notes: notes?.trim() || undefined,
        },
      }
      saveCartToStorage(next)
      return next
    })
  }

  const clearCart = () => {
    setCart({})
    saveCartToStorage({})
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        totalCount,
        totalHt,
        totalTva,
        totalTtc,
        contactDetails,
        setContactDetails,
        updateContactField,
        cartDrawerOpen,
        setCartDrawerOpen,
        addToCart,
        updateQuantity,
        updateItemNotes,
        removeFromCart,
        addCustomArticle,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
