import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import {
  CardComponent,
  ButtonComponent,
  IconComponent,
  GroupCardComponent,
  SubscriptionInfoCardComponent,
  FormInputComponent,
  FormSelectComponent,
  type SelectOption,
  type SubscriptionInfoData,
  type JoinRequest,
} from '../../../components/shared';
import type { GrupoCardData } from '../../../models/grupo.model';

/**
 * Página Responsive Test - Herramienta de testing responsive integrada.
 *
 * Permite verificar el comportamiento responsive de los componentes clave
 * en diferentes viewports sin salir del navegador.
 *
 * **Características:**
 * - OnPush Change Detection para rendimiento óptimo
 * - Standalone component (Angular 21)
 * - Uso de signals para gestión de estado reactivo
 * - Selector de viewport simulado (320px, 375px, 768px, 1024px, 1280px)
 * - Indicador de breakpoint activo en tiempo real
 * - Verificación de Container Queries
 * - Componentes clave en contenedores responsivos
 *
 * @example
 * Acceso: /style-guide/responsive-test
 *
 * @usageNotes
 * Solo disponible en desarrollo. Herramienta para verificar Fase 6 del TODO.
 */
@Component({
  selector: 'app-responsive-test',
  imports: [
    CardComponent,
    ButtonComponent,
    IconComponent,
    GroupCardComponent,
    SubscriptionInfoCardComponent,
    FormInputComponent,
    FormSelectComponent,
  ],
  templateUrl: './responsive-test.html',
  styleUrl: './responsive-test.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResponsiveTestComponent {
  private readonly destroyRef = inject(DestroyRef);

  // =========================================================================
  // VIEWPORTS PARA TESTING (FASE 6)
  // =========================================================================

  readonly viewports: SelectOption[] = [
    { value: 'auto', label: 'Auto (Viewport actual)' },
    { value: '320', label: '320px - iPhone SE' },
    { value: '375', label: '375px - iPhone 12/13' },
    { value: '768', label: '768px - iPad' },
    { value: '1024', label: '1024px - Desktop pequeño' },
    { value: '1280', label: '1280px - Desktop estándar' },
  ];

  /**
   * Viewport seleccionado por el usuario
   */
  readonly selectedViewport = signal<string>('auto');

  /**
   * Ancho actual del viewport en píxeles
   */
  readonly currentWidth = signal<number>(window.innerWidth);

  /**
   * Breakpoint activo actual basado en los breakpoints del proyecto
   */
  readonly currentBreakpoint = computed(() => {
    const width = this.currentWidth();
    if (width < 320) return 'mobile-small (< 320px)';
    if (width < 640) return 'mobile-small (320px+)';
    if (width < 768) return 'movil (640px+)';
    if (width < 1024) return 'tablet (768px+)';
    if (width < 1280) return 'escritorio (1024px+)';
    return 'escritorio-grande (1280px+)';
  });

  /**
   * Detecta si el navegador soporta Container Queries
   */
  readonly supportsContainerQueries = computed(() => {
    if (typeof CSS === 'undefined' || !CSS.supports) return false;
    return CSS.supports('container-type', 'inline-size');
  });

  /**
   * Estilo computado para el contenedor de testing
   */
  readonly containerStyle = computed(() => {
    const viewport = this.selectedViewport();
    if (viewport === 'auto') return {};
    
    const width = parseInt(viewport, 10);
    return {
      'max-width': `${width}px`,
      'margin': '0 auto',
      'border': '2px solid var(--color-acento)',
      'border-radius': 'var(--radio-grande)',
    };
  });

  // =========================================================================
  // DATOS MOCK PARA TESTING
  // =========================================================================

  readonly mockGrupo: GrupoCardData = {
    id: 1,
    nombre: 'Familia García',
    totalMiembros: 4,
    totalSuscripciones: 3,
  };

  readonly mockSubscription: SubscriptionInfoData = {
    credenciales: {
      usuario: 'familia.garcia@netflix.com',
      contrasena: '********',
    },
    pago: {
      montoRetenido: 4.25,
      estado: 'retenido',
      fechaLiberacion: '2026-01-15',
    },
    solicitudes: [] as JoinRequest[],
  };

  // =========================================================================
  // LIFECYCLE
  // =========================================================================

  constructor() {
    // Actualizar ancho del viewport cuando cambia el tamaño de la ventana
    const updateWidth = () => this.currentWidth.set(window.innerWidth);
    window.addEventListener('resize', updateWidth);
    
    // Cleanup automático cuando el componente se destruye (Angular 21)
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('resize', updateWidth);
    });
  }

  // =========================================================================
  // MÉTODOS
  // =========================================================================

  /**
   * Cambia el viewport simulado
   */
  onViewportChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedViewport.set(value);
  }

  /**
   * Resetea al viewport automático
   */
  resetViewport(): void {
    this.selectedViewport.set('auto');
  }
}
