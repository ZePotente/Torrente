const fs = require('fs');

const configFile = 'config.json'; //se hardcodea el nombre de la config.
const config = crearConfig(configFile);

function crearConfig(archivo) {
	const configBuffer = fs.readFileSync(archivo); //por ahora sync porque es lo mismo
	const configString = configBuffer.toString();

	return JSON.parse(configString);
}
