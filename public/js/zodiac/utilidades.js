'use strict';
// Muestra imágenes públicas del catálogo de Firebase Hosting y conserva enlaces
// de imágenes previamente registradas en Firestore, si existieran.
function actualizarVistaPrevia(elementoImg, url) {
  if (!url) {
    elementoImg.removeAttribute('src');
    elementoImg.hidden = true;
    return;
  }
  try {
    const destino = new URL(url, window.location.href);
    if (!['https:', 'http:'].includes(destino.protocol)) throw new Error('URL no válida.');
    elementoImg.src = destino.href;
    elementoImg.hidden = false;
  } catch (_) {
    elementoImg.removeAttribute('src');
    elementoImg.hidden = true;
  }
}

function leerCamposSigno() {
  const posic = Number(document.getElementById('txtPosic').value);
  const signo = document.getElementById('txtSigno').value.trim();
  const rango = document.getElementById('txtRango').value.trim();
  const elemento = document.getElementById('txtElemento').value;
  const astro = document.getElementById('txtAstro').value.trim();
  const piedra = document.getElementById('txtPiedra').value.trim();
  if (!Number.isInteger(posic) || posic < 1 || posic > 12 ||
      !signo || !rango || !elemento || !astro || !piedra) {
    throw new Error('Completa todos los datos. La posición debe estar entre 1 y 12.');
  }
  return {posic, signo, rango, elemento, astro, piedra};
}
