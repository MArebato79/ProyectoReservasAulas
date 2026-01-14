// js/ui.js

// Creamos un objeto constante con todo dentro
export const DOM = {
    // 🔐 Autenticación
    auth: {
        status: document.querySelector("#token-status"),
        div: document.querySelector("#estado-auth"), // Ojo con la mayúscula, revisa tu HTML si es "Auth" o "auth"
        email: document.querySelector("#authEmail"),
        password: document.querySelector("#authPassword")
    },

    // 🏫 Aulas
    aula: {
        nombre: document.getElementById('nombreAula'),
        capacidad: document.getElementById('capacidadAula'),
        esOrdenadores: document.getElementById('ordenadoresAula'),
        numOrdenadores: document.getElementById('numOrdenadoresAula')
    },

    // 🕒 Horarios
    horario: {
        dia: document.getElementById('diaSemanaHorario'),
        tipo: document.getElementById('tipoHorario'),
        sesion: document.getElementById('sesionDiaHorario'),
        inicio: document.getElementById('horaInicioHorario'),
        fin: document.getElementById('horaFinHorario')
    },


    reserva: {
        aulaId: document.getElementById('idAulaReserva'),
        horarioId: document.getElementById('idHorarioReserva'),
        usuarioId: document.getElementById('idUsuarioReserva'),
        asistentes: document.getElementById('asistentesReserva'),
        fecha: document.getElementById('fechaReserva'), // ¡Te faltaba este
    },

    elementos:{
        contenedor: document.getElementById('contenedor-reservas'),
        output: document.getElementById('output')
    },

    botones:{
        btnLogin: document.getElementById('btn-login'),
        btnLogout: document.getElementById('btn-logout'),
        btnRegisterProfe: document.getElementById('btn-register-profe'),
        btnRegisterAdmin: document.getElementById('btn-register-admin'),
        btnVerAulas: document.getElementById('btn-verAulas'),
        btnVerHorarios: document.getElementById('btn-verHorarios'),
        btnVerReservas: document.getElementById('btn-verReservas'),
        btnCrearAula: document.getElementById('btn-crearAula'),
        btnCrearHorario: document.getElementById('btn-crearHorario'),
        btnCrearReserva: document.getElementById('btn-crearReserva'),
    }
};