// =========================================
// حالة التطبيق (السلة واللغة)
// (Translations and currentLang are now handled by lang.js)

let cart = [];

// ================= MOBILE MENU =================
function toggleMobileMenu() {
    const nav = document.getElementById('nav-links');
    if (nav) nav.classList.toggle('mobile-open');
}
document.addEventListener('click', function (e) {
    if (e.target.closest('.nav-links a')) {
        const nav = document.getElementById('nav-links');
        if (nav) nav.classList.remove('mobile-open');
    }
});

// =========================================
// 3. التهيئة عند التحميل (INITIALIZATION)
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. تطبيق اللغة المحفوظة
    updateLanguageUI();

    // 2. تحديث السلة
    updateCartUI();

    loadCart();

    document.addEventListener("click", function (e) {
        const btn = e.target.closest(".add-to-cart-btn");
        if (btn) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            addToCart(btn.dataset.id);
        }
    }, true); // 👈 مهم

    // 3. جلب المنتج وعرضه
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const container = document.getElementById('product-container');

    if (productId) {
        loadProduct(productId);
        document.addEventListener('languageChanged', () => {
            currentLang = localStorage.getItem('lang') || 'ar';
            loadProduct(productId);
        });
    } else {
        const t = translations[currentLang];
        container.innerHTML = `
            <div style="text-align:center; padding: 50px;">
                <h2>${t.notFound}</h2>
                <a href="index.html" class="btn btn-cart" style="display:inline-block; margin-top:20px; width:auto">${t.returnHome}</a>
            </div>`;
    }

    // 4. تشغيل زر البحث (Enter Key)
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
});

// =========================================
// 4. دالة عرض المنتج (RENDER)
// =========================================
function renderProduct(product, container) {
    const t = translations[currentLang];
    // تأكد من وجود صور - استخدام صورة افتراضية إذا لم توجد
    const galleryImages = product.images && product.images.length > 0 ? product.images : ["https://via.placeholder.com/500"];

    // حساب التوفير من الباك إند
    const hasDiscount = product.discount_percent > 0 && product.original_price;
    const saving = hasDiscount ? product.original_price - product.price : 0;

    const iconMap = {
        'المعالج': 'fas fa-microchip',
        'processor': 'fas fa-microchip',
        'الشاشة': 'fas fa-mobile-alt',
        'شاشة': 'fas fa-mobile-alt',
        'screen': 'fas fa-mobile-alt',
        'display': 'fas fa-mobile-alt',
        'الكاميرا': 'fas fa-camera',
        'كاميرا': 'fas fa-camera',
        'camera': 'fas fa-camera',
        'البطارية': 'fas fa-battery-full',
        'بطارية': 'fas fa-battery-full',
        'battery': 'fas fa-battery-full',
        'الرامات': 'fas fa-memory',
        'ram': 'fas fa-memory',
        'رام': 'fas fa-memory',
        'المساحة': 'fas fa-hdd',
        'مساحة': 'fas fa-hdd',
        'storage': 'fas fa-hdd',
        'التخزين': 'fas fa-hdd',
        'تخزين': 'fas fa-hdd',
        'نظام التشغيل': 'fab fa-android',
        'os': 'fab fa-android',
        'نظام تشغيل': 'fab fa-android'
    };

    let specItems = Object.entries(product.specs || {});
    let featuresHTML = '';

    let importantFeatures = specItems.filter(([key]) => {
        let k = key.toLowerCase().trim();
        return Object.keys(iconMap).some(ik => k.includes(ik));
    });

    let storageOptionsHTML = '';
    let storageOptions = [];
    if (product.storage_options && product.storage_options.length > 0) {
        storageOptions = typeof product.storage_options === 'string' ? JSON.parse(product.storage_options) : product.storage_options;
    }

    if (storageOptions.length > 0) {
        storageOptionsHTML = `
            <div class="options storage-selector" style="margin-top: 20px;">
                <h3>${currentLang === 'ar' ? 'اختر المساحة' : 'Select Storage'}</h3>
                <div class="features-grid" style="grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); margin-top: 10px;">
                    ${storageOptions.map((opt, index) => `
                        <div class="feature-item storage-item ${index === 0 ? 'selected' : ''}" 
                             style="cursor:pointer; border: 2px solid ${index === 0 ? '#ff9900' : 'transparent'}; box-shadow: 0 4px 10px rgba(0,0,0,0.05); transition: all 0.3s;"
                             onclick="selectStorageOption(this, ${opt.price}, ${product.discount_percent || 0})">
                            <i class="fas fa-hdd feature-icon" style="color: ${index === 0 ? '#ff9900' : '#00b894'}; margin-bottom: 5px;"></i>
                            <div class="feature-title" style="color: ${index === 0 ? '#ff9900' : 'inherit'}; font-weight: bold;">${opt.storage}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    if (importantFeatures.length > 0) {
        featuresHTML = '<div class="features-grid">';
        importantFeatures.forEach(([key, val]) => {
            let matchedIcon = 'fas fa-cogs';
            let k = key.toLowerCase().trim();
            for (let ik in iconMap) {
                if (k.includes(ik)) {
                    matchedIcon = iconMap[ik];
                    break;
                }
            }

            let displayKey = key;
            if (k.includes('معالج') || k.includes('processor')) displayKey = t.processorLabel || key;
            else if (k.includes('شاشة') || k.includes('screen') || k.includes('display')) displayKey = t.screenLabel || key;
            else if (k.includes('كاميرا') || k.includes('camera')) displayKey = t.cameraLabel || key;
            else if (k.includes('بطارية') || k.includes('battery')) displayKey = t.batteryLabel || key;
            else if (k.includes('رام') || k.includes('ram')) displayKey = t.ramLabel || key;
            else if (k.includes('تخزين') || k.includes('مساحة') || k.includes('storage')) displayKey = t.storageLabel || key;
            else if (k.includes('نظام') || k.includes('os')) displayKey = t.osLabel || key;

            // لا تعرض التخزين الأساسي إذا كانت هناك خيارات مساحات ديناميكية
            if (storageOptions.length > 0 && (k.includes('تخزين') || k.includes('مساحة') || k.includes('storage'))) {
                return;
            }

            featuresHTML += `
                <div class="feature-item">
                    <i class="${matchedIcon} feature-icon"></i>
                    <div class="feature-title">${displayKey}</div>
                    <div class="feature-value" dir="ltr">${val}</div>
                </div>
            `;
        });
        featuresHTML += '</div>';
    }

    container.innerHTML = `
        <div class="gallery-container animate__animated animate__fadeInRight">
            <img src="${galleryImages[0]}" id="mainImg" class="main-image">
            <div class="thumbnails">
                ${galleryImages.map((img, index) => `
                    <img src="${img}" class="thumb ${index === 0 ? 'active' : ''}" onclick="changeImage('${img}', this)">
                `).join('')}
            </div>
        </div>

        <div class="product-info animate__animated animate__fadeInLeft">
            <div class="sku">SKU: ${product.sku}</div>
            <h1>${product.name}</h1>
            
            <div class="price-box">
                ${hasDiscount ? `<span class="discount-badge-detail">-${product.discount_percent}%</span>` : ''}
                <span class="price">${product.price.toLocaleString()} ${t.currency}</span>
                ${hasDiscount ? `<span class="old-price">${product.original_price.toLocaleString()} ${t.currency}</span>` : ''}
                ${saving > 0 ? `<span class="badge-sale"><i class="fas fa-tag"></i> ${t.save} ${Math.round(saving).toLocaleString()} ${t.currency}</span>` : ''}
            </div>

            <div class="description">
                <p>${product.description.replace(/\n/g, '<br>')}</p>
            </div>

            <div class="options">
                <h3>${t.selectColor}</h3>
                <div class="color-options">
                    ${product.colors.map((color, index) => `
                        <div class="color-circle ${index === 0 ? 'selected' : ''}" style="background-color: ${color}" onclick="selectColor(this, ${index})"></div>
                    `).join('')}
                </div>
            </div>

            ${storageOptionsHTML}

            <div class="actions" style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button 
                    type="button" 
                    class="btn btn-cart add-to-cart-btn" 
                    data-id="${product.id}"
                    style="flex: 1;"
                >
                    <i class="fas fa-shopping-bag"></i> ${t.addToCart}
                </button>
                <button class="btn btn-whatsapp" onclick="openWhatsapp('${product.name}')" data-lang="whatsapp">
                    <i class="fab fa-whatsapp"></i> ${t.whatsapp}
                </button>
            </div>

            <div class="actions" style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 0;">
                <button type="button" class="btn btn-wishlist-detail ${isInWishlist(product.id) ? 'active' : ''}" onclick="toggleWishlist(${product.id}, this)" style="flex: 1;">
                    <i class="fas fa-heart"></i> <span>${isInWishlist(product.id) ? (currentLang === 'ar' ? 'في المفضلة' : 'In Wishlist') : t.addToWishlist}</span>
                </button>
                <button type="button" class="btn btn-compare-detail ${isInCompareList(product.id) ? 'active' : ''}" onclick="toggleCompareProduct(${product.id}, this)" style="flex: 1;">
                    <i class="fas fa-balance-scale"></i> <span>${isInCompareList(product.id) ? (currentLang === 'ar' ? 'في المقارنة' : 'In Compare') : t.addToCompare}</span>
                </button>
            </div>

            ${featuresHTML}
            <div class="accordion">
                <div class="accordion-item">
                    <div class="accordion-header" onclick="toggleAccordion(this)">
                        <span data-lang="shipping">${t.shipping}</span> <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="accordion-content open">
                        <p data-lang="shippingText">${t.shippingText}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// عرض المنتجات المشابهة
async function renderRelatedProducts(currentProduct) {
    const t = translations[currentLang];
    const grid = document.getElementById('related-grid');

    try {
        const res = await fetch(`${API_BASE}/products/`);
        const data = await res.json();

        console.log("RELATED FROM API:", data);

        // لو فيه pagination (Django بيعمل كده)
        const products = data.results || data;

        // استبعد المنتج الحالي
        const related = products
            .filter(p => p.id != currentProduct.id)
            .slice(0, 4);

        if (related.length === 0) {
            document.querySelector('.related-products').style.display = 'none';
            return;
        }

        grid.innerHTML = related.map(p => {
            const hasDiscount = p.discount_percent > 0 && p.original_price;
            const discountText = currentLang === 'ar' ? 'خصم' : 'Sale';
            const discountBadge = hasDiscount
                ? `<div class="discount-badge"><i class="fas fa-tag"></i> ${discountText} ${p.discount_percent}%</div>`
                : '';
            const priceHtml = hasDiscount
                ? `<p style="color:var(--primary); font-weight:bold; display:flex; gap:10px; justify-content:center; align-items:center; margin-bottom: 20px;">
                     <span style="color:#888; text-decoration:line-through; font-size:13px; font-weight:500;">${Number(p.original_price).toLocaleString()} ${t.currency}</span>
                     <span style="color:#ff4757; font-weight:800;">${Number(p.price).toLocaleString()} ${t.currency}</span>
                   </p>`
                : `<p style="color:var(--primary); font-weight:bold; margin-bottom: 20px;">
                     ${Number(p.price).toLocaleString()} ${t.currency}
                   </p>`;

            return `
                <div class="product-card" style="position:relative;">
                    ${discountBadge}
                    <a href="product.html?id=${p.id}" style="text-decoration:none; color:inherit">
                        <img src="${p.image
                    ? (p.image.startsWith('http') ? p.image : API_BASE + p.image)
                    : 'https://via.placeholder.com/250'
                }">
                        <h3>${p.name}</h3>
                        ${priceHtml}
                    </a>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 10px; gap: 10px;">
                        <button 
                            type="button"
                            class="btn btn-cart add-to-cart-btn"
                            data-id="${p.id}"
                            onclick="event.stopPropagation(); event.preventDefault();"
                            style="flex: 1;"
                        >
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error("RELATED ERROR:", err);
    }
}

// =========================================
// 5. وظائف السلة (CART LOGIC)
// =========================================
async function addToCart(productId) {
    try {
        const res = await fetch(`${API_BASE}/cart/add/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("access")
            },
            body: JSON.stringify({
                product: productId,
                quantity: 1
            })
        });

        if (!res.ok) {
            showToast(currentLang === 'ar'
                ? "لازم تسجل دخول الأول ❌"
                : "Please login first ❌"
            );
            return;
        }

        showToast(currentLang === 'ar'
            ? "تم إضافة المنتج للسلة 🛒"
            : "Added to cart 🛒"
        );

        await loadCart();

        const cartPanel = document.querySelector(".cart-panel");
        const overlay = document.querySelector(".cart-overlay");
        if(cartPanel) cartPanel.classList.add("open");
        if(overlay) overlay.classList.add("open");

    } catch (err) {
        console.error("ADD TO CART ERROR:", err);
        showToast(currentLang === 'ar'
            ? "حصل خطأ ❌"
            : " Error ❌"
        );
    }
}

async function loadCart() {
    const token = localStorage.getItem("access");

    if (!token) {
        console.log("❌ مفيش token");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/cart/`, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await res.json();
        console.log("CART DATA:", data);

        const items = data.results || data; // 🔥 الحل هنا

        cart = items.map(item => ({
            id: item.id,
            productId: item.product.id,
            name: item.product.name,
            price: parseFloat(item.product.price),
            image: item.product.image
                ? (item.product.image.startsWith('http')
                    ? item.product.image
                    : API_BASE + item.product.image)
                : 'https://via.placeholder.com/100',
            qty: item.quantity
        }));

        updateCartUI();

    } catch (err) {
        console.error("LOAD CART ERROR:", err);
    }
}

async function increaseQty(index) {
    const item = cart[index];

    await fetch(`${API_BASE}/cart/add/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("access")
        },
        body: JSON.stringify({
            product: item.productId,
            quantity: 1
        })
    });

    loadCart(); // 🔥 تحديث من السيرفر
}

async function decreaseQty(index) {
    const item = cart[index];

    if (item.qty > 1) {
        // نقلل الكمية
        await fetch(`${API_BASE}/cart/add/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("access")
            },
            body: JSON.stringify({
                product: item.productId,
                quantity: -1 // 👈 مهم
            })
        });
    } else {
        // لو 1 → نحذف
        await fetch(`${API_BASE}/cart/delete/${item.id}/`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("access")
            }
        });
    }

    loadCart();
}

async function removeFromCart(itemId) {
    try {
        await fetch(`${API_BASE}/cart/delete/${itemId}/`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("access")
            }
        });

        loadCart();

    } catch (err) {
        console.error("DELETE ERROR:", err);
    }
}

function updateCartUI() {
    const t = translations[currentLang];
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count'); // العداد في النافبار
    const cartCountPanel = document.querySelector('.badge'); // العداد الاحتياطي
    const cartTotal = document.getElementById('cart-total');

    // تحديث العداد
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCount) cartCount.innerText = totalQty;
    if (cartCountPanel) cartCountPanel.innerText = totalQty;

    // تحديث قائمة المنتجات
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p style="text-align:center; padding:20px; color:#777">السلة فارغة 🛒</p>`;
    } else {
        cart.forEach((item, index) => {
            total += item.price * item.qty;
            cartItemsContainer.innerHTML += `
                <div style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">
                    <div style="display:flex; gap:10px;">
                        <img src="${item.image}" style="width:50px; height:50px; object-fit:cover; border-radius:8px;">
                        <div>
                            <h4 style="font-size:14px; margin:0;">${item.name}</h4>
                            <div class="qty">
                                <button onclick="decreaseQty(${index})">-</button>
                                <span>${item.qty}</span>
                                <button onclick="increaseQty(${index})">+</button>
                            </div>
                        </div>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:end; justify-content:space-between;">
                        <span style="color:red; cursor:pointer; font-size:12px;" onclick="removeFromCart('${item.id}')">❌</span>
                        <span style="font-weight:bold">${(item.price * item.qty).toLocaleString()}</span>
                    </div>
                </div>
            `;
        });
    }

    // تحديث المجموع
    if (cartTotal) cartTotal.innerText = total.toLocaleString();
}

function toggleCartPanel() {
    document.querySelector('.cart-panel').classList.toggle('open');
}

// =========================================
// 6. البحث واللغة (SEARCH & LANG)
// =========================================
function toggleSearch() {
    const overlay = document.getElementById('search-overlay');
    overlay.classList.toggle('active');
    if (overlay.classList.contains('active')) {
        setTimeout(() => document.getElementById('search-input').focus(), 100);
    }
}

function performSearch() {
    const query = document.getElementById('search-input').value.toLowerCase();
    if (!query) return;

    // بحث بسيط في قاعدة البيانات
    const found = productsDB.find(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));

    if (found) {
        window.location.href = `product.html?id=${found.id}`;
    } else {
        alert(currentLang === 'ar' ? 'لم يتم العثور على منتج بهذا الاسم' : 'No product found with this name');
    }
    toggleSearch(); // إغلاق البحث
}

function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('lang', currentLang);
    location.reload(); // إعادة تحميل الصفحة لتطبيق التغييرات بالكامل
}

function updateLanguageUI() {
    const t = translations[currentLang];

    // 1. اتجاه الصفحة
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.body.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

    // 2. تحديث النصوص الثابتة
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        if (t[key]) el.innerText = t[key];
    });

    // Update button text
    const langBtn = document.querySelector('.lang-btn');
    if (langBtn) {
        const textSpan = langBtn.querySelector('.lang-text');
        if (textSpan) {
            textSpan.innerText = currentLang === 'ar' ? 'EN' : 'AR';
        } else {
            langBtn.innerText = currentLang === 'ar' ? 'EN' : 'AR';
        }
    }

    // 4. Update Auth State UI text
    if (typeof checkUserAuth === 'function') {
        checkUserAuth();
    }
}

// =========================================
// 7. التفاعلات البصرية (UI INTERACTIONS)
// =========================================
window.changeImage = (src, thumb) => {
    const mainImg = document.getElementById('mainImg');

    // إخفاء الصورة تدريجياً
    mainImg.style.opacity = '0.3';

    setTimeout(() => {
        mainImg.src = src;
        // إظهار الصورة تدريجياً
        mainImg.style.opacity = '1';
    }, 150);

    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
};

window.selectColor = (circle, index) => {
    document.querySelectorAll('.color-circle').forEach(c => c.classList.remove('selected'));
    circle.classList.add('selected');

    // Change image corresponding to the selected color
    const thumbs = document.querySelectorAll('.thumb');
    if (thumbs && thumbs.length > 0) {
        if (index !== undefined && index < thumbs.length) {
            const src = thumbs[index].getAttribute('src');
            changeImage(src, thumbs[index]);
        } else {
            const src = thumbs[0].getAttribute('src');
            changeImage(src, thumbs[0]);
        }
    }
};

window.toggleAccordion = (header) => {
    const content = header.parentNode.querySelector('.accordion-content');
    const icon = header.querySelector('i');

    if (content.style.maxHeight || content.classList.contains('open')) {
        content.style.maxHeight = null;
        content.classList.remove('open');
        icon.style.transform = "rotate(0deg)";
    } else {
        content.style.maxHeight = content.scrollHeight + "px";
        content.classList.add('open');
        icon.style.transform = "rotate(180deg)";
    }
};

window.openWhatsapp = (productName) => {
    const msg = `مرحباً، أود الاستفسار عن المنتج: ${productName}`;
    window.open(`https://wa.me/201xxxxxxxxx?text=${encodeURIComponent(msg)}`, '_blank');
};
// ==================== دوال نافذة إتمام الشراء (Checkout) ====================

// متغير لحفظ السعر الحالي
let cartTotalAmount = 0;

// 1. فتح النافذة
// عرفناها على window عشان نضمن إن الـ HTML يشوفها
window.openCheckout = function () {
    const modal = document.getElementById('checkout-modal');

    // محاولة قراءة السعر من السلة
    const cartTotalElement = document.getElementById('cart-total');

    if (cartTotalElement) {
        // تحويل النص "48,000" لرقم 48000
        let priceText = cartTotalElement.innerText;
        // إزالة الفاصلة والرموز غير الرقمية
        cartTotalAmount = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
    }

    // تحديث السعر في النافذة
    const finalTotalElement = document.getElementById('final-total');
    if (finalTotalElement) {
        finalTotalElement.innerText = cartTotalAmount.toLocaleString() + " " + translations[currentLang].currency;
        finalTotalElement.style.color = "#232f3e"; // إعادة اللون للأصلي لو كان متغير بسبب خصم سابق
    }

    if (modal) {
        modal.style.display = 'block';
    } else {
        console.error("عنصر checkout-modal غير موجود في الصفحة");
    }
}

// 2. غلق النافذة
window.closeCheckout = function () {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.style.display = 'none';
}

// 3. تبديل تفاصيل الدفع
window.changePaymentMethod = function () {
    // إخفاء كل التفاصيل الأول
    document.querySelectorAll('.details-section').forEach(div => {
        div.classList.remove('active');
    });

    // معرفة الاختيار الحالي
    const selectedRadio = document.querySelector('input[name="payment"]:checked');
    if (!selectedRadio) return;

    const selected = selectedRadio.value;

    // إظهار القسم المناسب
    if (selected === 'cash') {
        const el = document.getElementById('details-cash');
        if (el) el.classList.add('active');
    } else if (selected === 'valu') {
        const el = document.getElementById('details-valu');
        if (el) el.classList.add('active');
    } else if (selected === 'halan') {
        const el = document.getElementById('details-halan');
        if (el) el.classList.add('active');
    } else if (selected === 'instapay') {
        const el = document.getElementById('details-instapay');
        if (el) el.classList.add('active');
    } else if (selected === 'vodafone') {
        const el = document.getElementById('details-vodafone');
        if (el) el.classList.add('active');
    }
}

// 4. تطبيق كود الخصم
window.applyCoupon = function () {
    const codeInput = document.getElementById('coupon-code');
    const finalTotalElement = document.getElementById('final-total');

    if (!codeInput || !finalTotalElement) return;

    const code = codeInput.value.trim().toUpperCase();

    if (code === "MAZEN10") {
        alert("مبروك! تم تطبيق خصم 10%");
        let discount = cartTotalAmount * 0.10;
        let newTotal = cartTotalAmount - discount;
        finalTotalElement.innerText = newTotal.toLocaleString() + " " + translations[currentLang].currency;
        finalTotalElement.style.color = "green";
    } else {
        alert("كود الخصم غير صحيح");
        finalTotalElement.innerText = cartTotalAmount.toLocaleString() + " " + translations[currentLang].currency;
        finalTotalElement.style.color = "#232f3e";
    }
}

// 5. تأكيد الطلب
window.submitOrder = function () {
    const nameInput = document.getElementById('cust-name');
    const phoneInput = document.getElementById('cust-phone');
    const addressInput = document.getElementById('cust-address');

    if (!nameInput || !phoneInput || !addressInput) return;

    if (nameInput.value === "" || phoneInput.value === "" || addressInput.value === "") {
        alert("من فضلك أكمل بيانات الشحن (الاسم، الموبايل، العنوان)");
        return;
    }

    const selectedRadio = document.querySelector('input[name="payment"]:checked');
    const paymentMethod = selectedRadio ? selectedRadio.value : "غير محدد";

    alert(`شكراً يا ${nameInput.value}!\nتم استلام طلبك بنجاح.\nوسيلة الدفع: ${paymentMethod}\nسنتواصل معك على رقم ${phoneInput.value} للتأكيد.`);

    closeCheckout();

    // تفريغ السلة بعد الطلب الناجح
    cart = [];
    renderCart();
}

// إغلاق النافذة عند الضغط خارجها
window.onclick = function (event) {
    const modal = document.getElementById('checkout-modal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
// =========================================
// DARK MODE SYSTEM (نظام الوضع الليلي)
// =========================================

// عند تحميل الصفحة، نتحقق من الوضع المحفوظ
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const toggleBtn = document.getElementById('theme-toggle');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (toggleBtn) toggleBtn.checked = true; // تفعيل الزر
    }
});

function toggleTheme() {
    const body = document.body;
    const toggleBtn = document.getElementById('theme-toggle');

    body.classList.toggle('dark-mode');

    // حفظ الاختيار في المتصفح
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

const API_BASE = "https://web-production-2a731.up.railway.app";

function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function loadProduct(id) {

    if (!id) return;

    const container = document.getElementById('product-container');

    try {
        const res = await fetch(`${API_BASE}/products/${id}/`);
        const data = await res.json();

        console.log("DATA FROM API:", data);

        let desc = data.description || '';
        let specsObj = {
            "السعر": Number(data.price).toLocaleString() + ' ' + translations[currentLang].currency,
            "المخزون": data.stock
        };

        let extractedSku = "SKU-" + data.id;
        let extractedColors = ["#000", "#ccc"]; // Default colors

        const extrasIndex = desc.indexOf('--- مواصفات إضافية ---');
        if (extrasIndex !== -1) {
            const mainDesc = desc.substring(0, extrasIndex).trim();
            const extrasStr = desc.substring(extrasIndex + '--- مواصفات إضافية ---'.length).trim();
            desc = mainDesc;

            extrasStr.split('\n').forEach(line => {
                line = line.trim();
                if (line.includes(':')) {
                    const parts = line.split(':');
                    const key = parts[0].trim();
                    const val = parts.slice(1).join(':').trim();
                    specsObj[key] = val;
                    if (key.toUpperCase() === 'SKU') {
                        extractedSku = val;
                    }
                    if (key === 'اللون' || key === 'الألوان' || key.toLowerCase() === 'colors') {
                        // Extract hex codes or color names separated by commas
                        extractedColors = val.split(/[,،]/).map(c => c.trim()).filter(c => c);
                    }
                }
            });
        }

        const techSpecsMap = {
            'المعالج': data.processor,
            'الشاشة': data.screen,
            'الكاميرا': data.camera,
            'البطارية': data.battery,
            'الرامات': data.ram,
            'التخزين': data.storage,
            'نظام التشغيل': data.os
        };
        for (const [sKey, sVal] of Object.entries(techSpecsMap)) {
            if (sVal) {
                specsObj[sKey] = sVal;
            }
        }

        const product = {
            id: data.id,
            name: data.name,
            price: Number(data.price),
            original_price: data.original_price ? Number(data.original_price) : null,
            discount_percent: data.discount_percent || 0,
            description: desc,
            sku: extractedSku,
            images: [
                data.image
                    ? (data.image.startsWith('http')
                        ? data.image
                        : API_BASE + data.image)
                    : 'https://via.placeholder.com/500',
                ...(data.gallery || []).map(g => g.url.startsWith('http') ? g.url : API_BASE + g.url)
            ],
            colors: extractedColors,
            specs: specsObj, storage_options: data.storage_options || []
        };

        renderProduct(product, container);
        renderRelatedProducts(product);
        loadReviews(product.id);

    } catch (err) {
        console.error("ERROR:", err);
    }
}

function showToast(message, color = "#041e0d") {
    const toast = document.createElement("div");

    toast.innerText = message;

    toast.style = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: ${color};
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        font-size: 14px;
        z-index: 9999;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
        opacity: 0;
        transform: translateY(20px);
        transition: 0.3s;
    `;

    document.body.appendChild(toast);

    // animation
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    }, 10);

    // remove بعد 2 ثانية
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(20px)";
        setTimeout(() => toast.remove(), 800);
    }, 2000);
}


// =========================================
// WISHLIST SYSTEM (Product Page)
// =========================================

let wishlistIds = JSON.parse(localStorage.getItem('wishlistIds') || '[]');

function isInWishlist(productId) {
    return wishlistIds.includes(Number(productId));
}

async function toggleWishlist(productId, btnEl) {
    productId = Number(productId);
    const token = localStorage.getItem('access');
    const t = translations[currentLang];

    if (!token) {
        showToast(t.loginForWishlist || 'سجل دخول عشان تضيف للمفضلة', '#ff4757');
        return;
    }

    if (isInWishlist(productId)) {
        try {
            await fetch(`${API_BASE}/wishlist/remove/`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ product: productId })
            });
        } catch (err) { console.error(err); }
        wishlistIds = wishlistIds.filter(id => id !== productId);
        showToast(t.removeFromWishlist || 'تم الإزالة من المفضلة', '#ff4757');
        if (btnEl) {
            btnEl.classList.remove('active');
            const span = btnEl.querySelector('span');
            if (span) span.textContent = t.addToWishlist;
        }
    } else {
        try {
            await fetch(`${API_BASE}/wishlist/add/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ product: productId })
            });
        } catch (err) { console.error(err); }
        if (!wishlistIds.includes(productId)) wishlistIds.push(productId);
        showToast(t.addedToWishlist || 'تم الإضافة للمفضلة ❤️');
        if (btnEl) {
            btnEl.classList.add('active');
            const span = btnEl.querySelector('span');
            if (span) span.textContent = currentLang === 'ar' ? 'في المفضلة' : 'In Wishlist';
        }
    }

    localStorage.setItem('wishlistIds', JSON.stringify(wishlistIds));
    updateWishlistBadge();

    // Open wishlist panel automatically
    const panel = document.getElementById('wishlist-panel');
    const overlay = document.getElementById('wishlist-overlay');
    if (panel) panel.classList.add('open');
    if (overlay) overlay.classList.add('open');
    if (typeof renderWishlistPanel === "function") renderWishlistPanel();
}

async function removeFromWishlistAPI(productId) {
    productId = Number(productId);
    const token = localStorage.getItem('access');
    if (token) {
        try {
            await fetch(`${API_BASE}/wishlist/remove/`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ product: productId })
            });
        } catch (err) { console.error(err); }
    }
    wishlistIds = wishlistIds.filter(id => id !== productId);
    localStorage.setItem('wishlistIds', JSON.stringify(wishlistIds));
    updateWishlistBadge();
    renderWishlistPanel();
    showToast(translations[currentLang].removeFromWishlist || 'تم الإزالة', '#ff4757');
}

function updateWishlistBadge() {
    const el = document.getElementById('wishlist-count');
    if (el) el.textContent = wishlistIds.length;
}

function toggleWishlistPanel() {
    const panel = document.getElementById('wishlist-panel');
    const overlay = document.getElementById('wishlist-overlay');
    if (!panel || !overlay) return;
    const isOpen = panel.classList.contains('open');
    if (isOpen) {
        panel.classList.remove('open');
        overlay.classList.remove('open');
    } else {
        panel.classList.add('open');
        overlay.classList.add('open');
        renderWishlistPanel();
    }
}

async function renderWishlistPanel() {
    const body = document.getElementById('wishlist-panel-body');
    if (!body) return;
    const t = translations[currentLang];
    const currency = t.currency || 'ج.م';

    if (wishlistIds.length === 0) {
        body.innerHTML = `<div style="text-align:center;padding:60px 20px;opacity:0.5;"><i class="far fa-heart" style="font-size:50px;display:block;margin-bottom:15px;"></i><p>${t.wishlistEmpty || 'المفضلة فارغة'}</p></div>`;
        return;
    }

    // Fetch product details for each wishlist item
    let html = '';
    for (const productId of wishlistIds) {
        try {
            const res = await fetch(`${API_BASE}/products/${productId}/`);
            const p = await res.json();
            const imgUrl = p.image ? (p.image.startsWith('http') ? p.image : API_BASE + p.image) : 'https://via.placeholder.com/70';
            html += `
        <div style="display:flex;align-items:center;gap:14px;padding:14px;border-radius:16px;background:var(--card-bg);margin-bottom:12px;border:1px solid var(--border);">
          <img src="${imgUrl}" style="width:70px;height:70px;object-fit:contain;border-radius:12px;">
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
            <div style="color:#ff9900;font-weight:800;font-size:15px;">${Number(p.price).toLocaleString()} ${currency}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <button onclick="addToCart(${p.id}); showToast('${t.addToCart}')" style="background:linear-gradient(135deg,#232f3e,#34495e);color:white;border:none;padding:7px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;"><i class="fas fa-cart-plus"></i></button>
            <button onclick="removeFromWishlistAPI(${p.id})" style="background:none;border:1px solid #ff4757;color:#ff4757;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;"><i class="fas fa-trash-alt"></i></button>
          </div>
        </div>
      `;
        } catch (err) { console.error(err); }
    }
    body.innerHTML = html;
}

// Load wishlist from API
async function loadWishlistFromAPI() {
    const token = localStorage.getItem('access');
    if (!token) return;
    try {
        const res = await fetch(`${API_BASE}/wishlist/`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
            const data = await res.json();
            wishlistIds = data.map(item => item.product);
            localStorage.setItem('wishlistIds', JSON.stringify(wishlistIds));
            updateWishlistBadge();
        }
    } catch (err) { console.error(err); }
}

// =========================================
// COMPARE SYSTEM (Product Page)
// =========================================

let compareList = JSON.parse(localStorage.getItem('compareList') || '[]');

function isInCompareList(productId) {
    return compareList.includes(Number(productId));
}

function toggleCompareProduct(productId, btnEl) {
    productId = Number(productId);
    const t = translations[currentLang];

    if (isInCompareList(productId)) {
        compareList = compareList.filter(id => id !== productId);
        showToast(t.removeCompare || 'تم الإزالة من المقارنة', '#ff4757');
        if (btnEl) {
            btnEl.classList.remove('active');
            const span = btnEl.querySelector('span');
            if (span) span.textContent = t.addToCompare;
        }
    } else {
        if (compareList.length >= 4) {
            showToast(currentLang === 'ar' ? 'الحد الأقصى 4 منتجات' : 'Maximum 4 products', '#ff4757');
            return;
        }
        compareList.push(productId);
        showToast(t.addToCompare || 'تم الإضافة للمقارنة ⚖️');
        if (btnEl) {
            btnEl.classList.add('active');
            const span = btnEl.querySelector('span');
            if (span) span.textContent = currentLang === 'ar' ? 'في المقارنة' : 'In Compare';
        }
    }

    localStorage.setItem('compareList', JSON.stringify(compareList));
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    updateWishlistBadge();
    loadWishlistFromAPI();
});

// =========================================
// REVIEWS SYSTEM
// =========================================

// تحميل التقييمات
async function loadReviews(productId) {
    const listContainer = document.getElementById('reviews-list');
    if (!listContainer) return;

    try {
        const res = await fetch(`${API_BASE}/api/reviews/product/${productId}/`);
        const reviews = await res.json();

        const t = translations[currentLang] || translations['en'];

        if (reviews.length === 0) {
            listContainer.innerHTML = `<p class="no-reviews">${t.noReviews}</p>`;
            return;
        }

        listContainer.innerHTML = reviews.map(review => {
            // Stars HTML
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= review.rating) {
                    starsHtml += '<i class="fas fa-star"></i>';
                } else {
                    starsHtml += '<i class="far fa-star"></i>';
                }
            }

            const date = new Date(review.created_at).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            });

            return `
                <div class="review-item animate__animated animate__fadeIn">
                    <div class="review-header">
                        <div class="review-author">
                            <i class="fas fa-user-circle"></i>
                            <span>${review.user || t.roleUser}</span>
                        </div>
                        <div class="review-date">${date}</div>
                    </div>
                    <div class="review-stars">
                        ${starsHtml}
                    </div>
                    <div class="review-text">
                        ${review.comment || ''}
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error("Error loading reviews:", err);
        listContainer.innerHTML = `<p class="no-reviews" style="color:red">${translations[currentLang].toastConnError || 'حدث خطأ'}</p>`;
    }
}

// التفاعل مع النجوم
document.addEventListener('DOMContentLoaded', () => {
    const stars = document.querySelectorAll('#rating-stars i');
    const ratingInput = document.getElementById('review-rating');

    if (stars && ratingInput) {
        stars.forEach(star => {
            star.addEventListener('click', function () {
                const value = parseInt(this.getAttribute('data-value'));
                ratingInput.value = value;

                stars.forEach(s => {
                    if (parseInt(s.getAttribute('data-value')) <= value) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });
        });
    }

    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const token = localStorage.getItem('access');
            const loginMsg = document.getElementById('review-login-msg');

            if (!token) {
                loginMsg.style.display = 'block';
                setTimeout(() => loginMsg.style.display = 'none', 3000);
                return;
            }

            const rating = document.getElementById('review-rating').value;
            const comment = document.getElementById('review-comment').value;
            const productId = new URLSearchParams(window.location.search).get('id');

            if (rating === "0") {
                alert(currentLang === 'ar' ? 'برجاء اختيار التقييم بالنجمات أولاً' : 'Please select a star rating first');
                return;
            }

            try {
                const btn = this.querySelector('button[type="submit"]');
                const originalText = btn.innerText;
                btn.innerText = currentLang === 'ar' ? 'جاري الإرسال...' : 'Submitting...';
                btn.disabled = true;

                const res = await fetch(`${API_BASE}/api/reviews/add/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({
                        product: productId,
                        rating: parseInt(rating),
                        comment: comment
                    })
                });

                if (res.ok) {
                    showToast(currentLang === 'ar' ? 'تم إضافة تقييمك بنجاح شكراً لك!' : 'Review added successfully! Thank you!');
                    this.reset();
                    // Reset stars
                    ratingInput.value = "0";
                    stars.forEach(s => { s.classList.remove('fas'); s.classList.add('far'); });

                    // Reload reviews
                    loadReviews(productId);
                } else {
                    const errorData = await res.json();
                    if (errorData.message === 'Review already exists') {
                        showToast(currentLang === 'ar' ? 'لقد قمت بتقييم هذا المنتج مسبقاً!' : 'You have already reviewed this product!', '#ff4757');
                    } else {
                        showToast(currentLang === 'ar' ? 'حدث خطأ. حاول مرة أخرى.' : 'Error occurred. Try again.', '#ff4757');
                    }
                }

                btn.innerText = originalText;
                btn.disabled = false;

            } catch (err) {
                console.error("Error submitting review:", err);
                showToast('خطأ في الاتصال بالسيرفر', '#ff4757');
            }
        });
    }
});


// =========================================
// 8. Auth State UI
// =========================================
function checkUserAuth() {
    const authArea = document.getElementById('user-auth-area');
    const user = JSON.parse(localStorage.getItem('currentUser'));

    if (!authArea) return;

    if (user) {
        if (user.is_admin) {
            const adminText = currentLang === 'ar' ? 'أدمن' : 'Admin';
            authArea.innerHTML = `
                <div class="user-profile-btn" onclick="window.location.href='admin.html'" style="background:#0e9374; color:white; cursor:pointer; display:flex; align-items:center; gap:8px; padding:8px 15px; border-radius:25px; font-weight:600;">
                    <i class="fas fa-shield-halved"></i>
                    <span>${adminText} (${user.name.split(' ')[0]})</span> 
                </div>
            `;
        } else {
            authArea.innerHTML = `
                <div class="user-profile-btn" onclick="window.location.href='profile.html'" style="background:rgba(255,255,255,0.1); color:white; cursor:pointer; display:flex; align-items:center; gap:8px; padding:8px 15px; border-radius:25px; font-weight:600; border:1px solid rgba(255,255,255,0.1);">
                    <i class="fas fa-user-circle"></i>
                    <span>${user.name.split(' ')[0]}</span> 
                </div>
            `;
        }
    } else {
        authArea.innerHTML = `
            <button class="login-btn-modern" onclick="window.location.href='login.html'">
                ${currentLang === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </button>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkUserAuth();
});

// =========================================
// STORAGE SELECTION LOGIC
// =========================================
window.selectStorageOption = function (element, newPrice, discountPercent) {
    // 1. Update active state of storage boxes
    document.querySelectorAll('.storage-item').forEach(item => {
        item.classList.remove('selected');
        item.style.borderColor = 'transparent';
        const icon = item.querySelector('.feature-icon');
        const title = item.querySelector('.feature-title');
        if (icon) icon.style.color = '#00b894';
        if (title) title.style.color = 'inherit';
    });

    element.classList.add('selected');
    element.style.borderColor = '#ff9900';
    const activeIcon = element.querySelector('.feature-icon');
    const activeTitle = element.querySelector('.feature-title');
    if (activeIcon) activeIcon.style.color = '#ff9900';
    if (activeTitle) activeTitle.style.color = '#ff9900';

    // 2. Calculate prices based on the new base price
    const t = translations[currentLang];
    const priceBox = document.querySelector('.price-box');
    if (!priceBox) return;

    let hasDiscount = discountPercent > 0;
    let finalPrice = newPrice;
    let oldPrice = 0;
    let saving = 0;

    if (hasDiscount) {
        oldPrice = newPrice / (1 - (discountPercent / 100));
        saving = oldPrice - newPrice;
    }

    // 3. Update the UI
    let priceHTML = '';
    if (hasDiscount) {
        priceHTML += `<span class="discount-badge-detail">-${discountPercent}%</span>`;
    }
    priceHTML += `<span class="price">${Number(finalPrice).toLocaleString()} ${t.currency}</span>`;
    if (hasDiscount) {
        priceHTML += `<span class="old-price">${Number(oldPrice).toLocaleString()} ${t.currency}</span>`;
    }
    if (saving > 0) {
        priceHTML += `<span class="badge-sale"><i class="fas fa-tag"></i> ${t.save || (currentLang === 'ar' ? 'توفير' : 'Save')} ${Math.round(saving).toLocaleString()} ${t.currency}</span>`;
    }

    priceBox.innerHTML = priceHTML;
};
