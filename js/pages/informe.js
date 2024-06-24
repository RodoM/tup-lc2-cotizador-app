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
console.log(etiquetas)
const favoritas = transformarCotizaciones(JSON.parse(localStorage.getItem("favoritas")) || []);
console.log(favoritas)

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
