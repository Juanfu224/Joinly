package com.alberti.joinly.dto.servicio;

import com.alberti.joinly.entities.enums.CategoriaServicio;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

@Schema(description = "Datos para crear un nuevo servicio en el catálogo (solo administradores)")
public record CreateServicioRequest(
        @NotBlank(message = "El nombre del servicio es obligatorio")
        @Size(max = 100, message = "El nombre no puede exceder los 100 caracteres")
        @Schema(description = "Nombre del servicio de streaming", example = "Netflix Premium")
        String nombre,

        @NotNull(message = "La categoría es obligatoria")
        @Schema(description = "Categoría del servicio", example = "STREAMING_VIDEO")
        CategoriaServicio categoria,

        @Size(max = 500, message = "La URL del logo no puede exceder los 500 caracteres")
        @Schema(description = "URL del logo del servicio", example = "https://example.com/netflix-logo.png")
        String logo,

        @Size(max = 5000, message = "La descripción no puede exceder los 5000 caracteres")
        @Schema(description = "Descripción del servicio", example = "Plataforma de streaming con películas y series en 4K")
        String descripcion,

        @Size(max = 500, message = "La URL oficial no puede exceder los 500 caracteres")
        @Schema(description = "URL oficial del servicio", example = "https://www.netflix.com")
        String urlOficial,

        @NotNull(message = "El número máximo de usuarios es obligatorio")
        @Min(value = 1, message = "El máximo de usuarios debe ser al menos 1")
        @Max(value = 255, message = "El máximo de usuarios no puede exceder 255")
        @Schema(description = "Número máximo de usuarios simultáneos permitidos", example = "4")
        Short maxUsuarios,

        @DecimalMin(value = "0.00", message = "El precio de referencia no puede ser negativo")
        @Digits(integer = 8, fraction = 2, message = "El precio debe tener máximo 8 dígitos enteros y 2 decimales")
        @Schema(description = "Precio de referencia mensual", example = "15.99")
        BigDecimal precioReferencia,

        @Size(min = 3, max = 3, message = "La moneda debe tener exactamente 3 caracteres (ISO 4217)")
        @Schema(description = "Código de moneda ISO 4217", example = "EUR")
        String monedaReferencia
) {
    public CreateServicioRequest {
        if (monedaReferencia == null || monedaReferencia.isBlank()) {
            monedaReferencia = "EUR";
        }
    }
}
