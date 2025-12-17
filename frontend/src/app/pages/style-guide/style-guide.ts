import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  CardComponent,
  ButtonComponent,
  AlertComponent,
  AvatarComponent,
  IconComponent,
  FormInputComponent,
  FormTextareaComponent,
  FormSelectComponent,
  FormCheckboxComponent,
  FormRadioGroupComponent,
  BreadcrumbsComponent,
  type SelectOption,
  type RadioOption,
  type BreadcrumbItem,
} from '../../components/shared';

/**
 * Componente Style Guide - Guía visual del sistema de diseño.
 *
 * Muestra todos los componentes reutilizables de la aplicación con sus variantes,
 * sirviendo como documentación visual y herramienta de testing.
 *
 * **Características:**
 * - OnPush Change Detection para rendimiento óptimo
 * - Standalone component (Angular 21)
 * - Uso de signals para gestión de estado reactivo
 * - Documentación visual completa del Design System
 *
 * @example
 * Acceso: /style-guide
 *
 * @see {@link https://angular.dev/guide/components} - Componentes Angular 21
 */
@Component({
  selector: 'app-style-guide',
  imports: [
    CardComponent,
    ButtonComponent,
    AlertComponent,
    AvatarComponent,
    IconComponent,
    FormInputComponent,
    FormTextareaComponent,
    FormSelectComponent,
    FormCheckboxComponent,
    FormRadioGroupComponent,
    BreadcrumbsComponent,
  ],
  templateUrl: './style-guide.html',
  styleUrl: './style-guide.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StyleGuideComponent {
  // =========================================================================
  // DATOS DE EJEMPLO PARA COMPONENTES
  // =========================================================================

  /**
   * Opciones de ejemplo para el componente Select.
   * Demuestra el uso de opciones normales y deshabilitadas.
   */
  protected readonly selectOptions: SelectOption[] = [
    { value: 'netflix', label: 'Netflix' },
    { value: 'spotify', label: 'Spotify' },
    { value: 'hbo', label: 'HBO Max' },
    { value: 'disney', label: 'Disney+', disabled: true },
  ];

  /**
   * Opciones de ejemplo para Radio Group vertical.
   * Representa frecuencias de pago comunes.
   */
  protected readonly radioOptions: RadioOption[] = [
    { value: 'mensual', label: 'Mensual' },
    { value: 'trimestral', label: 'Trimestral' },
    { value: 'anual', label: 'Anual' },
  ];

  /**
   * Opciones de ejemplo para Radio Group inline (horizontal).
   * Caso de uso simple: respuesta Sí/No.
   */
  protected readonly radioOptionsInline: RadioOption[] = [
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
  ];

  /**
   * Items de ejemplo para el componente Breadcrumbs.
   * Simula la navegación: Inicio > Grupos > Familia López
   */
  protected readonly breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Inicio', url: '/' },
    { label: 'Grupos', url: '/grupos' },
    { label: 'Familia López' },
  ];

  /**
   * Tamaños de botones disponibles en el sistema de diseño.
   * Usado para generar ejemplos en la guía de estilos.
   */
  protected readonly buttonSizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl'> = [
    'xs',
    'sm',
    'md',
    'lg',
    'xl',
  ] as const;

  /**
   * Variantes de color para botones en el sistema de diseño.
   * Cada variante incluye su valor técnico y propósito de uso.
   */
  protected readonly buttonVariants: Array<{
    variant: 'primary' | 'purple' | 'blue' | 'yellow' | 'secondary';
  }> = [
    { variant: 'primary' },
    { variant: 'purple' },
    { variant: 'blue' },
    { variant: 'yellow' },
    { variant: 'secondary' },
  ] as const;

  // =========================================================================
  // ESTADO REACTIVO CON SIGNALS
  // =========================================================================

  /**
   * Controla la visibilidad de la alerta de éxito.
   * Se oculta cuando el usuario hace clic en el botón de cerrar.
   */
  protected readonly showAlertSuccess = signal(true);

  /**
   * Controla la visibilidad de la alerta de error.
   */
  protected readonly showAlertError = signal(true);

  /**
   * Controla la visibilidad de la alerta de advertencia.
   */
  protected readonly showAlertWarning = signal(true);

  /**
   * Controla la visibilidad de la alerta informativa.
   */
  protected readonly showAlertInfo = signal(true);

  // =========================================================================
  // MÉTODOS PÚBLICOS
  // =========================================================================

  /**
   * Cierra una alerta específica actualizando su signal correspondiente.
   *
   * @param type - Tipo de alerta a cerrar
   */
  protected closeAlert(type: 'success' | 'error' | 'warning' | 'info'): void {
    switch (type) {
      case 'success':
        this.showAlertSuccess.set(false);
        break;
      case 'error':
        this.showAlertError.set(false);
        break;
      case 'warning':
        this.showAlertWarning.set(false);
        break;
      case 'info':
        this.showAlertInfo.set(false);
        break;
    }
  }

  /**
   * Restaura todas las alertas a su estado visible inicial.
   * Útil para reiniciar la demo después de cerrar alertas.
   */
  protected resetAlerts(): void {
    this.showAlertSuccess.set(true);
    this.showAlertError.set(true);
    this.showAlertWarning.set(true);
    this.showAlertInfo.set(true);
  }
}
