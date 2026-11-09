// Pruebas estáticas SIN instalar paquetes y SIN acceder a Firebase.
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
const raiz = fileURLToPath(new URL('../', import.meta.url));
const ruta = (...fragmentos) => join(raiz, ...fragmentos);
const leer = (...partes) => readFileSync(ruta(...partes), 'utf8');

const archivos = [
  'firebase.json','firestore.rules',
  'public/index.html','public/login.html','public/registrar.html',
  'public/agregar.html','public/lista.html','public/editar.html',
  'public/js/firebase-init.js',
  'public/js/users/signup.js','public/js/users/login.js',
  'public/js/users/islogin.js','public/js/users/inactividad.js',
  'public/js/zodiac/catalogo.js','public/js/zodiac/utilidades.js',
  'public/js/zodiac/addsigno.js','public/js/zodiac/lstzodiaco.js',
  'public/js/zodiac/editarsigno.js'
];
for (const archivo of archivos) {
  assert.ok(existsSync(ruta(archivo)), `Falta ${archivo}`);
  if (archivo.endsWith('.js')) {
    execFileSync(process.execPath, ['--check', ruta(archivo)]);
  }
}
const publicDir = 'public';
const paginas = ['index.html','login.html','registrar.html','agregar.html','lista.html','editar.html'];
for (const pagina of paginas) {
  const html = leer(publicDir,pagina);
  assert.match(html, /firebase-init\.js/, `${pagina} no inicializa Firebase`);
  assert.match(html, /lang="es"/, `${pagina} requiere idioma español`);
}
for (const pagina of ['agregar.html', 'lista.html', 'editar.html']) {
  assert.match(leer(publicDir,pagina), /js\/users\/inactividad\.js/);
  assert.match(leer(publicDir,pagina), /js\/users\/islogin\.js/);
}
for (const campo of ['fechaCreacion','fechaUltAcceso']) {
  assert.ok(leer(publicDir,'registrar.html').includes(`id="${campo}"`));
}
for (const campo of ['txtElemento','txtAstro','txtPiedra']) {
  for (const pagina of ['agregar.html','editar.html']) {
    assert.ok(leer(publicDir,pagina).includes(`id="${campo}"`));
  }
}
const entorno = {window:{}};
runInNewContext(leer(publicDir,'js/zodiac/catalogo.js'), entorno);
const catalogo = entorno.window.ZODIACO_CATALOGO;
assert.equal(catalogo.length,12);
assert.deepEqual(Array.from(catalogo,x=>x.posic), [1,2,3,4,5,6,7,8,9,10,11,12]);
for (const signo of catalogo) {
  assert.ok(['Fuego','Tierra','Aire','Agua'].includes(signo.elemento));
  assert.ok(signo.astro && signo.piedra && signo.rango);
  assert.ok(existsSync(ruta(publicDir,signo.url)));
}
assert.match(leer('firestore.rules'), /allow create, update: if autenticado\(\) && zodiacoValido/);
assert.match(leer('firestore.rules'), /'creadoEn', 'ultAcceso'/);
assert.match(leer(publicDir,'js/users/inactividad.js'), /3 \* 60 \* 1000/);
const configFirebase = JSON.parse(leer('firebase.json'));
assert.equal(configFirebase.hosting.public, 'public');
assert.ok(!Object.hasOwn(configFirebase, 'storage'), 'No se debe desplegar Cloud Storage');
assert.ok(!Object.hasOwn(configFirebase.emulators, 'storage'), 'No se requiere el emulador de Storage');
for (const pagina of paginas) {
  assert.doesNotMatch(leer(publicDir,pagina), /firebase-storage-compat/);
}
assert.doesNotMatch(leer(publicDir,'js/zodiac/utilidades.js'), /firebase\.storage\(/);
assert.doesNotMatch(leer(publicDir,'js/zodiac/addsigno.js'), /txtArchi|guardarImagen/);
assert.doesNotMatch(leer(publicDir,'js/zodiac/editarsigno.js'), /txtArchi|guardarImagen/);
assert.match(leer(publicDir,'editar.html'), /id="selImagen"/);
console.log(`OK Spark (sin Storage): ${archivos.length} archivos, ${paginas.length} páginas, 12 signos e imágenes, JS válido, campos y reglas presentes.`);
console.log('Pendiente: pruebas integradas contra el proyecto Firebase real, permisos y despliegue de Hosting.');
