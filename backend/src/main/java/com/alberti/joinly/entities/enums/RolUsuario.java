package com.alberti.joinly.entities.enums;

/**
 * Roles de usuario en el sistema Joinly.
 * <p>
 * Define los niveles de acceso y permisos:
 * <ul>
 *   <li>{@code USER} - Usuario estándar con acceso a funcionalidades básicas</li>
 *   <li>{@code AGENTE} - Agente de soporte con permisos para gestión de tickets y disputas</li>
 *   <li>{@code ADMIN} - Administrador con acceso completo al sistema</li>
 * </ul>
 *
 * @author Joinly Team
 * @version 1.0
 * @since 2025
 */
public enum RolUsuario {
    /**
     * Usuario estándar de la plataforma.
     * Puede crear/unirse a grupos, gestionar suscripciones y realizar pagos.
     */
    USER,

    /**
     * Agente de soporte.
     * Puede gestionar tickets de soporte, resolver disputas y asistir usuarios.
     * Hereda todos los permisos de USER.
     */
    AGENTE,

    /**
     * Administrador del sistema.
     * Tiene acceso completo a todas las funcionalidades, incluyendo
     * gestión de servicios y configuración del sistema.
     * Hereda todos los permisos de AGENTE.
     */
    ADMIN
}
