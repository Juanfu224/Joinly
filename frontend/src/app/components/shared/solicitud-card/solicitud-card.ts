import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon';
import { ButtonComponent } from '../button/button';
import type { SolicitudResponse, EstadoSolicitud } from '../../../models';

@Component({
  selector: 'app-solicitud-card',
  standalone: true,
  imports: [IconComponent, ButtonComponent],
  templateUrl: './solicitud-card.html',
  styleUrl: './solicitud-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolicitudCardComponent {
  readonly solicitud = input.required<SolicitudResponse>();
  readonly cancel = output<void>();

  protected readonly iconoTipo = computed(() => {
    return this.solicitud().tipoSolicitud === 'UNION_GRUPO' ? 'users' : 'star';
  });

  protected readonly nombreDestino = computed(() => {
    const sol = this.solicitud();
    if (sol.tipoSolicitud === 'UNION_GRUPO' && sol.unidad) {
      return sol.unidad.nombre;
    }
    if (sol.tipoSolicitud === 'UNION_SUSCRIPCION' && sol.suscripcion) {
      return sol.suscripcion.nombreServicio;
    }
    return 'Destino desconocido';
  });

  protected readonly textoTipo = computed(() => {
    return this.solicitud().tipoSolicitud === 'UNION_GRUPO'
      ? 'Solicitud de grupo'
      : 'Solicitud de suscripción';
  });

  protected readonly fechaFormateada = computed(() => {
    const fecha = new Date(this.solicitud().fechaSolicitud);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  });

  protected readonly puedeCancelar = computed(() => {
    return this.solicitud().estado === 'PENDIENTE';
  });

  protected readonly estadoClass = computed(() => {
    return `c-solicitud-card__badge--${this.solicitud().estado.toLowerCase()}`;
  });

  protected readonly estadoTexto = computed(() => {
    const estado = this.solicitud().estado;
    const textos: Record<EstadoSolicitud, string> = {
      PENDIENTE: 'Pendiente',
      APROBADA: 'Aprobada',
      RECHAZADA: 'Rechazada',
      CANCELADA: 'Cancelada',
    };
    return textos[estado];
  });

  protected handleCancel(event: Event): void {
    event.stopPropagation();
    this.cancel.emit();
  }
}
