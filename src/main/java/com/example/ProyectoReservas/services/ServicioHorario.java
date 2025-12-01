package com.example.ProyectoReservas.services;

import com.example.ProyectoReservas.DTOS.HorarioDTO;
import com.example.ProyectoReservas.DTOS.requests.HorarioRequest;
import com.example.ProyectoReservas.entities.Horario;
import com.example.ProyectoReservas.respositories.HorarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServicioHorario {
    private final HorarioRepository horarioRepo;

    // (Debes implementar aquí los métodos toDTOHorario, toEntity, listarTodos, etc.)

    public HorarioDTO toDTOHorario(Horario horario) {
        //
        return HorarioDTO.builder()
                .id(horario.getId().intValue())
                .dia(horario.getDia().toString())
                .sesionDia(horario.getSesionDia())
                .horaInicio(horario.getHoraInicio().toString())
                .horaFim(horario.getHoraFim().toString())
                .tipo(horario.getTipo().toString())
                .build();
    }

    @Transactional(readOnly = true)
    public List<HorarioDTO> listarTodos() {
        return horarioRepo.findAll().stream()
                .map(this::toDTOHorario)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<HorarioDTO> obtenerPorId(Long id) {
        return horarioRepo.findById(id).map(this::toDTOHorario);
    }

    // ... dentro de ServicioHorario.java

    // [NUEVO MÉTODO A AÑADIR]
    /**
     * Devuelve la Entidad Horario directamente (sin DTO) para ser usada internamente por otros servicios.
     */
    @Transactional(readOnly = true)
    public Optional<Horario> obtenerEntidadPorId(Long id) {
        // Simplemente llama al repositorio y devuelve la Entidad.
        return horarioRepo.findById(id);
    }

    // Implementar crear, actualizar, eliminar...

    @Transactional
    public HorarioDTO crear(HorarioRequest request) {
        Horario nuevo = new Horario();
        nuevo.setDia(request.getDia()); //
        nuevo.setSesionDia(request.getSesionDia());
        nuevo.setHoraInicio(request.getHoraInicio());
        nuevo.setHoraFim(request.getHoraFim());
        nuevo.setTipo(request.getTipo());
        return toDTOHorario(horarioRepo.save(nuevo));
    }

    @Transactional
    public Optional<HorarioDTO> actualizar(Long id, HorarioRequest request) {
        return horarioRepo.findById(id).map(horario -> {
            horario.setDia(request.getDia());
            horario.setSesionDia(request.getSesionDia());
            horario.setHoraInicio(request.getHoraInicio());
            horario.setHoraFim(request.getHoraFim());
            horario.setTipo(request.getTipo());
            return toDTOHorario(horarioRepo.save(horario));
        });
    }

    @Transactional
    public boolean eliminar(Long id) {
        if (!horarioRepo.existsById(id)) return false;
        horarioRepo.deleteById(id);
        return true;
    }
}