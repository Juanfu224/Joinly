import { Injectable, signal, computed, inject } from '@angular/core';
import { ToastService } from './toast';

/**
 * Configuración para abrir un modal
 */
export interface ModalConfig {
  /**
   * Título del modal (opcional)
   */
  title?: string;

  /**
   * Contenido del modal en texto plano o HTML
   */
  content: string;

  /**
   * Texto del botón de confirmación
   * @default 'Aceptar'
   */
  confirmText?: string;

  /**
   * Texto del botón de cancelación (si no se proporciona, solo se muestra el botón de confirmar)
   */
  cancelText?: string;

  /**
   * Callback al confirmar
   */
  onConfirm?: () => void;

  /**
   * Callback al cancelar
   */
  onCancel?: () => void;

  /**
   * Permitir cerrar con click en overlay
   * @default true
   */
  closeOnOverlayClick?: boolean;

  /**
   * Permitir cerrar con tecla ESC
   * @default true
   */
  closeOnEscape?: boolean;
}

/**
 * Servicio para gestión centralizada de modales.
 * 
 * Proporciona una API fluida para abrir y cerrar modales desde cualquier
 * parte de la aplicación. Gestiona el estado del modal, previene scroll
 * del body cuando está abierto, y maneja el focus management.
 * 
 * @remarks
 * El servicio trabaja en conjunto con el ModalComponent que debe estar
 * en el root del App component para funcionar correctamente.
 * 
 * @usageNotes
 * ```typescript
 * // Inyectar el servicio
 * private readonly modalService = inject(ModalService);
 * 
 * // Modal simple de confirmación
 * this.modalService.open({
 *   title: '¿Estás seguro?',
 *   content: 'Esta acción no se puede deshacer.',
 *   confirmText: 'Eliminar',
 *   cancelText: 'Cancelar',
 *   onConfirm: () => console.log('Confirmado'),
 *   onCancel: () => console.log('Cancelado'),
 * });
 * 
 * // Modal informativo (solo botón de aceptar)
 * this.modalService.open({
 *   title: 'Éxito',
 *   content: 'La operación se completó correctamente.',
 *   confirmText: 'Entendido',
 * });
 * 
 * // Cerrar programáticamente
 * this.modalService.close();
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly toastService = inject(ToastService);

  /**
   * Signal privado con la configuración del modal actual
   */
  private readonly modalState = signal<ModalConfig | null>(null);

  /**
   * Signal público (read-only) con la configuración del modal
   */
  readonly config = this.modalState.asReadonly();

  /**
   * Signal computed que indica si el modal está abierto
   */
  readonly isOpen = computed(() => this.modalState() !== null);

  /**
   * Elemento que tenía el foco antes de abrir el modal (para restaurarlo al cerrar)
   */
  private previousActiveElement?: HTMLElement;

  /**
   * Abre un modal con la configuración proporcionada.
   * 
   * @param config - Configuración del modal
   * 
   * @remarks
   * - Guarda el elemento activo actual para restaurar el foco al cerrar
   * - Previene el scroll del body
   * - Si ya hay un modal abierto, lo reemplaza
   */
  open(config: ModalConfig): void {
    // Guardar elemento activo actual
    this.previousActiveElement = document.activeElement as HTMLElement;

    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';

    // Establecer configuración con valores por defecto
    this.modalState.set({
      confirmText: 'Aceptar',
      closeOnOverlayClick: true,
      closeOnEscape: true,
      ...config,
    });
  }

  /**
   * Cierra el modal actual.
   * 
   * @remarks
   * - Restaura el scroll del body
   * - Restaura el foco al elemento que lo tenía antes de abrir el modal
   * - Limpia la configuración del modal
   */
  close(): void {
    if (!this.isOpen()) {
      return;
    }

    // Restaurar scroll del body
    document.body.style.overflow = '';

    // Limpiar configuración
    this.modalState.set(null);

    // Restaurar foco al elemento anterior (con delay para permitir animación)
    setTimeout(() => {
      this.previousActiveElement?.focus();
      this.previousActiveElement = undefined;
    }, 150);
  }

  /**
   * Ejecuta el callback de confirmación y cierra el modal.
   */
  confirm(): void {
    const config = this.modalState();
    if (config?.onConfirm) {
      config.onConfirm();
    }
    this.close();
  }

  /**
   * Ejecuta el callback de cancelación y cierra el modal.
   */
  cancel(): void {
    const config = this.modalState();
    if (config?.onCancel) {
      config.onCancel();
    }
    this.close();
  }

  /**
   * Abre un modal con código de invitación para copiar.
   * 
   * @param codigo - Código de invitación del grupo
   */
  openInviteCode(codigo: string): void {
    this.open({
      title: 'Invitar miembros',
      content: `Comparte este código con las personas que quieras invitar:\n\n${codigo}`,
      confirmText: 'Copiar código',
      cancelText: 'Cerrar',
      onConfirm: () => {
        navigator.clipboard.writeText(codigo);
        this.toastService.success('Código copiado al portapapeles');
      },
    });
  }
}
