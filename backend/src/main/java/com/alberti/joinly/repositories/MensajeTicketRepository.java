package com.alberti.joinly.repositories;

import com.alberti.joinly.entities.soporte.MensajeTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MensajeTicketRepository extends JpaRepository<MensajeTicket, Long> {

    @Query("""
            SELECT m FROM MensajeTicket m
            JOIN FETCH m.autor
            WHERE m.ticket.id = :idTicket
            AND (:incluirInternos = true OR m.esInterno = false)
            ORDER BY m.fechaMensaje ASC
            """)
    List<MensajeTicket> findMensajesPorTicket(
            @Param("idTicket") Long idTicket,
            @Param("incluirInternos") boolean incluirInternos);

    @Query("""
            SELECT m FROM MensajeTicket m
            JOIN FETCH m.autor
            WHERE m.ticket.id = :idTicket
            AND m.esInterno = false
            ORDER BY m.fechaMensaje DESC
            """)
    Page<MensajeTicket> findMensajesPublicosPaginados(
            @Param("idTicket") Long idTicket,
            Pageable pageable);

    @Query("SELECT COUNT(m) FROM MensajeTicket m WHERE m.ticket.id = :idTicket")
    long contarMensajesPorTicket(@Param("idTicket") Long idTicket);
}
