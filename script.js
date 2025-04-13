
// Basic Leaflet map init
const map = L.map('map');
const allBounds = L.latLngBounds();
var corner1 = L.latLng(-29.918, 154.909),
corner2 = L.latLng(-51.429, -165.875),
bounds = L.latLngBounds(corner1, corner2);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  maxZoom: 19
}).addTo(map);

// Distance calculation
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

let walkedDistance = 0;
let unwalkedDistance = 0;
const walkedGroup = L.layerGroup().addTo(map);
const unwalkedGroup = L.layerGroup().addTo(map);

function addLineLayer(url, color, distanceType = null, targetGroup) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      let distanceSum = 0;
      data.features.forEach(feature => {
        if (feature.geometry.type === 'LineString') {
          const coords = feature.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          const polyline = L.polyline(coords, {
            color: color,
            weight: 3
          }).addTo(targetGroup);
          allBounds.extend(polyline.getBounds());
          if (feature.properties?.name) polyline.bindPopup(feature.properties.name);
          if (distanceType) {
            for (let i = 1; i < coords.length; i++) {
              const [lat1, lon1] = coords[i - 1];
              const [lat2, lon2] = coords[i];
              distanceSum += getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);
            }
          }
        }
      });
      if (distanceType === 'walked') walkedDistance += distanceSum;
      if (distanceType === 'unwalked') unwalkedDistance += distanceSum;
      updateDistanceBox();
    });
}

function updateDistanceBox() {
  let box = document.getElementById('distance-box');
  if (!box) {
    box = document.createElement('div');
    box.id = 'distance-box';
    document.body.appendChild(box);
    Object.assign(box.style, {
      position: 'absolute',
      bottom: '10px',
      left: '10px',
      background: '#f8f9fa',
      padding: '10px 14px',
      border: '1px solid #999',
      borderRadius: '6px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#333',
      boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
      pointerEvents: 'none',
      zIndex: 1000
    });
  }
  box.innerHTML = `
    <strong>Walked:</strong> ${(walkedDistance - unwalkedDistance).toFixed(2)} km<br>
    <strong>Unwalked:</strong> ${unwalkedDistance.toFixed(2)} km<br>
    <strong>Total:</strong> ${((walkedDistance - unwalkedDistance) / walkedDistance * 100).toFixed(1)} %
  `;
}

function getIconUrl(type) {
  switch (type) {
    case 'Camping': return 'icons/tent.png';
    case 'Cabin': return 'icons/cabin.png';
    case 'Hostel': return 'icons/hostel.png';
    default: return 'icons/pin.png';
  }
}

const campingGroup = L.layerGroup().addTo(map);
const cabinGroup = L.layerGroup().addTo(map);
const hostelGroup = L.layerGroup().addTo(map);
const companionGroup = L.layerGroup().addTo(map);
let allCompanionMarkers = [];

fetch('data/updated_places.geojson')
  .then(res => res.json())
  .then(data => {
    data.features.forEach(feature => {
      const { name, type, memory, photo, rating, with: companions, facilities } = feature.properties;
      const [lon, lat] = feature.geometry.coordinates;
      const marker = L.marker([lat, lon], {
        icon: L.icon({
          iconUrl: getIconUrl(type),
          iconSize: [24, 24],
          iconAnchor: [12, 24]
        })
      });

      marker.featureCompanions = companions;

      const popupContent = `
        <div style="max-width: 240px;">
          <h4>${name}</h4>
          <img src="${photo}" style="width: 100%; border-radius: 6px; margin-bottom: 8px;" onerror="this.style.display='none'">
          <p><strong>Type:</strong> ${type}</p>
          <p><strong>Memory:</strong> ${memory}</p>
          <p><strong>Rating:</strong> ${'⭐'.repeat(rating)}</p>
          <p><strong>With:</strong> ${companions.join(', ')}</p>
          <p><strong>Facilities:</strong> ${facilities.join(', ')}</p>
        </div>`;

      marker.bindPopup(popupContent);
      allCompanionMarkers.push(marker);
      companionGroup.addLayer(marker);

      if (type === 'Camping') campingGroup.addLayer(marker);
      else if (type === 'Cabin') cabinGroup.addLayer(marker);
      else if (type === 'Hostel') hostelGroup.addLayer(marker);
    });
  });

function addControlPanel() {
  const panel = document.createElement('div');
  panel.id = 'control-panel';
  document.body.appendChild(panel);
  Object.assign(panel.style, {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'white',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontFamily: 'sans-serif',
    fontSize: '14px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    zIndex: 1000
  });

  const companions = ['Soph', 'Katie', 'Kota', 'Naru', 'Liz', 'Kath', 'Jackie', 'Vivienne', 'Emily', 'Mario', 'Lizzie', 'Patrick', 'Becky'];
  const companionCheckboxes = companions.map(name => `<label><input type="checkbox" class="companion-filter" value="${name}" checked> ${name}</label><br>`).join('');

  panel.innerHTML = `
    <label><input type="checkbox" id="toggle-walked" checked> Show Walked</label><br>
    <label><input type="checkbox" id="toggle-unwalked" checked> Show Unwalked</label><br>
    <label><input type="checkbox" id="toggle-distance" checked> Show Distance</label><br>
    <hr>
    <label><input type="checkbox" id="toggle-camping" checked> Show Camping</label><br>
    <label><input type="checkbox" id="toggle-cabins" checked> Show Cabins</label><br>
    <label><input type="checkbox" id="toggle-hostels" checked> Show Hostels</label><br>
    <hr>
    <strong>Filter by Companion</strong><br>${companionCheckboxes}
  `;

  panel.querySelectorAll('input').forEach(el => el.style.pointerEvents = 'auto');

  panel.querySelector('#toggle-walked').addEventListener('change', e => {
    e.target.checked ? walkedGroup.addTo(map) : map.removeLayer(walkedGroup);
  });
  panel.querySelector('#toggle-unwalked').addEventListener('change', e => {
    e.target.checked ? unwalkedGroup.addTo(map) : map.removeLayer(unwalkedGroup);
  });
  panel.querySelector('#toggle-distance').addEventListener('change', e => {
    const box = document.getElementById('distance-box');
    box.style.display = e.target.checked ? 'block' : 'none';
  });
  panel.querySelector('#toggle-camping').addEventListener('change', e => {
    e.target.checked ? campingGroup.addTo(map) : map.removeLayer(campingGroup);
  });
  panel.querySelector('#toggle-cabins').addEventListener('change', e => {
    e.target.checked ? cabinGroup.addTo(map) : map.removeLayer(cabinGroup);
  });
  panel.querySelector('#toggle-hostels').addEventListener('change', e => {
    e.target.checked ? hostelGroup.addTo(map) : map.removeLayer(hostelGroup);
  });

  panel.querySelectorAll('.companion-filter').forEach(input => {
    input.addEventListener('change', () => {
      const selected = [...panel.querySelectorAll('.companion-filter')]
        .filter(i => i.checked)
        .map(i => i.value);

      companionGroup.clearLayers();
      allCompanionMarkers.forEach(marker => {
        const withList = marker.featureCompanions || [];
        if (selected.every(sel => withList.includes(sel))) {
          companionGroup.addLayer(marker);
        }
      });
    });
  });
}

addLineLayer('data/section1full.geojson', 'blue', 'walked', walkedGroup);
addLineLayer('data/unwalkedsofar.geojson', 'red', 'unwalked', unwalkedGroup);

setTimeout(() => {
  map.fitBounds(allBounds, { padding: [50, 50] });
  addControlPanel();
}, 800);
const introOverlay = document.getElementById('intro-overlay');

introOverlay.addEventListener('click', () => {
  introOverlay.style.opacity = 0;
  setTimeout(() => {
    introOverlay.style.display = 'none';
  }, 800); // Matches the CSS transition time
});

