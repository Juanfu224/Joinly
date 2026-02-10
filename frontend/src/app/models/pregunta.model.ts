export type CategoriaFaq = 'SUSCRIPCIONES' | 'PAGOS' | 'CUENTA' | 'OTROS';

export interface PreguntaFrecuente {
  readonly id: number;
  readonly pregunta: string;
  readonly respuesta: string;
  readonly categoria: CategoriaFaq;
  readonly orden: number;
}

export type PreguntasAgrupadas = Record<string, PreguntaFrecuente[]>;
