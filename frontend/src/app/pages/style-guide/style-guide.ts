import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  CardComponent,
  ButtonComponent,
  AlertComponent,
  AvatarComponent,
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
import { HeaderComponent } from '../../layout/header/header';
import { FooterComponent } from '../../layout/footer/footer';

/**
 * Componente Style Guide - Guía visual del sistema de diseño.
 *
 * Muestra todos los componentes reutilizables de la aplicación con sus variantes,
 * sirviendo como documentación visual y herramienta de testing.
 *
 * @see /style-guide - Ruta de acceso al componente
 */
@Component({
  selector: 'app-style-guide',
  standalone: true,
  imports: [
    CardComponent,
    ButtonComponent,
    AlertComponent,
    AvatarComponent,
    FormInputComponent,
    FormTextareaComponent,
    FormSelectComponent,
    FormCheckboxComponent,
    FormRadioGroupComponent,
    BreadcrumbsComponent
  ],
  templateUrl: './style-guide.html',
  styleUrl: './style-guide.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StyleGuideComponent {
  /** Opciones de ejemplo para el componente Select */
  readonly selectOptions: SelectOption[] = [
    { value: 'netflix', label: 'Netflix' },
    { value: 'spotify', label: 'Spotify' },
    { value: 'hbo', label: 'HBO Max' },
    { value: 'disney', label: 'Disney+', disabled: true },
  ];

  /** Opciones de ejemplo para el componente Radio Group */
  readonly radioOptions: RadioOption[] = [
    { value: 'mensual', label: 'Mensual' },
    { value: 'trimestral', label: 'Trimestral' },
    { value: 'anual', label: 'Anual' },
  ];

  /** Opciones inline para Radio Group */
  readonly radioOptionsInline: RadioOption[] = [
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
  ];

  /** Items de ejemplo para Breadcrumbs */
  readonly breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Inicio', url: '/' },
    { label: 'Grupos', url: '/grupos' },
    { label: 'Familia López' },
  ];

  /** Signals para demostrar estados de alertas */
  readonly showAlertSuccess = signal(true);
  readonly showAlertError = signal(true);
  readonly showAlertWarning = signal(true);
  readonly showAlertInfo = signal(true);

  /** Métodos para cerrar alertas */
  closeAlert(type: 'success' | 'error' | 'warning' | 'info'): void {
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

  /** Resetea todas las alertas */
  resetAlerts(): void {
    this.showAlertSuccess.set(true);
    this.showAlertError.set(true);
    this.showAlertWarning.set(true);
    this.showAlertInfo.set(true);
  }
}
