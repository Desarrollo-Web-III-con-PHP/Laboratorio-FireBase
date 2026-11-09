'use strict';
const formularioSigno = document.getElementById('formSigno');
const botonGuardar = document.getElementById('btnLoad');
const botonCatalogo = document.getElementById('btnCatalogo');
const selectorSigno = document.getElementById('txtSigno');
const vistaPrevia = document.getElementById('vistaPrevia');

window.sesionLista.then(() => {
  for (const item of window.ZODIACO_CATALOGO) {
    const opt = document.createElement('option');
    opt.value = item.signo;
    opt.textContent = item.signo;
    selectorSigno.appendChild(opt);
  }
  selectorSigno.addEventListener('change', () => {
    const item = window.ZODIACO_CATALOGO.find(x => x.signo === selectorSigno.value);
    if (!item) return;
    for (const [campo, valor] of Object.entries({
      txtPosic:item.posic, txtRango:item.rango, txtElemento:item.elemento,
      txtAstro:item.astro, txtPiedra:item.piedra
    })) document.getElementById(campo).value = valor;
    actualizarVistaPrevia(vistaPrevia, item.url);
  });

}).catch(() => {});

formularioSigno.addEventListener('submit', async event => {
  event.preventDefault();
  if (!formularioSigno.reportValidity()) return;
  botonGuardar.disabled = true;
  try {
    await window.sesionLista;
    const nuevo = leerCamposSigno();
    const item = window.ZODIACO_CATALOGO.find(x => x.signo === nuevo.signo);
    // Imágenes estáticas del catálogo, publicadas en Firebase Hosting.
    nuevo.url = item?.url || '';
    if (!nuevo.url) throw new Error('Selecciona un signo válido del catálogo.');
    await firebase.firestore().collection('datosZodiaco').add(nuevo);
    formularioSigno.reset();
    actualizarVistaPrevia(vistaPrevia, '');
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = 'Signo registrado. Puedes verlo en la lista.';
    mensaje.className = 'alerta-exito';
    mensaje.hidden = false;
  } catch (error) {
    window.mensajeError(error);
  } finally {
    botonGuardar.disabled = false;
  }
});

botonCatalogo.addEventListener('click', async () => {
  botonCatalogo.disabled = true;
  botonGuardar.disabled = true;
  const mensaje = document.getElementById('mensaje');
  try {
    await window.sesionLista;
    const db = firebase.firestore();
    let nuevos = 0, completados = 0;
    for (const item of window.ZODIACO_CATALOGO) {
      const coincidencias = await db.collection('datosZodiaco').where('posic', '==', item.posic).get();
      if (coincidencias.empty) {
        await db.collection('datosZodiaco').add(item);
        nuevos++;
      } else {
        // Conserva la imagen y los datos ya registrados; solo completa valores faltantes.
        for (const existente of coincidencias.docs) {
          const actual = existente.data();
          const cambios = {};
          for (const campo of ['elemento', 'astro', 'piedra']) {
            if (!actual[campo]) cambios[campo] = item[campo];
          }
          if (Object.keys(cambios).length) {
            await existente.ref.update(cambios);
            completados++;
          }
        }
      }
    }
    mensaje.className = 'alerta-exito';
    mensaje.textContent = `Catálogo procesado: ${nuevos} nuevos y ${completados} registros completados.`;
  } catch (error) {
    mensaje.className = 'alerta-error';
    mensaje.textContent = `La importación se detuvo: ${error.message}. Los registros anteriores se conservaron.`;
  } finally {
    mensaje.hidden = false;
    botonCatalogo.disabled = false;
    botonGuardar.disabled = false;
  }
});
