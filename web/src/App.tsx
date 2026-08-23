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

export default function App() {
  const { pathname } = useLocation()
  const isAdmin = pathname === '/admin'
  return (
    <div className="min-h-screen">
      {!isAdmin && <Navbar />}
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
      {!isAdmin && <Footer />}
      {!isAdmin && <ChatWidget />}
    </div>
  )
}
