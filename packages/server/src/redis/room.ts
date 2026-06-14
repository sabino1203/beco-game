import type { Room } from '@beco/shared'
import { GAME_CONSTANTS } from '@beco/shared'
import { memoryStore } from './memoryStore.js'

// Whether to use memory fallback (set at startup in index.ts)
let useMemory = false
export function setUseMemoryStore(val: boolean) {
  useMemory = val
}

// Lazy import redis only when needed
async function getRedis() {
  const { redis } = await import('./client.js')
  return redis
}

function restoreSets(room: Room): Room {
  if (room.gameState?.nightActions?.actedRoles) {
    room.gameState.nightActions.actedRoles = new Set(
      room.gameState.nightActions.actedRoles as unknown as import('@beco/shared').Role[]
    )
  }
  return room
}

function toSerializable(room: Room) {
  return {
    ...room,
    gameState: room.gameState
      ? {
          ...room.gameState,
          nightActions: {
            ...room.gameState.nightActions,
            actedRoles: [...room.gameState.nightActions.actedRoles],
          },
        }
      : null,
  }
}

export async function getRoom(code: string): Promise<Room | null> {
  if (useMemory) return memoryStore.get(code)
  const redis = await getRedis()
  const data = await redis.get(`room:${code}`)
  if (!data) return null
  return restoreSets(JSON.parse(data) as Room)
}

export async function saveRoom(room: Room): Promise<void> {
  if (useMemory) {
    await memoryStore.set(room, GAME_CONSTANTS.ROOM_TTL_SECONDS)
    return
  }
  const redis = await getRedis()
  await redis.setex(`room:${room.code}`, GAME_CONSTANTS.ROOM_TTL_SECONDS, JSON.stringify(toSerializable(room)))
}

export async function deleteRoom(code: string): Promise<void> {
  if (useMemory) {
    await memoryStore.del(code)
    return
  }
  const redis = await getRedis()
  await redis.del(`room:${code}`)
}

export async function roomExists(code: string): Promise<boolean> {
  if (useMemory) return memoryStore.exists(code)
  const redis = await getRedis()
  const count = await redis.exists(`room:${code}`)
  return count > 0
}
