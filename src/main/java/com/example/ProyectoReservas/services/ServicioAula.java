package com.example.ProyectoReservas.services;

import com.example.ProyectoReservas.DTOS.AulaDTO;
import com.example.ProyectoReservas.DTOS.ReservaDTO;
import com.example.ProyectoReservas.DTOS.requests.AulaRequest;
import com.example.ProyectoReservas.entities.Aula;
import com.example.ProyectoReservas.entities.Reserva;
import com.example.ProyectoReservas.respositories.AulaRepository;
import com.example.ProyectoReservas.respositories.HorarioRepository;
import com.example.ProyectoReservas.respositories.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServicioAula {

    private final AulaRepository aulaRepo;
    private final ReservaRepository reservaRepo;
    private final HorarioRepository horarioRepo;

    // --- Métodos de Mapeo (Simplificados, se pueden externalizar con MapStruct) ---

    // Convierte Entidad a DTO de Respuesta
    public AulaDTO toDTO(Aula aula) {
        //
        return AulaDTO.builder()
                .id(aula.getId())
                .nombre(aula.getNombre())
                .cantidad(aula.getCapacidad())
                .aulaDeOrdenadores(aula.isEsAulaDeOrdenadores())
                .ordenadores(aula.getNumeroOrdenadores())
                .build();
    }

    // Convierte Request a Entidad (para la creación)
    public Aula toEntity(AulaRequest request) {
        //
        Aula aula = new Aula();
        aula.setNombre(request.getNombre());
        aula.setCapacidad(request.getCapacidad());
        aula.setEsAulaDeOrdenadores(request.getEsDeOrdenadores());
        aula.setNumeroOrdenadores(request.getNumeroOrdenadores());
        return aula;
    }

    // --- Métodos de CRUD y Lógica ---

    @Transactional(readOnly = true)
    public List<AulaDTO> listarTodos() {
        return aulaRepo.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<AulaDTO> obtenerPorId(Long id) {
        return aulaRepo.findById(id).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public Optional<Aula> obtenerEntidadPorId(Long id) {
        return aulaRepo.findById(id);
    }

    @Transactional
    public AulaDTO crear(AulaRequest request) {
        Aula aulaNueva = toEntity(request);
        Aula savedAula = aulaRepo.save(aulaNueva);
        return toDTO(savedAula);
    }

    @Transactional
    public Optional<AulaDTO> actualizar(Long id, AulaRequest request) {
        return aulaRepo.findById(id).map(aula -> {
            aula.setNombre(request.getNombre());
            aula.setCapacidad(request.getCapacidad());
            aula.setEsAulaDeOrdenadores(request.getEsDeOrdenadores());
            aula.setNumeroOrdenadores(request.getNumeroOrdenadores());
            return toDTO(aulaRepo.save(aula));
        });
    }

    @Transactional
    public boolean eliminar(Long id) {
        if (!aulaRepo.existsById(id)) return false;
        aulaRepo.deleteById(id);
        return true;
    }

    @Transactional(readOnly = true)
    public List<ReservaDTO> obtenerReservas(Long idAula) {
        // Usamos el repositorio de Reservas para buscar por la FK 'aula_id'
        List<Reserva> reservas = reservaRepo.findByAulaId(idAula);

        // Mapeamos a ReservaDTO para la respuesta
        return reservas.stream()
                .map(this::mapReservaToDTO)
                .collect(Collectors.toList());
    }

    // Mapeo Reserva a DTO (simplificado)
    private ReservaDTO mapReservaToDTO(Reserva reserva) {
        return ReservaDTO.builder() //
                .id(reserva.getId())
                .motivo(reserva.getMotivo())
                .numeroAsistentes(reserva.getNumeroAsistentes())
                .aula(toDTO(reserva.getAula()))
                .build();
    }
}