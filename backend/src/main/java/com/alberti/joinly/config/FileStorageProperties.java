package com.alberti.joinly.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "joinly.storage.avatars")
@Getter
@Setter
public class FileStorageProperties {
    private String location = "uploads/avatars";
    private long maxSize = 5242880;
    private String allowedTypes = "image/jpeg,image/png,image/webp";
    private int resizeDimension = 256;
}
