const musicaCiudad = new Audio('./audio/citySound.mp3');
musicaCiudad.loop = true;
musicaCiudad.volume = 0.4;

const musicaIntro = document.querySelector('#musicaIntro');

if (musicaIntro) {
    musicaIntro.volume = 0.4;
    musicaIntro.loop = true;
    musicaIntro.load();
}

const musicaBatalla = new Audio('./audio/battleSound.mp3');
musicaBatalla.loop = true;
musicaBatalla.volume = 0.4;

const gritoGiratina = new Audio('./audio/Grito de Giratina1.mp3');
gritoGiratina.volume = 0.55;
gritoGiratina.loop = false;
gritoGiratina.preload = 'auto';
let gritoGiratinaReproducido = false;

const sfx = {
    click: new Audio('./audio/clickSound.mp3'),
    rayo: new Audio('./audio/thunderSound.mp3'),
    golpe: new Audio('./audio/hitSound.mp3')
};

let audioIniciado = false;

function iniciarMusicaIntro() {
    if (!musicaIntro) return;

    musicaIntro.play().catch(() => {
        console.log('El navegador espera una interaccion para reproducir audio.');
    });
}

function reproducirGritoGiratina(alTerminar) {
    if (gritoGiratinaReproducido) {
        alTerminar();
        return;
    }

    gritoGiratinaReproducido = true;
    gritoGiratina.currentTime = 0;

    let terminado = false;

    function continuar() {
        if (terminado) return;

        terminado = true;
        gritoGiratina.onended = null;
        alTerminar();
    }

    gritoGiratina.onended = continuar;

    setTimeout(continuar, 2200);

    gritoGiratina.play().catch(() => {
        continuar();
    });
}

function bajarVolumen(audio) {
    if (!audio) return;

    let volumenActual = audio.volume;

    const intervalo = setInterval(() => {
        volumenActual -= 0.05;
        audio.volume = Math.max(volumenActual, 0);

        if (audio.volume <= 0) {
            clearInterval(intervalo);
            audio.pause();
            audio.currentTime = 0;
        }
    }, 100);
}

function subirVolumen(audio) {
    audio.volume = 0;
    audio.play().catch(() => {
        console.log('El navegador espera una interaccion para reproducir audio.');
    });

    const intervalo = setInterval(() => {
        audio.volume = Math.min(audio.volume + 0.05, 0.4);

        if (audio.volume >= 0.4) {
            clearInterval(intervalo);
        }
    }, 1500);
}

function cambiarMusicaIntroAMapa() {
    if (musicaIntro) {
        bajarVolumen(musicaIntro);
    }

    subirVolumen(musicaCiudad);
    audioIniciado = true;
}


document.querySelectorAll('.footer button').forEach(button => {
    button.addEventListener('click', () => {
        sfx.click.currentTime = 0;
        sfx.click.play();
    });
});


