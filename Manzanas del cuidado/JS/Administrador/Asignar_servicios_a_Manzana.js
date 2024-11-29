document.addEventListener('DOMContentLoaded', () => {

    const Manzana_servicios = document.getElementById('Manzana_servicios');
    const Unir_Manzana_servicio = document.getElementById('Unir_Manzana_servicio');
    const Asignar_Manzana_Servicio = document.getElementById('Asignar_Manzana_Servicio');
    const Manzana_Servicio = document.getElementById('Manzana_Servicio');
    const btnCancelarGuardado4 = document.getElementById('btnCancelarGuardado4');

    btnCancelarGuardado4.addEventListener('click', () => {
        Manzana_Servicio.style.display = 'none';
    });
    
    Unir_Manzana_servicio.addEventListener('click', () => {
        const xhrUnirManzanaServicios = new XMLHttpRequest();
        xhrUnirManzanaServicios.open('GET', '/Asignar_Manzana_Servicio', true);
    
        xhrUnirManzanaServicios.onreadystatechange = function () {
            if (xhrUnirManzanaServicios.readyState === 4) {
                if (xhrUnirManzanaServicios.status === 200) {
                    const data = JSON.parse(xhrUnirManzanaServicios.responseText);
    
                    // Verifica si la respuesta contiene datos
                    if (data.Asignar_Manzana_Servicio && Array.isArray(data.Asignar_Manzana_Servicio)) {
                        const Tabla_manzanas_y_servicios = document.getElementById('Tabla_manzanas_y_servicios');
                        Tabla_manzanas_y_servicios.innerHTML = ''; // Limpia la tabla
    
                        // Itera sobre los datos y agrega cada fila
                        data.Asignar_Manzana_Servicio.forEach((servicio) => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${servicio.fk_codigo_manzanas1}</td>
                                <td>${servicio.fk_codigo_servicios1}</td>
                            `;
                            Tabla_manzanas_y_servicios.appendChild(row);
                        });
    
                        // Agregar fila vacía para crear un nuevo servicio
                        const newRow = document.createElement('tr');
                        newRow.innerHTML = `
                            <td><input type="text" id="fk_codigo_manzanas1" placeholder="Código de Manzana" required></td>
                            <td><input type="text" id="fk_codigo_servicios1" placeholder="Código del Servicio" required></td>
                            <td><button onclick="GuardarManzanaServicio()">Guardar Servicio</button></td>
                        `;
                        Tabla_manzanas_y_servicios.appendChild(newRow);
    
                        Manzana_Servicio.style.display = 'block';
                    } else {
                        console.error('No se encontraron datos para mostrar.');
                    }
                } else {
                    console.error('Error al obtener los servicios guardados');
                }
            }
        };
    
        xhrUnirManzanaServicios.send();
    });

});

function GuardarManzanaServicio() {
    // Obtiene los valores de los inputs
    const fk_codigo_manzanas1 = document.getElementById('fk_codigo_manzanas1').value;
    const fk_codigo_servicios1 = document.getElementById('fk_codigo_servicios1').value;


    // Validación para no crear servicios vacios
    if (!fk_codigo_manzanas1 || !fk_codigo_servicios1) {
        alert('Por favor, completa todos los campos antes de guardar .');
        return;
    }

    // Datos a enviar
    const data = {
        fk_codigo_manzanas1,
        fk_codigo_servicios1
    };

    console.log('Datos enviados para guardar la union del servicio:', data);

    // Realiza la solicitud para crear el servicio
    const xhrGuardarManzanaServicio = new XMLHttpRequest();
    xhrGuardarManzanaServicio.open('POST', '/unir_servicio_manzana', true);
    xhrGuardarManzanaServicio.setRequestHeader('Content-Type', 'application/json');

    xhrGuardarManzanaServicio.onreadystatechange = function () {
        if (xhrGuardarManzanaServicio.readyState === 4) {
            if (xhrGuardarManzanaServicio.status === 200) {
                alert('Servicio creado exitosamente.');
                location.reload(); // Refresca la página para mostrar la actualización
            } else {
                console.error('Error al crear el servicio:', xhrGuardarManzanaServicio.responseText);
            }
        }
    };
   xhrGuardarManzanaServicio.send(JSON.stringify(data)); // Envía los datos como JSON
}

