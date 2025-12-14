package com.alberti.joinly.controllers;

import com.alberti.joinly.dto.credencial.CredencialRequest;
import com.alberti.joinly.dto.credencial.CredencialResponse;
import com.alberti.joinly.services.CredencialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/suscripciones/{idSuscripcion}/credenciales")
@RequiredArgsConstructor
@Tag(name = "Credenciales", description = "API para gestión de credenciales de suscripciones (encriptadas)")
public class CredencialController {

    private final CredencialService credencialService;

    @GetMapping
    @Operation(summary = "Listar credenciales visibles", 
               description = "Retorna las credenciales visibles para usuarios con plaza ocupada")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de credenciales"),
            @ApiResponse(responseCode = "403", description = "No tienes plaza ocupada en esta suscripción")
    })
    public ResponseEntity<List<CredencialResponse>> listarCredenciales(
            @PathVariable Long idSuscripcion,
            @Parameter(description = "ID del usuario") @RequestHeader("X-User-Id") Long idUsuario) {

        var credenciales = credencialService.obtenerCredencialesParaUsuario(idSuscripcion, idUsuario)
                .stream()
                .map(c -> CredencialResponse.fromEntity(c, credencialService.desencriptarValor(c)))
                .toList();

        return ResponseEntity.ok(credenciales);
    }

    @GetMapping("/todas")
    @Operation(summary = "Listar todas las credenciales", 
               description = "Solo para el anfitrión - incluye credenciales ocultas")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista completa de credenciales"),
            @ApiResponse(responseCode = "403", description = "Solo el anfitrión puede ver todas las credenciales")
    })
    public ResponseEntity<List<CredencialResponse>> listarTodasCredenciales(
            @PathVariable Long idSuscripcion,
            @Parameter(description = "ID del anfitrión") @RequestHeader("X-User-Id") Long idAnfitrion) {

        var credenciales = credencialService.obtenerTodasCredenciales(idSuscripcion, idAnfitrion)
                .stream()
                .map(c -> CredencialResponse.fromEntity(c, credencialService.desencriptarValor(c)))
                .toList();

        return ResponseEntity.ok(credenciales);
    }

    @PostMapping
    @Operation(summary = "Crear credencial", description = "Solo el anfitrión puede crear credenciales")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Credencial creada"),
            @ApiResponse(responseCode = "403", description = "Solo el anfitrión puede crear credenciales"),
            @ApiResponse(responseCode = "422", description = "Ya existe una credencial con esa etiqueta")
    })
    public ResponseEntity<CredencialResponse> crearCredencial(
            @PathVariable Long idSuscripcion,
            @Parameter(description = "ID del anfitrión") @RequestHeader("X-User-Id") Long idAnfitrion,
            @Valid @RequestBody CredencialRequest request) {

        var credencial = credencialService.crearCredencial(idSuscripcion, idAnfitrion, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CredencialResponse.fromEntity(credencial, request.valor()));
    }

    @PutMapping("/{idCredencial}")
    @Operation(summary = "Actualizar credencial", description = "Actualiza y guarda el valor anterior en historial")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Credencial actualizada"),
            @ApiResponse(responseCode = "403", description = "Solo el anfitrión puede modificar credenciales"),
            @ApiResponse(responseCode = "404", description = "Credencial no encontrada")
    })
    public ResponseEntity<CredencialResponse> actualizarCredencial(
            @PathVariable Long idSuscripcion,
            @PathVariable Long idCredencial,
            @Parameter(description = "ID del anfitrión") @RequestHeader("X-User-Id") Long idAnfitrion,
            @Valid @RequestBody CredencialRequest request,
            HttpServletRequest httpRequest) {

        var ip = httpRequest.getRemoteAddr();
        var credencial = credencialService.actualizarCredencial(idCredencial, idAnfitrion, request, ip);

        return ResponseEntity.ok(CredencialResponse.fromEntity(credencial, request.valor()));
    }

    @DeleteMapping("/{idCredencial}")
    @Operation(summary = "Eliminar credencial")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Credencial eliminada"),
            @ApiResponse(responseCode = "403", description = "Solo el anfitrión puede eliminar credenciales"),
            @ApiResponse(responseCode = "404", description = "Credencial no encontrada")
    })
    public ResponseEntity<Void> eliminarCredencial(
            @PathVariable Long idSuscripcion,
            @PathVariable Long idCredencial,
            @Parameter(description = "ID del anfitrión") @RequestHeader("X-User-Id") Long idAnfitrion) {

        credencialService.eliminarCredencial(idCredencial, idAnfitrion);
        return ResponseEntity.noContent().build();
    }
}
