package com.alberti.joinly.dto.faq;

import com.alberti.joinly.entities.enums.CategoriaFaq;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CrearPregunta(
        @NotBlank @Size(max = 300) String pregunta,
        @NotBlank String respuesta,
        @NotNull CategoriaFaq categoria,
        Integer orden) {
    public CrearPregunta {
        if (orden == null) {
            orden = 0;
        }
    }
}
