import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { CONFIG, esSigla, type Pais, type Perfil, type Sigla } from '../config/demo.config'
import { fijarPais } from '../domain/format'
import type { Sueno } from '../domain/carrera'
import type { FiltroFormaciones } from '../domain/formaciones'
import type { Potencial } from '../domain/potencial'
import { reproducir, type Sonido } from '../domain/sonido'

const CLAVE = 'maya-formaciones-demo:v1'

export interface Sesion {
  /** Nombre de la participante: única fuente para saludo, chats y firmas. */
  nombre: string
  /** Directora madre ingresada en la configuración ('' = usar la del config). */
  directora: string
  mostrarPanel: boolean
  /** País de la sesión: define la moneda y los montos. */
  pais: Pais
}

export interface MensajeEnviado {
  texto: string
  hora: string
  /** true = respuesta simulada del contacto (burbuja entrante). */
  recibido?: boolean
}

/** Estado propio de cada perfil; cambiar de perfil no borra el de los otros. */
export interface EstadoPerfil {
  sueno: Sueno | null
  /** Mensajes enviados por chat simulado (clave = id del chat). */
  chats: Record<string, MensajeEnviado[]>
  popupBonoVisto: boolean
  filtroFormaciones: FiltroFormaciones
  /** Filtro por potencial de Emprendedoras (Parte C); null = Todas. */
  filtroEmprendedoras: Potencial | null
}

const PERFIL_VACIO: EstadoPerfil = { sueno: null, chats: {}, popupBonoVisto: false, filtroFormaciones: 'listas', filtroEmprendedoras: null }

interface Persistido {
  /** Sonidos de Mi carrera activados (se puede silenciar desde la pantalla). */
  sonido: boolean
  sesion: Sesion | null
  perfil: Sigla
  porPerfil: Partial<Record<Sigla, EstadoPerfil>>
}

/** Paso del flujo de Mi carrera (hojas inferiores). */
export type Flujo = null | { paso: 'beneficios' | 'sueno' | 'confirmacion'; editando: boolean }

interface Estado extends Persistido {
  flujo: Flujo
  /** Popup del bono de formación abierto (Parte B). */
  popupBono: boolean
  /** Mensaje que un simulador deja listo para el siguiente chat (clave = id del chat). */
  borrador: { chat: string; texto: string } | null
  hojasAbiertas: number
  aviso: { id: number; texto: string } | null
}

type Accion =
  | { tipo: 'iniciar'; sesion: Sesion; perfil: Sigla }
  | { tipo: 'reiniciar' }
  | { tipo: 'cambiarPerfil'; perfil: Sigla }
  | { tipo: 'flujo'; flujo: Flujo }
  | { tipo: 'guardarSueno'; sueno: Sueno }
  | { tipo: 'enviarMensaje'; chat: string; mensaje: MensajeEnviado }
  | { tipo: 'popupBono'; abierto: boolean }
  | { tipo: 'filtroFormaciones'; filtro: FiltroFormaciones }
  | { tipo: 'filtroEmprendedoras'; filtro: Potencial | null }
  | { tipo: 'borrador'; borrador: Estado['borrador'] }
  | { tipo: 'sonido'; activo: boolean }
  | { tipo: 'hoja'; delta: 1 | -1 }
  | { tipo: 'aviso'; texto: string | null }

function editarPerfil(estado: Estado, cambio: (p: EstadoPerfil) => EstadoPerfil): Estado {
  const actual = { ...PERFIL_VACIO, ...estado.porPerfil[estado.perfil] }
  return { ...estado, porPerfil: { ...estado.porPerfil, [estado.perfil]: cambio(actual) } }
}

function reductor(estado: Estado, accion: Accion): Estado {
  switch (accion.tipo) {
    case 'iniciar':
      return { ...estado, sesion: accion.sesion, perfil: accion.perfil, flujo: null, popupBono: false }
    case 'reiniciar':
      return { ...estadoInicial(false), perfil: estado.perfil }
    case 'cambiarPerfil':
      return { ...estado, perfil: accion.perfil, flujo: null, popupBono: false }
    case 'flujo':
      return { ...estado, flujo: accion.flujo }
    case 'guardarSueno':
      return editarPerfil(estado, (p) => ({ ...p, sueno: accion.sueno }))
    case 'enviarMensaje':
      return editarPerfil(estado, (p) => ({
        ...p,
        chats: { ...p.chats, [accion.chat]: [...(p.chats[accion.chat] ?? []), accion.mensaje] },
      }))
    case 'popupBono':
      // Al abrirse queda marcado como visto para ese perfil.
      return accion.abierto
        ? { ...editarPerfil(estado, (p) => ({ ...p, popupBonoVisto: true })), popupBono: true }
        : { ...estado, popupBono: false }
    case 'filtroFormaciones':
      return editarPerfil(estado, (p) => ({ ...p, filtroFormaciones: accion.filtro }))
    case 'filtroEmprendedoras':
      return editarPerfil(estado, (p) => ({ ...p, filtroEmprendedoras: accion.filtro }))
    case 'borrador':
      return { ...estado, borrador: accion.borrador }
    case 'sonido':
      return { ...estado, sonido: accion.activo }
    case 'hoja':
      return { ...estado, hojasAbiertas: Math.max(0, estado.hojasAbiertas + accion.delta) }
    case 'aviso':
      return { ...estado, aviso: accion.texto ? { id: Date.now(), texto: accion.texto } : null }
  }
}

function leerPersistido(): Persistido | null {
  try {
    const crudo = localStorage.getItem(CLAVE)
    if (!crudo) return null
    const datos = JSON.parse(crudo) as Persistido
    if (!esSigla(datos.perfil)) return null
    return { sonido: true, sesion: datos.sesion ?? null, perfil: datos.perfil, porPerfil: datos.porPerfil ?? {} }
  } catch {
    return null
  }
}

function estadoInicial(usarGuardado = true): Estado {
  const guardado = usarGuardado ? leerPersistido() : null
  // El perfil también se puede fijar por URL: ?como=CEM
  const como = new URLSearchParams(window.location.search).get('como')?.toUpperCase()
  return {
    sonido: guardado?.sonido ?? true,
    sesion: guardado?.sesion ?? null,
    perfil: esSigla(como) ? como : (guardado?.perfil ?? 'CEM'),
    porPerfil: guardado?.porPerfil ?? {},
    flujo: null,
    popupBono: false,
    borrador: null,
    hojasAbiertas: 0,
    aviso: null,
  }
}

interface Demo {
  sesion: Sesion | null
  sigla: Sigla
  perfil: Perfil
  /** Estado del perfil activo. */
  mio: EstadoPerfil
  /** Directora madre de las Emprendedoras (configurada o la del config). */
  directoraMadre: string
  flujo: Flujo
  popupBono: boolean
  borrador: Estado['borrador']
  hayHojaAbierta: boolean
  aviso: Estado['aviso']
  iniciar(sesion: Sesion, perfil: Sigla): void
  reiniciar(): void
  cambiarPerfil(perfil: Sigla): void
  abrirFlujo(paso: NonNullable<Flujo>['paso'], editando?: boolean): void
  cerrarFlujo(): void
  guardarSueno(sueno: Sueno): void
  enviarMensaje(chat: string, mensaje: MensajeEnviado): void
  abrirPopupBono(): void
  cerrarPopupBono(): void
  elegirFiltroFormaciones(filtro: FiltroFormaciones): void
  elegirFiltroEmprendedoras(filtro: Potencial | null): void
  dejarBorrador(borrador: Estado['borrador']): void
  /** Sonidos de Mi carrera. */
  sonidoActivo: boolean
  activarSonido(activo: boolean): void
  /** Reproduce un sonido si no están silenciados. */
  sonar(sonido: Sonido): void
  registrarHoja(delta: 1 | -1): void
  avisar(texto: string | null): void
}

const Contexto = createContext<Demo | null>(null)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [estado, despachar] = useReducer(reductor, undefined, () => estadoInicial())

  // Los montos se formatean según el país de la sesión (las guardadas sin país son de Perú).
  fijarPais(estado.sesion?.pais ?? CONFIG.paisPorDefecto)

  useEffect(() => {
    const { sonido, sesion, perfil, porPerfil } = estado
    try {
      localStorage.setItem(CLAVE, JSON.stringify({ sonido, sesion, perfil, porPerfil } satisfies Persistido))
    } catch {
      // sin localStorage la demo sigue funcionando en memoria
    }
  }, [estado.sonido, estado.sesion, estado.perfil, estado.porPerfil]) // eslint-disable-line react-hooks/exhaustive-deps

  const iniciar = useCallback((sesion: Sesion, perfil: Sigla) => despachar({ tipo: 'iniciar', sesion, perfil }), [])
  const reiniciar = useCallback(() => despachar({ tipo: 'reiniciar' }), [])
  const cambiarPerfil = useCallback((perfil: Sigla) => despachar({ tipo: 'cambiarPerfil', perfil }), [])
  const abrirFlujo = useCallback(
    (paso: NonNullable<Flujo>['paso'], editando = false) => despachar({ tipo: 'flujo', flujo: { paso, editando } }),
    [],
  )
  const cerrarFlujo = useCallback(() => despachar({ tipo: 'flujo', flujo: null }), [])
  const guardarSueno = useCallback((sueno: Sueno) => despachar({ tipo: 'guardarSueno', sueno }), [])
  const enviarMensaje = useCallback(
    (chat: string, mensaje: MensajeEnviado) => despachar({ tipo: 'enviarMensaje', chat, mensaje }),
    [],
  )
  const abrirPopupBono = useCallback(() => despachar({ tipo: 'popupBono', abierto: true }), [])
  const cerrarPopupBono = useCallback(() => despachar({ tipo: 'popupBono', abierto: false }), [])
  const elegirFiltroFormaciones = useCallback(
    (filtro: FiltroFormaciones) => despachar({ tipo: 'filtroFormaciones', filtro }),
    [],
  )
  const elegirFiltroEmprendedoras = useCallback(
    (filtro: Potencial | null) => despachar({ tipo: 'filtroEmprendedoras', filtro }),
    [],
  )
  const dejarBorrador = useCallback((borrador: Estado['borrador']) => despachar({ tipo: 'borrador', borrador }), [])
  const activarSonido = useCallback((activo: boolean) => despachar({ tipo: 'sonido', activo }), [])
  const sonidoActivo = estado.sonido
  const sonar = useCallback((sonido: Sonido) => sonidoActivo && reproducir(sonido), [sonidoActivo])
  const registrarHoja = useCallback((delta: 1 | -1) => despachar({ tipo: 'hoja', delta }), [])
  const avisar = useCallback((texto: string | null) => despachar({ tipo: 'aviso', texto }), [])

  const valor = useMemo<Demo>(
    () => ({
      sesion: estado.sesion,
      sigla: estado.perfil,
      perfil: CONFIG.perfiles[estado.perfil],
      mio: { ...PERFIL_VACIO, ...estado.porPerfil[estado.perfil] },
      directoraMadre: estado.sesion?.directora || CONFIG.directoraPorDefecto,
      flujo: estado.flujo,
      popupBono: estado.popupBono,
      borrador: estado.borrador,
      hayHojaAbierta: estado.hojasAbiertas > 0,
      aviso: estado.aviso,
      iniciar,
      reiniciar,
      cambiarPerfil,
      abrirFlujo,
      cerrarFlujo,
      guardarSueno,
      enviarMensaje,
      abrirPopupBono,
      cerrarPopupBono,
      elegirFiltroFormaciones,
      elegirFiltroEmprendedoras,
      dejarBorrador,
      sonidoActivo,
      activarSonido,
      sonar,
      registrarHoja,
      avisar,
    }),
    [estado, iniciar, reiniciar, cambiarPerfil, abrirFlujo, cerrarFlujo, guardarSueno, enviarMensaje, abrirPopupBono, cerrarPopupBono, elegirFiltroFormaciones, elegirFiltroEmprendedoras, dejarBorrador, sonidoActivo, activarSonido, sonar, registrarHoja, avisar],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useDemo(): Demo {
  const demo = useContext(Contexto)
  if (!demo) throw new Error('useDemo debe usarse dentro de <DemoProvider>')
  return demo
}
