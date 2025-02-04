// Initialize map with all zoom interactions disabled
var map = L.map('map', {
    backgroundColor: '#1a1a1a',
    zoomControl: false,          // Remove zoom controls
    scrollWheelZoom: false,      // Disable mouse wheel zoom
    doubleClickZoom: false,      // Disable double-click zoom
    touchZoom: false,            // Disable mobile pinch-zoom
    boxZoom: false,              // Disable shift+click drag zoom
    keyboard: false,             // Disable keyboard navigation
    minZoom: 4,                  // Lock zoom levels
    maxZoom: 4
}).setView([39.8283, -98.5795], 4);

// Add base map layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

// Add scale control (but remove zoom control)
L.control.scale({
    position: 'bottomleft',
    imperial: true,
    maxWidth: 200
}).addTo(map);

// Cities data and markers
var cities = [ /* ... keep your cities array unchanged ... */ ];

cities.forEach(function(city) {
    var glowingDot = L.divIcon({
        className: 'glowing-dot',
        iconSize: [10, 10],
        iconAnchor: [5, 5]
    });

    L.marker([city.lat, city.lon], {icon: glowingDot})
        .bindPopup('<strong>' + city.name + '</strong>', {
            closeButton: false
        })
        .addTo(map);
});

// Add state highlighting
d3.json("https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json").then(function(statesData) {
    var statesWithSales = ["IN", "CA", "NM", "OH", "LA", "NY", "UT", "MA", "PA", "FL", "VA"];
    
    L.geoJSON(statesData, {
        style: function(feature) {
            return {
                fillColor: statesWithSales.includes(feature.properties.postal) ? '#FF5722' : '#1a1a1a',
                weight: 1,
                opacity: 1,
                color: '#333333',
                fillOpacity: 0.7
            };
        }
    }).addTo(map);
});
