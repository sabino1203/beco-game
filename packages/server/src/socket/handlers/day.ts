import type { Server, Socket } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import { getRoom, saveRoom } from '../../redis/room.js'
import { processVotes } from '../../engine/actions/processVotes.js'
import { checkVictory } from '../../engine/actions/checkVictory.js'
import { toPublicPlayer } from '../../engine/views.js'
import type { DayChatPayload, DayVotePayload } from '@beco/shared'

export function registerDayHandlers(io: Server, socket: Socket) {
  socket.on('day:chat', async (payload: DayChatPayload) => {
    const room = await getRoom(socket.data.roomCode)
    if (!room?.gameState) return
    if (room.gameState.phase !== 'day_debate') return

    const player = room.players.find((p) => p.id === socket.data.playerId)
    if (!player) return

    // RN-DIA-05: dead players can't send messages
    if (!player.isAlive) return

    const message = {
      id: uuidv4(),
      playerId: player.id,
      playerName: player.name,
      text: payload.text.trim().slice(0, 300),
      timestamp: Date.now(),
      isDead: false,
    }

    room.gameState.chat.push(message)
    room.lastActivityAt = Date.now()
    await saveRoom(room)

    io.to(room.code).emit('day:chat_message', { message })
  })

  socket.on('night:bandido_chat', async (payload: DayChatPayload) => {
    const room = await getRoom(socket.data.roomCode)
    if (!room?.gameState) return
    if (room.gameState.phase !== 'night') return

    const player = room.players.find((p) => p.id === socket.data.playerId)
    if (!player || player.role !== 'bandido' || !player.isAlive) return

    const message = {
      id: uuidv4(),
      playerId: player.id,
      playerName: player.name,
      text: payload.text.trim().slice(0, 300),
      timestamp: Date.now(),
    }

    room.gameState.banditsChat.push(message)
    await saveRoom(room)

    // Emit only to bandidos (RN-15)
    const bandidos = room.players.filter((p) => p.role === 'bandido' && p.isAlive)
    for (const b of bandidos) {
      io.to(b.socketId).emit('night:bandits_chat', { message })
    }
  })

  socket.on('day:vote', async (payload: DayVotePayload) => {
    const room = await getRoom(socket.data.roomCode)
    if (!room?.gameState) return
    if (room.gameState.phase !== 'day_voting') return

    const player = room.players.find((p) => p.id === socket.data.playerId)
    if (!player || !player.isAlive) return

    // RN-VOT-03: vote can be changed until timer ends
    room.gameState.votes[player.id] = payload.targetId
    room.lastActivityAt = Date.now()

    const alivePlayers = room.players.filter((p) => p.isAlive)
    const voteCount = Object.keys(room.gameState.votes).length

    await saveRoom(room)

    // RN-VOT-05: broadcast count but not targets
    io.to(room.code).emit('day:vote_count', { count: voteCount, total: alivePlayers.length })

    // If everyone voted, reveal immediately
    if (voteCount >= alivePlayers.length) {
      await revealVotes(io, room.code)
    }
  })
}

async function revealVotes(io: Server, roomCode: string) {
  const room = await getRoom(roomCode)
  if (!room?.gameState) return
  if (room.gameState.phase !== 'day_voting') return

  const { votes, eliminatedId, isTie } = processVotes(room.gameState.votes, room.players)

  let eliminatedRole = null
  let eliminatedName = null

  if (eliminatedId) {
    const eliminated = room.players.find((p) => p.id === eliminatedId)
    if (eliminated) {
      eliminatedRole = eliminated.role
      eliminatedName = eliminated.name
      eliminated.isAlive = false
      eliminated.isSpectator = true
    }
  }

  room.gameState.phase = 'vote_reveal'
  room.gameState.round += 1
  await saveRoom(room)

  // RN-VOT-06: reveal all votes simultaneously
  io.to(roomCode).emit('day:vote_reveal', {
    votes,
    eliminatedId,
    eliminatedName,
    eliminatedRole,
    isTie,
  })

  if (eliminatedId) {
    const eliminated = room.players.find((p) => p.id === eliminatedId)
    if (eliminated) {
      io.to(roomCode).emit('day:eliminated', {
        player: toPublicPlayer(eliminated),
        role: eliminated.role,
        reason: 'vote',
      })
    }
  }

  // RN-V03: check victory immediately
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

  // Next night
  await new Promise((r) => setTimeout(r, 4000))
  room.gameState.phase = 'night'
  room.gameState.votes = {}
  room.gameState.nightActions = {
    prostitutaTarget: null,
    medicoTarget: null,
    detetivelTarget: null,
    bandidosVotes: {},
    policiaTarget: null,
    actedRoles: new Set(),
  }
  room.gameState.phaseStartedAt = Date.now()
  await saveRoom(room)

  io.to(roomCode).emit('game:phase_changed', {
    phase: 'night',
    timerSeconds: 90,
    timerStartedAt: Date.now(),
  })
}
