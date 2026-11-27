import { useEffect } from 'react'
import { ChatSimulado } from '../components/ChatSimulado'
import { directorasHijas, mensajeADirectoraHija } from '../domain/lideres'
import { navegar, RUTAS } from '../state/router'
import { useDemo } from '../state/store'

/** Chat simulado de la Líder con una Directora hija (no abre WhatsApp real). */
export function ChatDirectoraHija({ id }: { id: string }) {
  const { borrador, dejarBorrador } = useDemo()
  const directora = directorasHijas().find((d) => d.id === id)

  useEffect(() => {
    if (!directora) navegar(RUTAS.emprendedoras, { reemplazar: true })
  }, [directora])

  if (!directora) return null
  return (
    <ChatSimulado
      chatId={`directora-hija:${directora.id}`}
      contacto={directora.nombre}
      subtitulo={`${directora.estatus} | Hija de ${directora.madre}`}
      mensaje={borrador?.chat === `directora-hija:${directora.id}` ? borrador.texto : mensajeADirectoraHija(directora)}
      etiquetaVolver="Volver a Emprendedoras"
      onVolver={() => {
        dejarBorrador(null)
        navegar(RUTAS.emprendedoras)
      }}
    />
  )
}
