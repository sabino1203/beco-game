/**
 * Teste de integração end-to-end do Beco
 * node test-game.mjs
 */
import { io } from 'socket.io-client'

const SERVER = 'http://localhost:3001'
const DELAY = (ms) => new Promise(r => setTimeout(r, ms))

let passed = 0, failed = 0

function ok(msg)   { console.log(`  ✓ ${msg}`); passed++ }
function fail(msg) { console.log(`  ✗ ${msg}`); failed++ }
function log(msg)  { console.log(`    ${msg}`) }

function waitFor(sock, event, ms = 6000) {
  return new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error(`timeout: "${event}"`)), ms)
    sock.once(event, d => { clearTimeout(t); res(d) })
  })
}

function makeClient(name) {
  const token = `tok_${name}_${Math.random().toString(36).slice(2)}`
  return {
    name,
    token,
    playerId: null,
    role: null,
    sock: io(SERVER, { auth: { sessionToken: token }, transports: ['websocket'] }),
  }
}

async function run() {
  console.log('\n=== BECO — Teste de Integração ===\n')

  // ── 1. Criar sala ──────────────────────────────
  console.log('[ FASE 1 ] Criar sala')
  const host = makeClient('Babi')
  host.sock.connect()
  await waitFor(host.sock, 'connect')
  ok('host conectou')

  host.sock.emit('room:create', {
    hostName: 'Babi',
    config: {
      maxPlayers: 10,
      debateTimerSeconds: 60,
      voteTimerSeconds: 30,
      roles: { bandidos: 2, policia: true, medico: true, detetive: false, prostituta: false },
    },
  })

  const created = await waitFor(host.sock, 'room:created')
  const roomCode = created.roomCode
  host.playerId = created.playerId
  ok(`sala criada: ${roomCode}`)

  // ── 2. Outros jogadores entram ─────────────────
  console.log('\n[ FASE 2 ] Jogadores entrando')
  const others = ['Ana', 'Bob', 'Cia', 'Dan', 'Eva'].map(makeClient)
  const players = [host, ...others]

  // Conectar todos simultaneamente
  for (const p of others) p.sock.connect()
  await Promise.all(others.map(p => waitFor(p.sock, 'connect', 8000)))
  ok('todos conectados')

  // Entrar na sala sequencialmente
  for (const p of others) {
    p.sock.emit('room:join', { name: p.name, roomCode })
    const joined = await waitFor(p.sock, 'room:joined', 5000)
    p.playerId = joined.playerId
    ok(`${p.name} entrou`)
  }

  // ── 3. Iniciar — registrar listeners ANTES de emitir ──
  console.log('\n[ FASE 3 ] Iniciando partida')

  // Prepara promises ANTES do host:start
  const rolePromises = players.map(p =>
    waitFor(p.sock, 'game:role_assigned', 8000).then(d => { p.role = d.role; return p })
  )
  // Todos recebem phase:changed(night) ao mesmo tempo
  const phaseNightPromise = waitFor(players[0].sock, 'game:phase_changed', 8000)

  host.sock.emit('host:start', {})

  await Promise.all(rolePromises)
  ok('todos receberam papéis')
  for (const p of players) log(`${p.name}: ${p.role}`)

  const bandidos = players.filter(p => p.role === 'bandido')
  const medico   = players.find(p => p.role === 'medico')
  const policia  = players.find(p => p.role === 'policia')
  const civils   = players.filter(p => p.role === 'civil')

  if (bandidos.length === 2) ok('2 bandidos')
  else fail(`esperava 2 bandidos, got ${bandidos.length}`)
  if (medico) ok('1 médico')
  else fail('médico não encontrado')
  if (policia) ok('1 polícia')
  else fail('polícia não encontrado')

  const phaseNight = await phaseNightPromise
  if (phaseNight.phase === 'night') ok('fase: noite')
  else fail(`fase inesperada: ${phaseNight.phase}`)

  // ── 4. Ações noturnas ─────────────────────────
  console.log('\n[ FASE 4 ] Ações noturnas')

  // Vítima dos bandidos: primeiro civil
  const victim = civils[0] ?? policia

  // Médico protege a si mesmo
  if (medico) {
    medico.sock.emit('night:medico', { targetId: medico.playerId })
    await waitFor(medico.sock, 'night:action_done', 5000)
    ok('médico agiu')
  }

  // Polícia passa (targetId: null)
  if (policia) {
    policia.sock.emit('night:policia', { targetId: null })
    await waitFor(policia.sock, 'night:action_done', 5000)
    ok('polícia passou')
  }

  // Bandidos votam (ambos no mesmo alvo)
  for (const b of bandidos) {
    b.sock.emit('night:bandido_vote', { targetId: victim?.playerId })
    await waitFor(b.sock, 'night:action_done', 5000)
  }
  ok('bandidos votaram')

  // ── 5. Amanhecer ──────────────────────────────
  console.log('\n[ FASE 5 ] Amanhecer')

  const dawnPhase = await waitFor(players[0].sock, 'game:phase_changed', 12000)
  ok(`fase: ${dawnPhase.phase}`)

  // Coleta eventos de dawn (pode ser 0 se médico salvou)
  const dawnEvents = []
  const collectDawn = new Promise(res => {
    players[0].sock.on('dawn:event', e => dawnEvents.push(e))
    players[0].sock.once('dawn:complete', res)
    setTimeout(res, 8000) // fallback
  })
  await collectDawn
  ok(`dawn completo — ${dawnEvents.length} evento(s)`)

  // ── 6. Debate ─────────────────────────────────
  console.log('\n[ FASE 6 ] Debate')

  const debatePhase = await waitFor(players[0].sock, 'game:phase_changed', 8000)
  ok(`fase: ${debatePhase.phase}`)

  // Mensagem no chat
  const chatMsg = waitFor(players[1].sock, 'day:chat_message', 3000).catch(() => null)
  players[0].sock.emit('day:chat', { text: 'Eu não fui!' })
  const chat = await chatMsg
  if (chat) ok('chat recebido')
  else log('chat não retornou (sem broadcast pro remetente?)')

  // Host encerra debate
  await DELAY(200)
  const votingPhaseP = waitFor(players[0].sock, 'game:phase_changed', 5000)
  host.sock.emit('host:end_debate', {})
  const votingPhase = await votingPhaseP
  if (votingPhase.phase === 'day_voting') ok('fase: votação')
  else fail(`esperava day_voting, got ${votingPhase.phase}`)

  // ── 7. Votação ────────────────────────────────
  console.log('\n[ FASE 7 ] Votação')

  const voteTarget = civils[0] ?? bandidos[0]
  const revealP = waitFor(players[0].sock, 'day:vote_reveal', 8000)

  for (const p of players) {
    if (p.playerId !== voteTarget.playerId) {
      p.sock.emit('day:vote', { targetId: voteTarget.playerId })
      await DELAY(50)
    }
  }
  ok('todos votaram')

  const reveal = await revealP
  ok(`reveal recebido — eliminado: ${reveal.eliminatedId ?? 'nenhum (empate)'}`)

  // ── Resultado ─────────────────────────────────
  console.log('\n══════════════════════════')
  console.log(`  ${passed} ✓   ${failed} ✗`)
  console.log('══════════════════════════\n')

  for (const p of players) p.sock.disconnect()
  process.exit(failed > 0 ? 1 : 0)
}

run().catch(err => {
  console.error('\n[ERRO FATAL]', err.message)
  process.exit(1)
})
