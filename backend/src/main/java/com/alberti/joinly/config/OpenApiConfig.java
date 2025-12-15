package com.alberti.joinly.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuración de OpenAPI/Swagger para documentación de la API.
 * <p>
 * Define el esquema de seguridad Bearer JWT para que Swagger UI
 * muestre el botón "Authorize" y permita probar endpoints protegidos.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI joinlyOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Joinly API")
                        .description("API REST para la plataforma de gestión de suscripciones compartidas Joinly. " +
                                "La autenticación se realiza mediante JWT Bearer Token.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Joinly Team")
                                .email("soporte@joinly.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Servidor de desarrollo")
                ))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Token JWT obtenido en /api/v1/auth/login o /api/v1/auth/register")));
    }
}
