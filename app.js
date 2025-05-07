const map = L.map('map').setView([-42, 172], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);

const markerClusterGroup = L.markerClusterGroup();
map.addLayer(markerClusterGroup);

fetch('fulltrail.geojson')
  .then(res => res.json())
  .then(data => {
    const lineOnly = {
      type: "FeatureCollection",
      features: data.features.filter(
        f => f.geometry.type === "LineString" || f.geometry.type === "MultiLineString"
      )
    };

    L.geoJSON(lineOnly, {
      style: {
        color: '#4d90fe',
        weight: 4,
        opacity: 0.4
      }
    }).addTo(map);
  });

fetch('toiletsbytrail.geojson')
  .then(res => res.json())
  .then(data => {
    const bounds = L.latLngBounds();
    data.features.forEach(feature => {
      const [lon, lat] = feature.geometry.coordinates;
      const marker = L.marker([lat, lon]);
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
