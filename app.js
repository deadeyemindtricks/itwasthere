const map = L.map('map');

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  maxZoom: 19
}).addTo(map);

const toiletCoords = [];
const toiletGroup = L.layerGroup().addTo(map);
const bounds = L.latLngBounds();

fetch('data/toiletsbytrail.geojson')
  .then(res => res.json())
  .then(data => {
    data.features.forEach(feature => {
      const [lon, lat] = feature.geometry.coordinates;
      const tags = feature.properties.tags || {};
      const name = tags.name || 'Toilet';
      const access = tags.access || 'Unknown';
      const fee = tags.fee || 'Unknown';
      const wheelchair = tags.wheelchair === 'yes' ? '✅' : '—';

      const popupContent = `
        <div style="max-width: 200px;">
          <h4>${name}</h4>
          <p><strong>Access:</strong> ${access}</p>
          <p><strong>Fee:</strong> ${fee}</p>
          <p><strong>Wheelchair:</strong> ${wheelchair}</p>
        </div>
      `;

      const marker = L.circleMarker([lat, lon], {
        radius: 6,
        color: '#0077cc',
        fillColor: '#0077cc',
        fillOpacity: 0.85
      }).bindPopup(popupContent);

      marker.addTo(toiletGroup);
      toiletCoords.push({ lat, lon });
      bounds.extend([lat, lon]);
    });

    map.fitBounds(bounds, { padding: [30, 30] });
  });

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

function findNearestToilet(userLat, userLon) {
  let nearest = null;
  let minDist = Infinity;

  toiletCoords.forEach(({ lat, lon }) => {
    const dist = getDistanceFromLatLonInKm(userLat, userLon, lat, lon);
    if (dist < minDist) {
      minDist = dist;
      nearest = { lat, lon, dist };
    }
  });

  return nearest;
}

map.locate({ setView: false, maxZoom: 16 });

map.on('locationfound', function(e) {
  const userLat = e.latlng.lat;
  const userLon = e.latlng.lng;

  L.marker(e.latlng).addTo(map).bindPopup("You are here").openPopup();
  L.circle(e.latlng, e.accuracy / 2).addTo(map);

  const nearest = findNearestToilet(userLat, userLon);
  if (nearest) {
    L.polyline([e.latlng, [nearest.lat, nearest.lon]], {
      color: 'green',
      dashArray: '4',
      weight: 2
    }).addTo(map);

    L.popup()
      .setLatLng([nearest.lat, nearest.lon])
      .setContent(`Nearest toilet: ${nearest.dist.toFixed(2)} km`)
      .openOn(map);
  }
});

map.on('locationerror', () => {
  alert("Couldn't find your location. Location access might be denied.");
});
