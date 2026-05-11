SpriteImages();

mapeo();

let juegoIniciado = false;

function animate() {
    const animationID = window.requestAnimationFrame(animate);
    fondo.draw();
    limites.forEach(limite => {
        limite.draw()
    })
    battleZones.forEach((battleZone) => {
        battleZone.draw()
    })
    jugador.draw();
    foreground.draw()

    let moving = true;
    jugador.animate = false;

    // PF3
    if (battleActivo.initiated) return

    if (menuBolsaAbierto) return

    if (keys.ArrowUp.presionada || keys.ArrowDown.presionada || keys.ArrowLeft.presionada || keys.ArrowRight.presionada) {
        for (let i = 0; i < battleZones.length; i++) {
            const battlezone = battleZones[i];

            if (colisionRectangular({
                rectangulo1: jugador,
                rectangulo2: battlezone
            }) && Math.random() < 0.002
            ) {
                // PF3
                window.cancelAnimationFrame(animationID)

                // PF3
                musicaCiudad.pause();
                musicaBatalla.currentTime = 10;
                musicaBatalla.play();

                battleActivo.initiated = true

                pikachu.health = 100;
                charmander.health = 100;
                document.querySelector('#HP_jugador .hp-fill').style.width = '100%';
                document.querySelector('#HP_rival .hp-fill').style.width = '100%';

                gsap.set(pikachu, { opacity: 1 });
                gsap.set(charmander, { opacity: 1 });
                gsap.set(pikachu.posicion, { x: 380, y: 490 });
                gsap.set(charmander.posicion, { x: 788, y: 140 });

                // PF3
                gsap.to('#overlappingDiv', {
                    opacity: 1,
                    repeat: 3,
                    yoyo: true, // PF3
                    duration: 0.5,
                    onComplete() {
                        gsap.to('#overlappingDiv', {
                            opacity: 1, 
                            duration: 0.5,
                            onComplete() {
                                document.querySelector('.battle-ui').style.display = 'block';
                                document.querySelector('.footer').style.display = 'grid';
                                iniciarInterfazBatalla();

                                animateBattle();

                                // PF3
                                gsap.to('#overlappingDiv', {
                                    opacity: 0,
                                    duration: 0.5
                                })
                            }
                        })
                    }
                })
                break;
            }
        }
    }

    let velocidad = 3;

    if (keys.Space.presionada) {
        velocidad = 8;
        jugador.animSpeed = 3;

    } else {
        velocidad = 3;
        jugador.animSpeed = 10;

    }

    if (keys.ArrowUp.presionada && ultimaKey === "ArrowUp") {
        // PF3
        jugador.animate = true
        ponerDireccionJugador('arriba')

        // PF3
        // PF3
        for (let i = 0; i < limites.length; i++) {
            const limite = limites[i];
            
            if (colisionRectangular({ rectangulo1: jugador, rectangulo2: { ...limite, posicion: { x: limite.posicion.x, y: limite.posicion.y + 3 } } })) {
                // PF3
                moving = false; break;
            }
        }
        // PF3
        if (moving) simboloMovible.forEach(Movibles => { Movibles.posicion.y += velocidad })
    }
    else if (keys.ArrowDown.presionada && ultimaKey == "ArrowDown") {
        jugador.animate = true
        ponerDireccionJugador('abajo')
        for (let i = 0; i < limites.length; i++) {
            const limite = limites[i];

            if (colisionRectangular({ rectangulo1: jugador, rectangulo2: { ...limite, posicion: { x: limite.posicion.x, y: limite.posicion.y - 3 } } })) {
                moving = false; break;
            }
        }
        if (moving) simboloMovible.forEach(Movibles => { Movibles.posicion.y -= velocidad })
    }
    else if (keys.ArrowLeft.presionada && ultimaKey == "ArrowLeft") {
        jugador.animate = true
        ponerDireccionJugador('izquierda')
        for (let i = 0; i < limites.length; i++) {
            const limite = limites[i];
            if (colisionRectangular({ rectangulo1: jugador, rectangulo2: { ...limite, posicion: { x: limite.posicion.x + 3, y: limite.posicion.y } } })) {
                moving = false; break;
            }
        }
        if (moving) simboloMovible.forEach(Movibles => { Movibles.posicion.x += velocidad })
    }
    else if (keys.ArrowRight.presionada && ultimaKey == "ArrowRight") {
        jugador.animate = true
        ponerDireccionJugador('derecha')
        for (let i = 0; i < limites.length; i++) {
            const limite = limites[i];
            if (colisionRectangular({ rectangulo1: jugador, rectangulo2: { ...limite, posicion: { x: limite.posicion.x - 3, y: limite.posicion.y } } })) {
                moving = false; break;
            }
        }
        if (moving) simboloMovible.forEach(Movibles => { Movibles.posicion.x -= velocidad })
    }
}

async function empezarJuego() {
    const respuesta = await fetch('backend/session.php');
    const sesion = await respuesta.json();

    if (!sesion.logged) {
        window.location.href = 'backend/login.html';
        return;
    }

    if (!sesion.personaje) {
        window.location.href = 'backend/character.html';
        return;
    }

    estadoGuardado = prepararGuardadoPartida(sesion.user_id || sesion.user);
    juegoIniciado = true;
    cambiarSpriteJugador(sesion.personaje);

    if (estadoGuardado) {
        aplicarEstadoPartida(estadoGuardado);
    }

    document.querySelector('.displayDiv').style.opacity = 0;

    if (reanudarBatallaGuardada(estadoGuardado)) {
        if (musicaIntro) musicaIntro.pause();
    } else {
        cambiarMusicaIntroAMapa();
        animate();
    }

    setTimeout(() => {
        document.querySelector('.displayDiv').style.opacity = 1;
    }, 100);
}

empezarJuego();
