package com.alberti.joinly.entities.suscripcion;

import com.alberti.joinly.entities.usuario.Usuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Registro de transferencias de propiedad de suscripciones.
 * Permite auditar quién ha sido anfitrión de cada suscripción.
 */
@Entity
@Table(name = "historial_anfitrion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"suscripcion", "anfitrionAnterior", "anfitrionNuevo"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class HistorialAnfitrion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial")
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_suscripcion", nullable = false)
    @NotNull
    private Suscripcion suscripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_anfitrion_anterior", nullable = false)
    @NotNull
    private Usuario anfitrionAnterior;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_anfitrion_nuevo", nullable = false)
    @NotNull
    private Usuario anfitrionNuevo;

    @Column(name = "fecha_transferencia", nullable = false, updatable = false)
    private LocalDateTime fechaTransferencia;

    @Size(max = 255)
    @Column(name = "motivo", length = 255)
    private String motivo;

    @PrePersist
    protected void onCreate() {
        if (fechaTransferencia == null) {
            fechaTransferencia = LocalDateTime.now();
        }
    }
}
