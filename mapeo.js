const limites = [];
const battleZones = [];
let simboloMovible = [];

const desplazamiento = {
    x: -640,
    y: -500
};

// Prepara colisiones y zonas de batalla del mapa.
function colisionRectangular({ rectangulo1, rectangulo2 }) {
    return (
        rectangulo1.posicion.x + rectangulo1.width >= rectangulo2.posicion.x &&
        rectangulo1.posicion.x <= rectangulo2.posicion.x + rectangulo2.width &&
        rectangulo1.posicion.y <= rectangulo2.posicion.y + rectangulo2.height &&
        rectangulo1.posicion.y + rectangulo1.height >= rectangulo2.posicion.y
    );
}

function mapeo() {
    const collisionMap = [];
    for (let i = 0; i < collisions.length; i += 70) {
        collisionMap.push(collisions.slice(i, 70 + i));
    }

    const battleZoneMap = [];
    for (let i = 0; i < battle.length; i += 70) {
        battleZoneMap.push(battle.slice(i, 70 + i));
    }

    limites.length = 0;
    battleZones.length = 0;

    collisionMap.forEach((row, i) => {
        row.forEach((simbolo, j) => {
            if (simbolo === 1025) {
                limites.push(new Limite({
                    posicion: {
                        x: j * Limite.width + desplazamiento.x,
                        y: i * Limite.height + desplazamiento.y,
                    }
                }));
            }
        });
    });

    battleZoneMap.forEach((row, i) => {
        row.forEach((simbolo, j) => {
            if (simbolo === 1025) {
                battleZones.push(new Limite({
                    posicion: {
                        x: j * Limite.width + desplazamiento.x,
                        y: i * Limite.height + desplazamiento.y,
                    }
                }));
            }
        });
    });

    simboloMovible = [fondo, ...limites, foreground, ...battleZones];
}
