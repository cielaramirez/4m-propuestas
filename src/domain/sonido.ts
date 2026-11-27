/**
 * Sonidos de la sección Mi carrera: breves, amables y generados en el momento con Web Audio
 * (no hay archivos de audio). Refuerzan cada acción, como en las apps de aprendizaje:
 * un toque suave al elegir, dos notas al avanzar y una pequeña celebración al lograr algo.
 */
export type Sonido = 'toque' | 'abrir' | 'avance' | 'logro' | 'enviar'

type Onda = 'sine' | 'triangle'
interface Nota {
  /** Frecuencia en Hz; con `hasta` hace un barrido. */
  frecuencia: number
  hasta?: number
  /** Segundos desde el inicio del sonido. */
  inicio: number
  duracion: number
  volumen: number
  onda?: Onda
}

// Do5, Mi5, Sol5 y Do6: un acorde mayor, que suena a "bien hecho".
const DO5 = 523.25
const MI5 = 659.25
const SOL5 = 783.99
const DO6 = 1046.5

const PARTITURAS: Record<Sonido, Nota[]> = {
  toque: [{ frecuencia: 620, hasta: 880, inicio: 0, duracion: 0.07, volumen: 0.16 }],
  abrir: [{ frecuencia: 440, hasta: 587, inicio: 0, duracion: 0.11, volumen: 0.12 }],
  avance: [
    { frecuencia: DO5, inicio: 0, duracion: 0.11, volumen: 0.16, onda: 'triangle' },
    { frecuencia: SOL5, inicio: 0.1, duracion: 0.18, volumen: 0.16, onda: 'triangle' },
  ],
  logro: [
    { frecuencia: DO5, inicio: 0, duracion: 0.12, volumen: 0.15, onda: 'triangle' },
    { frecuencia: MI5, inicio: 0.09, duracion: 0.12, volumen: 0.15, onda: 'triangle' },
    { frecuencia: SOL5, inicio: 0.18, duracion: 0.12, volumen: 0.15, onda: 'triangle' },
    { frecuencia: DO6, inicio: 0.27, duracion: 0.42, volumen: 0.17, onda: 'triangle' },
    { frecuencia: DO6 * 2, inicio: 0.27, duracion: 0.3, volumen: 0.05 },
  ],
  enviar: [{ frecuencia: 420, hasta: 940, inicio: 0, duracion: 0.14, volumen: 0.13 }],
}

/** Vibración que acompaña al sonido en los celulares que la permiten (ms). */
const VIBRACION: Partial<Record<Sonido, number | number[]>> = {
  toque: 8,
  avance: 12,
  logro: [14, 40, 22],
  enviar: 10,
}

let contexto: AudioContext | null = null

function obtenerContexto(): AudioContext | null {
  try {
    contexto ??= new AudioContext()
    // Los navegadores solo dejan sonar tras un gesto de la usuaria; aquí siempre lo hay.
    if (contexto.state === 'suspended') void contexto.resume()
    return contexto
  } catch {
    return null
  }
}

/** Reproduce un sonido. No hace nada si el navegador no tiene audio disponible. */
export function reproducir(sonido: Sonido): void {
  const ctx = obtenerContexto()
  if (!ctx) return
  const ahora = ctx.currentTime + 0.01

  for (const nota of PARTITURAS[sonido]) {
    const oscilador = ctx.createOscillator()
    const ganancia = ctx.createGain()
    const t0 = ahora + nota.inicio
    const t1 = t0 + nota.duracion

    oscilador.type = nota.onda ?? 'sine'
    oscilador.frequency.setValueAtTime(nota.frecuencia, t0)
    if (nota.hasta) oscilador.frequency.exponentialRampToValueAtTime(nota.hasta, t1)

    // Ataque corto y caída suave, para que no suene a "clic" seco.
    ganancia.gain.setValueAtTime(0.0001, t0)
    ganancia.gain.exponentialRampToValueAtTime(nota.volumen, t0 + 0.012)
    ganancia.gain.exponentialRampToValueAtTime(0.0001, t1)

    oscilador.connect(ganancia).connect(ctx.destination)
    oscilador.start(t0)
    oscilador.stop(t1 + 0.02)
  }

  const patron = VIBRACION[sonido]
  if (patron !== undefined) navigator.vibrate?.(patron)
}
