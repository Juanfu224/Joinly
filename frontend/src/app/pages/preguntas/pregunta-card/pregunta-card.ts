import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { IconComponent } from '../../../components/shared';
import { PreguntaFrecuente } from '../../../models';

@Component({
  selector: 'app-pregunta-card',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './pregunta-card.html',
  styleUrl: './pregunta-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreguntaCardComponent {
  @Input({ required: true }) pregunta!: PreguntaFrecuente;

  protected readonly abierto = signal(false);

  protected toggle(): void {
    this.abierto.update((v) => !v);
  }
}
