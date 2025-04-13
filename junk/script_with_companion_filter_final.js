// Companion filter JS + dynamic marker filtering will be added here manually.

// Inject this HTML into control panel:
/*
<hr>
<details>
  <summary><strong>Filter by Companion</strong></summary>
  <div style="margin-top: 8px; max-height: 200px; overflow-y: auto;">
    <label><input type="checkbox" class="companion-filter" value="Aileen" checked> Aileen</label><br>
<label><input type="checkbox" class="companion-filter" value="Alaskan Mike" checked> Alaskan Mike</label><br>
<label><input type="checkbox" class="companion-filter" value="Becky" checked> Becky</label><br>
<label><input type="checkbox" class="companion-filter" value="Ben" checked> Ben</label><br>
<label><input type="checkbox" class="companion-filter" value="Bronnie" checked> Bronnie</label><br>
<label><input type="checkbox" class="companion-filter" value="Chris" checked> Chris</label><br>
<label><input type="checkbox" class="companion-filter" value="David" checked> David</label><br>
<label><input type="checkbox" class="companion-filter" value="Eline" checked> Eline</label><br>
<label><input type="checkbox" class="companion-filter" value="Emily" checked> Emily</label><br>
<label><input type="checkbox" class="companion-filter" value="Italian Lea" checked> Italian Lea</label><br>
<label><input type="checkbox" class="companion-filter" value="Jackie" checked> Jackie</label><br>
<label><input type="checkbox" class="companion-filter" value="Jo" checked> Jo</label><br>
<label><input type="checkbox" class="companion-filter" value="Joe" checked> Joe</label><br>
<label><input type="checkbox" class="companion-filter" value="Jon" checked> Jon</label><br>
<label><input type="checkbox" class="companion-filter" value="Kath" checked> Kath</label><br>
<label><input type="checkbox" class="companion-filter" value="Katie" checked> Katie</label><br>
<label><input type="checkbox" class="companion-filter" value="Kota" checked> Kota</label><br>
<label><input type="checkbox" class="companion-filter" value="Levi" checked> Levi</label><br>
<label><input type="checkbox" class="companion-filter" value="Liz" checked> Liz</label><br>
<label><input type="checkbox" class="companion-filter" value="Lizzie" checked> Lizzie</label><br>
<label><input type="checkbox" class="companion-filter" value="Louisa" checked> Louisa</label><br>
<label><input type="checkbox" class="companion-filter" value="Lucas" checked> Lucas</label><br>
<label><input type="checkbox" class="companion-filter" value="Lucy" checked> Lucy</label><br>
<label><input type="checkbox" class="companion-filter" value="Mario" checked> Mario</label><br>
<label><input type="checkbox" class="companion-filter" value="Naru" checked> Naru</label><br>
<label><input type="checkbox" class="companion-filter" value="Nicky" checked> Nicky</label><br>
<label><input type="checkbox" class="companion-filter" value="Patrick" checked> Patrick</label><br>
<label><input type="checkbox" class="companion-filter" value="Ryan" checked> Ryan</label><br>
<label><input type="checkbox" class="companion-filter" value="Saskia" checked> Saskia</label><br>
<label><input type="checkbox" class="companion-filter" value="Sophie" checked> Sophie</label><br>
<label><input type="checkbox" class="companion-filter" value="Tom" checked> Tom</label><br>
<label><input type="checkbox" class="companion-filter" value="Vivienne" checked> Vivienne</label><br>
  </div>
</details>
*/

// ... Add your filtering logic and event listeners below



  // Companion filter logic
  const allCompanionMarkers = [];

  function updateCompanionVisibility() {
    const selected = Array.from(document.querySelectorAll('.companion-filter input:checked'))
                          .map(cb => cb.value);

    allCompanionMarkers.forEach(({ marker, companions }) => {
      const match = selected.length === 0 || companions.some(p => selected.includes(p));
      if (match) {
        marker.addTo(map);
      } else {
        map.removeLayer(marker);
      }
    });
  }

  // Fetch and add enriched campsite markers with companion filtering
  fetch('data/campsites.geojson')
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

        if (type === 'Camping') campingGroup.addLayer(marker);
        else if (type === 'Cabin') cabinGroup.addLayer(marker);
        else if (type === 'Hostel') hostelGroup.addLayer(marker);

        allCompanionMarkers.push({ marker, companions });
      });

      updateCompanionVisibility();
    });

  // Bind update on companion filters
  document.querySelectorAll('.companion-filter input').forEach(input => {
    input.addEventListener('change', updateCompanionVisibility);
  });
