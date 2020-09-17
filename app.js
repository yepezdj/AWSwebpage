var fs = require('fs');
var http = require('http');
var dgram = require('dgram');
var socketio = require('socket.io');
const mysql = require('mysql');
//Crear Conexión a la base de datos
const database = mysql.createConnection({
    host: 'web1.c4jg7pibawyn.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'web04diseno02',
    database: 'web1'
});
//Verificacion
database.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to DB');
});

var app = http.createServer(handleRequest);
var io = socketio.listen(app);
var socket = dgram.createSocket('udp4');

socket.on('message', (content, rinfo) => {
    console.log(`Server got: ${content} from ${rinfo.address}:${rinfo.port}`);
    io.sockets.emit('udp message', content.toString());
    //Enviar info a la base de datos
    cont = content.toString().split(",")
    cont = {latitud: cont[0], longitud: cont[1], timestamp:cont[2]}
    let sql = 'INSERT INTO datos SET ?';
    let query = database.query(sql, cont, (err, result) => {
        if (err) throw err;
    });
});

function handleRequest (req, res) {
    var file = fs.createReadStream('index.html');
    file.pipe(res);
}

socket.bind(11000);
app.listen(50000, function (){
    console.log("Servidor en puerto 50000");
});