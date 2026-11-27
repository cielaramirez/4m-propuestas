/**
 * Calendario de campañas Yanbal (ver CALENDARIO.md del calendario oficial):
 * 13 campañas por año, de 4 semanas (28 días) cada una, de sábado a viernes.
 * Solo se guarda el inicio de C01 de cada año; el resto sale por aritmética.
 * La C13 llega hasta la víspera del C01 siguiente (puede tener 5 semanas).
 */
const ANCLAS_C01: Record<number, [anio: number, mes: number, dia: number]> = {
  2024: [2023, 12, 30],
  2025: [2025, 1, 4],
  2026: [2026, 1, 3],
  2027: [2027, 1, 2],
}
const DIA = 86_400_000
const ANIOS = Object.keys(ANCLAS_C01).map(Number).sort((a, b) => a - b)
const ULTIMO = ANIOS[ANIOS.length - 1]

/** Inicio de C01 en días (UTC). Sin ancla publicada se asume un año de 13 campañas de 28 días. */
function inicioC01(anio: number): number {
  const ancla = ANCLAS_C01[Math.min(anio, ULTIMO)] ?? ANCLAS_C01[ANIOS[0]]
  const dias = Date.UTC(ancla[0], ancla[1] - 1, ancla[2]) / DIA
  return dias + Math.max(0, anio - ULTIMO) * 364
}

export interface CampanaDelDia {
  /** Año campañal (la C13 cruza el Año Nuevo). */
  anio: number
  campana: number
  semana: number
}

export function campanaDe(fecha: Date): CampanaDelDia {
  const hoy = Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()) / DIA
  let anio = Math.max(ANIOS[0], fecha.getFullYear() + 1)
  while (anio > ANIOS[0] && inicioC01(anio) > hoy) anio--
  const dias = Math.max(0, hoy - inicioC01(anio))
  const campana = Math.min(13, Math.floor(dias / 28) + 1)
  const semana = Math.floor((dias - (campana - 1) * 28) / 7) + 1
  return { anio, campana, semana }
}

/** Lleva un número de campaña fuera de rango (0, -1, 14…) a 1–13, cruzando de año. */
export function numeroCampana(n: number): number {
  return ((((n - 1) % 13) + 13) % 13) + 1
}
