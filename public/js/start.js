let portadaIniciada = false;

function irAlLogin() {
    if (portadaIniciada) return;

    portadaIniciada = true;

    reproducirGritoGiratina(() => {
        document.querySelector('#menuInicio').classList.add('ocultar');
        bajarVolumen(musicaIntro);

        setTimeout(() => {
            window.location.href = 'backend/login.html';
        }, 350);
    });
}

iniciarMusicaIntro();

window.addEventListener('keydown', (event) => {
    if (event.repeat) return;

    if (event.key.toLowerCase() === 'a' || event.key === 'Enter' || event.key === ' ') {
        irAlLogin();
        return;
    }

    if (!portadaIniciada) {
        iniciarMusicaIntro();
    }
});

window.addEventListener('click', irAlLogin);
