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
// Haversine distance in meters
function haversineDistance(lat1, lon1, lat2, lon2) {
  function toRad(x) {
    return x * Math.PI / 180;
  }
  const R = 6371e3; // metres
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
const markerClusterGroup = L.markerClusterGroup();
map.addLayer(markerClusterGroup);
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
fetch('toilets_enriched.geojson')
  .then(res => res.json())
  .then(data => {
    const bounds = L.latLngBounds();
    data.features.forEach(feature => {
      const [lon, lat] = feature.geometry.coordinates;
      const customToiletIcon = () => {
        return L.divIcon({
          className: 'custom-toilet-icon',
          html: `
            <div style="
              background-color: #4d90fe;
              border-radius: 50%;
              width: 36px;
              height: 36px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="lucide lucide-toilet-icon lucide-toilet">
                <path d="M7 12h13a1 1 0 0 1 1 1 5 5 0 0 1-5 5h-.598a.5.5 0 0 0-.424.765l1.544 2.47a.5.5 0 0 1-.424.765H5.402a.5.5 0 0 1-.424-.765L7 18"/>
                <path d="M8 18a5 5 0 0 1-5-5V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8"/>
              </svg>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -18]
        });
      };
      const marker = L.marker([lat, lon], { icon: customToiletIcon() });
      marker.on('click', () => {
  const drawer = document.getElementById('toilet-info-drawer');
  const distance = currentUserLocation
    ? haversineDistance(lat, lon, currentUserLocation.lat, currentUserLocation.lng)
    : null;

  drawer.innerHTML = `
    <div class="toilet-popup" style="position: relative;">
      <div style="background-color: #1e90ff; color: white; padding: 6px 12px; font-weight: bold; border-top-left-radius: 4px; border-top-right-radius: 4px;">
        When nature's calling, try...
      </div>
      <button id="close-drawer" style="position:absolute; top:8px; right:12px; background:none; border:none; font-size:20px; color:#333; cursor:pointer;">×</button>
      <h4>${feature.properties.name || "Toilet"}</h4>

      ${distance !== null ? `
        <p class="distance" style="color: #1e90ff; font-weight: 500;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="lucide lucide-bird-icon lucide-bird" style="vertical-align: middle; margin-right: 4px;">
            <path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/>
            <path d="m20 7 2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/><path d="M7 18a6 6 0 0 0 3.84-10.61"/>
          </svg>
          ${distance} metres away, as the Tui flies
        </p>` : ""}

      ${feature.properties['Toilet paper'] ? `<p><strong>May have toilet paper</strong></p>` : ""}
      ${feature.properties['Handwashing'] ? `<p><strong>May have handwashing</strong></p>` : ""}
      ${feature.properties['Flush/non-flush'] ? `<p><strong>Type:</strong> ${feature.properties['Flush/non-flush']}</p>` : ""}
      ${feature.properties['Changing table'] ? `<p><strong>Changing table available</strong></p>` : ""}
      ${feature.properties['Wheelchair access'] ? `<p><strong>Wheelchair accessible</strong></p>` : ""}
      ${feature.properties['Opening times'] ? `<p><strong>Open:</strong> ${feature.properties['Opening times']}</p>` : ""}
    </div>
  `;
  drawer.classList.remove('hidden');
});
      markerClusterGroup.addLayer(marker);
      bounds.extend([lat, lon]);
    });
    map.fitBounds(bounds);
  });
const locateControl = L.control({ position: 'topright' });
locateControl.onAdd = function(map) {
  const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
  container.innerHTML = `
    <div id="locate-btn" title="Locate Me" style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-locate-icon lucide-locate">
        <line x1="2" x2="5" y1="12" y2="12"/>
        <line x1="19" x2="22" y1="12" y2="12"/>
        <line x1="12" x2="12" y1="2" y2="5"/>
        <line x1="12" x2="12" y1="19" y2="22"/>
        <circle cx="12" cy="12" r="7"/>
      </svg>
    </div>
  `;
  L.DomEvent.disableClickPropagation(container);
  return container;
};
locateControl.addTo(map);

const resetControl = L.control({ position: 'topright' });

resetControl.onAdd = function(map) {
  const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
  container.innerHTML = `
    <div id="reset-view-btn" title="Reset View" style="width: 30px; height: 30px; margin-top: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-ccw-icon lucide-refresh-ccw">
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
        <path d="M16 16h5v5"/>
      </svg>
    </div>
  `;
  L.DomEvent.disableClickPropagation(container);
  return container;
};

resetControl.addTo(map);

document.addEventListener('DOMContentLoaded', function () {

const header = document.createElement('div');
header.style.cssText = "position: absolute; top: 0; width: 100%; background: white; color: black; text-align: center; padding: 6px 12px 10px; z-index: 1000; font-family: sans-serif; box-shadow: 0 2px 5px rgba(0,0,0,0.1);";
header.innerHTML = `
  <div style="font-size: 18px; font-weight: bold;">When nature calls...</div>
  <div style="font-size: 14px;">Where to find a loo on New Zealand's Te Araroa trail</div>
`;


  document.getElementById('reset-view-btn').addEventListener('click', function (e) {
    e.preventDefault();
    map.setView([-42, 172], 6);
  });
});
document.addEventListener('DOMContentLoaded', function () {

const header = document.createElement('div');
header.style.cssText = "position: absolute; top: 0; width: 100%; background: white; color: black; text-align: center; padding: 6px 12px 10px; z-index: 1000; font-family: sans-serif; box-shadow: 0 2px 5px rgba(0,0,0,0.1);";
header.innerHTML = `
  <div style="font-size: 18px; font-weight: bold;">When nature calls...</div>
  <div style="font-size: 14px;">Where to find a loo on New Zealand's Te Araroa trail</div>
`;


  document.getElementById('locate-btn').addEventListener('click', function (e) {
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

document.addEventListener('click', function(e) {
  if (e.target && e.target.id === 'close-drawer') {
    document.getElementById('toilet-info-drawer').classList.add('hidden');
  }
});
