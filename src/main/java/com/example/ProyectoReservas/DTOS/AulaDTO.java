package com.example.ProyectoReservas.DTOS;

import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@Builder
public class AulaDTO {
    private Long id;
    private String nombre;
    private Integer cantidad;
    private Boolean aulaDeOrdenadores;
    private Integer ordenadores;

}
