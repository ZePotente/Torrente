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
let inicio = config.nodo.id;
let fin = config.sig.id;
var miHT = new HT(inicio, fin);

// Creacion del server
const dgram = require('dgram');
const server = dgram.createSocket('udp4'); //ipv4

server.on('listening', function() {
	console.log('Escuchando en el puerto: ' + config.nodo.puerto);
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
	let pasar = true;
	// por ahora supone que el mensaje es nuevo
	// if(pego la vuelta) {pasar = false; respuesta=larespuesta;} else manejarMensajeTracker.
	respuesta = manejarMensajeTracker(mensajeJSON, tipoMensaje(mensajeJSON.route));
	imprimirRespuesta(respuesta);
	console.log('¿Lo pasa al nodo siguiente?'); console.log(pasar);
	let puerto; let ip;
	if (pasar) {
		//respuesta al config.sig
		puerto = config.sig.puerto;
		ip = config.sig.ip;
	} else {
		//respuesta al origin/server
		if (mensajeJSON.originPort == undefined) { //si no es origin, sino par.
			puerto = mensajeJSON.parPort;
			ip = mensajeJSON.parIP;
		} else {
			puerto = mensajeJSON.originPort;
			ip = mensajeJSON.originIP;
		}
	}
	const mensajeBuf = Buffer.from(JSON.stringify(respuesta));
	const cliente = dgram.createSocket('udp4');
	cliente.send(mensajeBuf, puerto, ip);
	setTimeout(function() {cliente.close();}, 50); 
});

server.bind(config.nodo.puerto);

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

// Recibe el mensaje y lo manda a la función que se encargue de ese tipo de mensaje
// //Devuelve el mensaje, y si lo tiene que pasar al siguiente
function manejarMensajeTracker(mensajeJSON, tipo) {
	switch(tipo) {
		case 1:
			manejarMensajeContar(mensajeJSON);
		break;
		case 2:
			manejarMensajeScan(mensajeJSON);
		break;
		/* nunca se recibe un found, porque el scan se transforma en found que se envía directo al server (originIP, originPort)
		case 3:
			//manejarMensajeFound(mensajeJSON.body);
		break;
		*/
		case 4:
			manejarMensajeStore(mensajeJSON);
		break;
		case 5: //el search que se procesa acá es del server
			manejarMensajeSearch(mensajeJSON);
		break;
	}

	return mensajeJSON; //llegado el caso se podría clonar y devolver el clon modificado, en vez de modificar el propio mensaje
}

function manejarMensajeContar(msg) {
	msg.body.trackerCount++;
	msg.body.fileCount+= miHT.getCantidadArchivos();
}

function manejarMensajeScan(msg) {
	let files = miHT.getListaArchivos();
	//si viene directo del server, el body es undefined
	if (msg.body === undefined) {
		msg.body = {files:[]};
	}
	files.forEach(function(value, index) {
		msg.body.files.push(value);
	});
	//console.log(JSON.stringify(msg));
}

function obtenerHash(msg) {
	rutaArr = msg.route.split("/");
	let hash = rutaArr[2];
	return hash;
}

function manejarMensajeStore(msg) {
	let hash = obtenerHash(mensajeJSON);
	if(miHT.isEnDominio(hash)) {
		let body = msg.body;
		miHT.agregarArchivo(body.id, body.filename, body.filesize, body.pares);
	}
}

function manejarMensajeSearch(mensajeJSON) {
	let hash = obtenerHash(mensajeJSON);
	
	if(miHT.isEnDominio(hash)) {
		transformarEnFound(mensajeJSON, hash);  // podría verse que cambia el tipo del mensaje
												// y con eso identificar que va al server
	} // else, se lo pasa al que sigue
}

function transformarEnFound(mensajeJSON, hash) {
	//pares = miHT.getPares(hash);
	pares = []; //porque es para el server
	mensajeJSON.body = {
		id: hash,
		filename: 'asd.txt',
		filesize: 1000,
		trackerIP: config.nodo.ip,
		trackerPort: config.nodo.puerto,
		pares
	};
}
