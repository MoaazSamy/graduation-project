// ===========================================
//  🔔 NOTIFICATION SYSTEM
//  Shared across all pages
// ===========================================
const API_BASE = 'https://web-production-2a731.up.railway.app/api';

(function () {
    const NOTIF_API = 'https://web-production-2a731.up.railway.app/api/notifications/';
    const POLL_INTERVAL = 30000; // 30 seconds
    let notificationsData = [];
    let unreadCount = 0;
    let panelOpen = false;

    // ---- Wait for DOM ----
    document.addEventListener('DOMContentLoaded', () => {
        const token = API_BASE.getItem('access');
        if (!token) return; // مش مسجل دخول

        injectNotificationUI();
        fetchUnreadCount();
        setInterval(fetchUnreadCount, POLL_INTERVAL);
    });

    // ---- INJECT UI ----
    function injectNotificationUI() {

        // 2. Panel
        const panel = document.createElement('div');
        panel.className = 'notif-panel';
        panel.id = 'notif-panel';
        panel.innerHTML = `
            <div class="notif-panel-header">
                <h3><i class="fas fa-bell"></i> <span>الإشعارات</span></h3>
                <div class="notif-header-actions">
                    <button class="notif-mark-all" onclick="window._notifMarkAllRead()">
                        <i class="fas fa-check-double"></i> قراءة الكل
                    </button>
                    <button class="notif-close-btn" onclick="window._notifToggle()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="notif-panel-body" id="notif-panel-body">
                <div class="notif-loading"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>
            </div>
        `;
        document.body.appendChild(panel);

        // 3. Overlay
        const overlay = document.createElement('div');
        overlay.className = 'notif-overlay';
        overlay.id = 'notif-overlay';
        overlay.onclick = toggleNotifPanel;
        document.body.appendChild(overlay);

        // Expose functions globally
        window._notifToggle = toggleNotifPanel;
        window._notifMarkAllRead = markAllRead;
        window._notifMarkRead = markRead;
    }

    // ---- FETCH UNREAD COUNT ----
    async function fetchUnreadCount() {
        const token = API_BASE.getItem('access');
        if (!token) return;

        try {
            const res = await fetch(NOTIF_API + 'unread-count/', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) return;
            const data = await res.json();
            
            const oldCount = unreadCount;
            unreadCount = data.count;
            updateBadge();

            // إذا فيه إشعارات جديدة — أظهر toast
            if (unreadCount > oldCount && oldCount >= 0) {
                showNotifToast(unreadCount - oldCount);
            }
        } catch (err) {
            console.error('Notification fetch error:', err);
        }
    }

    // ---- FETCH ALL NOTIFICATIONS ----
    async function fetchNotifications() {
        const token = API_BASE.getItem('access');
        if (!token) return;

        const body = document.getElementById('notif-panel-body');
        if (!body) return;
        body.innerHTML = '<div class="notif-loading"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>';

        try {
            const res = await fetch(NOTIF_API, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) return;
            const data = await res.json();
            notificationsData = data.results || data;
            renderNotifications();
        } catch (err) {
            body.innerHTML = '<div class="notif-empty"><i class="fas fa-exclamation-circle"></i><p>خطأ في تحميل الإشعارات</p></div>';
        }
    }

    // ---- RENDER ----
    function renderNotifications() {
        const body = document.getElementById('notif-panel-body');
        if (!body) return;

        if (notificationsData.length === 0) {
            body.innerHTML = `
                <div class="notif-empty">
                    <i class="fas fa-bell-slash"></i>
                    <p>لا توجد إشعارات</p>
                </div>
            `;
            return;
        }

        body.innerHTML = notificationsData.map(n => `
            <div class="notif-item ${n.is_read ? '' : 'unread'}" onclick="window._notifMarkRead(${n.id}, this)">
                <div class="notif-item-icon ${getIconClass(n.notification_type)}">
                    <i class="fas ${getIcon(n.notification_type)}"></i>
                </div>
                <div class="notif-item-content">
                    <div class="notif-item-title">${n.title}</div>
                    <div class="notif-item-msg">${n.message}</div>
                    <div class="notif-item-time"><i class="far fa-clock"></i> ${n.time_ago}</div>
                </div>
                ${!n.is_read ? '<div class="notif-unread-dot"></div>' : ''}
            </div>
        `).join('');
    }

    function getIcon(type) {
        switch (type) {
            case 'order_created': return 'fa-shopping-bag';
            case 'order_status': return 'fa-truck';
            case 'order_cancelled': return 'fa-times-circle';
            default: return 'fa-info-circle';
        }
    }

    function getIconClass(type) {
        switch (type) {
            case 'order_created': return 'icon-new-order';
            case 'order_status': return 'icon-status';
            case 'order_cancelled': return 'icon-cancelled';
            default: return 'icon-general';
        }
    }

    // ---- TOGGLE PANEL ----
    function toggleNotifPanel() {
        panelOpen = !panelOpen;
        const panel = document.getElementById('notif-panel');
        const overlay = document.getElementById('notif-overlay');
        if (!panel || !overlay) return;

        if (panelOpen) {
            panel.classList.add('open');
            overlay.classList.add('open');
            fetchNotifications();
        } else {
            panel.classList.remove('open');
            overlay.classList.remove('open');
        }
    }

    // ---- MARK READ ----
    async function markRead(id, el) {
        const token = API_BASE.getItem('access');
        if (!token) return;

        try {
            await fetch(NOTIF_API + id + '/read/', {
                method: 'PATCH',
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (el) {
                el.classList.remove('unread');
                const dot = el.querySelector('.notif-unread-dot');
                if (dot) dot.remove();
            }
            unreadCount = Math.max(0, unreadCount - 1);
            updateBadge();
        } catch (err) {
            console.error('Mark read error:', err);
        }
    }

    // ---- MARK ALL READ ----
    async function markAllRead() {
        const token = API_BASE.getItem('access');
        if (!token) return;

        try {
            await fetch(NOTIF_API + 'read-all/', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token }
            });
            unreadCount = 0;
            updateBadge();
            // Update UI
            document.querySelectorAll('.notif-item.unread').forEach(el => {
                el.classList.remove('unread');
                const dot = el.querySelector('.notif-unread-dot');
                if (dot) dot.remove();
            });
        } catch (err) {
            console.error('Mark all read error:', err);
        }
    }

    // ---- UPDATE BADGE ----
    function updateBadge() {
        const badge = document.getElementById('notif-badge');
        if (!badge) return;
        if (unreadCount > 0) {
            badge.style.display = 'flex';
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        } else {
            badge.style.display = 'none';
        }
    }

    // ---- TOAST ----
    function showNotifToast(count) {
        const existing = document.querySelector('.notif-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'notif-toast';
        toast.innerHTML = `
            <div class="notif-toast-icon"><i class="fas fa-bell"></i></div>
            <div class="notif-toast-text">
                <strong>إشعار جديد</strong>
                <span>لديك ${count} إشعار${count > 1 ? 'ات' : ''} جديد${count > 1 ? 'ة' : ''}</span>
            </div>
        `;
        toast.onclick = () => {
            toast.remove();
            toggleNotifPanel();
        };
        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => toast.classList.add('show'));

        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 5000);
    }
})();
