var map = L.map('map', {
    backgroundColor: '#1a1a1a',
    zoomControl: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    touchZoom: false,
    boxZoom: false,
    keyboard: false,
    minZoom: 4,
    maxZoom: 4
}).setView([39.8283, -98.5795], 4);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

L.control.scale({
    position: 'bottomleft',
    imperial: true,
    maxWidth: 200
}).addTo(map);

// Full cities array
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
    {name: "Marshfield, MA", lat: 42.0917, lon: -70.7056},  // Added comma here
    {name: "Lenexa, KS", lat: 38.9647, lon: -94.9577},
    {name: "San Antonio, TX", lat: 29.5060, lon: -98.5839},
    {name: "Oviedo, FL", lat: 28.6525, lon: -81.2089},
    {name: "Kalamazoo, MI", lat: 42.2459, lon: -85.5286},
    {name: "Sharon, MA", lat: 42.1118, lon: -71.1789},
    {name: "Underhill, VT", lat: 44.5437, lon: -72.8857},
    {name: "Richmond, KY", lat: 37.7487, lon: -84.2970},
    {name: "Berrien Springs, MI", lat: 41.9467, lon: -86.3389},
    {name: "Chinook Medical Gear, Tulsa, OK", lat: 36.1314, lon: -95.9372},
    {name: "Fort Bragg, NC", lat: 35.1390, lon: -79.0060},
    {name: "Sundance, UT", lat: 40.6558, lon: -110.4110},
    {name: "Washington, DC", lat: 38.8951, lon: -77.0364},
    {name: "Greer, SC", lat: 34.9337, lon: -82.2276},
    {name: "Columbus, GA", lat: 32.492222, lon: -84.940277},
    {name: "Irvine, CA", lat: 33.669445, lon: -117.823059},
    {name: "Dulles, VA", lat: 38.9558, lon: -77.4479},
    {name: "Fulton, MS", lat: 33.9251, lon: -88.4092},
    {name: "Eatontown, NJ", lat: 40.3012, lon: -74.0649},
    {name: "Davie, FL", lat: 26.076477, lon: -80.252113},
    {name: "Cary, NC", lat: 35.7915, lon: -78.7811}
];

// Add glowing dots
cities.forEach(function(city) {
    var glowingDot = L.divIcon({
        className: 'glowing-dot',
        iconSize: [10, 10],
        iconAnchor: [5, 5]
    });

    L.marker([city.lat, city.lon], { icon: glowingDot })
        .bindPopup('<strong>' + city.name + '</strong>', { closeButton: false })
        .addTo(map);
});

// Add GeoJSON states layer
d3.json("https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json").then(function(statesData) {
    var statesWithSales = ["IN", "CA", "NM", "OH", "LA", "NY", "UT", "MA", "PA", "FL", "VA", "SC", "GA", "MS", "NJ", "NC"];
    
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
