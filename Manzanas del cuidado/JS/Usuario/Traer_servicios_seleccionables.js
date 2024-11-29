document.addEventListener('DOMContentLoaded', () => {

    /* Boton de desplegar servicios */
    const servicios = document.getElementById('servicios')
    const Tabla_servicios = document.getElementById('Tabla_servicios')
    const Lista_servicios = document.getElementById('Lista_servicios')
    const DesplegarServicios = document.getElementById('DesplegarServicios')
    const btnCancelarGuardado = document.getElementById('btnCancelarGuardado')




    /* Codigo para traer los servicios */

    DesplegarServicios.addEventListener('click', () => {
        const xhrObtener = new XMLHttpRequest();
        xhrObtener.open('POST', '/obtener_Servicios_Usu', true)
        xhrObtener.setRequestHeader('Content-Type', 'application/json')
        xhrObtener.onreadystatechange = function () {
            if (xhrObtener.readyState === 4) {
                if (xhrObtener.status === 200) {
                    try {
                        const data = JSON.parse(xhrObtener.responseText); // Parsear la respuesta correctamente
                        console.log(data); // Verificar lo que se recibe
                        if (data.servicios && data.servicios.length > 0) {
                            Lista_servicios.innerHTML = '';
                            data.servicios.forEach(servicios => {
                                const row = document.createElement('tr');
                                row.innerHTML = ` 
          <td>${servicios}</td> 
          <td><input type="checkbox" name="servicios" value="${servicios}"></td>`;
                                Lista_servicios.appendChild(row);
                            });
                            servicios.style.display = 'block';
                        } else {
                            console.error('No se han recibido servicios en la respuesta');
                        }
                    } catch (error) {
                        console.error('Error al procesar la respuesta JSON:', error);
                    }
                } else {
                    console.error('Error en la solicitud: ' + xhrObtener.status + ' ' + xhrObtener.statusText);
                }
            }
        };
        xhrObtener.send()
    })
    //evento enviar servicios seleccionados
    const formularioSeleccionServicio = document.getElementById('formularioSeleccionServicio')
    formularioSeleccionServicio.addEventListener('submit', async (event) => {
        event.preventDefault()
        const ServiciosSeleccionados = Array.from(formularioSeleccionServicio.elements['servicios']).filter(checxbox => checxbox.checked).map(checxbox => checxbox.value)
        const FechaHora = formularioSeleccionServicio.elements['FechaHora'].value;

        const xhrGuardarServicio = new XMLHttpRequest();
        xhrGuardarServicio.open('POST', '/Guardar-Servicios-Usu', true)
        xhrGuardarServicio.setRequestHeader('Content-Type', 'application/json')
        xhrGuardarServicio.onreadystatechange = function () {
            if ((xhrGuardarServicio.readyState === 4) && (xhrGuardarServicio.status === 200)) {
                /* const data = JSON.parse(xhrGuardarServicio.responseText) */
                alert("servicios guardados")
                window.location.reload()
            }
            else {
                console.error('No se pueden guardar los servicios')
            }
        }
        xhrGuardarServicio.send(JSON.stringify({
            servicios: ServiciosSeleccionados,
            FechaHora: FechaHora
        }))

        

    });

    btnCancelarGuardado.addEventListener('click', () => {
            servicios.style.display = 'none';
        });

    //Enviar los servicios guardados

    const Servicios_2 = document.getElementById('Servicios_2');
    const btnServicios = document.getElementById('btnServicios');
    const Servicio_Guardados = document.getElementById('Servicio_Guardados');
    const servicios_lista = document.getElementById('servicios_lista');
    const btnCancelarGuardado2 = document.getElementById('btnCancelarGuardado2');


    btnCancelarGuardado2.addEventListener('click', () => {
        Servicios_2.style.display = 'none';
    });

    //generar solicitud para mostrar los servicios del usuario

    btnServicios.addEventListener('click', () => {
        console.log('El botón funciona');
        const xhrObtenerServicioGuardado = new XMLHttpRequest();
        xhrObtenerServicioGuardado.open('POST', '/Listar-servicios-usuario', true);
        xhrObtenerServicioGuardado.onreadystatechange = function () {
            if (xhrObtenerServicioGuardado.readyState === 4) {
                if (xhrObtenerServicioGuardado.status === 200) {
                    const data = JSON.parse(xhrObtenerServicioGuardado.responseText);


                    // Verifica si el array de servicios está vacío
                    if (data.servicios_lista && data.servicios_lista.length > 0) {
                        const servicios_lista = document.getElementById('servicios_lista');
                        servicios_lista.innerHTML = '';  // Limpiar la tabla antes de agregar nuevos servicios

                        // Recorrer los servicios y agregar filas a la tabla
                        data.servicios_lista.forEach(servicio => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                              <td>${servicio.Codigo_solicitud}</td>
          <td>${servicio.Nombre_servicio}</td>
          <td>${servicio.Dia_Hora}</td>
          <td><button onclick="eliminarServicio(${servicio.Codigo_solicitud})">Eliminar</button></td>
      `;
                            servicios_lista.appendChild(row);
                        });

                        // Mostrar la tabla de servicios guardados
                        Servicios_2.style.display = 'block';
                    } else {

                        alert('No tienes servicios guardados');
                    }
                } else {
                    console.error('Error al obtener los servicios guardados');
                }
            }
        };
        xhrObtenerServicioGuardado.send();
    });


})



function eliminarServicio(id) {
    console.log("ID enviado para eliminar:", id);
    const xhrEliminar = new XMLHttpRequest()
    xhrEliminar.open('DELETE', `/eliminar/${id}`, true);
    xhrEliminar.setRequestHeader('Content-Type', 'application/json');
    xhrEliminar.onreadystatechange = function () {

        if (xhrEliminar.readyState === 4) /* que la peticion esta hecha */ {
            if (xhrEliminar.status === 200)/* que la coneccion este hecha */ {
                alert('Servicio Eliminado')
                location.reload();
            }

        }
        else {
            console.error('Error para eliminar el servicio')
        }
    }
    xhrEliminar.send()
}