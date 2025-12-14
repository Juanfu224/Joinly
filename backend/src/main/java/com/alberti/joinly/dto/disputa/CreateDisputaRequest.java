package com.alberti.joinly.dto.disputa;

import com.alberti.joinly.entities.enums.MotivoDisputa;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO para crear una nueva disputa.
 */
public record CreateDisputaRequest(
        @NotNull(message = "El ID del pago es obligatorio")
        Long idPago,

        @NotNull(message = "El motivo es obligatorio")
        MotivoDisputa motivo,

        @NotBlank(message = "La descripción es obligatoria")
        @Size(min = 20, max = 2000, message = "La descripción debe tener entre 20 y 2000 caracteres")
        String descripcion,

        String evidenciaUrls
) {}
