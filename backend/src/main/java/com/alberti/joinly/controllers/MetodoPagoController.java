package com.alberti.joinly.controllers;

import com.alberti.joinly.dto.metodopago.CreateMetodoPagoRequest;
import com.alberti.joinly.dto.metodopago.MetodoPagoResponse;
import com.alberti.joinly.security.CurrentUser;
import com.alberti.joinly.security.UserPrincipal;
import com.alberti.joinly.services.MetodoPagoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión de métodos de pago de usuarios.
 * <p>
 * Proporciona endpoints para que los usuarios gestionen sus métodos de pago tokenizados,
 * cumpliendo con PCI-DSS al no almacenar ni transmitir datos completos de tarjetas.
 * <p>
 * <b>Flujo de integración:</b>
 * <ol>
 *   <li>Frontend obtiene token de pasarela (Stripe/PayPal) mediante su SDK</li>
 *   <li>Frontend envía token al backend en {@code POST /api/v1/metodos-pago}</li>
 *   <li>Backend almacena solo el token y metadatos seguros (últimos 4 dígitos, marca, etc.)</li>
 * </ol>
 *
 * @author Joinly Team
 * @version 1.0
 * @since 2025
 */
@RestController
@RequestMapping("/api/v1/metodos-pago")
@RequiredArgsConstructor
@Tag(name = "Métodos de Pago", description = "API para gestionar los métodos de pago tokenizados de los usuarios. " +
        "Cumple con PCI-DSS al almacenar únicamente tokens de pasarelas de pago.")
@SecurityRequirement(name = "bearerAuth")
public class MetodoPagoController {

    private final MetodoPagoService metodoPagoService;

    @GetMapping
    @Operation(
            summary = "Listar mis métodos de pago",
            description = "Obtiene la lista de métodos de pago activos del usuario autenticado, " +
                    "ordenados con el método predeterminado primero. Solo se exponen datos seguros " +
                    "(últimos 4 dígitos, marca, tipo).")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista de métodos de pago obtenida exitosamente",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = MetodoPagoResponse.class))))
    })
    public ResponseEntity<List<MetodoPagoResponse>> listarMisMetodos(
            @CurrentUser UserPrincipal currentUser) {

        var metodosPago = metodoPagoService.listarMetodosPorUsuario(currentUser.getId())
                .stream()
                .map(MetodoPagoResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(metodosPago);
    }

    @PostMapping
    @Operation(
            summary = "Registrar nuevo método de pago",
            description = "Registra un nuevo método de pago tokenizado para el usuario autenticado. " +
                    "El token de pasarela debe obtenerse previamente desde el frontend mediante " +
                    "la integración con Stripe/PayPal (cumpliendo PCI-DSS). NUNCA enviar datos completos " +
                    "de tarjeta al backend.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Método de pago registrado exitosamente",
                    content = @Content(schema = @Schema(implementation = MetodoPagoResponse.class))),
            @ApiResponse(
                    responseCode = "400",
                    description = "Datos de entrada inválidos",
                    content = @Content),
            @ApiResponse(
                    responseCode = "401",
                    description = "No autenticado",
                    content = @Content)
    })
    public ResponseEntity<MetodoPagoResponse> registrarMetodoPago(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateMetodoPagoRequest request) {

        var metodoPago = metodoPagoService.registrarMetodoPago(currentUser.getId(), request);
        var response = MetodoPagoResponse.fromEntity(metodoPago);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PutMapping("/{id}/predeterminado")
    @Operation(
            summary = "Marcar método como predeterminado",
            description = "Marca un método de pago específico como predeterminado para el usuario autenticado. " +
                    "Se quita automáticamente la marca de predeterminado de los demás métodos del usuario.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Método marcado como predeterminado exitosamente",
                    content = @Content(schema = @Schema(implementation = MetodoPagoResponse.class))),
            @ApiResponse(
                    responseCode = "400",
                    description = "El método no está activo",
                    content = @Content),
            @ApiResponse(
                    responseCode = "403",
                    description = "No tienes permiso para modificar este método",
                    content = @Content),
            @ApiResponse(
                    responseCode = "404",
                    description = "Método de pago no encontrado",
                    content = @Content)
    })
    public ResponseEntity<MetodoPagoResponse> marcarComoPredeterminado(
            @CurrentUser UserPrincipal currentUser,
            @Parameter(description = "ID del método de pago", required = true)
            @PathVariable Long id) {

        var metodoPago = metodoPagoService.marcarComoPredeterminado(currentUser.getId(), id);
        var response = MetodoPagoResponse.fromEntity(metodoPago);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Eliminar método de pago",
            description = "Elimina un método de pago del usuario autenticado mediante soft delete. " +
                    "El método se marca como ELIMINADO pero permanece en la base de datos para " +
                    "integridad referencial con pagos históricos.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "Método de pago eliminado exitosamente",
                    content = @Content),
            @ApiResponse(
                    responseCode = "403",
                    description = "No tienes permiso para eliminar este método",
                    content = @Content),
            @ApiResponse(
                    responseCode = "404",
                    description = "Método de pago no encontrado",
                    content = @Content)
    })
    public ResponseEntity<Void> eliminarMetodoPago(
            @CurrentUser UserPrincipal currentUser,
            @Parameter(description = "ID del método de pago a eliminar", required = true)
            @PathVariable Long id) {

        metodoPagoService.eliminarMetodoPago(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
