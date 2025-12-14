package com.alberti.joinly.entities.pago;

import com.alberti.joinly.entities.enums.EstadoDisputa;
import com.alberti.joinly.entities.enums.MotivoDisputa;
import com.alberti.joinly.entities.enums.ResolucionDisputa;
import com.alberti.joinly.entities.soporte.TicketSoporte;
import com.alberti.joinly.entities.usuario.Usuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Gestión formal de disputas sobre pagos.
 * Una disputa bloquea la liberación del pago hasta resolución.
 */
@Entity
@Table(name = "disputa", indexes = {
        @Index(name = "idx_disputa_pago", columnList = "id_pago"),
        @Index(name = "idx_disputa_estado_fecha", columnList = "estado, fecha_apertura"),
        @Index(name = "idx_disputa_reclamante", columnList = "id_reclamante")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"pago", "reclamante", "agenteResolutor", "ticketSoporte"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Disputa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_disputa")
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pago", nullable = false)
    @NotNull
    private Pago pago;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reclamante", nullable = false)
    @NotNull
    private Usuario reclamante;

    @Enumerated(EnumType.STRING)
    @Column(name = "motivo", nullable = false, length = 30)
    @NotNull
    private MotivoDisputa motivo;

    @NotBlank
    @Column(name = "descripcion", nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "evidencia_urls", columnDefinition = "JSON")
    private String evidenciaUrls;

    @Column(name = "fecha_apertura", nullable = false, updatable = false)
    private LocalDateTime fechaApertura;

    @Column(name = "fecha_resolucion")
    private LocalDateTime fechaResolucion;

    @Enumerated(EnumType.STRING)
    @Column(name = "resolucion", length = 20)
    private ResolucionDisputa resolucion;

    @Column(name = "monto_resuelto", precision = 10, scale = 2)
    private BigDecimal montoResuelto;

    @Column(name = "notas_resolucion", columnDefinition = "TEXT")
    private String notasResolucion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_agente_resolutor")
    private Usuario agenteResolutor;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private EstadoDisputa estado = EstadoDisputa.ABIERTA;

    // ==================== RELACIONES ====================

    @OneToOne(mappedBy = "disputa")
    private TicketSoporte ticketSoporte;

    @PrePersist
    protected void onCreate() {
        if (fechaApertura == null) {
            fechaApertura = LocalDateTime.now();
        }
    }
}
