import { Route, Routes } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { HomePage } from './features/home/HomePage'
import { DestinationsPage } from './features/destinations/DestinationsPage'
import { OfferDetailPage } from './features/offers/OfferDetailPage'
import { BookingPage } from './features/booking/BookingPage'

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/destinations" element={<DestinationsPage />} />
        <Route path="/offres/:slug" element={<OfferDetailPage />} />
        <Route path="/booking" element={<BookingPage />} />
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
    </div>
  )
}
