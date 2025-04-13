// Add companion filter functionality
const companionGroup = L.layerGroup().addTo(map);
let allCompanionMarkers = [];

fetch('data/campsites_with_companions.geojson')
  .then(res => res.json())
  .then(data => {
    data.features.forEach(feature => {
      const [lon, lat] = feature.geometry.coordinates;
      const props = feature.properties;
      const companions = props.with;

      const marker = L.marker([lat, lon], {
        icon: L.icon({
          iconUrl: getIconUrl(props.type),
          iconSize: [24, 24],
          iconAnchor: [12, 24]
        })
      });

      marker.featureCompanions = companions;

      const popupContent = `
        <div style="max-width: 250px;">
          <h4>${props.name}</h4>
          <p><strong>Type:</strong> ${props.type}</p>
          <p><strong>Memory:</strong> ${props.memory}</p>
          <p><strong>With:</strong> ${companions.join(', ')}</p>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(companionGroup);
      allCompanionMarkers.push(marker);
    });
  });

// Filter companion markers based on selected checkboxes
document.addEventListener('change', function (e) {
  if (e.target.classList.contains('toggle-companion')) {
    const selected = Array.from(document.querySelectorAll('.toggle-companion:checked')).map(cb => cb.value);
    companionGroup.clearLayers();

    allCompanionMarkers.forEach(marker => {
      if (marker.featureCompanions.some(name => selected.includes(name))) {
        marker.addTo(companionGroup);
      }
    });
  }
});

function getIconUrl(type) {
  switch (type) {
    case 'Camping': return 'icons/tent.png';
    case 'Cabin': return 'icons/cabin.png';
    case 'Hostel': return 'icons/hostel.png';
    default: return 'icons/pin.png';
  }
}


// Add companion filter functionality
const companionGroup = L.layerGroup().addTo(map);
let allCompanionMarkers = [];

fetch('data/campsites_with_companions.geojson')
  .then(res => res.json())
  .then(data => {
    data.features.forEach(feature => {
      const [lon, lat] = feature.geometry.coordinates;
      const props = feature.properties;
      const companions = props.with;

      const marker = L.marker([lat, lon], {
        icon: L.icon({
          iconUrl: getIconUrl(props.type),
          iconSize: [24, 24],
          iconAnchor: [12, 24]
        })
      });

      marker.featureCompanions = companions;

      const popupContent = `
        <div style="max-width: 250px;">
          <h4>${props.name}</h4>
          <p><strong>Type:</strong> ${props.type}</p>
          <p><strong>Memory:</strong> ${props.memory}</p>
          <p><strong>With:</strong> ${companions.join(', ')}</p>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(companionGroup);
      allCompanionMarkers.push(marker);
    });
  });

// Filter companion markers based on selected checkboxes
document.addEventListener('change', function (e) {
  if (e.target.classList.contains('toggle-companion')) {
    const selected = Array.from(document.querySelectorAll('.toggle-companion:checked')).map(cb => cb.value);
    companionGroup.clearLayers();

    allCompanionMarkers.forEach(marker => {
      if (marker.featureCompanions.some(name => selected.includes(name))) {
        marker.addTo(companionGroup);
      }
    });
  }
});
