const dgram = require('dgram');

const ip = '127.0.0.1';
const puerto = 9000;

function formatoCount(cantNodos, cantArch) {
	return {
		route: '/count',
		body: {
			nodeCount: cantNodos,
			fileCount: cantArch
		}
	};
}
var mensaje = formatoCount(20, 1000);
var mensajeBuf = Buffer.from(JSON.stringify(mensaje));

const cliente = dgram.createSocket('udp4');

cliente.send(mensajeBuf, puerto, ip);

//hay que ver bien cómo cerrarlo después de que se mande el mensaje
//porque el send es async si no me equivoco
setTimeout(function() {cliente.close();}, 50); 
