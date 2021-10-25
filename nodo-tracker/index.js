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
// tener en cuenta que puede ser tanto de otro tracker como de un par
server.on('message', function(msg, rinfo) {
	console.log('Se recibió un mensaje:');
	console.log(msg); //objeto JSON
	console.log('rinfo:');
	console.log(rinfo);

	mensaje = armarMensaje(msg); //habría que ver qué pasa si es muy grande y se manda en varios buffers
	console.log('mensaje:');
	console.log(mensaje);
	manejarMensajeTracker(mensaje);
});

server.on('listening', function() {
	console.log('Escuchando en el puerto' + config.server.puerto);
});

server.bind(config.server.puerto);

function armarMensaje(msg) {
	return msg.toString();
}

// Manejo de mensajes del server UDP

// Recibe el *string* del mensaje y lo manda a la función que se encargue de ese tipo de mensaje
function manejarMensajeTracker(mensaje) {
	mensajeJSON = JSON.parse(mensaje);
	mensajeJSON.route = ruta;
	//TODO implementar con callbacks probablemente
	rutaArr = ruta.split("/");
	switch(rutaArr[rutaArr.size-1]) {
		case 'count':
			manejarMensajeContar(mensajeJSON.body);
		break;
		case 'scan':
			manejarMensajeScan(mensajeJSON.body);
		break;
		case 'found':
			manejarMensajeFound(mensajeJSON.body);
		break;
		case 'store':
			manejarMensajeStore(mensajeJSON.body);
		break;
		default: // es el hash
			manejarMensajeSearch(mensajeJSON.body);
		break;
	}
}

// Formateo de mensajes de interfaz
/* 
// creo que este mensaje lo manda sólo el server
// de ser asi, capaz se podria armar una clase con route y body
// en vez de las funciones de formato
function formatoSearch(hash) {
	let ruta = '/file' + '/' + hash;
	return {route: ruta};
}
*/

function formatoScan(listaArch) {
	return {
		route: '/scan',
		body: {
			files: listaArchivos
		}
	};
}

/*
// no entiendo la definición de la interfaz
function formatoFound(hash) {

}
*/

function formatoStore(hash, info) {
	return {
		route: `/file/${hash}/store`,
		body: info
	};	
}

function formatoCount(cantNodos, cantArch) {
	return {
		route: '/count',
		body: {
			nodeCount: cantNodos,
			fileCount: cantArch
		}
	};
}

// DHT
var parteHT = {};
