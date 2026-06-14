import type { Room, Player, PublicPlayer, PlayerRoomView } from '@beco/shared'

export function toPublicPlayer(p: Player): PublicPlayer {
  return {
    id: p.id,
    name: p.name,
    isAlive: p.isAlive,
    isHost: p.isHost,
    isSpectator: p.isSpectator,
  }
}

export function buildPlayerView(room: Room, player: Player): PlayerRoomView {
  return {
    roomCode: room.code,
    status: room.status,
    players: room.players.map(toPublicPlayer),
    myPlayer: player,
    config: room.config,
    round: room.gameState?.round ?? 0,
    phase: room.gameState?.phase ?? 'lobby',
  }
}
