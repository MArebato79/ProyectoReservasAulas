import {ajustarPermisosVisuales, mostrar, pintarReservas, updateAuthStatus} from "./vista.js";
import  {authenticatedFetch} from "./fecths.js";
import {DOM} from "./document.js";

let idReservaEditando = null;

async function login(e){
    e.preventDefault();

    const email = DOM.auth.email.value;
    const pass = DOM.auth.password.value;

    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');

    try{
        const datos = await authenticatedFetch('/auth/login','POST',{email:email,password:pass});

        if(datos && datos.token){
            localStorage.setItem('jwtToken',datos.token);

            const rolUsuario = payload.role || payload.roles || 'USER';
            localStorage.setItem('userRole', rolUsuario);
            updateAuthStatus();

            mostrar({mensaje:'login Correctamente.'});
        }else{
           mostrar({mensaje:'login incorrecto'});
        }

    }catch(err){
        alert(err);
    }
}

async function logout(){
    localStorage.removeItem('token');
    updateAuthStatus();
    DOM.elementos.contenedor.innerHTML='<p>Sesión cerrada</p>'
}

async function register(e,role){
    e.preventDefault();

    const email = DOM.auth.email.value;
    const pass = DOM.auth.password.value;

    if (!email || !pass) {
        mostrar({mensaje:'introduzca email y contraseña'});
        return;
    }

    const endpoint = role === 'admin' ? '/auth/register/admin' : '/auth/register';

    try{
        const datos = await authenticatedFetch(endpoint,'POST',{email:email,password:pass});

        if(datos && !datos.error){
            mostrar({mensaje:'Registro completado'});
        }else{
            mostrar({mensaje:'Registro incorrecto'});
        }
    }catch (error){
        mostrar({error:`Error al registrar ${error}`});
    }
}

async function cargarAulas(){
    const datos = await authenticatedFetch('/aulas');

    if(datos && !datos.error){
        mostrar({datos});
    }else{
        mostrar({mensaje:'cargado de aulas interrumpido'});
    }
}

async function cargarHorarios(){
    const datos = await authenticatedFetch('/horarios');

    if(datos && !datos.error){
        mostrar({datos});
    }else{
        mostrar({mensaje:'cargado de horarios interrumpido'});
    }
}

async function cargarReservas(){
    const datos = await authenticatedFetch('/reservas');

    if(datos && !datos.error){
        mostrar({datos});
        pintarReservas(datos)
    }else{
        mostrar({mensaje:'cargado de reservas interrumpido'});
    }
}
DOM.botones.btnRegisterAdmin.addEventListener('click', (e) => register(e,'admin'));
DOM.botones.btnRegisterProfe.addEventListener('click', (e) => register(e,'profe'));
DOM.botones.btnLogin.addEventListener('click',login);
DOM.botones.btnLogout.addEventListener('click',logout);
DOM.botones.btnVerAulas.addEventListener('click', cargarAulas);
DOM.botones.btnVerHorarios.addEventListener('click', cargarHorarios);
DOM.botones.btnVerReservas.addEventListener('click', cargarReservas);

async function crearAulas() {
    const nombre = DOM.aula.nombre.value;
    const capacidad = parseInt(DOM.aula.capacidad.value,10);
    const esOrdenadores = DOM.aula.esOrdenadores.checked;
    const numOrdenadores = parseInt(DOM.aula.numOrdenadores.value,10);

    try{
        const datos =  await authenticatedFetch('/aulas','POST',{nombre,capacidad,esOrdenadores,numOrdenadores});

        if(datos && !datos.error){
            mostrar({datos});
        }else{
            mostrar({mensaje:'cargado de aulas interrumpido'});
        }
    }catch(err){
        mostrar({error:err});
    }
}

async function crearHorarios() {
    const dia = DOM.horario.dia.value;
    const tipo = DOM.horario.tipo.value;
    const sesion = parseInt(DOM.horario.sesion.value,10);
    const horaInicio = DOM.horario.inicio.value;
    const horaFin = DOM.horario.fin.value;

    try{
        const datos =  await authenticatedFetch('/horarios','POST',{dia,tipo,sesion,horaInicio,horaFin});

        if(datos && !datos.error){
            mostrar({datos});
        }else{
            mostrar({mensaje:'cargado de aulas interrumpido'});
        }
    }catch(err){
        mostrar({error:err});
    }
}

async function crearReservas(){
    const aulaId = parseInt(DOM.reserva.aulaId.value, 10);
    const horarioId = parseInt(DOM.reserva.horarioId.value, 10);
    const usuarioId = parseInt(DOM.reserva.usuarioId.value, 10); // NOTA: Normalmente el usuario se saca del Token en el backend
    const asistentes = parseInt(DOM.reserva.asistentes.value, 10);

    try{
        const datos =  await authenticatedFetch('/reservas','POST',{aulaId,horarioId,usuarioId,asistentes});

        if(datos && !datos.error){
            mostrar({datos});
            pintarReservas(datos);
        }else {
            mostrar({mensaje:'creacion de reserva interrumpido'});
        }

    }catch (err){
        mostrar({error:err});
    }
}

async function borrarReserva(e,id){
    e.preventDefault();

    const tarjeta = e.target.closest('.card-reserva') || e.target.parentElement;
    try{
        const datos = await authenticatedFetch(`/reservas/${id}`,'DELETE',{id});
        if(datos && !datos.error){
            mostrar({mensaje:'Reserva borrada',datos:datos});

            if (tarjeta){
                tarjeta.remove();
            }
        }else{
            mostrar({mensaje:'Problema al borrar'});
        }
    }catch(err){
        mostrar({error:err});
    }
}

DOM.botones.btnCrearAula.addEventListener('click', crearAulas);
DOM.botones.btnCrearHorario.addEventListener('click', crearHorarios);
DOM.botones.btnCrearReserva.addEventListener('click', crearReservas);
window.borrarReserva = borrarReserva;

function parseJwt (token) {
    try {
        const base64Url = token.split('.')[1]; // Cogemos la parte 2 (Payload)
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload); // Devuelve objeto JS (ej: {sub: "pepe", role: "ADMIN"})
    } catch (e) {
        return null;
    }
}

ajustarPermisosVisuales();

window.cargarDatosParaEditar = function(reservaString) {
    // El truco: pasamos el objeto entero convertido a texto y lo parseamos
    // (Ojo: decodeURIComponent es necesario si pasas strings complejos en el HTML)
    const reserva = JSON.parse(decodeURIComponent(reservaString));

    // 1. Rellenamos los inputs con los datos de la reserva
    DOM.reserva.fecha.value = reserva.fechaReserva;
    DOM.reserva.motivo.value = reserva.motivo;
    DOM.reserva.asistentes.value = reserva.numeroAsistentes; // Revisa si tu DTO se llama numeroAsistentes

    // Estos son selects/inputs de ID. Asumimos que el DTO trae los IDs dentro de objetos aula/horario
    // Si tu DTO devuelve el objeto entero, accede a .id
    DOM.reserva.aulaId.value = reserva.aula.id;
    DOM.reserva.horarioId.value = reserva.horario.id;
    // DOM.reserva.usuarioId.value = ... (Normalmente el usuario no se edita)

    // 2. Cambiamos los botones
    DOM.botones.btnCrearReserva.style.display = 'none';
    document.getElementById('btn-editarReserva').style.display = 'inline-block';
    document.getElementById('btn-cancelarEdicion').style.display = 'inline-block';

    // 3. Guardamos el ID globalmente
    idReservaEditando = reserva.id;

    // Scroll hacia arriba para ver el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function cancelarEdicion() {
    idReservaEditando = null;
    // Limpiar formulario (puedes hacer una función limpiarFormulario() aparte)
    DOM.reserva.motivo.value = "";
    // ... limpiar resto ...

    // Restaurar botones
    DOM.botones.btnCrearReserva.style.display = 'inline-block';
    document.getElementById('btn-editarReserva').style.display = 'none';
    document.getElementById('btn-cancelarEdicion').style.display = 'none';
}
// Añade el listener:
document.getElementById('btn-cancelarEdicion').addEventListener('click', cancelarEdicion);

async function guardarCambiosReserva() {
    if (!idReservaEditando) return;

    // Recogemos datos igual que en crear
    const aulaId = parseInt(DOM.reserva.aulaId.value, 10);
    const horarioId = parseInt(DOM.reserva.horarioId.value, 10);
    const asistentes = parseInt(DOM.reserva.asistentes.value, 10);
    const fecha = DOM.reserva.fecha.value;
    const motivo = DOM.reserva.motivo.value;

    try {
        // 👇 CAMBIO CLAVE: Usamos PUT y la URL con el ID
        const datos = await authenticatedFetch(`/reservas/${idReservaEditando}`, 'PUT', {
            aulaId, horarioId, asistentes, fecha, motivo
        });

        if (datos && !datos.error) {
            mostrar({ mensaje: 'Reserva actualizada correctamente' });
            cancelarEdicion(); // Limpia y restaura botones
            cargarReservas();  // Recarga la lista para ver cambios
        } else {
            mostrar({ error: 'No se pudo actualizar' });
        }
    } catch (err) {
        mostrar({ error: err });
    }
}
document.getElementById('btn-editarReserva').addEventListener('click', guardarCambiosReserva);