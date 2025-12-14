package com.alberti.joinly.entities.suscripcion;

import com.alberti.joinly.entities.enums.EstadoPlaza;
import com.alberti.joinly.entities.pago.Pago;
import com.alberti.joinly.entities.usuario.Usuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Cada espacio disponible en una suscripción compartida.
 * Restricciones:
 * - UNIQUE(id_suscripcion, id_usuario) WHERE id_usuario IS NOT NULL
 *   (Un usuario solo puede ocupar una plaza por suscripción)
 * - UNIQUE(id_suscripcion, numero_plaza)
 * Notas:
 * - es_plaza_anfitrion = true para la plaza del creador (si aplica)
 */
@Entity
@Table(name = "plaza", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"id_suscripcion", "numero_plaza"}),
       indexes = {
           @Index(name = "idx_plaza_suscripcion_estado", columnList = "id_suscripcion, estado"),
           @Index(name = "idx_plaza_usuario", columnList = "id_usuario")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"suscripcion", "usuario", "pagos"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Plaza {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_plaza")
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_suscripcion", nullable = false)
    @NotNull
    private Suscripcion suscripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Column(name = "numero_plaza", nullable = false)
    @NotNull
    private Short numeroPlaza;

    @Column(name = "es_plaza_anfitrion", nullable = false)
    @Builder.Default
    private Boolean esPlazaAnfitrion = false;

    @Column(name = "fecha_ocupacion")
    private LocalDateTime fechaOcupacion;

    @Column(name = "fecha_baja")
    private LocalDateTime fechaBaja;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private EstadoPlaza estado = EstadoPlaza.DISPONIBLE;

    // ==================== RELACIONES ====================

    @OneToMany(mappedBy = "plaza", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Pago> pagos = new ArrayList<>();
}
