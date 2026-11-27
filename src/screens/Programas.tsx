import { useMemo, useState } from 'react'
import { FilaEstado } from '../components/FilaEstado'
import { CONFIG } from '../config/demo.config'
import { dinero } from '../domain/format'
import { primerNombre } from '../domain/potencial'
import {
  bonoEscalon,
  consultorasDe,
  ETIQUETA_ESTADO,
  miResumen,
  participantes,
  type ConsultoraEvaluada,
  type ParticipanteEvaluada,
} from '../domain/programas'
import { navegar, RUTAS } from '../state/router'
import { useDemo } from '../state/store'
import { Placeholder } from './Placeholder'
import medalla from '../assets/figma/programas/medal.png'

const EC = CONFIG.programas.eligeCrecer

function sinTildes(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/**
 * Programas (pestaña de la barra inferior). La Emprendedora sigue a las consultoras de su grupo;
 * la Directora Junior o Senior, a sus CEM y CEM Senior. Solo "Elige Crecer" está construido.
 */
export function Programas() {
  const { sigla, perfil } = useDemo()
  const [pestana, setPestana] = useState(CONFIG.programas.pestanas[0])
  const [busqueda, setBusqueda] = useState('')
  const esDirectora = perfil.grupo === 'directora'
  const texto = sinTildes(busqueda.trim())
  const coincide = (nombre: string) => sinTildes(nombre).includes(texto)

  const consultoras = useMemo(() => consultorasDe(sigla), [sigla])
  // No se memoriza: sus textos llevan montos que dependen del país.
  const lista = participantes()
  const resumen = miResumen(sigla)

  return (
    <div className="programas">
      <header className="emprendedoras__cabecera">
        <div className="emprendedoras__barra">
          <button className="regresar" onClick={() => navegar(RUTAS.inicio)}>
            <fry-icon name="chevron-left-outline" size="16" />
            Regresar
          </button>
          <span>{CONFIG.campana.corte}</span>
        </div>
        <div className="emprendedoras__titulo">
          <div>
            <h1>Programas</h1>
            <p>
              {esDirectora
                ? 'Hazle seguimiento a las ganancias de tus Consultoras Emprendedoras y Consultoras Emprendedoras Senior.'
                : 'Haz seguimiento y gana en ventas y activas de tu Grupo.'}{' '}
              <u>Ver más</u>
            </p>
          </div>
          <img src={medalla} alt="" />
        </div>
        <fry-searchbar
          placeholder="Busca por nombre o código"
          name="busqueda"
          value={busqueda}
          onfryInput={(e: CustomEvent<{ value: string }>) => setBusqueda(e.detail.value)}
          onfryClear={() => setBusqueda('')}
        />
      </header>

      <div className="formaciones__pestanas" role="tablist">
        {CONFIG.programas.pestanas.map((p) => (
          <button
            key={p}
            role="tab"
            aria-selected={p === pestana}
            className={`formaciones__pestana ${p === pestana ? 'formaciones__pestana--activa' : ''}`}
            onClick={() => setPestana(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {pestana !== CONFIG.programas.pestanas[0] ? (
        <Placeholder titulo={pestana} />
      ) : esDirectora ? (
        <div className="programas__lista">
          {lista.filter((p) => coincide(p.nombre)).map((p) => (
            <CardParticipante key={p.id} participante={p} />
          ))}
          {lista.filter((p) => coincide(p.nombre)).length === 0 && (
            <p className="formaciones__vacio">No hay nadie con ese nombre en Elige Crecer.</p>
          )}
        </div>
      ) : (
        <div className="programas__lista">
          <p className="programas__info">
            <fry-icon name="info-filled" size="16" color="#0066bf" />
            <span>
              {resumen ??
                'Elige Crecer es para Consultoras Emprendedoras y Consultoras Emprendedoras Senior. Incorpora a tu primera consultora y aquí verás tu avance.'}
            </span>
          </p>
          {consultoras.filter((c) => coincide(c.nombre)).map((c) => (
            <CardConsultora key={c.id} consultora={c} />
          ))}
          {consultoras.length > 0 && consultoras.filter((c) => coincide(c.nombre)).length === 0 && (
            <p className="formaciones__vacio">No hay consultoras con ese nombre en tu grupo.</p>
          )}
        </div>
      )}
    </div>
  )
}

/** Botón "Contactar" + llamar y copiar (estos dos solo muestran un aviso en la demo). */
function Acciones({ id, nombre }: { id: string; nombre: string }) {
  const { avisar } = useDemo()
  const corto = primerNombre(nombre)
  return (
    <div className="candidata__acciones">
      <fry-button
        hierarchy="secondary"
        size="medium"
        full-width
        icon-left="whatsapp-outline"
        text="Contactar"
        onfryClick={() => navegar(RUTAS.chatPrograma + id)}
      />
      <fry-button-icon
        hierarchy="secondary"
        size="medium"
        icon="call-outline"
        accessible-label={`Llamar a ${corto}`}
        onfryClick={() => avisar(`Llamando a ${corto}…`)}
      />
      <fry-button-icon
        hierarchy="secondary"
        size="medium"
        icon="copy-outline"
        accessible-label="Copiar número"
        onfryClick={() => avisar('Número copiado')}
      />
    </div>
  )
}

/** Vista de la Emprendedora: una consultora de su grupo y su venta personal por campaña. */
function CardConsultora({ consultora }: { consultora: ConsultoraEvaluada }) {
  return (
    <article className="candidata">
      <div className="candidata__cuerpo">
        <div className="candidata__cabecera">
          <span>{consultora.nombreNivel}</span>
        </div>
        <h2 className="candidata__nombre">{consultora.nombre}</h2>
        <p className="franja-aviso">{consultora.aviso}</p>
        {consultora.filas.length > 0 && (
          <ul className="candidata__filas">
            {consultora.filas.map((f) => (
              <FilaEstado key={f.campana} ok={f.nivel1}>
                Venta personal C{f.campana}: {dinero(f.venta)}
              </FilaEstado>
            ))}
          </ul>
        )}
        <Acciones id={consultora.id} nombre={consultora.nombre} />
      </div>
    </article>
  )
}

/** Vista de la Directora: avance de una CEM o CEM Senior en Elige Crecer. */
function CardParticipante({ participante: p }: { participante: ParticipanteEvaluada }) {
  // Quien ya cumplió arranca con el detalle cerrado.
  const [abierta, setAbierta] = useState(p.estado !== 'cumplio')
  return (
    <article className="candidata">
      <div className="candidata__cuerpo">
        <div className="candidata__cabecera">
          <span>{p.nombreNivel}</span>
          <span className={`estado-programa estado-programa--${p.estado}`}>{ETIQUETA_ESTADO[p.estado]}</span>
        </div>
        <h2 className="candidata__nombre">{p.nombre}</h2>
        <p>
          Campaña: {p.avance.campanaActual} de {EC.campanas}
        </p>

        <ol className="escalones" aria-label="Escalones de Elige Crecer">
          {EC.niveles.map((n, i) => (
            <li key={n.activas} className={`escalon ${i < p.avance.logrados ? 'escalon--logrado' : ''}`}>
              <b>{bonoEscalon(i)}</b>
              <span>+{n.activas} activas</span>
              <span className="solo-lector">{i < p.avance.logrados ? '(logrado)' : '(pendiente)'}</span>
            </li>
          ))}
        </ol>

        <p className="programas__info">
          {p.estado === 'cumplio' ? (
            <fry-icon name="check-circle-filled" size="16" color="#407d7d" />
          ) : (
            <fry-icon name="info-filled" size="16" color="#0066bf" />
          )}
          <span>{p.resumen}</span>
        </p>

        <Acciones id={p.id} nombre={p.nombre} />

        <button className="programas__acordeon" aria-expanded={abierta} onClick={() => setAbierta(!abierta)}>
          Ver crecimiento en activas
          <fry-icon name={abierta ? 'chevron-up-outline' : 'chevron-down-outline'} size="20" />
        </button>
        {abierta && (
          <ul className="candidata__filas">
            {p.avance.porCampana.map((c) => (
              <FilaEstado key={c.campana} ok={c.activas > 0}>
                Campaña {c.campana}:{' '}
                {c.activas === 0 ? 'no creció' : `creció ${c.activas} ${c.activas === 1 ? 'activa' : 'activas'}`}
              </FilaEstado>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}
