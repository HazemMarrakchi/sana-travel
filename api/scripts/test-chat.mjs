const API = 'http://localhost:3001/api'
let pass = 0
let fail = 0
const check = (name, cond, extra = '') => {
  console.log(`${cond ? '✅' : '❌'} ${name}${extra ? ' — ' + extra : ''}`)
  cond ? pass++ : fail++
}
const ask = (message) =>
  fetch(`${API}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  }).then((r) => r.json())

async function main() {
  const hello = await ask('Bonjour')
  check('salutation', /concierge|Sana/i.test(hello.reply) && hello.escalate === false, hello.reply.slice(0, 60))

  const dest = await ask('Vous avez quelque chose à Cappadoce ?')
  check('destination connue → offre', /Cappadoce/i.test(dest.reply), dest.reply.slice(0, 80))

  const price = await ask('Quels sont vos prix ?')
  check('question prix → DT', /\d+ DT/.test(price.reply), price.reply.split('\n')[0].slice(0, 70))

  const unknown = await ask('Est-ce que vous vendez des frigidaires ?')
  check('question hors-sujet → escalade', unknown.escalate === true, unknown.reply.slice(0, 60))

  const empty = await ask('')
  check('message vide géré', typeof empty.reply === 'string' && empty.reply.length > 0)

  console.log(`\nRESULT: ${pass} passed, ${fail} failed`)
  process.exit(fail > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error('SCRIPT_FAIL', e.message)
  process.exit(1)
})
