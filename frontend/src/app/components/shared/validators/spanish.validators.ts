import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador para teléfonos móviles españoles.
 *
 * Acepta múltiples formatos:
 * - 612345678 (formato básico)
 * - +34612345678 (con prefijo internacional +34)
 * - 34612345678 (con prefijo sin +)
 * - 612 345 678 (con espacios)
 * - 612-345-678 (con guiones)
 *
 * Permite números que comiencen con 6, 7, 8 o 9 (móviles y fijos españoles).
 *
 * @returns ValidatorFn que valida formato de teléfono español
 *
 * @example
 * ```typescript
 * this.form = this.fb.group({
 *   telefono: ['', [telefono()]]
 * });
 * ```
 */
export function telefono(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    // Limpiar espacios y guiones para validar
    const cleanValue = value.replace(/[\s-]/g, '');

    // Pattern: acepta +34, 34 o sin prefijo + número de 9 dígitos que empiece en 6-9
    const pattern = /^(\+34|34)?[6-9]\d{8}$/;

    return pattern.test(cleanValue) ? null : { invalidTelefono: true };
  };
}

/**
 * Validador para NIF (Número de Identificación Fiscal) español.
 *
 * Valida tanto el formato como el dígito de control (letra final).
 * Formato: 8 dígitos seguidos de una letra (12345678Z).
 *
 * @returns ValidatorFn que valida NIF español con letra de control
 *
 * @example
 * ```typescript
 * this.form = this.fb.group({
 *   nif: ['', [Validators.required, nif()]]
 * });
 * ```
 */
export function nif(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const nifUpper = value.toUpperCase().trim();
    const nifRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/;

    if (!nifRegex.test(nifUpper)) {
      return { invalidNif: true };
    }

    // Validar letra de control
    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const number = parseInt(nifUpper.substring(0, 8), 10);
    const letter = nifUpper.charAt(8);
    const expectedLetter = letters[number % 23];

    return letter === expectedLetter ? null : { invalidNif: true };
  };
}

/**
 * Validador para códigos postales españoles.
 *
 * Valida que el código sea de exactamente 5 dígitos.
 * Opcionalmente puede validar rangos específicos de provincias.
 *
 * @returns ValidatorFn que valida formato de código postal español
 *
 * @example
 * ```typescript
 * this.form = this.fb.group({
 *   codigoPostal: ['', [codigoPostal()]]
 * });
 * ```
 */
export function codigoPostal(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const pattern = /^\d{5}$/;
    return pattern.test(value) ? null : { invalidCP: true };
  };
}

/**
 * Validador para NIE (Número de Identificación de Extranjero) español.
 *
 * Formato: X, Y o Z seguido de 7 dígitos y una letra de control (X1234567L).
 *
 * @returns ValidatorFn que valida NIE español con letra de control
 *
 * @example
 * ```typescript
 * this.form = this.fb.group({
 *   nie: ['', [nie()]]
 * });
 * ```
 */
export function nie(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const nieUpper = value.toUpperCase().trim();
    const nieRegex = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/;

    if (!nieRegex.test(nieUpper)) {
      return { invalidNie: true };
    }

    // Reemplazar letra inicial por número para cálculo
    const nieNumber = nieUpper.replace('X', '0').replace('Y', '1').replace('Z', '2');

    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const number = parseInt(nieNumber.substring(0, 8), 10);
    const letter = nieUpper.charAt(8);
    const expectedLetter = letters[number % 23];

    return letter === expectedLetter ? null : { invalidNie: true };
  };
}

/**
 * Validador combinado para NIF o NIE español.
 *
 * Acepta tanto formato NIF como NIE, validando el correcto
 * según el formato detectado.
 *
 * @returns ValidatorFn que valida NIF o NIE español
 *
 * @example
 * ```typescript
 * this.form = this.fb.group({
 *   documento: ['', [Validators.required, nifNie()]]
 * });
 * ```
 */
export function nifNie(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const valueUpper = value.toUpperCase().trim();

    // Detectar si es NIE (empieza con X, Y o Z)
    if (/^[XYZ]/.test(valueUpper)) {
      return nie()(control);
    }

    // Si no es NIE, validar como NIF
    return nif()(control);
  };
}
