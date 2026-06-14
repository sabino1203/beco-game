import { useGameStore } from '../../store/gameStore.js'
import { Noise, AB, GEO, SERIF, PhaseHead, T } from '../ui/index.js'

export default function VoteReveal() {
  const { voteReveal, voteEliminated, players, round } = useGameStore()

  const tally: Record<string, number> = {}
  for (const v of voteReveal ?? []) {
    tally[v.targetId] = (tally[v.targetId] || 0) + 1
  }

  const sorted = Object.entries(tally).sort(([, a], [, b]) => b - a)
  const total = players.filter((p) => p.isAlive).length + 1

  if (voteEliminated?.isTie) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#080400', position: 'relative' }}>
        <Noise op={0.06} />
        <div style={{ height: 4, background: T.dim }} />
        <PhaseHead label="Resultado · Empate" color={T.dim} sym="≡" />
        <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AB color={T.dim} size={8} style={{ textAlign: 'center' }}>A cidade não decidiu</AB>
          {sorted.map(([id, count]) => {
            const name = players.find((p) => p.id === id)?.name ?? id
            return (
              <div key={id} style={{ padding: '12px 14px', border: `2px solid ${T.dim}`, background: 'transparent' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <div style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: 900, fontSize: 20, color: T.dim, textTransform: 'uppercase' }}>{name}</div>
                  <GEO size={22} color={T.dim}>{String(count).padStart(2, '0')}</GEO>
                </div>
                <div style={{ height: 4, background: T.dimLo }}>
                  <div style={{ width: `${(count / total) * 100}%`, height: '100%', background: T.dim }} />
                </div>
              </div>
            )
          })}
          <div style={{ border: `2px solid ${T.dim}`, padding: 16, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <GEO size={36} color={T.dimLo}>≡</GEO>
            <div style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: 900, fontSize: 22, color: T.dim, textTransform: 'uppercase' }}>Empate</div>
            <SERIF color={T.dimLo} size={11} style={{ fontStyle: 'italic' }}>Ninguém foi expulso hoje. A noite cai novamente.</SERIF>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#080400', position: 'relative' }}>
      <Noise op={0.06} />
      <div style={{ height: 4, background: T.sangue }} />
      <PhaseHead label="Resultado da Votação" color={T.sangue} sym="✕" />
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <AB color={T.dim} size={8} style={{ textAlign: 'center' }}>A cidade decidiu</AB>
        {sorted.map(([id, count]) => {
          const name = players.find((p) => p.id === id)?.name ?? id
          const isElim = id === voteEliminated?.id
          return (
            <div key={id} style={{ padding: '12px 14px', border: `2px solid ${isElim ? T.sangue : T.rule}`, background: isElim ? `${T.sangue}10` : 'transparent' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <div style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: 900, fontSize: 20, color: isElim ? T.sangue : T.text, textTransform: 'uppercase' }}>{name}</div>
                <GEO size={22} color={isElim ? T.sangue : T.dim}>{String(count).padStart(2, '0')}</GEO>
              </div>
              <div style={{ height: 4, background: T.dimLo }}>
                <div style={{ width: `${(count / total) * 100}%`, height: '100%', background: isElim ? T.sangue : T.dim }} />
              </div>
            </div>
          )
        })}

        {voteEliminated?.id && (
          <div style={{ border: `3px solid ${T.sangue}` }}>
            <div style={{ padding: '8px 14px', background: T.sangue, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <AB color={T.text} size={10}>{voteEliminated.name} foi expulso da cidade</AB>
              <GEO size={14} color={T.text}>✕</GEO>
            </div>
            <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <AB color={T.dim} size={8} style={{ marginBottom: 4 }}>Era um</AB>
                <div style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: 900, fontSize: 26, color: T.sangue, textTransform: 'uppercase' }}>{voteEliminated.role}</div>
              </div>
              <GEO size={52} color={T.sangue}>✕</GEO>
            </div>
            {voteEliminated.role === 'bandido' && (
              <div style={{ padding: '8px 14px', borderTop: `1px solid ${T.sangue}44` }}>
                <AB color={T.verde} size={8}>✓ A cidade acertou</AB>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 2 }}>
          {[{ label: 'Rodada', val: String(round) }, { label: 'Eliminados', val: String(players.filter((p) => !p.isAlive).length) }].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: '8px 4px', border: `1px solid ${T.rule}`, textAlign: 'center' }}>
              <GEO size={18} color={T.text}>{s.val}</GEO>
              <AB color={T.dimLo} size={7} style={{ marginTop: 2 }}>{s.label}</AB>
            </div>
          ))}
        </div>

        <AB color={T.dimLo} size={8} style={{ textAlign: 'center' }}>A próxima fase começará em instantes...</AB>
      </div>
    </div>
  )
}
