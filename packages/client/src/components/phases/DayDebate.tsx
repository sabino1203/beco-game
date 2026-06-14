import { useState, useRef, useEffect } from 'react'
import { socket } from '../../lib/socket.js'
import { useGameStore } from '../../store/gameStore.js'
import { Noise, AB, PhaseHead, Btn, Bubble, TimerPill, Toast, T } from '../ui/index.js'
import { useTimer } from '../../hooks/useTimer.js'

export default function DayDebate() {
  const { chat, timerSeconds, timerStartedAt, myPlayer, players, round } = useGameStore()
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const remaining = useTimer(timerSeconds, timerStartedAt)
  const isHost = myPlayer?.isHost
  const urgent = remaining <= 30

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat])

  function sendChat() {
    if (!text.trim()) return
    socket.emit('day:chat', { text: text.trim() })
    setText('')
  }

  function endDebate() {
    socket.emit('host:end_debate')
  }

  const alive = players.filter((p) => p.isAlive).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#070700', position: 'relative' }}>
      <Noise op={0.05} />
      <div style={{ height: 4, background: urgent ? T.sangue : T.ouro }} />
      <PhaseHead
        label={urgent ? 'Dia · Debate ⚠' : 'Dia · Debate'}
        color={urgent ? T.sangue : T.ouro}
        sym="◎"
        right={<TimerPill sec={remaining} color={urgent ? T.sangue : T.ouro} urgent={urgent} />}
      />

      {urgent && <Toast msg="⚠ Votação abre em breve" color={T.sangue} />}

      <div style={{ padding: '6px 18px', borderBottom: `1px solid ${T.rule}`, display: 'flex', justifyContent: 'space-between' }}>
        <AB color={T.dim} size={8}>{alive} vivos · Rodada {round}</AB>
        {isHost && <AB color={T.dim} size={8}>Host pode encerrar debate</AB>}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {chat.map((m) => (
          <Bubble key={m.id} name={m.playerName} msg={m.text} own={m.playerId === myPlayer?.id} system={m.isSystem} />
        ))}
        <div ref={bottomRef} />
      </div>

      {myPlayer?.isAlive && (
        <div style={{ borderTop: `1px solid ${urgent ? T.sangue + '44' : T.rule}`, padding: '8px 18px', display: 'flex', gap: 8 }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendChat()}
            placeholder={urgent ? 'Últimas palavras...' : 'Diga o que pensa...'}
            style={{ flex: 1, minHeight: 44, padding: '0 12px', border: `1px solid ${urgent ? T.sangue + '44' : T.rule}`, background: 'transparent', color: T.text, fontFamily: 'Georgia,serif', fontSize: 11, outline: 'none' }}
          />
          <div onClick={sendChat} style={{ width: 44, height: 44, border: `2px solid ${urgent ? T.sangue : T.ouro}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <span style={{ color: urgent ? T.sangue : T.ouro, fontSize: 16 }}>↑</span>
          </div>
        </div>
      )}

      {isHost && (
        <div style={{ padding: '6px 18px 16px' }}>
          <Btn full color={T.sangue} onClick={endDebate}>Abrir Votação Agora</Btn>
        </div>
      )}
    </div>
  )
}
