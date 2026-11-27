// Directorio de directoras de la BDM (MVP "Lista de directoras", 18/11/2026).
// Datos de ejemplo para la demo: nombres y códigos inventados.

export type EstadoPoderosa = 'proyecta' | 'en-camino' | 'no-proyecta'
export type SegmentoId = 'nueva' | 'cuadranteD' | 'formadora'

export interface DirectoraBdm {
  nombre: string
  codigo: string
  estatus: 'JNR' | 'SNR'
  /** Relación en la genealogía y de quién es hija (como en las cards de Gestión de BDM). */
  relacion: 'Hija' | 'Nieta'
  de: string
  cuadrante: 'A' | 'B' | 'C' | 'D'
  potencialFormadora: boolean
  /** Nueva Directora: menos de 2 años como directora. */
  nueva: boolean
  /** Enganche PAR actual: N° de estrellas (0–6). */
  estrellas: number
  liderPoderosa: EstadoPoderosa
}

export const BDM = {
  nombre: 'Allison Paredes',
  coordinacion: 'Coordinación Lima Norte',
}

/** Chips principales: los 3 segmentos de la metodología, al mismo nivel y combinables por intersección. */
export const SEGMENTOS: { id: SegmentoId; etiqueta: string; cumple: (d: DirectoraBdm) => boolean }[] = [
  { id: 'nueva', etiqueta: 'Nuevas Directoras < 2 años', cumple: (d) => d.nueva },
  { id: 'cuadranteD', etiqueta: 'Cuadrante D', cumple: (d) => d.cuadrante === 'D' },
  { id: 'formadora', etiqueta: 'Potenciales Formadoras', cumple: (d) => d.potencialFormadora },
]

export const TEXTO_PODEROSA: Record<EstadoPoderosa, string> = {
  proyecta: 'Proyecta',
  'en-camino': 'En camino',
  'no-proyecta': 'No proyecta',
}

export const DIRECTORAS_BDM: DirectoraBdm[] = [
  { nombre: 'Rosa Cárdenas Puma', codigo: '2201845521', estatus: 'SNR', relacion: 'Hija', de: 'Gabriela M.', cuadrante: 'A', potencialFormadora: true, nueva: false, estrellas: 3, liderPoderosa: 'proyecta' },
  { nombre: 'Milagros Quispe Flores', codigo: '2201911687', estatus: 'SNR', relacion: 'Hija', de: 'Gabriela M.', cuadrante: 'A', potencialFormadora: true, nueva: false, estrellas: 2, liderPoderosa: 'en-camino' },
  { nombre: 'Daniela Izquierdo Ramos', codigo: '2202014155', estatus: 'JNR', relacion: 'Hija', de: 'Rosa C.', cuadrante: 'B', potencialFormadora: false, nueva: true, estrellas: 1, liderPoderosa: 'no-proyecta' },
  { nombre: 'Camila López Li', codigo: '2202051190', estatus: 'JNR', relacion: 'Nieta', de: 'Milagros Q.', cuadrante: 'D', potencialFormadora: false, nueva: true, estrellas: 0, liderPoderosa: 'no-proyecta' },
  { nombre: 'Mauricio Ramírez Soto', codigo: '2201733408', estatus: 'SNR', relacion: 'Hija', de: 'Gabriela M.', cuadrante: 'C', potencialFormadora: false, nueva: false, estrellas: 1, liderPoderosa: 'en-camino' },
  { nombre: 'Esmeralda Vega Torres', codigo: '2202098812', estatus: 'JNR', relacion: 'Nieta', de: 'Rosa C.', cuadrante: 'D', potencialFormadora: false, nueva: true, estrellas: 0, liderPoderosa: 'no-proyecta' },
  { nombre: 'Patricia Huamán Rojas', codigo: '2201652290', estatus: 'SNR', relacion: 'Hija', de: 'Gabriela M.', cuadrante: 'A', potencialFormadora: true, nueva: false, estrellas: 4, liderPoderosa: 'proyecta' },
  { nombre: 'Lorena Castillo Paz', codigo: '2201988034', estatus: 'JNR', relacion: 'Hija', de: 'Patricia H.', cuadrante: 'A', potencialFormadora: true, nueva: true, estrellas: 2, liderPoderosa: 'en-camino' },
  { nombre: 'Gisela Mori Zapata', codigo: '2201577613', estatus: 'SNR', relacion: 'Hija', de: 'Gabriela M.', cuadrante: 'D', potencialFormadora: false, nueva: false, estrellas: 1, liderPoderosa: 'no-proyecta' },
  { nombre: 'Andrea Quispe Mamani', codigo: '2202110467', estatus: 'JNR', relacion: 'Nieta', de: 'Patricia H.', cuadrante: 'C', potencialFormadora: false, nueva: true, estrellas: 0, liderPoderosa: 'no-proyecta' },
  { nombre: 'Verónica Ríos Salinas', codigo: '2201499150', estatus: 'SNR', relacion: 'Hija', de: 'Gabriela M.', cuadrante: 'A', potencialFormadora: true, nueva: false, estrellas: 5, liderPoderosa: 'proyecta' },
  { nombre: 'Brenda Salas Cueva', codigo: '2201866725', estatus: 'JNR', relacion: 'Nieta', de: 'Verónica R.', cuadrante: 'B', potencialFormadora: false, nueva: false, estrellas: 1, liderPoderosa: 'no-proyecta' },
  { nombre: 'Diana Cabrera Luján', codigo: '2202135579', estatus: 'JNR', relacion: 'Nieta', de: 'Verónica R.', cuadrante: 'D', potencialFormadora: false, nueva: true, estrellas: 0, liderPoderosa: 'no-proyecta' },
  { nombre: 'Lucía Herrera Campos', codigo: '2201620948', estatus: 'SNR', relacion: 'Hija', de: 'Gabriela M.', cuadrante: 'B', potencialFormadora: false, nueva: false, estrellas: 2, liderPoderosa: 'en-camino' },
  { nombre: 'Mónica Lazo Ugarte', codigo: '2201904376', estatus: 'JNR', relacion: 'Hija', de: 'Lucía H.', cuadrante: 'A', potencialFormadora: true, nueva: false, estrellas: 2, liderPoderosa: 'no-proyecta' },
  { nombre: 'Rosa Maldonado Ccori', codigo: '2201788261', estatus: 'JNR', relacion: 'Hija', de: 'Lucía H.', cuadrante: 'D', potencialFormadora: false, nueva: false, estrellas: 0, liderPoderosa: 'no-proyecta' },
  { nombre: 'Inés Ferrer Valdivia', codigo: '2201955103', estatus: 'JNR', relacion: 'Nieta', de: 'Mónica L.', cuadrante: 'C', potencialFormadora: false, nueva: false, estrellas: 1, liderPoderosa: 'no-proyecta' },
  { nombre: 'Paola Vásquez Neyra', codigo: '2201543389', estatus: 'SNR', relacion: 'Hija', de: 'Gabriela M.', cuadrante: 'A', potencialFormadora: false, nueva: false, estrellas: 3, liderPoderosa: 'en-camino' },
]
