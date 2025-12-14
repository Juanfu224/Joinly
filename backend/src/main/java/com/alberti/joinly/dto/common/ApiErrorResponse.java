package com.alberti.joinly.dto.common;

import java.time.LocalDateTime;
import java.util.List;

public record ApiErrorResponse(
        int status,
        String error,
        String message,
        String path,
        LocalDateTime timestamp,
        List<FieldError> fieldErrors
) {
    public ApiErrorResponse(int status, String error, String message, String path) {
        this(status, error, message, path, LocalDateTime.now(), null);
    }
    
    public ApiErrorResponse(int status, String error, String message, String path, List<FieldError> fieldErrors) {
        this(status, error, message, path, LocalDateTime.now(), fieldErrors);
    }
    
    public record FieldError(String field, String message) {}
}
