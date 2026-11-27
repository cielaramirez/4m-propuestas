import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/vercomo.css'
import './styles/config.css'
import './styles/home.css'
import './styles/mi-negocio.css'
import './styles/mi-carrera.css'
import './styles/flujo.css'
import './styles/chat.css'
import './styles/formaciones.css'
import './styles/lider.css'
import './styles/simulador.css'
import './styles/programas.css'
import './styles/mis-grupos.css'
import './styles/bdm.css'
import './styles/bdm-opcion3.css'
import App from './App.tsx'
import { DemoProvider } from './state/store.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DemoProvider>
      <App />
    </DemoProvider>
  </StrictMode>,
)
