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

// Load toilets with enhanced popups
fetch('toiletsbytrailtest.geojson')
  .then(res => res.json())
  .then(data => {
    const bounds = L.latLngBounds();

    data.features.forEach(feature => {
      const [lon, lat] = feature.geometry.coordinates;
      const marker = L.marker([lat, lon]);

      const popupContent = `
        <div class="toilet-popup">
          <h4>Toilet</h4>
          ${feature.properties.onTrail ? 
            `<p class="on-trail"><i class="fa fa-check-circle"></i> On trail</p>` : 
            `<p class="off-trail"><i class="fa fa-road"></i> Off trail</p>`}
          ${feature.properties.distanceFromUser ? 
            `<p class="distance"><i class="fa fa-crow"></i> ${feature.properties.distanceFromUser} km from you</p>` : ""}

          ${feature.properties.category ? `<p><strong>Type:</strong> ${feature.properties.category}</p>` : ""}
          ${feature.properties.flushes ? `<p><strong>Flushes:</strong> ${feature.properties.flushes}</p>` : ""}
          ${feature.properties.toiletPaper ? `<p><strong>Toilet paper:</strong> ${feature.properties.toiletPaper}</p>` : ""}
          ${feature.properties.price ? `<p><strong>Price:</strong> ${feature.properties.price}</p>` : ""}
          ${feature.properties.openingHours ? `<p><strong>Open:</strong> ${feature.properties.openingHours}</p>` : ""}
          ${feature.properties.notes ? `<p><strong>Notes:</strong> ${feature.properties.notes}</p>` : ""}
        </div>
      `;

      marker.bindPopup(popupContent);
      markerClusterGroup.addLayer(marker);
      bounds.extend([lat, lon]);
    });

    map.fitBounds(bounds);
  });

map.locate({ setView: false, maxZoom: 16 });

map.on('locationfound', function(e) {
  L.marker(e.latlng).addTo(map).bindPopup("You are here").openPopup();
  L.circle(e.latlng, e.accuracy / 2).addTo(map);
});

map.on('locationerror', () => {
  alert("Couldn't find your location. Location access might be denied.");
});
