var fs = require('fs');
var http = require('http');
var dgram = require('dgram');
var socketio = require('socket.io');

var app = http.createServer(handleRequest);
var io = socketio.listen(app);
var socket = dgram.createSocket('udp4');

socket.on('message', (content, rinfo) => {
    console.log(`Server got: ${content} from ${rinfo.address}:${rinfo.port}`);
    io.sockets.emit('udp message', content.toString());
});

function handleRequest (req, res) {
    var file = fs.createReadStream('index.html');
    file.pipe(res);
}

socket.bind(11000);
app.listen(50000, function (){
    console.log("Servidor en puerto 50000");
});