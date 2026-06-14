import { useState } from 'react'
import { socket } from '../../../lib/socket.js'
import { useGameStore } from '../../../store/gameStore.js'
import { Noise, AB, SERIF, PhaseHead, Targets, Btn, Accent, TimerPill, T } from '../../ui/index.js'
import { useTimer } from '../../../hooks/useTimer.js'

export default function NightPolicia() {
  const { nightTargets, nightActionDone, timerSeconds, timerStartedAt } = useGameStore()
  const [target, setTarget] = useState<string | null>(null)
  const remaining = useTimer(timerSeconds, timerStartedAt)

  function shoot() {
    socket.emit('night:policia', { targetId: target })
  }
  function pass() {
    socket.emit('night:policia', { targetId: null })
  }

  if (nightActionDone) return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#080700', position: 'relative' }}>
      <Noise op={0.06} />
      <div style={{ height: 4, background: T.ouro }} />
      <PhaseHead label="Noite · Polícia" color={T.ouro} sym="⊕" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ padding: '12px 14px', border: `2px solid ${T.verde}` }}>
          <AB color={T.verde} size={8}>✓ Ação registrada — aguardando o amanhecer</AB>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#080700', position: 'relative' }}>
      <Noise op={0.06} />
      <div style={{ height: 4, background: T.ouro }} />
      <PhaseHead label="Noite · Polícia" color={T.ouro} sym="⊕" right={<TimerPill sec={remaining} color={T.ouro} />} />

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: 900, fontSize: 20, color: T.ouro, textTransform: 'uppercase' }}>Quem você vai eliminar?</div>
          <SERIF color={T.dimLo} size={10} style={{ fontStyle: 'italic', marginTop: 6 }}>Você pode errar. Erre demais e a cidade desconfia.</SERIF>
        </div>
        <Targets items={nightTargets} selected={target ?? undefined} onSelect={setTarget} color={T.ouro} />
        <Accent color={T.dimLo} pad={8}>
          <AB color={T.dimLo} size={8}>Passar a vez é uma opção estratégica válida</AB>
        </Accent>
        <Btn full fill color={T.ouro} disabled={!target} onClick={shoot}>Atirar</Btn>
        <Btn full color={T.dimLo} onClick={pass}>Passar a vez esta noite</Btn>
      </div>
    </div>
  )
}
