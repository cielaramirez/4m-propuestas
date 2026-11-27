import { useSyncExternalStore } from 'react'
import type { Grupo } from '../config/demo.config'

/** Rutas con hash (#/mi-carrera) para que funcionen en hosting estático. */
export const RUTAS = {
  config: '/config',
  inicio: '/',
  miNegocio: '/mi-negocio',
  misGrupos: '/mis-grupos',
  programas: '/programas',
  miCarrera: '/mi-carrera',
  simulador: '/simulador',
  formaciones: '/formaciones',
  chatDirectora: '/chat/directora',
  /** Prefijo: /chat/candidata/{id} */
  chatCandidata: '/chat/candidata/',
  /** Prefijo: /chat/programa/{id} (contactos de la sección Programas) */
  chatPrograma: '/chat/programa/',
  emprendedoras: '/emprendedoras',
  /** Prefijo: /simulador-formacion/{id de candidata} */
  simuladorFormacion: '/simulador-formacion/',
  /** Prefijo: /chat/directora-hija/{id} */
  chatDirectoraHija: '/chat/directora-hija/',
} as const

const RUTAS_POR_GRUPO: Record<Grupo, string[]> = {
  emprendedora: [RUTAS.inicio, RUTAS.miNegocio, RUTAS.misGrupos, RUTAS.programas, RUTAS.miCarrera, RUTAS.simulador, RUTAS.chatDirectora, RUTAS.chatPrograma],
  directora: [RUTAS.inicio, RUTAS.miNegocio, RUTAS.misGrupos, RUTAS.programas, RUTAS.formaciones, RUTAS.chatCandidata, RUTAS.chatPrograma, RUTAS.simuladorFormacion],
  lider: [RUTAS.inicio, RUTAS.emprendedoras, RUTAS.chatDirectoraHija],
}

export function rutaExiste(ruta: string, grupo: Grupo): boolean {
  // Las rutas que terminan en "/" son prefijos con un id detrás.
  return RUTAS_POR_GRUPO[grupo].some((r) => (r.length > 1 && r.endsWith('/') ? ruta.startsWith(r) : r === ruta))
}

function leerRuta(): string {
  const hash = window.location.hash.replace(/^#/, '')
  return hash.startsWith('/') ? hash : RUTAS.inicio
}

function suscribir(avisar: () => void): () => void {
  window.addEventListener('hashchange', avisar)
  return () => window.removeEventListener('hashchange', avisar)
}

export function useRuta(): string {
  return useSyncExternalStore(suscribir, leerRuta)
}

export function navegar(ruta: string, opciones: { reemplazar?: boolean } = {}): void {
  if (leerRuta() === ruta) return
  if (opciones.reemplazar) {
    const url = new URL(window.location.href)
    url.hash = ruta
    window.history.replaceState(null, '', url)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  } else {
    window.location.hash = ruta
  }
}
