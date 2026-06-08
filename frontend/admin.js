                                                                                                                                                                                                                                                                                                                                                                                                                                                        // =========================
//   ADMIN PANEL - JAVASCRIPT
// =========================

let allProducts = [];
let allCategories = [];
let allAdminOrders = [];
let currentOrderFilter = 'all';
let editingProductId = null;
let deleteProductId = null;
let currentPage = 1;
let totalPages = 1;
let selectedColors = [];
let currentProductType = 'phone';

// ================= ADMIN SIDEBAR TOGGLE (MOBILE) =================
function toggleAdminSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    const overlay = document.getElementById('admin-sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('mobile-open');
    if (overlay) overlay.classList.toggle('open');
}
// Close sidebar when a tab is clicked on mobile
document.addEventListener('click', function(e) {
    if (e.target.closest('.admin-nav li')) {
        if (window.innerWidth <= 900) {
            const sidebar = document.querySelector('.admin-sidebar');
            const overlay = document.getElementById('admin-sidebar-overlay');
            if (sidebar) sidebar.classList.remove('mobile-open');
            if (overlay) overlay.classList.remove('open');
        }
    }
});

// =========================
//   INITIALIZATION
// =========================
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    loadCategories();
    loadAllProducts();
    loadAdminOrders();
    loadAdminCoupons();
    loadAdminCustomers();
    setupImageUpload();
    setupFormSubmit();
    setupSearch();
    setupOrdersSearch();
    setupCouponForm();
    initTheme();
    updateAuthUI();
});

// ---- Color Picker UI ----
function addColor() {
    const color = document.getElementById('color-picker').value;
    if (!selectedColors.includes(color)) {
        selectedColors.push(color);
        renderSelectedColors();
        updateHiddenColorInput();
    }
}

function removeColor(color) {
    selectedColors = selectedColors.filter(c => c !== color);
    renderSelectedColors();
    updateHiddenColorInput();
}

function renderSelectedColors() {
    const container = document.getElementById('selected-colors-container');
    container.innerHTML = selectedColors.map(c => `
        <div class="color-tag" style="background-color: ${c}; width: 35px; height: 35px; border-radius: 50%; position: relative; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2);" title="${c}" onclick="removeColor('${c}')">
            <span style="position: absolute; top: -5px; right: -5px; background: red; color: white; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 10px;">&times;</span>
        </div>
    `).join('');
}

function updateHiddenColorInput() {
    document.getElementById('prod-color').value = selectedColors.join(',');
}

// ---- Product Type Selector ----
function selectProductType(type) {
    currentProductType = type;
    document.getElementById('prod-product-type').value = type;

    // Toggle active card
    document.getElementById('type-card-phone').classList.toggle('active', type === 'phone');
    document.getElementById('type-card-accessory').classList.toggle('active', type === 'accessory');

    // Toggle sections
    const phoneSection = document.getElementById('phone-specs-section');
    const accSection = document.getElementById('accessory-type-section');

    if (type === 'phone') {
        phoneSection.classList.remove('hidden');
        accSection.style.display = 'none';
        // Clear accessory type
        document.getElementById('prod-accessory-type').value = '';
        document.querySelectorAll('.acc-type-card').forEach(c => c.classList.remove('active'));
    } else {
        phoneSection.classList.add('hidden');
        accSection.style.display = 'block';
        // Clear phone specs
        const specFields = ['screen', 'processor', 'camera', 'battery', 'ram', 'storage', 'os'];
        specFields.forEach(f => { const el = document.getElementById(`prod-${f}`); if (el) el.value = ''; });
        document.getElementById('prod-weight').value = '';
        document.getElementById('prod-sku').value = '';
        document.getElementById('prod-brand').value = '';
    }
}

function selectAccessoryType(type, el) {
    document.getElementById('prod-accessory-type').value = type;
    document.querySelectorAll('.acc-type-card').forEach(c => c.classList.remove('active'));
    if (el) el.classList.add('active');
}

// ---- Check Admin Auth ----
function checkAdminAuth() {
    const token = localStorage.getItem('access');
    if (!token) {
        showToast('يجب تسجيل الدخول كمدير أولاً', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    // Update admin name
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user.name) {
        document.getElementById('admin-name').textContent = `مرحباً، ${user.name}`;
    }
}

function logout() {
    API_BASE.removeItem('currentUser');
    API_BASE.removeItem('access');
    API_BASE.removeItem('refresh');
    window.location.href = 'index.html';
}

// ---- Auth UI ----
function updateAuthUI() {
    const token = localStorage.getItem('access');
    const authArea = document.getElementById('user-auth-area');
    if (token) {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        authArea.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;">
                <a href="profile.html" style="color:var(--navbar-text);font-weight:600;">
                    <i class="fas fa-user-circle"></i> ${user.name || 'حسابي'}
                </a>
            </div>
        `;
    }
}

// =========================
//   THEME
// =========================
function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
        document.body.classList.add('dark-mode');
        const toggle = document.getElementById('theme-toggle');
        if (toggle) toggle.checked = true;
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

function openLoginPage() {
    window.location.href = 'login.html';
}

// =========================
//   TAB NAVIGATION
// =========================
function switchAdminTab(tabName, el) {
    // Hide all tabs
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-nav li').forEach(l => l.classList.remove('active'));

    // Show selected tab
    document.getElementById(`tab-${tabName}`).classList.add('active');
    if (el) el.classList.add('active');

    // Reload products when switching to list
    if (tabName === 'products-list') {
        loadAllProducts();
    }
    if (tabName === 'dashboard') {
        loadAllProducts();
    }
    if (tabName === 'orders') {
        loadAdminOrders();
    }
}

// =========================
//   LOAD CATEGORIES
// =========================
async function loadCategories() {
    try {
        const res = await fetch(`${API_BASE}/products/categories/`);
        const data = await res.json();
        allCategories = data;

        const select = document.getElementById('prod-category');
        select.innerHTML = '<option value="">-- اختر القسم --</option>';
        data.forEach(cat => {
            select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        });

        document.getElementById('total-categories').textContent = data.length;
    } catch (err) {
        console.error('Error loading categories:', err);
        showToast('خطأ في تحميل الأقسام', 'error');
    }
}

// =========================
//   LOAD ALL PRODUCTS
// =========================
async function loadAllProducts(page = 1) {
    try {
        const res = await fetch(`${API_BASE}/products/?page=${page}`);
        const data = await res.json();

        // Handle paginated or non-paginated response
        if (data.results) {
            allProducts = data.results;
            totalPages = Math.ceil(data.count / 10);
            currentPage = page;
        } else if (Array.isArray(data)) {
            allProducts = data;
            totalPages = 1;
            currentPage = 1;
        }

        renderProductsTable(allProducts);
        renderPagination();
        document.getElementById('nav-products-count').textContent = data.count || allProducts.length;

        // Fetch ALL products (no pagination) for accurate dashboard stats
        loadAllProductsForDashboard();

    } catch (err) {
        console.error('Error loading products:', err);
        showToast('خطأ في تحميل المنتجات', 'error');
    }
}

async function loadAllProductsForDashboard() {
    try {
        const res = await fetch(`${API_BASE}/products/`);
        const data = await res.json();
        
        // API now returns all products (no pagination)
        const allProds = Array.isArray(data) ? data : (data.results || []);
        updateStats(allProds.length, allProds);
    } catch (err) {
        console.error('Error loading all products for dashboard:', err);
        updateStats(allProducts.length, allProducts);
    }
}

function updateStats(total, products) {
    document.getElementById('total-products').textContent = total;

    // Fetch all to compute total stock properly
    let totalStock = 0;
    let lowStock = 0;
    let latestCount = 0;
    products.forEach(p => {
        totalStock += p.stock || 0;
        if (p.stock !== undefined && p.stock <= 5) lowStock++;
        if (p.is_latest) latestCount++;
    });
    document.getElementById('total-stock').textContent = totalStock;
    document.getElementById('low-stock').textContent = lowStock;

    // Dashboard extras
    const dashLatest = document.getElementById('dash-latest-count');
    if (dashLatest) dashLatest.textContent = latestCount;

    // Top Products (by price)
    renderDashTopProducts(products);

    // Category Distribution
    renderDashCategoryBars(products);
}

// =========================
//   DASHBOARD RENDERERS
// =========================
function renderDashTopProducts(products) {
    const container = document.getElementById('dash-top-products');
    if (!container) return;

    const sorted = [...products].sort((a, b) => parseFloat(b.price) - parseFloat(a.price)).slice(0, 5);

    if (sorted.length === 0) {
        container.innerHTML = '<div class="dash-empty"><i class="fas fa-box-open"></i><p>لا توجد منتجات</p></div>';
        return;
    }

    const curr = translations[currentLang].currency || 'ج.م';
    container.innerHTML = sorted.map((p, i) => `
        <div class="dash-top-product">
            <div class="rank">${i + 1}</div>
            <img class="product-thumb" src="${p.image || 'https://via.placeholder.com/38x38?text=N/A'}" onerror="this.src='https://via.placeholder.com/38x38?text=N/A'" alt="${p.name}">
            <div class="product-info">
                <div class="name">${p.name}</div>
                <div class="cat">${p.category_name || getCategoryName(p.category)}</div>
            </div>
            <span class="product-price-tag">${formatPrice(p.price)} ${curr}</span>
        </div>
    `).join('');
}

function renderDashCategoryBars(products) {
    const container = document.getElementById('dash-category-bars');
    if (!container) return;

    // Count products per category
    const catMap = {};
    products.forEach(p => {
        const catName = p.category_name || getCategoryName(p.category) || '—';
        catMap[catName] = (catMap[catName] || 0) + 1;
    });

    const cats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    const maxCount = cats.length > 0 ? cats[0][1] : 1;

    if (cats.length === 0) {
        container.innerHTML = '<div class="dash-empty"><i class="fas fa-chart-pie"></i><p>لا توجد بيانات</p></div>';
        return;
    }

    container.innerHTML = cats.map(([name, count]) => {
        const pct = Math.max(8, (count / maxCount) * 100);
        return `
            <div class="dash-cat-bar-item">
                <span class="cat-name">${name}</span>
                <div class="bar-track">
                    <div class="bar-fill" style="width: ${pct}%">${count}</div>
                </div>
                <span class="cat-count">${count}</span>
            </div>
        `;
    }).join('');
}

function renderDashRecentOrders() {
    const container = document.getElementById('dash-recent-orders');
    if (!container) return;

    const recentOrders = allAdminOrders.slice(0, 6);
    if (recentOrders.length === 0) {
        container.innerHTML = '<div class="dash-empty"><i class="fas fa-inbox"></i><p>لا توجد طلبات حتى الآن</p></div>';
        return;
    }

    const statusLabels = currentLang === 'ar' ? STATUS_AR : STATUS_EN;
    const curr = translations[currentLang].currency || 'ج.م';

    container.innerHTML = recentOrders.map(order => {
        const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString(
            currentLang === 'ar' ? 'ar-EG' : 'en-US',
            { month: 'short', day: 'numeric' }
        ) : '---';

        return `
            <div class="dash-order-item" onclick="switchAdminTab('orders', document.querySelector('[data-tab=orders]'))">
                <div class="dash-order-icon ${order.status}">
                    <i class="${STATUS_ICONS[order.status] || 'fas fa-circle'}"></i>
                </div>
                <div class="dash-order-info">
                    <div class="order-id">#${order.id} — ${statusLabels[order.status] || order.status}</div>
                    <div class="order-customer">${order.user_name || ('User #' + order.user)}</div>
                </div>
                <div class="dash-order-meta">
                    <div class="order-price">${formatPrice(order.total_price)} ${curr}</div>
                    <div class="order-date">${dateStr}</div>
                </div>
            </div>
        `;
    }).join('');
}

function updateDashboardOrderStats() {
    const totalEl = document.getElementById('dash-orders-total');
    const pendingEl = document.getElementById('dash-pending-orders');
    const revenueEl = document.getElementById('dash-revenue');

    if (totalEl) totalEl.textContent = allAdminOrders.length;
    if (pendingEl) pendingEl.textContent = allAdminOrders.filter(o => o.status === 'pending').length;

    if (revenueEl) {
        const totalRevenue = allAdminOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
        revenueEl.textContent = formatPrice(totalRevenue);
    }

    renderDashRecentOrders();
    renderDashBestSellers();
    updateCharts();
}

let salesChartInstance = null;
let orderStatusChartInstance = null;

function updateCharts() {
    const salesCtx = document.getElementById('salesChart');
    const statusCtx = document.getElementById('orderStatusChart');

    if (!salesCtx || !statusCtx) return;

    // 1. Sales Over Time (Last 7 Days)
    const salesData = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        salesData[d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0;
    }

    allAdminOrders.forEach(order => {
        if (!order.created_at) return;
        const orderDate = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (salesData[orderDate] !== undefined) {
            salesData[orderDate] += parseFloat(order.total_price || 0);
        }
    });

    if (salesChartInstance) salesChartInstance.destroy();
    salesChartInstance = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: Object.keys(salesData),
            datasets: [{
                label: currentLang === 'ar' ? 'المبيعات (ج.م)' : 'Sales',
                data: Object.values(salesData),
                borderColor: '#00b894',
                backgroundColor: 'rgba(0, 184, 148, 0.2)',
                tension: 0.4,
                fill: true
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // 2. Order Status Distribution
    const statusCounts = { pending: 0, processing: 0, shipped: 0, delivered: 0, completed: 0, cancelled: 0 };
    allAdminOrders.forEach(order => {
        if (statusCounts[order.status] !== undefined) {
            statusCounts[order.status]++;
        }
    });

    const statusLabels = currentLang === 'ar' ? STATUS_AR : STATUS_EN;

    if (orderStatusChartInstance) orderStatusChartInstance.destroy();
    orderStatusChartInstance = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
            labels: [statusLabels.pending, statusLabels.processing, statusLabels.shipped, statusLabels.delivered, statusLabels.cancelled],
            datasets: [{
                data: [statusCounts.pending, statusCounts.processing, statusCounts.shipped, statusCounts.delivered, statusCounts.cancelled],
                backgroundColor: ['#fdcb6e', '#0984e3', '#6c5ce7', '#00b894', '#d63031']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// =========================
//   BEST SELLERS RENDERER
// =========================
function renderDashBestSellers() {
    const container = document.getElementById('dash-best-sellers');
    if (!container) return;

    // Aggregate sold quantities + revenue from all orders
    const productMap = {}; // { productId: { name, image, qty, revenue, cat } }

    allAdminOrders.forEach(order => {
        const items = order.items || [];
        items.forEach(item => {
            const pid = item.product?.id || item.product_id;
            if (!pid) return;

            if (!productMap[pid]) {
                productMap[pid] = {
                    id: pid,
                    name: item.product?.name || 'منتج',
                    image: item.product?.image || null,
                    cat: item.product?.category_name || '',
                    qty: 0,
                    revenue: 0
                };
            }
            productMap[pid].qty += item.quantity || 0;
            productMap[pid].revenue += parseFloat(item.price || 0) * (item.quantity || 0);
        });
    });

    const sorted = Object.values(productMap).sort((a, b) => b.qty - a.qty).slice(0, 5);

    if (sorted.length === 0) {
        container.innerHTML = '<div class="dash-empty"><i class="fas fa-chart-line"></i><p>لا توجد بيانات مبيعات بعد</p></div>';
        return;
    }

    const curr = translations[currentLang]?.currency || 'ج.م';
    const soldLabel = currentLang === 'ar' ? 'قطعة مباعة' : 'sold';

    container.innerHTML = sorted.map((p, i) => `
        <div class="best-seller-item">
            <div class="bs-rank">${i + 1}</div>
            <img class="bs-thumb"
                src="${p.image || 'https://via.placeholder.com/42x42?text=📦'}"
                onerror="this.src='https://via.placeholder.com/42x42?text=📦'"
                alt="${p.name}">
            <div class="bs-info">
                <div class="bs-name">${p.name}</div>
                <div class="bs-qty"><span>${p.qty}</span> ${soldLabel}</div>
            </div>
            <span class="bs-revenue">${formatPrice(p.revenue)} ${curr}</span>
        </div>
    `).join('');
}

// =========================
//   RENDER PRODUCTS TABLE
// =========================
function renderProductsTable(products) {
    const tbody = document.getElementById('all-products-body');

    if (!products || products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-table">
                        <i class="fas fa-box-open"></i>
                        <h3>لا توجد منتجات</h3>
                        <p>ابدأ بإضافة أول منتج لك</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = products.map((p, i) => `
        <tr>
            <td>${(currentPage - 1) * 10 + i + 1}</td>
            <td>
                <img src="${p.image || 'https://via.placeholder.com/55x55?text=No+Image'}"
                     alt="${p.name}" class="table-product-img"
                     onerror="this.src='https://via.placeholder.com/55x55?text=No+Image'">
            </td>
            <td><span class="table-product-name">${p.name}</span></td>
            <td><span class="table-product-cat">${p.category_name || getCategoryName(p.category)}</span></td>
            <td><span class="table-price">${formatPrice(p.price)} ${translations[currentLang].currency}</span></td>
            <td>
                <span class="table-stock ${getStockClass(p.stock)}">
                    ${p.stock} ${getStockLabel(p.stock)}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="edit-btn" title="تعديل" onclick="editProduct(${p.id})">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="delete-btn" title="حذف" onclick="openDeleteModal(${p.id}, '${escapeHtml(p.name)}')">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="star-btn" title="إضافة/إزالة من أحدث المنتجات" onclick="toggleLatestProduct(${p.id}, ${p.is_latest || false})" style="color: ${p.is_latest ? '#ff9900' : '#ccc'}; background: none; font-size: 16px; margin-right: 5px;">
                        <i class="fas fa-star"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderRecentProducts(products) {
    const tbody = document.getElementById('recent-products-body');

    if (!products || products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-table">
                        <i class="fas fa-box-open"></i>
                        <h3>لا توجد منتجات بعد</h3>
                        <p>ابدأ بإضافة أول منتج لك</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = products.map(p => `
        <tr>
            <td>
                <img src="${p.image || 'https://via.placeholder.com/55x55?text=No+Image'}"
                     alt="${p.name}" class="table-product-img"
                     onerror="this.src='https://via.placeholder.com/55x55?text=No+Image'">
            </td>
            <td><span class="table-product-name">${p.name}</span></td>
            <td><span class="table-product-cat">${p.category_name || getCategoryName(p.category)}</span></td>
            <td><span class="table-price">${formatPrice(p.price)} ${translations[currentLang].currency}</span></td>
            <td>
                <span class="table-stock ${getStockClass(p.stock)}">
                    ${p.stock}
                </span>
            </td>
            <td style="font-size:13px;color:#888;">${formatDate(p.created_at)}</td>
            <td>
                <button class="star-btn" title="إضافة/إزالة من أحدث المنتجات" onclick="toggleLatestProduct(${p.id}, ${p.is_latest || false})" style="color: ${p.is_latest ? '#ff9900' : '#ccc'}; background: none; font-size: 16px;">
                    <i class="fas fa-star"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// =========================
//   PAGINATION
// =========================
function renderPagination() {
    const container = document.getElementById('table-pagination');
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="loadAllProducts(${currentPage - 1})"><i class="fas fa-chevron-right"></i></button>`;

    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="loadAllProducts(${i})">${i}</button>`;
    }

    html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="loadAllProducts(${currentPage + 1})"><i class="fas fa-chevron-left"></i></button>`;

    container.innerHTML = html;
}

// =========================
//   DISCOUNT HELPERS
// =========================
function calcDiscount() {
    const price = parseFloat(document.getElementById('prod-price')?.value) || 0;
    const origPrice = parseFloat(document.getElementById('prod-original-price')?.value) || 0;
    const pctEl = document.getElementById('prod-discount-percent');
    const preview = document.getElementById('discount-preview');
    const previewText = document.getElementById('discount-preview-text');

    if (origPrice > 0 && price > 0 && origPrice > price) {
        const pct = Math.round((1 - price / origPrice) * 100);
        if (pctEl) pctEl.value = pct;
        if (preview) preview.style.display = 'flex';
        if (previewText) previewText.textContent = `خصم ${pct}% — توفير ${Math.round(origPrice - price).toLocaleString(currentLang === 'ar' ? 'ar-EG' : 'en-US')} ${translations[currentLang].currency}`;
    } else {
        if (pctEl && !pctEl.value) pctEl.value = '';
        if (preview) preview.style.display = 'none';
    }
}

function calcFromPercent() {
    const pct = parseFloat(document.getElementById('prod-discount-percent')?.value) || 0;
    const origPrice = parseFloat(document.getElementById('prod-original-price')?.value) || 0;
    const priceEl = document.getElementById('prod-price');
    const preview = document.getElementById('discount-preview');
    const previewText = document.getElementById('discount-preview-text');

    if (pct > 0 && pct < 100 && origPrice > 0) {
        const newPrice = Math.round(origPrice * (1 - pct / 100));
        if (priceEl) priceEl.value = newPrice;
        if (preview) preview.style.display = 'flex';
        if (previewText) previewText.textContent = `خصم ${pct}% — السعر الجديد: ${newPrice.toLocaleString(currentLang === 'ar' ? 'ar-EG' : 'en-US')} ${translations[currentLang].currency}`;
    } else {
        if (preview) preview.style.display = 'none';
    }
}

// =========================
//   IMAGE UPLOAD
// =========================
function setupImageUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('prod-image');

    // Drag & Drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragging');
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragging');
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragging');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            previewImage(files[0]);
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            previewImage(e.target.files[0]);
        }
    });
}

function previewImage(file) {
    if (!file.type.startsWith('image/')) {
        showToast('يرجى اختيار ملف صورة صالح', 'error');
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        showToast('حجم الصورة يجب أن يكون أقل من 5MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('image-preview').src = e.target.result;
        document.getElementById('image-preview-container').classList.add('has-image');
        document.getElementById('upload-area').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function removeImage(event) {
    event.stopPropagation();
    document.getElementById('prod-image').value = '';
    document.getElementById('image-preview').src = '';
    document.getElementById('image-preview-container').classList.remove('has-image');
    document.getElementById('upload-area').style.display = 'flex';
}

// =========================
//   FORM SUBMIT (ADD / EDIT)
// =========================
function setupFormSubmit() {
    document.getElementById('product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('prod-name').value.trim();
        const category = document.getElementById('prod-category').value;
        const price = document.getElementById('prod-price').value;
        const originalPrice = document.getElementById('prod-original-price').value;
        const discountPercent = document.getElementById('prod-discount-percent').value || '0';
        const stock = document.getElementById('prod-stock').value;
        const is_latest = document.getElementById('prod-is-latest') ? document.getElementById('prod-is-latest').checked : false;
        const description = document.getElementById('prod-description').value.trim();
        const imageFile = document.getElementById('prod-image').files[0];

        // Product type
        const productType = document.getElementById('prod-product-type').value || 'phone';
        const accessoryType = document.getElementById('prod-accessory-type').value || '';

        // Validate accessory type if product type is accessory
        if (productType === 'accessory' && !accessoryType) {
            showToast('يرجى اختيار نوع الإكسسوار', 'error');
            return;
        }

        // Extra details to append to description
        const color = document.getElementById('prod-color').value.trim();
        const weight = document.getElementById('prod-weight')?.value?.trim() || '';
        const sku = document.getElementById('prod-sku')?.value?.trim() || '';
        const brand = document.getElementById('prod-brand')?.value?.trim() || '';

        // Build full description with extra details
        let fullDescription = description;
        const extras = [];
        if (color) extras.push(`اللون: ${color}`);
        if (weight) extras.push(`الوزن: ${weight}`);
        if (sku) extras.push(`SKU: ${sku}`);
        if (brand) extras.push(`العلامة التجارية: ${brand}`);
        if (extras.length > 0) {
            fullDescription += '\n\n--- مواصفات إضافية ---\n' + extras.join('\n');
        }

        if (!name || !category || !price || !stock || !description) {
            showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        const token = localStorage.getItem('access');
        if (!token) {
            showToast('يجب تسجيل الدخول كمدير', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('category', category);
        formData.append('price', price);
        if (originalPrice) formData.append('original_price', originalPrice);
        formData.append('discount_percent', discountPercent);
        formData.append('stock', stock);
        formData.append('is_latest', is_latest);
        formData.append('description', fullDescription);
        formData.append('product_type', productType);
        if (productType === 'accessory' && accessoryType) {
            formData.append('accessory_type', accessoryType);
        }
        if (imageFile) {
            formData.append('image', imageFile);
        }
        if (currentStorageOptions.length > 0) {
            formData.append('storage_options', JSON.stringify(currentStorageOptions));
        }

        // Technical specs (phone only)
        if (productType === 'phone') {
            const specFields = ['screen', 'processor', 'camera', 'battery', 'ram', 'storage', 'os'];
            specFields.forEach(field => {
                const val = document.getElementById(`prod-${field}`)?.value?.trim();
                if (val) formData.append(field, val);
            });
        }

        const galleryFiles = document.getElementById('inp-gallery').files;
        for(let i = 0; i < galleryFiles.length; i++) {
            formData.append('gallery', galleryFiles[i]);
        }

        const submitBtn = document.getElementById('submit-btn');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            let url, method;
            if (editingProductId) {
                url = `${API_BASE}/products/manage/${editingProductId}/`;
                method = 'PATCH';
            } else {
                url = `${API_BASE}/products/manage/`;
                method = 'POST';
            }

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json();
                console.error('API Error:', errData);
                
                if (res.status === 401) {
                    showToast('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى', 'error');
                    return;
                }
                if (res.status === 403) {
                    showToast('ليس لديك صلاحية لهذا الإجراء. يجب أن تكون مديراً.', 'error');
                    return;
                }
                
                throw new Error(JSON.stringify(errData));
            }

            const product = await res.json();

            // Show success
            const successTitle = editingProductId ? 'تم التعديل بنجاح!' : 'تم إضافة المنتج!';
            const successMsg = editingProductId
                ? `تم تعديل المنتج "${product.name}" بنجاح`
                : `تم إضافة المنتج "${product.name}" للمتجر`;

            showSuccessOverlay(successTitle, successMsg);

            resetForm();
            cancelEditMode();
            loadAllProducts();
            loadCategories();

        } catch (err) {
            console.error('Submit error:', err);
            showToast('حدث خطأ أثناء حفظ المنتج', 'error');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
}

// =========================
//   TOGGLE LATEST PRODUCT
// =========================
async function toggleLatestProduct(id, currentStatus) {
    const token = localStorage.getItem('access');
    if (!token) {
        showToast('يجب تسجيل الدخول كمدير', 'error');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('is_latest', !currentStatus);

        const res = await fetch(`${API_BASE}/products/manage/${id}/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (res.ok) {
            showToast('تم التحديث بنجاح', 'success');
            loadAllProducts(currentPage);
        } else {
            const errData = await res.json();
            console.error('API Error:', errData);
            showToast('خطأ أثناء التحديث', 'error');
        }
    } catch (err) {
        console.error('Error toggling latest:', err);
        showToast('خطأ في الاتصال بالسيرفر', 'error');
    }
}

// =========================
//   EDIT PRODUCT
// =========================
async function editProduct(productId) {
    const token = localStorage.getItem('access');
    try {
        const res = await fetch(`${API_BASE}/products/${productId}/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const product = await res.json();

        // Switch to add-product tab
        switchAdminTab('add-product', document.querySelector('[data-tab="add-product"]'));

        // Fill form
        document.getElementById('prod-name').value = product.name || '';
        document.getElementById('prod-category').value = product.category || '';
        document.getElementById('prod-price').value = product.price || '';
        document.getElementById('prod-stock').value = product.stock || '';
        document.getElementById('prod-original-price').value = product.original_price || '';
        document.getElementById('prod-discount-percent').value = product.discount_percent || '';
        
        if (document.getElementById('prod-is-latest')) {
            document.getElementById('prod-is-latest').checked = product.is_latest || false;
        }
        
        // Update discount preview after populating
        calcDiscount();

        // Set product type first so it doesn't clear fields we just filled
        const pType = product.product_type || 'phone';
        selectProductType(pType);
        if (pType === 'accessory' && product.accessory_type) {
            const accCard = document.querySelector(`.acc-type-card[data-acc-type="${product.accessory_type}"]`);
            selectAccessoryType(product.accessory_type, accCard);
        }

        // Parse description for extra fields
        let desc = product.description || '';
        const extrasIndex = desc.indexOf('--- مواصفات إضافية ---');
        if (extrasIndex !== -1) {
            const mainDesc = desc.substring(0, extrasIndex).trim();
            const extrasStr = desc.substring(extrasIndex + '--- مواصفات إضافية ---'.length).trim();
            document.getElementById('prod-description').value = mainDesc;
            
            // Parse extras
            extrasStr.split('\n').forEach(line => {
                line = line.trim();
                if (line.startsWith('اللون:')) {
                    const colorsStr = line.replace('اللون:', '').trim();
                    document.getElementById('prod-color').value = colorsStr;
                    selectedColors = colorsStr.split(',').map(c => c.trim()).filter(c => c);
                    if(typeof renderSelectedColors === 'function') renderSelectedColors();
                }
                if (line.startsWith('الوزن:')) document.getElementById('prod-weight').value = line.replace('الوزن:', '').trim();
                if (line.startsWith('SKU:')) document.getElementById('prod-sku').value = line.replace('SKU:', '').trim();
                if (line.startsWith('العلامة التجارية:')) document.getElementById('prod-brand').value = line.replace('العلامة التجارية:', '').trim();
            });
        } else {
            document.getElementById('prod-description').value = desc;
        }

        // Technical specs (phone)
        if (product.product_type === 'phone') {
            const specs = ['screen', 'processor', 'camera', 'battery', 'ram', 'storage', 'os'];
            specs.forEach(s => {
                const el = document.getElementById(`prod-${s}`);
                if (el) el.value = product[s] || '';
            });
            
            if (product.storage_options && product.storage_options.length > 0) {
                currentStorageOptions = typeof product.storage_options === 'string' ? JSON.parse(product.storage_options) : product.storage_options;
                renderStorageOptions();
            } else {
                currentStorageOptions = [];
                renderStorageOptions();
            }
        }

        // Show existing image
        if (product.image) {
            document.getElementById('image-preview').src = product.image;
            document.getElementById('image-preview-container').classList.add('has-image');
            document.getElementById('upload-area').style.display = 'none';
        }

        // Show existing gallery images
        const galleryContainer = document.getElementById('existing-gallery-container');
        if (galleryContainer) {
            galleryContainer.innerHTML = '';
            if (product.gallery && product.gallery.length > 0) {
                product.gallery.forEach(img => {
                    galleryContainer.innerHTML += `
                        <div class="gallery-preview-item" style="position: relative; width: 80px; height: 80px;">
                            <img src="${img.url}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color);">
                            <button type="button" onclick="deleteGalleryImage(${img.id}, this)" style="position: absolute; top: -5px; right: -5px; background: red; color: white; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">&times;</button>
                        </div>
                    `;
                });
            }
        }

        // Set edit mode
        editingProductId = productId;
        document.getElementById('edit-mode-banner').classList.add('show');
        document.getElementById('editing-product-name').textContent = product.name;
        
        // Update button text
        document.getElementById('submit-btn').querySelector('.btn-text').innerHTML = '<i class="fas fa-save"></i> حفظ التعديلات';

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
        console.error('Edit error:', err);
        showToast('خطأ في تحميل بيانات المنتج', 'error');
    }
}

function cancelEditMode() {
    editingProductId = null;
    document.getElementById('edit-mode-banner').classList.remove('show');
    document.getElementById('submit-btn').querySelector('.btn-text').innerHTML = '<i class="fas fa-plus"></i> إضافة المنتج';
    resetForm();
}

async function deleteGalleryImage(imageId, btn) {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;

    const token = localStorage.getItem('access');
    try {
        const res = await fetch(`${API_BASE}/products/manage/image/${imageId}/`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            btn.parentElement.remove();
            showToast('تم حذف الصورة من المعرض', 'success');
        } else {
            showToast('خطأ أثناء حذف الصورة', 'error');
        }
    } catch (err) {
        console.error('Error deleting image:', err);
    }
}

// =========================
//   DELETE PRODUCT
// =========================
function openDeleteModal(id, name) {
    deleteProductId = id;
    document.getElementById('delete-product-name').textContent = name;
    document.getElementById('delete-modal').classList.add('show');
}

function closeDeleteModal() {
    deleteProductId = null;
    document.getElementById('delete-modal').classList.remove('show');
}

async function confirmDelete() {
    if (!deleteProductId) return;

    const token = localStorage.getItem('access');
    try {
        const res = await fetch(`${API_BASE}/products/manage/${deleteProductId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            if (res.status === 403) {
                showToast('ليس لديك صلاحية لحذف المنتجات', 'error');
                closeDeleteModal();
                return;
            }
            throw new Error('Delete failed');
        }

        closeDeleteModal();
        showToast('تم حذف المنتج بنجاح', 'success');
        loadAllProducts(currentPage);

    } catch (err) {
        console.error('Delete error:', err);
        showToast('خطأ أثناء حذف المنتج', 'error');
        closeDeleteModal();
    }
}

// =========================
//   SEARCH
// =========================
function setupSearch() {
    const input = document.getElementById('table-search-input');
    input.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (!query) {
            renderProductsTable(allProducts);
            return;
        }
        const filtered = allProducts.filter(p =>
            p.name.toLowerCase().includes(query) ||
            (p.category_name && p.category_name.toLowerCase().includes(query))
        );
        renderProductsTable(filtered);
    });
}

// =========================
//   RESET FORM
// =========================
function resetForm() {
    document.getElementById('product-form').reset();
    document.getElementById('image-preview').src = '';
    document.getElementById('image-preview-container').classList.remove('has-image');
    document.getElementById('upload-area').style.display = 'flex';
    document.getElementById('inp-gallery').value = '';
    const gc = document.getElementById('existing-gallery-container');
    if(gc) gc.innerHTML = '';
    
    // Hide discount preview
    const preview = document.getElementById('discount-preview');
    if (preview) preview.style.display = 'none';
    
    document.getElementById('prod-color').value = '';
    selectedColors = [];
    if(typeof renderSelectedColors === 'function') renderSelectedColors();
    document.getElementById('prod-weight').value = '';
    document.getElementById('prod-sku').value = '';
    document.getElementById('prod-brand').value = '';

    // Clear spec fields
    const specFields = ['screen', 'processor', 'camera', 'battery', 'ram', 'storage', 'os'];
    specFields.forEach(field => {
        const el = document.getElementById(`prod-${field}`);
        if (el) el.value = '';
    });
    
    if (document.getElementById('prod-is-latest')) {
        document.getElementById('prod-is-latest').checked = false;
    }

    // Reset product type to phone
    selectProductType('phone');
    document.getElementById('prod-accessory-type').value = '';
    document.querySelectorAll('.acc-type-card').forEach(c => c.classList.remove('active'));
    
    currentStorageOptions = [];
    renderStorageOptions();
}

// =========================
//   STORAGE OPTIONS LOGIC
// =========================
let currentStorageOptions = [];

function renderStorageOptions() {
    const container = document.getElementById('storage-options-container');
    if (!container) return;
    container.innerHTML = currentStorageOptions.map((opt, i) => `
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--input-bg); padding: 12px 15px; border-radius: 10px; border: 1px solid var(--border-color); box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
            <span style="font-weight: bold; color: var(--text-color); font-size: 15px;">
                <i class="fas fa-hdd" style="color: #00b894; margin-left: 8px;"></i>
                ${opt.storage} <span style="color: #888; font-weight: normal; margin: 0 5px;">—</span> <span style="color: #ff9900;">${Number(opt.price).toLocaleString()} ${translations[currentLang].currency}</span>
            </span>
            <button type="button" onclick="removeStorageOption(${i})" style="background: rgba(255, 71, 87, 0.1); border: none; color: #ff4757; width: 35px; height: 35px; border-radius: 8px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.background='#ff4757'; this.style.color='white';" onmouseout="this.style.background='rgba(255, 71, 87, 0.1)'; this.style.color='#ff4757';">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function addStorageOption() {
    const storageInput = document.getElementById('new-storage-name');
    const priceInput = document.getElementById('new-storage-price');
    const storage = storageInput.value.trim();
    const price = priceInput.value.trim();

    if (!storage || !price) {
        showToast('يرجى إدخال المساحة والسعر', 'error');
        return;
    }
    
    currentStorageOptions.push({ storage: storage, price: Number(price) });
    storageInput.value = '';
    priceInput.value = '';
    renderStorageOptions();
}

function removeStorageOption(index) {
    currentStorageOptions.splice(index, 1);
    renderStorageOptions();
}

// =========================
//   UTILITY FUNCTIONS
// =========================
function getCategoryName(categoryId) {
    const cat = allCategories.find(c => c.id === categoryId);
    return cat ? cat.name : 'غير محدد';
}

function formatPrice(price) {
    const loc = currentLang === 'ar' ? 'ar-EG' : 'en-US';
    return parseFloat(price).toLocaleString(loc);
}

function formatDate(dateStr) {
    if (!dateStr) return '---';
    const loc = currentLang === 'ar' ? 'ar-EG' : 'en-US';
    const d = new Date(dateStr);
    return d.toLocaleDateString(loc, { year: 'numeric', month: 'short', day: 'numeric' });
}

function getStockClass(stock) {
    if (stock <= 0) return 'stock-out';
    if (stock <= 5) return 'stock-low';
    return 'stock-ok';
}

function getStockLabel(stock) {
    if (stock <= 0) return '(نفذ)';
    if (stock <= 5) return '(منخفض)';
    return '';
}

function escapeHtml(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// =========================
//   TOAST NOTIFICATION
// =========================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `admin-toast ${type}`;
    
    let icon = 'fas fa-info-circle';
    if (type === 'success') icon = 'fas fa-check-circle';
    if (type === 'error') icon = 'fas fa-exclamation-circle';

    toast.innerHTML = `<i class="${icon}"></i> ${message}`;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// =========================
//   SUCCESS OVERLAY
// =========================
function showSuccessOverlay(title, message) {
    document.getElementById('success-title').textContent = title;
    document.getElementById('success-message').textContent = message;
    document.getElementById('success-overlay').classList.add('show');

    setTimeout(() => {
        document.getElementById('success-overlay').classList.remove('show');
    }, 2500);
}

// =========================
//   ORDER MANAGEMENT
// =========================

const STATUS_AR = {
    pending: 'قيد الانتظار', processing: 'جاري التجهيز',
    shipped: 'تم الشحن', delivered: 'تم التوصيل',
    completed: 'مكتمل', cancelled: 'ملغي'
};

const STATUS_EN = {
    pending: 'Pending', processing: 'Processing',
    shipped: 'Shipped', delivered: 'Delivered',
    completed: 'Completed', cancelled: 'Cancelled'
};

const STATUS_ICONS = {
    pending: 'fas fa-clock',
    processing: 'fas fa-spinner',
    shipped: 'fas fa-truck',
    delivered: 'fas fa-check-circle',
    completed: 'fas fa-check-double',
    cancelled: 'fas fa-times-circle'
};

// ---- Load Admin Orders ----
async function loadAdminOrders() {
    const token = localStorage.getItem('access');
    if (!token) return;

    try {
        const res = await fetch(`${API_BASE}/orders/admin/all/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            if (res.status === 403) {
                console.log('Not admin - orders tab hidden');
                return;
            }
            throw new Error('Failed to fetch orders');
        }

        const data = await res.json();
        allAdminOrders = Array.isArray(data) ? data : (data.results || []);

        // Update orders count badge in sidebar
        const countEl = document.getElementById('nav-orders-count');
        if (countEl) countEl.textContent = allAdminOrders.length;

        updateOrderStats();
        applyOrderFilters();

    } catch (err) {
        console.error('Error loading admin orders:', err);
    }
}

// ---- Update Order Stats ----
function updateOrderStats() {
    const total = allAdminOrders.length;
    const pending = allAdminOrders.filter(o => o.status === 'pending').length;
    const processing = allAdminOrders.filter(o => o.status === 'processing').length;
    const delivered = allAdminOrders.filter(o => o.status === 'delivered' || o.status === 'completed').length;

    const el = (id) => document.getElementById(id);
    if (el('orders-total-count')) el('orders-total-count').textContent = total;
    if (el('orders-pending-count')) el('orders-pending-count').textContent = pending;
    if (el('orders-processing-count')) el('orders-processing-count').textContent = processing;
    if (el('orders-delivered-count')) el('orders-delivered-count').textContent = delivered;

    // Update dashboard widgets
    updateDashboardOrderStats();
}

// ---- Render Orders Table ----
function renderAdminOrdersTable(orders) {
    const tbody = document.getElementById('admin-orders-body');
    if (!tbody) return;

    const statusLabels = currentLang === 'ar' ? STATUS_AR : STATUS_EN;

    if (!orders || orders.length === 0) {
        const t = translations[currentLang];
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-table">
                        <i class="fas fa-clipboard-list"></i>
                        <h3>${t.noOrdersFound}</h3>
                        <p>${t.noOrdersDesc}</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = orders.map((order, i) => {
        // Items preview
        const items = order.items || [];
        let itemsHtml = '';
        if (items.length > 0) {
            itemsHtml = `<span class="order-item-mini">${items[0].product?.name || 'منتج'} \u00D7${items[0].quantity}</span>`;
            if (items.length > 1) {
                itemsHtml += `<span class="order-items-more">+${items.length - 1} ${currentLang === 'ar' ? '\u0645نتجات \u0623خر\u0649' : 'more'}</span>`;
            }
        } else {
            itemsHtml = '<span style="color:#888;">---</span>';
        }

        // Status select options
        const statusOptions = Object.keys(statusLabels).map(s =>
            `<option value="${s}" ${order.status === s ? 'selected' : ''}>${statusLabels[s]}</option>`
        ).join('');

        return `
            <tr>
                <td><strong>#${order.id}</strong></td>
                <td>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#667eea22,#764ba222);display:flex;align-items:center;justify-content:center;color:#667eea;font-size:14px;"><i class="fas fa-user"></i></div>
                        <span style="font-weight:600;">${order.user_name || ('User #' + order.user)}</span>
                    </div>
                </td>
                <td>
                    <div class="order-items-preview">
                        ${itemsHtml}
                    </div>
                </td>
                <td><span class="table-price">${formatPrice(order.total_price)} ${translations[currentLang].currency}</span></td>
                <td style="font-size:13px;color:#888;">${formatDate(order.created_at)}</td>
                <td>
                    <select class="order-status-select" onchange="updateOrderStatus(${order.id}, this.value, this)">
                        ${statusOptions}
                    </select>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="view-order-btn" title="${translations[currentLang].viewOrderDetails}" onclick="showOrderDetail(${order.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ---- Update Order Status ----
async function updateOrderStatus(orderId, newStatus, selectEl) {
    const token = localStorage.getItem('access');
    if (!token) return;

    try {
        const res = await fetch(`${API_BASE}/orders/status/${orderId}/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!res.ok) {
            throw new Error('Status update failed');
        }

        // Update local data
        const order = allAdminOrders.find(o => o.id === orderId);
        if (order) order.status = newStatus;

        updateOrderStats();
        showToast(translations[currentLang].orderUpdated, 'success');

    } catch (err) {
        console.error('Error updating order status:', err);
        showToast(translations[currentLang].orderUpdateError, 'error');
        // Revert select
        if (selectEl) {
            const order = allAdminOrders.find(o => o.id === orderId);
            if (order) selectEl.value = order.status;
        }
    }
}

// ---- Filter Orders ----
function filterAdminOrders(status, el) {
    // Update active button
    document.querySelectorAll('.order-filter-btn').forEach(b => b.classList.remove('active'));
    if (el) el.classList.add('active');

    currentOrderFilter = status;
    applyOrderFilters();
}

function applyOrderFilters() {
    let filtered = allAdminOrders;

    // Apply status filter
    if (currentOrderFilter !== 'all') {
        filtered = filtered.filter(o => o.status === currentOrderFilter);
    }

    // Apply search filter
    const searchInput = document.getElementById('orders-search-input');
    if (searchInput && searchInput.value.trim()) {
        const query = searchInput.value.trim().toLowerCase();
        filtered = filtered.filter(o =>
            String(o.id).includes(query) ||
            (o.user_name && o.user_name.toLowerCase().includes(query)) ||
            String(o.user).includes(query)
        );
    }

    renderAdminOrdersTable(filtered);
}

// ---- Search Orders ----
function setupOrdersSearch() {
    const input = document.getElementById('orders-search-input');
    if (!input) return;

    input.addEventListener('input', () => {
        applyOrderFilters();
    });
}

// ---- Order Detail Modal ----
function showOrderDetail(orderId) {
    const order = allAdminOrders.find(o => o.id === orderId);
    if (!order) return;

    const statusLabels = currentLang === 'ar' ? STATUS_AR : STATUS_EN;
    const t = translations[currentLang];

    document.getElementById('order-detail-id').textContent = `#${order.id}`;

    const items = order.items || [];
    const itemsRows = items.map(item => `
        <tr>
            <td class="item-product-name">${item.product?.name || '\u0645\u0646\u062a\u062c'}</td>
            <td style="text-align:center;">${item.quantity}</td>
            <td>${formatPrice(item.price)} ${t.currency}</td>
            <td class="item-subtotal">${formatPrice(item.price * item.quantity)} ${t.currency}</td>
        </tr>
    `).join('');

    const statusOptions = Object.keys(statusLabels).map(s =>
        `<option value="${s}" ${order.status === s ? 'selected' : ''}>${statusLabels[s]}</option>`
    ).join('');

    const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString(
        currentLang === 'ar' ? 'ar-EG' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    ) : '---';

    document.getElementById('order-detail-body').innerHTML = `
        <div class="order-info-grid">
            <div class="order-info-item">
                <span class="info-label"><i class="fas fa-hashtag"></i> ${t.orderNum || 'Order #'}</span>
                <span class="info-value">#${order.id}</span>
            </div>
            <div class="order-info-item">
                <span class="info-label"><i class="fas fa-user"></i> ${t.customer}</span>
                <span class="info-value">${order.user_name || ('User #' + order.user)}</span>
            </div>
            <div class="order-info-item">
                <span class="info-label"><i class="fas fa-calendar"></i> ${t.orderDate}</span>
                <span class="info-value">${dateStr}</span>
            </div>
            <div class="order-info-item">
                <span class="info-label"><i class="fas fa-info-circle"></i> ${t.orderStatus}</span>
                <span class="info-value">
                    <span class="order-status-badge status-${order.status}">
                        <i class="${STATUS_ICONS[order.status] || 'fas fa-circle'}"></i>
                        ${statusLabels[order.status] || order.status}
                    </span>
                </span>
            </div>
            
            <div class="order-info-item" style="grid-column: 1 / -1; margin-top: 10px; padding-top: 15px; border-top: 1px dashed var(--border-color);">
                <span class="info-label" style="color: #ff9900; margin-bottom: 10px;"><i class="fas fa-map-marker-alt"></i> بيانات الشحن للعميل</span>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; background: var(--bg-color); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color);">
                    <div>
                        <small style="color: var(--text-color); opacity: 0.7; display: block; margin-bottom: 5px;">اسم المستلم</small>
                        <strong style="color: var(--text-color);">${order.shipping_name || order.user_name || 'غير محدد'}</strong>
                    </div>
                    <div>
                        <small style="color: var(--text-color); opacity: 0.7; display: block; margin-bottom: 5px;">رقم الهاتف</small>
                        <strong dir="ltr" style="display: inline-block; color: var(--text-color);">${order.shipping_phone || 'غير محدد'}</strong>
                    </div>
                    <div style="grid-column: 1 / -1;">
                        <small style="color: var(--text-color); opacity: 0.7; display: block; margin-bottom: 5px;">العنوان بالتفصيل</small>
                        <strong style="color: var(--text-color);">${order.shipping_address || 'لم يتم إدخال عنوان'}</strong>
                    </div>
                </div>
            </div>
        </div>

        <div class="order-detail-items">
            <h4><i class="fas fa-shopping-bag"></i> ${t.orderSummary}</h4>
            <table>
                <thead>
                    <tr>
                        <th>${t.productCol}</th>
                        <th style="text-align:center;">${t.qtyCol}</th>
                        <th>${t.priceCol}</th>
                        <th>${t.totalLabel || '\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a'}</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsRows || '<tr><td colspan="4" style="text-align:center;color:#888;padding:20px;">---</td></tr>'}
                </tbody>
            </table>
        </div>

        <div class="order-detail-total">
            <span>${t.totalLabel || '\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a:'}</span>
            <span>${formatPrice(order.total_price)} ${t.currency}</span>
        </div>

        <div class="order-detail-status">
            <label><i class="fas fa-exchange-alt"></i> ${t.updateStatus}:</label>
            <select class="order-status-select" id="detail-status-select">
                ${statusOptions}
            </select>
            <button class="save-status-btn" onclick="updateOrderStatusFromDetail(${order.id})">
                <i class="fas fa-save"></i> ${t.saveChanges || '\u062d\u0641\u0638'}
            </button>
        </div>
    `;

    document.getElementById('order-detail-modal').classList.add('show');
}

function closeOrderDetail() {
    document.getElementById('order-detail-modal').classList.remove('show');
}

async function updateOrderStatusFromDetail(orderId) {
    const select = document.getElementById('detail-status-select');
    if (!select) return;

    await updateOrderStatus(orderId, select.value);

    // Re-render the table & refresh detail
    applyOrderFilters();

    // Update the status badge in the modal
    const order = allAdminOrders.find(o => o.id === orderId);
    if (order) {
        showOrderDetail(orderId);
    }
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.id === 'order-detail-modal') {
        closeOrderDetail();
    }
});

// =========================
//   COUPONS MANAGEMENT
// =========================
let allCoupons = [];

async function loadAdminCoupons() {
    const tbody = document.getElementById('admin-coupons-body');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/orders/admin/coupons/`, {
            headers: { "Authorization": "Bearer " + localStorage.getItem("access") }
        });
        const data = await res.json();
        
        allCoupons = Array.isArray(data) ? data : (data.results || []);
        renderCouponsTable();
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="5" class="empty-table" style="color:red;">خطأ في تحميل الكوبونات</td></tr>`;
    }
}

function renderCouponsTable() {
    const tbody = document.getElementById('admin-coupons-body');
    if (!tbody) return;

    if (allCoupons.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-table"><i class="fas fa-ticket-alt"></i><p>لا توجد كوبونات</p></td></tr>`;
        return;
    }

    tbody.innerHTML = allCoupons.map(c => {
        const dateStr = c.valid_until 
            ? new Date(c.valid_until).toLocaleString(currentLang === 'ar' ? 'ar-EG' : 'en-US') 
            : translations[currentLang].noExpiration;
            
        const statusBadge = c.active 
            ? `<span style="background: #00b894; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${translations[currentLang].toastCouponActive}</span>`
            : `<span style="background: #d63031; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${translations[currentLang].toastCouponInactive}</span>`;
        
        const toggleTitle = c.active ? translations[currentLang].toastCouponDisableTitle : translations[currentLang].toastCouponEnableTitle;

        return `
            <tr>
                <td style="font-weight: bold; color: var(--text-color);">${c.code}</td>
                <td style="color: #ff4757; font-weight: bold;">${c.discount_percent}%</td>
                <td>${dateStr}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="action-btn" style="background: ${c.active ? '#ff9f43' : '#00b894'}; color: white;" onclick="toggleCoupon(${c.id}, ${!c.active})" title="${toggleTitle}">
                        <i class="fas ${c.active ? 'fa-ban' : 'fa-check'}"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteCoupon(${c.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function setupCouponForm() {
    const form = document.getElementById('coupon-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('coupon-code-input').value;
        const discount = document.getElementById('coupon-discount-input').value;
        const validUntil = document.getElementById('coupon-valid-until-input').value;

        const payload = {
            code: code,
            discount_percent: parseInt(discount),
            active: true
        };
        if (validUntil) {
            payload.valid_until = new Date(validUntil).toISOString();
        }

        try {
            const btn = form.querySelector('button[type="submit"]');
            btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${translations[currentLang].couponAdding}`;
            btn.disabled = true;

            const res = await fetch(`${API_BASE}/orders/admin/coupons/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('access')
                },
                body: JSON.stringify(payload)
            });

            btn.innerHTML = `<i class="fas fa-plus"></i> ${translations[currentLang].btnAddCoupon}`;
            btn.disabled = false;

            if (res.ok) {
                showToast(translations[currentLang].couponAddSuccess);
                form.reset();
                loadAdminCoupons();
            } else {
                const data = await res.json();
                showToast(translations[currentLang].couponAddError, "error");
                console.error(data);
            }
        } catch (err) {
            console.error(err);
            showToast(translations[currentLang].toastConnError, "error");
        }
    });
}

window.toggleCoupon = async function(id, newState) {
    try {
        const res = await fetch(`${API_BASE}/orders/admin/coupons/${id}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access')
            },
            body: JSON.stringify({ active: newState })
        });
        if (res.ok) {
            showToast("تم تحديث حالة الكوبون");
            loadAdminCoupons();
        }
    } catch(err) {
        showToast("خطأ في الاتصال", "error");
    }
}

window.deleteCoupon = async function(id) {
    if (!confirm("هل أنت متأكد من حذف هذا الكوبون نهائياً؟")) return;
    try {
        const res = await fetch(`${API_BASE}/orders/admin/coupons/${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access')
            }
        });
        if (res.ok) {
            showToast(translations[currentLang].couponDeleted || "تم حذف الكوبون بنجاح");
            loadAdminCoupons();
        }
    } catch(err) {
        showToast(translations[currentLang].toastConnError || "خطأ في الاتصال", "error");
    }
}

// =========================
//   CUSTOMERS MANAGEMENT
// =========================
let allCustomers = [];

async function loadAdminCustomers() {
    const tbody = document.getElementById('admin-customers-body');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/users/admin/all/`, {
            headers: { "Authorization": "Bearer " + localStorage.getItem("access") }
        });
        const data = await res.json();
        
        allCustomers = Array.isArray(data) ? data : (data.results || []);
        
        const countEl = document.getElementById('nav-customers-count');
        if (countEl) countEl.innerText = allCustomers.length;

        renderCustomersTable(allCustomers);
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="6" class="empty-table" style="color:red;">خطأ في تحميل العملاء</td></tr>`;
    }
}

function renderCustomersTable(customersList) {
    const tbody = document.getElementById('admin-customers-body');
    if (!tbody) return;

    if (customersList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-table"><i class="fas fa-users"></i><p>${translations[currentLang].noCustomers}</p></td></tr>`;
        return;
    }

    tbody.innerHTML = customersList.map((c, index) => {
        const isPremium = c.is_premium;
        const isAdmin = c.is_staff;
        
        const roleBadge = isAdmin 
            ? `<span style="background: #e1b12c; color: #2f3640; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight:bold;"><i class="fas fa-crown"></i> ${translations[currentLang].roleAdmin}</span>`
            : `<span style="background: #353b48; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${translations[currentLang].roleUser}</span>`;

        const premiumToggle = `
            <label class="theme-switch" style="transform: scale(0.8); margin: 0;">
                <input type="checkbox" ${isPremium ? 'checked' : ''} onchange="togglePremiumStatus(${c.id}, this.checked)">
                <span class="slider" style="background-color: ${isPremium ? '#fbc531' : '#ccc'};"></span>
            </label>
        `;

        return `
            <tr>
                <td>${index + 1}</td>
                <td style="font-weight: bold; color: var(--text-color);">
                    ${c.username}
                    ${isPremium ? `<i class="fas fa-star" style="color:#fbc531; margin-right:5px; font-size: 12px;" title="${translations[currentLang].premiumBadgeTooltip}"></i>` : ''}
                </td>
                <td>${c.email || '—'}</td>
                <td dir="ltr" style="text-align: right;">${c.date_joined || '—'}</td>
                <td>${premiumToggle}</td>
                <td>${roleBadge}</td>
            </tr>
        `;
    }).join('');
}

window.togglePremiumStatus = async function(userId, isPremium) {
    try {
        const res = await fetch(`${API_BASE}/users/admin/${userId}/toggle-premium/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access')
            },
            body: JSON.stringify({ is_premium: isPremium })
        });
        
        if (res.ok) {
            showToast(isPremium ? translations[currentLang].toastPremiumUp : translations[currentLang].toastPremiumDown);
            loadAdminCustomers();
        } else {
            showToast(translations[currentLang].toastUpdateError, "error");
        }
    } catch(err) {
        showToast(translations[currentLang].toastConnError, "error");
    }
}

const customersSearch = document.getElementById('customers-search-input');
if (customersSearch) {
    customersSearch.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allCustomers.filter(c => 
            c.username.toLowerCase().includes(term) || 
            (c.email && c.email.toLowerCase().includes(term))
        );
        renderCustomersTable(filtered);
    });
}
