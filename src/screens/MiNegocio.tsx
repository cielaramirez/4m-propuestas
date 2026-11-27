import { NotaLegal } from '../components/NotaLegal'
import { CONFIG } from '../config/demo.config'
import { dinero } from '../domain/format'
import { navegar, RUTAS } from '../state/router'
import { useDemo } from '../state/store'
import bolsa from '../assets/figma/mi-negocio/moneybag.png'
import billetes from '../assets/figma/mi-negocio/banner-coins.png'
import monedas from '../assets/figma/mi-negocio/venta-coins.png'
import estrellaChica from '../assets/figma/mi-negocio/venta-star-small.png'
import estrellaGrande from '../assets/figma/mi-negocio/venta-star-large.png'
import monedero from '../assets/figma/mi-negocio/coinpurse.png'
import alerta from '../assets/figma/mi-negocio/alert.png'

export function MiNegocio() {
  const { perfil, mio, abrirFlujo, abrirPopupBono, avisar } = useDemo()
  const { actual } = CONFIG.campana
  const campanas = [actual, actual - 1, actual - 2]
  const fueraDeAlcance = () => avisar('Fuera del alcance de esta demo')

  // Banner de carrera: solo Emprendedoras que aún no registran su sueño.
  const conBannerCarrera = perfil.grupo === 'emprendedora' && !mio.sueno
  // Banner del bono: Directoras Junior y Senior. Siempre abre Formaciones con el popup.
  const conBannerBono = perfil.grupo === 'directora'
  const verBono = () => {
    abrirPopupBono()
    navegar(RUTAS.formaciones)
  }

  return (
    <div className="negocio">
      <header className="negocio__titulo">
        <p>
          {CONFIG.campana.corte} | {CONFIG.campana.actualizado}
        </p>
        <h1 className="t-titulo">Mi negocio</h1>
      </header>

      <div className="negocio__tabs" role="tablist">
        {campanas.map((c, i) => (
          <button
            key={c}
            role="tab"
            aria-selected={i === 0}
            className={`negocio__tab ${i === 0 ? 'negocio__tab--activa' : ''}`}
            onClick={i === 0 ? undefined : fueraDeAlcance}
          >
            C{c}
          </button>
        ))}
      </div>

      <section className="tarjeta ganancia">
        <div className="ganancia__cuerpo">
          <div className="ganancia__cabecera">
            <span className="icono-32 icono-32--bolsa">
              <img src={bolsa} alt="" />
            </span>
            <h2>Ganancia estimada actual</h2>
            <fry-icon name="chevron-up-outline" size="16" />
          </div>

          <div>
            <p className="ganancia__monto">{dinero(perfil.gananciaActual ?? 0)}</p>
            <p className="ganancia__ayuda">Tu ganancia aproximada a cierre de C{actual}.</p>
          </div>

          {conBannerCarrera && (
            <div className="destacado">
              <span className="destacado__imagen">
                <img src={billetes} alt="" />
              </span>
              <div className="destacado__texto">
                <p className="destacado__frase">
                  Una Directora gana desde <b className="acento">{dinero(CONFIG.gananciaDirectora)}</b> por campaña*
                </p>
                <p className="destacado__ayuda">Descubre cómo se logra en la carrera Yanbal.</p>
                <fry-button
                  hierarchy="primary"
                  size="small"
                  text="Ver cómo se gana"
                  icon-right="arrow-right-outline"
                  onfryClick={() => abrirFlujo('beneficios')}
                />
              </div>
            </div>
          )}

          {conBannerBono && (
            <div className="destacado">
              <span className="destacado__imagen">
                <img src={billetes} alt="" />
              </span>
              <div className="destacado__texto">
                <p className="destacado__frase">
                  Llévate el bono de <b className="acento">{dinero(CONFIG.bonoFormacion)}*</b>
                </p>
                <p className="destacado__ayuda">al formar a una nueva Directora</p>
                <fry-button
                  hierarchy="primary"
                  size="small"
                  text="Ver cómo se gana"
                  icon-right="arrow-right-outline"
                  onfryClick={verBono}
                />
              </div>
            </div>
          )}

          <div className="desglose">
            {perfil.desglose.map((grupo) => (
              <div key={grupo.titulo}>
                <h3>{grupo.titulo}</h3>
                {grupo.lineas.map((linea) => (
                  <p className="desglose__fila" key={linea.concepto}>
                    <span>{linea.concepto}</span>
                    <span>{dinero(linea.monto)}</span>
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="ganancia__pie">
          <button className="enlace" onClick={fueraDeAlcance}>
            Reporte de Honorarios
            <fry-icon name="external-link-outline" size="20" />
          </button>
        </div>
      </section>

      {conBannerCarrera && <NotaLegal tipo="ganancia" className="negocio__legal" />}
      {conBannerBono && <NotaLegal tipo="bono" className="negocio__legal" />}

      <section className="tarjeta venta">
        <span className="venta__monedas">
          <img src={monedas} alt="" />
        </span>
        <img className="venta__estrella venta__estrella--chica" src={estrellaChica} alt="" />
        <img className="venta__estrella venta__estrella--grande" src={estrellaGrande} alt="" />
        <h2>Venta Personal actual:</h2>
        <p className="venta__monto">{dinero(perfil.campana.ventaPersonal)}</p>
      </section>

      <section className="tarjeta colapsada">
        <span className="icono-32 icono-32--monedero">
          <img src={monedero} alt="" />
        </span>
        <h2>Crédito</h2>
        <span className="etiqueta-estado">Aprobado</span>
        <button className="colapsada__boton" onClick={fueraDeAlcance} aria-label="Ver crédito">
          <fry-icon name="chevron-down-outline" size="16" />
        </button>
      </section>

      <section className="tarjeta colapsada">
        <span className="icono-32">
          <img src={alerta} alt="" />
        </span>
        <h2>Deuda</h2>
        <span className="etiqueta-estado etiqueta-estado--alerta">1 cuota vencida</span>
        <button className="colapsada__boton" onClick={fueraDeAlcance} aria-label="Ver deuda">
          <fry-icon name="chevron-down-outline" size="16" />
        </button>
      </section>
    </div>
  )
}
