package com.alberti.joinly.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final FileStorageProperties fileStorageProperties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = Paths.get(fileStorageProperties.getLocation())
            .toAbsolutePath()
            .toUri()
            .toString();

        // Asegurar que la ubicación termina con /
        if (!location.endsWith("/")) {
            location += "/";
        }

        registry.addResourceHandler("/uploads/avatars/**")
            .addResourceLocations(location);
    }
}
