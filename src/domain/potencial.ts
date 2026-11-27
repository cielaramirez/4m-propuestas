import { CONFIG, type Intencion, type Metricas } from '../config/demo.config'

/**
 * Reglas compartidas por las Partes B y C: potencial e intención.
 * Todo se calcula de los datos y de los umbrales del config.
 */
export type Potencial = 'alto' | 'medio' | 'bajo' | 'sin'

export const ORDEN_POTENCIAL: Potencial[] = ['alto', 'medio', 'bajo', 'sin']

export const ETIQUETA_POTENCIAL: Record<Potencial, string> = {
  alto: 'Potencial alto',
  medio: 'Potencial medio',
  bajo: 'Potencial bajo',
  sin: 'Sin potencial',
}

/** Orden de prioridad para decir qué le falta a quien no cumple. */
const PRIORIDAD_FALTANTE: (keyof Metricas)[] = ['pped', 'activas', 'ventaGP']

export function cumpleVariable(m: Metricas, variable: keyof Metricas): boolean {
  return m[variable] >= CONFIG.umbrales[variable]
}

/** Cumple cuando alcanza los tres umbrales: Venta GP, Activas y PPED. */
export function cumple(m: Metricas): boolean {
  return PRIORIDAD_FALTANTE.every((v) => cumpleVariable(m, v))
}

export function potencial(m: Metricas, intencion: Intencion): Potencial {
  const quiere = intencion === 'quiere'
  if (cumple(m)) return quiere ? 'alto' : 'medio'
  return quiere ? 'bajo' : 'sin'
}

/** Primera variable que no cumple, por prioridad (PPED → Activas → Venta GP). */
export function primerFaltante(m: Metricas): keyof Metricas | null {
  return PRIORIDAD_FALTANTE.find((v) => !cumpleVariable(m, v)) ?? null
}

export const TEXTO_INTENCION: Record<Intencion, string> = {
  quiere: 'Intención: 🧡 Quiere ser Directora',
  aunNoDecide: 'Intención: Aún no decide',
  noRegistro: 'Intención: No registró',
}

export function primerNombre(nombreCompleto: string): string {
  return nombreCompleto.trim().split(/\s+/)[0]
}

