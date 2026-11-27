import { numeroCampana } from '../config/calendario'
import { CONFIG, type ConsultoraGrupo, type ParticipanteEligeCrecer, type Sigla } from '../config/demo.config'
import { dinero, dineroLocal, montoLocal, paisActivo } from './format'
import { primerNombre } from './potencial'

const EC = CONFIG.programas.eligeCrecer

/** Bono de un escalón de Elige Crecer, en la moneda del país. */
export function bonoEscalon(indice: number): string {
  return dineroLocal(EC.niveles[indice].bono[paisActivo()])
}

export interface AvanceEligeCrecer {
  /** Activas que ha crecido en total. */
  total: number
  /** Escalones ya logrados (0 a 3). */
  logrados: number
  /** Activas que faltan para el siguiente escalón; 0 si ya logró el máximo. */
  faltan: number
  /** Bono del siguiente escalón (o del último, si ya lo logró). */
  bonoObjetivo: string
  campanaActual: number
  campanaFinal: number
  /** Crecimiento por campaña, la más reciente primero. */
  porCampana: { campana: number; activas: number }[]
}

export function avance(datos: { campanaInicio: number; crecimiento: number[] }): AvanceEligeCrecer {
  const total = datos.crecimiento.reduce((a, n) => a + n, 0)
  const logrados = EC.niveles.filter((n) => total >= n.activas).length
  const siguiente = EC.niveles[Math.min(logrados, EC.niveles.length - 1)]
  return {
    total,
    logrados,
    faltan: Math.max(0, siguiente.activas - total),
    bonoObjetivo: bonoEscalon(Math.min(logrados, EC.niveles.length - 1)),
    campanaActual: datos.crecimiento.length,
    campanaFinal: numeroCampana(datos.campanaInicio + EC.campanas - 1),
    porCampana: datos.crecimiento.map((activas, i) => ({ campana: numeroCampana(datos.campanaInicio + i), activas })).reverse(),
  }
}

/* ---------- Vista de la Emprendedora (CNS, CEM, CEM Senior) ---------- */

/** Mensaje con su propio avance; null si aún no participa (Consultora). */
export function miResumen(sigla: Sigla): string | null {
  const mio = EC.miAvance[sigla]
  if (!mio) return null
  const a = avance(mio)
  if (a.faltan === 0) return `¡Lograste crecer en ${a.total} activas y ganar el bono de ${a.bonoObjetivo} del Elige Crecer!`
  return `Te falta crecer en ${a.faltan} ${a.faltan === 1 ? 'activa' : 'activas'} para ganar el bono de ${a.bonoObjetivo} del Elige Crecer.`
}

export type SituacionConsultora = 'sinPedido' | 'bajoNivel1' | 'enNivel1'

export interface ConsultoraEvaluada extends ConsultoraGrupo {
  nombreNivel: string
  situacion: SituacionConsultora
  /** Aviso de la card: qué hacer con ella esta campaña. */
  aviso: string
  /** Venta personal por campaña, la actual primero, con si alcanzó el Nivel 1. */
  filas: { campana: number; venta: number; nivel1: boolean }[]
}

export function consultorasDe(sigla: Sigla): ConsultoraEvaluada[] {
  const n1 = CONFIG.programas.nivel1Ganamas
  return EC.consultoras
    .filter((c) => c.soloPara.includes(sigla))
    .map((c) => {
      const actual = c.ventas[0]
      const situacion: SituacionConsultora = actual === undefined ? 'sinPedido' : actual >= n1 ? 'enNivel1' : 'bajoNivel1'
      // La diferencia se calcula ya en la moneda del país, para que cuadre con las filas.
      const falta = actual === undefined ? 0 : montoLocal(n1) - montoLocal(actual)
      const aviso =
        situacion === 'sinPedido'
          ? 'Motívala a pasar su primer pedido esta campaña.'
          : situacion === 'bajoNivel1'
            ? `Le faltan ${dineroLocal(falta)} para alcanzar Nivel 1 de Ganamás esta campaña.`
            : 'Ya está en Nivel 1 de Ganamás: anímala a repetirlo la próxima campaña.'
      return {
        ...c,
        nombreNivel: CONFIG.niveles.find((n) => n.id === c.nivel)?.nombre ?? '',
        situacion,
        aviso,
        filas: c.ventas.map((venta, i) => ({ campana: numeroCampana(CONFIG.campana.actual - i), venta, nivel1: venta >= n1 })),
      }
    })
}

export function mensajeAConsultora(c: ConsultoraEvaluada, remitente: string): string {
  const nombre = primerNombre(c.nombre)
  const cuerpo =
    c.situacion === 'sinPedido'
      ? '¿Cómo vas con tu primer pedido? Te acompaño a armarlo esta campaña.'
      : c.situacion === 'bajoNivel1'
        ? `Vi en Maya que te falta muy poco para llegar a Nivel 1 de Ganamás esta campaña (${dinero(CONFIG.programas.nivel1Ganamas)}). ¿Te ayudo a completar tu pedido?`
        : '¡Felicitaciones por llegar a Nivel 1 de Ganamás esta campaña! ¿Vemos juntas cómo repetirlo la próxima?'
  return `Hola ${nombre} 👋 ${cuerpo} Dime cuándo conversamos.\n\n${remitente}`
}

/* ---------- Vista de la Directora (Junior y Senior) ---------- */

export type EstadoParticipante = 'cumplio' | 'enCurso' | 'enRiesgo'

export const ETIQUETA_ESTADO: Record<EstadoParticipante, string> = {
  cumplio: 'Cumplió',
  enCurso: 'En curso',
  enRiesgo: 'En riesgo',
}

export interface ParticipanteEvaluada extends ParticipanteEligeCrecer {
  nombreNivel: string
  avance: AvanceEligeCrecer
  estado: EstadoParticipante
  resumen: string
}

/**
 * Cumplió: logró el escalón más alto. En riesgo: no creció en la campaña actual.
 * En curso: sigue creciendo.
 */
export function participantes(): ParticipanteEvaluada[] {
  return EC.participantes.map((p) => {
    const a = avance(p)
    const estado: EstadoParticipante =
      a.faltan === 0 ? 'cumplio' : p.crecimiento[p.crecimiento.length - 1] > 0 ? 'enCurso' : 'enRiesgo'
    const resumen =
      estado === 'cumplio'
        ? `Logró crecer en ${a.total} activas y ganar el bono de ${a.bonoObjetivo} del Elige Crecer. ¡Felicítala!`
        : `Le ${a.faltan === 1 ? 'falta 1 activa' : `faltan ${a.faltan} activas`} para ganar el bono de ${a.bonoObjetivo} en Campaña ${a.campanaFinal}.`
    return { ...p, nombreNivel: CONFIG.niveles.find((n) => n.id === p.nivel)?.nombre ?? '', avance: a, estado, resumen }
  })
}

export function mensajeAParticipante(p: ParticipanteEvaluada, remitente: string): string {
  const nombre = primerNombre(p.nombre)
  const cuerpo =
    p.estado === 'cumplio'
      ? `¡Felicitaciones! Lograste crecer en ${p.avance.total} activas y ganar el bono de ${p.avance.bonoObjetivo} del Elige Crecer. 🎉 ¿Celebramos y vemos tu siguiente paso?`
      : `Vi en Maya tu avance en Elige Crecer: te ${p.avance.faltan === 1 ? 'falta 1 activa' : `faltan ${p.avance.faltan} activas`} para ganar el bono de ${p.avance.bonoObjetivo}. ¿Vemos juntas cómo lograrlo antes de que cierre la Campaña ${p.avance.campanaFinal}?`
  return `Hola ${nombre} 👋 ${cuerpo}\n\n${remitente}, tu Directora`
}
