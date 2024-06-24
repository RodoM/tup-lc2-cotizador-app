let etiquetas = [];

function generarEtiquetas(cotizaciones) {
  const fechas = [];
  cotizaciones.forEach((cotizacion) => {
    const fecha = new Date(cotizacion.fechaActualizacion);
    if (!fechas.includes(fecha)) {
      fechas.push(fecha);
    }
  });

  fechas.sort((a,b) => a - b);
  etiquetas = fechas.map((f) => formatearFechaHora(f));
}

function formatearFechaHora(date) {
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const año = date.getFullYear();
  const horas = String(date.getHours()).padStart(2, '0');
  const minutos = String(date.getMinutes()).padStart(2, '0');

  return `${dia}/${mes}/${año} ${horas}:${minutos}`;
}

function transformarCotizaciones(cotizaciones) {
  const cotizacionesAgrupadas = {};

  cotizaciones.forEach((cotizacion) => {
    if (!cotizacionesAgrupadas[cotizacion.nombre]) {
      cotizacionesAgrupadas[cotizacion.nombre] = {
        nombre: cotizacion.nombre,
        cotizaciones: new Array(etiquetas.length).fill(null)
      };
    }

    let indiceEtiqueta = etiquetas.indexOf(formatearFechaHora(new Date(cotizacion.fechaActualizacion)));

    if (indiceEtiqueta !== -1) {
      cotizacionesAgrupadas[cotizacion.nombre].cotizaciones[indiceEtiqueta] = {
        compra: cotizacion.compra,
        venta: cotizacion.venta,
        fechaActualizacion: cotizacion.fechaActualizacion
      };
    }
  });

  return Object.values(cotizacionesAgrupadas);
}

function randomRGB() {
  return `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 1)`
}

generarEtiquetas(JSON.parse(localStorage.getItem("favoritas")) || []);
const favoritas = transformarCotizaciones(JSON.parse(localStorage.getItem("favoritas")) || []);

const ctx = document.getElementById("miGrafica").getContext("2d");
new Chart(ctx, {
  type: "line",
  data: {
    labels: etiquetas,
    datasets: favoritas.map((cotizacion) => ({
      label: cotizacion.nombre,
      data: cotizacion.cotizaciones.map((c) => c ? c.compra : null),
      borderColor: randomRGB(),
      borderWidth: 2,
      fill: false,
    }))
  }
});

function agruparYOrdenarDatos(datos) {
  // Agrupar por nombre
  const agrupadosPorNombre = datos.reduce((acc, curr) => {
    const nombre = curr.nombre;
    if (!acc[nombre]) {
      acc[nombre] = [];
    }
    acc[nombre].push(curr);
    return acc;
  }, {});

  // Procesar cada grupo de cotizaciones
  const resultadoOrdenado = Object.keys(agrupadosPorNombre).sort().map(nombre => {
    // Obtener las cotizaciones para el nombre actual
    const cotizaciones = agrupadosPorNombre[nombre];
    
    // Calcular la tendencia para cada cotización
    cotizaciones.forEach((cotizacion, indice, array) => {
      const tendencia = indice === 0 ? "igual" : parseFloat(cotizacion.venta) > parseFloat(array[indice - 1].venta) ? "en-alta" : parseFloat(cotizacion.venta) < parseFloat(array[indice - 1].venta) ? "en-baja" : "igual";
      cotizacion.tendencia = tendencia;
    });

    // Ordenar las cotizaciones por fecha de actualización (descendente)
    const cotizacionesOrdenadas = cotizaciones.sort((a, b) => new Date(b.fechaActualizacion) - new Date(a.fechaActualizacion));

    return {
      nombre,
      cotizaciones: cotizacionesOrdenadas
    };
  });

  return resultadoOrdenado;
}

function mostrarInforme() {
  const favoritas = agruparYOrdenarDatos(JSON.parse(localStorage.getItem("favoritas")) || []);
  const table = document.getElementById("table-body");
  table.innerHTML = '';
  if (favoritas.length) {
    favoritas.forEach((grupo) => {
      const elementoNombre = document.createElement('tr');
      elementoNombre.innerHTML = `
        <td colspan="5" class="date-cell">${grupo.nombre}</td>
      `;
      table.appendChild(elementoNombre);
      grupo.cotizaciones.forEach((cotizacion) => {
        const fecha = new Date(cotizacion.fechaActualizacion)
        const elementoCotizacion = document.createElement('tr');
        elementoCotizacion.innerHTML = `
          <td></td>
          <td>${formatearFechaHora(fecha)}</td>
          <td>$${cotizacion.compra}</td>
          <td>$${cotizacion.venta}</td>
          <td class="text-center"><img src="./img/icons/${cotizacion.tendencia}.svg" alt="${cotizacion.tendencia}"></td>
        `;
        table.appendChild(elementoCotizacion);
      })
    });
  } else {
    const data = document.getElementById("data");
    data.innerHTML = '<h3 class="text-center mt-5rem">No hay cotizaciones favoritas</h3>';
  }
}

mostrarInforme()