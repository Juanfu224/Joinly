package com.alberti.joinly.dto.unidad;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateUnidadRequest(
        @NotBlank(message = "El nombre del grupo es obligatorio")
        @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
        String nombre,
        
        @Size(max = 500, message = "La descripción no puede exceder 500 caracteres")
        String descripcion
) {}
