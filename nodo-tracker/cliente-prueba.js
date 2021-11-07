const dgram = require('dgram');

const ip = '127.0.0.1';
const puerto = 9000;

/*
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
var mensaje = formatoCount(20, 1000);
*/

function formatoSearch(hash) {
	let route = '/file' + '/' + hash;
		
	return {
		messageId: '1',
		route,
		originIP: '127.0.0.1',
		originPort: 9999,
		body: {}
	};
}

function formatoStore(hash, info) {
	return {
		route: `/file/${hash}/store`,
		body: info
	};
}
let hash = '1000'
let info = {
	id: hash,
	filename: 'EishOfEmpaiersChu.exe',
	filesize: 1000000,
	pares: [
	{
		parIP:'127.0.0.1',
		parPort:5000
	},
	{
		parIP:'127.0.0.1',
		parPort:5001
	}]
}
var mensaje = formatoStore(info.id, info);

/*
function formatoScan(listaArch) {
	let route = '/scan';
	return {
		route,
		body: {
			files: listaArch
		}
	};
}
let id = '11'; let filename = 'arch1.txt'; let filesize = 1000;
var listaArch = [{id, filename, filesize}];
id = '12'; filename = 'arch2.txt'; filesize = 1002;
listaArch.push({id, filename, filesize});
var mensaje = formatoScan(listaArch);
*/

var mensajeBuf = Buffer.from(JSON.stringify(mensaje));

const cliente = dgram.createSocket('udp4');

cliente.send(mensajeBuf, puerto, ip);

//hay que ver bien cómo cerrarlo después de que se mande el mensaje
//porque el send es async si no me equivoco
setTimeout(function() {cliente.close();}, 50); 
