import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import {
  CardComponent,
  ButtonComponent,
  AlertComponent,
  AvatarComponent,
  IconComponent,
  LogoComponent,
  FormInputComponent,
  FormTextareaComponent,
  FormSelectComponent,
  FormCheckboxComponent,
  FormRadioGroupComponent,
  BreadcrumbsComponent,
  TooltipDirective,
  NotificationSenderComponent,
  NotificationReceiverComponent,
  LoginFormComponent,
  RegisterFormComponent,
  CreateGroupFormComponent,
  JoinGroupFormComponent,
  NewSubscriptionFormComponent,
  type SelectOption,
  type RadioOption,
  type BreadcrumbItem,
} from '../../components/shared';
import { ModalService } from '../../services/modal';

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
 * - Demostración de sistema de eventos avanzado (tooltips, modales, teclado)
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
    LogoComponent,
    FormInputComponent,
    FormTextareaComponent,
    FormSelectComponent,
    FormCheckboxComponent,
    FormRadioGroupComponent,
    BreadcrumbsComponent,
    TooltipDirective,
    NotificationSenderComponent,
    NotificationReceiverComponent,
    LoginFormComponent,
    RegisterFormComponent,
    CreateGroupFormComponent,
    JoinGroupFormComponent,
    NewSubscriptionFormComponent,
  ],
  templateUrl: './style-guide.html',
  styleUrl: './style-guide.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StyleGuideComponent {
  protected readonly modalService = inject(ModalService);

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

  /**
   * Variantes de color para el logo en el sistema de diseño.
   * Incluye colores principales y claros para fondos oscuros.
   */
  protected readonly logoVariants: Array<{
    variant: 'naranja' | 'morado' | 'claro-naranja' | 'claro-morado' | 'azul' | 'amarillo';
    label: string;
  }> = [
    { variant: 'naranja', label: 'Naranja (Principal)' },
    { variant: 'morado', label: 'Morado (Secundario)' },
    { variant: 'claro-naranja', label: 'Claro Naranja' },
    { variant: 'claro-morado', label: 'Claro Morado' },
    { variant: 'azul', label: 'Azul' },
    { variant: 'amarillo', label: 'Amarillo' },
  ] as const;

  /**
   * Tamaños disponibles para el logo en el sistema de diseño.
   */
  protected readonly logoSizes: Array<{ size: 'sm' | 'md' | 'lg'; label: string }> = [
    { size: 'sm', label: 'Pequeño (32px)' },
    { size: 'md', label: 'Mediano (48px)' },
    { size: 'lg', label: 'Grande (64px)' },
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

  // =========================================================================
  // MÉTODOS DE DEMOSTRACIÓN - EVENTOS AVANZADOS
  // =========================================================================

  /**
   * Abre un modal de confirmación de ejemplo.
   * Demuestra el uso del ModalService con callbacks.
   */
  protected openConfirmModal(): void {
    this.modalService.open({
      title: '¿Eliminar suscripción?',
      content: 'Esta acción no se puede deshacer. La suscripción será eliminada permanentemente.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        console.log('Suscripción eliminada');
      },
      onCancel: () => {
        console.log('Cancelado');
      },
    });
  }

  /**
   * Abre un modal informativo (solo botón de aceptar).
   * Demuestra uso simple sin botón de cancelar.
   */
  protected openInfoModal(): void {
    this.modalService.open({
      title: 'Información importante',
      content: 'Las suscripciones compartidas deben ser gestionadas por el titular de la cuenta principal.',
      confirmText: 'Entendido',
    });
  }

  /**
   * Abre un modal que no se puede cerrar con overlay o ESC.
   * Demuestra configuración estricta de cierre.
   */
  protected openStrictModal(): void {
    this.modalService.open({
      title: 'Acción requerida',
      content: 'Debes confirmar o cancelar esta acción antes de continuar.',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      closeOnOverlayClick: false,
      closeOnEscape: false,
      onConfirm: () => {
        console.log('Confirmado');
      },
    });
  }

  // =========================================================================
  // MÉTODOS DE DEMOSTRACIÓN - FORMULARIOS
  // =========================================================================

  /**
   * Maneja el evento de submit del formulario de login.
   * En producción, conectaría con AuthService.
   */
  protected onLoginSubmit(data: { email: string; password: string }): void {
    console.log('[StyleGuide] Login submit:', data);
  }

  /**
   * Maneja el evento de submit del formulario de registro.
   */
  protected onRegisterSubmit(data: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): void {
    console.log('[StyleGuide] Register submit:', data);
  }

  /**
   * Maneja el evento de submit del formulario de crear grupo.
   */
  protected onCreateGroupSubmit(data: { nombre: string }): void {
    console.log('[StyleGuide] Create group submit:', data);
  }

  /**
   * Maneja el evento de submit del formulario de unirse a grupo.
   */
  protected onJoinGroupSubmit(data: { codigo: string }): void {
    console.log('[StyleGuide] Join group submit:', data);
  }

  /**
   * Maneja el evento de submit del formulario de nueva suscripción.
   */
  protected onNewSubscriptionSubmit(data: {
    nombre: string;
    precioTotal: number;
    frecuencia: 'mensual' | 'anual';
    plazas: number;
    password?: string;
    usuario?: string;
  }): void {
    console.log('[StyleGuide] New subscription submit:', data);
  }

  /**
   * Maneja eventos de cancelación en formularios de demo.
   */
  protected onFormCancel(): void {
    console.log('[StyleGuide] Form cancelled');
  }

  /**
   * Maneja solicitudes de cambio de formulario (login -> register, etc.).
   */
  protected onFormSwitch(target: string): void {
    console.log('[StyleGuide] Form switch requested:', target);
  }
}
