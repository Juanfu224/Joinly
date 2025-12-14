package com.alberti.joinly.entities.grupo;

import com.alberti.joinly.entities.base.BaseEntity;
import com.alberti.joinly.entities.enums.EstadoUnidadFamiliar;
import com.alberti.joinly.entities.suscripcion.Suscripcion;
import com.alberti.joinly.entities.usuario.Usuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Grupo de usuarios que comparten suscripciones entre sí.
 * El código de invitación se genera automáticamente (alfanumérico 12 chars).
 * El administrador se añade automáticamente como miembro al crear.
 */
@Entity
@Table(name = "unidad_familiar", indexes = {
        @Index(name = "idx_unidad_administrador", columnList = "id_administrador"),
        @Index(name = "idx_unidad_estado", columnList = "estado")
})
@SQLRestriction("estado <> 'ELIMINADO'")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = { "administrador", "miembros", "suscripciones", "solicitudes" })
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
public class UnidadFamiliar extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_unidad")
    @EqualsAndHashCode.Include
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @NotBlank
    @Size(min = 12, max = 12)
    @Column(name = "codigo_invitacion", nullable = false, unique = true, length = 12, columnDefinition = "CHAR(12)")
    private String codigoInvitacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_administrador", nullable = false)
    @NotNull
    private Usuario administrador;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Size(max = 500)
    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @Column(name = "max_miembros", nullable = false)
    @Builder.Default
    private Short maxMiembros = 10;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private EstadoUnidadFamiliar estado = EstadoUnidadFamiliar.ACTIVO;

    // ==================== RELACIONES ====================

    @OneToMany(mappedBy = "unidad", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<MiembroUnidad> miembros = new ArrayList<>();

    @OneToMany(mappedBy = "unidad", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Suscripcion> suscripciones = new ArrayList<>();

    @OneToMany(mappedBy = "unidad", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Solicitud> solicitudes = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
    }
}
