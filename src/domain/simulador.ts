import { CONFIG, type Nivel, type NivelId, type Sigla } from '../config/demo.config'
import { montoLocal } from './format'

/** Campaña absoluta (C1 del año actual = 1) → "C4" este año, "C4 (2027)" si cruza de año. */
export function etiquetaCampana(absoluta: number): string {
  const { anioActual, campanasPorAnio } = CONFIG.simulador
  const anio = anioActual + Math.floor((absoluta - 1) / campanasPorAnio)
  const c = ((absoluta - 1) % campanasPorAnio) + 1
  return `C${c}${anio > anioActual ? ` (${anio})` : ''}`
}

/** Ritmos disponibles para el perfil: campañas totales hasta Directora, de menor a mayor. */
export function ritmosDe(sigla: Sigla): number[] {
  return Object.keys(CONFIG.simulador.planes[sigla] ?? {})
    .map(Number)
    .sort((a, b) => a - b)
}

export interface EtapaPlan {
  /** Nivel al que se llega al terminar la etapa. */
  nivel: Nivel
  indiceNivel: number
  desde: number
  hasta: number
  campanas: number
  /** Ganancia estimada por campaña mientras recorre la etapa. */
  ganancia: number
}

export interface Plan {
  inicio: number
  /** Primera campaña ya como Directora. */
  llegada: number
  campanas: number
  etapas: EtapaPlan[]
  /** Campaña en la que la ganancia acumulada alcanza la meta del sueño; null si no hay meta. */
  campanaMeta: number | null
}

/**
 * Arma el plan hasta Directora. En la primera etapa gana lo que gana hoy; en las
 * siguientes, la ganancia referencial del nivel que ya alcanzó.
 */
export function simularPlan(
  perfil: { sigla: Sigla; gananciaActual: number | null },
  ritmo: number,
  inicio: number,
  meta: number | null,
): Plan {
  const reparto = CONFIG.simulador.planes[perfil.sigla]?.[ritmo] ?? {}
  const etapas: EtapaPlan[] = []
  let cursor = inicio
  let acumulado = 0
  let campanaMeta: number | null = null
  // La meta del sueño está en la moneda del país, así que se acumula en esa moneda.
  let ganancia = perfil.gananciaActual ?? 0

  CONFIG.niveles.forEach((nivel, indiceNivel) => {
    const campanas = reparto[nivel.id] ?? 0
    if (!campanas) return
    etapas.push({ nivel, indiceNivel, desde: cursor, hasta: cursor + campanas - 1, campanas, ganancia })
    for (let i = 0; i < campanas; i++) {
      acumulado += montoLocal(ganancia)
      if (campanaMeta === null && meta !== null && acumulado >= meta) campanaMeta = cursor + i
    }
    cursor += campanas
    ganancia = nivel.gananciaReferencial ?? ganancia
  })

  // Si la meta no se alcanza antes, se sigue sumando ya como Directora.
  if (campanaMeta === null && meta !== null && meta > acumulado) {
    campanaMeta = cursor + Math.ceil((meta - acumulado) / montoLocal(CONFIG.gananciaDirectora)) - 1
  }

  return { inicio, llegada: cursor, campanas: cursor - inicio, etapas, campanaMeta }
}

/** Estatus desde el que parte el plan de una candidata o emprendedora, según su nivel. */
export function siglaDeNivel(nivel: NivelId): Sigla {
  return nivel === 'consultora' ? 'CNS' : nivel === 'cem' ? 'CEM' : 'CES'
}
