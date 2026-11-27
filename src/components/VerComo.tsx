import { useState } from 'react'
import { createPortal } from 'react-dom'
import { CONFIG, type Sigla } from '../config/demo.config'
import { navegar, rutaExiste, RUTAS } from '../state/router'
import { useDemo } from '../state/store'
import { useCapa } from './Capa'

/**
 * Panel "Ver como": herramienta de la demo (no es parte del producto).
 * Arranca minimizado como pastilla sobre la navegación inferior.
 */
export function VerComo({ ruta, conNav }: { ruta: string; conNav: boolean }) {
  const capa = useCapa()
  const { sesion, sigla, perfil, hayHojaAbierta, cambiarPerfil, reiniciar } = useDemo()
  const [abierto, setAbierto] = useState(false)

  // Con un modal u hoja abierta el panel se oculta para no tapar los botones.
  const alReiniciar = () => {
    reiniciar()
    navegar(RUTAS.config)
  }

  if (!capa || !sesion || hayHojaAbierta || ruta === RUTAS.config) return null

  // Sin panel queda solo un acceso discreto que reinicia la demo y vuelve al configurador.
  if (!sesion.mostrarPanel) {
    return createPortal(
      <button
        className={`vercomo-ajustes ${conNav ? 'vercomo--sobre-nav' : ''}`}
        onClick={alReiniciar}
        aria-label="Reiniciar la demo"
      >
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
          <path d="M2 5h5M11 5h3M2 11h3M9 11h5" />
          <circle cx="9" cy="5" r="2" />
          <circle cx="7" cy="11" r="2" />
        </svg>
      </button>,
      capa,
    )
  }

  const elegir = (nueva: Sigla) => {
    cambiarPerfil(nueva)
    if (!rutaExiste(ruta, CONFIG.perfiles[nueva].grupo)) navegar(RUTAS.inicio)
    setAbierto(false)
  }

  const posicion = conNav ? 'vercomo--sobre-nav' : ''

  return createPortal(
    abierto ? (
      <>
        <div className="vercomo-fuera" onClick={() => setAbierto(false)} />
        <aside className={`vercomo ${posicion}`} aria-label="Ver como">
          <div className="vercomo__cabecera">
            <b>Ver como</b>
            <span className="vercomo__demo">DEMO</span>
            <button className="vercomo__minimizar" onClick={() => setAbierto(false)} aria-label="Minimizar">
              –
            </button>
          </div>
          {CONFIG.verComo.map((grupo) => (
            <div key={grupo.titulo}>
              <p className="vercomo__grupo">{grupo.titulo}</p>
              <div className="vercomo__botones">
                {grupo.siglas.map((s) => (
                  <button
                    key={s}
                    className={`vercomo__perfil ${s === sigla ? 'vercomo__perfil--activo' : ''}`}
                    aria-pressed={s === sigla}
                    onClick={() => elegir(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <p className="vercomo__descripcion">{perfil.descripcion}</p>
          <button className="vercomo__reiniciar" onClick={alReiniciar}>
            Reiniciar demo
          </button>
        </aside>
      </>
    ) : (
      <button className={`vercomo-pastilla ${posicion}`} onClick={() => setAbierto(true)}>
        Ver como · <b>{sigla}</b>
      </button>
    ),
    capa,
  )
}
