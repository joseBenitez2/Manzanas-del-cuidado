document.addEventListener('DOMContentLoaded', () => {
                        

                      

    //cerrar sesion

    const CerrarSesion = document.getElementById('CerrarSesion')

    CerrarSesion.addEventListener('click', () => {
        const xhrCerrar = new XMLHttpRequest()
        xhrCerrar.open('POST', '/cerrar', true)
        xhrCerrar.onreadystatechange = function () {
            if (xhrCerrar.readyState === 4) {
                if (xhrCerrar.status === 200) {
                    window.location.href = "/index.htm"
                }
                else {
                    console.error('Error al obtener los servicios guardados');
                }
            }
        }
        xhrCerrar.send()
    })

    window.onload = function () {
        window.history.forward()
    }
    window.onpageshow = function (event) {
        if (event.persisted) {
            window.location.reload()
        }
    }
});