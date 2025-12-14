package com.alberti.joinly.entities.soporte;

import com.alberti.joinly.entities.enums.CategoriaTicket;
import com.alberti.joinly.entities.enums.EstadoTicket;
import com.alberti.joinly.entities.enums.PrioridadTicket;
import com.alberti.joinly.entities.pago.Disputa;
import com.alberti.joinly.entities.pago.Pago;
import com.alberti.joinly.entities.suscripcion.Suscripcion;
import com.alberti.joinly.entities.usuario.Usuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Incidencias y problemas reportados por los usuarios.
 * id_agente referencia a USUARIO donde es_agente_soporte = true.
 */
@Entity
@Table(name = "ticket_soporte", indexes = {
        @Index(name = "idx_ticket_usuario_estado", columnList = "id_usuario, estado"),
        @Index(name = "idx_ticket_agente_estado", columnList = "id_agente, estado"),
        @Index(name = "idx_ticket_estado_prioridad", columnList = "estado, prioridad, fecha_apertura")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"usuario", "suscripcion", "pago", "disputa", "agente", "mensajes"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class TicketSoporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ticket")
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    @NotNull
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_suscripcion")
    private Suscripcion suscripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pago")
    private Pago pago;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_disputa")
    private Disputa disputa;

    @NotBlank
    @Size(max = 200)
    @Column(name = "asunto", nullable = false, length = 200)
    private String asunto;

    @NotBlank
    @Column(name = "descripcion", nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "categoria", nullable = false, length = 20)
    @NotNull
    private CategoriaTicket categoria;

    @Enumerated(EnumType.STRING)
    @Column(name = "prioridad", nullable = false, length = 20)
    @Builder.Default
    private PrioridadTicket prioridad = PrioridadTicket.MEDIA;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private EstadoTicket estado = EstadoTicket.ABIERTO;

    @Column(name = "fecha_apertura", nullable = false, updatable = false)
    private LocalDateTime fechaApertura;

    @Column(name = "fecha_primera_respuesta")
    private LocalDateTime fechaPrimeraRespuesta;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_agente")
    private Usuario agente;

    @Min(1)
    @Max(5)
    @Column(name = "satisfaccion")
    private Short satisfaccion;

    // ==================== RELACIONES ====================

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<MensajeTicket> mensajes = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (fechaApertura == null) {
            fechaApertura = LocalDateTime.now();
        }
    }
}
