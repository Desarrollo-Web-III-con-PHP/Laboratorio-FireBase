'use strict';
// init.json es servido por Firebase Hosting; no requiere incluir credenciales en Git.
// Las bibliotecas compat se cargan desde gstatic (v9+ no funciona en /__/firebase/*).
window.firebaseReady = fetch('/__/firebase/init.json')
  .then(async response => {
    if (!response.ok) {
      throw new Error('No se encontró la configuración de Firebase Hosting. Inicia con Firebase Hosting, no con Live Server.');
    }
    const config = await response.json();
    if (!config.projectId || !config.apiKey) {
      throw new Error('La configuración del proyecto Firebase está incompleta.');
    }
    return firebase.apps.length ? firebase.app() : firebase.initializeApp(config);
  });

function mensajeError(err) {
  const text = err && err.message ? err.message : String(err);
  const contenedor = document.getElementById('mensaje');
  if (contenedor) {
    contenedor.textContent = text;
    contenedor.hidden = false;
    contenedor.classList.add('alerta-error');
  } else {
    console.error(text);
  }
}
window.mensajeError = mensajeError;
