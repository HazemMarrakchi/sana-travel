const API = 'http://localhost:3001/api'
const email = `client${Date.now() % 100000}@test.tn`
let pass = 0
let fail = 0
const check = (name, cond, extra = '') => {
  console.log(`${cond ? '✅' : '❌'} ${name}${extra ? ' — ' + extra : ''}`)
  cond ? pass++ : fail++
}

async function main() {
  // 1. register
  const reg = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'secret123', fullName: 'Client Auto' }),
  })
  const regData = await reg.json()
  check('register 201/200', reg.status === 201 || reg.status === 200, `status=${reg.status}`)
  check('token présent', !!regData.accessToken)
  check('rôle client', regData.user?.role === 'client')
  const tok = regData.accessToken ?? ''

  // 2. duplicate register rejected
  const dup = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'secret123', fullName: 'X' }),
  })
  check('doublon rejeté', dup.status === 401 || dup.status === 400 || dup.status === 409, `status=${dup.status}`)

  // 3. login
  const login = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'secret123' }),
  })
  const loginData = await login.json()
  check('login 200', login.status === 200, `status=${login.status}`)
  check('login token', !!loginData.accessToken)

  // 4. wrong password
  const bad = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'wrong999' }),
  })
  check('mauvais mdp rejeté', bad.status === 401, `status=${bad.status}`)

  // 5. /me
  const me = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${tok}` } })
  const meData = await me.json()
  check('me 200', me.status === 200, `status=${me.status}`)
  check('me sans passwordHash', !('passwordHash' in meData))
  check('me email correct', meData.email === email)

  // 6. validation pipe active (bad payload → 400)
  const invalid = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'pasunemail', password: '1', fullName: '' }),
  })
  check('validation DTO active', invalid.status === 400, `status=${invalid.status}`)

  // 7. bookings guard
  const noTok = await fetch(`${API}/bookings`)
  check('bookings sans token = 401', noTok.status === 401, `status=${noTok.status}`)

  // 8. mine (empty list)
  const mine = await fetch(`${API}/bookings/mine`, { headers: { Authorization: `Bearer ${tok}` } })
  const mineData = await mine.json()
  check('mine 200', mine.status === 200, `status=${mine.status}`)
  check('mine tableau', Array.isArray(mineData))

  console.log(`\nRESULT: ${pass} passed, ${fail} failed`)
  process.exit(fail > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error('SCRIPT_FAIL', e.message)
  process.exit(1)
})
