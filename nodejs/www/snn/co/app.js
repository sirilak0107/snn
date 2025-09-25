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


// === กลุ่มเลเยอร์แยกตามโซน ===
const layerUrban = L.layerGroup().addTo(map);
const layerSuburban = L.layerGroup().addTo(map);
const layerRural = L.layerGroup().addTo(map);


// === style ของโพลิกอน ===
function style(feature) {
    const x = Number(feature.properties?.co);
    let fillColor = '#9ca3af';
    if (!Number.isNaN(x)) {
        if (x < 0.052) fillColor = '#22c55e';      // เขียว
        else if (x < 0.056) fillColor = '#eab308'; // เหลือง
        else if (x < 0.060) fillColor = '#f97316'; // ส้ม
        else fillColor = '#ef4444';                // แดง
    }
    return { fillColor, weight: 1, color: 'white', fillOpacity: 0.65 };
}

// === ค่าช่วง (breaks) และสีที่ใช้ในแผนที่/legend ให้ตรงกับ style(feature) ===
const CO_BREAKS = [0.052, 0.056, 0.060];
const CO_COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444']; // เขียว, เหลือง, ส้ม, แดง
const CO_UNITS = ' ppm';


// สร้าง/อัปเดต Legend
function renderCOLegend() {
    const el = document.getElementById('legend');
    if (!el) return;

    const labels = [
        `< ${CO_BREAKS[0]}`,
        `${CO_BREAKS[0]} – < ${CO_BREAKS[1]}`,
        `${CO_BREAKS[1]} – < ${CO_BREAKS[2]}`,
        `≥ ${CO_BREAKS[2]}`
    ];

    el.innerHTML = `
    <div class="legend-title">ช่วงค่า CO ${CO_UNITS}</div>
    <div class="legend-items">
      ${labels.map((lab, i) => `
        <div class="legend-row">
          <span class="legend-swatch" style="background:${CO_COLORS[i]}"></span>
          <span class="legend-label">${lab}${CO_UNITS}</span>
        </div>
      `).join('')}
    </div>
  `;
}

// เรียกตอนโหลดหน้าเสร็จ
document.addEventListener('DOMContentLoaded', renderCOLegend);


function loadByDate(dateStr) {
    if (!dateStr || dateStr.trim().length === 0) return;

    console.log('Load data for date:', dateStr);
    // เคลียร์เลเยอร์เดิม
    layerUrban.clearLayers();
    layerSuburban.clearLayers();
    layerRural.clearLayers();

    // โหลดข้อมูลใหม่
    loadZoneData(dateStr);
}

async function loadZoneData(dateStr) {
    try {
        // โหลดข้อมูลจาก API (JSON array ของ {gid, zone, date, co})
        const [urbanRes, suburbanRes, ruralRes] = await Promise.all([
            fetch(`/snn/api/co_urban/${dateStr}`),
            fetch(`/snn/api/co_suburban/${dateStr}`),
            fetch(`/snn/api/co_rural/${dateStr}`)
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
        // สร้าง GeoJSON layer สำหรับแต่ละโซน

        // ==== Urban ====
        urbanData.forEach(r => {
            if (r.geom) {
                const feature = {
                    type: 'Feature',
                    geometry: JSON.parse(r.geom),
                    properties: { co: r.co }
                };
                L.geoJSON(feature, {
                    style: style,
                    onEachFeature: function (f, layer) {
                        const val = parseFloat(f.properties.co);
                        const text = `
                          <b>CO</b>: ${val.toFixed(3)}${CO_UNITS}
                        `;
                        layer.bindPopup(text);
                    }
                }).addTo(layerUrban);
            }
        });

        // ==== Suburban ====
        suburbanData.forEach(r => {
            if (r.geom) {
                const feature = {
                    type: 'Feature',
                    geometry: JSON.parse(r.geom),
                    properties: { co: r.co }
                };
                L.geoJSON(feature, {
                    style: style,
                    onEachFeature: function (f, layer) {
                        const val = parseFloat(f.properties.co);
                        const text = `
                          <b>CO</b>: ${val.toFixed(3)}${CO_UNITS}
                        `;
                        layer.bindPopup(text);
                    }
                }).addTo(layerSuburban);
            }
        });

        // ==== Rural ====
        ruralData.forEach(r => {
            if (r.geom) {
                const feature = {
                    type: 'Feature',
                    geometry: JSON.parse(r.geom),
                    properties: { co: r.co }
                };
                L.geoJSON(feature, {
                    style: style,
                    onEachFeature: function (f, layer) {
                        const val = parseFloat(f.properties.co);
                        const text = `
                          <b>CO</b>: ${val.toFixed(3)}${CO_UNITS}
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



// === Switch A/B: เปลี่ยนเฉพาะ base map และข้อความ panel ===
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
        title.textContent = 'CO Map · From GEE';
        desc.textContent = 'การแสดงผลปริมาณ CO จากข้อมูลจริงของ GEE';
    } else {
        title.textContent = 'CO Map · From GEE';
        desc.textContent = 'การแสดงผลปริมาณ CO จากข้อมูลจริงของ GEE';
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
        setPanel('A'); showToast('Light Mode');
    } else {
        if (map.hasLayer(tilesLight)) map.removeLayer(tilesLight);
        tilesDark.addTo(map);
        setPanel('B'); showToast('Dark Mode');
    }
}
btnA.addEventListener('click', () => setActive('A'));
btnB.addEventListener('click', () => setActive('B'));
window.addEventListener('keydown', (e) => {
    if (e.key === '1') setActive('A');
    if (e.key === '2') setActive('B');
});

// === โหลดครั้งแรกด้วยค่าวันที่เริ่มต้น ===
document.addEventListener('DOMContentLoaded', () => {
    let dd = document.getElementById('dd');
    if (dd && dd.value) loadByDate(dd.value);
});

// ============= 0) เตรียมที่เก็บกริดของแต่ละโซน (โหลดครั้งเดียว) =============

// ============= 1) style ระบายสีจากค่า CO =============
function styleByCO(co) {
    let fillColor = '#9ca3af'; // N/A
    const x = Number(co);
    if (!Number.isNaN(x)) {
        if (x < 0.035) fillColor = '#22c55e';
        else if (x >= 20 && x < 30) fillColor = '#eab308';
        else if (x >= 30 && x < 35) fillColor = '#f97316';
        else if (x >= 35) fillColor = '#ef4444';
    }
    return { fillColor, weight: 1, color: 'white', fillOpacity: 0.65 };
}

// ============= 2) helper: สร้าง index {gid -> recordของวันนั้น} =============
function indexByGidForDate(rows, dateStr) {
    // rows มาจาก API (array ของ {gid, zone, date, CO})
    // เลือกเฉพาะแถวที่ date ตรงกับ dateStr
    const sameDay = rows.filter(r => (r.date ?? '').trim() === dateStr);
    const idx = new Map();
    sameDay.forEach(r => {
        const gid = Number(r.gid);
        if (!Number.isNaN(gid)) idx.set(gid, r);
    });
    return idx;
}


// ============= 5) event เลือกวัน (ใช้ของเดิม) =============
const dd = document.getElementById('dd');
dd.addEventListener('change', () => loadByDate(dd.value));

// ============= 6) โหลดครั้งแรก (ใช้ของเดิม) =============
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
