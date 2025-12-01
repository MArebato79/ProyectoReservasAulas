package com.example.ProyectoReservas.controllers;

import com.example.ProyectoReservas.DTOS.AulaDTO;
import com.example.ProyectoReservas.DTOS.ReservaDTO;
import com.example.ProyectoReservas.DTOS.requests.AulaRequest;
import com.example.ProyectoReservas.entities.Aula;
import com.example.ProyectoReservas.entities.Reserva;
import com.example.ProyectoReservas.respositories.AulaRepository;
import com.example.ProyectoReservas.respositories.ReservaRepository;
import com.example.ProyectoReservas.services.ServicioAula;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/aulas")
@CrossOrigin(origins = "*")
public class AulaController {

    private final ServicioAula aulaService;

    public AulaController(ServicioAula servicioAula) {
        this.aulaService= servicioAula;
    }
    // 1. Listar todas las aulas (Ahora devuelve DTOs)
    @GetMapping
    public ResponseEntity<List<AulaDTO>> listarAll() {
        return ResponseEntity.ok(aulaService.listarTodos());
    }

    // 2. Obtener un aula por id (Ahora devuelve DTO)
    @GetMapping("/{id}")
    public ResponseEntity<AulaDTO> obtenerAula(@PathVariable Long id) {
        return aulaService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Crear un aula (Usa Request DTO y devuelve el DTO creado con 201)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')") // Solo ADMIN puede crear aulas
    public ResponseEntity<AulaDTO> crearAula(@Valid @RequestBody AulaRequest request) {
        // @Valid se asegura de que el DTO cumpla las restricciones
        AulaDTO nuevo = aulaService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    // 4. Actualizar un aula (Usa Request DTO y devuelve DTO)
    @PutMapping("/{id}")
    public ResponseEntity<AulaDTO> actualizarAula(@PathVariable Long id, @Valid @RequestBody AulaRequest request) {
        return aulaService.actualizar(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 5. Borrar un aula
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Solo ADMIN puede borrar aulas
    public ResponseEntity<Void> borrarAula(@PathVariable Long id) {
        if (aulaService.eliminar(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // 6. Obtener las reservas de un aula (Devuelve ReservaDTOs)
    @GetMapping("/{id}/reservas")
    public ResponseEntity<List<ReservaDTO>> obtenerReservasPorAula(@PathVariable Long id) {
        // Aquí puedes verificar si el Aula existe antes de buscar reservas, si quieres devolver un 404 más claro
        if (aulaService.obtenerEntidadPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(aulaService.obtenerReservas(id));
    }
}


