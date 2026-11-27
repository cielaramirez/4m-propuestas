import { useState } from 'react'
import { CONFIG, SIGLAS, type Pais, type Sigla } from '../config/demo.config'
import { normalizarNombre } from '../domain/format'
import { navegar, RUTAS } from '../state/router'
import { useDemo } from '../state/store'

/** Pantalla inicial: quien conduce la entrevista configura la sesión antes de entregar el celular. */
export function ConfigScreen() {
  const { sesion, sigla, iniciar } = useDemo()
  const [nombre, setNombre] = useState(sesion?.nombre ?? '')
  const [estatus, setEstatus] = useState<Sigla | null>(sesion ? sigla : null)
  const [pais, setPais] = useState<Pais>(sesion?.pais ?? CONFIG.paisPorDefecto)
  const [directora, setDirectora] = useState(sesion?.directora ?? '')
  const [mostrarPanel, setMostrarPanel] = useState(sesion?.mostrarPanel ?? false)

  const esEmprendedora = estatus ? CONFIG.perfiles[estatus].grupo === 'emprendedora' : false
  const listo = nombre.trim().length > 0 && estatus !== null

  const empezar = () => {
    if (!listo || !estatus) return
    iniciar(
      {
        nombre: normalizarNombre(nombre),
        directora: esEmprendedora ? normalizarNombre(directora) : '',
        mostrarPanel,
        pais,
      },
      estatus,
    )
    navegar(RUTAS.inicio, { reemplazar: true })
  }

  return (
    <main className="pantalla config">
      <span className="config__demo">DEMO</span>
      <h1 className="t-titulo">Configurar demo</h1>
      <p className="t-sutil config__ayuda">Completa esto antes de entregar el celular a la participante.</p>

      <label className="campo">
        <span className="campo__etiqueta">Nombre de la participante</span>
        <input
          className="campo__input"
          type="text"
          placeholder="Ej. Luciana"
          autoComplete="off"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </label>

      <div className="campo">
        <span className="campo__etiqueta">País</span>
        <div className="config__estatus" role="radiogroup" aria-label="País">
          {(Object.keys(CONFIG.paises) as Pais[]).map((p) => (
            <fry-chip
              key={p}
              type="choice"
              size="medium"
              name="pais"
              label={CONFIG.paises[p].nombre}
              value={p}
              checked={pais === p}
              onfryChange={() => setPais(p)}
            />
          ))}
        </div>
        <p className="t-sutil config__descripcion">Los montos se muestran en {CONFIG.paises[pais].simbolo}</p>
      </div>

      <div className="campo">
        <span className="campo__etiqueta">Estatus</span>
        <div className="config__estatus" role="radiogroup" aria-label="Estatus">
          {SIGLAS.map((s) => (
            <fry-chip
              key={s}
              type="choice"
              size="medium"
              name="estatus"
              label={s}
              value={s}
              checked={estatus === s}
              onfryChange={() => setEstatus(s)}
            />
          ))}
        </div>
        {estatus && <p className="t-sutil config__descripcion">{CONFIG.perfiles[estatus].descripcion}</p>}
      </div>

      {esEmprendedora && (
        <label className="campo">
          <span className="campo__etiqueta">
            Nombre de su Directora <span className="t-sutil">(opcional)</span>
          </span>
          <input
            className="campo__input"
            type="text"
            placeholder={`Por defecto: ${CONFIG.directoraPorDefecto}`}
            autoComplete="off"
            value={directora}
            onChange={(e) => setDirectora(e.target.value)}
          />
        </label>
      )}

      <div className="config__panel">
        <fry-switch
          checked={mostrarPanel}
          onfryChange={(e: CustomEvent<{ checked: boolean }>) => setMostrarPanel(e.detail.checked)}
        >
          Mostrar panel "Ver como"
        </fry-switch>
      </div>

      <div className="config__accion">
        <fry-button hierarchy="primary" size="large" full-width text="Empezar demo" disabled={!listo} onfryClick={empezar} />
      </div>
    </main>
  )
}
