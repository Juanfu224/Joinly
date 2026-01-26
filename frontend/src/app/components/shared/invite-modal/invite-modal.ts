import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  viewChild,
} from '@angular/core';
import { ButtonComponent, IconComponent } from '../index';
import { ModalService } from '../../../services/modal';
import { ToastService } from '../../../services/toast';
import { FormatCodigoPipe } from './format-codigo.pipe';

type SocialNetwork = 'email' | 'whatsapp' | 'discord' | 'instagram' | 'twitter' | 'facebook';

/**
 * Modal de invitación para compartir código de grupo.
 *
 * @usageNotes
 * ```typescript
 * modalService.openInviteModal('ABC123456789');
 * ```
 */
@Component({
  selector: 'app-invite-modal',
  standalone: true,
  imports: [ButtonComponent, IconComponent, FormatCodigoPipe],
  templateUrl: './invite-modal.html',
  styleUrls: ['./invite-modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteModalComponent implements OnDestroy {
  protected readonly modalService = inject(ModalService);
  private readonly toastService = inject(ToastService);
  protected readonly modalContent = viewChild<ElementRef>('modalContent');

  protected readonly socialNetworks: SocialNetwork[] = [
    'email',
    'whatsapp',
    'discord',
    'instagram',
    'twitter',
    'facebook',
  ];

  protected readonly enlaceUnion = computed(() => {
    const codigo = this.modalService.inviteConfig()?.codigo;
    return codigo ? `${window.location.origin}/unirse-grupo?codigo=${codigo}` : '';
  });

  protected readonly enlaceCorto = computed(() => {
    const codigo = this.modalService.inviteConfig()?.codigo;
    return codigo ? `${window.location.host}/join/${codigo}` : '';
  });

  constructor() {
    effect(() => {
      if (this.modalService.isInviteOpen()) {
        setTimeout(() => {
          const modalEl = this.modalContent()?.nativeElement;
          (modalEl as HTMLElement | undefined)?.querySelector<HTMLElement>('button')?.focus();
        }, 100);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.modalService.isInviteOpen()) {
      document.body.style.overflow = '';
    }
  }

  @HostListener('document:keydown.escape')
  protected handleEscapeKey(): void {
    if (this.modalService.isInviteOpen()) {
      this.modalService.closeInviteModal();
    }
  }

  @HostListener('keydown', ['$event'])
  protected handleTabKey(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !this.modalService.isInviteOpen()) return;

    const modalEl = this.modalContent()?.nativeElement as HTMLElement | undefined;
    if (!modalEl) return;

    const focusables = modalEl.querySelectorAll(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ) as NodeListOf<HTMLElement>;

    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  protected handleOverlayClick(): void {
    this.modalService.closeInviteModal();
  }

  protected preventClose(event: Event): void {
    event.stopPropagation();
  }

  protected async copiarCodigo(): Promise<void> {
    const codigo = this.modalService.inviteConfig()?.codigo;
    if (!codigo) return;

    try {
      await navigator.clipboard.writeText(codigo);
      this.toastService.success('Código copiado al portapapeles');
    } catch {
      this.toastService.error('No se pudo copiar el código');
    }
  }

  protected async copiarEnlace(): Promise<void> {
    const enlace = this.enlaceUnion();
    if (!enlace) return;

    try {
      await navigator.clipboard.writeText(enlace);
      this.toastService.success('Enlace copiado al portapapeles');
    } catch {
      this.toastService.error('No se pudo copiar el enlace');
    }
  }

  protected async compartir(red: SocialNetwork): Promise<void> {
    const codigo = this.modalService.inviteConfig()?.codigo;
    if (!codigo) return;

    const texto = `¡Únete a mi grupo familiar en Joinly! Código: ${codigo}`;
    const enlace = this.enlaceUnion();

    // Web Share API para móviles
    if (navigator.share && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
      try {
        await navigator.share({ title: 'Únete a Joinly', text: texto, url: enlace });
        return;
      } catch {
        /* Usuario canceló */
      }
    }

    // Fallback: URLs específicas
    const urls: Record<SocialNetwork, string | null> = {
      email: `mailto:?subject=${encodeURIComponent('Únete a Joinly')}&body=${encodeURIComponent(texto)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(texto)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(enlace)}`,
      discord: null,
      instagram: null,
    };

    const url = urls[red];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
    } else {
      this.toastService.info(`Copia el enlace y compártelo en ${red}`);
      await this.copiarEnlace();
    }
  }
}
