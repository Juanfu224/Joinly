package com.alberti.joinly.services;

import com.alberti.joinly.entities.enums.EstadoPago;
import com.alberti.joinly.entities.pago.Pago;
import com.alberti.joinly.entities.usuario.MetodoPagoUsuario;
import com.alberti.joinly.exceptions.BusinessException;
import com.alberti.joinly.exceptions.ResourceNotFoundException;
import com.alberti.joinly.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Servicio de gestión de pagos de suscripciones.
 * <p>
 * Implementa el ciclo completo de vida de un pago:
 * <ol>
 *   <li>Creación y cobro vía pasarela (Stripe/PayPal)</li>
 *   <li>Retención por período configurable (default 30 días)</li>
 *   <li>Liberación automática al anfitrión si no hay disputas</li>
 *   <li>Reembolsos totales o parciales</li>
 * </ol>
 * <p>
 * <b>Estados del pago:</b>
 * <ul>
 *   <li>PENDIENTE: Creado, esperando confirmación de pasarela</li>
 *   <li>RETENIDO: Cobrado exitosamente, fondos retenidos</li>
 *   <li>LIBERADO: Fondos transferidos al anfitrión</li>
 *   <li>FALLIDO: Rechazado por pasarela</li>
 *   <li>DISPUTADO: Bloqueado por disputa abierta</li>
 *   <li>REEMBOLSADO: Devuelto al usuario</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class PagoService {

    @Value("${joinly.pagos.dias-retencion:30}")
    private int diasRetencion;

    private final PagoRepository pagoRepository;
    private final PlazaRepository plazaRepository;
    private final MetodoPagoRepository metodoPagoRepository;
    private final DisputaRepository disputaRepository;
    private final NotificacionService notificacionService;

    public Optional<Pago> buscarPorId(Long id) {
        return pagoRepository.findById(id);
    }

    public Optional<Pago> buscarPorIdConDetalles(Long id) {
        return pagoRepository.findByIdConDetalles(id);
    }

    public Page<Pago> listarPagosUsuario(Long idUsuario, Pageable pageable) {
        return pagoRepository.findPagosConDetallesPorUsuario(idUsuario, pageable);
    }

    /**
     * Lista los pagos de un usuario con filtros opcionales.
     *
     * @param idUsuario ID del usuario
     * @param estado Estado del pago (opcional)
     * @param fechaDesde Fecha inicio del rango (opcional)
     * @param fechaHasta Fecha fin del rango (opcional)
     * @param pageable Información de paginación y ordenamiento
     * @return Página de pagos que cumplen los criterios
     */
    public Page<Pago> listarPagosUsuarioConFiltros(
            Long idUsuario,
            EstadoPago estado,
            LocalDate fechaDesde,
            LocalDate fechaHasta,
            Pageable pageable) {
        return pagoRepository.findPagosConDetallesPorUsuarioWithFilters(idUsuario, estado, fechaDesde, fechaHasta, pageable);
    }

    public List<Pago> listarPagosSuscripcion(Long idSuscripcion) {
        return pagoRepository.findPagosPorSuscripcion(idSuscripcion);
    }

    /**
     * Procesa un nuevo pago para una plaza de suscripción.
     * <p>
     * Flujo:
     * <ol>
     *   <li>Valida que la plaza esté ocupada por el usuario</li>
     *   <li>Verifica que no exista pago duplicado para el ciclo</li>
     *   <li>Procesa el cobro vía pasarela de pagos</li>
     *   <li>Registra el pago con estado RETENIDO</li>
     *   <li>Envía notificación al usuario</li>
     * </ol>
     *
     * @param idUsuario     ID del usuario que paga
     * @param idPlaza       ID de la plaza
     * @param idMetodoPago  ID del método de pago a usar
     * @param monto         Monto a cobrar
     * @return Pago registrado
     */
    @Transactional
    public Pago procesarPago(Long idUsuario, Long idPlaza, Long idMetodoPago, BigDecimal monto) {
        log.info("Procesando pago: usuario={}, plaza={}, monto={}", idUsuario, idPlaza, monto);

        var plaza = plazaRepository.findById(idPlaza)
                .orElseThrow(() -> new ResourceNotFoundException("Plaza", "id", idPlaza));

        // Validar que el usuario tiene la plaza
        if (plaza.getUsuario() == null || !plaza.getUsuario().getId().equals(idUsuario)) {
            throw new BusinessException("No tienes asignada esta plaza");
        }

        var suscripcion = plaza.getSuscripcion();
        var metodoPago = metodoPagoRepository.findById(idMetodoPago)
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago", "id", idMetodoPago));

        // Validar que el método pertenece al usuario
        if (!metodoPago.getUsuario().getId().equals(idUsuario)) {
            throw new BusinessException("El método de pago no pertenece al usuario");
        }

        // Calcular ciclo de facturación
        var cicloInicio = LocalDate.now();
        var cicloFin = calcularFinCiclo(cicloInicio, suscripcion.getPeriodicidad());

        // Verificar que no exista pago para este ciclo
        if (pagoRepository.existsByPlazaIdAndCicloInicioAndCicloFin(idPlaza, cicloInicio, cicloFin)) {
            throw new BusinessException("Ya existe un pago para este período");
        }

        // Simular procesamiento con pasarela (en producción: integrar Stripe)
        var referenciaExterna = procesarConPasarela(metodoPago, monto);

        var pago = Pago.builder()
                .usuario(plaza.getUsuario())
                .plaza(plaza)
                .suscripcion(suscripcion)
                .metodoPago(metodoPago)
                .monto(monto)
                .moneda(suscripcion.getMoneda())
                .fechaPago(LocalDateTime.now())
                .fechaRetencionHasta(LocalDate.now().plusDays(diasRetencion))
                .referenciaExterna(referenciaExterna)
                .estado(EstadoPago.RETENIDO)
                .cicloInicio(cicloInicio)
                .cicloFin(cicloFin)
                .build();

        var pagoGuardado = pagoRepository.save(pago);

        // Notificar al usuario
        notificacionService.notificarPagoExitoso(
                idUsuario,
                suscripcion.getServicio().getNombre(),
                monto + " " + suscripcion.getMoneda()
        );

        log.info("Pago procesado exitosamente: id={}, referencia={}", pagoGuardado.getId(), referenciaExterna);
        return pagoGuardado;
    }

    /**
     * Libera un pago retenido al anfitrión.
     * Solo se puede liberar si no hay disputas activas.
     */
    @Transactional
    public Pago liberarPago(Long idPago) {
        log.info("Liberando pago: {}", idPago);

        var pago = pagoRepository.findById(idPago)
                .orElseThrow(() -> new ResourceNotFoundException("Pago", "id", idPago));

        if (pago.getEstado() != EstadoPago.RETENIDO) {
            throw new BusinessException("Solo se pueden liberar pagos en estado RETENIDO");
        }

        // Verificar que no haya disputas activas
        var disputasActivas = disputaRepository.contarDisputasActivasPorPago(idPago);
        if (disputasActivas > 0) {
            throw new BusinessException("No se puede liberar el pago: existen disputas activas");
        }

        pago.setEstado(EstadoPago.LIBERADO);
        pago.setFechaLiberacion(LocalDateTime.now());

        log.info("Pago {} liberado exitosamente", idPago);
        return pagoRepository.save(pago);
    }

    /**
     * Procesa un reembolso total o parcial.
     */
    @Transactional
    public Pago procesarReembolso(Long idPago, BigDecimal montoReembolso, String motivo) {
        log.info("Procesando reembolso: pago={}, monto={}", idPago, montoReembolso);

        var pago = pagoRepository.findById(idPago)
                .orElseThrow(() -> new ResourceNotFoundException("Pago", "id", idPago));

        var montoDisponible = pago.getMonto().subtract(pago.getMontoReembolsado());
        if (montoReembolso.compareTo(montoDisponible) > 0) {
            throw new BusinessException("El monto de reembolso excede el disponible: " + montoDisponible);
        }

        // Simular reembolso en pasarela
        procesarReembolsoEnPasarela(pago.getReferenciaExterna(), montoReembolso);

        pago.setMontoReembolsado(pago.getMontoReembolsado().add(montoReembolso));

        // Actualizar estado según monto reembolsado
        if (pago.getMontoReembolsado().compareTo(pago.getMonto()) >= 0) {
            pago.setEstado(EstadoPago.REEMBOLSADO);
        } else {
            pago.setEstado(EstadoPago.REEMBOLSO_PARCIAL);
        }

        log.info("Reembolso procesado: pago={}, montoReembolsado={}", idPago, pago.getMontoReembolsado());
        return pagoRepository.save(pago);
    }

    /**
     * Obtiene pagos listos para ser liberados (fin de retención sin disputas).
     */
    public List<Pago> obtenerPagosParaLiberar() {
        return pagoRepository.findPagosListosParaLiberar(EstadoPago.RETENIDO, LocalDate.now());
    }

    /**
     * Marca un pago como disputado.
     */
    @Transactional
    public void marcarComoDisputado(Long idPago) {
        var pago = pagoRepository.findById(idPago)
                .orElseThrow(() -> new ResourceNotFoundException("Pago", "id", idPago));

        if (pago.getEstado() == EstadoPago.LIBERADO) {
            throw new BusinessException("No se puede disputar un pago ya liberado");
        }

        pago.setEstado(EstadoPago.DISPUTADO);
        pagoRepository.save(pago);
    }

    private LocalDate calcularFinCiclo(LocalDate inicio, com.alberti.joinly.entities.enums.Periodicidad periodicidad) {
        return switch (periodicidad) {
            case MENSUAL -> inicio.plusMonths(1);
            case TRIMESTRAL -> inicio.plusMonths(3);
            case SEMESTRAL -> inicio.plusMonths(6);
            case ANUAL -> inicio.plusYears(1);
        };
    }

    private String procesarConPasarela(MetodoPagoUsuario metodoPago, BigDecimal monto) {
        // TODO: Integrar con Stripe API
        // Por ahora, simular referencia de transacción
        return "PAY_" + System.currentTimeMillis() + "_" + metodoPago.getId();
    }

    private void procesarReembolsoEnPasarela(String referenciaOriginal, BigDecimal monto) {
        // TODO: Integrar con Stripe Refunds API
        log.debug("Simulando reembolso en pasarela: ref={}, monto={}", referenciaOriginal, monto);
    }
}
