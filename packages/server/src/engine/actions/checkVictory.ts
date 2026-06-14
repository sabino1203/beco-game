import type { Player, Team } from '@beco/shared'

export function checkVictory(players: Player[]): Team | null {
  const alive = players.filter((p) => p.isAlive)
  const aliveBandidos = alive.filter((p) => p.team === 'bandidos')
  const aliveCidadaos = alive.filter((p) => p.team === 'cidadaos')

  // RN-V01: Cidadãos vencem quando todos os Bandidos são eliminados
  if (aliveBandidos.length === 0) return 'cidadaos'

  // RN-V02: Bandidos vencem quando são maioria
  if (aliveBandidos.length >= aliveCidadaos.length) return 'bandidos'

  return null
}
