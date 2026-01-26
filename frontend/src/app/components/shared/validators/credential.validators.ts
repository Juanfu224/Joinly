import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador para verificar que al menos una credencial tenga etiqueta única.
 * Evita duplicados en el FormArray de credenciales.
 *
 * @returns ValidatorFn que valida etiquetas únicas en credenciales
 *
 * @example
 * ```typescript
 * this.fb.array([], [uniqueCredentialLabels()])
 * ```
 */
export function uniqueCredentialLabels(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control || !Array.isArray(control.value)) return null;

    const etiquetas = control.value
      .map((cred: any) => cred?.etiqueta?.trim().toLowerCase())
      .filter((label: string) => label);

    const duplicates = etiquetas.filter(
      (label: string, index: number) => etiquetas.indexOf(label) !== index,
    );

    return duplicates.length > 0
      ? { duplicateLabels: { duplicates: [...new Set(duplicates)] } }
      : null;
  };
}

/**
 * Validador para verificar que una credencial de tipo USUARIO_PASSWORD
 * tenga tanto usuario como contraseña.
 *
 * @returns ValidatorFn que valida campos requeridos según el tipo
 */
export function credentialFieldsRequired(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const tipo = control.get('tipo')?.value;
    const valor = control.get('valor')?.value;
    const password = control.get('password')?.value;

    if (tipo === 'USUARIO_PASSWORD' && valor && !password) {
      return { passwordRequired: true };
    }

    return null;
  };
}
