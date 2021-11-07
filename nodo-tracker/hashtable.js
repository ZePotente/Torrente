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

		existe(hash) {
			var indice = hash.slice(0,2);
			bucket = this.tabla[indice];
			//bucket.find(function())
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