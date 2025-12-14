package com.alberti.joinly.repositories;

import com.alberti.joinly.entities.enums.TipoToken;
import com.alberti.joinly.entities.usuario.Token;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {

    Optional<Token> findByTokenAndUsadoFalse(String token);

    @Query("""
            SELECT t FROM Token t
            JOIN FETCH t.usuario
            WHERE t.token = :token
            AND t.tipo = :tipo
            AND t.usado = false
            AND t.fechaExpiracion > :ahora
            """)
    Optional<Token> findTokenValido(
            @Param("token") String token,
            @Param("tipo") TipoToken tipo,
            @Param("ahora") LocalDateTime ahora);

    @Modifying
    @Query("UPDATE Token t SET t.usado = true WHERE t.id = :id")
    int marcarComoUsado(@Param("id") Long id);

    @Modifying
    @Query("DELETE FROM Token t WHERE t.fechaExpiracion < :fecha")
    int eliminarTokensExpirados(@Param("fecha") LocalDateTime fecha);

    @Modifying
    @Query("DELETE FROM Token t WHERE t.usuario.id = :idUsuario AND t.tipo = :tipo")
    int eliminarTokensPorUsuarioYTipo(@Param("idUsuario") Long idUsuario, @Param("tipo") TipoToken tipo);

    long countByUsuarioIdAndTipoAndUsadoFalseAndFechaExpiracionAfter(
            Long idUsuario, TipoToken tipo, LocalDateTime fecha);
}
