package com.alberti.joinly.exceptions;

/**
 * Excepción lanzada cuando un recurso solicitado no existe en el sistema.
 * Produce un código HTTP 404 (Not Found).
 */
public class ResourceNotFoundException extends RuntimeException {
    
    private final String resourceName;
    private final String fieldName;
    private final Object fieldValue;

    public ResourceNotFoundException(String message) {
        super(message);
        this.resourceName = null;
        this.fieldName = null;
        this.fieldValue = null;
    }
    
    public ResourceNotFoundException(String resourceName, Long id) {
        super("%s no encontrado con ID: %d".formatted(resourceName, id));
        this.resourceName = resourceName;
        this.fieldName = "id";
        this.fieldValue = id;
    }

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super("%s no encontrado con %s: %s".formatted(resourceName, fieldName, fieldValue));
        this.resourceName = resourceName;
        this.fieldName = fieldName;
        this.fieldValue = fieldValue;
    }

    public String getResourceName() { return resourceName; }
    public String getFieldName() { return fieldName; }
    public Object getFieldValue() { return fieldValue; }
}
