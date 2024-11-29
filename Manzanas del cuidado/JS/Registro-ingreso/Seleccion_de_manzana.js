// Función para llenar el <select> con las manzanas
function cargarLocalidades() {
    const selectElement = document.getElementById('select-localidades'); // Obtener el <select> por su ID

    // Limpia el contenido previo del <select>
    selectElement.innerHTML = ''; 

    // Crear un primer elemento <option> vacío o un mensaje predeterminado
    const defaultOption = document.createElement('option');
    defaultOption.value = ''; // Valor vacío por defecto
    defaultOption.textContent = 'Selecciona una manzana';
    selectElement.appendChild(defaultOption);

    // Obtener las manzanas con el código y el nombre de la manzana
    fetch('/Mostrar_selkeccion_manzana', { method: 'POST' })
        .then(response => response.json())
        .then(manzanas => {
            manzanas.forEach(manzana => {
                const option = document.createElement('option');
                option.value = manzana.Codigo_manzanas; // El valor será el ID de la manzana
                option.textContent = manzana.Nombre_manzanas; // El texto será el nombre de la manzana
                selectElement.appendChild(option); // Añadir la opción al <select>
            });
        })
        .catch(error => console.error('Error al cargar las manzanas:', error));
}

// Llamar a la función para cargar las manzanas al cargar la página
document.addEventListener('DOMContentLoaded', cargarLocalidades);
