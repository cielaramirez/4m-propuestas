import { useState } from 'react'
import { NotaLegal } from '../components/NotaLegal'
import { CONFIG } from '../config/demo.config'
import { dinero, dineroLocal } from '../domain/format'
import { navegar, RUTAS } from '../state/router'
import { useDemo } from '../state/store'
import { CaminoCarrera } from './carrera/CaminoCarrera'
import { HojaNivel } from './carrera/HojaNivel'
import trofeo from '../assets/figma/mi-carrera-sin/award.png'
import sacoMonedas from '../assets/figma/mi-carrera-con/coin-bag.png'
import anillosWhatsapp from '../assets/figma/mi-carrera-sin/whatsapp-rings.svg'
import anilloGrande from '../assets/figma/mi-carrera-sin/ring-2.svg'
import anilloMedio from '../assets/figma/mi-carrera-sin/ring-1.svg'
import anilloCentro from '../assets/figma/mi-carrera-sin/ring-center.svg'

export function MiCarrera() {
  const { mio, abrirFlujo, sonar } = useDemo()
  const [nivelAbierto, setNivelAbierto] = useState<number | null>(null)
  const sueno = mio.sueno

  const hablarConDirectora = () => {
    sonar('toque')
    setNivelAbierto(null)
    navegar(RUTAS.chatDirectora)
  }

  return (
    <div className={`carrera ${sueno ? 'carrera--con-sueno' : ''}`}>
      {sueno ? (
        <section className="sueno-card">
          <img className="sueno-card__trofeo" src={trofeo} alt="" />
          <div className="sueno-card__texto">
            <span className="sueno-card__etiqueta">Tu sueño</span>
            <b>{sueno.texto}</b>
            {sueno.monto !== null && <span>Meta: {dineroLocal(sueno.monto)}</span>}
          </div>
          <button className="sueno-card__editar" onClick={() => {
              sonar('toque')
              abrirFlujo('sueno', true)
            }} aria-label="Editar tu sueño">
            <fry-icon name="edit-01-outline" color="#c94e22" />
          </button>
        </section>
      ) : (
        <section className="carrera__seccion">
          <div className="rumbo">
            <span className="rumbo__imagen">
              <img src={sacoMonedas} alt="" />
            </span>
            <p className="rumbo__titulo">Rumbo hacia Directora</p>
            <p className="rumbo__frase">
              Puedes ganar <b>desde {dinero(CONFIG.gananciaDirectora)}</b> por campaña*
            </p>
            <fry-button
              hierarchy="primary"
              size="medium"
              text="Me interesa"
              icon-right="arrow-right-outline"
              onfryClick={() => {
                sonar('abrir')
                abrirFlujo('beneficios')
              }}
            />
          </div>
        </section>
      )}

      <section className="carrera__seccion">
        <h1 className="t-titulo">Mi carrera</h1>
        <CaminoCarrera
          onElegir={(indice) => {
            sonar('abrir')
            setNivelAbierto(indice)
          }}
        />
      </section>

      <section className="carrera__seccion">
        <h2 className="carrera__subtitulo">Da el siguiente paso</h2>
        <button className="paso-card paso-card--directora" onClick={hablarConDirectora}>
          <span className="paso-card__texto">
            <b>Habla con tu Directora</b>
            <span>Ella te explica la carrera y te acompaña a tu ritmo.</span>
          </span>
          <img src={anillosWhatsapp} alt="" width={115} height={115} />
        </button>
        <button className="paso-card" onClick={() => {
            sonar('toque')
            navegar(RUTAS.simulador)
          }}>
          <span className="paso-card__texto">
            <b>
              Simula tu carrera <fry-icon name="arrow-right-outline" size="20" />
            </b>
            <span>Calcula con tus números cuánto ganarías en cada nivel.</span>
          </span>
          <span className="paso-card__anillos">
            <img src={anilloGrande} alt="" />
            <img src={anilloCentro} alt="" />
            <img src={anilloMedio} alt="" />
            <img src={trofeo} alt="" />
          </span>
        </button>
        {!sueno && <NotaLegal tipo="ganancia" />}
      </section>

      {nivelAbierto !== null && (
        <HojaNivel
          indice={nivelAbierto}
          onCambiar={(indice) => {
            sonar('avance')
            setNivelAbierto(indice)
          }}
          onCerrar={() => setNivelAbierto(null)}
          onHablar={hablarConDirectora}
        />
      )}
    </div>
  )
}
