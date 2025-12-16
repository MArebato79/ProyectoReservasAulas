import {DOM} from "./document.js"

const output=DOM.elementos.output;
const contenedor=DOM.elementos.contenedor;

const statusElement=DOM.auth.status;
const authDiv=DOM.auth.div;

// src/main/resources/static/js/vista.js

export function mostrar(data) {
    // 1. CASO ERROR (Backend envía { error: "..." })
    if (data.error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.error,
            confirmButtonColor: '#d33'
        });
    }
    // 2. CASO ÉXITO (Backend envía { mensaje: "..." })
    else if (data.mensaje) {
        Swal.fire({
            icon: 'success',
            title: '¡Hecho!',
            text: data.mensaje,
            timer: 2000,
            showConfirmButton: false
        });
    }
    // 3. CASO DATOS (Tú enviaste { datos: ... })
    else if (data.datos) {
        // Configuramos una notificación pequeña (Toast) arriba a la derecha
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });

        Toast.fire({
            icon: 'info',
            title: 'Datos cargados correctamente'
        });

        // Opcional: Si quieres seguir viendo el JSON crudo en el cuadro de abajo
        if (DOM.elementos.output) {
            DOM.elementos.output.textContent = JSON.stringify(data.datos, null, 2);
        }
    }
}
export function updateAuthStatus() {
    const currentStatus = localStorage.getItem('jwtToken');
    if (currentStatus) {
        statusElement.textContent = 'Autenticado (Token presente)';
        authDiv.className = 'success';
    } else {
        statusElement.textContent = 'No autenticado';
        authDiv.className = 'error';
    }
}

export function pintarReservas(listaReservas) {

    // Si la lista está vacía o hay error
    if (!Array.isArray(listaReservas)|| listaReservas.length === 0) {
        contenedor.innerHTML = '<p style="color: #c0392b;font-weight: bold">No hay reservas para mostrar</p>';
        return;
    }

    // EL RETO: Usa destructuring anidado para sacar:
    // - id
    // - motivo
    // - fechaReserva
    // - nombre del aula (está dentro de aula)
    // - horaInicio (está dentro de horario)
    const html = listaReservas.map(reserva => {

        // OPCIÓN A: Acceso clásico (Más fácil de entender al principio)
        // const aulaNombre = reserva.aula.nombre;

        // OPCIÓN B: Destructuring PRO (Intenta esta si te atreves)
        const {id,motivo,fechaReserva,aula:{nombre},horario:{horaInicio}, numeroAsistentes} = reserva;
        return `
            <div class="card-reserva" style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <h3 style="margin-top: 0; color: #3498db;">${motivo}</h3>

                <p><strong>📅 Fecha:</strong> ${fechaReserva}</p>

                <p><strong>🏫 Aula:</strong> ${nombre}</p>
                <p><strong>⏰ Hora:</strong> ${horaInicio}</p>

                <button onclick="borrarReserva(event,${id})" style="background-color: #e74c3c;">Eliminar</button>
            </div>
        `;
    }).join('');

    contenedor.innerHTML = html;
}
