'use strict';
const formularioEdicion = document.getElementById('formSigno');
const botonActualizar = document.getElementById('btnActualizar');
const vistaEdicion = document.getElementById('vistaPrevia');
const seleccionImagen = document.getElementById('selImagen');
const idSigno = new URLSearchParams(window.location.search).get('id');
let urlActual = '';
let referenciaDocumento;

window.sesionLista.then(async () => {
  try {
    if (!idSigno || !/^[a-zA-Z0-9_-]{1,128}$/.test(idSigno)) {
      throw new Error('Identificador del signo no válido. Vuelve a la lista.');
    }
    referenciaDocumento = firebase.firestore().collection('datosZodiaco').doc(idSigno);
    const documento = await referenciaDocumento.get();
    if (!documento.exists) throw new Error('El signo solicitado no existe.');
    const datos = documento.data();
    const campos = {
      txtPosic: datos.posic, txtSigno: datos.signo, txtRango: datos.rango,
      txtElemento: datos.elemento || '', txtAstro: datos.astro || '',
      txtPiedra: datos.piedra || ''
    };
    for (const [id, valor] of Object.entries(campos)) {
      document.getElementById(id).value = valor == null ? '' : valor;
    }
    urlActual = datos.url || '';
    for (const item of window.ZODIACO_CATALOGO) {
      const opcion = document.createElement('option');
      opcion.value = item.url;
      opcion.textContent = `${item.signo} — imagen incluida`;
      seleccionImagen.appendChild(opcion);
    }
    actualizarVistaPrevia(vistaEdicion, urlActual);
    formularioEdicion.hidden = false;
  } catch (error) {
    window.mensajeError(error);
  }
}).catch(() => {});

seleccionImagen.addEventListener('change', () => {
  actualizarVistaPrevia(vistaEdicion, seleccionImagen.value || urlActual);
});

formularioEdicion.addEventListener('submit', async event => {
  event.preventDefault();
  if (!formularioEdicion.reportValidity()) return;
  botonActualizar.disabled = true;
  try {
    await window.sesionLista;
    if (!referenciaDocumento) throw new Error('Registro no cargado.');
    const datos = leerCamposSigno();
    // La imagen se conserva o se cambia por otro archivo estático del Hosting.
    datos.url = seleccionImagen.value || urlActual;
    if (!datos.url) throw new Error('El registro debe contener una imagen.');
    await referenciaDocumento.update(datos);
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = 'Los cambios se guardaron correctamente.';
    mensaje.hidden = false;
    mensaje.className = 'alerta-exito';
    urlActual = datos.url;
    seleccionImagen.value = '';
  } catch (error) {
    window.mensajeError(error);
  } finally {
    botonActualizar.disabled = false;
  }
});
