import { useState, type ReactNode } from 'react'
import { HojaInferior } from '../../components/HojaInferior'
import { CONFIG } from '../../config/demo.config'
import { SEGMENTOS, TEXTO_PODEROSA, type DirectoraBdm, type SegmentoId } from '../../config/directorio-bdm.data'
import { navegar, RUTAS } from '../../state/router'
import { Tag, iniciales } from '../mis-grupos/comun'
import foto from '../../assets/figma/modal-1/photo-directora.jpg'
import {
  EnlaceDemoVacia,
  etiquetaDe,
  HojaFiltros,
  INTENT_CUADRANTE,
  useDirectorio,
  type Directorio,
  type Orden,
} from './directorio-comun'

/**
 * Opción 3 · Mis Grupos con la capa editorial del Brandbook 2024 sobre FrYDA.
 * · Titular corto en Ogg, líneas finas como recurso y la "ventana" con foto como sello.
 * · Segmentos como índice editorial (número grande + línea), combinables por intersección.
 * · Resumen en una frase y cuadrícula de 2 columnas (patrón Pokédex de Grupo Personal).
 * Componentes, Tags y tokens: FrYDA.
 */

const CORTO: Record<SegmentoId, string> = {
  nueva: 'Nuevas < 2 años',
  cuadranteD: 'Cuadrante D',
  formadora: 'Potenciales Formadoras',
}

/** Cómo se nombra cada segmento en la frase resumen, en singular y plural. */
const FRASE: Record<SegmentoId, [string, string]> = {
  nueva: ['nueva', 'nuevas'],
  cuadranteD: ['en Cuadrante D', 'en Cuadrante D'],
  formadora: ['potencial formadora', 'potenciales formadoras'],
}

const ORDENES: { id: Orden; etiqueta: string }[] = [
  { id: 'cuadrante', etiqueta: 'Cuadrante (D primero)' },
  { id: 'estrellas', etiqueta: 'Más estrellas PAR' },
  { id: 'nombre', etiqueta: 'Nombre (A–Z)' },
]

const dos = (n: number) => String(n).padStart(2, '0')

/** "3 directoras nuevas y en Cuadrante D": el resumen responde "¿cuántas?" en una frase. */
function resumen(dir: Directorio): string {
  const n = dir.visibles.length
  const base = n === 1 ? '1 directora' : `${n} directoras`
  if (dir.segmentos.length === 0) return dir.hayCriterios ? `${base} de ${dir.todas.length}` : `${base} en tu coordinación`
  const partes = SEGMENTOS.filter((s) => dir.segmentos.includes(s.id)).map((s) => FRASE[s.id][n === 1 ? 0 : 1])
  const unidas = partes.length > 1 ? `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}` : partes[0]
  return `${base} ${unidas}`
}

export function DirectorioBdmC() {
  const dir = useDirectorio('cuadrante')
  const [hoja, setHoja] = useState<'filtros' | 'orden' | null>(null)
  const { todas, visibles, aplicados } = dir

  return (
    <div className="op3">
      <header className="op3__hero">
        <div className="op3__hero-texto">
          <p className="op3__sobre">
            <span className="op3__linea" aria-hidden />
            Mis Grupos · {CONFIG.campana.corte}
            <span className="vercomo__demo">OPCIÓN 3</span>
          </p>
          <h1 className="op3__titular">
            Tus {todas.length}
            <br />
            directoras
          </h1>
          <p className="op3__bajada">Encuentra a cualquiera y entra a su vista.</p>
        </div>
        <div className="op3__ventana" aria-hidden>
          <img src={foto} alt="" />
        </div>
      </header>

      {todas.length === 0 ? (
        <VacioC titulo="Aún sin directoras" texto="Cuando te asignen directoras a tu coordinación, aparecerán aquí. Los datos se actualizan cada hora." />
      ) : (
        <>
          <div className="op3__buscar">
            <fry-searchbar
              placeholder="Buscar por nombre o código"
              name="busqueda-directorio-c"
              value={dir.busqueda}
              onfryInput={(e: CustomEvent<{ value: string }>) => dir.setBusqueda(e.detail.value)}
              onfryClear={() => dir.setBusqueda('')}
            />
          </div>

          <section className="op3__indice" aria-label="Segmentos de la metodología (combinables)">
            {SEGMENTOS.map((s) => {
              const activo = dir.segmentos.includes(s.id)
              const n = dir.cuantasCon(s.id)
              return (
                <button
                  key={s.id}
                  className={`op3__segmento ${activo ? 'op3__segmento--activo' : ''}`}
                  aria-pressed={activo}
                  aria-label={`${s.etiqueta}: ${n}`}
                  onClick={() => dir.alternarSegmento(s.id)}
                >
                  <span className={n === 0 && !activo ? 'op3__numero op3__numero--cero' : 'op3__numero'}>{dos(n)}</span>
                  <span className="op3__segmento-nombre">{CORTO[s.id]}</span>
                  <span className="op3__marca" aria-hidden>
                    {activo && <fry-icon name="check-outline" size="12" />}
                  </span>
                </button>
              )
            })}
          </section>

          <div className="op3__resumen" aria-live="polite">
            <p>{resumen(dir)}</p>
            <div className="op3__acciones">
              <button className="op3__accion" onClick={() => setHoja('orden')}>
                Ordenar
              </button>
              <span className="op3__diagonal" aria-hidden />
              <button className="op3__accion" onClick={() => setHoja('filtros')}>
                Filtros{aplicados.length > 0 && ` (${aplicados.length})`}
              </button>
            </div>
          </div>

          {(aplicados.length > 0 || dir.hayCriterios) && (
            <div className="op3__aplicados">
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
            <VacioC
              titulo="Sin coincidencias"
              texto={
                dir.segmentos.length > 1
                  ? 'Ninguna directora cumple todos los segmentos que elegiste a la vez. Quita uno para ampliar la búsqueda.'
                  : 'Prueba quitando un segmento, un filtro o cambiando la búsqueda.'
              }
              accion={<fry-button hierarchy="secondary" size="medium" text="Limpiar filtros" onfryClick={dir.limpiarTodo} />}
            />
          ) : (
            <ul className="op3__grilla">
              {visibles.map((d) => (
                <li key={d.codigo}>
                  <TarjetaC d={d} />
                </li>
              ))}
            </ul>
          )}
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

/** Card de la cuadrícula: monograma en Ogg sobre color de soporte (la "ventana"), datos debajo. */
function TarjetaC({ d }: { d: DirectoraBdm }) {
  return (
    <button className="op3__card" onClick={() => navegar(RUTAS.impostacion + d.codigo)} aria-label={`Ver Maya como ${d.nombre}`}>
      <span className={`op3__monograma op3__monograma--${d.estatus.toLowerCase()}`}>
        <span aria-hidden>{iniciales(d.nombre)}</span>
        <span className="op3__cuadrante">
          <Tag intent={INTENT_CUADRANTE[d.cuadrante]}>{d.cuadrante}</Tag>
        </span>
      </span>
      <span className="op3__card-cuerpo">
        <span className="op3__nombre">{d.nombre}</span>
        <span className="op3__codigo">
          {d.estatus} · {d.codigo}
        </span>
        {(d.nueva || d.potencialFormadora) && (
          <span className="op3__marcas">
            {d.nueva && <span className="op3__punto op3__punto--nueva">Nueva</span>}
            {d.potencialFormadora && <span className="op3__punto op3__punto--formadora">Formadora</span>}
          </span>
        )}
        <span className="op3__datos">
          <span className={d.estrellas ? 'op3__estrellas' : 'op3__estrellas op3__estrellas--cero'} aria-label={`${d.estrellas} estrellas PAR`}>
            ★ {d.estrellas}
          </span>
          <span className="op3__poderosa" aria-label={`Líder Poderosa: ${TEXTO_PODEROSA[d.liderPoderosa]}`}>
            {TEXTO_PODEROSA[d.liderPoderosa]}
          </span>
        </span>
      </span>
    </button>
  )
}

function VacioC({ titulo, texto, accion }: { titulo: string; texto: string; accion?: ReactNode }) {
  return (
    <div className="op3__vacio">
      <span className="op3__linea op3__linea--centro" aria-hidden />
      <h2>{titulo}</h2>
      <p>{texto}</p>
      {accion}
    </div>
  )
}
