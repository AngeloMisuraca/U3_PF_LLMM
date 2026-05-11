const CLAVE_GUARDADO_PARTIDA = 'pokemon_daw_partida_guardada';
const CLAVE_POKEMONES_CAPTURADOS = 'pokemon_daw_pokemones_capturados';

let menuBolsaAbierto = false;
let opcionMenuBolsa = 'guardar';
let estadoGuardado = null;
let idUsuarioGuardado = 'general';

function obtenerClaveGuardadoPartida() {
    return `${CLAVE_GUARDADO_PARTIDA}_${idUsuarioGuardado}`;
}

function obtenerClavePokemonesCapturados() {
    return `${CLAVE_POKEMONES_CAPTURADOS}_${idUsuarioGuardado}`;
}

function prepararGuardadoPartida(idUsuario) {
    idUsuarioGuardado = idUsuario || 'general';
    estadoGuardado = cargarEstadoGuardado();

    return estadoGuardado;
}

function obtenerPokemonesCapturados() {
    const capturados = localStorage.getItem(obtenerClavePokemonesCapturados());

    if (!capturados) return [];

    try {
        return JSON.parse(capturados);
    } catch (error) {
        return [];
    }
}

function guardarPokemonesCapturados(capturados) {
    localStorage.setItem(obtenerClavePokemonesCapturados(), JSON.stringify(capturados));
}

function agregarPokemonCapturado(pokemon) {
    const capturados = obtenerPokemonesCapturados();
    capturados.push(pokemon);
    guardarPokemonesCapturados(capturados);
}

function detenerMovimientoJugador() {
    if (typeof keys === 'undefined') return;

    Object.keys(keys).forEach((key) => {
        keys[key].presionada = false;
    });

    if (jugador) {
        jugador.animate = false;
    }
}

function limpiarTexto(texto) {
    return String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function crearEstadoPartida() {
    return {
        fecha: new Date().toISOString(),
        mapa: {
            x: fondo.posicion.x,
            y: fondo.posicion.y
        },
        jugador: {
            x: jugador.posicion.x,
            y: jugador.posicion.y,
            direccion: ultimaKey || 'ArrowDown'
        },
        batalla: {
            activa: battleActivo.initiated,
            pikachuVida: pikachu.health,
            rivalVida: charmander.health
        },
        pokemonesCapturados: obtenerPokemonesCapturados()
    };
}

function aplicarEstadoPartida(estado) {
    if (!estado || !estado.mapa) return;

    const diferenciaX = estado.mapa.x - fondo.posicion.x;
    const diferenciaY = estado.mapa.y - fondo.posicion.y;

    simboloMovible.forEach((elemento) => {
        elemento.posicion.x += diferenciaX;
        elemento.posicion.y += diferenciaY;
    });

    if (estado.jugador) {
        jugador.posicion.x = estado.jugador.x;
        jugador.posicion.y = estado.jugador.y;

        const direccion = {
            ArrowUp: 'arriba',
            ArrowDown: 'abajo',
            ArrowLeft: 'izquierda',
            ArrowRight: 'derecha'
        }[estado.jugador.direccion] || 'abajo';

        ponerDireccionJugador(direccion);
    }

    if (estado.batalla) {
        pikachu.health = estado.batalla.pikachuVida ?? 100;
        charmander.health = estado.batalla.rivalVida ?? 100;
        document.querySelector('#HP_jugador .hp-fill').style.width = pikachu.health + '%';
        document.querySelector('#HP_rival .hp-fill').style.width = charmander.health + '%';
    }

    if (Array.isArray(estado.pokemonesCapturados)) {
        guardarPokemonesCapturados(estado.pokemonesCapturados);
    }
}

function reanudarBatallaGuardada(estado) {
    if (!estado || !estado.batalla || !estado.batalla.activa) return false;

    battleActivo.initiated = true;

    gsap.set(pikachu, { opacity: 1 });
    gsap.set(charmander, { opacity: 1 });
    gsap.set(pikachu.posicion, { x: 380, y: 490 });
    gsap.set(charmander.posicion, { x: 788, y: 140 });

    document.querySelector('.battle-ui').style.display = 'block';
    document.querySelector('.footer').style.display = 'grid';
    iniciarInterfazBatalla();

    musicaCiudad.pause();
    musicaBatalla.currentTime = 10;
    musicaBatalla.play().catch(() => {
        console.log('El navegador espera una interaccion para reproducir audio.');
    });
    animateBattle();

    return true;
}

function cargarEstadoGuardado() {
    const guardado = localStorage.getItem(obtenerClaveGuardadoPartida());

    if (!guardado) return null;

    try {
        return JSON.parse(guardado);
    } catch (error) {
        return null;
    }
}

function guardarEstadoPartida() {
    const estado = crearEstadoPartida();
    localStorage.setItem(obtenerClaveGuardadoPartida(), JSON.stringify(estado));
    estadoGuardado = estado;
    renderMenuBolsa('Partida guardada correctamente.');
}

function renderListaCapturados() {
    const capturados = obtenerPokemonesCapturados();

    if (capturados.length === 0) {
        return '<p>No hay pokemones capturados todavia.</p>';
    }

    return `
        <ul class="menu-bolsa-lista">
            ${capturados.map((pokemon) => `<li>${limpiarTexto(pokemon.nombre || pokemon)}</li>`).join('')}
        </ul>
    `;
}

function renderMenuBolsa(mensaje = '') {
    const contenido = document.querySelector('#menuBolsaContenido');
    const botones = document.querySelectorAll('[data-menu-opcion]');

    botones.forEach((boton) => {
        boton.classList.toggle('activo', boton.dataset.menuOpcion === opcionMenuBolsa);
    });

    if (opcionMenuBolsa === 'guardar') {
        contenido.innerHTML = `
            <p>Guarda la partida en este punto.</p>
            <button type="button" id="botonGuardarPartida">Guardar partida</button>
            ${mensaje ? `<span class="menu-bolsa-mensaje">${mensaje}</span>` : ''}
        `;

        document.querySelector('#botonGuardarPartida').addEventListener('click', guardarEstadoPartida);
        return;
    }

    contenido.innerHTML = renderListaCapturados();
}

function cerrarMenuBolsa() {
    const menu = document.querySelector('#menuBolsa');

    if (!menu) return;

    menuBolsaAbierto = false;
    menu.style.display = 'none';

    if (menu.contains(document.activeElement)) {
        document.activeElement.blur();
    }

    detenerMovimientoJugador();
}

function abrirMenuBolsa() {
    const menu = document.querySelector('#menuBolsa');

    if (!menu) return;

    menuBolsaAbierto = true;
    menu.style.display = 'grid';
    detenerMovimientoJugador();
    renderMenuBolsa();
}

function menu_bolsa() {
    if (!juegoIniciado) return;

    if (menuBolsaAbierto) {
        cerrarMenuBolsa();
        return;
    }

    abrirMenuBolsa();
}

document.querySelectorAll('[data-menu-opcion]').forEach((boton) => {
    boton.addEventListener('click', () => {
        opcionMenuBolsa = boton.dataset.menuOpcion;
        renderMenuBolsa();
    });
});

window.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();

        if (!menuBolsaAbierto) {
            menu_bolsa();
            return;
        }

        if (opcionMenuBolsa === 'guardar') {
            guardarEstadoPartida();
        } else {
            renderMenuBolsa();
        }

        return;
    }

    if (!menuBolsaAbierto) return;

    if (event.key === 'Escape') {
        event.preventDefault();
        cerrarMenuBolsa();
        return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        opcionMenuBolsa = opcionMenuBolsa === 'guardar' ? 'capturados' : 'guardar';
        renderMenuBolsa();
    }
});
