import { useNavigate } from 'react-router-dom'
import { Noise, AB, GEO, SERIF, Btn, T } from '../components/ui/index.js'

const ROLE_META = [
  { sym: '◈', color: T.cinza, label: 'CIVIL' },
  { sym: '✕', color: T.sangue, label: 'BANDIDO' },
  { sym: '⊕', color: T.ouro, label: 'POLÍCIA' },
  { sym: '⊞', color: T.verde, label: 'MÉDICO' },
  { sym: '⊙', color: T.azul, label: 'DETETIVE' },
  { sym: '◉', color: T.roxo, label: 'PROSTITUTA' },
]

export default function Landing() {
  const nav = useNavigate()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <Noise />
      <div style={{ height: 4, background: T.sangue }} />
      <div style={{ padding: '10px 18px', borderBottom: `1px solid ${T.rule}`, display: 'flex', justifyContent: 'space-between' }}>
        <AB color={T.dimLo} size={7}>Versão Clássica BR · Online</AB>
        <AB color={T.dimLo} size={7}>5–20 Jogadores</AB>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 18px 20px', gap: 0 }}>
        <AB color={T.sangue} size={9} style={{ marginBottom: 8 }}>◈ — Jogo Social de Traição</AB>
        <div style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: 900, fontSize: 80, color: T.text, lineHeight: 0.85, textTransform: 'uppercase', marginBottom: 12 }}>BECO</div>
        <div style={{ width: 48, height: 4, background: T.sangue, marginBottom: 18 }} />

        <div style={{ borderLeft: `3px solid ${T.dimLo}`, paddingLeft: 14, marginBottom: 24 }}>
          <SERIF color={T.dim} size={12} style={{ fontStyle: 'italic' }}>
            "Ninguém sai do mesmo jeito que entrou."
          </SERIF>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, marginBottom: 28 }}>
          {ROLE_META.map((v) => (
            <div key={v.label} style={{ padding: '12px 8px', textAlign: 'center', border: `1px solid ${T.rule}`, background: 'rgba(255,255,255,0.02)' }}>
              <GEO size={20} color={v.color}>{v.sym}</GEO>
              <AB color={v.color} size={7} style={{ marginTop: 5 }}>{v.label}</AB>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
          <Btn full fill color={T.text} onClick={() => nav('/join')}>Entrar no Beco</Btn>
          <Btn full color={T.dim} onClick={() => nav('/create')}>Abrir um Beco</Btn>
        </div>
        <AB color={T.dimXlo} size={7} style={{ textAlign: 'center', marginTop: 14 }}>Sem cadastro · Sem instalação</AB>
      </div>
      <div style={{ height: 2, background: T.rule }} />
    </div>
  )
}
