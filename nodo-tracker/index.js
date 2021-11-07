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

// DHT
// Consideramos que el rango de la HT en un nodo va desde su id
// hasta el anterior del id del nodo siguiente
// o sea rango = [id, sig.id), y si el sig.id < id, pega la vuelta
let HT = require('./hashtable.js');
let inicio = config.id;
let fin = config.sig.id;
var miHT = new HT(inicio, fin);

// Creacion del server
const dgram = require('dgram');
const server = dgram.createSocket('udp4'); //ipv4

server.on('listening', function() {
	console.log('Escuchando en el puerto: ' + config.server.puerto);
});

server.on('error', function(error) {
	console.log('Hubo un error:');
	console.log(error);
});
// tener en cuenta que puede ser tanto de otro tracker o el server (A) como de un par (C)
server.on('message', function(msg, rinfo) {
	mensajeJSON = armarMensajeJSON(msg);
	imprimirMensaje(msg, rinfo, mensajeJSON);

	// TODO revisar el messageID para ver si este nodo es el inicial
	// por ahora supone que el mensaje es nuevo
	respuesta = manejarMensajeTracker(mensajeJSON, tipoMensaje(mensajeJSON.route));
	imprimirRespuesta(respuesta);
	//enviarRespuesta(respuesta);
});

server.bind(config.server.puerto);

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

function imprimirRespuesta(resp) {
	console.log('Respuesta a enviar: ');
	console.log(resp);
}
// Manejo de mensajes del server UDP

function tipoMensaje(ruta) {
	let rutaArr = ruta.split("/");
	switch(rutaArr[rutaArr.length-1]) {
		case 'count':
			tipo = 1;
		break;
		case 'scan':
			tipo = 2;
		break;
		case 'found':
			tipo = 3;
		break;
		case 'store':
			tipo = 4;
		break;
		default: // es el hash
			tipo = 5;
		break;
	}
	console.log('tipo = ', tipo);
	return tipo;
}

// Recibe el *string* del mensaje y lo manda a la función que se encargue de ese tipo de mensaje
function manejarMensajeTracker(mensajeJSON, tipo) {
	switch(tipo) {
		case 1:
			manejarMensajeContar(mensajeJSON);
		break;
		case 2:
			//manejarMensajeScan(mensajeJSON.body);
		break;
		case 3:
			//manejarMensajeFound(mensajeJSON.body);
		break;
		case 4:
			//manejarMensajeStore(mensajeJSON.body);
		break;
		case 5:
			//manejarMensajeSearch(mensajeJSON.body);
		break;
	}

	return mensajeJSON; //llegado el caso se podría clonar y devolver el clon modificado, en vez de modificar el propio mensaje
}

function manejarMensajeContar(msg) {
	msg.body.trackerCount++;
	msg.body.fileCount+= miHT.getCantidadArchivos();
}
/*
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
*/
