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
    private final UsuarioRepository usuarioRepository;
    private final ServicioAula aulaService;
    private final ServicioHorario horarioService;

    // --- Mapeo DTO ---
    public ReservaDTO toDTO(Reserva reserva) {
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

    // --- Lógica CRUD ---

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
        // Validar fecha futura
        if (request.getFechaReserva().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("No se pueden crear reservas en el pasado");
        }

        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado"));

        Aula aula = aulaService.obtenerEntidadPorId(request.getAulaId())
                .orElseThrow(() -> new IllegalArgumentException("Aula no encontrada"));

        Horario horario = horarioService.obtenerEntidadPorId(request.getHorarioId())
                .orElseThrow(() -> new IllegalArgumentException("Horario no encontrado"));

        if (request.getNumeroAsistentes() > aula.getCapacidad()) {
            throw new IllegalArgumentException("El aforo supera la capacidad del aula (" + aula.getCapacidad() + ")");
        }

        if (reservaRepo.existsByAulaIdAndFechaAndHorarioId(request.getAulaId(), request.getFechaReserva(), request.getHorarioId())) {
            throw new IllegalStateException("El aula ya está reservada en ese horario");
        }

        Reserva reserva = new Reserva();
        reserva.setFecha(request.getFechaReserva());
        reserva.setMotivo(request.getMotivo());
        reserva.setNumeroAsistentes(request.getNumeroAsistentes());
        reserva.setAula(aula);
        reserva.setHorario(horario);
        reserva.setUsuario(usuario);
        reserva.setFechaCreacion(LocalDate.now());

        return toDTO(reservaRepo.save(reserva));
    }

    // 👇 MÉTODO NUEVO PARA ACTUALIZAR 👇
    @Transactional
    public ReservaDTO actualizarReserva(Long id, ReservaRequest request, String emailUsuario) {
        // 1. Buscar la reserva existente
        Reserva reserva = reservaRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada con ID: " + id));

        // 3. Validar Fecha (si se cambia)
        if (request.getFechaReserva().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("La nueva fecha no puede estar en el pasado");
        }

        // 4. Obtener nuevas entidades
        Aula aulaNueva = aulaService.obtenerEntidadPorId(request.getAulaId())
                .orElseThrow(() -> new IllegalArgumentException("Aula no encontrada"));

        Horario horarioNuevo = horarioService.obtenerEntidadPorId(request.getHorarioId())
                .orElseThrow(() -> new IllegalArgumentException("Horario no encontrado"));

        // 5. Validar Capacidad Nueva
        if (request.getNumeroAsistentes() > aulaNueva.getCapacidad()) {
            throw new IllegalArgumentException("El aforo supera la capacidad del aula nueva");
        }

        // 6. Validar Solapamiento (CRÍTICO: Solo si cambia Aula, Fecha u Horario)
        boolean haCambiadoLugarOTiempo =
                !reserva.getAula().getId().equals(request.getAulaId()) ||
                        !reserva.getFecha().isEqual(request.getFechaReserva()) ||
                        !reserva.getHorario().getId().equals(request.getHorarioId());

        if (haCambiadoLugarOTiempo) {
            boolean existeOcupacion = reservaRepo.existsByAulaIdAndFechaAndHorarioId(
                    request.getAulaId(),
                    request.getFechaReserva(),
                    request.getHorarioId()
            );

            if (existeOcupacion) {
                throw new IllegalStateException("El hueco al que intentas mover la reserva ya está ocupado");
            }
        }

        // 7. Actualizar datos
        reserva.setFecha(request.getFechaReserva());
        reserva.setMotivo(request.getMotivo());
        reserva.setNumeroAsistentes(request.getNumeroAsistentes());
        reserva.setAula(aulaNueva);
        reserva.setHorario(horarioNuevo);

        // No cambiamos el Usuario ni la Fecha de Creación

        return toDTO(reservaRepo.save(reserva));
    }

    @Transactional
    public boolean eliminar(Long id) {
        if (!reservaRepo.existsById(id)) return false;
        reservaRepo.deleteById(id);
        return true;
    }
}