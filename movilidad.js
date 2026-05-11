const keys = {
    ArrowUp: {
        presionada: false
    },
    ArrowLeft: {
        presionada: false
    },
    ArrowDown: {
        presionada: false
    },
    ArrowRight: {
        presionada: false
    },
    Space: {
        presionada: false
    }
}

let ultimaKey = "";


window.addEventListener('keydown', (e) => {
    if (menuBolsaAbierto && e.key !== 'Enter' && e.key !== 'Escape') return;

    switch (e.key) {
        case 'ArrowUp':
            keys.ArrowUp.presionada = true;
            ultimaKey = "ArrowUp"
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.presionada = true;
            ultimaKey = "ArrowLeft"
            break;
        case 'ArrowDown':
            keys.ArrowDown.presionada = true;
            ultimaKey = "ArrowDown"
            break;
        case 'ArrowRight':
            keys.ArrowRight.presionada = true;
            ultimaKey = "ArrowRight"
            break;
        case ' ':
            keys.Space.presionada = true;
            break;
    }
})

window.addEventListener('keyup', (e) => {
    if (menuBolsaAbierto && e.key !== 'Enter' && e.key !== 'Escape') return;

    switch (e.key) {
        case 'ArrowUp':
            keys.ArrowUp.presionada = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.presionada = false;
            break;
        case 'ArrowDown':
            keys.ArrowDown.presionada = false;
            break;
        case 'ArrowRight':
            keys.ArrowRight.presionada = false;
            break;
        case ' ':
            keys.Space.presionada = false;
            break;
    }
})
