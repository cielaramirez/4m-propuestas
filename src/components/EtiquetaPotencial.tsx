import { ETIQUETA_POTENCIAL, type Potencial } from '../domain/potencial'

/** Etiqueta de potencial (alto verde, medio ámbar, bajo rojo, sin potencial gris). */
export function EtiquetaPotencial({ potencial }: { potencial: Potencial }) {
  return <span className={`potencial potencial--${potencial}`}>{ETIQUETA_POTENCIAL[potencial]}</span>
}
