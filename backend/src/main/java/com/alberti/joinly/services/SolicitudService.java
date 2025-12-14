package com.alberti.joinly.services;

import com.alberti.joinly.entities.enums.*;
import com.alberti.joinly.entities.grupo.MiembroUnidad;
import com.alberti.joinly.entities.grupo.Solicitud;
import com.alberti.joinly.exceptions.*;
import com.alberti.joinly.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final UnidadFamiliarRepository unidadFamiliarRepository;
    private final SuscripcionRepository suscripcionRepository;
    private final MiembroUnidadRepository miembroUnidadRepository;
    private final PlazaRepository plazaRepository;
    private final UsuarioRepository usuarioRepository;

    public Optional<Solicitud> buscarPorId(Long id) {
        return solicitudRepository.findById(id);
    }

    public List<Solicitud> listarSolicitudesUsuario(Long idUsuario, EstadoSolicitud estado) {
        return solicitudRepository.findBySolicitanteIdAndEstado(idUsuario, estado);
    }

    public List<Solicitud> listarSolicitudesPendientesGrupo(Long idUnidad) {
        return solicitudRepository.findSolicitudesPendientesGrupo(idUnidad);
    }

    public List<Solicitud> listarSolicitudesPendientesSuscripcion(Long idSuscripcion) {
        return solicitudRepository.findSolicitudesPendientesSuscripcion(idSuscripcion);
    }

    @Transactional
    public Solicitud crearSolicitudUnionGrupo(Long idSolicitante, String codigoInvitacion, String mensaje) {
        var solicitante = usuarioRepository.findById(idSolicitante)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", idSolicitante));

        var unidad = unidadFamiliarRepository.findByCodigoInvitacion(codigoInvitacion.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Unidad familiar", "código", codigoInvitacion));

        // Validar que la unidad esté activa
        if (unidad.getEstado() != EstadoUnidadFamiliar.ACTIVO) {
            throw new BusinessException("El grupo no está activo");
        }

        // Validar que no sea ya miembro activo
        if (miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(
                idSolicitante, unidad.getId(), EstadoMiembro.ACTIVO)) {
            throw new DuplicateResourceException("Ya eres miembro de este grupo");
        }

        // Restricción: No puede existir más de 1 solicitud pendiente del mismo usuario al mismo grupo
        if (solicitudRepository.existsBySolicitanteIdAndUnidadIdAndEstado(
                idSolicitante, unidad.getId(), EstadoSolicitud.PENDIENTE)) {
            throw new DuplicateResourceException("Ya tienes una solicitud pendiente para este grupo");
        }

        // Verificar límite de miembros
        var miembrosActuales = unidadFamiliarRepository.contarMiembrosActivos(unidad.getId());
        if (miembrosActuales >= unidad.getMaxMiembros()) {
            throw new LimiteAlcanzadoException("miembros del grupo", unidad.getMaxMiembros());
        }

        var solicitud = Solicitud.builder()
                .tipoSolicitud(TipoSolicitud.UNION_GRUPO)
                .solicitante(solicitante)
                .unidad(unidad)
                .mensaje(mensaje)
                .fechaSolicitud(LocalDateTime.now())
                .estado(EstadoSolicitud.PENDIENTE)
                .build();

        return solicitudRepository.save(solicitud);
    }

    @Transactional
    public Solicitud crearSolicitudUnionSuscripcion(Long idSolicitante, Long idSuscripcion, String mensaje) {
        var solicitante = usuarioRepository.findById(idSolicitante)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", idSolicitante));

        var suscripcion = suscripcionRepository.findById(idSuscripcion)
                .orElseThrow(() -> new ResourceNotFoundException("Suscripción", "id", idSuscripcion));

        // Validar que la suscripción esté activa
        if (suscripcion.getEstado() != EstadoSuscripcion.ACTIVA) {
            throw new BusinessException("La suscripción no está activa");
        }

        // Validar que el solicitante sea miembro de la unidad familiar
        if (!miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(
                idSolicitante, suscripcion.getUnidad().getId(), EstadoMiembro.ACTIVO)) {
            throw new UnauthorizedException("Debes ser miembro del grupo para solicitar unirte a esta suscripción");
        }

        // Validar que no tenga ya una plaza en esta suscripción
        if (plazaRepository.existsBySuscripcionIdAndUsuarioId(idSuscripcion, idSolicitante)) {
            throw new DuplicateResourceException("Ya tienes una plaza en esta suscripción");
        }

        // Restricción: No puede existir más de 1 solicitud pendiente del mismo usuario a la misma suscripción
        if (solicitudRepository.existsBySolicitanteIdAndSuscripcionIdAndEstado(
                idSolicitante, idSuscripcion, EstadoSolicitud.PENDIENTE)) {
            throw new DuplicateResourceException("Ya tienes una solicitud pendiente para esta suscripción");
        }

        // Validar que haya plazas disponibles
        if (plazaRepository.contarPlazasDisponibles(idSuscripcion) == 0) {
            throw new NoPlazasDisponiblesException(idSuscripcion);
        }

        var solicitud = Solicitud.builder()
                .tipoSolicitud(TipoSolicitud.UNION_SUSCRIPCION)
                .solicitante(solicitante)
                .suscripcion(suscripcion)
                .mensaje(mensaje)
                .fechaSolicitud(LocalDateTime.now())
                .estado(EstadoSolicitud.PENDIENTE)
                .build();

        return solicitudRepository.save(solicitud);
    }

    @Transactional
    public Solicitud aprobarSolicitud(Long idSolicitud, Long idAprobador) {
        var solicitud = solicitudRepository.findByIdConSolicitante(idSolicitud)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud", "id", idSolicitud));

        if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new BusinessException("Solo se pueden aprobar solicitudes pendientes");
        }

        validarPermisoAprobacion(solicitud, idAprobador);

        solicitud.setEstado(EstadoSolicitud.APROBADA);
        solicitud.setFechaRespuesta(LocalDateTime.now());
        solicitud.setAprobador(usuarioRepository.findById(idAprobador).orElse(null));

        // Ejecutar acción según tipo de solicitud
        return switch (solicitud.getTipoSolicitud()) {
            case UNION_GRUPO -> {
                crearMiembroUnidad(solicitud);
                yield solicitudRepository.save(solicitud);
            }
            case UNION_SUSCRIPCION -> {
                asignarPlazaSuscripcion(solicitud);
                yield solicitudRepository.save(solicitud);
            }
        };
    }

    private void validarPermisoAprobacion(Solicitud solicitud, Long idAprobador) {
        switch (solicitud.getTipoSolicitud()) {
            case UNION_GRUPO -> {
                var unidad = solicitud.getUnidad();
                if (!unidad.getAdministrador().getId().equals(idAprobador)) {
                    throw new UnauthorizedException("Solo el administrador del grupo puede aprobar solicitudes");
                }
            }
            case UNION_SUSCRIPCION -> {
                var suscripcion = solicitud.getSuscripcion();
                if (!suscripcion.getAnfitrion().getId().equals(idAprobador)) {
                    throw new UnauthorizedException("Solo el anfitrión de la suscripción puede aprobar solicitudes");
                }
            }
        }
    }

    private void crearMiembroUnidad(Solicitud solicitud) {
        var unidad = solicitud.getUnidad();
        var solicitante = solicitud.getSolicitante();

        // Verificar nuevamente el límite de miembros
        var miembrosActuales = unidadFamiliarRepository.contarMiembrosActivos(unidad.getId());
        if (miembrosActuales >= unidad.getMaxMiembros()) {
            throw new LimiteAlcanzadoException("miembros del grupo", unidad.getMaxMiembros());
        }

        var miembro = MiembroUnidad.builder()
                .unidad(unidad)
                .usuario(solicitante)
                .rol(RolMiembro.MIEMBRO)
                .fechaUnion(LocalDateTime.now())
                .estado(EstadoMiembro.ACTIVO)
                .build();

        miembroUnidadRepository.save(miembro);
    }

    private void asignarPlazaSuscripcion(Solicitud solicitud) {
        var suscripcion = solicitud.getSuscripcion();
        var solicitante = solicitud.getSolicitante();

        // Buscar primera plaza disponible usando SequencedCollection (Java 21+)
        var plazasDisponibles = plazaRepository.findPlazasDisponiblesOrdenadas(suscripcion.getId());
        if (plazasDisponibles.isEmpty()) {
            throw new NoPlazasDisponiblesException(suscripcion.getId());
        }

        var plaza = plazasDisponibles.getFirst();
        plaza.setUsuario(solicitante);
        plaza.setEstado(EstadoPlaza.OCUPADA);
        plaza.setFechaOcupacion(LocalDateTime.now());

        plazaRepository.save(plaza);
    }

    @Transactional
    public Solicitud rechazarSolicitud(Long idSolicitud, Long idAprobador, String motivoRechazo) {
        var solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud", "id", idSolicitud));

        if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new BusinessException("Solo se pueden rechazar solicitudes pendientes");
        }

        validarPermisoAprobacion(solicitud, idAprobador);

        solicitud.setEstado(EstadoSolicitud.RECHAZADA);
        solicitud.setFechaRespuesta(LocalDateTime.now());
        solicitud.setMotivoRechazo(motivoRechazo);
        solicitud.setAprobador(usuarioRepository.findById(idAprobador).orElse(null));

        return solicitudRepository.save(solicitud);
    }

    @Transactional
    public Solicitud cancelarSolicitud(Long idSolicitud, Long idSolicitante) {
        var solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud", "id", idSolicitud));

        if (!solicitud.getSolicitante().getId().equals(idSolicitante)) {
            throw new UnauthorizedException("Solo puedes cancelar tus propias solicitudes");
        }

        if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new BusinessException("Solo se pueden cancelar solicitudes pendientes");
        }

        solicitud.setEstado(EstadoSolicitud.CANCELADA);
        solicitud.setFechaRespuesta(LocalDateTime.now());

        return solicitudRepository.save(solicitud);
    }

    public boolean tieneSolicitudPendienteGrupo(Long idSolicitante, Long idUnidad) {
        return solicitudRepository.existsBySolicitanteIdAndUnidadIdAndEstado(
                idSolicitante, idUnidad, EstadoSolicitud.PENDIENTE);
    }

    public boolean tieneSolicitudPendienteSuscripcion(Long idSolicitante, Long idSuscripcion) {
        return solicitudRepository.existsBySolicitanteIdAndSuscripcionIdAndEstado(
                idSolicitante, idSuscripcion, EstadoSolicitud.PENDIENTE);
    }
}
