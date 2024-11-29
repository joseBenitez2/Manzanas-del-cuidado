document.addEventListener('DOMContentLoaded', () => {

const Cerrar_sesion = document.getElementById('Cerrar_sesion')

Cerrar_sesion.addEventListener('click', () => {
    const xhrCerrarAdmin = new XMLHttpRequest()
    xhrCerrarAdmin.open('POST', '/cerrar_administrador', true)
    xhrCerrarAdmin.onreadystatechange = function () {
        if (xhrCerrarAdmin.readyState === 4) {
            if (xhrCerrarAdmin.status === 200) {
                window.location.href = "/index.htm"
            }
            else {
                console.error('Error al obtener los servicios guardados');
            }
        }
    }
    xhrCerrarAdmin.send()
})

})

/* window.onload=function (){
    window.history.forward()
}
window.onpageshow=function(event){
    if(event.persisted){
        window.location.reload()
    }
} */


