const fs = require('fs');

// Configuracion
const configFile = 'config.json'; //se hardcodea el nombre de la config.
const config = crearConfig(configFile);

function crearConfig(archivo) {
	const configBuffer = fs.readFileSync(archivo); //por ahora sync porque es lo mismo
	const configString = configBuffer.toString();

	return JSON.parse(configString);
}

console.log(config.ant.ip);
console.log(config.ant.puerto);
console.log(config.sig.ip);
console.log(config.sig.puerto);


// Creacion del server
const dgram = require('dgram');
const server = dgram.createSocket('udp4'); //ipv4

server.on('error', function(error) {
	console.log('Hubo un error:');
	console.log(error);
})
// tener en cuenta que puede ser tanto de otro tracker o el server (A) como de un par (C)
server.on('message', function(msg, rinfo) {
	console.log('Se recibió un mensaje:');
	console.log(msg); //objeto JSON
	console.log('rinfo:');
	console.log(rinfo);

	mensaje = armarMensajeEntrante(msg); //habría que ver qué pasa si es muy grande y se manda en varios buffers
	console.log('mensaje:');
	console.log(mensaje);
	manejarMensajeTracker(mensaje);

	//TODO probar los formateos y el agregado del extra
});

server.on('listening', function() {
	console.log('Escuchando en el puerto' + config.server.puerto);
});

server.bind(config.server.puerto);

function armarMensajeEntrante(msg) {
	return msg.toString();
}

// Manejo de mensajes del server UDP

// Recibe el *string* del mensaje y lo manda a la función que se encargue de ese tipo de mensaje
function manejarMensajeTracker(mensaje) {
	mensajeJSON = JSON.parse(mensaje);
	ruta = mensajeJSON.route;
	//TODO implementar con callbacks probablemente
	rutaArr = ruta.split("/");
	switch(rutaArr[rutaArr.size-1]) {
		case 'count':
			//manejarMensajeContar(mensajeJSON.body);
		break;
		case 'scan':
			//manejarMensajeScan(mensajeJSON.body);
		break;
		case 'found':
			//manejarMensajeFound(mensajeJSON.body);
		break;
		case 'store':
			//manejarMensajeStore(mensajeJSON.body);
		break;
		default: // es el hash
			//manejarMensajeSearch(mensajeJSON.body);
		break;
	}
}

// Formateo de mensajes de interfaz

function formatoSearch(hash) {
	let route = '/file' + '/' + hash;
	
	return {route};
}

function formatoFound(hash, id, ip, puerto) {
	let route = '/file' + '/' + hash + '/found';
	let body = {
		id,
		trackerIP: ip,
		trackerPort: puerto
	}
	return {
		route,
		body
	};
}

function formatoScan(listaArch) {
	let route = '/scan';
	return {
		route,
		body: {
			files: listaArch
		}
	};
}

function formatoStore(hash, info) {
	return {
		route: `/file/${hash}/store`,
		body: info
	};
}

function formatoCount(cantNodos, cantArch) {
	let route = '/count';
	return {
		route,
		body: {
			trackerCount: cantNodos,
			fileCount: cantArch
		}
	};
}

function agregarExtras(mensaje, extras) {
	//let extras = crearExtras(mID, oIP, oPort);
	console.log('antes');
	console.log(mensaje);
	extras.forEach(function(i, val) {
		mensaje.push(val);
	})
	console.log('despues');
	console.log(mensaje);
	return mensaje;
}

function crearExtras(messageID, originIP, originPort) {
	return {
		messageID,
		originIP,
		originPort
	};
}
// DHT
var parteHT = {};
