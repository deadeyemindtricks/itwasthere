
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
  function toRad(x) {
    return x * Math.PI / 180;
  }
  const R = 6371e3;
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

fetch('toilets_full.geojson')
  .then(res => res.json())
  .then(data => {
    const bounds = L.latLngBounds();
    data.features.forEach(feature => {
      const [lon, lat] = feature.geometry.coordinates;
      const customToiletIcon = () => {
        return L.divIcon({
          className: 'custom-toilet-icon',
          html: `
            <div style="background-color: #4d90fe; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-toilet-icon lucide-toilet">
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
            <button id="close-drawer" style="position:absolute; top:8px; right:12px; background:none; border:none; font-size:20px; color:#333; cursor:pointer;">×</button>
            <h4 style="font-weight: bold;">${feature.properties.title || "Toilet"}</h4>

            ${distance !== null ? `
              <p style="color: #1e90ff; font-weight: 500;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bird-icon" style="vertical-align: middle; margin-right: 4px;">
                  <path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/>
                  <path d="m20 7 2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/><path d="M7 18a6 6 0 0 0 3.84-10.61"/>
                </svg>
                ${distance} metres away, as the Tūī flies
              </p>` : ""}

            ${feature.properties['Flush/non-flush'] ? `
              <p><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-toilet-icon" style="vertical-align: middle; margin-right: 4px;"><path d="M7 12h13a1 1 0 0 1 1 1 5 5 0 0 1-5 5h-.598a.5.5 0 0 0-.424.765l1.544 2.47a.5.5 0 0 1-.424.765H5.402a.5.5 0 0 1-.424-.765L7 18"/><path d="M8 18a5 5 0 0 1-5-5V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8"/></svg> ${feature.properties['Flush/non-flush']}</p>` : ""}

            ${feature.properties['Water'] ? `
              <p><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-droplet-icon" style="vertical-align: middle; margin-right: 4px;"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg> ${feature.properties['Water']}</p>` : ""}

            ${feature.properties['category'] ? `
              <p><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house-icon" style="vertical-align: middle; margin-right: 4px;"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> ${feature.properties['category']}</p>` : ""}
          </div>`;
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
  container.innerHTML = \`
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
  \`;
  L.DomEvent.disableClickPropagation(container);
  return container;
};
locateControl.addTo(map);
