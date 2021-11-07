module.exports = 
	class HT {
		constructor(inicio, fin) {
			this.rango = {inicio, fin};
			this.tabla = {};
		}

		insertar(hash, datos, nodoPar) {
			var indice = hash.slice(0,2);
			bucket = this.tabla[indice];
			/*
			if (bucket.size == 0) {

			} else {}
			*/

		}

		agregarArchivo(hash, name, size, pares) {
			console.log('archivo agregado:');
			console.log(`hash: ${hash} \nnombre: ${name}\ntamaño: ${size}, pares: ${pares}`);
		}

		getListaArchivos() {
			//ejemplo
			let id = '111'; let filename = 'arch3.txt'; let filesize = 1000;
			let listaArch = [{id, filename, filesize}];
			console.log('lista de archivos:');
			console.log(listaArch);
			return listaArch;
		}

		existe(hash) {
			var indice = hash.slice(0,2);
			bucket = this.tabla[indice];
			//bucket.find(function())
		}

		getPares(hash) {
			//ejemplo
			let parIP = '127.0.0.1';
			let parPort = 10000;
			let pares = [{parIP, parPort}];
			pares.push({parIP, parPort});
			pares.push({parIP, parPort});
			console.log('pares');
			console.log(pares);
			return pares;
		}

		isEnDominio(hash) {
			return false;
		}

		getInicio() {
			console.log(this.rango.inicio)
			return this.rango.inicio;			
		}

		getFin() {
			return this.rango.fin;
		}

		setFin(fin) {
			this.rango.fin = fin;
		}

		getCantidadArchivos() {
			return 20;
		}
	};
	/*
let inicio = '00';
let fin = 'ff'
ht = new HT(inicio, fin);

console.log(ht.getInicio());
console.log(ht.getFin());
ht.setFin('aa');
console.log(ht.getFin());
*/