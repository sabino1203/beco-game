import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { socket } from '../lib/socket.js'
import { Noise, AB, GEO, Btn, Toggle, T, Rule } from '../components/ui/index.js'

const ROLE_META: Record<string, { sym: string; color: string; label: string }> = {
  policia: { sym: '⊕', color: T.ouro, label: 'POLÍCIA' },
  medico: { sym: '⊞', color: T.verde, label: 'MÉDICO' },
  detetive: { sym: '⊙', color: T.azul, label: 'DETETIVE' },
  prostituta: { sym: '◉', color: T.roxo, label: 'PROSTITUTA' },
}

export default function Create() {
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [players, setPlayers] = useState(8)
  const [bandidos, setBandidos] = useState(2)
  const [roles, setRoles] = useState({ policia: true, medico: true, detetive: true, prostituta: false })
  const [debateMin, setDebateMin] = useState(3)
  const [error, setError] = useState('')

  const specials = Object.values(roles).filter(Boolean).length
  const civis = players - bandidos - specials
  const invalid = bandidos >= (players - bandidos) || civis < 1 || !name.trim()

  function handleCreate() {
    setError('')
    socket.emit('room:create', {
      hostName: name.trim(),
      config: {
        maxPlayers: players,
        debateTimerSeconds: debateMin * 60,
        voteTimerSeconds: 60,
        roles: { bandidos, policia: roles.policia, medico: roles.medico, detetive: roles.detetive, prostituta: roles.prostituta },
      },
    })

    socket.once('room:created', ({ roomCode, sessionToken, playerId }: any) => {
      localStorage.setItem('beco_session_token', sessionToken)
      localStorage.setItem('beco_room_code', roomCode)
      localStorage.setItem('beco_player_id', playerId)
      nav('/lobby')
    })

    socket.once('error', ({ message }: any) => setError(message))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <Noise />
      <div style={{ height: 4, background: T.ouro }} />
      <div style={{ padding: '10px 18px', borderBottom: `1px solid ${T.rule}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => nav('/')} style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: 18, fontFamily: 'monospace', minWidth: 32, minHeight: 32 }}>←</button>
        <AB color={T.text} size={11}>Abrir um Beco</AB>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* nome */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <AB color={T.dim} size={8}>Seu nome</AB>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            placeholder="Como te chamam?"
            style={{ minHeight: 48, padding: '0 14px', border: `2px solid ${name ? T.ruleHi : T.rule}`, background: 'transparent', fontSize: 13, color: T.text, fontFamily: 'Georgia,serif', outline: 'none', letterSpacing: 0.3 }}
          />
        </div>
        <Rule />
        <AB color={T.ouro} size={9}>Configuração da Partida</AB>

        {/* nº jogadores */}
        <div>
          <AB color={T.dim} size={8} style={{ marginBottom: 8 }}>Nº de Jogadores</AB>
          <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {[5, 6, 7, 8, 9, 10, 12, 15, 20].map((n) => (
              <div key={n} onClick={() => setPlayers(n)} style={{ width: 36, height: 36, border: `2px solid ${n === players ? T.text : T.rule}`, background: n === players ? 'rgba(255,255,255,0.08)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <GEO size={11} color={n === players ? T.text : T.dim}>{n}</GEO>
              </div>
            ))}
          </div>
        </div>

        {/* bandidos */}
        <div>
          <AB color={T.dim} size={8} style={{ marginBottom: 8 }}>Bandidos</AB>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setBandidos(Math.max(1, bandidos - 1))} style={{ width: 36, height: 36, border: `2px solid ${T.rule}`, background: 'transparent', color: T.text, fontSize: 18, cursor: 'pointer' }}>−</button>
            <GEO size={32} color={T.sangue} style={{ minWidth: 40, textAlign: 'center' }}>{String(bandidos).padStart(2, '0')}</GEO>
            <button onClick={() => setBandidos(Math.min(Math.floor(players / 4), bandidos + 1))} style={{ width: 36, height: 36, border: `2px solid ${T.rule}`, background: 'transparent', color: T.text, fontSize: 18, cursor: 'pointer' }}>+</button>
          </div>
        </div>

        {/* papéis */}
        <div>
          <AB color={T.dim} size={8} style={{ marginBottom: 8 }}>Papéis Especiais</AB>
          {(['policia', 'medico', 'detetive', 'prostituta'] as const).map((r) => {
            const m = ROLE_META[r]
            return (
              <div key={r} onClick={() => setRoles((p) => ({ ...p, [r]: !p[r] }))} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 48, paddingRight: 12, borderLeft: `3px solid ${roles[r] ? m.color : T.dimLo}`, background: roles[r] ? 'rgba(255,255,255,0.03)' : 'transparent', cursor: 'pointer', marginBottom: 2 }}>
                <div style={{ width: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GEO size={16} color={m.color}>{m.sym}</GEO>
                </div>
                <AB color={roles[r] ? T.text : T.dim} size={9} style={{ flex: 1 }}>{m.label}</AB>
                <Toggle on={roles[r]} color={m.color} />
              </div>
            )
          })}
        </div>

        {/* preview */}
        <div style={{ border: `2px solid ${invalid ? T.sangue : T.verde}`, padding: '12px 14px' }}>
          <AB color={invalid ? T.sangue : T.verde} size={8} style={{ marginBottom: 8 }}>{invalid ? '⚠ Configuração inválida' : '◈ Distribuição'}</AB>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              { label: `${bandidos} Bandido${bandidos > 1 ? 's' : ''}`, color: T.sangue },
              ...(roles.policia ? [{ label: '1 Polícia', color: T.ouro }] : []),
              ...(roles.medico ? [{ label: '1 Médico', color: T.verde }] : []),
              ...(roles.detetive ? [{ label: '1 Detetive', color: T.azul }] : []),
              ...(roles.prostituta ? [{ label: '1 Prostituta', color: T.roxo }] : []),
              { label: `${Math.max(0, civis)} Civil${civis !== 1 ? 's' : ''}`, color: T.cinza },
            ].map((it, i) => (
              <div key={i} style={{ padding: '3px 8px', border: `1px solid ${it.color}44`, background: `${it.color}11` }}>
                <AB color={it.color} size={8}>{it.label}</AB>
              </div>
            ))}
          </div>
          {invalid && !name.trim() && <AB color={T.sangue} size={8} style={{ marginTop: 8 }}>Coloque seu nome</AB>}
          {invalid && name.trim() && <AB color={T.sangue} size={8} style={{ marginTop: 8 }}>Bandidos não podem ser maioria</AB>}
        </div>

        {/* debate timer */}
        <div>
          <AB color={T.dim} size={8} style={{ marginBottom: 8 }}>Tempo de Debate</AB>
          <div style={{ display: 'flex', gap: 2 }}>
            {[1, 2, 3, 5, 7, 10].map((n) => (
              <div key={n} onClick={() => setDebateMin(n)} style={{ flex: 1, height: 36, border: `2px solid ${n === debateMin ? T.ouro : T.rule}`, background: n === debateMin ? 'rgba(200,140,10,0.1)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <AB color={n === debateMin ? T.ouro : T.dim} size={8}>{n}m</AB>
              </div>
            ))}
          </div>
        </div>

        {error && <AB color={T.sangue} size={9}>{error}</AB>}
      </div>

      <div style={{ padding: '12px 18px 20px', borderTop: `1px solid ${T.rule}` }}>
        <Btn full fill color={T.text} disabled={invalid} onClick={handleCreate}>Abrir o Beco</Btn>
      </div>
    </div>
  )
}
