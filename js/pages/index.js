const page = document.getElementById('page');
const currenciesList = document.getElementById('currencies');
const updated = document.getElementById('updated_at');
async function consultarCotizaciones(apiURL) {
  // TODO: Agregar loader
  currenciesList.innerHTML = 'Cargando...';
  try {
    let response = await fetch(apiURL).then((res) => res.json());
    if (!Array.isArray(response)) {
      response = [response];
    }
    mostrarCotizaciones(response);
  } catch (error) {
    console.error(error);
    const element = document.createElement('div');
    element.className = 'error';
    element.innerHTML = `
      <span><strong>Error:</strong>Ha ocurrido un error al intentar consultar los datos</span>
    `;
    page.appendChild(element);
  }
}

function formatearFechaHora(date) {
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const año = date.getFullYear();
  const horas = String(date.getHours()).padStart(2, '0');
  const minutos = String(date.getMinutes()).padStart(2, '0');

  return `${dia}/${mes}/${año} ${horas}:${minutos}`;
}
function mostrarCotizaciones(cotizaciones) {
  const date = new Date(cotizaciones[0].fechaActualizacion);
  updated.innerHTML = formatearFechaHora(date);

  currenciesList.innerHTML = '';
  cotizaciones.forEach((cotizacion) => {
    const element = document.createElement('div');
    element.className = 'currency';
    element.innerHTML = `
      <span class="currency-name">${cotizacion.nombre}</span>
      <div class="currency__info">
        <span class="currency__info-label">COMPRA</span>
        <span class="currency__info-value">$${cotizacion.compra}</span>
      </div>
      <div class="currency__info">
        <span class="currency__info-label">VENTA</span>
        <span class="currency__info-value">$${cotizacion.venta}</span>
      </div>
      <button class="cursor-pointer" onclick="agregarFavoritas('${cotizacion.nombre}', '${cotizacion.compra}', '${cotizacion.venta}', '${cotizacion.fechaActualizacion}')">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${enFavoritas(cotizacion.nombre, cotizacion.fechaActualizacion) ? 'darkorange' : 'none'}" stroke="darkorange" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </button>
    `;
    currenciesList.appendChild(element);
  })
}

function enFavoritas(nombre, fechaActualizacion) {
  const favoritas = JSON.parse(localStorage.getItem("favoritas")) || [];
  return favoritas.find((favorita) => favorita.nombre === nombre && favorita.fechaActualizacion === fechaActualizacion) ? true : false;
}

function agregarFavoritas(nombre, compra, venta, fechaActualizacion) {
  let favoritas = JSON.parse(localStorage.getItem("favoritas")) || [];
  if (!enFavoritas(nombre, fechaActualizacion)) {
    favoritas.push({nombre, compra, venta, fechaActualizacion});
    localStorage.setItem("favoritas", JSON.stringify(favoritas));
    consultarCotizaciones(select.value);
  } else {
    alert("La cotización ya se encuentra almacenada con la fecha actual.")
  }
}

const opciones_cotizaciones = [
  { name: 'Todas', url: 'https://dolarapi.com/v1/dolares' },
  { name: 'Dólar oficial', url: 'https://dolarapi.com/v1/dolares/oficial' },
  { name: 'Dólar blue', url: 'https://dolarapi.com/v1/dolares/blue' },
  { name: 'Dólar bolsa (MEP)', url: 'https://dolarapi.com/v1/dolares/bolsa' },
  { name: 'Dólar cotado con liqui (CCL)', url: 'https://dolarapi.com/v1/dolares/contadoconliqui' },
  { name: 'Dólar tarjeta', url: 'https://dolarapi.com/v1/dolares/tarjeta' },
  { name: 'Dólar mayorista', url: 'https://dolarapi.com/v1/dolares/mayorista' },
  { name: 'Dólar cripto', url: 'https://dolarapi.com/v1/dolares/cripto' },

  { name: 'Euro', url: 'https://dolarapi.com/v1/cotizaciones/eur' },
  { name: 'Real brasileño', url: 'https://dolarapi.com/v1/cotizaciones/brl' },
  { name: 'Peso chileno', url: 'https://dolarapi.com/v1/cotizaciones/clp' },
  { name: 'Peso uruguayo', url: 'https://dolarapi.com/v1/cotizaciones/uyu' },
];

const select = document.getElementById('currency_select');

opciones_cotizaciones.forEach((opcion) => {
  const element = document.createElement('option');
  element.textContent = opcion.name;
  element.value = opcion.url;
  select.appendChild(element);
})

select.addEventListener("change", () => consultarCotizaciones(select.value));

consultarCotizaciones(select.value);

// Consultar cotizaciones cada 5 minutos
const intervalo_minutos = 5 * 60 * 1000;
setInterval(() => consultarCotizaciones(select.value), intervalo_minutos);