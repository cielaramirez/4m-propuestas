import { useState } from 'react'
import { CONFIG } from '../../config/demo.config'
import { SEGMENTOS, TEXTO_PODEROSA, type DirectoraBdm, type EstadoPoderosa } from '../../config/directorio-bdm.data'
import { navegar, RUTAS } from '../../state/router'
import { Anillo, Avatar, Semaforo, Tag } from '../mis-grupos/comun'
import type { Tono } from '../../config/mi-grupo.data'
import {
  EnlaceDemoVacia,
  etiquetaDe,
  HojaFiltros,
  INTENT_CUADRANTE,
  SIN_FILTROS,
  SinDirectoras,
  SinResultados,
  useDirectorio,
} from './directorio-comun'

/**
 * Opción 4 · Mis Grupos con el patrón "Equipo" de Gio (maya-redesign /n/equipo), adaptado a la BDM.
 * · Resumen visual arriba (anillo + barra por cuadrante) que además filtra: tocar un tramo de la barra filtra la lista.
 * · Segmentos de la metodología combinables (intersección), buscador por nombre o código y filtros adicionales.
 * · Lentes que reordenan la misma lista; en Prioridad las que están en A se agrupan al final.
 * · Filas expandibles con las dimensiones de la directora y "Ver Maya como ella" (impostación). Sin contacto.
 */

const LENTES = [
  { id: 'prioridad', etiqueta: 'Prioridad', ayuda: 'Primero quién necesita ayuda (D → C → B). Las que están en A van al final.' },
  { id: 'cuadrante', etiqueta: 'Cuadrante', ayuda: 'Agrupadas por cuadrante: A · B · C · D.' },
  { id: 'par', etiqueta: 'PAR+', ayuda: 'De más a menos estrellas de Enganche PAR.' },
  { id: 'poderosa', etiqueta: 'Líder Poderosa', ayuda: 'Primero las que proyectan, luego las que están en camino.' },
] as const

type Lente = (typeof LENTES)[number]['id']

/** Qué significa cada cuadrante (fórmula MRM × PPED). */
const LECTURA: Record<DirectoraBdm['cuadrante'], string> = {
  A: 'Cumple MRM y primeros pedidos',
  B: 'Cumple MRM · le faltan primeros pedidos',
  C: 'Cumple primeros pedidos · le falta MRM',
  D: 'Le faltan MRM y primeros pedidos',
}

const RANGO_PODEROSA: Record<EstadoPoderosa, number> = { proyecta: 0, 'en-camino': 1, 'no-proyecta': 2 }
const tonoCuadrante = (c: string): Tono => (c === 'A' ? 'ok' : c === 'D' ? 'peligro' : 'alerta')

function ordenar(lista: DirectoraBdm[], lente: Lente): DirectoraBdm[] {
  const arr = [...lista]
  const nombre = (a: DirectoraBdm, b: DirectoraBdm) => a.nombre.localeCompare(b.nombre, 'es')
  switch (lente) {
    case 'prioridad':
      return arr.sort((a, b) => 'DCBA'.indexOf(a.cuadrante) - 'DCBA'.indexOf(b.cuadrante) || Number(b.nueva) - Number(a.nueva) || nombre(a, b))
    case 'cuadrante':
      return arr.sort((a, b) => 'ABCD'.indexOf(a.cuadrante) - 'ABCD'.indexOf(b.cuadrante) || nombre(a, b))
    case 'par':
      return arr.sort((a, b) => b.estrellas - a.estrellas || nombre(a, b))
    case 'poderosa':
      return arr.sort((a, b) => RANGO_PODEROSA[a.liderPoderosa] - RANGO_PODEROSA[b.liderPoderosa] || b.estrellas - a.estrellas)
  }
}

function subtitulo(d: DirectoraBdm, lente: Lente): string {
  if (lente === 'par') return d.estrellas ? `Enganche PAR: ${d.estrellas} ${d.estrellas === 1 ? 'estrella' : 'estrellas'}` : 'Sin estrellas PAR aún'
  if (lente === 'poderosa') return `Líder Poderosa: ${TEXTO_PODEROSA[d.liderPoderosa]}`
  return `${d.estatus} · Cód. ${d.codigo}`
}

export function DirectorioBdmD() {
  const dir = useDirectorio()
  const [lente, setLente] = useState<Lente>('prioridad')
  const [abierta, setAbierta] = useState<string | null>(null)
  const [filtrando, setFiltrando] = useState(false)
  const { todas, visibles, aplicados } = dir

  // Resumen de toda la coordinación (no cambia con los filtros: es el mapa general).
  const enA = todas.filter((d) => d.cuadrante === 'A').length
  const pctA = todas.length ? Math.round((enA / todas.length) * 100) : 0
  const porCuadrante = (['A', 'B', 'C', 'D'] as const).map((k) => ({ k, n: todas.filter((d) => d.cuadrante === k).length }))
  const cuadrantesActivos = dir.filtros.cuadrante

  const ordenadas = ordenar(visibles, lente)
  const principales = lente === 'prioridad' ? ordenadas.filter((d) => d.cuadrante !== 'A') : ordenadas
  const sanas = lente === 'prioridad' ? ordenadas.filter((d) => d.cuadrante === 'A') : []

  return (
    <div className="grupos op4">
      <header className="grupos__cabecera">
        <p className="t-sutil">
          {CONFIG.campana.corte} | {CONFIG.campana.actualizado} <span className="vercomo__demo">OPCIÓN 4</span>
        </p>
        <h1 className="t-titulo">Mis Grupos</h1>
        <p className="grupos__bajada">Tu coordinación de un vistazo: a quién trabajar esta semana.</p>
      </header>

      {todas.length === 0 ? (
        <SinDirectoras />
      ) : (
        <div className="grupos__contenido">
          {/* Resumen visual que además filtra */}
          <section className="tarjeta resumen-red" aria-label="Resumen de tu coordinación">
            <Anillo pct={pctA} etiqueta="en A" />
            <div className="resumen-red__datos">
              <p className="resumen-red__meta">{enA} de {todas.length} directoras en Cuadrante A</p>
              <p className="resumen-red__titulo">Por cuadrante</p>
              <div className="barra-cuadrantes op4__barra" role="group" aria-label="Filtrar por cuadrante">
                {porCuadrante
                  .filter((q) => q.n > 0)
                  .map((q) => {
                    const activo = cuadrantesActivos.includes(q.k)
                    const atenuado = cuadrantesActivos.length > 0 && !activo
                    return (
                      <button
                        key={q.k}
                        className={`barra-cuadrantes__parte tag-fry--${INTENT_CUADRANTE[q.k]} ${activo ? 'op4__parte--activa' : ''} ${atenuado ? 'op4__parte--atenuada' : ''}`}
                        style={{ flex: q.n }}
                        aria-pressed={activo}
                        aria-label={`Cuadrante ${q.k}: ${q.n} directoras`}
                        onClick={() => dir.alternarFiltro('cuadrante', q.k)}
                      >
                        {q.k} {q.n}
                      </button>
                    )
                  })}
              </div>
              <p className="op4__pista">Toca un cuadrante para filtrar la lista.</p>
            </div>
          </section>

          <div>
            <div className="emprendedoras__buscar">
              <fry-searchbar
                placeholder="Buscar por nombre o código"
                name="busqueda-directorio-d"
                value={dir.busqueda}
                onfryInput={(e: CustomEvent<{ value: string }>) => dir.setBusqueda(e.detail.value)}
                onfryClear={() => dir.setBusqueda('')}
              />
              <fry-button
                hierarchy="secondary"
                size="large"
                text={aplicados.length ? `Filtrar (${aplicados.length})` : 'Filtrar'}
                onfryClick={() => setFiltrando(true)}
              />
            </div>

            <p className="op4__rotulo">Segmentos</p>
            <div className="grupos__filtros op4__fila" role="group" aria-label="Segmentos de la metodología">
              {SEGMENTOS.map((s) => (
                <fry-chip
                  key={s.id}
                  type="filter"
                  size="small"
                  name="segmento-d"
                  value={s.id}
                  label={`${s.etiqueta} (${dir.cuantasCon(s.id)})`}
                  checked={dir.segmentos.includes(s.id)}
                  onfryChange={() => dir.alternarSegmento(s.id)}
                />
              ))}
            </div>

            <p className="op4__rotulo">Ver por</p>
            <div className="grupos__filtros op4__fila" role="radiogroup" aria-label="Ordenar la lista">
              {LENTES.map((l) => (
                <fry-chip
                  key={l.id}
                  type="choice"
                  size="small"
                  name="lente-d"
                  value={l.id}
                  label={l.etiqueta}
                  checked={lente === l.id}
                  onfryChange={() => setLente(l.id)}
                />
              ))}
            </div>
            <p className="grupos__nota">{LENTES.find((l) => l.id === lente)?.ayuda}</p>
          </div>

          <div>
            <div className="directorio__contador op4__contador" aria-live="polite">
              <p>
                <b>{visibles.length === 1 ? '1 directora' : `${visibles.length} directoras`}</b>
                {dir.hayCriterios && <span> de {todas.length}</span>}
              </p>
              {dir.hayCriterios && (
                <button className="enlace" onClick={dir.limpiarTodo}>
                  Limpiar todo
                </button>
              )}
            </div>
            {aplicados.length > 0 && (
              <div className="directorio__aplicados op4__aplicados">
                <button className="enlace" onClick={() => dir.setFiltros(SIN_FILTROS)}>
                  Limpiar
                </button>
                {aplicados.map((a) => (
                  <fry-chip
                    key={`${a.grupo}-${a.valor}`}
                    type="input"
                    size="small"
                    label={etiquetaDe(a.grupo, a.valor)}
                    checked
                    onfryChipDismiss={() => dir.alternarFiltro(a.grupo, a.valor)}
                  />
                ))}
              </div>
            )}
          </div>

          {visibles.length === 0 ? (
            <SinResultados dir={dir} />
          ) : (
            <ul className="tarjeta grupos__lista">
              {principales.map((d) => {
                const abiertaEsta = abierta === d.codigo
                return (
                  <li key={d.codigo} className={`directora ${abiertaEsta ? 'directora--abierta' : ''}`}>
                    <button className="directora__cabecera" aria-expanded={abiertaEsta} onClick={() => setAbierta(abiertaEsta ? null : d.codigo)}>
                      <Semaforo tono={tonoCuadrante(d.cuadrante)} />
                      <Avatar nombre={d.nombre} nivel={d.estatus} />
                      <span className="fila-persona__info">
                        <b>
                          {d.nombre}
                          {d.nueva && <span className="generacion">Nueva</span>}
                          {d.potencialFormadora && <span className="generacion generacion--formadora">Formadora</span>}
                        </b>
                        <span>{subtitulo(d, lente)}</span>
                      </span>
                      <span className={`cuadrante tag-fry--${INTENT_CUADRANTE[d.cuadrante]}`} aria-label={`Cuadrante ${d.cuadrante}`}>
                        {d.cuadrante}
                      </span>
                      <fry-icon name={abiertaEsta ? 'chevron-up-outline' : 'chevron-down-outline'} size="20" />
                    </button>

                    {abiertaEsta && <PerfilD d={d} />}
                  </li>
                )
              })}

              {sanas.length > 0 && (
                <li className="sanas">
                  <p className="sanas__titulo">En Cuadrante A ({sanas.length})</p>
                  <div className="sanas__lista">
                    {sanas.map((d) => (
                      <button
                        key={d.codigo}
                        className="sana"
                        onClick={() => {
                          setLente('cuadrante')
                          setAbierta(d.codigo)
                        }}
                      >
                        <Semaforo tono="ok" />
                        {d.nombre.split(' ').slice(0, 2).join(' ')}
                      </button>
                    ))}
                  </div>
                </li>
              )}
            </ul>
          )}

          <p className="grupos__nota grupos__pie">
            Cada directora gestiona su propio grupo. Desde aquí la encuentras y entras a su vista; para accionar, usa las cards de Gestión de BDM.
          </p>
        </div>
      )}

      <EnlaceDemoVacia dir={dir} />

      {filtrando && <HojaFiltros dir={dir} onCerrar={() => setFiltrando(false)} />}
    </div>
  )
}

/** Perfil desplegable: las dimensiones de la directora y la entrada a su vista (impostación). */
function PerfilD({ d }: { d: DirectoraBdm }) {
  const nombre = d.nombre.split(' ')[0]
  return (
    <div className="directora__perfil">
      <div className="op4__dimensiones">
        <div className="dimension">
          <span className="dimension__titulo">Cuadrante</span>
          <p className="dimension__fila">
            <span className={`cuadrante tag-fry--${INTENT_CUADRANTE[d.cuadrante]}`}>{d.cuadrante}</span>
            {LECTURA[d.cuadrante]}
          </p>
        </div>
        <div className="dimension">
          <span className="dimension__titulo">Enganche PAR</span>
          <p className="dimension__fila">
            <span className="estrellas" aria-label={`${d.estrellas} de 6 estrellas`}>
              <span aria-hidden>{'★'.repeat(d.estrellas)}</span>
              <span className="op4__estrellas-vacias" aria-hidden>
                {'★'.repeat(6 - d.estrellas)}
              </span>
            </span>
          </p>
        </div>
        <div className="dimension">
          <span className="dimension__titulo">Líder Poderosa</span>
          <p className={`dimension__fila dir-card__poderosa dir-card__poderosa--${d.liderPoderosa}`}>{TEXTO_PODEROSA[d.liderPoderosa]}</p>
        </div>
        <div className="dimension">
          <span className="dimension__titulo">Segmentos</span>
          <div className="op4__tags">
            {d.nueva && <Tag intent="neutral">Nueva Directora</Tag>}
            {d.potencialFormadora && <Tag intent="neutral">Potencial Formadora</Tag>}
            {d.cuadrante === 'D' && <Tag intent="danger">Cuadrante D</Tag>}
            {!d.nueva && !d.potencialFormadora && d.cuadrante !== 'D' && <span className="dimension__ayuda">Fuera de los 3 segmentos</span>}
          </div>
        </div>
      </div>
      <p className="dimension__ayuda op4__relacion">
        {d.estatus === 'JNR' ? 'Directora Junior' : 'Directora Senior'} · {d.relacion} de {d.de} · Cód. {d.codigo}
      </p>
      <div className="directora__acciones">
        <fry-button
          hierarchy="primary"
          size="medium"
          full-width
          icon-right="arrow-right-outline"
          text={`Ver Maya como ${nombre}`}
          onfryClick={() => navegar(RUTAS.impostacion + d.codigo)}
        />
      </div>
    </div>
  )
}
