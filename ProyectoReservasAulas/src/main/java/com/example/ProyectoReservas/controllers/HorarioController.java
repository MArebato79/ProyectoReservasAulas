package com.example.ProyectoReservas.controllers;

import com.example.ProyectoReservas.DTOS.HorarioDTO;
import com.example.ProyectoReservas.DTOS.requests.HorarioRequest;
import com.example.ProyectoReservas.services.ServicioHorario; // Usamos el Servicio
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/horarios")
@CrossOrigin(origins = "*")
public class HorarioController {

    private final ServicioHorario horarioService; // Inyectamos el Servicio

    public HorarioController(ServicioHorario horarioService) {
        this.horarioService = horarioService;
    }

    // 1. Listar todos los horarios (Devuelve DTOs)
    @GetMapping
    public ResponseEntity<List<HorarioDTO>> listarHorarios() {
        return ResponseEntity.ok(horarioService.listarTodos());
    }

    // 2. Obtener un horario por ID (Devuelve DTO)
    @GetMapping("/{id}")
    public ResponseEntity<HorarioDTO> obtenerHorario(@PathVariable Long id) {
        return horarioService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Crear un nuevo horario (Usa Request DTO y devuelve DTO con 201)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')") // Solo ADMIN puede crear horarios
    public ResponseEntity<HorarioDTO> crearHorario(@Valid @RequestBody HorarioRequest request) {
        // Usamos @Valid para el DTO de Request
        HorarioDTO nuevo = horarioService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    // 4. Actualizar un horario existente (Usa Request DTO y devuelve DTO)
    @PutMapping("/{id}")
    public ResponseEntity<HorarioDTO> actualizarHorario(@PathVariable Long id, @Valid @RequestBody HorarioRequest request) {
        return horarioService.actualizar(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 5. Eliminar un horario
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Solo ADMIN puede borrar horarios
    public ResponseEntity<Void> borrarHorario(@PathVariable Long id) {
        if (horarioService.eliminar(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
