import { CONFIG, type DatosPais, type Pais } from '../config/demo.config'

// País activo de la sesión. Lo fija el estado de la demo antes de dibujar cada pantalla,
// así todos los montos salen de una sola función.
let pais: Pais = CONFIG.paisPorDefecto

export function fijarPais(nuevo: Pais): void {
  pais = nuevo
}

export function paisActivo(): Pais {
  return pais
}

export function datosPais(): DatosPais {
  return CONFIG.paises[pais]
}

/** Lleva un monto del config (en soles) a la moneda del país activo. */
export function montoLocal(montoEnSoles: number): number {
  const { factor, montosAdaptados } = datosPais()
  if (factor === 1) return montoEnSoles
  const adaptado = montosAdaptados[montoEnSoles]
  if (adaptado !== undefined) return adaptado
  // Sin monto adaptado: se convierte y se redondea a una cifra "de catálogo" (a 5 o a 10).
  const paso = montoEnSoles * factor >= 1000 ? 10 : 5
  return Math.round((montoEnSoles * factor) / paso) * paso
}

/** Monto ya expresado en la moneda del país (p. ej. la meta que escribe la usuaria): "S/8,000", "$2.400". */
export function dineroLocal(monto: number): string {
  const { simbolo, separadorMiles } = datosPais()
  return simbolo + String(Math.round(monto)).replace(/\B(?=(\d{3})+(?!\d))/g, separadorMiles)
}

/** Monto del config (en soles) en la moneda del país: "S/21,200" en Perú, "$6.360" en Ecuador. */
export function dinero(montoEnSoles: number): string {
  return dineroLocal(montoLocal(montoEnSoles))
}

/** Reemplaza los montos entre llaves de un texto del config: "Ganamás ({470})" → "Ganamás (S/470)". */
export function conMontos(texto: string): string {
  return texto.replace(/\{(\d+)\}/g, (_, monto: string) => dinero(Number(monto)))
}

/** "luciana  " → "Luciana": sin espacios sobrantes y con la primera letra en mayúscula. */
export function normalizarNombre(texto: string): string {
  const limpio = texto.trim().replace(/\s+/g, ' ')
  return limpio.charAt(0).toUpperCase() + limpio.slice(1)
}

export function minusculaInicial(texto: string): string {
  return texto.charAt(0).toLowerCase() + texto.slice(1)
}

/** Hora al estilo de WhatsApp en español: "9:41 a. m." */
export function horaChat(fecha: Date): string {
  const h = fecha.getHours()
  const m = String(fecha.getMinutes()).padStart(2, '0')
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h < 12 ? 'a. m.' : 'p. m.'}`
}
