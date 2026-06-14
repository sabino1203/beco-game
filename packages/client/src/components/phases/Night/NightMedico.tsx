import { useState } from 'react'
import { socket } from '../../../lib/socket.js'
import { useGameStore } from '../../../store/gameStore.js'
import { Noise, AB, SERIF, PhaseHead, Targets, Btn, Accent, TimerPill, T } from '../../ui/index.js'
import { useTimer } from '../../../hooks/useTimer.js'

export default function NightMedico() {
  const { nightTargets, nightActionDone, timerSeconds, timerStartedAt, myPlayer } = useGameStore()
  const [target, setTarget] = useState<string | null>(myPlayer?.id ?? null)
  const remaining = useTimer(timerSeconds, timerStartedAt)

  // Include self as a target
  const targets = myPlayer
    ? [{ id: myPlayer.id, name: `${myPlayer.name} (você)` }, ...nightTargets.filter((t) => t.id !== myPlayer.id)]
    : nightTargets

  function protect() {
    if (!target) return
    socket.emit('night:medico', { targetId: target })
  }

  if (nightActionDone) return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#030a04', position: 'relative' }}>
      <Noise op={0.06} />
      <div style={{ height: 4, background: T.verde }} />
      <PhaseHead label="Noite · Médico" color={T.verde} sym="⊞" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ padding: '12px 14px', border: `2px solid ${T.verde}` }}>
          <AB color={T.verde} size={8}>✓ Proteção registrada — aguardando o amanhecer</AB>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#030a04', position: 'relative' }}>
      <Noise op={0.06} />
      <div style={{ height: 4, background: T.verde }} />
      <PhaseHead label="Noite · Médico" color={T.verde} sym="⊞" right={<TimerPill sec={remaining} color={T.verde} />} />

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: 900, fontSize: 20, color: T.verde, textTransform: 'uppercase' }}>Quem você vai proteger?</div>
          <SERIF color={T.dimLo} size={10} style={{ fontStyle: 'italic', marginTop: 6 }}>Você pode se proteger. Não repita a mesma pessoa.</SERIF>
        </div>
        <Targets items={targets} selected={target ?? undefined} onSelect={setTarget} color={T.verde} />
        <Accent color={T.verde} pad={8} bg={`${T.verde}0a`}>
          <AB color={T.verde} size={8}>⚠ Você não pode proteger a mesma pessoa em 2 noites seguidas</AB>
        </Accent>
        <Btn full fill color={T.verde} disabled={!target} onClick={protect}>Proteger</Btn>
      </div>
    </div>
  )
}
