// ==========================
// 1) Boot the map
// ==========================
const map = L.map('map', { zoomControl: true, zoomSnap: .25 }).setView([18.7883, 98.9853], 11);

const tilesLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 20, attribution: '&copy; OpenStreetMap & CARTO'
}).addTo(map);
const tilesDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 20, attribution: '&copy; OpenStreetMap & CARTO'
});



const layerUrban = L.layerGroup().addTo(map);
const layerSuburban = L.layerGroup().addTo(map);
const layerRural = L.layerGroup().addTo(map);



function style(feature) {
    const x = parseFloat(feature.properties?.no2);
    let fillColor = '#9ca3af';
    if (!isNaN(x)) {
        if (x < 0.00006317) fillColor = '#16a34a';
        else if (x < 0.00007379) fillColor = '#facc15';
        else if (x < 0.00008632) fillColor = '#f97316';
        else fillColor = '#dc2626'; // แดงสด
    }
    return { fillColor, weight: 1, color: 'white', fillOpacity: 0.65 };
}

const NO2_BREAKS = [0.00006317, 0.00007379, 0.00008632];
const NO2_COLORS = ['#16a34a', '#facc15', '#f97316', '#dc2626'];
const NO2_UNITS = ' ppm';

// สร้าง/อัปเดต Legend (จัดให้อยู่กึ่งกลางในกรอบ)
function renderNO2Legend() {
    const el = document.getElementById('legend');
    if (!el) return;

    const labels = [
        `< ${NO2_BREAKS[0]}`,
        `${NO2_BREAKS[0]} – < ${NO2_BREAKS[1]}`,
        `${NO2_BREAKS[1]} – < ${NO2_BREAKS[2]}`,
        `≥ ${NO2_BREAKS[2]}`
    ];

    el.innerHTML = `
    <div class="legend-title">ช่วงค่า NO₂${NO2_UNITS}</div>
    <div class="legend-items">
      ${labels.map((lab, i) => `
        <div class="legend-row">
          <span class="legend-swatch" style="background:${NO2_COLORS[i]}"></span>
          <span class="legend-label">${lab}${NO2_UNITS}</span>
        </div>
      `).join('')}
    </div>
  `;
}


document.addEventListener('DOMContentLoaded', renderNO2Legend);

function loadByDate(dateStr) {
    if (!dateStr || dateStr.trim().length === 0) return;

    console.log('Load data for date:', dateStr);
    // เคลียร์เลเยอร์เดิม
    layerUrban.clearLayers();
    layerSuburban.clearLayers();
    layerRural.clearLayers();


    loadZoneData(dateStr);
}

async function loadZoneData(dateStr) {
    try {

        const [urbanRes, suburbanRes, ruralRes] = await Promise.all([
            fetch(`/api/no2_7day_forecast_urban/${dateStr}`),
            fetch(`/api/no2_7day_forecast_suburban/${dateStr}`),
            fetch(`/api/no2_7day_forecast_rural/${dateStr}`)
        ]);
        const [urbanData, suburbanData, ruralData] = await Promise.all([
            urbanRes.json(),
            suburbanRes.json(),
            ruralRes.json()
        ]);

        console.log(`Data loaded for ${dateStr}:`, {
            urban: urbanData,
            suburban: suburbanData,
            rural: ruralData
        });


        urbanData.forEach(r => {
            if (r.geom) {
                const feature = {
                    type: 'Feature',
                    geometry: JSON.parse(r.geom),
                    properties: { no2: r.no2 }
                };
                L.geoJSON(feature, {
                    style: style,
                    onEachFeature: function (f, layer) {
                        const val = f.properties.no2;
                        const text = `
                          <b>NO₂</b>: ${val} ppm
                        `;
                        layer.bindPopup(text);
                    }
                }).addTo(layerUrban);
            }
        });


        suburbanData.forEach(r => {
            if (r.geom) {
                const feature = {
                    type: 'Feature',
                    geometry: JSON.parse(r.geom),
                    properties: { no2: r.no2 }
                };
                L.geoJSON(feature, {
                    style: style,
                    onEachFeature: function (f, layer) {
                        const val = f.properties.no2;
                        const text = `
                          <b>NO₂</b>: ${val} ppm
                        `;
                        layer.bindPopup(text);
                    }
                }).addTo(layerSuburban);
            }
        });


        ruralData.forEach(r => {
            if (r.geom) {
                const feature = {
                    type: 'Feature',
                    geometry: JSON.parse(r.geom),
                    properties: { no2: r.no2 }
                };
                L.geoJSON(feature, {
                    style: style,
                    onEachFeature: function (f, layer) {
                        const val = f.properties.no2;
                        const text = `
                          <b>NO₂</b>: ${val} ppm
                        `;
                        layer.bindPopup(text);
                    }
                }).addTo(layerRural);
            }
        });
    } catch (error) {
        console.error('Error loading zone data:', error);
    }
}


let active = 'A';
const sw = document.getElementById('switch');
const btnA = document.getElementById('btnA');
const btnB = document.getElementById('btnB');
const toast = document.getElementById('toast');

function showToast(msg) {
    toast.textContent = msg; toast.style.display = 'block';
    toast.className = 'toast card';
    setTimeout(() => { toast.style.display = 'none'; }, 1400);
}

function setPanel(mode) {
    const title = document.getElementById('panelTitle');
    const desc = document.getElementById('panelDesc');
    if (mode === 'A') {
        title.textContent = 'NO₂ Map · Predicted for NO₂';
        desc.textContent = 'การแสดงผลปริมาณ NO₂ จากการคาดการณ์โดย GEE';
    } else {
        title.textContent = 'NO₂ Map · Predicted for NO₂';
        desc.textContent = 'การแสดงผลปริมาณ NO₂ จากการคาดการณ์โดย GEE';
    }
}

function setActive(next) {
    if (next === active) return;
    active = next;
    sw.setAttribute('data-active', next);
    btnA.setAttribute('aria-selected', next === 'A');
    btnB.setAttribute('aria-selected', next === 'B');

    if (next === 'A') {
        if (map.hasLayer(tilesDark)) map.removeLayer(tilesDark);
        tilesLight.addTo(map);
        setPanel('A'); showToast('');
    } else {
        if (map.hasLayer(tilesLight)) map.removeLayer(tilesLight);
        tilesDark.addTo(map);
        setPanel('B'); showToast('');
    }
}
btnA.addEventListener('click', () => setActive('A'));
btnB.addEventListener('click', () => setActive('B'));
window.addEventListener('keydown', (e) => {
    if (e.key === '1') setActive('A');
    if (e.key === '2') setActive('B');
});


document.addEventListener('DOMContentLoaded', () => {
    let dd = document.getElementById('dd');
    if (dd && dd.value) loadByDate(dd.value);
});


const dd = document.getElementById('dd');
dd.addEventListener('change', () => loadByDate(dd.value));


document.addEventListener('DOMContentLoaded', () => {
    if (dd && dd.value) loadByDate(dd.value);
});

window.CO = {
    show: () => { map.addLayer(layerUrban); map.addLayer(layerSuburban); map.addLayer(layerRural); },
    hide: () => { map.removeLayer(layerUrban); map.removeLayer(layerSuburban); map.removeLayer(layerRural); },
    reload: (date) => loadByDate(date)
};

document.getElementById('landing')?.classList.add('hidden');
document.getElementById('switch')?.setAttribute('data-active', 'A');
document.getElementById('btnA')?.setAttribute('aria-selected', 'true');
document.getElementById('btnB')?.setAttribute('aria-selected', 'false');

document.getElementById('btnHome')?.addEventListener('click', () => {
    window.location.href = '../';
});

