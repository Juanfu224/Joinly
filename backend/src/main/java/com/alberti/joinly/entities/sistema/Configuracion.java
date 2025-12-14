package com.alberti.joinly.entities.sistema;

import com.alberti.joinly.entities.enums.TipoConfiguracion;
import com.alberti.joinly.entities.usuario.Usuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Parámetros globales de configuración del sistema.
 * Valores iniciales sugeridos:
 * - 'comision_plataforma': '5' (porcentaje)
 * - 'dias_retencion_pago': '30'
 * - 'max_grupos_por_usuario': '10'
 * - 'max_suscripciones_grupo': '20'
 * - 'tiempo_expiracion_token': '3600' (segundos)
 * - 'moneda_defecto': 'EUR'
 */
@Entity
@Table(name = "configuracion")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"updatedBy"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Configuracion {

    @Id
    @Size(max = 50)
    @Column(name = "clave", length = 50)
    @EqualsAndHashCode.Include
    private String clave;

    @NotBlank
    @Column(name = "valor", nullable = false, columnDefinition = "TEXT")
    private String valor;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 20)
    @NotNull
    private TipoConfiguracion tipo;

    @Size(max = 255)
    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Size(max = 50)
    @Column(name = "categoria", length = 50)
    @Builder.Default
    private String categoria = "general";

    @Column(name = "modificable", nullable = false)
    @Builder.Default
    private Boolean modificable = true;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private Usuario updatedBy;
}
