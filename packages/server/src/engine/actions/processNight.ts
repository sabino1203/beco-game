import type { Room, DawnEvent, Player } from '@beco/shared'

function getPlayer(players: Player[], id: string): Player | undefined {
  return players.find((p) => p.id === id)
}

function getMedicoId(players: Player[]): string | undefined {
  return players.find((p) => p.role === 'medico')?.id
}

function getBandidos(players: Player[]): Player[] {
  return players.filter((p) => p.role === 'bandido' && p.isAlive)
}

function getPoliciaId(players: Player[]): string | undefined {
  return players.find((p) => p.role === 'policia')?.id
}

export function processNight(room: Room): { events: DawnEvent[]; updatedPlayers: Player[] } {
  if (!room.gameState) return { events: [], updatedPlayers: room.players }

  const { nightActions } = room.gameState
  const players = [...room.players]
  const events: DawnEvent[] = []

  // 1. Resolve Prostituta blocks
  const blocked = new Set<string>()
  if (nightActions.prostitutaTarget) {
    blocked.add(nightActions.prostitutaTarget)
  }

  // 2. Resolve Médico protection (if Médico not blocked)
  let protected_: string | null = null
  const medicoId = getMedicoId(players)
  if (nightActions.medicoTarget && medicoId && !blocked.has(medicoId)) {
    protected_ = nightActions.medicoTarget
  }

  // 3. Detetive result was emitted in real-time — no processing here

  // 4. Resolve Bandidos attack (majority vote, skip if any active bandido is blocked)
  let bandidosVictim: string | null = null
  const activeBandidos = getBandidos(players).filter((b) => !blocked.has(b.id))
  if (activeBandidos.length > 0 && Object.keys(nightActions.bandidosVotes).length > 0) {
    const tally: Record<string, number> = {}
    for (const targetId of Object.values(nightActions.bandidosVotes)) {
      tally[targetId] = (tally[targetId] || 0) + 1
    }
    const max = Math.max(...Object.values(tally))
    const winners = Object.entries(tally).filter(([, v]) => v === max)
    // RN-16: tie = no kill
    if (winners.length === 1) {
      bandidosVictim = winners[0][0]
    }
  }

  // 5. Resolve Polícia shot (if not blocked)
  let policiaVictim: string | null = null
  const policiaId = getPoliciaId(players)
  if (policiaId && !blocked.has(policiaId) && nightActions.policiaTarget) {
    policiaVictim = nightActions.policiaTarget
  }

  // 6. Apply deaths (Médico protection cancels)
  if (bandidosVictim) {
    const target = getPlayer(players, bandidosVictim)
    if (target) {
      if (bandidosVictim === protected_) {
        events.push({ type: 'medico_salvou' })
      } else {
        target.isAlive = false
        target.isSpectator = true
        events.push({ type: 'vitima_morreu', targetId: target.id, targetName: target.name, targetRole: target.role! })
      }
    }
  }

  if (policiaVictim) {
    const target = getPlayer(players, policiaVictim)
    if (target) {
      if (policiaVictim === protected_) {
        // protected — no death, but still announce police shot
        events.push({ type: target.team === 'bandidos' ? 'policia_acertou' : 'policia_errou', targetId: target.id, targetName: target.name, targetRole: target.role! })
      } else {
        target.isAlive = false
        target.isSpectator = true
        events.push({
          type: target.team === 'bandidos' ? 'policia_acertou' : 'policia_errou',
          targetId: target.id,
          targetName: target.name,
          targetRole: target.role!,
        })
      }
    }
  }

  if (events.length === 0) {
    events.push({ type: 'noite_tranquila' })
  }

  // Update lastProtectedAt for Médico constraint (RN-12)
  if (protected_) {
    const target = getPlayer(players, protected_)
    if (target) {
      target.lastProtectedAt = room.gameState.round
    }
  }

  return { events, updatedPlayers: players }
}
