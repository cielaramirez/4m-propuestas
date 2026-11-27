import { useState } from 'react'
import { CONFIG } from '../../config/demo.config'
import { dinero } from '../../domain/format'
import { navegar, RUTAS } from '../../state/router'
import { useDemo } from '../../state/store'
import caja from '../../assets/figma/home/ql-box.png'
import reporte from '../../assets/figma/home/ql-report.png'
import estadisticas from '../../assets/figma/home/ql-statistics.png'
import incorporar from '../../assets/figma/home/ql-incorporate.png'
import cursos from '../../assets/figma/home/ql-graduate.png'
import chevron from '../../assets/figma/home/chevron-right.svg'
import deuda from '../../assets/figma/home/ind-deuda.png'
import credito from '../../assets/figma/home/ind-credito.png'
import sueno from '../../assets/figma/lid/ind-sueno.png'
import bolsaDinero from '../../assets/figma/lid/ind-money-04.png'
import liderPoderosa from '../../assets/figma/lid/ind-lider-poderosa.png'
import check from '../../assets/figma/lid/ind-check.png'
import primerosPedidos from '../../assets/figma/lid/ind-primeros-pedidos.png'
import morosidad from '../../assets/figma/lid/ind-statistics-02.png'
import cuadrante from '../../assets/figma/lid/ind-statistics-03.png'

const ICONOS: Record<string, string> = { sueno, dinero: bolsaDinero, liderPoderosa, check, primerosPedidos, morosidad, deuda, cuadrante, credito }

const ACCESOS = [
  { etiqueta: 'Realizar pedido', icono: caja },
  { etiqueta: 'Reportes', icono: reporte, espejo: true },
  { etiqueta: 'Elige crecer', icono: estadisticas },
  { etiqueta: 'Incorporar', icono: incorporar },
  { etiqueta: 'Mis cursos', icono: cursos },
]

const PESTANAS = ['Mis Directoras', 'Grupo Personal'] as const

/** Home de la Líder (REG): sin barra inferior; entra a Emprendedoras desde "Con Aspirante". */
export function HomeLider() {
  const { sesion, avisar, elegirFiltroEmprendedoras } = useDemo()
  const [pestana, setPestana] = useState<(typeof PESTANAS)[number]>('Mis Directoras')
  const fueraDeAlcance = () => avisar('Fuera del alcance de esta demo')

  const verEmprendedoras = () => {
    elegirFiltroEmprendedoras(null)
    navegar(RUTAS.emprendedoras)
  }

  return (
    <>
      <section className="saludo">
        <p className="saludo__actualizado">{CONFIG.campana.actualizado}</p>
        <div className="saludo__fila">
          <div>
            <h1 className="t-titulo">¡Hola, {sesion?.nombre}!</h1>
            <p className="saludo__pregunta">¿Qué vas a hacer hoy?</p>
          </div>
          <fry-chip type="action-icon" size="small" icon="calendar-outline" label={CONFIG.campana.etiqueta} />
        </div>
      </section>

      <ul className="accesos">
        {ACCESOS.map((a) => (
          <li className="acceso" key={a.etiqueta}>
            <img src={a.icono} alt="" className={a.espejo ? 'acceso__icono--espejo' : ''} />
            {a.etiqueta}
          </li>
        ))}
      </ul>

      <section className="campana">
        <h2 className="campana__titulo">Mi Campaña</h2>
        <ul className="campana__tarjetas">
          {CONFIG.lideres.campana.map((i) => (
            <li className="indicador indicador--lider" key={i.etiqueta}>
              <span className="indicador__cabecera">
                <span className={`indicador__icono indicador__icono--${i.icono}`}>
                  <img src={ICONOS[i.icono]} alt="" />
                </span>
                <img className="indicador__chevron" src={chevron} alt="" />
              </span>
              <span className="indicador__etiqueta">{i.etiqueta}</span>
              <b className="indicador__valor">{typeof i.valor === 'number' && i.moneda ? dinero(i.valor) : i.valor}</b>
            </li>
          ))}
        </ul>
      </section>

      <div className="formaciones__pestanas lider__pestanas" role="tablist">
        {PESTANAS.map((p) => (
          <button
            key={p}
            role="tab"
            aria-selected={p === pestana}
            className={`formaciones__pestana ${p === pestana ? 'formaciones__pestana--activa' : ''}`}
            onClick={() => (p === 'Mis Directoras' ? setPestana(p) : fueraDeAlcance())}
          >
            {p}
          </button>
        ))}
      </div>

      <ul className="accesos-lider">
        {CONFIG.lideres.accesos.map((a) => (
          <li key={a.etiqueta}>
            <button className="acceso-lider" onClick={a.abreEmprendedoras ? verEmprendedoras : fueraDeAlcance}>
              <span className="acceso-lider__contador">{a.contador}</span>
              <span className="acceso-lider__etiqueta">{a.etiqueta}</span>
              <fry-icon name="chevron-right-outline" size="16" />
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
