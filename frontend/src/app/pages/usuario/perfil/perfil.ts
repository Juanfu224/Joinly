import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, map, startWith } from 'rxjs';
import {
  AvatarComponent,
  ButtonComponent,
  CardComponent,
  FormInputComponent,
  IconComponent,
  SpinnerOverlayComponent,
} from '../../../components/shared';
import { AuthService, ToastService, UsuarioService } from '../../../services';

/**
 * Página de perfil de usuario.
 * Muestra y permite editar la información personal del usuario.
 *
 * @route /usuario/perfil
 */
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AvatarComponent,
    ButtonComponent,
    CardComponent,
    FormInputComponent,
    IconComponent,
    SpinnerOverlayComponent,
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerfilComponent {
  readonly #authService = inject(AuthService);
  readonly #usuarioService = inject(UsuarioService);
  readonly #toastService = inject(ToastService);
  readonly #fb = inject(FormBuilder);

  protected readonly usuario = this.#authService.currentUser;
  protected readonly isEditing = signal(false);
  protected readonly isSaving = signal(false);

  protected readonly perfilForm = this.#fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    telefono: ['', [Validators.pattern(/^[+]?[\d\s()-]{6,20}$/)]],
  });

  /** Signal reactivo para el estado del formulario usando toSignal */
  readonly #formState = toSignal(
    this.perfilForm.statusChanges.pipe(
      startWith(this.perfilForm.status),
      debounceTime(50),
      map(() => ({
        valid: this.perfilForm.valid,
        dirty: this.perfilForm.dirty,
      }))
    ),
    { initialValue: { valid: false, dirty: false } }
  );

  protected readonly canSubmit = computed(
    () => this.#formState().valid && this.#formState().dirty && !this.isSaving()
  );

  protected onEdit(): void {
    const user = this.usuario();
    if (!user) return;

    this.perfilForm.patchValue({
      nombre: user.nombre,
      telefono: user.telefono ?? '',
    });
    this.perfilForm.markAsPristine();
    this.isEditing.set(true);
  }

  protected onSave(): void {
    if (!this.perfilForm.valid || this.isSaving()) return;

    const user = this.usuario();
    if (!user) return;

    this.isSaving.set(true);

    const { nombre, telefono } = this.perfilForm.getRawValue();
    const updateData = {
      nombre: nombre.trim(),
      telefono: telefono?.trim() || undefined,
      temaPreferido: user.temaPreferido,
    };

    this.#usuarioService.actualizarPerfil(user.id, updateData).subscribe({
      next: (updatedUser) => {
        this.#authService.updateUser(updatedUser);
        this.#toastService.success('Perfil actualizado exitosamente');
        this.isEditing.set(false);
        this.isSaving.set(false);
      },
      error: (error) => {
        this.#toastService.error(error.message || 'Error al actualizar el perfil');
        this.isSaving.set(false);
      },
    });
  }

  protected onCancel(): void {
    this.perfilForm.reset();
    this.isEditing.set(false);
  }
}
