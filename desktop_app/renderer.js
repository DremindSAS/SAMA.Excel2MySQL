const {dialog} = require('electron').remote;
var fs = require('fs');
var parse = require('csv-parse');
var mysql = require('mysql');

var connection = {};

document.getElementById("openFile").addEventListener("click", function (e) {
    openFile();
});

document.getElementById("connectToDatabase").addEventListener("click", function (e) {
    connectToMySQL();
});

function openFile() {

    dialog.showOpenDialog(
        {
            properties: ['openFile'],
            filters: [
                { name: 'CSV', extensions: ['csv'] }
            ]
        }, function (data) {
            if (data != undefined && data != null) {
                var parser = parse({ delimiter: ';' }, function (err, data) {
                    if (err) {
                        console.log(err);

                        dialog.showMessageBox(
                            {
                                type: 'error',
                                title: 'Error leyendo el archivo',
                                message: 'Ocurrió un error leyendo el archivo, verifique que todos los campos tienen algún valor y que se sigue la plantilla proporcionada',
                                buttons: ["OK"]
                            });
                    }
                    else {
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
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'node_mysql',
        port: 3306
    });

    connection.connect(function (error) {
        if (error) {
            dialog.showMessageBox(
                {
                    type: 'error',
                    title: 'Error conectandose a la base de datos',
                    message: error,
                    buttons: ["OK"]
                });
        } else {
            dialog.showMessageBox(
                {
                    message: 'Conexión correcta',
                    buttons: ["OK"]
                });
        }
    });
}

function sendToMySQL(data) {

}