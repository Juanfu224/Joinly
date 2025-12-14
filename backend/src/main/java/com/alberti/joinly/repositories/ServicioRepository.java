package com.alberti.joinly.repositories;

import com.alberti.joinly.entities.enums.CategoriaServicio;
import com.alberti.joinly.entities.suscripcion.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServicioRepository extends JpaRepository<Servicio, Long> {

    List<Servicio> findByCategoriaAndActivoTrue(CategoriaServicio categoria);

    List<Servicio> findByActivoTrue();

    @Query("SELECT s FROM Servicio s WHERE LOWER(s.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')) AND s.activo = true")
    List<Servicio> buscarPorNombre(@Param("nombre") String nombre);

    Optional<Servicio> findByNombreIgnoreCase(String nombre);
}
