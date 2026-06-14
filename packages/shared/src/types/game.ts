export type Role =
  | 'civil'
  | 'bandido'
  | 'policia'
  | 'medico'
  | 'detetive'
  | 'prostituta'

export type Team = 'cidadaos' | 'bandidos'

export type GamePhase =
  | 'lobby'
  | 'starting'
  | 'night'
  | 'processing_night'
  | 'dawn'
  | 'day_debate'
  | 'day_voting'
  | 'vote_reveal'
  | 'game_over'

export type DawnEventType =
  | 'policia_acertou'
  | 'policia_errou'
  | 'medico_salvou'
  | 'vitima_morreu'
  | 'noite_tranquila'
  | 'expulso_pelo_host'

export interface DawnEvent {
  type: DawnEventType
  targetId?: string
  targetName?: string
  targetRole?: Role
}

export interface Player {
  id: string
  socketId: string
  name: string
  role: Role | null
  team: Team | null
  isAlive: boolean
  isHost: boolean
  isSpectator: boolean
  lastProtectedAt: number | null
  connectedAt: number
  sessionToken: string
}

export interface PublicPlayer {
  id: string
  name: string
  isAlive: boolean
  isHost: boolean
  isSpectator: boolean
}

export interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  text: string
  timestamp: number
  isSystem?: boolean
  isDead?: boolean
}

export interface VoteRevealEntry {
  voterId: string
  voterName: string
  targetId: string
  targetName: string
}

export interface NightActions {
  prostitutaTarget: string | null
  medicoTarget: string | null
  detetivelTarget: string | null
  bandidosVotes: Record<string, string>
  policiaTarget: string | null
  actedRoles: Set<Role>
}

export interface GameState {
  round: number
  phase: GamePhase
  nightActions: NightActions
  dayEvents: DawnEvent[]
  votes: Record<string, string>
  chat: ChatMessage[]
  banditsChat: ChatMessage[]
  winner: Team | null
  phaseStartedAt: number
}
