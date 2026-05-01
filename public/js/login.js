const musicaLogin = document.querySelector('#musicaLogin');
const pantallaLogin = document.querySelector('.loginPantalla');
const formLogin = document.querySelector('#formLogin');
const mensajeLogin = document.querySelector('#mensajeLogin');
const rutaLoginXampp = 'http://localhost/Proyecto%20final%202/backend/login.html';

function redirigirAXamppSiHaceFalta() {
    const hostCorrecto = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    const puertoCorrecto = window.location.port === '' || window.location.port === '80';
    const rutaCorrecta = decodeURIComponent(window.location.pathname).endsWith('/Proyecto final 2/backend/login.html');

    if (!hostCorrecto || !puertoCorrecto || !rutaCorrecta) {
        window.location.href = `${rutaLoginXampp}${window.location.search}`;
    }
}

redirigirAXamppSiHaceFalta();

musicaLogin.volume = 0.4;

function mostrarMensaje(texto) {
    mensajeLogin.textContent = texto;
}

async function leerRespuestaJson(respuesta) {
    const texto = await respuesta.text();

    try {
        return JSON.parse(texto);
    } catch (error) {
        if (window.location.protocol === 'file:') {
            return {
                success: false,
                message: 'Abre el juego desde http://localhost/Proyecto%20final%202/backend/login.html'
            };
        }

        return {
            success: false,
            message: 'PHP no devolvio JSON. Abre el proyecto desde Apache/XAMPP, no desde Live Server.'
        };
    }
}

function iniciarMusicaLogin() {
    musicaLogin.play().catch(() => {
        console.log('El navegador espera una interaccion para reproducir audio.');
    });
}

function irAlJuego() {
    pantallaLogin.classList.add('saliendo');
    bajarMusicaLogin();

    setTimeout(() => {
        window.location.href = '../index.html?juego=1';
    }, 800);
}

function bajarMusicaLogin() {
    const intervalo = setInterval(() => {
        musicaLogin.volume = Math.max(musicaLogin.volume - 0.05, 0);

        if (musicaLogin.volume <= 0) {
            clearInterval(intervalo);
            musicaLogin.pause();
        }
    }, 100);
}

formLogin.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.querySelector('#loginUsuario').value.trim();
    const password = document.querySelector('#loginPassword').value;

    mostrarMensaje('Comprobando entrenador...');

    try {
        const respuesta = await fetch('login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const datos = await leerRespuestaJson(respuesta);

        if (datos.success) {
            irAlJuego();
        } else {
            mostrarMensaje(datos.message || 'No se pudo entrar');
        }
    } catch (error) {
        mostrarMensaje('No se pudo conectar con Apache/XAMPP');
    }
});

iniciarMusicaLogin();
window.addEventListener('keydown', iniciarMusicaLogin);
window.addEventListener('click', iniciarMusicaLogin);

const modoInicial = new URLSearchParams(window.location.search).get('modo');

if (modoInicial === 'registro') {
    document.querySelector('#registroUsuario').focus();
} else {
    document.querySelector('#loginUsuario').focus();
}
