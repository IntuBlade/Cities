// script.js
'use strict';

/* =========================
   Base Map (dark, locked)
   ========================= */
var map = L.map('map', {
  zoomControl: true,
  scrollWheelZoom: true,
  doubleClickZoom: true,
  touchZoom: true,
  boxZoom: true,
  keyboard: true,
  minZoom: 2,
  maxZoom: 8
}).setView([39.8283, -98.5795], 4);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap contributors © CARTO',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

L.control.scale({ position: 'bottomleft', imperial: true, maxWidth: 200 }).addTo(map);

/* =========================
   Panes for layered effects
   ========================= */
map.createPane('outlinePane');
map.getPane('outlinePane').classList.add('outline-pane');
map.getPane('outlinePane').style.zIndex = 420;

/* =========================
   Qualitative tiers (no counts)
   ========================= */
const TIER_LABELS = { 5: 'Anchor', 4: 'Strong', 3: 'Established', 2: 'Growing', 1: 'Emerging', 0: '—' };

// Calibrated from sales records export 2026-02-27
const stateTier = {
  // 5 (Anchor) — 200+ units
  KS: 5, NY: 5, TX: 5,

  // 4 (Strong) — 50-199 units
  FL: 4, VA: 4, MO: 4, OK: 4, PA: 4, GA: 4, IL: 4, MA: 4, LA: 4,

  // 3 (Established) — 20-49 units
  KY: 3, NC: 3, CO: 3, WV: 3, OH: 3, AL: 3, AZ: 3, DC: 3,

  // 2 (Growing) — 10-19 units
  IN: 2, CA: 2, SC: 2, UT: 2, WI: 2, MI: 2,

  // 1 (Emerging) — 1-9 units
  NV: 1, AK: 1, MS: 1, TN: 1, ME: 1, NM: 1, ID: 1, WY: 1, AR: 1,
  NH: 1, DE: 1, CT: 1, IA: 1, RI: 1, VT: 1, ND: 1, WA: 1, NE: 1, OR: 1, NJ: 1
};

function getTier(postal) {
  return Object.prototype.hasOwnProperty.call(stateTier, postal) ? stateTier[postal] : 0;
}

/* =========================
   FIPS → Postal mapping
   ========================= */
const fipsToPostal = {
   1:"AL",  2:"AK",  4:"AZ",  5:"AR",  6:"CA",  8:"CO",  9:"CT", 10:"DE", 11:"DC", 12:"FL",
  13:"GA", 15:"HI", 16:"ID", 17:"IL", 18:"IN", 19:"IA", 20:"KS", 21:"KY", 22:"LA", 23:"ME",
  24:"MD", 25:"MA", 26:"MI", 27:"MN", 28:"MS", 29:"MO", 30:"MT", 31:"NE", 32:"NV", 33:"NH",
  34:"NJ", 35:"NM", 36:"NY", 37:"NC", 38:"ND", 39:"OH", 40:"OK", 41:"OR", 42:"PA", 44:"RI",
  45:"SC", 46:"SD", 47:"TN", 48:"TX", 49:"UT", 50:"VT", 51:"VA", 53:"WA", 54:"WV", 55:"WI", 56:"WY"
};

/* =========================
   Draw states (TopoJSON → GeoJSON)
   ========================= */
d3.json('https://unpkg.com/us-atlas@3/states-10m.json').then(function(us) {
  const statesGeo = topojson.feature(us, us.objects.states);

  // Outline + tooltips (nearly invisible, preserves hover)
  const outlineLayer = L.geoJSON(statesGeo, {
    style: { pane: 'outlinePane', fill: false, weight: 0.5, color: 'rgba(255,255,255,0.08)', opacity: 1 },
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
        mouseover: function(e) { const l = e.target; l.setStyle({ weight: 1.2, color: 'rgba(255,255,255,0.2)' }); l.bringToFront(); },
        mouseout:  function(e) { outlineLayer.resetStyle(e.target); }
      });
    }
  }).addTo(map);

  /* =========================
     Anonymized pulsing metro dots
     (snapped to nearby major cities)
     ========================= */
  const metroDots = [
    // === WEST / SOUTHWEST ===
    { name: 'El Cajon CA',          lat: 32.7948, lon: -116.9625, tier: 2 },
    { name: 'Laguna Beach CA',      lat: 33.5427, lon: -117.7854, tier: 1 },
    { name: 'Hollister CA',         lat: 36.8525, lon: -121.4016, tier: 1 },
    { name: 'Downieville CA',       lat: 39.5596, lon: -120.8268, tier: 1 },
    { name: 'Tucson AZ',            lat: 32.2226, lon: -110.9747, tier: 3 },
    { name: 'Salt Lake City UT',    lat: 40.7608, lon: -111.8910, tier: 2 },
    { name: 'Parker CO',            lat: 39.5186, lon: -104.7614, tier: 3 },
    { name: 'Albuquerque NM',       lat: 35.0844, lon: -106.6504, tier: 1 },
    { name: 'Donnelly ID',          lat: 44.7266, lon: -116.0755, tier: 1 },
    { name: 'Spokane WA',           lat: 47.6588, lon: -117.4260, tier: 1 },
    { name: 'Anchorage AK',         lat: 61.2181, lon: -149.9003, tier: 1 },

    // === CENTRAL / PLAINS ===
    { name: 'Kansas City KS',       lat: 39.1141, lon: -94.6275, tier: 5 },
    { name: 'Poplar Bluff MO',      lat: 36.7570, lon: -90.3929, tier: 4 },
    { name: 'Omaha NE',             lat: 41.2565, lon: -95.9345, tier: 1 },
    { name: 'Walcott IA',           lat: 41.5846, lon: -90.7721, tier: 1 },
    { name: 'Fargo ND',             lat: 46.8772, lon: -96.7898, tier: 1 },

    // === MIDWEST ===
    { name: 'Palos Hills IL',       lat: 41.6927, lon: -87.8386, tier: 4 },
    { name: 'Centralia IL',         lat: 38.5253, lon: -89.1334, tier: 2 },
    { name: 'Glendale Heights IL',  lat: 41.9145, lon: -88.0687, tier: 1 },
    { name: 'Rock City IL',         lat: 42.4225, lon: -89.4793, tier: 1 },
    { name: 'Indianapolis IN',      lat: 39.7684, lon: -86.1581, tier: 2 },
    { name: 'Terre Haute IN',       lat: 39.4667, lon: -87.4139, tier: 1 },
    { name: 'Noblesville IN',       lat: 40.0456, lon: -86.0086, tier: 1 },
    { name: 'Oak Creek WI',         lat: 42.8856, lon: -87.8637, tier: 2 },
    { name: 'Reed City MI',         lat: 43.8753, lon: -85.5100, tier: 1 },
    { name: 'Bellaire MI',          lat: 44.9803, lon: -85.2112, tier: 1 },
    { name: 'Maumee OH',            lat: 41.5628, lon: -83.6538, tier: 3 },

    // === SOUTH — TEXAS ===
    { name: 'Waxahachie TX',        lat: 32.3866, lon: -96.8483, tier: 3 },
    { name: 'Alice TX',             lat: 27.7522, lon: -98.0697, tier: 3 },
    { name: 'Rockport TX',          lat: 28.0206, lon: -97.0544, tier: 3 },
    { name: 'Sinton TX',            lat: 28.0364, lon: -97.5092, tier: 2 },
    { name: 'Hidalgo TX',           lat: 26.1003, lon: -98.2631, tier: 2 },
    { name: 'Big Spring TX',        lat: 32.2507, lon: -101.4787, tier: 2 },
    { name: 'San Antonio TX',       lat: 29.4241, lon: -98.4936, tier: 1 },
    { name: 'Pflugerville TX',      lat: 30.4394, lon: -97.6200, tier: 1 },
    { name: 'Livingston TX',        lat: 30.7113, lon: -94.9330, tier: 2 },
    { name: 'Marlin TX',            lat: 31.3063, lon: -96.8981, tier: 2 },
    { name: 'Leonard TX',           lat: 33.3793, lon: -96.2486, tier: 1 },
    { name: 'Brownsville TX',       lat: 25.9017, lon: -97.4975, tier: 1 },
    { name: 'El Paso TX',           lat: 31.7619, lon: -106.4850, tier: 1 },

    // === SOUTH — OKLAHOMA ===
    { name: 'Antlers OK',           lat: 34.2312, lon: -95.6202, tier: 4 },
    { name: 'Tulsa OK',             lat: 36.1540, lon: -95.9928, tier: 3 },
    { name: 'Shawnee OK',           lat: 35.3273, lon: -96.9253, tier: 1 },

    // === SOUTH — LOUISIANA ===
    { name: 'Baton Rouge LA',       lat: 30.4515, lon: -91.1871, tier: 4 },
    { name: 'Deville LA',           lat: 31.3574, lon: -92.1654, tier: 1 },

    // === SOUTH — FLORIDA ===
    { name: 'Odessa FL',            lat: 28.1836, lon: -82.5873, tier: 4 },
    { name: 'Sunrise FL',           lat: 26.1337, lon: -80.1132, tier: 3 },
    { name: 'Jacksonville FL',      lat: 30.3322, lon: -81.6557, tier: 3 },
    { name: 'Tequesta FL',          lat: 26.9592, lon: -80.0935, tier: 3 },
    { name: 'Kissimmee FL',         lat: 28.2920, lon: -81.4076, tier: 3 },
    { name: 'Fort Lauderdale FL',   lat: 26.1224, lon: -80.1373, tier: 2 },
    { name: 'Miami FL',             lat: 25.7617, lon: -80.1918, tier: 2 },
    { name: 'Mayo FL',              lat: 30.0530, lon: -83.1746, tier: 2 },
    { name: 'Naples FL',            lat: 26.1420, lon: -81.7948, tier: 1 },
    { name: 'Monticello FL',        lat: 30.5452, lon: -83.8710, tier: 1 },
    { name: 'Venice FL',            lat: 27.0998, lon: -82.4543, tier: 1 },
    { name: 'Punta Gorda FL',       lat: 26.9298, lon: -82.0454, tier: 1 },

    // === SOUTH — GEORGIA / ALABAMA / MISSISSIPPI ===
    { name: 'Lawrenceville GA',     lat: 33.9562, lon: -83.9880, tier: 2 },
    { name: 'Smyrna GA',            lat: 33.8839, lon: -84.5144, tier: 1 },
    { name: 'Americus GA',          lat: 32.0726, lon: -84.2327, tier: 1 },
    { name: 'Greenville AL',        lat: 31.8296, lon: -86.6178, tier: 3 },
    { name: 'Birmingham AL',        lat: 33.5207, lon: -86.8025, tier: 1 },
    { name: 'Cullman AL',           lat: 34.1748, lon: -86.8436, tier: 1 },
    { name: 'Booneville MS',        lat: 34.6584, lon: -88.5667, tier: 1 },

    // === SOUTH — TENNESSEE / ARKANSAS ===
    { name: 'Murfreesboro TN',      lat: 35.8456, lon: -86.3903, tier: 1 },
    { name: 'Mount Juliet TN',      lat: 36.2001, lon: -86.5186, tier: 1 },
    { name: 'Jonesboro AR',         lat: 35.8423, lon: -90.7043, tier: 1 },

    // === SOUTH — CAROLINAS ===
    { name: 'North Charleston SC',  lat: 32.8546, lon: -79.9748, tier: 2 },
    { name: 'Indian Trail NC',      lat: 35.0768, lon: -80.6692, tier: 1 },
    { name: 'Pinehurst NC',         lat: 35.1957, lon: -79.4695, tier: 1 },

    // === SOUTH — KENTUCKY ===
    { name: 'Somerset KY',          lat: 37.0920, lon: -84.6041, tier: 3 },
    { name: 'Lexington KY',         lat: 38.0406, lon: -84.5037, tier: 2 },
    { name: 'Pikeville KY',         lat: 37.4793, lon: -82.5188, tier: 1 },
    { name: 'Richmond KY',          lat: 37.7479, lon: -84.2947, tier: 1 },

    // === MID-ATLANTIC ===
    { name: 'York PA',              lat: 39.9626, lon: -76.7277, tier: 4 },
    { name: 'Philadelphia PA',      lat: 39.9526, lon: -75.1652, tier: 2 },
    { name: 'Williamsburg VA',      lat: 37.2707, lon: -76.7075, tier: 4 },
    { name: 'Portsmouth VA',        lat: 36.8354, lon: -76.2983, tier: 3 },
    { name: 'Rocky Mount VA',       lat: 37.0046, lon: -79.8920, tier: 1 },
    { name: 'Clintwood VA',         lat: 37.1498, lon: -82.4582, tier: 1 },
    { name: 'Washington DC',        lat: 38.9072, lon: -77.0369, tier: 3 },
    { name: 'New Castle DE',        lat: 39.6621, lon: -75.5663, tier: 1 },

    // === APPALACHIA / WV ===
    { name: 'Hurricane WV',         lat: 38.4326, lon: -82.0202, tier: 2 },
    { name: 'Charleston WV',        lat: 38.3498, lon: -81.6326, tier: 1 },
    { name: 'Ripley WV',            lat: 38.8188, lon: -81.7104, tier: 1 },
    { name: 'St Marys WV',          lat: 39.3918, lon: -81.2048, tier: 1 },

    // === NORTHEAST ===
    { name: 'New York NY',          lat: 40.7128, lon: -74.0060, tier: 5 },
    { name: 'Brooklyn NY',          lat: 40.6782, lon: -73.9442, tier: 5 },
    { name: 'Rome NY',              lat: 43.2128, lon: -75.4557, tier: 4 },
    { name: 'Salt Point NY',        lat: 41.7981, lon: -73.8087, tier: 1 },
    { name: 'Chelmsford MA',        lat: 42.5998, lon: -71.3673, tier: 2 },
    { name: 'Sandwich MA',          lat: 41.7589, lon: -70.4929, tier: 1 },
    { name: 'Lunenburg VT',         lat: 44.4632, lon: -71.6821, tier: 1 },
    { name: 'Greenville RI',        lat: 41.8823, lon: -71.5548, tier: 1 },
    { name: 'Eldersburg CT',        lat: 41.2960, lon: -72.9640, tier: 1 },
    { name: 'Eatontown NJ',         lat: 40.2962, lon: -74.0507, tier: 1 },

    // === NORTHWEST / OTHER ===
    { name: 'Portland OR',          lat: 45.5152, lon: -122.6784, tier: 1 },
    { name: 'Reno NV',              lat: 39.5296, lon: -119.8138, tier: 1 },
    { name: 'Bangor ME',            lat: 44.8012, lon: -68.7778, tier: 1 },
    { name: 'Concord NH',           lat: 43.2081, lon: -71.5376, tier: 1 },
    { name: 'Cheyenne WY',          lat: 41.1400, lon: -104.8202, tier: 1 },

    // === INTERNATIONAL ===
    { name: 'Kyiv, Ukraine',         lat: 50.4501, lon: 30.5234, tier: 1 },
    { name: 'Jerusalem, Israel',     lat: 31.7683, lon: 35.2137, tier: 1 },
    { name: 'Bogota, Colombia',      lat: 4.7110, lon: -74.0721, tier: 1 },
    { name: 'Santiago, Chile',       lat: -33.4489, lon: -70.6693, tier: 1 }
  ];

  function addPulsingDot(pt){
    const icon = L.divIcon({
      className: 'pulse-marker',
      html: '<div class="pulse-dot"></div>',
      iconSize: [14,14],
      iconAnchor: [7,7]
    });
    const m = L.marker([pt.lat, pt.lon], { icon, interactive:true })
      .bindTooltip(
        `<div style="font-weight:700;font-size:12px">${pt.name}</div>`,
        { direction:'top', offset:[0,-8], opacity:0.95, sticky:true }
      );
    m.addTo(map);
  }

  metroDots.forEach(addPulsingDot);

  /* =========================
     Optional: Distributor badges
     (obfuscated, generic pin)
     ========================= */
  const distributors = [
    // Example distributors; add/remove as needed
    { name:'Life-Assist (Region Hub)', lat:38.5891, lon:-121.2827 },
    { name:'Chinook (Region Hub)',     lat:36.1314, lon:-95.9372 }
  ];

  const badgeSvg =
    encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="26" height="36" viewBox="0 0 24 24"><path fill="#FF5722" d="M12 2C7.59 2 4 5.58 4 10c0 5.25 7 12 8 12s8-6.75 8-12c0-4.42-3.58-8-8-8zm0 11.5A3.5 3.5 0 1 1 12 6.5a3.5 3.5 0 0 1 0 7z"/></svg>');
  const badgeIcon = L.icon({
    className: 'badge-pin',
    iconUrl: 'data:image/svg+xml;charset=UTF-8,' + badgeSvg,
    iconSize: [26,36],
    iconAnchor: [13,36],
    popupAnchor: [0,-30]
  });

  distributors.forEach(d => {
    L.marker([d.lat, d.lon], { icon: badgeIcon, pane:'outlinePane' })
      .bindPopup(`<strong>${d.name}</strong><br/><span style="font-size:12px;opacity:.9">Distributor</span>`, { closeButton:false })
      .addTo(map);
  });

  /* =========================
     Snapshot button (PNG)
     ========================= */
  const snapBtn = document.getElementById('btnSnapshot');
  if (snapBtn && window.html2canvas) {
    snapBtn.addEventListener('click', async () => {
      try {
        // Temporarily show legend for snapshot if hidden
        const panel = document.getElementById('legendPanel');
        const toggle = document.getElementById('legendToggle');
        const restore = panel && panel.hasAttribute('hidden');
        if (restore) {
          toggle?.setAttribute('aria-expanded','true');
          panel.removeAttribute('hidden');
          panel.style.display = 'block';
        }

        const canvas = await html2canvas(document.getElementById('map'), {
          useCORS: true,
          backgroundColor: '#0f0f10',
          scale: Math.min(2, window.devicePixelRatio || 1.5)
        });
        const link = document.createElement('a');
        const ts = new Date();
        const stamp = `${ts.getFullYear()}-${String(ts.getMonth()+1).padStart(2,'0')}-${String(ts.getDate()).padStart(2,'0')}`;
        link.download = `IntuBlade_Adoption_US_${stamp}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        // Restore legend hidden state
        if (restore) {
          toggle?.setAttribute('aria-expanded','false');
          panel.setAttribute('hidden','');
          panel.style.display = 'none';
        }
      } catch (e) {
        console.error('Snapshot failed:', e);
        alert('Sorry, could not save a snapshot on this device.');
      }
    });
  }

  /* =========================
     Trust band timestamp override
     ========================= */
  const tsEl = document.getElementById('lastUpdated');
  if (tsEl) {
    // Set to a fixed “content updated” date if you prefer; default is today from HTML.
    // Example: tsEl.textContent = 'Oct 31, 2025';
  }
});
