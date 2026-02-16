import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { BreadcrumbsComponent } from '../../components/shared/breadcrumbs/breadcrumbs';
import { CardComponent } from '../../components/shared/card/card';
import { IconComponent } from '../../components/shared/icon/icon';

@Component({
  selector: 'app-accesibilidad',
  standalone: true,
  imports: [BreadcrumbsComponent, CardComponent, IconComponent],
  templateUrl: './accesibilidad.html',
  styleUrl: './accesibilidad.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccesibilidadComponent {
  readonly fechaEvaluacion = '15 de febrero de 2026';
  readonly nivelConformidad = 'WCAG 2.1 nivel AA';
  readonly ultimaRevision = '15 de febrero de 2026';

  constructor() {
    const title = document.querySelector('title');
    if (title) {
      title.textContent = 'Declaración de Accesibilidad - Joinly';
    }
  }
}
