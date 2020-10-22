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
require('dotenv').config({path: __dirname + '/.env'})
const database = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
});

socket.on('message', (content, rinfo) => {
    console.log(`Server got: ${content} from ${rinfo.address}:${rinfo.port}`);
    io.sockets.emit('udp message', content.toString());
    //Enviar info a la base de datos
    cont = content.toString().split(",")
    cont = {lat: cont[0], lng: cont[1], timestamp:cont[2], idc: cont[3]}
    let sql = 'INSERT INTO datos2 SET ?';
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
    var camion1 = req.body.camion1;
    console.log(camion1);
    var camion2 = req.body.camion2;
    var camion3 = req.body.camion3;
    inicio = inicio.toString()
    fin = fin.toString()
    if (camion1=="on"){
        let sql = `SELECT lat, lng FROM datos WHERE timestamp BETWEEN '${inicio}' and '${fin}'`;
    }
    else{
        let sql = `SELECT lat, timestamp FROM datos WHERE timestamp BETWEEN '${inicio}' and '${fin}'`;
    }
    let query = database.query(sql, (err, result) => {
        if(err){ throw err;}
        //console.log(result);
    io.sockets.emit('historia', result);
    console.log(result);
});
});

socket.bind(11000);
server.listen(50000, () => {
    console.log("Servidor en puerto 50000");
});


