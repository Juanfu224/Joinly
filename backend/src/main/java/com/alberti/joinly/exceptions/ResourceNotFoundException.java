package com.alberti.joinly.exceptions;

public class ResourceNotFoundException extends RuntimeException {
    
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    public ResourceNotFoundException(String resourceName, Long id) {
        super("%s no encontrado con ID: %d".formatted(resourceName, id));
    }
}
