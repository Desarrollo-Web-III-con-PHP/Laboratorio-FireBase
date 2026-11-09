'use strict';
// Guardián de inactividad para agregar.html, lista.html y editar.html.
const TIEMPO_INACTIVIDAD_MS = 3 * 60 * 1000;
let ultimoMovimiento = Date.now();
let temporizadorInactividad;
let cierrePorInactividad = false;

function comprobarInactividad() {
  if (cierrePorInactividad) return;
  const transcurrido = Date.now() - ultimoMovimiento;
  if (transcurrido >= TIEMPO_INACTIVIDAD_MS) {
    cierrePorInactividad = true;
    window.firebaseReady
      .then(() => firebase.auth().signOut())
      .then(() => {
        window.location.replace('login.html?motivo=inactividad');
      })
      .catch(window.mensajeError);
    return;
  }
  clearTimeout(temporizadorInactividad);
  temporizadorInactividad = setTimeout(comprobarInactividad, TIEMPO_INACTIVIDAD_MS - transcurrido);
}

function registrarActividad() {
  if (cierrePorInactividad) return;
  // La actividad se registra solamente cuando la pestaña está visible.
  if (document.visibilityState === 'visible') {
    ultimoMovimiento = Date.now();
    comprobarInactividad();
  }
}

window.sesionLista.then(() => {
  ultimoMovimiento = Date.now();
  comprobarInactividad();
  for (const evento of ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll']) {
    document.addEventListener(evento, registrarActividad, { passive: true });
  }
  document.addEventListener('visibilitychange', () => {
    // Primero verifica el tiempo real transcurrido (los timers en segundo plano se retrasan).
    if (document.visibilityState === 'visible') comprobarInactividad();
  });
}).catch(() => {});
