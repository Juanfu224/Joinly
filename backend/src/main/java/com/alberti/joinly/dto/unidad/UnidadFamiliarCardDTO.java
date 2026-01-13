package com.alberti.joinly.dto.unidad;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO optimizado para tarjetas de grupo en el dashboard.
 * <p>
 * Contiene solo los datos necesarios para mostrar una tarjeta de grupo:
 * nombre, conteo de miembros activos y suscripciones activas.
 * <p>
 * Este DTO se construye directamente en la query JPQL usando proyección,
 * evitando el problema N+1 y mejorando el rendimiento.
 *
 * @param id                 ID único del grupo
 * @param nombre             Nombre del grupo familiar
 * @param totalMiembros      Número de miembros activos
 * @param totalSuscripciones Número de suscripciones activas
 */
@Schema(description = "Datos resumidos de un grupo para mostrar en tarjetas del dashboard")
public record UnidadFamiliarCardDTO(
        @Schema(description = "ID único del grupo", example = "1")
        Long id,

        @Schema(description = "Nombre del grupo familiar", example = "Familia García")
        String nombre,

        @Schema(description = "Número de miembros activos en el grupo", example = "4")
        Integer totalMiembros,

        @Schema(description = "Número de suscripciones activas en el grupo", example = "3")
        Integer totalSuscripciones
) {
}
