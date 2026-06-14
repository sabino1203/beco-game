/**
 * In-memory store that mimics the Redis room interface.
 * Used when Redis is unavailable (local dev without Docker).
 */
import type { Room } from '@beco/shared'
import type { Role } from '@beco/shared'

const store = new Map<string, { room: unknown; expiresAt: number }>()

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

function restoreSets(room: Room): Room {
  if (room.gameState?.nightActions?.actedRoles) {
    room.gameState.nightActions.actedRoles = new Set(
      room.gameState.nightActions.actedRoles as unknown as Role[]
    )
  }
  return room
}

export const memoryStore = {
  async get(code: string): Promise<Room | null> {
    const entry = store.get(`room:${code}`)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      store.delete(`room:${code}`)
      return null
    }
    return restoreSets(JSON.parse(JSON.stringify(entry.room)) as Room)
  },

  async set(room: Room, ttlSeconds: number): Promise<void> {
    store.set(`room:${room.code}`, {
      room: toSerializable(room),
      expiresAt: Date.now() + ttlSeconds * 1000,
    })
  },

  async del(code: string): Promise<void> {
    store.delete(`room:${code}`)
  },

  async exists(code: string): Promise<boolean> {
    const entry = store.get(`room:${code}`)
    if (!entry) return false
    if (Date.now() > entry.expiresAt) {
      store.delete(`room:${code}`)
      return false
    }
    return true
  },
}
