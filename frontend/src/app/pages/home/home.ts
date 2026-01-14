import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent, IconComponent, CardComponent } from '../../components/shared';

/**
 * Página Home - Landing pública de Joinly.
 * Hero con propuesta de valor + 3 tarjetas de ventajas.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ButtonComponent, IconComponent, CardComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
