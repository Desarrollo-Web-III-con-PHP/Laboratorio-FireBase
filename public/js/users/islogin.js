'use strict';
// Solo se usa en páginas protegidas.
window.sesionLista = window.firebaseReady.then(() => new Promise((resolve, reject) => {
  const auth = firebase.auth();
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.replace('login.html');
      reject(new Error('Inicia sesión para continuar.'));
      return;
    }
    document.querySelector('main')?.removeAttribute('hidden');
    resolve(user);
  }, reject);
}));

function salir() {
  return window.firebaseReady
    .then(() => firebase.auth().signOut())
    .then(() => window.location.replace('login.html'))
    .catch(window.mensajeError);
}

window.addEventListener('DOMContentLoaded', () => {
  const boton = document.getElementById('cerrarSesion');
  if (boton) boton.addEventListener('click', salir);
});
window.sesionLista.catch(err => {
  if (!/Inicia sesión/.test(err.message)) window.mensajeError(err);
});
