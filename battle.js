// Variable que almacena el ID del frame de animación activo,
// usada para poder cancelarla cuando el combate termine
let battleAnimationID;

// Función principal del loop de animación del combate
// Se llama a sí misma con requestAnimationFrame para mantener
// todo en movimiento: fondo, personajes y efectos visuales etc
function animateBattle() {
    battleAnimationID = window.requestAnimationFrame(animateBattle);
    battleBackground.draw();
    charmander.draw();
    pikachu.draw();

    // Dibuja todos los sprites de efectos adicionales (como rayos,
    // golpes, etc) que se hayan registrado en el array renderSprites.
    renderSprites.forEach((Sprite) => {
        Sprite.draw();
    });
}

// Escucha los clics en cada botón de ataque de la UI.
// Al hacer clic, verifica que el combate esté activo,
// obtiene el ataque correspondiente al botón pulsado y
// lo ejecuta sobre Charmander usando a Pikachu como atacante.
// También comprueba si alguno de los dos Pokémon ha caído.
document.querySelectorAll('.footer button').forEach((button) => {
    button.addEventListener('click', (e) => {
        if (!battleActivo.initiated) return;

        const attackKey = e.currentTarget.innerHTML.trim();
        const selectedattack = tackles[attackKey];

        if (selectedattack) {
            pikachu.attack({
                attack: selectedattack,
                recipient: charmander,
                renderSprites,
            });
        }

        // Si la salud de Charmander llegó a cero, ejecuta su animación de derrota.
        if (charmander.health <= 0) {
            charmander.faint();
        }

        // Si la salud de Pikachu llegó a cero, ejecuta su animación de derrota.
        if (pikachu.health <= 0) {
            pikachu.faint();
        }
    });
});

// Función central que gestiona toda la lógica de un ataque:
// muestra el diálogo, reproduce el sonido, mueve al atacante,
// aplica el daño, genera efectos visuales y, si el atacante
// es el jugador, desencadena la respuesta del enemigo.
function attack(attacker, { attack, recipient, renderSprites }) {

    // Muestra el cuadro de diálogo con el nombre del ataque usado.
    document.querySelector('#dialogoBox').style.display = 'block'
    document.querySelector('#dialogoBox').innerHTML = attacker.name + ' usó ' + attack.name;
    const timeLine = gsap.timeline();

    // Reproduce el sonido correspondiente según el tipo de ataque:
    // rayo para ataques eléctricos, golpe para el resto.
    if (attack.name === 'Trueno' || attack.name === 'Tacleada_de_Voltios') {
        sfx.rayo.currentTime = 0;
        sfx.rayo.play();
    } else {
        sfx.golpe.currentTime = 0;
        sfx.golpe.play();
    }

    // Detiene el sonido del rayo después de 1 segundo para
    // evitar que siga sonando más tiempo del necesario.
    setTimeout(() => {
        sfx.rayo.pause();
        sfx.rayo.currentTime = 0;
    }, 1000);

    // Determina qué barra de salud actualizar dependiendo
    // de si el atacante es el enemigo o el jugador.
    let healthBar;
    if (attacker.isEnemy) {
        healthBar = '#HP_jugador .hp-fill';
    } else {
        healthBar = '#HP_rival .hp-fill';
    }

    // Define la dirección del movimiento del atacante:
    // el enemigo se mueve a la izquierda, el jugador a la derecha.
    let movementDistance;
    if (attacker.isEnemy) {
        movementDistance = -20;
    } else {
        movementDistance = 20;
    }

    // Callback que se ejecuta cuando el atacante termina su animación.
    // Si el atacante es el jugador y el receptor sigue vivo,
    // el enemigo elige un ataque aleatorio y contraataca tras una pequeña pausa.
    const alTerminarAtaque = () => {
        if (!attacker.isEnemy && recipient.health > 0) {
            const nombresAtaques = Object.keys(ataquesCharmander);
            const nombreAleatorio = nombresAtaques[Math.floor(Math.random() * nombresAtaques.length)];
            const ataqueSeleccionado = ataquesCharmander[nombreAleatorio];

            setTimeout(() => {
                recipient.attack({
                    attack: ataqueSeleccionado,
                    recipient: attacker,
                    renderSprites,
                });
            }, 600);
        }
    };

    // Switch principal que maneja la animación única de cada ataque.
    // Cada caso crea su propio sprite de efecto, lo anima sobre el objetivo
    // y aplica el daño en el momento preciso del impacto.
    switch (attack.name) {

        // Tacleada de Voltios: genera un sprite eléctrico animado,
        // lo posiciona sobre el rival y lanza una secuencia de movimiento
        // hacia adelante y atrás simulando el impacto físico.
        case 'Tacleada_de_Voltios':
            const voltioImage = new Image();
            const voltio = new Sprite({
                posicion: {
                    x: recipient.posicion.x - 35,
                    y: recipient.posicion.y - 20
                },
                image: voltioImage,
                frames: { max: 10, hold: 5 },
                animate: true,
                scale: 1.5
            });
            voltioImage.onload = () => {
                voltio.width = voltioImage.width / 5;
                voltio.height = voltioImage.height / 2;
            };
            voltioImage.src = './img/voltio.png';
            renderSprites.push(voltio);

            // Elimina el sprite del efecto del array al terminar su duración.
            gsap.to(voltio.posicion, {
                duration: 0.6,
                onComplete: () => renderSprites.splice(renderSprites.indexOf(voltio), 1)
            });

            // Secuencia de movimiento: retrocede, avanza e impacta,
            // aplica el daño y sacude al rival visualmente, luego vuelve.
            timeLine.to(attacker.posicion, { x: attacker.posicion.x - movementDistance, duration: 0.1 })
                .to(attacker.posicion, {
                    x: attacker.posicion.x + movementDistance * 2,
                    duration: 0.05,
                    onComplete: () => {
                        const sigueVivo = attacker.applyDamage(recipient, attack, healthBar);
                        if (!sigueVivo) return;
                        gsap.to(recipient.posicion, { x: recipient.posicion.x + 10, yoyo: true, repeat: 3, duration: 0.06 });
                        gsap.to(recipient, { opacity: 0, repeat: 3, yoyo: true, duration: 0.06 });
                    }
                })
                .to(attacker.posicion, { x: attacker.posicion.x, duration: 0.1, onComplete: alTerminarAtaque });
            break;

        // Ataque Rápido: funciona igual que Tacleada de Voltios pero
        // con tiempos de animación más cortos para reflejar su velocidad.
        case 'AtaqueRapido':
            const quickAttackImage = new Image();
            const QuickAttack = new Sprite({
                posicion: { x: recipient.posicion.x - 50, y: recipient.posicion.y - 30 },
                image: quickAttackImage,
                frames: { max: 10, hold: 5 },
                animate: true,
                scale: 1.5
            });
            quickAttackImage.onload = () => {
                QuickAttack.width = quickAttackImage.width / 5;
                QuickAttack.height = quickAttackImage.height / 2;
            };
            quickAttackImage.src = './img/ataqueRapido.png';
            renderSprites.push(QuickAttack);

            // Elimina el sprite del efecto del array al terminar su duración.
            gsap.to(QuickAttack.posicion, {
                duration: 0.6,
                onComplete: () => renderSprites.splice(renderSprites.indexOf(QuickAttack), 1)
            });

            // Movimiento más veloz que el resto de ataques para
            // transmitir la sensación de rapidez del ataque.
            timeLine.to(attacker.posicion, { x: attacker.posicion.x - movementDistance, duration: 0.04 })
                .to(attacker.posicion, {
                    x: attacker.posicion.x + movementDistance * 2,
                    duration: 0.04,
                    onComplete: () => {
                        const sigueVivo = attacker.applyDamage(recipient, attack, healthBar);
                        if (!sigueVivo) return;
                        gsap.to(recipient.posicion, { x: recipient.posicion.x + 10, yoyo: true, repeat: 3, duration: 0.06 });
                        gsap.to(recipient, { opacity: 0, repeat: 3, yoyo: true, duration: 0.06 });
                    }
                })
                .to(attacker.posicion, { x: attacker.posicion.x, duration: 0.04, onComplete: alTerminarAtaque });
            break;

        // Trueno: crea un sprite posicionado por encima del rival
        // para simular el rayo cayendo desde arriba. Dura un poco más que el resto.
        case 'Trueno':
            const truenoImage = new Image();
            const trueno = new Sprite({
                posicion: { x: recipient.posicion.x - 130, y: recipient.posicion.y - 190 },
                image: truenoImage,
                frames: { max: 10, hold: 5 },
                animate: true,
                scale: 3.5
            });
            truenoImage.onload = () => {
                trueno.width = truenoImage.width / 5;
                trueno.height = truenoImage.height / 2;
            };
            truenoImage.src = './img/trueno.png';
            renderSprites.push(trueno);

            // Elimina el sprite del efecto del array al terminar su duración.
            gsap.to(trueno.posicion, {
                duration: 0.7 ,
                onComplete: () => renderSprites.splice(renderSprites.indexOf(trueno), 1)
            });

            // Misma secuencia de movimiento e impacto que los demás ataques.
            timeLine.to(attacker.posicion, { x: attacker.posicion.x - movementDistance, duration: 0.1 })
                .to(attacker.posicion, {
                    x: attacker.posicion.x + movementDistance * 2,
                    duration: 0.05,
                    onComplete: () => {
                        const sigueVivo = attacker.applyDamage(recipient, attack, healthBar);
                        if (!sigueVivo) return;
                        gsap.to(recipient.posicion, { x: recipient.posicion.x + 10, yoyo: true, repeat: 3, duration: 0.06 });
                        gsap.to(recipient, { opacity: 0, repeat: 3, yoyo: true, duration: 0.06 });
                    }
                })
                .to(attacker.posicion, { x: attacker.posicion.x, duration: 0.1, onComplete: alTerminarAtaque });
            break;

        // Tackle: ataque básico sin sprite de efecto adicional,
        // solo animación de movimiento e impacto puro.
        case 'Tackle':
            timeLine.to(attacker.posicion, { x: attacker.posicion.x - movementDistance, duration: 0.1 })
                .to(attacker.posicion, {
                    x: attacker.posicion.x + movementDistance * 2,
                    duration: 0.05,
                    onComplete: () => {
                        const sigueVivo = attacker.applyDamage(recipient, attack, healthBar);
                        if (!sigueVivo) return;
                        gsap.to(recipient.posicion, { x: recipient.posicion.x + 10, yoyo: true, repeat: 3, duration: 0.06 });
                        gsap.to(recipient, { opacity: 0, repeat: 3, yoyo: true, duration: 0.06 });
                    }
                })
                .to(attacker.posicion, { x: attacker.posicion.x, duration: 0.1, onComplete: alTerminarAtaque });
            break;

        // Cuchillada es igual que Tackle en términos de animación,
        // sin sprite de efecto, solo el movimiento del atacante pero a mi,
        case 'cuchillada':
            timeLine.to(attacker.posicion, { x: attacker.posicion.x - movementDistance, duration: 0.1 })
                .to(attacker.posicion, {
                    x: attacker.posicion.x + movementDistance * 2,
                    duration: 0.05,
                    onComplete: () => {
                        const sigueVivo = attacker.applyDamage(recipient, attack, healthBar);
                        if (!sigueVivo) return;
                        gsap.to(recipient.posicion, { x: recipient.posicion.x + 10, yoyo: true, repeat: 3, duration: 0.06 });
                        gsap.to(recipient, { opacity: 0, repeat: 3, yoyo: true, duration: 0.06 });
                    }
                })
                .to(attacker.posicion, { x: attacker.posicion.x, duration: 0.1, onComplete: alTerminarAtaque });
            break;
        
        case 'collejon':
            timeLine.to(attacker.posicion, { x: attacker.posicion.x - movementDistance, duration: 0.1 })
                .to(attacker.posicion, {
                    x: attacker.posicion.x + movementDistance * 2,
                    duration: 0.05,
                    onComplete: () => {
                        const sigueVivo = attacker.applyDamage(recipient, attack, healthBar);
                        if (!sigueVivo) return;
                        gsap.to(recipient.posicion, { x: recipient.posicion.x + 10, yoyo: true, repeat: 3, duration: 0.06 });
                        gsap.to(recipient, { opacity: 0, repeat: 3, yoyo: true, duration: 0.06 });
                    }
                })
                .to(attacker.posicion, { x: attacker.posicion.x, duration: 0.1, onComplete: alTerminarAtaque });
            break;
    }
}

// Estado global del combate: indica si hay una batalla en curso.
const battleActivo = { initiated: false }

// Bandera para evitar que el jugador inicie un combate mientras
// ya hay uno en proceso o en transición.
let battleCooldown = false;

// Al hacer clic en el cuadro de diálogo, simplemente lo oculta.

document.querySelector('#dialogoBox').addEventListener('click', (event) => {
    event.currentTarget.style.display = 'none';
})

// Finaliza el combate
function finalizarCombate() {
    window.cancelAnimationFrame(battleAnimationID);
    musicaBatalla.pause();
    musicaCiudad.play();
    document.querySelector('.battle-ui').style.display = 'none';
    document.querySelector('.footer').style.display = 'none';
    document.querySelector('#dialogoBox').style.display = 'none';
    battleActivo.initiated = false;
    animate();
}

// Oculta todos los elementos de la interfaz del combate al cargar la páginaç
document.querySelector('.battle-ui').style.display = 'none';
document.querySelector('.footer').style.display = 'none';
document.querySelector('#dialogoBox').style.display = 'none';
