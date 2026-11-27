import { campanaDe, numeroCampana } from './calendario'

// La campaña y la semana salen de la fecha de hoy según el calendario oficial.
const HOY = campanaDe(new Date())
/** Campaña a n campañas de la actual (-1 = la anterior), ya en 1–13. */
const c = (n: number) => numeroCampana(HOY.campana + n)

/**
 * ÚNICA FUENTE DE DATOS DE LA DEMO.
 * Perfiles, ganancias, requisitos, textos legales y URLs viven aquí.
 * Ningún número se escribe directo en los componentes.
 */

/** Países de la demo. Los montos del config están en soles (Perú) y se adaptan por país. */
export type Pais = 'PE' | 'EC'

export interface DatosPais {
  nombre: string
  /** Símbolo que antecede al monto, sin espacio. */
  simbolo: string
  /** Separador de miles: "S/1,820" en Perú, "$6.360" en Ecuador (igual que el campo de monto de FrYDA). */
  separadorMiles: string
  /** Código de moneda del campo de monto de FrYDA. */
  moneda: string
  /** Factor para llevar un monto en soles a la moneda del país (1 = sin cambio). */
  factor: number
  /**
   * Montos adaptados al país que NO salen del factor: clave = monto en soles del config,
   * valor = monto en la moneda local. Tienen prioridad sobre el factor.
   */
  montosAdaptados: Record<number, number>
}

export type Sigla = 'CNS' | 'CEM' | 'CES' | 'JNR' | 'SNR' | 'SSE' | 'REG' | 'BDM'
export type Grupo = 'emprendedora' | 'directora' | 'lider' | 'bdm'
export type NivelId = 'consultora' | 'cem' | 'cemSenior' | 'aspirante' | 'directora'

export interface Nivel {
  id: NivelId
  nombre: string
  descripcion: string
  /** Qué se necesita para llegar a este nivel. Los montos van entre llaves, en soles: "{470}". */
  requisitos: string[]
  /** Aclaración que acompaña a los requisitos (opcional). */
  notaRequisitos?: string
  /** Ganancia referencial por campaña; null = no se muestra. */
  gananciaReferencial: number | null
  /** true = la cifra se presenta como "desde S/…". */
  gananciaDesde?: boolean
}

/** Grupo del desglose de Mi negocio, con sus líneas. */
export interface GrupoDesglose {
  titulo: string
  lineas: { concepto: string; monto: number }[]
}

export type Intencion = 'quiere' | 'aunNoDecide' | 'noRegistro'

/** Variables que definen si una candidata o emprendedora "cumple". */
export interface Metricas {
  ventaGP: number
  activas: number
  pped: number
}

/** Candidata del grupo de una Directora Junior o Senior (Parte B). */
export interface Candidata extends Metricas {
  id: string
  nombre: string
  nivel: NivelId
  intencion: Intencion
  /** Sueño registrado (clave de CONFIG.suenos.segundaPersona); solo si quiere ser Directora. */
  sueno?: string
  /** Si se indica, la candidata solo aparece para esos perfiles. */
  soloPara?: Sigla[]
}

/** Resultado de una emprendedora en una campaña (fila de "Ver crecimiento"). */
export interface RegistroCampana extends Metricas {
  campana: number
  califica: NivelId
  /** Índice de morosidad, en porcentaje. */
  im: number
  /** Solo informativo; para el potencial se usa `pped` (el del grupo). */
  ppedDirectos: number
}

/** Emprendedora del grupo de una Directora hija (Parte C). */
export interface Emprendedora {
  id: string
  nombre: string
  intencion: Intencion
  /** Últimas campañas, la actual primero. La card muestra exactamente historial[0]. */
  historial: RegistroCampana[]
}

export interface DirectoraHija {
  id: string
  nombre: string
  estatus: string
  madre: string
  /** Etiqueta "P. Formadora". */
  formadora: boolean
  /** Formaciones pactadas en su plan de negocio. */
  formacionesPactadas: number
  /** Venta GP de la Directora por campaña, la actual primero (mismas campañas que el historial). */
  ventaGP: number[]
  emprendedoras: Emprendedora[]
}

/** Consultora del grupo de una Emprendedora (Programas · Elige Crecer). */
export interface ConsultoraGrupo {
  id: string
  nombre: string
  nivel: NivelId
  /** Venta personal por campaña, la actual primero. Vacío = nueva, aún sin pedidos. */
  ventas: number[]
  soloPara: Sigla[]
}

/** CEM o CEM Senior del grupo de una Directora que participa en Elige Crecer. */
export interface ParticipanteEligeCrecer {
  id: string
  nombre: string
  nivel: NivelId
  /** Campaña en la que empezó su programa. */
  campanaInicio: number
  /** Activas que creció en cada campaña del programa, desde la de inicio. */
  crecimiento: number[]
}

export interface Ascenso {
  titulo: string
  desde: string
  hacia: string
  beneficios: string[]
}

export interface Perfil {
  sigla: Sigla
  grupo: Grupo
  /** Línea descriptiva del panel "Ver como". */
  descripcion: string
  /** Ganancia estimada actual; null = no se muestra (Líderes). */
  gananciaActual: number | null
  /** Posición en el camino de carrera (solo Emprendedoras). */
  nivel?: NivelId
  /** Resumen "Mi Campaña" del Home. */
  campana: {
    ventaGP: number
    activasGrupo: number
    deudaActual: number
    creditoYanbal: number
    ventaPersonal: number
  }
  /** Desglose de Mi negocio; debe sumar gananciaActual. */
  desglose: GrupoDesglose[]
}

export const CONFIG = {
  paisPorDefecto: 'PE' as Pais,
  paises: {
    PE: { nombre: 'Perú', simbolo: 'S/', separadorMiles: ',', moneda: 'PEN', factor: 1, montosAdaptados: {} },
    EC: {
      nombre: 'Ecuador',
      simbolo: '$',
      separadorMiles: '.',
      moneda: 'USD',
      // Equivalencia del PAR+ 2026: las mismas exigencias están en S/ para Perú y en US$ para Ecuador
      // (Cuadrante A Junior S/22,500 ↔ US$6.000; Senior S/28,200 ↔ US$7.500), es decir S/3.75 por dólar.
      factor: 1 / 3.75,
      // TODO validar con Comercial: el folleto PAR+ de Ecuador no trae ganancias por campaña ni bono de
      // formación; estos montos son los de Perú llevados a dólares con esa equivalencia y redondeados.
      // Los desgloses de Mi negocio suman su total también en dólares.
      montosAdaptados: {
        // Cifra de carrera, bono de formación y umbral de Venta GP
        1820: 485,
        750: 200,
        15000: 4000,
        // Requisitos de nivel: Nivel 1 de Ganamás y venta de Grupo Personal de CEM Senior
        470: 125,
        6000: 1600,
        // Ganancia estimada por estatus y ganancia referencial por nivel
        180: 50,
        440: 115,
        600: 160,
        970: 260,
        1400: 375,
        2390: 640,
        3400: 905,
        // Líneas del desglose de Mi negocio
        40: 10,
        50: 15,
        60: 15,
        100: 25,
        120: 30,
        130: 35,
        150: 40,
        500: 135,
        650: 175,
        2200: 590,
        2700: 720,
      },
    },
  } satisfies Record<Pais, DatosPais> as Record<Pais, DatosPais>,

  campana: {
    actual: HOY.campana,
    etiqueta: `Campaña ${HOY.campana}`,
    corte: `C${HOY.campana} - S${HOY.semana}`,
    actualizado: 'Actualizado 09:30 a.m.',
  },

  /** Cifra de carrera: siempre "desde S/1,820 por campaña". */
  gananciaDirectora: 1820,

  /** Directora madre por defecto de las Emprendedoras. */
  directoraPorDefecto: 'Gabriela',

  video: {
    youtubeId: 'YL7sFP6tr2M',
    url: 'https://www.youtube.com/watch?v=YL7sFP6tr2M',
  },

  urls: {
    /** Texto corto del enlace de simulación en los mensajes de la Líder. TODO: enlace real. */
    linkSimulacion: 'maya.yanbal.com/simulador',
    /** Texto corto con el que se muestra el enlace a Mi carrera en los mensajes. TODO: enlace real. */
    linkMiCarrera: 'maya.yanbal.com/mi-carrera',
  },

  /** Bono de formación: siempre "S/750". Nunca va en mensajes a candidatas o emprendedoras. */
  bonoFormacion: 750,

  /** Umbrales de "cumple": los mismos para la vista de Directora y la de Líderes. */
  umbrales: { ventaGP: 15000, activas: 10, pped: 3 } satisfies Metricas as Metricas,

  /**
   * Simulador de carrera (Emprendedoras). TODO validar con Comercial:
   * ritmos y reparto de campañas por etapa (tomados del simulador anterior).
   */
  simulador: {
    anioActual: HOY.anio,
    campanasPorAnio: 13,
    /** Campañas de inicio que se ofrecen, contadas desde la campaña actual. */
    inicios: ['Esta campaña', 'La próxima', 'En dos campañas'],
    /**
     * Simulador de formación: qué hace la candidata y qué le toca a su Directora en cada etapa
     * (dicho a la Directora y, para la vista de la Líder, en tercera persona).
     */
    acompanamiento: {
      cem: {
        ella: 'Logra su venta en Nivel 1 e incorpora a su primera consultora activa.',
        tu: 'Ayúdala a pensar en 3 conocidas que venderían bien y acompaña esa primera incorporación.',
        suDirectora: 'La ayuda a pensar en 3 conocidas que venderían bien y acompaña esa primera incorporación.',
      },
      cemSenior: {
        ella: 'Logra sus 4 requisitos en una misma campaña: venta en Nivel 1, 2 primeros pedidos, 5 activas y venta de su Grupo Personal.',
        tu: 'Preséntale la carrera en un semillero y acompaña sus requisitos campaña a campaña.',
        suDirectora: 'Le presenta la carrera en un semillero y acompaña sus requisitos campaña a campaña.',
      },
      aspirante: {
        ella: 'Completa sus 8 cursos y pasa la entrevista de postulación.',
        tu: 'Acompáñala en su postulación y prepárala para la entrevista.',
        suDirectora: 'La acompaña en su postulación y la prepara para la entrevista.',
      },
      directora: {
        ella: 'Sigue el programa Fórmate como Directora: primeros pedidos y desarrollo de su grupo.',
        tu: 'Transfiérele la gestión poco a poco y trabaja tu crecimiento paralelo.',
        suDirectora: 'Le transfiere la gestión poco a poco y trabaja su crecimiento paralelo.',
      },
    } as Partial<Record<NivelId, { ella: string; tu: string; suDirectora: string }>>,
    /**
     * Por perfil: los tres ritmos (campañas totales hasta Directora) y cuántas campañas
     * toma llegar a cada nivel en cada ritmo.
     */
    planes: {
      CNS: {
        10: { cem: 1, cemSenior: 3, aspirante: 3, directora: 3 },
        12: { cem: 2, cemSenior: 4, aspirante: 3, directora: 3 },
        14: { cem: 2, cemSenior: 4, aspirante: 4, directora: 4 },
      },
      CEM: {
        9: { cemSenior: 3, aspirante: 3, directora: 3 },
        11: { cemSenior: 4, aspirante: 4, directora: 3 },
        13: { cemSenior: 5, aspirante: 4, directora: 4 },
      },
      CES: {
        6: { aspirante: 3, directora: 3 },
        8: { aspirante: 5, directora: 3 },
        10: { aspirante: 6, directora: 4 },
      },
    } as Partial<Record<Sigla, Record<number, Partial<Record<NivelId, number>>>>>,
  },

  legales: {
    ganancia: '*Ganancia estimada referencial por campaña (4 semanas).',
    simulador: '*Ganancia estimada referencial por campaña (4 semanas). El plan es una proyección, no una promesa de ingresos.',
    bono: '*Bono referencial, sujeto a las condiciones del programa de formación.',
  },

  suenos: {
    opciones: ['Comprar mi casa', 'Universidad de mis hijos', 'Viajar en familia', 'Tener mi negocio'],
    otro: 'Otro',
    maxCaracteresOtro: 40,
    /** TODO: definir si el monto es obligatorio. */
    montoObligatorio: false,
    /** El mismo sueño dicho en segunda persona, para los mensajes de la Directora. */
    segundaPersona: {
      'Comprar mi casa': 'comprar tu casa',
      'Universidad de mis hijos': 'pagar la universidad de tus hijos',
      'Viajar en familia': 'viajar en familia',
      'Tener mi negocio': 'tener tu negocio',
      'Pagar estudios': 'pagar tus estudios',
    } as Record<string, string>,
  },

  /** Camino de carrera, de menor a mayor. */
  niveles: [
    {
      id: 'consultora',
      nombre: 'Consultora',
      descripcion: 'El punto de partida: vendes productos Yanbal y ganas por tu venta personal.',
      requisitos: [],
      gananciaReferencial: null,
    },
    {
      id: 'cem',
      nombre: 'Consultora Emprendedora',
      descripcion: 'Además de vender, incorporas nuevas consultoras y ganas por cada una.',
      requisitos: ['Venta personal en Nivel 1 de Ganamás ({470})', '1 nueva consultora activa en Nivel 1'],
      gananciaReferencial: 600,
    },
    {
      id: 'cemSenior',
      nombre: 'Consultora Emprendedora Senior',
      descripcion: 'Lideras tu propio grupo y ganas un porcentaje de sus ventas.',
      notaRequisitos: 'En una misma campaña:',
      requisitos: [
        'Venta personal en Nivel 1 de Ganamás ({470})',
        '2 primeros pedidos directos',
        '5 activas directas',
        'Venta de Grupo Personal de {6000}',
      ],
      gananciaReferencial: 970,
    },
    {
      id: 'aspirante',
      nombre: 'Aspirante',
      descripcion: 'Entras al programa Fórmate como Directora, con acompañamiento de tu Directora.',
      requisitos: [
        'Venta de Grupo Personal al 60% de la meta',
        'Mantener calificación de Consultora Emprendedora Senior',
        'Morosidad dentro del límite',
        'Entrevista de postulación',
      ],
      gananciaReferencial: 1400,
    },
    {
      id: 'directora',
      nombre: 'Directora',
      descripcion: 'Diriges tu Grupo Personal y accedes a bonos, reconocimientos y viajes.',
      requisitos: [
        'Venta personal en Nivel 1 de Ganamás ({470})',
        '3 primeros pedidos en el grupo',
        '20 activas en el grupo',
        'Meta de venta del grupo completa',
        'Morosidad dentro del límite',
        '8 cursos completados',
      ],
      gananciaReferencial: 1820,
      gananciaDesde: true,
    },
  ] satisfies Nivel[] as Nivel[],

  perfiles: {
    CNS: {
      sigla: 'CNS',
      grupo: 'emprendedora',
      descripcion: 'Consultora — vende, aún no ha incorporado a nadie',
      gananciaActual: 180,
      nivel: 'consultora',
      campana: { ventaGP: 0, activasGrupo: 0, deudaActual: 120, creditoYanbal: 807, ventaPersonal: 520 },
      desglose: [
        { titulo: 'Mi Venta Personal', lineas: [{ concepto: 'Escala del 25% dto.', monto: 130 }] },
        { titulo: 'Mis Premios', lineas: [{ concepto: 'Wafflera Oster', monto: 50 }] },
      ],
    },
    CEM: {
      sigla: 'CEM',
      grupo: 'emprendedora',
      descripcion: 'Consultora Emprendedora — vende e incorpora nuevas consultoras',
      gananciaActual: 440,
      nivel: 'cem',
      campana: { ventaGP: 400, activasGrupo: 1, deudaActual: 120, creditoYanbal: 807, ventaPersonal: 400 },
      desglose: [
        { titulo: 'Mi Venta Personal', lineas: [{ concepto: 'Escala del 25% dto.', monto: 100 }] },
        {
          titulo: 'Mis Premios',
          lineas: [
            { concepto: 'Microondas Oster', monto: 100 },
            { concepto: 'Wafflera Oster', monto: 40 },
          ],
        },
        {
          titulo: 'Mis Programas',
          lineas: [
            { concepto: 'Incorpora y Gana', monto: 150 },
            { concepto: 'Elige Crecer', monto: 50 },
          ],
        },
      ],
    },
    CES: {
      sigla: 'CES',
      grupo: 'emprendedora',
      descripcion: 'Consultora Emprendedora Senior — lidera un grupo propio de consultoras',
      gananciaActual: 970,
      nivel: 'cemSenior',
      campana: { ventaGP: 6400, activasGrupo: 6, deudaActual: 120, creditoYanbal: 807, ventaPersonal: 480 },
      desglose: [
        { titulo: 'Mi Venta Personal', lineas: [{ concepto: 'Escala del 25% dto.', monto: 120 }] },
        { titulo: 'Ganancia por mi grupo', lineas: [{ concepto: 'Comisión por venta de Grupo Personal', monto: 650 }] },
        {
          titulo: 'Mis Programas',
          lineas: [
            { concepto: 'Incorpora y Gana', monto: 150 },
            { concepto: 'Elige Crecer', monto: 50 },
          ],
        },
      ],
    },
    JNR: {
      sigla: 'JNR',
      grupo: 'directora',
      descripcion: 'Directora Junior — gestiona su Grupo Personal, aún sin hijas directoras',
      gananciaActual: 2390,
      campana: { ventaGP: 18900, activasGrupo: 24, deudaActual: 120, creditoYanbal: 807, ventaPersonal: 800 },
      desglose: [
        { titulo: 'Venta Grupo Personal', lineas: [{ concepto: 'Honorarios 8%', monto: 2200 }] },
        { titulo: 'Venta Personal', lineas: [{ concepto: 'Escala 25% dto.', monto: 50 }] },
        {
          titulo: 'Mis Premios',
          lineas: [
            { concepto: 'Microondas Oster', monto: 100 },
            { concepto: 'Wafflera Oster', monto: 40 },
          ],
        },
      ],
    },
    SNR: {
      sigla: 'SNR',
      grupo: 'directora',
      descripcion: 'Directora Senior — ya formó a una Directora',
      gananciaActual: 3400,
      campana: { ventaGP: 24500, activasGrupo: 31, deudaActual: 120, creditoYanbal: 807, ventaPersonal: 800 },
      desglose: [
        { titulo: 'Venta Grupo Personal', lineas: [{ concepto: 'Honorarios 8%', monto: 2700 }] },
        { titulo: 'Ganancia por hijas Directoras', lineas: [{ concepto: 'Comisión 5% por 1 hija Directora', monto: 500 }] },
        { titulo: 'Venta Personal', lineas: [{ concepto: 'Escala 25% dto.', monto: 60 }] },
        {
          titulo: 'Mis Premios',
          lineas: [
            { concepto: 'Microondas Oster', monto: 100 },
            { concepto: 'Wafflera Oster', monto: 40 },
          ],
        },
      ],
    },
    SSE: {
      sigla: 'SSE',
      grupo: 'directora',
      // En esta demo la Super Senior sigue el mismo flujo que Junior y Senior (Formaciones y sus candidatas).
      descripcion: 'Directora Super Senior — ya formó a 3 Directoras',
      gananciaActual: 4330,
      campana: { ventaGP: 31000, activasGrupo: 36, deudaActual: 120, creditoYanbal: 807, ventaPersonal: 800 },
      desglose: [
        { titulo: 'Venta Grupo Personal', lineas: [{ concepto: 'Honorarios 8%', monto: 2480 }] },
        { titulo: 'Ganancia por hijas Directoras', lineas: [{ concepto: 'Comisión 5.5% por 3 hijas Directoras', monto: 1650 }] },
        { titulo: 'Venta Personal', lineas: [{ concepto: 'Escala 25% dto.', monto: 60 }] },
        {
          titulo: 'Mis Premios',
          lineas: [
            { concepto: 'Microondas Oster', monto: 100 },
            { concepto: 'Wafflera Oster', monto: 40 },
          ],
        },
      ],
    },
    REG: {
      sigla: 'REG',
      grupo: 'lider',
      descripcion: 'Directora Regional — lidera una región de Directoras',
      gananciaActual: null,
      campana: { ventaGP: 80000, activasGrupo: 96, deudaActual: 120, creditoYanbal: 807, ventaPersonal: 800 },
      desglose: [],
    },
    BDM: {
      sigla: 'BDM',
      grupo: 'bdm',
      descripcion: 'Business Development Manager — asesora a las Directoras de su coordinación',
      gananciaActual: null,
      // Mi Campaña de la BDM: cifras de su coordinación (ejemplo)
      campana: { ventaGP: 284500, activasGrupo: 126, deudaActual: 0, creditoYanbal: 0, ventaPersonal: 0 },
      desglose: [],
    },
  } satisfies Record<Sigla, Perfil> as Record<Sigla, Perfil>,

  /** Bloque de ascenso del popup del bono, por perfil. TODO: validar porcentajes y reglas. */
  ascensos: {
    JNR: {
      titulo: 'Forma 1 Directora y asciende a Directora Senior.',
      desde: 'Directora Junior',
      hacia: 'Directora Senior',
      beneficios: [
        'Ganas 5% por tus hijas Directoras (hoy 4.5%)',
        'Empiezas a ganar por tus nietas Directoras (0.3%)',
        'Quedas a 2 formaciones de Super Senior',
      ],
    },
    SNR: {
      titulo: 'Forma 2 Directoras más y asciende a Super Senior.',
      desde: 'Directora Senior',
      hacia: 'Directora Super Senior',
      beneficios: [
        'Ganas 5.5% por tus hijas Directoras (hoy 5%)',
        'Ganas 0.5% por tus nietas Directoras (hoy 0.3%)',
        'Accedes al programa de auto',
      ],
    },
  } as Partial<Record<Sigla, Ascenso>>,

  /** Textos de la Parte B que dependen de la primera variable que la candidata no cumple. */
  faltantes: {
    pped: {
      aviso: 'Le faltan primeros pedidos: motívala a incorporar esta campaña.',
      mensaje: 'sumar primeros pedidos',
    },
    activas: {
      aviso: 'Le faltan activas: ayúdala a reactivar a su grupo.',
      mensaje: 'sumar activas en tu grupo',
    },
    ventaGP: {
      aviso: 'Le falta venta de grupo: revisen juntas su plan de campaña.',
      mensaje: 'subir la venta de tu grupo',
    },
  } satisfies Record<keyof Metricas, { aviso: string; mensaje: string }>,

  /** Candidatas del Grupo Personal de las Directoras Junior, Senior y Super Senior. */
  candidatas: [
    { id: 'luciana-grande', nombre: 'Luciana Grande', nivel: 'cemSenior', ventaGP: 21200, activas: 10, pped: 7, intencion: 'quiere', sueno: 'Comprar mi casa' },
    { id: 'maria-ramos', nombre: 'María Ramos', nivel: 'cemSenior', ventaGP: 15200, activas: 10, pped: 2, intencion: 'quiere', sueno: 'Pagar estudios' },
    { id: 'diego-vasquez', nombre: 'Diego Vásquez', nivel: 'cem', ventaGP: 15200, activas: 10, pped: 2, intencion: 'quiere', sueno: 'Tener mi negocio' },
    { id: 'carolina-rios', nombre: 'Carolina Ríos', nivel: 'consultora', ventaGP: 5200, activas: 0, pped: 3, intencion: 'quiere', sueno: 'Viajar en familia' },
    { id: 'elena-paz', nombre: 'Elena Paz', nivel: 'cemSenior', ventaGP: 18500, activas: 22, pped: 3, intencion: 'noRegistro' },
    { id: 'rosa-medina', nombre: 'Rosa Medina', nivel: 'cemSenior', ventaGP: 17500, activas: 20, pped: 3, intencion: 'noRegistro' },
    { id: 'patricia-solis', nombre: 'Patricia Solís', nivel: 'cemSenior', ventaGP: 19800, activas: 12, pped: 5, intencion: 'quiere', sueno: 'Pagar estudios', soloPara: ['SNR', 'SSE'] },
    { id: 'carmen-vela', nombre: 'Carmen Vela', nivel: 'cemSenior', ventaGP: 18900, activas: 11, pped: 4, intencion: 'quiere', sueno: 'Tener mi negocio', soloPara: ['SNR', 'SSE'] },
  ] as Candidata[],

  /**
   * Programas (pestaña de la barra inferior). Solo "Elige Crecer" está construido.
   * TODO validar con Comercial: bonos, escalones y duración del programa.
   */
  programas: {
    pestanas: ['Elige Crecer', 'Incorpora y Gana', 'Ganamás'],
    /** Venta personal que define el Nivel 1 de Ganamás (en soles). */
    nivel1Ganamas: 470,
    eligeCrecer: {
      /** Campañas que dura el programa. */
      campanas: 3,
      /** Escalones: activas que hay que crecer y bono que se gana, por país (en su moneda). */
      niveles: [
        { activas: 2, bono: { PE: 100, EC: 50 } },
        { activas: 4, bono: { PE: 200, EC: 100 } },
        { activas: 6, bono: { PE: 300, EC: 200 } },
      ] as { activas: number; bono: Record<Pais, number> }[],
      /** Avance propio de la Emprendedora (CEM y CEM Senior; la Consultora aún no participa). */
      miAvance: {
        CEM: { campanaInicio: HOY.campana - 1, crecimiento: [2, 2] },
        CES: { campanaInicio: HOY.campana - 1, crecimiento: [1, 1] },
      } as Partial<Record<Sigla, { campanaInicio: number; crecimiento: number[] }>>,
      /** Consultoras a las que la Emprendedora puede acompañar. */
      consultoras: [
        { id: 'lorena-guzman', nombre: 'Lorena Guzmán', nivel: 'consultora', ventas: [470, 470, 200], soloPara: ['CEM', 'CES'] },
        { id: 'fernanda-montero', nombre: 'Fernanda Montero', nivel: 'consultora', ventas: [420, 470, 220], soloPara: ['CEM', 'CES'] },
        { id: 'tania-olivares', nombre: 'Tania Olivares', nivel: 'consultora', ventas: [], soloPara: ['CES'] },
      ] as ConsultoraGrupo[],
      /** CEM y CEM Senior del grupo de la Directora (Junior y Senior ven la misma lista). */
      participantes: [
        { id: 'laura-picon', nombre: 'Laura Picón', nivel: 'cemSenior', campanaInicio: HOY.campana - 1, crecimiento: [4, 0] },
        { id: 'dante-aguilar', nombre: 'Dante Aguilar', nivel: 'cem', campanaInicio: HOY.campana - 1, crecimiento: [1, 1] },
        { id: 'julieta-farfan', nombre: 'Julieta Farfán', nivel: 'cemSenior', campanaInicio: HOY.campana - 2, crecimiento: [2, 2, 2] },
      ] as ParticipanteEligeCrecer[],
    },
  },

  /** Parte C · Líderes (en esta demo, solo la Regional). */
  lideres: {
    /** Total de LID de la Líder (denominador de "Tienes n/total LID con emprendedoras"). */
    totalLid: 20,
    /** Resumen "Mi Campaña" del Home de la Líder (como en el frame, en dinero). */
    campana: [
      { etiqueta: 'Sueño: Tokio', valor: 'Sí Proyectas', icono: 'sueno' },
      { etiqueta: 'Venta Familiar', valor: 80000, moneda: true, icono: 'dinero' },
      { etiqueta: 'Líder Poderosa', valor: 'Sí Proyecta', icono: 'liderPoderosa' },
      { etiqueta: 'Venta GP actual', valor: 800000, moneda: true, icono: 'dinero' },
      { etiqueta: 'Activas GP', valor: 23, icono: 'check' },
      { etiqueta: 'Primeros Pedidos', valor: 3, icono: 'primerosPedidos' },
      { etiqueta: 'Índice de Morosidad', valor: '2.54%', icono: 'morosidad' },
      { etiqueta: 'Deuda actual', valor: 27000, moneda: true, icono: 'deuda' },
      { etiqueta: 'Cuadrante', valor: 'A', icono: 'cuadrante' },
      { etiqueta: 'Crédito Yanbal', valor: 27000, moneda: true, icono: 'credito' },
    ] as { etiqueta: string; valor: string | number; moneda?: boolean; icono: string }[],
    /** Accesos de "Mis Directoras" con su contador fijo. Solo "Con Aspirante" entra a Emprendedoras; el resto está fuera del alcance de la demo. */
    accesos: [
      { etiqueta: 'Cuadrante D', contador: 2 },
      { etiqueta: 'No logra meta', contador: 10 },
      { etiqueta: 'Con Aspirante', contador: 1, abreEmprendedoras: true },
      { etiqueta: 'Sin CEM/CES', contador: 1 },
      { etiqueta: 'Sin Estrella', contador: 1 },
    ],
    directoras: [
      {
        id: 'lorena-nunez',
        nombre: 'Lorena Núñez',
        estatus: 'SSR',
        madre: 'Giordana L.',
        formadora: true,
        formacionesPactadas: 1,
        ventaGP: [78800, 72900, 63700, 64100],
        emprendedoras: [
          {
            id: 'ena-molocho',
            nombre: 'Ena Molocho',
            intencion: 'quiere',
            historial: [
              { campana: c(0), ventaGP: 21200, califica: 'cemSenior', im: 2.3, activas: 12, ppedDirectos: 2, pped: 4 },
              { campana: c(-1), ventaGP: 19400, califica: 'cemSenior', im: 2.9, activas: 11, ppedDirectos: 2, pped: 3 },
              { campana: c(-2), ventaGP: 17800, califica: 'cem', im: 3.4, activas: 10, ppedDirectos: 1, pped: 2 },
              { campana: c(-3), ventaGP: 16900, califica: 'cem', im: 3.1, activas: 9, ppedDirectos: 1, pped: 2 },
            ],
          },
          {
            id: 'pamela-ramos',
            nombre: 'Pamela Ramos',
            intencion: 'quiere',
            historial: [
              { campana: c(0), ventaGP: 18600, califica: 'cemSenior', im: 2.6, activas: 11, ppedDirectos: 2, pped: 3 },
              { campana: c(-1), ventaGP: 17100, califica: 'cemSenior', im: 2.8, activas: 10, ppedDirectos: 1, pped: 3 },
              { campana: c(-2), ventaGP: 15900, califica: 'cem', im: 3.1, activas: 9, ppedDirectos: 1, pped: 2 },
              { campana: c(-3), ventaGP: 15200, califica: 'cem', im: 3.0, activas: 9, ppedDirectos: 1, pped: 2 },
            ],
          },
          {
            id: 'rocio-huertas',
            nombre: 'Rocío Huertas',
            intencion: 'aunNoDecide',
            historial: [
              { campana: c(0), ventaGP: 16400, califica: 'cemSenior', im: 2.8, activas: 10, ppedDirectos: 1, pped: 3 },
              { campana: c(-1), ventaGP: 15600, califica: 'cemSenior', im: 3.0, activas: 10, ppedDirectos: 1, pped: 2 },
              { campana: c(-2), ventaGP: 14800, califica: 'cem', im: 3.2, activas: 9, ppedDirectos: 1, pped: 2 },
              { campana: c(-3), ventaGP: 14100, califica: 'cem', im: 3.5, activas: 8, ppedDirectos: 0, pped: 1 },
            ],
          },
          {
            id: 'maria-mercedes',
            nombre: 'María Mercedes',
            intencion: 'quiere',
            historial: [
              { campana: c(0), ventaGP: 6800, califica: 'cem', im: 4.1, activas: 5, ppedDirectos: 1, pped: 1 },
              { campana: c(-1), ventaGP: 6100, califica: 'cem', im: 3.8, activas: 5, ppedDirectos: 0, pped: 1 },
              { campana: c(-2), ventaGP: 4900, califica: 'consultora', im: 4.4, activas: 4, ppedDirectos: 0, pped: 0 },
              { campana: c(-3), ventaGP: 4200, califica: 'consultora', im: 4.0, activas: 4, ppedDirectos: 0, pped: 0 },
            ],
          },
        ],
      },
      {
        id: 'rosanna-carol-palacios',
        nombre: 'Rosanna Carol Palacios',
        estatus: 'SSR',
        madre: 'María R.',
        formadora: false,
        formacionesPactadas: 1,
        ventaGP: [61200, 58400, 55900, 56300],
        emprendedoras: [
          {
            id: 'karla-ruiz',
            nombre: 'Karla Ruiz',
            intencion: 'quiere',
            historial: [
              { campana: c(0), ventaGP: 9800, califica: 'cemSenior', im: 3.0, activas: 8, ppedDirectos: 1, pped: 2 },
              { campana: c(-1), ventaGP: 9100, califica: 'cemSenior', im: 3.3, activas: 7, ppedDirectos: 1, pped: 2 },
              { campana: c(-2), ventaGP: 8300, califica: 'cem', im: 3.6, activas: 7, ppedDirectos: 1, pped: 1 },
              { campana: c(-3), ventaGP: 7900, califica: 'cem', im: 3.4, activas: 6, ppedDirectos: 0, pped: 1 },
            ],
          },
        ],
      },
    ] as DirectoraHija[],
  },

  /** Agrupación de los botones del panel "Ver como". */
  verComo: [
    { titulo: 'EMPRENDEDORAS', siglas: ['CNS', 'CEM', 'CES'] },
    { titulo: 'DIRECTORAS', siglas: ['JNR', 'SNR', 'SSE', 'REG'] },
    { titulo: 'STAFF DE VENTAS', siglas: ['BDM'] },
  ] as { titulo: string; siglas: Sigla[] }[],
}

export const SIGLAS = Object.keys(CONFIG.perfiles) as Sigla[]

export function esSigla(valor: string | null | undefined): valor is Sigla {
  return !!valor && (SIGLAS as string[]).includes(valor)
}

// Comprobación de consistencia: el desglose de Mi negocio debe sumar la ganancia del perfil.
if (import.meta.env.DEV) {
  for (const p of Object.values(CONFIG.perfiles)) {
    const suma = p.desglose.flatMap((g) => g.lineas).reduce((total, linea) => total + linea.monto, 0)
    if (p.gananciaActual !== null && suma !== p.gananciaActual) {
      console.error(`[config] El desglose de ${p.sigla} suma ${suma} y su ganancia es ${p.gananciaActual}`)
    }
  }
}
