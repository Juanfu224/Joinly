package com.alberti.joinly.entities.usuario;

import com.alberti.joinly.entities.base.BaseEntity;
import com.alberti.joinly.entities.enums.EstadoUsuario;
import com.alberti.joinly.entities.enums.RolUsuario;
import com.alberti.joinly.entities.grupo.MiembroUnidad;
import com.alberti.joinly.entities.grupo.Solicitud;
import com.alberti.joinly.entities.grupo.UnidadFamiliar;
import com.alberti.joinly.entities.notificacion.Notificacion;
import com.alberti.joinly.entities.pago.Disputa;
import com.alberti.joinly.entities.pago.Pago;
import com.alberti.joinly.entities.soporte.MensajeTicket;
import com.alberti.joinly.entities.soporte.TicketSoporte;
import com.alberti.joinly.entities.suscripcion.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Representa a cada persona registrada en la plataforma.
 * <p>
 * Los usuarios tienen asignado un rol que determina sus permisos:
 * {@link RolUsuario#USER}, {@link RolUsuario#AGENTE} o {@link RolUsuario#ADMIN}.
 * <p>
 * Permite soft delete mediante estado = ELIMINADO.
 */
@Entity
@Table(name = "usuario", indexes = {
        @Index(name = "idx_usuario_estado_registro", columnList = "estado, fecha_registro"),
        @Index(name = "idx_usuario_es_agente", columnList = "es_agente_soporte")
})
@SQLRestriction("estado <> 'ELIMINADO'")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"tokens", "metodosPago", "unidadesAdministradas", "membresías", 
        "solicitudesEnviadas", "solicitudesAprobadas", "suscripcionesAnfitrion", 
        "plazasOcupadas", "pagos", "ticketsAbiertos", "ticketsAsignados", 
        "mensajesTicket", "notificaciones", "disputasReclamadas", "disputasResueltas",
        "historialAnfitrionAnterior", "historialAnfitrionNuevo", "historialCredenciales"})
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
public class Usuario extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    @EqualsAndHashCode.Include
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @NotBlank
    @Email
    @Size(max = 150)
    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank
    @Size(max = 255)
    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "email_verificado", nullable = false)
    @Builder.Default
    private Boolean emailVerificado = false;

    @Size(max = 500)
    @Column(name = "avatar", length = 500)
    private String avatar;

    @Size(max = 20)
    @Column(name = "telefono", length = 20)
    private String telefono;

    @Size(max = 10)
    @Column(name = "tema_preferido", length = 10)
    private String temaPreferido;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private EstadoUsuario estado = EstadoUsuario.ACTIVO;

    @Column(name = "fecha_ultimo_acceso")
    private LocalDateTime fechaUltimoAcceso;

    @Enumerated(EnumType.STRING)
    @Column(name = "rol", nullable = false, length = 20)
    @Builder.Default
    private RolUsuario rol = RolUsuario.USER;

    /**
     * @deprecated Usar campo {@link #rol} en su lugar.
     * Se mantiene temporalmente para compatibilidad con datos existentes.
     */
    @Deprecated(since = "1.1", forRemoval = true)
    @Column(name = "es_agente_soporte", nullable = false)
    @Builder.Default
    private Boolean esAgenteSoporte = false;

    // ==================== RELACIONES ====================

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Token> tokens = new ArrayList<>();

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<MetodoPagoUsuario> metodosPago = new ArrayList<>();

    @OneToMany(mappedBy = "administrador", cascade = CascadeType.PERSIST, fetch = FetchType.LAZY)
    @Builder.Default
    private List<UnidadFamiliar> unidadesAdministradas = new ArrayList<>();

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<MiembroUnidad> membresías = new ArrayList<>();

    @OneToMany(mappedBy = "solicitante", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Solicitud> solicitudesEnviadas = new ArrayList<>();

    @OneToMany(mappedBy = "aprobador", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Solicitud> solicitudesAprobadas = new ArrayList<>();

    @OneToMany(mappedBy = "anfitrion", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Suscripcion> suscripcionesAnfitrion = new ArrayList<>();

    @OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Plaza> plazasOcupadas = new ArrayList<>();

    @OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Pago> pagos = new ArrayList<>();

    @OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY)
    @Builder.Default
    private List<TicketSoporte> ticketsAbiertos = new ArrayList<>();

    @OneToMany(mappedBy = "agente", fetch = FetchType.LAZY)
    @Builder.Default
    private List<TicketSoporte> ticketsAsignados = new ArrayList<>();

    @OneToMany(mappedBy = "autor", fetch = FetchType.LAZY)
    @Builder.Default
    private List<MensajeTicket> mensajesTicket = new ArrayList<>();

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Notificacion> notificaciones = new ArrayList<>();

    @OneToMany(mappedBy = "reclamante", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Disputa> disputasReclamadas = new ArrayList<>();

    @OneToMany(mappedBy = "agenteResolutor", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Disputa> disputasResueltas = new ArrayList<>();

    @OneToMany(mappedBy = "anfitrionAnterior", fetch = FetchType.LAZY)
    @Builder.Default
    private List<HistorialAnfitrion> historialAnfitrionAnterior = new ArrayList<>();

    @OneToMany(mappedBy = "anfitrionNuevo", fetch = FetchType.LAZY)
    @Builder.Default
    private List<HistorialAnfitrion> historialAnfitrionNuevo = new ArrayList<>();

    @OneToMany(mappedBy = "usuarioCambio", fetch = FetchType.LAZY)
    @Builder.Default
    private List<HistorialCredencial> historialCredenciales = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (fechaRegistro == null) {
            fechaRegistro = LocalDateTime.now();
        }
    }
}
