var http = require('http');
var fs = require('fs');
var path = require('path');

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
