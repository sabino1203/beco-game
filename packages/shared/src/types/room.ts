import type { Player, GameState, GamePhase, PublicPlayer } from './game.js'

export interface RoleConfig {
  bandidos: number
  policia: boolean
  medico: boolean
  detetive: boolean
  prostituta: boolean
}

export interface RoomConfig {
  maxPlayers: number
  debateTimerSeconds: number
  voteTimerSeconds: number
  roles: RoleConfig
}

export type RoomStatus =
  | 'lobby'
  | 'starting'
  | 'playing'
  | 'game_over'

export interface Room {
  code: string
  hostSocketId: string
  status: RoomStatus
  config: RoomConfig
  players: Player[]
  gameState: GameState | null
  createdAt: number
  lastActivityAt: number
  kickedPlayerIds: string[]
}

export interface PlayerRoomView {
  roomCode: string
  status: RoomStatus
  players: PublicPlayer[]
  myPlayer: Player
  config: RoomConfig
  round: number
  phase: GamePhase
}
