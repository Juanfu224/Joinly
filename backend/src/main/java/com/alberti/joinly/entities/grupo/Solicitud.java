package com.alberti.joinly.entities.grupo;

import com.alberti.joinly.entities.enums.EstadoSolicitud;
import com.alberti.joinly.entities.enums.TipoSolicitud;
import com.alberti.joinly.entities.suscripcion.Suscripcion;
import com.alberti.joinly.entities.usuario.Usuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Peticiones de unión a grupos o suscripciones.
 * Restricción: (id_unidad IS NOT NULL AND id_suscripcion IS NULL)
 * OR (id_unidad IS NULL AND id_suscripcion IS NOT NULL)
 * No puede existir más de 1 solicitud pendiente del mismo usuario al mismo
 * destino.
 */
@Entity
@Table(name = "solicitud", indexes = {
        @Index(name = "idx_solicitud_solicitante_estado", columnList = "id_solicitante, estado"),
        @Index(name = "idx_solicitud_unidad_estado", columnList = "id_unidad, estado"),
        @Index(name = "idx_solicitud_suscripcion_estado", columnList = "id_suscripcion, estado"),
        @Index(name = "idx_solicitud_fecha", columnList = "fecha_solicitud")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = { "solicitante", "unidad", "suscripcion", "aprobador" })
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    @EqualsAndHashCode.Include
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_solicitud", nullable = false, length = 20)
    @NotNull
    private TipoSolicitud tipoSolicitud;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_solicitante", nullable = false)
    @NotNull
    private Usuario solicitante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_unidad")
    private UnidadFamiliar unidad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_suscripcion")
    private Suscripcion suscripcion;

    @Size(max = 500)
    @Column(name = "mensaje", length = 500)
    private String mensaje;

    @Column(name = "fecha_solicitud", nullable = false, updatable = false)
    private LocalDateTime fechaSolicitud;

    @Column(name = "fecha_respuesta")
    private LocalDateTime fechaRespuesta;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private EstadoSolicitud estado = EstadoSolicitud.PENDIENTE;

    @Size(max = 255)
    @Column(name = "motivo_rechazo", length = 255)
    private String motivoRechazo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_aprobador")
    private Usuario aprobador;

    @PrePersist
    protected void onCreate() {
        if (fechaSolicitud == null) {
            fechaSolicitud = LocalDateTime.now();
        }
    }
}
