import {DOM} from "./document.js"

const output=DOM.elementos.output;
const contenedor=DOM.elementos.contenedor;

const statusElement=DOM.auth.status;
const authDiv=DOM.auth.div;

export function mostrar(data) {
    output.textContent = JSON.stringify(data, null, 2);
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

                <button onclick="borrarReserva(this,${id})" style="background-color: #e74c3c;">Eliminar</button>
            </div>
        `;
    }).join('');

    contenedor.innerHTML = html;
}
