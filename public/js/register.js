const formRegistro = document.querySelector('#formRegistro');

formRegistro.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.querySelector('#registroUsuario').value.trim();
    const email = document.querySelector('#registroEmail').value.trim();
    const password = document.querySelector('#registroPassword').value;

    mostrarMensaje('Creando partida...');

    try {
        const respuesta = await fetch('register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const datos = await leerRespuestaJson(respuesta);

        if (datos.success) {
            irAEleccionPersonaje();
        } else {
            mostrarMensaje(datos.message || 'No se pudo crear la cuenta');
        }
    } catch (error) {
        mostrarMensaje('No se pudo conectar con Apache/XAMPP');
    }
});
