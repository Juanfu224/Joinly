package com.alberti.joinly.controllers;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.alberti.joinly.dto.faq.RespuestaPregunta;
import com.alberti.joinly.entities.enums.CategoriaFaq;
import com.alberti.joinly.services.PreguntaService;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/api/v1/preguntas")
@RequiredArgsConstructor
public class PreguntaController {
    private final PreguntaService preguntaService;

    @GetMapping()
    public ResponseEntity<Map<String, List<RespuestaPregunta>>> listar() {
        Map<String, List<RespuestaPregunta>> preguntas = preguntaService.obtenerTodas().stream()
                .map(RespuestaPregunta::fromEntity)
                .collect(Collectors.groupingBy(RespuestaPregunta::categoria));
        return ResponseEntity.ok(preguntas);
    }

    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<RespuestaPregunta>> listarPorCategoria(
            @PathVariable String categoria) {
        List<RespuestaPregunta> preguntas = preguntaService.obtenerPorCategoria(CategoriaFaq.valueOf(categoria))
                .stream()
                .map(RespuestaPregunta::fromEntity)
                .toList();
        return ResponseEntity.ok(preguntas);
    }

    @GetMapping("/buscar")
    @Operation(summary = "Buscar FAQs por término")
    public ResponseEntity<List<RespuestaPregunta>> buscar(
            @RequestParam String q) {
        var faqs = preguntaService.buscar(q).stream()
                .map(RespuestaPregunta::fromEntity)
                .toList();
        return ResponseEntity.ok(faqs);
    }
    

}