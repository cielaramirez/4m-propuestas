import { navegar, RUTAS } from '../../state/router'
import { useDemo } from '../../state/store'
import { Beneficios } from './Beneficios'
import { Confirmacion } from './Confirmacion'
import { SuenoForm } from './SuenoForm'

/**
 * Flujo de Mi carrera (solo Emprendedoras), en hojas inferiores sobre la pantalla de origen:
 * Beneficios → Sueño → Confirmación.
 */
export function FlujoCarrera() {
  const { flujo, perfil, abrirFlujo, cerrarFlujo, sonar } = useDemo()
  if (!flujo || perfil.grupo !== 'emprendedora') return null

  const irAMiCarrera = () => {
    cerrarFlujo()
    navegar(RUTAS.miCarrera)
  }

  switch (flujo.paso) {
    case 'beneficios':
      // "Más adelante" no guarda nada: el banner de Mi carrera queda como invitación.
      return <Beneficios onMasAdelante={irAMiCarrera} onQuiero={() => {
            sonar('avance')
            abrirFlujo('sueno')
          }} />
    case 'sueno':
      return (
        <SuenoForm
          editando={flujo.editando}
          onCerrar={irAMiCarrera}
          onAtras={() => (flujo.editando ? irAMiCarrera() : abrirFlujo('beneficios'))}
          onGuardado={() => {
            // Registrar el sueño es el logro de este flujo: se celebra.
            sonar('logro')
            if (flujo.editando) irAMiCarrera()
            else abrirFlujo('confirmacion')
          }}
        />
      )
    case 'confirmacion':
      return <Confirmacion onSalir={irAMiCarrera} />
  }
}
