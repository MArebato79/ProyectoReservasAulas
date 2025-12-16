import {mostrar,pintarReservas,updateAuthStatus} from "./vista.js";
import  {authenticatedFetch} from "./fecths.js";
import {DOM} from "./document.js";


async function login(e){
    e.preventDefault();

    const email = DOM.auth.email.value;
    const pass = DOM.auth.password.value;

    try{
        const datos = await authenticatedFetch('/auth/login','POST',{email:email,password:pass});

        if(datos && datos.token){
            localStorage.setItem('jwtToken',datos.token);
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