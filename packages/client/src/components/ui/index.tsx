import { type CSSProperties, type ReactNode } from 'react'

// ─── Design tokens ────────────────────────────────────────────────────────────
export const T = {
  ink: '#09090c', surface: '#111116', card: '#16161c', raised: '#1c1c24',
  rule: '#252530', ruleHi: '#38383e',
  text: '#e8e6f0', dim: '#72708a', dimLo: '#35334a', dimXlo: '#1e1d28',
  sangue: '#c41e1e', ouro: '#c88c0a', verde: '#1a6b3a',
  azul: '#1a3f7a', roxo: '#5a1a7a', cinza: '#4a5060',
}

const NOISE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`

// ─── Primitives ───────────────────────────────────────────────────────────────
export function Noise({ op = 0.038 }: { op?: number }) {
  return <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: NOISE, backgroundSize: '200px', opacity: op, zIndex: 5, mixBlendMode: 'overlay' }} />
}

export function AB({ children, color, size = 10, style }: { children: ReactNode; color?: string; size?: number; style?: CSSProperties }) {
  return <div style={{ fontFamily: "'Arial Black','Impact',sans-serif", fontWeight: 900, fontSize: size, letterSpacing: 2.5, textTransform: 'uppercase', color: color || T.dim, lineHeight: 1, ...style }}>{children}</div>
}

export function GEO({ children, color, size = 13, style }: { children: ReactNode; color?: string; size?: number; style?: CSSProperties }) {
  return <span style={{ fontFamily: "'Courier New',monospace", fontSize: size, color: color || T.text, letterSpacing: 1, ...style }}>{children}</span>
}

export function SERIF({ children, color, size = 12, style }: { children: ReactNode; color?: string; size?: number; style?: CSSProperties }) {
  return <div style={{ fontFamily: 'Georgia,serif', fontSize: size, color: color || T.dim, lineHeight: 1.6, ...style }}>{children}</div>
}

export function Rule({ color, thick }: { color?: string; thick?: boolean }) {
  return <div style={{ height: thick ? 2 : 1, background: color || T.rule, flexShrink: 0 }} />
}

export function Accent({ color, children, pad = 12, bg }: { color?: string; children: ReactNode; pad?: number; bg?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', background: bg || 'transparent' }}>
      <div style={{ width: 3, background: color || T.rule, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: `${pad}px 14px` }}>{children}</div>
    </div>
  )
}

export function PhaseHead({ label, color, sym, right }: { label: string; color?: string; sym: string; right?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', borderBottom: `2px solid ${color || T.rule}`, background: `${color || T.rule}10` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 3, height: 16, background: color || T.rule }} />
        <AB color={color || T.dim} size={10}>{sym} {label}</AB>
      </div>
      {right}
    </div>
  )
}

export function Btn({
  children, color, fill, full, sm, onClick, disabled, danger, style,
}: {
  children: ReactNode; color?: string; fill?: boolean; full?: boolean; sm?: boolean;
  onClick?: () => void; disabled?: boolean; danger?: boolean; style?: CSSProperties
}) {
  const c = danger ? T.sangue : (color || T.text)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: full ? '100%' : 'auto',
        minHeight: sm ? 36 : 48,
        padding: sm ? '0 14px' : '0 22px',
        borderRadius: 0,
        border: `2px solid ${disabled ? T.dimLo : c}`,
        background: disabled ? 'transparent' : (fill ? c : 'transparent'),
        color: disabled ? T.dimLo : (fill ? T.ink : c),
        fontSize: sm ? 10 : 12,
        fontFamily: "'Arial Black',sans-serif",
        fontWeight: 900,
        letterSpacing: 2,
        textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        flexShrink: 0, ...style,
      }}
    >{children}</button>
  )
}

export function Inp({ label, placeholder, val, mono, center, error, note }: {
  label?: string; placeholder?: string; val?: string; mono?: boolean; center?: boolean; error?: string; note?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <AB color={T.dim} size={8}>{label}</AB>}
      <div style={{
        minHeight: 48, padding: '0 14px', display: 'flex', alignItems: 'center',
        border: `2px solid ${error ? T.sangue : (val ? T.ruleHi : T.rule)}`,
        background: 'transparent',
        fontSize: mono ? 22 : 13,
        color: val ? T.text : T.dimLo,
        fontFamily: mono ? "'Courier New',monospace" : 'Georgia,serif',
        letterSpacing: mono ? 8 : 0.3,
        justifyContent: center ? 'center' : 'flex-start',
      }}>{val || placeholder}</div>
      {error && <AB color={T.sangue} size={8}>{error}</AB>}
      {note && !error && <AB color={T.dimLo} size={7}>{note}</AB>}
    </div>
  )
}

export function Toggle({ on, color }: { on: boolean; color?: string }) {
  return (
    <div style={{ width: 40, height: 22, border: `2px solid ${on ? color : T.dimLo}`, position: 'relative', flexShrink: 0, cursor: 'pointer' }}>
      <div style={{ position: 'absolute', width: 14, height: 14, background: on ? color : T.dimLo, top: 2, [on ? 'right' : 'left']: 2 }} />
    </div>
  )
}

export function PlayerRow({ name, alive = true, isHost, role, showRole, votes, you, onClick }: {
  name: string; alive?: boolean; isHost?: boolean; role?: string; showRole?: boolean;
  votes?: number; you?: boolean; onClick?: () => void
}) {
  const ROLE_META: Record<string, { sym: string; color: string; label: string }> = {
    civil: { sym: '◈', color: T.cinza, label: 'CIVIL' },
    bandido: { sym: '✕', color: T.sangue, label: 'BANDIDO' },
    policia: { sym: '⊕', color: T.ouro, label: 'POLÍCIA' },
    medico: { sym: '⊞', color: T.verde, label: 'MÉDICO' },
    detetive: { sym: '⊙', color: T.azul, label: 'DETETIVE' },
    prostituta: { sym: '◉', color: T.roxo, label: 'PROSTITUTA' },
  }
  const m = role ? ROLE_META[role] : null
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 48, paddingRight: 12, borderLeft: `3px solid ${alive ? (m?.color || T.rule) : T.dimLo}`, background: alive ? 'rgba(255,255,255,0.03)' : 'transparent', opacity: alive ? 1 : 0.35, cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ width: 34, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <GEO size={16} color={m?.color || T.dim}>{alive ? (m?.sym || '◈') : '✕'}</GEO>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <GEO size={12} color={alive ? T.text : T.dim} style={{ textDecoration: alive ? 'none' : 'line-through' }}>{name}{you ? ' (você)' : ''}</GEO>
          {isHost && <AB color={T.ouro} size={7}>Host</AB>}
          {showRole && m && <AB color={m.color} size={7}>{m.label}</AB>}
        </div>
      </div>
      {votes != null && votes > 0 && (
        <div style={{ display: 'flex', gap: 3 }}>
          {Array.from({ length: votes }).map((_, i) => (
            <div key={i} style={{ width: 7, height: 7, background: T.sangue }} />
          ))}
        </div>
      )}
    </div>
  )
}

export function Targets({ items, selected, onSelect, color }: {
  items: Array<{ id: string; name: string }>; selected?: string; onSelect?: (id: string) => void; color?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {items.map((t) => (
        <div key={t.id} onClick={() => onSelect?.(t.id)} style={{
          minHeight: 48, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
          borderLeft: `3px solid ${selected === t.id ? (color || T.text) : T.rule}`,
          background: selected === t.id ? `${color || T.text}14` : 'rgba(255,255,255,0.02)',
        }}>
          <div style={{ width: 20, height: 20, border: `2px solid ${selected === t.id ? (color || T.text) : T.dimLo}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {selected === t.id && <div style={{ width: 8, height: 8, background: color || T.text }} />}
          </div>
          <GEO size={12} color={selected === t.id ? (color || T.text) : T.dim}>{t.name}</GEO>
        </div>
      ))}
    </div>
  )
}

export function Bubble({ name, msg, own, system }: { name?: string; msg: string; own?: boolean; system?: boolean }) {
  if (system) return (
    <div style={{ textAlign: 'center', padding: '6px 0' }}>
      <AB color={T.dimLo} size={8} style={{ display: 'inline-block', padding: '4px 10px', border: `1px solid ${T.dimXlo}` }}>{msg}</AB>
    </div>
  )
  return (
    <div style={{ display: 'flex', flexDirection: own ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
      <div style={{ maxWidth: '78%' }}>
        {!own && <AB color={T.dimLo} size={7} style={{ marginBottom: 3, marginLeft: 3 }}>{name}</AB>}
        <div style={{ padding: '10px 12px', border: `1px solid ${own ? T.ruleHi : T.rule}`, background: own ? 'rgba(255,255,255,0.07)' : 'transparent', borderLeft: own ? undefined : `3px solid ${T.rule}` }}>
          <SERIF size={11} color={T.text} style={{ lineHeight: 1.5 }}>{msg}</SERIF>
        </div>
      </div>
    </div>
  )
}

export function TimerPill({ sec, color, urgent }: { sec: number; color?: string; urgent?: boolean }) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = (sec % 60).toString().padStart(2, '0')
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: `2px solid ${urgent ? T.sangue : (color || T.rule)}`, background: urgent ? `${T.sangue}18` : 'transparent' }}>
      <AB size={8} color={urgent ? T.sangue : (color || T.dim)}>⏱</AB>
      <GEO size={16} color={urgent ? T.sangue : (color || T.text)}>{m}:{s}</GEO>
    </div>
  )
}

export function Progress({ val, max, color, label, showCount }: { val: number; max: number; color?: string; label?: string; showCount?: boolean }) {
  const pct = Math.min((val / max) * 100, 100)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {(label || showCount) && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {label && <AB size={8} color={T.dim}>{label}</AB>}
          {showCount && <AB size={8} color={color || T.text}>{val}/{max}</AB>}
        </div>
      )}
      <div style={{ height: 5, background: T.dimXlo, position: 'relative' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color || T.text, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}

export function DawnEventRow({ sym, text, color, faded }: { sym: string; text: string; color?: string; faded?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderLeft: `4px solid ${faded ? T.dimLo : (color || T.rule)}`, background: `${color || T.dim}0a`, opacity: faded ? 0.35 : 1 }}>
      <GEO size={15} color={faded ? T.dimLo : (color || T.dim)}>{sym}</GEO>
      <SERIF size={12} color={faded ? T.dimLo : T.text}>{text}</SERIF>
    </div>
  )
}

export function Toast({ msg, color }: { msg: string; color?: string }) {
  return (
    <div style={{ padding: '10px 14px', background: `${color || T.ouro}18`, border: `2px solid ${color || T.ouro}`, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 4, height: 4, background: color || T.ouro, flexShrink: 0 }} />
      <AB size={9} color={color || T.ouro}>{msg}</AB>
    </div>
  )
}
