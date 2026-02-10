import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { PreguntaFrecuente, PreguntasAgrupadas } from '../models';
import { ApiService } from '../core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class PreguntaService {
  private readonly api = inject(ApiService);

  obtenerTodas(): Observable<PreguntasAgrupadas> {
    return this.api.get<PreguntasAgrupadas>('preguntas');
  }

  obtenerPorCategoria(categoria: string): Observable<PreguntaFrecuente[]> {
    return this.api.get<PreguntaFrecuente[]>(`preguntas/categoria/${categoria}`);
  }

  buscar(termino: string): Observable<PreguntaFrecuente[]> {
    return this.api.get<PreguntaFrecuente[]>('preguntas/buscar', {
      params: { q: termino },
    });
  }
}
