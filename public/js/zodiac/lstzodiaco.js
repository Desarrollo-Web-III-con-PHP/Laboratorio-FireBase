'use strict';
window.sesionLista.then(async () => {
  const tabla = document.getElementById('tabla');
  try {
    const consulta = await firebase.firestore().collection('datosZodiaco').orderBy('posic', 'asc').get();
    tabla.replaceChildren();
    if (consulta.empty) {
      const nota = document.createElement('p');
      nota.textContent = 'Todavía no hay signos. Puedes importarlos desde Agregar signo.';
      tabla.appendChild(nota);
      return;
    }
    consulta.forEach(doc => {
      const item = doc.data();
      const tarjeta = document.createElement('a');
      tarjeta.className = 'tarjeta-signo';
      tarjeta.href = `editar.html?id=${encodeURIComponent(doc.id)}`;
      tarjeta.setAttribute('aria-label', `Editar signo ${item.signo || 'sin nombre'}`);
      const imagen = document.createElement('img');
      imagen.alt = `Símbolo de ${item.signo || 'signo zodiacal'}`;
      imagen.loading = 'lazy';
      imagen.className = 'signo-imagen';
      actualizarVistaPrevia(imagen, item.url);
      tarjeta.appendChild(imagen);
      const titulo = document.createElement('h3');
      titulo.textContent = item.signo || '(Sin nombre)';
      tarjeta.appendChild(titulo);
      const campos = [
        ['Rango', item.rango],
        ['Elemento', item.elemento],
        ['Astro celeste', item.astro],
        ['Piedra preciosa', item.piedra]
      ];
      for (const [etiqueta, valor] of campos) {
        const linea = document.createElement('p');
        const negrita = document.createElement('strong');
        negrita.textContent = `${etiqueta}: `;
        linea.appendChild(negrita);
        linea.append(document.createTextNode(valor || 'Pendiente de completar'));
        tarjeta.appendChild(linea);
      }
      const enlace = document.createElement('span');
      enlace.className = 'tarjeta-editar';
      enlace.textContent = 'Seleccionar para editar';
      tarjeta.appendChild(enlace);
      tabla.appendChild(tarjeta);
    });
  } catch (error) {
    window.mensajeError(error);
  }
}).catch(() => {});
