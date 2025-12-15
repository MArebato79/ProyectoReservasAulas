package com.example.ProyectoReservas.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.Collection;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate fecha;

    private String motivo;

    private Integer numeroAsistentes;

    private LocalDate fechaCreacion= LocalDate.now();

    @ManyToOne
    @JoinColumn(name = "aula_id")
    @JsonIgnoreProperties("reservas")
    private Aula aula;

    @ManyToOne
    @JoinColumn(name = "horario_id")
    @JsonIgnoreProperties("reservas")
    private Horario horario;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    @JsonIgnoreProperties("reservas")
    private Usuario usuario;
}
