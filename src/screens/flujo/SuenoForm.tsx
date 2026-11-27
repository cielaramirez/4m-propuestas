import { useState } from 'react'
import { HojaInferior } from '../../components/HojaInferior'
import { CONFIG } from '../../config/demo.config'
import { datosPais, dinero } from '../../domain/format'
import { useDemo } from '../../state/store'

interface Props {
  /** true = se abrió desde el lápiz de la card del sueño. */
  editando: boolean
  onCerrar: () => void
  onAtras: () => void
  onGuardado: () => void
}

/** Modal 2 · Sueño y monto. */
export function SuenoForm({ editando, onCerrar, onAtras, onGuardado }: Props) {
  const { mio, guardarSueno, sonar } = useDemo()
  const { opciones, otro, maxCaracteresOtro, montoObligatorio } = CONFIG.suenos
  const previo = editando ? mio.sueno : null

  const [opcion, setOpcion] = useState<string | null>(previo?.opcion ?? null)
  const [textoOtro, setTextoOtro] = useState(previo?.opcion === otro ? previo.texto : '')
  const [monto, setMonto] = useState(previo?.monto ? String(previo.monto) : '')

  const esOtro = opcion === otro
  const montoNumero = Number(monto) > 0 ? Math.round(Number(monto)) : null
  const listo =
    opcion !== null && (!esOtro || textoOtro.trim().length > 0) && (!montoObligatorio || montoNumero !== null)

  const guardar = () => {
    if (!listo || opcion === null) return
    guardarSueno({ opcion, texto: esOtro ? textoOtro.trim() : opcion, monto: montoNumero })
    onGuardado()
  }

  return (
    <HojaInferior
      etiqueta="Registra tu sueño"
      className="hoja--flujo"
      conCerrar
      onCerrar={onCerrar}
      pie={
        <>
          <fry-button hierarchy="secondary" full-width text={editando ? 'Cancelar' : 'Atrás'} onfryClick={onAtras} />
          <fry-button
            hierarchy="primary"
            full-width
            text={editando ? 'Guardar' : 'Siguiente'}
            disabled={!listo}
            onfryClick={guardar}
          />
        </>
      }
    >
      <div className="flujo__cabecera flujo__cabecera--con-x">
        <h2 className="flujo__titulo">
          ¡Es momento de
          <br />
          soñar en grande!
        </h2>
        <p className="flujo__apoyo">
          Como Directora podrías ganar desde {dinero(CONFIG.gananciaDirectora)} por campaña. ¿Qué gran sueño quieres
          cumplir?
        </p>
      </div>

      <div className="sueno">
        <div className="sueno__chips" role="radiogroup" aria-label="Tu sueño">
          {[...opciones, otro].map((o) => (
            <fry-chip
              key={o}
              type="choice"
              size="small"
              name="sueno"
              label={o}
              value={o}
              checked={opcion === o}
              onfryChange={() => {
                sonar('toque')
                setOpcion(o)
              }}
            />
          ))}
        </div>

        {esOtro && (
          <input
            className="campo__input sueno__otro"
            type="text"
            placeholder="Escribe tu sueño"
            aria-label="Escribe tu sueño"
            maxLength={maxCaracteresOtro}
            autoFocus
            value={textoOtro}
            onChange={(e) => setTextoOtro(e.target.value)}
          />
        )}

        <h3 className="flujo__titulo sueno__pregunta">¿Cuánto cuesta ese sueño?</h3>
        <fry-input-currency
          currency={datosPais().moneda}
          integer
          name="monto"
          placeholder="Ingresa el monto aproximado"
          accessible-label="Monto aproximado de tu sueño"
          value={monto}
          onfryInput={(e: CustomEvent<{ value: string }>) => setMonto(e.detail.value)}
        />
      </div>
    </HojaInferior>
  )
}
