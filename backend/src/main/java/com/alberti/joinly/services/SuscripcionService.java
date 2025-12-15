package com.alberti.joinly.services;

import com.alberti.joinly.entities.enums.EstadoMiembro;
import com.alberti.joinly.entities.enums.EstadoPlaza;
import com.alberti.joinly.entities.enums.EstadoSuscripcion;
import com.alberti.joinly.entities.enums.Periodicidad;
import com.alberti.joinly.entities.suscripcion.Plaza;
import com.alberti.joinly.entities.suscripcion.Suscripcion;
import com.alberti.joinly.entities.usuario.Usuario;
import com.alberti.joinly.exceptions.*;
import com.alberti.joinly.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Servicio de gestión de suscripciones compartidas.
 * <p>
 * Este servicio implementa todas las reglas de negocio relacionadas con:
 * <ul>
 *   <li>Creación de suscripciones con validación de permisos</li>
 *   <li>Gestión de plazas (ocupación, liberación)</li>
 *   <li>Control de estados (activa, pausada, cancelada)</li>
 *   <li>Cálculo automático de precios por plaza</li>
 * </ul>
 * <p>
 * <b>Reglas de negocio críticas:</b>
 * <ul>
 *   <li>El anfitrión DEBE ser miembro activo de la unidad familiar</li>
 *   <li>num_plazas_total no puede superar max_usuarios del Servicio</li>
 *   <li>Si anfitrion_ocupa_plaza = true, se genera Plaza automáticamente con estado OCUPADA</li>
 *   <li>Un grupo no puede tener más de {@value #MAX_SUSCRIPCIONES_POR_GRUPO} suscripciones activas</li>
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
public class SuscripcionService {

    private static final int MAX_SUSCRIPCIONES_POR_GRUPO = 20;

    private final SuscripcionRepository suscripcionRepository;
    private final PlazaRepository plazaRepository;
    private final ServicioRepository servicioRepository;
    private final UnidadFamiliarRepository unidadFamiliarRepository;
    private final MiembroUnidadRepository miembroUnidadRepository;
    private final UsuarioRepository usuarioRepository;

    /**
     * Busca una suscripción por su ID.
     *
     * @param id ID de la suscripción
     * @return Optional con la suscripción si existe
     */
    public Optional<Suscripcion> buscarPorId(Long id) {
        return suscripcionRepository.findById(id);
    }

    /**
     * Busca una suscripción con sus plazas cargadas.
     *
     * @param id ID de la suscripción
     * @return Optional con la suscripción y sus plazas
     */
    public Optional<Suscripcion> buscarPorIdConPlazas(Long id) {
        return suscripcionRepository.findByIdConPlazas(id);
    }

    /**
     * Lista las suscripciones activas de una unidad familiar.
     *
     * @param idUnidad ID de la unidad familiar
     * @return Lista de suscripciones activas con información del servicio
     */
    public List<Suscripcion> listarSuscripcionesActivasDeUnidad(Long idUnidad) {
        return suscripcionRepository.findSuscripcionesActivasConServicio(idUnidad);
    }

    /**
     * Lista las suscripciones activas de una unidad familiar con paginación.
     *
     * @param idUnidad ID de la unidad familiar
     * @param pageable Información de paginación y ordenamiento
     * @return Página de suscripciones activas con información del servicio
     */
    public Page<Suscripcion> listarSuscripcionesActivasDeUnidadPaginado(Long idUnidad, Pageable pageable) {
        return suscripcionRepository.findSuscripcionesActivasConServicioPaginado(idUnidad, pageable);
    }

    /**
     * Lista las suscripciones donde el usuario es anfitrión.
     *
     * @param idAnfitrion ID del usuario anfitrión
     * @return Lista de suscripciones activas del anfitrión
     */
    public List<Suscripcion> listarSuscripcionesDeAnfitrion(Long idAnfitrion) {
        return suscripcionRepository.findByAnfitrionIdAndEstadoConServicio(idAnfitrion, EstadoSuscripcion.ACTIVA);
    }

    /**
     * Lista las plazas disponibles de una suscripción.
     *
     * @param idSuscripcion ID de la suscripción
     * @return Lista de plazas disponibles ordenadas por número
     */
    public List<Plaza> listarPlazasDisponibles(Long idSuscripcion) {
        return plazaRepository.findPlazasDisponiblesOrdenadas(idSuscripcion);
    }

    /**
     * Lista las plazas ocupadas por un usuario.
     *
     * @param idUsuario ID del usuario
     * @return Lista de plazas ocupadas por el usuario
     */
    public List<Plaza> listarPlazasOcupadasPorUsuario(Long idUsuario) {
        return plazaRepository.findPlazasOcupadasPorUsuario(idUsuario);
    }

    /**
     * Crea una nueva suscripción compartida dentro de un grupo familiar.
     * <p>
     * Este método realiza las siguientes operaciones atómicamente:
     * <ol>
     *   <li>Valida que el anfitrión sea miembro activo del grupo</li>
     *   <li>Verifica que el número de plazas no exceda el máximo del servicio</li>
     *   <li>Comprueba el límite de suscripciones activas del grupo (máx. {@value #MAX_SUSCRIPCIONES_POR_GRUPO})</li>
     *   <li>Calcula el precio por plaza según si el anfitrión ocupa plaza</li>
     *   <li>Crea todas las plazas, asignando la primera al anfitrión si corresponde</li>
     * </ol>
     * <p>
     * <b>Cálculo del precio por plaza:</b> Si el anfitrión ocupa plaza, el precio total
     * se divide entre (numPlazas - 1), ya que el anfitrión paga la suscripción completa.
     *
     * @param idUnidad           ID del grupo familiar propietario
     * @param idAnfitrion        ID del usuario anfitrión (debe ser miembro activo)
     * @param idServicio         ID del servicio de streaming/suscripción
     * @param precioTotal        Precio mensual total de la suscripción
     * @param numPlazasTotal     Número de plazas a crear (no exceder máximo del servicio)
     * @param fechaInicio        Fecha de inicio de la suscripción
     * @param periodicidad       Ciclo de renovación (MENSUAL, TRIMESTRAL, SEMESTRAL, ANUAL)
     * @param anfitrionOcupaPlaza Si true, la plaza 1 se asigna automáticamente al anfitrión
     * @return La suscripción creada con todas sus plazas
     * @throws ResourceNotFoundException si la unidad, anfitrión o servicio no existen
     * @throws UnauthorizedException si el anfitrión no es miembro activo
     * @throws BusinessException si se viola una regla de negocio
     * @throws LimiteAlcanzadoException si se alcanza el límite de suscripciones
     */
    @Transactional
    public Suscripcion crearSuscripcion(
            Long idUnidad,
            Long idAnfitrion,
            Long idServicio,
            BigDecimal precioTotal,
            short numPlazasTotal,
            LocalDate fechaInicio,
            Periodicidad periodicidad,
            boolean anfitrionOcupaPlaza
    ) {
        log.info("Creando suscripción: unidad={}, anfitrion={}, servicio={}, plazas={}",
                idUnidad, idAnfitrion, idServicio, numPlazasTotal);

        // Obtener entidades con validación de existencia
        var unidad = unidadFamiliarRepository.findById(idUnidad)
                .orElseThrow(() -> new ResourceNotFoundException("Unidad familiar", "id", idUnidad));

        var anfitrion = usuarioRepository.findById(idAnfitrion)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario anfitrión", "id", idAnfitrion));

        var servicio = servicioRepository.findById(idServicio)
                .orElseThrow(() -> new ResourceNotFoundException("Servicio", "id", idServicio));

        // REGLA: El anfitrión DEBE ser miembro activo de la unidad familiar
        var esMiembroActivo = miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(
                idAnfitrion, idUnidad, EstadoMiembro.ACTIVO);
        if (!esMiembroActivo) {
            log.warn("Intento de crear suscripción con anfitrión no miembro: usuario={}, unidad={}",
                    idAnfitrion, idUnidad);
            throw new UnauthorizedException("El anfitrión debe ser miembro activo de la unidad familiar");
        }

        // REGLA: num_plazas_total no puede superar max_usuarios del Servicio
        if (numPlazasTotal > servicio.getMaxUsuarios()) {
            throw new BusinessException(String.format(
                    "El número de plazas (%d) excede el máximo permitido por el servicio %s (%d)",
                    numPlazasTotal, servicio.getNombre(), servicio.getMaxUsuarios()));
        }

        // Validar mínimo de plazas
        if (numPlazasTotal < 1) {
            throw new BusinessException("Debe haber al menos 1 plaza en la suscripción");
        }

        // REGLA: Límite de suscripciones por grupo
        var suscripcionesActuales = suscripcionRepository.contarSuscripcionesActivasEnUnidad(idUnidad);
        if (suscripcionesActuales >= MAX_SUSCRIPCIONES_POR_GRUPO) {
            throw new LimiteAlcanzadoException("suscripciones activas del grupo", MAX_SUSCRIPCIONES_POR_GRUPO);
        }

        // Calcular precio por plaza
        var precioPorPlaza = calcularPrecioPorPlaza(precioTotal, numPlazasTotal, anfitrionOcupaPlaza);
        var fechaRenovacion = calcularFechaRenovacion(fechaInicio, periodicidad);

        var suscripcion = Suscripcion.builder()
                .unidad(unidad)
                .anfitrion(anfitrion)
                .servicio(servicio)
                .precioTotal(precioTotal)
                .moneda("EUR")
                .precioPorPlaza(precioPorPlaza)
                .numPlazasTotal(numPlazasTotal)
                .anfitrionOcupaPlaza(anfitrionOcupaPlaza)
                .fechaInicio(fechaInicio)
                .fechaRenovacion(fechaRenovacion)
                .periodicidad(periodicidad)
                .renovacionAutomatica(true)
                .estado(EstadoSuscripcion.ACTIVA)
                .build();

        var suscripcionGuardada = suscripcionRepository.save(suscripcion);
        log.info("Suscripción creada con ID: {}", suscripcionGuardada.getId());

        // REGLA: Si anfitrion_ocupa_plaza = true, generar Plaza automáticamente con estado OCUPADA
        crearPlazas(suscripcionGuardada, anfitrion, numPlazasTotal, anfitrionOcupaPlaza);

        return suscripcionGuardada;
    }

    /**
     * Crea todas las plazas para una suscripción.
     * <p>
     * Si el anfitrión ocupa plaza, la plaza 1 se asigna automáticamente
     * a él con estado OCUPADA.
     *
     * @param suscripcion        Suscripción a la que pertenecen las plazas
     * @param anfitrion          Usuario anfitrión
     * @param numPlazas          Número total de plazas a crear
     * @param anfitrionOcupaPlaza Si la primera plaza se asigna al anfitrión
     */
    private void crearPlazas(Suscripcion suscripcion, Usuario anfitrion, short numPlazas, boolean anfitrionOcupaPlaza) {
        var plazas = new java.util.ArrayList<Plaza>(numPlazas);
        var ahora = LocalDateTime.now();
        
        for (short i = 1; i <= numPlazas; i++) {
            var esPlazaAnfitrion = anfitrionOcupaPlaza && i == 1;
            plazas.add(Plaza.builder()
                    .suscripcion(suscripcion)
                    .numeroPlaza(i)
                    .esPlazaAnfitrion(esPlazaAnfitrion)
                    .estado(esPlazaAnfitrion ? EstadoPlaza.OCUPADA : EstadoPlaza.DISPONIBLE)
                    .usuario(esPlazaAnfitrion ? anfitrion : null)
                    .fechaOcupacion(esPlazaAnfitrion ? ahora : null)
                    .build());
        }
        plazaRepository.saveAll(plazas);
        log.debug("Creadas {} plazas para suscripción ID: {}", numPlazas, suscripcion.getId());
    }

    /**
     * Calcula el precio que debe pagar cada miembro por su plaza.
     * <p>
     * La fórmula aplicada es:
     * <pre>
     * Si anfitrionOcupaPlaza:
     *     precioPorPlaza = precioTotal / (numPlazasTotal - 1)
     * Si no:
     *     precioPorPlaza = precioTotal / numPlazasTotal
     * </pre>
     * El anfitrión no paga precio por plaza porque ya paga la suscripción completa
     * y reparte el coste entre los demás miembros.
     *
     * @param precioTotal        Coste total de la suscripción
     * @param numPlazasTotal     Número total de plazas
     * @param anfitrionOcupaPlaza Si el anfitrión usa una de las plazas
     * @return Precio por plaza redondeado a 2 decimales (HALF_UP), o ZERO si no hay plazas pagantes
     */
    public BigDecimal calcularPrecioPorPlaza(BigDecimal precioTotal, short numPlazasTotal, boolean anfitrionOcupaPlaza) {
        // El anfitrión no paga si ocupa plaza (él ya paga el servicio completo y reparte costes)
        int plazasPagantes = anfitrionOcupaPlaza ? numPlazasTotal - 1 : numPlazasTotal;
        
        if (plazasPagantes <= 0) {
            return BigDecimal.ZERO;
        }

        return precioTotal.divide(BigDecimal.valueOf(plazasPagantes), 2, RoundingMode.HALF_UP);
    }

    private LocalDate calcularFechaRenovacion(LocalDate fechaInicio, Periodicidad periodicidad) {
        return switch (periodicidad) {
            case MENSUAL -> fechaInicio.plusMonths(1);
            case TRIMESTRAL -> fechaInicio.plusMonths(3);
            case SEMESTRAL -> fechaInicio.plusMonths(6);
            case ANUAL -> fechaInicio.plusYears(1);
        };
    }

    /**
     * Asigna una plaza disponible a un usuario.
     * <p>
     * <b>Reglas de negocio:</b>
     * <ul>
     *   <li>La suscripción debe estar activa</li>
     *   <li>El usuario debe ser miembro activo de la unidad familiar</li>
     *   <li>El usuario no puede tener ya una plaza en esta suscripción</li>
     *   <li>Debe haber al menos una plaza disponible</li>
     * </ul>
     *
     * @param idSuscripcion ID de la suscripción
     * @param idUsuario     ID del usuario que ocupará la plaza
     * @return La plaza asignada
     * @throws ResourceNotFoundException si la suscripción o usuario no existen
     * @throws BusinessException si la suscripción no está activa
     * @throws UnauthorizedException si el usuario no es miembro del grupo
     * @throws DuplicateResourceException si el usuario ya tiene una plaza
     * @throws NoPlazasDisponiblesException si no hay plazas disponibles
     */
    @Transactional
    public Plaza ocuparPlaza(Long idSuscripcion, Long idUsuario) {
        log.info("Ocupando plaza: suscripcion={}, usuario={}", idSuscripcion, idUsuario);

        var suscripcion = suscripcionRepository.findById(idSuscripcion)
                .orElseThrow(() -> new ResourceNotFoundException("Suscripción", "id", idSuscripcion));

        var usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", idUsuario));

        // Validar que la suscripción esté activa
        if (suscripcion.getEstado() != EstadoSuscripcion.ACTIVA) {
            throw new BusinessException("La suscripción no está activa");
        }

        // Validar que el usuario sea miembro de la unidad familiar
        var esMiembro = miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(
                idUsuario, suscripcion.getUnidad().getId(), EstadoMiembro.ACTIVO);
        if (!esMiembro) {
            throw new UnauthorizedException("El usuario debe ser miembro de la unidad familiar");
        }

        // REGLA: Un usuario solo puede ocupar una plaza por suscripción
        if (plazaRepository.existsBySuscripcionIdAndUsuarioId(idSuscripcion, idUsuario)) {
            throw new DuplicateResourceException("El usuario ya ocupa una plaza en esta suscripción");
        }

        // Buscar primera plaza disponible usando SequencedCollection (Java 21+)
        var plazasDisponibles = plazaRepository.findPlazasDisponiblesOrdenadas(idSuscripcion);
        if (plazasDisponibles.isEmpty()) {
            throw new NoPlazasDisponiblesException(idSuscripcion);
        }

        var plaza = plazasDisponibles.getFirst();
        plaza.setUsuario(usuario);
        plaza.setEstado(EstadoPlaza.OCUPADA);
        plaza.setFechaOcupacion(LocalDateTime.now());

        log.info("Plaza {} asignada a usuario {} en suscripción {}",
                plaza.getNumeroPlaza(), idUsuario, idSuscripcion);
        return plazaRepository.save(plaza);
    }

    /**
     * Libera una plaza ocupada, dejándola disponible para otros usuarios.
     * <p>
     * Permisos requeridos:
     * <ul>
     *   <li>El propietario de la plaza puede liberarla</li>
     *   <li>El anfitrión puede liberar cualquier plaza (excepto la suya si es plaza de anfitrión)</li>
     * </ul>
     * <p>
     * <b>Restricción:</b> El anfitrión no puede liberar su propia plaza reservada
     * ({@code esPlazaAnfitrion = true}) ya que ésta es inherente a la suscripción.
     *
     * @param idPlaza      ID de la plaza a liberar
     * @param idSolicitante ID del usuario que solicita la liberación
     * @throws ResourceNotFoundException si la plaza no existe
     * @throws UnauthorizedException si no tiene permisos para liberar
     * @throws BusinessException si intenta liberar plaza de anfitrión
     */
    @Transactional
    public void liberarPlaza(Long idPlaza, Long idSolicitante) {
        log.info("Liberando plaza: plaza={}, solicitante={}", idPlaza, idSolicitante);

        var plaza = plazaRepository.findById(idPlaza)
                .orElseThrow(() -> new ResourceNotFoundException("Plaza", "id", idPlaza));

        var suscripcion = plaza.getSuscripcion();

        // El anfitrión puede liberar cualquier plaza (excepto la suya si es plaza anfitrión)
        // El usuario puede liberar su propia plaza
        var esAnfitrion = suscripcion.getAnfitrion().getId().equals(idSolicitante);
        var esPropietario = plaza.getUsuario() != null && plaza.getUsuario().getId().equals(idSolicitante);

        if (!esAnfitrion && !esPropietario) {
            throw new UnauthorizedException("No tienes permiso para liberar esta plaza");
        }

        // REGLA: El anfitrión no puede liberar su plaza reservada
        if (plaza.getEsPlazaAnfitrion() && esPropietario) {
            throw new BusinessException("El anfitrión no puede liberar su plaza reservada");
        }

        plaza.setUsuario(null);
        plaza.setEstado(EstadoPlaza.DISPONIBLE);
        plaza.setFechaBaja(LocalDateTime.now());

        plazaRepository.save(plaza);
        log.info("Plaza {} liberada exitosamente", idPlaza);
    }

    /**
     * Pausa una suscripción activa.
     * <p>
     * Solo el anfitrión puede pausar la suscripción. Los miembros mantienen
     * sus plazas pero no pueden acceder a las credenciales mientras esté pausada.
     *
     * @param idSuscripcion ID de la suscripción a pausar
     * @param idSolicitante ID del usuario que solicita la pausa
     * @throws ResourceNotFoundException si la suscripción no existe
     * @throws UnauthorizedException si no es el anfitrión
     */
    @Transactional
    public void pausarSuscripcion(Long idSuscripcion, Long idSolicitante) {
        log.info("Pausando suscripción: suscripcion={}, solicitante={}", idSuscripcion, idSolicitante);

        var suscripcion = suscripcionRepository.findById(idSuscripcion)
                .orElseThrow(() -> new ResourceNotFoundException("Suscripción", "id", idSuscripcion));

        if (!suscripcion.getAnfitrion().getId().equals(idSolicitante)) {
            throw new UnauthorizedException("Solo el anfitrión puede pausar la suscripción");
        }

        if (suscripcion.getEstado() != EstadoSuscripcion.ACTIVA) {
            throw new BusinessException("Solo se pueden pausar suscripciones activas");
        }

        suscripcion.setEstado(EstadoSuscripcion.PAUSADA);
        suscripcionRepository.save(suscripcion);
        log.info("Suscripción {} pausada", idSuscripcion);
    }

    /**
     * Reactiva una suscripción previamente pausada.
     *
     * @param idSuscripcion ID de la suscripción a reactivar
     * @param idSolicitante ID del usuario que solicita la reactivación
     * @throws ResourceNotFoundException si la suscripción no existe
     * @throws UnauthorizedException si no es el anfitrión
     * @throws BusinessException si la suscripción no está pausada
     */
    @Transactional
    public void reactivarSuscripcion(Long idSuscripcion, Long idSolicitante) {
        log.info("Reactivando suscripción: suscripcion={}, solicitante={}", idSuscripcion, idSolicitante);

        var suscripcion = suscripcionRepository.findById(idSuscripcion)
                .orElseThrow(() -> new ResourceNotFoundException("Suscripción", "id", idSuscripcion));

        if (!suscripcion.getAnfitrion().getId().equals(idSolicitante)) {
            throw new UnauthorizedException("Solo el anfitrión puede reactivar la suscripción");
        }

        if (suscripcion.getEstado() != EstadoSuscripcion.PAUSADA) {
            throw new BusinessException("Solo se pueden reactivar suscripciones pausadas");
        }

        suscripcion.setEstado(EstadoSuscripcion.ACTIVA);
        suscripcionRepository.save(suscripcion);
        log.info("Suscripción {} reactivada", idSuscripcion);
    }

    /**
     * Cancela una suscripción y libera todas las plazas ocupadas.
     * <p>
     * La cancelación es una acción irreversible. Todas las plazas (excepto la del
     * anfitrión para historial) se marcan como BLOQUEADAS.
     *
     * @param idSuscripcion ID de la suscripción a cancelar
     * @param idSolicitante ID del usuario que solicita la cancelación
     * @throws ResourceNotFoundException si la suscripción no existe
     * @throws UnauthorizedException si no es el anfitrión
     */
    @Transactional
    public void cancelarSuscripcion(Long idSuscripcion, Long idSolicitante) {
        log.info("Cancelando suscripción: suscripcion={}, solicitante={}", idSuscripcion, idSolicitante);

        var suscripcion = suscripcionRepository.findById(idSuscripcion)
                .orElseThrow(() -> new ResourceNotFoundException("Suscripción", "id", idSuscripcion));

        if (!suscripcion.getAnfitrion().getId().equals(idSolicitante)) {
            throw new UnauthorizedException("Solo el anfitrión puede cancelar la suscripción");
        }

        suscripcion.setEstado(EstadoSuscripcion.CANCELADA);
        suscripcionRepository.save(suscripcion);

        // Liberar todas las plazas ocupadas (excepto la del anfitrión para historial)
        var plazasOcupadas = plazaRepository.findBySuscripcionIdAndEstado(idSuscripcion, EstadoPlaza.OCUPADA);
        var ahora = LocalDateTime.now();
        for (var plaza : plazasOcupadas) {
            if (!plaza.getEsPlazaAnfitrion()) {
                plaza.setEstado(EstadoPlaza.BLOQUEADA);
                plaza.setFechaBaja(ahora);
            }
        }
        plazaRepository.saveAll(plazasOcupadas);
        
        log.info("Suscripción {} cancelada, {} plazas liberadas", idSuscripcion, plazasOcupadas.size());
    }

    public long contarPlazasDisponibles(Long idSuscripcion) {
        return plazaRepository.contarPlazasDisponibles(idSuscripcion);
    }

    public long contarPlazasOcupadas(Long idSuscripcion) {
        return plazaRepository.contarPlazasOcupadas(idSuscripcion);
    }

    public boolean usuarioTienePlazaEnSuscripcion(Long idSuscripcion, Long idUsuario) {
        return plazaRepository.existsBySuscripcionIdAndUsuarioId(idSuscripcion, idUsuario);
    }
}
