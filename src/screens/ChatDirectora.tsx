import { ChatSimulado } from '../components/ChatSimulado'
import { mensajeADirectora, respuestaDeDirectora } from '../domain/carrera'
import { navegar, RUTAS } from '../state/router'
import { useDemo } from '../state/store'

/** "Habla con tu Directora": chat simulado con la Directora madre de la Emprendedora. */
export function ChatDirectora() {
  const { sesion, perfil, mio, directoraMadre, sonar } = useDemo()
  return (
    <ChatSimulado
      chatId="directora"
      contacto={directoraMadre}
      subtitulo="Tu Directora"
      mensaje={mensajeADirectora({
        nombre: sesion?.nombre ?? '',
        directora: directoraMadre,
        perfil,
        sueno: mio.sueno,
      })}
      respuesta={respuestaDeDirectora({ nombre: sesion?.nombre ?? '', perfil, sueno: mio.sueno })}
      etiquetaVolver="Volver a Mi carrera"
      onVolver={() => navegar(RUTAS.miCarrera)}
      alEnviar={() => sonar('enviar')}
    />
  )
}
