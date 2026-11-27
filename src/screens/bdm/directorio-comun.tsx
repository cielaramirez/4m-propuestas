import { useState } from 'react'
import { HojaInferior } from '../../components/HojaInferior'
import {
  DIRECTORAS_BDM,
  SEGMENTOS,
  TEXTO_PODEROSA,
  type DirectoraBdm,
  type EstadoPoderosa,
  type SegmentoId,
} from '../../config/directorio-bdm.data'
import type { IntentTag } from '../mis-grupos/comun'

/** Lógica compartida por las dos alternativas del directorio de la BDM: solo cambia el diseño. */

export type Filtros = {
  estatus: string[]
  cuadrante: string[]
  par: string[]
  poderosa: EstadoPoderosa[]
}

export type Orden = 'nombre' | 'cuadrante' | 'estrellas'

export const SIN_FILTROS: Filtros = { estatus: [], cuadrante: [], par: [], poderosa: [] }

/** Filtros adicionales. TODO: confirmar que sean los mismos de las secciones de Gestión de BDM. */
export const GRUPOS_FILTRO = [
  {
    id: 'estatus',
    titulo: 'Status',
    opciones: [
      { valor: 'JNR', etiqueta: 'Junior' },
      { valor: 'SNR', etiqueta: 'Senior' },
    ],
  },
  {
    id: 'cuadrante',
    titulo: 'Cuadrante',
    opciones: ['A', 'B', 'C', 'D'].map((c) => ({ valor: c, etiqueta: `Cuadrante ${c}` })),
  },
  {
    id: 'par',
    titulo: 'Enganche PAR actual',
    opciones: [
      { valor: '0', etiqueta: 'Sin estrella' },
      { valor: '1-2', etiqueta: '1 a 2 estrellas' },
      { valor: '3+', etiqueta: '3 o más estrellas' },
    ],
  },
  {
    id: 'poderosa',
    titulo: 'Líder Poderosa',
    opciones: (['proyecta', 'en-camino', 'no-proyecta'] as EstadoPoderosa[]).map((v) => ({ valor: v, etiqueta: TEXTO_PODEROSA[v] })),
  },
] as const

export const INTENT_CUADRANTE: Record<DirectoraBdm['cuadrante'], IntentTag> = { A: 'success', B: 'info', C: 'warning', D: 'danger' }
export const NIVEL: Record<DirectoraBdm['estatus'], string> = { JNR: 'Junior', SNR: 'Senior' }

function sinTildes(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function rangoPar(estrellas: number): string {
  return estrellas === 0 ? '0' : estrellas <= 2 ? '1-2' : '3+'
}

function cumpleFiltros(d: DirectoraBdm, f: Filtros): boolean {
  return (
    (f.estatus.length === 0 || f.estatus.includes(d.estatus)) &&
    (f.cuadrante.length === 0 || f.cuadrante.includes(d.cuadrante)) &&
    (f.par.length === 0 || f.par.includes(rangoPar(d.estrellas))) &&
    (f.poderosa.length === 0 || f.poderosa.includes(d.liderPoderosa))
  )
}

export function etiquetaDe(grupo: keyof Filtros, valor: string): string {
  const g = GRUPOS_FILTRO.find((x) => x.id === grupo)
  return g?.opciones.find((o) => o.valor === valor)?.etiqueta ?? valor
}

function conSegmentos(lista: DirectoraBdm[], ids: SegmentoId[]): DirectoraBdm[] {
  return lista.filter((d) => ids.every((id) => SEGMENTOS.find((s) => s.id === id)!.cumple(d)))
}

const ORDENAR: Record<Orden, (a: DirectoraBdm, b: DirectoraBdm) => number> = {
  nombre: (a, b) => a.nombre.localeCompare(b.nombre, 'es'),
  cuadrante: (a, b) => 'DCBA'.indexOf(a.cuadrante) - 'DCBA'.indexOf(b.cuadrante) || a.nombre.localeCompare(b.nombre, 'es'),
  estrellas: (a, b) => b.estrellas - a.estrellas || a.nombre.localeCompare(b.nombre, 'es'),
}

/** Estado del directorio: segmentos (intersección), búsqueda por nombre o código, filtros y orden. */
export function useDirectorio(ordenInicial: Orden | null = null) {
  const [segmentos, setSegmentos] = useState<SegmentoId[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtros, setFiltros] = useState<Filtros>(SIN_FILTROS)
  const [orden, setOrden] = useState<Orden | null>(ordenInicial)
  // Solo para la demo: simula una BDM sin directoras asignadas.
  const [coordinacionVacia, setCoordinacionVacia] = useState(false)

  const todas = coordinacionVacia ? [] : DIRECTORAS_BDM
  const texto = sinTildes(busqueda.trim())

  const filtradas = conSegmentos(todas, segmentos)
    .filter((d) => cumpleFiltros(d, filtros))
    .filter((d) => texto === '' || sinTildes(d.nombre).includes(texto) || d.codigo.includes(texto.replace(/\s/g, '')))
  const visibles = orden ? [...filtradas].sort(ORDENAR[orden]) : filtradas

  const aplicados = (Object.keys(filtros) as (keyof Filtros)[]).flatMap((g) => filtros[g].map((v) => ({ grupo: g, valor: v })))
  const hayCriterios = segmentos.length > 0 || aplicados.length > 0 || texto !== ''

  return {
    todas,
    visibles,
    segmentos,
    busqueda,
    setBusqueda,
    filtros,
    setFiltros,
    aplicados,
    hayCriterios,
    orden,
    setOrden,
    coordinacionVacia,
    setCoordinacionVacia,
    alternarSegmento: (id: SegmentoId) => setSegmentos((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])),
    alternarFiltro: (grupo: keyof Filtros, valor: string) =>
      setFiltros((f) => {
        const actual = f[grupo] as string[]
        return { ...f, [grupo]: actual.includes(valor) ? actual.filter((v) => v !== valor) : [...actual, valor] }
      }),
    limpiarTodo: () => {
      setSegmentos([])
      setFiltros(SIN_FILTROS)
      setBusqueda('')
    },
    /** Cuántas quedarían al sumar (o mantener) este segmento: anticipa la intersección. */
    cuantasCon: (id: SegmentoId) =>
      segmentos.includes(id) ? conSegmentos(todas, segmentos).length : conSegmentos(todas, [...segmentos, id]).length,
  }
}

export type Directorio = ReturnType<typeof useDirectorio>

/** Hoja de filtros adicionales (igual en ambas alternativas). */
export function HojaFiltros({ dir, onCerrar }: { dir: Directorio; onCerrar: () => void }) {
  const n = dir.visibles.length
  return (
    <HojaInferior
      etiqueta="Filtros adicionales"
      conCerrar
      onCerrar={onCerrar}
      pie={
        <>
          <fry-button hierarchy="secondary" full-width text="Limpiar" onfryClick={() => dir.setFiltros(SIN_FILTROS)} />
          <fry-button hierarchy="primary" full-width text={n === 1 ? 'Ver 1 directora' : `Ver ${n} directoras`} onfryClick={onCerrar} />
        </>
      }
    >
      <div className="filtros-bdm">
        <h2 className="flujo__titulo">Filtros adicionales</h2>
        {GRUPOS_FILTRO.map((g) => (
          <fieldset key={g.id} className="filtros-bdm__grupo">
            <legend>{g.titulo}</legend>
            <div className="filtros-bdm__chips">
              {g.opciones.map((o) => (
                <fry-chip
                  key={o.valor}
                  type="filter"
                  size="small"
                  name={`filtro-${g.id}`}
                  value={o.valor}
                  label={o.etiqueta}
                  checked={(dir.filtros[g.id] as string[]).includes(o.valor)}
                  onfryChange={() => dir.alternarFiltro(g.id, o.valor)}
                />
              ))}
            </div>
          </fieldset>
        ))}
        <p className="grupos__nota">Se suman a los segmentos: dentro de un mismo grupo basta con cumplir una opción.</p>
      </div>
    </HojaInferior>
  )
}

/** Estados vacíos compartidos. */
export function SinDirectoras() {
  return (
    <div className="directorio__vacio">
      <h2>Aún no tienes directoras en tu coordinación</h2>
      <p>Cuando te asignen directoras, aparecerán aquí. Los datos se actualizan cada hora.</p>
    </div>
  )
}

export function SinResultados({ dir }: { dir: Directorio }) {
  return (
    <div className="directorio__vacio">
      <h2>No hay directoras con esta combinación</h2>
      <p>
        {dir.segmentos.length > 1
          ? 'Ninguna directora cumple todos los segmentos que elegiste a la vez. Prueba quitando un segmento o un filtro.'
          : 'Prueba quitando un segmento, un filtro o cambiando la búsqueda.'}
      </p>
      <fry-button hierarchy="secondary" size="medium" text="Limpiar filtros" onfryClick={dir.limpiarTodo} />
    </div>
  )
}

export function EnlaceDemoVacia({ dir }: { dir: Directorio }) {
  return (
    <div className="directorio__demo">
      <span className="vercomo__demo">DEMO</span>
      <button className="enlace" onClick={() => dir.setCoordinacionVacia((v) => !v)}>
        {dir.coordinacionVacia ? 'Volver a la coordinación con directoras' : 'Ver estado de BDM sin directoras'}
      </button>
    </div>
  )
}
