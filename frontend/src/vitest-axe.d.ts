/**
 * Declaración de tipos para el matcher personalizado `toHaveNoViolations()`
 * usado en los tests de accesibilidad (*.a11y.spec.ts).
 *
 * La implementación del matcher está en `test-setup-a11y.ts`.
 */
declare module 'vitest' {
  interface Assertion {
    /** Verifica que el resultado de `axe.run()` no contenga violaciones de accesibilidad. */
    toHaveNoViolations(): void;
  }
}
