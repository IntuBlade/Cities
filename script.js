// script.js
'use strict';

/* =========================
   Base Map (dark, locked)
   ========================= */
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

/* =========================
   Panes for layered effects
   ========================= */
map.createPane('glowPane');
map.getPane('glowPane').classList.add('glow-pane');
map.getPane('glowPane').style.zIndex = 410;

map.createPane('outlinePane');
map.getPane('outlinePane').classList.add('outline-pane');
map.getPane('outlinePane').style.zIndex = 420;

/* =========================
   Qualitative tiers (no counts)
   ========================= */
const TIER_LABELS = { 5: 'Anchor', 4: 'Strong', 3: 'Established', 2: 'Growing', 1: 'Emerging', 0: '—' };

// Calibrated from shipment history without exposing numbers (KY included)
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

  // Glow fill layer
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

  // Outline + tooltips
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

  /* =========================
     Anonymized pulsing metro dots
     (snapped to nearby major cities)
     ========================= */
  const metroDots = [
    // West / Southwest
    { name: 'Sacramento CA',   lat: 38.5816, lon: -121.4944, tier: 3 },
    { name: 'Long Beach CA',   lat: 33.7701, lon: -118.1937, tier: 3 },
    { name: 'Irvine CA',       lat: 33.6695, lon: -117.8231, tier: 3 },
    { name: 'Tucson AZ',       lat: 32.2226, lon: -110.9747, tier: 3 },
    { name: 'Salt Lake City UT',lat: 40.7608, lon: -111.8910, tier: 3 },
    { name: 'Sundance UT',     lat: 40.3920, lon: -111.5786, tier: 3 },

    // Central
    { name: 'Indianapolis IN', lat: 39.7684, lon: -86.1581, tier: 3 },
    { name: 'Evansville IN',   lat: 37.9716, lon: -87.5711, tier: 3 },
    { name: 'Kansas City KS',  lat: 39.1141, lon: -94.6275, tier: 2 },
    { name: 'Lenexa KS',       lat: 38.9536, lon: -94.7336, tier: 2 },
    { name: 'Omaha NE',        lat: 41.2565, lon: -95.9345, tier: 3 },
    { name: 'St Louis MO',     lat: 38.6270, lon: -90.1994, tier: 3 },
    { name: 'Milwaukee WI',    lat: 43.0389, lon: -87.9065, tier: 3 },
    { name: 'Kalamazoo MI',    lat: 42.2917, lon: -85.5872, tier: 2 },
    { name: 'Berrien Springs MI', lat: 41.9467, lon: -86.3389, tier: 2 },

    // South
    { name: 'San Antonio TX',  lat: 29.4241, lon: -98.4936, tier: 4 },
    { name: 'Baton Rouge LA',  lat: 30.4515, lon: -91.1871, tier: 4 },
    { name: 'Greer SC',        lat: 34.9387, lon: -82.2271, tier: 3 },
    { name: 'Columbus GA',     lat: 32.4609, lon: -84.9877, tier: 4 },
    { name: 'Fort Lauderdale FL', lat: 26.1224, lon: -80.1373, tier: 4 },
    { name: 'Davie FL',        lat: 26.0765, lon: -80.2521, tier: 4 },
    { name: 'Davenport FL',    lat: 28.1612, lon: -81.6017, tier: 4 },
    { name: 'Crestview FL',    lat: 30.7621, lon: -86.5705, tier: 4 },
    { name: 'Cudjoe Key FL',   lat: 24.6610, lon: -81.4824, tier: 2 },

    // Mid-Atlantic
    { name: 'Dulles VA',       lat: 38.9556, lon: -77.4473, tier: 3 },
    { name: 'Portsmouth VA',   lat: 36.8354, lon: -76.2983, tier: 3 },
    { name: 'Washington DC',   lat: 38.9072, lon: -77.0369, tier: 3 },
    { name: 'Raleigh NC',      lat: 35.7796, lon: -78.6382, tier: 3 },
    { name: 'Cary NC',         lat: 35.7915, lon: -78.7811, tier: 3 },
    { name: 'Fort Liberty/Bragg NC', lat: 35.1416, lon: -79.0080, tier: 3 },
    { name: 'Eatontown NJ',    lat: 40.2962, lon: -74.0507, tier: 1 },
    { name: 'Philadelphia PA (Malvern)', lat: 40.0362, lon: -75.5130, tier: 2 },

    // Northeast
    { name: 'Boston MA (Quincy/Marshfield/Sharon)', lat: 42.3601, lon: -71.0589, tier: 4 },
    { name: 'Turners Falls MA', lat: 42.6048, lon: -72.5559, tier: 3 },
    { name: 'Burlington VT (Underhill)', lat: 44.4759, lon: -73.2121, tier: 1 },
    { name: 'Brooklyn NY',     lat: 40.6782, lon: -73.9442, tier: 5 },
    { name: 'Ridgewood NY',    lat: 40.7001, lon: -73.9057, tier: 5 },

    // Appalachia / OH Valley
    { name: 'Wright-Patterson AFB (Dayton OH)', lat: 39.7797, lon: -84.0658, tier: 3 },
    { name: 'Evansville IN (Scott Twp)', lat: 38.0412, lon: -87.5217, tier: 3 },
    { name: 'Fulton MS',       lat: 34.2665, lon: -88.4003, tier: 1 },
    { name: 'Lexington KY',    lat: 38.0406, lon: -84.5037, tier: 2 } // KY present
  ];

  function addPulsingDot(pt){
    const tier = Math.max(1, Math.min(5, pt.tier|0)); // clamp 1..5
    const icon = L.divIcon({
      className: `pulse-dot t${tier}`,
      iconSize: [10,10],
      iconAnchor: [5,5]
    });
    const m = L.marker([pt.lat, pt.lon], { icon, interactive:true })
      .bindTooltip(
        `<div style="font-weight:700;font-size:12px">${pt.name}</div>
         <div style="font-size:12px;opacity:.9">Status: <strong>${TIER_LABELS[tier]}</strong></div>`,
        { direction:'top', offset:[0,-6], opacity:0.95, sticky:true }
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
