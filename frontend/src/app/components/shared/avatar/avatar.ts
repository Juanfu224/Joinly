import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AvatarVariant = 'default' | 'outline';

/**
 * Componente Avatar - Muestra una imagen de perfil o iniciales del usuario.
 *
 * @usageNotes
 * ```html
 * <!-- Avatar con imagen -->
 * <app-avatar [src]="user.avatar" [alt]="user.name" />
 *
 * <!-- Avatar con iniciales -->
 * <app-avatar [name]="'Juan García'" />
 *
 * <!-- Avatar con tamaño y variante -->
 * <app-avatar [name]="'Ana'" size="lg" variant="outline" />
 * ```
 */
@Component({
  selector: 'app-avatar',
  standalone: true,
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'c-avatar-host' },
})
export class AvatarComponent {
  /** URL de la imagen del avatar */
  readonly src = input<string>('');

  /** Texto alternativo para la imagen */
  readonly alt = input<string>('Avatar de usuario');

  /** Nombre del usuario para generar iniciales */
  readonly name = input<string>('');

  /** Tamaño del avatar: xs (24px), sm (32px), md (40px), lg (48px), xl (64px) */
  readonly size = input<AvatarSize>('md');

  /** Variante visual: default (fondo sólido), outline (con borde) */
  readonly variant = input<AvatarVariant>('default');

  /** Iniciales calculadas a partir del nombre */
  readonly initials = computed(() => {
    const name = this.name();
    if (!name) return '';

    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  });

  /** Clases CSS computadas */
  readonly avatarClasses = computed(() => {
    return [
      'c-avatar',
      `c-avatar--${this.size()}`,
      `c-avatar--${this.variant()}`,
    ].join(' ');
  });

  /** Determina si se muestra imagen o iniciales */
  readonly showImage = computed(() => !!this.src());
}
