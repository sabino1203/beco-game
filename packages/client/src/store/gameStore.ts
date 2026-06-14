import { create } from 'zustand'
import type {
  PublicPlayer,
  Player,
  Role,
  GamePhase,
  DawnEvent,
  ChatMessage,
  VoteRevealEntry,
  Team,
  RoomConfig,
  RoomStatus,
} from '@beco/shared'

interface GameStore {
  // Connection
  connected: boolean
  setConnected: (v: boolean) => void

  // Room
  roomCode: string | null
  roomStatus: RoomStatus | null
  config: RoomConfig | null

  // Players
  players: PublicPlayer[]
  myPlayer: Player | null

  // Game state
  phase: GamePhase
  round: number
  myRole: Role | null
  roleRevealed: boolean

  // Night
  nightTargets: PublicPlayer[]
  nightActionDone: boolean
  detectiveResult: { targetName: string; isBandido: boolean } | null
  nightActionsRemaining: number
  banditsChat: ChatMessage[]

  // Dawn
  dawnEvents: DawnEvent[]

  // Day
  chat: ChatMessage[]
  voteCount: number
  voteTotal: number
  myVote: string | null
  voteReveal: VoteRevealEntry[] | null
  voteEliminated: { id: string | null; name: string | null; role: Role | null; isTie: boolean } | null

  // Game over
  winner: Team | null
  allRoles: Array<{ id: string; name: string; role: Role }> | null
  gameStats: { rounds: number; duration: number } | null

  // Timer
  timerSeconds: number
  timerStartedAt: number | null

  // Actions
  setRoomJoined: (data: { roomCode: string; myPlayer: Player; players: PublicPlayer[]; config: RoomConfig; status: RoomStatus; phase: GamePhase; round: number }) => void
  setPlayers: (players: PublicPlayer[]) => void
  addPlayer: (player: PublicPlayer) => void
  removePlayer: (playerId: string) => void
  setPhase: (phase: GamePhase, timerSeconds: number, timerStartedAt: number) => void
  setMyRole: (role: Role) => void
  revealRole: () => void
  setNightTurn: (targets: PublicPlayer[], timeoutSeconds: number) => void
  setNightActionDone: () => void
  setDetectiveResult: (result: { targetName: string; isBandido: boolean }) => void
  addDawnEvent: (event: DawnEvent) => void
  addChatMessage: (msg: ChatMessage) => void
  setVoteCount: (count: number, total: number) => void
  setMyVote: (targetId: string) => void
  setVoteReveal: (data: { votes: VoteRevealEntry[]; eliminatedId: string | null; eliminatedName: string | null; eliminatedRole: Role | null; isTie: boolean }) => void
  setGameOver: (winner: Team, allRoles: Array<{ id: string; name: string; role: Role }>, stats: { rounds: number; duration: number }) => void
  eliminatePlayer: (playerId: string) => void
  reset: () => void
}

const initial = {
  connected: false,
  roomCode: null,
  roomStatus: null,
  config: null,
  players: [],
  myPlayer: null,
  phase: 'lobby' as GamePhase,
  round: 0,
  myRole: null,
  roleRevealed: false,
  nightTargets: [],
  nightActionDone: false,
  detectiveResult: null,
  nightActionsRemaining: 0,
  banditsChat: [],
  dawnEvents: [],
  chat: [],
  voteCount: 0,
  voteTotal: 0,
  myVote: null,
  voteReveal: null,
  voteEliminated: null,
  winner: null,
  allRoles: null,
  gameStats: null,
  timerSeconds: 0,
  timerStartedAt: null,
}

export const useGameStore = create<GameStore>((set) => ({
  ...initial,

  setConnected: (connected) => set({ connected }),

  setRoomJoined: ({ roomCode, myPlayer, players, config, status, phase, round }) =>
    set({ roomCode, myPlayer, players, config, roomStatus: status, phase, round }),

  setPlayers: (players) => set({ players }),

  addPlayer: (player) =>
    set((s) => ({ players: [...s.players.filter((p) => p.id !== player.id), player] })),

  removePlayer: (playerId) =>
    set((s) => ({ players: s.players.filter((p) => p.id !== playerId) })),

  setPhase: (phase, timerSeconds, timerStartedAt) =>
    set({
      phase,
      timerSeconds,
      timerStartedAt,
      nightActionDone: false,
      detectiveResult: null,
      dawnEvents: [],
      voteReveal: null,
      voteEliminated: null,
      voteCount: 0,
      myVote: null,
    }),

  setMyRole: (myRole) => set({ myRole }),

  revealRole: () => set({ roleRevealed: true }),

  setNightTurn: (nightTargets, timeoutSeconds) =>
    set({ nightTargets, timerSeconds: timeoutSeconds, timerStartedAt: Date.now(), nightActionDone: false }),

  setNightActionDone: () => set({ nightActionDone: true }),

  setDetectiveResult: (detectiveResult) => set({ detectiveResult }),

  addDawnEvent: (event) => set((s) => ({ dawnEvents: [...s.dawnEvents, event] })),

  addChatMessage: (msg) => set((s) => ({ chat: [...s.chat, msg] })),

  setVoteCount: (voteCount, voteTotal) => set({ voteCount, voteTotal }),

  setMyVote: (myVote) => set({ myVote }),

  setVoteReveal: ({ votes, eliminatedId, eliminatedName, eliminatedRole, isTie }) =>
    set({
      voteReveal: votes,
      voteEliminated: { id: eliminatedId, name: eliminatedName, role: eliminatedRole, isTie },
    }),

  setGameOver: (winner, allRoles, gameStats) =>
    set({ winner, allRoles, gameStats, phase: 'game_over' }),

  eliminatePlayer: (playerId) =>
    set((s) => ({
      players: s.players.map((p) =>
        p.id === playerId ? { ...p, isAlive: false, isSpectator: true } : p
      ),
    })),

  reset: () => set(initial),
}))
