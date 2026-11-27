import { useState } from 'react'
import { CONFIG } from '../../config/demo.config'
import { SEGMENTOS, TEXTO_PODEROSA } from '../../config/directorio-bdm.data'
import { navegar, RUTAS } from '../../state/router'
import { Tag } from '../mis-grupos/comun'
import {
  EnlaceDemoVacia,
  etiquetaDe,
  HojaFiltros,
  INTENT_CUADRANTE,
  NIVEL,
  SIN_FILTROS,
  SinDirectoras,
  SinResultados,
  useDirectorio,
} from './directorio-comun'

/**
 * Alternativa A · Mis Grupos de la BDM: directorio de las directoras de su coordinación (MVP 18/11/2026).
 * · Chips de segmento combinables: se muestra la intersección.
 * · Buscador por nombre o código y botón "Filtrar" para los filtros adicionales.
 * · Cards con Tags y datos, sin botones de contacto: el clic lleva a la impostación.
 */
export function DirectorioBdm() {
  const dir = useDirectorio()
  const [filtrando, setFiltrando] = useState(false)
  const { todas, visibles, aplicados } = dir

  return (
    <div className="directorio">
      <header className="directorio__cabecera">
        <div>
          <p className="directorio__corte">
            {CONFIG.campana.corte} | {CONFIG.campana.actualizado} <span className="vercomo__demo">OPCIÓN 1</span>
          </p>
          <h1 className="t-titulo">Mis Grupos</h1>
          <p className="directorio__bajada">Todas las directoras de tu coordinación. Toca una para ver Maya como ella.</p>
        </div>

        {todas.length > 0 && (
          <>
            <div className="emprendedoras__buscar">
              <fry-searchbar
                placeholder="Buscar por nombre o código"
                name="busqueda-directorio"
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

            <div className="directorio__segmentos" role="group" aria-label="Segmentos de la metodología">
              {SEGMENTOS.map((s) => (
                <fry-chip
                  key={s.id}
                  type="filter"
                  size="small"
                  name="segmento-bdm"
                  value={s.id}
                  label={`${s.etiqueta} (${dir.cuantasCon(s.id)})`}
                  checked={dir.segmentos.includes(s.id)}
                  onfryChange={() => dir.alternarSegmento(s.id)}
                />
              ))}
            </div>

            {aplicados.length > 0 && (
              <div className="directorio__aplicados">
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
          </>
        )}
      </header>

      {todas.length === 0 ? (
        <SinDirectoras />
      ) : (
        <>
          <div className="directorio__contador" aria-live="polite">
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

          {visibles.length === 0 ? (
            <SinResultados dir={dir} />
          ) : (
            <ul className="directorio__lista">
              {visibles.map((d) => (
                <li key={d.codigo}>
                  <button className="dir-card" onClick={() => navegar(RUTAS.impostacion + d.codigo)} aria-label={`Ver Maya como ${d.nombre}`}>
                    <span className="dir-card__arriba">
                      <span className="dir-card__relacion">
                        {d.estatus} | {d.relacion} de {d.de}
                      </span>
                      <fry-icon name="chevron-right-outline" size="20" />
                    </span>
                    <span className="dir-card__nombre">{d.nombre}</span>
                    <span className="dir-card__codigo">
                      {NIVEL[d.estatus]} · Cód. {d.codigo}
                    </span>
                    <span className="dir-card__tags">
                      <Tag intent={INTENT_CUADRANTE[d.cuadrante]}>{`Cuadrante ${d.cuadrante}`}</Tag>
                      {d.nueva && <Tag intent="neutral">Nueva Directora</Tag>}
                      {d.potencialFormadora && <Tag intent="neutral">Potencial Formadora</Tag>}
                    </span>
                    <span className="dir-card__datos">
                      <span>
                        <span className="dir-card__dato-etiqueta">Enganche PAR</span>
                        <span className="dir-card__estrellas" aria-label={`${d.estrellas} de 6 estrellas`}>
                          <span aria-hidden>{'★'.repeat(d.estrellas)}</span>
                          <span className="dir-card__estrellas-vacias" aria-hidden>
                            {'★'.repeat(6 - d.estrellas)}
                          </span>
                        </span>
                      </span>
                      <span>
                        <span className="dir-card__dato-etiqueta">Líder Poderosa</span>
                        <span className={`dir-card__poderosa dir-card__poderosa--${d.liderPoderosa}`}>{TEXTO_PODEROSA[d.liderPoderosa]}</span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <EnlaceDemoVacia dir={dir} />

      {filtrando && <HojaFiltros dir={dir} onCerrar={() => setFiltrando(false)} />}
    </div>
  )
}
