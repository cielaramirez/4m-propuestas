import { useState } from 'react'
import { NotaLegal } from '../components/NotaLegal'
import { PreguntasPlan } from '../components/PreguntasPlan'
import { CONFIG } from '../config/demo.config'
import { indiceNivel } from '../domain/carrera'
import { dinero, dineroLocal } from '../domain/format'
import { etiquetaCampana, simularPlan } from '../domain/simulador'
import { navegar, RUTAS } from '../state/router'
import { useDemo } from '../state/store'
import { HojaNivel } from './carrera/HojaNivel'
import estrella from '../assets/figma/mi-carrera-sin/node-star-white.svg'
import check from '../assets/figma/mi-carrera-sin/node-check-white.svg'
import trofeo from '../assets/figma/mi-carrera-sin/node-trophy.svg'
import trofeoSueno from '../assets/figma/mi-carrera-sin/award.png'

/**
 * Simulador de carrera para Emprendedoras (CNS, CEM, CEM Senior).
 * Pensado para usuarias poco digitales: una pregunta por pantalla, opciones grandes,
 * nada que escribir y sin volver a pedir lo que Maya ya sabe (nivel y sueño).
 */
export function Simulador() {
  const { sigla, perfil, mio, sonar } = useDemo()
  const [eleccion, setEleccion] = useState<{ ritmo: number; inicio: number } | null>(null)
  const [nivelAbierto, setNivelAbierto] = useState<number | null>(null)

  const nivelActual = CONFIG.niveles[indiceNivel(perfil)]
  const sueno = mio.sueno
  const hablarConDirectora = () => {
    sonar('toque')
    navegar(RUTAS.chatDirectora)
  }

  if (!eleccion) {
    return (
      <PreguntasPlan
        sigla={sigla}
        preguntaRitmo="¿En cuántas campañas quieres llegar a Directora?"
        preguntaInicio="¿Cuándo quieres empezar?"
        ayudaInicio={`Hoy estamos en la campaña C${CONFIG.campana.actual}. Empezar ahora cuenta.`}
        textoFinal="Ver mi plan"
        sonar={sonar}
        onSalir={() => navegar(RUTAS.miCarrera)}
        onListo={(ritmo, inicio) => {
          // Ver el plan armado es el logro del simulador: se celebra.
          sonar('logro')
          setEleccion({ ritmo, inicio })
        }}
      />
    )
  }

  const plan = simularPlan(perfil, eleccion.ritmo, eleccion.inicio, sueno?.monto ?? null)

  return (
    <div className="simulador">
      <div className="simulador__barra">
        <button className="regresar" onClick={() => navegar(RUTAS.miCarrera)}>
          <fry-icon name="chevron-left-outline" size="16" />
          Regresar
        </button>
      </div>

      <span className="simulador__etiqueta">Tu plan</span>
      <h1 className="simulador__pregunta">Serías Directora en {etiquetaCampana(plan.llegada)}</h1>
      <p className="simulador__ayuda">
        Empiezas en {etiquetaCampana(plan.inicio)} y llegas en {plan.campanas} campañas, paso a paso.
      </p>

      <ol className="plan">
        <li className="plan__paso plan__paso--hoy">
          <span className="plan__punto">
            <img src={check} alt="" />
          </span>
          <div>
            <b>Hoy · {nivelActual.nombre}</b>
            {perfil.gananciaActual !== null && <p>Tu ganancia estimada: {dinero(perfil.gananciaActual)} por campaña</p>}
          </div>
        </li>
        {plan.etapas.map((e) => {
          const esMeta = e.nivel.id === 'directora'
          return (
            <li className={`plan__paso ${esMeta ? 'plan__paso--meta' : ''}`} key={e.nivel.id}>
              <span className="plan__punto">
                <img src={esMeta ? trofeo : estrella} alt="" />
              </span>
              <div>
                <b>{esMeta ? 'Fórmate y sé Directora' : `Llega a ${e.nivel.nombre}`}</b>
                <p className="plan__cuando">
                  {e.campanas === 1
                    ? `${etiquetaCampana(e.desde)} · 1 campaña`
                    : `De ${etiquetaCampana(e.desde)} a ${etiquetaCampana(e.hasta)} · ${e.campanas} campañas`}
                </p>
                <p>Mientras tanto ganarías {dinero(e.ganancia)} por campaña*</p>
                <button className="plan__enlace" onClick={() => {
                    sonar('abrir')
                    setNivelAbierto(e.indiceNivel)
                  }}>
                  Ver qué necesitas
                </button>
              </div>
            </li>
          )
        })}
        <li className="plan__llegada">
          <b>¡Directora desde {etiquetaCampana(plan.llegada)}!</b>
          <p>
            Ganarías <b>desde {dinero(CONFIG.gananciaDirectora)} por campaña*</b>
          </p>
        </li>
      </ol>

      {sueno && (
        <div className="plan__sueno">
          <img src={trofeoSueno} alt="" />
          <div>
            <b>Tu sueño: {sueno.texto}</b>
            {sueno.monto !== null && plan.campanaMeta !== null && (
              <p>
                Con este plan juntarías tu meta de {dineroLocal(sueno.monto)} en <b>{etiquetaCampana(plan.campanaMeta)}</b>
                {plan.campanaMeta < plan.llegada ? ', antes de ser Directora.' : ', ya como Directora.'}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="simulador__acciones">
        <p>No vas sola: arma este plan con tu Directora.</p>
        <fry-button hierarchy="primary" full-width icon-left="whatsapp-outline" text="Habla con tu Directora" onfryClick={hablarConDirectora} />
        <fry-button hierarchy="secondary" full-width text="Cambiar mi plan" onfryClick={() => setEleccion(null)} />
      </div>
      <NotaLegal tipo="simulador" />

      {nivelAbierto !== null && (
        <HojaNivel
          indice={nivelAbierto}
          onCambiar={setNivelAbierto}
          onCerrar={() => setNivelAbierto(null)}
          onHablar={hablarConDirectora}
        />
      )}
    </div>
  )
}
