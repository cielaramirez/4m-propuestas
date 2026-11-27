import { useState, type ReactNode } from 'react'
import { CONFIG, type Sigla } from '../config/demo.config'
import { etiquetaCampana, ritmosDe } from '../domain/simulador'
import type { Sonido } from '../domain/sonido'

interface Props {
  /** Estatus desde el que parte el plan: define los ritmos que se ofrecen. */
  sigla: Sigla
  preguntaRitmo: string
  preguntaInicio: string
  ayudaInicio: string
  textoFinal: string
  /** Bloque opcional sobre la primera pregunta (p. ej. el resumen de la candidata). */
  encabezado?: ReactNode
  /** Sonidos de acompañamiento (solo los usa el simulador de carrera). */
  sonar?: (sonido: Sonido) => void
  onSalir: () => void
  onListo: (ritmo: number, inicio: number) => void
}

/**
 * Las dos preguntas de los simuladores, una por pantalla y con opciones grandes:
 * en cuántas campañas y desde cuándo. Pensado para usuarias poco digitales: nada que escribir.
 */
export function PreguntasPlan(props: Props) {
  const [paso, setPaso] = useState<1 | 2>(1)
  const [ritmo, setRitmo] = useState<number | null>(null)
  const [inicio, setInicio] = useState<number | null>(null)

  const { actual } = CONFIG.campana
  const opciones =
    paso === 1
      ? ritmosDe(props.sigla).map((r) => ({ valor: r, grande: String(r), titulo: 'campañas', detalle: '' }))
      : CONFIG.simulador.inicios.map((titulo, i) => {
          const [campana, anio] = etiquetaCampana(actual + i).split(' ')
          return { valor: actual + i, grande: campana, titulo, detalle: anio }
        })
  const elegido = paso === 1 ? ritmo : inicio

  return (
    <div className="simulador">
      <div className="simulador__barra">
        <button className="regresar" onClick={() => (paso === 1 ? props.onSalir() : setPaso(1))}>
          <fry-icon name="chevron-left-outline" size="16" />
          {paso === 1 ? 'Regresar' : 'Atrás'}
        </button>
        <span>Paso {paso} de 2</span>
      </div>

      {paso === 1 && props.encabezado}
      <h1 className="simulador__pregunta">{paso === 1 ? props.preguntaRitmo : props.preguntaInicio}</h1>
      <p className="simulador__ayuda">
        {paso === 1
          ? `Una campaña dura 4 semanas. ${CONFIG.simulador.campanasPorAnio} campañas son un año.`
          : props.ayudaInicio}
      </p>

      <div className="simulador__opciones" role="radiogroup" aria-label={paso === 1 ? 'Campañas' : 'Campaña de inicio'}>
        {opciones.map((o) => (
          <button
            key={o.valor}
            role="radio"
            aria-checked={elegido === o.valor}
            className={`opcion ${elegido === o.valor ? 'opcion--elegida' : ''}`}
            onClick={() => {
              props.sonar?.('toque')
              if (paso === 1) setRitmo(o.valor)
              else setInicio(o.valor)
            }}
          >
            <span className="opcion__grande">{o.grande}</span>
            <span className="opcion__texto">
              <b>{o.titulo}</b>
              {o.detalle && <span>{o.detalle}</span>}
            </span>
            <span className="opcion__marca" aria-hidden="true" />
          </button>
        ))}
      </div>

      <div className="simulador__pie">
        {paso === 1 ? (
          <fry-button hierarchy="primary" full-width text="Continuar" disabled={ritmo === null} onfryClick={() => {
              props.sonar?.('avance')
              setPaso(2)
            }}
          />
        ) : (
          <fry-button
            hierarchy="primary"
            full-width
            text={props.textoFinal}
            disabled={inicio === null}
            onfryClick={() => ritmo !== null && inicio !== null && props.onListo(ritmo, inicio)}
          />
        )}
      </div>
    </div>
  )
}
