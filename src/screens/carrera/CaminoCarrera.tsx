import { CONFIG, type NivelId } from '../../config/demo.config'
import { estadoNodo, indiceNivel, type EstadoNodo } from '../../domain/carrera'
import { useDemo } from '../../state/store'
import rutaSvg from '../../assets/figma/mi-carrera-sin/career-path.svg?raw'
import trofeo from '../../assets/figma/mi-carrera-sin/node-trophy.svg'
import estrellaGris from '../../assets/figma/mi-carrera-sin/node-star-grey-24.svg'
import estrellaBlanca from '../../assets/figma/mi-carrera-sin/node-star-white.svg'
import check from '../../assets/figma/mi-carrera-sin/node-check-white.svg'

// Trazo de la ruta, tomado tal cual del asset del Figma; aquí solo se recalcula el degradado
// para que el tramo naranja llegue hasta el nivel actual de cada perfil.
const TRAZO = /\sd="([^"]+)"/.exec(rutaSvg)?.[1] ?? ''
const RUTA = { izquierda: 86.12, arriba: 20.84, ancho: 130.863, alto: 504.655, y1: 5.15457, y2: 496.655 }

/** Posición de cada nodo dentro del lienzo de 312×599 del Figma (centro del círculo y lado de la etiqueta). */
const NODOS: Record<NivelId, { cx: number; cy: number; radio: number; etiqueta: 'izquierda' | 'derecha' }> = {
  consultora: { cx: 173, cy: 514, radio: 26, etiqueta: 'izquierda' },
  cem: { cx: 213, cy: 398, radio: 26, etiqueta: 'izquierda' },
  cemSenior: { cx: 151.6, cy: 276, radio: 26, etiqueta: 'derecha' },
  aspirante: { cx: 96.6, cy: 149, radio: 26, etiqueta: 'derecha' },
  directora: { cx: 158, cy: 32, radio: 32, etiqueta: 'izquierda' },
}
const ANCHO_LIENZO = 312

const ICONOS: Record<EstadoNodo, string> = {
  anterior: check,
  actual: estrellaBlanca,
  siguiente: estrellaGris,
  masAdelante: estrellaGris,
}

/** Ruta serpenteante con los 5 niveles, de abajo hacia arriba. Todos los nodos son tocables. */
export function CaminoCarrera({ onElegir }: { onElegir: (indice: number) => void }) {
  const { perfil } = useDemo()
  const actual = indiceNivel(perfil)
  const yActual = NODOS[CONFIG.niveles[actual].id].cy

  // Naranja sólido desde un poco antes del nodo actual; gris a partir de 86 px más arriba.
  const paso = (yLienzo: number) =>
    Math.min(1, Math.max(0, (yLienzo - RUTA.arriba - RUTA.y1) / (RUTA.y2 - RUTA.y1)))

  return (
    <div className="camino">
      <svg
        className="camino__ruta"
        width={RUTA.ancho}
        height={RUTA.alto}
        viewBox={`0 0 ${RUTA.ancho} ${RUTA.alto}`}
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="camino-degradado" x1="0" y1={RUTA.y1} x2="0" y2={RUTA.y2} gradientUnits="userSpaceOnUse">
            <stop offset={paso(yActual - 86)} stopColor="#E2E4E7" />
            <stop offset={paso(yActual - 14)} stopColor="#DC582A" />
          </linearGradient>
        </defs>
        <path d={TRAZO} fill="url(#camino-degradado)" />
      </svg>

      {CONFIG.niveles.map((nivel, i) => {
        const estado = estadoNodo(i, actual)
        const nodo = NODOS[nivel.id]
        const esMeta = nivel.id === 'directora' && estado !== 'actual' && estado !== 'anterior'
        const posicion =
          nodo.etiqueta === 'izquierda'
            ? { right: ANCHO_LIENZO - (nodo.cx + nodo.radio) }
            : { left: nodo.cx - nodo.radio }
        return (
          <button
            key={nivel.id}
            className={`nodo nodo--${estado} nodo--etiqueta-${nodo.etiqueta} ${esMeta ? 'nodo--meta' : ''}`}
            style={{ top: nodo.cy - nodo.radio, height: nodo.radio * 2, ...posicion }}
            onClick={() => onElegir(i)}
          >
            <span className="nodo__etiqueta">
              {estado === 'actual' ? (
                <>
                  <span className="nodo__aqui">Estás aquí</span>
                  {nivel.nombre}
                </>
              ) : (
                nivel.nombre
              )}
            </span>
            <span className="nodo__circulo" style={{ width: nodo.radio * 2, height: nodo.radio * 2 }}>
              <img src={esMeta ? trofeo : ICONOS[estado]} alt="" />
            </span>
          </button>
        )
      })}
    </div>
  )
}
