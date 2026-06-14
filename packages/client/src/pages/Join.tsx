import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { socket } from '../lib/socket.js'
import { Noise, AB, Btn, Toast, T } from '../components/ui/index.js'

export default function Join() {
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  function handleJoin() {
    setError('')
    socket.emit('room:join', { name: name.trim(), roomCode: code.toUpperCase().trim() })

    socket.once('room:joined', ({ sessionToken, playerId, view }: any) => {
      localStorage.setItem('beco_session_token', sessionToken)
      localStorage.setItem('beco_room_code', view.roomCode)
      localStorage.setItem('beco_player_id', playerId)
      nav('/lobby')
    })

    socket.once('error', ({ message, code: errCode }: any) => {
      if (errCode === 'ROOM_IN_GAME') setError('Esta sala está em jogo. Aguarde a próxima partida.')
      else setError(message)
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <Noise />
      <div style={{ height: 4, background: T.azul }} />
      <div style={{ padding: '10px 18px', borderBottom: `1px solid ${T.rule}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => nav('/')} style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: 18, fontFamily: 'monospace', minWidth: 32, minHeight: 32 }}>←</button>
        <AB color={T.text} size={11}>Entrar no Beco</AB>
      </div>

      <div style={{ flex: 1, padding: '28px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <AB color={T.dim} size={8}>Seu nome</AB>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            placeholder="Como te chamam?"
            style={{ minHeight: 48, padding: '0 14px', border: `2px solid ${name ? T.ruleHi : T.rule}`, background: 'transparent', fontSize: 13, color: T.text, fontFamily: 'Georgia,serif', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <AB color={T.dim} size={8}>Código da sala</AB>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
            maxLength={6}
            placeholder="6 dígitos"
            style={{ minHeight: 48, padding: '0 14px', border: `2px solid ${code.length === 6 ? T.ruleHi : T.rule}`, background: 'transparent', fontSize: 22, color: T.text, fontFamily: "'Courier New',monospace", letterSpacing: 8, textAlign: 'center', outline: 'none' }}
          />
          <AB color={T.dimLo} size={7}>{code.length}/6 caracteres</AB>
        </div>

        {error && <Toast msg={error} color={error.includes('jogo') ? T.ouro : T.sangue} />}

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Btn full fill color={T.text} disabled={!name.trim() || code.length !== 6} onClick={handleJoin}>Entrar no Beco</Btn>
          <AB color={T.dimLo} size={7} style={{ textAlign: 'center' }}>Sessão criada automaticamente</AB>
        </div>
      </div>
    </div>
  )
}
