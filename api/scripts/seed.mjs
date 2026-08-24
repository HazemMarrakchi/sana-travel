import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('❌ MONGODB_URI missing — set it in api/.env or as env var')
  process.exit(1)
}

const offerSchema = new mongoose.Schema({}, { collection: 'offers', strict: false })
const Offer = mongoose.model('Offer', offerSchema)

const in90 = () => new Date(Date.now() + 90 * 24 * 3600 * 1000)
const in330 = () => new Date(Date.now() + 330 * 24 * 3600 * 1000)

const OFFERS = [
  {
    slug: 'cappadoce-magie', title: 'Magie de Cappadoce', city: 'Göreme', country: 'Turquie',
    summary: 'Montgolfières au lever du soleil et nuits en hôtel-grotte.',
    description: "Survolez les vallées féeriques en montgolfière au petit matin, dormez dans un hôtel-grotte taillé dans la roche, explorez les cités souterraines et terminez vos journées sur une terrasse face aux cheminées de fées. Transferts, guide francophone et petits-déjeuners inclus.",
    priceEur: 890, nights: 4, hotelName: 'Cave Suites Cappadocia', rating: 4.8,
    artKey: 'cappadoce', tags: ['culture', 'montgolfière', 'romantique'], featured: true,
    availableFrom: in90(), availableTo: in330(),
  },
  {
    slug: 'santorin-bleu', title: 'Santorin, le bleu absolu', city: 'Fira', country: 'Grèce',
    summary: 'Villages suspendus, couchers de soleil légendaires et caldera à perte de vue.',
    description: "Une semaine entre villages blancs suspendus au-dessus de la caldera, baignades dans les sources chaudes et dîners face au coucher de soleil d'Oia. Ferry volcan inclus, chambre avec vue garantie.",
    priceEur: 1190, nights: 7, hotelName: 'Caldera View Resort', rating: 4.9,
    artKey: 'santorin', tags: ['plage', 'romantique', 'îles'], featured: true,
    availableFrom: in90(), availableTo: in330(),
  },
  {
    slug: 'maldives-lagon', title: 'Maldives, lagon privé', city: 'Male Atoll', country: 'Maldives',
    summary: 'Water-villas sur pilotis, snorkeling avec les raies manta.',
    description: "Votre villa sur pilotis au-dessus d'un lagon turquoise, pension complète, excursion nage avec les raies manta et dîner pieds dans le sable. Le voyage des grandes occasions.",
    priceEur: 2450, nights: 7, hotelName: 'Lagoon Pearl Resort', rating: 5.0,
    artKey: 'maldives', tags: ['plage', 'luxe', 'lune de miel'], featured: true,
    availableFrom: in90(), availableTo: in330(),
  },
  {
    slug: 'marrakech-imperial', title: 'Marrakech impériale', city: 'Marrakech', country: 'Maroc',
    summary: 'Riads cachés, souks colorés et nuit sous les étoiles du désert.',
    description: "Médina et palais historiques, soirée agafay sous les étoiles, jardin Majorelle et hammam traditionnel. Riad boutique en centre-ville, transferts aéroport inclus.",
    priceEur: 560, nights: 4, hotelName: 'Riad Dar Sana', rating: 4.7,
    artKey: 'marrakech', tags: ['culture', 'désert', 'court séjour'], featured: false,
    availableFrom: in90(), availableTo: in330(),
  },
  {
    slug: 'istanbul-deux-continents', title: 'Istanbul, deux continents', city: 'Istanbul', country: 'Turquie',
    summary: 'Sainte-Sophie, Bosphore et bazars millénaires.',
    description: "Quatre jours pour vivre la ville aux deux continents : Sainte-Sophie, croisière sur le Bosphore, Grand Bazar, quartiers tendance de Karaköy et cuisine de rue incontournable.",
    priceEur: 640, nights: 4, hotelName: 'Bosphorus Boutique Hotel', rating: 4.6,
    artKey: 'istanbul', tags: ['culture', 'gastronomie', 'city break'], featured: false,
    availableFrom: in90(), availableTo: in330(),
  },
  {
    slug: 'bali-emeraude', title: 'Bali émeraude', city: 'Ubud & Seminyak', country: 'Indonésie',
    summary: 'Rizières, temples et plages — le meilleur des deux Bali.',
    description: "Cinq nuits à Ubud entre rizières et temples, puis quatre nuits plage à Seminyak. Cours de cuisine balinaise, lever de soleil au Batur et massage traditionnel offert.",
    priceEur: 1780, nights: 9, hotelName: 'Emerald Sanctuary Resorts', rating: 4.8,
    artKey: 'bali', tags: ['nature', 'plage', 'aventure'], featured: true,
    availableFrom: in90(), availableTo: in330(),
  },
  {
    slug: 'dubai-futuriste', title: 'Dubaï futuriste', city: 'Dubaï', country: 'Émirats Arabes Unis',
    summary: 'Burj Khalifa, désert en 4x4 et dîners panoramiques au sommet du monde.',
    description: "Quatre jours dans la ville du futur : ascension du Burj Khalifa au coucher du soleil, safari dune bashing dans le désert rouge avec dîner bedouin, Dubai Mall et fontaines, marina en dhow croisière et quartier futuristic Al Seef. Hôtel 5 étoiles près de la marina, transferts privés inclus.",
    priceEur: 1350, nights: 4, hotelName: 'Marina Sky Hotel', rating: 4.8,
    artKey: 'dubai', tags: ['luxe', 'famille', 'city break'], featured: true,
    availableFrom: in90(), availableTo: in330(),
  },
]

/** Photos vérifiées (HTTP 200) — Istanbul via Wikimedia Commons (titre explicite Hagia Sophia) */
const U = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`
const PHOTOS = {
  cappadoce: U('1533105079780-92b9be482077'),
  santorin: U('1570077188670-e3a8d69ac5ff'),
  maldives: U('1514282401047-d79a71a590e8'),
  marrakech: U('1597212618440-806262de4f6b'),
  istanbul: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Hagia_Sophia_Istanbul_Old_City%2C_Turkey_%28Unsplash%29.jpg/1280px-Hagia_Sophia_Istanbul_Old_City%2C_Turkey_%28Unsplash%29.jpg',
  bali: U('1537996194471-e657df975ab4'),
  dubai: U('1512453979798-5ea266f8880c'),
}

try {
  await mongoose.connect(uri)
  await Offer.deleteMany({})
  const docs = OFFERS.map((o) => ({ ...o, images: [PHOTOS[o.artKey]].filter(Boolean) }))
  const inserted = await Offer.insertMany(docs)
  console.log(`✅ ${inserted.length} offers seeded into sana_travel.offers`)
  await mongoose.disconnect()
} catch (err) {
  console.error('❌ Seed failed:', err.message)
  process.exit(1)
}
