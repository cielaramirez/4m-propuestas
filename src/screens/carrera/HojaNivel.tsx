import { HojaInferior } from '../../components/HojaInferior'
import { NotaLegal } from '../../components/NotaLegal'
import { CONFIG } from '../../config/demo.config'
import { estadoNodo, indiceNivel, type EstadoNodo } from '../../domain/carrera'
import { conMontos, dinero } from '../../domain/format'
import { useDemo } from '../../state/store'

const ETIQUETAS: Record<EstadoNodo, string> = {
  anterior: 'Ya lo lograste',
  actual: 'Estás aquí',
  siguiente: 'Tu siguiente nivel',
  masAdelante: 'Más adelante',
}

interface Props {
  indice: number
  onCambiar: (indice: number) => void
  onCerrar: () => void
  onHablar: () => void
}

/** Hoja con el detalle de un nivel; su contenido depende del estado del nodo para el perfil activo. */
export function HojaNivel({ indice, onCambiar, onCerrar, onHablar }: Props) {
  const { perfil } = useDemo()
  const actual = indiceNivel(perfil)
  const nivel = CONFIG.niveles[indice]
  const estado = estadoNodo(indice, actual)
  const siguiente = CONFIG.niveles[actual + 1]
  const logrado = estado === 'anterior' || estado === 'actual'
  const conGananciaReferencial = !logrado && nivel.gananciaReferencial !== null

  return (
    <HojaInferior
      etiqueta={`Nivel ${nivel.nombre}`}
      className="hoja--nivel"
      conCerrar
      onCerrar={onCerrar}
      pie={
        estado === 'anterior' ? (
          <fry-button hierarchy="secondary" full-width text="Cerrar" onfryClick={onCerrar} />
        ) : estado === 'actual' && siguiente ? (
          <fry-button
            hierarchy="primary"
            full-width
            text="Ver mi siguiente nivel"
            onfryClick={() => onCambiar(actual + 1)}
          />
        ) : (
          <fry-button hierarchy="primary" full-width icon-left="whatsapp-outline" text="Habla con tu Directora" onfryClick={onHablar} />
        )
      }
    >
      <div className="nivel" key={nivel.id}>
        <span className={`nivel__estado nivel__estado--${estado}`}>{ETIQUETAS[estado]}</span>
        <h2 className="flujo__titulo">{nivel.nombre}</h2>
        <p className="nivel__descripcion">{nivel.descripcion}</p>

        {estado === 'actual' && perfil.gananciaActual !== null && (
          <p className="nivel__ganancia">
            Tu ganancia estimada actual: <b>{dinero(perfil.gananciaActual)}</b>
          </p>
        )}
        {conGananciaReferencial && (
          <p className="nivel__ganancia">
            Ganancia referencial:{' '}
            <b>
              {nivel.gananciaDesde ? 'desde ' : ''}
              {dinero(nivel.gananciaReferencial ?? 0)} por campaña*
            </b>
          </p>
        )}

        {nivel.requisitos.length > 0 && (
          <>
            <h3 className="nivel__subtitulo">{logrado ? 'Lo que lograste para llegar' : 'Qué necesitas para llegar'}</h3>
            {nivel.notaRequisitos && <p className="nivel__nota">{nivel.notaRequisitos}</p>}
            <ul className={`nivel__requisitos ${logrado ? 'nivel__requisitos--logrados' : ''}`}>
              {nivel.requisitos.map((r) => (
                <li key={r}>
                  {logrado && <fry-icon name="check-outline" size="20" color="#1f8a70" />}
                  <span>{conMontos(r)}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {estado === 'masAdelante' && siguiente && (
          <p className="nivel__aviso">Primero completa {siguiente.nombre}. Este nivel viene después.</p>
        )}
        {conGananciaReferencial && <NotaLegal tipo="ganancia" className="nivel__legal" />}
      </div>
    </HojaInferior>
  )
}
