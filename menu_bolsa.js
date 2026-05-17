const CLAVE_GUARDADO_PARTIDA = 'pokemon_daw_partida_guardada';
const CLAVE_POKEMONES_CAPTURADOS = 'pokemon_daw_pokemones_capturados';

// Gestiona bolsa, guardado y capturas del juego.
let menuBolsaAbierto = false;
let opcionMenuBolsa = 'guardar';
let estadoGuardado = null;
let idUsuarioGuardado = 'general';
let pokemonesCapturadosGuardados = [];
let temporizadorGuardadoAutomatico = null;

function obtenerClaveGuardadoPartida() {
    return `${CLAVE_GUARDADO_PARTIDA}_${idUsuarioGuardado}`;
}

function obtenerClavePokemonesCapturados() {
    return `${CLAVE_POKEMONES_CAPTURADOS}_${idUsuarioGuardado}`;
}

async function prepararGuardadoPartida(idUsuario) {
    idUsuarioGuardado = idUsuario || 'general';
    estadoGuardado = await cargarEstadoGuardado();

    return estadoGuardado;
}

function obtenerPokemonesCapturados() {
    return [...pokemonesCapturadosGuardados];
}

function cargarEstadoGuardadoLocal() {
    const guardado = localStorage.getItem(obtenerClaveGuardadoPartida());

    if (!guardado) {
        return null;
    }

    try {
        return JSON.parse(guardado);
    } catch (error) {
        return null;
    }
}

function cargarPokemonesCapturadosLocales() {
    const capturados = localStorage.getItem(obtenerClavePokemonesCapturados());

    if (!capturados) {
        return [];
    }

    try {
        return JSON.parse(capturados);
    } catch (error) {
        return [];
    }
}

function guardarEstadoGuardadoLocal(estado) {
    try {
        localStorage.setItem(obtenerClaveGuardadoPartida(), JSON.stringify(estado));
    } catch (error) {
        console.log('No se pudo guardar la copia local de la partida.');
    }
}

function guardarPokemonesCapturadosLocales(capturados) {
    try {
        localStorage.setItem(obtenerClavePokemonesCapturados(), JSON.stringify(capturados));
    } catch (error) {
        console.log('No se pudo guardar la copia local de los pokemones capturados.');
    }
}

async function pedirJsonBackend(ruta, opciones = {}) {
    const respuesta = await fetch(ruta, {
        ...opciones,
        headers: {
            'Content-Type': 'application/json',
            ...(opciones.headers || {})
        }
    });

    return respuesta.json();
}

async function guardarPokemonCapturadoEnBBDD(pokemon) {
    try {
        await pedirJsonBackend('backend/save-pokemon.php', {
            method: 'POST',
            body: JSON.stringify({ pokemon })
        });
    } catch (error) {
        console.log('No se pudo guardar el pokemon capturado en la base de datos.');
    }
}

async function guardarEstadoEnBBDD(estado) {
    const pokemonesCapturados = Array.isArray(estado.pokemonesCapturados)
        ? estado.pokemonesCapturados
        : obtenerPokemonesCapturados();

    return pedirJsonBackend('backend/save-game.php', {
        method: 'POST',
        body: JSON.stringify({
            estado,
            pokemonesCapturados
        })
    });
}

function guardarPokemonesCapturados(capturados) {
    pokemonesCapturadosGuardados = Array.isArray(capturados) ? [...capturados] : [];
    guardarPokemonesCapturadosLocales(pokemonesCapturadosGuardados);
}

function agregarPokemonCapturado(pokemon) {
    const capturados = obtenerPokemonesCapturados();
    capturados.push(pokemon);
    guardarPokemonesCapturados(capturados);
    programarGuardadoAutomatico();
}

function detenerMovimientoJugador() {
    if (typeof keys === 'undefined') {
        return;
    }

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

function puedeCrearEstadoPartida() {
    return typeof fondo !== 'undefined'
        && typeof jugador !== 'undefined'
        && typeof pikachu !== 'undefined'
        && typeof charmander !== 'undefined'
        && fondo
        && jugador
        && pikachu
        && charmander;
}

function crearEstadoPartida({ mantenerPosicionGuardada = false } = {}) {
    const estado = {
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
            rivalVida: charmander.health,
            rivalNivel: charmander.nivel || nivelRivalActual
        },
        pokemonPrincipal: obtenerEstadisticasPikachu(),
        pokemonesCapturados: obtenerPokemonesCapturados()
    };

    if (mantenerPosicionGuardada && estadoGuardado && estadoGuardado.mapa && estadoGuardado.jugador) {
        estado.mapa = { ...estadoGuardado.mapa };
        estado.jugador = { ...estadoGuardado.jugador };
    }

    return estado;
}

async function persistirEstadoPartida(estado) {
    estadoGuardado = estado;
    guardarEstadoGuardadoLocal(estado);
    guardarPokemonesCapturados(estado.pokemonesCapturados || []);

    return guardarEstadoEnBBDD(estado);
}

async function guardarEstadoPartidaSilencioso() {
    if (!puedeCrearEstadoPartida()) {
        return;
    }

    const estado = crearEstadoPartida({ mantenerPosicionGuardada: true });

    try {
        await persistirEstadoPartida(estado);
    } catch (error) {
        console.log('No se pudo guardar la partida automaticamente en la base de datos.');
    }
}

function programarGuardadoAutomatico(retraso = 500) {
    clearTimeout(temporizadorGuardadoAutomatico);
    temporizadorGuardadoAutomatico = setTimeout(() => {
        guardarEstadoPartidaSilencioso();
    }, retraso);
}

function guardarEstadoPartidaAlSalir() {
    if (!puedeCrearEstadoPartida() || typeof juegoIniciado === 'undefined' || !juegoIniciado) {
        return;
    }

    const estado = crearEstadoPartida({ mantenerPosicionGuardada: true });
    const payload = JSON.stringify({
        estado,
        pokemonesCapturados: estado.pokemonesCapturados
    });

    estadoGuardado = estado;
    guardarEstadoGuardadoLocal(estado);

    if (navigator.sendBeacon) {
        const datos = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('backend/save-game.php', datos);
        return;
    }

    fetch('backend/save-game.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
    }).catch(() => {});
}

function aplicarEstadoPartida(estado) {
    if (!estado || !estado.mapa) {
        return;
    }

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
        pikachu.health = estado.batalla.pikachuVida !== undefined && estado.batalla.pikachuVida !== null
            ? estado.batalla.pikachuVida
            : 100;
        charmander.health = estado.batalla.rivalVida !== undefined && estado.batalla.rivalVida !== null
            ? estado.batalla.rivalVida
            : 100;
        nivelRivalActual = estado.batalla.rivalNivel !== undefined && estado.batalla.rivalNivel !== null
            ? estado.batalla.rivalNivel
            : nivelRivalActual;
        charmander.nivel = nivelRivalActual;
        document.querySelector('#HP_jugador .hp-fill').style.width = pikachu.health + '%';
        document.querySelector('#HP_rival .hp-fill').style.width = charmander.health + '%';
    }

    aplicarEstadisticasPikachu(estado.pokemonPrincipal);

    if (Array.isArray(estado.pokemonesCapturados)) {
        guardarPokemonesCapturados(estado.pokemonesCapturados);
    }
}

function reanudarBatallaGuardada(estado) {
    if (!estado || !estado.batalla || !estado.batalla.activa) {
        return false;
    }

    battleActivo.initiated = true;
    battleActivo.victoriaRegistrada = false;
    nivelRivalActual = estado.batalla.rivalNivel !== undefined && estado.batalla.rivalNivel !== null
        ? estado.batalla.rivalNivel
        : nivelRivalActual;
    charmander.nivel = nivelRivalActual;
    actualizarPanelNiveles();

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

async function cargarEstadoGuardado() {
    try {
        const datos = await pedirJsonBackend('backend/load-game.php');

        if (datos.success) {
            pokemonesCapturadosGuardados = Array.isArray(datos.pokemonesCapturados)
                ? datos.pokemonesCapturados
                : [];

            if (datos.estado) {
                datos.estado.pokemonesCapturados = obtenerPokemonesCapturados();
                guardarEstadoGuardadoLocal(datos.estado);
                return datos.estado;
            }

            const estadoLocal = cargarEstadoGuardadoLocal();
            const pokemonesLocales = cargarPokemonesCapturadosLocales();

            if (estadoLocal) {
                pokemonesCapturadosGuardados = Array.isArray(estadoLocal.pokemonesCapturados)
                    ? estadoLocal.pokemonesCapturados
                    : pokemonesLocales;
                estadoLocal.pokemonesCapturados = obtenerPokemonesCapturados();
                guardarEstadoEnBBDD(estadoLocal).catch(() => {
                    console.log('No se pudo migrar la partida local a la base de datos.');
                });
                return estadoLocal;
            }

            if (pokemonesCapturadosGuardados.length === 0 && pokemonesLocales.length > 0) {
                pokemonesCapturadosGuardados = pokemonesLocales;
                pokemonesLocales.forEach((pokemon) => {
                    guardarPokemonCapturadoEnBBDD(pokemon);
                });
            }

            return null;
        }
    } catch (error) {
        console.log('No se pudo cargar la partida desde la base de datos.');
    }

    const estadoLocal = cargarEstadoGuardadoLocal();
    pokemonesCapturadosGuardados = estadoLocal && Array.isArray(estadoLocal.pokemonesCapturados)
        ? estadoLocal.pokemonesCapturados
        : cargarPokemonesCapturadosLocales();

    return estadoLocal;
}

async function guardarEstadoPartida({ mostrarMensaje = true } = {}) {
    if (!puedeCrearEstadoPartida()) {
        return;
    }

    const estado = crearEstadoPartida();

    if (mostrarMensaje) {
        renderMenuBolsa('Guardando partida...');
    }

    try {
        const datos = await persistirEstadoPartida(estado);

        if (mostrarMensaje) {
            renderMenuBolsa(datos.success
                ? 'Partida guardada correctamente.'
                : (datos.message || 'No se pudo guardar la partida.'));
        }
    } catch (error) {
        if (mostrarMensaje) {
            renderMenuBolsa('No se pudo guardar la partida en la base de datos.');
        }
    }
}

function renderListaCapturados() {
    const capturados = obtenerPokemonesCapturados();

    if (capturados.length === 0) {
        return '<p>No hay pokemones capturados todavia.</p>';
    }

    return `
        <ul class="menu-bolsa-lista">
            ${capturados.map((pokemon) => {
                const nombre = limpiarTexto(pokemon.nombre || pokemon);
                const nivel = pokemon.nivel ? ` - Lv.${limpiarTexto(pokemon.nivel)}` : '';

                return `<li>${nombre}${nivel}</li>`;
            }).join('')}
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

    if (!menu) {
        return;
    }

    menuBolsaAbierto = false;
    menu.style.display = 'none';

    if (menu.contains(document.activeElement)) {
        document.activeElement.blur();
    }

    detenerMovimientoJugador();
}

function abrirMenuBolsa() {
    const menu = document.querySelector('#menuBolsa');

    if (!menu) {
        return;
    }

    menuBolsaAbierto = true;
    menu.style.display = 'grid';
    detenerMovimientoJugador();
    renderMenuBolsa();
}

function menu_bolsa() {
    if (!juegoIniciado) {
        return;
    }

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

    if (!menuBolsaAbierto) {
        return;
    }

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

window.addEventListener('pagehide', guardarEstadoPartidaAlSalir);

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        guardarEstadoPartidaAlSalir();
    }
});
