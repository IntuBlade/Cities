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

L.control.scale({
  position: 'bottomleft',
  imperial: true,
  maxWidth: 200
}).addTo(map);

// ===== Qualitative tiers (no numbers shown) =====
// Tier 5: Very Strong   → #CC5E00
// Tier 4: Strong        → #FF7A00
// Tier 3: Moderate      → #FFA24D
// Tier 2: Low           → #FFD1A6
// Tier 1: Presence      → #FFEBD6
// Tier 0: None          → #FFFFFF

const TIER_LABELS = {
  5: 'Very Strong',
  4: 'Strong',
  3: 'Moderate',
  2: 'Low',
  1: 'Presence',
  0: 'None'
};

function colorForTier(t) {
  switch (t) {
    case 5: return '#CC5E00';
    case 4: return '#FF7A00';
    case 3: return '#FFA24D';
    case 2: return '#FFD1A6';
    case 1: return '#FFEBD6';
    default: return '#FFFFFF';
  }
}

// ===== Obfuscated state tiers (postal → tier) =====
// Derived from your shipment history, but without exposing counts.
const stateTier = {
  // Tier 5 (Very Strong)
  NY: 5, OK: 5,

  // Tier 4 (Strong)
  GA: 4, MA: 4, LA: 4, TX: 4, FL: 4,

  // Tier 3 (Moderate)
  NC: 3, VA: 3, OH: 3, NE: 3, WV: 3, IN: 3, MO: 3, UT: 3, CA: 3, AZ: 3, DC: 3, WI: 3,

  // Tier 2 (Low)
  PA: 2, NH: 2, SC: 2,

  // Tier 1 (Presence)
  NM: 1, CO: 1, TN: 1, ME: 1, VT: 1, IA: 1, CT: 1, KS: 1, ND: 1, NV: 1,
  MI: 1, IL: 1, OR: 1, AK: 1, MS: 1

  // Others default to Tier 0 (None)
};

// Default tier for any state not listed
function getTier(postal) {
  return stateTier.hasOwnProperty(postal) ? stateTier[postal] : 0;
}

// ===== FIPS → Postal code mapping for us-atlas states =====
const fipsToPostal = {
  1:"AL", 2:"AK", 4:"AZ", 5:"AR", 6:"CA", 8:"CO", 9:"CT", 10:"DE", 11:"DC",
  12:"FL", 13:"GA", 15:"HI", 16:"ID", 17:"IL", 18:"IN", 19:"IA", 20:"KS",
  21:"KY", 22:"LA", 23:"ME", 24:"MD", 25:"MA", 26:"MI", 27:"MN", 28:"MS",
  29:"MO", 30:"MT", 31:"NE", 32:"NV", 33:"NH", 34:"NJ", 35:"NM", 36:"NY",
  37:"NC", 38:"ND", 39:"OH", 40:"OK", 41:"OR", 42:"PA", 44:"RI", 45:"SC",
  46:"SD", 47:"TN", 48:"TX", 49:"UT", 50:"VT", 51:"VA", 53:"WA", 54:"WV",
  55:"WI", 56:"WY"
};

// ===== Load US states (TopoJSON → GeoJSON) =====
// topojson-client is loaded in index.html
d3.json('https://unpkg.com/us-atlas@3/states-10m.json').then(function(us) {
  const statesGeo = topojson.feature(us, us.objects.states);

  function style(feature) {
    const postal = fipsToPostal[feature.id];
    const tier = getTier(postal);
    return {
      fillColor: colorForTier(tier),
      weight: 1.25,
      color: '#000000', // black outline
      opacity: 1,
      fillOpacity: tier === 0 ? 0.0 : (tier >= 5 ? 0.95 : tier === 4 ? 0.9 : tier === 3 ? 0.85 : tier === 2 ? 0.8 : 0.75)
    };
  }

  function onEachFeature(feature, layer) {
    const postal = fipsToPostal[feature.id];
    const name = feature.properties.name;
    const tier = getTier(postal);

    // Qualitative tooltip only (no numbers/ranges)
    layer.bindTooltip(
      `<div style="font-weight:700;font-size:13px;margin-bottom:2px">${name} (${postal || '—'})</div>
       <div style="font-size:12px;opacity:.9">Activity: <strong>${TIER_LABELS[tier]}</strong></div>`,
      { sticky: true, direction: 'auto', opacity: 0.95 }
    );

    layer.on({
      mouseover: function(e) {
        const l = e.target;
        l.setStyle({ weight: 2.5, color: '#000000' });
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
          l.bringToFront();
        }
      },
      mouseout: function(e) {
        geojson.resetStyle(e.target);
      }
    });
  }

  const geojson = L.geoJSON(statesGeo, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map);
});

// ===== Optional: replace legend text to hide numbers =====
(function replaceLegendText(){
  const el = document.getElementById('legend');
  if (!el) return;
  el.innerHTML = `
    <h4>Sales Activity by State</h4>
    <div class="grid">
      <div class="key"><span class="swatch" style="background:#CC5E00;border:1px solid #000"></span>Very Strong</div><div>Highest activity</div>
      <div class="key"><span class="swatch" style="background:#FF7A00;border:1px solid #000"></span>Strong</div><div>High activity</div>
      <div class="key"><span class="swatch" style="background:#FFA24D;border:1px solid #000"></span>Moderate</div><div>Moderate activity</div>
      <div class="key"><span class="swatch" style="background:#FFD1A6;border:1px solid #000"></span>Low</div><div>Some activity</div>
      <div class="key"><span class="swatch" style="background:#FFEBD6;border:1px solid #000"></span>Presence</div><div>Initial presence</div>
      <div class="key"><span class="swatch" style="background:#FFFFFF;border:1px solid #000"></span>None</div><div>No current activity</div>
    </div>
  `;
})();
