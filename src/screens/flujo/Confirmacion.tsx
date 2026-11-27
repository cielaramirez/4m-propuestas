import { HojaInferior } from '../../components/HojaInferior'
import { NotaLegal } from '../../components/NotaLegal'
import { CONFIG } from '../../config/demo.config'
import { campanasParaElSueno } from '../../domain/carrera'
import { dinero, dineroLocal } from '../../domain/format'
import { useDemo } from '../../state/store'
import foto from '../../assets/figma/modal-1/photo-directora.jpg'
import bolsa from '../../assets/figma/modal-1/moneybag.png'
import grupo from '../../assets/figma/modal-3/group.png'

/** Modal 3 · Confirmación: "¡Tu sueño ya tiene un camino!" */
export function Confirmacion({ onSalir }: { onSalir: () => void }) {
  const { mio } = useDemo()
  const sueno = mio.sueno
  if (!sueno) return null

  const cifra = dinero(CONFIG.gananciaDirectora)
  const campanas = campanasParaElSueno(sueno.monto)

  return (
    <HojaInferior
      etiqueta="Tu sueño ya tiene un camino"
      className="hoja--flujo"
      onCerrar={onSalir}
      pie={
        <>
          <fry-button hierarchy="secondary" full-width text="Cerrar" onfryClick={onSalir} />
          <fry-button hierarchy="primary" full-width text="Ver mi carrera" onfryClick={onSalir} />
        </>
      }
    >
      <img className="confirmacion__foto" src={foto} alt="Directora Yanbal saludando" />

      <div className="flujo__cabecera">
        <h2 className="flujo__titulo">¡Tu sueño ya tiene un camino!</h2>
        <p className="flujo__apoyo">
          {sueno.texto}
          {sueno.monto !== null && ` | Meta: ${dineroLocal(sueno.monto)}`}
          <br />
          Así te acercas siendo Directora:
        </p>
      </div>

      <ul className="pasos pasos--compactos">
        <li className="paso">
          <span className="paso__icono paso__icono--bolsa">
            <img src={bolsa} alt="" />
          </span>
          <span>
            <b className="paso__titulo">Ganancia de Directora</b>
            <span className="paso__detalle">
              {campanas !== null
                ? `Ya como Directora, desde ${cifra} por campaña podrías lograrlo en unas ${campanas} ${campanas === 1 ? 'campaña' : 'campañas'}.`
                : `Desde ${cifra} por campaña*.`}
            </span>
          </span>
        </li>
        <li className="paso">
          <span className="paso__icono">
            <img src={grupo} alt="" />
          </span>
          <span>
            <b className="paso__titulo">Ganancias por la venta de tu Grupo Personal</b>
            <span className="paso__detalle">Suman a tu sueño en cada campaña.</span>
          </span>
        </li>
      </ul>

      <div className="confirmacion__aviso">
        <fry-icon name="info-outline" />
        Tu Directora podrá ver tu sueño para acompañarte.
      </div>
      {campanas === null && <NotaLegal tipo="ganancia" className="confirmacion__legal" />}
    </HojaInferior>
  )
}
