import { useEffect, useMemo, useState } from 'react'
import { candidatasDe, filtrar, FILTROS, type FiltroFormaciones } from '../../domain/formaciones'
import { navegar, RUTAS } from '../../state/router'
import { useDemo } from '../../state/store'
import { Placeholder } from '../Placeholder'
import { CardCandidata } from './CardCandidata'
import { PopupBono } from './PopupBono'
import ilustracion from '../../assets/figma/dir-popup/statistics.png'

const PESTANAS = ['Potenciales', 'Aspirantes', 'Nuevas Directoras'] as const

function sinTildes(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/** Parte B · Formaciones: candidatas del grupo de una Directora Junior o Senior. */
export function Formaciones() {
  const { sigla, mio, popupBono, abrirPopupBono, cerrarPopupBono, elegirFiltroFormaciones } = useDemo()
  const [pestana, setPestana] = useState<(typeof PESTANAS)[number]>('Potenciales')
  const [busqueda, setBusqueda] = useState('')
  const [destacada, setDestacada] = useState<string | null>(null)

  const candidatas = useMemo(() => candidatasDe(sigla), [sigla])
  const filtro = mio.filtroFormaciones
  const visibles = filtrar(candidatas, filtro).filter((c) => sinTildes(c.nombre).includes(sinTildes(busqueda.trim())))

  // Entrando por la pestaña, el popup aparece solo la primera vez por perfil.
  useEffect(() => {
    if (!mio.popupBonoVisto) abrirPopupBono()
  }, [mio.popupBonoVisto, abrirPopupBono])

  // Tocar una candidata en el popup lleva a su card.
  useEffect(() => {
    if (!destacada || popupBono) return
    document.getElementById(`candidata-${destacada}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    const reloj = window.setTimeout(() => setDestacada(null), 2200)
    return () => window.clearTimeout(reloj)
  }, [destacada, popupBono])

  const irAFiltro = (nuevo: FiltroFormaciones, candidataId?: string) => {
    setPestana('Potenciales')
    setBusqueda('')
    elegirFiltroFormaciones(nuevo)
    setDestacada(candidataId ?? null)
    cerrarPopupBono()
  }

  return (
    <div className="formaciones">
      <header className="formaciones__cabecera">
        <div className="formaciones__titulo">
          <div>
            <h1>Formaciones</h1>
            <p>Esta campaña debes presentar a tu Elegida para formarla.</p>
          </div>
          <img src={ilustracion} alt="" />
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

      {pestana !== 'Potenciales' ? (
        <Placeholder titulo={pestana} />
      ) : (
        <>
          <div className="formaciones__filtros" role="radiogroup" aria-label="Filtrar candidatas">
            {FILTROS.map((f) => (
              <fry-chip
                key={f.id}
                type="choice"
                size="small"
                name="filtro-formaciones"
                value={f.id}
                label={`${f.etiqueta} (${filtrar(candidatas, f.id).length})`}
                checked={filtro === f.id}
                onfryChange={() => elegirFiltroFormaciones(f.id)}
              />
            ))}
          </div>

          <div className="formaciones__lista">
            {visibles.length === 0 ? (
              <p className="formaciones__vacio">Aún no tienes candidatas en este grupo.</p>
            ) : (
              visibles.map((c) => (
                <CardCandidata
                  key={c.id}
                  candidata={c}
                  destacada={c.id === destacada}
                  enviado={(mio.chats[`candidata:${c.id}`]?.length ?? 0) > 0}
                  onContactar={() => navegar(RUTAS.chatCandidata + c.id)}
                />
              ))
            )}
          </div>
        </>
      )}

      {popupBono && (
        <PopupBono
          candidatas={candidatas}
          onCerrar={cerrarPopupBono}
          onVerListas={() => irAFiltro('listas')}
          onInvitar={() => irAFiltro('cumplen')}
          onElegir={(c) => irAFiltro(c.potencial === 'alto' ? 'listas' : 'cumplen', c.id)}
        />
      )}
    </div>
  )
}
