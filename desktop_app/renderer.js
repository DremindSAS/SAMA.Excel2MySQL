const {dialog} = require('electron').remote;
var fs = require('fs');
var parse = require('csv-parse');
var mysql = require('mysql');

var connection = null;

document.getElementById("openFile").addEventListener("click", function (e) {
    openFile();
});

document.getElementById("connectToDatabase").addEventListener("click", function (e) {
    connectToMySQL();
});

document.querySelector('.connection-box').style.display = 'block';

function openFile() {
    document.getElementById("console_output").innerHTML = "Esperando por algún archivo...";
    dialog.showOpenDialog(
        {
            properties: ['openFile'],
            filters: [
                { name: 'CSV', extensions: ['csv'] }
            ]
        }, function (data) {
            if (data != undefined && data != null) {
                document.getElementById("console_output").innerHTML = "Leyendo el archivo, este proceso puede tardar unos minutos";
                var parser = parse({ delimiter: ';' }, function (err, data) {
                    if (err) {
                        console.log(err);

                        dialog.showMessageBox(
                            {
                                type: 'error',
                                title: 'SAMA',
                                message: 'Ocurrió un error leyendo el archivo, verifique que todos los campos tienen algún valor y que se sigue la plantilla proporcionada',
                                buttons: ["OK"]
                            });
                    }
                    else {
                        document.getElementById("console_output").innerHTML = "Archivo leído e intentando subir a MySQL";
                        sendToMySQL(data);
                    }

                })
                console.log(parser)
                fs.createReadStream(data[0]).pipe(parser);
            }

        });
}

function connectToMySQL() {
    connection = mysql.createConnection({
        host: document.querySelector("#host").value,
        user: document.querySelector("#user").value,
        password: document.querySelector("#password").value,
        database: document.querySelector("#database").value,
        port: document.querySelector("#port").value
    });

    connection.connect(function (error) {
        if (error) {
            console.log(String(error))
            dialog.showMessageBox(
                {
                    type: 'error',
                    title: 'SAMA',
                    message: String(error),
                    buttons: ["OK"]
                });
        } else {
            document.querySelector('.app-box').style.display = 'block';
            document.querySelector('.connection-box').style.display = 'none';
            dialog.showMessageBox(
                {
                    message: 'Conexión correcta a la base de datos',
                    buttons: ["OK"]
                });
        }
    });
}

function sendToMySQL(data) {
    for (var index = 0; index < data.length; index++) {
        var element = data[index];
        document.getElementById("console_output").innerHTML = "Subiendo " + (index + 1) + " de " + data.length + " registros...";

        if (connection != undefined && connection != null) {
            var query = connection.query('INSERT INTO personaje(nombre, apellido, biografia) VALUES(?, ?, ?)', ['Homero', 'Simpson', 'Esposo de Marge y padre de Bart, Lisa y Maggie.'], function (error, result) {
                if (error) {
                    document.querySelector("#console_output").innerHTML = document.querySelector("#console_output").innerHTML + '<br>' + String(error);
                } else {
                    console.log(result);
                }
            });
        }
    }
}