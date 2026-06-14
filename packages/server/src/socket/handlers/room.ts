import type { Server, Socket } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import type { Room, Player } from '@beco/shared'
import { GAME_CONSTANTS } from '@beco/shared'
import { getRoom, saveRoom, roomExists } from '../../redis/room.js'
import { buildPlayerView, toPublicPlayer } from '../../engine/views.js'
import { generateRoomCode } from '../../utils/roomCode.js'
import type { RoomCreatePayload, RoomJoinPayload, RoomReconnectPayload } from '@beco/shared'

export function registerRoomHandlers(io: Server, socket: Socket) {
  socket.on('room:create', async (payload: RoomCreatePayload) => {
    try {
      let code = generateRoomCode()
      while (await roomExists(code)) code = generateRoomCode()

      const sessionToken = uuidv4()
      const playerId = uuidv4()

      const hostPlayer: Player = {
        id: playerId,
        socketId: socket.id,
        name: payload.hostName.trim().slice(0, 20),
        role: null,
        team: null,
        isAlive: true,
        isHost: true,
        isSpectator: false,
        lastProtectedAt: null,
        connectedAt: Date.now(),
        sessionToken,
      }

      const room: Room = {
        code,
        hostSocketId: socket.id,
        status: 'lobby',
        config: payload.config,
        players: [hostPlayer],
        gameState: null,
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        kickedPlayerIds: [],
      }

      await saveRoom(room)
      socket.join(code)
      socket.data.playerId = playerId
      socket.data.roomCode = code
      socket.data.sessionToken = sessionToken

      socket.emit('room:created', { roomCode: code, sessionToken, playerId })
      socket.emit('room:updated', buildPlayerView(room, hostPlayer))
    } catch (err) {
      socket.emit('error', { code: 'CREATE_FAILED', message: 'Não foi possível criar a sala.' })
    }
  })

  socket.on('room:join', async (payload: RoomJoinPayload) => {
    try {
      const room = await getRoom(payload.roomCode)
      if (!room) {
        socket.emit('error', { code: 'ROOM_NOT_FOUND', message: 'Sala não encontrada.' })
        return
      }
      if (room.status !== 'lobby') {
        socket.emit('error', { code: 'ROOM_IN_GAME', message: 'Partida já iniciada.' })
        return
      }
      if (room.players.length >= GAME_CONSTANTS.MAX_PLAYERS) {
        socket.emit('error', { code: 'ROOM_FULL', message: 'Sala cheia.' })
        return
      }

      const sessionToken = uuidv4()
      const playerId = uuidv4()

      if (room.kickedPlayerIds.includes(playerId)) {
        socket.emit('error', { code: 'KICKED', message: 'Você foi removido desta sala.' })
        return
      }

      const player: Player = {
        id: playerId,
        socketId: socket.id,
        name: payload.name.trim().slice(0, 20),
        role: null,
        team: null,
        isAlive: true,
        isHost: false,
        isSpectator: false,
        lastProtectedAt: null,
        connectedAt: Date.now(),
        sessionToken,
      }

      room.players.push(player)
      room.lastActivityAt = Date.now()
      await saveRoom(room)

      socket.join(payload.roomCode)
      socket.data.playerId = playerId
      socket.data.roomCode = payload.roomCode
      socket.data.sessionToken = sessionToken

      socket.emit('room:joined', { sessionToken, playerId, view: buildPlayerView(room, player) })

      socket.to(payload.roomCode).emit('room:player_joined', toPublicPlayer(player))
    } catch (err) {
      socket.emit('error', { code: 'JOIN_FAILED', message: 'Não foi possível entrar na sala.' })
    }
  })

  socket.on('room:reconnect', async (payload: RoomReconnectPayload) => {
    try {
      const room = await getRoom(payload.roomCode)
      if (!room) {
        socket.emit('error', { code: 'RECONNECT_FAILED', message: 'Sala não encontrada ou expirada.' })
        return
      }

      const player = room.players.find((p) => p.sessionToken === payload.sessionToken)
      if (!player) {
        socket.emit('error', { code: 'RECONNECT_FAILED', message: 'Sessão inválida.' })
        return
      }

      player.socketId = socket.id
      room.lastActivityAt = Date.now()
      await saveRoom(room)

      socket.join(payload.roomCode)
      socket.data.playerId = player.id
      socket.data.roomCode = payload.roomCode
      socket.data.sessionToken = payload.sessionToken

      socket.emit('room:reconnected', { view: buildPlayerView(room, player) })
    } catch (err) {
      socket.emit('error', { code: 'RECONNECT_FAILED', message: 'Reconexão falhou.' })
    }
  })

  socket.on('disconnecting', async () => {
    const roomCode = socket.data.roomCode
    if (!roomCode) return

    const room = await getRoom(roomCode)
    if (!room) return

    // If host disconnects, end the game for everyone
    if (room.hostSocketId === socket.id) {
      io.to(roomCode).emit('room:host_left')
      return
    }
  })
}
