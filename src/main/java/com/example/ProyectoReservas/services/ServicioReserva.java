package com.example.ProyectoReservas.services;

import com.example.ProyectoReservas.DTOS.ReservaDTO;
import com.example.ProyectoReservas.DTOS.requests.ReservaRequest;
import com.example.ProyectoReservas.entities.Aula;
import com.example.ProyectoReservas.entities.Horario;
import com.example.ProyectoReservas.entities.Reserva;
import com.example.ProyectoReservas.entities.Usuario;
import com.example.ProyectoReservas.respositories.ReservaRepository;
import com.example.ProyectoReservas.respositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServicioReserva {

    private final ReservaRepository reservaRepo;
    private final UsuarioRepository usuarioRepository; // Asumiendo que existe para obtener el Usuario
    private final ServicioAula aulaService; // Para obtener el Aula y la capacidad
    private final ServicioHorario horarioService; // Para obtener el Horario
    // private final ServicioUsuario usuarioService; // Asumiendo que existe para obtener el Usuario

    // --- Mapeo DTO (Debes completar los mapeos de Horario y Usuario) ---

    public ReservaDTO toDTO(Reserva reserva) {
        //
        return ReservaDTO.builder()
                .id(reserva.getId())
                .fechaReserva(reserva.getFecha().toString())
                .motivo(reserva.getMotivo())
                .numeroAsistentes(reserva.getNumeroAsistentes())
                .aula(aulaService.toDTO(reserva.getAula()))
                .horario(horarioService.toDTOHorario(reserva.getHorario()))
                .fechaCreacion(reserva.getFechaCreacion().toString())
                .build();
    }

    // --- Lógica CRUD con DTOs ---

    @Transactional(readOnly = true)
    public List<ReservaDTO> listarTodos() {
        return reservaRepo.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<ReservaDTO> obtenerPorId(Long id) {
        return reservaRepo.findById(id).map(this::toDTO);
    }

    @Transactional
    public ReservaDTO crearReserva(ReservaRequest request, String emailUsuario) {
        // 1. Validaciones y Obtención de Entidades
        if (request.getFechaReserva().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("No se pueden crear reservas en el pasado");
        }

        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new IllegalStateException("FATAL: Usuario autenticado no encontrado en DB."));

        // Obtenemos el Aula con el ID del Request DTO
        Aula aula = aulaService.obtenerEntidadPorId(request.getAulaId())
                .orElseThrow(() -> new IllegalArgumentException("Aula no encontrada con ID: " + request.getAulaId()));

        Horario horario = horarioService.obtenerEntidadPorId(request.getHorarioId())
                .orElseThrow(() -> new IllegalArgumentException("Horario no encontrado con ID: " + request.getHorarioId()));

        if (request.getNumeroAsistentes() > aula.getCapacidad()) {
            throw new IllegalArgumentException("Número de asistentes mayor que la capacidad del aula");
        }

        // 2. Validación de Solapamiento (Lógica clave)
        boolean existeSolapamiento = reservaRepo.existsByAulaIdAndFechaAndHorarioId(
                request.getAulaId(),
                request.getFechaReserva(),
                request.getHorarioId()
        );

        if (existeSolapamiento) {
            throw new IllegalStateException("El aula ya está reservada en ese horario");
        }

        // 3. Mapeo y Persistencia
        Reserva reserva = new Reserva();
        // Asumiendo que el Request DTO tiene los campos necesarios
        reserva.setFecha(request.getFechaReserva());
        reserva.setMotivo(request.getMotivo());
        reserva.setNumeroAsistentes(request.getNumeroAsistentes());
        reserva.setAula(aula);
        reserva.setHorario(horario);
        reserva.setUsuario(usuario); // Asumiendo Usuario
        reserva.setFechaCreacion(LocalDate.now());

        return toDTO(reservaRepo.save(reserva));
    }

    @Transactional
    public boolean eliminar(Long id) {
        if (!reservaRepo.existsById(id)) return false;
        reservaRepo.deleteById(id);
        return true;
    }
}
