import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CardComponent, ButtonComponent, IconComponent, AvatarComponent } from '../../../components/shared';
import { AuthService } from '../../../services/auth';

/**
 * Página de perfil de usuario.
 *
 * Muestra y permite editar la información personal del usuario.
 *
 * @usageNotes
 * Ruta: /usuario/perfil
 */
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CardComponent, ButtonComponent, IconComponent, AvatarComponent],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerfilComponent {
  private readonly authService = inject(AuthService);
  protected readonly usuario = this.authService.currentUser;
  protected readonly isEditing = signal(false);

  protected onEdit(): void {
    this.isEditing.set(true);
  }

  protected onSave(): void {
    // TODO: Implementar guardado
    this.isEditing.set(false);
  }

  protected onCancel(): void {
    this.isEditing.set(false);
  }
}
