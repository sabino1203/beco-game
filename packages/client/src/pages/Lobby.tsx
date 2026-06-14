import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { socket } from '../lib/socket.js'
import { useGameStore } from '../store/gameStore.js'
import { Noise, AB, GEO, SERIF, Btn, PlayerRow, Progress, Accent, T } from '../components/ui/index.js'

export default function Lobby() {
  const nav = useNavigate()
  const { roomCode, players, myPlayer, config } = useGameStore()
  const [kickTarget, setKickTarget] = useState<string | null>(null)
  const [kickName, setKickName] = useState('')

  const isHost = myPlayer?.isHost ?? false
  const minPlayers = 5

  function handleStart() {
    socket.emit('host:start')
    socket.once('game:started', () => nav('/game'))
    socket.once('game:role_assigned', () => nav('/game'))
  }

  function handleKick(id: string, name: string) {
    if (!isHost) return
    setKickTarget(id)
    setKickName(name)
  }

  function confirmKick() {
    if (!kickTarget) return
    socket.emit('host:kick', { playerId: kickTarget })
    setKickTarget(null)
  }

  function copyCode() {
    if (roomCode) navigator.clipboard.writeText(roomCode)
  }

  // Navigate to game when phase changes
  socket.once('game:phase_changed', () => nav('/game'))

  if (kickTarget) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
        <Noise />
        <div style={{ height: 4, background: T.sangue }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <GEO size={48} color={T.sangue}>✕</GEO>
            <div style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: 900, fontSize: 28, color: T.text, textTransform: 'uppercase', marginTop: 12 }}>Expulsar {kickName}?</div>
          </div>
          <div style={{ border: `2px solid ${T.sangue}`, padding: '14px 16px', width: '100%' }}>
            <SERIF color={T.dim} size={12} style={{ fontStyle: 'italic', textAlign: 'center' }}>{kickName} não poderá voltar para esta sala após ser expulso.</SERIF>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
            <Btn full fill color={T.sangue} onClick={confirmKick}>Expulsar da sala</Btn>
            <Btn full color={T.dim} onClick={() => setKickTarget(null)}>Cancelar</Btn>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <Noise />
      <div style={{ height: 4, background: T.ouro }} />

      <div style={{ padding: '12px 18px', borderBottom: `2px solid ${T.rule}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
          <div>
            <AB color={T.dim} size={8}>Código da sala</AB>
            <GEO size={28} color={T.text} style={{ letterSpacing: 8 }}>{roomCode}</GEO>
          </div>
          <AB color={T.ouro} size={10}>{players.length}/{config?.maxPlayers ?? 20}</AB>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn sm color={T.ouro} onClick={copyCode}>◈ Copiar Código</Btn>
        </div>
      </div>

      <div style={{ padding: '10px 18px', borderBottom: `1px solid ${T.rule}` }}>
        <Progress val={players.length} max={config?.maxPlayers ?? 20} color={T.ouro} label="Jogadores" showCount />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <AB color={T.dim} size={8} style={{ marginBottom: 6 }}>Na sala agora</AB>
        {players.map((p) => (
          <PlayerRow
            key={p.id}
            name={p.name}
            isHost={p.isHost}
            you={p.id === myPlayer?.id}
            alive
            onClick={isHost && !p.isHost ? () => handleKick(p.id, p.name) : undefined}
          />
        ))}
        {players.length < minPlayers && (
          <div style={{ minHeight: 44, display: 'flex', alignItems: 'center', paddingLeft: 12, borderLeft: `3px dashed ${T.dimLo}` }}>
            <AB color={T.dimLo} size={8}>+ aguardando... (mínimo {minPlayers})</AB>
          </div>
        )}
      </div>

      <div style={{ padding: '10px 18px 18px', borderTop: `1px solid ${T.rule}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {isHost && (
          <Accent color={T.ouro} pad={8}>
            <AB color={T.ouro} size={8}>Host — toque em um jogador para expulsá-lo</AB>
          </Accent>
        )}
        {isHost ? (
          <Btn full fill color={T.text} disabled={players.length < minPlayers} onClick={handleStart}>O beco está pronto</Btn>
        ) : (
          <Accent color={T.dimLo} pad={10}>
            <AB color={T.dimLo} size={8}>Aguardando o Host iniciar a partida...</AB>
          </Accent>
        )}
      </div>
    </div>
  )
}
