
// Initialize the map centered on New Zealand
const map = L.map('map', {
    center: [-41.2, 174.7],
    zoom: 6,
    maxBounds: [
        [-47.5, 166.0], // Southwest
        [-34.0, 179.0]  // Northeast
    ],
    maxBoundsViscosity: 1.0
});

// Add tile layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Add a crosshair locate button with SVG
const locateControl = L.control({ position: 'topright' });

locateControl.onAdd = function (map) {
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    container.innerHTML = `
        <div id="locate-btn" title="Locate Me" style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
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

    // Prevent clicks from propagating to the map
    L.DomEvent.disableClickPropagation(container);
    return container;
};

locateControl.addTo(map);

// Add click handler to trigger geolocation
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('locate-btn').addEventListener('click', function (e) {
        e.preventDefault();
        map.locate({ setView: true, maxZoom: 16 });
    });
});
