'use strict';
const formularioLogin = document.getElementById('formLogin');
const botonLogin = document.getElementById('btnLogin');

if (new URLSearchParams(window.location.search).get('motivo') === 'inactividad') {
  const aviso = document.getElementById('mensaje');
  aviso.hidden = false;
  aviso.textContent = 'La sesión se cerró por 3 minutos sin actividad.';
  aviso.className = 'alerta-info';
}

formularioLogin.addEventListener('submit', async event => {
  event.preventDefault();
  if (!formularioLogin.reportValidity()) return;
  botonLogin.disabled = true;
  try {
    await window.firebaseReady;
    const auth = firebase.auth();
    const db = firebase.firestore();
    const credencial = await auth.signInWithEmailAndPassword(
      document.getElementById('txtEmail').value.trim(),
      document.getElementById('txtContra').value
    );
    const usuario = credencial.user;
    // Esta consulta funciona con los documentos originales (ID automático)
    // y con los nuevos (ID = UID), sin modificar los datos existentes.
    const perfiles = await db.collection('datosUsuarios').where('idemp', '==', usuario.uid).get();
    const ultimoAcceso = firebase.firestore.FieldValue.serverTimestamp();

    if (!perfiles.empty) {
      const doc = perfiles.docs[0];
      const actualizacion = { ultAcceso: ultimoAcceso };
      // Migración no destructiva del perfil creado en la versión del profesor.
      if (!doc.data().creadoEn) {
        const fecha = new Date(usuario.metadata.creationTime);
        actualizacion.creadoEn = Number.isNaN(fecha.getTime())
          ? firebase.firestore.FieldValue.serverTimestamp()
          : firebase.firestore.Timestamp.fromDate(fecha);
      }
      await doc.ref.update(actualizacion);
    } else {
      // Perfiles de Authentication sin documento Firestore previo.
      const fecha = new Date(usuario.metadata.creationTime);
      const creadoEn = Number.isNaN(fecha.getTime())
        ? firebase.firestore.FieldValue.serverTimestamp()
        : firebase.firestore.Timestamp.fromDate(fecha);
      await db.collection('datosUsuarios').doc(usuario.uid).set({
        idemp: usuario.uid,
        usuario: usuario.displayName || usuario.email.split('@')[0],
        email: usuario.email,
        creadoEn,
        ultAcceso: ultimoAcceso
      });
    }
    window.location.replace('index.html');
  } catch (error) {
    window.mensajeError(error);
  } finally {
    botonLogin.disabled = false;
  }
});
