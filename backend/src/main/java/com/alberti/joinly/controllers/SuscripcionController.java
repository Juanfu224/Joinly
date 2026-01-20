package com.alberti.joinly.controllers;

import com.alberti.joinly.dto.suscripcion.CreateSuscripcionRequest;
import com.alberti.joinly.dto.suscripcion.PlazaResponse;
import com.alberti.joinly.dto.suscripcion.SuscripcionDetalleResponse;
import com.alberti.joinly.dto.suscripcion.SuscripcionResponse;
import com.alberti.joinly.dto.suscripcion.SuscripcionSummary;
import com.alberti.joinly.entities.enums.EstadoSuscripcion;
import com.alberti.joinly.repositories.CredencialRepository;
import com.alberti.joinly.repositories.SolicitudRepository;
import com.alberti.joinly.security.CurrentUser;
import com.alberti.joinly.security.UserPrincipal;
import com.alberti.joinly.services.CredencialService;
import com.alberti.joinly.services.SuscripcionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
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
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/suscripciones")
@RequiredArgsConstructor
@Tag(name = "Suscripciones", description = "API para gestionar suscripciones compartidas (Netflix, Spotify, etc.) " +
        "dentro de grupos familiares. Incluye gestión de plazas y estados.")
@SecurityRequirement(name = "bearerAuth")
public class SuscripcionController {

    private final SuscripcionService suscripcionService;
    private final CredencialRepository credencialRepository;
    private final SolicitudRepository solicitudRepository;
    private final CredencialService credencialService;

    @PostMapping
    @Operation(
            summary = "Crear suscripción compartida",
            description = """
                    Crea una nueva suscripción dentro de un grupo familiar. El anfitrión debe ser miembro activo del grupo.
                    Se crean automáticamente todas las plazas, asignando la primera al anfitrión si se indica.
                    
                    **Identificación del servicio:**
                    - `idServicio`: ID de un servicio existente en el catálogo
                    - `nombreServicio`: Nombre del servicio (se buscará o creará automáticamente)
                    
                    Al menos uno de los dos campos debe estar presente. Si se proporciona `nombreServicio` y no existe
                    en el catálogo, se creará un nuevo servicio con categoría "OTRO".
                    """)
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Suscripción creada con todas sus plazas",
                    content = @Content(schema = @Schema(implementation = SuscripcionResponse.class))),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos o falta identificador de servicio",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Unidad, servicio o usuario no encontrado",
                    content = @Content),
            @ApiResponse(responseCode = "422", description = "El anfitrión no es miembro del grupo o se alcanzó límite de suscripciones (20)",
                    content = @Content)
    })
    public ResponseEntity<SuscripcionResponse> crearSuscripcion(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateSuscripcionRequest request) {

        // Validar que al menos uno de los identificadores del servicio esté presente
        if (!request.tieneServicioValido()) {
            throw new IllegalArgumentException("Debe proporcionar idServicio o nombreServicio");
        }

        // Crear suscripción usando idServicio o nombreServicio
        var suscripcion = request.idServicio() != null
                ? suscripcionService.crearSuscripcion(
                        request.idUnidad(),
                        currentUser.getId(),
                        request.idServicio(),
                        request.precioTotal(),
                        request.numPlazasTotal(),
                        request.fechaInicio(),
                        request.periodicidad(),
                        request.anfitrionOcupaPlaza(),
                        request.credencialUsuario(),
                        request.credencialPassword())
                : suscripcionService.crearSuscripcionPorNombre(
                        request.idUnidad(),
                        currentUser.getId(),
                        request.nombreServicio(),
                        request.precioTotal(),
                        request.numPlazasTotal(),
                        request.fechaInicio(),
                        request.periodicidad(),
                        request.anfitrionOcupaPlaza(),
                        request.credencialUsuario(),
                        request.credencialPassword());

        var plazasDisponibles = suscripcionService.contarPlazasDisponibles(suscripcion.getId());
        var plazasOcupadas = suscripcionService.contarPlazasOcupadas(suscripcion.getId());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(SuscripcionResponse.fromEntity(suscripcion, plazasDisponibles, plazasOcupadas));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle completo de suscripción por ID",
            description = "Devuelve toda la información de la suscripción incluyendo miembros, solicitudes y credenciales (solo para miembros)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Suscripción encontrada"),
            @ApiResponse(responseCode = "404", description = "Suscripción no encontrada")
    })
    public ResponseEntity<SuscripcionDetalleResponse> getSuscripcion(
            @Parameter(description = "ID de la suscripción") @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {

        var suscripcion = suscripcionService.buscarPorIdConPlazas(id)
                .orElseThrow(() -> new IllegalArgumentException("Suscripción no encontrada con ID: " + id));

        // Obtener datos adicionales
        var plazasDisponibles = suscripcionService.contarPlazasDisponibles(id);
        var plazasOcupadas = suscripcionService.contarPlazasOcupadas(id);
        var plazasOcupadasList = suscripcionService.listarPlazasOcupadasDeSuscripcion(id);
        
        // Verificar si el usuario actual es miembro de la suscripción
        boolean esMiembro = plazasOcupadasList.stream()
                .anyMatch(plaza -> plaza.getUsuario() != null && 
                         plaza.getUsuario().getId().equals(currentUser.getId()));
        
        String usuarioDesencriptado = null;
        String contrasenaDesencriptada = null;
        
        // Solo mostrar credenciales si es miembro de la suscripción
        if (esMiembro) {
            var credenciales = credencialRepository.findCredencialesVisiblesPorSuscripcion(id);
            
            for (var cred : credenciales) {
                String valorDesencriptado = credencialService.desencriptarValor(cred);
                if (cred.getTipo().name().equals("USUARIO")) {
                    usuarioDesencriptado = valorDesencriptado;
                } else if (cred.getTipo().name().equals("PASSWORD")) {
                    contrasenaDesencriptada = valorDesencriptado;
                }
            }
        }
        
        // Obtener solicitudes pendientes (solo si es anfitrión)
        var solicitudes = suscripcion.getAnfitrion().getId().equals(currentUser.getId())
                ? solicitudRepository.findSolicitudesPendientesSuscripcion(id)
                : java.util.List.<com.alberti.joinly.entities.grupo.Solicitud>of();

        return ResponseEntity.ok(SuscripcionDetalleResponse.fromEntity(
                suscripcion, 
                plazasDisponibles, 
                plazasOcupadas, 
                usuarioDesencriptado,
                contrasenaDesencriptada,
                plazasOcupadasList,
                solicitudes,
                esMiembro
        ));
    }

    @GetMapping("/unidad/{idUnidad}")
    @Operation(
            summary = "Listar suscripciones de unidad con filtros",
            description = """
                    Lista las suscripciones de una unidad familiar con filtros opcionales y paginación.
                    
                    **Parámetros de paginación:**
                    - page: Número de página (base 0, default: 0)
                    - size: Elementos por página (default: 10)
                    - sort: Ordenación (ej: fechaInicio,desc o estado,asc)
                    
                    **Filtros disponibles:**
                    - estado: ACTIVA, PAUSADA, CANCELADA, FINALIZADA
                    - fechaDesde: Fecha inicio (formato: YYYY-MM-DD)
                    - fechaHasta: Fecha fin (formato: YYYY-MM-DD)
                    
                    **Ejemplos:**
                    - `/api/v1/suscripciones/unidad/1?estado=ACTIVA`
                    - `/api/v1/suscripciones/unidad/1?fechaDesde=2024-01-01&fechaHasta=2024-12-31`
                    - `/api/v1/suscripciones/unidad/1?estado=ACTIVA&sort=fechaInicio,desc&page=0&size=20`
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Página de suscripciones que cumplen los criterios")
    })
    public ResponseEntity<Page<SuscripcionSummary>> listarSuscripcionesDeUnidad(
            @Parameter(description = "ID de la unidad familiar") @PathVariable Long idUnidad,
            @Parameter(description = "Estado de la suscripción (opcional)") @RequestParam(required = false) EstadoSuscripcion estado,
            @Parameter(description = "Fecha inicio del rango (formato: YYYY-MM-DD)") @RequestParam(required = false) LocalDate fechaDesde,
            @Parameter(description = "Fecha fin del rango (formato: YYYY-MM-DD)") @RequestParam(required = false) LocalDate fechaHasta,
            @PageableDefault(size = 10, sort = "fechaInicio") Pageable pageable) {

        var suscripciones = suscripcionService.listarSuscripcionesDeUnidadConFiltros(
                idUnidad, estado, fechaDesde, fechaHasta, pageable)
                .map(s -> SuscripcionSummary.fromEntity(s, suscripcionService.contarPlazasOcupadas(s.getId())));

        return ResponseEntity.ok(suscripciones);
    }

    @GetMapping("/anfitrion")
    @Operation(summary = "Listar mis suscripciones como anfitrión")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de suscripciones")
    })
    public ResponseEntity<List<SuscripcionSummary>> listarMisSuscripcionesComoAnfitrion(
            @CurrentUser UserPrincipal currentUser) {

        var suscripciones = suscripcionService.listarSuscripcionesDeAnfitrion(currentUser.getId())
                .stream()
                .map(s -> SuscripcionSummary.fromEntity(s, suscripcionService.contarPlazasOcupadas(s.getId())))
                .toList();

        return ResponseEntity.ok(suscripciones);
    }

    @GetMapping("/{idSuscripcion}/plazas/disponibles")
    @Operation(summary = "Listar plazas disponibles")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de plazas disponibles")
    })
    public ResponseEntity<List<PlazaResponse>> listarPlazasDisponibles(
            @Parameter(description = "ID de la suscripción") @PathVariable Long idSuscripcion) {

        var plazas = suscripcionService.listarPlazasDisponibles(idSuscripcion)
                .stream()
                .map(PlazaResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(plazas);
    }

    @GetMapping("/mis-plazas")
    @Operation(summary = "Listar mis plazas ocupadas")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de plazas ocupadas")
    })
    public ResponseEntity<List<PlazaResponse>> listarMisPlazas(
            @CurrentUser UserPrincipal currentUser) {

        var plazas = suscripcionService.listarPlazasOcupadasPorUsuario(currentUser.getId())
                .stream()
                .map(PlazaResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(plazas);
    }

    @PostMapping("/{idSuscripcion}/ocupar-plaza")
    @Operation(summary = "Ocupar plaza")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Plaza ocupada exitosamente"),
            @ApiResponse(responseCode = "400", description = "No hay plazas disponibles o usuario ya tiene plaza"),
            @ApiResponse(responseCode = "404", description = "Suscripción o usuario no encontrado"),
            @ApiResponse(responseCode = "422", description = "Usuario no es miembro del grupo")
    })
    public ResponseEntity<PlazaResponse> ocuparPlaza(
            @Parameter(description = "ID de la suscripción") @PathVariable Long idSuscripcion,
            @CurrentUser UserPrincipal currentUser) {

        var plaza = suscripcionService.ocuparPlaza(idSuscripcion, currentUser.getId());
        return ResponseEntity.ok(PlazaResponse.fromEntity(plaza));
    }

    @DeleteMapping("/plazas/{idPlaza}")
    @Operation(
            summary = "Liberar plaza",
            description = "Libera una plaza ocupada, dejándola disponible para otros usuarios. " +
                    "El propietario puede liberar su plaza, y el anfitrión puede liberar cualquier plaza excepto la suya propia si es plaza de anfitrión.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Plaza liberada exitosamente"),
            @ApiResponse(responseCode = "400", description = "El anfitrión no puede liberar su plaza reservada (esPlazaAnfitrion=true)",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "No tienes permiso para liberar esta plaza",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Plaza no encontrada",
                    content = @Content)
    })
    public ResponseEntity<Void> liberarPlaza(
            @Parameter(description = "ID de la plaza") @PathVariable Long idPlaza,
            @CurrentUser UserPrincipal currentUser) {

        suscripcionService.liberarPlaza(idPlaza, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/pausar")
    @Operation(summary = "Pausar suscripción")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Suscripción pausada exitosamente"),
            @ApiResponse(responseCode = "403", description = "Solo el anfitrión puede pausar"),
            @ApiResponse(responseCode = "404", description = "Suscripción no encontrada")
    })
    public ResponseEntity<Void> pausarSuscripcion(
            @Parameter(description = "ID de la suscripción") @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {

        suscripcionService.pausarSuscripcion(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reactivar")
    @Operation(summary = "Reactivar suscripción")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Suscripción reactivada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Solo se pueden reactivar suscripciones pausadas"),
            @ApiResponse(responseCode = "403", description = "Solo el anfitrión puede reactivar"),
            @ApiResponse(responseCode = "404", description = "Suscripción no encontrada")
    })
    public ResponseEntity<Void> reactivarSuscripcion(
            @Parameter(description = "ID de la suscripción") @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {

        suscripcionService.reactivarSuscripcion(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/cancelar")
    @Operation(summary = "Cancelar suscripción")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Suscripción cancelada exitosamente"),
            @ApiResponse(responseCode = "403", description = "Solo el anfitrión puede cancelar"),
            @ApiResponse(responseCode = "404", description = "Suscripción no encontrada")
    })
    public ResponseEntity<Void> cancelarSuscripcion(
            @Parameter(description = "ID de la suscripción") @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {

        suscripcionService.cancelarSuscripcion(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{idSuscripcion}/tiene-plaza")
    @Operation(summary = "Verificar si tiene plaza")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resultado de la verificación")
    })
    public ResponseEntity<Boolean> tienePlaza(
            @Parameter(description = "ID de la suscripción") @PathVariable Long idSuscripcion,
            @CurrentUser UserPrincipal currentUser) {

        var tienePlaza = suscripcionService.usuarioTienePlazaEnSuscripcion(idSuscripcion, currentUser.getId());
        return ResponseEntity.ok(tienePlaza);
    }
}
