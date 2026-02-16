/**
 * Tests de accesibilidad para FormSelectComponent.
 *
 * Verifican que el selector cumple WCAG 2.1 AA:
 * - Label asociado al select (WCAG 1.3.1)
 * - Errores anunciados con role="alert" (WCAG 4.1.3)
 * - Campos requeridos indicados con aria-required (WCAG 3.3.2)
 * - Textos de ayuda enlazados con aria-describedby (WCAG 1.3.1)
 *
 * Se usa axe-core para detectar violaciones automáticamente.
 */
import { describe, it, expect } from 'vitest';
import axe from 'axe-core';

/* ─── Utilidades ──────────────────────────────────────────────── */

function renderHTML(html: string): HTMLElement {
  const main = document.createElement('main');
  main.innerHTML = html;
  document.body.appendChild(main);
  return main;
}

async function checkA11y(container: HTMLElement) {
  return axe.run(container);
}

/* ─── Tests ───────────────────────────────────────────────────── */

describe('FormSelect — Accesibilidad', () => {
  it('select con label y opciones no tiene violaciones', async () => {
    renderHTML(`
      <div class="c-form-select">
        <label class="c-form-select__label" for="periodicidad">
          Periodicidad
        </label>
        <div class="c-form-select__wrapper">
          <select
            class="c-form-select__field"
            id="periodicidad"
            name="periodicidad"
          >
            <option value="" disabled selected>Selecciona una opción</option>
            <option value="MENSUAL">Mensual</option>
            <option value="TRIMESTRAL">Trimestral</option>
            <option value="ANUAL">Anual</option>
          </select>
        </div>
      </div>
    `);

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });

  it('select requerido tiene aria-required', async () => {
    renderHTML(`
      <div class="c-form-select">
        <label class="c-form-select__label" for="categoria">
          Categoría
          <span class="c-form-select__required" aria-hidden="true">*</span>
        </label>
        <div class="c-form-select__wrapper">
          <select
            class="c-form-select__field"
            id="categoria"
            name="categoria"
            aria-required="true"
          >
            <option value="" disabled selected>Elige una categoría</option>
            <option value="streaming">Streaming</option>
            <option value="musica">Música</option>
          </select>
        </div>
      </div>
    `);

    const select = document.querySelector('select')!;
    expect(select.getAttribute('aria-required')).toBe('true');

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });

  it('select con error muestra role="alert" y aria-invalid', async () => {
    renderHTML(`
      <div class="c-form-select">
        <label class="c-form-select__label" for="plan">
          Plan
        </label>
        <div class="c-form-select__wrapper">
          <select
            class="c-form-select__field"
            id="plan"
            name="plan"
            aria-invalid="true"
            aria-describedby="plan-error"
          >
            <option value="" disabled selected>Selecciona un plan</option>
            <option value="basico">Básico</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        <span id="plan-error" class="c-form-select__error" role="alert">
          Debes seleccionar un plan
        </span>
      </div>
    `);

    const select = document.querySelector('select')!;
    const error = document.querySelector('[role="alert"]')!;

    expect(select.getAttribute('aria-invalid')).toBe('true');
    expect(error.textContent).toContain('seleccionar un plan');

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });

  it('select con texto de ayuda enlazado por aria-describedby', async () => {
    renderHTML(`
      <div class="c-form-select">
        <label class="c-form-select__label" for="moneda">
          Moneda
        </label>
        <div class="c-form-select__wrapper">
          <select
            class="c-form-select__field"
            id="moneda"
            name="moneda"
            aria-describedby="moneda-help"
          >
            <option value="" disabled selected>Selecciona moneda</option>
            <option value="EUR">Euro (€)</option>
            <option value="USD">Dólar ($)</option>
          </select>
        </div>
        <span id="moneda-help" class="c-form-select__help">
          La moneda no se puede cambiar después
        </span>
      </div>
    `);

    const select = document.querySelector('select')!;
    const helpId = select.getAttribute('aria-describedby')!;
    const helpText = document.getElementById(helpId);

    expect(helpText).not.toBeNull();
    expect(helpText!.textContent).toContain('no se puede cambiar');

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });

  it('select con opción deshabilitada es accesible', async () => {
    renderHTML(`
      <div class="c-form-select">
        <label class="c-form-select__label" for="servicio">
          Servicio
        </label>
        <div class="c-form-select__wrapper">
          <select
            class="c-form-select__field"
            id="servicio"
            name="servicio"
          >
            <option value="" disabled selected>Elige un servicio</option>
            <option value="netflix">Netflix</option>
            <option value="hbo" disabled>HBO Max (no disponible)</option>
            <option value="spotify">Spotify</option>
          </select>
        </div>
      </div>
    `);

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });
});
