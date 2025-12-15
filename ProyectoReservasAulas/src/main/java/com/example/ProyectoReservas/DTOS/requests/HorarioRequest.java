package com.example.ProyectoReservas.DTOS.requests;

import com.example.ProyectoReservas.entities.diaSemana;
import com.example.ProyectoReservas.entities.tipoHorario;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class HorarioRequest {
    @NotNull(message = "El día de la semana es obligatorio")
    private diaSemana dia;

    @Min(value = 1, message = "La sesión del día debe ser al menos 1")
    private int sesionDia;

    @NotNull(message = "La hora de inicio es obligatoria")
    private LocalTime horaInicio;

    @NotNull(message = "La hora de fin es obligatoria")
    private LocalTime horaFim;

    // Correcto: Usas el tipo de dato ENUM de Java
    @NotNull(message = "El tipo de horario (LECTIVA, RECREO, MEDIODIA) es obligatorio")
    private tipoHorario tipo;
}
