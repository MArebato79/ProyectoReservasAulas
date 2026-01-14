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
        authDiv.classList.remove('noAutenticado');
        authDiv.classList.add('autenticado')
        authDiv.className = 'success';
    } else {
        statusElement.textContent = 'No autenticado';
        authDiv.classList.remove('autenticado')
        authDiv.classList.add('noAutenticado');
        authDiv.className = 'error';
    }

    ajustarPermisosVisuales();
}
export function ajustarPermisosVisuales() {
    // 1. Recuperamos el rol guardado
    const rol = localStorage.getItem('userRole');

    // 2. Seleccionamos las zonas que queremos proteger
    // (Asegúrate de poner id="admin-zone-aulas" en tu HTML como hablamos antes)
    const zonasAdmin = document.querySelectorAll('.admin-only');

    // 3. Lógica del Portero
    const esAdmin = rol && (rol.includes('ADMIN') || rol.includes('ROLE_ADMIN'));

    zonasAdmin.forEach(zona => {
        if (esAdmin) {
            zona.style.display = 'block'; // Mostrar si es jefe
        } else {
            zona.style.display = 'none';  // Ocultar si es profe o nadie
        }
    });
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
        const reservaString =encodeURIComponent(JSON.stringify(reserva))
        return `
            <div class="card-reserva" style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <h3 style="margin-top: 0; color: #3498db;">${motivo}</h3>

                <p><strong>📅 Fecha:</strong> ${fechaReserva}</p>

                <p><strong>🏫 Aula:</strong> ${nombre}</p>
                <p><strong>⏰ Hora:</strong> ${horaInicio}</p>

               <div class="acciones">
                    <button onclick="cargarDatosParaEditar('${reservaString}')" style="background-color: #f39c12;">✏️ Editar</button>
                    
                    <button onclick="borrarReserva(event,${id})" style="background-color: #e74c3c;">🗑️ Eliminar</button>
                </div>
            </div>
        `;
    }).join('');

    contenedor.innerHTML = html;
}

export function pintarAulas(listaAulas) {

    if (!Array.isArray(listaAulas)|| listaAulas.length === 0) {
        contenedor.innerHTML = '<p style="color: #c0392b;font-weight: bold">No hay Aulas para mostrar</p>';
        return;
    }


    const html = listaAulas.map(aula => {

        const {id,nombre,capacidad,esAuladeOrdenadores,numeroOrdenadores} = aula;
        const aulaString =encodeURIComponent(JSON.stringify(aula))

        const checkVisual = esAuladeOrdenadores ? '✅ Sí' : '❌ No';

        const lineaOrdenadores = esAuladeOrdenadores
            ? `<p><strong>💻 Ordenadores:</strong> ${numeroOrdenadores}</p>`
            : '';
        return `
           <div class="card-reserva">
                <h3>${nombre}</h3>
                
                <p><strong>👥 Capacidad:</strong> ${capacidad} personas</p>
                
                <p><strong>🖥️ ¿Tiene Ordenadores?:</strong> ${checkVisual}</p>
                
                ${lineaOrdenadores}

                <div class="acciones">
                    <button onclick="cargarAulaParaEditar('${aulaString}')" style="background-color: #f39c12;">✏️ Editar</button>
                    <button onclick="borrarAula(event, ${id})" style="background-color: #e74c3c;">🗑️ Eliminar</button>
                </div>
            </div>
        `;
    }).join('');

    contenedor.innerHTML = html;
}

export function pintarHorarios(listaHorarios) {

    if (!Array.isArray(listaHorarios)|| listaHorarios.length === 0) {
        contenedor.innerHTML = '<p style="color: #c0392b;font-weight: bold">No hay Horarios para mostrar</p>';
        return;
    }

    const html = listaHorarios.map(horario=> {

        const {id,dia,sesionDia,tipo,horaInicio,horaFim} = horario;
        const horarioString =encodeURIComponent(JSON.stringify(horario))

        return `
           <div class="card-reserva">
                <h3>${id}</h3>
                
                <p><strong>Día</strong>:</strong> ${dia}</p>
                   
                <p><strong>Sesión del dia</strong>:</strong> ${sesionDia}</p>
                <p><strong>Tipo</strong>:</strong> ${tipo}</p>
                
                <p><strong>Hora de Inicio</strong>:</strong> ${horaInicio}</p>
                <p><strong>Hora de Fin</strong>:</strong> ${horaFim}</p>
                <div class="acciones">
                    <button onclick="cargarAulaParaEditar('${horarioString}')" style="background-color: #f39c12;">✏️ Editar</button>
                    <button onclick="borrarAula(event, ${id})" style="background-color: #e74c3c;">🗑️ Eliminar</button>
                </div>
            </div>
        `;
    }).join('');

    contenedor.innerHTML = html;
}

