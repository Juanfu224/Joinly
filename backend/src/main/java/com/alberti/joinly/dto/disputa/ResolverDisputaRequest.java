package com.alberti.joinly.dto.disputa;

import com.alberti.joinly.entities.enums.ResolucionDisputa;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * DTO para resolver una disputa.
 */
public record ResolverDisputaRequest(
        @NotNull(message = "La resolución es obligatoria")
        ResolucionDisputa resolucion,

        @PositiveOrZero(message = "El monto debe ser cero o positivo")
        BigDecimal montoResuelto,

        @Size(max = 2000, message = "Las notas no pueden exceder 2000 caracteres")
        String notasResolucion
) {}
