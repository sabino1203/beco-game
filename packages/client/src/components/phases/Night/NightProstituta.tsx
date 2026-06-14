import { useState } from 'react'
import { socket } from '../../../lib/socket.js'
import { useGameStore } from '../../../store/gameStore.js'
import { Noise, AB, SERIF, PhaseHead, Targets, Btn, Accent, TimerPill, T } from '../../ui/index.js'
import { useTimer } from '../../../hooks/useTimer.js'

export default function NightProstituta() {
  const { nightTargets, nightActionDone, timerSeconds, timerStartedAt } = useGameStore()
  const [target, setTarget] = useState<string | null>(null)
  const remaining = useTimer(timerSeconds, timerStartedAt)

  function distract() {
    if (!target) return
    socket.emit('night:prostituta', { targetId: target })
  }

  if (nightActionDone) return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#060308', position: 'relative' }}>
      <Noise op={0.06} />
      <div style={{ height: 4, background: T.roxo }} />
      <PhaseHead label="Noite · Prostituta" color={T.roxo} sym="◉" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ padding: '12px 14px', border: `2px solid ${T.verde}` }}>
          <AB color={T.verde} size={8}>✓ Alvo distraído — aguardando o amanhecer</AB>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#060308', position: 'relative' }}>
      <Noise op={0.06} />
      <div style={{ height: 4, background: T.roxo }} />
      <PhaseHead label="Noite · Prostituta" color={T.roxo} sym="◉" right={<TimerPill sec={remaining} color={T.roxo} />} />

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: 900, fontSize: 20, color: T.roxo, textTransform: 'uppercase' }}>Quem você vai distrair?</div>
          <SERIF color={T.dimLo} size={10} style={{ fontStyle: 'italic', marginTop: 6 }}>O jogador não realizará sua ação. Ele não saberá.</SERIF>
        </div>
        <Targets items={nightTargets} selected={target ?? undefined} onSelect={setTarget} color={T.roxo} />
        <Accent color={T.roxo} pad={8} bg={`${T.roxo}0a`}>
          <AB color={T.roxo} size={8}>Você age antes de todos — bloquear um Bandido impede seu voto esta noite</AB>
        </Accent>
        <Btn full fill color={T.roxo} disabled={!target} onClick={distract}>Distrair</Btn>
      </div>
    </div>
  )
}
