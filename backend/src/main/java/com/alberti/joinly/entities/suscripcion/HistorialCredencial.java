package com.alberti.joinly.entities.suscripcion;

import com.alberti.joinly.entities.usuario.Usuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Registro de cambios en credenciales (auditoría).
 * Se crea registro automáticamente al modificar una credencial.
 * Permite detectar cambios no autorizados.
 */
@Entity
@Table(name = "historial_credencial", indexes = {
        @Index(name = "idx_historial_cred_fecha", columnList = "id_credencial, fecha_cambio")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"credencial", "usuarioCambio"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class HistorialCredencial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial")
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_credencial", nullable = false)
    @NotNull
    private Credencial credencial;

    @NotBlank
    @Column(name = "valor_anterior_encriptado", nullable = false, columnDefinition = "TEXT")
    private String valorAnteriorEncriptado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_cambio", nullable = false)
    @NotNull
    private Usuario usuarioCambio;

    @Column(name = "fecha_cambio", nullable = false, updatable = false)
    private LocalDateTime fechaCambio;

    @Size(max = 45)
    @Column(name = "ip_cambio", length = 45)
    private String ipCambio;

    @PrePersist
    protected void onCreate() {
        if (fechaCambio == null) {
            fechaCambio = LocalDateTime.now();
        }
    }
}
