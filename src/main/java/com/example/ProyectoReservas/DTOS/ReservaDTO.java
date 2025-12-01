package com.example.ProyectoReservas.DTOS;

import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@Builder
public class ReservaDTO {
    private Long id;
    private String fechaReserva;
    private String motivo;
    private Integer numeroAsistentes;
    private AulaDTO aula;
    private HorarioDTO horario;
    private String fechaCreacion;

}
