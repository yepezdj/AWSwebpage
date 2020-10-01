var fs = require('fs');
var dgram = require('dgram');
var socketio = require('socket.io');
var express = require('express');
const mysql = require('mysql');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var app = express();
var server = require('http').Server(app);       
var io = socketio.listen(server);
var socket = dgram.createSocket('udp4');
//Crear Conexión a la base de datos
const database = mysql.createConnection({
    host: 'web1.c4jg7pibawyn.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'web04diseno02',
    database: 'web1'
});

socket.on('message', (content, rinfo) => {
    console.log(`Server got: ${content} from ${rinfo.address}:${rinfo.port}`);
    io.sockets.emit('udp message', content.toString());
    //Enviar info a la base de datos
    cont = content.toString().split(",")
    cont = {lat: cont[0], lng: cont[1], timestamp:cont[2]}
    let sql = 'INSERT INTO datos SET ?';
    let query = database.query(sql, cont, (err, result) => {
        if (err) throw err;
    });
});



app.get('/', (request, response) => {
    response.writeHead(200, {'content-type': 'text/html'});
    var file = fs.createReadStream('index.html');
    file.pipe(response);
});

app.post('/create', urlencodedParser, function (req,res) {
    var inicio = req.body.inicio;
    var fin = req.body.fin;
    inicio = inicio.toString()
    fin = fin.toString()

    let sql = `SELECT lat, lng FROM datos WHERE timestamp BETWEEN '${inicio}' and '${fin}'`;
    let query = database.query(sql, (err, result) => {
        if(err){ throw err;}
        //console.log(result);
	io.sockets.emit('historia', result);
});
});

socket.bind(11000);
server.listen(50000, () => {
    console.log("Servidor en puerto 50000");
});