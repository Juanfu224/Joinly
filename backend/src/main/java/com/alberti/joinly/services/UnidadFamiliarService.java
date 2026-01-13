package com.alberti.joinly.services;

import com.alberti.joinly.dto.unidad.UnidadFamiliarCardDTO;
import com.alberti.joinly.entities.enums.EstadoMiembro;
import com.alberti.joinly.entities.enums.EstadoUnidadFamiliar;
import com.alberti.joinly.entities.enums.RolMiembro;
import com.alberti.joinly.entities.grupo.MiembroUnidad;
import com.alberti.joinly.entities.grupo.UnidadFamiliar;
import com.alberti.joinly.entities.usuario.Usuario;
import com.alberti.joinly.exceptions.*;
import com.alberti.joinly.repositories.MiembroUnidadRepository;
import com.alberti.joinly.repositories.SuscripcionRepository;
import com.alberti.joinly.repositories.UnidadFamiliarRepository;
import com.alberti.joinly.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Servicio de gestión de Unidades Familiares (grupos) en Joinly.
 * <p>
 * Una Unidad Familiar es el núcleo organizativo de Joinly, permite agrupar usuarios
 * que comparten suscripciones digitales. Cada grupo tiene un administrador que
 * gestiona los miembros y aprueba solicitudes.
 * <p>
 * <b>Reglas de negocio principales:</b>
 * <ul>
 *   <li>Un usuario puede pertenecer a máximo {@value #MAX_GRUPOS_POR_USUARIO} grupos activos</li>
 *   <li>Cada grupo puede tener un máximo configurable de miembros (por defecto 10)</li>
 *   <li>Solo el administrador puede gestionar miembros y eliminar el grupo</li>
 *   <li>El administrador no puede abandonar el grupo, debe transferir o eliminarlo</li>
 *   <li>No se puede eliminar un grupo con suscripciones activas</li>
 *   <li>Cada grupo tiene un código de invitación único de {@value #LONGITUD_CODIGO} caracteres</li>
 * </ul>
 *
 * @author Joinly Team
 * @version 1.0
 * @see MiembroUnidad
 * @see UnidadFamiliar
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class UnidadFamiliarService {

    private static final String CARACTERES_CODIGO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int LONGITUD_CODIGO = 12;
    private static final int MAX_GRUPOS_POR_USUARIO = 10;

    private final UnidadFamiliarRepository unidadFamiliarRepository;
    private final MiembroUnidadRepository miembroUnidadRepository;
    private final UsuarioRepository usuarioRepository;
    private final SuscripcionRepository suscripcionRepository;
    private final SecureRandom random = new SecureRandom();

    /**
     * Busca una unidad familiar por su ID.
     *
     * @param id ID de la unidad familiar
     * @return Optional con la unidad familiar si existe
     */
    public Optional<UnidadFamiliar> buscarPorId(Long id) {
        return unidadFamiliarRepository.findById(id);
    }

    /**
     * Busca una unidad familiar por ID con el administrador precargado.
     * Usar este método cuando se necesite acceder a datos del administrador
     * para evitar LazyInitializationException.
     *
     * @param id ID de la unidad familiar
     * @return Optional con la unidad familiar y administrador cargados
     */
    public Optional<UnidadFamiliar> buscarPorIdConAdministrador(Long id) {
        return unidadFamiliarRepository.findWithAdministradorById(id);
    }

    /**
     * Busca una unidad familiar por su código de invitación.
     *
     * @param codigoInvitacion Código de invitación (case insensitive)
     * @return Optional con la unidad familiar si existe
     */
    public Optional<UnidadFamiliar> buscarPorCodigo(String codigoInvitacion) {
        return unidadFamiliarRepository.findByCodigoInvitacion(codigoInvitacion.toUpperCase());
    }

    /**
     * Busca una unidad familiar por código de invitación con el administrador precargado.
     * Usar este método cuando se necesite acceder a datos del administrador
     * para evitar LazyInitializationException.
     *
     * @param codigoInvitacion Código de invitación (case insensitive)
     * @return Optional con la unidad familiar y administrador cargados
     */
    public Optional<UnidadFamiliar> buscarPorCodigoConAdministrador(String codigoInvitacion) {
        return unidadFamiliarRepository.findWithAdministradorByCodigoInvitacion(codigoInvitacion.toUpperCase());
    }

    /**
     * Lista los grupos donde el usuario es administrador.
     *
     * @param idUsuario ID del usuario
     * @return Lista de grupos administrados activos
     */
    public List<UnidadFamiliar> listarGruposAdministrados(Long idUsuario) {
        return unidadFamiliarRepository.findUnidadesAdministradasActivas(idUsuario);
    }

    /**
     * Lista los grupos donde el usuario es administrador, con administrador precargado.
     * Usar este método cuando se necesite acceder a datos del administrador
     * para evitar LazyInitializationException.
     *
     * @param idUsuario ID del usuario
     * @return Lista de grupos administrados activos con administrador cargado
     */
    public List<UnidadFamiliar> listarGruposAdministradosConAdmin(Long idUsuario) {
        return unidadFamiliarRepository.findUnidadesAdministradasActivasConAdmin(idUsuario);
    }

    /**
     * Lista los grupos donde el usuario es miembro activo.
     *
     * @param idUsuario ID del usuario
     * @return Lista de grupos donde es miembro
     */
    public List<UnidadFamiliar> listarGruposDondeEsMiembro(Long idUsuario) {
        return unidadFamiliarRepository.findUnidadesDondeEsMiembroActivo(idUsuario);
    }

    /**
     * Lista los grupos donde el usuario es miembro activo con paginación.
     *
     * @param idUsuario ID del usuario
     * @param pageable  Información de paginación y ordenamiento
     * @return Página de grupos donde es miembro
     */
    public Page<UnidadFamiliar> listarGruposDondeEsMiembroPaginado(Long idUsuario, Pageable pageable) {
        return unidadFamiliarRepository.findUnidadesDondeEsMiembroActivoPaginado(idUsuario, pageable);
    }

    /**
     * Lista los grupos donde el usuario es miembro activo con paginación y administrador precargado.
     * Usar este método cuando se necesite acceder a datos del administrador
     * para evitar LazyInitializationException.
     *
     * @param idUsuario ID del usuario
     * @param pageable  Información de paginación y ordenamiento
     * @return Página de grupos donde es miembro con administrador cargado
     */
    public Page<UnidadFamiliar> listarGruposDondeEsMiembroPaginadoConAdmin(Long idUsuario, Pageable pageable) {
        return unidadFamiliarRepository.findUnidadesDondeEsMiembroActivoPaginadoConAdmin(idUsuario, pageable);
    }

    /**
     * Obtiene los datos resumidos de grupos para mostrar en tarjetas del dashboard.
     * <p>
     * Utiliza una query optimizada con proyección directa a DTO para evitar
     * el problema N+1 y mejorar el rendimiento.
     *
     * @param idUsuario ID del usuario
     * @param pageable  Información de paginación
     * @return Página de DTOs con datos resumidos de grupos
     */
    public Page<UnidadFamiliarCardDTO> obtenerGruposCardDelUsuario(Long idUsuario, Pageable pageable) {
        log.debug("Obteniendo tarjetas de grupos para usuario: {}", idUsuario);
        return unidadFamiliarRepository.findGruposCardPorUsuario(idUsuario, pageable);
    }

    /**
     * Lista los miembros activos de una unidad familiar.
     *
     * @param idUnidad ID del grupo
     * @return Lista de miembros activos con información de usuario
     */
    public List<MiembroUnidad> listarMiembrosActivos(Long idUnidad) {
        return miembroUnidadRepository.findByUnidadIdAndEstadoConUsuario(idUnidad, EstadoMiembro.ACTIVO);
    }

    /**
     * Crea un nuevo grupo familiar y registra al creador como administrador.
     * <p>
     * Este método realiza las siguientes operaciones atómicamente:
     * <ol>
     *   <li>Verifica que el usuario no haya alcanzado el límite de grupos (máx. {@value #MAX_GRUPOS_POR_USUARIO})</li>
     *   <li>Genera un código de invitación único de {@value #LONGITUD_CODIGO} caracteres alfanuméricos</li>
     *   <li>Crea la unidad familiar con estado ACTIVO y límite de 10 miembros por defecto</li>
     *   <li>Añade al administrador como primer miembro con rol ADMINISTRADOR</li>
     * </ol>
     *
     * @param idAdministrador ID del usuario que será administrador del grupo
     * @param nombre          Nombre del grupo familiar (obligatorio)
     * @param descripcion     Descripción opcional del grupo
     * @return La unidad familiar creada con su código de invitación
     * @throws ResourceNotFoundException si el usuario no existe
     * @throws LimiteAlcanzadoException si alcanzó límite de grupos
     */
    @Transactional
    public UnidadFamiliar crearUnidadFamiliar(Long idAdministrador, String nombre, String descripcion) {
        log.info("Creando unidad familiar: admin={}, nombre={}", idAdministrador, nombre);

        var administrador = usuarioRepository.findById(idAdministrador)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", idAdministrador));

        // REGLA: Validar límite de grupos por usuario
        var gruposActuales = miembroUnidadRepository.contarGruposActivosDelUsuario(idAdministrador);
        if (gruposActuales >= MAX_GRUPOS_POR_USUARIO) {
            log.warn("Usuario {} ha alcanzado límite de grupos: {}", idAdministrador, MAX_GRUPOS_POR_USUARIO);
            throw new LimiteAlcanzadoException("grupos por usuario", MAX_GRUPOS_POR_USUARIO);
        }

        var codigoUnico = generarCodigoUnico();

        var unidadFamiliar = UnidadFamiliar.builder()
                .nombre(nombre)
                .descripcion(descripcion)
                .codigoInvitacion(codigoUnico)
                .administrador(administrador)
                .fechaCreacion(LocalDateTime.now())
                .estado(EstadoUnidadFamiliar.ACTIVO)
                .maxMiembros((short) 10)
                .build();

        var unidadGuardada = unidadFamiliarRepository.save(unidadFamiliar);

        // El administrador se añade automáticamente como miembro
        agregarMiembroInterno(unidadGuardada, administrador, RolMiembro.ADMINISTRADOR);

        log.info("Unidad familiar creada: id={}, codigo={}, admin={}",
                unidadGuardada.getId(), codigoUnico, idAdministrador);

        return unidadGuardada;
    }

    /**
     * Agrega un usuario como miembro de un grupo.
     *
     * @param idUnidad  ID del grupo
     * @param idUsuario ID del usuario a agregar
     * @return El miembro creado
     * @throws ResourceNotFoundException si el grupo o usuario no existe
     * @throws BusinessException si el grupo no está activo
     * @throws DuplicateResourceException si ya es miembro
     * @throws LimiteAlcanzadoException si se alcanzó el límite
     */
    @Transactional
    public MiembroUnidad agregarMiembro(Long idUnidad, Long idUsuario) {
        log.info("Agregando miembro: grupo={}, usuario={}", idUnidad, idUsuario);

        var unidad = unidadFamiliarRepository.findById(idUnidad)
                .orElseThrow(() -> new ResourceNotFoundException("Unidad familiar", "id", idUnidad));
        
        var usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", idUsuario));

        validarPuedeUnirse(unidad, usuario);

        var miembro = agregarMiembroInterno(unidad, usuario, RolMiembro.MIEMBRO);
        log.info("Miembro agregado exitosamente: grupo={}, usuario={}", idUnidad, idUsuario);

        return miembro;
    }

    /**
     * Valida si un usuario puede unirse a un grupo familiar.
     * <p>
     * <b>Reglas de negocio validadas:</b>
     * <ul>
     *   <li>El grupo debe estar en estado ACTIVO</li>
     *   <li>El usuario no puede ser ya miembro activo</li>
     *   <li>El grupo no puede haber alcanzado su límite de miembros</li>
     *   <li>El usuario no puede pertenecer a más de {@value #MAX_GRUPOS_POR_USUARIO} grupos</li>
     * </ul>
     *
     * @param unidad  El grupo familiar al que se desea unir
     * @param usuario El usuario que solicita unirse
     * @throws BusinessException si el grupo no está activo
     * @throws DuplicateResourceException si ya es miembro
     * @throws LimiteAlcanzadoException si se alcanzó algún límite
     */
    private void validarPuedeUnirse(UnidadFamiliar unidad, Usuario usuario) {
        // REGLA: Verificar que la unidad esté activa
        if (unidad.getEstado() != EstadoUnidadFamiliar.ACTIVO) {
            throw new BusinessException("La unidad familiar no está activa y no acepta nuevos miembros");
        }

        // REGLA: Verificar que el usuario no sea ya miembro activo
        var yaMiembro = miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(
                usuario.getId(), unidad.getId(), EstadoMiembro.ACTIVO);
        if (yaMiembro) {
            throw new DuplicateResourceException("El usuario ya es miembro activo de este grupo");
        }

        // REGLA: Verificar límite de miembros del grupo
        var miembrosActuales = unidadFamiliarRepository.contarMiembrosActivos(unidad.getId());
        if (miembrosActuales >= unidad.getMaxMiembros()) {
            log.warn("Grupo {} ha alcanzado límite de miembros: {}", unidad.getId(), unidad.getMaxMiembros());
            throw new LimiteAlcanzadoException("miembros del grupo", unidad.getMaxMiembros());
        }

        // REGLA: Verificar límite de grupos del usuario
        var gruposDelUsuario = miembroUnidadRepository.contarGruposActivosDelUsuario(usuario.getId());
        if (gruposDelUsuario >= MAX_GRUPOS_POR_USUARIO) {
            log.warn("Usuario {} ha alcanzado límite de grupos: {}", usuario.getId(), MAX_GRUPOS_POR_USUARIO);
            throw new LimiteAlcanzadoException("grupos por usuario", MAX_GRUPOS_POR_USUARIO);
        }
    }

    /**
     * Agrega un miembro internamente sin validaciones adicionales.
     */
    private MiembroUnidad agregarMiembroInterno(UnidadFamiliar unidad, Usuario usuario, RolMiembro rol) {
        var miembro = MiembroUnidad.builder()
                .unidad(unidad)
                .usuario(usuario)
                .rol(rol)
                .fechaUnion(LocalDateTime.now())
                .estado(EstadoMiembro.ACTIVO)
                .build();

        return miembroUnidadRepository.save(miembro);
    }

    /**
     * Expulsa a un miembro del grupo (solo el administrador puede hacerlo).
     * <p>
     * <b>Reglas de negocio:</b>
     * <ul>
     *   <li>Solo el administrador del grupo puede expulsar miembros</li>
     *   <li>El administrador no puede expulsarse a sí mismo</li>
     *   <li>El usuario debe ser miembro activo del grupo</li>
     * </ul>
     *
     * @param idUnidad      ID del grupo
     * @param idUsuario     ID del usuario a expulsar
     * @param idSolicitante ID del usuario que solicita (debe ser admin)
     * @throws ResourceNotFoundException si el grupo o miembro no existe
     * @throws UnauthorizedException si no es el administrador
     * @throws BusinessException si intenta expulsarse a sí mismo
     */
    @Transactional
    public void expulsarMiembro(Long idUnidad, Long idUsuario, Long idSolicitante) {
        log.info("Expulsando miembro: grupo={}, usuario={}, solicitante={}", idUnidad, idUsuario, idSolicitante);

        var unidad = unidadFamiliarRepository.findById(idUnidad)
                .orElseThrow(() -> new ResourceNotFoundException("Unidad familiar", "id", idUnidad));

        // REGLA: Solo el administrador puede expulsar
        if (!unidad.getAdministrador().getId().equals(idSolicitante)) {
            log.warn("Intento de expulsión no autorizado: grupo={}, usuario={}", idUnidad, idSolicitante);
            throw new UnauthorizedException("Solo el administrador puede expulsar miembros");
        }

        // REGLA: No puede expulsarse a sí mismo
        if (idUsuario.equals(idSolicitante)) {
            throw new BusinessException("El administrador no puede expulsarse a sí mismo");
        }

        var miembro = miembroUnidadRepository.findByUsuarioIdAndUnidadId(idUsuario, idUnidad)
                .orElseThrow(() -> new ResourceNotFoundException("Miembro", "usuario/grupo", idUsuario + "/" + idUnidad));

        miembro.setEstado(EstadoMiembro.EXPULSADO);
        miembro.setFechaBaja(LocalDateTime.now());
        miembroUnidadRepository.save(miembro);

        log.info("Miembro expulsado exitosamente: grupo={}, usuario={}", idUnidad, idUsuario);
    }

    /**
     * Permite a un miembro abandonar voluntariamente un grupo.
     * <p>
     * <b>Reglas de negocio:</b>
     * <ul>
     *   <li>El administrador no puede abandonar el grupo</li>
     *   <li>El usuario debe ser miembro activo del grupo</li>
     * </ul>
     *
     * @param idUnidad  ID del grupo a abandonar
     * @param idUsuario ID del usuario que abandona
     * @throws ResourceNotFoundException si el grupo o membresía no existe
     * @throws BusinessException si es el administrador
     */
    @Transactional
    public void abandonarGrupo(Long idUnidad, Long idUsuario) {
        log.info("Usuario abandonando grupo: grupo={}, usuario={}", idUnidad, idUsuario);

        var unidad = unidadFamiliarRepository.findById(idUnidad)
                .orElseThrow(() -> new ResourceNotFoundException("Unidad familiar", "id", idUnidad));

        // REGLA: El administrador no puede abandonar (debe transferir o eliminar el grupo)
        if (unidad.getAdministrador().getId().equals(idUsuario)) {
            throw new BusinessException("El administrador no puede abandonar el grupo. Debe transferir la administración o eliminar el grupo.");
        }

        var miembro = miembroUnidadRepository.findByUsuarioIdAndUnidadId(idUsuario, idUnidad)
                .orElseThrow(() -> new ResourceNotFoundException("Membresía", "usuario/grupo", idUsuario + "/" + idUnidad));

        miembro.setEstado(EstadoMiembro.ABANDONO);
        miembro.setFechaBaja(LocalDateTime.now());
        miembroUnidadRepository.save(miembro);

        log.info("Usuario abandonó grupo exitosamente: grupo={}, usuario={}", idUnidad, idUsuario);
    }

    /**
     * Elimina (soft delete) una unidad familiar cambiando su estado a ELIMINADO.
     * <p>
     * <b>Reglas de negocio:</b>
     * <ul>
     *   <li>Solo el administrador del grupo puede eliminarlo</li>
     *   <li>El grupo no puede tener suscripciones activas asociadas</li>
     * </ul>
     * <p>
     * Nota: Este es un soft delete, los datos permanecen para auditoría.
     * Las membresías no se modifican ya que el estado de la unidad impide nuevas operaciones.
     *
     * @param idUnidad      ID del grupo a eliminar
     * @param idSolicitante ID del usuario que solicita (debe ser administrador)
     * @throws ResourceNotFoundException si el grupo no existe
     * @throws UnauthorizedException si no es el administrador
     * @throws BusinessException si tiene suscripciones activas
     */
    @Transactional
    public void eliminarUnidadFamiliar(Long idUnidad, Long idSolicitante) {
        log.info("Eliminando unidad familiar: id={}, solicitante={}", idUnidad, idSolicitante);

        var unidad = unidadFamiliarRepository.findById(idUnidad)
                .orElseThrow(() -> new ResourceNotFoundException("Unidad familiar", "id", idUnidad));

        // REGLA: Solo el administrador puede eliminar
        if (!unidad.getAdministrador().getId().equals(idSolicitante)) {
            log.warn("Intento de eliminación no autorizado: grupo={}, usuario={}", idUnidad, idSolicitante);
            throw new UnauthorizedException("Solo el administrador puede eliminar el grupo");
        }

        // REGLA: Verificar que no tenga suscripciones activas antes de eliminar
        var suscripcionesActivas = suscripcionRepository.contarSuscripcionesActivasEnUnidad(idUnidad);
        if (suscripcionesActivas > 0) {
            log.warn("No se puede eliminar grupo {} con {} suscripciones activas", idUnidad, suscripcionesActivas);
            throw new BusinessException("No se puede eliminar el grupo mientras tenga suscripciones activas (" + suscripcionesActivas + ")");
        }

        unidad.setEstado(EstadoUnidadFamiliar.ELIMINADO);
        unidadFamiliarRepository.save(unidad);

        log.info("Unidad familiar eliminada exitosamente: id={}", idUnidad);
    }

    /**
     * Verifica si un usuario es miembro activo de un grupo.
     *
     * @param idUnidad  ID del grupo
     * @param idUsuario ID del usuario
     * @return true si es miembro activo
     */
    public boolean esMiembroActivo(Long idUnidad, Long idUsuario) {
        return miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(
                idUsuario, idUnidad, EstadoMiembro.ACTIVO);
    }

    /**
     * Verifica si un usuario es el administrador de un grupo.
     *
     * @param idUnidad  ID del grupo
     * @param idUsuario ID del usuario
     * @return true si es el administrador
     */
    public boolean esAdministrador(Long idUnidad, Long idUsuario) {
        return unidadFamiliarRepository.findById(idUnidad)
                .map(u -> u.getAdministrador().getId().equals(idUsuario))
                .orElse(false);
    }

    /**
     * Genera un código de invitación único que no exista en la base de datos.
     */
    private String generarCodigoUnico() {
        String codigo;
        do {
            codigo = generarCodigoAleatorio();
        } while (unidadFamiliarRepository.existsByCodigoInvitacion(codigo));
        return codigo;
    }

    /**
     * Genera un código alfanumérico aleatorio de {@value #LONGITUD_CODIGO} caracteres.
     */
    private String generarCodigoAleatorio() {
        var sb = new StringBuilder(LONGITUD_CODIGO);
        for (int i = 0; i < LONGITUD_CODIGO; i++) {
            int index = random.nextInt(CARACTERES_CODIGO.length());
            sb.append(CARACTERES_CODIGO.charAt(index));
        }
        return sb.toString();
    }
}
