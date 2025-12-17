package com.example.ProyectoReservas.controllers;

import com.example.ProyectoReservas.DTOS.ReservaDTO;
import com.example.ProyectoReservas.DTOS.requests.ReservaRequest;
import com.example.ProyectoReservas.services.ServicioReserva;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reservas")
@CrossOrigin(origins = "*") // Permite peticiones desde JS
public class ReservaController {

    private final ServicioReserva reservaService;

    public ReservaController(ServicioReserva reservaService) {
        this.reservaService = reservaService;
    }

    // 1. Listar
    @GetMapping
    public ResponseEntity<List<ReservaDTO>> listarReservas() {
        return ResponseEntity.ok(reservaService.listarTodos());
    }

    // 2. Obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<ReservaDTO> obtenerReserva(@PathVariable Long id) {
        return reservaService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Crear
    @PostMapping
    public ResponseEntity<?> crearReserva(@Valid @RequestBody ReservaRequest request, Authentication authentication) {
        try {
            // Extraemos email del token JWT
            String emailUsuario = authentication.getName();
            ReservaDTO nuevaReserva = reservaService.crearReserva(request, emailUsuario);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaReserva);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error en datos: " + e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Conflicto: " + e.getMessage());
        }
    }

    // 4. Actualizar (PUT) - ¡NUEVO!
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarReserva(@PathVariable Long id, @Valid @RequestBody ReservaRequest request, Authentication authentication) {
        try {
            String emailUsuario = authentication.getName();
            ReservaDTO reservaActualizada = reservaService.actualizarReserva(id, request, emailUsuario);
            return ResponseEntity.ok(reservaActualizada);

        } catch (IllegalArgumentException e) {
            // Errores como fecha pasada, aula no existe, o ID no encontrado
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());

        } catch (IllegalStateException e) {
            // Error de solapamiento (ya ocupado)
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());

        } catch (SecurityException e) {
            // Error si intentas editar la reserva de otro
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    // 5. Eliminar
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarReserva(@PathVariable Long id) {
        if (reservaService.eliminar(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}


