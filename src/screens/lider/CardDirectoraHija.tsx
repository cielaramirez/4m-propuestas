import { useEffect, useState } from 'react'
import { EtiquetaPotencial } from '../../components/EtiquetaPotencial'
import type { DirectoraEvaluada, EmprendedoraEvaluada } from '../../domain/lideres'
import { dinero } from '../../domain/format'
import { primerNombre, TEXTO_INTENCION } from '../../domain/potencial'
import { useDemo } from '../../state/store'

interface Props {
  directora: DirectoraEvaluada
  /** Con filtro o búsqueda activos, el acordeón arranca abierto. */
  abiertaPorDefecto: boolean
  onContactar: () => void
  onVerCrecimiento: (emprendedora: EmprendedoraEvaluada) => void
}

export function CardDirectoraHija({ directora, abiertaPorDefecto, onContactar, onVerCrecimiento }: Props) {
  const { avisar } = useDemo()
  const [abierta, setAbierta] = useState(abiertaPorDefecto)
  useEffect(() => setAbierta(abiertaPorDefecto), [abiertaPorDefecto])

  const nombre = primerNombre(directora.nombre)
  const n = directora.emprendedoras.length

  return (
    <article className="hija">
      <div className="hija__cuerpo">
        <div className="candidata__cabecera">
          <span>
            {directora.estatus} | Hija de {directora.madre}
          </span>
          {directora.formadora && <span className="etiqueta-estado etiqueta-estado--chica">P. Formadora</span>}
        </div>
        <h2 className="candidata__nombre">{directora.nombre}</h2>
        <p className="franja-aviso">{directora.aviso}</p>
        <div className="candidata__acciones">
          <fry-button hierarchy="secondary" size="medium" full-width icon-left="whatsapp-outline" text="Contactar" onfryClick={onContactar} />
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
      </div>

      <button className="hija__acordeon" aria-expanded={abierta} onClick={() => setAbierta(!abierta)}>
        {n === 1 ? 'Ver 1 Emprendedora' : `Ver ${n} Emprendedoras`}
        <fry-icon name={abierta ? 'chevron-up-outline' : 'chevron-down-outline'} size="20" />
      </button>

      {abierta && (
        <ul className="hija__emprendedoras">
          {directora.emprendedoras.map((e) => (
            <li className="emprendedora" key={e.id}>
              <EtiquetaPotencial potencial={e.potencial} />
              <h3>{e.nombre}</h3>
              <p className="emprendedora__califica">
                <fry-icon
                  name={e.actual.califica === 'consultora' ? 'alert-filled' : 'check-circle-filled'}
                  size="16"
                  color={e.actual.califica === 'consultora' ? '#ce8700' : '#407d7d'}
                />
                Califica como {e.sigla}
              </p>
              {e.intencion === 'quiere' && <p>{TEXTO_INTENCION[e.intencion]}</p>}
              <p>Venta GP: {dinero(e.actual.ventaGP)}</p>
              <p>Total de Activas: {e.actual.activas}</p>
              <p>PPED: {e.actual.pped}</p>
              <p>IM: {e.actual.im.toFixed(1)}%</p>
              <div className="emprendedora__acciones">
                <fry-button hierarchy="link" size="small" text="Ver crecimiento" icon-right="arrow-up-right-outline" onfryClick={() => onVerCrecimiento(e)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
