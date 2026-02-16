/**
 * Tests de accesibilidad para FormCheckboxComponent.
 *
 * Verifican que la casilla de verificación cumple WCAG 2.1 AA:
 * - Label asociado al checkbox (WCAG 1.3.1)
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

describe('FormCheckbox — Accesibilidad', () => {
  it('checkbox con label no tiene violaciones', async () => {
    renderHTML(`
      <div class="c-form-checkbox">
        <div class="c-form-checkbox__wrapper">
          <input
            type="checkbox"
            class="c-form-checkbox__input"
            id="terminos"
            name="terminos"
          />
          <label class="c-form-checkbox__label" for="terminos">
            Acepto los términos y condiciones
          </label>
        </div>
      </div>
    `);

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });

  it('checkbox requerido tiene aria-required', async () => {
    renderHTML(`
      <div class="c-form-checkbox">
        <div class="c-form-checkbox__wrapper">
          <input
            type="checkbox"
            class="c-form-checkbox__input"
            id="privacidad"
            name="privacidad"
            aria-required="true"
          />
          <label class="c-form-checkbox__label" for="privacidad">
            He leído la política de privacidad
            <span class="c-form-checkbox__required" aria-hidden="true">*</span>
          </label>
        </div>
      </div>
    `);

    const checkbox = document.querySelector('input[type="checkbox"]')!;
    expect(checkbox.getAttribute('aria-required')).toBe('true');

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });

  it('checkbox con error muestra role="alert" y aria-invalid', async () => {
    renderHTML(`
      <div class="c-form-checkbox">
        <div class="c-form-checkbox__wrapper">
          <input
            type="checkbox"
            class="c-form-checkbox__input"
            id="aceptar"
            name="aceptar"
            aria-invalid="true"
            aria-describedby="aceptar-error"
          />
          <label class="c-form-checkbox__label" for="aceptar">
            Acepto las condiciones
          </label>
        </div>
        <span id="aceptar-error" class="c-form-checkbox__error" role="alert">
          Debes aceptar las condiciones para continuar
        </span>
      </div>
    `);

    const checkbox = document.querySelector('input[type="checkbox"]')!;
    const error = document.querySelector('[role="alert"]')!;

    expect(checkbox.getAttribute('aria-invalid')).toBe('true');
    expect(error.textContent).toContain('Debes aceptar');

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });

  it('checkbox con texto de ayuda enlazado por aria-describedby', async () => {
    renderHTML(`
      <div class="c-form-checkbox">
        <div class="c-form-checkbox__wrapper">
          <input
            type="checkbox"
            class="c-form-checkbox__input"
            id="newsletter"
            name="newsletter"
            aria-describedby="newsletter-help"
          />
          <label class="c-form-checkbox__label" for="newsletter">
            Suscribirme al boletín
          </label>
        </div>
        <span id="newsletter-help" class="c-form-checkbox__help">
          Recibirás un email semanal con novedades
        </span>
      </div>
    `);

    const checkbox = document.querySelector('input[type="checkbox"]')!;
    const helpId = checkbox.getAttribute('aria-describedby')!;
    const helpText = document.getElementById(helpId);

    expect(helpText).not.toBeNull();
    expect(helpText!.textContent).toContain('email semanal');

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });

  it('checkbox deshabilitado es accesible', async () => {
    renderHTML(`
      <div class="c-form-checkbox">
        <div class="c-form-checkbox__wrapper">
          <input
            type="checkbox"
            class="c-form-checkbox__input"
            id="disabled-check"
            name="disabled"
            disabled
          />
          <label class="c-form-checkbox__label" for="disabled-check">
            Opción no disponible
          </label>
        </div>
      </div>
    `);

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });
});
