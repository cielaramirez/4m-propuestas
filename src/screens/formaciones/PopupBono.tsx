import { HojaInferior } from '../../components/HojaInferior'
import { NotaLegal } from '../../components/NotaLegal'
import { EtiquetaPotencial } from '../../components/EtiquetaPotencial'
import { CONFIG } from '../../config/demo.config'
import { mejoresCandidatas, type CandidataEvaluada } from '../../domain/formaciones'
import { dinero } from '../../domain/format'
import { useDemo } from '../../state/store'

interface Props {
  candidatas: CandidataEvaluada[]
  onCerrar: () => void
  onVerListas: () => void
  onInvitar: () => void
  onElegir: (candidata: CandidataEvaluada) => void
}

/** Popup · Bono de formación: bono, bloque de ascenso y mejores candidatas. */
export function PopupBono({ candidatas, onCerrar, onVerListas, onInvitar, onElegir }: Props) {
  const { sigla } = useDemo()
  const ascenso = CONFIG.ascensos[sigla]
  const mejores = mejoresCandidatas(candidatas)
  const medias = candidatas.filter((c) => c.potencial === 'medio')
  const hayListas = mejores.length > 0
  const lista = hayListas ? mejores : medias

  const titulo = !hayListas
    ? 'Aún no tienes candidatas listas'
    : mejores.length === 1
      ? 'Tu mejor candidata'
      : 'Tus mejores candidatas'

  return (
    <HojaInferior
      etiqueta="Bono de formación"
      className="hoja--bono"
      conCerrar
      onCerrar={onCerrar}
      cabecera={
        <div className="bono__cabecera">
          <span className="bono__etiqueta">Bono de formación</span>
          <p>Forma a una nueva Directora y gana</p>
          <p className="bono__monto">+{dinero(CONFIG.bonoFormacion)}*</p>
        </div>
      }
      pie={
        <>
          <fry-button hierarchy="secondary" full-width text="Ahora no" onfryClick={onCerrar} />
          {hayListas ? (
            <fry-button
              hierarchy="primary"
              full-width
              text={mejores.length === 1 ? 'Ver mi candidata' : 'Ver mis candidatas'}
              onfryClick={onVerListas}
            />
          ) : (
            <fry-button hierarchy="primary" full-width text="Invitarlas a registrar su sueño" onfryClick={onInvitar} />
          )}
        </>
      }
    >
      <div className="bono">
        {ascenso && (
          <>
            <h2 className="flujo__titulo">{ascenso.titulo}</h2>
            <div className="ascenso">
              <p className="ascenso__paso">
                <span className="ascenso__nivel">{ascenso.desde}</span>
                <fry-icon name="arrow-right-outline" size="16" />
                <span className="ascenso__nivel ascenso__nivel--destino">{ascenso.hacia}</span>
              </p>
              <ul className="candidata__filas">
                {ascenso.beneficios.map((b) => (
                  <li className="fila-estado fila-estado--ok" key={b}>
                    <fry-icon name="check-circle-filled" size="16" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <h3 className="bono__subtitulo">{titulo}</h3>
        {!hayListas && (
          <p className="bono__ayuda">
            {medias.length === 1
              ? '1 ya cumple los números. Solo falta que registre su intención y su sueño.'
              : `${medias.length} ya cumplen los números. Solo falta que registren su intención y su sueño.`}
          </p>
        )}
        <ul className="bono__candidatas">
          {lista.map((c) => (
            <li key={c.id}>
              <button className="bono__candidata" onClick={() => onElegir(c)}>
                <span className="bono__candidata-fila">
                  <b>{c.nombre}</b>
                  <EtiquetaPotencial potencial={c.potencial} />
                </span>
                <span>
                  {c.nombreNivel}
                  {c.suenoRegistrado !== null && ` · Sueño: ${c.suenoRegistrado}`}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <NotaLegal tipo="bono" className="bono__legal" />
      </div>
    </HojaInferior>
  )
}
