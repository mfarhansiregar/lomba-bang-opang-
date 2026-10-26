/**
 * AGRISMART — SMART FARMING PLATFORM
 * Core Engine & Interactive Script
 * Final Entry for Soedirman Technoporia (S-TECH) 2026
 */

// Global State Keys for LocalStorage
const STORAGE_KEYS = {
    PLANTS: 'agrismart_plants_v1',
    SCHEDULES: 'agrismart_schedules_v1',
    THEME: 'agrismart_theme_v1'
};

// Default Demo Data (Tandai sebagai data demonstrasi jika storage kosong)
const DEMO_PLANTS = [
    { id: 'plant_1', name: 'Tomat Ranti Pot 1', category: 'Sayur Buah', plantDate: '2026-03-01', status: 'Berbunga/Berbuah', waterMl: 350, notes: 'Balkon timur, perlu ajir' },
    { id: 'plant_2', name: 'Bayam Hijau Mikro', category: 'Sayur Daun', plantDate: '2026-03-10', status: 'Tumbuh Subur', waterMl: 200, notes: 'Tray hidroponik wick' },
    { id: 'plant_3', name: 'Cabai Rawit Merah', category: 'Sayur Buah', plantDate: '2026-02-15', status: 'Siap Panen', waterMl: 400, notes: 'Pot diameter 30cm' }
];

const DEMO_SCHEDULES = [
    { id: 'sched_1', plantId: 'plant_1', plantName: 'Tomat Ranti Pot 1', time: '07:00', frequency: 'Setiap Hari', completedToday: false },
    { id: 'sched_2', plantId: 'plant_2', plantName: 'Bayam Hijau Mikro', time: '08:00', frequency: 'Setiap Hari', completedToday: true },
    { id: 'sched_3', plantId: 'plant_3', plantName: 'Cabai Rawit Merah', time: '16:30', frequency: '2 Hari Sekali', completedToday: false }
];

const PLANT_CATALOG = [
    { id: 'cat_1', name: 'Cabai Rawit / Merah', category: 'Sayur Buah', duration: '70-90 Hari', water: '300-500 ml/hari', sun: 'Penuh (6+ jam)', desc: 'Siapkan media tanah gembur berhumus. Siram teratur tanpa menggenang.', icon: 'fa-pepper-hot' },
    { id: 'cat_2', name: 'Tomat Ranti', category: 'Sayur Buah', duration: '60-75 Hari', water: '400-600 ml/hari', sun: 'Penuh', desc: 'Membutuhkan penopang ajir bambu saat mulai berbuah.', icon: 'fa-apple-whole' },
    { id: 'cat_3', name: 'Bayam Hijau', category: 'Sayur Daun', duration: '20-30 Hari', water: '150-250 ml/hari', sun: 'Sedang', desc: 'Tanaman cepat panen, cocok untuk konsumsi harian keluarga.', icon: 'fa-leaf' },
    { id: 'cat_4', name: 'Selada Keriting', category: 'Sayur Daun', duration: '30-45 Hari', water: '200 ml/hari', sun: 'Sedang', desc: 'Sangat cocok untuk media air/hidroponik di area teras.', icon: 'fa-bowl-rice' },
    { id: 'cat_5', name: 'Kangkung Darat', category: 'Sayur Daun', duration: '25-35 Hari', water: '300 ml/hari', sun: 'Penuh', desc: 'Toleran air tinggi dan mudah tumbuh bagi pemula.', icon: 'fa-seedling' },
    { id: 'cat_6', name: 'Terong Ungu', category: 'Sayur Buah', duration: '75-90 Hari', water: '500 ml/hari', sun: 'Penuh', desc: 'Membutuhkan wadah pot sedang-besar dan pupuk organik teratur.', icon: 'fa-egg' }
];

// Inisialisasi Aplikasi
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initStorage();
    setupEventListeners();
    renderDashboard();
    renderPlantsList();
    renderSchedulesTable();
    renderCatalog();
});

// Helper Storage
function getStorageData(key, fallback) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
}

function setStorageData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.PLANTS)) {
        setStorageData(STORAGE_KEYS.PLANTS, DEMO_PLANTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCHEDULES)) {
        setStorageData(STORAGE_KEYS.SCHEDULES, DEMO_SCHEDULES);
    }
}

// System Switch Tab Navigation
function switchTab(tabId) {
    document.querySelectorAll('.tab-view').forEach(view => view.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));

    const targetView = document.getElementById(`view-${tabId}`);
    const targetNav = document.querySelector(`.nav-link[data-tab="${tabId}"]`);

    if (targetView) targetView.classList.add('active');
    if (targetNav) targetNav.classList.add('active');

    // Close mobile menu if open
    document.getElementById('navMenu').classList.remove('active');

    if (tabId === 'dashboard') renderDashboard();
}

// Dark Mode Toggle Logic
function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light-theme';
    document.body.className = savedTheme;
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.body.className.includes('dark-theme') ? 'dark-theme' : 'light-theme';
    const newTheme = currentTheme === 'dark-theme' ? 'light-theme' : 'dark-theme';
    document.body.className = newTheme;
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#themeToggleBtn i');
    if (icon) {
        icon.className = theme === 'dark-theme' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
}

// DASHBOARD MODULE & CHART.JS
let categoryChartInstance = null;

function renderDashboard() {
    const plants = getStorageData(STORAGE_KEYS.PLANTS, []);
    const schedules = getStorageData(STORAGE_KEYS.SCHEDULES, []);

    document.getElementById('dashTotalPlants').innerText = plants.length;

    const pendingCount = schedules.filter(s => !s.completedToday).length;
    document.getElementById('dashWateringToday').innerText = pendingCount;
    document.getElementById('dashWateringSub').innerText = `${schedules.length - pendingCount} disiram`;

    // Calculation total water volume
    const totalWaterMl = plants.reduce((sum, p) => sum + (parseInt(p.waterMl) || 250), 0);
    document.getElementById('dashWaterVolume').innerText = `${(totalWaterMl / 1000).toFixed(1)} L`;

    // Render Recent Activities
    const activityContainer = document.getElementById('recentActivityList');
    activityContainer.innerHTML = '';

    if (schedules.length === 0) {
        activityContainer.innerHTML = '<p class="text-muted">Belum ada aktivitas penyiraman.</p>';
    } else {
        schedules.slice(0, 4).forEach(s => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
                <i class="fa-solid ${s.completedToday ? 'fa-circle-check text-green' : 'fa-clock text-amber'}"></i>
                <div style="flex:1;">
                    <strong>${escapeHtml(s.plantName)}</strong>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${s.time} WIB - ${s.frequency}</div>
                </div>
                <span class="plant-badge ${s.completedToday ? 'badge-green' : 'badge-amber'}">
                    ${s.completedToday ? 'Selesai' : 'Pending'}
                </span>
            `;
            activityContainer.appendChild(item);
        });
    }

    // Chart.js Category Distribution
    renderCategoryChart(plants);
}

function renderCategoryChart(plants) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    const categories = ['Sayur Daun', 'Sayur Buah', 'Rempah & Herba', 'Lainnya'];
    const counts = categories.map(cat => plants.filter(p => p.category === cat).length);

    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }

    categoryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: counts,
                backgroundColor: ['#52b788', '#e9c46a', '#3b82f6', '#94a3b8'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// MANAJEMEN TANAMAN (CRUD)
function renderPlantsList() {
    const plants = getStorageData(STORAGE_KEYS.PLANTS, []);
    const search = document.getElementById('plantSearchInput').value.toLowerCase();
    const category = document.getElementById('plantCategoryFilter').value;

    const grid = document.getElementById('plantsGrid');
    grid.innerHTML = '';

    const filtered = plants.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search);
        const matchCat = category === 'ALL' || p.category === category;
        return matchSearch && matchCat;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding: 40px;" class="card">
                <i class="fa-solid fa-leaf text-muted" style="font-size: 3rem; margin-bottom:12px;"></i>
                <p class="text-muted">Tidak ada data tanaman yang ditemukan.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'plant-card';
        card.innerHTML = `
            <div>
                <div class="plant-header">
                    <h3 class="plant-title">${escapeHtml(p.name)}</h3>
                    <span class="plant-badge badge-green">${escapeHtml(p.status)}</span>
                </div>
                <div class="plant-details">
                    <div><i class="fa-solid fa-layer-group"></i> ${escapeHtml(p.category)}</div>
                    <div><i class="fa-solid fa-calendar"></i> Tanam: ${p.plantDate}</div>
                    <div><i class="fa-solid fa-droplet"></i> Air: ${p.waterMl} ml/hari</div>
                    ${p.notes ? `<div><i class="fa-solid fa-sticky-note"></i> ${escapeHtml(p.notes)}</div>` : ''}
                </div>
            </div>
            <div class="plant-actions">
                <button class="btn btn-outline btn-sm" onclick="openEditPlantModal('${p.id}')">
                    <i class="fa-solid fa-pen"></i> Edit
                </button>
                <button class="btn btn-outline btn-sm text-red" onclick="deletePlant('${p.id}')">
                    <i class="fa-solid fa-trash"></i> Hapus
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function openAddPlantModal() {
    document.getElementById('plantForm').reset();
    document.getElementById('formPlantId').value = '';
    document.getElementById('plantModalTitle').innerHTML = '<i class="fa-solid fa-plus-circle"></i> Tambah Tanaman Baru';
    document.getElementById('formPlantDate').valueAsDate = new Date();
    document.getElementById('plantModal').classList.add('active');
}

function openEditPlantModal(id) {
    const plants = getStorageData(STORAGE_KEYS.PLANTS, []);
    const p = plants.find(item => item.id === id);
    if (!p) return;

    document.getElementById('formPlantId').value = p.id;
    document.getElementById('formPlantName').value = p.name;
    document.getElementById('formPlantCategory').value = p.category;
    document.getElementById('formPlantDate').value = p.plantDate;
    document.getElementById('formPlantStatus').value = p.status;
    document.getElementById('formPlantWater').value = p.waterMl;
    document.getElementById('formPlantNotes').value = p.notes || '';

    document.getElementById('plantModalTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Tanaman';
    document.getElementById('plantModal').classList.add('active');
}

function closePlantModal() {
    document.getElementById('plantModal').classList.remove('active');
}

function savePlantForm(event) {
    event.preventDefault();
    const id = document.getElementById('formPlantId').value;
    const name = document.getElementById('formPlantName').value.trim();
    const category = document.getElementById('formPlantCategory').value;
    const plantDate = document.getElementById('formPlantDate').value;
    const status = document.getElementById('formPlantStatus').value;
    const waterMl = document.getElementById('formPlantWater').value;
    const notes = document.getElementById('formPlantNotes').value.trim();

    if (!name) {
        showToast('Nama tanaman wajib diisi!', 'warning');
        return;
    }

    let plants = getStorageData(STORAGE_KEYS.PLANTS, []);

    if (id) {
        // Edit existing
        plants = plants.map(p => p.id === id ? { id, name, category, plantDate, status, waterMl, notes } : p);
        showToast('Data tanaman berhasil diperbarui!');
    } else {
        // Create new
        const newPlant = {
            id: 'plant_' + Date.now(),
            name, category, plantDate, status, waterMl, notes
        };
        plants.push(newPlant);
        showToast('Tanaman baru berhasil ditambahkan!');
    }

    setStorageData(STORAGE_KEYS.PLANTS, plants);
    closePlantModal();
    renderPlantsList();
    renderDashboard();
}

function deletePlant(id) {
    if (confirm('Apakah Anda yakin ingin menghapus tanaman ini dari kebun Anda?')) {
        let plants = getStorageData(STORAGE_KEYS.PLANTS, []);
        plants = plants.filter(p => p.id !== id);
        setStorageData(STORAGE_KEYS.PLANTS, plants);

        // Remove associated schedules
        let schedules = getStorageData(STORAGE_KEYS.SCHEDULES, []);
        schedules = schedules.filter(s => s.plantId !== id);
        setStorageData(STORAGE_KEYS.SCHEDULES, schedules);

        showToast('Tanaman dihapus.');
        renderPlantsList();
        renderSchedulesTable();
        renderDashboard();
    }
}

// JADWAL PENYIRAMAN MODULE
function renderSchedulesTable() {
    const schedules = getStorageData(STORAGE_KEYS.SCHEDULES, []);
    const tbody = document.getElementById('scheduleTableBody');
    tbody.innerHTML = '';

    const pending = schedules.filter(s => !s.completedToday).length;
    document.getElementById('schedTotalCount').innerText = schedules.length;
    document.getElementById('schedPendingCount').innerText = pending;
    document.getElementById('schedDoneCount').innerText = schedules.length - pending;

    if (schedules.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center p-4 text-muted">Belum ada jadwal penyiraman. Klik "+ Tambah Jadwal".</td></tr>';
        return;
    }

    schedules.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <button class="btn ${s.completedToday ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="toggleScheduleStatus('${s.id}')">
                    <i class="fa-solid ${s.completedToday ? 'fa-circle-check' : 'fa-circle'}"></i> 
                    ${s.completedToday ? 'Selesai' : 'Tandai Disiram'}
                </button>
            </td>
            <td><strong>${escapeHtml(s.plantName)}</strong></td>
            <td><i class="fa-regular fa-clock"></i> ${s.time} WIB</td>
            <td>${escapeHtml(s.frequency)}</td>
            <td><i class="fa-solid fa-droplet text-blue"></i> Presisi</td>
            <td>
                <button class="btn btn-outline btn-sm text-red" onclick="deleteSchedule('${s.id}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openAddScheduleModal() {
    const plants = getStorageData(STORAGE_KEYS.PLANTS, []);
    const select = document.getElementById('formSchedPlant');
    select.innerHTML = '';

    if (plants.length === 0) {
        showToast('Tambahkan tanaman terlebih dahulu di tab "Tanaman Saya"', 'warning');
        return;
    }

    plants.forEach(p => {
        select.innerHTML += `<option value="${p.id}">${escapeHtml(p.name)}</option>`;
    });

    document.getElementById('scheduleModal').classList.add('active');
}

function closeScheduleModal() {
    document.getElementById('scheduleModal').classList.remove('active');
}

function saveScheduleForm(event) {
    event.preventDefault();
    const plantId = document.getElementById('formSchedPlant').value;
    const time = document.getElementById('formSchedTime').value;
    const frequency = document.getElementById('formSchedFreq').value;

    const plants = getStorageData(STORAGE_KEYS.PLANTS, []);
    const plant = plants.find(p => p.id === plantId);

    if (!plant) return;

    let schedules = getStorageData(STORAGE_KEYS.SCHEDULES, []);
    const newSchedule = {
        id: 'sched_' + Date.now(),
        plantId,
        plantName: plant.name,
        time,
        frequency,
        completedToday: false
    };

    schedules.push(newSchedule);
    setStorageData(STORAGE_KEYS.SCHEDULES, schedules);

    closeScheduleModal();
    renderSchedulesTable();
    renderDashboard();
    showToast('Jadwal penyiraman berhasil ditambahkan!');
}

function toggleScheduleStatus(id) {
    let schedules = getStorageData(STORAGE_KEYS.SCHEDULES, []);
    schedules = schedules.map(s => {
        if (s.id === id) {
            return { ...s, completedToday: !s.completedToday };
        }
        return s;
    });

    setStorageData(STORAGE_KEYS.SCHEDULES, schedules);
    renderSchedulesTable();
    renderDashboard();
}

function deleteSchedule(id) {
    let schedules = getStorageData(STORAGE_KEYS.SCHEDULES, []);
    schedules = schedules.filter(s => s.id !== id);
    setStorageData(STORAGE_KEYS.SCHEDULES, schedules);
    renderSchedulesTable();
    renderDashboard();
    showToast('Jadwal dihapus.');
}

// INOVASI: SMART GARDEN PLANNER ENGINE
function calculateSmartPlan() {
    const area = parseFloat(document.getElementById('planLandArea').value) || 1;
    const crop = document.getElementById('planCropSelect').value;
    const sunlight = document.getElementById('planSunlight').value;
    const method = document.getElementById('planMethod').value;

    // Database Agronomi Transparan
    const cropSpecs = {
        bayam: { name: 'Bayam Hijau', spacePerPlant: 0.04, waterPerDayL: 0.2, yieldPerPlantKg: 0.15, daysToHarvest: 25 },
        kangkung: { name: 'Kangkung Darat', spacePerPlant: 0.05, waterPerDayL: 0.25, yieldPerPlantKg: 0.2, daysToHarvest: 30 },
        selada: { name: 'Selada Keriting', spacePerPlant: 0.06, waterPerDayL: 0.2, yieldPerPlantKg: 0.18, daysToHarvest: 40 },
        cabai: { name: 'Cabai Merah', spacePerPlant: 0.25, waterPerDayL: 0.45, yieldPerPlantKg: 0.8, daysToHarvest: 80 },
        tomat: { name: 'Tomat Ranti', spacePerPlant: 0.3, waterPerDayL: 0.5, yieldPerPlantKg: 1.2, daysToHarvest: 70 }
    };

    const spec = cropSpecs[crop] || cropSpecs.bayam;

    // Method multiplier (Hidroponik vertikal melipatgandakan populasi per m2)
    let densityMultiplier = 1;
    if (method === 'hydroponic') densityMultiplier = 2.2;
    if (method === 'raisedbed') densityMultiplier = 1.2;

    const capacity = Math.floor((area / spec.spacePerPlant) * densityMultiplier);
    const dailyWater = (capacity * spec.waterPerDayL).toFixed(1);
    const totalYieldKg = (capacity * spec.yieldPerPlantKg).toFixed(1);

    // Food Security Calculation: Rata-rata kebutuhan konsumsi sayur harian keluarga = 0.4 kg/hari
    const monthlyFamilyNeed = 12; // kg/bulan per keluarga 4 orang
    const securityShare = Math.min(100, Math.round((totalYieldKg / monthlyFamilyNeed) * 100));

    // Update UI Results
    document.getElementById('plannerDefaultPrompt').classList.add('hidden');
    document.getElementById('plannerResultsContent').classList.remove('hidden');

    document.getElementById('resCapacity').innerText = `${capacity} pot/titik`;
    document.getElementById('resDailyWater').innerText = `${dailyWater} L`;
    document.getElementById('resHarvestDays').innerText = `${spec.daysToHarvest} Hari`;
    document.getElementById('resYieldKg').innerText = `± ${totalYieldKg} kg`;

    document.getElementById('resImpactText').innerText = 
        `Rencana tanam ini diproyeksikan mampu menyumbang sekitar ${securityShare}% kebutuhan sayuran hijau segar harian keluarga Anda secara mandiri dari lahan seluas ${area} m².`;

    document.getElementById('resSecurityPercent').innerText = `${securityShare}%`;
    document.getElementById('resSecurityFill').style.width = `${securityShare}%`;

    document.getElementById('resMathExplanation').innerHTML = `
        Kapasitas dihitung: (${area} m² / ${spec.spacePerPlant} m²/tanaman) × Koefisien Metode (${densityMultiplier}x).
        Hasil ini adalah estimasi matematis terhitung berdasarkan standar agronomi hortikultura perkotaan.
    `;
}

// KATALOG PANDUAN & FILTER
function renderCatalog(filterCat = 'ALL') {
    const grid = document.getElementById('catalogGrid');
    const search = document.getElementById('guideSearchInput').value.toLowerCase();
    grid.innerHTML = '';

    const filtered = PLANT_CATALOG.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search) || c.desc.toLowerCase().includes(search);
        const matchCat = filterCat === 'ALL' || c.category === filterCat;
        return matchSearch && matchCat;
    });

    filtered.forEach(c => {
        const card = document.createElement('div');
        card.className = 'card p-4';
        card.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                <i class="fa-solid ${c.icon} text-green" style="font-size:2rem;"></i>
                <div>
                    <h3 style="font-size:1.1rem;">${escapeHtml(c.name)}</h3>
                    <span class="plant-badge badge-blue">${escapeHtml(c.category)}</span>
                </div>
            </div>
            <p style="font-size:0.88rem; color:var(--text-muted); margin-bottom:14px;">${escapeHtml(c.desc)}</p>
            <div style="font-size:0.82rem; border-top:1px solid var(--border-color); padding-top:10px; display:flex; flex-direction:column; gap:4px;">
                <div><strong>Estimasi Panen:</strong> ${c.duration} (Perkiraan)</div>
                <div><strong>Kebutuhan Air:</strong> ${c.water}</div>
                <div><strong>Pencahayaan:</strong> ${c.sun}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterGuideCategory(cat, btn) {
    document.querySelectorAll('#guideCategoryPills .pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    renderCatalog(cat);
}

// KALKULATOR AIR SEDERHANA
function runWaterCalculator() {
    const count = parseInt(document.getElementById('calcPlantCount').value) || 0;
    const ml = parseInt(document.getElementById('calcWaterPerPlant').value) || 0;
    const days = parseInt(document.getElementById('calcDays').value) || 1;

    const totalMl = count * ml * days;
    const totalLiters = (totalMl / 1000).toFixed(1);

    document.getElementById('calcResultDisplay').classList.remove('hidden');
    document.getElementById('calcLiterTotal').innerText = `${totalLiters} Liter Air`;
    document.getElementById('calcBreakdownText').innerText = 
        `Kebutuhan total untuk ${count} tanaman selama ${days} hari (dengan asumsi rata-rata ${ml} ml/tanaman/hari).`;
}

// UI UTILITIES & EVENT LISTENERS
function setupEventListeners() {
    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);
    
    document.getElementById('mobileMenuBtn').addEventListener('click', () => {
        document.getElementById('navMenu').classList.toggle('active');
    });
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid ${type === 'warning' ? 'fa-triangle-exclamation text-amber' : 'fa-circle-check text-green'}"></i> ${escapeHtml(message)}`;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}