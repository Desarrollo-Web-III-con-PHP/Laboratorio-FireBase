'use strict';
const formularioRegistro = document.getElementById('formRegistro');
const btnInsUser = document.getElementById('btnInsUser');
const txtNombre = document.getElementById('txtNombre');
const txtEmail = document.getElementById('txtEmail');
const txtContra = document.getElementById('txtContra');
const fechaCreacion = document.getElementById('fechaCreacion');
const fechaUltAcceso = document.getElementById('fechaUltAcceso');

fechaCreacion.value = 'Automática al crear la cuenta (servidor)';
fechaUltAcceso.value = 'Automática al crear la cuenta (servidor)';

formularioRegistro.addEventListener('submit', async event => {
  event.preventDefault();
  if (!formularioRegistro.reportValidity()) return;
  btnInsUser.disabled = true;
  try {
    await window.firebaseReady;
    const nombre = txtNombre.value.trim();
    const email = txtEmail.value.trim();
    if (!nombre) throw new Error('El nombre es obligatorio.');
    const credencial = await firebase.auth().createUserWithEmailAndPassword(email, txtContra.value);
    const usuario = credencial.user;
    // El servidor de Firestore asigna ambos timestamps, no el reloj del navegador.
    await firebase.firestore().collection('datosUsuarios').doc(usuario.uid).set({
      idemp: usuario.uid,
      usuario: nombre,
      email: usuario.email,
      creadoEn: firebase.firestore.FieldValue.serverTimestamp(),
      ultAcceso: firebase.firestore.FieldValue.serverTimestamp()
    });
    const registro = await firebase.firestore().collection('datosUsuarios').doc(usuario.uid).get();
    const datos = registro.data();
    const formato = timestamp => timestamp?.toDate()?.toLocaleString('es-CR') || 'Guardada';
    fechaCreacion.value = formato(datos.creadoEn);
    fechaUltAcceso.value = formato(datos.ultAcceso);
    txtContra.value = '';
    document.getElementById('mensaje').textContent = 'Cuenta creada y datos guardados. Ya puedes abrir el catálogo.';
    document.getElementById('mensaje').hidden = false;
    document.getElementById('mensaje').className = 'alerta-exito';
  } catch (error) {
    window.mensajeError(error);
  } finally {
    btnInsUser.disabled = false;
  }
});
