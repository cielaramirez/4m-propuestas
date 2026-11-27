import { CONFIG } from '../config/demo.config'

/** Nota al pie de toda pantalla que muestre una cifra con asterisco. */
export function NotaLegal({ tipo, className }: { tipo: keyof typeof CONFIG.legales; className?: string }) {
  return <p className={`legal ${className ?? ''}`}>{CONFIG.legales[tipo]}</p>
}
