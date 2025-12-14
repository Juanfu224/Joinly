package com.alberti.joinly.entities.notificacion;

import com.alberti.joinly.entities.enums.TipoNotificacion;
import com.alberti.joinly.entities.usuario.Usuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Notificaciones enviadas a los usuarios.
 * fecha_lectura NULL = no leída.
 * Se puede enviar también por email/push.
 */
@Entity
@Table(name = "notificacion", indexes = {
        @Index(name = "idx_notificacion_usuario_lectura", columnList = "id_usuario, fecha_lectura"),
        @Index(name = "idx_notificacion_fecha_creacion", columnList = "fecha_creacion")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"usuario"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notificacion")
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    @NotNull
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 30)
    @NotNull
    private TipoNotificacion tipo;

    @NotBlank
    @Size(max = 200)
    @Column(name = "titulo", nullable = false, length = 200)
    private String titulo;

    @NotBlank
    @Column(name = "mensaje", nullable = false, columnDefinition = "TEXT")
    private String mensaje;

    @Size(max = 500)
    @Column(name = "url_accion", length = 500)
    private String urlAccion;

    @Column(name = "datos_extra", columnDefinition = "JSON")
    private String datosExtra;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_lectura")
    private LocalDateTime fechaLectura;

    @Column(name = "fecha_envio_email")
    private LocalDateTime fechaEnvioEmail;

    @Column(name = "enviado_push", nullable = false)
    @Builder.Default
    private Boolean enviadoPush = false;

    @PrePersist
    protected void onCreate() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
    }
}
