package com.alberti.joinly;

import com.alberti.joinly.config.CorsProperties;
import com.alberti.joinly.config.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

/**
 * Clase principal de la aplicación Joinly.
 * <p>
 * Plataforma de gestión de suscripciones compartidas que permite a grupos
 * familiares compartir los costes de servicios de streaming y software.
 *
 * @author Joinly Team
 * @version 1.0
 * @since 2025
 */
@SpringBootApplication
@EnableConfigurationProperties({JwtProperties.class, CorsProperties.class})
public class JoinlyApplication {

	public static void main(String[] args) {
		SpringApplication.run(JoinlyApplication.class, args);
	}

}
