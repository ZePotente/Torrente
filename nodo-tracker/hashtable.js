module exports = 
	class HT {
		constructor(inicio, fin) {
			this.rango = {inicio, fin};
			this.tabla = new Map();
			this.max = 'ff';
			this.min = '00';
		}

		getIndice(hash) {
			return hash.slice(0,2);
		}

		agregarArchivo(hash, name, size, pares) {
			let body = {
				id: hash,
				filename: name,
				filesize: size,
				pares
			};
			let indice = this.getIndice(hash);
			if (this.tabla.get(indice) == undefined) { //no hay archivos en ese indice
				this.tabla.set(indice, []);
			}
			this.tabla.get(indice).push(body);
			console.log(JSON.stringify(this.tabla.get(indice)));
			/*
			arrayArchivos.forEach(function (index, value) {
				value.hash = hash
			});
			*/
		}

		// Tiene que tener formato [{id, filename, filesize}] por eso tienen esos nombres
		getListaArchivos() {
			let listaArch = [];
			this.tabla.forEach(function(value, key) {
				for(let i = 0; i < value.length; i++) {
					let id = value[i].id;
					let filename = value[i].filename;
					let filesize = value[i].filesize;
					listaArch.push({id, filename, filesize});
				}
			});
			return listaArch;
		}

		existe(hash) {
			let indice = this.getIndice(hash);
			let arrayArchivos = this.tabla.get(indice);
			if (arrayArchivos == undefined) {
				return false;
			} else {
				let i = 0; let len = arrayArchivos.length;
				while (i < len && arrayArchivos[i].id != hash) {
					i++;
				}
				return i < len;
			}
		}

		//Precondición: el archivo está en la HT (existe(hash))
		getNombreSizeArchivo(hash) {
			let indice = this.getIndice(hash);
			let arrayArchivos = this.tabla.get(indice);
			let i = 0;
			while (i < arrayArchivos.length && arrayArchivos[i].id != hash) {
				i++;
			}

			return {filename: arrayArchivos[i].filename, filesize: arrayArchivos[i].filesize};
		}

		//Precondición: el archivo está en la HT (existe(hash))
		getPares(hash) {
			let indice = this.getIndice(hash);
			let arrayArchivos = this.tabla.get(indice);

			let i = 0;
			while (i < arrayArchivos.length && arrayArchivos[i].id != hash) {
				i++;
			}
			return arrayArchivos[i].pares;
		}

		//Precondición: el archivo está en la HT (existe(hash))
		agregarPar(hash, parIP, parPort) {
			let indice = this.getIndice(hash);
			let arrayArchivos = this.tabla.get(indice);

			let i = 0;
			while (i < arrayArchivos.length && arrayArchivos[i].id != hash) {
				i++;
			}
			let par = {parIP, parPort};
			console.log(arrayArchivos);
			arrayArchivos[i].pares.push(par);
		}

		isEnDominio(hash) {
			let indice = this.getIndice(hash);

			let ini = this.rango.inicio;
			let fin = this.rango.fin;
			if (fin < ini) { //si pega la vuelta, indice pertenece a [ini;max] U [min;fin)
				return (indice >= ini && indice <= this.max) || (indice >= this.min && indice < fin);
			} else { //indice pertenece a [ini;fin)
				return indice >= ini && indice < fin;
			}
		}

		getInicio() {
			return this.rango.inicio;			
		}

		getFin() {
			return this.rango.fin;
		}

		setFin(fin) {
			this.rango.fin = fin;
		}

		getCantidadArchivos() {
			let cant = 0;
			this.tabla.forEach(function(value, key) {
				cant += value.length; //suma la cantidad de archivos en cada índice
			});
			return cant;
		}
	};
/*
let asd = new HT('f0', '03');
let hash = 'f21230123123';
let name = 'asd.tt';
let size = 1000;
let pares = [
	{
		parIP: '127.0.0.1',
		parPort: 2
	},
	{
		parIP: '127.0.0.1',
		parPort: 3	
	}
];

asd.agregarArchivo(hash, name, size, pares);
asd.agregarArchivo(hash+'1', name, size, pares);
asd.agregarArchivo('1'+hash+'1', name, size, pares);

console.log('Indice del hash');
console.log(asd.getIndice(hash));

console.log('¿Está en dominio?')
console.log(asd.isEnDominio(hash));

let nombresize = asd.getNombreSizeArchivo(hash)
console.log(`Nombre del archivo: ${nombresize.filename}\nTamaño del archivo: ${nombresize.filesize}`);

console.log('Pares del hash antes');
console.log(asd.getPares(hash));

asd.agregarPar(hash, '127.0.0.1', 4);
console.log('Pares del hash despues');
console.log(asd.getPares(hash));


console.log(asd.existe('f02233553223454312123145'));
console.log(asd.existe(hash));
console.log('Cantidad de archivos: ');
console.log(asd.getCantidadArchivos());

console.log('Lista de archivos');
console.log(asd.getListaArchivos());
*/