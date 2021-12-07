const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require("express");
const multer = require("multer");

var host = 'localhost';
var puerto = '8080';

var servidor = http.createServer(function(llamar, responder){
    //acá estaria toda la vaina principal

    if(req.url =='/'){
        fs.readFile('index.html','utf-8',(err,html)=>{
            responder.writeHead(200, {'Content-Type' : 'text/html'});
            responder.write(html);
        });
    }else if(req.url.match(/.css$/)){
        const reqPath = path.join(dirname,'servidor',req.url);
        const fileStream = fs.createReadStream(reqPath, 'utf-8');

        responder.writeHead(200, {'Content-Type' : 'text/css'});
        fileStream.pipe(responder);
    }
    else{
        responder.writeHead(404, {'Content-Type' : 'text/plain'});
        responder.write('404 ERROR');
    }
})

servidor.listen(puerto, host, function(){
    console.log('Servidor activo');
})

/*

Alta de archivos (el id se calcula en el servidor)
POST /file/
body: {
    filename: str,
    filesize: int,
    nodeIP: str,
    nodePort: int
}


Listar archivos
GET /file
Response: [
    {
        id: str,
        filename: str,
        filesize: int
    }
]

Solicitud de descarga .torrente
GET /file/{hash}
Content-Disposition: attachment; filename=”nombre.torrente”
Content-Type: text/plain
Contenido del archivo: 
{
    hash: str,
    trackerIP: str,
    trackerPort: int
}

*/