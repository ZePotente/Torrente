const fs = require('fs');

// Configuracion
const configFile = 'config.json'; //se hardcodea el nombre de la config.
const config = crearConfig(configFile);

function crearConfig(archivo) {
	const configBuffer = fs.readFileSync(archivo); //por ahora sync porque es lo mismo
	const configString = configBuffer.toString();

	return JSON.parse(configString);
}

console.log(config);
/*
//El límite es archivos de medio GiB por la forma de mandarlo.
// Interfaz D P2P, TCP entre pares
const net = require('net');

// -- Servidor --
const puertoTCP = config.puertoTCP;
const server = net.createServer(function(socket) {
	console.log('Se recibio una conexión de otro par.');
	socket.on('data', function(data) {
		let mensaje = JSON.parse(data.toString());
		nombreArch = 'asd.txt';
		//nombreArch = buscar(mensaje.hash);
		fs.readFile(nombreArch, 'utf8', function(err, data) {
			if (err) throw err;
			socket.end(data);
		});
	});
	socket.on('end', function() {
		console.log('Archivo enviado y conexión cerrada.');
	});

	socket.on('error', function(error) {
		console.log('Hubo un error en la conexión:');
		console.log(error);
	});
});

server.listen(puertoTCP);
console.log('Escuchando en el puerto ' + puertoTCP);

// -- Cliente --


const puerto2 = 9999; const ip = '127.0.0.1';
const client = net.createConnection(puerto2, ip);
const hash = 'ffffffffffffffffffffffffff';
let nombreArch = 'elarchivo.txt';

let mensaje = {
	type: "GET FILE",
	hash
};
let archivo = '';
client.on('connect', function() {
	console.log('Conexión establecida con el servidor del par.');
	client.write(JSON.stringify(mensaje));
	console.log('Mensaje enviado.');
});

client.on('data', function(data) {
	archivo += data;
});

client.on('end', function() {
	fs.writeFile(nombreArch, archivo, function (err) {
  		if (err) throw err;
  		console.log('El archivo se guardó correctamente.');
	});
	console.log('Fin de la conexion.');
});

client.on('error', function(error) {
	console.log('Hubo un error en la conexión:');
	console.log(error);
});
*/

// Interfaz C UDP, con el Tracker
// Creacion del server
const dgram = require('dgram');
const server = dgram.createSocket('udp4'); //ipv4

server.on('listening', function() {
	console.log('Escuchando en el puerto: ' + config.puertoUDP);
});

server.on('error', function(error) {
	console.log('Hubo un error:');
	console.log(error);
});
// Respuesta del Tracker
server.on('message', function(msg, rinfo) {
	mensajeJSON = armarMensajeJSON(msg);
	imprimirMensaje(msg, rinfo, mensajeJSON);

	// Llamar a la descarga del archivo (iterando el vector de pares)

});
server.bind(config.puertoUDP);

// por si hay que hacer algo más que simplemente un toString()
// si es muy grande y se manda en varios buffers
function armarMensajeJSON(msg) {
	mensaje = msg.toString();
	mensajeJSON = JSON.parse(mensaje);
	return mensajeJSON;
}

function imprimirMensaje(msg, rinfo, mensaje) {
	console.log('Se recibió un mensaje:');
	console.log('msg');
	console.log(msg); //objeto JSON
	console.log('rinfo:');
	console.log(rinfo);
	console.log('mensaje:');
	console.log(mensaje);
}

// Parte Cliente UDP
// Solicitud de los pares del archivo .torrente al tracker
nombreArchTorrente = 'torrentito.torrente';
// Busca el .torrente en el filesystem,
torrente = levantarTorrente(nombreArchTorrente);
console.log(torrente);
// Prepara y envia la búsqueda
search = formatoSearch(nextMId(), torrente.hash, torrente.trackerIP, torrente.trackerPort);
console.log(search);


function levantarTorrente(archivo) {
	const configBuffer = fs.readFileSync(archivo); //por ahora sync porque es lo mismo
	const configString = configBuffer.toString();

	return JSON.parse(configString);
}

function nextMId() {
	return "1";
}

function formatoSearch(mid, hash, ip, puerto) {
	let route = '/file' + '/' + hash;
	
	return {
		messageId: mid,
		route,
		originIP: ip,
		originPort: config.puertoUDP,
		body: {}
	};
}
