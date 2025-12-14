package com.alberti.joinly.repositories;

import com.alberti.joinly.entities.sistema.Configuracion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConfiguracionRepository extends JpaRepository<Configuracion, String> {

    @Query("SELECT c FROM Configuracion c WHERE c.categoria = :categoria ORDER BY c.clave")
    List<Configuracion> findByCategoria(@Param("categoria") String categoria);

    @Query("SELECT c.valor FROM Configuracion c WHERE c.clave = :clave")
    Optional<String> findValorByClave(@Param("clave") String clave);

    @Query("SELECT c FROM Configuracion c WHERE c.modificable = true ORDER BY c.categoria, c.clave")
    List<Configuracion> findConfiguracionesModificables();
}
