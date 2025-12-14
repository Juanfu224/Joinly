package com.alberti.joinly.entities.grupo;

import com.alberti.joinly.entities.enums.EstadoMiembro;
import com.alberti.joinly.entities.enums.RolMiembro;
import com.alberti.joinly.entities.usuario.Usuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Relaciona usuarios con unidades familiares (pertenencia activa).
 * Solo se crea registro cuando una SOLICITUD es aprobada.
 * Un usuario solo puede estar una vez en cada grupo (UNIQUE).
 */
@Entity
@Table(name = "miembro_unidad", uniqueConstraints = @UniqueConstraint(columnNames = { "id_usuario",
        "id_unidad" }), indexes = {
                @Index(name = "idx_miembro_unidad_estado", columnList = "id_unidad, estado"),
                @Index(name = "idx_miembro_usuario_estado", columnList = "id_usuario, estado")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = { "usuario", "unidad" })
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class MiembroUnidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_miembro")
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    @NotNull
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_unidad", nullable = false)
    @NotNull
    private UnidadFamiliar unidad;

    @Enumerated(EnumType.STRING)
    @Column(name = "rol", nullable = false, length = 20)
    @Builder.Default
    private RolMiembro rol = RolMiembro.MIEMBRO;

    @Column(name = "fecha_union", nullable = false, updatable = false)
    private LocalDateTime fechaUnion;

    @Column(name = "fecha_baja")
    private LocalDateTime fechaBaja;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private EstadoMiembro estado = EstadoMiembro.ACTIVO;

    @PrePersist
    protected void onCreate() {
        if (fechaUnion == null) {
            fechaUnion = LocalDateTime.now();
        }
    }
}
