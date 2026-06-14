import { useState } from 'react'
import { socket } from '../../lib/socket.js'
import { useGameStore } from '../../store/gameStore.js'
import { Noise, AB, PhaseHead, Targets, Btn, Bubble, Progress, Accent, TimerPill, T } from '../ui/index.js'
import { useTimer } from '../../hooks/useTimer.js'

export default function DayVoting() {
  const { players, myPlayer, timerSeconds, timerStartedAt, myVote, voteCount, voteTotal } = useGameStore()
  const remaining = useTimer(timerSeconds, timerStartedAt)
  const [localVote, setLocalVote] = useState<string | null>(myVote)

  const alivePlayers = players.filter((p) => p.isAlive && p.id !== myPlayer?.id)
  const voted = !!myVote

  function confirmVote(targetId: string) {
    socket.emit('day:vote', { targetId })
    setLocalVote(targetId)
    useGameStore.getState().setMyVote(targetId)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#080400', position: 'relative' }}>
      <Noise op={0.06} />
      <div style={{ height: 4, background: T.sangue }} />
      <PhaseHead label="Dia · Votação" color={T.sangue} sym="✕" right={<TimerPill sec={remaining} color={T.sangue} />} />

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Bubble system msg="Chat bloqueado durante a votação" />
        <Progress val={voteCount} max={voteTotal || players.filter((p) => p.isAlive).length} color={T.sangue} label="Votos registrados" showCount />

        {voted && (
          <div style={{ border: `2px solid ${T.verde}`, padding: '14px' }}>
            <AB color={T.verde} size={8} style={{ marginBottom: 8 }}>✓ Seu voto foi registrado</AB>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderLeft: `3px solid ${T.sangue}`, background: `${T.sangue}12` }}>
              <span style={{ color: T.sangue, fontSize: 12 }}>✕</span>
              <span style={{ color: T.text, fontFamily: "'Courier New',monospace", fontSize: 13 }}>
                {players.find((p) => p.id === myVote)?.name}
              </span>
              <AB color={T.sangue} size={7} style={{ marginLeft: 'auto' }}>Seu voto</AB>
            </div>
          </div>
        )}

        {voted ? (
          <>
            <Accent color={T.dimLo} pad={8}>
              <AB color={T.dimLo} size={8}>Toque em um nome para mudar seu voto</AB>
            </Accent>
            {alivePlayers.map((p) => (
              <div key={p.id} onClick={() => confirmVote(p.id)} style={{ minHeight: 48, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 12, borderLeft: `3px solid ${p.id === localVote ? T.sangue : T.rule}`, background: p.id === localVote ? `${T.sangue}14` : 'rgba(255,255,255,0.02)', cursor: 'pointer' }}>
                <div style={{ width: 20, height: 20, border: `2px solid ${p.id === localVote ? T.sangue : T.dimLo}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.id === localVote && <div style={{ width: 8, height: 8, background: T.sangue }} />}
                </div>
                <span style={{ color: p.id === localVote ? T.text : T.dim, fontFamily: "'Courier New',monospace", fontSize: 12 }}>{p.name}</span>
              </div>
            ))}
          </>
        ) : (
          <>
            <div style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: 900, fontSize: 22, color: T.text, textTransform: 'uppercase' }}>Quem é o bandido?</div>
            <AB color={T.dim} size={8}>Toque para votar — você pode trocar até o timer encerrar</AB>
            <Targets items={alivePlayers} selected={localVote ?? undefined} onSelect={(id) => setLocalVote(id)} color={T.sangue} />
            <Btn full fill color={T.sangue} disabled={!localVote} onClick={() => localVote && confirmVote(localVote)}>
              Confirmar voto{localVote ? ` em ${players.find((p) => p.id === localVote)?.name}` : ''}
            </Btn>
          </>
        )}
      </div>
    </div>
  )
}
