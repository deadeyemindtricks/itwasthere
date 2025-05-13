// Base map setup
const map = L.map('map').setView([-42, 172], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);

// Icons
const icons = {
  toilet: L.divIcon({ className: 'custom-icon toilet-icon', html: '<svg class="lucide" width="20" height="20"><use href="#lucide-toilet"/></svg>' }),
  waterfountain: L.divIcon({ className: 'custom-icon water-icon', html: '<svg class="lucide" width="20" height="20"><use href="#lucide-droplet"/></svg>' }),
  hut: L.divIcon({ className: 'custom-icon hut-icon', html: '<svg class="lucide" width="20" height="20"><use href="#lucide-home"/></svg>' }),
  campsite: L.divIcon({ className: 'custom-icon campsite-icon', html: '<svg class="lucide" width="20" height="20"><use href="#lucide-tent"/></svg>' })
};

// Layer containers
const layers = {
  toilet: L.layerGroup().addTo(map),
  waterfountain: L.layerGroup().addTo(map),
  hut: L.layerGroup().addTo(map),
  campsite: L.layerGroup().addTo(map)
};

// Drawer logic (icons removed)
function addFeatureToLayer(feature, latlng, type) {
  const marker = L.marker(latlng, { icon: icons[type] });
  marker.on('click', () => {
    const props = feature.properties || {};
    const drawer = document.getElementById('toilet-info-drawer');

    let content = `<div class="toilet-popup" style="position: relative;">
      <button id="close-drawer" style="position:absolute; top:8px; right:12px; background:none; border:none; font-size:20px; color:#333; cursor:pointer;">×</button>
      <h4>${props.name || props.title || type}</h4>`;

    if (type === 'waterfountain') {
      content += `
        <p style="color:#1e90ff; font-weight:500;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bird-icon lucide-bird"><path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/><path d="m20 7 2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/><path d="M7 18a6 6 0 0 0 3.84-10.61"/></svg>
          Distance: approx. 200m
        </p>`;
    }

    if (type === 'toilet') {
      if (props.toilet_type) {
        content += `
          <p>
            <svg class="lucide" width="20" height="20"><use href="#lucide-toilet"/></svg>
            ${props.toilet_type}
          </p>`;
      }
      if (props.toilet_paper) {
        content += `
          <p>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-leafy-green-icon"><path d="M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.187-2.353 3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8 3.5 3.5 0 1 0 16 3.05a3.5 3.5 0 0 0-5.831 1.373 3.5 3.5 0 0 0-5.116 3.69 4 4 0 0 0-2.348 6.155C3.499 15.42 4.409 16.712 4.2 18.1 3.926 19.743 3.014 20.732 2 22"/><path d="M2 22 17 7"/></svg>
            Toilet paper available
          </p>`;
      }
      if (props.water) {
        content += `
          <p>
            <svg class="lucide" width="20" height="20"><use href="#lucide-droplet"/></svg>
            ${props.water}
          </p>`;
      }
    }

    if (type === 'hut' || type === 'campsite') {
      if (props.category) {
        content += `<p>${props.category}</p>`;
      }
      if (props.water) {
        content += `
          <p>
            <svg class="lucide" width="20" height="20"><use href="#lucide-droplet"/></svg>
            ${props.water}
          </p>`;
      }
      if (props.toilet_type) {
        content += `
          <p>
            <svg class="lucide" width="20" height="20"><use href="#lucide-toilet"/></svg>
            ${props.toilet_type}
          </p>`;
      }
    }

    content += `</div>`;
    drawer.innerHTML = content;
    drawer.classList.remove('hidden');
  });
  layers[type].addLayer(marker);
}


// Load GeoJSON data into corresponding layers
function loadLayer(url, type) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      L.geoJSON(data, {
        pointToLayer: (feature, latlng) => addFeatureToLayer(feature, latlng, type)
      }).addTo(layers[type]);
    });
}

// Load all layers
loadLayer('publictoilets_clean.geojson', 'toilet');
loadLayer('waterfountains_clean.geojson', 'waterfountain');
loadLayer('huts_clean.geojson', 'hut');
loadLayer('campsites_clean.geojson', 'campsite');

// Trail line
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

// Toggle controls with icons
const toggleContainer = L.control({ position: 'topright' });
toggleContainer.onAdd = function () {
  const div = L.DomUtil.create('div', 'leaflet-bar');
  div.style.display = 'flex';
  div.style.flexDirection = 'column';

  const types = [
    { type: 'toilet', icon: 'toilet' },
    { type: 'waterfountain', icon: 'droplet' },
    { type: 'hut', icon: 'home' },
    { type: 'campsite', icon: 'tent' }
  ];

  types.forEach(({ type, icon }) => {
    const btn = L.DomUtil.create('button', '', div);
    btn.innerHTML = `<svg class="lucide" width="20" height="20"><use href="#lucide-${icon}"/></svg>`;
    btn.style.padding = '6px';
    btn.style.cursor = 'pointer';
    btn.style.background = '#fff';
    btn.style.border = '1px solid #ccc';
    btn.style.opacity = 1;
    btn.setAttribute('title', type);

    btn.addEventListener('click', function () {
      if (map.hasLayer(layers[type])) {
        map.removeLayer(layers[type]);
        btn.style.opacity = 0.4;
      } else {
        map.addLayer(layers[type]);
        btn.style.opacity = 1;
      }
    });
  });

  return div;
};
toggleContainer.addTo(map);

// Drawer close logic
document.addEventListener('click', function (e) {
  if (e.target && e.target.id === 'close-drawer') {
    document.getElementById('toilet-info-drawer').classList.add('hidden');
  }
});
