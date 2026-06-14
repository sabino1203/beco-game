import type { Server, Socket } from 'socket.io'
import { registerRoomHandlers } from './handlers/room.js'
import { registerHostHandlers } from './handlers/host.js'
import { registerNightHandlers } from './handlers/night.js'
import { registerDayHandlers } from './handlers/day.js'

export function registerAllHandlers(io: Server, socket: Socket) {
  registerRoomHandlers(io, socket)
  registerHostHandlers(io, socket)
  registerNightHandlers(io, socket)
  registerDayHandlers(io, socket)
}
