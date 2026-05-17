// Gestiona combates, capturas y experiencia.
let battleAnimationID;
let accionBatallaEnProgreso = false;
const TIEMPO_CONTEO_CAPTURA = 1000;
const TIEMPO_RESULTADO_BATALLA = 1800;
const TIEMPO_ENTRE_ATAQUES = 1500;
const PROBABILIDAD_CAPTURA = 0.45;
const NIVEL_BASE_PIKACHU = 25;
const EXP_POR_VICTORIA = 20;
const EXP_PARA_SUBIR_NIVEL = 20;
const NIVEL_MIN_RIVAL = 10;
const NIVEL_MAX_RIVAL = 50;

let estadisticasPikachu = {
    nivel: NIVEL_BASE_PIKACHU,
    experiencia: 0
};

let nivelRivalActual = 23;

function actualizarPanelNiveles() {
    const nivelPikachu = document.querySelector('#nivelPikachu');
    const nivelRival = document.querySelector('#nivelRival');
    const expPikachu = document.querySelector('#EXP_jugador');

    if (nivelPikachu) {
        nivelPikachu.textContent = `Lv.${estadisticasPikachu.nivel}`;
    }

    if (nivelRival) {
        nivelRival.textContent = `Lv.${nivelRivalActual}`;
    }

    if (expPikachu) {
        expPikachu.textContent = `EXP ${estadisticasPikachu.experiencia}/${EXP_PARA_SUBIR_NIVEL}`;
    }
}

function aplicarEstadisticasPikachu(estadisticas = {}) {
    estadisticasPikachu.nivel = Number(estadisticas.nivel) || NIVEL_BASE_PIKACHU;
    estadisticasPikachu.experiencia = Number(estadisticas.experiencia) || 0;

    while (estadisticasPikachu.experiencia >= EXP_PARA_SUBIR_NIVEL) {
        estadisticasPikachu.nivel++;
        estadisticasPikachu.experiencia -= EXP_PARA_SUBIR_NIVEL;
    }

    actualizarPanelNiveles();
}

function obtenerEstadisticasPikachu() {
    return {
        nivel: estadisticasPikachu.nivel,
        experiencia: estadisticasPikachu.experiencia
    };
}

function generarNivelRival() {
    return Math.floor(Math.random() * (NIVEL_MAX_RIVAL - NIVEL_MIN_RIVAL + 1)) + NIVEL_MIN_RIVAL;
}

function prepararNuevaBatalla() {
    nivelRivalActual = generarNivelRival();
    charmander.nivel = nivelRivalActual;
    battleActivo.victoriaRegistrada = false;
    actualizarPanelNiveles();
}

function registrarVictoriaPikachu() {
    if (!battleActivo.initiated || battleActivo.victoriaRegistrada) {
        return {
            experienciaGanada: 0,
            subioNivel: false,
            nivelActual: estadisticasPikachu.nivel
        };
    }

    battleActivo.victoriaRegistrada = true;
    estadisticasPikachu.experiencia += EXP_POR_VICTORIA;

    let subioNivel = false;

    while (estadisticasPikachu.experiencia >= EXP_PARA_SUBIR_NIVEL) {
        estadisticasPikachu.nivel++;
        estadisticasPikachu.experiencia -= EXP_PARA_SUBIR_NIVEL;
        subioNivel = true;
    }

    actualizarPanelNiveles();

    return {
        experienciaGanada: EXP_POR_VICTORIA,
        subioNivel,
        nivelActual: estadisticasPikachu.nivel
    };
}

actualizarPanelNiveles();

function animateBattle() {
    battleAnimationID = window.requestAnimationFrame(animateBattle);
    battleBackground.draw();
    charmander.draw();
    pikachu.draw();
    renderSprites.forEach((Sprite) => {
        Sprite.draw();
    });
}

function mostrarDialogoBatalla(mensaje) {
    const dialogo = document.querySelector('#dialogoBox');
    dialogo.style.display = 'block';
    dialogo.style.pointerEvents = accionBatallaEnProgreso ? 'none' : 'auto';
    dialogo.innerHTML = mensaje;
}

function mostrarMenuPrincipalBatalla() {
    const dialogo = document.querySelector('#dialogoBox');
    dialogo.style.display = 'none';
    dialogo.style.pointerEvents = 'none';
    document.querySelector('#menuAccionesBatalla').classList.remove('hidden');
    document.querySelector('#menuAtaquesBatalla').classList.add('hidden');
}

function mostrarMenuAtaquesBatalla() {
    if (accionBatallaEnProgreso) {
        return;
    }

    const dialogo = document.querySelector('#dialogoBox');
    dialogo.style.display = 'none';
    dialogo.style.pointerEvents = 'none';
    document.querySelector('#menuAccionesBatalla').classList.add('hidden');
    document.querySelector('#menuAtaquesBatalla').classList.remove('hidden');
}

function crearConteoCapturaHTML(intentoActual) {
    const pasos = [1, 2, 3, 4].map((paso) => {
        const clase = paso === intentoActual ? 'activo' : paso < intentoActual ? 'completado' : '';
        return `<span class="${clase}">${paso}</span>`;
    }).join('');

    return `
        <div class="captura-dialogo">
            <p>Lanzaste una Pokeball...</p>
            <div class="captura-conteo">${pasos}</div>
        </div>
    `;
}

function activarBotonesBatalla(activos) {
    document.querySelectorAll('.footer button').forEach((button) => {
        button.disabled = !activos;
    });
}

function finalizarAccionBatalla() {
    accionBatallaEnProgreso = false;
    activarBotonesBatalla(true);
    mostrarMenuPrincipalBatalla();
}

function iniciarInterfazBatalla() {
    finalizarAccionBatalla();
}

function intentarCapturarPokemon() {
    if (!battleActivo.initiated || accionBatallaEnProgreso) {
        return;
    }

    accionBatallaEnProgreso = true;
    activarBotonesBatalla(false);
    mostrarMenuPrincipalBatalla();

    const pokemonCapturado = {
        nombre: charmander.name,
        nivel: charmander.nivel || nivelRivalActual,
        fecha: new Date().toISOString()
    };
    const intentosHastaResultado = Math.random() < PROBABILIDAD_CAPTURA
        ? 4
        : Math.floor(Math.random() * 3) + 1;
    let intentoActual = 1;

    function mostrarIntento() {
        mostrarDialogoBatalla(crearConteoCapturaHTML(intentoActual));

        if (intentoActual === intentosHastaResultado) {
            setTimeout(() => {
                if (intentosHastaResultado === 4) {
                    agregarPokemonCapturado(pokemonCapturado);
                    mostrarDialogoBatalla(`<div class="captura-dialogo"><p>${charmander.name} ha sido capturado!</p></div>`);
                    gsap.to(charmander, { opacity: 0, duration: 0.5 });

                    setTimeout(() => {
                        accionBatallaEnProgreso = false;
                        finalizarCombate();
                    }, TIEMPO_RESULTADO_BATALLA);
                    return;
                }

                mostrarDialogoBatalla(`<div class="captura-dialogo"><p>${charmander.name} se ha escapado de la captura!</p></div>`);

                setTimeout(() => {
                    if (!battleActivo.initiated || charmander.health <= 0 || pikachu.health <= 0) {
                        finalizarAccionBatalla();
                        return;
                    }

                    const nombresAtaques = Object.keys(ataquesCharmander);
                    const nombreAleatorio = nombresAtaques[Math.floor(Math.random() * nombresAtaques.length)];
                    const ataqueSeleccionado = ataquesCharmander[nombreAleatorio];

                    charmander.attack({
                        attack: ataqueSeleccionado,
                        recipient: pikachu,
                        renderSprites,
                    });
                }, TIEMPO_RESULTADO_BATALLA);
            }, TIEMPO_CONTEO_CAPTURA);
            return;
        }

        intentoActual++;
        setTimeout(mostrarIntento, TIEMPO_CONTEO_CAPTURA);
    }

    mostrarIntento();
}

function huirBatalla() {
    if (!battleActivo.initiated || accionBatallaEnProgreso) {
        return;
    }

    accionBatallaEnProgreso = true;
    activarBotonesBatalla(false);
    mostrarMenuPrincipalBatalla();
    mostrarDialogoBatalla('<div class="captura-dialogo"><p>Has huido de la batalla.</p></div>');

    setTimeout(() => {
        accionBatallaEnProgreso = false;
        finalizarCombate();
    }, TIEMPO_RESULTADO_BATALLA);
}

function seleccionarAtaque(button) {
    if (!battleActivo.initiated || accionBatallaEnProgreso) {
        return;
    }

    const attackKey = button.dataset.ataque;
    const selectedattack = tackles[attackKey];

    if (selectedattack) {
        accionBatallaEnProgreso = true;
        activarBotonesBatalla(false);
        mostrarMenuPrincipalBatalla();

        pikachu.attack({
            attack: selectedattack,
            recipient: charmander,
            renderSprites,
        });
    }
    if (charmander.health <= 0) {
        charmander.faint();
    }
    if (pikachu.health <= 0) {
        pikachu.faint();
    }
}

document.querySelector('.footer').addEventListener('click', (event) => {
    const boton = event.target.closest('button');

    if (!boton || boton.disabled) {
        return;
    }

    if (boton.id === 'botonMostrarAtaques') {
        mostrarMenuAtaquesBatalla();
        return;
    }

    if (boton.id === 'botonCapturarPokemon') {
        intentarCapturarPokemon();
        return;
    }

    if (boton.id === 'botonHuirBatalla') {
        huirBatalla();
        return;
    }

    if (boton.dataset.ataque) {
        seleccionarAtaque(boton);
    }
});
function attack(attacker, { attack, recipient, renderSprites }) {
    document.querySelector('#dialogoBox').style.display = 'block';
    document.querySelector('#dialogoBox').innerHTML = attacker.name + ' uso ' + attack.name;
    const timeLine = gsap.timeline();
    if (attack.name === 'Trueno' || attack.name === 'Tacleada_de_Voltios') {
        sfx.rayo.currentTime = 0;
        sfx.rayo.play();
    } else {
        sfx.golpe.currentTime = 0;
        sfx.golpe.play();
    }
    setTimeout(() => {
        sfx.rayo.pause();
        sfx.rayo.currentTime = 0;
    }, 1000);
    let healthBar;
    if (attacker.isEnemy) {
        healthBar = '#HP_jugador .hp-fill';
    } else {
        healthBar = '#HP_rival .hp-fill';
    }
    let movementDistance;
    if (attacker.isEnemy) {
        movementDistance = -20;
    } else {
        movementDistance = 20;
    }
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
            }, TIEMPO_ENTRE_ATAQUES);
            return;
        }

        if (attacker.isEnemy && battleActivo.initiated && attacker.health > 0 && recipient.health > 0) {
            setTimeout(finalizarAccionBatalla, TIEMPO_RESULTADO_BATALLA);
        }
    };
    switch (attack.name) {
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
            gsap.to(voltio.posicion, {
                duration: 0.6,
                onComplete: () => renderSprites.splice(renderSprites.indexOf(voltio), 1)
            });
            timeLine.to(attacker.posicion, { x: attacker.posicion.x - movementDistance, duration: 0.1 })
                .to(attacker.posicion, {
                    x: attacker.posicion.x + movementDistance * 2,
                    duration: 0.05,
                    onComplete: () => {
                        const sigueVivo = attacker.applyDamage(recipient, attack, healthBar);
                        if (!sigueVivo) {
                            return;
                        }
                        gsap.to(recipient.posicion, { x: recipient.posicion.x + 10, yoyo: true, repeat: 3, duration: 0.06 });
                        gsap.to(recipient, { opacity: 0, repeat: 3, yoyo: true, duration: 0.06 });
                    }
                })
                .to(attacker.posicion, { x: attacker.posicion.x, duration: 0.1, onComplete: alTerminarAtaque });
            break;
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
            gsap.to(QuickAttack.posicion, {
                duration: 0.6,
                onComplete: () => renderSprites.splice(renderSprites.indexOf(QuickAttack), 1)
            });
            timeLine.to(attacker.posicion, { x: attacker.posicion.x - movementDistance, duration: 0.04 })
                .to(attacker.posicion, {
                    x: attacker.posicion.x + movementDistance * 2,
                    duration: 0.04,
                    onComplete: () => {
                        const sigueVivo = attacker.applyDamage(recipient, attack, healthBar);
                        if (!sigueVivo) {
                            return;
                        }
                        gsap.to(recipient.posicion, { x: recipient.posicion.x + 10, yoyo: true, repeat: 3, duration: 0.06 });
                        gsap.to(recipient, { opacity: 0, repeat: 3, yoyo: true, duration: 0.06 });
                    }
                })
                .to(attacker.posicion, { x: attacker.posicion.x, duration: 0.04, onComplete: alTerminarAtaque });
            break;
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
            gsap.to(trueno.posicion, {
                duration: 0.7,
                onComplete: () => renderSprites.splice(renderSprites.indexOf(trueno), 1)
            });
            timeLine.to(attacker.posicion, { x: attacker.posicion.x - movementDistance, duration: 0.1 })
                .to(attacker.posicion, {
                    x: attacker.posicion.x + movementDistance * 2,
                    duration: 0.05,
                    onComplete: () => {
                        const sigueVivo = attacker.applyDamage(recipient, attack, healthBar);
                        if (!sigueVivo) {
                            return;
                        }
                        gsap.to(recipient.posicion, { x: recipient.posicion.x + 10, yoyo: true, repeat: 3, duration: 0.06 });
                        gsap.to(recipient, { opacity: 0, repeat: 3, yoyo: true, duration: 0.06 });
                    }
                })
                .to(attacker.posicion, { x: attacker.posicion.x, duration: 0.1, onComplete: alTerminarAtaque });
            break;
        case 'Tackle':
            timeLine.to(attacker.posicion, { x: attacker.posicion.x - movementDistance, duration: 0.1 })
                .to(attacker.posicion, {
                    x: attacker.posicion.x + movementDistance * 2,
                    duration: 0.05,
                    onComplete: () => {
                        const sigueVivo = attacker.applyDamage(recipient, attack, healthBar);
                        if (!sigueVivo) {
                            return;
                        }
                        gsap.to(recipient.posicion, { x: recipient.posicion.x + 10, yoyo: true, repeat: 3, duration: 0.06 });
                        gsap.to(recipient, { opacity: 0, repeat: 3, yoyo: true, duration: 0.06 });
                    }
                })
                .to(attacker.posicion, { x: attacker.posicion.x, duration: 0.1, onComplete: alTerminarAtaque });
            break;
        case 'cuchillada':
            timeLine.to(attacker.posicion, { x: attacker.posicion.x - movementDistance, duration: 0.1 })
                .to(attacker.posicion, {
                    x: attacker.posicion.x + movementDistance * 2,
                    duration: 0.05,
                    onComplete: () => {
                        const sigueVivo = attacker.applyDamage(recipient, attack, healthBar);
                        if (!sigueVivo) {
                            return;
                        }
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
                        if (!sigueVivo) {
                            return;
                        }
                        gsap.to(recipient.posicion, { x: recipient.posicion.x + 10, yoyo: true, repeat: 3, duration: 0.06 });
                        gsap.to(recipient, { opacity: 0, repeat: 3, yoyo: true, duration: 0.06 });
                    }
                })
                .to(attacker.posicion, { x: attacker.posicion.x, duration: 0.1, onComplete: alTerminarAtaque });
            break;
    }
}
const battleActivo = { initiated: false, victoriaRegistrada: false };
let battleCooldown = false;
document.querySelector('#dialogoBox').addEventListener('click', (event) => {
    if (accionBatallaEnProgreso) {
        return;
    }

    event.currentTarget.style.display = 'none';
});
function finalizarCombate() {
    window.cancelAnimationFrame(battleAnimationID);
    musicaBatalla.pause();
    musicaCiudad.play();
    document.querySelector('.battle-ui').style.display = 'none';
    document.querySelector('.footer').style.display = 'none';
    document.querySelector('#dialogoBox').style.display = 'none';
    document.querySelector('#dialogoBox').style.pointerEvents = 'none';
    activarBotonesBatalla(true);
    accionBatallaEnProgreso = false;
    battleActivo.initiated = false;
    animate();

    if (typeof guardarEstadoPartidaSilencioso === 'function') {
        guardarEstadoPartidaSilencioso();
    }
}
document.querySelector('.battle-ui').style.display = 'none';
document.querySelector('.footer').style.display = 'none';
document.querySelector('#dialogoBox').style.display = 'none';
document.querySelector('#dialogoBox').style.pointerEvents = 'none';
