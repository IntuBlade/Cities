// script.js
'use strict';

// ===== Base Map (dark, locked view) =====
var map = L.map('map', {
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

L.control.scale({ position: 'bottomleft', imperial: true, maxWidth: 200 }).addTo(map);

// ===== Panes for layered look =====
map.createPane('glowPane');
map.getPane('glowPane').classList.add('glow-pane');
map.getPane('glowPane').style.zIndex = 410;

map.createPane('outlinePane');
map.getPane('outlinePane').classList.add('outline-pane');
map.getPane('outlinePane').style.zIndex = 420;

// ===== Obfuscated qualitative tiers (no counts shown) =====
const TIER_LABELS = { 5: 'Anchor', 4: 'Strong', 3: 'Established', 2: 'Growing', 1: 'Emerging', 0: '—' };

// Calibrated from shipment history without exposing numbers
const stateTier = {
  // 5 (Anchor)
  NY: 5, OK: 5,

  // 4 (Strong)
  GA: 4, MA: 4, LA: 4, TX: 4, FL: 4,

  // 3 (Established)
  NC: 3, VA: 3, OH: 3, NE: 3, WV: 3, IN: 3, MO: 3, UT: 3, CA: 3, AZ: 3, DC: 3, WI: 3,

  // 2 (Growing)
  PA: 2, NH: 2, SC: 2, KY: 2, KS: 2, MI: 2, IL: 2, OR: 2,

  // 1 (Emerging)
  NM: 1, CO: 1, TN: 1, ME: 1, VT: 1, IA: 1, CT: 1, ND: 1, NV: 1, AK: 1, MS: 1, NJ: 1
};

function getTier(postal) {
  return Object.prototype.hasOwnProperty.call(stateTier, postal) ? stateTier[postal] : 0;
}

// Keep hue locked to marker orange (#FF5722); vary opacity only
function fillRGBAForTier(t) {
  switch (t) {
    case 5: return 'rgba(255, 87, 34, 0.90)'; // brightest
    case 4: return 'rgba(255, 87, 34, 0.75)';
    case 3: return 'rgba(255, 87, 34, 0.55)';
    case 2: return 'rgba(255, 87, 34, 0.35)';
    case 1: return 'rgba(255, 87, 34, 0.18)'; // faint
    default: return 'rgba(255, 87, 34, 0.00)'; // invisible
  }
}

// ===== FIPS → Postal code mapping for us-atlas states =====
const fipsToPostal = {
   1:"AL",  2:"AK",  4:"AZ",  5:"AR",  6:"CA",  8:"CO",  9:"CT", 10:"DE", 11:"DC", 12:"FL",
  13:"GA", 15:"HI", 16:"ID", 17:"IL", 18:"IN", 19:"IA", 20:"KS", 21:"KY", 22:"LA", 23:"ME",
  24:"MD", 25:"MA", 26:"MI", 27:"MN", 28:"MS", 29:"MO", 30:"MT", 31:"NE", 32:"NV", 33:"NH",
  34:"NJ", 35:"NM", 36:"NY", 37:"NC", 38:"ND", 39:"OH", 40:"OK", 41:"OR", 42:"PA", 44:"RI",
  45:"SC", 46:"SD", 47:"TN", 48:"TX", 49:"UT", 50:"VT", 51:"VA", 53:"WA", 54:"WV", 55:"WI", 56:"WY"
};

// ===== Load US states (TopoJSON → GeoJSON) =====
// Requires d3 + topojson-client scripts in index.html
d3.json('https://unpkg.com/us-atlas@3/states-10m.json').then(function(us) {
  const statesGeo = topojson.feature(us, us.objects.states);

  // Glow layer (fills with orange at tier-based opacity)
  L.geoJSON(statesGeo, {
    style: function(feature) {
      const postal = fipsToPostal[feature.id];
      const tier = getTier(postal);
      return {
        pane: 'glowPane',
        fillColor: fillRGBAForTier(tier),
        fillOpacity: 1,
        weight: 0,
        color: 'transparent',
        opacity: 0
      };
    }
  }).addTo(map);

  // Outline layer + qualitative tooltip
  const outlineLayer = L.geoJSON(statesGeo, {
    style: { pane: 'outlinePane', fill: false, weight: 1.4, color: '#000000', opacity: 1 },
    onEachFeature: function(feature, layer) {
      const postal = fipsToPostal[feature.id];
      const name = feature.properties.name;
      const tier = getTier(postal);
      const label = TIER_LABELS[tier];

      layer.bindTooltip(
        `<div style="font-weight:700;font-size:13px;margin-bottom:2px">${name} (${postal || '—'})</div>
         <div style="font-size:12px;opacity:.9">Status: <strong>${label}</strong></div>`,
        { sticky: true, direction: 'auto', opacity: 0.95 }
      );

      layer.on({
        mouseover: function(e) { const l = e.target; l.setStyle({ weight: 2.2, color: '#000000' }); l.bringToFront(); },
        mouseout:  function(e) { outlineLayer.resetStyle(e.target); }
      });
    }
  }).addTo(map);
});
