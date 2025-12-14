package com.alberti.joinly.services;

import com.alberti.joinly.entities.enums.TipoNotificacion;
import com.alberti.joinly.entities.notificacion.Notificacion;
import com.alberti.joinly.entities.usuario.Usuario;
import com.alberti.joinly.exceptions.ResourceNotFoundException;
import com.alberti.joinly.repositories.NotificacionRepository;
import com.alberti.joinly.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Servicio de gestión de notificaciones.
 * <p>
 * Permite crear y gestionar notificaciones para usuarios, incluyendo
 * marcado de lectura y limpieza automática de notificaciones antiguas.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;

    public Page<Notificacion> obtenerNotificacionesPaginadas(Long idUsuario, Pageable pageable) {
        return notificacionRepository.findNotificacionesPorUsuario(idUsuario, pageable);
    }

    public List<Notificacion> obtenerNoLeidas(Long idUsuario) {
        return notificacionRepository.findNotificacionesNoLeidasPorUsuario(idUsuario);
    }

    public long contarNoLeidas(Long idUsuario) {
        return notificacionRepository.contarNoLeidasPorUsuario(idUsuario);
    }

    @Transactional
    public void marcarComoLeida(Long idNotificacion, Long idUsuario) {
        var notificacion = notificacionRepository.findById(idNotificacion)
                .orElseThrow(() -> new ResourceNotFoundException("Notificación", "id", idNotificacion));

        if (!notificacion.getUsuario().getId().equals(idUsuario)) {
            throw new ResourceNotFoundException("Notificación", "id", idNotificacion);
        }

        notificacionRepository.marcarComoLeida(idNotificacion, LocalDateTime.now());
    }

    @Transactional
    public int marcarTodasComoLeidas(Long idUsuario) {
        return notificacionRepository.marcarTodasComoLeidas(idUsuario, LocalDateTime.now());
    }

    /**
     * Crea una notificación para un usuario.
     *
     * @param idUsuario ID del usuario destinatario
     * @param tipo      Tipo de notificación
     * @param titulo    Título de la notificación
     * @param mensaje   Cuerpo del mensaje
     * @param urlAccion URL opcional para acción directa
     * @param datosExtra JSON con metadatos adicionales
     * @return Notificación creada
     */
    @Transactional
    public Notificacion crearNotificacion(
            Long idUsuario,
            TipoNotificacion tipo,
            String titulo,
            String mensaje,
            String urlAccion,
            String datosExtra) {

        var usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", idUsuario));

        var notificacion = Notificacion.builder()
                .usuario(usuario)
                .tipo(tipo)
                .titulo(titulo)
                .mensaje(mensaje)
                .urlAccion(urlAccion)
                .datosExtra(datosExtra)
                .build();

        log.debug("Creando notificación tipo {} para usuario {}", tipo, idUsuario);
        return notificacionRepository.save(notificacion);
    }

    /**
     * Notifica a un usuario sobre una solicitud recibida.
     */
    @Transactional
    public void notificarSolicitudRecibida(Usuario destinatario, String nombreSolicitante, String destino) {
        crearNotificacion(
                destinatario.getId(),
                TipoNotificacion.SOLICITUD_RECIBIDA,
                "Nueva solicitud de unión",
                String.format("%s ha solicitado unirse a %s", nombreSolicitante, destino),
                "/solicitudes/pendientes",
                null
        );
    }

    /**
     * Notifica a un usuario sobre la aprobación de su solicitud.
     */
    @Transactional
    public void notificarSolicitudAprobada(Long idUsuario, String nombreDestino) {
        crearNotificacion(
                idUsuario,
                TipoNotificacion.SOLICITUD_APROBADA,
                "¡Solicitud aprobada!",
                String.format("Tu solicitud para unirte a %s ha sido aprobada", nombreDestino),
                "/mis-suscripciones",
                null
        );
    }

    /**
     * Notifica sobre un pago exitoso.
     */
    @Transactional
    public void notificarPagoExitoso(Long idUsuario, String nombreServicio, String monto) {
        crearNotificacion(
                idUsuario,
                TipoNotificacion.PAGO_EXITOSO,
                "Pago procesado correctamente",
                String.format("Tu pago de %s para %s ha sido procesado", monto, nombreServicio),
                "/mis-pagos",
                null
        );
    }

    /**
     * Notifica sobre un pago fallido.
     */
    @Transactional
    public void notificarPagoFallido(Long idUsuario, String nombreServicio, String motivo) {
        crearNotificacion(
                idUsuario,
                TipoNotificacion.PAGO_FALLIDO,
                "Error en el pago",
                String.format("No pudimos procesar tu pago para %s. %s", nombreServicio, motivo),
                "/metodos-pago",
                null
        );
    }

    /**
     * Notifica sobre próxima renovación.
     */
    @Transactional
    public void notificarRenovacionProxima(Long idUsuario, String nombreServicio, String fechaRenovacion) {
        crearNotificacion(
                idUsuario,
                TipoNotificacion.RENOVACION,
                "Renovación próxima",
                String.format("Tu suscripción de %s se renovará el %s", nombreServicio, fechaRenovacion),
                "/mis-suscripciones",
                null
        );
    }

    /**
     * Elimina notificaciones antiguas ya leídas (para mantenimiento).
     */
    @Transactional
    public int limpiarNotificacionesAntiguas(int diasAntiguedad) {
        var fechaLimite = LocalDateTime.now().minusDays(diasAntiguedad);
        int eliminadas = notificacionRepository.eliminarNotificacionesAntiguasLeidas(fechaLimite);
        log.info("Eliminadas {} notificaciones anteriores a {}", eliminadas, fechaLimite);
        return eliminadas;
    }
}
