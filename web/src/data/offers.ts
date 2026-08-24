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
  photo?: string
  images?: string[]
}

const U = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`

/** Unsplash IDs vérifiés HTTP 200 le 2026-08-22 */
export const PHOTOS = {
  cappadoce: U('1533105079780-92b9be482077'),
  santorin: U('1570077188670-e3a8d69ac5ff'),
  maldives: U('1514282401047-d79a71a590e8'),
  marrakech: U('1597212618440-806262de4f6b'),
  istanbul: U('1524231757912-21f4fe3a7200'),
  bali: U('1537996194471-e657df975ab4'),
  dubai: U('1512453979798-5ea266f8880c'),
  djerba: U('1566073771259-6a8506099945'),
  hammamet: U('1520250497591-112f2f40a3f4'),
  giza: U('1503177119275-0aa32b3a9368'),
  rome: U('1552832230-c0197dd311b5'),
  antalya: U('1512918728675-ed5a9ecdebfd'),
  tozeur: U('1509316785289-025f5b846b35'),
  gabes: U('1518495973542-4542c06a5843'),
}

/** poster gradient per artKey — replaced by real photos later */
export const ART: Record<string, string> = {
  cappadoce: 'from-orange-300 via-rose-400 to-purple-500',
  santorin: 'from-sky-300 via-blue-400 to-indigo-600',
  maldives: 'from-cyan-200 via-teal-400 to-emerald-600',
  marrakech: 'from-amber-300 via-orange-500 to-red-600',
  istanbul: 'from-violet-400 via-fuchsia-500 to-rose-500',
  bali: 'from-lime-300 via-emerald-400 to-cyan-600',
  dubai: 'from-yellow-200 via-amber-400 to-sky-600',
  djerba: 'from-sky-200 via-teal-300 to-blue-600',
  hammamet: 'from-amber-200 via-orange-300 to-rose-400',
  giza: 'from-yellow-200 via-orange-400 to-red-500',
  rome: 'from-stone-300 via-amber-400 to-emerald-600',
  antalya: 'from-cyan-200 via-sky-400 to-indigo-500',
  tozeur: 'from-amber-200 via-yellow-400 to-orange-600',
  gabes: 'from-emerald-200 via-lime-300 to-teal-600',
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
  {
    slug: 'dubai-futuriste', title: 'Dubaï futuriste', city: 'Dubaï', country: 'Émirats Arabes Unis',
    summary: 'Burj Khalifa, désert en 4x4 et dîners panoramiques au sommet du monde.',
    description: "Quatre jours dans la ville du futur : ascension du Burj Khalifa, safari dunes avec dîner bedouin, Dubai Mall et fontaines, croisière marina. Hôtel 5 étoiles, transferts privés inclus.",
    priceEur: 1350, nights: 4, hotelName: 'Marina Sky Hotel', rating: 4.8,
    artKey: 'dubai', tags: ['luxe', 'famille', 'city break'], featured: true,
  },
  {
    slug: 'hotel-djerba-palace', title: 'Djerba Palace Resort & Spa', city: 'Djerba', country: 'Tunisie',
    summary: 'Hôtel 5* pieds dans l’eau — tout inclus, spa et plage privée.',
    description: "Le séjour hôtel par excellence à Djerba : chambre vue mer, formule tout inclus, grande piscine lagune, centre de spa traditionnel et plage privée aménagée. Navette aéroport et sports nautiques inclus.",
    priceEur: 320, nights: 4, hotelName: 'Djerba Palace Resort & Spa', rating: 4.7,
    artKey: 'djerba', tags: ['hôtel', 'plage', 'famille'], featured: true,
    photo: PHOTOS.djerba,
    images: [PHOTOS.djerba, U('1540541338287-41700207dee6'), U('1571003123894-1f0594d2b5d9'), U('1509233725247-49e657c54213')],
  },
  {
    slug: 'hotel-hammamet-garden', title: 'Hammamet Garden Beach', city: 'Hammamet', country: 'Tunisie',
    summary: 'Escapade bord de mer — petit-déjeuner, piscine et médina à pied.',
    description: "Trois nuits face à la mer dans un jardin d’orangers : chambres rénovées, petit-déjeuner généreux, deux piscines et accès direct à la plage. La médina et le port de plaisance se visitent à pied.",
    priceEur: 190, nights: 3, hotelName: 'Hammamet Garden Beach', rating: 4.5,
    artKey: 'hammamet', tags: ['hôtel', 'plage', 'court séjour'], featured: false,
    photo: PHOTOS.hammamet,
    images: [PHOTOS.hammamet, U('1519046904884-53103b34b206'), U('1582719508461-905c673771fd'), U('1506929562872-bb421503ef21')],
  },
  {
    slug: 'hotel-giza-pyramids-view', title: 'Giza Pyramid View Hotel', city: 'Le Caire', country: 'Égypte',
    summary: 'Réveil face aux pyramides — rooftop panoramique et excursions guidées.',
    description: "Un hôtel boutique dont chaque terrasse donne sur les pyramides de Gizeh : petit-déjeuner sur le rooftop, navette pour le Musée égyptien, soirée son et lumière au pied du Sphinx et guide francophone dédié.",
    priceEur: 420, nights: 4, hotelName: 'Giza Pyramid View Hotel', rating: 4.6,
    artKey: 'giza', tags: ['hôtel', 'culture', 'city break'], featured: false,
    photo: PHOTOS.giza,
    images: [PHOTOS.giza, U('1568322445389-f64ac2515020'), U('1611892440504-42a792e24d32'), U('1590490360182-c33d57733427')],
  },
  {
    slug: 'hotel-trastevere-rome', title: 'Trastevere Boutique Suites', city: 'Rome', country: 'Italie',
    summary: 'Boutique hôtel dans le quartier le plus vivant de Rome.',
    description: "Suites raffinées au cœur de Trastevere : petit-déjeuner italien à l’italienne, terrasse avec vue toits, colosse du Forum à quinze minutes à pied et carte des trattorias secrètes offerte à l’arrivée.",
    priceEur: 380, nights: 3, hotelName: 'Trastevere Boutique Suites', rating: 4.8,
    artKey: 'rome', tags: ['hôtel', 'gastronomie', 'city break'], featured: false,
    photo: PHOTOS.rome,
    images: [PHOTOS.rome, U('1531572753322-ad063cecc140'), U('1515542622106-78bda8ba0e5b'), U('1469854523086-cc02fe5d8800')],
  },
  {
    slug: 'hotel-lara-beach-antalya', title: 'Lara Beach Resort', city: 'Antalya', country: 'Turquie',
    summary: "All inclusive 5* sur la plage de Lara — toboggans, spa, buffets.",
    description: "Cinq nuits en formule ultra tout inclusive sur la plage de Lara : aquapark privé, six restaurants à la carte, spa hammam et kids-club encadré. La destination famille idéale dès avril.",
    priceEur: 450, nights: 5, hotelName: 'Lara Beach Resort', rating: 4.7,
    artKey: 'antalya', tags: ['hôtel', 'plage', 'famille'], featured: false,
    photo: PHOTOS.antalya,
    images: [PHOTOS.antalya, U('1551882547-ff40c63fe5fa'), U('1542314831-068cd1dbfeeb'), U('1507525428034-b723cf961d3e')],
  },
  {
    slug: 'hotel-oasis-palm-tozeur', title: 'Oasis Palm Lodge', city: 'Tozeur', country: 'Tunisie',
    summary: 'Lodge au cœur des palmeraies — porte du désert et couchers de soleil.',
    description: "Un lodge de charme au milieu de la palmeraie de Tozeur : patios ombragés, piscine d’oasis, dîner sous les étoiles et excursion optionnelle en 4x4 vers Chébika et les décors de Star Wars.",
    priceEur: 150, nights: 2, hotelName: 'Oasis Palm Lodge', rating: 4.6,
    artKey: 'tozeur', tags: ['hôtel', 'désert', 'nature'], featured: false,
    photo: PHOTOS.tozeur,
    images: [PHOTOS.tozeur, U('1473580044384-7ba9967e16a0'), U('1547234935-80c7145ec969'), U('1441974231531-c6227db76b6e')],
  },
  {
    slug: 'hotel-gabes-oasis', title: 'Gabès Oasis Hôtel', city: 'Gabès', country: 'Tunisie',
    summary: 'Au cœur de la seule oasis littorale du monde — ménzels, souk Jara et mer.',
    description: "Un hôtel paisible face à l'oasis de Gabès : chambres climatisées style ménzel, petit-déjeuner aux dattes du jardin, visite guidée du marché Jara et des souks, excursion vers les plages de la Skhira et le chott. L'étape authentique du sud tunisien.",
    priceEur: 120, nights: 2, hotelName: 'Gabès Oasis Hôtel', rating: 4.5,
    artKey: 'gabes', tags: ['hôtel', 'nature', 'court séjour'], featured: false,
    photo: PHOTOS.gabes,
    images: [PHOTOS.gabes, U('1470252649378-9c29740c9fa8'), U('1416879595882-3373a0480b5b')],
  },
]
