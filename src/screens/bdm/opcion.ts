import { useSyncExternalStore } from 'react'

/** Opciones de diseño del directorio de la BDM que se comparan en Mis Grupos (se eligen en el menú). */
export const OPCIONES = [
  { id: 1, titulo: 'Opción 1', detalle: 'Cards con chips de segmento' },
  { id: 2, titulo: 'Opción 2', detalle: 'Segmentos en tarjetas + lista compacta' },
  { id: 3, titulo: 'Opción 3', detalle: 'Editorial con Brandbook + cuadrícula' },
  { id: 4, titulo: 'Opción 4', detalle: 'Patrón Equipo de Gio: resumen que filtra + lentes' },
] as const

export type OpcionId = (typeof OPCIONES)[number]['id']

const CLAVE = 'maya-formaciones-demo:opcion-bdm'
const avisos = new Set<() => void>()

function leer(): OpcionId {
  try {
    const v = Number(localStorage.getItem(CLAVE))
    return v === 2 || v === 3 || v === 4 ? v : 1
  } catch {
    return 1
  }
}

let actual: OpcionId = leer()

export function elegirOpcion(id: OpcionId): void {
  actual = id
  try {
    localStorage.setItem(CLAVE, String(id))
  } catch {
    // sin localStorage la elección vive solo en memoria
  }
  avisos.forEach((f) => f())
}

export function useOpcion(): OpcionId {
  return useSyncExternalStore(
    (f) => {
      avisos.add(f)
      return () => avisos.delete(f)
    },
    () => actual,
  )
}
