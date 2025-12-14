package com.alberti.joinly.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Configuración para habilitar la auditoría JPA automática.
 * Permite que @CreatedDate y @LastModifiedDate funcionen correctamente.
 */
@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
}
