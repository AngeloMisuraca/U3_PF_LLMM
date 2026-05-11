let jugador, fondo, foreground, battleBackground, charmander, pikachu;
const renderSprites = [];
const spritesEntrenadores = {
    maximo: {
        arriba: './img/MaximoUp.png',
        abajo: './img/MaximoDown.png',
        izquierda: './img/MaximoLeft.png',
        derecha: './img/MaximoRigth.png'
    },
    cynthia: {
        arriba: './img/cynthia_up_fixed.png',
        abajo: './img/cynthia_down_fixed.png',
        izquierda: './img/cynthia_left_fixed.png',
        derecha: './img/cynthia_rigth_fixed.png'
    }
};

function crearImagen(ruta) {
    const image = new Image();
    image.src = ruta;
    return image;
}

function cargarSpritesEntrenador(personaje = 'maximo') {
    const rutas = spritesEntrenadores[personaje] || spritesEntrenadores.maximo;

    return {
        arriba: crearImagen(rutas.arriba),
        abajo: crearImagen(rutas.abajo),
        izquierda: crearImagen(rutas.izquierda),
        derecha: crearImagen(rutas.derecha)
    };
}

function cambiarSpriteJugador(personaje = 'maximo') {
    if (!jugador) return;

    const sprites = cargarSpritesEntrenador(personaje);
    jugador.sprites = sprites;
    ponerDireccionJugador('abajo');
    jugador.frames.value = 0;
}

function ponerDireccionJugador(direccion) {
    if (!jugador || !jugador.sprites[direccion]) return;

    jugador.image = jugador.sprites[direccion];
    actualizarDimensionesJugador();
    jugador.image.onload = actualizarDimensionesJugador;
}

function actualizarDimensionesJugador() {
    if (!jugador || !jugador.image.width) return;

    jugador.width = jugador.image.width / jugador.frames.max;
    jugador.height = jugador.image.height;
}

function SpriteImages() {
    const image = new Image();
    image.src = './img/pokemon style game map.png'

    const foregroundImage = new Image();
    foregroundImage.src = './img/foreground.png'

    const spritesJugador = cargarSpritesEntrenador();

    jugador = new Sprite({
        posicion: {
            x: canvas.width / 2 - 256 / 4,
            y: canvas.height / 2 - 56 / 2,
        },
        image: spritesJugador.abajo,
        frames: {
            max: 4
        },
        sprites: spritesJugador
    })

    fondo = new Sprite({
        posicion: {
            x: desplazamiento.x,
            y: desplazamiento.y
        },
        image: image
    });

    foreground = new Sprite({
        posicion: {
            x: desplazamiento.x,
            y: desplazamiento.y
        },
        image: foregroundImage
    });

    const battleBackgoundImage = new Image();
    battleBackgoundImage.src = './img/battleBackground.png';

    battleBackground = new Sprite({
        posicion: {
            x: 0,
            y: 0,
        },
        image: battleBackgoundImage,
        scale: 0.8
    });

    const charmanderImage = new Image();
    charmanderImage.src = './img/charmander.png';

    charmander = new Sprite({
        posicion: {
            x: 788,
            y: 140,
        },
        image: charmanderImage,
        frames: {
            max: 5,
        },
        animate: true,
        isEnemy: true,
        name: 'Charmander',
        scale: 2.5
    });

    const pikachuImage = new Image();
    pikachuImage.src = './img/pikachu.png';

    pikachu = new Sprite({
        posicion: {
            x: 380,
            y: 490,
        },
        image: pikachuImage,
        frames: {
            max: 4,
        },
        animate: true,
        name: 'Pikachu',
        scale: -0.5
    });
}
