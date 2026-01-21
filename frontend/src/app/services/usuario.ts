import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import type {
  UpdatePerfilRequest,
  CambiarContrasenaRequest,
  PreferenciasNotificacion,
  User,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly api = inject(ApiService);

  actualizarPerfil(id: number, data: UpdatePerfilRequest): Observable<User> {
    return this.api.put<User>(`usuarios/${id}`, data);
  }

  cambiarContrasena(data: CambiarContrasenaRequest): Observable<void> {
    return this.api.post<void>('auth/cambiar-contrasena', data);
  }

  obtenerPreferenciasNotificacion(id: number): Observable<PreferenciasNotificacion> {
    return this.api.get<PreferenciasNotificacion>(`usuarios/${id}/preferencias-notificaciones`);
  }

  actualizarPreferenciasNotificacion(
    id: number,
    preferencias: PreferenciasNotificacion
  ): Observable<PreferenciasNotificacion> {
    return this.api.put<PreferenciasNotificacion>(
      `usuarios/${id}/preferencias-notificaciones`,
      preferencias
    );
  }

  desactivarCuenta(id: number): Observable<void> {
    return this.api.delete<void>(`usuarios/${id}`);
  }
}
