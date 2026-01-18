import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconComponent, type IconName } from '../index';

export type StatCardType = 'renovacion' | 'plazas' | 'aporte';

@Component({
  selector: 'app-subscription-stat-card',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './subscription-stat-card.html',
  styleUrl: './subscription-stat-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionStatCardComponent {
  readonly tipo = input.required<StatCardType>();
  readonly titulo = input.required<string>();
  readonly valor = input.required<string>();

  protected readonly iconName = computed<IconName>(() => {
    const icons: Record<StatCardType, IconName> = {
      renovacion: 'calendar',
      plazas: 'users',
      aporte: 'coin',
    };
    return icons[this.tipo()];
  });

  protected readonly colorClass = computed(() => {
    const colors: Record<StatCardType, string> = {
      renovacion: 'c-subscription-stat-card--naranja',
      plazas: 'c-subscription-stat-card--morado',
      aporte: 'c-subscription-stat-card--amarillo',
    };
    return colors[this.tipo()];
  });
}
