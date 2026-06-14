import { socket } from '../lib/socket.js'
import { useGameStore } from './gameStore.js'

export function connectSocket() {
  const store = useGameStore.getState()

  socket.on('connect', () => {
    store.setConnected(true)
    const sessionToken = localStorage.getItem('beco_session_token')
    const roomCode = localStorage.getItem('beco_room_code')
    if (sessionToken && roomCode) {
      socket.emit('room:reconnect', { sessionToken, roomCode })
    }
  })
  socket.on('disconnect', () => store.setConnected(false))

  socket.on('room:created', ({ roomCode, sessionToken, playerId }: { roomCode: string; sessionToken: string; playerId: string }) => {
    localStorage.setItem('beco_session_token', sessionToken)
    localStorage.setItem('beco_room_code', roomCode)
    localStorage.setItem('beco_player_id', playerId)
    // Populate store with host view
    socket.emit('room:reconnect', { sessionToken, roomCode })
  })

  socket.on('room:joined', ({ sessionToken, playerId, view }: { sessionToken: string; playerId: string; view: any }) => {
    localStorage.setItem('beco_session_token', sessionToken)
    localStorage.setItem('beco_room_code', view.roomCode)
    localStorage.setItem('beco_player_id', playerId)
    store.setRoomJoined({
      roomCode: view.roomCode,
      myPlayer: view.myPlayer,
      players: view.players,
      config: view.config,
      status: view.status,
      phase: view.phase,
      round: view.round,
    })
  })

  socket.on('room:reconnected', ({ view }: { view: any }) => {
    store.setRoomJoined({
      roomCode: view.roomCode,
      myPlayer: view.myPlayer,
      players: view.players,
      config: view.config,
      status: view.status,
      phase: view.phase,
      round: view.round,
    })
  })

  socket.on('room:updated', (view: any) => {
    store.setPlayers(view.players)
  })

  socket.on('room:player_joined', (player: any) => store.addPlayer(player))
  socket.on('room:player_kicked', (playerId: string) => store.removePlayer(playerId))
  socket.on('room:kicked', () => {
    localStorage.clear()
    store.reset()
    window.location.href = '/?kicked=1'
  })

  socket.on('game:started', () => {})

  socket.on('game:role_assigned', ({ role }: { role: any }) => {
    store.setMyRole(role)
  })

  socket.on('game:phase_changed', ({ phase, timerSeconds, timerStartedAt }: { phase: any; timerSeconds: number; timerStartedAt: number }) => {
    store.setPhase(phase, timerSeconds, timerStartedAt)
  })

  socket.on('night:your_turn', ({ availableTargets, timeoutSeconds }: any) => {
    store.setNightTurn(availableTargets, timeoutSeconds)
  })

  socket.on('night:action_done', () => store.setNightActionDone())

  socket.on('detective:result', (result: any) => store.setDetectiveResult(result))

  socket.on('dawn:event', ({ event }: any) => store.addDawnEvent(event))

  socket.on('dawn:complete', () => {})

  socket.on('day:chat_message', ({ message }: any) => store.addChatMessage(message))

  socket.on('day:vote_count', ({ count, total }: any) => store.setVoteCount(count, total))

  socket.on('day:vote_reveal', (data: any) => store.setVoteReveal(data))

  socket.on('day:eliminated', ({ player }: any) => store.eliminatePlayer(player.id))

  socket.on('game:over', ({ winner, allRoles, stats }: any) => {
    store.setGameOver(winner, allRoles, stats)
  })

  socket.connect()
}
