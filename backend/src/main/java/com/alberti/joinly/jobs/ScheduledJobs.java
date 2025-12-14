package com.alberti.joinly.jobs;

import com.alberti.joinly.repositories.SuscripcionRepository;
import com.alberti.joinly.repositories.TokenRepository;
import com.alberti.joinly.services.NotificacionService;
import com.alberti.joinly.services.PagoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Tareas programadas del sistema Joinly.
 * <p>
 * Ejecuta procesos automáticos de mantenimiento y negocio:
 * <ul>
 *   <li>Limpieza de tokens expirados (diario a las 02:00)</li>
 *   <li>Liberación de pagos retenidos (diario a las 03:00)</li>
 *   <li>Notificación de renovaciones próximas (diario a las 09:00)</li>
 *   <li>Limpieza de notificaciones antiguas (semanal)</li>
 * </ul>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ScheduledJobs {

    @Value("${joinly.jobs.enabled:true}")
    private boolean jobsEnabled;

    @Value("${joinly.jobs.dias-aviso-renovacion:3}")
    private int diasAvisoRenovacion;

    @Value("${joinly.jobs.dias-limpiar-notificaciones:90}")
    private int diasLimpiarNotificaciones;

    private final TokenRepository tokenRepository;
    private final SuscripcionRepository suscripcionRepository;
    private final PagoService pagoService;
    private final NotificacionService notificacionService;

    /**
     * Elimina tokens expirados de la base de datos.
     * Ejecuta diariamente a las 02:00.
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void limpiarTokensExpirados() {
        if (!jobsEnabled) return;

        log.info("Iniciando limpieza de tokens expirados");
        var ahora = LocalDateTime.now();
        var eliminados = tokenRepository.eliminarTokensExpirados(ahora);
        log.info("Limpieza de tokens completada: {} tokens eliminados", eliminados);
    }

    /**
     * Libera automáticamente los pagos cuyo período de retención ha terminado.
     * Solo libera pagos sin disputas activas.
     * Ejecuta diariamente a las 03:00.
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void liberarPagosRetenidos() {
        if (!jobsEnabled) return;

        log.info("Iniciando liberación automática de pagos");

        var pagosParaLiberar = pagoService.obtenerPagosParaLiberar();
        var liberados = 0;
        var errores = 0;

        for (var pago : pagosParaLiberar) {
            try {
                pagoService.liberarPago(pago.getId());
                liberados++;
            } catch (Exception e) {
                log.error("Error liberando pago {}: {}", pago.getId(), e.getMessage());
                errores++;
            }
        }

        log.info("Liberación de pagos completada: {} liberados, {} errores", liberados, errores);
    }

    /**
     * Envía notificaciones a usuarios cuyas suscripciones se renuevan pronto.
     * Ejecuta diariamente a las 09:00.
     */
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional
    public void notificarRenovacionesProximas() {
        if (!jobsEnabled) return;

        log.info("Iniciando notificación de renovaciones próximas");

        var hoy = LocalDate.now();
        var fechaLimite = hoy.plusDays(diasAvisoRenovacion);
        var suscripciones = suscripcionRepository.findSuscripcionesProximasARenovar(
                hoy,
                fechaLimite
        );

        var notificados = 0;
        var formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        for (var suscripcion : suscripciones) {
            try {
                // Notificar al anfitrión
                notificacionService.notificarRenovacionProxima(
                        suscripcion.getAnfitrion().getId(),
                        suscripcion.getServicio().getNombre(),
                        suscripcion.getFechaRenovacion().format(formatter)
                );

                // Notificar a los usuarios con plaza ocupada
                for (var plaza : suscripcion.getPlazas()) {
                    if (plaza.getUsuario() != null && !plaza.getEsPlazaAnfitrion()) {
                        notificacionService.notificarRenovacionProxima(
                                plaza.getUsuario().getId(),
                                suscripcion.getServicio().getNombre(),
                                suscripcion.getFechaRenovacion().format(formatter)
                        );
                        notificados++;
                    }
                }
                notificados++;
            } catch (Exception e) {
                log.error("Error notificando renovación para suscripción {}: {}",
                        suscripcion.getId(), e.getMessage());
            }
        }

        log.info("Notificación de renovaciones completada: {} usuarios notificados", notificados);
    }

    /**
     * Limpia notificaciones antiguas ya leídas.
     * Ejecuta semanalmente los domingos a las 04:00.
     */
    @Scheduled(cron = "0 0 4 * * SUN")
    @Transactional
    public void limpiarNotificacionesAntiguas() {
        if (!jobsEnabled) return;

        log.info("Iniciando limpieza de notificaciones antiguas");
        var eliminadas = notificacionService.limpiarNotificacionesAntiguas(diasLimpiarNotificaciones);
        log.info("Limpieza de notificaciones completada: {} eliminadas", eliminadas);
    }

    /**
     * Job manual para verificar el estado del sistema de jobs.
     * Ejecuta cada hora para logging de salud.
     */
    @Scheduled(fixedRate = 3600000)
    public void healthCheck() {
        if (!jobsEnabled) {
            log.debug("Jobs deshabilitados en configuración");
            return;
        }
        log.debug("Sistema de jobs activo - Health check OK");
    }
}
