// ================= CART SYSTEM =================
const cartPanel = document.getElementById("cart-panel");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");

// ================= API =================
const PRODUCTS_API = `${API_BASE}/api/products/`;

let productsData = []; // هنا هنخزن المنتجات من الباك

let cart = [];

function toggleCart() {
  cartPanel.classList.toggle("open");
}

// ================= MOBILE MENU =================
function toggleMobileMenu() {
  const nav = document.getElementById('nav-links');
  if (nav) nav.classList.toggle('mobile-open');
}
// Close mobile menu when a link is clicked
document.addEventListener('click', function (e) {
  if (e.target.closest('.nav-links a')) {
    const nav = document.getElementById('nav-links');
    if (nav) nav.classList.remove('mobile-open');
  }
});

async function addToCart(id) {
  try {
    const res = await fetch(`${API_BASE}/api/cart/add/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("access")
      },
      body: JSON.stringify({
        product: id,
        quantity: 1
      })
    });

    if (!res.ok) {
      alert("لازم تسجل دخول");
      return;
    }

    loadCart(); // 🔥 أهم حاجة
    showToast("تم إضافة المنتج للسلة 🛒");

    // Open Cart Panel
    const overlay = document.querySelector(".cart-overlay");
    if(overlay) overlay.classList.add("open");
    cartPanel.classList.add("open");

  } catch (err) {
    console.error(err);
  }
}

function renderCart() {
  cartItems.innerHTML = "";
  let total = 0, count = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = `<p class="empty">${translations[currentLang].cartEmpty}</p>`;
    cartTotal.innerText = 0;
    cartCount.innerText = 0;
    return;
  }

  cart.forEach((item, index) => {
    total += item.price * item.qty;
    count += item.qty;

    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");

    cartItem.innerHTML = `
      <div style="display:flex; gap:10px;">
        <img src="${item.image
        ? (item.image.startsWith('http')
          ? item.image
          : 'https://web-production-2a731.up.railway.app' + item.image)
        : 'https://via.placeholder.com/50'
      }" style="width:50px;height:50px;object-fit:cover;border-radius:6px;">

        <div class="info">
          <h4>${item.name}</h4>
          <div class="qty">
            <button data-index="${index}" class="decrease">-</button>
            <span>${item.qty}</span>
            <button data-index="${index}" class="increase">+</button>
          </div>
        </div>
      </div>

      <div class="price">
        <span>${(item.price * item.qty).toLocaleString()} ج</span>
        <div data-index="${index}" class="remove">حذف</div>
      </div>
    `;

    cartItems.appendChild(cartItem);
  });

  // تحديث السعر الإجمالي في السلة
  cartTotal.innerText = total.toLocaleString();
  // تحديث كلاس السعر الإجمالي لربطه بالـ Checkout
  cartTotal.className = "cart-total-price";

  cartCount.innerText = count;

  document.querySelectorAll(".increase").forEach(btn =>
    btn.onclick = () => increaseQty(btn.dataset.index)
  );
  document.querySelectorAll(".decrease").forEach(btn =>
    btn.onclick = () => decreaseQty(btn.dataset.index)
  );
  document.querySelectorAll(".remove").forEach(btn =>
    btn.onclick = () => removeItem(btn.dataset.index)
  );
}

async function loadCart() {
  try {
    const res = await fetch(`${API_BASE}/api/cart/`, {
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("access")
      }
    });

    const data = await res.json();

    console.log("CART FROM API:", data); // 👈 مهم

    const items = data.results || data;

    cart = items.map(item => ({
      id: item.id,
      productId: item.product.id,
      name: item.product.name,
      price: parseFloat(item.product.price),
      image: item.product.image,
      qty: item.quantity
    }));

    renderCart();

  } catch (err) {
    console.error(err);
  }
}

async function increaseQty(index) {
  const item = cart[index];

  await fetch(`${API_BASE}/api/cart/add/`, {
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
    await fetch(`${API_BASE}/api/cart/add/`, {
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
    await fetch(`${API_BASE}/api/cart/delete/${item.id}/`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("access")
      }
    });
  }

  loadCart();
}

async function removeItem(index) {
  const item = cart[index];

  await fetch(`${API_BASE}/api/cart/delete/${item.id}/`, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("access")
    }
  });

  loadCart();
}

document.addEventListener("click", function (e) {
  if (
    cartPanel.classList.contains("open") &&
    !cartPanel.contains(e.target) &&
    !e.target.closest(".cart-icon") &&
    !e.target.closest(".add-to-cart-btn") // إضافة استثناء لأزرار الإضافة
  ) {
    cartPanel.classList.remove("open");
  }
});


// ================= BRAND + SEARCH FILTER =================

let currentBrand = "all";
let categoriesData = [];

function filterBrand(brand, btnEl) {
  currentBrand = brand;

  // تحديث active class على أزرار الكاتيجوري
  document.querySelectorAll('.brand-list .cat-btn, .brand-list div, #category-filter .cat-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  // الحفاظ على فلتر النوع من الـ URL
  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get('type') || null;
  const accParam = urlParams.get('acc') || null;

  // لو typeParam هو 'store' مش نوع منتج حقيقي، نبعت null عشان نجيب كل المنتجات
  const productType = (typeParam === 'store' || typeParam === null) ? null : typeParam;

  loadProductsFromAPI(brand, productType, accParam);
}

const searchInput = document.getElementById("search-input");
if (searchInput) {
  let timeout;
  searchInput.addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(applyFilters, 300);
  });
}

function applyFilters() {
  const query = searchInput ? searchInput.value.toLowerCase() : "";
  const products = document.querySelectorAll(".product-card");

  products.forEach(product => {
    const name = product.querySelector("h3").innerText.toLowerCase();
    const brand = product.dataset.brand;

    const matchBrand = currentBrand === "all" || brand === currentBrand;
    const matchSearch = name.includes(query);

    if (matchBrand && matchSearch) {
      product.style.display = "block";
    } else {
      product.style.display = "none";
    }
  });
}

// ================= LOAD CATEGORIES FROM API =================
async function loadCategoriesForFilter(activeBrand = null) {
  try {
    const res = await fetch(`${API_BASE}/api/products/categories/`);
    const data = await res.json();
    categoriesData = data;

    // أزرار الفلتر (تظهر فقط في صفحة الهواتف)
    const filterContainer = document.getElementById('category-filter');
    if (filterContainer) {
      const allLabel = translations[currentLang].all || 'الكل';
      const isAllActive = !activeBrand || activeBrand === 'all';
      filterContainer.innerHTML = `<div class="cat-btn ${isAllActive ? 'active' : ''}" onclick="filterBrand('all', this)">${allLabel}</div>`;

      data.forEach(cat => {
        const isActive = activeBrand && cat.name.toLowerCase() === activeBrand.toLowerCase();
        const div = document.createElement('div');
        div.className = 'cat-btn' + (isActive ? ' active' : '');
        div.textContent = cat.name;
        div.onclick = function () { filterBrand(cat.name.toLowerCase(), this); };
        filterContainer.appendChild(div);
      });
    }

    // Navbar dropdown
    const navDropdown = document.getElementById('nav-brand-dropdown');
    if (navDropdown) {
      navDropdown.innerHTML = '';
      data.forEach(cat => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="index.html?type=phone&brand=${encodeURIComponent(cat.name.toLowerCase())}">${cat.name}</a>`;
        navDropdown.appendChild(li);
      });
    }
  } catch (err) {
    console.error('Error loading categories:', err);
  }
}


// ================= SUPPORT FORM =================
const supportForm = document.getElementById("support-form");
if (supportForm) {
  supportForm.addEventListener("submit", function (e) {
    e.preventDefault();
    alert("تم إرسال رسالتك بنجاح!");
    supportForm.reset();
  });
}


// ================= SCROLL =================
function scrollToProducts() {
  if (typeof smoothScrollToHeading === 'function') {
    smoothScrollToHeading();
  } else {
    const productsSection = document.getElementById("products");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  }
}


// ================= LOGIN =================
function openLoginPage() {
  window.location.href = "login.html";
}


// Language logic is now handled by lang.js


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

let currentCouponCode = "";

// 4. تطبيق كود الخصم
window.applyCoupon = async function () {
  const codeInput = document.getElementById('coupon-code');
  const finalTotalElement = document.getElementById('final-total');

  if (!codeInput || !finalTotalElement) return;

  const code = codeInput.value.trim();
  if(!code) return;

  const token = localStorage.getItem("access");
  if (!token) {
    showToast("يجب تسجيل الدخول أولاً", "error");
    return;
  }

  try {
    const res = await fetch("https://web-production-2a731.up.railway.app/api/orders/apply-coupon/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ code: code })
    });

    const data = await res.json();
    if (res.ok) {
        showToast(data.detail || "مبروك! تم تطبيق الخصم");
        currentCouponCode = data.code;
        let discount = cartTotalAmount * (data.discount_percent / 100);
        let newTotal = cartTotalAmount - discount;
        finalTotalElement.innerText = newTotal.toLocaleString() + " " + translations[currentLang].currency;
        finalTotalElement.style.color = "green";
    } else {
        showToast(data.detail || "كود الخصم غير صحيح", "error");
        currentCouponCode = "";
        finalTotalElement.innerText = cartTotalAmount.toLocaleString() + " " + translations[currentLang].currency;
        finalTotalElement.style.color = "#232f3e";
    }
  } catch(e) {
      console.error(e);
      showToast("خطأ في الاتصال", "error");
  }
}

// 5. تأكيد الطلب
window.submitOrder = async function () {
  const nameInput = document.getElementById('cust-name');
  const phoneInput = document.getElementById('cust-phone');
  const addressInput = document.getElementById('cust-address');

  if (!nameInput || !phoneInput || !addressInput) return;

  if (
    nameInput.value === "" ||
    phoneInput.value === "" ||
    addressInput.value === ""
  ) {
    alert("من فضلك أكمل بيانات الشحن");
    return;
  }

  const token = localStorage.getItem("access");

  if (!token) {
    alert("يجب تسجيل الدخول أولاً");
    return;
  }

  try {
    const res = await fetch("https://web-production-2a731.up.railway.app/api/orders/checkout/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        name: nameInput.value,
        phone: phoneInput.value,
        address: addressInput.value,
        coupon_code: currentCouponCode
      })
    });

    const data = await res.json();
    console.log("🔥 ORDER RESPONSE:", data);

    if (res.ok) {
      alert(`شكراً يا ${nameInput.value}!\nتم إنشاء الطلب بنجاح ✅`);

      closeCheckout();

      // تفريغ السلة
      cart = [];
      renderCart();

      // تحديث الطلبات لو موجودة
      if (typeof loadOrders === "function") {
        loadOrders();
      }

    } else {
      console.log(data);
      alert("حدث خطأ أثناء إنشاء الطلب ❌");
    }

  } catch (err) {
    console.error(err);
    alert("خطأ في الاتصال بالسيرفر");
  }
};

// إغلاق النافذة عند الضغط خارجها
window.onclick = function (event) {
  const modal = document.getElementById('checkout-modal');
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// =========================================
// USER AUTHENTICATION SYSTEM
// =========================================

document.addEventListener('DOMContentLoaded', () => {
  checkUserAuth();

  // تطبيق اللغة المحفوظة
  applyLanguage();

  // 🔥 قراءة بارامترات الـ URL لتحديد نوع المنتج
  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get('type');
  const accParam = urlParams.get('acc');

  const categoryFilter = document.getElementById('category-filter');
  const heading = document.querySelector('#products h2');
  const t = translations[currentLang];
  const brandParam = urlParams.get('brand');

  if (typeParam === 'phone') {
    // 📱 صفحة الهواتف - إظهار فلتر البراندات
    loadCategoriesForFilter(brandParam);
    if (categoryFilter) categoryFilter.style.display = '';
    if (heading) heading.textContent = t.phones?.replace(' ▾', '') || 'الموبايلات';
    loadProductsFromAPI(brandParam || 'all', 'phone', null);

  } else if (typeParam === 'accessory') {
    // 🎧 صفحة الإكسسوارات - إخفاء فلتر البراندات
    if (categoryFilter) categoryFilter.style.display = 'none';
    if (heading) {
      if (accParam === 'airpods') heading.textContent = t.accAirpods || 'AirPods';
      else if (accParam === 'covers') heading.textContent = t.accCovers || 'Covers';
      else if (accParam === 'chargers') heading.textContent = t.accChargers || 'Chargers';
      else heading.textContent = t.typeAccessory || 'إكسسوارات';
    }
    loadProductsFromAPI('all', 'accessory', accParam || null);

  } else if (typeParam === 'store') {
    // 🏪 صفحة المتجر - كل المنتجات مع سكرول
    loadCategoriesForFilter();
    if (categoryFilter) categoryFilter.style.display = '';
    if (heading) heading.textContent = t.latestProducts || 'أحدث المنتجات';
    loadProductsFromAPI('all', null, null, true);

  } else {
    // 🏠 الصفحة الرئيسية - أحدث المنتجات
    if (categoryFilter) categoryFilter.style.display = 'none';
    if (heading) {
        heading.textContent = t.latestProducts || 'أحدث المنتجات';
        heading.style.textAlign = 'center';
    }
    loadCategoriesForFilter(); // لتحميل dropdown الموبايلات في الناف بار
    loadProductsFromAPI('all', null, null, false, true);
  }

  loadCart(); // 🔥 مهم جدًا

  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".add-to-cart-btn");
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      addToCart(btn.dataset.id);
    }
  }, true);
});

function checkUserAuth() {
  const authArea = document.getElementById('user-auth-area');
  const user = JSON.parse(localStorage.getItem('currentUser'));

  if (!authArea) return;

  if (user) {
    if (user.is_admin) {
      // لو اليوزر أدمن، يظهر له زرار واحد بس يدخله على لوحة التحكم
      const adminText = currentLang === 'ar' ? 'أدمن' : 'Admin';
      authArea.innerHTML = `
                <div class="user-profile-btn" onclick="window.location.href='admin.html'" style="background:#0e9374; color:white;">
                    <i class="fas fa-shield-halved"></i>
                    <span>${adminText} (${user.name.split(' ')[0]})</span> 
                </div>
            `;
    } else {
      // لو اليوزر عادي، يظهر له زرار البروفايل العادي
      authArea.innerHTML = `
                <div class="user-profile-btn" onclick="window.location.href='profile.html'">
                    <i class="fas fa-user-circle"></i>
                    <span>${user.name.split(' ')[0]}</span> 
                </div>
            `;
    }
  } else {
    // لو مش مسجل -> إظهار زر تسجيل الدخول
    authArea.innerHTML = `
            <button class="login-btn-modern" onclick="window.location.href='login.html'">
                ${currentLang === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </button>
        `;
  }
}

// دالة تسجيل الخروج
function logout() {
  API_BASE.removeItem('currentUser');
  API_BASE.removeItem('access');
  API_BASE.removeItem('refresh');
  window.location.href = 'index.html';
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

let nextProductsUrl = null;

// ================= LOAD PRODUCTS FROM BACKEND =================
function showSkeletonLoading() {
  const container = document.querySelector(".products-grid");
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const skel = document.createElement('div');
    skel.className = 'skeleton-card';
    skel.innerHTML = `
      <div class="skeleton-img"></div>
      <div class="skeleton-text short"></div>
      <div class="skeleton-text price"></div>
      <div class="skeleton-btn"></div>
      <div class="skeleton-btn"></div>
    `;
    container.appendChild(skel);
  }
}

async function loadProductsFromAPI(brand = "all", productType = null, accessoryType = null, shouldScroll = false, isLatest = false) {
  try {
    // عرض Skeleton Loading
    showSkeletonLoading();
    const loadStart = Date.now();

    let url = PRODUCTS_API;
    const params = [];
    
    if (brand !== "all") {
      params.push(`category=${encodeURIComponent(brand)}`);
    }
    if (productType) {
      params.push(`product_type=${encodeURIComponent(productType)}`);
    }
    if (accessoryType) {
      params.push(`accessory_type=${encodeURIComponent(accessoryType)}`);
    }
    if (isLatest) {
      params.push(`is_latest=true`);
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    const res = await fetch(url);
    const data = await res.json();

    // دعم pagination لو موجود
    if (Array.isArray(data)) {
      productsData = data;
      nextProductsUrl = null;
    } else {
      productsData = data.results || [];
      nextProductsUrl = data.next;
    }

    // تأخير بسيط عشان الـ skeleton يبان بشكل لطيف (600ms كحد أدنى)
    const elapsed = Date.now() - loadStart;
    const minDelay = 600;
    if (elapsed < minDelay) {
      await new Promise(r => setTimeout(r, minDelay - elapsed));
    }

    renderProductsFromAPI();
    updateLoadMoreButton();

    // سكرول تلقائي لعنوان القسم (لو جاي من الناف بار)
    if (productType || accessoryType || shouldScroll) {
      setTimeout(() => {
        smoothScrollToHeading();
      }, 150);
    }

  } catch (err) {
    console.error("Error loading products:", err);
  }
}

// سكرول ناعم يوقف عند عنوان القسم (مع مراعاة ارتفاع الناف بار)
function smoothScrollToHeading() {
  const heading = document.querySelector('#products h2');
  if (!heading) return;
  const navbarHeight = document.querySelector('.navbar-modern')?.offsetHeight || 80;
  const headingTop = heading.getBoundingClientRect().top + window.pageYOffset;
  window.scrollTo({
    top: headingTop - navbarHeight - 20,
    behavior: 'smooth'
  });
}

let isLoadingMore = false;
let infiniteScrollObserver = null;

async function loadMoreProducts() {
  if (!nextProductsUrl || isLoadingMore) return;

  isLoadingMore = true;

  try {
    const trigger = document.getElementById("infinite-scroll-trigger");
    if (trigger) {
      trigger.innerHTML = `<p style="text-align: center; color: var(--text-color); margin: 20px 0;"><i class="fas fa-spinner fa-spin"></i> ${translations[currentLang].loadingShort || "جاري التحميل..."}</p>`;
    }

    const res = await fetch(nextProductsUrl);
    const data = await res.json();

    if (Array.isArray(data)) {
      productsData = productsData.concat(data);
      nextProductsUrl = null;
    } else {
      productsData = productsData.concat(data.results || []);
      nextProductsUrl = data.next;
    }

    renderProductsFromAPI();
    updateLoadMoreButton();

  } catch (err) {
    console.error("Error loading more products:", err);
  } finally {
    isLoadingMore = false;
  }
}

function updateLoadMoreButton() {
  let trigger = document.getElementById("infinite-scroll-trigger");
  
  if (!trigger) {
    trigger = document.createElement("div");
    trigger.id = "infinite-scroll-trigger";
    trigger.style.cssText = "width: 100%; height: 50px; display: flex; justify-content: center; align-items: center; grid-column: 1 / -1;";
    
    const section = document.querySelector(".shop-main") || document.querySelector(".products");
    if (section) {
      section.appendChild(trigger);
    } else {
      return;
    }
  }
  
  if (!infiniteScrollObserver) {
    infiniteScrollObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && nextProductsUrl && !isLoadingMore) {
        loadMoreProducts();
      }
    }, { rootMargin: "200px" });
    infiniteScrollObserver.observe(trigger);
  }
  
  if (nextProductsUrl) {
    trigger.style.display = "flex";
    trigger.innerHTML = `<p style="text-align: center; color: var(--text-color);"><i class="fas fa-spinner fa-spin"></i> ${translations[currentLang].loadingShort || "جاري التحميل..."}</p>`;
  } else {
    trigger.style.display = "none";
  }
}

// ================= RENDER PRODUCTS =================
function renderProductsFromAPI() {

  const container = document.querySelector(".products-grid");

  if (!container) return;

  container.innerHTML = ""; // بيشيل loading


  const addToCartText = translations[currentLang].addToCart || 'أضف للسلة';
  const viewDetailsText = translations[currentLang].viewDetails || 'عرض التفاصيل';
  const currencyText = translations[currentLang].currency || 'ج.م';

  productsData.forEach((product, index) => {
    const card = document.createElement("div");
    card.classList.add("product-card", "scroll-animate");
    // Delay is handled dynamically via observer, or we can use small transition delay based on nth-child or index if they appear at once, 
    // but the observer will just fire when they enter view.

    const brand = product.category_name?.toLowerCase() || product.category?.name?.toLowerCase() || "unknown";
    card.setAttribute("data-brand", brand);

    const hasDiscount = product.discount_percent > 0 && product.original_price;
    const discountText = currentLang === 'ar' ? 'خصم' : 'Sale';
    const discountBadge = hasDiscount
      ? `<div class="discount-badge"><i class="fas fa-tag"></i> ${discountText} ${product.discount_percent}%</div>`
      : '';
    const priceHtml = hasDiscount
      ? `<p class="price">
           <span class="price-old">${Number(product.original_price).toLocaleString()} ${currencyText}</span>
           <span class="price-new">${Number(product.price).toLocaleString()} ${currencyText}</span>
         </p>`
      : `<p class="price">${Number(product.price).toLocaleString()} ${currencyText}</p>`;

    card.innerHTML = `
            ${discountBadge}
            <button type="button" class="wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist(${product.id})" title="${translations[currentLang].addToWishlist}">
              <i class="fas fa-heart"></i>
            </button>
            <button type="button" class="compare-btn ${isInCompareList(product.id) ? 'active' : ''}" onclick="event.stopPropagation(); toggleCompare(${product.id})" title="${translations[currentLang].addToCompare}">
              <i class="fas fa-balance-scale"></i>
            </button>
            <img src="${product.image
        ? (product.image.startsWith('http')
          ? product.image
          : 'https://web-production-2a731.up.railway.app' + product.image)
        : 'https://via.placeholder.com/300'
      }">
            <h3>${product.name}</h3>
            ${priceHtml}

            <button 
              type="button" 
              class="btn btn-cart add-to-cart-btn" 
              data-id="${product.id}"
            >
                ${addToCartText}
            </button>

            <a href="product.html?id=${product.id}" class="btn">
                ${viewDetailsText}
            </a>
        `;

    container.appendChild(card);
  });

  applyFilters();

  document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const id = this.dataset.id;
      addToCart(id);
    });
  });

  // Scroll Animation Observer
  const scrollObserver = new IntersectionObserver((entries, observer) => {
    let delayCounter = 0;
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delayCounter * 100); // Stagger effect
        delayCounter++;
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  document.querySelectorAll('.scroll-animate').forEach(el => {
    scrollObserver.observe(el);
  });
}

function showToast(message, color = "#1f1d1da5") {
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
        box-shadow: 0 5px 15px rgba(14, 147, 116, 0.4);
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
// PRODUCT COMPARISON SYSTEM
// =========================================

let compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
const MAX_COMPARE = 4;

function isInCompareList(productId) {
  return compareList.includes(Number(productId));
}

function toggleCompare(productId) {
  productId = Number(productId);

  if (isInCompareList(productId)) {
    // Remove
    compareList = compareList.filter(id => id !== productId);
    showToast(translations[currentLang].removeCompare || 'تم الإزالة من المقارنة', '#ff4757');
  } else {
    // Add
    if (compareList.length >= MAX_COMPARE) {
      showToast(translations[currentLang].maxCompareReached || 'الحد الأقصى 4 منتجات', '#ff4757');
      return;
    }
    compareList.push(productId);
    showToast(translations[currentLang].addToCompare || 'تم الإضافة للمقارنة ⚖️');
  }

  localStorage.setItem('compareList', JSON.stringify(compareList));
  updateCompareUI();
}

function removeFromCompare(productId) {
  productId = Number(productId);
  compareList = compareList.filter(id => id !== productId);
  localStorage.setItem('compareList', JSON.stringify(compareList));
  updateCompareUI();

  // If modal is open, re-render it
  const modal = document.getElementById('compare-modal');
  if (modal && modal.classList.contains('open')) {
    if (compareList.length === 0) {
      closeCompareModal();
    } else {
      renderCompareModal();
    }
  }
}

function clearCompare() {
  compareList = [];
  localStorage.setItem('compareList', JSON.stringify(compareList));
  updateCompareUI();
}

function updateCompareUI() {
  // Update compare buttons on cards
  document.querySelectorAll('.compare-btn').forEach(btn => {
    const card = btn.closest('.product-card');
    if (!card) return;
    const addBtn = card.querySelector('.add-to-cart-btn');
    if (!addBtn) return;
    const productId = Number(addBtn.dataset.id);
    if (isInCompareList(productId)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update floating bar
  renderCompareBar();
}

function renderCompareBar() {
  const bar = document.getElementById('compare-bar');
  const itemsContainer = document.getElementById('compare-bar-items');
  const countBadge = document.getElementById('compare-count');

  if (!bar || !itemsContainer || !countBadge) return;

  countBadge.textContent = compareList.length;

  if (compareList.length === 0) {
    bar.classList.remove('visible');
    return;
  }

  bar.classList.add('visible');

  // Render thumbnails
  itemsContainer.innerHTML = '';
  compareList.forEach(productId => {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;

    const imgUrl = product.image
      ? (product.image.startsWith('http') ? product.image : 'https://web-production-2a731.up.railway.app' + product.image)
      : 'https://via.placeholder.com/55';

    itemsContainer.innerHTML += `
      <div class="compare-bar-thumb">
        <img src="${imgUrl}" alt="${product.name}">
        <button class="remove-thumb" onclick="event.stopPropagation(); removeFromCompare(${product.id})">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  });
}

function openCompareModal() {
  if (compareList.length < 2) {
    showToast(currentLang === 'ar' ? 'اختر منتجين على الأقل للمقارنة' : 'Select at least 2 products to compare', '#ff4757');
    return;
  }

  const modal = document.getElementById('compare-modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderCompareModal();
  }
}

function closeCompareModal() {
  const modal = document.getElementById('compare-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Close modal on click outside
document.addEventListener('click', function (e) {
  const modal = document.getElementById('compare-modal');
  if (modal && e.target === modal) {
    closeCompareModal();
  }
});

async function renderCompareModal() {
  const body = document.getElementById('compare-modal-body');
  if (!body) return;

  const t = translations[currentLang];
  const currency = t.currency || 'ج.م';

  // Fetch full product data for compare items (to get specs)
  const products = [];
  for (const id of compareList) {
    // Try local data first
    let product = productsData.find(p => p.id === id);
    if (product && product.screen !== undefined) {
      products.push(product);
    } else {
      // Fetch from API to get specs
      try {
        const res = await fetch(`${API_BASE}/api/products/${id}/`);
        const data = await res.json();
        products.push(data);
      } catch (err) {
        if (product) products.push(product);
      }
    }
  }

  if (products.length === 0) {
    body.innerHTML = `<p style="text-align:center;padding:40px;color:var(--text-color);">${t.compareEmpty}</p>`;
    return;
  }

  // Build comparison table
  const specs = [
    { key: 'price', label: t.specPrice, format: (v) => `<span class="spec-value highlight">${Number(v).toLocaleString()} ${currency}</span>` },
    { key: 'screen', label: t.specScreen },
    { key: 'processor', label: t.specProcessor },
    { key: 'camera', label: t.specCamera },
    { key: 'battery', label: t.specBattery },
    { key: 'ram', label: t.specRam },
    { key: 'storage', label: t.specStorage },
    { key: 'os', label: t.specOs },
    { key: 'category_name', label: t.specCategory },
    {
      key: 'stock', label: t.specStock, format: (v) => {
        if (v > 0) return `<span class="stock-available">${t.inStock}</span>`;
        return `<span class="stock-unavailable">${t.outOfStock}</span>`;
      }
    }
  ];

  let tableHTML = `<table class="compare-table">`;

  // Header row with product images
  tableHTML += `<thead><tr><th></th>`;
  products.forEach(p => {
    const imgUrl = p.image
      ? (p.image.startsWith('http') ? p.image : 'https://web-production-2a731.up.railway.app' + p.image)
      : 'https://via.placeholder.com/120';
    tableHTML += `
      <th class="product-col">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
          <img src="${imgUrl}" class="compare-product-img" alt="${p.name}">
          <div class="compare-product-name">${p.name}</div>
          <button class="compare-remove-btn" onclick="removeFromCompare(${p.id})">
            <i class="fas fa-times"></i> ${t.removeCompare || 'إزالة'}
          </button>
        </div>
      </th>
    `;
  });
  tableHTML += `</tr></thead>`;

  // Body rows for each spec
  tableHTML += `<tbody>`;
  specs.forEach(spec => {
    tableHTML += `<tr><td><span class="spec-label">${spec.label}</span></td>`;
    products.forEach(p => {
      let val = p[spec.key];
      if (spec.format) {
        tableHTML += `<td>${spec.format(val)}</td>`;
      } else {
        tableHTML += `<td><span class="spec-value">${val || t.noSpec || '—'}</span></td>`;
      }
    });
    tableHTML += `</tr>`;
  });
  tableHTML += `</tbody></table>`;

  body.innerHTML = tableHTML;
}

function addAllCompareToCart() {
  compareList.forEach(id => {
    addToCart(id);
  });
  showToast(currentLang === 'ar' ? 'تم إضافة كل المنتجات للسلة 🛒' : 'All products added to cart 🛒');
}

// Initialize compare UI on page load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    updateCompareUI();
    loadWishlist();
  }, 500);
});


// =========================================
// WISHLIST SYSTEM
// =========================================

let wishlistIds = JSON.parse(localStorage.getItem('wishlistIds') || '[]');

function isInWishlist(productId) {
  return wishlistIds.includes(Number(productId));
}

async function toggleWishlist(productId) {
  productId = Number(productId);
  const token = localStorage.getItem('access');
  const t = translations[currentLang];

  if (!token) {
    showToast(t.loginForWishlist || 'سجل دخول عشان تضيف للمفضلة', '#ff4757');
    return;
  }

  if (isInWishlist(productId)) {
    // Remove from wishlist
    try {
      await fetch(`${API_BASE}/api/wishlist/remove/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product: productId })
      });
    } catch (err) {
      console.error('Wishlist remove error:', err);
    }
    wishlistIds = wishlistIds.filter(id => id !== productId);
    showToast(t.removeFromWishlist || 'تم الإزالة من المفضلة', '#ff4757');
  } else {
    // Add to wishlist
    try {
      const res = await fetch(`${API_BASE}/api/wishlist/add/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product: productId })
      });
      const data = await res.json();
      if (data.message === 'Already in wishlist') {
        showToast(t.alreadyInWishlist || 'موجود في المفضلة بالفعل');
      } else {
        showToast(t.addedToWishlist || 'تم الإضافة للمفضلة ❤️');
      }
    } catch (err) {
      console.error('Wishlist add error:', err);
    }
    if (!wishlistIds.includes(productId)) {
      wishlistIds.push(productId);
    }
  }
  localStorage.setItem('wishlistIds', JSON.stringify(wishlistIds));
  updateWishlistUI();

  // Open Wishlist Panel if it was just added
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
      await fetch(`${API_BASE}/api/wishlist/remove/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product: productId })
      });
    } catch (err) {
      console.error('Wishlist remove error:', err);
    }
  }

  wishlistIds = wishlistIds.filter(id => id !== productId);
  localStorage.setItem('wishlistIds', JSON.stringify(wishlistIds));
  updateWishlistUI();
  renderWishlistPanel();
  showToast(translations[currentLang].removeFromWishlist || 'تم الإزالة من المفضلة', '#ff4757');
}

async function loadWishlist() {
  const token = localStorage.getItem('access');
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/api/wishlist/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      wishlistIds = data.map(item => item.product);
      localStorage.setItem('wishlistIds', JSON.stringify(wishlistIds));
      updateWishlistUI();
    }
  } catch (err) {
    console.error('Load wishlist error:', err);
  }
}

function updateWishlistUI() {
  // Update heart buttons on cards
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    const card = btn.closest('.product-card');
    if (!card) return;
    const addBtn = card.querySelector('.add-to-cart-btn');
    if (!addBtn) return;
    const productId = Number(addBtn.dataset.id);
    if (isInWishlist(productId)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update navbar badge
  const countEl = document.getElementById('wishlist-count');
  if (countEl) {
    countEl.textContent = wishlistIds.length;
  }
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

function renderWishlistPanel() {
  const body = document.getElementById('wishlist-panel-body');
  if (!body) return;

  const t = translations[currentLang];
  const currency = t.currency || 'ج.م';

  if (wishlistIds.length === 0) {
    body.innerHTML = `
      <div class="wishlist-empty">
        <i class="far fa-heart"></i>
        <p>${t.wishlistEmpty || 'المفضلة فارغة'}</p>
      </div>
    `;
    return;
  }

  let html = '';
  wishlistIds.forEach(productId => {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;

    const imgUrl = product.image
      ? (product.image.startsWith('http') ? product.image : 'https://web-production-2a731.up.railway.app' + product.image)
      : 'https://via.placeholder.com/70';

    html += `
      <div class="wishlist-item">
        <img src="${imgUrl}" alt="${product.name}">
        <div class="wishlist-item-info">
          <div class="wishlist-item-name" title="${product.name}">${product.name}</div>
          <div class="wishlist-item-price">${Number(product.price).toLocaleString()} ${currency}</div>
        </div>
        <div class="wishlist-item-actions">
          <button class="wishlist-cart-btn" onclick="addToCart(${product.id}); showToast('${t.addToCart || 'تمت الإضافة'}')">
            <i class="fas fa-cart-plus"></i> ${t.addToCart || 'أضف للسلة'}
          </button>
          <button class="wishlist-remove-btn" onclick="removeFromWishlistAPI(${product.id})">
            <i class="fas fa-trash-alt"></i> ${t.wishlistRemoveBtn || 'إزالة'}
          </button>
        </div>
      </div>
    `;
  });

  body.innerHTML = html;
}

// ================= SEARCH SYSTEM =================
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
      searchInput.addEventListener('input', (e) => {
          const query = e.target.value.toLowerCase();
          const container = document.querySelector(".products-grid");
          if(!container) return;
          
          const cards = container.querySelectorAll('.product-card');
          let hasVisible = false;
          
          cards.forEach(card => {
              const titleEl = card.querySelector('h3');
              if (!titleEl) return;
              
              const title = titleEl.innerText.toLowerCase();
              if (title.includes(query)) {
                  card.style.display = 'block';
                  hasVisible = true;
              } else {
                  card.style.display = 'none';
              }
          });
          
          let noResultsMsg = container.querySelector('.no-search-results');
          if (!hasVisible && query !== '') {
              if (!noResultsMsg) {
                  noResultsMsg = document.createElement('p');
                  noResultsMsg.className = 'no-search-results';
                  noResultsMsg.style.cssText = 'text-align: center; width: 100%; grid-column: 1 / -1; color: var(--text-color); margin-top: 20px; font-weight: bold; font-size: 18px;';
                  noResultsMsg.innerText = currentLang === 'ar' ? 'لا توجد منتجات مطابقة للبحث.' : 'No matching products found.';
                  container.appendChild(noResultsMsg);
              }
          } else if (noResultsMsg) {
              noResultsMsg.remove();
          }
      });
  }
});

window.performSearch = function() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
      searchInput.dispatchEvent(new Event('input'));
      const productsSection = document.getElementById("products");
      if(productsSection) {
          productsSection.scrollIntoView({ behavior: 'smooth' });
      }
  }
}
