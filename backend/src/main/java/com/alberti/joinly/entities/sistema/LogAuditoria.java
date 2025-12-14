package com.alberti.joinly.entities.sistema;

import com.alberti.joinly.entities.usuario.Usuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Registro de acciones críticas para auditoría y seguridad.
 * Acciones a registrar:
 * - login, logout, login_fallido
 * - crear_suscripcion, cancelar_suscripcion
 * - pago_realizado, pago_fallido, reembolso
 * - cambio_credenciales, acceso_credenciales
 * - disputa_abierta, disputa_resuelta
 * - cambio_password, recuperacion_password
 */
@Entity
@Table(name = "log_auditoria", indexes = {
        @Index(name = "idx_log_usuario_fecha", columnList = "id_usuario, fecha"),
        @Index(name = "idx_log_entidad", columnList = "entidad, id_entidad"),
        @Index(name = "idx_log_accion_fecha", columnList = "accion, fecha")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"usuario"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class LogAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_log")
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @NotBlank
    @Size(max = 100)
    @Column(name = "accion", nullable = false, length = 100)
    private String accion;

    @NotBlank
    @Size(max = 50)
    @Column(name = "entidad", nullable = false, length = 50)
    private String entidad;

    @Column(name = "id_entidad")
    private Long idEntidad;

    @Column(name = "datos_anteriores", columnDefinition = "JSON")
    private String datosAnteriores;

    @Column(name = "datos_nuevos", columnDefinition = "JSON")
    private String datosNuevos;

    @Size(max = 45)
    @Column(name = "ip", length = 45)
    private String ip;

    @Size(max = 500)
    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "fecha", nullable = false, updatable = false)
    private LocalDateTime fecha;

    @PrePersist
    protected void onCreate() {
        if (fecha == null) {
            fecha = LocalDateTime.now();
        }
    }
}
