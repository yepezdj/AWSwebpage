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
app.use(express.json({ limit: '1mb' }));
//Crear Conexión a la base de datos
require('dotenv').config({path: __dirname + '/.env'})
const database = mysql.createConnection({
    host: process.env.DB_HOST,
    //host: '127.0.0.1',
    //user :'root',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
    //database: 'dblocation'
});

socket.on('message', (content, rinfo) => {
    console.log(`Server got: ${content} from ${rinfo.address}:${rinfo.port}`);
    io.sockets.emit('udp message', content.toString());
    //Enviar info a la base de datos
    cont = content.toString().split(",")
    cont3 =  cont[3];
    cont = {lat: cont[0], lng: cont[1], timestamp:cont[2], axis:cont[4]}
    if(cont3=="1"){
        let sql1 = 'INSERT INTO datos SET ?';
        let query = database.query(sql1, cont, (err, result) => {
            if (err) throw err;
        }); 
    }
    else{
        let sql2 = 'INSERT INTO datos2 SET ?';
        let query = database.query(sql2, cont, (err, result) => {
            if (err) throw err;
        }); 
    }
});


app.get('/', (request, response) => {
    response.writeHead(200, {'content-type': 'text/html'});
    var file = fs.createReadStream('index.html');
    file.pipe(response);
});

app.post('/create', (req, res) => {
    //console.log(req.body);
    var inicio = req.body.comienzo;
    var fin = req.body.final;
    var camion = req.body.camion;
    inicio = inicio.toString();
    fin = fin.toString();
    camion = camion.toString();

    if (camion=="Camion 1"){
        let sql = `SELECT lat, lng, timestamp, axis FROM datos WHERE timestamp BETWEEN '${inicio}' and '${fin}'`;
        let query = database.query(sql, (err, result) => {
            if(err){ throw err;}
        res.end(JSON.stringify(result));
        });
    }
    if (camion=="Camion 2"){
        let sql = `SELECT lat, lng, timestamp, axis FROM datos2 WHERE timestamp BETWEEN '${inicio}' and '${fin}'`;
        let query = database.query(sql, (err, result) => {
            if(err){ throw err;}
            res.end(JSON.stringify(result));
        });
    }
});

socket.bind(11000);
server.listen(50000, () => {
    console.log("Servidor en puerto 50000");
});


