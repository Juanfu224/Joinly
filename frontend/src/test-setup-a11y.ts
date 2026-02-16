import { beforeEach, expect } from 'vitest';

/**
 * Setup global para tests de accesibilidad con axe-core.
 *
 * - Limpia el DOM entre cada test para evitar contaminación.
 * - Establece `lang="es"` en <html> para cumplir WCAG 3.1.1 (idioma de la página).
 * - Extiende `expect` con el matcher `toHaveNoViolations()` para usar con axe-core.
 *
 * @example
 * ```ts
 * import axe from 'axe-core';
 *
 * it('no tiene violaciones de accesibilidad', async () => {
 *   document.body.innerHTML = '<button>Enviar</button>';
 *   const results = await axe.run(document.body);
 *   expect(results).toHaveNoViolations();
 * });
 * ```
 */
beforeEach(() => {
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  document.documentElement.lang = 'es';
});

interface AxeViolation {
  id: string;
  impact?: string;
  description: string;
  helpUrl: string;
  nodes: { html: string; failureSummary?: string }[];
}

expect.extend({
  toHaveNoViolations(received: { violations: AxeViolation[] }) {
    const { violations } = received;
    const pass = violations.length === 0;

    const message = () => {
      if (pass) return 'Se esperaban violaciones de accesibilidad, pero no se encontraron';

      const details = violations
        .map((v) => {
          const nodes = v.nodes.map((n) => `      HTML: ${n.html}`).join('\n');
          return `  ❌ [${v.impact?.toUpperCase()}] ${v.id}: ${v.description}\n${nodes}\n     Más info: ${v.helpUrl}`;
        })
        .join('\n\n');

      return `Se encontraron ${violations.length} violaciones de accesibilidad:\n\n${details}`;
    };

    return { pass, message };
  },
});
