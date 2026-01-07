import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent, IconComponent } from '../../components/shared';

/**
 * Página Home - Landing pública de Joinly.
 *
 * Landing page responsive que explica el valor de la plataforma
 * antes del registro. Usa Mobile-First y Container Queries donde aplica.
 *
 * ### Secciones:
 * - Hero: Propuesta de valor principal + CTA
 * - Features: 3 beneficios clave con iconos
 * - How It Works: 3 pasos simples
 * - CTA Final: Llamada a acción secundaria
 *
 * ### Responsive:
 * - Mobile (320-767px): Layout apilado, padding reducido
 * - Tablet (768-1023px): Features en 2 columnas
 * - Desktop (1024px+): Features en 3 columnas, hero con 2 columnas
 *
 * @usageNotes
 * Ruta pública, no requiere autenticación.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ButtonComponent, IconComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
