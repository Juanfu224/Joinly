import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Configuración para el validador de fortaleza de contraseña.
 * Permite configurar reglas específicas según las necesidades del formulario.
 */
export interface PasswordStrengthConfig {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecial?: boolean;
}

/**
 * Validador configurable para verificar la fortaleza de contraseñas.
 *
 * Permite establecer diferentes niveles de seguridad mediante configuración,
 * manteniendo compatibilidad con requisitos existentes mientras permite
 * endurecimiento gradual de políticas de seguridad.
 *
 * @param config Configuración opcional de requisitos de contraseña
 * @returns ValidatorFn que valida según las reglas configuradas
 *
 * @example
 * Configuración básica (compatible con backend actual):
 * ```typescript
 * passwordStrength() // Default: minLength=8, requireNumber=true
 * ```
 *
 * @example
 * Configuración estricta para cuentas admin:
 * ```typescript
 * passwordStrength({
 *   minLength: 12,
 *   requireUppercase: true,
 *   requireLowercase: true,
 *   requireNumber: true,
 *   requireSpecial: true
 * })
 * ```
 */
export function passwordStrength(config: PasswordStrengthConfig = {}): ValidatorFn {
  const {
    minLength = 8,
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = true,
    requireSpecial = false,
  } = config;

  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const errors: ValidationErrors = {};

    if (value.length < minLength) {
      errors['minLength'] = { requiredLength: minLength, actualLength: value.length };
    }

    if (requireUppercase && !/[A-Z]/.test(value)) {
      errors['noUppercase'] = true;
    }

    if (requireLowercase && !/[a-z]/.test(value)) {
      errors['noLowercase'] = true;
    }

    if (requireNumber && !/\d/.test(value)) {
      errors['noNumber'] = true;
    }

    if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors['noSpecial'] = true;
    }

    return Object.keys(errors).length ? errors : null;
  };
}

/**
 * Preset de validador de contraseña con requisitos estrictos.
 * Útil para formularios que requieren alta seguridad.
 *
 * Requisitos:
 * - Mínimo 12 caracteres
 * - Al menos una mayúscula
 * - Al menos una minúscula
 * - Al menos un número
 * - Al menos un carácter especial
 *
 * @example
 * ```typescript
 * this.form = this.fb.group({
 *   password: ['', [Validators.required, passwordStrengthStrict()]]
 * });
 * ```
 */
export function passwordStrengthStrict(): ValidatorFn {
  return passwordStrength({
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true,
  });
}
