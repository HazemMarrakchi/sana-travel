export interface Offer {
  slug: string
  title: string
  city: string
  country: string
  summary: string
  description: string
  priceEur: number
  nights: number
  hotelName: string
  rating: number
  tags: string[]
  artKey: string
  featured: boolean
}

/** poster gradient per artKey — replaced by real photos later */
export const ART: Record<string, string> = {
  cappadoce: 'from-orange-300 via-rose-400 to-purple-500',
  santorin: 'from-sky-300 via-blue-400 to-indigo-600',
  maldives: 'from-cyan-200 via-teal-400 to-emerald-600',
  marrakech: 'from-amber-300 via-orange-500 to-red-600',
  istanbul: 'from-violet-400 via-fuchsia-500 to-rose-500',
  bali: 'from-lime-300 via-emerald-400 to-cyan-600',
  aurora: 'from-gold via-coral to-lagoon',
}

export const FALLBACK_OFFERS: Offer[] = [
  {
    slug: 'cappadoce-magie', title: 'Magie de Cappadoce', city: 'Göreme', country: 'Turquie',
    summary: 'Montgolfières au lever du soleil et nuits en hôtel-grotte.',
    description: "Survolez les vallées féeriques en montgolfière au petit matin, dormez dans un hôtel-grotte taillé dans la roche, explorez les cités souterraines et terminez vos journées sur une terrasse face aux cheminées de fées.",
    priceEur: 890, nights: 4, hotelName: 'Cave Suites Cappadocia', rating: 4.8,
    artKey: 'cappadoce', tags: ['culture', 'montgolfière', 'romantique'], featured: true,
  },
  {
    slug: 'santorin-bleu', title: 'Santorin, le bleu absolu', city: 'Fira', country: 'Grèce',
    summary: 'Villages suspendus, couchers de soleil légendaires et caldera à perte de vue.',
    description: "Une semaine entre villages blancs suspendus au-dessus de la caldera, baignades dans les sources chaudes et dîners face au coucher de soleil d'Oia. Ferry volcan inclus, chambre avec vue garantie.",
    priceEur: 1190, nights: 7, hotelName: 'Caldera View Resort', rating: 4.9,
    artKey: 'santorin', tags: ['plage', 'romantique', 'îles'], featured: true,
  },
  {
    slug: 'maldives-lagon', title: 'Maldives, lagon privé', city: 'Male Atoll', country: 'Maldives',
    summary: 'Water-villas sur pilotis, snorkeling avec les raies manta.',
    description: "Votre villa sur pilotis au-dessus d'un lagon turquoise, pension complète, excursion nage avec les raies manta et dîner pieds dans le sable. Le voyage des grandes occasions.",
    priceEur: 2450, nights: 7, hotelName: 'Lagoon Pearl Resort', rating: 5.0,
    artKey: 'maldives', tags: ['plage', 'luxe', 'lune de miel'], featured: true,
  },
  {
    slug: 'marrakech-imperial', title: 'Marrakech impériale', city: 'Marrakech', country: 'Maroc',
    summary: 'Riads cachés, souks colorés et nuit sous les étoiles du désert.',
    description: "Médina et palais historiques, soirée agafay sous les étoiles, jardin Majorelle et hammam traditionnel. Riad boutique en centre-ville, transferts aéroport inclus.",
    priceEur: 560, nights: 4, hotelName: 'Riad Dar Sana', rating: 4.7,
    artKey: 'marrakech', tags: ['culture', 'désert', 'court séjour'], featured: false,
  },
  {
    slug: 'istanbul-deux-continents', title: 'Istanbul, deux continents', city: 'Istanbul', country: 'Turquie',
    summary: 'Sainte-Sophie, Bosphore et bazars millénaires.',
    description: "Quatre jours pour vivre la ville aux deux continents : Sainte-Sophie, croisière sur le Bosphore, Grand Bazar, quartiers tendance de Karaköy et cuisine de rue incontournable.",
    priceEur: 640, nights: 4, hotelName: 'Bosphorus Boutique Hotel', rating: 4.6,
    artKey: 'istanbul', tags: ['culture', 'gastronomie', 'city break'], featured: false,
  },
  {
    slug: 'bali-emeraude', title: 'Bali émeraude', city: 'Ubud & Seminyak', country: 'Indonésie',
    summary: 'Rizières, temples et plages — le meilleur des deux Bali.',
    description: "Cinq nuits à Ubud entre rizières et temples, puis quatre nuits plage à Seminyak. Cours de cuisine balinaise, lever de soleil au Batur et massage traditionnel offert.",
    priceEur: 1780, nights: 9, hotelName: 'Emerald Sanctuary Resorts', rating: 4.8,
    artKey: 'bali', tags: ['nature', 'plage', 'aventure'], featured: true,
  },
]
