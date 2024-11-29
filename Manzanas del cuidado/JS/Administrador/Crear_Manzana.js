document.addEventListener('DOMContentLoaded', () => {
    const Contenedor_manzana = document.getElementById('Contenedor_manzana');
    const TablaCrearManzana = document.getElementById('TablaCrearManzana');
    const Crear_Manzana = document.getElementById('Crear_Manzana');
    const formularioNuevaManzana = document.getElementById('formularioNuevaManzana');
    const btnCancelarCreacionManzana = document.getElementById('btnCancelarCreacionManzana');
    const btnCrearNuevaManzana = document.getElementById('btnCrearNuevaManzana');
    const btnCancelarGuardado5 = document.getElementById('btnCancelarGuardado5');

    btnCancelarGuardado5.addEventListener('click', () => {
        Contenedor_manzana.style.display = 'none';
    });


    Crear_Manzana.addEventListener('click', () => {
        const xhrcrearmanzanas = new XMLHttpRequest();
        xhrcrearmanzanas.open('POST', '/Mostrar_manzana', true);

        xhrcrearmanzanas.onreadystatechange = function () {
            if (xhrcrearmanzanas.readyState === 4) {
                if (xhrcrearmanzanas.status === 200) {
                    try {
                        const data = JSON.parse(xhrcrearmanzanas.responseText);

                        // Limpia la tabla antes de llenarla
                        TablaCrearManzana.innerHTML = '';

                        // Verifica si se obtienen datos válidos
                        if (Array.isArray(data) && data.length > 0) {
                            data.forEach((manzana) => {
                                const row = document.createElement('tr');
                                row.innerHTML = `
                                    <td><input type="text" id="nombre_manzana_${manzana.Codigo_manzanas}" value="${manzana.Nombre_manzanas}"></td>
                                    <td><input type="text" id="localidad_${manzana.Codigo_manzanas}" value="${manzana.Localidad}"></td>
                                    <td><input type="text" id="direccion_${manzana.Codigo_manzanas}" value="${manzana.Direccion}"></td>
                                    <td><button onclick="GuardarEdicionManzana('${manzana.Codigo_manzanas}')">Guardar Cambios</button></td>
                                `;
                                TablaCrearManzana.appendChild(row);
                            });

                            // Muestra el contenedor de la tabla
                            Contenedor_manzana.style.display = 'block';
                        } else {
                            console.warn('No hay datos disponibles para mostrar.');
                            Contenedor_manzana.style.display = 'none';
                        }
                    } catch (error) {
                        console.error('Error al analizar el JSON:', error);
                    }
                } else {
                    console.error('Error al obtener las manzanas:', xhrcrearmanzanas.statusText);
                }
            }
        };

        xhrcrearmanzanas.send();
    });

    // Mostrar el formulario para crear un nuevo servicio
    btnCrearNuevaManzana.addEventListener('click', () => {
        formularioNuevaManzana.style.display = 'block';
        btnCrearNuevaManzana.style.display = 'none'; // Ocultar el botón
    });

    // Cancelar la creación de un nuevo servicio
    btnCancelarCreacionManzana.addEventListener('click', () => {
        formularioNuevaManzana.style.display = 'none';
        btnCrearNuevaManzana.style.display = 'block'; // Volver a mostrar el botón
    });

});

// Guardar una nueva manzana
function GuardarManzana() {
    const Codigo_manzanas = document.getElementById('nuevo_codigo_manzana').value;
    const Nombre_manzanas = document.getElementById('nuevo_nombre_manzana').value;
    const Localidad = document.getElementById('nueva_localidad').value;
    const Direccion = document.getElementById('nueva_direccion').value;

    if (!Codigo_manzanas || !Nombre_manzanas || !Localidad || !Direccion) {
        alert('Por favor, completa todos los campos antes de guardar la manzana.');
        return;
    }

    const data = { Codigo_manzanas, Nombre_manzanas, Localidad, Direccion };

    const xhrGuardarManzana = new XMLHttpRequest();
    xhrGuardarManzana.open('POST', '/Crear-manzana', true);
    xhrGuardarManzana.setRequestHeader('Content-Type', 'application/json');

    xhrGuardarManzana.onreadystatechange = function () {
        if (xhrGuardarManzana.readyState === 4) {
            if (xhrGuardarManzana.status === 200) {
                alert('Manzana creada exitosamente.');
                location.reload(); // Recargar la página para actualizar la lista de manzanas
            } else {
                console.error('Error al crear la manzana:', xhrGuardarManzana.responseText);
            }
        }
    };

    xhrGuardarManzana.send(JSON.stringify(data));
}




//editar manzana
function GuardarEdicionManzana(codigo) {
    const Nombre_manzanas = document.getElementById(`nombre_manzana_${codigo}`).value;
    const Localidad = document.getElementById(`localidad_${codigo}`).value;
    const Direccion = document.getElementById(`direccion_${codigo}`).value;

    if (!Nombre_manzanas || !Localidad || !Direccion) {
        alert('Por favor, completa todos los campos antes de guardar los cambios.');
        return;
    }

    const data = { Codigo_manzanas: codigo, Nombre_manzanas, Localidad, Direccion };

    const xhrEditarManzana = new XMLHttpRequest();
    xhrEditarManzana.open('POST', '/Editar-manzana', true);
    xhrEditarManzana.setRequestHeader('Content-Type', 'application/json');

    xhrEditarManzana.onreadystatechange = function () {
        if (xhrEditarManzana.readyState === 4) {
            if (xhrEditarManzana.status === 200) {
                alert('Manzana actualizada exitosamente.');
                location.reload();
            } else {
                console.error('Error al actualizar la manzana:', xhrEditarManzana.responseText);
            }
        }
    };

    xhrEditarManzana.send(JSON.stringify(data));
}
