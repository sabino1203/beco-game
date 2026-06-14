import { useEffect, useRef, useState } from 'react'
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
import type { GamePhase } from '@beco/shared'

const TRANSITION_LABELS: Partial<Record<GamePhase, string>> = {
  night: 'A noite cai sobre o beco',
  day_debate: 'O sol nasce sobre o beco',
}

function PhaseTransition({ label }: { label: string }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, zIndex: 100 }}>
      <div style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: 900, fontSize: 11, letterSpacing: 6, color: T.dimLo, textTransform: 'uppercase' }}>
        {label.toUpperCase()}
      </div>
      <div style={{ width: 40, height: 2, background: T.dimLo }} />
    </div>
  )
}

export default function Game() {
  const nav = useNavigate()
  const { phase, myRole, roleRevealed, roomCode } = useGameStore()
  const [displayPhase, setDisplayPhase] = useState<GamePhase>(phase)
  const [transitioning, setTransitioning] = useState(false)
  const [transitionLabel, setTransitionLabel] = useState('')
  const prevPhase = useRef<GamePhase>(phase)

  useEffect(() => {
    if (!roomCode) nav('/')
  }, [roomCode, nav])

  useEffect(() => {
    socket.on('room:host_left', () => nav('/?hostLeft=1'))
    socket.on('room:kicked', () => { localStorage.clear(); nav('/?kicked=1') })
    return () => { socket.off('room:host_left'); socket.off('room:kicked') }
  }, [nav])

  useEffect(() => {
    if (phase === prevPhase.current) return
    prevPhase.current = phase

    const label = TRANSITION_LABELS[phase]
    if (label) {
      setTransitionLabel(label)
      setTransitioning(true)
      const t = setTimeout(() => {
        setDisplayPhase(phase)
        setTransitioning(false)
      }, 1800)
      return () => clearTimeout(t)
    } else {
      setDisplayPhase(phase)
    }
  }, [phase])

  if (transitioning) return <PhaseTransition label={transitionLabel} />

  const p = displayPhase

  if (p === 'starting' || (p === 'night' && !roleRevealed)) return <RoleReveal />

  if (p === 'night' || p === 'processing_night') {
    switch (myRole) {
      case 'bandido': return <NightBandido />
      case 'policia': return <NightPolicia />
      case 'medico': return <NightMedico />
      case 'detetive': return <NightDetetive />
      case 'prostituta': return <NightProstituta />
      default: return <NightCivil />
    }
  }

  if (p === 'dawn') return <Dawn />
  if (p === 'day_debate') return <DayDebate />
  if (p === 'day_voting') return <DayVoting />
  if (p === 'vote_reveal') return <VoteReveal />
  if (p === 'game_over') return <GameOver />

  return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: T.dimLo }}>
      Carregando...
    </div>
  )
}
