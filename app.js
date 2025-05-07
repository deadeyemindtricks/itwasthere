
const map = L.map('map').setView([-42, 172], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);

const markerClusterGroup = L.markerClusterGroup();
map.addLayer(markerClusterGroup);

// Load trail route
fetch('fulltrail.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: '#4d90fe',
        weight: 2,
        opacity: 0.4
      }
    }).addTo(map);
  });

// Load toilets with enhanced drawer
fetch('toiletsontrailtest.geojson')
  .then(res => res.json())
  .then(data => {
    const bounds = L.latLngBounds();

    data.features.forEach(feature => {
      const [lon, lat] = feature.geometry.coordinates;
      const marker = L.marker([lat, lon]);

      marker.on('click', () => {
        const drawer = document.getElementById('toilet-info-drawer');
        drawer.innerHTML = `
          <div class="toilet-popup">
            <h4>Toilet</h4>
            <p class="on-trail"><i class="fa fa-check-circle"></i> Trail proximity coming soon</p>
            <p class="distance"><i class="fa fa-crow"></i> Distance from you coming soon</p>

            ${feature.properties.category ? `<p><strong>Type:</strong> ${feature.properties.category}</p>` : ""}
            ${feature.properties.flushes ? `<p><strong>Flushes:</strong> ${feature.properties.flushes}</p>` : ""}
            ${feature.properties.toiletPaper ? `<p><strong>Toilet paper:</strong> ${feature.properties.toiletPaper}</p>` : ""}
            ${feature.properties.price ? `<p><strong>Price:</strong> ${feature.properties.price}</p>` : ""}
            ${feature.properties.openingHours ? `<p><strong>Open:</strong> ${feature.properties.openingHours}</p>` : ""}
            ${feature.properties.notes ? `<p><strong>Notes:</strong> ${feature.properties.notes}</p>` : ""}
          </div>
        `;
        drawer.classList.remove('hidden');
      });

      markerClusterGroup.addLayer(marker);
      bounds.extend([lat, lon]);
    });

    map.fitBounds(bounds);
  });

// Locate button (SVG control)
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

// Locate button logic
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('locate-btn').addEventListener('click', function (e) {
    e.preventDefault();
    map.locate({ setView: true, maxZoom: 16 });
  });
});

map.on('locationfound', function(e) {
  L.marker(e.latlng).addTo(map).bindPopup("You are here").openPopup();
  L.circle(e.latlng, e.accuracy / 2).addTo(map);
});

map.on('locationerror', () => {
  alert("Couldn't find your location. Location access might be denied.");
});
