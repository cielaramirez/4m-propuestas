import { useMemo, useState } from 'react'
import { HojaInferior } from '../../components/HojaInferior'
import { CONFIG } from '../../config/demo.config'
import { directorasHijas, type EmprendedoraEvaluada } from '../../domain/lideres'
import { ETIQUETA_POTENCIAL, ORDEN_POTENCIAL, type Potencial } from '../../domain/potencial'
import { navegar, RUTAS } from '../../state/router'
import { useDemo } from '../../state/store'
import { Placeholder } from '../Placeholder'
import { CardDirectoraHija } from './CardDirectoraHija'
import { HojaCrecimiento } from './HojaCrecimiento'
import brote from '../../assets/figma/lid/emp-sprout.png'

const PESTANAS = ['Con Emprendedoras', 'Sin Emprendedoras'] as const

function sinTildes(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/** Parte C · Emprendedoras: Directoras hijas de la Líder y las emprendedoras de cada una. */
export function Emprendedoras() {
  const { mio, elegirFiltroEmprendedoras } = useDemo()
  const [pestana, setPestana] = useState<(typeof PESTANAS)[number]>('Con Emprendedoras')
  const [busqueda, setBusqueda] = useState('')
  const [filtrando, setFiltrando] = useState(false)
  const [crecimiento, setCrecimiento] = useState<{ emprendedora: EmprendedoraEvaluada; directora: string; ventaGP: number[] } | null>(null)

  const todas = useMemo(() => directorasHijas(), [])
  const filtro = mio.filtroEmprendedoras
  const texto = sinTildes(busqueda.trim())

  // Con filtro o búsqueda, cada Directora muestra solo las emprendedoras que coinciden.
  const visibles = todas
    .map((d) => {
      const coincideDirectora = texto !== '' && sinTildes(d.nombre).includes(texto)
      const emprendedoras = d.emprendedoras.filter(
        (e) =>
          (filtro === null || e.potencial === filtro) &&
          (texto === '' || coincideDirectora || sinTildes(e.nombre).includes(texto)),
      )
      return { ...d, emprendedoras }
    })
    .filter((d) => d.emprendedoras.length > 0)

  const elegir = (nuevo: Potencial | null) => {
    elegirFiltroEmprendedoras(nuevo)
    setFiltrando(false)
  }

  return (
    <div className="emprendedoras">
      <header className="emprendedoras__cabecera">
        <div className="emprendedoras__barra">
          <button className="regresar" onClick={() => navegar(RUTAS.inicio)}>
            <fry-icon name="chevron-left-outline" size="16" />
            Regresar
          </button>
          <span>
            {CONFIG.campana.corte} | {CONFIG.campana.actualizado}
          </span>
        </div>
        <div className="emprendedoras__titulo">
          <div>
            <h1>Emprendedoras</h1>
            <p>
              Tienes {todas.length}/{CONFIG.lideres.totalLid} LID con emprendedoras <u>Ver más</u>
            </p>
          </div>
          <img src={brote} alt="" />
        </div>
        <div className="emprendedoras__buscar">
          <fry-searchbar
            placeholder="Buscar por nombre o código"
            name="busqueda"
            value={busqueda}
            onfryInput={(e: CustomEvent<{ value: string }>) => setBusqueda(e.detail.value)}
            onfryClear={() => setBusqueda('')}
          />
          <fry-button hierarchy="secondary" size="large" text="Filtrar" onfryClick={() => setFiltrando(true)} />
        </div>
        {filtro !== null && (
          <div className="emprendedoras__chip">
            <fry-chip type="input" size="small" label={ETIQUETA_POTENCIAL[filtro]} checked onfryChipDismiss={() => elegir(null)} />
          </div>
        )}
      </header>

      <div className="formaciones__pestanas" role="tablist">
        {PESTANAS.map((p) => (
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

      {pestana !== 'Con Emprendedoras' ? (
        <Placeholder titulo={pestana} />
      ) : (
        <div className="emprendedoras__lista">
          {visibles.length === 0 ? (
            <p className="formaciones__vacio">No hay emprendedoras que coincidan.</p>
          ) : (
            visibles.map((d) => (
              <CardDirectoraHija
                key={d.id}
                directora={d}
                abiertaPorDefecto={filtro !== null || texto !== ''}
                onContactar={() => navegar(RUTAS.chatDirectoraHija + d.id)}
                onVerCrecimiento={(emprendedora) => setCrecimiento({ emprendedora, directora: d.nombre, ventaGP: d.ventaGP })}
              />
            ))
          )}
        </div>
      )}

      {filtrando && (
        <HojaInferior etiqueta="Filtrar por potencial" conCerrar onCerrar={() => setFiltrando(false)} className="hoja--filtro">
          <div className="filtro">
            <h2 className="flujo__titulo">Filtrar por potencial</h2>
            <ul>
              {[null, ...ORDEN_POTENCIAL].map((p) => (
                <li key={p ?? 'todas'}>
                  <button
                    className={`filtro__opcion ${filtro === p ? 'filtro__opcion--activa' : ''}`}
                    aria-pressed={filtro === p}
                    onClick={() => elegir(p)}
                  >
                    {p === null ? 'Todas' : ETIQUETA_POTENCIAL[p]}
                    {filtro === p && <fry-icon name="check-outline" size="20" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </HojaInferior>
      )}

      {crecimiento && (
        <HojaCrecimiento
          emprendedora={crecimiento.emprendedora}
          directora={crecimiento.directora}
          ventaGPDirectora={crecimiento.ventaGP}
          onCerrar={() => setCrecimiento(null)}
        />
      )}
    </div>
  )
}
