package com.alberti.joinly.dto.suscripcion;

import com.alberti.joinly.entities.enums.Periodicidad;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateSuscripcionRequest(
        @NotNull(message = "El ID de la unidad familiar es obligatorio")
        Long idUnidad,
        
        @NotNull(message = "El ID del servicio es obligatorio")
        Long idServicio,
        
        @NotNull(message = "El precio total es obligatorio")
        @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
        @Digits(integer = 8, fraction = 2, message = "El precio debe tener máximo 8 dígitos enteros y 2 decimales")
        BigDecimal precioTotal,
        
        @NotNull(message = "El número de plazas es obligatorio")
        @Min(value = 1, message = "Debe haber al menos 1 plaza")
        @Max(value = 20, message = "No puede haber más de 20 plazas")
        Short numPlazasTotal,
        
        @NotNull(message = "La fecha de inicio es obligatoria")
        @FutureOrPresent(message = "La fecha de inicio no puede ser pasada")
        LocalDate fechaInicio,
        
        @NotNull(message = "La periodicidad es obligatoria")
        Periodicidad periodicidad,
        
        Boolean anfitrionOcupaPlaza
) {
    public CreateSuscripcionRequest {
        if (anfitrionOcupaPlaza == null) {
            anfitrionOcupaPlaza = true;
        }
    }
}
