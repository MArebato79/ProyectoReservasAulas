package com.example.ProyectoReservas.DTOS.requests;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AulaRequest {
    @NotBlank(message = "El nombre del aula es obligatorio")
    private String nombre;

    @NotNull(message = "La capacidad del aula es obligatoria")
    @Min(value = 1, message = "La capacidad del aula debe ser al menos 1")
    private Integer capacidad;

    @NotNull(message = "Debe especificar si el aula es de ordenadores")
    private Boolean esDeOrdenadores;

    @NotNull(message = "El número de ordenadores es obligatorio")
    @Min(value = 0, message = "El número de ordenadores no puede ser negativo")
    private Integer numeroOrdenadores;
}
