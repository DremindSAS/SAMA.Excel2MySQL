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

                        //console.log(params)
                        sendToMySQL(data);
                    }

                })
                //console.log(parser)
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
            /*dialog.showMessageBox(
                {
                    message: 'Conexión correcta a la base de datos',
                    buttons: ["OK"]
                });*/
        }
    });
}

function sendToMySQL(data) {
    for (var index = 0; index < data.length; index++) {
        //var element = data[index];
        document.getElementById("console_output").innerHTML = "Subiendo " + (index + 1) + " de " + data.length + " registros, por favor espere...";

        if (connection != undefined && connection != null) {
            insertRow(data[index], function (error) {
                if (error) {
                    document.querySelector("#console_output").innerHTML = document.querySelector("#console_output").innerHTML + '<br>' + error;
                }
                else {
                    document.querySelector("#console_output").innerHTML = 'Todos los registros fueron subidos satisfactoriamente.'
                }
            })
        }
    }
}

function insertRow(params, next) {
    var tb_factura = params.slice(0, 67);
    var tb_glosa = params.slice(68, 77);
    var tb_respuesta_opl = params.slice(78, 82);
    var tb_CONCILIACION = params.slice(83, 104);

    var sqlFactura = `
                    INSERT INTO tb_factura(
                        FECHA_DE_AUDITORÍA, 
                        DOCUMENTO, 
                        CONSECUTIVO, 
                        NUM_FACTURA_MEDICAMENTO, 
                        NUM_FACTURA_OL, 
                        ESM_FACTURACION, 
                        ESM_FACTURACION_NOMBRE, 
                        ESM_CODIGO, 
                        ESM_INTERNO, 
                        ESM_NOMBRE, 
                        ESM_ADSCRITO, 
                        ESM_ADSCRITO_NOMBRE, 
                        FUERZA_ESM_ADSCRITO, 
                        FUERZA_ESM_NOMBRE_ADSCRITO, 
                        FUERZA_ESM,
                        FUERZA_ESM_NOMBRE,
                        TIPO_DISPENSACION,
                        CODIGO_AUTORIZACION,
                        DOCUMENTO_FECHA_FORMULACION,
                        DOCUMENTO_FECHA_TRANSACCION,
                        TIPO_MEDICAMENTO_NOMBRE,
                        TIPO_FORMULA_NOMBRE,
                        AFILIADO_CODIGO,
                        AFILIADO_NOMBRE,
                        FUERZA_FACTURA_NOMBRE,
                        TIPO_VINCULACION_NOMBRE,
                        CODIGO_MEDICAMENTO,
                        CODIGO_MEDICAMENTO_HOMIC,
                        DESC_MEDICAMENTO_REFERENCIA,
                        DESC_MEDICAMENTO_GENERICO,
                        F039_CANTIDAD_PEDIDA,
                        CANTIDAD_DESPACHADA,
                        PRECIO_UNITARIO,
                        VALOR_ADECUACION,
                        SUBTOTAL_ANTES_IVA,
                        VALOR_EXCLUIDO,
                        VALOR_GRAVADO,
                        VALOR_IVA,
                        VALOR_FACTURA_MEDICAMENTOS,
                        VALOR_INTERMEDIACION,
                        VALOR_IVA_INTERM,
                        VALOR_FACTURA_OL,
                        TOTAL,
                        TOTAL_REPORTADO_A_SAMA,
                        DIFERENCIA_ENTRE_SAMA_Y_DROSERVICIO,
                        LOTE,
                        FECHA_VENCIMIENTO,
                        INVIMA,
                        DOSIS,
                        TIEMPO_DOSIS,
                        CONCENTRACION,
                        ESM_GENERA_FORMULA,
                        ESM_GENERA_FORMULA_NOMBRE,
                        CIE10,
                        CIE10_NOMBRE,
                        MEDICO_CODIGO,
                        MEDICO_NOMBRE,
                        TIPO_FORMULA,
                        TIRILLA,
                        DOCUMENTO_NUMERO_ITEM,
                        LABORATORIO_CODIGO,
                        LABORATORIO_NOMBRE,
                        VR_FACTURACION,
                        ANTICIPO_50,
                        SEGUNDO_DESEMBOLSO,
                        PAGO_CONCILIACION_1,
                        PAGO_CONCILIACION_2,
                        SALDO
                        ) 
                    VALUES(now(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

    connection.query(
        sqlFactura,
        tb_factura,
        function (error, tb_factura_result) {
            if (error) {
                next(String(error))
            } else {
                var sqlGlosa = `
                        INSERT INTO tb_glosa(
                        FACTURA_ID,
                        DESCRIPCION_GLOSA,
                        VR_MEDICAMENTO,
                        INTERMEDIACION,
                        IVA_INTERMEDIACION,
                        IVA ,
                        UNIDOSIS,
                        TOTAL,
                        VALOR_A_PAGAR,
                        ESTADO
                        ) 
                    VALUES(`+ tb_factura_result.insertId + `, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                connection.query(sqlGlosa,
                    tb_glosa,
                    function (error, tb_glosa_result) {
                        if (error) {
                            next(String(error))
                        } else {
                            var sqlRespuestaOPL = `
                                            INSERT INTO tb_respuesta_opl(
                                            GLOSA_ID,
                                            RESPUESTA_OPL,
                                            OBSERVACION,
                                            VALOR_ACEPTADO,
                                            VALOR_NO_ACEPTADO
                                            ) 
                                        VALUES(`+ tb_glosa_result.insertId + `, ?, ?, ?, ?)`;

                            connection.query(sqlRespuestaOPL,
                                tb_respuesta_opl,
                                function (error, result) {
                                    if (error) {
                                        next(String(error))
                                    } else {
                                        var sqlConciliacion = `
                                            INSERT INTO tb_CONCILIACION(
                                            GLOSA_ID,
                                            RESPUESTA_OPL,
                                            OBSERVACION,
                                            VALOR_ACEPTADO,
                                            VALOR_NO_ACEPTADO,
                                            CODIGO_GLOSA,
                                            VALOR_OBJETADO,
                                            VALOR_OBJETADO_ACEPTADO_CONCILIACION,
                                            OBSERVACION_GLOSA,
                                            VALOR_SOPORTADO,
                                            OBSERVACION_GLOSA_SOPORTADA_SAMA,
                                            VALOR_RATIFICADO_EN_CONCILIACION,
                                            OBSERVACION_GLOSA_DEFINITIVA,
                                            VALOR_NO_CONCILIADO_SEGUNDA_INSTANCIA,
                                            OBSERVACION_GLOSA_SEGUNDA_INSTANCIA,
                                            VALOR_SUBTOTAL_MEDICAMENTO_A_PAGAR,
                                            VALOR_GASTO_DE_OPL_A_PAGAR,
                                            VALOR_IVA_OPL_A_PAGAR,
                                            VALOR_IVA_DEL_MEDICAMENTO_A_PAGAR,
                                            VALOR_ADECUACION_A_PAGAR,
                                            VALOR_A_PAGAR_CONCILIADO,
                                            ESTADO
                                            ) 
                                        VALUES(`+ tb_glosa_result.insertId + `, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                                        connection.query(sqlConciliacion,
                                            tb_CONCILIACION,
                                            function (error, result) {
                                                if (error) {
                                                    next(String(error))
                                                } else {
                                                    next();
                                                }
                                            });
                                    }
                                });
                        }
                    });
            }
        });
}