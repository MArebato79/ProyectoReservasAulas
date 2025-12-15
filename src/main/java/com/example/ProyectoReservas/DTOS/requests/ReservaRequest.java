package com.example.ProyectoReservas.DTOS.requests;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ReservaRequest {

    @NotNull(message = "La fecha de la reserva es obligatoria")
    private LocalDate fechaReserva;

    @NotNull(message = "El motivo de la reserva es obligatorio")
    private String motivo;

    @NotNull(message = "Debe especificar el número de asistentes")
    @Min(message = "El número de asistentes debe ser al menos 1", value = 1)
    private Integer numeroAsistentes;

    private LocalDate fechaCreacion;

    @NotNull(message = "El ID del aula es obligatorio")
    private Long aulaId;

    @NotNull(message = "El ID del horario es obligatorio")
    private Long horarioId;

}
