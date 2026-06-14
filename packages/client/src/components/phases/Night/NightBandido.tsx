import { useState } from 'react'
import { socket } from '../../../lib/socket.js'
import { useGameStore } from '../../../store/gameStore.js'
import { Noise, AB, SERIF, PhaseHead, Targets, Btn, Bubble, TimerPill, T } from '../../ui/index.js'
import { useTimer } from '../../../hooks/useTimer.js'

export default function NightBandido() {
  const { nightTargets, nightActionDone, timerSeconds, timerStartedAt, myPlayer } = useGameStore()
  const [vote, setVote] = useState<string | null>(null)
  const [chatText, setChatText] = useState('')
  const banditsChat = useGameStore((s) => s.banditsChat)
  const remaining = useTimer(timerSeconds, timerStartedAt)

  function sendVote() {
    if (!vote) return
    socket.emit('night:bandido_vote', { targetId: vote })
  }

  function sendChat() {
    if (!chatText.trim()) return
    socket.emit('night:bandido_chat', { text: chatText.trim() })
    setChatText('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0404', position: 'relative' }}>
      <Noise op={0.06} />
      <div style={{ height: 4, background: T.sangue }} />
      <PhaseHead label="Noite · Bandido" color={T.sangue} sym="✕" right={<TimerPill sec={remaining} color={T.sangue} />} />

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* private chat */}
        <div style={{ border: `2px solid ${T.sangue}`, padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${T.sangue}44` }}>
            <div style={{ width: 8, height: 8, background: T.verde, borderRadius: '50%' }} />
            <AB color={T.sangue} size={8}>Chat Privado · Bandidos</AB>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
            {(banditsChat as any[] ?? []).map((m: any) => (
              <Bubble key={m.id} name={m.playerName} msg={m.text} own={m.playerId === myPlayer?.id} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendChat()}
              placeholder="Fala com os seus..."
              style={{ flex: 1, minHeight: 36, padding: '0 10px', border: `1px solid ${T.sangue}44`, background: 'transparent', color: T.text, fontFamily: 'Georgia,serif', fontSize: 11, outline: 'none' }}
            />
            <button onClick={sendChat} style={{ width: 36, height: 36, border: `2px solid ${T.sangue}`, background: 'transparent', color: T.sangue, cursor: 'pointer' }}>↑</button>
          </div>
        </div>

        {!nightActionDone ? (
          <>
            <div>
              <AB color={T.sangue} size={9} style={{ marginBottom: 4 }}>Escolha a vítima</AB>
              <SERIF color={T.dimLo} size={10} style={{ fontStyle: 'italic', marginBottom: 10 }}>Maioria vence. Em empate, ninguém morre.</SERIF>
              <Targets items={nightTargets} selected={vote ?? undefined} onSelect={setVote} color={T.sangue} />
            </div>
            <Btn full fill color={T.sangue} disabled={!vote} onClick={sendVote}>Confirmar voto</Btn>
          </>
        ) : (
          <div style={{ padding: '12px 14px', border: `2px solid ${T.verde}` }}>
            <AB color={T.verde} size={8}>✓ Voto registrado — aguardando os outros</AB>
          </div>
        )}
      </div>
    </div>
  )
}
