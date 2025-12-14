package com.alberti.joinly.services;

import com.alberti.joinly.entities.enums.EstadoMiembro;
import com.alberti.joinly.entities.enums.EstadoPlaza;
import com.alberti.joinly.entities.enums.EstadoSuscripcion;
import com.alberti.joinly.entities.enums.Periodicidad;
import com.alberti.joinly.entities.suscripcion.Plaza;
import com.alberti.joinly.entities.suscripcion.Suscripcion;
import com.alberti.joinly.entities.usuario.Usuario;
import com.alberti.joinly.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SuscripcionService {

    private static final int MAX_SUSCRIPCIONES_POR_GRUPO = 20;

    private final SuscripcionRepository suscripcionRepository;
    private final PlazaRepository plazaRepository;
    private final ServicioRepository servicioRepository;
    private final UnidadFamiliarRepository unidadFamiliarRepository;
    private final MiembroUnidadRepository miembroUnidadRepository;
    private final UsuarioRepository usuarioRepository;

    public Optional<Suscripcion> buscarPorId(Long id) {
        return suscripcionRepository.findById(id);
    }

    public Optional<Suscripcion> buscarPorIdConPlazas(Long id) {
        return suscripcionRepository.findByIdConPlazas(id);
    }

    public List<Suscripcion> listarSuscripcionesActivasDeUnidad(Long idUnidad) {
        return suscripcionRepository.findSuscripcionesActivasConServicio(idUnidad);
    }

    public List<Suscripcion> listarSuscripcionesDeAnfitrion(Long idAnfitrion) {
        return suscripcionRepository.findByAnfitrionIdAndEstadoConServicio(idAnfitrion, EstadoSuscripcion.ACTIVA);
    }

    public List<Plaza> listarPlazasDisponibles(Long idSuscripcion) {
        return plazaRepository.findPlazasDisponiblesOrdenadas(idSuscripcion);
    }

    public List<Plaza> listarPlazasOcupadasPorUsuario(Long idUsuario) {
        return plazaRepository.findPlazasOcupadasPorUsuario(idUsuario);
    }

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
        var unidad = unidadFamiliarRepository.findById(idUnidad)
                .orElseThrow(() -> new IllegalArgumentException("Unidad familiar no encontrada"));

        var anfitrion = usuarioRepository.findById(idAnfitrion)
                .orElseThrow(() -> new IllegalArgumentException("Usuario anfitrión no encontrado"));

        var servicio = servicioRepository.findById(idServicio)
                .orElseThrow(() -> new IllegalArgumentException("Servicio no encontrado"));

        // Validar que el anfitrión sea miembro activo de la unidad
        var esMiembroActivo = miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(
                idAnfitrion, idUnidad, EstadoMiembro.ACTIVO);
        if (!esMiembroActivo) {
            throw new IllegalArgumentException("El anfitrión debe ser miembro activo de la unidad familiar");
        }

        // Validar número de plazas vs máximo del servicio
        if (numPlazasTotal > servicio.getMaxUsuarios()) {
            throw new IllegalArgumentException(
                    "El número de plazas (" + numPlazasTotal + ") excede el máximo permitido por el servicio (" + servicio.getMaxUsuarios() + ")");
        }

        // Validar límite de suscripciones por grupo
        var suscripcionesActuales = suscripcionRepository.contarSuscripcionesActivasEnUnidad(idUnidad);
        if (suscripcionesActuales >= MAX_SUSCRIPCIONES_POR_GRUPO) {
            throw new IllegalArgumentException("El grupo ha alcanzado el límite máximo de suscripciones activas");
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

        // Crear todas las plazas
        crearPlazas(suscripcionGuardada, anfitrion, numPlazasTotal, anfitrionOcupaPlaza);

        return suscripcionGuardada;
    }

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
    }

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

    @Transactional
    public Plaza ocuparPlaza(Long idSuscripcion, Long idUsuario) {
        var suscripcion = suscripcionRepository.findById(idSuscripcion)
                .orElseThrow(() -> new IllegalArgumentException("Suscripción no encontrada"));

        var usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        // Validar que la suscripción esté activa
        if (suscripcion.getEstado() != EstadoSuscripcion.ACTIVA) {
            throw new IllegalArgumentException("La suscripción no está activa");
        }

        // Validar que el usuario sea miembro de la unidad familiar
        var esMiembro = miembroUnidadRepository.existsByUsuarioIdAndUnidadIdAndEstado(
                idUsuario, suscripcion.getUnidad().getId(), EstadoMiembro.ACTIVO);
        if (!esMiembro) {
            throw new IllegalArgumentException("El usuario debe ser miembro de la unidad familiar");
        }

        // Validar que el usuario no tenga ya una plaza en esta suscripción
        if (plazaRepository.existsBySuscripcionIdAndUsuarioId(idSuscripcion, idUsuario)) {
            throw new IllegalArgumentException("El usuario ya ocupa una plaza en esta suscripción");
        }

        // Buscar primera plaza disponible
        var plazasDisponibles = plazaRepository.findPlazasDisponiblesOrdenadas(idSuscripcion);
        if (plazasDisponibles.isEmpty()) {
            throw new IllegalArgumentException("No hay plazas disponibles en esta suscripción");
        }

        var plaza = plazasDisponibles.getFirst();
        plaza.setUsuario(usuario);
        plaza.setEstado(EstadoPlaza.OCUPADA);
        plaza.setFechaOcupacion(LocalDateTime.now());

        return plazaRepository.save(plaza);
    }

    @Transactional
    public void liberarPlaza(Long idPlaza, Long idSolicitante) {
        var plaza = plazaRepository.findById(idPlaza)
                .orElseThrow(() -> new IllegalArgumentException("Plaza no encontrada"));

        var suscripcion = plaza.getSuscripcion();

        // El anfitrión puede liberar cualquier plaza (excepto la suya si es plaza anfitrión)
        // El usuario puede liberar su propia plaza
        var esAnfitrion = suscripcion.getAnfitrion().getId().equals(idSolicitante);
        var esPropietario = plaza.getUsuario() != null && plaza.getUsuario().getId().equals(idSolicitante);

        if (!esAnfitrion && !esPropietario) {
            throw new IllegalArgumentException("No tienes permiso para liberar esta plaza");
        }

        if (plaza.getEsPlazaAnfitrion() && esPropietario) {
            throw new IllegalArgumentException("El anfitrión no puede liberar su plaza reservada");
        }

        plaza.setUsuario(null);
        plaza.setEstado(EstadoPlaza.DISPONIBLE);
        plaza.setFechaBaja(LocalDateTime.now());

        plazaRepository.save(plaza);
    }

    @Transactional
    public void pausarSuscripcion(Long idSuscripcion, Long idSolicitante) {
        var suscripcion = suscripcionRepository.findById(idSuscripcion)
                .orElseThrow(() -> new IllegalArgumentException("Suscripción no encontrada"));

        if (!suscripcion.getAnfitrion().getId().equals(idSolicitante)) {
            throw new IllegalArgumentException("Solo el anfitrión puede pausar la suscripción");
        }

        suscripcion.setEstado(EstadoSuscripcion.PAUSADA);
        suscripcionRepository.save(suscripcion);
    }

    @Transactional
    public void reactivarSuscripcion(Long idSuscripcion, Long idSolicitante) {
        var suscripcion = suscripcionRepository.findById(idSuscripcion)
                .orElseThrow(() -> new IllegalArgumentException("Suscripción no encontrada"));

        if (!suscripcion.getAnfitrion().getId().equals(idSolicitante)) {
            throw new IllegalArgumentException("Solo el anfitrión puede reactivar la suscripción");
        }

        if (suscripcion.getEstado() != EstadoSuscripcion.PAUSADA) {
            throw new IllegalArgumentException("Solo se pueden reactivar suscripciones pausadas");
        }

        suscripcion.setEstado(EstadoSuscripcion.ACTIVA);
        suscripcionRepository.save(suscripcion);
    }

    @Transactional
    public void cancelarSuscripcion(Long idSuscripcion, Long idSolicitante) {
        var suscripcion = suscripcionRepository.findById(idSuscripcion)
                .orElseThrow(() -> new IllegalArgumentException("Suscripción no encontrada"));

        if (!suscripcion.getAnfitrion().getId().equals(idSolicitante)) {
            throw new IllegalArgumentException("Solo el anfitrión puede cancelar la suscripción");
        }

        suscripcion.setEstado(EstadoSuscripcion.CANCELADA);
        suscripcionRepository.save(suscripcion);

        // Liberar todas las plazas ocupadas (excepto la del anfitrión para historial)
        var plazasOcupadas = plazaRepository.findBySuscripcionIdAndEstado(idSuscripcion, EstadoPlaza.OCUPADA);
        for (var plaza : plazasOcupadas) {
            if (!plaza.getEsPlazaAnfitrion()) {
                plaza.setEstado(EstadoPlaza.BLOQUEADA);
                plaza.setFechaBaja(LocalDateTime.now());
                plazaRepository.save(plaza);
            }
        }
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
