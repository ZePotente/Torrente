const fs = require('fs');
const crypto = require('crypto');

// Configuracion
const configFile = 'config.json'; //se hardcodea el nombre de la config.
const config = crearConfig(configFile);

function crearConfig(archivo) {
	const configBuffer = fs.readFileSync(archivo); //por ahora sync porque es lo mismo
	const configString = configBuffer.toString();

	return JSON.parse(configString);
}

class Seeds {
	constructor() {
		this.archivos = new Map();
	}

	putArchivo(hash, filename) {
		this.archivos.set(hash, []);
	}

	getArchivo(hash) {
		return this.archivos.get(hash);
	}

	getSize() {
		return this.archivos.size;
	}
}

//El límite es archivos de medio GiB por la forma de mandarlo.
// Interfaz D P2P, TCP entre pares
const net = require('net');
// -- Servidor TCP --
const serverTCP = net.createServer(function(socket) {
	console.log('Se recibio una conexión de otro par.');
	socket.on('data', function(data) {
		let mensaje = JSON.parse(data.toString());
		nombreArch = seedArchivos.getArchivo(mensaje.hash); // colección de archivos global
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

// -- Cliente TCP --
function descargarArchivo(ip, puerto, body) {
	console.log('--Inicio de la funcion descargarArchivo--');
	let mensaje = {
		type:'GET FILE',
		hash: body.id
	};
	let archivo = '';

	const client = net.createConnection(puerto, ip);
	client.on('connect', function() {
		console.log('Conexión establecida con el servidor del par.');
		client.write(JSON.stringify(mensaje));
		console.log('Mensaje enviado.');
	});

	client.on('data', function(data) {
		archivo += data;
	});

	client.on('end', function() {
		fs.writeFile(body.filename, archivo, function (err) {
	  		if (err) {
	  			console.log('Hubo un error al guardar el archivo.')
	  			console.log(err);
	  		} else {
	  			console.log('El archivo se guardó correctamente.');
	  			console.log('Agregando este nodo como seeder.')
	  			let infoarch = {id: body.id, filename: body.filename, filesize: body.filesize};
	  			pedirAgregarPar(infoarch, body.trackerIP, body.trackerPort);
	  		}
		});
		console.log('Fin de la conexion.');
	});

	client.on('error', function(error) {
		console.log('Hubo un error en la conexión:');
		console.log(error);

	});
	console.log('--Fin de la funcion descargarArchivo--');
}

// -- Interfaz C UDP, con el Tracker --
// Creacion del server
const dgram = require('dgram');
const server = dgram.createSocket('udp4'); //ipv4

server.on('error', function(error) {
	console.log('Hubo un error:');
	console.log(error);
});
// Respuesta del Tracker
server.on('message', function(msg, rinfo) {
	mensajeJSON = armarMensajeJSON(msg);
	imprimirMensaje(msg, rinfo, mensajeJSON);
	
	if (isMensajeFound(mensajeJSON.route)) {
		console.log('Se recibio respuesta del tracker por una peticion de pares del .torrente');
		// Iniciar conexión TCP con el par que tiene el archivo
		// (iterar el vector de pares)
		let body = mensajeJSON.body;
		//mensajeJSON.body.pares.forEach()...
		let i = 0;
		let par = body.pares[i];

		descargarArchivo(par.parIP, par.parPort, body);
	} else { //es addPar
		console.log('Se recibio respuesta del tracker por un addPar.');
	}
});

function isMensajeFound(ruta) {
	let rutaArr = ruta.split("/");
	let last = rutaArr.length-1;
	let tipo;
	if(rutaArr[last] == 'found') {
		tipo = true;
	} else if(rutaArr[last] == 'store' || rutaArr[last] == 'addPar') {
		tipo = false;
	}
	console.log('tipo = ', tipo);
	return tipo;
}

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
function pedirTorrente(nombreTorrente) {
	// Busca el .torrente en el filesystem,
	torrente = levantarTorrente(nombreArchTorrente);
	console.log(torrente);
	// Prepara y envia la búsqueda
	search = formatoSearch(nextMId(), torrente.hash, config.ip, config.puertoUDP);
	mensajeUDP(search, torrente.trackerIP, torrente.trackerPort);
}

function nextMId() {
	return crypto.randomUUID();
}

function levantarTorrente(archivo) {
	const configBuffer = fs.readFileSync(archivo); //por ahora sync porque es lo mismo
	const configString = configBuffer.toString();

	return JSON.parse(configString);
}

function formatoSearch(mid, hash, ip, puerto) {
	let route = '/file' + '/' + hash;
	
	return {
		messageId: mid,
		route,
		originIP: ip,
		originPort: puerto,
		body: {}
	};
}

function mensajeUDP(mensaje, ip, puerto) {
	console.log('Se va a enviar el siguiente mensaje: ');
	console.log(mensaje);
	var mensajeBuf = Buffer.from(JSON.stringify(mensaje));
	const cliente = dgram.createSocket('udp4');
	cliente.send(mensajeBuf, puerto, ip);

	//hay que ver bien cómo cerrarlo después de que se mande el mensaje
	//porque el send es async si no me equivoco
	setTimeout(function() {cliente.close();}, 50);
}

function pedirAgregarPar(infoarchivo, tip, tpuerto) {
	addPar = formatoAddPar(nextMId(), infoarchivo, config.ip, config.puertoUDP);
	mensajeUDP(addPar, tip, tpuerto);
	console.log('Se envió un mensaje al tracker para agregar como par');
}
function formatoAddPar(mid, infoarchivo, ip, puerto) {
	let route = '/file' + '/' + infoarchivo.hash + '/addPar';
	return {
		messageId: mid,
		route,
		id: infoarchivo.hash,
		filename: infoarchivo.nombre,
		filesize: infoarchivo.tam,
		parIP: ip,
		parPort: puerto
	};
}

function agregarArchivo(filename) {
	//(await fs.promises.stat(file)).size
	let stats = fs.statSync("filename");
	let filesize = stats["size"];
	let concat = filename+filesize;
	let hash = crypto.createHash('sha1').update(concat).digest('hex');
	seedArchivos.putArchivo(hash, filename); // colección de archivos global
}

// CLI
console.log('Configurando...');
console.log('Archivo de configuración:');
console.log(config);
serverTCP.listen(config.puertoTCP);
console.log('Servidor TCP escuchando en el puerto ' + config.puertoTCP);
server.bind(config.puertoUDP);
console.log('Servidor UDP escuchando en el puerto ' + config.puertoUDP);
let seedArchivos = new Seeds();
console.log('Fin de configuración.');
//
const readline = require('readline');
const rl = readline.createInterface({input: process.stdin,output: process.stdout});

mostrarAyuda();
rl.on('line', (line) => {
	let lineArr = line.split(')');
	let tipo = lineArr[0];
	let nombreArch = '';
	if (lineArr.length > 1) {
		nombreArch = lineArr[1].trim();
	}
	switch (tipo) {
    case '1':
    	agregarArchivo(nombreArch);  
    break;
    case '2':
    	pedirTorrente(nombreArch);
    break;
    case '3':
		console.clear();
    	mostrarAyuda();
    break;
  	}
});

function mostrarAyuda() {
  console.log('Funcionamiento de la CLI:');
  console.log('Ingresar alguno de los 3 siguientes comandos, son un número y una cadena, separados por un paréntesis que cierra');
  console.log('1) nombre-del-archivo.extension');
  console.log('-Sirve para agregar archivo nuevo (recién subido por el Cliente) para seedear-');
  console.log('Ejemplo: "1) aoe2.exe"');
  console.log('2) nombre-del-torrente.torrente');
  console.log('-Pedir descarga de archivo usando un .torrente, y seedearlo (be like Sneed)-');
  console.log('Ejemplo: "2) aaaaaaa.torrente"');
  console.log('3');
  console.log('-Sirve para mostrar esta ayuda.-');
}
