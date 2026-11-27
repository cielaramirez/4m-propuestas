import { CONFIG } from '../../config/demo.config'
import { DIRECTORAS_BDM, TEXTO_PODEROSA } from '../../config/directorio-bdm.data'
import { navegar, RUTAS } from '../../state/router'
import { useDemo } from '../../state/store'
import { Tag, type IntentTag } from '../mis-grupos/comun'

const INTENT_CUADRANTE: Record<string, IntentTag> = { A: 'success', B: 'info', C: 'warning', D: 'danger' }

/** Vuelve a la alternativa desde la que se entró (A en Mis Grupos o B en Programas). */
function volver() {
  if (window.history.length > 1) window.history.back()
  else navegar(RUTAS.misGrupos)
}

function directoraDe(codigo: string) {
  return DIRECTORAS_BDM.find((d) => d.codigo === codigo)
}

function Bandera() {
  const { sesion } = useDemo()
  return sesion?.pais === 'EC' ? (
    <svg className="impostacion__bandera" viewBox="0 0 24 24" aria-hidden>
      <clipPath id="bandera-c">
        <circle cx="12" cy="12" r="12" />
      </clipPath>
      <g clipPath="url(#bandera-c)">
        <rect width="24" height="12" fill="#ffd100" />
        <rect y="12" width="24" height="6" fill="#0033a0" />
        <rect y="18" width="24" height="6" fill="#ce1126" />
      </g>
    </svg>
  ) : (
    <svg className="impostacion__bandera" viewBox="0 0 24 24" aria-hidden>
      <clipPath id="bandera-p">
        <circle cx="12" cy="12" r="12" />
      </clipPath>
      <g clipPath="url(#bandera-p)">
        <rect width="24" height="24" fill="#fff" />
        <rect width="8" height="24" fill="#d91023" />
        <rect x="16" width="8" height="24" fill="#d91023" />
      </g>
    </svg>
  )
}

/** Barra de impostación (patrón "Impostacion" de FrYDA): la BDM ve Maya como la directora. */
export function BarraImpostacion({ codigo }: { codigo: string }) {
  const d = directoraDe(codigo)
  if (!d) return null
  return (
    <div className="impostacion" role="region" aria-label="Impostación">
      <Bandera />
      <p className="impostacion__texto">
        <span>Estás ingresado como</span>
        <b>
          {d.estatus} | {d.nombre} | Cód. {d.codigo}
        </b>
      </p>
      <fry-button-icon
        hierarchy="secondary"
        size="small"
        icon="arrow-right-outline"
        accessible-label="Salir y volver al listado"
        onfryClick={volver}
      />
    </div>
  )
}

/** Vista de lectura simulada: en el producto aquí se abre el Inicio completo de la directora. */
export function Impostacion({ codigo }: { codigo: string }) {
  const d = directoraDe(codigo)
  if (!d) {
    return (
      <div className="vacio">
        <h1>Directora no encontrada</h1>
      </div>
    )
  }
  return (
    <div className="impostacion-vista">
      <header>
        <p className="t-sutil">
          {CONFIG.campana.corte} | {CONFIG.campana.actualizado}
        </p>
        <h1 className="t-titulo">¡Hola, {d.nombre.split(' ')[0]}!</h1>
        <p className="impostacion-vista__lectura">
          <fry-icon name="info-outline" size="16" /> Vista de lectura: ves Maya como ella, sin poder hacer acciones.
        </p>
      </header>

      <section className="tarjeta impostacion-vista__resumen" aria-label="Resumen de la directora">
        <div>
          <span>Status</span>
          <b>{d.estatus === 'JNR' ? 'Directora Junior' : 'Directora Senior'}</b>
        </div>
        <div>
          <span>Cuadrante</span>
          <Tag intent={INTENT_CUADRANTE[d.cuadrante]}>{`Cuadrante ${d.cuadrante}`}</Tag>
        </div>
        <div>
          <span>Enganche PAR</span>
          <b>{d.estrellas === 0 ? 'Sin estrella' : `${d.estrellas} ${d.estrellas === 1 ? 'estrella' : 'estrellas'}`}</b>
        </div>
        <div>
          <span>Líder Poderosa</span>
          <b>{TEXTO_PODEROSA[d.liderPoderosa]}</b>
        </div>
      </section>

      <p className="impostacion-vista__nota">
        En el producto, aquí se abre el Inicio de {d.nombre.split(' ')[0]} tal como ella lo ve. Esta demo muestra solo el resumen.
      </p>

      <fry-button hierarchy="secondary" size="large" full-width text="Volver al listado" onfryClick={volver} />
    </div>
  )
}
