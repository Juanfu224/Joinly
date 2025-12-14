package com.alberti.joinly.entities.suscripcion;

import com.alberti.joinly.entities.enums.TipoCredencial;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Información de acceso compartida para una suscripción.
 * El valor se almacena encriptado con AES-256.
 * Solo visible para usuarios con plaza ocupada y estado aprobado.
 */
@Entity
@Table(name = "credencial", indexes = {
        @Index(name = "idx_credencial_suscripcion", columnList = "id_suscripcion")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"suscripcion", "historial"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Credencial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_credencial")
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_suscripcion", nullable = false)
    @NotNull
    private Suscripcion suscripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 20)
    @NotNull
    private TipoCredencial tipo;

    @NotBlank
    @Size(max = 50)
    @Column(name = "etiqueta", nullable = false, length = 50)
    private String etiqueta;

    @NotBlank
    @Column(name = "valor_encriptado", nullable = false, columnDefinition = "TEXT")
    private String valorEncriptado;

    @Column(name = "instrucciones", columnDefinition = "TEXT")
    private String instrucciones;

    @LastModifiedDate
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @Column(name = "visible_para_miembros", nullable = false)
    @Builder.Default
    private Boolean visibleParaMiembros = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ==================== RELACIONES ====================

    @OneToMany(mappedBy = "credencial", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<HistorialCredencial> historial = new ArrayList<>();
}
