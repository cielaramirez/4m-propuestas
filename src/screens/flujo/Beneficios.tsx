import { useState } from 'react'
import { HojaInferior } from '../../components/HojaInferior'
import { NotaLegal } from '../../components/NotaLegal'
import { CONFIG } from '../../config/demo.config'
import { dinero } from '../../domain/format'
import { useDemo } from '../../state/store'
import foto from '../../assets/figma/modal-1/photo-directora.jpg'
import bolsa from '../../assets/figma/modal-1/moneybag.png'
import avion from '../../assets/figma/modal-1/airplane.png'
import moneda from '../../assets/figma/home/ind-ganancia.png'

const BENEFICIOS = [
  {
    icono: bolsa,
    clase: 'paso__icono--bolsa',
    titulo: 'Ganancias por la venta de tu Grupo Personal',
    detalle: 'Adicional a tu venta personal en cada campaña.',
  },
  {
    icono: moneda,
    clase: '',
    titulo: 'Bonos por tus resultados',
    detalle: 'Al traer nuevos primeros pedidos y mantener una buena venta de tu grupo.',
  },
  {
    icono: avion,
    clase: 'paso__icono--avion',
    titulo: 'Reconocimiento anual',
    detalle: 'Premiamos tu crecimiento año a año con viajes internacionales.',
  },
]

interface Props {
  onMasAdelante: () => void
  onQuiero: () => void
}

/** Modal 1 · Beneficios + pregunta de interés. */
export function Beneficios({ onMasAdelante, onQuiero }: Props) {
  const { perfil, avisar } = useDemo()
  // El video arranca solo al abrir el modal y se desmonta (se detiene) al cerrar o avanzar.
  // Sin conexión queda la foto con el botón de reproducir.
  const [reproduciendo, setReproduciendo] = useState(() => navigator.onLine)

  const reproducir = () => {
    if (!navigator.onLine) {
      avisar('No hay conexión para reproducir el video.')
      return
    }
    setReproduciendo(true)
  }

  return (
    <HojaInferior
      etiqueta="Beneficios de ser Directora"
      className="hoja--flujo"
      onCerrar={onMasAdelante}
      cabecera={
        <>
          <div className="video">
            <img className="video__portada" src={foto} alt="Directora Yanbal saludando" />
            {reproduciendo ? (
              <iframe
                className="video__reproductor"
                src={`https://www.youtube-nocookie.com/embed/${CONFIG.video.youtubeId}?autoplay=1&playsinline=1&rel=0`}
                title="Video: así gana una Directora"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button className="video__play" onClick={reproducir} aria-label="Reproducir video">
                <fry-icon name="play-filled" />
              </button>
            )}
          </div>

          <div className="flujo__cabecera">
            <h2 className="flujo__titulo">
              Así una Directora gana desde <span className="acento">{dinero(CONFIG.gananciaDirectora)} por campaña*</span>
            </h2>
            <p className="flujo__apoyo">
              Hoy tu ganancia estimada es {dinero(perfil.gananciaActual ?? 0)}. Además tendrías otros beneficios:
            </p>
          </div>
        </>
      }
      pie={
        <>
          <fry-button hierarchy="secondary" full-width text="Más adelante" onfryClick={onMasAdelante} />
          <fry-button hierarchy="primary" full-width text="Sí, quiero" onfryClick={onQuiero} />
        </>
      }
    >
      <ul className="pasos pasos--borde">
        {BENEFICIOS.map((b) => (
          <li className="paso" key={b.titulo}>
            <span className={`paso__icono ${b.clase}`}>
              <img src={b.icono} alt="" />
            </span>
            <span>
              <b className="paso__titulo">{b.titulo}</b>
              <span className="paso__detalle">{b.detalle}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="flujo__pregunta">
        <h3>¿Te gustaría recorrer este camino?</h3>
        <p className="flujo__apoyo">Decirlo no te compromete a nada. Puedes ir a tu ritmo.</p>
        <NotaLegal tipo="ganancia" className="flujo__legal" />
      </div>
    </HojaInferior>
  )
}
