package com.example.ProyectoReservas.respositories;

import com.example.ProyectoReservas.entities.Horario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HorarioRepository extends JpaRepository<Horario, Long> {

}

