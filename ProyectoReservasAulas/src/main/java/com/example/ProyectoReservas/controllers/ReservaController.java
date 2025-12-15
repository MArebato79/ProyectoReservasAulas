package com.example.ProyectoReservas.controllers;

import com.example.ProyectoReservas.DTOS.ReservaDTO;
import com.example.ProyectoReservas.DTOS.requests.ReservaRequest;
import com.example.ProyectoReservas.services.ServicioReserva; // Usamos el Servicio
import jakarta.validation.Valid;
import org.springframework.boot.autoconfigure.neo4j.Neo4jProperties;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reservas")
@CrossOrigin(origins = "*")
public class ReservaController {

    private final ServicioReserva reservaService; // Inyectamos el Servicio

    // Eliminamos la inyección directa de los Repositorios de Aula y Reserva
    public ReservaController(ServicioReserva reservaService) {
        this.reservaService = reservaService;
    }

    // 1. Listar todas las reservas (Ahora devuelve DTOs)
    @GetMapping
    public ResponseEntity<List<ReservaDTO>> listarReservas() {
        return ResponseEntity.ok(reservaService.listarTodos());
    }

    // 2. Obtener una reserva por ID (Ahora devuelve DTO)
    @GetMapping("/{id}")
    public ResponseEntity<ReservaDTO> obtenerReserva(@PathVariable Long id) {
        return reservaService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Crear una reserva (Usa Request DTO y devuelve DTO con 201)
    @PostMapping
    public ResponseEntity<?> crearReserva(@Valid @RequestBody ReservaRequest request,  Authentication authentication) {
        try {
            String emailUsuario = authentication.getName();
            ReservaDTO nuevaReserva = reservaService.crearReserva(request,emailUsuario);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaReserva);

        } catch (IllegalArgumentException e) {
            // Captura errores de "fecha pasada", "capacidad", "Aula/Horario no encontrado"
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());

        } catch (IllegalStateException e) {
            // Captura error de "solapamiento"
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    // 4. Eliminar una reserva
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarReserva(@PathVariable Long id) {
        if (reservaService.eliminar(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    /*@RestControllerAdvice   //Controlador que va a manejar excepciones
    public class GlobalExceptionHandler {
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<Map<String,String>> manejadorValidaciones(MethodArgumentNotValidException ex){
            Map<String,String> map = new HashMap<>();

            ex.getBindingResult().getFieldErrors().forEach((error)->{
                map.put(error.getField(),error.getDefaultMessage());
            });

            return ResponseEntity.badRequest().body(map);
        }*/

    }


