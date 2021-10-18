var http = require('http');
var fs = require('fs');
var botonera = fs.readFileSync('botonera.html')
var host = 'localhost';
var puerto = '8080';

var servidor = http.createServer(function(llamar, responder){
    //acá estaria toda la vaina principal
    responder.writeHead(200, {'Content-Type' : 'text/html'});
    responder.write(botonera);
})

servidor.listen(puerto, host, function(){
    console.log('Servidor activo');
})