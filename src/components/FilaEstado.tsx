import type { ReactNode } from 'react'

/** Fila con check verde o X roja, según el dato comparado con su umbral. */
export function FilaEstado({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <li className={`fila-estado ${ok ? 'fila-estado--ok' : 'fila-estado--no'}`}>
      <fry-icon name={ok ? 'check-circle-filled' : 'close-circle-filled'} size="16" />
      <span>{children}</span>
      <span className="solo-lector">{ok ? '(cumple)' : '(no cumple)'}</span>
    </li>
  )
}
