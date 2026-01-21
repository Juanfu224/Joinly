package com.alberti.joinly.dto.usuario;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para preferencias de notificaciones del usuario.
 *
 * @author Joinly Team
 * @version 1.0
 * @since 2025
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreferenciasNotificacionDTO {

    @NotNull(message = "La preferencia de solicitudes es obligatoria")
    private Boolean notifSolicitudes;

    @NotNull(message = "La preferencia de pagos es obligatoria")
    private Boolean notifPagos;

    @NotNull(message = "La preferencia de recordatorios es obligatoria")
    private Boolean notifRecordatorios;

    @NotNull(message = "La preferencia de novedades es obligatoria")
    private Boolean notifNovedades;
}
