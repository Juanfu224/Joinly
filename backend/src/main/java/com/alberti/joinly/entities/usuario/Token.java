package com.alberti.joinly.entities.usuario;

import com.alberti.joinly.entities.enums.TipoToken;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Tokens para recuperación de contraseña, verificación de email
 * y gestión de sesiones (refresh tokens).
 * - Los tokens de recuperación expiran en 1 hora
 * - Los refresh tokens expiran en 30 días
 * - Al usar un token, marcar usado = true (no borrar, para auditoría)
 */
@Entity
@Table(name = "token", indexes = {
        @Index(name = "idx_token_usuario_tipo", columnList = "id_usuario, tipo, usado"),
        @Index(name = "idx_token_expiracion", columnList = "fecha_expiracion")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"usuario"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_token")
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    @NotNull
    private Usuario usuario;

    @NotBlank
    @Size(max = 255)
    @Column(name = "token", nullable = false, unique = true, length = 255)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 20)
    @NotNull
    private TipoToken tipo;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_expiracion", nullable = false)
    @NotNull
    private LocalDateTime fechaExpiracion;

    @Column(name = "usado", nullable = false)
    @Builder.Default
    private Boolean usado = false;

    @Size(max = 45)
    @Column(name = "ip_creacion", length = 45)
    private String ipCreacion;

    @Size(max = 500)
    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @PrePersist
    protected void onCreate() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
    }
}
