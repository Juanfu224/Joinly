import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  IconComponent,
  CardComponent,
  BreadcrumbsComponent,
  type BreadcrumbItem,
} from '../../components/shared';

/**
 * Página Home - Landing pública de Joinly.
 *
 * Landing page responsive que implementa el diseño de Figma.
 * Muestra la propuesta de valor principal y las 3 ventajas clave.
 *
 * ### Secciones:
 * - Breadcrumbs "Inicio/"
 * - Hero: Título con gradiente + subtítulo + CTA
 * - Features: 3 tarjetas de ventajas (Grupos, Pagos, Tranquilidad)
 *
 * ### Responsive:
 * - Mobile: Layout apilado, 1 columna
 * - Tablet (768px+): 2 columnas en features
 * - Desktop (1024px+): 3 columnas en features
 *
 * @usageNotes
 * Ruta pública, no requiere autenticación.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ButtonComponent, IconComponent, CardComponent, BreadcrumbsComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  /** Migas de pan para la navegación */
  protected readonly breadcrumbs: BreadcrumbItem[] = [{ label: 'Inicio/' }];
}
