package com.example.ProyectoReservas.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Horario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private diaSemana dia;

    private int sesionDia;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private tipoHorario tipo;

    private LocalTime horaInicio;

    private LocalTime horaFim;

    @OneToMany(mappedBy = "horario", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("horario")
    private List<Reserva> reservas;
}
