package com.alberti.joinly.controllers;

import com.alberti.joinly.dto.disputa.CreateDisputaRequest;
import com.alberti.joinly.dto.disputa.DisputaResponse;
import com.alberti.joinly.dto.disputa.ResolverDisputaRequest;
import com.alberti.joinly.security.CurrentUser;
import com.alberti.joinly.security.UserPrincipal;
import com.alberti.joinly.services.DisputaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/disputas")
@RequiredArgsConstructor
@Tag(name = "Disputas", description = "API para gestión de disputas sobre pagos")
@SecurityRequirement(name = "bearerAuth")
public class DisputaController {

    private final DisputaService disputaService;

    @PostMapping
    @Operation(summary = "Abrir una disputa", description = "Crea una nueva disputa sobre un pago")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Disputa creada"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
            @ApiResponse(responseCode = "404", description = "Pago no encontrado"),
            @ApiResponse(responseCode = "403", description = "No tienes permiso para disputar este pago"),
            @ApiResponse(responseCode = "422", description = "Ya existe disputa activa o pago ya liberado")
    })
    public ResponseEntity<DisputaResponse> abrirDisputa(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateDisputaRequest request) {

        var disputa = disputaService.abrirDisputa(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(DisputaResponse.fromEntity(disputa));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener disputa por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Disputa encontrada"),
            @ApiResponse(responseCode = "404", description = "Disputa no encontrada")
    })
    public ResponseEntity<DisputaResponse> obtenerDisputa(@PathVariable Long id) {
        return disputaService.buscarPorIdConDetalles(id)
                .map(disputa -> ResponseEntity.ok(DisputaResponse.fromEntity(disputa)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/mis-disputas")
    @Operation(summary = "Listar mis disputas")
    public ResponseEntity<Page<DisputaResponse>> listarMisDisputas(
            @CurrentUser UserPrincipal currentUser,
            @PageableDefault(size = 20, sort = "fechaApertura") Pageable pageable) {

        var disputas = disputaService.listarDisputasUsuario(currentUser.getId(), pageable)
                .map(DisputaResponse::fromEntity);

        return ResponseEntity.ok(disputas);
    }

    @GetMapping("/pendientes")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENTE')")
    @Operation(summary = "Listar disputas pendientes", description = "Solo para agentes de soporte")
    public ResponseEntity<List<DisputaResponse>> listarDisputasPendientes() {
        var disputas = disputaService.listarDisputasPendientes()
                .stream()
                .map(DisputaResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(disputas);
    }

    @GetMapping("/asignadas")
    @PreAuthorize("hasRole('AGENTE')")
    @Operation(summary = "Listar mis disputas asignadas", description = "Solo para agentes de soporte")
    public ResponseEntity<List<DisputaResponse>> listarMisDisputasAsignadas(
            @CurrentUser UserPrincipal currentUser) {

        var disputas = disputaService.listarDisputasAsignadas(currentUser.getId())
                .stream()
                .map(DisputaResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(disputas);
    }

    @PostMapping("/{id}/asignar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENTE')")
    @Operation(summary = "Asignar agente a disputa")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Agente asignado"),
            @ApiResponse(responseCode = "404", description = "Disputa o agente no encontrado"),
            @ApiResponse(responseCode = "422", description = "El usuario no es agente de soporte")
    })
    public ResponseEntity<DisputaResponse> asignarAgente(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {

        var disputa = disputaService.asignarAgente(id, currentUser.getId());
        return ResponseEntity.ok(DisputaResponse.fromEntity(disputa));
    }

    @PostMapping("/{id}/resolver")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENTE')")
    @Operation(summary = "Resolver una disputa", description = "Resuelve la disputa aplicando reembolsos si corresponde")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Disputa resuelta"),
            @ApiResponse(responseCode = "404", description = "Disputa no encontrada"),
            @ApiResponse(responseCode = "403", description = "Solo agentes pueden resolver disputas"),
            @ApiResponse(responseCode = "422", description = "La disputa ya está resuelta")
    })
    public ResponseEntity<DisputaResponse> resolverDisputa(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody ResolverDisputaRequest request) {

        var disputa = disputaService.resolverDisputa(id, currentUser.getId(), request);
        return ResponseEntity.ok(DisputaResponse.fromEntity(disputa));
    }
}
