import type { Role, Team } from '../types/game.js'

export interface RoleMeta {
  label: string
  sym: string
  color: string
  team: Team
  desc: string
  nightAction: string | null
}

export const ROLE_META: Record<Role, RoleMeta> = {
  civil: {
    label: 'CIVIL',
    sym: '◈',
    color: '#4a5060',
    team: 'cidadaos',
    desc: 'Descubra e elimine os bandidos pelo voto. Você não tem poderes — só a sua voz.',
    nightAction: null,
  },
  bandido: {
    label: 'BANDIDO',
    sym: '✕',
    color: '#c41e1e',
    team: 'bandidos',
    desc: 'Elimine civis à noite. Blefe durante o dia. Sobreviva a qualquer custo.',
    nightAction: 'Escolha uma vítima para eliminar',
  },
  policia: {
    label: 'POLÍCIA',
    sym: '⊕',
    color: '#c88c0a',
    team: 'cidadaos',
    desc: 'Atire em um suspeito cada noite. Você pode errar — e pagar caro por isso.',
    nightAction: 'Atire em um suspeito ou passe a vez',
  },
  medico: {
    label: 'MÉDICO',
    sym: '⊞',
    color: '#1a6b3a',
    team: 'cidadaos',
    desc: 'Proteja uma vida por noite. Não repita a mesma pessoa.',
    nightAction: 'Escolha quem proteger esta noite',
  },
  detetive: {
    label: 'DETETIVE',
    sym: '⊙',
    color: '#1a3f7a',
    team: 'cidadaos',
    desc: 'Investigue um suspeito. Recebe: Bandido ou Cidadão — nunca o papel exato.',
    nightAction: 'Investigue um suspeito',
  },
  prostituta: {
    label: 'PROSTITUTA',
    sym: '◉',
    color: '#5a1a7a',
    team: 'cidadaos',
    desc: 'Bloqueie a ação de qualquer jogador. Ele não saberá que foi bloqueado.',
    nightAction: 'Escolha quem distrair esta noite',
  },
}

export const NIGHT_ACTION_ORDER: Role[] = [
  'prostituta',
  'medico',
  'detetive',
  'bandido',
  'policia',
]
