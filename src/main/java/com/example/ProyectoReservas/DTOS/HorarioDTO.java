package com.example.ProyectoReservas.DTOS;

import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@Builder
public class HorarioDTO {
    private int id;
    private String dia;
    private int sesionDia;
    private String tipo;
    private String horaInicio;
    private String horaFim;
}
