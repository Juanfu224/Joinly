import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormInputComponent } from '../form-input/form-input';
import { FormSelectComponent, type SelectOption } from '../form-select/form-select';
import { FormCheckboxComponent } from '../form-checkbox/form-checkbox';

/**
 * Componente para grupo de inputs de credenciales dentro de un FormArray.
 * 
 * **Características:**
 * - Integrado con Reactive Forms (recibe FormGroup)
 * - Tipos de credencial configurables
 * - Campo de instrucciones opcional
 * - Toggle de visibilidad para miembros
 * 
 * @usageNotes
 * ```html
 * <app-credential-input-group 
 *   [formGroup]="credentialGroup"
 *   [index]="0"
 * />
 * ```
 */
@Component({
  selector: 'app-credential-input-group',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormInputComponent,
    FormSelectComponent,
    FormCheckboxComponent,
  ],
  templateUrl: './credential-input-group.html',
  styleUrl: './credential-input-group.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'c-credential-input-group' },
})
export class CredentialInputGroupComponent {
  /** FormGroup de la credencial */
  readonly formGroup = input.required<FormGroup>();
  
  /** Índice del item en el array (para IDs únicos) */
  readonly index = input.required<number>();

  /** Opciones para el tipo de credencial */
  protected readonly tipoOptions: SelectOption[] = [
    { value: 'USUARIO_PASSWORD', label: 'Usuario y contraseña' },
    { value: 'PIN', label: 'PIN' },
    { value: 'TOKEN', label: 'Token de acceso' },
    { value: 'ENLACE', label: 'Enlace de invitación' },
    { value: 'CODIGO', label: 'Código de acceso' },
    { value: 'OTRO', label: 'Otro' },
  ];

  /** Obtiene mensaje de error para un campo específico */
  protected getErrorMessage(fieldName: string): string {
    const control = this.formGroup().get(fieldName);
    
    // Mostrar errores solo cuando el control ha sido tocado O modificado
    if (!control || !control.errors || (!control.touched && !control.dirty)) {
      // Verificar errores a nivel de grupo (cross-field)
      if (fieldName === 'password' && this.formGroup().errors?.['passwordRequired']) {
        return 'Contraseña requerida para este tipo de credencial';
      }
      return '';
    }

    const errors = control.errors;
    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    
    return '';
  }
}
