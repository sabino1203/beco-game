import { useGameStore } from '../../store/gameStore.js'
import { Noise, AB, SERIF, PhaseHead, DawnEventRow, T } from '../ui/index.js'

const DAWN_META: Record<string, { sym: string; text: (e: any) => string; color: string }> = {
  policia_acertou: { sym: '⊕', text: (e) => `A Polícia acertou — ${e.targetName} foi abatido`, color: T.ouro },
  policia_errou:   { sym: '⊕', text: (e) => `${e.targetName} foi morto pela Polícia`, color: T.ouro },
  medico_salvou:   { sym: '⊞', text: () => 'O Médico agiu e salvou alguém', color: T.verde },
  vitima_morreu:   { sym: '✕', text: (e) => `${e.targetName} foi encontrado morto`, color: T.sangue },
  noite_tranquila: { sym: '◎', text: () => 'A noite foi tranquila', color: T.dimLo },
  expulso_pelo_host: { sym: '✕', text: (e) => `${e.targetName} foi expulso pelo Host`, color: T.sangue },
}

export default function Dawn() {
  const { dawnEvents } = useGameStore()
  const lastDeath = dawnEvents.find((e) => e.type === 'vitima_morreu' || e.type === 'policia_acertou' || e.type === 'policia_errou')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#080500', position: 'relative' }}>
      <Noise op={0.06} />
      <div style={{ height: 4, background: T.ouro }} />
      <PhaseHead label="Amanhecer" color={T.ouro} sym="◎" />

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <SERIF color={T.dim} size={11} style={{ fontStyle: 'italic', textAlign: 'center', marginBottom: 4 }}>O sol nasce sobre a cidade...</SERIF>

        {dawnEvents.map((e, i) => {
          const meta = DAWN_META[e.type]
          if (!meta) return null
          return <DawnEventRow key={i} sym={meta.sym} text={meta.text(e)} color={meta.color} />
        })}

        {lastDeath && lastDeath.targetName && (
          <div style={{ border: `3px solid ${T.sangue}`, marginTop: 4 }}>
            <div style={{ padding: '8px 14px', background: T.sangue, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <AB color={T.text} size={10}>Eliminado</AB>
              <span style={{ color: T.text, fontSize: 14 }}>✕</span>
            </div>
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: 900, fontSize: 32, color: T.text, textTransform: 'uppercase' }}>{lastDeath.targetName}</div>
              {lastDeath.targetRole && (
                <div style={{ margin: '10px 0', display: 'inline-block', padding: '4px 12px', border: `1px solid ${T.dim}` }}>
                  <AB color={T.dim} size={9}>Era {lastDeath.targetRole}</AB>
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ marginTop: 'auto' }}>
          <AB color={T.dimLo} size={8} style={{ textAlign: 'center', marginBottom: 10 }}>O debate começa em instantes...</AB>
        </div>
      </div>
    </div>
  )
}
