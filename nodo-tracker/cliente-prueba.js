const dgram = require('dgram');

const mid = '1';
const ipDest = '127.0.0.1';
const puertoDest = 9000;
const ipServer = '127.0.0.1'
const puertoServer = 10002;
const ipTracker = '127.0.0.1'
const puertoTracker = 10003;

var mensaje = '';
// cantNodos y cantArch serían 0
// Sólo lo crea el tracker, no el Servidor http
function formatoCount(mid, cantNodos, cantArch) {
	let route = '/count';
	return {
		messageId: mid,
		route,
		body: {
			trackerCount: cantNodos,
			fileCount: cantArch
		}
	};
}

// ip y puerto son los del serverUDP del Servidor
function formatoSearch(hash, mid, ip, puerto) {
	let route = '/file' + '/' + hash;
		
	return {
		messageId: mid,
		route,
		originIP: ip,
		originPort: puerto,
		body: {}
	};
}

// Sólo lo envía el Tracker.
// ip y puerto son los del serverUDP del Servidor
// ipT y puertoT son los del serverUDP del Tracker
function formatoFound(hash, mid, ip, puerto, filename, filesize, ipT, puertoT, pares) {
	let route = '/file' + '/' + hash + '/found';
	return {
  	messageId: mid,
  	route,
  	originIP: ip,
  	originPort: puerto,
  	body: {
			id: hash,
			filename,
			filesize,
			trackerIP: ipT,
			trackerPort: puertoT,
			pares
		}
	};
}

// ip y puerto son los del serverUDP del Servidor
// Pares es un vector de {parIP, parPort} (con esos nombres)
function formatoStore(hash, mid, ip, puerto, filename, filesize, pares) {
	return {
		messageId: mid,
		route: `/file/${hash}/store`,
		originIP: ip,
		originPort: puerto,
		body: {
			id: hash,
			filename,
			filesize,
			pares
		}
	};
}
// Ejemplo de pares
let pares = [
	{
		parIP:'127.0.0.1',
		parPort:20000
	},/*
	{
		parIP:'127.0.0.1',
		parPort:5001
	}*/];

// ip y puerto son las del serverUDP del Servidor
// files es un vector de {id, filename, filesize} (con esos nombres)
function formatoScan(mid, ip, puerto, files) {
	let route = '/scan';
	return {
		messageId: mid,
		route,
		originIP: ip,
		originPort: puerto,
		body: {
			files
		}
	};
}
// Ejemplo de files
let id = 'fd728dc6c461c4ba810d55d3c9194477a951b10b'; let filename = 'asd.txt'; let filesize = 21;
var listaArch = [{id, filename, filesize}];
let hash = id;
/*
id = '12'; filename = 'arch2.txt'; filesize = 1002;
listaArch.push({id, filename, filesize});
*/

mensajeCount = formatoCount(mid, 0, 0);
mensajeSearch = formatoSearch(hash, mid, ipServer, puertoServer);
mensajeFound = formatoFound(hash, mid, ipServer, puertoServer, filename, filesize, ipTracker, puertoTracker, pares);
mensajeStore = formatoStore(hash, mid, ipServer, puertoServer, filename, filesize, pares);
mensajeScan = formatoScan(mid, ipServer, puertoServer, listaArch);

// Como objetos
console.log(mensajeCount);
console.log(mensajeSearch);
console.log(mensajeFound);
console.log(mensajeStore);
console.log(mensajeScan);
// Como JSON
console.log(JSON.stringify(mensajeCount));
console.log(JSON.stringify(mensajeSearch));
console.log(JSON.stringify(mensajeFound));
console.log(JSON.stringify(mensajeStore));
console.log(JSON.stringify(mensajeScan));
mensajeUDP(mensajeStore, ipDest, puertoDest);
function mensajeUDP(mensaje, ip, puerto) {
	var mensajeBuf = Buffer.from(JSON.stringify(mensaje));
	const cliente = dgram.createSocket('udp4');
	cliente.send(mensajeBuf, puerto, ip);

	//hay que ver bien cómo cerrarlo después de que se mande el mensaje
	//porque el send es async si no me equivoco
	setTimeout(function() {cliente.close();}, 50);
}
