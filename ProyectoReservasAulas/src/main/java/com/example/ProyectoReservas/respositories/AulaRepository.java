package com.example.ProyectoReservas.respositories;

import com.example.ProyectoReservas.entities.Aula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AulaRepository extends JpaRepository<Aula, Long> {
    @Query("SELECT a FROM Aula a LEFT JOIN FETCH a.reservas WHERE a.id = :idAula")
    Aula findAllWithReservationsByIdAula(@Param("idAula") Long idAula);
    List<Aula> findByCapacidadGreaterThan(Integer capacidad);
    List<Aula> findByEsAulaDeOrdenadoresTrue();
}
