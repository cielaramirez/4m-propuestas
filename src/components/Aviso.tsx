import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useDemo } from '../state/store'
import { useCapa } from './Capa'

/** Aviso breve (toast) para acciones que la demo solo simula. */
export function Aviso() {
  const capa = useCapa()
  const { aviso, avisar } = useDemo()

  useEffect(() => {
    if (!aviso) return
    const reloj = window.setTimeout(() => avisar(null), 2600)
    return () => window.clearTimeout(reloj)
  }, [aviso, avisar])

  if (!capa || !aviso) return null
  return createPortal(
    <div className="aviso" role="status" key={aviso.id}>
      {aviso.texto}
    </div>,
    capa,
  )
}
