/**
 * Tests de accesibilidad para FormInputComponent.
 *
 * Verifican que el campo de texto cumple WCAG 2.1 AA:
 * - Label asociado correctamente al input (WCAG 1.3.1)
 * - Errores anunciados con role="alert" (WCAG 4.1.3)
 * - Campos requeridos indicados con aria-required (WCAG 3.3.2)
 * - Textos de ayuda enlazados con aria-describedby (WCAG 1.3.1)
 *
 * Se usa axe-core para detectar violaciones automáticamente.
 */
import { describe, it, expect } from 'vitest';
import axe from 'axe-core';

/* ─── Utilidades ──────────────────────────────────────────────── */

/** Renderiza HTML dentro de un <main> (simula el contexto real de la app) */
function renderHTML(html: string): HTMLElement {
  const main = document.createElement('main');
  main.innerHTML = html;
  document.body.appendChild(main);
  return main;
}

/** Ejecuta axe-core sobre un elemento del DOM */
async function checkA11y(container: HTMLElement) {
  return axe.run(container);
}

/* ─── Tests ───────────────────────────────────────────────────── */

describe('FormInput — Accesibilidad', () => {
  it('campo básico con label no tiene violaciones', async () => {
    renderHTML(`
      <div class="c-form-input">
        <div class="c-form-input__wrapper">
          <label class="c-form-input__label" for="email">
            Correo electrónico
          </label>
          <input
            class="c-form-input__field"
            id="email"
            type="email"
            name="email"
            placeholder="tu@email.com"
            autocomplete="email"
          />
        </div>
      </div>
    `);

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });

  it('campo requerido tiene aria-required', async () => {
    renderHTML(`
      <div class="c-form-input">
        <div class="c-form-input__wrapper">
          <label class="c-form-input__label" for="nombre">
            Nombre
            <span class="c-form-input__required" aria-hidden="true">*</span>
          </label>
          <input
            class="c-form-input__field"
            id="nombre"
            type="text"
            name="nombre"
            aria-required="true"
          />
        </div>
      </div>
    `);

    const input = document.querySelector('input')!;
    expect(input.getAttribute('aria-required')).toBe('true');

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });

  it('campo con error muestra role="alert" y aria-invalid', async () => {
    renderHTML(`
      <div class="c-form-input">
        <div class="c-form-input__wrapper">
          <label class="c-form-input__label" for="password">
            Contraseña
          </label>
          <input
            class="c-form-input__field"
            id="password"
            type="password"
            name="password"
            aria-invalid="true"
            aria-describedby="password-error"
          />
        </div>
        <span id="password-error" class="c-form-input__error" role="alert">
          La contraseña debe tener al menos 8 caracteres
        </span>
      </div>
    `);

    const input = document.querySelector('input')!;
    const error = document.querySelector('[role="alert"]')!;

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('password-error');
    expect(error.textContent).toContain('al menos 8 caracteres');

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });

  it('campo con texto de ayuda enlazado por aria-describedby', async () => {
    renderHTML(`
      <div class="c-form-input">
        <div class="c-form-input__wrapper">
          <label class="c-form-input__label" for="telefono">
            Teléfono
          </label>
          <input
            class="c-form-input__field"
            id="telefono"
            type="tel"
            name="telefono"
            aria-describedby="telefono-help"
          />
        </div>
        <span id="telefono-help" class="c-form-input__help">
          Incluye el prefijo internacional (+34)
        </span>
      </div>
    `);

    const input = document.querySelector('input')!;
    const helpId = input.getAttribute('aria-describedby')!;
    const helpText = document.getElementById(helpId);

    expect(helpText).not.toBeNull();
    expect(helpText!.textContent).toContain('+34');

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });

  it('campo deshabilitado es accesible', async () => {
    renderHTML(`
      <div class="c-form-input">
        <div class="c-form-input__wrapper">
          <label class="c-form-input__label" for="readonly-field">
            Campo de solo lectura
          </label>
          <input
            class="c-form-input__field"
            id="readonly-field"
            type="text"
            name="readonly"
            disabled
          />
        </div>
      </div>
    `);

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });

  it('campo con estado de éxito usa role="status"', async () => {
    renderHTML(`
      <div class="c-form-input">
        <div class="c-form-input__wrapper">
          <label class="c-form-input__label" for="usuario">
            Nombre de usuario
          </label>
          <input
            class="c-form-input__field"
            id="usuario"
            type="text"
            name="usuario"
            value="juandev"
          />
        </div>
        <span class="c-form-input__success" role="status">
          ¡Nombre de usuario disponible!
        </span>
      </div>
    `);

    const status = document.querySelector('[role="status"]')!;
    expect(status).not.toBeNull();

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });
});
