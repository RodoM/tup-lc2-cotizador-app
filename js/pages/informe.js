let etiquetas = [];

function obtenerFechasUnicas(cotizaciones) {
  const fechas = [];
  cotizaciones.forEach(cotizacion => {
    const fecha = new Date(cotizacion.fechaActualizacion);
    if (!fechas.some(f => f.getTime() === fecha.getTime())) {
      fechas.push(fecha);
    }
  });
  fechas.sort((a, b) => a - b);
  return fechas;
}

function generarEtiquetas(cotizaciones) {
  const fechas = obtenerFechasUnicas(cotizaciones);
  etiquetas = fechas.map(fecha => formatearFechaHora(fecha));
}

function formatearFechaHora(date) {
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const año = date.getFullYear();
  const horas = String(date.getHours()).padStart(2, '0');
  const minutos = String(date.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${año} ${horas}:${minutos}`;
}

function agruparCotizacionesPorNombre(cotizaciones) {
  return cotizaciones.reduce((acc, cotizacion) => {
    if (!acc[cotizacion.nombre]) {
      acc[cotizacion.nombre] = {
        nombre: cotizacion.nombre,
        compra: new Array(etiquetas.length).fill(null),
        venta: new Array(etiquetas.length).fill(null)
      };
    }
    let indiceEtiqueta = etiquetas.indexOf(formatearFechaHora(new Date(cotizacion.fechaActualizacion)));
    if (indiceEtiqueta !== -1) {
      acc[cotizacion.nombre].compra[indiceEtiqueta] = cotizacion.compra;
      acc[cotizacion.nombre].venta[indiceEtiqueta] = cotizacion.venta;
    }
    return acc;
  }, {});
}

function transformarCotizaciones(cotizaciones) {
  const cotizacionesAgrupadas = agruparCotizacionesPorNombre(cotizaciones);
  return Object.values(cotizacionesAgrupadas);
}

function randomRGB() {
  return `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 1)`;
}

function actualizarGrafica(grafica, cotizaciones, mostrarVenta = true) {
  grafica.data.labels = etiquetas;
  grafica.data.datasets = cotizaciones.flatMap(cotizacion => [
    {
      label: `${cotizacion.nombre} Compra`,
      data: cotizacion.compra.map(c => c ? c : null),
      borderColor: randomRGB(),
      borderWidth: 2,
      fill: false,
      tension: 0
    },
    ...(mostrarVenta ? [{
      label: `${cotizacion.nombre} Venta`,
      data: cotizacion.venta.map(c => c ? c : null),
      borderColor: randomRGB(),
      borderWidth: 2,
      fill: false,
      tension: 0
    }] : [])
  ]);
  grafica.update();
}

function obtenerFavoritas(cotizacion) {
  if (!cotizacion || cotizacion === 'Todas') {
    return JSON.parse(localStorage.getItem("favoritas") || []);
  }
  return JSON.parse(localStorage.getItem("favoritas") || []).filter((favorita) => favorita.nombre === cotizacion);
}

let favoritas = obtenerFavoritas();
generarEtiquetas(favoritas);
let cotizaciones = transformarCotizaciones(favoritas);

const select = document.getElementById('currency_select');
select.addEventListener("change", () => {
  const value = select.value;
  favoritas = obtenerFavoritas(value);
  generarEtiquetas(favoritas);
  cotizaciones = transformarCotizaciones(favoritas);
  actualizarGrafica(grafica, cotizaciones, value !== 'Todas');
  mostrarInforme(value);
});

const ctx = document.getElementById("miGrafica").getContext("2d");
const grafica = new Chart(ctx, {
  type: "line",
  data: {
    labels: etiquetas,
    datasets: cotizaciones.flatMap(cotizacion => [
      {
        label: `${cotizacion.nombre} Compra`,
        data: cotizacion.compra.map(c => c ? c : null),
        borderColor: randomRGB(),
        borderWidth: 2,
        fill: false,
        tension: 0
      }
    ])
  }
});

function agruparYOrdenarDatos(datos) {
  const agrupadosPorNombre = datos.reduce((acc, curr) => {
    const nombre = curr.nombre;
    if (!acc[nombre]) {
      acc[nombre] = [];
    }
    acc[nombre].push(curr);
    return acc;
  }, {});

  return Object.keys(agrupadosPorNombre).sort().map(nombre => {
    const cotizaciones = agrupadosPorNombre[nombre];
    cotizaciones.forEach((cotizacion, indice, array) => {
      const tendencia = indice === 0 ? "igual" : parseFloat(cotizacion.venta) > parseFloat(array[indice - 1].venta) ? "en-alta" : parseFloat(cotizacion.venta) < parseFloat(array[indice - 1].venta) ? "en-baja" : "igual";
      cotizacion.tendencia = tendencia;
    });
    const cotizacionesOrdenadas = cotizaciones.sort((a, b) => new Date(b.fechaActualizacion) - new Date(a.fechaActualizacion));
    return { nombre, cotizaciones: cotizacionesOrdenadas };
  });
}

function mostrarInforme(cotizacion) {
  const favoritas = agruparYOrdenarDatos(obtenerFavoritas(cotizacion));
  const table = document.getElementById("table-body");
  table.innerHTML = '';
  if (favoritas.length) {
    favoritas.forEach(grupo => {
      const elementoNombre = document.createElement('tr');
      elementoNombre.innerHTML = `<td colspan="5" class="date-cell">${grupo.nombre}</td>`;
      table.appendChild(elementoNombre);
      grupo.cotizaciones.forEach(cotizacion => {
        const fecha = new Date(cotizacion.fechaActualizacion);
        const elementoCotizacion = document.createElement('tr');
        elementoCotizacion.innerHTML = `
          <td></td>
          <td>${formatearFechaHora(fecha)}</td>
          <td>$${cotizacion.compra}</td>
          <td>$${cotizacion.venta}</td>
          <td class="text-center"><img src="./img/icons/${cotizacion.tendencia}.svg" alt="${cotizacion.tendencia}"></td>
        `;
        table.appendChild(elementoCotizacion);
      });
    });
  } else {
    const data = document.getElementById("data");
    data.innerHTML = '<h3 class="text-center mt-5rem">No hay cotizaciones favoritas</h3>';
  }
}

mostrarInforme();