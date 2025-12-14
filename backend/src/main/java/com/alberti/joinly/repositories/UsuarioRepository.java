package com.alberti.joinly.repositories;

import com.alberti.joinly.entities.enums.EstadoUsuario;
import com.alberti.joinly.entities.usuario.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Usuario> findByEstado(EstadoUsuario estado);

    @Query("SELECT u FROM Usuario u WHERE u.esAgenteSoporte = true AND u.estado = 'ACTIVO'")
    List<Usuario> findAgentesSoporteActivos();

    @Query("SELECT u FROM Usuario u WHERE LOWER(u.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')) AND u.estado = :estado")
    List<Usuario> buscarPorNombreYEstado(@Param("nombre") String nombre, @Param("estado") EstadoUsuario estado);
}
