import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  CardComponent,
  GroupCardComponent,
  EmptyGroupsComponent,
  IconComponent,
} from '../../components/shared';
import type { GrupoCardData } from '../../models';
import { GruposStore } from '../../stores';
import { type DashboardData, type ResolvedData } from '../../resolvers';
import { AuthService, ToastService, ModalService } from '../../services';

/**
 * Dashboard - Vista principal de grupos del usuario autenticado.
 * Datos precargados via dashboardResolver y gestionados por GruposStore.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CardComponent,
    GroupCardComponent,
    EmptyGroupsComponent,
    IconComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly modalService = inject(ModalService);
  private readonly router = inject(Router);
  private readonly gruposStore = inject(GruposStore);

  protected readonly grupos = this.gruposStore.cards;
  protected readonly gruposFiltrados = this.gruposStore.cardsFiltradas;
  protected readonly isLoading = this.gruposStore.loading;
  protected readonly error = this.gruposStore.error;
  protected readonly currentUser = this.authService.currentUser;
  protected readonly searchTerm = this.gruposStore.searchTerm;

  protected readonly searchControl = new FormControl('');
  protected readonly hasSearchTerm = computed(() => this.searchTerm().length > 0);
  protected readonly noResults = computed(
    () => this.gruposFiltrados().length === 0 && this.hasSearchTerm(),
  );

  private searchSubscription = this.searchControl.valueChanges
    .pipe(debounceTime(300), distinctUntilChanged())
    .subscribe((term) => {
      const searchTerm = term ?? '';
      this.gruposStore.setSearchTerm(searchTerm);
      localStorage.setItem('dashboard-search-term', searchTerm);
    });

  ngOnInit(): void {
    const resolved = this.route.snapshot.data['dashboardData'] as ResolvedData<DashboardData>;

    const savedSearch = localStorage.getItem('dashboard-search-term');
    if (savedSearch) {
      this.searchControl.setValue(savedSearch);
      this.gruposStore.setSearchTerm(savedSearch);
    }

    if (resolved.error) {
      this.toastService.error(resolved.error);
    } else if (resolved.data && resolved.data.grupos.length > 0) {
      this.gruposStore.loadCards(0, 50);
    } else {
      this.gruposStore.loadCards(0, 50);
    }
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }

  /** Recarga grupos desde el store */
  protected recargarGrupos(): Promise<void> {
    return this.gruposStore.refreshCards();
  }

  /**
   * Navega a la página de crear grupo.
   */
  protected onCreateGroup(): void {
    this.router.navigate(['/crear-grupo']);
  }

  /**
   * Navega a la página de unirse a grupo.
   */
  protected onJoinGroup(): void {
    this.router.navigate(['/unirse-grupo']);
  }

  /**
   * Maneja el evento de invitar miembros a un grupo.
   * Obtiene el grupo desde el store y abre el modal.
   */
  protected onGroupInvite(groupId: number): void {
    const grupo = this.gruposStore.getGrupoById(groupId);
    if (grupo?.codigoInvitacion) {
      this.modalService.openInviteModal(grupo.codigoInvitacion);
    } else {
      this.toastService.error('No se pudo obtener el código de invitación');
    }
  }

  /**
   * Navega al detalle del grupo con state para UX optimizada.
   * Pasa datos en state para mostrar instantáneamente mientras carga la API.
   */
  protected onGroupClick(groupId: number, groupData?: GrupoCardData): void {
    this.router.navigate(['/grupos', groupId], {
      state: { grupoPreview: groupData },
    });
  }
}
