document.addEventListener('DOMContentLoaded', () => {
    const Crear_servicios = document.getElementById('Crear_servicios');
    const Ver_servicios = document.getElementById('Ver_servicios');
    const tabla_servicios_creados = document.getElementById('tabla_servicios_creados');
    const btnCrearNuevoServicio = document.getElementById('btnCrearNuevoServicio');
    const formularioNuevoServicio = document.getElementById('formularioNuevoServicio');
    const btnCancelarCreacion = document.getElementById('btnCancelarCreacion');
    const btnCancelarGuardado3 = document.getElementById('btnCancelarGuardado3');

    btnCancelarGuardado3.addEventListener('click', () => {
        Crear_servicios.style.display = 'none';
    });

    // Mostrar servicios existentes y permitir edición
    Ver_servicios.addEventListener('click', () => {
        const xhrVerServicios = new XMLHttpRequest();
        xhrVerServicios.open('GET', '/Lista_servicios_creados', true);

        xhrVerServicios.onreadystatechange = function () {
            if (xhrVerServicios.readyState === 4) {
                if (xhrVerServicios.status === 200) {
                    const data = JSON.parse(xhrVerServicios.responseText);

                    // Limpia la tabla
                    tabla_servicios_creados.innerHTML = '';

                    // Itera sobre los servicios existentes y los muestra
                    if (Array.isArray(data)) {
                        data.forEach((servicio) => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td><input type="text" value="${servicio.Codigo_servicios}" readonly></td>
                                <td><input type="text" value="${servicio.Nombre_servicio}" id="nombre_${servicio.Codigo_servicios}"></td>
                                <td><input type="text" value="${servicio.Tipo_servicio}" id="tipo_${servicio.Codigo_servicios}"></td>
                                <td><input type="text" value="${servicio.Descripcion}" id="descripcion_${servicio.Codigo_servicios}"></td>
                                <td>
                                    <button onclick="EditarServicio('${servicio.Codigo_servicios}')">Guardar Cambios</button>
                                    <button onclick="EliminarServicio('${servicio.Codigo_servicios}')">Eliminar</button>
                                </td>
                            `;
                            tabla_servicios_creados.appendChild(row);
                        });
                    } else {
                        console.error('No se encontraron servicios para mostrar.');
                    }

                    // Muestra el botón para crear un nuevo servicio
                    btnCrearNuevoServicio.style.display = 'block';
                    Crear_servicios.style.display = 'block';
                } else {
                    console.error('Error al obtener los servicios creados');
                }
            }
        };

        xhrVerServicios.send();
    });

    // Mostrar el formulario para crear un nuevo servicio
    btnCrearNuevoServicio.addEventListener('click', () => {
        formularioNuevoServicio.style.display = 'block';
        btnCrearNuevoServicio.style.display = 'none'; // Ocultar el botón
    });

    // Cancelar la creación de un nuevo servicio
    btnCancelarCreacion.addEventListener('click', () => {
        formularioNuevoServicio.style.display = 'none';
        btnCrearNuevoServicio.style.display = 'block'; // Volver a mostrar el botón
    });
});

// Guardar un nuevo servicio
function GuardarServicio() {
    const Codigo_servicios = document.getElementById('nuevo_codigo').value;
    const Nombre_servicio = document.getElementById('nuevo_nombre').value;
    const Tipo_servicio = document.getElementById('nuevo_tipo').value;
    const Descripcion = document.getElementById('nueva_descripcion').value;

    if (!Codigo_servicios || !Nombre_servicio || !Tipo_servicio || !Descripcion) {
        alert('Por favor, completa todos los campos antes de guardar el servicio.');
        return;
    }

    const data = { Codigo_servicios, Nombre_servicio, Tipo_servicio, Descripcion };

    const xhrGuardarServicio = new XMLHttpRequest();
    xhrGuardarServicio.open('POST', '/Crear-servicio', true);
    xhrGuardarServicio.setRequestHeader('Content-Type', 'application/json');

    xhrGuardarServicio.onreadystatechange = function () {
        if (xhrGuardarServicio.readyState === 4) {
            if (xhrGuardarServicio.status === 200) {
                alert('Servicio creado exitosamente.');
                location.reload();
            } else {
                console.error('Error al crear el servicio:', xhrGuardarServicio.responseText);
            }
        }
    };

    xhrGuardarServicio.send(JSON.stringify(data));
}

// Editar un servicio existente
function EditarServicio(codigo) {
    const Nombre_servicio = document.getElementById(`nombre_${codigo}`).value;
    const Tipo_servicio = document.getElementById(`tipo_${codigo}`).value;
    const Descripcion = document.getElementById(`descripcion_${codigo}`).value;

    const data = { Codigo_servicios: codigo, Nombre_servicio, Tipo_servicio, Descripcion };

    const xhrEditarServicio = new XMLHttpRequest();
    xhrEditarServicio.open('POST', '/Editar-servicio', true);
    xhrEditarServicio.setRequestHeader('Content-Type', 'application/json');

    xhrEditarServicio.onreadystatechange = function () {
        if (xhrEditarServicio.readyState === 4) {
            if (xhrEditarServicio.status === 200) {
                alert('Servicio actualizado exitosamente.');
                location.reload();
            } else {
                console.error('Error al actualizar el servicio:', xhrEditarServicio.responseText);
            }
        }
    };

    xhrEditarServicio.send(JSON.stringify(data));
}

// Eliminar un servicio existente
function EliminarServicio(codigo) {
    console.log("Código del servicio enviado para eliminar:", codigo);

    const xhrEliminarServicio = new XMLHttpRequest();
    xhrEliminarServicio.open('DELETE', `/Eliminar-servicio/${codigo}`, true);
    xhrEliminarServicio.setRequestHeader('Content-Type', 'application/json');

    xhrEliminarServicio.onreadystatechange = function () {
        if (xhrEliminarServicio.readyState === 4) {
            if (xhrEliminarServicio.status === 200) {
                alert('Servicio eliminado exitosamente.');
                location.reload(); // Recarga la página después de eliminar el servicio
            } else {
                console.error('Error al eliminar el servicio:', xhrEliminarServicio.statusText);
            }
        }
    };

    xhrEliminarServicio.send();
}