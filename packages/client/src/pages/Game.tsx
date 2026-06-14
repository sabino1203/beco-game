import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore.js'
import { socket } from '../lib/socket.js'
import RoleReveal from '../components/phases/RoleReveal.js'
import NightCivil from '../components/phases/Night/NightCivil.js'
import NightBandido from '../components/phases/Night/NightBandido.js'
import NightPolicia from '../components/phases/Night/NightPolicia.js'
import NightMedico from '../components/phases/Night/NightMedico.js'
import NightDetetive from '../components/phases/Night/NightDetetive.js'
import NightProstituta from '../components/phases/Night/NightProstituta.js'
import Dawn from '../components/phases/Dawn.js'
import DayDebate from '../components/phases/DayDebate.js'
import DayVoting from '../components/phases/DayVoting.js'
import VoteReveal from '../components/phases/VoteReveal.js'
import GameOver from '../components/phases/GameOver.js'
import { T } from '../components/ui/index.js'

export default function Game() {
  const nav = useNavigate()
  const { phase, myRole, roleRevealed, roomCode } = useGameStore()

  useEffect(() => {
    if (!roomCode) nav('/')
  }, [roomCode, nav])

  useEffect(() => {
    socket.on('room:host_left', () => {
      nav('/?hostLeft=1')
    })
    socket.on('room:kicked', () => {
      localStorage.clear()
      nav('/?kicked=1')
    })
    return () => {
      socket.off('room:host_left')
      socket.off('room:kicked')
    }
  }, [nav])

  // Pre-game: role not yet revealed
  if (phase === 'starting' || (phase === 'night' && !roleRevealed)) {
    return <RoleReveal />
  }

  // Night phase — show the right screen per role
  if (phase === 'night' || phase === 'processing_night') {
    switch (myRole) {
      case 'bandido': return <NightBandido />
      case 'policia': return <NightPolicia />
      case 'medico': return <NightMedico />
      case 'detetive': return <NightDetetive />
      case 'prostituta': return <NightProstituta />
      default: return <NightCivil />
    }
  }

  if (phase === 'dawn') return <Dawn />
  if (phase === 'day_debate') return <DayDebate />
  if (phase === 'day_voting') return <DayVoting />
  if (phase === 'vote_reveal') return <VoteReveal />
  if (phase === 'game_over') return <GameOver />

  return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: T.dimLo }}>
      Carregando...
    </div>
  )
}
