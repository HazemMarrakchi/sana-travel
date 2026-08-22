import mongoose from 'mongoose'
import * as bcrypt from 'bcryptjs'

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('❌ MONGODB_URI missing')
  process.exit(1)
}
const email = process.argv[2]?.toLowerCase()
const password = process.argv[3]
if (!email || !password) {
  console.error('Usage: node scripts/make-admin.mjs <email> <password>')
  process.exit(1)
}

try {
  await mongoose.connect(uri)
  const users = mongoose.connection.collection('users')
  const passwordHash = await bcrypt.hash(password, 10)
  const res = await users.updateOne(
    { email },
    {
      $set: { email, passwordHash, fullName: 'Administrateur SANA', role: 'admin', updatedAt: new Date() },
      $setOnInsert: { createdAt: new Date(), phone: '' },
    },
    { upsert: true },
  )
  console.log(res.upsertedId ? `✅ Admin créé : ${email}` : `✅ Mis à jour en admin : ${email}`)
  await mongoose.disconnect()
} catch (err) {
  console.error('❌', err.message)
  process.exit(1)
}
