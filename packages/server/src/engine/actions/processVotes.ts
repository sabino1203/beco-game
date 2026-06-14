import type { Player, VoteRevealEntry } from '@beco/shared'

export interface VoteResult {
  votes: VoteRevealEntry[]
  eliminatedId: string | null
  isTie: boolean
}

export function processVotes(
  voteMap: Record<string, string>,
  players: Player[]
): VoteResult {
  const getPlayer = (id: string) => players.find((p) => p.id === id)

  const votes: VoteRevealEntry[] = Object.entries(voteMap).map(([voterId, targetId]) => ({
    voterId,
    voterName: getPlayer(voterId)?.name ?? '?',
    targetId,
    targetName: getPlayer(targetId)?.name ?? '?',
  }))

  const tally: Record<string, number> = {}
  for (const { targetId } of votes) {
    tally[targetId] = (tally[targetId] || 0) + 1
  }

  if (Object.keys(tally).length === 0) {
    return { votes, eliminatedId: null, isTie: false }
  }

  const max = Math.max(...Object.values(tally))
  const topVoted = Object.entries(tally).filter(([, v]) => v === max)

  // RN-VOT-08: tie = no elimination
  if (topVoted.length > 1) {
    return { votes, eliminatedId: null, isTie: true }
  }

  return { votes, eliminatedId: topVoted[0][0], isTie: false }
}
