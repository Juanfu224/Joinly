import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { PreguntaService } from '../../services/pregunta';
import { PreguntaFrecuente, PreguntasAgrupadas } from '../../models';

interface CategoriaConPreguntas {
  readonly nombre: string;
  readonly preguntas: PreguntaFrecuente[];
}

@Component({
  selector: 'app-preguntas',
  standalone: true,
  imports: [],
  templateUrl: './pregunta.html',
  styleUrl: './pregunta.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreguntasComponent implements OnInit {
  private readonly preguntaService = inject(PreguntaService);

  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly categorias = signal<CategoriaConPreguntas[]>([]);

  ngOnInit(): void {
    this.cargarPreguntas();
  }

  protected cargarPreguntas(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.preguntaService.obtenerTodas().subscribe({
      next: (agrupadas: PreguntasAgrupadas) => {
        const lista: CategoriaConPreguntas[] = Object.entries(agrupadas).map(
          ([nombre, preguntas]) => ({ nombre, preguntas }),
        );
        this.categorias.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las preguntas. Inténtalo de nuevo.');
        this.cargando.set(false);
      },
    });
  }
}
