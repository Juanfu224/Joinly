import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AvatarComponent } from '../avatar/avatar';

/**
 * Rol del usuario dentro del grupo o suscripción
 */
export type MemberRole = 'admin' | 'member';

/**
 * Datos del miembro para la tarjeta
 */
export interface MemberData {
  id: number;
  nombreCompleto: string;
  nombreUsuario: string;
  email: string;
  avatar?: string;
  rol: MemberRole;
}

/**
 * Componente de tarjeta de miembro.
 *
 * Muestra la información de un miembro de un grupo o suscripción,
 * incluyendo avatar, nombre de usuario, email y su rol (Admin/Miembro).
 * Sigue el diseño de Figma con fondo morado claro y badge azul.
 *
 * @usageNotes
 * ```html
 * <!-- Tarjeta de miembro básica -->
 * <app-member-card [member]="usuario" />
 *
 * <!-- Dentro de un member-list -->
 * @for (member of members; track member.id) {
 *   <app-member-card [member]="member" />
 * }
 * ```
 *
 * ### Características
 * - Diseño basado en Figma (fondo morado claro, badge azul con sombra)
 * - Muestra: avatar, nombre de usuario, email y rol
 * - OnPush change detection para rendimiento óptimo
 * - Signals para reactividad
 * - HTML semántico con elemento `<article>`
 */
@Component({
  selector: 'app-member-card',
  standalone: true,
  imports: [AvatarComponent],
  templateUrl: './member-card.html',
  styleUrl: './member-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberCardComponent {
  /**
   * Datos del miembro a mostrar
   */
  member = input.required<MemberData>();
}
