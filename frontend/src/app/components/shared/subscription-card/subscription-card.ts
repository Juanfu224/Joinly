import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon';
import { ButtonComponent } from '../button/button';
import type { SuscripcionCardData } from '../../../models/suscripcion.model';

@Component({
  selector: 'app-subscription-card',
  standalone: true,
  imports: [IconComponent, ButtonComponent],
  templateUrl: './subscription-card.html',
  styleUrls: ['./subscription-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionCardComponent {
  readonly suscripcion = input.required<SuscripcionCardData>();
  readonly viewDetails = output<void>();

  protected readonly fechaFormateada = computed(() => {
    const fecha = new Date(this.suscripcion().fechaRenovacion);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear().toString().slice(-2);
    return `${dia}/${mes}/${anio}`;
  });

  protected readonly precioFormateado = computed(() => 
    this.suscripcion().precioPorPlaza.toFixed(2)
  );

  handleViewDetails(): void {
    this.viewDetails.emit();
  }
}
