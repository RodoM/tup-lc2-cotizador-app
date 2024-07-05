const page = document.getElementById('page');
const currenciesList = document.getElementById('currencies');
const updated = document.getElementById('updated_at');
const warningMsg = document.getElementById('warning_msg');

let cotizacionesGeneral = [];

async function consultarCotizaciones() {
  currenciesList.innerHTML = 'Cargando cotizaciones...';
  try {
    const [dls, eur, brl, clp, uyu] = await Promise.all([
      fetch('https://dolarapi.com/v1/dolares').then((res) => res.json()),
      fetch('https://dolarapi.com/v1/cotizaciones/eur').then((res) => res.json()),
      fetch('https://dolarapi.com/v1/cotizaciones/brl').then((res) => res.json()),
      fetch('https://dolarapi.com/v1/cotizaciones/clp').then((res) => res.json()),
      fetch('https://dolarapi.com/v1/cotizaciones/uyu').then((res) => res.json()),
    ]);

    cotizacionesGeneral = [...dls, eur, brl, clp, uyu];
    mostrarCotizaciones(cotizacionesGeneral);
  } catch (error) {
    console.error(error);
    const element = document.createElement('div');
    element.className = 'error';
    element.innerHTML = `
      <span><strong>Error:</strong> Ha ocurrido un error al intentar consultar los datos</span>
    `;
    page.appendChild(element);
  }
}

function filtrarCotizaciones(cotizacion) {
  if (cotizacion === 'Todas') {
    mostrarCotizaciones(cotizacionesGeneral)
  } else if (cotizacion === 'USD') {
    mostrarCotizaciones(cotizacionesGeneral.filter((c) => c.moneda === cotizacion));
  } else {
    mostrarCotizaciones(cotizacionesGeneral.filter((c) => c.nombre === cotizacion));
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
    filtrarCotizaciones(select.value)
  } else {
    warningMsg.style.display = 'block';
    setInterval(() => {
      warningMsg.style.display = 'none';
    }, 2000);
  }
}

const opciones_cotizaciones = [
  { name: 'Todas', value: 'Todas' },
  { name: 'Dolares', value: 'USD' },
  { name: 'Dólar oficial', value: 'Oficial' },
  { name: 'Dólar blue', value: 'Blue' },
  { name: 'Dólar bolsa (MEP)', value: 'Bolsa' },
  { name: 'Dólar cotado con liqui (CCL)', value: 'Contado con liquidación' },
  { name: 'Dólar tarjeta', value: 'Tarjeta' },
  { name: 'Dólar mayorista', value: 'Mayorista' },
  { name: 'Dólar cripto', value: 'Cripto' },

  { name: 'Euro', value: 'Euro' },
  { name: 'Real brasileño', value: 'Real Brasileño' },
  { name: 'Peso chileno', value: 'Peso Chileno' },
  { name: 'Peso uruguayo', value: 'Peso Uruguayo' },
];

const select = document.getElementById('currency_select');

opciones_cotizaciones.forEach((opcion) => {
  const element = document.createElement('option');
  element.textContent = opcion.name;
  element.value = opcion.value;
  select.appendChild(element);
})

select.addEventListener("change", () => filtrarCotizaciones(select.value));

consultarCotizaciones();

const intervalo_minutos = 5 * 60 * 1000;
setInterval(() => consultarCotizaciones(), intervalo_minutos);