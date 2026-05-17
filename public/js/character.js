const musicaLogin = document.querySelector('#musicaLogin');
const mensajeLogin = document.querySelector('#mensajeLogin');
const opcionesPersonaje = document.querySelectorAll('.personajeOpcion');
const rutaPersonajeXampp = 'http://localhost/Proyecto_final_3/backend/character.html';

// Controla la seleccion del personaje inicial.
function redirigirAXamppSiHaceFalta() {
    const hostCorrecto = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    const puertoCorrecto = window.location.port === '' || window.location.port === '80';
    const rutaCorrecta = decodeURIComponent(window.location.pathname).endsWith('/Proyecto_final_3/backend/character.html');

    if (!hostCorrecto || !puertoCorrecto || !rutaCorrecta) {
        window.location.href = rutaPersonajeXampp;
    }
}

function mostrarMensaje(texto) {
    mensajeLogin.textContent = texto;
}

async function leerRespuestaJson(respuesta) {
    const texto = await respuesta.text();

    try {
        return JSON.parse(texto);
    } catch (error) {
        return {
            success: false,
            message: 'PHP no devolvio JSON. Abre el proyecto desde Apache/XAMPP.'
        };
    }
}

function iniciarMusicaLogin() {
    musicaLogin.volume = 0.4;
    musicaLogin.play().catch(() => {
        console.log('El navegador espera una interaccion para reproducir audio.');
    });
}

async function comprobarSesion() {
    const respuesta = await fetch('session.php');
    const sesion = await leerRespuestaJson(respuesta);

    if (!sesion.logged) {
        window.location.href = 'login.html';
        return;
    }

    if (sesion.personaje) {
        window.location.href = '../game.html';
        return;
    }
}

async function elegirPersonaje(personaje) {
    mostrarMensaje('Guardando entrenador...');

    try {
        const respuesta = await fetch('select-character.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ personaje })
        });
        const datos = await leerRespuestaJson(respuesta);

        if (datos.success) {
            window.location.href = '../game.html';
        } else {
            mostrarMensaje(datos.message || 'No se pudo guardar el personaje');
        }
    } catch (error) {
        mostrarMensaje('No se pudo conectar con Apache/XAMPP');
    }
}

redirigirAXamppSiHaceFalta();
comprobarSesion();
iniciarMusicaLogin();
window.addEventListener('keydown', iniciarMusicaLogin);
window.addEventListener('click', iniciarMusicaLogin);

opcionesPersonaje.forEach((opcion) => {
    opcion.addEventListener('click', () => {
        elegirPersonaje(opcion.dataset.personaje);
    });
});


