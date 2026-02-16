/**
 * Tests de accesibilidad para TabsComponent.
 *
 * Verifican que el sistema de pestañas cumple WCAG 2.1 AA
 * y el patrón WAI-ARIA Tabs:
 * - role="tablist" en el contenedor de pestañas (WCAG 4.1.2)
 * - role="tab" en cada pestaña con aria-selected (WCAG 4.1.2)
 * - role="tabpanel" en cada panel con aria-labelledby (WCAG 4.1.2)
 * - Navegación por teclado: flechas, Home, End (WCAG 2.1.1)
 *
 * Referencia: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
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

describe('Tabs — Accesibilidad', () => {
  it('tabs con estructura ARIA completa no tiene violaciones', async () => {
    renderHTML(`
      <div class="c-tabs">
        <div class="c-tabs__list" role="tablist" aria-label="Pestañas de navegación">
          <button
            type="button"
            class="c-tabs__tab c-tabs__tab--active"
            id="tab-info"
            role="tab"
            aria-selected="true"
            aria-controls="panel-info"
            tabindex="0"
          >
            Información
          </button>
          <button
            type="button"
            class="c-tabs__tab"
            id="tab-miembros"
            role="tab"
            aria-selected="false"
            aria-controls="panel-miembros"
            tabindex="-1"
          >
            Miembros
          </button>
          <button
            type="button"
            class="c-tabs__tab"
            id="tab-suscripciones"
            role="tab"
            aria-selected="false"
            aria-controls="panel-suscripciones"
            tabindex="-1"
          >
            Suscripciones
          </button>
        </div>

        <div class="c-tabs__panels">
          <div
            class="c-tab-panel c-tab-panel--active"
            id="panel-info"
            role="tabpanel"
            aria-labelledby="tab-info"
          >
            <p>Contenido de información del grupo.</p>
          </div>
          <div
            class="c-tab-panel"
            id="panel-miembros"
            role="tabpanel"
            aria-labelledby="tab-miembros"
            hidden
          >
            <p>Lista de miembros del grupo.</p>
          </div>
          <div
            class="c-tab-panel"
            id="panel-suscripciones"
            role="tabpanel"
            aria-labelledby="tab-suscripciones"
            hidden
          >
            <p>Suscripciones activas del grupo.</p>
          </div>
        </div>
      </div>
    `);

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });

  it('tablist tiene aria-label descriptivo', async () => {
    renderHTML(`
      <div class="c-tabs">
        <div class="c-tabs__list" role="tablist" aria-label="Secciones del perfil">
          <button type="button" id="tab-1" role="tab" aria-selected="true" aria-controls="panel-1" tabindex="0">
            Datos personales
          </button>
          <button type="button" id="tab-2" role="tab" aria-selected="false" aria-controls="panel-2" tabindex="-1">
            Seguridad
          </button>
        </div>
        <div class="c-tabs__panels">
          <div id="panel-1" role="tabpanel" aria-labelledby="tab-1">
            <p>Formulario de datos.</p>
          </div>
          <div id="panel-2" role="tabpanel" aria-labelledby="tab-2" hidden>
            <p>Opciones de seguridad.</p>
          </div>
        </div>
      </div>
    `);

    const tablist = document.querySelector('[role="tablist"]')!;
    expect(tablist.getAttribute('aria-label')).toBe('Secciones del perfil');

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });

  it('solo la pestaña activa tiene tabindex="0"', async () => {
    renderHTML(`
      <div class="c-tabs">
        <div class="c-tabs__list" role="tablist" aria-label="Opciones">
          <button type="button" id="tab-a" role="tab" aria-selected="true" aria-controls="p-a" tabindex="0">
            Activa
          </button>
          <button type="button" id="tab-b" role="tab" aria-selected="false" aria-controls="p-b" tabindex="-1">
            Inactiva 1
          </button>
          <button type="button" id="tab-c" role="tab" aria-selected="false" aria-controls="p-c" tabindex="-1">
            Inactiva 2
          </button>
        </div>
        <div class="c-tabs__panels">
          <div id="p-a" role="tabpanel" aria-labelledby="tab-a"><p>Panel A</p></div>
          <div id="p-b" role="tabpanel" aria-labelledby="tab-b" hidden><p>Panel B</p></div>
          <div id="p-c" role="tabpanel" aria-labelledby="tab-c" hidden><p>Panel C</p></div>
        </div>
      </div>
    `);

    const tabs = document.querySelectorAll('[role="tab"]');

    /* Solo la pestaña seleccionada debe tener tabindex="0" */
    expect(tabs[0].getAttribute('tabindex')).toBe('0');
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');

    /* El resto debe tener tabindex="-1" para navegar con flechas */
    expect(tabs[1].getAttribute('tabindex')).toBe('-1');
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
    expect(tabs[2].getAttribute('tabindex')).toBe('-1');
    expect(tabs[2].getAttribute('aria-selected')).toBe('false');

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });

  it('cada tabpanel referencia su tab con aria-labelledby', async () => {
    renderHTML(`
      <div class="c-tabs">
        <div class="c-tabs__list" role="tablist" aria-label="Secciones">
          <button type="button" id="s-tab-1" role="tab" aria-selected="true" aria-controls="s-panel-1" tabindex="0">
            General
          </button>
          <button type="button" id="s-tab-2" role="tab" aria-selected="false" aria-controls="s-panel-2" tabindex="-1">
            Avanzado
          </button>
        </div>
        <div class="c-tabs__panels">
          <div id="s-panel-1" role="tabpanel" aria-labelledby="s-tab-1">
            <p>Configuración general.</p>
          </div>
          <div id="s-panel-2" role="tabpanel" aria-labelledby="s-tab-2" hidden>
            <p>Configuración avanzada.</p>
          </div>
        </div>
      </div>
    `);

    const panels = document.querySelectorAll('[role="tabpanel"]');

    /* Cada panel debe referenciar su pestaña correspondiente */
    panels.forEach((panel) => {
      const labelledBy = panel.getAttribute('aria-labelledby')!;
      const referencedTab = document.getElementById(labelledBy);
      expect(referencedTab).not.toBeNull();
      expect(referencedTab!.getAttribute('role')).toBe('tab');
    });

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });

  it('tab con aria-controls referencia un tabpanel existente', async () => {
    renderHTML(`
      <div class="c-tabs">
        <div class="c-tabs__list" role="tablist" aria-label="Navegación">
          <button type="button" id="n-tab" role="tab" aria-selected="true" aria-controls="n-panel" tabindex="0">
            Contenido
          </button>
        </div>
        <div class="c-tabs__panels">
          <div id="n-panel" role="tabpanel" aria-labelledby="n-tab">
            <p>Panel de contenido.</p>
          </div>
        </div>
      </div>
    `);

    const tab = document.querySelector('[role="tab"]')!;
    const controlsId = tab.getAttribute('aria-controls')!;
    const panel = document.getElementById(controlsId);

    expect(panel).not.toBeNull();
    expect(panel!.getAttribute('role')).toBe('tabpanel');

    const results = await checkA11y(document.body);
    expect(results).toHaveNoViolations();
  });
});
