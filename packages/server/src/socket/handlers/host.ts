import type { Server, Socket } from 'socket.io'
import { GAME_CONSTANTS } from '@beco/shared'
import { getRoom, saveRoom } from '../../redis/room.js'
import { distributeRoles } from '../../engine/actions/distributeRoles.js'
import { checkVictory } from '../../engine/actions/checkVictory.js'
import { buildPlayerView, toPublicPlayer } from '../../engine/views.js'
import type { HostKickPayload } from '@beco/shared'

export function registerHostHandlers(io: Server, socket: Socket) {
  socket.on('host:start', async () => {
    const roomCode = socket.data.roomCode
    const room = await getRoom(roomCode)
    if (!room || room.hostSocketId !== socket.id) return
    if (room.players.length < GAME_CONSTANTS.MIN_PLAYERS) {
      socket.emit('error', { code: 'NOT_ENOUGH_PLAYERS', message: `Mínimo ${GAME_CONSTANTS.MIN_PLAYERS} jogadores.` })
      return
    }
    if (room.status !== 'lobby') return

    room.status = 'playing'
    room.players = distributeRoles(room.players, room.config.roles)
    room.gameState = {
      round: 1,
      phase: 'night',
      nightActions: {
        prostitutaTarget: null,
        medicoTarget: null,
        detetivelTarget: null,
        bandidosVotes: {},
        policiaTarget: null,
        actedRoles: new Set(),
      },
      dayEvents: [],
      votes: {},
      chat: [],
      banditsChat: [],
      winner: null,
      phaseStartedAt: Date.now(),
    }

    await saveRoom(room)

    // Emit game:started to all, then role to each player individually
    io.to(roomCode).emit('game:started')

    for (const player of room.players) {
      io.to(player.socketId).emit('game:role_assigned', { role: player.role })
    }

    // Emit phase changed
    io.to(roomCode).emit('game:phase_changed', {
      phase: 'night',
      timerSeconds: GAME_CONSTANTS.DEFAULT_NIGHT_TIMEOUT_SECONDS,
      timerStartedAt: Date.now(),
    })

    // Notify each role it's their turn (prostituta goes first)
    emitNightTurns(io, room)
  })

  socket.on('host:kick', async (payload: HostKickPayload) => {
    const roomCode = socket.data.roomCode
    const room = await getRoom(roomCode)
    if (!room || room.hostSocketId !== socket.id) return
    if (payload.playerId === socket.data.playerId) return // RN-HOST-02

    const playerIdx = room.players.findIndex((p) => p.id === payload.playerId)
    if (playerIdx === -1) return

    const kicked = room.players[playerIdx]
    room.kickedPlayerIds.push(kicked.id)

    if (room.status === 'lobby') {
      // RN-HOST-03: silent removal in lobby
      room.players.splice(playerIdx, 1)
      await saveRoom(room)
      io.to(kicked.socketId).emit('room:kicked')
      io.to(roomCode).emit('room:player_kicked', kicked.id)
    } else {
      // RN-HOST-04: treated as eliminated during game
      kicked.isAlive = false
      kicked.isSpectator = true
      await saveRoom(room)

      io.to(kicked.socketId).emit('room:kicked')
      io.to(roomCode).emit('day:eliminated', {
        player: toPublicPlayer(kicked),
        role: kicked.role,
        reason: 'host_kick',
      })

      // RN-HOST-05: check victory immediately
      const winner = checkVictory(room.players)
      if (winner) {
        await endGame(io, room, winner)
      }
    }
  })

  socket.on('host:end_debate', async () => {
    const roomCode = socket.data.roomCode
    const room = await getRoom(roomCode)
    if (!room || room.hostSocketId !== socket.id) return
    if (room.gameState?.phase !== 'day_debate') return

    room.gameState.phase = 'day_voting'
    room.gameState.votes = {}
    room.gameState.phaseStartedAt = Date.now()
    await saveRoom(room)

    io.to(roomCode).emit('game:phase_changed', {
      phase: 'day_voting',
      timerSeconds: room.config.voteTimerSeconds,
      timerStartedAt: Date.now(),
    })
  })
}

function emitNightTurns(io: Server, room: ReturnType<typeof getRoom> extends Promise<infer T> ? NonNullable<T> : never) {
  const alivePlayers = room.players.filter((p) => p.isAlive)
  const publicPlayers = alivePlayers.map((p) => ({
    id: p.id,
    name: p.name,
    isAlive: p.isAlive,
    isHost: p.isHost,
    isSpectator: p.isSpectator,
  }))

  for (const player of alivePlayers) {
    if (!player.role || player.role === 'civil') continue

    const availableTargets = publicPlayers.filter((t) => t.id !== player.id)

    io.to(player.socketId).emit('night:your_turn', {
      availableTargets,
      timeoutSeconds: GAME_CONSTANTS.DEFAULT_NIGHT_TIMEOUT_SECONDS,
    })
  }
}

async function endGame(
  io: Server,
  room: NonNullable<Awaited<ReturnType<typeof getRoom>>>,
  winner: 'cidadaos' | 'bandidos'
) {
  if (!room.gameState) return
  room.gameState.winner = winner
  room.gameState.phase = 'game_over'
  room.status = 'game_over'
  await saveRoom(room)

  io.to(room.code).emit('game:over', {
    winner,
    allRoles: room.players.map((p) => ({ id: p.id, name: p.name, role: p.role })),
    stats: { rounds: room.gameState.round, duration: Date.now() - room.createdAt },
  })
}
