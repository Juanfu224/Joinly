import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent, ButtonComponent, FeatureImageComponent } from '../../components/shared';

/**
 * Página "Cómo funciona" - Explica el funcionamiento de Joinly.
 *
 * @usageNotes
 * Ruta: /como-funciona
 */
@Component({
  selector: 'app-como-funciona',
  standalone: true,
  imports: [RouterLink, IconComponent, ButtonComponent, FeatureImageComponent],
  templateUrl: './como-funciona.html',
  styleUrl: './como-funciona.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComoFuncionaComponent {}
