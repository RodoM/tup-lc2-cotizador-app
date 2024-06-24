function formatearFechaHora(date) {
  const fecha = new Date(date);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const año = fecha.getFullYear();

  return `${dia}/${mes}/${año}`;
}

function agruparYOrdenarDatos(datos) {
  const agrupadosPorFecha = datos.reduce((acc, curr) => {
    const fecha = curr.fechaActualizacion.split('T')[0];
    if (!acc[fecha]) {
        acc[fecha] = [];
    }
    acc[fecha].push(curr);
    return acc;
  }, {});

  const fechasOrdenadas = Object.keys(agrupadosPorFecha).sort((a, b) => new Date(b) - new Date(a));

  const resultadoOrdenado = fechasOrdenadas.map(fecha => ({
    fecha,
    cotizaciones: agrupadosPorFecha[fecha]
  }));

  return resultadoOrdenado;
}

function mostrarArchivo() {
  const favoritas = agruparYOrdenarDatos(JSON.parse(localStorage.getItem("favoritas")) || []);
  const table = document.getElementById("table-body");
  favoritas.forEach((grupo) => {
    const elementoFecha = document.createElement('tr');
    elementoFecha.innerHTML = `
      <td colspan="5" class="date-cell">${formatearFechaHora(grupo.fecha)}</td>
    `;
    table.appendChild(elementoFecha);
    grupo.cotizaciones.forEach((cotizacion) => {
      const elementoCotizacion = document.createElement('tr');
      elementoCotizacion.innerHTML = `
        <td></td>
        <td>${cotizacion.nombre}</td>
        <td>$${cotizacion.compra}</td>
        <td>$${cotizacion.venta}</td>
        <td class="text-center"><img src="./img/icons/erase.svg" alt="borrar" class="cursor-pointer" onclick="borrarCotizacion()"></td>
      `;
      table.appendChild(elementoCotizacion);
    })
  });
}

function borrarCotizacion() {
  console.log("Borrar cotizacion");
}

mostrarArchivo();