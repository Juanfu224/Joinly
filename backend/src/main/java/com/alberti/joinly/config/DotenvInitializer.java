package com.alberti.joinly.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.MutablePropertySources;

import java.util.HashMap;
import java.util.Map;

/**
 * Inicializador para cargar variables de entorno desde archivo .env
 * antes de que Spring Boot inicie el contexto de aplicación.
 * <p>
 * Esta clase se ejecuta temprano en el ciclo de vida de Spring Boot
 * para asegurar que las variables de entorno estén disponibles cuando
 * se carguen las propiedades de configuración.
 *
 * @author Joinly Team
 * @version 1.0
 * @since 2025
 */
public class DotenvInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        try {
            Dotenv dotenv = null;
            String loadedFrom = null;
            
            // Intentar cargar desde múltiples ubicaciones (en orden de prioridad)
            String[] searchPaths = {
                System.getProperty("user.dir"),                    // Directorio actual de ejecución
                System.getProperty("user.dir") + "/backend",       // Subdirectorio backend (si se ejecuta desde raíz)
                ".",                                                // Directorio relativo actual
                "../",                                              // Directorio padre
            };
            
            for (String path : searchPaths) {
                try {
                    dotenv = Dotenv.configure()
                            .directory(path)
                            .ignoreIfMissing()
                            .load();
                    
                    // Si encontró variables, usar esta ubicación
                    if (dotenv.entries().iterator().hasNext()) {
                        loadedFrom = path;
                        break;
                    }
                } catch (Exception e) {
                    // Continuar con la siguiente ubicación
                    continue;
                }
            }
            
            if (dotenv == null || !dotenv.entries().iterator().hasNext()) {
                System.out.println("INFO: No .env file found. Using system environment variables.");
                return;
            }

            // Convertir variables de .env a propiedades de Spring
            Map<String, Object> dotenvProperties = new HashMap<>();
            dotenv.entries().forEach(entry -> {
                String key = entry.getKey();
                String value = entry.getValue();
                dotenvProperties.put(key, value);
                
                // También configurar como propiedad del sistema para retrocompatibilidad
                if (System.getProperty(key) == null) {
                    System.setProperty(key, value);
                }
            });

            // Añadir propiedades al entorno de Spring con alta prioridad
            MutablePropertySources propertySources = applicationContext.getEnvironment().getPropertySources();
            propertySources.addFirst(new MapPropertySource("dotenvProperties", dotenvProperties));
            
            System.out.println("INFO: Successfully loaded " + dotenvProperties.size() + 
                             " variables from .env file (location: " + loadedFrom + ")");

        } catch (Exception e) {
            // Si falla, no interrumpir el inicio (puede ser que use variables de entorno del sistema)
            System.err.println("Warning: Could not load .env file: " + e.getMessage());
            System.err.println("Application will use system environment variables instead.");
        }
    }
}
