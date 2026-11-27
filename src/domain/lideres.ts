import { CONFIG, type DirectoraHija, type Emprendedora, type NivelId, type RegistroCampana } from '../config/demo.config'
import { ORDEN_POTENCIAL, potencial, primerNombre, type Potencial } from './potencial'
import { siglaDeNivel } from './simulador'

export interface EmprendedoraEvaluada extends Emprendedora {
  /** Campaña actual: lo que muestra la card y la primera columna de "Ver crecimiento". */
  actual: RegistroCampana
  potencial: Potencial
  /** La Líder ve los estatus por su sigla (CNS, CEM, CES). */
  sigla: string
}

export interface DirectoraEvaluada extends Omit<DirectoraHija, 'emprendedoras'> {
  emprendedoras: EmprendedoraEvaluada[]
  /** Aviso calculado: "Tiene n CES y m formación pactada en su plan de negocio." */
  aviso: string
}

/** Sigla del estatus con el que califica (la Líder los ve abreviados). */
export function siglaNivel(id: NivelId): string {
  return siglaDeNivel(id)
}

function evaluar(e: Emprendedora): EmprendedoraEvaluada {
  const actual = e.historial[0]
  return { ...e, actual, potencial: potencial(actual, e.intencion), sigla: siglaNivel(actual.califica) }
}

function contar(d: { emprendedoras: EmprendedoraEvaluada[] }, p: Potencial): number {
  return d.emprendedoras.filter((e) => e.potencial === p).length
}

/** Directoras hijas con sus emprendedoras evaluadas; primero las que tienen más de potencial alto. */
export function directorasHijas(): DirectoraEvaluada[] {
  return CONFIG.lideres.directoras
    .map((d) => {
      const emprendedoras = d.emprendedoras
        .map(evaluar)
        .sort(
          (a, b) =>
            ORDEN_POTENCIAL.indexOf(a.potencial) - ORDEN_POTENCIAL.indexOf(b.potencial) ||
            b.actual.ventaGP - a.actual.ventaGP,
        )
      const cemSenior = emprendedoras.filter((e) => e.actual.califica === 'cemSenior').length
      const pactadas = d.formacionesPactadas
      return {
        ...d,
        emprendedoras,
        aviso: `Tiene ${cemSenior} CES y ${pactadas} ${pactadas === 1 ? 'formación pactada' : 'formaciones pactadas'} en su plan de negocio.`,
      }
    })
    .sort((a, b) => contar(b, 'alto') - contar(a, 'alto'))
}

function enumerar(nombres: string[]): string {
  if (nombres.length <= 1) return nombres.join('')
  return `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`
}

/** Mensaje de la Líder a su Directora hija. Sin firma y sin mencionar el bono. */
export function mensajeADirectoraHija(directora: DirectoraEvaluada): string {
  const saludo = `Hola ${primerNombre(directora.nombre)} 🧡 Estuve revisando tu grupo en Maya`
  const altas = directora.emprendedoras.filter((e) => e.potencial === 'alto')
  const medias = directora.emprendedoras.filter((e) => e.potencial === 'medio')
  const cierre = 'Si quieres, simulamos juntas su crecimiento y armamos el plan. Dime cuándo te queda bien.'

  if (altas.length === 1) {
    return [
      `${saludo} y tienes una gran oportunidad: ${altas[0].nombre} ya registró que quiere ser Directora y tiene potencial alto.`,
      'Es justo la formación que pactaste en tu plan. ¿Ya conversaste con ella? Sería bueno que le agendes su semillero esta semana, antes de que se enfríe.',
      cierre,
      CONFIG.urls.linkSimulacion,
    ].join('\n\n')
  }
  if (altas.length > 1) {
    return [
      `${saludo} y tienes una gran oportunidad: ${altas.length} de tus emprendedoras ya registraron que quieren ser Directoras y tienen potencial alto: ${enumerar(altas.map((e) => e.nombre))}.`,
      'Con ellas puedes cumplir la formación que pactaste en tu plan. ¿Ya conversaste con ellas? Sería bueno que les agendes su semillero esta semana, antes de que se enfríe.',
      cierre,
      CONFIG.urls.linkSimulacion,
    ].join('\n\n')
  }
  if (medias.length === 1) {
    return [
      `${saludo}: ${medias[0].nombre} ya cumple los números para empezar su camino a Directora, pero aún no registra su intención.`,
      '¿La invitas a entrar a Mi carrera y contarte su sueño? Puede ser tu próxima formación. Si quieres, lo vemos juntas.',
    ].join('\n\n')
  }
  if (medias.length > 1) {
    return [
      `${saludo}: ${enumerar(medias.map((e) => e.nombre))} ya cumplen los números para empezar su camino a Directora, pero aún no registran su intención.`,
      '¿Las invitas a entrar a Mi carrera y contarte su sueño? Puede ser tu próxima formación. Si quieres, lo vemos juntas.',
    ].join('\n\n')
  }
  return `${saludo}. ¿Vemos juntas esta semana cómo ayudar a tus emprendedoras a dar el siguiente paso? Dime cuándo te queda bien.`
}
