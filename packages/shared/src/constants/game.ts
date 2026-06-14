export const GAME_CONSTANTS = {
  MIN_PLAYERS: 5,
  MAX_PLAYERS: 20,
  ROOM_TTL_SECONDS: 7200,
  IDLE_TTL_SECONDS: 1800,
  RECONNECT_WINDOW_SECONDS: 300,
  DEFAULT_DEBATE_SECONDS: 180,
  DEFAULT_VOTE_SECONDS: 60,
  DEFAULT_NIGHT_TIMEOUT_SECONDS: 90,
  DAWN_EVENT_DELAY_MS: 2000,
  ROOM_CODE_LENGTH: 6,
} as const

export const RECOMMENDED_CONFIGS: Record<number, { bandidos: number; specials: string[] }> = {
  5:  { bandidos: 1, specials: ['policia'] },
  6:  { bandidos: 1, specials: ['policia', 'medico'] },
  7:  { bandidos: 1, specials: ['policia', 'medico', 'detetive'] },
  8:  { bandidos: 2, specials: ['policia', 'medico', 'detetive'] },
  9:  { bandidos: 2, specials: ['policia', 'medico', 'detetive', 'prostituta'] },
  10: { bandidos: 2, specials: ['policia', 'medico', 'detetive', 'prostituta'] },
  12: { bandidos: 3, specials: ['policia', 'medico', 'detetive', 'prostituta'] },
  15: { bandidos: 3, specials: ['policia', 'medico', 'detetive', 'prostituta'] },
  20: { bandidos: 4, specials: ['policia', 'medico', 'detetive', 'prostituta'] },
}
