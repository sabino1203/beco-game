import { useGameStore } from '../../../store/gameStore.js'
import { Noise, AB, SERIF, PhaseHead, Progress, Accent, TimerPill, T } from '../../ui/index.js'
import { useTimer } from '../../../hooks/useTimer.js'

export default function NightCivil() {
  const { timerSeconds, timerStartedAt } = useGameStore()
  const remaining = useTimer(timerSeconds, timerStartedAt)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#06060f', position: 'relative' }}>
      <Noise op={0.06} />
      <div style={{ height: 4, background: T.cinza }} />
      <PhaseHead label="Noite · Civil" color={T.cinza} sym="◈" right={<TimerPill sec={remaining} color={T.cinza} />} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', gap: 24, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: 900, fontSize: 64, color: T.dimLo, lineHeight: 1 }}>Z Z Z</div>
        <div>
          <div style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: 900, fontSize: 22, color: T.text, textTransform: 'uppercase' }}>O beco escurece</div>
          <SERIF color={T.dimLo} size={11} style={{ fontStyle: 'italic', marginTop: 8 }}>Como Civil, você não age. Algo acontece lá fora.</SERIF>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {['A Prostituta escolhe um alvo...', 'O Médico age nas sombras...', 'Os Bandidos conspiram...', 'A Polícia patrulha...'].map((t, i) => (
            <Accent key={i} color={i < 2 ? T.ruleHi : T.dimLo} pad={8}>
              <AB color={i < 2 ? T.dim : T.dimLo} size={8}>{t}</AB>
            </Accent>
          ))}
        </div>
        <div style={{ width: '100%' }}>
          <Progress val={2} max={5} color={T.cinza} label="Ações concluídas" showCount />
        </div>
      </div>
    </div>
  )
}
