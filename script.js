var map = L.map('map').setView([37.8, -96], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var customIcon = L.icon({
    iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
});

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
    {name: "Haymarket (Weiskopf Ct.), VA", lat: 38.8128, lon: -77.6363}, // Based on ZIP code 20169
    {name: "Crestview, FL", lat: 30.7621, lon: -86.5705},
    {name: "Marshfield, MA", lat: 42.0917, lon: -70.7056}
];

cities.forEach(function(city) {
    L.marker([city.lat, city.lon], {icon: customIcon})
        .addTo(map)
        .bindPopup(city.name);
});

