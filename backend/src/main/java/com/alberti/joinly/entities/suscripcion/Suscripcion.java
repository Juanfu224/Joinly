package com.alberti.joinly.entities.suscripcion;

import com.alberti.joinly.entities.enums.EstadoSuscripcion;
import com.alberti.joinly.entities.enums.Periodicidad;
import com.alberti.joinly.entities.grupo.Solicitud;
import com.alberti.joinly.entities.grupo.UnidadFamiliar;
import com.alberti.joinly.entities.pago.Pago;
import com.alberti.joinly.entities.usuario.Usuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Suscripción compartida creada por un anfitrión dentro de un grupo.
 * Restricciones:
 * - num_plazas_total <= SERVICIO.max_usuarios (validar en aplicación)
 * - El anfitrión debe ser miembro de la unidad familiar
 * Notas:
 * - Si anfitrion_ocupa_plaza = true, se crea plaza automática para él
 * - precio_por_plaza = precio_total / plazas_pagantes
 */
@Entity
@Table(name = "suscripcion", indexes = {
        @Index(name = "idx_suscripcion_unidad_estado", columnList = "id_unidad, estado"),
        @Index(name = "idx_suscripcion_anfitrion", columnList = "id_anfitrion"),
        @Index(name = "idx_suscripcion_renovacion_estado", columnList = "fecha_renovacion, estado"),
        @Index(name = "idx_suscripcion_servicio", columnList = "id_servicio")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"servicio", "unidad", "anfitrion", "plazas", "credenciales", 
        "solicitudes", "pagos", "historialAnfitriones"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Suscripcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_suscripcion")
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_servicio", nullable = false)
    @NotNull
    private Servicio servicio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_unidad", nullable = false)
    @NotNull
    private UnidadFamiliar unidad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_anfitrion", nullable = false)
    @NotNull
    private Usuario anfitrion;

    @Column(name = "precio_total", nullable = false, precision = 10, scale = 2)
    @NotNull
    private BigDecimal precioTotal;

    @Size(min = 3, max = 3)
    @Column(name = "moneda", length = 3, columnDefinition = "CHAR(3)")
    @Builder.Default
    private String moneda = "EUR";

    @Column(name = "precio_por_plaza", nullable = false, precision = 10, scale = 2)
    @NotNull
    private BigDecimal precioPorPlaza;

    @Column(name = "num_plazas_total", nullable = false)
    @NotNull
    private Short numPlazasTotal;

    @Column(name = "anfitrion_ocupa_plaza", nullable = false)
    @Builder.Default
    private Boolean anfitrionOcupaPlaza = true;

    @Column(name = "fecha_inicio", nullable = false)
    @NotNull
    private LocalDate fechaInicio;

    @Column(name = "fecha_renovacion", nullable = false)
    @NotNull
    private LocalDate fechaRenovacion;

    @Enumerated(EnumType.STRING)
    @Column(name = "periodicidad", nullable = false, length = 20)
    @NotNull
    private Periodicidad periodicidad;

    @Column(name = "renovacion_automatica", nullable = false)
    @Builder.Default
    private Boolean renovacionAutomatica = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private EstadoSuscripcion estado = EstadoSuscripcion.ACTIVA;

    @Column(name = "notas", columnDefinition = "TEXT")
    private String notas;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ==================== RELACIONES ====================

    @OneToMany(mappedBy = "suscripcion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Plaza> plazas = new ArrayList<>();

    @OneToMany(mappedBy = "suscripcion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Credencial> credenciales = new ArrayList<>();

    @OneToMany(mappedBy = "suscripcion", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Solicitud> solicitudes = new ArrayList<>();

    @OneToMany(mappedBy = "suscripcion", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Pago> pagos = new ArrayList<>();

    @OneToMany(mappedBy = "suscripcion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<HistorialAnfitrion> historialAnfitriones = new ArrayList<>();
}
