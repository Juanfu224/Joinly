package com.alberti.joinly.dto.auth;

public record AuthResponse(
        Long id,
        String nombre,
        String email,
        String token,
        String mensaje) {
    public static AuthResponse registered(Long id, String nombre, String email) {
        return new AuthResponse(id, nombre, email, null, "Usuario registrado exitosamente");
    }

    public static AuthResponse loggedIn(Long id, String nombre, String email, String token) {
        return new AuthResponse(id, nombre, email, token, "Inicio de sesión exitoso");
    }
}
