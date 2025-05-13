// Base map setup
const map = L.map('map').setView([-42, 172], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);

let currentUserLocation = null;
map.on('locationfound', function(e) {
  currentUserLocation = e.latlng;
  L.marker(e.latlng).addTo(map).bindPopup("You are here").openPopup();
  L.circle(e.latlng, e.accuracy / 2).addTo(map);
});

function haversineDistance(lat1, lon1, lat2, lon2) {
  function toRad(x) { return x * Math.PI / 180; }
  const R = 6371e3;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Load trail line
fetch('fulltrail.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: '#4d90fe',
        weight: 4,
        opacity: 0.7
      }
    }).addTo(map);
  });

// Layer containers
const layers = {
  toilet: L.layerGroup(),
  waterfountain: L.layerGroup(),
  hut: L.layerGroup(),
  campsite: L.layerGroup()
};

// Drawer logic with icons
function addFeatureToLayer(feature, latlng, type) {
  const marker = L.marker(latlng, { icon: icons[type] });
  marker.on('click', () => {
    const props = feature.properties || {};
    const drawer = document.getElementById('toilet-info-drawer');
    const distance = currentUserLocation ? haversineDistance(latlng.lat, latlng.lng, currentUserLocation.lat, currentUserLocation.lng) : null;

    drawer.innerHTML = `
      <div class="toilet-popup" style="position: relative;">
        <button id="close-drawer" style="position:absolute; top:8px; right:12px; background:none; border:none; font-size:20px; color:#333; cursor:pointer;">×</button>
        <h4>${props.name || props.title || type}</h4>
        ${distance !== null ? `<p style='color: #1e90ff; font-weight: 500;'><svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-bird-icon'><path d='M16 7h.01'/><path d='M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20'/><path d='m20 7 2 .5-2 .5'/><path d='M10 18v3'/><path d='M14 17.75V21'/><path d='M7 18a6 6 0 0 0 3.84-10.61'/></svg> ${distance} metres away, as the Tūī flies</p>` : ""}
        ${props.toilet_type ? `<p><svg class='lucide lucide-toilet-icon' ...></svg> ${props.toilet_type}</p>` : ""}
        ${props.water ? `<p><svg class='lucide lucide-droplet-icon' ...></svg> ${props.water}</p>` : ""}
        ${props.toilet_paper ? `<p><svg class='lucide lucide-leaf-icon' ...></svg> May have toilet paper</p>` : ""}
        ${props.changing_table ? `<p><svg class='lucide lucide-baby-icon' ...></svg> Changing table available</p>` : ""}
        ${props.wheelchair ? `<p><svg class='lucide lucide-accessibility-icon' ...></svg> Wheelchair accessible</p>` : ""}
        ${props.opening_hours ? `<p><svg class='lucide lucide-clock-icon' ...></svg> ${props.opening_hours}</p>` : ""}
      </div>
    `;
    drawer.classList.remove('hidden');
  });
  layers[type].addLayer(marker);
}

function loadLayer(url, type) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      L.geoJSON(data, {
        pointToLayer: (feature, latlng) => addFeatureToLayer(feature, latlng, type)
      }).addTo(layers[type]);
    });
}

loadLayer('publictoilets.geojson', 'toilet');
loadLayer('waterfountains.geojson', 'waterfountain');
loadLayer('huts.geojson', 'hut');
loadLayer('campsites.geojson', 'campsite');

L.control.layers(null, {
  "Public Toilets": layers.toilet,
  "Water Fountains": layers.waterfountain,
  "Huts": layers.hut,
  "Campsites": layers.campsite
}, { collapsed: false }).addTo(map);

Object.values(layers).forEach(layer => map.addLayer(layer));

const locateControl = L.control({ position: 'topright' });
locateControl.onAdd = function(map) {
  const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
  container.innerHTML = `<div id="locate-btn" title="Locate Me" style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer;"><svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-locate-icon'><line x1='2' x2='5' y1='12' y2='12'/><line x1='19' x2='22' y1='12' y2='12'/><line x1='12' x2='12' y1='2' y2='5'/><line x1='12' x2='12' y1='19' y2='22'/><circle cx='12' cy='12' r='7'/></svg></div>`;
  L.DomEvent.disableClickPropagation(container);
  return container;
};
locateControl.addTo(map);

const resetControl = L.control({ position: 'topright' });
resetControl.onAdd = function(map) {
  const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
  container.innerHTML = `<div id="reset-view-btn" title="Reset View" style="width: 30px; height: 30px; margin-top: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer;"><svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-refresh-ccw-icon'><path d='M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'/><path d='M3 3v5h5'/><path d='M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16'/><path d='M16 16h5v5'/></svg></div>`;
  L.DomEvent.disableClickPropagation(container);
  return container;
};
resetControl.addTo(map);

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('reset-view-btn')?.addEventListener('click', function (e) {
    e.preventDefault();
    map.setView([-42, 172], 6);
  });

  document.getElementById('locate-btn')?.addEventListener('click', function (e) {
    e.preventDefault();
    map.locate({ setView: true, maxZoom: 16 });
  });
});

map.on('locationerror', () => {
  alert("Couldn't find your location. Location access might be denied.");
});

document.addEventListener('click', function(e) {
  if (e.target && e.target.id === 'close-drawer') {
    document.getElementById('toilet-info-drawer').classList.add('hidden');
  }
});
