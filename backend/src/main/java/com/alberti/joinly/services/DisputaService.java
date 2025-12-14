package com.alberti.joinly.services;

import com.alberti.joinly.dto.disputa.CreateDisputaRequest;
import com.alberti.joinly.dto.disputa.ResolverDisputaRequest;
import com.alberti.joinly.entities.enums.EstadoDisputa;
import com.alberti.joinly.entities.enums.EstadoPago;
import com.alberti.joinly.entities.pago.Disputa;
import com.alberti.joinly.exceptions.BusinessException;
import com.alberti.joinly.exceptions.ResourceNotFoundException;
import com.alberti.joinly.exceptions.UnauthorizedException;
import com.alberti.joinly.repositories.DisputaRepository;
import com.alberti.joinly.repositories.PagoRepository;
import com.alberti.joinly.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Servicio de gestión de disputas sobre pagos.
 * <p>
 * Una disputa permite a los usuarios reclamar cuando hay problemas con
 * el servicio por el que pagaron (credenciales inválidas, sin acceso, etc.).
 * <p>
 * <b>Flujo de disputa:</b>
 * <ol>
 *   <li>Usuario abre disputa → pago se marca como DISPUTADO</li>
 *   <li>Agente de soporte revisa la disputa</li>
 *   <li>Agente resuelve: a favor usuario (reembolso) o anfitrión (liberar pago)</li>
 *   <li>Si hay reembolso, se procesa automáticamente</li>
 * </ol>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class DisputaService {

    private final DisputaRepository disputaRepository;
    private final PagoRepository pagoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PagoService pagoService;
    private final NotificacionService notificacionService;

    public Optional<Disputa> buscarPorId(Long id) {
        return disputaRepository.findById(id);
    }

    public Optional<Disputa> buscarPorIdConDetalles(Long id) {
        return disputaRepository.findByIdConDetalles(id);
    }

    public Page<Disputa> listarDisputasUsuario(Long idUsuario, Pageable pageable) {
        return disputaRepository.findDisputasPorReclamante(idUsuario, pageable);
    }

    public List<Disputa> listarDisputasPendientes() {
        return disputaRepository.findDisputasPorEstados(
                List.of(EstadoDisputa.ABIERTA, EstadoDisputa.EN_REVISION)
        );
    }

    public List<Disputa> listarDisputasAsignadas(Long idAgente) {
        return disputaRepository.findDisputasAsignadasAgente(idAgente);
    }

    /**
     * Abre una nueva disputa sobre un pago.
     * <p>
     * Condiciones:
     * <ul>
     *   <li>El pago debe pertenecer al usuario</li>
     *   <li>El pago no puede estar ya liberado</li>
     *   <li>No puede haber otra disputa activa sobre el mismo pago</li>
     * </ul>
     *
     * @param idReclamante ID del usuario que abre la disputa
     * @param request      Datos de la disputa
     * @return Disputa creada
     */
    @Transactional
    public Disputa abrirDisputa(Long idReclamante, CreateDisputaRequest request) {
        log.info("Abriendo disputa: usuario={}, pago={}", idReclamante, request.idPago());

        var pago = pagoRepository.findById(request.idPago())
                .orElseThrow(() -> new ResourceNotFoundException("Pago", "id", request.idPago()));

        // Validar que el pago pertenece al usuario
        if (!pago.getUsuario().getId().equals(idReclamante)) {
            throw new UnauthorizedException("No puedes disputar un pago que no es tuyo");
        }

        // Validar que el pago no esté liberado
        if (pago.getEstado() == EstadoPago.LIBERADO) {
            throw new BusinessException("No se puede disputar un pago ya liberado");
        }

        // Validar que no haya disputa activa
        var existeDisputaActiva = disputaRepository.existsByPagoIdAndEstadoIn(
                request.idPago(),
                List.of(EstadoDisputa.ABIERTA, EstadoDisputa.EN_REVISION)
        );
        if (existeDisputaActiva) {
            throw new BusinessException("Ya existe una disputa activa para este pago");
        }

        var reclamante = usuarioRepository.findById(idReclamante)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", idReclamante));

        var disputa = Disputa.builder()
                .pago(pago)
                .reclamante(reclamante)
                .motivo(request.motivo())
                .descripcion(request.descripcion())
                .evidenciaUrls(request.evidenciaUrls())
                .estado(EstadoDisputa.ABIERTA)
                .build();

        // Marcar el pago como disputado
        pagoService.marcarComoDisputado(request.idPago());

        var disputaGuardada = disputaRepository.save(disputa);

        log.info("Disputa creada: id={}", disputaGuardada.getId());
        return disputaGuardada;
    }

    /**
     * Asigna un agente de soporte a una disputa y la pasa a revisión.
     */
    @Transactional
    public Disputa asignarAgente(Long idDisputa, Long idAgente) {
        log.info("Asignando agente {} a disputa {}", idAgente, idDisputa);

        var disputa = disputaRepository.findById(idDisputa)
                .orElseThrow(() -> new ResourceNotFoundException("Disputa", "id", idDisputa));

        var agente = usuarioRepository.findById(idAgente)
                .orElseThrow(() -> new ResourceNotFoundException("Agente", "id", idAgente));

        if (!agente.getEsAgenteSoporte()) {
            throw new BusinessException("El usuario no es agente de soporte");
        }

        disputa.setAgenteResolutor(agente);
        disputa.setEstado(EstadoDisputa.EN_REVISION);

        return disputaRepository.save(disputa);
    }

    /**
     * Resuelve una disputa.
     * <p>
     * Según la resolución:
     * <ul>
     *   <li>FAVOR_USUARIO / REEMBOLSO_TOTAL: Reembolso completo</li>
     *   <li>REEMBOLSO_PARCIAL: Reembolso del monto especificado</li>
     *   <li>FAVOR_ANFITRION: Se libera el pago normalmente</li>
     * </ul>
     *
     * @param idDisputa ID de la disputa
     * @param idAgente  ID del agente que resuelve
     * @param request   Datos de la resolución
     * @return Disputa resuelta
     */
    @Transactional
    public Disputa resolverDisputa(Long idDisputa, Long idAgente, ResolverDisputaRequest request) {
        log.info("Resolviendo disputa {}: resolución={}", idDisputa, request.resolucion());

        var disputa = disputaRepository.findByIdConDetalles(idDisputa)
                .orElseThrow(() -> new ResourceNotFoundException("Disputa", "id", idDisputa));

        if (disputa.getEstado() == EstadoDisputa.RESUELTA || disputa.getEstado() == EstadoDisputa.CERRADA) {
            throw new BusinessException("La disputa ya está resuelta");
        }

        var agente = usuarioRepository.findById(idAgente)
                .orElseThrow(() -> new ResourceNotFoundException("Agente", "id", idAgente));

        if (!agente.getEsAgenteSoporte()) {
            throw new UnauthorizedException("Solo agentes de soporte pueden resolver disputas");
        }

        disputa.setAgenteResolutor(agente);
        disputa.setResolucion(request.resolucion());
        disputa.setNotasResolucion(request.notasResolucion());
        disputa.setFechaResolucion(LocalDateTime.now());
        disputa.setEstado(EstadoDisputa.RESUELTA);

        var pago = disputa.getPago();

        // Aplicar resolución
        switch (request.resolucion()) {
            case FAVOR_USUARIO, REEMBOLSO_TOTAL -> {
                disputa.setMontoResuelto(pago.getMonto());
                pagoService.procesarReembolso(pago.getId(), pago.getMonto(), "Disputa resuelta a favor del usuario");
            }
            case REEMBOLSO_PARCIAL -> {
                var monto = request.montoResuelto() != null ? request.montoResuelto() : pago.getMonto();
                disputa.setMontoResuelto(monto);
                pagoService.procesarReembolso(pago.getId(), monto, "Reembolso parcial por disputa");
            }
            case FAVOR_ANFITRION -> {
                disputa.setMontoResuelto(java.math.BigDecimal.ZERO);
                // Restaurar estado del pago para liberación normal
                pago.setEstado(EstadoPago.RETENIDO);
                pagoRepository.save(pago);
            }
        }

        var disputaResuelta = disputaRepository.save(disputa);

        // Notificar al usuario
        notificacionService.crearNotificacion(
                disputa.getReclamante().getId(),
                com.alberti.joinly.entities.enums.TipoNotificacion.DISPUTA_RESUELTA,
                "Disputa resuelta",
                String.format("Tu disputa ha sido resuelta: %s", request.resolucion().name()),
                "/mis-disputas/" + idDisputa,
                null
        );

        log.info("Disputa {} resuelta con resolución: {}", idDisputa, request.resolucion());
        return disputaResuelta;
    }
}
