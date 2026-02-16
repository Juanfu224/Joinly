/**
 * Tests de accesibilidad para ButtonComponent.
 *
 * Verifican que el botón cumple WCAG 2.1 AA:
 * - Botones con texto visible accesible (WCAG 4.1.2)
 * - Aria-label cuando no hay texto visible (WCAG 4.1.2)
 * - Estado deshabilitado comunicado correctamente (WCAG 4.1.2)
 * - Iconos decorativos ocultos con aria-hidden (WCAG 1.1.1)
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

describe('Button — Accesibilidad', () => {
  it('botón con texto no tiene violaciones', async () => {
    renderHTML(`
      <button class="c-button c-button--primary c-button--md" type="button">
        <span class="c-button__text">Guardar cambios</span>
      </button>
    `);

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });

  it('botón con aria-label es accesible', async () => {
    renderHTML(`
      <button
        class="c-button c-button--ghost c-button--sm"
        type="button"
        aria-label="Cerrar diálogo"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span class="c-button__text"></span>
      </button>
    `);

    const button = document.querySelector('button')!;
    expect(button.getAttribute('aria-label')).toBe('Cerrar diálogo');

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });

  it('botón submit en formulario es accesible', async () => {
    renderHTML(`
      <form>
        <label for="test-input">Campo</label>
        <input id="test-input" type="text" name="test" />
        <button class="c-button c-button--primary c-button--md" type="submit">
          <span class="c-button__text">Enviar formulario</span>
        </button>
      </form>
    `);

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });

  it('botón deshabilitado es accesible', async () => {
    renderHTML(`
      <button
        class="c-button c-button--primary c-button--md"
        type="button"
        disabled
      >
        <span class="c-button__text">No disponible</span>
      </button>
    `);

    const button = document.querySelector('button')!;
    expect(button.disabled).toBe(true);

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });

  it('botón con icono y texto es accesible', async () => {
    renderHTML(`
      <button class="c-button c-button--primary c-button--md" type="button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="c-button__icon">
          <path d="M12 4v16m-8-8h16" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span class="c-button__text">Crear grupo</span>
      </button>
    `);

    /* Los iconos decorativos deben estar ocultos para lectores de pantalla */
    const svg = document.querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });

  it('botón en estado de carga con spinner es accesible', async () => {
    renderHTML(`
      <button
        class="c-button c-button--primary c-button--md c-button--loading"
        type="button"
        disabled
      >
        <span class="c-button__spinner" aria-hidden="true"></span>
        <span class="c-button__text">Guardando...</span>
      </button>
    `);

    /* El spinner es decorativo y debe estar oculto */
    const spinner = document.querySelector('.c-button__spinner')!;
    expect(spinner.getAttribute('aria-hidden')).toBe('true');

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });
});
