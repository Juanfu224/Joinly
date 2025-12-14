-- =====================================================
-- Flyway Migration V1: Initial Schema for Joinly
-- Database: MySQL 8.x
-- Author: Sistema de Migraciones Automatizadas
-- Date: 2025
-- =====================================================

-- =====================================================
-- 1. TABLAS BASE (sin dependencias)
-- =====================================================

-- Tabla: usuario
-- Usuarios registrados en la plataforma
CREATE TABLE usuario (
    id_usuario BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    fecha_registro DATETIME NOT NULL,
    email_verificado BOOLEAN NOT NULL DEFAULT FALSE,
    avatar VARCHAR(500),
    telefono VARCHAR(20),
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    fecha_ultimo_acceso DATETIME,
    es_agente_soporte BOOLEAN NOT NULL DEFAULT FALSE,
    
    CONSTRAINT uk_usuario_email UNIQUE (email),
    CONSTRAINT chk_usuario_estado CHECK (estado IN ('ACTIVO', 'SUSPENDIDO', 'ELIMINADO'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para usuario
CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_estado ON usuario(estado);

-- Tabla: servicio
-- Catálogo de servicios de streaming disponibles
CREATE TABLE servicio (
    id_servicio BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(20) NOT NULL,
    logo VARCHAR(500),
    descripcion TEXT,
    url_oficial VARCHAR(500),
    max_usuarios SMALLINT,
    precio_referencia DECIMAL(10,2),
    moneda_referencia CHAR(3) DEFAULT 'EUR',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    
    CONSTRAINT uk_servicio_nombre UNIQUE (nombre),
    CONSTRAINT chk_servicio_categoria CHECK (categoria IN ('STREAMING', 'MUSICA', 'VPN', 'GAMING', 'SOFTWARE', 'ALMACENAMIENTO', 'OTROS'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para servicio
CREATE INDEX idx_servicio_categoria_activo ON servicio(categoria, activo);

-- Tabla: configuracion
-- Parámetros globales de configuración del sistema
CREATE TABLE configuracion (
    clave VARCHAR(50) PRIMARY KEY,
    valor TEXT NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    descripcion VARCHAR(255),
    categoria VARCHAR(50) DEFAULT 'general',
    modificable BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at DATETIME,
    updated_by BIGINT,
    
    CONSTRAINT fk_configuracion_usuario FOREIGN KEY (updated_by) REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    CONSTRAINT chk_configuracion_tipo CHECK (tipo IN ('STRING', 'NUMBER', 'BOOLEAN', 'JSON'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. TABLAS DE USUARIO (dependencias de usuario)
-- =====================================================

-- Tabla: token
-- Tokens de verificación, recuperación y refresh
CREATE TABLE token (
    id_token BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    token VARCHAR(512) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    fecha_creacion DATETIME NOT NULL,
    fecha_expiracion DATETIME NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    ip_creacion VARCHAR(45),
    user_agent VARCHAR(500),
    
    CONSTRAINT fk_token_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT uk_token_token UNIQUE (token),
    CONSTRAINT chk_token_tipo CHECK (tipo IN ('RECUPERACION', 'VERIFICACION', 'REFRESH_TOKEN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para token
CREATE INDEX idx_token_usuario_tipo ON token(id_usuario, tipo);
CREATE INDEX idx_token_expiracion ON token(fecha_expiracion);

-- Tabla: metodo_pago_usuario
-- Métodos de pago guardados por los usuarios
CREATE TABLE metodo_pago_usuario (
    id_metodo BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    ultimos_digitos CHAR(4),
    marca VARCHAR(50),
    token_pasarela VARCHAR(255),
    fecha_expiracion DATE,
    es_predeterminado BOOLEAN NOT NULL DEFAULT FALSE,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    fecha_registro DATETIME NOT NULL,
    
    CONSTRAINT fk_metodo_pago_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT chk_metodo_tipo CHECK (tipo IN ('TARJETA', 'PAYPAL', 'CUENTA_BANCARIA')),
    CONSTRAINT chk_metodo_estado CHECK (estado IN ('ACTIVO', 'EXPIRADO', 'ELIMINADO'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para metodo_pago_usuario
CREATE INDEX idx_metodo_usuario_estado ON metodo_pago_usuario(id_usuario, estado);

-- Tabla: notificacion
-- Notificaciones enviadas a los usuarios
CREATE TABLE notificacion (
    id_notificacion BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    url_accion VARCHAR(500),
    datos_extra JSON,
    fecha_creacion DATETIME NOT NULL,
    fecha_lectura DATETIME,
    fecha_envio_email DATETIME,
    enviado_push BOOLEAN NOT NULL DEFAULT FALSE,
    
    CONSTRAINT fk_notificacion_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT chk_notificacion_tipo CHECK (tipo IN (
        'SOLICITUD_RECIBIDA', 'SOLICITUD_APROBADA', 'SOLICITUD_RECHAZADA',
        'PAGO_PENDIENTE', 'PAGO_EXITOSO', 'PAGO_FALLIDO',
        'SUSCRIPCION_PROXIMA', 'SUSCRIPCION_CANCELADA',
        'CREDENCIALES_ACTUALIZADAS', 'PLAZA_LIBERADA',
        'TICKET_RESPUESTA', 'DISPUTA_ABIERTA', 'DISPUTA_RESUELTA',
        'SISTEMA'
    ))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para notificacion
CREATE INDEX idx_notificacion_usuario_lectura ON notificacion(id_usuario, fecha_lectura);
CREATE INDEX idx_notificacion_fecha_creacion ON notificacion(fecha_creacion);

-- Tabla: log_auditoria
-- Registro de acciones críticas para auditoría y seguridad
CREATE TABLE log_auditoria (
    id_log BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT,
    accion VARCHAR(100) NOT NULL,
    entidad VARCHAR(50) NOT NULL,
    id_entidad BIGINT,
    datos_anteriores JSON,
    datos_nuevos JSON,
    ip VARCHAR(45),
    user_agent VARCHAR(500),
    fecha DATETIME NOT NULL,
    
    CONSTRAINT fk_log_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para log_auditoria
CREATE INDEX idx_log_usuario_fecha ON log_auditoria(id_usuario, fecha);
CREATE INDEX idx_log_entidad ON log_auditoria(entidad, id_entidad);
CREATE INDEX idx_log_accion_fecha ON log_auditoria(accion, fecha);

-- =====================================================
-- 3. TABLAS DE GRUPO (Unidad Familiar)
-- =====================================================

-- Tabla: unidad_familiar
-- Grupos para compartir suscripciones
CREATE TABLE unidad_familiar (
    id_unidad BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo_invitacion CHAR(12) NOT NULL,
    id_administrador BIGINT NOT NULL,
    fecha_creacion DATETIME NOT NULL,
    descripcion VARCHAR(500),
    max_miembros SMALLINT NOT NULL DEFAULT 6,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    
    CONSTRAINT fk_unidad_administrador FOREIGN KEY (id_administrador) REFERENCES usuario(id_usuario) ON DELETE RESTRICT,
    CONSTRAINT uk_unidad_codigo UNIQUE (codigo_invitacion),
    CONSTRAINT chk_unidad_estado CHECK (estado IN ('ACTIVO', 'INACTIVO', 'ELIMINADO'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para unidad_familiar
CREATE INDEX idx_unidad_admin ON unidad_familiar(id_administrador);
CREATE INDEX idx_unidad_estado ON unidad_familiar(estado);

-- Tabla: miembro_unidad
-- Relación entre usuarios y unidades familiares
CREATE TABLE miembro_unidad (
    id_miembro BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    id_unidad BIGINT NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'MIEMBRO',
    fecha_union DATETIME NOT NULL,
    fecha_baja DATETIME,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    
    CONSTRAINT fk_miembro_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_miembro_unidad FOREIGN KEY (id_unidad) REFERENCES unidad_familiar(id_unidad) ON DELETE CASCADE,
    CONSTRAINT uk_miembro_usuario_unidad UNIQUE (id_usuario, id_unidad),
    CONSTRAINT chk_miembro_rol CHECK (rol IN ('ADMINISTRADOR', 'MIEMBRO')),
    CONSTRAINT chk_miembro_estado CHECK (estado IN ('ACTIVO', 'EXPULSADO', 'ABANDONO'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para miembro_unidad
CREATE INDEX idx_miembro_unidad_estado ON miembro_unidad(id_unidad, estado);
CREATE INDEX idx_miembro_usuario_estado ON miembro_unidad(id_usuario, estado);

-- =====================================================
-- 4. TABLAS DE SUSCRIPCIÓN
-- =====================================================

-- Tabla: suscripcion
-- Suscripciones compartidas dentro de una unidad familiar
CREATE TABLE suscripcion (
    id_suscripcion BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_servicio BIGINT NOT NULL,
    id_unidad BIGINT NOT NULL,
    id_anfitrion BIGINT NOT NULL,
    precio_total DECIMAL(10,2) NOT NULL,
    moneda CHAR(3) NOT NULL DEFAULT 'EUR',
    precio_por_plaza DECIMAL(10,2),
    num_plazas_total SMALLINT NOT NULL,
    anfitrion_ocupa_plaza BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_inicio DATE NOT NULL,
    fecha_renovacion DATE,
    periodicidad VARCHAR(20) NOT NULL DEFAULT 'MENSUAL',
    renovacion_automatica BOOLEAN NOT NULL DEFAULT TRUE,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    notas TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    
    CONSTRAINT fk_suscripcion_servicio FOREIGN KEY (id_servicio) REFERENCES servicio(id_servicio) ON DELETE RESTRICT,
    CONSTRAINT fk_suscripcion_unidad FOREIGN KEY (id_unidad) REFERENCES unidad_familiar(id_unidad) ON DELETE CASCADE,
    CONSTRAINT fk_suscripcion_anfitrion FOREIGN KEY (id_anfitrion) REFERENCES usuario(id_usuario) ON DELETE RESTRICT,
    CONSTRAINT chk_suscripcion_periodicidad CHECK (periodicidad IN ('MENSUAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL')),
    CONSTRAINT chk_suscripcion_estado CHECK (estado IN ('ACTIVA', 'PAUSADA', 'CANCELADA', 'FINALIZADA'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para suscripcion
CREATE INDEX idx_suscripcion_unidad ON suscripcion(id_unidad);
CREATE INDEX idx_suscripcion_servicio ON suscripcion(id_servicio);
CREATE INDEX idx_suscripcion_anfitrion_estado ON suscripcion(id_anfitrion, estado);
CREATE INDEX idx_suscripcion_estado_renovacion ON suscripcion(estado, fecha_renovacion);

-- Tabla: plaza
-- Plazas disponibles dentro de una suscripción compartida
CREATE TABLE plaza (
    id_plaza BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_suscripcion BIGINT NOT NULL,
    id_usuario BIGINT,
    numero_plaza SMALLINT NOT NULL,
    es_plaza_anfitrion BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_ocupacion DATETIME,
    fecha_baja DATETIME,
    estado VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE',
    
    CONSTRAINT fk_plaza_suscripcion FOREIGN KEY (id_suscripcion) REFERENCES suscripcion(id_suscripcion) ON DELETE CASCADE,
    CONSTRAINT fk_plaza_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    CONSTRAINT uk_plaza_suscripcion_numero UNIQUE (id_suscripcion, numero_plaza),
    CONSTRAINT uk_plaza_suscripcion_usuario UNIQUE (id_suscripcion, id_usuario),
    CONSTRAINT chk_plaza_estado CHECK (estado IN ('DISPONIBLE', 'OCUPADA', 'RESERVADA', 'BLOQUEADA'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para plaza
CREATE INDEX idx_plaza_suscripcion_estado ON plaza(id_suscripcion, estado);
CREATE INDEX idx_plaza_usuario ON plaza(id_usuario);

-- Tabla: credencial
-- Credenciales compartidas de las suscripciones
CREATE TABLE credencial (
    id_credencial BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_suscripcion BIGINT NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    etiqueta VARCHAR(100),
    valor_encriptado TEXT NOT NULL,
    instrucciones TEXT,
    visible_para_miembros BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    
    CONSTRAINT fk_credencial_suscripcion FOREIGN KEY (id_suscripcion) REFERENCES suscripcion(id_suscripcion) ON DELETE CASCADE,
    CONSTRAINT chk_credencial_tipo CHECK (tipo IN ('EMAIL', 'USUARIO', 'PASSWORD', 'PERFIL', 'PIN', 'ENLACE', 'OTRO'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para credencial
CREATE INDEX idx_credencial_suscripcion ON credencial(id_suscripcion);

-- Tabla: historial_anfitrion
-- Historial de cambios de anfitrión en suscripciones
CREATE TABLE historial_anfitrion (
    id_historial BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_suscripcion BIGINT NOT NULL,
    id_anfitrion_anterior BIGINT NOT NULL,
    id_anfitrion_nuevo BIGINT NOT NULL,
    fecha_transferencia DATETIME NOT NULL,
    motivo VARCHAR(500),
    
    CONSTRAINT fk_historial_anf_suscripcion FOREIGN KEY (id_suscripcion) REFERENCES suscripcion(id_suscripcion) ON DELETE CASCADE,
    CONSTRAINT fk_historial_anf_anterior FOREIGN KEY (id_anfitrion_anterior) REFERENCES usuario(id_usuario) ON DELETE RESTRICT,
    CONSTRAINT fk_historial_anf_nuevo FOREIGN KEY (id_anfitrion_nuevo) REFERENCES usuario(id_usuario) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para historial_anfitrion
CREATE INDEX idx_historial_anf_suscripcion ON historial_anfitrion(id_suscripcion);

-- Tabla: historial_credencial
-- Registro de cambios en credenciales
CREATE TABLE historial_credencial (
    id_historial BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_credencial BIGINT NOT NULL,
    valor_anterior_encriptado TEXT NOT NULL,
    id_usuario_cambio BIGINT NOT NULL,
    fecha_cambio DATETIME NOT NULL,
    ip_cambio VARCHAR(45),
    
    CONSTRAINT fk_historial_cred_credencial FOREIGN KEY (id_credencial) REFERENCES credencial(id_credencial) ON DELETE CASCADE,
    CONSTRAINT fk_historial_cred_usuario FOREIGN KEY (id_usuario_cambio) REFERENCES usuario(id_usuario) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para historial_credencial
CREATE INDEX idx_historial_cred_credencial ON historial_credencial(id_credencial);

-- =====================================================
-- 5. TABLAS DE SOLICITUD
-- =====================================================

-- Tabla: solicitud
-- Solicitudes de unión a grupos o suscripciones
CREATE TABLE solicitud (
    id_solicitud BIGINT AUTO_INCREMENT PRIMARY KEY,
    tipo_solicitud VARCHAR(20) NOT NULL,
    id_solicitante BIGINT NOT NULL,
    id_unidad BIGINT,
    id_suscripcion BIGINT,
    mensaje VARCHAR(500),
    fecha_solicitud DATETIME NOT NULL,
    fecha_respuesta DATETIME,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    motivo_rechazo VARCHAR(500),
    id_aprobador BIGINT,
    
    CONSTRAINT fk_solicitud_solicitante FOREIGN KEY (id_solicitante) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_solicitud_unidad FOREIGN KEY (id_unidad) REFERENCES unidad_familiar(id_unidad) ON DELETE CASCADE,
    CONSTRAINT fk_solicitud_suscripcion FOREIGN KEY (id_suscripcion) REFERENCES suscripcion(id_suscripcion) ON DELETE CASCADE,
    CONSTRAINT fk_solicitud_aprobador FOREIGN KEY (id_aprobador) REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    CONSTRAINT chk_solicitud_tipo CHECK (tipo_solicitud IN ('UNION_GRUPO', 'UNION_SUSCRIPCION')),
    CONSTRAINT chk_solicitud_estado CHECK (estado IN ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA')),
    CONSTRAINT chk_solicitud_destino CHECK (
        (tipo_solicitud = 'UNION_GRUPO' AND id_unidad IS NOT NULL AND id_suscripcion IS NULL) OR
        (tipo_solicitud = 'UNION_SUSCRIPCION' AND id_unidad IS NULL AND id_suscripcion IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para solicitud
CREATE INDEX idx_solicitud_solicitante_estado ON solicitud(id_solicitante, estado);
CREATE INDEX idx_solicitud_unidad_estado ON solicitud(id_unidad, estado);
CREATE INDEX idx_solicitud_suscripcion_estado ON solicitud(id_suscripcion, estado);
CREATE INDEX idx_solicitud_estado_fecha ON solicitud(estado, fecha_solicitud);

-- =====================================================
-- 6. TABLAS DE PAGO
-- =====================================================

-- Tabla: pago
-- Registros de pagos realizados
CREATE TABLE pago (
    id_pago BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    id_plaza BIGINT,
    id_suscripcion BIGINT NOT NULL,
    id_metodo_pago BIGINT,
    monto DECIMAL(10,2) NOT NULL,
    moneda CHAR(3) NOT NULL DEFAULT 'EUR',
    monto_reembolsado DECIMAL(10,2) DEFAULT 0.00,
    fecha_pago DATETIME NOT NULL,
    fecha_retencion_hasta DATE,
    fecha_liberacion DATETIME,
    referencia_externa VARCHAR(100),
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    ciclo_inicio DATE,
    ciclo_fin DATE,
    created_at DATETIME NOT NULL,
    
    CONSTRAINT fk_pago_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE RESTRICT,
    CONSTRAINT fk_pago_plaza FOREIGN KEY (id_plaza) REFERENCES plaza(id_plaza) ON DELETE SET NULL,
    CONSTRAINT fk_pago_suscripcion FOREIGN KEY (id_suscripcion) REFERENCES suscripcion(id_suscripcion) ON DELETE RESTRICT,
    CONSTRAINT fk_pago_metodo FOREIGN KEY (id_metodo_pago) REFERENCES metodo_pago_usuario(id_metodo) ON DELETE SET NULL,
    CONSTRAINT chk_pago_estado CHECK (estado IN ('PENDIENTE', 'FALLIDO', 'RETENIDO', 'LIBERADO', 'REEMBOLSADO', 'REEMBOLSO_PARCIAL'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para pago
CREATE INDEX idx_pago_usuario_fecha ON pago(id_usuario, fecha_pago);
CREATE INDEX idx_pago_suscripcion_estado ON pago(id_suscripcion, estado);
CREATE INDEX idx_pago_estado_liberacion ON pago(estado, fecha_liberacion);
CREATE INDEX idx_pago_referencia ON pago(referencia_externa);

-- Tabla: disputa
-- Disputas de pagos entre usuarios
CREATE TABLE disputa (
    id_disputa BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_pago BIGINT NOT NULL,
    id_reclamante BIGINT NOT NULL,
    motivo VARCHAR(30) NOT NULL,
    descripcion TEXT NOT NULL,
    evidencia_urls JSON,
    fecha_apertura DATETIME NOT NULL,
    fecha_respuesta DATETIME,
    fecha_cierre DATETIME,
    resolucion VARCHAR(20),
    monto_resuelto DECIMAL(10,2),
    notas_resolucion TEXT,
    id_agente_resolutor BIGINT,
    estado VARCHAR(20) NOT NULL DEFAULT 'ABIERTA',
    
    CONSTRAINT fk_disputa_pago FOREIGN KEY (id_pago) REFERENCES pago(id_pago) ON DELETE RESTRICT,
    CONSTRAINT fk_disputa_reclamante FOREIGN KEY (id_reclamante) REFERENCES usuario(id_usuario) ON DELETE RESTRICT,
    CONSTRAINT fk_disputa_agente FOREIGN KEY (id_agente_resolutor) REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    CONSTRAINT uk_disputa_pago UNIQUE (id_pago),
    CONSTRAINT chk_disputa_motivo CHECK (motivo IN ('NO_ACCESO', 'CREDENCIALES_INVALIDAS', 'SERVICIO_CANCELADO', 'COBRO_INCORRECTO', 'OTRO')),
    CONSTRAINT chk_disputa_resolucion CHECK (resolucion IS NULL OR resolucion IN ('FAVOR_USUARIO', 'FAVOR_ANFITRION', 'REEMBOLSO_TOTAL', 'REEMBOLSO_PARCIAL')),
    CONSTRAINT chk_disputa_estado CHECK (estado IN ('ABIERTA', 'EN_REVISION', 'RESUELTA', 'CERRADA'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para disputa
CREATE INDEX idx_disputa_reclamante_estado ON disputa(id_reclamante, estado);
CREATE INDEX idx_disputa_estado_fecha ON disputa(estado, fecha_apertura);
CREATE INDEX idx_disputa_agente ON disputa(id_agente_resolutor);

-- =====================================================
-- 7. TABLAS DE SOPORTE
-- =====================================================

-- Tabla: ticket_soporte
-- Incidencias y problemas reportados por los usuarios
CREATE TABLE ticket_soporte (
    id_ticket BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    id_suscripcion BIGINT,
    id_pago BIGINT,
    id_disputa BIGINT,
    asunto VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    categoria VARCHAR(20) NOT NULL,
    prioridad VARCHAR(20) NOT NULL DEFAULT 'MEDIA',
    estado VARCHAR(20) NOT NULL DEFAULT 'ABIERTO',
    fecha_apertura DATETIME NOT NULL,
    fecha_primera_respuesta DATETIME,
    fecha_cierre DATETIME,
    id_agente BIGINT,
    satisfaccion SMALLINT,
    
    CONSTRAINT fk_ticket_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_ticket_suscripcion FOREIGN KEY (id_suscripcion) REFERENCES suscripcion(id_suscripcion) ON DELETE SET NULL,
    CONSTRAINT fk_ticket_pago FOREIGN KEY (id_pago) REFERENCES pago(id_pago) ON DELETE SET NULL,
    CONSTRAINT fk_ticket_disputa FOREIGN KEY (id_disputa) REFERENCES disputa(id_disputa) ON DELETE SET NULL,
    CONSTRAINT fk_ticket_agente FOREIGN KEY (id_agente) REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    CONSTRAINT chk_ticket_categoria CHECK (categoria IN ('ACCESO', 'PAGO', 'CREDENCIALES', 'CUENTA', 'GRUPO', 'SUSCRIPCION', 'OTRO')),
    CONSTRAINT chk_ticket_prioridad CHECK (prioridad IN ('BAJA', 'MEDIA', 'ALTA', 'URGENTE')),
    CONSTRAINT chk_ticket_estado CHECK (estado IN ('ABIERTO', 'EN_PROCESO', 'PENDIENTE_USUARIO', 'RESUELTO', 'CERRADO')),
    CONSTRAINT chk_ticket_satisfaccion CHECK (satisfaccion IS NULL OR (satisfaccion >= 1 AND satisfaccion <= 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para ticket_soporte
CREATE INDEX idx_ticket_usuario_estado ON ticket_soporte(id_usuario, estado);
CREATE INDEX idx_ticket_agente_estado ON ticket_soporte(id_agente, estado);
CREATE INDEX idx_ticket_estado_prioridad ON ticket_soporte(estado, prioridad, fecha_apertura);

-- Tabla: mensaje_ticket
-- Mensajes dentro de un ticket de soporte
CREATE TABLE mensaje_ticket (
    id_mensaje BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_ticket BIGINT NOT NULL,
    id_autor BIGINT NOT NULL,
    contenido TEXT NOT NULL,
    fecha_mensaje DATETIME NOT NULL,
    es_interno BOOLEAN NOT NULL DEFAULT FALSE,
    adjuntos JSON,
    editado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_edicion DATETIME,
    
    CONSTRAINT fk_mensaje_ticket FOREIGN KEY (id_ticket) REFERENCES ticket_soporte(id_ticket) ON DELETE CASCADE,
    CONSTRAINT fk_mensaje_autor FOREIGN KEY (id_autor) REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para mensaje_ticket
CREATE INDEX idx_mensaje_ticket_fecha ON mensaje_ticket(id_ticket, fecha_mensaje);

-- =====================================================
-- 8. DATOS INICIALES (Configuración base)
-- =====================================================

-- Configuraciones iniciales del sistema
INSERT INTO configuracion (clave, valor, tipo, descripcion, categoria, modificable) VALUES
('comision_plataforma', '5', 'NUMBER', 'Comisión de la plataforma en porcentaje', 'finanzas', TRUE),
('dias_retencion_pago', '30', 'NUMBER', 'Días que se retiene el pago antes de liberar', 'finanzas', TRUE),
('max_grupos_por_usuario', '10', 'NUMBER', 'Máximo de grupos que puede crear/unirse un usuario', 'limites', TRUE),
('max_suscripciones_grupo', '20', 'NUMBER', 'Máximo de suscripciones por grupo', 'limites', TRUE),
('tiempo_expiracion_token', '3600', 'NUMBER', 'Tiempo de expiración de tokens en segundos', 'seguridad', TRUE),
('moneda_defecto', 'EUR', 'STRING', 'Moneda por defecto de la plataforma', 'general', TRUE);

-- =====================================================
-- FIN DE LA MIGRACIÓN V1
-- =====================================================
