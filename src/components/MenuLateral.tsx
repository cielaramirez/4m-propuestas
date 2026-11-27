import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { elegirOpcion, OPCIONES, useOpcion } from '../screens/bdm/opcion'
import { navegar, RUTAS } from '../state/router'
import { useDemo } from '../state/store'
import { useCapa } from './Capa'

/**
 * Menú hamburguesa. En la demo solo trae, para la BDM, las opciones de diseño de Mis Grupos
 * que se están comparando; el resto del menú del producto queda fuera del alcance.
 */
export function MenuLateral({ onCerrar }: { onCerrar: () => void }) {
  const capa = useCapa()
  const { registrarHoja } = useDemo()
  const opcion = useOpcion()

  // Mientras el menú esté abierto, el panel "Ver como" se oculta (igual que con las hojas).
  useEffect(() => {
    registrarHoja(1)
    return () => registrarHoja(-1)
  }, [registrarHoja])

  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [onCerrar])

  if (!capa) return null
  return createPortal(
    <>
      <div className="hoja-fondo" onClick={onCerrar} />
      <nav className="menu-lateral" aria-label="Menú">
        <div className="menu-lateral__cabecera">
          <b>Menú</b>
          <button className="menu-lateral__cerrar" onClick={onCerrar} aria-label="Cerrar menú">
            <fry-icon name="close-outline" size="24" />
          </button>
        </div>

        <section className="menu-lateral__grupo" aria-labelledby="menu-opciones">
          <p id="menu-opciones" className="menu-lateral__titulo">
            Mis Grupos · propuestas <span className="vercomo__demo">DEMO</span>
          </p>
          <ul>
            {OPCIONES.map((o) => {
              const activa = o.id === opcion
              return (
                <li key={o.id}>
                  <button
                    className={`menu-lateral__opcion ${activa ? 'menu-lateral__opcion--activa' : ''}`}
                    aria-current={activa ? 'true' : undefined}
                    onClick={() => {
                      elegirOpcion(o.id)
                      navegar(RUTAS.misGrupos)
                      onCerrar()
                    }}
                  >
                    <span>
                      <b>{o.titulo}</b>
                      <span>{o.detalle}</span>
                    </span>
                    {activa && <fry-icon name="check-outline" size="20" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      </nav>
    </>,
    capa,
  )
}
