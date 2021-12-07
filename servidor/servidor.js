const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require("express");
const multer = require("multer");
var fid = 1;

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

const dgram = require('dgram');
const server = dgram.createSocket('udp4');
server.bind(puerto);

function mensajeUDP(mensaje, ip, puerto) {
	var mensajeBuf = Buffer.from(JSON.stringify(mensaje));
	const cliente = dgram.createSocket('udp4');
	cliente.send(mensajeBuf, puerto, ip);

	//hay que ver bien cómo cerrarlo después de que se mande el mensaje
	//porque el send es async si no me equivoco
	setTimeout(function() {cliente.close();}, 50);
}

const cargarArchivo = () =>{
    FileName = document.getElementById("FileName").submit();
    FileSize = document.getElementById("FileSize").submit();
    NodeIP = document.getElementById("NodeIP").submit();
    NodePort = document.getElementById("NodePort").submit();
    
    var mensaje={};
    mensaje.fid = fid;
    mensaje.FileName = FileName;
    mensaje.Size = FileSize;
    
    mensajeUDP(mensaje,NodeIP,NodePort)
    
}