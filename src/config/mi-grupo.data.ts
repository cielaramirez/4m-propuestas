// Datos de "Mis Grupos", traídos de la pantalla Equipo de maya-redesign (/n/equipo).
// Los montos están en soles: en pantalla pasan por dinero() para salir en la moneda del país.

export type EstadoConsultora = 'activa' | 'riesgo' | 'nueva' | 'deuda'
export type Tono = 'ok' | 'alerta' | 'peligro' | 'info'

export interface Consultora {
  nombre: string
  nivel: 'CNS' | 'CEM' | 'CES' | 'ASP'
  ventaPersonal: number
  ventaGrupal?: number
  estado: EstadoConsultora
}

export interface CreditoPendiente {
  nombre: string
  codigo: string
  montoSolicitado: number
  /** Puntos que sumaría al IM del grupo si se aprueba. */
  impactoIM: number
}

export interface AccionGrupo {
  etiqueta: string
  cantidad: number
  tono: Tono
  ayuda: string
  /** Filtro de la lista de consultoras que abre la acción. */
  filtro?: string
}

export interface Meta {
  real: number
  meta: number
}

export interface Directora {
  nombre: string
  estatus: 'JNR' | 'SNR' | 'SSE'
  /** 1 Hija · 2 Nieta · 3 Bisnieta */
  generacion: 1 | 2 | 3
  cuadrante: 'A' | 'B' | 'C' | 'D'
  /** Qué le falta para llegar a Cuadrante A ('' si ya está en A). Montos entre llaves. */
  faltaA: string
  metas: { ventaGP: Meta; activas: Meta; pped: Meta; reactivas: Meta; retenidas: Meta }
  emprendedoras: { cem: number; ces: number; nota: string }
  par: { proyectada: number; sueno: number; falta: string }
}

export const GRUPO_PERSONAL = {
  activas: 31,
  metaActivas: 65,
  celebraciones: 12,
}

export const ACCIONES_GRUPO: AccionGrupo[] = [
  { etiqueta: 'Reactivar', cantidad: 42, tono: 'alerta', ayuda: 'Sin pedido en 2+ campañas', filtro: 'riesgo' },
  { etiqueta: 'Deuda', cantidad: 4, tono: 'peligro', ayuda: 'Con saldo vencido', filtro: 'deuda' },
  { etiqueta: 'Retener', cantidad: 29, tono: 'info', ayuda: 'Repitentes: la base del negocio' },
  { etiqueta: 'Inicio Ganador', cantidad: 5, tono: 'info', ayuda: 'En programa de inicio' },
  { etiqueta: 'Sin 1er Pedido', cantidad: 11, tono: 'alerta', ayuda: 'Incorporadas sin pedido', filtro: 'nueva' },
  { etiqueta: 'Activas', cantidad: 30, tono: 'ok', ayuda: 'Con pedido esta campaña', filtro: 'activa' },
]

export const CONSULTORAS: Consultora[] = [
  { nombre: 'Renata Olivares Cano', nivel: 'CNS', ventaPersonal: 0, estado: 'riesgo' },
  { nombre: 'Carmen Paredes Luna', nivel: 'CEM', ventaPersonal: 0, ventaGrupal: 14250, estado: 'riesgo' },
  { nombre: 'Tatiana Aguirre Solís', nivel: 'CNS', ventaPersonal: 3495, estado: 'activa' },
  { nombre: 'Daniela Robles Vega', nivel: 'CNS', ventaPersonal: 0, estado: 'deuda' },
  { nombre: 'Yamila Rodas Leyton', nivel: 'CNS', ventaPersonal: 0, estado: 'riesgo' },
  { nombre: 'Silvana Prado Mora', nivel: 'CES', ventaPersonal: 5120, ventaGrupal: 38900, estado: 'activa' },
  { nombre: 'Karen Núñez Ibarra', nivel: 'CNS', ventaPersonal: 1180, estado: 'nueva' },
  { nombre: 'Martha Cisneros Peña', nivel: 'CNS', ventaPersonal: 2640, estado: 'activa' },
  { nombre: 'Natalia Fuentes Gil', nivel: 'ASP', ventaPersonal: 0, estado: 'nueva' },
  { nombre: 'Samanta Beltrán Cruz', nivel: 'CNS', ventaPersonal: 890, estado: 'activa' },
  { nombre: 'Luz Salazar Ortiz', nivel: 'CNS', ventaPersonal: 4210, estado: 'activa' },
  { nombre: 'Emma Gutiérrez Lara', nivel: 'CEM', ventaPersonal: 760, ventaGrupal: 9870, estado: 'activa' },
]

export const CREDITOS_PENDIENTES: CreditoPendiente[] = [
  { nombre: 'Karen Núñez Ibarra', codigo: '2202014155', montoSolicitado: 480, impactoIM: 0.3 },
  { nombre: 'Renata Olivares Cano', codigo: '2201911687', montoSolicitado: 1200, impactoIM: 0.8 },
  { nombre: 'Natalia Fuentes Gil', codigo: '2202051190', montoSolicitado: 650, impactoIM: 0.4 },
]

/** Meta de hijas en Cuadrante A para la Medalla de Liderazgo. */
export const META_HIJAS_EN_A = 60

/**
 * Red de liderazgo: cada directora aparece una sola vez y las lentes reordenan la lista.
 * Cada una es empresaria independiente y gestiona el crédito de su grupo: aquí no se aprueban créditos.
 */
export const DIRECTORAS: Directora[] = [
  {
    nombre: 'Verónica Ríos', estatus: 'SNR', generacion: 1, cuadrante: 'A', faltaA: '',
    metas: { ventaGP: { real: 245700, meta: 230000 }, activas: { real: 63, meta: 60 }, pped: { real: 7, meta: 6 }, reactivas: { real: 11, meta: 10 }, retenidas: { real: 49, meta: 47 } },
    emprendedoras: { cem: 4, ces: 2, nota: '4 CEM · 2 CES, crecen parejo' },
    par: { proyectada: 4, sueno: 5, falta: 'IM de GF ≤ 3% para su Estrella 5' },
  },
  {
    nombre: 'Lucía Herrera', estatus: 'SNR', generacion: 1, cuadrante: 'A', faltaA: '',
    metas: { ventaGP: { real: 212400, meta: 200000 }, activas: { real: 58, meta: 55 }, pped: { real: 6, meta: 5 }, reactivas: { real: 9, meta: 8 }, retenidas: { real: 44, meta: 42 } },
    emprendedoras: { cem: 3, ces: 1, nota: '3 CEM · 1 CES' },
    par: { proyectada: 3, sueno: 4, falta: 'Sostener el monto de venta del Sueño' },
  },
  {
    nombre: 'Paola Vásquez', estatus: 'JNR', generacion: 1, cuadrante: 'A', faltaA: '',
    metas: { ventaGP: { real: 168900, meta: 160000 }, activas: { real: 41, meta: 40 }, pped: { real: 4, meta: 4 }, reactivas: { real: 6, meta: 6 }, retenidas: { real: 33, meta: 32 } },
    emprendedoras: { cem: 2, ces: 0, nota: '2 CEM · aún sin CES' },
    par: { proyectada: 2, sueno: 3, falta: 'Formar 1 nueva directora para Estrella 3' },
  },
  {
    nombre: 'Andrea Quispe', estatus: 'JNR', generacion: 1, cuadrante: 'C', faltaA: 'Cumple PPED · le faltan {41700} de venta (MRM)',
    metas: { ventaGP: { real: 98300, meta: 140000 }, activas: { real: 27, meta: 38 }, pped: { real: 4, meta: 4 }, reactivas: { real: 2, meta: 6 }, retenidas: { real: 22, meta: 31 } },
    emprendedoras: { cem: 0, ces: 0, nota: 'Sin emprendedoras aún' },
    par: { proyectada: 1, sueno: 3, falta: 'Cumplir el monto de venta del Sueño' },
  },
  {
    nombre: 'Rosa Maldonado', estatus: 'JNR', generacion: 1, cuadrante: 'D', faltaA: 'Le faltan venta (MRM) y primeros pedidos',
    metas: { ventaGP: { real: 64100, meta: 135000 }, activas: { real: 21, meta: 37 }, pped: { real: 0, meta: 4 }, reactivas: { real: 1, meta: 6 }, retenidas: { real: 16, meta: 31 } },
    emprendedoras: { cem: 1, ces: 0, nota: '1 CEM · aún sin CES' },
    par: { proyectada: 1, sueno: 2, falta: 'Estabilizar el grupo antes de proyectar' },
  },
  {
    nombre: 'Mónica Lazo', estatus: 'JNR', generacion: 2, cuadrante: 'A', faltaA: '',
    metas: { ventaGP: { real: 142000, meta: 135000 }, activas: { real: 36, meta: 34 }, pped: { real: 4, meta: 3 }, reactivas: { real: 5, meta: 5 }, retenidas: { real: 27, meta: 26 } },
    emprendedoras: { cem: 1, ces: 0, nota: '1 CEM · aún sin CES' },
    par: { proyectada: 2, sueno: 3, falta: 'Cuadrante A 1 campaña más' },
  },
  {
    nombre: 'Brenda Salas', estatus: 'JNR', generacion: 2, cuadrante: 'B', faltaA: 'Cumple venta (MRM) · le faltan 2 primeros pedidos',
    metas: { ventaGP: { real: 121000, meta: 150000 }, activas: { real: 32, meta: 40 }, pped: { real: 2, meta: 4 }, reactivas: { real: 4, meta: 7 }, retenidas: { real: 26, meta: 33 } },
    emprendedoras: { cem: 1, ces: 0, nota: '1 CEM · aún sin CES' },
    par: { proyectada: 1, sueno: 2, falta: 'Subir a Cuadrante A' },
  },
  {
    nombre: 'Diana Cabrera', estatus: 'JNR', generacion: 2, cuadrante: 'D', faltaA: 'Le faltan venta (MRM) y primeros pedidos',
    metas: { ventaGP: { real: 51200, meta: 130000 }, activas: { real: 18, meta: 36 }, pped: { real: 0, meta: 4 }, reactivas: { real: 1, meta: 6 }, retenidas: { real: 14, meta: 30 } },
    emprendedoras: { cem: 0, ces: 0, nota: 'Sin emprendedoras aún' },
    par: { proyectada: 0, sueno: 2, falta: 'Aún sin proyección PAR+' },
  },
  {
    nombre: 'Inés Ferrer', estatus: 'JNR', generacion: 3, cuadrante: 'C', faltaA: 'Cumple PPED · le faltan {44000} de venta (MRM)',
    metas: { ventaGP: { real: 76000, meta: 120000 }, activas: { real: 22, meta: 35 }, pped: { real: 4, meta: 4 }, reactivas: { real: 1, meta: 5 }, retenidas: { real: 18, meta: 30 } },
    emprendedoras: { cem: 0, ces: 0, nota: 'Sin emprendedoras aún' },
    par: { proyectada: 1, sueno: 2, falta: 'Lograr su primer hito PAR+' },
  },
]
