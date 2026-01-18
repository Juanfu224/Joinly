package com.alberti.joinly.dto.suscripcion;

import com.alberti.joinly.dto.usuario.UsuarioSummary;
import com.alberti.joinly.entities.enums.EstadoPago;
import com.alberti.joinly.entities.enums.EstadoSuscripcion;
import com.alberti.joinly.entities.enums.Periodicidad;
import com.alberti.joinly.entities.grupo.Solicitud;
import com.alberti.joinly.entities.suscripcion.Plaza;
import com.alberti.joinly.entities.suscripcion.Suscripcion;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Schema(description = "Información detallada completa de una suscripción con miembros y solicitudes")
public record SuscripcionDetalleResponse(
        @Schema(description = "ID único de la suscripción", example = "1")
        Long id,

        @Schema(description = "Información resumida del servicio")
        ServicioSummary servicio,

        @Schema(description = "ID de la unidad familiar", example = "1")
        Long idUnidad,

        @Schema(description = "Nombre de la unidad familiar", example = "Familia García")
        String nombreUnidad,

        @Schema(description = "Información del usuario anfitrión")
        UsuarioSummary anfitrion,

        @Schema(description = "Precio total de la suscripción", example = "15.99")
        BigDecimal precioTotal,

        @Schema(description = "Moneda del precio", example = "EUR")
        String moneda,

        @Schema(description = "Precio calculado por plaza", example = "3.99")
        BigDecimal precioPorPlaza,

        @Schema(description = "Número total de plazas", example = "4")
        Short numPlazasTotal,

        @Schema(description = "Plazas disponibles para ocupar", example = "2")
        long plazasDisponibles,

        @Schema(description = "Plazas actualmente ocupadas", example = "2")
        long plazasOcupadas,

        @Schema(description = "Indica si el anfitrión ocupa una plaza", example = "true")
        Boolean anfitrionOcupaPlaza,

        @Schema(description = "Fecha de inicio de la suscripción", example = "2025-01-01")
        String fechaInicio,

        @Schema(description = "Próxima fecha de renovación", example = "2025-02-01")
        String fechaRenovacion,

        @Schema(description = "Periodicidad del pago")
        Periodicidad periodicidad,

        @Schema(description = "Si se renueva automáticamente", example = "true")
        Boolean renovacionAutomatica,

        @Schema(description = "Estado actual de la suscripción")
        EstadoSuscripcion estado,

        @Schema(description = "Credenciales de acceso (si están disponibles para el usuario)")
        CredencialesDTO credenciales,

        @Schema(description = "Información del pago retenido")
        PagoDTO pago,

        @Schema(description = "Lista de miembros actuales de la suscripción")
        List<MiembroDTO> miembros,

        @Schema(description = "Lista de solicitudes pendientes")
        List<SolicitudDTO> solicitudes) {

    @Schema(description = "Credenciales de acceso al servicio")
    public record CredencialesDTO(
            @Schema(description = "Usuario o email de acceso")
            String usuario,

            @Schema(description = "Contraseña de acceso")
            String contrasena) {

        public static CredencialesDTO fromDesencriptadas(String usuario, String contrasena) {
            if (usuario == null && contrasena == null) {
                return null;
            }
            return new CredencialesDTO(usuario, contrasena);
        }
    }

    @Schema(description = "Información del pago retenido")
    public record PagoDTO(
            @Schema(description = "Monto retenido", example = "3.99")
            BigDecimal montoRetenido,

            @Schema(description = "Estado del pago")
            EstadoPago estado,

            @Schema(description = "Fecha de liberación del pago", example = "2025-02-01")
            String fechaLiberacion) {
    }

    @Schema(description = "Información de un miembro de la suscripción")
    public record MiembroDTO(
            @Schema(description = "ID de la plaza", example = "1")
            Long id,

            @Schema(description = "Información del usuario")
            UsuarioSummary usuario,

            @Schema(description = "Fecha de unión", example = "2025-01-15T10:30:00")
            String fechaUnion,

            @Schema(description = "Es el anfitrión de la suscripción", example = "false")
            Boolean esAnfitrion) {

        public static MiembroDTO fromPlaza(Plaza plaza) {
            return new MiembroDTO(
                    plaza.getId(),
                    UsuarioSummary.fromEntity(plaza.getUsuario()),
                    plaza.getFechaOcupacion() != null 
                            ? plaza.getFechaOcupacion().toString() 
                            : null,
                    plaza.getEsPlazaAnfitrion()
            );
        }
    }

    @Schema(description = "Información de una solicitud de unión")
    public record SolicitudDTO(
            @Schema(description = "ID de la solicitud", example = "1")
            Long id,

            @Schema(description = "Usuario que solicita unirse")
            UsuarioSummary usuario,

            @Schema(description = "Fecha de la solicitud", example = "2025-01-15T10:30:00")
            String fechaSolicitud,

            @Schema(description = "Estado de la solicitud")
            String estado) {

        public static SolicitudDTO fromEntity(Solicitud solicitud) {
            return new SolicitudDTO(
                    solicitud.getId(),
                    UsuarioSummary.fromEntity(solicitud.getSolicitante()),
                    solicitud.getFechaSolicitud().toString(),
                    solicitud.getEstado().name()
            );
        }
    }

    public static SuscripcionDetalleResponse fromEntity(
            Suscripcion suscripcion,
            long plazasDisponibles,
            long plazasOcupadas,
            String usuarioDesencriptado,
            String contrasenaDesencriptada,
            List<Plaza> plazasOcupadasList,
            List<Solicitud> solicitudes) {

        // Formatear fechas
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE;

        // Construir información de pago (simulado por ahora)
        // El estado por defecto es PENDIENTE hasta que se implemente el sistema de pagos real
        PagoDTO pago = new PagoDTO(
                suscripcion.getPrecioPorPlaza(),
                EstadoPago.PENDIENTE,
                suscripcion.getFechaRenovacion().format(formatter)
        );

        // Convertir plazas ocupadas a miembros
        List<MiembroDTO> miembros = plazasOcupadasList.stream()
                .map(MiembroDTO::fromPlaza)
                .toList();

        // Convertir solicitudes
        List<SolicitudDTO> solicitudesDTO = solicitudes.stream()
                .map(SolicitudDTO::fromEntity)
                .toList();

        return new SuscripcionDetalleResponse(
                suscripcion.getId(),
                ServicioSummary.fromEntity(suscripcion.getServicio()),
                suscripcion.getUnidad().getId(),
                suscripcion.getUnidad().getNombre(),
                UsuarioSummary.fromEntity(suscripcion.getAnfitrion()),
                suscripcion.getPrecioTotal(),
                suscripcion.getMoneda(),
                suscripcion.getPrecioPorPlaza(),
                suscripcion.getNumPlazasTotal(),
                plazasDisponibles,
                plazasOcupadas,
                suscripcion.getAnfitrionOcupaPlaza(),
                suscripcion.getFechaInicio().format(formatter),
                suscripcion.getFechaRenovacion().format(formatter),
                suscripcion.getPeriodicidad(),
                suscripcion.getRenovacionAutomatica(),
                suscripcion.getEstado(),
                CredencialesDTO.fromDesencriptadas(usuarioDesencriptado, contrasenaDesencriptada),
                pago,
                miembros,
                solicitudesDTO
        );
    }
}
