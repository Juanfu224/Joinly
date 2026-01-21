import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CardComponent,
  ButtonComponent,
  IconComponent,
  AvatarComponent,
  FormInputComponent,
  SpinnerOverlayComponent,
} from '../../../components/shared';
import { AuthService, UsuarioService, ToastService } from '../../../services';

/**
 * Página de perfil de usuario.
 *
 * Muestra y permite editar la información personal del usuario.
 * Incluye estadísticas de cuenta y opciones de personalización.
 *
 * @usageNotes
 * Ruta: /usuario/perfil
 */
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardComponent,
    ButtonComponent,
    IconComponent,
    AvatarComponent,
    FormInputComponent,
    SpinnerOverlayComponent,
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerfilComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly usuario = this.authService.currentUser;
  protected readonly isEditing = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly fechaRegistro = signal<string | null>(null);
  protected readonly isFormDirty = signal(false);
  protected readonly isFormValid = signal(false);

  protected readonly perfilForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    telefono: ['', [Validators.pattern(/^[+]?[\d\s()-]{6,20}$/)]],
  });

  protected readonly canSubmit = computed(
    () => this.isFormValid() && this.isFormDirty() && !this.isSaving()
  );

  protected readonly iniciales = computed(() => {
    const nombre = this.usuario()?.nombre ?? '';
    return nombre
      .split(' ')
      .slice(0, 2)
      .map(n => n.charAt(0).toUpperCase())
      .join('');
  });

  ngOnInit(): void {
    this.fechaRegistro.set(new Date().toISOString());
    this.setupFormTracking();
  }

  /**
   * Configura el tracking reactivo del estado del formulario.
   * Sincroniza el estado de FormGroup con signals para que computed() funcione.
   */
  private setupFormTracking(): void {
    this.perfilForm.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.isFormValid.set(this.perfilForm.valid);
        this.isFormDirty.set(this.perfilForm.dirty);
      });

    this.perfilForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.isFormDirty.set(this.perfilForm.dirty);
      });
  }

  protected onEdit(): void {
    const user = this.usuario();
    if (user) {
      this.perfilForm.patchValue({
        nombre: user.nombre,
        telefono: '',
      });
      // Resetear estado después de patchValue
      this.perfilForm.markAsPristine();
      this.isFormDirty.set(false);
      this.isFormValid.set(this.perfilForm.valid);
      this.isEditing.set(true);
    }
  }

  protected onSave(): void {
    if (!this.perfilForm.valid || this.isSaving()) return;

    const user = this.usuario();
    if (!user) return;

    this.isSaving.set(true);

    const formValue = this.perfilForm.getRawValue();
    const updateData = {
      nombre: formValue.nombre.trim(),
      telefono: formValue.telefono?.trim() || undefined,
      temaPreferido: user.temaPreferido,
    };

    this.usuarioService.actualizarPerfil(user.id, updateData).subscribe({
      next: (updatedUser) => {
        this.authService.updateUser(updatedUser);
        this.toastService.success('Perfil actualizado exitosamente');
        this.isEditing.set(false);
        this.isSaving.set(false);
      },
      error: (error) => {
        console.error('Error actualizando perfil:', error);
        this.toastService.error(error.message || 'Error al actualizar el perfil');
        this.isSaving.set(false);
      },
    });
  }

  protected onCancel(): void {
    this.perfilForm.reset();
    this.perfilForm.markAsPristine();
    this.isFormDirty.set(false);
    this.isFormValid.set(false);
    this.isEditing.set(false);
  }
}
