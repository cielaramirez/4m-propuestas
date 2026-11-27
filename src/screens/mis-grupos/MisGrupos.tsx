import { useState } from 'react'
import { CONFIG } from '../../config/demo.config'
import { useDemo } from '../../state/store'
import { GrupoPersonal } from './GrupoPersonal'
import { MisDirectoras } from './MisDirectoras'

const PESTANAS = [
  { id: 'gp', etiqueta: 'Mi Grupo Personal' },
  { id: 'dir', etiqueta: 'Mis Directoras' },
] as const

type Pestana = (typeof PESTANAS)[number]['id']

/**
 * Mis Grupos: la gente de la usuaria, traída de la pantalla Equipo de maya-redesign.
 *  · Mi Grupo Personal: sus consultoras y los créditos que aprueba ella.
 *  · Mis Directoras: su red de liderazgo. Solo para Directoras; las Emprendedoras ven su grupo.
 */
export function MisGrupos() {
  const { perfil } = useDemo()
  const conDirectoras = perfil.grupo === 'directora'
  const [pestana, setPestana] = useState<Pestana>('gp')
  const activa = conDirectoras ? pestana : 'gp'

  return (
    <div className="grupos">
      <header className="grupos__cabecera">
        <p className="t-sutil">
          {CONFIG.campana.corte} | {CONFIG.campana.actualizado}
        </p>
        <h1 className="t-titulo">Mis Grupos</h1>
        <p className="grupos__bajada">Tu gente directa{conDirectoras ? ' y tu red de liderazgo' : ''}: a quién trabajar esta semana.</p>
      </header>

      {conDirectoras && (
        <div className="formaciones__pestanas" role="tablist" aria-label="Grupos">
          {PESTANAS.map((p) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={p.id === activa}
              className={`formaciones__pestana ${p.id === activa ? 'formaciones__pestana--activa' : ''}`}
              onClick={() => setPestana(p.id)}
            >
              {p.etiqueta}
            </button>
          ))}
        </div>
      )}

      {activa === 'gp' ? <GrupoPersonal /> : <MisDirectoras />}
    </div>
  )
}
