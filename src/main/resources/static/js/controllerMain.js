import { authenticatedFetch } from "./api.js";
import { DOM } from "./document.js";
import { mostrar, pintarReservas, pintarAulas, pintarHorarios, updateAuthStatus } from "./vista.js";

// ======================================================
// 1. ESTADO GLOBAL Y VARIABLES
// ======================================================
let idReservaEditando = null;
let idAulaEditando = null;
let idHorarioEditando = null;
let todasLasReservas = []; // Caché para el buscador

// ======================================================
// 2. AUTENTICACIÓN (LOGIN / REGISTER / LOGOUT)
// ======================================================

async function login(e) {
    e.preventDefault();
    // Limpiamos tokens antiguos para evitar conflictos
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');

    const email = DOM.auth.email.value;
    const password = DOM.auth.password.value;

    try {
        const datos = await authenticatedFetch('/auth/login', 'POST', { email, password });

        if (datos && datos.token) {
            localStorage.setItem('jwtToken', datos.token);

            // Decodificamos el rol (Opcional si usas la función parseJwt)
            // const payload = parseJwt(datos.token);
            // localStorage.setItem('userRole', payload.role);

            updateAuthStatus();
            mostrar({ mensaje: 'Login correcto' });

            // Carga inicial de datos
            cargarReservas();
        } else {
            mostrar({ error: 'Credenciales incorrectas' });
        }
    } catch (err) {
        mostrar({ error: err });
    }
}

async function register(e) {
    e.preventDefault();
    const nombre = DOM.register.nombre.value;
    const username = DOM.register.username.value;
    const email = DOM.register.email.value;
    const password = DOM.register.password.value;

    try {
        const datos = await authenticatedFetch('/auth/register', 'POST', { nombre, username, email, password });
        if (datos && !datos.error) {
            mostrar({ mensaje: 'Usuario registrado. Ahora haz login.' });
        } else {
            mostrar({ error: datos.error || 'Error en registro' });
        }
    } catch (err) {
        mostrar({ error: err });
    }
}

async function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');
    updateAuthStatus();
    mostrar({ mensaje: 'Sesión cerrada' });

    // Limpiar pantalla
    document.getElementById('output-reservas').innerHTML = '';
}

// ======================================================
// 3. GESTIÓN DE RESERVAS
// ======================================================

async function cargarReservas() {
    const datos = await authenticatedFetch('/reservas');
    if (datos && !datos.error) {
        todasLasReservas = datos; // Guardamos para el buscador
        pintarReservas(datos);
    } else {
        mostrar({ error: 'Error cargando reservas' });
    }
}

async function crearReserva() {
    // Recogemos datos del DOM
    const aulaId = parseInt(DOM.reserva.aulaId.value);
    const horarioId = parseInt(DOM.reserva.horarioId.value);
    const usuarioId = 1; // Ojo: Esto deberías sacarlo del token o del usuario logueado
    const fecha = DOM.reserva.fecha.value;
    const motivo = DOM.reserva.motivo.value;
    const asistentes = parseInt(DOM.reserva.asistentes.value);

    // Validaciones básicas
    if (!aulaId || !horarioId || !fecha) {
        mostrar({ error: 'Faltan datos obligatorios' });
        return;
    }

    try {
        const datos = await authenticatedFetch('/reservas', 'POST', {
            aulaId, horarioId, usuarioId, fechaReserva: fecha, motivo, numeroAsistentes: asistentes
        });

        if (datos && !datos.error) {
            mostrar({ mensaje: 'Reserva creada con éxito' });
            cargarReservas();
        } else {
            mostrar({ error: datos.error || 'Error al crear reserva' });
        }
    } catch (err) {
        mostrar({ error: err });
    }
}

// Editar Reserva (Se llama desde el botón de la tarjeta)
window.cargarDatosParaEditar = function(reservaString) {
    try {
        const reserva = JSON.parse(decodeURIComponent(reservaString));
        idReservaEditando = reserva.id;

        // Rellenar formulario
        DOM.reserva.aulaId.value = reserva.aula.id;
        DOM.reserva.horarioId.value = reserva.horario.id;
        DOM.reserva.fecha.value = reserva.fechaReserva.substring(0, 10);
        DOM.reserva.motivo.value = reserva.motivo;
        DOM.reserva.asistentes.value = reserva.numeroAsistentes;

        // Cambiar botones
        toggleBotones('Reserva', true); // Función auxiliar abajo
        mostrar({ mensaje: 'Editando Reserva...' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) { console.error(e); }
};

async function guardarCambiosReserva() {
    if (!idReservaEditando) return;

    // Recoger datos (Misma lógica que crear)
    const aulaId = parseInt(DOM.reserva.aulaId.value);
    const horarioId = parseInt(DOM.reserva.horarioId.value);
    const fecha = DOM.reserva.fecha.value;
    const motivo = DOM.reserva.motivo.value;
    const asistentes = parseInt(DOM.reserva.asistentes.value);

    try {
        const res = await authenticatedFetch(`/reservas/${idReservaEditando}`, 'PUT', {
            aulaId, horarioId, fechaReserva: fecha, motivo, numeroAsistentes: asistentes
        });
        if (res && !res.error) {
            mostrar({ mensaje: '✅ Reserva actualizada' });
            cargarReservas();
            cancelarEdicionReserva();
        } else {
            mostrar({ error: res.error });
        }
    } catch (e) { mostrar({ error: e }); }
}

function cancelarEdicionReserva() {
    idReservaEditando = null;
    DOM.reserva.motivo.value = ""; // Limpiar campos clave
    DOM.reserva.asistentes.value = "";
    toggleBotones('Reserva', false);
}

window.borrarReserva = async function(event, id) {
    if(await confirmarBorrado()) {
        const res = await authenticatedFetch(`/reservas/${id}`, 'DELETE');
        if(!res.error) { mostrar({mensaje:'Eliminado'}); cargarReservas(); }
    }
};

// ======================================================
// 4. GESTIÓN DE AULAS
// ======================================================

async function cargarAulas() {
    const datos = await authenticatedFetch('/aulas');
    if (datos && !datos.error) pintarAulas(datos);
}

async function crearAula() {
    // 1. Recoger datos del formulario
    const nombre = DOM.aula.nombre.value;
    const capacidad = parseInt(DOM.aula.capacidad.value);
    const esAuladeOrdenadores = DOM.aula.esOrdenadores ? DOM.aula.esOrdenadores.checked : false;

    // Si no es aula de ordenadores, enviamos 0, si sí, leemos el input
    const numeroOrdenadores = esAuladeOrdenadores ? parseInt(DOM.aula.numOrdenadores.value) : 0;

    // 2. Validación básica
    if (!nombre || isNaN(capacidad)) {
        mostrar({ error: 'Nombre y Capacidad son obligatorios' });
        return;
    }

    try {
        // 3. Petición POST
        const datos = await authenticatedFetch('/aulas', 'POST', {
            nombre,
            capacidad,
            esAuladeOrdenadores,
            numeroOrdenadores
        });

        if (datos && !datos.error) {
            mostrar({ mensaje: 'Aula creada correctamente' });
            cargarAulas(); // Recargar la lista

            // Limpiar formulario
            DOM.aula.nombre.value = "";
            DOM.aula.capacidad.value = "";
            if(DOM.aula.esOrdenadores) DOM.aula.esOrdenadores.checked = false;
            if(DOM.aula.numOrdenadores) DOM.aula.numOrdenadores.value = "";
        } else {
            mostrar({ error: datos.error || 'Error al crear aula' });
        }
    } catch (e) {
        mostrar({ error: e });
    }
}

// Editar Aula
window.cargarAulaParaEditar = function(aulaString) {
    const aula = JSON.parse(decodeURIComponent(aulaString));
    idAulaEditando = aula.id;

    DOM.aula.nombre.value = aula.nombre;
    DOM.aula.capacidad.value = aula.capacidad;
    if(DOM.aula.esOrdenadores) {
        DOM.aula.esOrdenadores.checked = aula.esAuladeOrdenadores;
        // Forzar evento change por si tienes lógica visual de ocultar input PCs
        DOM.aula.esOrdenadores.dispatchEvent(new Event('change'));
    }
    if(DOM.aula.numOrdenadores) DOM.aula.numOrdenadores.value = aula.numeroOrdenadores;

    toggleBotones('Aula', true);
};

async function guardarCambiosAula() {
    if (!idAulaEditando) return;
    const nombre = DOM.aula.nombre.value;
    const capacidad = DOM.aula.capacidad.value;
    const esAuladeOrdenadores = DOM.aula.esOrdenadores ? DOM.aula.esOrdenadores.checked : false;
    const numeroOrdenadores = esAuladeOrdenadores ? DOM.aula.numOrdenadores.value : 0;

    const res = await authenticatedFetch(`/aulas/${idAulaEditando}`, 'PUT', { nombre, capacidad, esAuladeOrdenadores, numeroOrdenadores });
    if(res && !res.error) {
        mostrar({ mensaje: 'Aula actualizada' });
        cargarAulas();
        cancelarEdicionAula();
    }
}

function cancelarEdicionAula() {
    idAulaEditando = null;
    DOM.aula.nombre.value = "";
    DOM.aula.capacidad.value = "";
    if(DOM.aula.esOrdenadores) DOM.aula.esOrdenadores.checked = false;
    toggleBotones('Aula', false);
}

window.borrarAula = async function(event, id) {
    if(await confirmarBorrado()) {
        const res = await authenticatedFetch(`/aulas/${id}`, 'DELETE');
        if(!res.error) { mostrar({mensaje:'Aula eliminada'}); cargarAulas(); }
    }
};

// ======================================================
// 5. GESTIÓN DE HORARIOS
// ======================================================

async function cargarHorarios() {
    const datos = await authenticatedFetch('/horarios');
    if (datos && !datos.error) pintarHorarios(datos);
}

async function crearHorario() {
    // 1. Recoger datos
    const diaSemana = DOM.horario.dia.value;
    const horaInicio = DOM.horario.inicio.value;
    const horaFin = DOM.horario.fin.value;

    // 2. Validación
    if (!diaSemana || !horaInicio || !horaFin) {
        mostrar({ error: 'Todos los campos son obligatorios' });
        return;
    }

    try {
        // 3. Petición POST
        const datos = await authenticatedFetch('/horarios', 'POST', {
            diaSemana,
            horaInicio,
            horaFin
        });

        if (datos && !datos.error) {
            mostrar({ mensaje: 'Horario creado correctamente' });
            cargarHorarios(); // Recargar lista

            // Limpiar formulario
            DOM.horario.dia.value = "";
            DOM.horario.inicio.value = "";
            DOM.horario.fin.value = "";
        } else {
            mostrar({ error: datos.error || 'Error al crear horario' });
        }
    } catch (e) {
        mostrar({ error: e });
    }
}

window.cargarHorarioParaEditar = function(horarioString) {
    const horario = JSON.parse(decodeURIComponent(horarioString));
    idHorarioEditando = horario.id;

    DOM.horario.dia.value = horario.diaSemana;
    DOM.horario.inicio.value = horario.horaInicio;
    DOM.horario.fin.value = horario.horaFin;

    toggleBotones('Horario', true);
};

async function guardarCambiosHorario() {
    if (!idHorarioEditando) return;
    const diaSemana = DOM.horario.dia.value;
    const horaInicio = DOM.horario.inicio.value;
    const horaFin = DOM.horario.fin.value;

    const res = await authenticatedFetch(`/horarios/${idHorarioEditando}`, 'PUT', { diaSemana, horaInicio, horaFin });
    if(res && !res.error) {
        mostrar({ mensaje: 'Horario actualizado' });
        cargarHorarios();
        cancelarEdicionHorario();
    }
}

function cancelarEdicionHorario() {
    idHorarioEditando = null;
    DOM.horario.dia.value = "";
    DOM.horario.inicio.value = "";
    toggleBotones('Horario', false);
}

window.borrarHorario = async function(event, id) {
    if(await confirmarBorrado()) {
        const res = await authenticatedFetch(`/horarios/${id}`, 'DELETE');
        if(!res.error) { mostrar({mensaje:'Horario eliminado'}); cargarHorarios(); }
    }
};


// ======================================================
// 6. UTILIDADES Y EVENT LISTENERS
// ======================================================

// Función auxiliar para confirmar borrados
async function confirmarBorrado() {
    const result = await Swal.fire({
        title: '¿Estás seguro?', text: "No podrás deshacer esto", icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, borrar'
    });
    return result.isConfirmed;
}

// Función auxiliar para cambiar botones (Crear <-> Editar/Cancelar)
// Tipo puede ser 'Reserva', 'Aula', 'Horario'
function toggleBotones(tipo, modoEdicion) {
    const btnCrear = document.getElementById(`btn-crear${tipo}`);
    const btnEditar = document.getElementById(`btn-editar${tipo}`); // ID debe ser btn-editarReserva, btn-editarAula...
    const btnCancelar = document.getElementById(`btn-cancelar${tipo}`); // ID debe ser btn-cancelarReserva...

    if (btnCrear) btnCrear.style.display = modoEdicion ? 'none' : 'inline-block';
    if (btnEditar) btnEditar.style.display = modoEdicion ? 'inline-block' : 'none';
    if (btnCancelar) btnCancelar.style.display = modoEdicion ? 'inline-block' : 'none';
}


// --- INICIALIZACIÓN DE EVENTOS ---

// Auth
if(DOM.botones.btnLogin) DOM.botones.btnLogin.addEventListener('click', login);
if(DOM.botones.btnRegister) DOM.botones.btnRegister.addEventListener('click', register);
if(DOM.botones.btnLogout) DOM.botones.btnLogout.addEventListener('click', logout);

// Navegación (Botones de la barra derecha)
const btnVerAulas = document.getElementById('btn-cargarAulas');
const btnVerHorarios = document.getElementById('btn-cargarHorarios');
const btnVerReservas = document.getElementById('btn-cargarReservas');

if(btnVerAulas) btnVerAulas.addEventListener('click', cargarAulas);
if(btnVerHorarios) btnVerHorarios.addEventListener('click', cargarHorarios);
if(btnVerReservas) btnVerReservas.addEventListener('click', cargarReservas);

// Crear
if(DOM.botones.btnCrearReserva) DOM.botones.btnCrearReserva.addEventListener('click', crearReserva);

const btnCrearAula = document.getElementById('btn-crearAula');
if(btnCrearAula) btnCrearAula.addEventListener('click', crearAula);


const btnCrearHorario = document.getElementById('btn-crearHorario');
if(btnCrearHorario) btnCrearHorario.addEventListener('click', crearHorario);

// Editar / Cancelar (Reservas)
const btnEditRes = document.getElementById('btn-editarReserva');
const btnCancelRes = document.getElementById('btn-cancelarReserva');
if(btnEditRes) btnEditRes.addEventListener('click', guardarCambiosReserva);
if(btnCancelRes) btnCancelRes.addEventListener('click', cancelarEdicionReserva);

// Editar / Cancelar (Aulas)
const btnEditAula = document.getElementById('btn-editarAula');
const btnCancelAula = document.getElementById('btn-cancelarAula');
if(btnEditAula) btnEditAula.addEventListener('click', guardarCambiosAula);
if(btnCancelAula) btnCancelAula.addEventListener('click', cancelarEdicionAula);

// Editar / Cancelar (Horarios)
const btnEditHorario = document.getElementById('btn-editarHorario');
const btnCancelHorario = document.getElementById('btn-cancelarHorario');
if(btnEditHorario) btnEditHorario.addEventListener('click', guardarCambiosHorario);
if(btnCancelHorario) btnCancelHorario.addEventListener('click', cancelarEdicionHorario);


// Buscador (Filtro en tiempo real)
const inputBuscador = document.getElementById('input-buscador');
if (inputBuscador) {
    inputBuscador.addEventListener('input', (e) => {
        const texto = e.target.value.toLowerCase();
        const filtradas = todasLasReservas.filter(reserva => {
            const motivo = reserva.motivo ? reserva.motivo.toLowerCase() : '';
            const aula = reserva.aula && reserva.aula.nombre ? reserva.aula.nombre.toLowerCase() : '';
            return motivo.includes(texto) || aula.includes(texto);
        });
        pintarReservas(filtradas);
    });
}

// Ejecución inicial
updateAuthStatus(); // Verificar si ya estamos logueados al recargar