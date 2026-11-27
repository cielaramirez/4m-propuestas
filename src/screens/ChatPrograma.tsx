import { useEffect } from 'react'
import { ChatSimulado } from '../components/ChatSimulado'
import { consultorasDe, mensajeAConsultora, mensajeAParticipante, participantes } from '../domain/programas'
import { navegar, RUTAS } from '../state/router'
import { useDemo } from '../state/store'

/** Chat simulado de la sección Programas (no abre WhatsApp real). */
export function ChatPrograma({ id }: { id: string }) {
  const { sesion, sigla, perfil } = useDemo()
  const remitente = sesion?.nombre ?? ''

  const contacto = (() => {
    if (perfil.grupo === 'directora') {
      const p = participantes().find((x) => x.id === id)
      return p && { nombre: p.nombre, nivel: p.nombreNivel, mensaje: mensajeAParticipante(p, remitente) }
    }
    const c = consultorasDe(sigla).find((x) => x.id === id)
    return c && { nombre: c.nombre, nivel: c.nombreNivel, mensaje: mensajeAConsultora(c, remitente) }
  })()

  useEffect(() => {
    if (!contacto) navegar(RUTAS.programas, { reemplazar: true })
  }, [contacto])

  if (!contacto) return null
  return (
    <ChatSimulado
      chatId={`programa:${id}`}
      contacto={contacto.nombre}
      subtitulo={contacto.nivel}
      mensaje={contacto.mensaje}
      etiquetaVolver="Volver a Programas"
      onVolver={() => navegar(RUTAS.programas)}
    />
  )
}
