package com.alberti.joinly.dto.faq;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CrearPregunta(
        @NotBlank String pregunta,
        @NotBlank String respuesta,
        @NotNull String categoria,
        Integer orden) {
    public CrearPregunta {
        if (orden == null) {
            orden = 0;
        }
    }
}
