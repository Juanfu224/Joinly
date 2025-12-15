package com.alberti.joinly.services;

import com.alberti.joinly.dto.soporte.CreateMensajeTicketRequest;
import com.alberti.joinly.dto.soporte.CreateTicketRequest;
import com.alberti.joinly.entities.enums.EstadoTicket;
import com.alberti.joinly.entities.soporte.MensajeTicket;
import com.alberti.joinly.entities.soporte.TicketSoporte;
import com.alberti.joinly.exceptions.BusinessException;
import com.alberti.joinly.exceptions.ResourceNotFoundException;
import com.alberti.joinly.exceptions.UnauthorizedException;
import com.alberti.joinly.repositories.*;
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
 * Servicio de gestión de tickets de soporte.
 * <p>
 * Sistema de atención al cliente que permite a usuarios reportar incidencias
 * y comunicarse con el equipo de soporte.
 * <p>
 * <b>Estados del ticket:</b>
 * <ul>
 *   <li>ABIERTO: Recién creado, sin agente asignado</li>
 *   <li>EN_PROCESO: Agente asignado trabajando</li>
 *   <li>PENDIENTE_USUARIO: Esperando respuesta del usuario</li>
 *   <li>RESUELTO: Problema solucionado</li>
 *   <li>CERRADO: Ticket cerrado definitivamente</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class TicketSoporteService {

    private static final int MAX_TICKETS_ACTIVOS_POR_USUARIO = 10;

    private final TicketSoporteRepository ticketRepository;
    private final MensajeTicketRepository mensajeRepository;
    private final UsuarioRepository usuarioRepository;
    private final SuscripcionRepository suscripcionRepository;
    private final PagoRepository pagoRepository;
    private final DisputaRepository disputaRepository;
    private final NotificacionService notificacionService;

    public Optional<TicketSoporte> buscarPorId(Long id) {
        return ticketRepository.findById(id);
    }

    public Optional<TicketSoporte> buscarPorIdConDetalles(Long id) {
        return ticketRepository.findByIdConDetalles(id);
    }

    public Page<TicketSoporte> listarTicketsUsuario(Long idUsuario, Pageable pageable) {
        return ticketRepository.findTicketsPorUsuario(idUsuario, pageable);
    }

    public List<TicketSoporte> listarTicketsSinAsignar() {
        return ticketRepository.findTicketsSinAsignar();
    }

    public List<TicketSoporte> listarTicketsAgente(Long idAgente) {
        return ticketRepository.findTicketsAsignadosAgente(
                idAgente,
                List.of(EstadoTicket.ABIERTO, EstadoTicket.EN_PROCESO, EstadoTicket.PENDIENTE_USUARIO)
        );
    }

    public long contarMensajesTicket(Long idTicket) {
        return mensajeRepository.contarMensajesPorTicket(idTicket);
    }

    /**
     * Crea un nuevo ticket de soporte.
     *
     * @param idUsuario ID del usuario que crea el ticket
     * @param request   Datos del ticket
     * @return Ticket creado
     */
    @Transactional
    public TicketSoporte crearTicket(Long idUsuario, CreateTicketRequest request) {
        log.info("Creando ticket: usuario={}, categoria={}", idUsuario, request.categoria());

        // Verificar límite de tickets activos
        var ticketsActivos = ticketRepository.contarTicketsActivosPorUsuario(idUsuario);
        if (ticketsActivos >= MAX_TICKETS_ACTIVOS_POR_USUARIO) {
            throw new BusinessException("Has alcanzado el límite de tickets activos (" + MAX_TICKETS_ACTIVOS_POR_USUARIO + ")");
        }

        var usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", idUsuario));

        var ticket = TicketSoporte.builder()
                .usuario(usuario)
                .asunto(request.asunto())
                .descripcion(request.descripcion())
                .categoria(request.categoria())
                .prioridad(request.prioridad() != null ? request.prioridad() : com.alberti.joinly.entities.enums.PrioridadTicket.MEDIA)
                .estado(EstadoTicket.ABIERTO)
                .build();

        // Asociar recursos relacionados si existen
        if (request.idSuscripcion() != null) {
            var suscripcion = suscripcionRepository.findById(request.idSuscripcion())
                    .orElseThrow(() -> new ResourceNotFoundException("Suscripción", "id", request.idSuscripcion()));
            ticket.setSuscripcion(suscripcion);
        }

        if (request.idPago() != null) {
            var pago = pagoRepository.findById(request.idPago())
                    .orElseThrow(() -> new ResourceNotFoundException("Pago", "id", request.idPago()));
            ticket.setPago(pago);
        }

        if (request.idDisputa() != null) {
            var disputa = disputaRepository.findById(request.idDisputa())
                    .orElseThrow(() -> new ResourceNotFoundException("Disputa", "id", request.idDisputa()));
            ticket.setDisputa(disputa);
        }

        var ticketGuardado = ticketRepository.save(ticket);
        log.info("Ticket creado: id={}", ticketGuardado.getId());

        return ticketGuardado;
    }

    /**
     * Asigna un agente a un ticket.
     */
    @Transactional
    public TicketSoporte asignarAgente(Long idTicket, Long idAgente) {
        log.info("Asignando agente {} a ticket {}", idAgente, idTicket);

        var ticket = ticketRepository.findById(idTicket)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", idTicket));

        var agente = usuarioRepository.findById(idAgente)
                .orElseThrow(() -> new ResourceNotFoundException("Agente", "id", idAgente));

        if (agente.getRol() != com.alberti.joinly.entities.enums.RolUsuario.AGENTE 
                && agente.getRol() != com.alberti.joinly.entities.enums.RolUsuario.ADMIN) {
            throw new BusinessException("El usuario no es agente de soporte");
        }

        ticket.setAgente(agente);
        ticket.setEstado(EstadoTicket.EN_PROCESO);

        return ticketRepository.save(ticket);
    }

    /**
     * Añade un mensaje a un ticket.
     *
     * @param idTicket ID del ticket
     * @param idAutor  ID del autor del mensaje
     * @param request  Contenido del mensaje
     * @return Mensaje creado
     */
    @Transactional
    public MensajeTicket agregarMensaje(Long idTicket, Long idAutor, CreateMensajeTicketRequest request) {
        log.debug("Agregando mensaje a ticket {}", idTicket);

        var ticket = ticketRepository.findById(idTicket)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", idTicket));

        var autor = usuarioRepository.findById(idAutor)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", idAutor));

        // Validar acceso
        var esUsuarioTicket = ticket.getUsuario().getId().equals(idAutor);
        var esAgente = autor.getRol() == com.alberti.joinly.entities.enums.RolUsuario.AGENTE 
                || autor.getRol() == com.alberti.joinly.entities.enums.RolUsuario.ADMIN;

        if (!esUsuarioTicket && !esAgente) {
            throw new UnauthorizedException("No tienes acceso a este ticket");
        }

        // Solo agentes pueden crear mensajes internos
        if (request.esInterno() && !esAgente) {
            throw new UnauthorizedException("Solo agentes pueden crear notas internas");
        }

        var mensaje = MensajeTicket.builder()
                .ticket(ticket)
                .autor(autor)
                .contenido(request.contenido())
                .esInterno(request.esInterno())
                .adjuntos(request.adjuntos())
                .build();

        // Actualizar primera respuesta si es agente
        if (esAgente && ticket.getFechaPrimeraRespuesta() == null && !request.esInterno()) {
            ticket.setFechaPrimeraRespuesta(LocalDateTime.now());
        }

        // Actualizar estado del ticket
        if (esAgente && !request.esInterno()) {
            ticket.setEstado(EstadoTicket.PENDIENTE_USUARIO);
        } else if (esUsuarioTicket && ticket.getEstado() == EstadoTicket.PENDIENTE_USUARIO) {
            ticket.setEstado(EstadoTicket.EN_PROCESO);
        }

        ticketRepository.save(ticket);

        var mensajeGuardado = mensajeRepository.save(mensaje);

        // Notificar al usuario si es respuesta de agente
        if (esAgente && !request.esInterno()) {
            notificacionService.crearNotificacion(
                    ticket.getUsuario().getId(),
                    com.alberti.joinly.entities.enums.TipoNotificacion.TICKET_RESPUESTA,
                    "Respuesta en tu ticket",
                    "Tienes una nueva respuesta en el ticket: " + ticket.getAsunto(),
                    "/soporte/tickets/" + idTicket,
                    null
            );
        }

        return mensajeGuardado;
    }

    /**
     * Obtiene los mensajes de un ticket.
     */
    public List<MensajeTicket> obtenerMensajes(Long idTicket, Long idUsuario) {
        if (!ticketRepository.existsById(idTicket)) {
            throw new ResourceNotFoundException("Ticket", "id", idTicket);
        }

        var usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", idUsuario));

        // Determinar si puede ver mensajes internos
        var incluirInternos = usuario.getRol() == com.alberti.joinly.entities.enums.RolUsuario.AGENTE 
                || usuario.getRol() == com.alberti.joinly.entities.enums.RolUsuario.ADMIN;

        return mensajeRepository.findMensajesPorTicket(idTicket, incluirInternos);
    }

    /**
     * Resuelve un ticket.
     */
    @Transactional
    public TicketSoporte resolverTicket(Long idTicket, Long idAgente) {
        log.info("Resolviendo ticket {}", idTicket);

        var ticket = ticketRepository.findById(idTicket)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", idTicket));

        var agente = usuarioRepository.findById(idAgente)
                .orElseThrow(() -> new ResourceNotFoundException("Agente", "id", idAgente));

        if (agente.getRol() != com.alberti.joinly.entities.enums.RolUsuario.AGENTE 
                && agente.getRol() != com.alberti.joinly.entities.enums.RolUsuario.ADMIN) {
            throw new UnauthorizedException("Solo agentes pueden resolver tickets");
        }

        ticket.setEstado(EstadoTicket.RESUELTO);

        return ticketRepository.save(ticket);
    }

    /**
     * Cierra un ticket con valoración opcional.
     */
    @Transactional
    public TicketSoporte cerrarTicket(Long idTicket, Long idUsuario, Short satisfaccion) {
        log.info("Cerrando ticket {}", idTicket);

        var ticket = ticketRepository.findById(idTicket)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", idTicket));

        // Solo el usuario o un agente puede cerrar
        var usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", idUsuario));

        var esUsuarioTicket = ticket.getUsuario().getId().equals(idUsuario);
        var esAgente = usuario.getRol() == com.alberti.joinly.entities.enums.RolUsuario.AGENTE 
                || usuario.getRol() == com.alberti.joinly.entities.enums.RolUsuario.ADMIN;

        if (!esUsuarioTicket && !esAgente) {
            throw new UnauthorizedException("No tienes permiso para cerrar este ticket");
        }

        ticket.setEstado(EstadoTicket.CERRADO);
        ticket.setFechaCierre(LocalDateTime.now());

        if (satisfaccion != null && esUsuarioTicket) {
            ticket.setSatisfaccion(satisfaccion);
        }

        return ticketRepository.save(ticket);
    }
}
