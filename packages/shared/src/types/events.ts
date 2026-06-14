import type { Role, PublicPlayer, ChatMessage, DawnEvent, VoteRevealEntry, Team } from './game.js'
import type { RoomConfig, PlayerRoomView } from './room.js'

// ── Client → Server ───────────────────────────────────────────────────────────

export interface RoomCreatePayload {
  hostName: string
  config: RoomConfig
}

export interface RoomJoinPayload {
  name: string
  roomCode: string
}

export interface RoomReconnectPayload {
  sessionToken: string
  roomCode: string
}

export interface HostKickPayload {
  playerId: string
}

export interface NightTargetPayload {
  targetId: string
}

export interface NightBandidoVotePayload {
  targetId: string
}

export interface NightPoliciaPayload {
  targetId: string | null
}

export interface DayChatPayload {
  text: string
}

export interface DayVotePayload {
  targetId: string
}

// ── Server → Client ───────────────────────────────────────────────────────────

export interface RoomCreatedPayload {
  roomCode: string
  sessionToken: string
  playerId: string
}

export interface JoinedPayload {
  sessionToken: string
  playerId: string
  view: PlayerRoomView
}

export interface ReconnectedPayload {
  view: PlayerRoomView
}

export interface RoleAssignedPayload {
  role: Role
}

export interface PhaseChangedPayload {
  phase: string
  timerSeconds: number
  timerStartedAt: number
}

export interface NightYourTurnPayload {
  availableTargets: PublicPlayer[]
  timeoutSeconds: number
}

export interface NightWaitingPayload {
  remaining: number
  total: number
}

export interface BanditsChatPayload {
  message: ChatMessage
}

export interface DetectiveResultPayload {
  targetName: string
  isBandido: boolean
}

export interface DawnEventPayload {
  event: DawnEvent
  index: number
  total: number
}

export interface DayChatMessagePayload {
  message: ChatMessage
}

export interface DayVoteCountPayload {
  count: number
  total: number
}

export interface DayVoteRevealPayload {
  votes: VoteRevealEntry[]
  eliminatedId: string | null
  eliminatedName: string | null
  eliminatedRole: Role | null
  isTie: boolean
}

export interface DayEliminatedPayload {
  player: PublicPlayer
  role: Role
  reason: 'vote' | 'host_kick'
}

export interface GameOverPayload {
  winner: Team
  allRoles: Array<{ id: string; name: string; role: Role }>
  stats: {
    rounds: number
    duration: number
  }
}

export interface ErrorPayload {
  code: string
  message: string
}
