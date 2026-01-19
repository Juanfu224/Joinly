package com.alberti.joinly.services;

import com.alberti.joinly.entities.enums.*;
import com.alberti.joinly.entities.grupo.MiembroUnidad;
import com.alberti.joinly.entities.grupo.Solicitud;
import com.alberti.joinly.exceptions.*;
import com.alberti.joinly.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Servicio de gestión de solicitudes de unión a grupos y suscripciones.
 * <p>
 * Este servicio implementa todas las reglas de negocio relacionadas con:
 * <ul>
 *   <li>Solicitudes de unión a grupos familiares</li>
 *   <li>Solicitudes de plaza en suscripciones</li>
 *   <li>Aprobación y rechazo de solicitudes</li>
 * </ul>
 * <p>
 * <b>Reglas de negocio críticas:</b>
 * <ul>
 *   <li>Un usuario NO puede enviar solicitud si ya tiene una pendiente al mismo destino</li>
 *   <li>Un usuario NO puede solicitar si ya es miembro/tiene plaza</li>
 *   <li>Se valida que no se alcance max_miembros antes de aprobar</li>
 *   <li>Solo el Administrador del grupo o Anfitrión de la suscripción puede aprobar/rechazar</li>
 * </ul>
 *
 * @author Joinly Team
 * @version 1.0
 * @since 2025
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final UnidadFamiliarRepository unidadFamiliarRepository;
    private final SuscripcionRepository suscripcionRepository;
    private final MiembroUnidadRepository miembroUnidadRepository;
    private final PlazaRepository plazaRepository;
    private final UsuarioRepository usuarioRepository;

    /**
     * Busca una solicitud por su ID.
     *
     * @param id ID de la solicitud
     * @return Optional con la solicitud si existe
     */
    public Optional<Solicitud> buscarPorId(Long id) {
        return solicitudRepository.findById(id);
    }

    /**
     * Lista las solicitudes de un usuario filtradas por estado.
     *
     * @param idUsuario ID del usuario solicitante
     * @param estado    Estado de las solicitudes a buscar
     * @return Lista de solicitudes del usuario con el estado especificado
     */
    public List<Solicitud> listarSolicitudesUsuario(Long idUsuario, EstadoSolicitud estado) {
        return solicitudRepository.findBySolicitanteIdAndEstado(idUsuario, estado);
    }

    /**
     * Lista las solicitudes de un usuario filtradas por estado con paginación.
     *
     * @param idUsuario ID del usuario solicitante
     * @param estado    Estado de las solicitudes a buscar
     * @param pageable  Información de paginación y ordenamiento
     * @return Página de solicitudes del usuario con el estado especificado
     */
    public Page<Solicitud> listarSolicitudesUsuarioPaginado(Long idUsuario, EstadoSolicitud estado, Pageable pageable) {
        return solicitudRepository.findBySolicitanteIdAndEstado(idUsuario, estado, pageable);
    }
    /**
     * Lista las solicitudes de un usuario con filtros opcionales.
     *
     * @param idUsuario ID del usuario solicitante
     * @param estado Estado de la solicitud (opcional)
     * @param fechaDesde Fecha inicio del rango (opcional)
     * @param fechaHasta Fecha fin del rango (opcional)
     * @param pageable Información de paginación y ordenamiento
     * @return Página de solicitudes que cumplen los criterios
     */
    public Page<Solicitud> listarSolicitudesUsuarioConFiltros(
            Long idUsuario,
            EstadoSolicitud estado,
            LocalDate fechaDesde,
            LocalDate fechaHasta,
            Pageable pageable) {
        return solicitudRepository.findBySolicitanteIdWithFilters(idUsuario, estado, fechaDesde, fechaHasta, pageable);
    }
    /**
     * Lista las solicitudes pendientes de un grupo familiar.
     *
     * @param idUnidad ID de la unidad familiar
     * @param idUsuario ID del usuario que solicita la lista (debe ser admin del grupo)
     * @return Lista de solicitudes pendientes ordenadas por fecha
     */
    public List<Solicitud> listarSolicitudesPendientesGrupo(Long idUnidad, Long idUsuario) {
        // Verificar que el usuario es administrador del grupo
        var unidad = unidadFamiliarRepository.findWithAdministradorById(idUnidad)
                .orElseThrow(() -> new ResourceNotFoundException("Unidad familiar", "id", idUnidad));
        
        if (!unidad.getAdministrador().getId().equals(idUsuario)) {
            throw new UnauthorizedException("Solo el administrador puede ver las solicitudes pendientes del grupo");
        }
        
        return solicitudRepository.findSolicitudesPendientesGrupo(idUnidad);
    }

    /**
     * Lista las solicitudes pendientes de una suscripción.
     *
     * @param idSuscripcion ID de la suscripción
     * @return Lista de solicitudes pendientes ordenadas por fecha
     */
    public List<Solicitud> listarSolicitudesPendientesSuscripcion(Long idSuscripcion) {
        return solicitudRepository.findSolicitudesPendientesSuscripcion(idSuscripcion);
    }

    /**
     * Crea una solicitud de unión a un grupo familiar mediante código de invitación.
     * <p>
     * <b>Reglas de negocio validadas:</b>
     * <ul>
     *   <li>El grupo debe estar en estado ACTIVO</li>
     *   <li>El solicitante no puede ser ya miembro activo del grupo</li>
     *   <li>No puede existir otra solicitud PENDIENTE del mismo usuario al mismo grupo</li>
     *   <li>El grupo no puede haber alcanzado su límite máximo de miembros</li>
     * </ul>
     *
     * @param idSolicitante    ID del usuario que realiza la solicitud
     * @param codigoInvitacion Código de invitación de 12 caracteres (case-insensitive)
     * @param mensaje          Mensaje opcional para el administrador del grupo
     * @return La solicitud creada con estado PENDIENTE
     * @throws ResourceNotFoundException si el usuario o grupo no existe
     * @throws BusinessException si el grupo no está activo
     * @throws DuplicateResourceException si ya es miembro o tiene solicitud pendiente
     * @throws LimiteAlcanzadoException si el grupo está lleno
     */
    @Transactional
    public Solicitud crearSolicitudUnionGrupo(Long idSolicitante, String codigoInvitacion, String mensaje) {
        log.info("Creando solicitud de unión a grupo: usuario={}, codigo={}", idSolicitante, codigoInvitacion);

        var solicitante = usuarioRepository.findById(idSolicitante)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", idSolicitante));

        var unidad = unidadFamiliarRepository.findByCodigoInvitacion(codigoInvitacion.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Unidad familiar", "código", codigoInvitacion));

        // REGLA: La unidad debe estar activa
        if (unidad.getEstado() != EstadoUnidadFamiliar.ACTIVO) {
            throw new BusinessException("El grupo no está activo y no acepta nuevas solicitudes");
        }

        // REGLA: El solicitante NO puede ser ya miembro activo
        if (miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(
                idSolicitante, unidad.getId(), EstadoMiembro.ACTIVO)) {
            throw new DuplicateResourceException("Ya eres miembro activo de este grupo");
        }

        // REGLA: No puede existir más de 1 solicitud pendiente del mismo usuario al mismo grupo
        if (solicitudRepository.existsBySolicitanteIdAndUnidadIdAndEstado(
                idSolicitante, unidad.getId(), EstadoSolicitud.PENDIENTE)) {
            throw new DuplicateResourceException("Ya tienes una solicitud pendiente para este grupo");
        }

        // REGLA: Verificar límite de miembros (pre-validación)
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

        var solicitudGuardada = solicitudRepository.save(solicitud);
        log.info("Solicitud de unión a grupo creada: id={}, usuario={}, grupo={}",
                solicitudGuardada.getId(), idSolicitante, unidad.getId());

        // Recargar la solicitud con todas las relaciones para evitar LazyInitializationException
        return solicitudRepository.findByIdCompleto(solicitudGuardada.getId())
                .orElse(solicitudGuardada);
    }

    /**
     * Crea una solicitud para ocupar una plaza en una suscripción compartida.
     * <p>
     * <b>Reglas de negocio validadas:</b>
     * <ul>
     *   <li>La suscripción debe estar en estado ACTIVA</li>
     *   <li>El solicitante debe ser miembro activo del grupo que posee la suscripción</li>
     *   <li>El solicitante no puede tener ya una plaza en esta suscripción</li>
     *   <li>No puede existir otra solicitud PENDIENTE del mismo usuario a la misma suscripción</li>
     *   <li>Debe haber al menos una plaza disponible</li>
     * </ul>
     *
     * @param idSolicitante  ID del usuario que realiza la solicitud
     * @param idSuscripcion  ID de la suscripción a la que desea unirse
     * @param mensaje        Mensaje opcional para el anfitrión de la suscripción
     * @return La solicitud creada con estado PENDIENTE
     * @throws ResourceNotFoundException si el usuario o suscripción no existe
     * @throws BusinessException si la suscripción no está activa
     * @throws UnauthorizedException si el usuario no es miembro del grupo
     * @throws DuplicateResourceException si ya tiene plaza o solicitud pendiente
     * @throws NoPlazasDisponiblesException si no hay plazas libres
     */
    @Transactional
    public Solicitud crearSolicitudUnionSuscripcion(Long idSolicitante, Long idSuscripcion, String mensaje) {
        log.info("Creando solicitud de plaza: usuario={}, suscripcion={}", idSolicitante, idSuscripcion);

        var solicitante = usuarioRepository.findById(idSolicitante)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", idSolicitante));

        var suscripcion = suscripcionRepository.findById(idSuscripcion)
                .orElseThrow(() -> new ResourceNotFoundException("Suscripción", "id", idSuscripcion));

        // REGLA: La suscripción debe estar activa
        if (suscripcion.getEstado() != EstadoSuscripcion.ACTIVA) {
            throw new BusinessException("La suscripción no está activa y no acepta nuevas solicitudes");
        }

        // REGLA: El solicitante debe ser miembro activo de la unidad familiar
        if (!miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(
                idSolicitante, suscripcion.getUnidad().getId(), EstadoMiembro.ACTIVO)) {
            throw new UnauthorizedException("Debes ser miembro del grupo para solicitar unirte a esta suscripción");
        }

        // REGLA: El solicitante NO puede tener ya una plaza en esta suscripción
        if (plazaRepository.existsBySuscripcionIdAndUsuarioId(idSuscripcion, idSolicitante)) {
            throw new DuplicateResourceException("Ya tienes una plaza en esta suscripción");
        }

        // REGLA: No puede existir más de 1 solicitud pendiente del mismo usuario a la misma suscripción
        if (solicitudRepository.existsBySolicitanteIdAndSuscripcionIdAndEstado(
                idSolicitante, idSuscripcion, EstadoSolicitud.PENDIENTE)) {
            throw new DuplicateResourceException("Ya tienes una solicitud pendiente para esta suscripción");
        }

        // REGLA: Debe haber plazas disponibles (pre-validación)
        var plazasDisponibles = plazaRepository.contarPlazasDisponibles(idSuscripcion);
        if (plazasDisponibles == 0) {
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

        var solicitudGuardada = solicitudRepository.save(solicitud);
        log.info("Solicitud de plaza creada: id={}, usuario={}, suscripcion={}",
                solicitudGuardada.getId(), idSolicitante, idSuscripcion);

        // Recargar la solicitud con todas las relaciones para evitar LazyInitializationException
        return solicitudRepository.findByIdCompleto(solicitudGuardada.getId())
                .orElse(solicitudGuardada);
    }

    /**
     * Aprueba una solicitud pendiente y ejecuta la acción correspondiente según el tipo.
     * <p>
     * Comportamiento según tipo de solicitud:
     * <ul>
     *   <li><b>UNION_GRUPO</b>: Crea un nuevo {@link MiembroUnidad} con rol MIEMBRO</li>
     *   <li><b>UNION_SUSCRIPCION</b>: Asigna la primera plaza disponible al solicitante</li>
     * </ul>
     * <p>
     * El aprobador debe ser:
     * <ul>
     *   <li>Para solicitudes de grupo: el administrador del grupo</li>
     *   <li>Para solicitudes de suscripción: el anfitrión de la suscripción</li>
     * </ul>
     *
     * @param idSolicitud ID de la solicitud a aprobar
     * @param idAprobador ID del usuario que aprueba (admin del grupo o anfitrión)
     * @return La solicitud actualizada con estado APROBADA
     * @throws ResourceNotFoundException si la solicitud no existe
     * @throws BusinessException si la solicitud no está en estado PENDIENTE
     * @throws UnauthorizedException si el aprobador no tiene permisos
     * @throws LimiteAlcanzadoException si se alcanzó el límite de miembros/plazas
     * @throws NoPlazasDisponiblesException si no hay plazas disponibles (para suscripciones)
     */
    @Transactional
    public Solicitud aprobarSolicitud(Long idSolicitud, Long idAprobador) {
        log.info("Aprobando solicitud: id={}, aprobador={}", idSolicitud, idAprobador);

        var solicitud = solicitudRepository.findByIdCompleto(idSolicitud)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud", "id", idSolicitud));

        if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new BusinessException("Solo se pueden aprobar solicitudes pendientes. Estado actual: " + solicitud.getEstado());
        }

        validarPermisoAprobacion(solicitud, idAprobador);

        solicitud.setEstado(EstadoSolicitud.APROBADA);
        solicitud.setFechaRespuesta(LocalDateTime.now());
        solicitud.setAprobador(usuarioRepository.findById(idAprobador).orElse(null));

        // Ejecutar acción según tipo de solicitud
        var solicitudGuardada = switch (solicitud.getTipoSolicitud()) {
            case UNION_GRUPO -> {
                crearMiembroUnidad(solicitud);
                yield solicitudRepository.save(solicitud);
            }
            case UNION_SUSCRIPCION -> {
                asignarPlazaSuscripcion(solicitud);
                yield solicitudRepository.save(solicitud);
            }
        };

        log.info("Solicitud aprobada exitosamente: id={}, tipo={}, solicitante={}",
                idSolicitud, solicitud.getTipoSolicitud(), solicitud.getSolicitante().getId());

        return solicitudGuardada;
    }

    /**
     * Valida que el usuario tenga permiso para aprobar/rechazar una solicitud.
     *
     * @param solicitud   La solicitud a validar
     * @param idAprobador ID del usuario que intenta aprobar/rechazar
     * @throws UnauthorizedException si no tiene permisos
     */
    private void validarPermisoAprobacion(Solicitud solicitud, Long idAprobador) {
        switch (solicitud.getTipoSolicitud()) {
            case UNION_GRUPO -> {
                var unidad = solicitud.getUnidad();
                if (!unidad.getAdministrador().getId().equals(idAprobador)) {
                    log.warn("Intento de aprobación no autorizado: solicitud={}, usuario={}", solicitud.getId(), idAprobador);
                    throw new UnauthorizedException("Solo el administrador del grupo puede aprobar solicitudes");
                }
            }
            case UNION_SUSCRIPCION -> {
                var suscripcion = solicitud.getSuscripcion();
                if (!suscripcion.getAnfitrion().getId().equals(idAprobador)) {
                    log.warn("Intento de aprobación no autorizado: solicitud={}, usuario={}", solicitud.getId(), idAprobador);
                    throw new UnauthorizedException("Solo el anfitrión de la suscripción puede aprobar solicitudes");
                }
            }
        }
    }

    /**
     * Crea un nuevo miembro en la unidad familiar tras aprobar una solicitud de unión al grupo.
     *
     * @param solicitud La solicitud aprobada
     * @throws LimiteAlcanzadoException si se alcanzó el límite de miembros
     */
    private void crearMiembroUnidad(Solicitud solicitud) {
        var unidad = solicitud.getUnidad();
        var solicitante = solicitud.getSolicitante();

        // REGLA: Verificar nuevamente el límite de miembros (doble check para concurrencia)
        var miembrosActuales = unidadFamiliarRepository.contarMiembrosActivos(unidad.getId());
        if (miembrosActuales >= unidad.getMaxMiembros()) {
            log.warn("Límite de miembros alcanzado al aprobar solicitud: grupo={}, max={}", unidad.getId(), unidad.getMaxMiembros());
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
        log.debug("Nuevo miembro creado: usuario={}, grupo={}", solicitante.getId(), unidad.getId());
    }

    /**
     * Asigna una plaza disponible al solicitante tras aprobar una solicitud de unión a suscripción.
     *
     * @param solicitud La solicitud aprobada
     * @throws NoPlazasDisponiblesException si no hay plazas disponibles
     */
    private void asignarPlazaSuscripcion(Solicitud solicitud) {
        var suscripcion = solicitud.getSuscripcion();
        var solicitante = solicitud.getSolicitante();

        // REGLA: Buscar primera plaza disponible usando SequencedCollection (Java 21+)
        var plazasDisponibles = plazaRepository.findPlazasDisponiblesOrdenadas(suscripcion.getId());
        if (plazasDisponibles.isEmpty()) {
            log.warn("No hay plazas disponibles al aprobar solicitud: suscripcion={}", suscripcion.getId());
            throw new NoPlazasDisponiblesException(suscripcion.getId());
        }

        var plaza = plazasDisponibles.getFirst();
        plaza.setUsuario(solicitante);
        plaza.setEstado(EstadoPlaza.OCUPADA);
        plaza.setFechaOcupacion(LocalDateTime.now());

        plazaRepository.save(plaza);
        log.debug("Plaza asignada: plaza={}, usuario={}, suscripcion={}", plaza.getId(), solicitante.getId(), suscripcion.getId());
    }

    /**
     * Rechaza una solicitud pendiente con un motivo opcional.
     * <p>
     * <b>Reglas de negocio:</b>
     * <ul>
     *   <li>La solicitud debe estar en estado PENDIENTE</li>
     *   <li>Solo el administrador/anfitrión puede rechazar según el tipo de solicitud</li>
     * </ul>
     *
     * @param idSolicitud   ID de la solicitud a rechazar
     * @param idAprobador   ID del usuario que rechaza
     * @param motivoRechazo Motivo opcional del rechazo
     * @return La solicitud actualizada con estado RECHAZADA
     * @throws ResourceNotFoundException si la solicitud no existe
     * @throws BusinessException si la solicitud no está pendiente
     * @throws UnauthorizedException si no tiene permisos
     */
    @Transactional
    public Solicitud rechazarSolicitud(Long idSolicitud, Long idAprobador, String motivoRechazo) {
        log.info("Rechazando solicitud: id={}, aprobador={}", idSolicitud, idAprobador);

        var solicitud = solicitudRepository.findByIdCompleto(idSolicitud)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud", "id", idSolicitud));

        if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new BusinessException("Solo se pueden rechazar solicitudes pendientes. Estado actual: " + solicitud.getEstado());
        }

        validarPermisoAprobacion(solicitud, idAprobador);

        solicitud.setEstado(EstadoSolicitud.RECHAZADA);
        solicitud.setFechaRespuesta(LocalDateTime.now());
        solicitud.setMotivoRechazo(motivoRechazo);
        solicitud.setAprobador(usuarioRepository.findById(idAprobador).orElse(null));

        var solicitudGuardada = solicitudRepository.save(solicitud);
        log.info("Solicitud rechazada: id={}, motivo={}", idSolicitud, motivoRechazo);

        return solicitudGuardada;
    }

    /**
     * Permite al solicitante cancelar su propia solicitud pendiente.
     * <p>
     * <b>Reglas de negocio:</b>
     * <ul>
     *   <li>Solo el solicitante puede cancelar su solicitud</li>
     *   <li>La solicitud debe estar en estado PENDIENTE</li>
     * </ul>
     *
     * @param idSolicitud   ID de la solicitud a cancelar
     * @param idSolicitante ID del usuario que cancela (debe ser el solicitante)
     * @return La solicitud actualizada con estado CANCELADA
     * @throws ResourceNotFoundException si la solicitud no existe
     * @throws UnauthorizedException si no es el solicitante
     * @throws BusinessException si la solicitud no está pendiente
     */
    @Transactional
    public Solicitud cancelarSolicitud(Long idSolicitud, Long idSolicitante) {
        log.info("Cancelando solicitud: id={}, solicitante={}", idSolicitud, idSolicitante);

        var solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud", "id", idSolicitud));

        if (!solicitud.getSolicitante().getId().equals(idSolicitante)) {
            log.warn("Intento de cancelación no autorizado: solicitud={}, usuario={}", idSolicitud, idSolicitante);
            throw new UnauthorizedException("Solo puedes cancelar tus propias solicitudes");
        }

        if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new BusinessException("Solo se pueden cancelar solicitudes pendientes. Estado actual: " + solicitud.getEstado());
        }

        solicitud.setEstado(EstadoSolicitud.CANCELADA);
        solicitud.setFechaRespuesta(LocalDateTime.now());

        var solicitudGuardada = solicitudRepository.save(solicitud);
        log.info("Solicitud cancelada exitosamente: id={}", idSolicitud);

        return solicitudGuardada;
    }

    /**
     * Verifica si existe una solicitud pendiente de unión a un grupo.
     *
     * @param idSolicitante ID del usuario
     * @param idUnidad      ID del grupo
     * @return true si existe una solicitud pendiente
     */
    public boolean tieneSolicitudPendienteGrupo(Long idSolicitante, Long idUnidad) {
        return solicitudRepository.existsBySolicitanteIdAndUnidadIdAndEstado(
                idSolicitante, idUnidad, EstadoSolicitud.PENDIENTE);
    }

    /**
     * Verifica si existe una solicitud pendiente de unión a una suscripción.
     *
     * @param idSolicitante ID del usuario
     * @param idSuscripcion ID de la suscripción
     * @return true si existe una solicitud pendiente
     */
    public boolean tieneSolicitudPendienteSuscripcion(Long idSolicitante, Long idSuscripcion) {
        return solicitudRepository.existsBySolicitanteIdAndSuscripcionIdAndEstado(
                idSolicitante, idSuscripcion, EstadoSolicitud.PENDIENTE);
    }
}
