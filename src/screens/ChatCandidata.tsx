import { useEffect } from 'react'
import { ChatSimulado } from '../components/ChatSimulado'
import { candidatasDe, mensajeACandidata } from '../domain/formaciones'
import { navegar, RUTAS } from '../state/router'
import { useDemo } from '../state/store'

/** Chat simulado de la Directora con una candidata (no abre WhatsApp real). */
export function ChatCandidata({ id }: { id: string }) {
  const { sesion, sigla, borrador, dejarBorrador } = useDemo()
  const candidata = candidatasDe(sigla).find((c) => c.id === id)

  useEffect(() => {
    if (!candidata) navegar(RUTAS.formaciones, { reemplazar: true })
  }, [candidata])

  if (!candidata) return null
  return (
    <ChatSimulado
      chatId={`candidata:${candidata.id}`}
      contacto={candidata.nombre}
      subtitulo={candidata.nombreNivel}
      mensaje={borrador?.chat === `candidata:${candidata.id}` ? borrador.texto : mensajeACandidata(candidata, sesion?.nombre ?? '')}
      etiquetaVolver="Volver a Formaciones"
      onVolver={() => {
        dejarBorrador(null)
        navegar(RUTAS.formaciones)
      }}
    />
  )
}
