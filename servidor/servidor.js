var http = require('http');
var host = 'localhost';
var puerto = '8080';

var servidor = http.createServer(function(llamar, responder){
    //acá estaria toda la vaina principal
    responder.writeHead(200, {'Content-Type' : 'text/html'});
    responder.end('<h1>Servidor activo</h1>');
})

servidor.listen(puerto, host, function(){
    console.log('Servidor activo');
})