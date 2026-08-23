import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { HomePage } from './features/home/HomePage'
import { DestinationsPage } from './features/destinations/DestinationsPage'
import { OfferDetailPage } from './features/offers/OfferDetailPage'
import { BookingPage } from './features/booking/BookingPage'
import { LoginPage } from './features/auth/LoginPage'
import { AccountPage } from './features/account/AccountPage'
import { AdminPage } from './features/admin/AdminPage'
import { ChatWidget } from './features/concierge/ChatWidget'
import { ConciergePage } from './features/concierge/ConciergePage'
import { ContactPage } from './features/contact/ContactPage'

const TITLES: Record<string, string> = {
  '/': 'Voyages sur mesure',
  '/destinations': 'Destinations',
  '/offres': 'Offre',
  '/booking': 'Réservation',
  '/concierge': 'Concierge IA',
  '/contact': 'Contact',
  '/login': 'Connexion',
  '/account': 'Mon compte',
  '/admin': 'Administration',
}

const WHATSAPP = import.meta.env.VITE_WHATSAPP ?? ''

/** bulle WhatsApp — visible uniquement si VITE_WHATSAPP est configuré */
function WhatsappFloat() {
  if (!WHATSAPP) return null
  return (
    <a
      href={`https://wa.me/${WHATSAPP}`}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-24 end-5 z-40 grid h-13 w-13 place-items-center rounded-full bg-[#25D366] text-2xl shadow-xl shadow-[#25D366]/40 transition-transform hover:scale-110"
    >
      💬
    </a>
  )
}

export default function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    const p = '/' + (pathname.split('/')[1] ?? '')
    document.title = `${TITLES[p] ?? 'Bienvenue'} · SANA Travel`
  }, [pathname])

  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/destinations" element={<DestinationsPage />} />
        <Route path="/offres/:slug" element={<OfferDetailPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/concierge" element={<ConciergePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route
          path="*"
          element={
            <main className="grid min-h-screen place-items-center px-6 text-center">
              <div>
                <p className="font-display text-6xl font-black">404</p>
                <p className="text-slate-soft mt-2">Cette page a pris un vol sans prévenir.</p>
              </div>
            </main>
          }
        />
      </Routes>
      <Footer />
      <ChatWidget />
      <WhatsappFloat />
    </div>
  )
}
