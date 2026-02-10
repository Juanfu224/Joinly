package com.alberti.joinly.controllers;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import com.alberti.joinly.dto.faq.CrearPregunta;
import com.alberti.joinly.dto.faq.RespuestaPregunta;
import com.alberti.joinly.entities.enums.CategoriaFaq;
import com.alberti.joinly.services.PreguntaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/v1/preguntas")
@RequiredArgsConstructor
public class PreguntaController {
        private final PreguntaService preguntaService;

        @GetMapping
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

        @PostMapping
        @PreAuthorize("hasRole('ADMIN')")
        @SecurityRequirement(name = "bearerAuth")
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "Pregunta creada exitosamente"),
                        @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
                        @ApiResponse(responseCode = "403", description = "Acceso denegado – se requiere rol ADMIN")
        })
        public ResponseEntity<RespuestaPregunta> crear(@Valid @RequestBody CrearPregunta nuevaPregunta) {
                RespuestaPregunta preguntaCreada = RespuestaPregunta.fromEntity(
                                preguntaService.crear(nuevaPregunta));
                return ResponseEntity.status(HttpStatus.CREATED).body(preguntaCreada);
        }

        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        @SecurityRequirement(name = "bearerAuth")
        @ApiResponses({
                        @ApiResponse(responseCode = "204", description = "Pregunta desactivada exitosamente"),
                        @ApiResponse(responseCode = "404", description = "Pregunta no encontrada"),
                        @ApiResponse(responseCode = "403", description = "Acceso denegado – se requiere rol ADMIN")
        })
        public ResponseEntity<Void> eliminar(@PathVariable Long id) {
                preguntaService.eliminar(id);
                return ResponseEntity.noContent().build();
        }

}