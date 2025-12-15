package com.alberti.joinly.config;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.BufferedReader;
import java.io.FileReader;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * Configuración para cargar variables de entorno desde archivo .env.
 * <p>
 * Esta clase carga el archivo .env desde la raíz del proyecto
 * (directorio padre del directorio backend) antes de que se inicialice
 * el contexto de Spring.
 *
 * @author Joinly Team
 * @version 1.0
 * @since 2025
 */
public class DotenvConfig implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        ConfigurableEnvironment environment = applicationContext.getEnvironment();
        
        // Buscar el archivo .env en la raíz del proyecto (directorio padre de backend)
        Path currentPath = Paths.get("").toAbsolutePath();
        Path dotenvPath = currentPath.getParent().resolve(".env");
        
        // Si no está en el padre, intentar en el directorio actual
        if (!dotenvPath.toFile().exists()) {
            dotenvPath = currentPath.resolve(".env");
        }
        
        if (dotenvPath.toFile().exists()) {
            try {
                Map<String, Object> dotenvProperties = loadDotenvFile(dotenvPath);
                MapPropertySource propertySource = new MapPropertySource("dotenv", dotenvProperties);
                environment.getPropertySources().addFirst(propertySource);
            } catch (Exception e) {
                // Si falla la carga del .env, continuar sin él
                System.err.println("Warning: Could not load .env file: " + e.getMessage());
            }
        }
    }

    private Map<String, Object> loadDotenvFile(Path dotenvPath) throws Exception {
        Map<String, Object> properties = new HashMap<>();
        
        try (BufferedReader reader = new BufferedReader(new FileReader(dotenvPath.toFile()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                // Ignorar líneas vacías y comentarios
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }
                
                // Parsear línea KEY=VALUE
                int separatorIndex = line.indexOf('=');
                if (separatorIndex > 0) {
                    String key = line.substring(0, separatorIndex).trim();
                    String value = line.substring(separatorIndex + 1).trim();
                    properties.put(key, value);
                }
            }
        }
        
        return properties;
    }
}
