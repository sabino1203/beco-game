import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../../store/gameStore.js'
import { Noise, AB, GEO, SERIF, Btn, PlayerRow, T } from '../ui/index.js'

export default function GameOver() {
  const nav = useNavigate()
  const { winner, allRoles, gameStats, myPlayer, reset } = useGameStore()
  const color = winner === 'cidadaos' ? T.verde : T.sangue
  const win = winner === 'cidadaos'

  function playAgain() {
    reset()
    nav('/lobby')
  }

  function goHome() {
    reset()
    localStorage.removeItem('beco_session_token')
    localStorage.removeItem('beco_room_code')
    nav('/')
  }

  const durationMin = gameStats ? Math.round(gameStats.duration / 60000) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', background: win ? '#030a03' : '#0a0303' }}>
      <Noise op={0.06} />
      <div style={{ height: 6, background: color }} />

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ borderBottom: `2px solid ${T.rule}`, paddingBottom: 16 }}>
          <AB color={color} size={9} style={{ marginBottom: 6 }}>
            {win ? '◈ Cidadãos Vencem' : '✕ Bandidos Vencem'}
          </AB>
          <div style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: 900, fontSize: win ? 48 : 44, color, lineHeight: 0.88, textTransform: 'uppercase', whiteSpace: 'pre-line' }}>
            {win ? 'BECO\nLIMPO' : 'BECO\nTOMADO'}
          </div>
          <div style={{ marginTop: 8, width: 48, height: 4, background: color }} />
          <SERIF color={T.dimLo} size={11} style={{ fontStyle: 'italic', marginTop: 10 }}>
            {win ? 'Todos os bandidos foram expulsos do beco.' : 'Os bandidos tomaram o controle do beco.'}
          </SERIF>
        </div>

        <div style={{ display: 'flex', gap: 2 }}>
          {[
            { label: 'Rodadas', val: String(gameStats?.rounds ?? '—') },
            { label: 'Duração', val: `${durationMin}m` },
            { label: 'Jogadores', val: String(allRoles?.length ?? '—') },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: '10px 4px', border: `1px solid ${T.rule}`, textAlign: 'center' }}>
              <GEO size={20} color={T.text}>{s.val}</GEO>
              <AB color={T.dimLo} size={7} style={{ marginTop: 3 }}>{s.label}</AB>
            </div>
          ))}
        </div>

        <div>
          <AB color={T.dim} size={8} style={{ marginBottom: 8 }}>Papéis revelados</AB>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {(allRoles ?? []).map((p) => (
              <PlayerRow key={p.id} name={p.name} role={p.role} showRole you={p.id === myPlayer?.id} alive={p.role !== 'bandido'} />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Btn full fill color={color} onClick={playAgain}>Jogar Novamente — mesma sala</Btn>
          <Btn full color={T.dim} onClick={() => nav('/create')}>Nova Configuração</Btn>
          <Btn full color={T.dimLo} onClick={goHome}>Sair</Btn>
        </div>
      </div>
    </div>
  )
}
