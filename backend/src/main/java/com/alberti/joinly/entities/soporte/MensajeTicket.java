package com.alberti.joinly.entities.soporte;

import com.alberti.joinly.entities.usuario.Usuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Mensajes dentro de un ticket de soporte (conversación).
 * es_interno = true para notas internas del equipo de soporte.
 */
@Entity
@Table(name = "mensaje_ticket", indexes = {
        @Index(name = "idx_mensaje_ticket_fecha", columnList = "id_ticket, fecha_mensaje")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"ticket", "autor"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class MensajeTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_mensaje")
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ticket", nullable = false)
    @NotNull
    private TicketSoporte ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_autor", nullable = false)
    @NotNull
    private Usuario autor;

    @NotBlank
    @Column(name = "contenido", nullable = false, columnDefinition = "TEXT")
    private String contenido;

    @Column(name = "fecha_mensaje", nullable = false, updatable = false)
    private LocalDateTime fechaMensaje;

    @Column(name = "es_interno", nullable = false)
    @Builder.Default
    private Boolean esInterno = false;

    @Column(name = "adjuntos", columnDefinition = "JSON")
    private String adjuntos;

    @Column(name = "editado", nullable = false)
    @Builder.Default
    private Boolean editado = false;

    @Column(name = "fecha_edicion")
    private LocalDateTime fechaEdicion;

    @PrePersist
    protected void onCreate() {
        if (fechaMensaje == null) {
            fechaMensaje = LocalDateTime.now();
        }
    }
}
