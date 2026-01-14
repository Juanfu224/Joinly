import { ChangeDetectionStrategy, Component, effect, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, ViewportScroller } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { IconComponent, ButtonComponent } from '../../components/shared';

interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

interface FaqCategory {
  readonly title: string;
  readonly icon: string;
  readonly fragmentId: string;
  readonly items: FaqItem[];
}

/**
 * Página FAQ con navegación por fragments.
 *
 * Soporta deep linking a secciones: `/faq#suscripciones`, `/faq#primeros-pasos`
 *
 * @example
 * ```typescript
 * this.router.navigate(['/faq'], { fragment: 'suscripciones' });
 * ```
 */
@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [RouterLink, IconComponent, ButtonComponent],
  templateUrl: './faq.html',
  styleUrl: './faq.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly categories: FaqCategory[] = [
    {
      title: 'Primeros pasos',
      icon: 'user',
      fragmentId: 'primeros-pasos',
      items: [
        {
          question: '¿Cómo creo una cuenta en Joinly?',
          answer: 'Haz clic en "Registrarse" en la página principal, introduce tu nombre, email y contraseña. Recibirás un email de confirmación para activar tu cuenta.',
        },
        {
          question: '¿Es gratis usar Joinly?',
          answer: 'Sí, crear una cuenta y gestionar grupos es completamente gratis. Solo cobramos una pequeña comisión cuando se realizan pagos entre miembros.',
        },
        {
          question: '¿Cómo creo un grupo familiar?',
          answer: 'Una vez registrado, ve a tu dashboard y haz clic en "Crear grupo". Asigna un nombre al grupo y se generará automáticamente un código de invitación de 12 dígitos.',
        },
      ],
    },
    {
      title: 'Suscripciones',
      icon: 'credit-card',
      fragmentId: 'suscripciones',
      items: [
        {
          question: '¿Qué servicios puedo compartir?',
          answer: 'Puedes compartir cualquier suscripción que permita múltiples usuarios: Netflix, Spotify Family, HBO Max, Disney+, YouTube Premium, NordVPN Family, y muchos más.',
        },
        {
          question: '¿Cómo añado una suscripción compartida?',
          answer: 'Dentro de tu grupo, haz clic en "Nueva suscripción". Indica el nombre del servicio, precio total, número de plazas y fecha de renovación.',
        },
        {
          question: '¿Cómo se calculan los pagos?',
          answer: 'El precio total se divide automáticamente entre el número de plazas. Cada miembro paga su parte proporcional.',
        },
      ],
    },
    {
      title: 'Pagos y seguridad',
      icon: 'password',
      fragmentId: 'pagos-seguridad',
      items: [
        {
          question: '¿Cómo funcionan los pagos?',
          answer: 'Los pagos de cada miembro quedan retenidos de forma segura hasta que finaliza el período de suscripción. Al concluir, se liberan al anfitrión.',
        },
        {
          question: '¿Es seguro compartir credenciales?',
          answer: 'Las credenciales se almacenan de forma encriptada y solo son visibles para los miembros aprobados de la suscripción. Nunca compartimos esta información con terceros.',
        },
        {
          question: '¿Qué pasa si un miembro no paga?',
          answer: 'El sistema de pagos retenidos garantiza que el anfitrión recibe el pago antes de compartir el acceso. Si hay impagos, el anfitrión puede revocar el acceso.',
        },
      ],
    },
  ];

  protected readonly openItems = signal<Set<string>>(new Set());

  constructor() {
    // Reaccionar a cambios en el fragment para hacer scroll
    effect(() => {
      const fragment = this.route.snapshot.fragment;
      if (fragment && isPlatformBrowser(this.platformId)) {
        // Timeout para asegurar que DOM está renderizado
        setTimeout(() => this.handleFragmentNavigation(fragment), 100);
      }
    });
  }

  private handleFragmentNavigation(fragment: string): void {
    const category = this.categories.find((c) => c.fragmentId === fragment);
    if (!category) return;

    // Expandir todas las preguntas de la categoría
    this.openItems.update((items) => {
      const newItems = new Set(items);
      category.items.forEach((_, i) => newItems.add(`${category.title}-${i}`));
      return newItems;
    });

    this.viewportScroller.scrollToAnchor(fragment);
  }

  protected navigateToSection(fragmentId: string): void {
    this.router.navigate([], { fragment: fragmentId, replaceUrl: true });
  }

  protected toggleItem(categoryTitle: string, itemIndex: number): void {
    this.openItems.update((items) => {
      const newItems = new Set(items);
      const key = `${categoryTitle}-${itemIndex}`;
      newItems.has(key) ? newItems.delete(key) : newItems.add(key);
      return newItems;
    });
  }

  protected isOpen(categoryTitle: string, itemIndex: number): boolean {
    return this.openItems().has(`${categoryTitle}-${itemIndex}`);
  }
}
