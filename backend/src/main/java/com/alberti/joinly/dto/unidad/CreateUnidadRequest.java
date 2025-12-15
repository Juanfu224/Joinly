package com.alberti.joinly.dto.unidad;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Datos para crear una nueva unidad familiar")
public record CreateUnidadRequest(
        @NotBlank(message = "El nombre del grupo es obligatorio")
        @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
        @Schema(description = "Nombre del grupo familiar", example = "Familia García")
        String nombre,
        
        @Size(max = 500, message = "La descripción no puede exceder 500 caracteres")
        @Schema(description = "Descripción opcional del grupo", example = "Grupo familiar para compartir Netflix y Spotify")
        String descripcion
) {}
