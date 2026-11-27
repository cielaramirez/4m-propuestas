import { useMemo, useState } from 'react'
import { DIRECTORAS, META_HIJAS_EN_A, type Directora, type Tono } from '../../config/mi-grupo.data'
import { conMontos, dinero } from '../../domain/format'
import { navegar, RUTAS } from '../../state/router'
import { useDemo } from '../../state/store'
import { Anillo, Avatar, BarraNegocio, Semaforo, Tag, type IntentTag } from './comun'

const LENTES = [
  { id: 'prioridad', etiqueta: 'Prioridad', ayuda: 'Primero quién necesita ayuda (D → C → B → A). Las que están en A van al final.' },
  { id: 'cuadrante', etiqueta: 'Cuadrante', ayuda: 'Agrupadas por cuadrante: A · B · C · D.' },
  { id: 'metas', etiqueta: 'Metas', ayuda: 'Ordenadas por % de avance de su proyección: las más atrasadas primero.' },
  { id: 'empr', etiqueta: 'Emprendedoras', ayuda: 'Primero quién aún no tiene CEM o CES a cargo.' },
  { id: 'par', etiqueta: 'PAR+', ayuda: 'Ordenadas por cuánto le falta para su Estrella Sueño.' },
] as const

type Lente = (typeof LENTES)[number]['id']

const GENERACION: Record<number, string> = { 1: 'Hija', 2: 'Nieta', 3: 'Bisnieta' }
const RANGO: Record<string, number> = { D: 0, C: 1, B: 2, A: 3 }

const tonoCuadrante = (c: string): Tono => (c === 'A' ? 'ok' : c === 'D' ? 'peligro' : 'alerta')
/** Cuadrante con los intents del Tag de FrYDA: A success · B info · C warning · D danger. */
const INTENT_CUADRANTE: Record<string, IntentTag> = { A: 'success', B: 'info', C: 'warning', D: 'danger' }
const sinEmprendedoras = (d: Directora) => d.emprendedoras.cem + d.emprendedoras.ces === 0
const avance = (real: number, meta: number) => Math.min(100, Math.round((real / meta) * 100))

function cumplimiento(d: Directora): number {
  const partes = Object.values(d.metas)
  return Math.round((partes.reduce((s, m) => s + Math.min(1, m.meta ? m.real / m.meta : 0), 0) / partes.length) * 100)
}

function ordenar(lente: Lente): Directora[] {
  const lista = [...DIRECTORAS]
  switch (lente) {
    case 'prioridad':
      return lista.sort(
        (a, b) => RANGO[a.cuadrante] - RANGO[b.cuadrante] || Number(sinEmprendedoras(b)) - Number(sinEmprendedoras(a)),
      )
    case 'cuadrante':
      return lista.sort((a, b) => 'ABCD'.indexOf(a.cuadrante) - 'ABCD'.indexOf(b.cuadrante))
    case 'metas':
      return lista.sort((a, b) => cumplimiento(a) - cumplimiento(b))
    case 'empr':
      return lista.sort(
        (a, b) =>
          Number(sinEmprendedoras(b)) - Number(sinEmprendedoras(a)) ||
          a.emprendedoras.cem + a.emprendedoras.ces - (b.emprendedoras.cem + b.emprendedoras.ces),
      )
    case 'par':
      return lista.sort((a, b) => b.par.sueno - b.par.proyectada - (a.par.sueno - a.par.proyectada))
  }
}

function subtitulo(d: Directora, lente: Lente): string {
  switch (lente) {
    case 'metas':
      return `${cumplimiento(d)}% de su proyección`
    case 'empr':
      return d.emprendedoras.nota
    case 'par':
      return d.par.proyectada ? `Proyecta Estrella ${d.par.proyectada} · Sueño ${d.par.sueno}` : d.par.falta
    default:
      return d.cuadrante === 'A' ? 'En Cuadrante A' : conMontos(d.faltaA)
  }
}

export function MisDirectoras() {
  const { avisar } = useDemo()
  const [lente, setLente] = useState<Lente>('prioridad')
  const [abierta, setAbierta] = useState<string | null>(null)

  const resumen = useMemo(() => {
    const hijas = DIRECTORAS.filter((d) => d.generacion === 1)
    const cuenta = (k: string) => DIRECTORAS.filter((d) => d.cuadrante === k).length
    return {
      pctHijasA: Math.round((hijas.filter((d) => d.cuadrante === 'A').length / hijas.length) * 100),
      cuadrantes: (['A', 'B', 'C', 'D'] as const).map((k) => ({ k, n: cuenta(k) })),
      generaciones: [1, 2, 3].map((g) => ({ g, n: DIRECTORAS.filter((d) => d.generacion === g).length })),
    }
  }, [])

  const ordenadas = ordenar(lente)
  const principales = lente === 'prioridad' ? ordenadas.filter((d) => d.cuadrante !== 'A') : ordenadas
  const sanas = lente === 'prioridad' ? ordenadas.filter((d) => d.cuadrante === 'A') : []

  return (
    <div className="grupos__contenido">
      <section className="tarjeta resumen-red" aria-label="Resumen de tu red">
        <Anillo pct={resumen.pctHijasA} meta={META_HIJAS_EN_A} etiqueta="hijas en A" />
        <div className="resumen-red__datos">
          <p className={resumen.pctHijasA < META_HIJAS_EN_A ? 'resumen-red__meta resumen-red__meta--baja' : 'resumen-red__meta'}>
            Meta {META_HIJAS_EN_A}% para la Medalla de Liderazgo
          </p>
          <p className="resumen-red__titulo">Por cuadrante · {DIRECTORAS.length} directoras</p>
          <div
            className="barra-cuadrantes"
            role="img"
            aria-label={resumen.cuadrantes.map((q) => `${q.k} ${q.n}`).join(', ')}
          >
            {resumen.cuadrantes
              .filter((q) => q.n > 0)
              .map((q) => (
                <span key={q.k} className={`barra-cuadrantes__parte tag-fry--${INTENT_CUADRANTE[q.k]}`} style={{ flex: q.n }}>
                  {q.k} {q.n}
                </span>
              ))}
          </div>
          <p className="resumen-red__generaciones">
            {resumen.generaciones.map((x) => (
              <span key={x.g}>
                <b>{x.n}</b> {x.n === 1 ? GENERACION[x.g].toLowerCase() : `${GENERACION[x.g].toLowerCase()}s`}
              </span>
            ))}
          </p>
        </div>
      </section>

      <div>
        <div className="grupos__filtros" role="radiogroup" aria-label="Ordenar directoras">
          {LENTES.map((l) => (
            <fry-chip
              key={l.id}
              type="choice"
              size="small"
              name="lente-directoras"
              value={l.id}
              label={l.etiqueta}
              checked={lente === l.id}
              onfryChange={() => setLente(l.id)}
            />
          ))}
        </div>
        <p className="grupos__nota">{LENTES.find((l) => l.id === lente)?.ayuda}</p>
      </div>

      <ul className="tarjeta grupos__lista">
        {principales.map((d) => {
          const abiertaEsta = abierta === d.nombre
          return (
            <li key={d.nombre} className={`directora ${abiertaEsta ? 'directora--abierta' : ''}`}>
              <button className="directora__cabecera" aria-expanded={abiertaEsta} onClick={() => setAbierta(abiertaEsta ? null : d.nombre)}>
                <Semaforo tono={tonoCuadrante(d.cuadrante)} />
                <Avatar nombre={d.nombre} nivel={d.estatus} />
                <span className="fila-persona__info">
                  <b>
                    {d.nombre} <span className="generacion">{GENERACION[d.generacion]}</span>
                  </b>
                  <span>{subtitulo(d, lente)}</span>
                </span>
                <span className={`cuadrante tag-fry--${INTENT_CUADRANTE[d.cuadrante]}`} aria-label={`Cuadrante ${d.cuadrante}`}>
                  {d.cuadrante}
                </span>
                <fry-icon name={abiertaEsta ? 'chevron-up-outline' : 'chevron-down-outline'} size="20" />
              </button>

              {abiertaEsta && (
                <div className="directora__perfil">
                  <div className="dimension">
                    <span className="dimension__titulo">Cuadrante</span>
                    <p className="dimension__fila">
                      <span className={`cuadrante tag-fry--${INTENT_CUADRANTE[d.cuadrante]}`}>{d.cuadrante}</span>
                      {d.cuadrante === 'A' ? 'En crecimiento: cumple MRM y PPED' : conMontos(d.faltaA)}
                    </p>
                  </div>

                  <div className="dimension">
                    <span className="dimension__titulo">Metas · avance vs proyección</span>
                    {[
                      { etiqueta: 'Venta GP', m: d.metas.ventaGP, dinero: true },
                      { etiqueta: 'Activas', m: d.metas.activas },
                      { etiqueta: 'Primeros pedidos', m: d.metas.pped },
                      { etiqueta: 'Reactivas', m: d.metas.reactivas },
                      { etiqueta: 'Retenidas', m: d.metas.retenidas },
                    ].map(({ etiqueta, m, dinero: esDinero }) => (
                      <div key={etiqueta} className="meta">
                        <span className="meta__etiqueta">{etiqueta}</span>
                        <BarraNegocio valor={avance(m.real, m.meta)} feedback={m.real >= m.meta ? 'success' : 'default'} />
                        <span className="meta__valor">
                          {esDinero ? dinero(m.real) : m.real}
                          <span>/{esDinero ? dinero(m.meta) : m.meta}</span>
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="dimension">
                    <span className="dimension__titulo">Emprendedoras</span>
                    <p className="dimension__fila">
                      <span>
                        <b className="dimension__numero">{d.emprendedoras.cem}</b> CEM · <b className="dimension__numero">{d.emprendedoras.ces}</b> CES
                      </span>
                    </p>
                    <p className="dimension__ayuda">{d.emprendedoras.nota} · crecimiento en las últimas 4 campañas</p>
                    {d.emprendedoras.ces === 0 && (
                      <span>
                        <Tag intent="warning">Falta formar CES</Tag>
                      </span>
                    )}
                  </div>

                  <div className="dimension">
                    <span className="dimension__titulo">PAR+</span>
                    <p className="dimension__fila">
                      <span className="estrellas" aria-hidden>
                        {d.par.proyectada ? '★'.repeat(d.par.proyectada) : '—'}
                      </span>
                      Proyecta {d.par.proyectada ? `Estrella ${d.par.proyectada}` : 'sin proyección'} · Sueño Estrella {d.par.sueno}
                    </p>
                    <p className="dimension__ayuda">{d.par.falta}</p>
                  </div>

                  <div className="directora__acciones">
                    <fry-button
                      hierarchy="primary"
                      size="medium"
                      full-width
                      icon-left="calendar-outline"
                      text="Agendar coaching"
                      onfryClick={() => avisar(`Coaching con ${d.nombre.split(' ')[0]} agendado`)}
                    />
                    <fry-button hierarchy="secondary" size="medium" full-width text="Ver perfil completo" onfryClick={() => avisar('Fuera del alcance de esta demo')} />
                  </div>
                </div>
              )}
            </li>
          )
        })}

        {sanas.length > 0 && (
          <li className="sanas">
            <p className="sanas__titulo">En Cuadrante A ({sanas.length})</p>
            <div className="sanas__lista">
              {sanas.map((d) => (
                <button key={d.nombre} className="sana" onClick={() => { setLente('cuadrante'); setAbierta(d.nombre) }}>
                  <Semaforo tono="ok" />
                  {d.nombre}
                  <span className="generacion generacion--ok">{GENERACION[d.generacion]}</span>
                </button>
              ))}
            </div>
          </li>
        )}
      </ul>

      <p className="grupos__nota grupos__pie">
        Cada directora es <b>empresaria independiente</b> y gestiona el crédito de su propio grupo: por eso aquí no apruebas créditos. Su
        Cuadrante y su PAR+ son de ella. Los tuyos están en{' '}
        <button className="enlace" onClick={() => navegar(RUTAS.miNegocio)}>
          Mi negocio
        </button>
        .
      </p>
    </div>
  )
}
