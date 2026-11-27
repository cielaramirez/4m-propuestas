/** Secciones que quedan fuera del alcance de la demo. */
export function Placeholder({ titulo, detalle = 'Fuera del alcance de esta demo.' }: { titulo: string; detalle?: string }) {
  return (
    <div className="vacio">
      <h1>{titulo}</h1>
      <p>{detalle}</p>
    </div>
  )
}
