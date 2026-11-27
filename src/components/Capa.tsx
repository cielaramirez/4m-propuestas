import { createContext, useContext } from 'react'

/** Elemento sobre el que se montan hojas inferiores, panel y avisos (dentro del contenedor mobile). */
export const CapaContexto = createContext<HTMLElement | null>(null)

export function useCapa(): HTMLElement | null {
  return useContext(CapaContexto)
}
