import type { Player, Role } from '@beco/shared'
import type { RoleConfig } from '@beco/shared'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function distributeRoles(players: Player[], config: RoleConfig): Player[] {
  const roles: Role[] = []

  for (let i = 0; i < config.bandidos; i++) roles.push('bandido')
  if (config.policia) roles.push('policia')
  if (config.medico) roles.push('medico')
  if (config.detetive) roles.push('detetive')
  if (config.prostituta) roles.push('prostituta')

  const civilCount = players.length - roles.length
  for (let i = 0; i < civilCount; i++) roles.push('civil')

  const shuffled = shuffle(roles)

  return players.map((p, i) => ({
    ...p,
    role: shuffled[i],
    team: shuffled[i] === 'bandido' ? 'bandidos' : 'cidadaos',
  }))
}
