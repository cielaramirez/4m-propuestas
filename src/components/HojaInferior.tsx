import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useDemo } from '../state/store'
import { useCapa } from './Capa'

interface Props {
  /** Se llama al tocar el fondo, la X o Escape. */
  onCerrar: () => void
  /** Muestra la X en la esquina superior derecha. */
  conCerrar?: boolean
  etiqueta: string
  /** Bloque fijo sobre el contenido desplazable (foto, video, título). */
  cabecera?: ReactNode
  pie?: ReactNode
  children: ReactNode
  className?: string
}

/** Hoja inferior (bottom sheet) sobre la pantalla de origen. */
export function HojaInferior({ onCerrar, conCerrar = false, etiqueta, cabecera, pie, children, className }: Props) {
  const capa = useCapa()
  const { registrarHoja } = useDemo()

  // Mientras haya una hoja abierta, el panel "Ver como" se oculta.
  useEffect(() => {
    registrarHoja(1)
    return () => registrarHoja(-1)
  }, [registrarHoja])

  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [onCerrar])

  // Cuando el contenido no cabe, se dibuja una barra de scroll propia (la del sistema
  // se esconde sola en celulares) y los divisores de corte arriba y abajo.
  const cuerpoRef = useRef<HTMLDivElement>(null)
  const [barra, setBarra] = useState<{ alto: number; arriba: number } | null>(null)
  useEffect(() => {
    const cuerpo = cuerpoRef.current
    if (!cuerpo) return
    const medir = () => {
      const { scrollHeight, clientHeight, scrollTop } = cuerpo
      if (scrollHeight - clientHeight < 2) return setBarra(null)
      const alto = Math.max(24, (clientHeight * clientHeight) / scrollHeight)
      setBarra({ alto, arriba: (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - alto) })
    }
    medir()
    cuerpo.addEventListener('scroll', medir, { passive: true })
    const observador = new ResizeObserver(medir)
    observador.observe(cuerpo)
    if (cuerpo.firstElementChild) observador.observe(cuerpo.firstElementChild)
    return () => {
      cuerpo.removeEventListener('scroll', medir)
      observador.disconnect()
    }
  }, [capa])

  if (!capa) return null
  return createPortal(
    <>
      <div className="hoja-fondo" onClick={onCerrar} />
      <section className={`hoja ${barra ? 'hoja--con-scroll' : ''} ${className ?? ''}`} role="dialog" aria-modal="true" aria-label={etiqueta}>
        {conCerrar && (
          <button className="hoja__cerrar" onClick={onCerrar} aria-label="Cerrar">
            <fry-icon name="close-outline" />
          </button>
        )}
        {cabecera && <div className="hoja__cabecera">{cabecera}</div>}
        <div className="hoja__zona">
          <div className="hoja__cuerpo" ref={cuerpoRef}>
            {children}
          </div>
          {barra && <span className="hoja__barra" style={{ height: barra.alto, top: barra.arriba }} aria-hidden="true" />}
        </div>
        {pie && <div className="hoja__pie">{pie}</div>}
      </section>
    </>,
    capa,
  )
}
