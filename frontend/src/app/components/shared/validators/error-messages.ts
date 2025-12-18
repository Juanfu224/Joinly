import { AbstractControl } from '@angular/forms';

/**
 * Diccionario centralizado de mensajes de error de validación.
 * 
 * Proporciona mensajes consistentes en toda la aplicación y facilita
 * la internacionalización futura. Los mensajes pueden ser cadenas
 * estáticas o funciones que reciben el objeto de error para mensajes dinámicos.
 */
export const VALIDATION_MESSAGES: Record<string, string | ((error?: any) => string)> = {
  // Validadores nativos de Angular
  required: 'Este campo es obligatorio',
  email: 'Introduce un email válido',
  minlength: (error) => `Mínimo ${error?.requiredLength ?? error?.min ?? 0} caracteres`,
  maxlength: (error) => `Máximo ${error?.requiredLength ?? error?.max ?? 0} caracteres`,
  min: (error) => `El valor mínimo es ${error?.min ?? 0}`,
  max: (error) => `El valor máximo es ${error?.max ?? 0}`,
  pattern: 'El formato no es válido',

  // Validadores de contraseña
  minLength: (error) => `Mínimo ${error?.requiredLength ?? 0} caracteres`,
  noUppercase: 'Debe contener al menos una mayúscula',
  noLowercase: 'Debe contener al menos una minúscula',
  noNumber: 'Debe contener al menos un número',
  noSpecial: 'Debe contener al menos un carácter especial (!@#$%...)',
  passwordStrength: 'La contraseña debe tener al menos una letra y un número',

  // Validadores de formato español
  invalidTelefono: 'Teléfono inválido (ej: 612345678 o +34612345678)',
  invalidNif: 'NIF inválido (formato: 12345678Z)',
  invalidNie: 'NIE inválido (formato: X1234567L)',
  invalidCP: 'Código postal inválido (5 dígitos)',

  // Validadores cross-field
  fieldsMismatch: 'Los campos no coinciden',
  precioMinimoPlaza: (error) =>
    `Precio mínimo por persona: ${error?.min ?? 0}€ (actual: ${(error?.actual ?? 0).toFixed(2)}€)`,
  requireBothOrNeither: 'Completa ambos campos o deja ambos vacíos',
  atLeastOne: 'Completa al menos uno de los campos requeridos',
  invalidDateRange: 'La fecha de inicio debe ser anterior a la fecha de fin',
  minAge: (error) =>
    `Edad mínima requerida: ${error?.required ?? 0} años (actual: ${error?.actual ?? 0})`,

  // Validador de código
  codePattern: 'Código inválido',

  // Validadores asíncronos
  emailTaken: 'Este email ya está registrado',
  emailUnavailable: 'Email no disponible',
  usernameTaken: 'Nombre de usuario no disponible',
};

/**
 * Obtiene el mensaje de error apropiado para un control de formulario.
 * 
 * Prioriza errores según su importancia y utiliza el diccionario
 * centralizado de mensajes. Permite mensajes personalizados por control.
 * Muestra errores solo cuando el control ha sido tocado O modificado.
 * 
 * @param control Control del formulario a validar
 * @param customMessages Mensajes personalizados que sobreescriben los del diccionario
 * @returns Mensaje de error o cadena vacía si no hay errores
 * 
 * @example
 * ```typescript
 * getErrorMessage(this.form.get('email'), {
 *   required: 'El email es obligatorio',
 *   email: 'Formato de email inválido'
 * });
 * ```
 */
export function getErrorMessage(
  control: AbstractControl | null,
  customMessages?: Record<string, string>
): string {
  // Mostrar errores solo cuando el control ha sido tocado O modificado
  if (!control || !control.errors || (!control.touched && !control.dirty)) return '';

  // Obtener el primer error (priorizando el orden de validación)
  const errorType = Object.keys(control.errors)[0];
  const errorValue = control.errors[errorType];

  // Priorizar mensaje personalizado
  if (customMessages?.[errorType]) {
    return customMessages[errorType];
  }

  // Usar diccionario global
  const message = VALIDATION_MESSAGES[errorType];

  if (typeof message === 'function') {
    return message(errorValue);
  }

  return message ?? 'Campo inválido';
}

/**
 * Obtiene todos los errores de un control como array de mensajes.
 * 
 * Útil para mostrar múltiples errores simultáneamente o para
 * validadores que retornan múltiples errores en un solo objeto.
 * Muestra errores solo cuando el control ha sido tocado O modificado.
 * 
 * @param control Control del formulario a validar
 * @param customMessages Mensajes personalizados opcionales
 * @returns Array de mensajes de error
 * 
 * @example
 * ```typescript
 * const errors = getAllErrorMessages(this.form.get('password'));
 * // ['Debe contener al menos una mayúscula', 'Mínimo 12 caracteres']
 * ```
 */
export function getAllErrorMessages(
  control: AbstractControl | null,
  customMessages?: Record<string, string>
): string[] {
  // Mostrar errores solo cuando el control ha sido tocado O modificado
  if (!control || !control.errors || (!control.touched && !control.dirty)) return [];

  return Object.entries(control.errors).map(([errorType, errorValue]) => {
    // Priorizar mensaje personalizado
    if (customMessages?.[errorType]) {
      return customMessages[errorType];
    }

    // Usar diccionario global
    const message = VALIDATION_MESSAGES[errorType];

    if (typeof message === 'function') {
      return message(errorValue);
    }

    return message ?? 'Campo inválido';
  });
}

/**
 * Verifica si un control tiene un error específico y está touched O dirty.
 * 
 * Útil para mostrar/ocultar mensajes de error específicos en templates.
 * 
 * @param control Control del formulario a validar
 * @param errorType Tipo de error a verificar
 * @returns true si el control tiene ese error y está touched o dirty
 * 
 * @example
 * ```html
 * <div *ngIf="hasError(form.get('email'), 'email')" class="error">
 *   {{ getErrorMessage(form.get('email')) }}
 * </div>
 * ```
 */
export function hasError(control: AbstractControl | null, errorType: string): boolean {
  return !!(control && (control.touched || control.dirty) && control.errors?.[errorType]);
}

/**
 * Verifica si se deben mostrar los errores de un control.
 * 
 * Un control debe mostrar errores cuando:
 * - Tiene errores de validación
 * - Ha sido tocado O modificado
 * - NO está en estado pending (validación asíncrona en curso)
 * 
 * @param control Control del formulario a validar
 * @returns true si se deben mostrar los errores
 * 
 * @example
 * ```typescript
 * if (shouldShowError(this.form.get('email'))) {
 *   // Mostrar mensaje de error
 * }
 * ```
 */
export function shouldShowError(control: AbstractControl | null): boolean {
  if (!control) return false;
  return !!(control.errors && (control.touched || control.dirty) && !control.pending);
}

/**
 * Obtiene los errores del FormGroup (cross-field validations).
 * 
 * @param form FormGroup a validar
 * @param customMessages Mensajes personalizados opcionales
 * @returns Array de mensajes de error del formulario
 * 
 * @example
 * ```typescript
 * const formErrors = getFormErrors(this.registerForm);
 * // ['Las contraseñas no coinciden']
 * ```
 */
export function getFormErrors(
  form: AbstractControl | null,
  customMessages?: Record<string, string>
): string[] {
  if (!form?.errors) return [];

  return Object.entries(form.errors).map(([errorType, errorValue]) => {
    // Priorizar mensaje personalizado
    if (customMessages?.[errorType]) {
      return customMessages[errorType];
    }

    // Usar diccionario global
    const message = VALIDATION_MESSAGES[errorType];

    if (typeof message === 'function') {
      return message(errorValue);
    }

    return message ?? 'Error en el formulario';
  });
}
