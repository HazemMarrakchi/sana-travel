import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('❌ MONGODB_URI missing')
  process.exit(1)
}

const offerSchema = new mongoose.Schema({}, { collection: 'offers', strict: false })
const Offer = mongoose.model('Offer', offerSchema)

const in90 = () => new Date(Date.now() + 90 * 24 * 3600 * 1000)
const in330 = () => new Date(Date.now() + 330 * 24 * 3600 * 1000)

const DUBAI = {
  slug: 'dubai-futuriste',
  title: 'Dubaï futuriste',
  city: 'Dubaï',
  country: 'Émirats Arabes Unis',
  summary: 'Burj Khalifa, désert en 4x4 et dîners panoramiques au sommet du monde.',
  description:
    "Quatre jours dans la ville du futur : ascension du Burj Khalifa au coucher du soleil, safari dune bashing dans le désert rouge avec dîner bedouin, Dubai Mall et fontaines, marina en dhow croisière et quartier futuristic Al Seef. Hôtel 5 étoiles près de la marina, transferts privés inclus.",
  priceEur: 1350,
  nights: 4,
  hotelName: 'Marina Sky Hotel',
  rating: 4.8,
  artKey: 'dubai',
  tags: ['luxe', 'famille', 'city break'],
  featured: true,
  availableFrom: in90(),
  availableTo: in330(),
  images: ['https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80'],
}

try {
  await mongoose.connect(uri)
  const res = await Offer.updateOne({ slug: DUBAI.slug }, { $set: DUBAI }, { upsert: true })
  const total = await Offer.countDocuments({})
  console.log(`✅ upsert ${DUBAI.slug} (matched=${res.matchedCount ?? res.nMatched}, upserted=${res.upsertedCount ?? res.nUpserted}) — total offers: ${total}`)
  await mongoose.disconnect()
} catch (err) {
  console.error('❌ failed:', err.message)
  process.exit(1)
}
