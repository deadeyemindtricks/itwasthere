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

// Add a crosshair locate button
const locateControl = L.control({ position: 'topright' });

locateControl.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    div.innerHTML = '<a href="#" title="Locate Me" id="locate-btn" style="display: flex; align-items: center; justify-content: center; width: 26px; height: 26px;">📍</a>';
    div.style.cursor = 'pointer';
    return div;
};

locateControl.addTo(map);

// Add click handler to trigger geolocation
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('locate-btn').addEventListener('click', function (e) {
        e.preventDefault();
        map.locate({ setView: true, maxZoom: 16 });
    });
});
