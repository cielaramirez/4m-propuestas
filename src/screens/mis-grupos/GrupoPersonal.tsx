import { useMemo, useState } from 'react'
import { HojaInferior } from '../../components/HojaInferior'
import {
  ACCIONES_GRUPO,
  CONSULTORAS,
  CREDITOS_PENDIENTES,
  GRUPO_PERSONAL,
  type Consultora,
  type CreditoPendiente,
  type EstadoConsultora,
  type Tono,
} from '../../config/mi-grupo.data'
import { dinero } from '../../domain/format'
import { navegar, RUTAS } from '../../state/router'
import { useDemo } from '../../state/store'
import { Avatar, Semaforo, Tag } from './comun'

const FILTROS = [
  { id: 'todas', etiqueta: 'Todas' },
  { id: 'activa', etiqueta: 'Activas' },
  { id: 'riesgo', etiqueta: 'En riesgo' },
  { id: 'nueva', etiqueta: 'Nuevas' },
  { id: 'deuda', etiqueta: 'Con deuda' },
  { id: 'credito', etiqueta: 'Crédito pendiente' },
]

const TONO_ESTADO: Record<EstadoConsultora, Tono> = { activa: 'ok', deuda: 'peligro', nueva: 'info', riesgo: 'alerta' }
const TEXTO_ESTADO: Record<EstadoConsultora, string> = { activa: 'Activa', deuda: 'Con deuda', nueva: 'Nueva', riesgo: 'En riesgo' }

function sinTildes(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export function GrupoPersonal() {
  const { avisar } = useDemo()
  const [pendientes, setPendientes] = useState<CreditoPendiente[]>(CREDITOS_PENDIENTES)
  const [confirmando, setConfirmando] = useState<CreditoPendiente | null>(null)
  const [aprobados, setAprobados] = useState(0)
  const [filtro, setFiltro] = useState('todas')
  const [busqueda, setBusqueda] = useState('')

  const conCredito = useMemo(() => new Set(pendientes.map((c) => c.nombre)), [pendientes])
  const tieneCredito = (c: Consultora) => conCredito.has(c.nombre)

  const filtrar = (id: string) =>
    CONSULTORAS.filter((c) => (id === 'todas' ? true : id === 'credito' ? tieneCredito(c) : c.estado === id))

  const texto = sinTildes(busqueda.trim())
  const visibles = filtrar(filtro).filter((c) => texto === '' || sinTildes(c.nombre).includes(texto))

  const enRiesgo =
    (ACCIONES_GRUPO.find((a) => a.etiqueta === 'Reactivar')?.cantidad ?? 0) +
    (ACCIONES_GRUPO.find((a) => a.etiqueta === 'Deuda')?.cantidad ?? 0)

  const aprobar = (cr: CreditoPendiente) => {
    setPendientes((lista) => lista.filter((c) => c.codigo !== cr.codigo))
    setAprobados((n) => n + 1)
    setConfirmando(null)
    avisar(`Crédito de ${cr.nombre.split(' ')[0]} aprobado`)
  }

  const irALista = (id?: string) => {
    if (!id) return avisar('Fuera del alcance de esta demo')
    setFiltro(id)
    document.getElementById('consultoras-gp')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="grupos__contenido">
      <div className="grupos__indicadores">
        <div className="indicador">
          <span className="indicador__etiqueta">
            Activas <Semaforo tono="ok" />
          </span>
          <p className="indicador__valor">
            {GRUPO_PERSONAL.activas}
            <span>/{GRUPO_PERSONAL.metaActivas}</span>
          </p>
          <p className="indicador__ayuda">esta campaña</p>
        </div>
        <div className="indicador">
          <span className="indicador__etiqueta">
            En riesgo <Semaforo tono="alerta" />
          </span>
          <p className="indicador__valor">{enRiesgo}</p>
          <p className="indicador__ayuda">por reactivar o con deuda</p>
        </div>
        <div className="indicador">
          <span className="indicador__etiqueta">
            Créditos <Semaforo tono={pendientes.length ? 'peligro' : 'ok'} />
          </span>
          <p className="indicador__valor">{pendientes.length}</p>
          <p className="indicador__ayuda">por aprobar</p>
        </div>
      </div>

      {(pendientes.length > 0 || aprobados > 0) && (
        <section className="tarjeta grupos__creditos" aria-labelledby="titulo-creditos">
          <h2 id="titulo-creditos" className="grupos__h2">
            <fry-icon name="alert-filled" size="20" color="#ce8700" />Créditos por aprobar ({pendientes.length})
          </h2>
          <p className="grupos__nota">
            Es crédito a <b>tus</b> consultoras: sin tu aprobación no pueden pasar pedido, y aprobar suma a la deuda de tu grupo (IM).
          </p>
          <ul>
            {pendientes.map((cr) => (
              <li key={cr.codigo} className="fila-persona">
                <Avatar nombre={cr.nombre} nivel={CONSULTORAS.find((c) => c.nombre === cr.nombre)?.nivel ?? 'CNS'} />
                <div className="fila-persona__info">
                  <b>{cr.nombre}</b>
                  <span>
                    Solicita {dinero(cr.montoSolicitado)} · IM +{cr.impactoIM} pts
                  </span>
                </div>
                <fry-button hierarchy="primary" size="small" text="Aprobar" onfryClick={() => setConfirmando(cr)} />
              </li>
            ))}
          </ul>
          {aprobados > 0 && (
            <p className="grupos__ok">
              <fry-icon name="check-circle-filled" size="16" color="#407d7d" />
              {aprobados === 1 ? '1 crédito aprobado' : `${aprobados} créditos aprobados`} en esta sesión.
            </p>
          )}
        </section>
      )}

      <section aria-labelledby="titulo-acciones">
        <h2 id="titulo-acciones" className="grupos__h2">
          Acciones del grupo
        </h2>
        <div className="acciones-grupo">
          {ACCIONES_GRUPO.map((a) => (
            <button key={a.etiqueta} className="accion-grupo" onClick={() => irALista(a.filtro)}>
              <span className="accion-grupo__top">
                <span className="accion-grupo__n">{a.cantidad}</span>
                <Semaforo tono={a.tono} />
              </span>
              <b>{a.etiqueta}</b>
              <span className="accion-grupo__ayuda">{a.ayuda}</span>
            </button>
          ))}
        </div>
      </section>

      <section id="consultoras-gp" aria-labelledby="titulo-consultoras">
        <h2 id="titulo-consultoras" className="grupos__h2">
          Consultoras de tu grupo
        </h2>
        <fry-searchbar
          placeholder="Buscar consultora"
          name="busqueda-gp"
          value={busqueda}
          onfryInput={(e: CustomEvent<{ value: string }>) => setBusqueda(e.detail.value)}
          onfryClear={() => setBusqueda('')}
        />
        <div className="grupos__filtros" role="radiogroup" aria-label="Filtrar consultoras">
          {FILTROS.map((f) => (
            <fry-chip
              key={f.id}
              type="choice"
              size="small"
              name="filtro-gp"
              value={f.id}
              label={`${f.etiqueta} (${filtrar(f.id).length})`}
              checked={filtro === f.id}
              onfryChange={() => setFiltro(f.id)}
            />
          ))}
        </div>
        <ul className="tarjeta grupos__lista">
          {visibles.length === 0 ? (
            <li className="formaciones__vacio">Sin consultoras en este filtro.</li>
          ) : (
            visibles.map((c) => (
              <li key={c.nombre} className="fila-persona">
                <Avatar nombre={c.nombre} nivel={c.nivel} />
                <div className="fila-persona__info">
                  <b>{c.nombre}</b>
                  <span>
                    {c.nivel} · Personal {dinero(c.ventaPersonal)}
                    {c.ventaGrupal ? ` · Grupal ${dinero(c.ventaGrupal)}` : ''}
                  </span>
                  {(c.estado === 'deuda' || c.estado === 'nueva' || tieneCredito(c)) && (
                    <span className="fila-persona__etiquetas">
                      {c.estado === 'deuda' && <Tag intent="danger">Deuda</Tag>}
                      {c.estado === 'nueva' && <Tag intent="info">Nueva</Tag>}
                      {tieneCredito(c) && <Tag intent="warning">Crédito pendiente</Tag>}
                    </span>
                  )}
                </div>
                <Semaforo tono={TONO_ESTADO[c.estado]} texto={TEXTO_ESTADO[c.estado]} />
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="tarjeta grupos__crecer" aria-labelledby="titulo-crecer">
        <h2 id="titulo-crecer" className="grupos__h2">
          Crecer e incorporar
        </h2>
        <button className="enlace-fila" onClick={() => avisar('Fuera del alcance de esta demo')}>
          <span>
            <b>Incorpora y Gana</b>
            <span>Gana por cada nueva activa, hasta 3 campañas</span>
          </span>
          <fry-icon name="chevron-right-outline" size="20" />
        </button>
        <button className="enlace-fila" onClick={() => navegar(RUTAS.programas)}>
          <span>
            <b>Elige Crecer</b>
            <span>Bonos por crecimiento de activas</span>
          </span>
          <fry-icon name="chevron-right-outline" size="20" />
        </button>
        <p className="grupos__nota">🎉 {GRUPO_PERSONAL.celebraciones} celebraciones esta campaña, entre cumpleaños y logros. Reconocer sostiene la actividad.</p>
      </section>

      {confirmando && (
        <HojaInferior
          etiqueta="Confirmar aprobación de crédito"
          conCerrar
          onCerrar={() => setConfirmando(null)}
          pie={
            <>
              <fry-button hierarchy="secondary" full-width text="Cancelar" onfryClick={() => setConfirmando(null)} />
              <fry-button hierarchy="primary" full-width text="Confirmar aprobación" onfryClick={() => aprobar(confirmando)} />
            </>
          }
        >
          <div className="confirmar-credito">
            <h2 className="flujo__titulo">Aprobar crédito</h2>
            <p>
              Vas a aprobar el crédito de <b>{confirmando.nombre}</b>.
            </p>
            <dl>
              <div>
                <dt>Monto</dt>
                <dd>{dinero(confirmando.montoSolicitado)}</dd>
              </div>
              <div>
                <dt>Impacto en tu IM</dt>
                <dd className="acento">+{confirmando.impactoIM} pts</dd>
              </div>
            </dl>
            <p className="franja-aviso">Habilita su pedido, pero sube tu índice de morosidad. Revisa antes de confirmar.</p>
          </div>
        </HojaInferior>
      )}
    </div>
  )
}
