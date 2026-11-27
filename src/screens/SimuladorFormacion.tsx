import { useEffect, useState } from 'react'
import { EtiquetaPotencial } from '../components/EtiquetaPotencial'
import { NotaLegal } from '../components/NotaLegal'
import { PreguntasPlan } from '../components/PreguntasPlan'
import { CONFIG, type NivelId } from '../config/demo.config'
import { candidatasDe } from '../domain/formaciones'
import { dinero } from '../domain/format'
import { primerNombre, type Potencial } from '../domain/potencial'
import { etiquetaCampana, siglaDeNivel, simularPlan } from '../domain/simulador'
import { navegar, RUTAS } from '../state/router'
import { useDemo } from '../state/store'
import estrella from '../assets/figma/mi-carrera-sin/node-star-white.svg'
import trofeo from '../assets/figma/mi-carrera-sin/node-trophy.svg'

/** La candidata a la que la Directora simula. */
interface Caso {
  nombre: string
  nivel: NivelId
  nombreNivel: string
  potencial: Potencial
  rutaVolver: string
  /** Chat simulado en el que se comparte el plan. */
  chat: { id: string; ruta: string; con: string }
}

function useCaso(id: string): Caso | null {
  const { sigla, perfil } = useDemo()
  if (perfil.grupo !== 'directora') return null
  const c = candidatasDe(sigla).find((x) => x.id === id)
  if (!c) return null
  return {
    nombre: c.nombre,
    nivel: c.nivel,
    nombreNivel: c.nombreNivel,
    potencial: c.potencial,
    rutaVolver: RUTAS.formaciones,
    chat: { id: `candidata:${c.id}`, ruta: RUTAS.chatCandidata + c.id, con: primerNombre(c.nombre) },
  }
}

/**
 * Simulador de formación, para Directoras Junior en adelante: cuándo llegaría la candidata
 * a Directora y qué le toca a quien la acompaña en cada etapa.
 */
export function SimuladorFormacion({ id }: { id: string }) {
  const { dejarBorrador } = useDemo()
  const caso = useCaso(id)
  const [eleccion, setEleccion] = useState<{ ritmo: number; inicio: number } | null>(null)

  useEffect(() => {
    if (!caso) navegar(RUTAS.inicio, { reemplazar: true })
  }, [caso])
  if (!caso) return null

  const corto = primerNombre(caso.nombre)
  const sigla = siglaDeNivel(caso.nivel)

  if (!eleccion) {
    return (
      <PreguntasPlan
        sigla={sigla}
        encabezado={
          <div className="simulada">
            <div>
              <span>{caso.nombreNivel}</span>
              <b>{caso.nombre}</b>
            </div>
            <EtiquetaPotencial potencial={caso.potencial} />
          </div>
        }
        preguntaRitmo={`¿En cuántas campañas quieres formar a ${corto}?`}
        preguntaInicio="¿En qué campaña empiezan?"
        ayudaInicio={`Hoy estamos en la campaña C${CONFIG.campana.actual}. El semillero puede ser esta misma semana.`}
        textoFinal="Ver su plan"
        onSalir={() => navegar(caso.rutaVolver)}
        onListo={(ritmo, inicio) => setEleccion({ ritmo, inicio })}
      />
    )
  }

  const plan = simularPlan({ sigla, gananciaActual: null }, eleccion.ritmo, eleccion.inicio, null)
  const llegada = etiquetaCampana(plan.llegada)

  // El mensaje va a la candidata. Nunca menciona el bono.
  const compartir = () => {
    dejarBorrador({
      chat: caso.chat.id,
      texto: `Hola ${corto} 👋 Armé tu plan en el simulador: serías Directora en ${plan.campanas} campañas empezando en ${etiquetaCampana(plan.inicio)}. Mira tu camino y cuéntame qué te parece. Lo hacemos juntas: ${CONFIG.urls.linkMiCarrera}`,
    })
    navegar(caso.chat.ruta)
  }

  return (
    <div className="simulador">
      <div className="simulador__barra">
        <button className="regresar" onClick={() => navegar(caso.rutaVolver)}>
          <fry-icon name="chevron-left-outline" size="16" />
          Regresar
        </button>
      </div>

      <span className="simulador__etiqueta">El plan de {corto}</span>
      <h1 className="simulador__pregunta">
        {corto} sería Directora en {llegada}
      </h1>
      <p className="simulador__ayuda">
        Empezando en {etiquetaCampana(plan.inicio)}, su formación toma {plan.campanas} campañas con tu acompañamiento.
      </p>

      <ol className="plan">
        {plan.etapas.map((e) => {
          const esMeta = e.nivel.id === 'directora'
          const voces = CONFIG.simulador.acompanamiento[e.nivel.id]
          return (
            <li className={`plan__paso ${esMeta ? 'plan__paso--meta' : ''}`} key={e.nivel.id}>
              <span className="plan__punto">
                <img src={esMeta ? trofeo : estrella} alt="" />
              </span>
              <div>
                <b>{esMeta ? 'Se forma como Directora' : `Llega a ${e.nivel.nombre}`}</b>
                <p className="plan__cuando">
                  {e.campanas === 1
                    ? `${etiquetaCampana(e.desde)} · 1 campaña`
                    : `De ${etiquetaCampana(e.desde)} a ${etiquetaCampana(e.hasta)} · ${e.campanas} campañas`}
                </p>
                {voces && (
                  <>
                    <p className="plan__voz">
                      <b>Ella</b>
                      {voces.ella}
                    </p>
                    <p className="plan__voz plan__voz--tu">
                      <b>Tú</b>
                      {voces.tu}
                    </p>
                  </>
                )}
              </div>
            </li>
          )
        })}
        <li className="plan__llegada">
          <b>
            ¡{corto} es Directora desde {llegada}!
          </b>
          <p>
            Recibes tu bono de formación de <b>{dinero(CONFIG.bonoFormacion)}*</b> y ganas una nueva Directora hija.
          </p>
        </li>
      </ol>

      <p className="plan__nota">
        <b>Crecimiento paralelo:</b> cuando {corto} ascienda, sus activas salen de tu Grupo Personal. Planifica
        incorporar en paralelo para que tu grupo no baje.
      </p>

      <div className="simulador__acciones">
        <fry-button
          hierarchy="primary"
          full-width
          icon-left="whatsapp-outline"
          text={`Compartir este plan con ${caso.chat.con}`}
          onfryClick={compartir}
        />
        <fry-button hierarchy="secondary" full-width text="Cambiar campañas" onfryClick={() => setEleccion(null)} />
      </div>
      <NotaLegal tipo="bono" />
    </div>
  )
}
