import type { Tono } from '../../config/mi-grupo.data'

/** Intents del Tag de FrYDA (variante Business). "reactivated" queda reservado a la consultora que vuelve. */
export type IntentTag = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'reactivated'

const NIVEL_LARGO: Record<string, string> = {
  CNS: 'Consultora',
  CEM: 'Consultora Emprendedora',
  CES: 'Consultora Emprendedora Senior',
  ASP: 'Aspirante',
  JNR: 'Directora Junior',
  SNR: 'Directora Senior',
  SSE: 'Directora Senior Estrella',
}

export function iniciales(nombre: string): string {
  const p = nombre.split(' ')
  return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase()
}

/**
 * Avatar FrYDA, formato xs (40 px) sobre superficie sutil. FrYDA dibuja una ilustración por nivel;
 * mientras la demo no tenga esas ilustraciones, muestra las iniciales. El nombre accesible lleva
 * nombre y nivel, como pide el componente.
 */
export function Avatar({ nombre, nivel }: { nombre: string; nivel: string }) {
  return (
    <span className="avatar-fry" role="img" aria-label={`${nombre}, ${NIVEL_LARGO[nivel] ?? nivel}`}>
      <span aria-hidden>{iniciales(nombre)}</span>
    </span>
  )
}

/** Tag FrYDA, variante Business: estático, una sola línea, máximo 25 caracteres. */
export function Tag({ intent, children }: { intent: IntentTag; children: string }) {
  return <span className={`tag-fry tag-fry--${intent}`}>{children}</span>
}

/**
 * Progress bar Business de FrYDA (16 px, píldora). El componente no dibuja texto: el porcentaje
 * lo pone la pantalla. Success solo al llegar al 100 %; error para metas fallidas o vencidas.
 */
export function BarraNegocio({ valor, feedback = 'default' }: { valor: number; feedback?: 'default' | 'success' | 'error' }) {
  return (
    <span className={`barra-fry barra-fry--${feedback}`} aria-hidden>
      <span className="barra-fry__relleno" style={{ width: `${Math.max(0, Math.min(100, valor))}%` }} />
    </span>
  )
}

/** Semáforo: punto de color con texto para lectores de pantalla. */
export function Semaforo({ tono, texto }: { tono: Tono; texto?: string }) {
  return (
    <span className={`semaforo semaforo--${tono}`} role={texto ? 'img' : undefined} aria-label={texto} aria-hidden={!texto} />
  )
}

/** Anillo de avance (0–100) con la meta marcada si la hay; colores del Progress bar de FrYDA. */
export function Anillo({ pct, meta, etiqueta }: { pct: number; meta?: number; etiqueta: string }) {
  const r = 44
  const c = 2 * Math.PI * r
  const angulo = ((meta ?? 0) / 100) * 360 - 90
  const mx = 52 + r * Math.cos((angulo * Math.PI) / 180)
  const my = 52 + r * Math.sin((angulo * Math.PI) / 180)
  return (
    <div className="anillo" role="img" aria-label={meta === undefined ? `${pct}% ${etiqueta}` : `${pct}% ${etiqueta}, meta ${meta}%`}>
      <svg width="104" height="104" viewBox="0 0 104 104" aria-hidden>
        <circle cx="52" cy="52" r={r} fill="none" stroke="var(--fry-barra-fondo)" strokeWidth="10" />
        <circle
          cx="52"
          cy="52"
          r={r}
          fill="none"
          stroke={meta !== undefined && pct >= meta ? 'var(--fry-barra-exito)' : 'var(--fry-barra-avance)'}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(Math.min(pct, 100) / 100) * c} ${c}`}
          transform="rotate(-90 52 52)"
        />
        {meta !== undefined && <circle cx={mx} cy={my} r="4" fill="var(--c-texto)" />}
      </svg>
      <span className="anillo__valor">
        <b>{pct}%</b>
        <span>{etiqueta}</span>
      </span>
    </div>
  )
}
