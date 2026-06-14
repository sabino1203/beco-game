import type { Server, Socket } from 'socket.io'
import { GAME_CONSTANTS } from '@beco/shared'
import type { Role } from '@beco/shared'
import { getRoom, saveRoom } from '../../redis/room.js'
import { processNight } from '../../engine/actions/processNight.js'
import { checkVictory } from '../../engine/actions/checkVictory.js'
import type { NightTargetPayload, NightPoliciaPayload, NightBandidoVotePayload } from '@beco/shared'

async function maybeAdvanceNight(io: Server, roomCode: string) {
  const room = await getRoom(roomCode)
  if (!room?.gameState) return

  const alivePlayers = room.players.filter((p) => p.isAlive)
  const rolesPresent = new Set(alivePlayers.map((p) => p.role).filter(Boolean)) as Set<Role>

  // All roles that need to act have acted
  const needToAct: Role[] = ['prostituta', 'medico', 'detetive', 'bandido', 'policia'].filter(
    (r) => rolesPresent.has(r as Role)
  ) as Role[]

  const allActed = needToAct.every((r) => room.gameState!.nightActions.actedRoles.has(r))
  if (!allActed) return

  // Process night
  room.gameState.phase = 'processing_night'
  const aliveBefore = new Set(room.players.filter((p) => p.isAlive).map((p) => p.id))
  const { events, updatedPlayers } = processNight(room)
  room.players = updatedPlayers
  const newlyDead = updatedPlayers.filter((p) => !p.isAlive && aliveBefore.has(p.id))
  room.gameState.dayEvents = events
  room.gameState.phase = 'dawn'
  room.gameState.phaseStartedAt = Date.now()
  await saveRoom(room)

  // Check victory immediately (RN-V03/V04)
  const winner = checkVictory(room.players)
  if (winner) {
    room.gameState.winner = winner
    room.gameState.phase = 'game_over'
    room.status = 'game_over'
    await saveRoom(room)
    io.to(roomCode).emit('game:over', {
      winner,
      allRoles: room.players.map((p) => ({ id: p.id, name: p.name, role: p.role })),
      stats: { rounds: room.gameState.round, duration: Date.now() - room.createdAt },
    })
    return
  }

  io.to(roomCode).emit('game:phase_changed', { phase: 'dawn', timerSeconds: 0, timerStartedAt: Date.now() })

  // Emit dawn events sequentially
  for (let i = 0; i < events.length; i++) {
    await delay(GAME_CONSTANTS.DAWN_EVENT_DELAY_MS)
    io.to(roomCode).emit('dawn:event', { event: events[i], index: i, total: events.length })
  }

  await delay(GAME_CONSTANTS.DAWN_EVENT_DELAY_MS)
  io.to(roomCode).emit('dawn:complete')

  // Notify clients of night deaths so they update the player list
  for (const dead of newlyDead) {
    io.to(roomCode).emit('day:eliminated', { player: { id: dead.id, name: dead.name, isAlive: false, isHost: dead.isHost, isSpectator: true }, role: dead.role, reason: 'night' })
  }

  // Move to day_debate
  room.gameState.phase = 'day_debate'
  room.gameState.phaseStartedAt = Date.now()
  room.gameState.chat = []
  room.gameState.nightActions = {
    prostitutaTarget: null,
    medicoTarget: null,
    detetivelTarget: null,
    bandidosVotes: {},
    policiaTarget: null,
    actedRoles: new Set(),
  }
  await saveRoom(room)

  io.to(roomCode).emit('game:phase_changed', {
    phase: 'day_debate',
    timerSeconds: room.config.debateTimerSeconds,
    timerStartedAt: Date.now(),
  })
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export function registerNightHandlers(io: Server, socket: Socket) {
  socket.on('night:prostituta', async (payload: NightTargetPayload) => {
    const room = await getRoom(socket.data.roomCode)
    if (!room?.gameState) return
    const player = room.players.find((p) => p.id === socket.data.playerId)
    if (!player || player.role !== 'prostituta' || !player.isAlive) return
    if (payload.targetId === player.id) return // RN-19: can't block self

    room.gameState.nightActions.prostitutaTarget = payload.targetId
    room.gameState.nightActions.actedRoles.add('prostituta')
    await saveRoom(room)
    socket.emit('night:action_done')
    await maybeAdvanceNight(io, socket.data.roomCode)
  })

  socket.on('night:medico', async (payload: NightTargetPayload) => {
    const room = await getRoom(socket.data.roomCode)
    if (!room?.gameState) return
    const player = room.players.find((p) => p.id === socket.data.playerId)
    if (!player || player.role !== 'medico' || !player.isAlive) return

    // RN-12: can't protect same person twice in a row
    const target = room.players.find((p) => p.id === payload.targetId)
    if (target?.lastProtectedAt === room.gameState.round - 1) {
      socket.emit('error', { code: 'CANT_REPEAT_PROTECT', message: 'Não pode proteger a mesma pessoa em noites seguidas.' })
      return
    }

    room.gameState.nightActions.medicoTarget = payload.targetId
    room.gameState.nightActions.actedRoles.add('medico')
    await saveRoom(room)
    socket.emit('night:action_done')
    await maybeAdvanceNight(io, socket.data.roomCode)
  })

  socket.on('night:detetive', async (payload: NightTargetPayload) => {
    const room = await getRoom(socket.data.roomCode)
    if (!room?.gameState) return
    const player = room.players.find((p) => p.id === socket.data.playerId)
    if (!player || player.role !== 'detetive' || !player.isAlive) return

    const target = room.players.find((p) => p.id === payload.targetId)
    if (!target) return

    room.gameState.nightActions.detetivelTarget = payload.targetId
    room.gameState.nightActions.actedRoles.add('detetive')
    await saveRoom(room)

    // RN-18: emit result only to detective — "Bandido" or "Cidadão"
    socket.emit('detective:result', {
      targetName: target.name,
      isBandido: target.team === 'bandidos',
    })
    socket.emit('night:action_done')
    await maybeAdvanceNight(io, socket.data.roomCode)
  })

  socket.on('night:bandido_vote', async (payload: NightBandidoVotePayload) => {
    const room = await getRoom(socket.data.roomCode)
    if (!room?.gameState) return
    const player = room.players.find((p) => p.id === socket.data.playerId)
    if (!player || player.role !== 'bandido' || !player.isAlive) return

    room.gameState.nightActions.bandidosVotes[player.id] = payload.targetId

    // All bandidos voted?
    const aliveBandidos = room.players.filter((p) => p.role === 'bandido' && p.isAlive)
    const allVoted = aliveBandidos.every((b) => room.gameState!.nightActions.bandidosVotes[b.id])

    if (allVoted) {
      room.gameState.nightActions.actedRoles.add('bandido')
    }

    await saveRoom(room)
    socket.emit('night:action_done')

    // Notify other bandidos of the vote (optional chat is handled separately)
    if (allVoted) await maybeAdvanceNight(io, socket.data.roomCode)
  })

  socket.on('night:policia', async (payload: NightPoliciaPayload) => {
    const room = await getRoom(socket.data.roomCode)
    if (!room?.gameState) return
    const player = room.players.find((p) => p.id === socket.data.playerId)
    if (!player || player.role !== 'policia' || !player.isAlive) return

    // null = pass (RN-17)
    room.gameState.nightActions.policiaTarget = payload.targetId
    room.gameState.nightActions.actedRoles.add('policia')
    await saveRoom(room)
    socket.emit('night:action_done')
    await maybeAdvanceNight(io, socket.data.roomCode)
  })
}
