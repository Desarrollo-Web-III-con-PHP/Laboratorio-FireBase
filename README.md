# Práctica Firebase — ITI-621

Aplicación de registro/autenticación de usuarios y mantenimiento de signos zodiacales. Proyecto creado a partir de la guía del curso, conservando las colecciones `datosUsuarios` y `datosZodiaco` y los archivos `index.html`, `registrar.html`, `login.html`, `agregar.html` y `lista.html`.

## Funciones implementadas

1. Registro de usuarios: `creadoEn` y `ultAcceso` (tipo Timestamp de Firestore, asignados por el servidor). La interfaz muestra ambos campos en solo lectura.
2. Login: actualiza `ultAcceso` al iniciar sesión. Si ya existen perfiles de la guía original, añade `creadoEn` a esos documentos cuando falta, utilizando la fecha del usuario en Firebase Authentication.
3. Registro zodiacal: `posic`, `signo`, `rango`, `url`, `elemento`, `astro` y `piedra`.
4. Listado: tarjetas con imagen, rango, elemento, astro y piedra; cada tarjeta enlaza a `editar.html?id=ID_DOCUMENTO`.
5. Edición: lectura, actualización de campos y selección opcional de otra imagen del catálogo local.
6. Inactividad: `agregar.html`, `lista.html` y `editar.html` cierran la sesión tras 180 segundos sin movimientos o interacción. Se verifica el tiempo real transcurrido al regresar a una pestaña en segundo plano.
7. Reglas de Firestore: escrituras validadas por autenticación y esquema; solo el dueño puede leer/actualizar la fecha de acceso de su perfil; se prohíbe eliminar documentos.
8. Catálogo: 12 signos e imágenes locales del archivo suministrado. El botón «Cargar o completar los 12 signos» inserta registros faltantes y agrega los nuevos atributos cuando existen documentos antiguos, conservando sus imágenes.

## Modalidad gratuita (Firebase Spark)

Esta variante **no usa Cloud Storage ni facturación**. Las imágenes se sirven desde Firebase Hosting y Firestore almacena únicamente sus rutas. Los cinco ajustes solicitados (usuarios, campos de signos, tarjetas, edición y 3 minutos de inactividad) se implementan sin pagos. La guía base utiliza Storage para la carga de imágenes; esta modalidad no reproduce la subida de archivos desde el navegador.

Proyecto usado en los comandos de ejemplo de esta práctica: **`labfirebase-8210f`**. Antes del despliegue verifica el alias activo con `firebase use`.

Si ya publicaste una versión anterior, para actualizar tu carpeta local haz copia de seguridad y reemplaza los archivos del proyecto, **conservando tu `.firebaserc`** que apunta a tu proyecto. El ZIP no incluye `.firebaserc`.

## 1. Requisitos de Firebase

Antes de publicar, en la consola https://console.firebase.google.com/ crea o selecciona tu proyecto y configura:

- **Authentication:** habilitar proveedor «Correo electrónico/contraseña».
- **Cloud Firestore:** crear la base de datos (por ejemplo, edición Standard, modo producción).
- **Hosting:** habilitado en el proyecto.
- **Cloud Storage NO se necesita:** esta edición usa las 12 imágenes estáticas que ya están en `public/img/zodiaco`, publicadas desde Firebase Hosting. No vincules tarjeta ni habilites Blaze para esta solución. **Limitación:** no permite cargar imágenes nuevas desde el navegador; el profesor podría exigir Cloud Storage si evalúa ese componente de la guía por separado.

> El SDK se importa del CDN oficial `www.gstatic.com/firebasejs/12.19.0/*-compat.js` porque las URLs reservadas `/__/firebase/VERSION/*` de Hosting no admiten Firebase SDK v9 o posteriores. La configuración se obtiene en ejecución desde `/__/firebase/init.json`. Por ello, abre la app **desde Firebase Hosting**, no con Live Server o `file://`.

## 2. Archivos principales

```
firestore.rules
firestore.indexes.json
firebase.json
public/
  index.html
  login.html
  registrar.html
  agregar.html
  lista.html
  editar.html
  css/style.css
  js/firebase-init.js
  js/users/{signup.js,login.js,islogin.js,inactividad.js}
  js/zodiac/{catalogo.js,utilidades.js,addsigno.js,lstzodiaco.js,editarsigno.js}
  img/zodiaco/00_Portada.png, 01_Acuario.png ... 12_Capricornio.png
```

### Estructura de datos

**`datosUsuarios`** (documento nuevo con ID igual al UID):

```javascript
{
  idemp: 'UID_DE_AUTH',
  usuario: 'Nombre del usuario',
  email: 'correo@dominio.com',
  creadoEn: Timestamp,
  ultAcceso: Timestamp
}
```

**`datosZodiaco`** (ID automático):

```javascript
{
  posic: 3,
  signo: 'Aries',
  rango: 'Mar/21 - Abr/19',
  url: 'img/zodiaco/03_Aries.png',
  elemento: 'Fuego',
  astro: 'Marte',
  piedra: 'Diamante'
}
```

La propiedad `url` guarda una ruta como `img/zodiaco/03_Aries.png`. Al cambiar la imagen desde `editar.html`, se elige otra ruta del catálogo. Las asociaciones astrológicas del catálogo son convencionales y pueden variar según la tradición.

## 3. Instalación y despliegue (Windows PowerShell)

**En la carpeta raíz donde están `firebase.json` y `firestore.rules`:**

```powershell
node --version
npm --version
npm install -g firebase-tools
firebase --version
firebase login
firebase projects:list
firebase use --add
```

En `firebase use --add`, selecciona el proyecto **existente** que configuraste en la consola y asígnale el alias `default`. Esto crea o actualiza tu archivo `.firebaserc` con el identificador verdadero; no incluyas en los archivos nombres de proyecto inventados.

**Publicar las reglas y la aplicación:**

```powershell
firebase deploy --only firestore:rules,hosting
```

**No ejecutes `firebase deploy --only storage`**. El archivo `firebase.json` de esta edición no configura Storage.

Al finalizar, Firebase mostrará la URL real de Hosting (generalmente `https://ID_REAL.web.app`). Usa la URL que efectivamente genere Firebase CLI; no copies un ID ficticio.

**Si ya tenías un proyecto del profesor en tu equipo:** crea una copia de seguridad o un commit primero, compara los archivos existentes y fusiona las modificaciones. Este ZIP es una implementación completa basada en la guía; no asume que todos tus archivos locales sean idénticos. No sobrescribas datos de la consola de Firebase.

## 4. Flujo de pruebas funcionales

1. Abrir `https://TU_DOMINIO/registrar.html`, registrar un usuario y verificar `datosUsuarios/{uid}` con las marcas `creadoEn` y `ultAcceso` como Timestamp.
2. Cerrar sesión desde la navegación e iniciar con `login.html`; confirmar en la consola que `ultAcceso` cambió sin modificar `creadoEn`.
3. Abrir `agregar.html`; usar «Cargar o completar los 12 signos» para insertar los 12 documentos. Puedes volver a usar el botón sin duplicar registros existentes de igual `posic`.
4. Abrir `lista.html`; verificar cuatro datos por tarjeta: rango, elemento, astro y piedra, además de la imagen.
5. Seleccionar una tarjeta; comprobar que la URL contiene `editar.html?id=...`, que el formulario está precargado y que al guardar se refleja el cambio en Firestore y en el listado.
6. En `editar.html`, elegir otra imagen del catálogo y comprobar que el campo `url` en Firestore cambió a la ruta estática seleccionada. No se permite subir imágenes externas desde el navegador.
7. Dejar abierta `lista.html` sin interacción durante **más de 3 minutos** y comprobar que aparece `login.html?motivo=inactividad`. Repetir con `agregar.html` y `editar.html`.
8. Verificar seguridad: sin sesión, entrar directamente a `lista.html` debe redirigir al login. Intentar modificar un perfil ajeno debe ser denegado por Firestore Rules.
9. Pruebas estáticas locales desde la carpeta raíz: `node tests/verificar.mjs`.

**Nota de seguridad:** el cierre por inactividad es un control de cliente (JavaScript), no un timeout de token impuesto por servidor. En un sistema real con altos requisitos de seguridad conviene añadir controles de sesión del lado servidor, revocación y reglas basadas en roles. Aquí corresponde al requerimiento académico de tres minutos.

## 5. GitHub y entrega al campus

Desde la carpeta del proyecto (PowerShell):

```powershell
git init
git add .
git commit -m "Práctica Firebase: usuarios, zodiaco, edición e inactividad"
git branch -M main
```

Crea **tu propio repositorio** en GitHub (público o privado con acceso explícito para el profesor). Después conecta la URL real indicada por GitHub:

```powershell
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

Sustituye `TU_USUARIO` y `TU_REPOSITORIO` por tus datos. Si el repositorio ya está creado, omite `git init` y confirma primero el remoto con `git remote -v`. Comparte acceso de lectura con el profesor si el repositorio es privado.

Abre `ENTREGA_CAMPUS.txt`, sustituye los campos entre corchetes por las URLs **reales** de GitHub y Firebase Hosting y entrega ese archivo en el campus.

## 6. Diagnóstico de errores frecuentes

| Problema | Verificación |
|---|---|
| Error al obtener `/__/firebase/init.json` | Usar la URL del Hosting de Firebase, no un servidor estático genérico. |
| `auth/operation-not-allowed` | Activar Authentication > Correo electrónico/contraseña. |
| `permission-denied` al crear/editar signo | Publicar `firestore.rules`, iniciar sesión y revisar campos obligatorios. |
| `FirebaseError: Missing or insufficient permissions` en perfil | Comprobar `idemp == request.auth.uid`, Auth habilitado y las reglas publicadas. |
| No se ven cambios recientes | Verificar que despliegas al proyecto correcto: `firebase use` y `firebase deploy --only hosting`. |

Documentación oficial:
- https://firebase.google.com/docs/hosting/reserved-urls
- https://firebase.google.com/docs/web/learn-more
- https://firebase.google.com/docs/firestore/security/rules-fields
