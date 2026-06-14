import { useState } from 'react'
import { socket } from '../../../lib/socket.js'
import { useGameStore } from '../../../store/gameStore.js'
import { Noise, AB, GEO, SERIF, PhaseHead, Targets, Btn, TimerPill, T } from '../../ui/index.js'
import { useTimer } from '../../../hooks/useTimer.js'

export default function NightDetetive() {
  const { nightTargets, nightActionDone, detectiveResult, timerSeconds, timerStartedAt } = useGameStore()
  const [target, setTarget] = useState<string | null>(null)
  const remaining = useTimer(timerSeconds, timerStartedAt)

  function investigate() {
    if (!target) return
    socket.emit('night:detetive', { targetId: target })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#030508', position: 'relative' }}>
      <Noise op={0.06} />
      <div style={{ height: 4, background: T.azul }} />
      <PhaseHead label="Noite · Detetive" color={T.azul} sym="⊙" right={<TimerPill sec={remaining} color={T.azul} />} />

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {detectiveResult ? (
          <>
            <div style={{ border: `3px solid ${detectiveResult.isBandido ? T.sangue : T.verde}`, padding: 20, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <AB color={detectiveResult.isBandido ? T.sangue : T.verde} size={8}>Resultado da Investigação</AB>
              <div style={{ width: '100%', height: 2, background: detectiveResult.isBandido ? T.sangue : T.verde, opacity: 0.3 }} />
              <GEO size={40} color={detectiveResult.isBandido ? T.sangue : T.verde}>{detectiveResult.isBandido ? '✕' : '◈'}</GEO>
              <div style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: 900, fontSize: 22, color: detectiveResult.isBandido ? T.sangue : T.verde, textTransform: 'uppercase' }}>
                {detectiveResult.isBandido ? 'Bandido' : 'Cidadão'}
              </div>
              <SERIF color={T.dimLo} size={11} style={{ fontStyle: 'italic' }}>
                {detectiveResult.targetName} é {detectiveResult.isBandido ? 'um Bandido' : 'um Cidadão'}
              </SERIF>
              <div style={{ padding: '5px 10px', border: `1px solid ${T.dimLo}` }}>
                <AB color={T.dimLo} size={8}>Somente você viu esse resultado</AB>
              </div>
            </div>
            <Btn full fill color={T.azul} disabled>Aguardando o amanhecer...</Btn>
          </>
        ) : (
          <>
            <div>
              <div style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: 900, fontSize: 20, color: T.azul, textTransform: 'uppercase' }}>Investigue um suspeito</div>
              <SERIF color={T.dimLo} size={10} style={{ fontStyle: 'italic', marginTop: 6 }}>Recebe: Bandido ou Cidadão — nunca o papel exato.</SERIF>
            </div>
            <Targets items={nightTargets} selected={target ?? undefined} onSelect={setTarget} color={T.azul} />
            <Btn full fill color={T.azul} disabled={!target || nightActionDone} onClick={investigate}>Investigar</Btn>
          </>
        )}
      </div>
    </div>
  )
}
