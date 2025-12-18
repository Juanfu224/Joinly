/**
 * Barrel file para exportar todos los validadores personalizados.
 * 
 * Facilita las importaciones en componentes:
 * ```typescript
 * import { passwordStrength, telefono, matchFields } from '../validators';
 * ```
 */

// Validadores de contraseña
export {
  passwordStrength,
  passwordStrengthStrict,
  type PasswordStrengthConfig,
} from './password.validators';

// Validadores de formato español
export { telefono, nif, nie, nifNie, codigoPostal } from './spanish.validators';

// Validadores cross-field
export {
  matchFields,
  precioMinimoPlaza,
  requireBothOrNeither,
  atLeastOne,
  dateRange,
  minAge,
} from './cross-field.validators';

// Validadores de credenciales
export {
  uniqueCredentialLabels,
  credentialFieldsRequired,
} from './credential.validators';

// Sistema de mensajes de error
export {
  getErrorMessage,
  getAllErrorMessages,
  hasError,
  shouldShowError,
  getFormErrors,
  VALIDATION_MESSAGES,
} from './error-messages';
