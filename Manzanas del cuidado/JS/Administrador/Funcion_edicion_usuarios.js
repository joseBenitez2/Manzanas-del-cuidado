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

    //Obtener los usuarios

    const Usuarios = document.getElementById('Usuarios');
    const Consultar_usuarios = document.getElementById('Consultar_usuarios');
    const Usuarios_guardados = document.getElementById('Usuarios_guardados');
    const Lista_Usuarios = document.getElementById('Lista_Usuarios');
    const btnCancelarGuardado = document.getElementById('btnCancelarGuardado');

        // Evento para cancelar guardado
        btnCancelarGuardado.addEventListener('click', () => {
            Usuarios.style.display = 'none';
        });


    // Generar solicitud para mostrar los usuarios guardados
    Consultar_usuarios.addEventListener('click', () => {
        console.log('El botón funciona');
        const xhrObtenerUsuarioGuardado = new XMLHttpRequest();
        xhrObtenerUsuarioGuardado.open('GET', '/Lista-Usuarios-Guardados', true);
        xhrObtenerUsuarioGuardado.onreadystatechange = function () {
            if (xhrObtenerUsuarioGuardado.readyState === 4) {
                if (xhrObtenerUsuarioGuardado.status === 200) {
                    const data = JSON.parse(xhrObtenerUsuarioGuardado.responseText);
                    console.log(data);  // Verifica los datos que devuelve el servidor

                    // Verifica si el array de usuarios está vacío
                    if (data.Lista_Usuarios && data.Lista_Usuarios.length > 0) {
                        const Lista_Usuarios = document.getElementById('Lista_Usuarios');
                        Lista_Usuarios.innerHTML = '';

                        // Recorrer los usuarios y agregar filas a la tabla
                        data.Lista_Usuarios.forEach(usuarios => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                <td><input type="text" value="${usuarios.Codigo_mujer}" disabled></td>
                <td><input type="text" value="${usuarios.Nombre}"></td>
                <td><input type="text" value="${usuarios.Tipo_de_documento}"></td>
                <td><input type="text" value="${usuarios.Documento}"></td>
                <td><input type="text" value="${usuarios.Correo}"></td>
                <td><input type="text" value="${usuarios.Telefono}"></td>
                <td><input type="text" value="${usuarios.fk_Codigo_manzanas}"></td>
                <td><input type="text" value="${usuarios.Manzana}"></td>
                <td><button onclick="GuardarCambios(${usuarios.Codigo_mujer})">Guardar Cambios</button></td>
                <td><button onclick="EliminarUsuario(${usuarios.Codigo_mujer})">Eliminar</button></td>
            `;
                            Lista_Usuarios.appendChild(row);
                        });

                        // Mostrar la tabla de servicios guardados
                        Usuarios.style.display = 'block';
                    } else {
                        alert('No hay usuarios guardados');
                    }
                }
            }
        };
        xhrObtenerUsuarioGuardado.send();
    });
})
    // Cancelar la creación de un nuevo servicio
    btnCancelarCreacion.addEventListener('click', () => {
        Usuarios.style.display = 'none';
    });

function GuardarCambios(id) {
    console.log("ID enviado para guardar cambios:", id);

    // Encuentra la fila correspondiente en la tabla
    const row = document.querySelector(`button[onclick="GuardarCambios(${id})"]`).parentElement.parentElement;

    // Obtén los valores modificados en la fila
    const Nombres = row.children[1].querySelector('input').value;
    const Tipo_documento = row.children[2].querySelector('input').value; 
    const Email = row.children[4].querySelector('input').value; 
    const Telefono = row.children[5].querySelector('input').value; 

    // Prepara los datos para enviar al servidor
    const data = {
        Nombres,
        Tipo_documento,
        Email,
        Telefono,
    };

    console.log("Datos enviados para guardar cambios:", data);

    // Realiza la solicitud al servidor
    const xhrGuardarCambios = new XMLHttpRequest();
    xhrGuardarCambios.open('POST', `/GuardarCambios/${id}`, true);
    xhrGuardarCambios.setRequestHeader('Content-Type', 'application/json');
    xhrGuardarCambios.onreadystatechange = function () {
        if (xhrGuardarCambios.readyState === 4) {
            if (xhrGuardarCambios.status === 200) {
                alert('Cambios Guardados');
                location.reload();
            } else {
                console.error('Error al guardar los cambios:', xhrGuardarCambios.responseText);
            }
        }
    };
    xhrGuardarCambios.send(JSON.stringify(data)); // Envía los datos como JSON
}

function EliminarUsuario(id) {
    console.log("ID enviado para eliminar:", id);
    const xhrEliminarUsuario = new XMLHttpRequest();
    xhrEliminarUsuario.open('DELETE', `/eliminarUsuario/${id}`, true);
    xhrEliminarUsuario.setRequestHeader('Content-Type', 'application/json');
    xhrEliminarUsuario.onreadystatechange = function () {

        if (xhrEliminarUsuario.readyState === 4) {
            if (xhrEliminarUsuario.status === 200) {
                alert('Usuario Eliminado');
                location.reload();
            }
        } else {
            console.error('Error para eliminar el usuario');
        }
    }
    xhrEliminarUsuario.send();
}