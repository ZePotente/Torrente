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

// Lista de mensajes pendientes (a los cuales el servidor está atento si los vuelve a recibir)
// Tiene un array de messageIds
let mensajesPend = [];

// Cantidad de nodos y archivos
let cantNodosGlobal = 1;
let cantArchivosGlobal = miHT.getCantidadArchivos();

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
	// por ahora supone que el mensaje es nuevo
	// if(pego la vuelta) {pasar = false; respuesta=larespuesta;} else manejarMensajeTracker.
	respuesta = manejarMensajeTracker(mensajeJSON, tipoMensaje(mensajeJSON.route));
	imprimirRespuesta(respuesta);
	console.log('¿Lo pasa al nodo siguiente?'); console.log(respuesta.pasar);
	
	/* 	respuesta.pasar == true -> mensaje al siguiente
		respuesta.pasar == false && es un Count -> el Count pegó toda la vuelta -> muestra datos generales
		respuesta.pasar == false && NO es un Count -> mensaje al origin o al par según corresponda
	*/
	let puerto; let ip;
	if (respuesta.pasar) {
		//respuesta al config.sig
		puerto = config.sig.puerto;
		ip = config.sig.ip;
		mensajeUDP(respuesta.mensajeJSON, ip, puerto);
	} else {
		if (tipoMensaje(respuesta.mensajeJSON.route) == 1) { //Es un Count que pegó la vuelta, no hay mensajeUDP a nadie
			imprimirCount(respuesta.mensajeJSON.body);
		} else { //respuesta al origin/server
			if (mensajeJSON.originPort == undefined) { //si no es origin, sino que es par.
				puerto = mensajeJSON.parPort;
				ip = mensajeJSON.parIP;
			} else {
				puerto = mensajeJSON.originPort;
				ip = mensajeJSON.originIP;
			}
			mensajeUDP(respuesta.mensajeJSON, ip, puerto);
		}
	}
});

server.bind(config.nodo.puerto);

function mensajeUDP(mensaje, ip, puerto) {
	var mensajeBuf = Buffer.from(JSON.stringify(mensaje));
	const cliente = dgram.createSocket('udp4');
	cliente.send(mensajeBuf, puerto, ip);

	//hay que ver bien cómo cerrarlo después de que se mande el mensaje
	//porque el send es async si no me equivoco
	setTimeout(function() {cliente.close();}, 50);
}
// por si hay que hacer algo más que simplemente un toString()
// si es muy grande y se manda en varios buffers
function armarMensajeJSON(msg) {
	mensaje = msg.toString();
	mensajeJSON = JSON.parse(mensaje);
	return mensajeJSON;
}

// Asigna los nuevos valores a las variables globales, y lo muestra por consola
function imprimirCount() {
	let promedioGlobal = cantArchivosGlobal/cantNodosGlobal;
	console.log('--Actualización de cantidad de nodos y archivos--');
	console.log('Antes:');
	console.log(`Cantidad de nodos: ${cantNodosGlobal}\nCantidad global de archivos: ${cantArchivosGlobal}`);
	console.log(`Promedio global de archivos: ${promedioGlobal}`);
	cantNodosGlobal = respuesta.mensajeJSON.trackerCount;
	cantArchivosGlobal = respuesta.mensajeJSON.fileCount;
	console.log('Ahora');
	console.log(`Cantidad de nodos: ${cantNodosGlobal}\nCantidad global de archivos: ${cantArchivosGlobal}`);
	console.log(`Promedio global de archivos: ${promedioGlobal}`);

	console.log(`Cantidad de archivos en este nodo: ${miHT.getCantidadArchivos()}`);
}
function imprimirMensaje(mens, rinfo, mensaje) {
	console.log('Se recibió un mensaje:');
	console.log('mens');
	console.log(mens); //objeto JSON
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
		case 'addPar':
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
// Estas modifican el propio mensaje para devolver la respuesta
// Devuelve el mensaje, y si lo tiene que pasar al siguiente o no
function manejarMensajeTracker(mensajeJSON, tipo) {
	let pasar = true;
	switch(tipo) {
		case 1:
			pasar = manejarMensajeCount(mensajeJSON);
		break;
		case 2:
			pasar = manejarMensajeScan(mensajeJSON);
		break;
		case 3:
			pasar = manejarMensajeAddPar(mensajeJSON);
		break;
		case 4:
			pasar = manejarMensajeStore(mensajeJSON);
		break;
		case 5:
			pasar = manejarMensajeSearch(mensajeJSON);
		break;
	}

	return {mensajeJSON, pasar};
}

function manejarMensajeCount(mens) {
	let _pasar;

	if(mensajesPend.includes(mens.messageId)) { // pegó la vuelta el count
		_pasar = false; // no se lo tiene que devolver a nadie, esto se asegura en el server
	} else { // es de otro
		mens.body.trackerCount++;
		mens.body.fileCount+= miHT.getCantidadArchivos();
		_pasar = true;
	}
	return _pasar;
}

// Hace su propio scan la primera vez que le llega, no lo hace al pegar la vuelta.
function manejarMensajeScan(mens) {
	let _pasar;

	if (mensajesPend.includes(mens.messageId)) {
		_pasar = false;
	} else {
		if (mens.body === undefined) { //si viene directo del server, el body es undefined
			mens.body = {files:[]};
			mensajesPend.push(mens.messageId);
		}
		//tiene que tener{id, filename, filesize}
		miHT.getListaArchivos().forEach(function(value, index) {
			mens.body.files.push(value);
		});
		_pasar = true;
	}
	return _pasar;
}

function manejarMensajeAddPar(mens) {
	let status;
	let hash = mens.id;

	if(miHT.existe(hash)) {
		status = true;
		miHT.agregarPar(hash, mens.parIP, mens.parPort);
	} else {
		status = false;
	}
	let mid = mens.messageId;
	mensajeConfirmar(mens, mens.messageId, hash, 'store', status);
	delete mens.id;
	delete mens.filename;
	delete mens.filesize;
	console.log('mens en manejarMensajeAddPar:'); console.log(mens);
	return false; // no lo pasa, lo devuelve al par
}

function mensajeConfirmar(mens, mid, hash, stipo, status) {
	let route = '/file/' + hash + '/' + stipo;
	mens.messageId = mid;
	mens.route = route;
	mens.status = status;
}

function manejarMensajeStore(mens) {
	let body = mens.body;
	let hash = body.id;
	let _pasar;

	if(miHT.isEnDominio(hash)) {
		miHT.agregarArchivo(hash, body.filename, body.filesize, body.pares);
		mensajeConfirmar(mens, mens.messageId, hash, 'store', true);
		delete mens.body;
		_pasar = false;
	} else { 
		_pasar = true;
	}
	return _pasar;
}

// Sólo para el Search
function obtenerHash(mens) {
	rutaArr = mens.route.split("/");
	let hash = rutaArr[2];
	return hash;
}
function manejarMensajeSearch(mens) {
	let hash = obtenerHash(mens);
	let _pasar;
	if(miHT.isEnDominio(hash)) {
		transformarEnFound(mens, hash);
		_pasar = false;
	} else {
		_pasar = true;
	}
	return _pasar;
}

function transformarEnFound(mens, hash) {
	let body = {};
	if(miHT.existe(hash)) {
		pares = miHT.getPares(hash); 
		// se supone que si viene del server no deberían mandarse los pares (porque cuál sería la gracia del .torrente), pero sí si viene del nodo par,
		// pero no hay manera de saber de cuál viene, porque ambos son origin.
		datos = miHT.getNombreSizeArchivo(hash);
		body = {
			id: hash,
			filename: datos.filename,
			filesize: datos.filesize,
			trackerIP: config.nodo.ip,
			trackerPort: config.nodo.puerto,
			pares
		};
	}
	mens.route+= '/found';
	mens.body = body;
}
