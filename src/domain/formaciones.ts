import { CONFIG, type Candidata, type Sigla } from '../config/demo.config'
import { ORDEN_POTENCIAL, potencial, primerFaltante, primerNombre, type Potencial } from './potencial'

export type FiltroFormaciones = 'listas' | 'interes' | 'cumplen'

export interface CandidataEvaluada extends Candidata {
  potencial: Potencial
  nombreNivel: string
  /** Sueño tal como lo registró; null si no quiere o no registró. */
  suenoRegistrado: string | null
}

/** Candidatas del perfil, con su potencial calculado. En esta vista no aparecen las "Sin potencial". */
export function candidatasDe(sigla: Sigla): CandidataEvaluada[] {
  return CONFIG.candidatas
    .filter((c) => !c.soloPara || c.soloPara.includes(sigla))
    .map((c) => ({
      ...c,
      potencial: potencial(c, c.intencion),
      nombreNivel: CONFIG.niveles.find((n) => n.id === c.nivel)?.nombre ?? '',
      suenoRegistrado: c.intencion === 'quiere' ? (c.sueno ?? null) : null,
    }))
    .filter((c) => c.potencial !== 'sin')
    .sort(
      (a, b) =>
        ORDEN_POTENCIAL.indexOf(a.potencial) - ORDEN_POTENCIAL.indexOf(b.potencial) || b.ventaGP - a.ventaGP,
    )
}

export const FILTROS: { id: FiltroFormaciones; etiqueta: string; incluye: Potencial[] }[] = [
  { id: 'listas', etiqueta: 'Listas para formar', incluye: ['alto'] },
  { id: 'interes', etiqueta: 'Tienen interés', incluye: ['alto', 'bajo'] },
  { id: 'cumplen', etiqueta: 'Cumplen requisitos', incluye: ['medio'] },
]

export function filtrar(candidatas: CandidataEvaluada[], filtro: FiltroFormaciones): CandidataEvaluada[] {
  const incluye = FILTROS.find((f) => f.id === filtro)?.incluye ?? []
  return candidatas.filter((c) => incluye.includes(c.potencial))
}

/** Hasta 3 candidatas de potencial alto, por Venta GP de mayor a menor. */
export function mejoresCandidatas(candidatas: CandidataEvaluada[]): CandidataEvaluada[] {
  return candidatas
    .filter((c) => c.potencial === 'alto')
    .sort((a, b) => b.ventaGP - a.ventaGP)
    .slice(0, 3)
}

function suenoEnSegundaPersona(sueno: string | null): string {
  if (!sueno) return ''
  return CONFIG.suenos.segundaPersona[sueno] ?? sueno.charAt(0).toLowerCase() + sueno.slice(1)
}

/** Mensaje precargado del chat con la candidata. Nunca menciona el bono de formación. */
export function mensajeACandidata(candidata: CandidataEvaluada, directora: string): string {
  const nombre = primerNombre(candidata.nombre)
  const sueno = suenoEnSegundaPersona(candidata.suenoRegistrado)
  const firma = `${directora}, tu Directora`

  switch (candidata.potencial) {
    case 'alto':
      return [
        `Hola ${nombre} 👋 Vi en Maya que quieres ser Directora y que tu sueño es ${sueno}. ¡Me encanta!`,
        'Además ya cumples lo necesario para empezar tu formación 🙌',
        'Quiero acompañarte. ¿Nos reunimos esta semana para armar tu plan paso a paso? Dime qué día y hora te queda mejor.',
        firma,
      ].join('\n\n')
    case 'medio':
      return [
        `Hola ${nombre} 👋 Estuve viendo tus resultados en Maya y vas muy bien: ya cumples lo necesario para empezar tu camino a Directora.`,
        `¿Te gustaría? Entra a Mi carrera en Maya y cuéntame tu sueño: ${CONFIG.urls.linkMiCarrera}`,
        'Yo te acompaño en cada paso.',
        firma,
      ].join('\n\n')
    default: {
      const faltante = primerFaltante(candidata)
      const loQueFalta = faltante ? CONFIG.faltantes[faltante].mensaje : ''
      return [
        `Hola ${nombre} 👋 Vi en Maya que quieres crecer y que tu sueño es ${sueno}. ¡Vamos por eso!`,
        `Para dar el siguiente paso te falta ${loQueFalta}. ¿Conversamos esta semana y vemos cómo lograrlo juntas?`,
        firma,
      ].join('\n\n')
    }
  }
}

/** Aviso de la card según el potencial (franja ámbar); null si no lleva. */
export function avisoDeCandidata(candidata: CandidataEvaluada): string | null {
  if (candidata.potencial === 'medio') return 'Cumple los números: invítala a registrar su intención y su sueño.'
  if (candidata.potencial === 'bajo') {
    const faltante = primerFaltante(candidata)
    return faltante ? CONFIG.faltantes[faltante].aviso : null
  }
  return null
}
