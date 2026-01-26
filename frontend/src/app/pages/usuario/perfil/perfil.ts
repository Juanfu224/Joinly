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
import { AuthService, ModalService, ToastService, UsuarioService } from '../../../services';

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
  readonly #modalService = inject(ModalService);
  readonly #fb = inject(FormBuilder);

  protected readonly usuario = this.#authService.currentUser;
  protected readonly isEditing = signal(false);
  protected readonly isSaving = signal(false);

  protected readonly avatarPreview = signal<string | null>(null);
  protected readonly isUploadingAvatar = signal(false);
  protected readonly isDeletingAvatar = signal(false);
  private selectedAvatarFile: File | null = null;

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
      })),
    ),
    { initialValue: { valid: false, dirty: false } },
  );

  protected readonly canSubmit = computed(
    () => this.#formState().valid && this.#formState().dirty && !this.isSaving(),
  );

  protected onEdit(): void {
    const user = this.usuario();
    if (!user) {
      return;
    }

    this.perfilForm.patchValue({
      nombre: user.nombre,
      telefono: user.telefono ?? '',
    });
    this.perfilForm.markAsPristine();
    this.isEditing.set(true);
  }

  protected onSave(): void {
    if (!this.perfilForm.valid || this.isSaving()) {
      return;
    }

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

  protected onAvatarFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.#toastService.error('Tipo de archivo no permitido. Usa JPG, PNG o WebP');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.#toastService.error('La imagen no puede superar 5MB');
      return;
    }

    this.selectedAvatarFile = file;

    const avatarUrl = URL.createObjectURL(file);
    this.avatarPreview.set(avatarUrl);
  }

  protected onUploadAvatar(): void {
    if (!this.selectedAvatarFile) {
      return;
    }

    const user = this.usuario();
    if (!user) return;

    this.isUploadingAvatar.set(true);

    this.#usuarioService.subirAvatar(user.id, this.selectedAvatarFile).subscribe({
      next: (updatedUser) => {
        this.#authService.updateUser(updatedUser);
        this.#toastService.success('Avatar actualizado exitosamente');
        this.avatarPreview.set(null);
        this.selectedAvatarFile = null;
        this.isUploadingAvatar.set(false);
      },
      error: (error) => {
        this.#toastService.error(error.message || 'Error al subir el avatar');
        this.isUploadingAvatar.set(false);
      },
    });
  }

  protected onCancelAvatarUpload(): void {
    this.avatarPreview.set(null);
    this.selectedAvatarFile = null;
  }

  protected hasCustomAvatar(): boolean {
    const user = this.usuario();
    return !!user && !!user.avatar && user.avatar.trim().length > 0;
  }

  protected onDeleteAvatar(): void {
    const user = this.usuario();
    if (!user) return;

    this.#modalService.open({
      title: '¿Eliminar foto de perfil?',
      content:
        '¿Estás seguro de que quieres eliminar tu foto de perfil? Se usará el avatar por defecto.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        this.isDeletingAvatar.set(true);

        this.#usuarioService.eliminarAvatar(user.id).subscribe({
          next: (updatedUser) => {
            this.#authService.updateUser(updatedUser);
            this.#toastService.success('Foto de perfil eliminada');
            this.isDeletingAvatar.set(false);
          },
          error: (error) => {
            this.#toastService.error(error.message || 'Error al eliminar la foto de perfil');
            this.isDeletingAvatar.set(false);
          },
        });
      },
    });
  }
}
