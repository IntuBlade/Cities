var map = L.map('map', {
    backgroundColor: '#1a1a1a'
}).setView([39.8283, -98.5795], 3);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

L.control.zoom({
    position: 'bottomright'
}).addTo(map);

L.control.scale({
    position: 'bottomleft',
    imperial: true,
    maxWidth: 200
}).addTo(map);

var cities = [
    {name: "Evansville, IN", lat: 38.0412, lon: -87.5217},
    {name: "Santa Fe, NM", lat: 35.6870, lon: -105.9378},
    {name: "Indianapolis, IN", lat: 39.8445, lon: -86.2644},
    {name: "Cordova, CA", lat: 38.5891, lon: -121.2827},
    {name: "Wright Patterson AFB, OH", lat: 39.8051, lon: -84.0486},
    {name: "Baton Rouge, LA", lat: 30.3871, lon: -91.0424},
    {name: "Brooklyn, NY", lat: 40.6782, lon: -73.9442},
    {name: "S. Salt Lake, UT", lat: 40.7074, lon: -111.8894},
    {name: "Turners Falls, MA", lat: 42.5970, lon: -72.5559},
    {name: "Long Beach, CA", lat: 33.7701, lon: -118.1937},
    {name: "Malvern, PA", lat: 40.0362, lon: -75.5130},
    {name: "Fort Lauderdale, FL", lat: 26.1373, lon: -80.1201},
    {name: "Davenport, FL", lat: 28.2653, lon: -81.4928},
    {name: "Davie, FL", lat: 26.0629, lon: -80.2727},
    {name: "Haymarket (Weiskopf Ct.), VA", lat: 38.8128, lon: -77.6363},
    {name: "Crestview, FL", lat: 30.7621, lon: -86.5705},
    {name: "Marshfield, MA", lat: 42.0917, lon: -70.7056}
];

cities.forEach(function(city) {
    var glowingDot = L.divIcon({
        className: 'glowing-dot',
        iconSize: [10, 10],
        iconAnchor: [5, 5]
    });

    var marker = L.marker([city.lat, city.lon], {icon: glowingDot})
        .bindPopup('<strong>' + city.name + '</strong>', {
            closeButton: false
        });
    marker.addTo(map);
});

// Add GeoJSON layer
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
