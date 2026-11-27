import { EtiquetaPotencial } from '../../components/EtiquetaPotencial'
import { HojaInferior } from '../../components/HojaInferior'
import { siglaNivel, type EmprendedoraEvaluada } from '../../domain/lideres'
import { dinero } from '../../domain/format'
import { TEXTO_INTENCION } from '../../domain/potencial'

interface Props {
  emprendedora: EmprendedoraEvaluada
  directora: string
  /** Venta GP de su Directora por campaña, en el mismo orden que el historial. */
  ventaGPDirectora: number[]
  onCerrar: () => void
}

/** Hoja "Ver crecimiento": potencial, intención e historial por campaña. La primera columna de datos es la campaña actual. */
export function HojaCrecimiento({ emprendedora, directora, ventaGPDirectora, onCerrar }: Props) {
  const campanas = emprendedora.historial
  const filas: { titulo: string; celdas: (string | { etiqueta: string })[] }[] = [
    { titulo: 'Venta GP de su Directora', celdas: campanas.map((_, i) => dinero(ventaGPDirectora[i] ?? 0)) },
    { titulo: 'Venta GP', celdas: campanas.map((c) => dinero(c.ventaGP)) },
    { titulo: 'Califica', celdas: campanas.map((c) => ({ etiqueta: siglaNivel(c.califica) })) },
    { titulo: 'IM', celdas: campanas.map((c) => `${c.im.toFixed(1)}%`) },
    { titulo: 'Activas', celdas: campanas.map((c) => String(c.activas)) },
    { titulo: 'PPED directos', celdas: campanas.map((c) => String(c.ppedDirectos)) },
    { titulo: 'PPED', celdas: campanas.map((c) => String(c.pped)) },
  ]

  return (
    <HojaInferior etiqueta={`Crecimiento de ${emprendedora.nombre}`} conCerrar onCerrar={onCerrar} className="hoja--crecimiento">
      <div className="crecimiento">
        <div className="crecimiento__potencial">
          <EtiquetaPotencial potencial={emprendedora.potencial} />
        </div>
        <h2 className="flujo__titulo">{emprendedora.nombre}</h2>
        <p className="crecimiento__detalle">
          Califica como {emprendedora.sigla} · Directora: {directora}
        </p>
        <p className="crecimiento__detalle">{TEXTO_INTENCION[emprendedora.intencion]}</p>
        <div className="crecimiento__tabla">
          <table>
            <thead>
              <tr>
                <th scope="col">
                  <span className="solo-lector">Indicador</span>
                </th>
                {campanas.map((c) => (
                  <th scope="col" key={c.campana}>
                    C{c.campana}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.titulo}>
                  <th scope="row">{f.titulo}</th>
                  {f.celdas.map((celda, i) => (
                    <td key={i}>
                      {typeof celda === 'string' ? celda : <span className="etiqueta-estado etiqueta-estado--chica">{celda.etiqueta}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </HojaInferior>
  )
}
