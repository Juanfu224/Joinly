import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador cross-field para verificar que dos campos coincidan.
 * Útil para confirmación de contraseña, email, etc.
 * 
 * @param field1 Nombre del primer campo
 * @param field2 Nombre del segundo campo que debe coincidir
 * @returns ValidatorFn que retorna error si los campos no coinciden
 * 
 * @example
 * ```typescript
 * this.form = this.fb.group(
 *   {
 *     password: ['', [Validators.required]],
 *     confirmPassword: ['', [Validators.required]]
 *   },
 *   { validators: matchFields('password', 'confirmPassword') }
 * );
 * ```
 */
export function matchFields(field1: string, field2: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value1 = control.get(field1)?.value;
    const value2 = control.get(field2)?.value;

    if (!value1 || !value2) return null;

    return value1 === value2 ? null : { fieldsMismatch: { field1, field2 } };
  };
}

/**
 * Validador cross-field para verificar precio mínimo por plaza.
 * 
 * Calcula el precio por persona (precio total / número de plazas)
 * y valida que sea mayor o igual al mínimo establecido.
 * 
 * @param minEurosPerPerson Precio mínimo en euros por persona
 * @returns ValidatorFn que valida el precio por plaza
 * 
 * @example
 * ```typescript
 * this.form = this.fb.group(
 *   {
 *     precioTotal: [0, [Validators.required]],
 *     plazas: [1, [Validators.required]]
 *   },
 *   { validators: precioMinimoPlaza(1) }
 * );
 * ```
 */
export function precioMinimoPlaza(minEurosPerPerson: number): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const precio = group.get('precioTotal')?.value;
    const plazas = group.get('plazas')?.value;

    if (!precio || !plazas || plazas === 0) return null;

    const precioPorPlaza = precio / plazas;

    return precioPorPlaza >= minEurosPerPerson
      ? null
      : {
          precioMinimoPlaza: {
            min: minEurosPerPerson,
            actual: precioPorPlaza,
          },
        };
  };
}

/**
 * Validador cross-field para campos que deben completarse juntos.
 * 
 * Valida que ambos campos estén completos o ambos estén vacíos,
 * evitando el estado inconsistente donde solo uno está lleno.
 * 
 * Útil para credenciales (usuario + password), direcciones parciales, etc.
 * 
 * @param field1 Nombre del primer campo
 * @param field2 Nombre del segundo campo
 * @returns ValidatorFn que valida completitud conjunta
 * 
 * @example
 * ```typescript
 * this.form = this.fb.group(
 *   {
 *     usuario: [''],
 *     password: ['']
 *   },
 *   { validators: requireBothOrNeither('usuario', 'password') }
 * );
 * ```
 */
export function requireBothOrNeither(field1: string, field2: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const value1 = group.get(field1)?.value;
    const value2 = group.get(field2)?.value;

    const bothFilled = !!value1 && !!value2;
    const bothEmpty = !value1 && !value2;

    return bothFilled || bothEmpty
      ? null
      : {
          requireBothOrNeither: { field1, field2 },
        };
  };
}

/**
 * Validador cross-field que requiere al menos uno de varios campos.
 * 
 * Valida que al menos uno de los campos especificados tenga un valor.
 * Útil para contacto (email O teléfono), opciones alternativas, etc.
 * 
 * @param fields Array con nombres de los campos a validar
 * @returns ValidatorFn que valida presencia de al menos un campo
 * 
 * @example
 * ```typescript
 * this.form = this.fb.group(
 *   {
 *     email: [''],
 *     telefono: [''],
 *     direccion: ['']
 *   },
 *   { validators: atLeastOne(['email', 'telefono']) }
 * );
 * ```
 */
export function atLeastOne(fields: string[]): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const hasAtLeastOne = fields.some((field) => {
      const value = group.get(field)?.value;
      return !!value;
    });

    return hasAtLeastOne
      ? null
      : {
          atLeastOne: { fields },
        };
  };
}

/**
 * Validador cross-field para rangos de fechas.
 * 
 * Valida que la fecha de inicio sea anterior a la fecha de fin.
 * 
 * @param startDateField Nombre del campo de fecha inicio
 * @param endDateField Nombre del campo de fecha fin
 * @returns ValidatorFn que valida el rango de fechas
 * 
 * @example
 * ```typescript
 * this.form = this.fb.group(
 *   {
 *     fechaInicio: ['', [Validators.required]],
 *     fechaFin: ['', [Validators.required]]
 *   },
 *   { validators: dateRange('fechaInicio', 'fechaFin') }
 * );
 * ```
 */
export function dateRange(startDateField: string, endDateField: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const startDate = group.get(startDateField)?.value;
    const endDate = group.get(endDateField)?.value;

    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);

    return start < end
      ? null
      : {
          invalidDateRange: {
            startDateField,
            endDateField,
          },
        };
  };
}

/**
 * Validador cross-field para edad mínima basada en fecha de nacimiento.
 * 
 * Calcula la edad a partir de la fecha de nacimiento y valida
 * que sea mayor o igual a la edad mínima especificada.
 * 
 * @param birthDateField Nombre del campo de fecha de nacimiento
 * @param minAge Edad mínima requerida
 * @returns ValidatorFn que valida edad mínima
 * 
 * @example
 * ```typescript
 * this.form = this.fb.group(
 *   {
 *     fechaNacimiento: ['', [Validators.required]]
 *   },
 *   { validators: minAge('fechaNacimiento', 18) }
 * );
 * ```
 */
export function minAge(birthDateField: string, minAge: number): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const birthDate = group.get(birthDateField)?.value;

    if (!birthDate) return null;

    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age >= minAge
      ? null
      : {
          minAge: {
            required: minAge,
            actual: age,
          },
        };
  };
}
