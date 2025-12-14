package com.alberti.joinly.entities.suscripcion;

import com.alberti.joinly.entities.base.BaseEntity;
import com.alberti.joinly.entities.enums.CategoriaServicio;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Catálogo de servicios de suscripción disponibles.
 * max_usuarios define el límite real del servicio (ej: Netflix = 5).
 * precio_referencia es orientativo, el real lo define el anfitrión.
 */
@Entity
@Table(name = "servicio", indexes = {
        @Index(name = "idx_servicio_categoria_activo", columnList = "categoria, activo"),
        @Index(name = "idx_servicio_nombre", columnList = "nombre")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"suscripciones"})
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
public class Servicio extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_servicio")
    @EqualsAndHashCode.Include
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(name = "categoria", nullable = false, length = 20)
    @NotNull
    private CategoriaServicio categoria;

    @Size(max = 500)
    @Column(name = "logo", length = 500)
    private String logo;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Size(max = 500)
    @Column(name = "url_oficial", length = 500)
    private String urlOficial;

    @Column(name = "max_usuarios", nullable = false)
    @NotNull
    private Short maxUsuarios;

    @Column(name = "precio_referencia", precision = 10, scale = 2)
    private BigDecimal precioReferencia;

    @Size(min = 3, max = 3)
    @Column(name = "moneda_referencia", length = 3, columnDefinition = "CHAR(3)")
    @Builder.Default
    private String monedaReferencia = "EUR";

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;

    // ==================== RELACIONES ====================

    @OneToMany(mappedBy = "servicio", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Suscripcion> suscripciones = new ArrayList<>();
}
