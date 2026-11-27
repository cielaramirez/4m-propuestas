import { useEffect, useState } from 'react'
import { Aviso } from './components/Aviso'
import { Cabecera } from './components/Cabecera'
import { CapaContexto } from './components/Capa'
import { NavInferior } from './components/NavInferior'
import { VerComo } from './components/VerComo'
import { ChatCandidata } from './screens/ChatCandidata'
import { ChatDirectora } from './screens/ChatDirectora'
import { ChatDirectoraHija } from './screens/ChatDirectoraHija'
import { ConfigScreen } from './screens/ConfigScreen'
import { FlujoCarrera } from './screens/flujo/FlujoCarrera'
import { Formaciones } from './screens/formaciones/Formaciones'
import { Home } from './screens/Home'
import { Emprendedoras } from './screens/lider/Emprendedoras'
import { HomeLider } from './screens/lider/HomeLider'
import { MiCarrera } from './screens/MiCarrera'
import { MiNegocio } from './screens/MiNegocio'
import { ChatPrograma } from './screens/ChatPrograma'
import { Placeholder } from './screens/Placeholder'
import { Programas } from './screens/Programas'
import { Simulador } from './screens/Simulador'
import { SimuladorFormacion } from './screens/SimuladorFormacion'
import { navegar, rutaExiste, RUTAS, useRuta } from './state/router'
import { useDemo } from './state/store'

export default function App() {
  const ruta = useRuta()
  const { sesion, perfil } = useDemo()
  const [capa, setCapa] = useState<HTMLElement | null>(null)

  const enConfig = !sesion || ruta === RUTAS.config
  const rutaValida = rutaExiste(ruta, perfil.grupo)

  // Si la pantalla actual no existe para el perfil, va a su inicio.
  useEffect(() => {
    if (!enConfig && !rutaValida) navegar(RUTAS.inicio, { reemplazar: true })
  }, [enConfig, rutaValida])

  if (enConfig) {
    return (
      <div className="app">
        <ConfigScreen />
      </div>
    )
  }

  const enChat = ruta.startsWith('/chat/')
  const conNav = perfil.grupo !== 'lider' && !enChat

  return (
    <div className="app">
      <CapaContexto.Provider value={capa}>
        {ruta === RUTAS.chatDirectora ? (
          <ChatDirectora />
        ) : ruta.startsWith(RUTAS.chatDirectoraHija) ? (
          <ChatDirectoraHija id={ruta.slice(RUTAS.chatDirectoraHija.length)} />
        ) : ruta.startsWith(RUTAS.chatPrograma) ? (
          <ChatPrograma id={ruta.slice(RUTAS.chatPrograma.length)} />
        ) : ruta.startsWith(RUTAS.chatCandidata) ? (
          <ChatCandidata id={ruta.slice(RUTAS.chatCandidata.length)} />
        ) : (
          <>
            <Cabecera />
            <main className="pantalla" key={`${perfil.sigla}:${ruta}`}>
              <Pantalla ruta={ruta} />
            </main>
            {conNav && <NavInferior ruta={ruta} />}
          </>
        )}
        <FlujoCarrera />
        {!enChat && <VerComo ruta={ruta} conNav={conNav} />}
        <Aviso />
        <div className="capa" ref={setCapa} />
      </CapaContexto.Provider>
    </div>
  )
}

function Pantalla({ ruta }: { ruta: string }) {
  const { perfil } = useDemo()
  if (ruta.startsWith(RUTAS.simuladorFormacion)) {
    return <SimuladorFormacion id={ruta.slice(RUTAS.simuladorFormacion.length)} />
  }
  if (perfil.grupo === 'lider') {
    return ruta === RUTAS.emprendedoras ? <Emprendedoras /> : <HomeLider />
  }
  switch (ruta) {
    case RUTAS.miNegocio:
      return <MiNegocio />
    case RUTAS.misGrupos:
      return <Placeholder titulo="Mis Grupos" />
    case RUTAS.programas:
      return <Programas />
    case RUTAS.miCarrera:
      return <MiCarrera />
    case RUTAS.simulador:
      return <Simulador />
    case RUTAS.formaciones:
      return <Formaciones />
    default:
      return <Home />
  }
}
