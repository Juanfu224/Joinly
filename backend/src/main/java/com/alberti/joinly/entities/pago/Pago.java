package com.alberti.joinly.entities.pago;

import com.alberti.joinly.entities.enums.EstadoPago;
import com.alberti.joinly.entities.suscripcion.Plaza;
import com.alberti.joinly.entities.suscripcion.Suscripcion;
import com.alberti.joinly.entities.usuario.MetodoPagoUsuario;
import com.alberti.joinly.entities.usuario.Usuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Registro de transacciones y pagos de los miembros.
 * - Estado 'FALLIDO' para pagos rechazados por la pasarela
 * - monto_reembolsado permite reembolsos parciales
 * - id_suscripcion desnormalizado para optimizar consultas
 */
@Entity
@Table(name = "pago", indexes = {
        @Index(name = "idx_pago_usuario_estado", columnList = "id_usuario, estado"),
        @Index(name = "idx_pago_plaza", columnList = "id_plaza"),
        @Index(name = "idx_pago_suscripcion_ciclo", columnList = "id_suscripcion, ciclo_inicio"),
        @Index(name = "idx_pago_estado_retencion", columnList = "estado, fecha_retencion_hasta"),
        @Index(name = "idx_pago_referencia", columnList = "referencia_externa")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"usuario", "plaza", "suscripcion", "metodoPago", "disputas"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago")
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    @NotNull
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_plaza", nullable = false)
    @NotNull
    private Plaza plaza;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_suscripcion", nullable = false)
    @NotNull
    private Suscripcion suscripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_metodo_pago", nullable = false)
    @NotNull
    private MetodoPagoUsuario metodoPago;

    @Column(name = "monto", nullable = false, precision = 10, scale = 2)
    @NotNull
    private BigDecimal monto;

    @Size(min = 3, max = 3)
    @Column(name = "moneda", length = 3, columnDefinition = "CHAR(3)")
    @Builder.Default
    private String moneda = "EUR";

    @Column(name = "monto_reembolsado", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal montoReembolsado = BigDecimal.ZERO;

    @Column(name = "fecha_pago", nullable = false, updatable = false)
    private LocalDateTime fechaPago;

    @Column(name = "fecha_retencion_hasta", nullable = false)
    @NotNull
    private LocalDate fechaRetencionHasta;

    @Column(name = "fecha_liberacion")
    private LocalDateTime fechaLiberacion;

    @Size(max = 100)
    @Column(name = "referencia_externa", length = 100)
    private String referenciaExterna;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private EstadoPago estado = EstadoPago.PENDIENTE;

    @Column(name = "ciclo_inicio", nullable = false)
    @NotNull
    private LocalDate cicloInicio;

    @Column(name = "ciclo_fin", nullable = false)
    @NotNull
    private LocalDate cicloFin;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ==================== RELACIONES ====================

    @OneToMany(mappedBy = "pago", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Disputa> disputas = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (fechaPago == null) {
            fechaPago = LocalDateTime.now();
        }
    }
}
