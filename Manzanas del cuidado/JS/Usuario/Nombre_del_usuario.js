document.addEventListener('DOMContentLoaded', () => {

    const xhrNombreUsuario = new XMLHttpRequest();

    /* Codigo para obtener el nombre del usuario */
    xhrNombreUsuario.open('GET', '/obtener-usuario', true);

    xhrNombreUsuario.onreadystatechange = function () {
        if (xhrNombreUsuario.readyState === 4) /* que la peticion esta hecha */ {
            if (xhrNombreUsuario.status === 200)/* que la coneccion este hecha */ {
                const usuario = JSON.parse(xhrNombreUsuario.responseText);
                document.getElementById('Nombre-Usuario').textContent = `${usuario.Nombres}`;
            }
            else {
                console.error('No se pudo obtener el usuario');
            }
        }
    };
    xhrNombreUsuario.send();
})
