import { useState } from 'react'
import { useGameStore } from '../../store/gameStore.js'
import { Noise, AB, GEO, SERIF, Btn, Progress, T } from '../ui/index.js'

const ROLE_META: Record<string, { label: string; sym: string; color: string; team: string; desc: string }> = {
  civil:     { label: 'CIVIL',      sym: '◈', color: T.cinza,  team: 'CIDADÃOS', desc: 'Descubra e elimine os bandidos pelo voto. Você não tem poderes — só a sua voz.' },
  bandido:   { label: 'BANDIDO',    sym: '✕', color: T.sangue, team: 'BANDIDOS', desc: 'Elimine civis à noite. Blefe durante o dia. Sobreviva a qualquer custo.' },
  policia:   { label: 'POLÍCIA',    sym: '⊕', color: T.ouro,   team: 'CIDADÃOS', desc: 'Atire em um suspeito cada noite. Você pode errar — e pagar caro por isso.' },
  medico:    { label: 'MÉDICO',     sym: '⊞', color: T.verde,  team: 'CIDADÃOS', desc: 'Proteja uma vida por noite. Não repita a mesma pessoa.' },
  detetive:  { label: 'DETETIVE',   sym: '⊙', color: T.azul,   team: 'CIDADÃOS', desc: 'Investigue um suspeito. Recebe: Bandido ou Cidadão — nunca o papel exato.' },
  prostituta:{ label: 'PROSTITUTA', sym: '◉', color: T.roxo,   team: 'CIDADÃOS', desc: 'Bloqueie a ação de qualquer jogador. Ele não saberá que foi bloqueado.' },
}

export default function RoleReveal() {
  const { myRole, players, revealRole } = useGameStore()
  const [revealed, setRevealed] = useState(false)
  const confirmedCount = 3 // mock — would track via server event

  const m = myRole ? ROLE_META[myRole] : null

  function handleReveal() {
    setRevealed(true)
  }

  function handleConfirm() {
    revealRole()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#07070e', position: 'relative' }}>
      <Noise op={0.06} />
      <div style={{ height: 4, background: m?.color || T.dimLo }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', gap: 28 }}>
        {!revealed ? (
          <>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 100, height: 134, border: `3px solid ${T.ruleHi}`, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GEO size={40} color={T.dimLo}>✉</GEO>
              </div>
              <div style={{ position: 'absolute', bottom: -14, left: '50%', transform: 'translateX(-50%)', width: 28, height: 28, borderRadius: '50%', background: T.sangue, border: `3px solid #07070e`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GEO size={10} color={T.text}>◈</GEO>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: 900, fontSize: 26, color: T.text, textTransform: 'uppercase' }}>Seu papel chegou</div>
              <SERIF color={T.dim} size={11} style={{ fontStyle: 'italic', marginTop: 8 }}>Toque para revelar — só você verá</SERIF>
            </div>
            <Btn fill color={T.text} onClick={handleReveal}>Revelar meu papel</Btn>
          </>
        ) : m ? (
          <>
            <div style={{ width: 130, height: 174, border: `3px solid ${m.color}`, background: `${m.color}10`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', fontSize: 110, color: `${m.color}08`, fontFamily: 'monospace', lineHeight: 1, bottom: -8, right: -8 }}>{m.sym}</div>
              <GEO size={44} color={m.color}>{m.sym}</GEO>
              <div style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: 900, fontSize: 14, color: m.color, textTransform: 'uppercase', letterSpacing: 2 }}>{m.label}</div>
              <div style={{ width: '60%', height: 2, background: `${m.color}44` }} />
              <AB color={T.dim} size={7}>{m.team}</AB>
            </div>
            <div style={{ textAlign: 'center', maxWidth: 230 }}>
              <div style={{ display: 'inline-block', padding: '3px 10px', border: `1px solid ${m.color}`, marginBottom: 10 }}>
                <AB color={m.color} size={8}>Time: {m.team}</AB>
              </div>
              <SERIF color={T.dim} size={11} style={{ fontStyle: 'italic', lineHeight: 1.6 }}>{m.desc}</SERIF>
            </div>
            <Btn fill color={m.color} onClick={handleConfirm}>Entendido</Btn>
          </>
        ) : null}

        {/* waiting for others after confirm */}
        {revealed && !myRole && (
          <>
            <Progress val={confirmedCount} max={players.length} color={T.azul} label="Confirmaram" showCount />
            <AB color={T.dimLo} size={8} style={{ textAlign: 'center' }}>A partida inicia quando todos confirmarem</AB>
          </>
        )}
      </div>
    </div>
  )
}
