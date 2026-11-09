# Adaptación a Firebase Spark — sin Cloud Storage

**Proyecto Firebase existente:** `labfirebase-8210f`  
**Sitio publicado anteriormente:** https://labfirebase-8210f.web.app

## Qué se modificó

- Eliminada la dependencia del SDK `firebase-storage-compat.js` en todas las páginas.
- Eliminada la opción de subir archivos desde `agregar.html` y `editar.html`, con sus llamadas a `firebase.storage()`.
- Registro: la imagen del signo se toma del catálogo existente en `public/img/zodiaco/`; se guarda su ruta en `datosZodiaco.url`.
- Edición: se conserva la imagen actual o se escoge otra de las 12 imágenes locales desde `editar.html`.
- Retirada la configuración de Storage de `firebase.json`; no se requieren bucket, facturación ni reglas de Storage.
- Se mantienen Firestore, Authentication, reglas de seguridad, campos nuevos y 3 minutos de inactividad.

## Cómo actualizar SIN perder la vinculación del proyecto

1. **No configures Blaze y no agregues una tarjeta.** Comprueba en Firebase Console que tu proyecto sigue en Spark.
2. Haz una copia de seguridad de `C:\xampp\htdocs\2026\Practica_Firebase_ITI621`.
3. Sustituye los archivos del proyecto local por los de este ZIP. **Conserva tu archivo `.firebaserc` existente** (no viene en este ZIP); contiene el alias `default` del proyecto correcto.
4. Abre PowerShell y ejecuta:

```powershell
cd C:\xampp\htdocs\2026\Practica_Firebase_ITI621
firebase use
node tests/verificar.mjs
firebase deploy --only hosting,firestore:rules
```

5. Abre https://labfirebase-8210f.web.app y verifica las páginas `registrar.html`, `login.html`, `agregar.html`, `lista.html`, `editar.html`.
6. Si todavía no se han creado los signos en Firestore, inicia sesión y usa **Cargar o completar los 12 signos** en `agregar.html`.

**No ejecutes `firebase deploy --only storage`**, no está configurado y no es necesario para esta edición.

## Limitación

La aplicación no carga imágenes propias desde el navegador. Para agregar nuevos archivos de imágenes al catálogo en esta edición, debes incorporarlos bajo `public/img/zodiaco/` y volver a publicar Hosting. La guía original del profesor sí incluye un ejercicio de Cloud Storage; consúltalo si te evalúan específicamente esa tecnología.
