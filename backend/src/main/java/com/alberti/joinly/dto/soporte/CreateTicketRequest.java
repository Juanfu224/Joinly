package com.alberti.joinly.dto.soporte;

import com.alberti.joinly.entities.enums.CategoriaTicket;
import com.alberti.joinly.entities.enums.PrioridadTicket;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO para crear un nuevo ticket de soporte.
 */
public record CreateTicketRequest(
        @NotBlank(message = "El asunto es obligatorio")
        @Size(max = 200, message = "El asunto no puede exceder 200 caracteres")
        String asunto,

        @NotBlank(message = "La descripción es obligatoria")
        @Size(min = 10, max = 5000, message = "La descripción debe tener entre 10 y 5000 caracteres")
        String descripcion,

        @NotNull(message = "La categoría es obligatoria")
        CategoriaTicket categoria,

        PrioridadTicket prioridad,

        Long idSuscripcion,

        Long idPago,

        Long idDisputa
) {}
