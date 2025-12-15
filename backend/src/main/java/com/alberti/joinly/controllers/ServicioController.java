package com.alberti.joinly.controllers;

import com.alberti.joinly.dto.servicio.CreateServicioRequest;
import com.alberti.joinly.dto.servicio.ServicioResponse;
import com.alberti.joinly.dto.servicio.UpdateServicioRequest;
import com.alberti.joinly.entities.enums.CategoriaServicio;
import com.alberti.joinly.services.ServicioService;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión del catálogo de servicios de suscripción.
 * <p>
 * Proporciona endpoints para operaciones CRUD sobre el catálogo de servicios
 * (Netflix, Spotify, etc.) que los usuarios pueden compartir.
 * <p>
 * <b>Permisos:</b>
 * <ul>
 *   <li>Lectura (GET): Público para todos los usuarios</li>
 *   <li>Escritura (POST/PUT/DELETE): Solo administradores</li>
 * </ul>
 *
 * @author Joinly Team
 * @version 1.0
 * @since 2025
 */
@RestController
@RequestMapping("/api/v1/servicios")
@RequiredArgsConstructor
@Tag(name = "Servicios", description = "API para gestionar el catálogo de servicios de suscripción disponibles " +
        "(Netflix, Spotify, etc.). Endpoints de lectura públicos, escritura restringida a administradores.")
public class ServicioController {

    private final ServicioService servicioService;

    @GetMapping
    @Operation(
            summary = "Listar todos los servicios activos",
            description = "Obtiene la lista completa de servicios de suscripción disponibles en el catálogo. " +
                    "Este endpoint es público y muestra solo servicios activos.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista de servicios obtenida exitosamente",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = ServicioResponse.class))))
    })
    public ResponseEntity<List<ServicioResponse>> listarServicios() {
        var servicios = servicioService.listarServiciosActivos()
                .stream()
                .map(ServicioResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(servicios);
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Obtener servicio por ID",
            description = "Obtiene los detalles completos de un servicio específico del catálogo.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Servicio encontrado",
                    content = @Content(schema = @Schema(implementation = ServicioResponse.class))),
            @ApiResponse(
                    responseCode = "404",
                    description = "Servicio no encontrado",
                    content = @Content)
    })
    public ResponseEntity<ServicioResponse> obtenerServicio(
            @Parameter(description = "ID del servicio", required = true)
            @PathVariable Long id) {

        var servicio = servicioService.buscarPorId(id);
        return ResponseEntity.ok(ServicioResponse.fromEntity(servicio));
    }

    @GetMapping("/categoria/{categoria}")
    @Operation(
            summary = "Filtrar servicios por categoría",
            description = "Obtiene la lista de servicios activos filtrados por categoría " +
                    "(streaming, musica, vpn, gaming, software, almacenamiento, productividad, otro).")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista de servicios filtrados obtenida exitosamente",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = ServicioResponse.class)))),
            @ApiResponse(
                    responseCode = "400",
                    description = "Categoría inválida",
                    content = @Content)
    })
    public ResponseEntity<List<ServicioResponse>> listarPorCategoria(
            @Parameter(description = "Categoría del servicio", required = true,
                    schema = @Schema(implementation = CategoriaServicio.class))
            @PathVariable CategoriaServicio categoria) {

        var servicios = servicioService.listarPorCategoria(categoria)
                .stream()
                .map(ServicioResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(servicios);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
            summary = "Crear nuevo servicio (solo admin)",
            description = "Crea un nuevo servicio en el catálogo. Requiere permisos de administrador. " +
                    "El nombre del servicio debe ser único en el sistema.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Servicio creado exitosamente",
                    content = @Content(schema = @Schema(implementation = ServicioResponse.class))),
            @ApiResponse(
                    responseCode = "400",
                    description = "Datos de entrada inválidos",
                    content = @Content),
            @ApiResponse(
                    responseCode = "403",
                    description = "No tiene permisos de administrador",
                    content = @Content),
            @ApiResponse(
                    responseCode = "422",
                    description = "Ya existe un servicio con el mismo nombre",
                    content = @Content)
    })
    public ResponseEntity<ServicioResponse> crearServicio(
            @Valid @RequestBody CreateServicioRequest request) {

        var servicio = servicioService.crearServicio(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ServicioResponse.fromEntity(servicio));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
            summary = "Actualizar servicio (solo admin)",
            description = "Actualiza los datos de un servicio existente. Requiere permisos de administrador. " +
                    "Solo se actualizan los campos proporcionados (actualizacion parcial).")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Servicio actualizado exitosamente",
                    content = @Content(schema = @Schema(implementation = ServicioResponse.class))),
            @ApiResponse(
                    responseCode = "400",
                    description = "Datos de entrada inválidos",
                    content = @Content),
            @ApiResponse(
                    responseCode = "403",
                    description = "No tiene permisos de administrador",
                    content = @Content),
            @ApiResponse(
                    responseCode = "404",
                    description = "Servicio no encontrado",
                    content = @Content),
            @ApiResponse(
                    responseCode = "422",
                    description = "El nombre ya existe en otro servicio",
                    content = @Content)
    })
    public ResponseEntity<ServicioResponse> actualizarServicio(
            @Parameter(description = "ID del servicio", required = true)
            @PathVariable Long id,
            @Valid @RequestBody UpdateServicioRequest request) {

        var servicio = servicioService.actualizarServicio(id, request);
        return ResponseEntity.ok(ServicioResponse.fromEntity(servicio));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
            summary = "Eliminar servicio (solo admin)",
            description = "Marca un servicio como inactivo (soft delete). Requiere permisos de administrador. " +
                    "No se elimina físicamente para mantener integridad referencial con suscripciones existentes.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "Servicio marcado como inactivo exitosamente"),
            @ApiResponse(
                    responseCode = "403",
                    description = "No tiene permisos de administrador",
                    content = @Content),
            @ApiResponse(
                    responseCode = "404",
                    description = "Servicio no encontrado",
                    content = @Content)
    })
    public ResponseEntity<Void> eliminarServicio(
            @Parameter(description = "ID del servicio", required = true)
            @PathVariable Long id) {

        servicioService.eliminarServicio(id);
        return ResponseEntity.noContent().build();
    }
}
