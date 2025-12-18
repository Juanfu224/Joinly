import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LogoComponent } from '../../components/shared';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, LogoComponent],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  protected readonly anioActual = new Date().getFullYear();
}
