// ===========================================
// PROFILE PAGE - MAIN JAVASCRIPT
// ===========================================

const API_BASE = "https://web-production-2a731.up.railway.app";
let allOrders = [];

// ================= MOBILE MENU =================
function toggleMobileMenu() {
    const nav = document.getElementById('nav-links');
    if (nav) nav.classList.toggle('mobile-open');
}
document.addEventListener('click', function(e) {
    if (e.target.closest('.nav-links a')) {
        const nav = document.getElementById('nav-links');
        if (nav) nav.classList.remove('mobile-open');
    }
});

// ================= AUTH CHECK =================
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(API_BASE.getItem('currentUser'));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // Fill sidebar
    document.getElementById('sidebar-name').innerText = user.name;
    document.getElementById('sidebar-email').innerText = user.email || '---';
    
    // Toggle Premium Badge
    const memberBadge = document.querySelector('.member-badge');
    if (memberBadge) {
        memberBadge.style.display = user.is_premium ? 'inline-block' : 'none';
    }

    // Fill account form
    document.getElementById('inp-username').value = user.name;
    document.getElementById('inp-email').value = user.email || '';
    document.getElementById('inp-phone').value = user.phone || '';
    document.getElementById('inp-joined').value = user.joined || new Date().toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US');

    // Fill address if saved
    const addr = JSON.parse(API_BASE.getItem('userAddress'));
    if (addr) {
        document.getElementById('addr-name').innerText = addr.name || translations[currentLang].notAddedYet || 'لم يتم الإضافة';
        document.getElementById('addr-detail').innerHTML = `<i class="fas fa-map-pin"></i> ${addr.city || ''} - ${addr.area || ''} - ${addr.street || ''}`;
        document.getElementById('addr-phone').innerHTML = `<i class="fas fa-phone"></i> ${addr.phone || '---'}`;
    }

    // Device info
    const deviceEl = document.getElementById('device-info');
    if (deviceEl) deviceEl.innerText = navigator.userAgent.substring(0, 60) + '...';

    const lastLoginEl = document.getElementById('last-login');
    if (lastLoginEl) lastLoginEl.innerText = new Date().toLocaleString(currentLang === 'ar' ? 'ar-EG' : 'en-US');

    // Auth area in navbar
    const authArea = document.getElementById('user-auth-area');
    if (authArea) {
        authArea.innerHTML = `
            <div class="user-profile-btn" onclick="window.location.href='profile.html'">
                <i class="fas fa-user-circle"></i>
                <span>${user.name.split(' ')[0]}</span>
            </div>
        `;
    }

    // Load orders
    loadOrders();

    // Theme
    const savedTheme = API_BASE.getItem('theme');
    const toggleBtn = document.getElementById('theme-toggle');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (toggleBtn) toggleBtn.checked = true;
    }
});

// ================= THEME =================
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    API_BASE.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

// ================= LOGIN =================
function openLoginPage() { window.location.href = "login.html"; }

// ================= LOGOUT =================
function logout() {
    API_BASE.removeItem('currentUser');
    API_BASE.removeItem('access');
    API_BASE.removeItem('refresh');
    window.location.href = 'index.html';
}

// ================= TAB SYSTEM =================
function switchTab(tabName, el) {
    // Hide all tabs
    document.querySelectorAll('.prof-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.prof-menu li').forEach(l => l.classList.remove('active'));

    // Show selected
    const tab = document.getElementById('tab-' + tabName);
    if (tab) {
        tab.classList.add('active');
        tab.classList.add('animate__animated', 'animate__fadeIn');
    }
    if (el) el.classList.add('active');
}

// ================= EDIT PROFILE =================
let isEditing = false;

function toggleEdit() {
    isEditing = !isEditing;
    const inputs = document.querySelectorAll('.prof-form-grid input');
    const saveArea = document.getElementById('save-area');
    const editBtn = document.getElementById('edit-toggle');

    if (isEditing) {
        inputs.forEach(inp => {
            if (inp.id !== 'inp-joined') inp.disabled = false;
        });
        saveArea.style.display = 'flex';
        editBtn.innerHTML = '<i class="fas fa-times"></i> إلغاء';
        editBtn.style.background = 'linear-gradient(135deg, #ff4757, #ff6b81)';
    } else {
        cancelEdit();
    }
}

function cancelEdit() {
    isEditing = false;
    const inputs = document.querySelectorAll('.prof-form-grid input');
    inputs.forEach(inp => inp.disabled = true);
    document.getElementById('save-area').style.display = 'none';
    const editBtn = document.getElementById('edit-toggle');
    editBtn.innerHTML = '<i class="fas fa-pen"></i> تعديل';
    editBtn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
}

function saveProfile() {
    const user = JSON.parse(API_BASE.getItem('currentUser')) || {};
    user.name = document.getElementById('inp-username').value;
    user.email = document.getElementById('inp-email').value;
    user.phone = document.getElementById('inp-phone').value;
    API_BASE.setItem('currentUser', JSON.stringify(user));

    // Update sidebar
    document.getElementById('sidebar-name').innerText = user.name;
    document.getElementById('sidebar-email').innerText = user.email;

    cancelEdit();
    showProfileToast(translations[currentLang].profileUpdated);
}

// ================= LOAD ORDERS =================
async function loadOrders() {
    const token = API_BASE.getItem('access');

    if (!token) {
        console.log("❌ مفيش token");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/orders/my-orders/`, {
            headers: { 
                "Authorization": "Bearer " + token 
            }
        });

        // 🔥 أهم سطر
        if (!res.ok) {
            console.log("❌ API ERROR:", res.status);
            return;
        }

        const data = await res.json();

        console.log("🔥 ORDERS FROM API:", data);

        allOrders = Array.isArray(data) ? data : (data.results || []);

        console.log("🔥 FINAL ORDERS:", allOrders);

        updateStats();
        renderOrders(allOrders);

    } catch (err) {
        console.error("Error loading orders:", err);
    }
}

function updateStats() {
    const totalOrders = allOrders.length;
    const delivered = allOrders.filter(o => o.status === 'delivered' || o.status === 'completed').length;
    const pending = allOrders.filter(o => o.status === 'pending').length;
    const totalSpent = allOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);

    // Quick stats
    const sOrders = document.getElementById('stat-orders');
    if (sOrders) sOrders.innerText = totalOrders;
    const sSpent = document.getElementById('stat-spent');
    if (sSpent) sSpent.innerText = totalSpent.toLocaleString() + ' ' + translations[currentLang].currency;

    // Badge
    const badge = document.getElementById('orders-badge');
    if (badge) badge.innerText = totalOrders;

    // Big stats
    const bOrders = document.getElementById('bstat-orders');
    if (bOrders) bOrders.innerText = totalOrders;
    const bSpent = document.getElementById('bstat-spent');
    if (bSpent) bSpent.innerText = totalSpent.toLocaleString() + ' ' + translations[currentLang].currency;
    const bDelivered = document.getElementById('bstat-delivered');
    if (bDelivered) bDelivered.innerText = delivered;
    const bPending = document.getElementById('bstat-pending');
    if (bPending) bPending.innerText = pending;

    // Recent orders table
    renderRecentOrders();
}

function renderOrders(orders) {
    const container = document.getElementById('orders-container');
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>${translations[currentLang].noOrdersYet}</h3>
                <p>${translations[currentLang].startShopping}</p>
                <a href="index.html" class="shop-now-btn">${translations[currentLang].shopNowArrow} <i class="fas fa-arrow-left"></i></a>
            </div>
        `;
        return;
    }

    container.innerHTML = orders.map(order => {
        const statusAr = {
            pending: translations[currentLang].pending, processing: translations[currentLang].processing,
            shipped: translations[currentLang].shipped, delivered: translations[currentLang].delivered,
            completed: translations[currentLang].statusCompleted, cancelled: translations[currentLang].statusCancelled
        };
        const date = new Date(order.created_at).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        const itemsHtml = (order.items || []).map(item => `
            <div class="order-item-row">
                <span class="item-name">${item.product?.name || translations[currentLang].productCol}</span>
                <span class="item-qty">×${item.quantity}</span>
                <span class="item-price">${parseFloat(item.price).toLocaleString()} ج</span>
            </div>
        `).join('');

        let actionHtml = '';
        if (order.status === 'pending' || order.status === 'processing') {
            actionHtml = `
            <div class="order-actions" style="margin-top: 15px; text-align: left;">
                <button class="cancel-order-btn" onclick="cancelOrder(${order.id})" style="background: #ff4757; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-family: inherit; font-weight: bold; transition: opacity 0.3s;" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1">
                    <i class="fas fa-times-circle"></i> <span data-lang-key="cancelOrder">إلغاء الطلب</span>
                </button>
            </div>
            `;
        }

        return `
            <div class="order-card" data-status="${order.status}">
                <div class="order-top">
                    <div>
                        <span class="order-id">طلب #${order.id}</span>
                        <span class="order-date"> — ${date}</span>
                    </div>
                    <span class="order-status status-${order.status}">${statusAr[order.status] || order.status}</span>
                </div>
                <div class="order-items-list">${itemsHtml}</div>
                <div class="order-total">
                    <span>الإجمالي</span>
                    <span class="total-val">${parseFloat(order.total_price).toLocaleString()} ${translations[currentLang].currency}</span>
                </div>
                ${actionHtml}
            </div>
        `;
    }).join('');
}

function filterOrders(status, el) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (el) el.classList.add('active');

    if (status === 'all') {
        renderOrders(allOrders);
    } else {
        renderOrders(allOrders.filter(o => o.status === status));
    }
}

async function cancelOrder(orderId) {
    if (!confirm((currentLang === 'ar' ? 'هل أنت متأكد من إلغاء هذا الطلب؟' : 'Are you sure you want to cancel this order?'))) return;
    
    const token = API_BASE.getItem('access');
    if (!token) return;

    try {
        const res = await fetch(`${API_BASE}/api/orders/${orderId}/cancel/`, {
            method: 'POST',
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        });

        if (res.ok) {
            showProfileToast(translations[currentLang].cancelOrderSuccess);
            loadOrders(); // Refresh orders
        } else {
            const data = await res.json();
            showProfileToast(data.detail || translations[currentLang].cancelOrderError);
        }
    } catch (err) {
        console.error(err);
        showProfileToast(translations[currentLang].toastServerError);
    }
}

function renderRecentOrders() {
    const container = document.getElementById('recent-orders-table');
    if (!container) return;

    const recent = allOrders.slice(0, 5);
    if (recent.length === 0) {
        container.innerHTML = `<p class="no-data">${translations[currentLang].noDataYet}</p>`;
        return;
    }

    const statusAr = {
        pending: translations[currentLang].pending, processing: translations[currentLang].processing,
        shipped: translations[currentLang].shipped, delivered: translations[currentLang].delivered,
        completed: translations[currentLang].statusCompleted, cancelled: translations[currentLang].statusCancelled
    };

    container.innerHTML = `
        <table style="width:100%; border-collapse:collapse; font-size:14px;">
            <thead>
                <tr style="border-bottom:2px solid var(--border-color);">
                    <th style="padding:12px; text-align:right;">رقم الطلب</th>
                    <th style="padding:12px; text-align:right;">التاريخ</th>
                    <th style="padding:12px; text-align:right;">الحالة</th>
                    <th style="padding:12px; text-align:right;">الإجمالي</th>
                </tr>
            </thead>
            <tbody>
                ${recent.map(o => `
                    <tr style="border-bottom:1px solid var(--border-color);">
                        <td style="padding:12px; font-weight:700;">#${o.id}</td>
                        <td style="padding:12px; color:#888;">${new Date(o.created_at).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US')}</td>
                        <td style="padding:12px;"><span class="order-status status-${o.status}" style="font-size:12px;padding:4px 12px;">${statusAr[o.status] || o.status}</span></td>
                        <td style="padding:12px; font-weight:700; color:#ff9900;">${parseFloat(o.total_price).toLocaleString()} ${translations[currentLang].currency}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ================= ADDRESSES =================
function addNewAddress() { document.getElementById('address-modal').style.display = 'flex'; }
function closeAddressModal() { document.getElementById('address-modal').style.display = 'none'; }

function editAddress() {
    const addr = JSON.parse(API_BASE.getItem('userAddress')) || {};
    document.getElementById('addr-inp-name').value = addr.name || '';
    document.getElementById('addr-inp-city').value = addr.city || '';
    document.getElementById('addr-inp-area').value = addr.area || '';
    document.getElementById('addr-inp-street').value = addr.street || '';
    document.getElementById('addr-inp-phone').value = addr.phone || '';
    addNewAddress();
}

function saveAddress() {
    const addr = {
        name: document.getElementById('addr-inp-name').value,
        city: document.getElementById('addr-inp-city').value,
        area: document.getElementById('addr-inp-area').value,
        street: document.getElementById('addr-inp-street').value,
        phone: document.getElementById('addr-inp-phone').value
    };
    API_BASE.setItem('userAddress', JSON.stringify(addr));

    document.getElementById('addr-name').innerText = addr.name || translations[currentLang].notAddedYet || 'لم يتم الإضافة';
    document.getElementById('addr-detail').innerHTML = `<i class="fas fa-map-pin"></i> ${addr.city} - ${addr.area} - ${addr.street}`;
    document.getElementById('addr-phone').innerHTML = `<i class="fas fa-phone"></i> ${addr.phone || '---'}`;

    closeAddressModal();
    showProfileToast(translations[currentLang].addressSaved);
}

function deleteAddress() {
    API_BASE.removeItem('userAddress');
    document.getElementById('addr-name').innerText = translations[currentLang].notAddedYet || 'لم يتم الإضافة';
    document.getElementById('addr-detail').innerHTML = '<i class="fas fa-map-pin"></i> لم يتم إضافة عنوان بعد';
    document.getElementById('addr-phone').innerHTML = '<i class="fas fa-phone"></i> ---';
    showProfileToast(translations[currentLang].addressDeleted);
}

// ================= SECURITY =================
function togglePassVisibility(icon) {
    const input = icon.previousElementSibling;
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

async function changePassword() {
    const oldPass = document.getElementById('inp-old-pass').value;
    const newPass = document.getElementById('inp-new-pass').value;

    if (!oldPass || !newPass) {
        showProfileToast(translations[currentLang].fillAllFields);
        return;
    }
    if (newPass.length < 6) {
        showProfileToast(translations[currentLang].passMin6);
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/users/change-password/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + API_BASE.getItem("access")
            },
            body: JSON.stringify({ old_password: oldPass, new_password: newPass })
        });

        if (res.ok) {
            showProfileToast(translations[currentLang].passChanged);
            document.getElementById('inp-old-pass').value = '';
            document.getElementById('inp-new-pass').value = '';
        } else {
            const data = await res.json();
            showProfileToast(data.old_password?.[0] || 'حدث خطأ ❌');
        }
    } catch (err) {
        console.error(err);
        showProfileToast(translations[currentLang].toastServerError);
    }
}

// ================= TOAST =================
function showProfileToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'profile-toast';
    toast.innerText = msg;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}
