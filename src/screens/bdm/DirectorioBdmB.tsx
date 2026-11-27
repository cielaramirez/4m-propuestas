import { useState } from 'react'
import { HojaInferior } from '../../components/HojaInferior'
import { CONFIG } from '../../config/demo.config'
import { SEGMENTOS, TEXTO_PODEROSA } from '../../config/directorio-bdm.data'
import { navegar, RUTAS } from '../../state/router'
import {
  EnlaceDemoVacia,
  etiquetaDe,
  HojaFiltros,
  INTENT_CUADRANTE,
  SinDirectoras,
  SinResultados,
  useDirectorio,
  type Orden,
} from './directorio-comun'

const ORDENES: { id: Orden; etiqueta: string }[] = [
  { id: 'cuadrante', etiqueta: 'Cuadrante (D primero)' },
  { id: 'estrellas', etiqueta: 'Más estrellas PAR' },
  { id: 'nombre', etiqueta: 'Nombre (A–Z)' },
]

/** Nombres cortos de los segmentos para las tarjetas. */
const CORTO: Record<string, { titulo: string; detalle: string }> = {
  nueva: { titulo: 'Nuevas', detalle: 'Directoras < 2 años' },
  cuadranteD: { titulo: 'Cuadrante D', detalle: 'Sin MRM ni PPED' },
  formadora: { titulo: 'Potenciales', detalle: 'Formadoras' },
}

/**
 * Alternativa B · directorio en formato compacto.
 * · Los 3 segmentos son tarjetas con su conteo: se leen al mismo nivel y responden "¿cuántas?" antes de tocar.
 * · Barra de resultados con contador, orden y filtros, separada de los segmentos.
 * · Lista de filas compactas para ver más directoras por pantalla; el cuadrante abre cada fila.
 */
export function DirectorioBdmB() {
  const dir = useDirectorio('cuadrante')
  const [hoja, setHoja] = useState<'filtros' | 'orden' | null>(null)
  const { todas, visibles, aplicados } = dir

  return (
    <div className="directorio directorio--b">
      <header className="directorio__cabecera">
        <div>
          <p className="directorio__corte">
            {CONFIG.campana.corte} | {CONFIG.campana.actualizado} <span className="vercomo__demo">OPCIÓN 2</span>
          </p>
          <h1 className="t-titulo">Mis Grupos</h1>
          <p className="directorio__bajada">Tus directoras por segmento de la metodología. Toca una para ver Maya como ella.</p>
        </div>

        {todas.length > 0 && (
          <>
            <fry-searchbar
              placeholder="Buscar por nombre o código"
              name="busqueda-directorio-b"
              value={dir.busqueda}
              onfryInput={(e: CustomEvent<{ value: string }>) => dir.setBusqueda(e.detail.value)}
              onfryClear={() => dir.setBusqueda('')}
            />

            <div className="segmentos-b" role="group" aria-label="Segmentos de la metodología (combinables)">
              {SEGMENTOS.map((s) => {
                const activo = dir.segmentos.includes(s.id)
                const n = dir.cuantasCon(s.id)
                return (
                  <button
                    key={s.id}
                    className={`segmento-b ${activo ? 'segmento-b--activo' : ''}`}
                    aria-pressed={activo}
                    aria-label={`${s.etiqueta}: ${n}`}
                    onClick={() => dir.alternarSegmento(s.id)}
                  >
                    <span className="segmento-b__arriba">
                      <span className="segmento-b__n">{n}</span>
                      <span className="segmento-b__check" aria-hidden>
                        {activo && <fry-icon name="check-outline" size="16" />}
                      </span>
                    </span>
                    <span className="segmento-b__titulo">{CORTO[s.id].titulo}</span>
                    <span className="segmento-b__detalle">{CORTO[s.id].detalle}</span>
                  </button>
                )
              })}
            </div>
            {dir.segmentos.length > 1 && <p className="segmentos-b__ayuda">Ves las que cumplen todos los segmentos elegidos.</p>}
          </>
        )}
      </header>

      {todas.length === 0 ? (
        <SinDirectoras />
      ) : (
        <>
          <div className="barra-b" aria-live="polite">
            <p className="barra-b__contador">
              <b>{visibles.length === 1 ? '1 directora' : `${visibles.length} directoras`}</b>
              {dir.hayCriterios && <span> de {todas.length}</span>}
            </p>
            <div className="barra-b__acciones">
              <button className="barra-b__boton" onClick={() => setHoja('orden')}>
                Ordenar
                <fry-icon name="chevron-down-outline" size="16" />
              </button>
              <button className="barra-b__boton" onClick={() => setHoja('filtros')}>
                Filtros{aplicados.length > 0 && <span className="barra-b__cuenta">{aplicados.length}</span>}
              </button>
            </div>
          </div>

          {(aplicados.length > 0 || dir.hayCriterios) && (
            <div className="directorio__aplicados directorio__aplicados--b">
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
              <button className="enlace" onClick={dir.limpiarTodo}>
                Limpiar todo
              </button>
            </div>
          )}

          {visibles.length === 0 ? (
            <SinResultados dir={dir} />
          ) : (
            <ul className="tarjeta lista-b">
              {visibles.map((d) => (
                <li key={d.codigo}>
                  <button className="fila-b" onClick={() => navegar(RUTAS.impostacion + d.codigo)} aria-label={`Ver Maya como ${d.nombre}`}>
                    <span className={`cuadrante tag-fry--${INTENT_CUADRANTE[d.cuadrante]}`} aria-label={`Cuadrante ${d.cuadrante}`}>
                      {d.cuadrante}
                    </span>
                    <span className="fila-b__info">
                      <b className="fila-b__nombre">{d.nombre}</b>
                      <span className="fila-b__meta">
                        {d.estatus} · Cód. {d.codigo}
                      </span>
                      {(d.nueva || d.potencialFormadora) && (
                        <span className="fila-b__marcas">
                          {d.nueva && <span className="marca-b">Nueva</span>}
                          {d.potencialFormadora && <span className="marca-b">Pot. Formadora</span>}
                        </span>
                      )}
                    </span>
                    <span className="fila-b__datos">
                      <span className={`fila-b__estrellas ${d.estrellas === 0 ? 'fila-b__estrellas--cero' : ''}`} aria-label={`${d.estrellas} estrellas PAR`}>
                        <span aria-hidden>★</span> {d.estrellas}
                      </span>
                      <span className={`fila-b__poderosa dir-card__poderosa--${d.liderPoderosa}`} aria-label={`Líder Poderosa: ${TEXTO_PODEROSA[d.liderPoderosa]}`}>
                        {TEXTO_PODEROSA[d.liderPoderosa]}
                      </span>
                    </span>
                    <fry-icon name="chevron-right-outline" size="16" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="leyenda-b">A la derecha: ★ estrellas de Enganche PAR y estado de Líder Poderosa.</p>
        </>
      )}

      <EnlaceDemoVacia dir={dir} />

      {hoja === 'filtros' && <HojaFiltros dir={dir} onCerrar={() => setHoja(null)} />}
      {hoja === 'orden' && (
        <HojaInferior etiqueta="Ordenar directoras" conCerrar onCerrar={() => setHoja(null)} className="hoja--filtro">
          <div className="filtro">
            <h2 className="flujo__titulo">Ordenar por</h2>
            <ul>
              {ORDENES.map((o) => (
                <li key={o.id}>
                  <button
                    className={`filtro__opcion ${dir.orden === o.id ? 'filtro__opcion--activa' : ''}`}
                    aria-pressed={dir.orden === o.id}
                    onClick={() => {
                      dir.setOrden(o.id)
                      setHoja(null)
                    }}
                  >
                    {o.etiqueta}
                    {dir.orden === o.id && <fry-icon name="check-outline" size="20" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </HojaInferior>
      )}
    </div>
  )
}
