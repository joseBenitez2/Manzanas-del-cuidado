const express = require('express')
const bodyParser = require('body-parser')
const mysql2 = require('mysql2/promise')
const path = require('path')
const moment = require('moment')
const session = require('express-session')
const { connect } = require('http2')
const { error, Console } = require('console')
/* const { connect } = require('http2') */
const app = express()

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//configuracion de la sesion (guardar la sesion del usuario mientras este activa)
app.use(session({
    secret: 'kiwi',
    resave: false,
    saveUninitialized: true
}))

/* app.use(express.static(__dirname)); */

//Estos path se puede unir en uno solo al meter todo lo relacionado en una carpeta principal 
//este se encarga de decir donde esta la pagina
app.use(express.static(path.join(__dirname, 'Front')));
//este dice donde esta el css
app.use('/CSS', express.static(path.join(__dirname, 'CSS')));
//este dice donde esta todo lo relacionado con las imagenes
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use('/JS', express.static(path.join(__dirname, 'JS')));



// Ruta para ir la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Front', 'index.htm'));
});

//concection BBDD
const db = ({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'manzanas'
})


//Registrar usuario (enviar datos a la base de datos)

app.post('/crear', async (req, res) => {
    const { Nombres, Tipo_documento, Documento, Telefono, Rol, fk_Codigo_manzanas } = req.body

    //capturar exepciones try=proceso normal catch=proceso inesperado
    try {

        //verificar usuario
        //conectar a la bd
        const conect = await mysql2.createConnection(db)

        const [veri] = await conect.execute('SELECT * FROM usuario WHERE documento=? and Tipo_documento=?', [Documento, Tipo_documento])

        if (veri.length > 0) {
            res.status(409).send(`
                    <script>
                            window.onload=function(){
                            alert("Su usuario ya esta registrado, por favor inicie sesion")
                            window.location.href='../ingreso.htm'
                            }
                    </script>
                    `)
        }
        else {
            await conect.execute('INSERT INTO usuario (Tipo_documento,Documento,Nombres,Telefono,Rol,fk_Codigo_manzanas) VALUES (?,?,?,?,?,?)', [Tipo_documento, Documento, Nombres, Telefono, Rol, fk_Codigo_manzanas])

            res.status(201).send(`
                <script>
                        window.onload=function(){
                        alert("Se a registrado su usuario")
                        window.location.href='../ingreso.htm'
                        }
                </script>
                `)
            await conect.end()
        }
        await conect.end()
    }
    catch (error) {
        console.error("Error en el servidor:", error)
        res.status(500).send("Error en el servidor");
    }

})

app.post('/Ingresar', async (req, res) => {

    const { Tipo_documento, Documento, Rol } = req.body

    // Iniciar sesión
    try {

        const conect = await mysql2.createConnection(db)
        const [datos] = await conect.execute('SELECT * FROM usuario WHERE documento=? and Tipo_documento=? and Rol=?', [Documento, Tipo_documento, Rol]);
        console.log(datos)

        if (datos.length > 0) {
            /* const [Nombre_manzanas]=conect.execute('SELECT m.Nombre_manzanas FROM usuario u JOIN manzanas m ON u.fk_Codigo_manzanas = m.Codigo_manzanas WHERE u.Nombres =?;',[datos[0].Nombres]);  */
            req.session.usuario = datos[0].Nombres;
            req.session.Documento = datos[0].Documento;
            const usuario = { Nombres: datos[0].Nombres };
            res.locals.usuario = usuario;
            res.locals.Documento = datos[0].Documento;

            if (datos[0].Rol === "Usuario") {
                res.sendFile(path.join(__dirname, 'Front', 'Usuario.htm'))
                await conect.end()
            }
            else if (datos[0].Rol === "Administrador") {
                res.sendFile(path.join(__dirname, 'Front', 'Admin.htm'))
                await conect.end()
            }


        }
        else {
            res.status(401).send
                (`
                    <script>
                    window.onload=function(){
                        alert("Usuario no registrado. Por favor registre su usuario.");
                        window.location.href='../Registro.htm';
                    }
                </script>
            `)
        }


        await conect.end()

    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).send("Error en el servidor");
    }
});

app.get('/obtener-usuario', (req, res) => {
    const usuario = req.session.usuario; // Obtener el usuario de la sesión
    if (usuario) {
        res.json({ Nombres: usuario }); // Enviar el nombre del usuario como respuesta JSON
    } else {
        res.status(401).send('Usuario no autenticado'); // Manejar el caso en que no hay usuario
    }
});


//Obtener servicios
app.post('/obtener_Servicios_Usu', async (req, res) => {
    const Documento = req.session.Documento; // Se obtiene el Documento directamente de la sesión
    try {
        const conect = await mysql2.createConnection(db);
        
        // Ejecutar la consulta SQL para obtener los servicios basados en el Documento del usuario
        const [datos] = await conect.execute(
            `SELECT servicios.Nombre_servicio 
            FROM servicios 
            INNER JOIN manzanas_servicios ON manzanas_servicios.fk_codigo_servicios1 = servicios.Codigo_servicios 
            INNER JOIN manzanas ON manzanas.Codigo_manzanas = manzanas_servicios.fk_codigo_manzanas1 
            INNER JOIN usuario ON manzanas.Codigo_manzanas = usuario.fk_Codigo_manzanas 
            WHERE usuario.Documento = ?;`, 
            [Documento]
        );

        console.log(datos); // Verifica los datos obtenidos

        // Verificar si se han obtenido servicios
        if (datos.length > 0) {
            // Enviar la respuesta con los servicios encontrados
            res.json({ servicios: datos.map(hijo => hijo.Nombre_servicio) });
        } else {
            // En caso de no encontrar servicios, enviar una respuesta vacía o un mensaje adecuado
            res.json({ servicios: [] });
        }

        // Cerrar la conexión a la base de datos
        await conect.end();
    } catch (error) {
        // Manejo de errores
        console.error("Error en el servidor:", error);
        res.status(500).send("Error en el servidor");
    }
});


//enviar servicios

app.post('/Guardar-Servicios-Usu', async (req, res) => {
    const usuario = req.session.usuario
    const Documento = req.session.Documento
    const { servicios, FechaHora } = req.body;
    console.log(servicios, FechaHora)

    try {
        const conect = await mysql2.createConnection(db)

        const [IDU] = await conect.execute('SELECT usuario.`Codigo_mujer` FROM usuario WHERE usuario.Documento = ?;', [Documento]);

        const [IDS] = await conect.query('SELECT servicios.Codigo_servicios FROM servicios WHERE servicios.Nombre_servicio = ?;', [servicios]);
        console.log(IDS); 


        console.log(IDU[0].Codigo_mujer, IDU);
        console.log(IDS[0].Codigo_servicios, IDS);

        await conect.execute('INSERT INTO solicitudes (`Dia_Hora`, `fk_Codigo_mujer2`, `fk_Codigo_servicios3`) VALUES (?, ?, ?)', [FechaHora, IDU[0].Codigo_mujer, IDS[0].Codigo_servicios]);

        res.status(200).send('Servicios guardados')
        await conect.end();



    }
    catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).send("Error en el servidor");
    }

})


app.post('/Listar-servicios-usuario', async (req, res) => {
    const usuario = req.session.usuario;
    const Documento = req.session.Documento;
    console.log(usuario);  // Asegúrate de que el usuario esté correctamente asignado
    console.log(Documento); // Asegúrate de que el Documento esté correcto

    const { Codigo_servicios, Nombre_servicio, Tipo_servicio, Descripcion } = req.body;


    try {
        const conect = await mysql2.createConnection(db);

        // Consulta para obtener los servicios

        //agregar el id de la solicitud
        const [ServiciosData] = await conect.execute('SELECT s.Nombre_servicio,so.Codigo_solicitud,so.Dia_Hora FROM servicios s INNER JOIN solicitudes so ON s.Codigo_servicios = so.fk_Codigo_servicios3 INNER JOIN usuario u ON so.fk_Codigo_mujer2 = u.Codigo_mujer  WHERE u.Documento = ?;', [Documento]);

        console.log(ServiciosData);  // Verifica que los datos estén bien obtenidos

        // Enviar respuesta con los servicios
        res.json({ servicios_lista: ServiciosData });

        await conect.end();

    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).send("Error en el servidor");
    }
});


//Borrar servicios
app.delete('/eliminar/:id', async (req, res) => {
    const servicioID = req.params.id;
    try {
        const conect = await mysql2.createConnection(db);
        await conect.execute('DELETE FROM solicitudes WHERE Codigo_solicitud = ?', [servicioID]);
        res.status(200).send();
        await conect.end();
    } catch (error) {
        console.error('Error en eliminar el servicio', error);
        res.status(500).send('Error al eliminar el servicio');
    }
});


//cerrar sesion

app.post('/cerrar', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error en cerrar sesión:", err);
            return res.status(500).send("Error al cerrar la sesión");
        }
        res.status(200).send("Sesión cerrada correctamente");
    });
});

//Traer Usuarios

app.get('/Lista-Usuarios-Guardados', async (req, res) => {
    const usuario = req.session.usuario;
    const Documento = req.session.Documento;

    try {
        const conect = await mysql2.createConnection(db);

        // Consulta para obtener los servicios
        const [UsuariosData] = await conect.execute(`SELECT usuario.Codigo_mujer AS Codigo_mujer, usuario.Nombres AS Nombre, usuario.Tipo_documento AS Tipo_de_documento, usuario.Documento, usuario.Email AS Correo, usuario.Telefono, usuario.fk_Codigo_manzanas, manzanas.Nombre_manzanas AS Manzana FROM usuario  JOIN manzanas  ON usuario.fk_Codigo_manzanas = manzanas.Codigo_manzanas;`);

        console.log(UsuariosData);

        res.json({ Lista_Usuarios: UsuariosData });

        await conect.end();

    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).send("Error en el servidor");
    }
});

//Guardar cambios

app.post('/GuardarCambios/:id', async (req, res) => {

    const UsuarioID = req.params.id; // ID del usuario que se va a modificar
    const { Nombres, Tipo_documento, Email, Telefono } = req.body; // Datos enviados desde el cliente

    console.log("ID recibido para guardar cambios:", UsuarioID);
    console.log("Datos recibidos para actualizar:", req.body);

    try {
        const conect = await mysql2.createConnection(db);

        // Actualiza los datos del usuario en la base de datos
        const [resultado] = await conect.execute(
            `UPDATE usuario 
                    SET 
                    Nombres = ?, 
                    Tipo_documento = ?, 
                     Email = ?,    
                    Telefono = ?
                    WHERE Codigo_mujer = ?`,
            [Nombres, Tipo_documento, Email, Telefono, UsuarioID]
        );

        console.log("Cambios realizados:", resultado);

        res.status(200).send("Cambios guardados con éxito");
        await conect.end();
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).send("Error en el servidor");
    }
});


//eliminar usuario registrado

app.delete('/eliminarUsuario/:id', async (req, res) => {
    const IDUSUDELETE = req.params.id;
    try {
        const conect = await mysql2.createConnection(db);
        await conect.execute('DELETE FROM usuario WHERE Codigo_mujer = ?', [IDUSUDELETE]);
        res.status(200).send();
        await conect.end();
    } catch (error) {
        console.error('Error en eliminar el servicio', error);
        res.status(500).send('Error al eliminar el servicio');
    }
});

// Ruta para crear un nuevo servicio
app.post('/Crear-servicio', async (req, res) => {
    const { Codigo_servicios, Nombre_servicio, Tipo_servicio, Descripcion } = req.body;

    try {
        const conect = await mysql2.createConnection(db);

        // Consulta para insertar un nuevo servicio
        const [CrearServiciosData] = await conect.execute(
            `INSERT INTO servicios (Codigo_servicios, Nombre_servicio, Tipo_servicio, Descripcion) VALUES (?, ?, ?, ?)`,
            [Codigo_servicios, Nombre_servicio, Tipo_servicio, Descripcion]
        );

        console.log('Servicio creado:', CrearServiciosData);

        res.json({
            message: 'Servicio creado exitosamente',
            servicio: {
                Codigo_servicios,
                Nombre_servicio,
                Tipo_servicio,
                Descripcion,
            },
        });

        await conect.end();
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).send('Error en el servidor');
    }
});



// Obtener lista de servicios creados
app.get('/Lista_servicios_creados', async (req, res) => {

    try {
        const conect = await mysql2.createConnection(db);

        const [results] = await conect.execute( 'SELECT * FROM servicios');
        res.status(200).json(results);
        await conect.end();
    } catch (err) {
        console.error('Error al obtener los servicios:', err);
        res.status(500).json({ error: 'Error al obtener los servicios' });
    }
});

// Crear un nuevo servicio
app.post('/Crear-servicio', async (req, res) => {
    const { Nombre_servicio, Tipo_servicio, Descripcion } = req.body;
    try {
        const conect = await mysql2.createConnection(db);
        await conect.execute('INSERT INTO servicios (Nombre_servicio, Tipo_servicio, Descripcion) VALUES (?, ?, ?)', [Nombre_servicio, Tipo_servicio, Descripcion]);
        res.status(200).json({ message: 'Servicio creado exitosamente' });
        await conect.end();

    } catch (err) {
        console.error('Error al crear el servicio:', err);
        res.status(500).json({ error: 'Error al crear el servicio' });
    }
});

// Editar un servicio existente
app.post('/Editar-servicio', async (req, res) => {
    const { Codigo_servicios, Nombre_servicio, Tipo_servicio, Descripcion } = req.body;

    console.log("Datos recibidos para actualizar el servicio:", req.body);

    try {
        const conect = await mysql2.createConnection(db);

        // Actualiza los datos del servicio en la base de datos
        const [resultado] = await conect.execute(
            `UPDATE servicios 
                SET Nombre_servicio = ?, 
                    Tipo_servicio = ?, 
                    Descripcion = ?
                WHERE Codigo_servicios = ?`,
            [Nombre_servicio, Tipo_servicio, Descripcion, Codigo_servicios]
        );

        console.log("Cambios realizados:", resultado);

        res.status(200).json({ message: 'Servicio actualizado exitosamente' });
        await conect.end();
    } catch (error) {
        console.error("Error al actualizar el servicio:", error);
        res.status(500).json({ error: 'Error al actualizar el servicio' });
    }
});

app.delete('/Eliminar-servicio/:codigo', async (req, res) => {
    const Codigo_servicios = req.params.codigo;  // Asegúrate de que se llame 'codigo' en lugar de 'id'
    
    try {
        const conect = await mysql2.createConnection(db);
        await conect.execute('DELETE FROM servicios WHERE Codigo_servicios = ?', [Codigo_servicios]);
        res.status(200).send();
        await conect.end();
    } catch (error) {
        console.error('Error al eliminar el servicio:', error);
        res.status(500).send('Error al eliminar el servicio');
    }
});

//cerrar sesion administrador

app.post('/cerrar_administrador', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error en cerrar sesión:", err);
            return res.status(500).send("Error al cerrar la sesión");
        }
        res.status(200).send("Sesión cerrada correctamente");
    });
});

//mostrar servicio y manzana para asignar
app.get('/Asignar_Manzana_Servicio', async (req, res) => {
    try {
        const conect = await mysql2.createConnection(db);
        const [ManzanaServicio] = await conect.execute('SELECT * FROM manzanas_servicios');

        res.json({
            Asignar_Manzana_Servicio: ManzanaServicio,
        });

        await conect.end();
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).send('Error al asignar los servicios a la manzana');
    }
});

//guardar union manzana servico
app.post('/unir_servicio_manzana', async (req, res) => {
    const { fk_codigo_manzanas1, fk_codigo_servicios1} = req.body;

    try {
        const conect = await mysql2.createConnection(db);

        // Consulta para insertar un nuevo servicio
        const [ServiciosManzanaData] = await conect.execute(
            `INSERT INTO manzanas_servicios (fk_codigo_manzanas1, fk_codigo_servicios1) VALUES (?, ?)`,
            [fk_codigo_manzanas1, fk_codigo_servicios1]
        );

        console.log('Servicio creado:', ServiciosManzanaData);

        res.json({
            message: 'Servicio asignado exitosamente',
            servicio: {
                fk_codigo_manzanas1,
                fk_codigo_servicios1
            },
        });

        await conect.end();
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).send('Error en el servidor');
    }
});

//Traer tabla para crear la manzana
app.post('/Mostrar_manzana', async (req, res) => {
    try {

        const conect = await mysql2.createConnection(db);

        const [rows] = await conect.execute('SELECT Codigo_manzanas, Nombre_manzanas, Localidad, Direccion FROM manzanas');

        // Cerrar la conexión
        await conect.end();

        // Enviar los datos como JSON
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener las manzanas:', error);
        res.status(500).send('Error interno del servidor');
    }
});


// Ruta para crear una nueva manzana
app.post('/Crear-manzana', async (req, res) => {
    const { Nombre_manzanas, Localidad, Direccion } = req.body;


    try {
        // Conexión a la base de datos
        const conect = await mysql2.createConnection(db);

        // Inserción de la nueva manzana en la tabla
        const [CrearManzanaData] = await conect.execute(
            `INSERT INTO manzanas (Nombre_manzanas, Localidad, Direccion) VALUES (?, ?, ?)`,
            [Nombre_manzanas, Localidad, Direccion]
        );

        console.log('Manzana creada:', CrearManzanaData);

        // Respuesta exitosa
        res.json({
            message: 'Manzana creada exitosamente',
            manzana: {
                Codigo_manzanas: CrearManzanaData.insertId, // Obteniendo el ID generado automáticamente
                Nombre_manzanas,
                Localidad,
                Direccion,
            },
        });

        // Cerrando la conexión
        await conect.end();
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).send('Error en el servidor');
    }
});

// Editar una manzana existente
app.post('/Editar-manzana', async (req, res) => {
    const { Codigo_manzanas, Nombre_manzanas, Localidad, Direccion } = req.body;

    console.log("Datos recibidos para actualizar la manzana:", req.body);

    if (!Codigo_manzanas || !Nombre_manzanas || !Localidad || !Direccion) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
        const conect = await mysql2.createConnection(db);

        // Actualiza los datos de la manzana en la base de datos
        const [resultado] = await conect.execute(
            `UPDATE manzanas 
                SET Nombre_manzanas = ?, 
                    Localidad = ?, 
                    Direccion = ?
                WHERE Codigo_manzanas = ?`,
            [Nombre_manzanas, Localidad, Direccion, Codigo_manzanas]
        );

        console.log("Cambios realizados en la manzana:", resultado);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Manzana no encontrada.' });
        }

        res.status(200).json({ message: 'Manzana actualizada exitosamente' });
        await conect.end();
    } catch (error) {
        console.error("Error al actualizar la manzana:", error);
        res.status(500).json({ error: 'Error al actualizar la manzana' });
    }
});


// Traer datos de manzanas con solo código y Nombre_manzanas
app.post('/Mostrar_selkeccion_manzana', async (req, res) => {
    try {
        const conect = await mysql2.createConnection(db);

        // Modificar la consulta para seleccionar solo Codigo_manzanas y Nombre_manzanas
        const [rows] = await conect.execute('SELECT Codigo_manzanas, Nombre_manzanas FROM manzanas');

        // Cerrar la conexión
        await conect.end();

        // Enviar los datos como JSON (solo los campos necesarios para el select)
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener las manzanas:', error);
        res.status(500).send('Error interno del servidor');
    }
});


//Apertura del servidor
app.listen(3000, () => {
    console.log(`Servidor Node.js escuchando`)
})


