import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('❌ MONGODB_URI missing')
  process.exit(1)
}

const offerSchema = new mongoose.Schema({}, { collection: 'offers', strict: false })
const Offer = mongoose.model('Offer', offerSchema)

const in180 = () => new Date(Date.now() + 180 * 24 * 3600 * 1000)
const in540 = () => new Date(Date.now() + 540 * 24 * 3600 * 1000)

const U = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`
const W = (f) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(f)}?width=1200`

/** Photos à titre explicite — Wikimedia Commons */
const HOTELS = [
  {
    slug: 'hotel-djerba-palace',
    title: 'Djerba Palace Resort & Spa',
    city: 'Djerba',
    country: 'Tunisie',
    summary: 'Hôtel 5* pieds dans l’eau — tout inclus, spa et plage privée.',
    description:
      'Le séjour hôtel par excellence à Djerba : chambre vue mer, formule tout inclus, grande piscine lagune, centre de spa traditionnel et plage privée aménagée. Navette aéroport et sports nautiques inclus.',
    priceEur: 320,
    nights: 4,
    hotelName: 'Djerba Palace Resort & Spa',
    rating: 4.7,
    artKey: 'djerba',
    tags: ['hôtel', 'plage', 'famille'],
    featured: true,
    availableFrom: in180(),
    availableTo: in540(),
    images: [W('Hotel beach, Djerba, Tunisia (2007).jpg'), W('Djerba el mouradi menzel hotel beach-7.jpg')],
  },
  {
    slug: 'hotel-hammamet-garden',
    title: 'Hammamet Garden Beach',
    city: 'Hammamet',
    country: 'Tunisie',
    summary: 'Escapade bord de mer — petit-déjeuner, piscine et médina à pied.',
    description:
      'Trois nuits face à la mer dans un jardin d’orangers : chambres rénovées, petit-déjeuner généreux, deux piscines et accès direct à la plage. La médina et le port de plaisance se visitent à pied.',
    priceEur: 190,
    nights: 3,
    hotelName: 'Hammamet Garden Beach',
    rating: 4.5,
    artKey: 'hammamet',
    tags: ['hôtel', 'plage', 'court séjour'],
    featured: false,
    availableFrom: in180(),
    availableTo: in540(),
    images: [W('Hammamet-Sud beach R02.jpg'), W('Hammamet-Sud beach R05.jpg')],
  },
  {
    slug: 'hotel-giza-pyramids-view',
    title: 'Giza Pyramid View Hotel',
    city: 'Le Caire',
    country: 'Égypte',
    summary: 'Réveil face aux pyramides — rooftop panoramique et excursions guidées.',
    description:
      'Un hôtel boutique dont chaque terrasse donne sur les pyramides de Gizeh : petit-déjeuner sur le rooftop, navette pour le Musée égyptien, soirée son et lumière au pied du Sphinx et guide francophone dédié.',
    priceEur: 420,
    nights: 4,
    hotelName: 'Giza Pyramid View Hotel',
    rating: 4.6,
    artKey: 'giza',
    tags: ['hôtel', 'culture', 'city break'],
    featured: false,
    availableFrom: in180(),
    availableTo: in540(),
    images: [W('All Gizah Pyramids.jpg'), W('Giza Pyramids during "Forever is Now" exhibition.jpg')],
  },
  {
    slug: 'hotel-trastevere-rome',
    title: 'Trastevere Boutique Suites',
    city: 'Rome',
    country: 'Italie',
    summary: 'Boutique hôtel dans le quartier le plus vivant de Rome.',
    description:
      'Suites raffinées au cœur de Trastevere : petit-déjeuner italien à l’italienne, terrasse avec vue toits, colosse du Forum à quinze minutes à pied et carte des trattorias secrètes offerte à l’arrivée.',
    priceEur: 380,
    nights: 3,
    hotelName: 'Trastevere Boutique Suites',
    rating: 4.8,
    artKey: 'rome',
    tags: ['hôtel', 'gastronomie', 'city break'],
    featured: false,
    availableFrom: in180(),
    availableTo: in540(),
    images: [W('Trastevere streets, Rome, Italy.jpg'), W('Trastevere street, Rome, Italy.jpg')],
  },
  {
    slug: 'hotel-lara-beach-antalya',
    title: 'Lara Beach Resort',
    city: 'Antalya',
    country: 'Turquie',
    summary: 'All inclusive 5* sur la plage de Lara — toboggans, spa, buffets.',
    description:
      'Cinq nuits en formule ultra tout inclusive sur la plage de Lara : aquapark privé, six restaurants à la carte, spa hammam et kids-club encadré. La destination famille idéale dès avril.',
    priceEur: 450,
    nights: 5,
    hotelName: 'Lara Beach Resort',
    rating: 4.7,
    artKey: 'antalya',
    tags: ['hôtel', 'plage', 'famille'],
    featured: false,
    availableFrom: in180(),
    availableTo: in540(),
    images: [W('Antalya kaleiçi 2.jpg'), W('Antalya Bucht.jpg')],
  },
  {
    slug: 'hotel-oasis-palm-tozeur',
    title: 'Oasis Palm Lodge',
    city: 'Tozeur',
    country: 'Tunisie',
    summary: 'Lodge au cœur des palmeraies — porte du désert et couchers de soleil.',
    description:
      'Un lodge de charme au milieu de la palmeraie de Tozeur : patios ombragés, piscine d’oasis, dîner sous les étoiles et excursion optionnelle en 4x4 vers Chébika et les décors de Star Wars.',
    priceEur: 150,
    nights: 2,
    hotelName: 'Oasis Palm Lodge',
    rating: 4.6,
    artKey: 'tozeur',
    tags: ['hôtel', 'désert', 'nature'],
    featured: false,
    availableFrom: in180(),
    availableTo: in540(),
    images: [W('Naoura Mosque - Tozeur, Tunisia 05.jpg')],
  },
  {
    slug: 'hotel-gabes-oasis',
    title: 'Gabès Oasis Hôtel',
    city: 'Gabès',
    country: 'Tunisie',
    summary: 'Au cœur de la seule oasis littorale du monde — ménzels, souk Jara et mer.',
    description:
      'Un hôtel paisible face à l\'oasis de Gabès : chambres climatisées style ménzel, petit-déjeuner aux dattes du jardin, visite guidée du marché Jara et des souks, excursion vers les plages de la Skhira et le chott. L\'étape authentique du sud tunisien.',
    priceEur: 120,
    nights: 2,
    hotelName: 'Gabès Oasis Hôtel',
    rating: 4.5,
    artKey: 'gabes',
    tags: ['hôtel', 'nature', 'court séjour'],
    featured: false,
    availableFrom: in180(),
    availableTo: in540(),
    images: [W('Gabes oasis de Lemdoun.JPG'), W('Oasis de Gabès.jpg')],
  },
]

try {
  await mongoose.connect(uri)
  for (const h of HOTELS) {
    await Offer.updateOne({ slug: h.slug }, { $set: h }, { upsert: true })
    console.log(`✅ upsert ${h.slug}`)
  }
  const total = await Offer.countDocuments({})
  const hotels = await Offer.countDocuments({ tags: 'hôtel' })
  console.log(`— total offers: ${total} (dont ${hotels} hôtels)`)
  await mongoose.disconnect()
} catch (err) {
  console.error('❌ failed:', err.message)
  process.exit(1)
}
