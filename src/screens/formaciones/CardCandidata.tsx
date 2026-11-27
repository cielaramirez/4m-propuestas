import type { Metricas } from '../../config/demo.config'
import { avisoDeCandidata, type CandidataEvaluada } from '../../domain/formaciones'
import { dinero } from '../../domain/format'
import { cumpleVariable, primerNombre } from '../../domain/potencial'
import { navegar, RUTAS } from '../../state/router'
import { useDemo } from '../../state/store'
import { EtiquetaPotencial } from '../../components/EtiquetaPotencial'
import { FilaEstado } from '../../components/FilaEstado'

interface Props {
  candidata: CandidataEvaluada
  destacada: boolean
  /** Ya se le envió un mensaje desde el chat simulado. */
  enviado: boolean
  onContactar: () => void
}

const FILAS: { variable: keyof Metricas; etiqueta: string; moneda?: boolean }[] = [
  { variable: 'ventaGP', etiqueta: 'Venta GP', moneda: true },
  { variable: 'activas', etiqueta: 'Activas' },
  { variable: 'pped', etiqueta: 'PPED' },
]

export function CardCandidata({ candidata, destacada, enviado, onContactar }: Props) {
  const { avisar } = useDemo()
  const aviso = avisoDeCandidata(candidata)
  const nombre = primerNombre(candidata.nombre)

  return (
    <article
      id={`candidata-${candidata.id}`}
      className={`candidata candidata--${candidata.potencial} ${destacada ? 'candidata--destacada' : ''}`}
    >
      <div className="candidata__cuerpo">
        <div className="candidata__cabecera">
          <span>{candidata.nombreNivel}</span>
          <EtiquetaPotencial potencial={candidata.potencial} />
        </div>
        <h2 className="candidata__nombre">{candidata.nombre}</h2>

        <ul className="candidata__filas">
          {FILAS.map((f) => (
            <FilaEstado key={f.variable} ok={cumpleVariable(candidata, f.variable)}>
              {f.etiqueta}: {f.moneda ? dinero(candidata[f.variable]) : candidata[f.variable]}
            </FilaEstado>
          ))}
          <FilaEstado ok={candidata.suenoRegistrado !== null}>
            {candidata.suenoRegistrado !== null
              ? `Tiene interés · Sueño: ${candidata.suenoRegistrado}`
              : 'Sin intención ni sueño registrados'}
          </FilaEstado>
        </ul>

        {aviso && <p className="franja-aviso">{aviso}</p>}

        <div className="candidata__acciones">
          <fry-button
            hierarchy="secondary"
            size="medium"
            full-width
            icon-left="whatsapp-outline"
            text={candidata.potencial === 'alto' ? 'Agendar semillero' : 'Contactar'}
            onfryClick={onContactar}
          />
          <fry-button-icon
            hierarchy="secondary"
            size="medium"
            icon="call-outline"
            accessible-label={`Llamar a ${nombre}`}
            onfryClick={() => avisar(`Llamando a ${nombre}…`)}
          />
          <fry-button-icon
            hierarchy="secondary"
            size="medium"
            icon="copy-outline"
            accessible-label="Copiar número"
            onfryClick={() => avisar('Número copiado')}
          />
        </div>
        {enviado && (
          <p className="candidata__enviado">
            <fry-icon name="check-outline" size="16" /> Mensaje enviado
          </p>
        )}
      </div>

      <div className="candidata__pie">
        <button className="enlace enlace--chico" onClick={() => navegar(RUTAS.simuladorFormacion + candidata.id)}>
          Simular formación
          <fry-icon name="arrow-right-outline" size="16" />
        </button>
      </div>
    </article>
  )
}
