package com.alberti.joinly.controllers;

import com.alberti.joinly.dto.pago.CreatePagoRequest;
import com.alberti.joinly.dto.pago.PagoResponse;
import com.alberti.joinly.dto.pago.ReembolsoRequest;
import com.alberti.joinly.entities.enums.EstadoPago;
import com.alberti.joinly.security.CurrentUser;
import com.alberti.joinly.security.UserPrincipal;
import com.alberti.joinly.services.PagoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/pagos")
@RequiredArgsConstructor
@Tag(name = "Pagos", description = "API para gestión de pagos de suscripciones compartidas")
@SecurityRequirement(name = "bearerAuth")
public class PagoController {

    private final PagoService pagoService;

    @PostMapping
    @Operation(summary = "Procesar un nuevo pago", description = "Procesa el pago de una plaza de suscripción")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Pago procesado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
            @ApiResponse(responseCode = "404", description = "Plaza o método de pago no encontrado"),
            @ApiResponse(responseCode = "422", description = "Violación de regla de negocio")
    })
    public ResponseEntity<PagoResponse> procesarPago(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreatePagoRequest request) {

        var pago = pagoService.procesarPago(
                currentUser.getId(),
                request.idPlaza(),
                request.idMetodoPago(),
                request.monto()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(PagoResponse.fromEntity(pago));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener pago por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pago encontrado"),
            @ApiResponse(responseCode = "404", description = "Pago no encontrado")
    })
    public ResponseEntity<PagoResponse> obtenerPago(@PathVariable Long id) {
        return pagoService.buscarPorIdConDetalles(id)
                .map(pago -> ResponseEntity.ok(PagoResponse.fromEntity(pago)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/mis-pagos")
    @Operation(
            summary = "Listar mis pagos con filtros y paginación",
            description = """
                    Lista los pagos del usuario con filtros opcionales y paginación.
                    
                    **Parámetros de paginación:**
                    - page: Número de página (base 0, default: 0)
                    - size: Elementos por página (default: 20)
                    - sort: Ordenación (ej: fechaPago,desc o monto,asc)
                    
                    **Filtros disponibles:**
                    - estado: PENDIENTE, FALLIDO, RETENIDO, LIBERADO, REEMBOLSADO, REEMBOLSO_PARCIAL, DISPUTADO (opcional)
                    - fechaDesde: Fecha inicio (formato: YYYY-MM-DD)
                    - fechaHasta: Fecha fin (formato: YYYY-MM-DD)
                    
                    **Ejemplos:**
                    - `/api/v1/pagos/mis-pagos?estado=LIBERADO`
                    - `/api/v1/pagos/mis-pagos?fechaDesde=2024-01-01&fechaHasta=2024-12-31`
                    - `/api/v1/pagos/mis-pagos?estado=RETENIDO&sort=fechaPago,desc&page=0&size=50`
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Página de pagos que cumplen los criterios")
    })
    public ResponseEntity<Page<PagoResponse>> listarMisPagos(
            @CurrentUser UserPrincipal currentUser,
            @Parameter(description = "Estado del pago (opcional)") @RequestParam(required = false) EstadoPago estado,
            @Parameter(description = "Fecha inicio del rango (formato: YYYY-MM-DD)") @RequestParam(required = false) LocalDate fechaDesde,
            @Parameter(description = "Fecha fin del rango (formato: YYYY-MM-DD)") @RequestParam(required = false) LocalDate fechaHasta,
            @PageableDefault(size = 20, sort = "fechaPago") Pageable pageable) {

        var pagos = pagoService.listarPagosUsuarioConFiltros(
                currentUser.getId(), estado, fechaDesde, fechaHasta, pageable)
                .map(PagoResponse::fromEntity);

        return ResponseEntity.ok(pagos);
    }

    @GetMapping("/suscripcion/{idSuscripcion}")
    @Operation(summary = "Listar pagos de una suscripción")
    public ResponseEntity<List<PagoResponse>> listarPagosSuscripcion(
            @Parameter(description = "ID de la suscripción") @PathVariable Long idSuscripcion) {

        var pagos = pagoService.listarPagosSuscripcion(idSuscripcion)
                .stream()
                .map(PagoResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(pagos);
    }

    @PostMapping("/{id}/liberar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENTE')")
    @Operation(summary = "Liberar un pago retenido", description = "Solo para administradores o agentes")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pago liberado"),
            @ApiResponse(responseCode = "404", description = "Pago no encontrado"),
            @ApiResponse(responseCode = "422", description = "Pago no puede ser liberado (estado incorrecto o disputas activas)")
    })
    public ResponseEntity<PagoResponse> liberarPago(@PathVariable Long id) {
        var pago = pagoService.liberarPago(id);
        return ResponseEntity.ok(PagoResponse.fromEntity(pago));
    }

    @PostMapping("/reembolso")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENTE')")
    @Operation(summary = "Procesar un reembolso", description = "Reembolsa total o parcialmente un pago")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reembolso procesado"),
            @ApiResponse(responseCode = "404", description = "Pago no encontrado"),
            @ApiResponse(responseCode = "422", description = "Monto excede el disponible para reembolso")
    })
    public ResponseEntity<PagoResponse> procesarReembolso(
            @Valid @RequestBody ReembolsoRequest request) {

        var pago = pagoService.procesarReembolso(request.idPago(), request.monto(), request.motivo());
        return ResponseEntity.ok(PagoResponse.fromEntity(pago));
    }
}
