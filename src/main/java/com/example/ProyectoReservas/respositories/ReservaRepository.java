package com.example.ProyectoReservas.respositories;

import com.example.ProyectoReservas.entities.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    List<Reserva> findByAulaId(Long aulaId);
    boolean existsByAulaIdAndFechaAndHorarioId(Long aulaId, LocalDate fecha, Long horarioId);
}

