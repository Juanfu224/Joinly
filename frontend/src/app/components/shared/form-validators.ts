import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador personalizado para verificar la fortaleza de contraseñas.
 * Requiere al menos una letra y un número, con mínimo 8 caracteres.
 * 
 * @returns ValidatorFn que valida la fortaleza de la contraseña
 * 
 * @example
 * ```typescript
 * this.fb.group({
 *   password: ['', [Validators.required, passwordStrengthValidator()]]
 * });
 * ```
 */
export function passwordStrengthValidator(): ValidatorFn {
  const pattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    return pattern.test(value) ? null : { passwordStrength: true };
  };
}

/**
 * Validador a nivel de FormGroup para verificar que dos campos coincidan.
 * Útil para confirmación de contraseña o email.
 * 
 * @param field1 Nombre del primer campo
 * @param field2 Nombre del segundo campo que debe coincidir
 * @returns ValidatorFn que retorna error si los campos no coinciden
 * 
 * @example
 * ```typescript
 * this.fb.group(
 *   { password: [''], confirmPassword: [''] },
 *   { validators: matchFieldsValidator('password', 'confirmPassword') }
 * );
 * ```
 */
export function matchFieldsValidator(field1: string, field2: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value1 = control.get(field1)?.value;
    const value2 = control.get(field2)?.value;

    if (!value1 || !value2) return null;

    return value1 === value2 ? null : { fieldsMismatch: { field1, field2 } };
  };
}

/**
 * Obtiene el mensaje de error apropiado para un control de formulario.
 * Prioriza los errores según su importancia (required > email > minlength...).
 * 
 * @param control Control del formulario a validar
 * @param fieldLabel Etiqueta del campo para mensajes personalizados
 * @returns Mensaje de error o cadena vacía si no hay errores
 */
export function getControlErrorMessage(
  control: AbstractControl | null,
  fieldLabel: string = 'Este campo'
): string {
  if (!control?.touched || !control.errors) return '';

  const errors = control.errors;

  // Prioridad de errores
  if (errors['required']) return `${fieldLabel} es obligatorio`;
  if (errors['email']) return 'Introduce un email válido';
  if (errors['minlength']) {
    const min = errors['minlength'].requiredLength as number;
    return `Mínimo ${min} caracteres`;
  }
  if (errors['maxlength']) {
    const max = errors['maxlength'].requiredLength as number;
    return `Máximo ${max} caracteres`;
  }
  if (errors['min']) {
    const min = errors['min'].min as number;
    return `El valor mínimo es ${min}`;
  }
  if (errors['max']) {
    const max = errors['max'].max as number;
    return `El valor máximo es ${max}`;
  }
  if (errors['pattern']) return 'El formato no es válido';
  if (errors['passwordStrength']) {
    return 'La contraseña debe tener al menos 8 caracteres, una letra y un número';
  }
  if (errors['fieldsMismatch']) return 'Los campos no coinciden';

  return 'Campo inválido';
}

/**
 * Mapeo de mensajes de error específicos por campo y tipo de error.
 * Permite mensajes más descriptivos y contextuales.
 */
export interface FieldErrorMessages {
  [errorType: string]: string;
}

/**
 * Obtiene un mensaje de error personalizado para un campo específico.
 * Permite definir mensajes contextuales por tipo de error.
 * 
 * @param control Control del formulario a validar
 * @param customMessages Mensajes personalizados por tipo de error
 * @param defaultLabel Etiqueta por defecto si no hay mensaje custom
 * @returns Mensaje de error personalizado o genérico
 * 
 * @example
 * ```typescript
 * getFieldErrorMessage(control, {
 *   required: 'El email es obligatorio',
 *   email: 'Formato de email inválido'
 * });
 * ```
 */
export function getFieldErrorMessage(
  control: AbstractControl | null,
  customMessages: FieldErrorMessages = {},
  defaultLabel: string = 'Este campo'
): string {
  if (!control?.touched || !control.errors) return '';

  const errors = control.errors;
  const errorType = Object.keys(errors)[0];

  // Si hay mensaje personalizado, usarlo
  if (customMessages[errorType]) {
    return customMessages[errorType];
  }

  // Fallback a mensajes genéricos
  return getControlErrorMessage(control, defaultLabel);
}

/**
 * Validador para códigos alfanuméricos con guiones opcionales.
 * Ignora guiones al validar longitud.
 * 
 * @param length Longitud esperada del código sin guiones (por defecto 12)
 * @returns ValidatorFn que valida códigos alfanuméricos
 * 
 * @example
 * ```typescript
 * // Acepta: ABC1-DEF2-GHI3 o ABC1DEF2GHI3
 * this.fb.group({
 *   codigo: ['', [Validators.required, codePatternValidator(12)]]
 * });
 * ```
 */
export function codePatternValidator(length: number = 12): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const cleanValue = value.replace(/-/g, '');
    const isValid = /^[A-Za-z0-9]+$/.test(cleanValue) && cleanValue.length === length;

    return isValid ? null : { codePattern: true };
  };
}
