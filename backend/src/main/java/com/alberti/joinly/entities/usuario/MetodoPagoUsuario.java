package com.alberti.joinly.entities.usuario;

import com.alberti.joinly.entities.enums.EstadoMetodoPago;
import com.alberti.joinly.entities.enums.TipoMetodoPago;
import com.alberti.joinly.entities.pago.Pago;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Métodos de pago guardados por cada usuario (tokenizados).
 * NUNCA almacenar datos completos de tarjeta (PCI-DSS).
 * Solo un método puede ser predeterminado por usuario.
 */
@Entity
@Table(name = "metodo_pago_usuario", indexes = {
        @Index(name = "idx_metodo_pago_usuario", columnList = "id_usuario, es_predeterminado"),
        @Index(name = "idx_metodo_pago_estado", columnList = "estado")
})
@SQLRestriction("estado <> 'ELIMINADO'")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"usuario", "pagos"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class MetodoPagoUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_metodo")
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    @NotNull
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 20)
    @NotNull
    private TipoMetodoPago tipo;

    @Size(min = 4, max = 4)
    @Column(name = "ultimos_digitos", length = 4, columnDefinition = "CHAR(4)")
    private String ultimosDigitos;

    @Size(max = 20)
    @Column(name = "marca", length = 20)
    private String marca;

    @NotBlank
    @Size(max = 255)
    @Column(name = "token_pasarela", nullable = false, length = 255)
    private String tokenPasarela;

    @Column(name = "fecha_expiracion")
    private LocalDate fechaExpiracion;

    @Column(name = "es_predeterminado", nullable = false)
    @Builder.Default
    private Boolean esPredeterminado = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private EstadoMetodoPago estado = EstadoMetodoPago.ACTIVO;

    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    // ==================== RELACIONES ====================

    @OneToMany(mappedBy = "metodoPago", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Pago> pagos = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (fechaRegistro == null) {
            fechaRegistro = LocalDateTime.now();
        }
    }
}
