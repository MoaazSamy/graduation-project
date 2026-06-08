
let currentLang = localStorage.getItem('lang') || "ar";

const translations = {
  ar: {
    // Navbar (Common)
    home: "الرئيسية", store: "المتجر", contact: "اتصل بنا", phones: "الموبايلات ▾", accessories: "الإكسسوارات ▾",
    login: "تسجيل الدخول", logout: "تسجيل الخروج",
    adminPanelTitle: "لوحة التحكم",

    // Index specific
    heroTitle: "خصومات قوية على الموبايلات", heroDesc: "أفضل الأسعار – تقسيط مريح",
    featShipping: "شحن سريع", featShippingDesc: "توصيل لجميع المحافظات",
    featWarranty: "ضمان حقيقي", featWarrantyDesc: "منتجات أصلية 100%",
    featSupport: "دعم 24/7", featSupportDesc: "خدمة عملاء على مدار الساعة",
    featPayment: "دفع آمن", featPaymentDesc: "خيارات دفع متعددة ومريحة",
    shopNow: "تسوق الآن", latestProducts: "أحدث المنتجات", searchPlaceholder: "ابحث عن منتج...",
    all: "الكل", loading: "جاري تحميل المنتجات...", addToCart: "أضف للسلة", viewDetails: "عرض التفاصيل", loadMore: "التالي",
    cartTitle: "🛒 سلة المشتريات", cartEmpty: "السلة فارغة", totalLabel: "الإجمالي:", currency: "ج.م", checkout: "إتمام الشراء",
    deleteItem: "حذف", checkoutTitle: "إتمام الطلب والدفع", shippingSection: "1. بيانات الشحن والتواصل",
    fullName: "الاسم رباعي", phoneNumber: "رقم الموبايل الأساسي", emailOptional: "البريد الإلكتروني (اختياري)",
    fullAddress: "العنوان بالتفصيل (المحافظة - المنطقة - الشارع)", paymentSection: "2. اختر وسيلة الدفع",
    cashOnDelivery: "دفع عند الاستلام", valuInstall: "تقسيط فاليو", halanInstall: "تقسيط حالا", vodafoneCash: "فودافون كاش",
    cashMsg: "سيتم تحصيل المبلغ بالكامل نقداً عند توصيل الطلب لعنوانك.", valuName: "الاسم المسجل في فاليو", valuPhone: "رقم موبايل حساب فاليو",
    halanName: "الاسم المسجل في حالا", halanPhone: "رقم موبايل حساب حالا", nationalId: "الرقم القومي (14 رقم)",
    instapayMsg: "يرجى التحويل على عنوان الدفع التالي:<br> <strong>username@instapay</strong>", paymentAddress: "عنوان الدفع الخاص بك (Payment Address)",
    transactionId: "رقم العملية المرجعي (Transaction ID)", vodafoneMsg: "يرجى التحويل على الرقم: <strong>010XXXXXXXX</strong>",
    walletNumber: "رقم المحفظة المحول منها", screenshotOptional: "قم بإرفاق سكرين شوت للتحويل (اختياري)", couponCode: "كود الخصم", applyCoupon: "تطبيق",
    confirmOrder: "تأكيد الطلب الآن", supportTitle: "الدعم الفني", supportDesc: "لأي استفسار أو مشكلة، تواصل معنا عبر النموذج التالي:",
    name: "الاسم", email: "البريد الإلكتروني", writeMessage: "اكتب رسالتك هنا...", send: "إرسال",

    // Admin specific
    dashboard: "لوحة المعلومات", addProduct: "إضافة منتج", products: "المنتجات", backToStore: "العودة للمتجر",
    dashboardDesc: "نظرة سريعة على أداء متجرك",
    totalProducts: "إجمالي المنتجات", categories: "الأقسام", totalStock: "إجمالي المخزون", lowStock: "مخزون منخفض",
    recentProducts: "آخر المنتجات المضافة", image: "الصورة", productName: "اسم المنتج", category: "القسم",
    price: "السعر", stock: "المخزون", date: "التاريخ", noProductsYet: "لا توجد منتجات بعد", startAddingProducts: "ابدأ بإضافة أول منتج لك",
    addNewProduct: "إضافة منتج جديد", addProductDesc: "أدخل بيانات المنتج الجديد لإضافته للمتجر",
    editModeBanner: "أنت في وضع التعديل - تعديل المنتج:", cancelEdit: "إلغاء التعديل", productData: "بيانات المنتج",
    selectCategory: "-- اختر القسم --", availableQuantity: "الكمية المتاحة", productDescription: "وصف المنتج",
    colorOpt: "اللون (اختياري)", weightOpt: "الوزن (اختياري)", skuOpt: "رمز المنتج SKU (اختياري)", brandOpt: "العلامة التجارية (اختياري)",
    productImage: "صورة المنتج", dragImage: "اسحب الصورة هنا أو ", browseFile: "اختر ملف", uploadLimit: "PNG, JPG, WEBP — حد أقصى 5MB",
    btnAddProduct: "إضافة المنتج", clearFields: "مسح الحقول", manageProducts: "إدارة المنتجات", saveEdits: "حفظ التعديلات",
    manageProductsDesc: "عرض وتعديل وحذف المنتجات", searchProductPh: "ابحث عن منتج...", actions: "إجراءات",
    deleteProductTitle: "حذف المنتج", deleteProductConfirm: "هل أنت متأكد من حذف", noUndo: "لا يمكن التراجع عن هذا الإجراء.",
    yesDelete: "نعم، احذف", cancelBtn: "إلغاء", successTitle: "تم بنجاح!", successMsg: "تم إضافة المنتج بنجاح",
    loadingShort: "جاري التحميل...",
    recentOrders: "أحدث الطلبات", viewAll: "عرض الكل", topProducts: "أعلى المنتجات سعراً",
    quickActions: "إجراءات سريعة", categoryDistribution: "توزيع المنتجات حسب القسم",

    // Profile specific
    myAccount: "حسابي", accountInfo: "معلومات الحساب", myOrders: "طلباتي", addresses: "العناوين", security: "الأمان",
    myStats: "إحصائياتي", specialMember: "عضو مميز", manageProfileDesc: "إدارة بياناتك الشخصية والتعديل عليها",
    basicInfo: "البيانات الأساسية", editBtn: "تعديل", username: "اسم المستخدم", registrationDate: "تاريخ التسجيل",
    notAddedYet: "لم يتم الإضافة بعد", saveChanges: "حفظ التغييرات", totalOrders: "إجمالي الطلبات",
    favorites: "المفضلة", totalPurchases: "إجمالي المشتريات", orderTracking: "تتبع حالة طلباتك السابقة والحالية",
    allOrders: "الكل", pending: "قيد الانتظار", processing: "جاري التجهيز", shipped: "تم الشحن", delivered: "تم التوصيل",
    noOrdersYet: "لا يوجد طلبات بعد", startShopping: "ابدأ التسوق الآن واستمتع بأفضل العروض!", shopNowArrow: "تسوق الآن",
    savedAddresses: "العناوين المحفوظة", manageAddresses: "إدارة عناوين الشحن والتوصيل", defaultAddress: "العنوان الأساسي",
    noAddressYet: "لم يتم إضافة عنوان بعد", deleteBtn: "حذف", addNewAddressBtn: "إضافة عنوان جديد",
    addEditAddress: "إضافة / تعديل عنوان", cityPh: "المحافظة", areaPh: "المنطقة / الحي", streetPh: "الشارع ورقم المبنى",
    saveBtn: "حفظ", securityPrivacy: "الأمان والخصوصية", manageSecurity: "إدارة كلمة المرور وإعدادات الأمان",
    changePassword: "تغيير كلمة المرور", currentPassword: "كلمة المرور الحالية", newPassword: "كلمة المرور الجديدة",
    updatePassword: "تحديث كلمة المرور", sessionInfo: "معلومات الجلسة", currentDevice: "الجهاز الحالي",
    lastLogin: "آخر تسجيل دخول", overviewStats: "نظرة شاملة على نشاطك في المتجر", completedOrder: "طلب تم تنفيذه",
    totalSpent: "إجمالي الإنفاق", recentOrdersTitle: "آخر الطلبات", noDataYet: "لا توجد بيانات حتى الآن",
    orderNum: "رقم الطلب", orderStatus: "الحالة", orderTotal: "الإجمالي",

    // Compare feature
    compare: "مقارنة", compareProducts: "⚖️ مقارنة المنتجات", compareNow: "قارن الآن",
    clearCompare: "مسح الكل", addToCompare: "أضف للمقارنة", removeCompare: "إزالة من المقارنة",
    maxCompareReached: "الحد الأقصى 4 منتجات للمقارنة", compareEmpty: "اختر منتجات للمقارنة",
    addAllToCart: "🛒 أضف الكل للسلة", closeCompare: "إغلاق",
    inStock: "✅ متوفر", outOfStock: "❌ نفذ",

    // Technical specs labels
    specPrice: "💰 السعر", specScreen: "📱 الشاشة", specProcessor: "⚡ المعالج",
    specCamera: "📷 الكاميرا", specBattery: "🔋 البطارية", specRam: "💾 الرام",
    specStorage: "💿 التخزين", specOs: "📲 النظام", specStock: "📦 المخزون",
    specCategory: "📂 القسم", noSpec: "—",

    // Admin spec fields
    screenLabel: "الشاشة", processorLabel: "المعالج", cameraLabel: "الكاميرا",
    batteryLabel: "البطارية", ramLabel: "الرام", storageLabel: "التخزين", osLabel: "نظام التشغيل",
    techSpecs: "المواصفات التقنية",

    // Product Type Selector
    selectProductType: "اختر نوع المنتج",
    typePhone: "هاتف / موبايل",
    typePhoneDesc: "مواصفات تقنية كاملة",
    typeAccessory: "إكسسوارات",
    typeAccessoryDesc: "سماعات، كفرات، شواحن",
    selectAccessoryType: "حدد نوع الإكسسوار",
    accAirpods: "سماعات AirPods",
    accCovers: "كفرات وأغطية",
    accChargers: "شواحن",
    selectAccTypeError: "يرجى اختيار نوع الإكسسوار",
    isLatestProduct: "عرض في قسم 'أحدث المنتجات' (الرئيسية)",

    // Wishlist
    wishlist: "المفضلة", wishlistTitle: "❤️ قائمة المفضلة", wishlistEmpty: "المفضلة فارغة",
    addToWishlist: "أضف للمفضلة", removeFromWishlist: "تم الإزالة من المفضلة",
    addedToWishlist: "تم الإضافة للمفضلة ❤️", alreadyInWishlist: "موجود في المفضلة بالفعل",
    loginForWishlist: "سجل دخول عشان تضيف للمفضلة", wishlistRemoveBtn: "إزالة",

    // Order Management (Admin)
    ordersTab: "الطلبات", manageOrders: "إدارة الطلبات", manageOrdersDesc: "عرض وإدارة جميع طلبات العملاء",
    customer: "العميل", orderItems: "المنتجات", orderDate: "تاريخ الطلب", updateStatus: "تحديث الحالة",
    statusPending: "قيد الانتظار", statusProcessing: "جاري التجهيز", statusShipped: "تم الشحن",
    statusDelivered: "تم التوصيل", statusCompleted: "مكتمل", statusCancelled: "ملغي",
    orderDetailTitle: "تفاصيل الطلب", noOrdersFound: "لا توجد طلبات", noOrdersDesc: "لم يتم استلام أي طلبات بعد",
    orderUpdated: "تم تحديث حالة الطلب بنجاح", orderUpdateError: "خطأ في تحديث حالة الطلب",
    totalOrdersAdmin: "إجمالي الطلبات", pendingOrders: "طلبات معلقة", processingOrders: "جاري التجهيز",
    deliveredOrders: "تم التوصيل", ordersRevenue: "إجمالي الإيرادات",
    searchOrderPh: "ابحث برقم الطلب أو اسم العميل...", viewOrderDetails: "عرض التفاصيل",
    closeModal: "إغلاق", orderSummary: "ملخص الطلب", productCol: "المنتج", qtyCol: "الكمية", priceCol: "السعر",
    heroTitle: "خصومات قوية على الموبايلات", heroDesc: "أفضل الأسعار – تقسيط مريح", shopNow: "تسوق الآن",
    featShipping: "شحن سريع", featShippingDesc: "توصيل لجميع المحافظات", featWarranty: "ضمان حقيقي", featWarrantyDesc: "منتجات أصلية 100%",
    featSupport: "دعم 24/7", featSupportDesc: "خدمة عملاء على مدار الساعة", featPayment: "دفع آمن", featPaymentDesc: "خيارات دفع متعددة ومريحة",
    latestProducts: "أحدث المنتجات", searchPlaceholder: "ابحث عن منتج...", all: "الكل", loading: "جاري تحميل المنتجات...",
    cartTitle: "🛒 سلة المشتريات", cartEmpty: "السلة فارغة", totalLabel: "الإجمالي:", checkout: "إتمام الشراء",
    checkoutTitle: "إتمام الطلب والدفع", shippingSection: "1. بيانات الشحن والتواصل", fullName: "الاسم رباعي",
    phoneNumber: "رقم الموبايل الأساسي", emailOptional: "البريد الإلكتروني (اختياري)", fullAddress: "العنوان بالتفصيل (المحافظة - المنطقة - الشارع)",
    paymentSection: "2. اختر وسيلة الدفع", cashOnDelivery: "دفع عند الاستلام", valuInstall: "تقسيط فاليو", halanInstall: "تقسيط حالا", vodafoneCash: "فودافون كاش",
    cashMsg: "سيتم تحصيل المبلغ بالكامل نقداً عند توصيل الطلب لعنوانك.", valuName: "الاسم المسجل في فاليو", valuPhone: "رقم موبايل حساب فاليو",
    halanName: "الاسم المسجل في حالا", halanPhone: "رقم موبايل حساب حالا", nationalId: "الرقم القومي (14 رقم)",
    instapayMsg: "يرجى التحويل على عنوان الدفع التالي:<br> <strong>username@instapay</strong>", paymentAddress: "عنوان الدفع الخاص بك (Payment Address)",
    transactionId: "رقم العملية المرجعي (Transaction ID)", vodafoneMsg: "يرجى التحويل على الرقم: <strong>010XXXXXXXX</strong>", walletNumber: "رقم المحفظة المحول منها",
    screenshotOptional: "قم بإرفاق سكرين شوت للتحويل (اختياري)", couponCode: "كود الخصم", applyCoupon: "تطبيق", confirmOrder: "تأكيد الطلب الآن",
    supportTitle: "الدعم الفني", supportDesc: "لأي استفسار أو مشكلة، تواصل معنا عبر النموذج التالي:", name: "الاسم", email: "البريد الإلكتروني",
    writeMessage: "اكتب رسالتك هنا...", send: "إرسال", phones: 'الموبايلات ▾', accessories: 'الإكسسوارات ▾',
    accAirpods: "سماعات AirPods", accCovers: "كفرات وأغطية", accChargers: "شواحن", wishlistTitle: "❤️ قائمة المفضلة",
    loadingError: "حدث خطأ أثناء تحميل المنتج", loadingReviews: "جاري تحميل التقييمات...",
    loginToReview: "يجب تسجيل الدخول لإضافة تقييم.", noReviews: "لا توجد تقييمات حتى الآن. كن أول من يقيّم هذا المنتج!",
    reviewsTitle: "تقييمات العملاء", writeReview: "اكتب تقييمك", submitReview: "إرسال التقييم",
    reviewPlaceholder: "شاركنا رأيك في المنتج...",
    addToCart: "أضف للسلة", whatsapp: "اطلب عبر واتساب",
    specs: "المواصفات التقنية", shipping: "معلومات الشحن",
    shippingText: "شحن مجاني لجميع المحافظات خلال 3-5 أيام عمل.",
    selectColor: "اختر اللون:", notFound: "عذراً، المنتج غير موجود.", returnHome: "العودة للرئيسية",
    currency: "ج.م", save: "وفر",
    addToWishlist: "أضف للمفضلة", removeFromWishlist: "تم الإزالة من المفضلة",
    addedToWishlist: "تم الإضافة للمفضلة ❤️", loginForWishlist: "سجل دخول عشان تضيف للمفضلة",
    wishlistEmpty: "المفضلة فارغة", wishlistRemoveBtn: "إزالة",
    addToCompare: "أضف للمقارنة", removeCompare: "إزالة من المقارنة",

    // JS Dynamic Texts
    toastLoginSuccess: "تم تسجيل الدخول بنجاح ✅", toastLoginError: "بيانات الدخول خطأ ❌",
    toastServerError: "يوجد خطأ في السيرفر ⚠️", toastRegSuccess: "تم إنشاء الحساب بنجاح ✅",
    toastRegError: "اسم المستخدم أو البريد الإلكتروني مستخدم مسبقاً ❌",

    noCustomers: "لا يوجد عملاء", roleAdmin: "مدير", roleUser: "مستخدم", premiumBadgeTooltip: "عميل مميز",
    toastPremiumUp: "تم ترقية العميل لمميز", toastPremiumDown: "تم إلغاء شارة العميل المميز",
    toastUpdateError: "حدث خطأ أثناء التحديث", toastConnError: "خطأ في الاتصال",
    toastNoCoupons: "لا توجد كوبونات", toastCouponActive: "مفعل", toastCouponInactive: "معطل",
    toastCouponDisableTitle: "تعطيل", toastCouponEnableTitle: "تفعيل", noExpiration: "بدون تاريخ انتهاء",
    deleteCouponConfirm: "هل أنت متأكد من حذف هذا الكوبون نهائياً؟", couponDeleted: "تم حذف الكوبون بنجاح",
    couponAddSuccess: "تم إضافة الكوبون بنجاح", couponAddError: "حدث خطأ، ربما الكود موجود مسبقاً",
    couponAdding: "جاري الإضافة...",

    // Admin - Coupons
    couponsTab: "الكوبونات", manageCoupons: "إدارة الكوبونات", manageCouponsDesc: "إضافة وتعديل وحذف كوبونات الخصم",
    addNewCoupon: "إضافة كوبون جديد", couponCodeAdmin: "كود الخصم", discountPercent: "نسبة الخصم (%)",
    validUntilOpt: "تاريخ الصلاحية (اختياري)", btnAddCoupon: "إضافة الكوبون", couponCodeCol: "الكود",
    discountCol: "نسبة الخصم", validUntilCol: "تاريخ الصلاحية", statusCol: "الحالة", actionsCol: "إجراءات",

    // Admin - Customers
    customersTab: "العملاء", manageCustomers: "إدارة العملاء", manageCustomersDesc: "عرض العملاء المسجلين وتحديد شارة العميل المميز",
    searchCustomerPh: "ابحث باسم العميل أو البريد الإلكتروني...", hashCol: "#", customerNameCol: "اسم العميل",
    emailCol: "البريد الإلكتروني", regDateCol: "تاريخ التسجيل", premiumCol: "عميل مميز (Premium)", roleCol: "الرتبة",

    // Login/Register
    loginTitle: "تسجيل الدخول", usernamePh: "اسم المستخدم", passwordPh: "كلمة المرور", confirmPasswordPh: "تأكيد كلمة المرور", forgotPassword: "هل نسيت كلمة المرور؟",
    loginWithSocial: "أو سجل عبر المنصات الاجتماعية", registerTitle: "إنشاء حساب", emailPh: "البريد الإلكتروني",
    registerBtnText: "إنشاء الحساب", registerWithSocial: "أو أنشئ حسابك عبر المنصات الاجتماعية",
    helloWelcome: "مرحباً بك!", noAccount: "ليس لديك حساب؟", welcomeBack: "مرحباً بعودتك!", hasAccount: "لديك حساب بالفعل؟",
    toastPasswordMismatch: "كلمتا المرور غير متطابقتين ❌", toastPasswordTooShort: "كلمة المرور يجب أن تكون 6 أحرف على الأقل ❌"
  },
  en: {
    // Navbar (Common)
    home: "Home", store: "Store", contact: "Contact Us", phones: "Phones ▾", accessories: "Accessories ▾",
    login: "Login", logout: "Logout",
    adminPanelTitle: "Admin Panel",

    // Index specific
    heroTitle: "Big Discounts on Phones", heroDesc: "Best Prices – Easy Installments",
    featShipping: "Fast Shipping", featShippingDesc: "Delivery to all governorates",
    featWarranty: "Real Warranty", featWarrantyDesc: "100% Original Products",
    featSupport: "24/7 Support", featSupportDesc: "Customer service around the clock",
    featPayment: "Secure Payment", featPaymentDesc: "Multiple convenient payment options",
    shopNow: "Shop Now", latestProducts: "Latest Products", searchPlaceholder: "Search for a product...",
    all: "All", loading: "Loading products...", addToCart: "Add to Cart", viewDetails: "View Details", loadMore: "Next",
    cartTitle: "🛒 Shopping Cart", cartEmpty: "Cart is empty", totalLabel: "Total:", currency: "EGP", checkout: "Checkout",
    deleteItem: "Remove", checkoutTitle: "Complete Order & Payment", shippingSection: "1. Shipping & Contact Info",
    fullName: "Full Name", phoneNumber: "Phone Number", emailOptional: "Email (optional)",
    fullAddress: "Full Address (City - Area - Street)", paymentSection: "2. Choose Payment Method",
    cashOnDelivery: "Cash on Delivery", valuInstall: "valU Installments", halanInstall: "Halan Installments", vodafoneCash: "Vodafone Cash",
    cashMsg: "The full amount will be collected in cash upon delivery.", valuName: "Name on valU account", valuPhone: "valU phone number",
    halanName: "Name on Halan account", halanPhone: "Halan phone number", nationalId: "National ID (14 digits)",
    instapayMsg: "Please transfer to:<br> <strong>username@instapay</strong>", paymentAddress: "Your Payment Address",
    transactionId: "Transaction Reference ID", vodafoneMsg: "Please transfer to: <strong>010XXXXXXXX</strong>",
    walletNumber: "Sender wallet number", screenshotOptional: "Attach transfer screenshot (optional)", couponCode: "Discount Code", applyCoupon: "Apply",
    confirmOrder: "Confirm Order Now", supportTitle: "Support", supportDesc: "For any questions or issues, contact us through the form below:",
    name: "Name", email: "Email", writeMessage: "Write your message here...", send: "Send",

    // Admin specific
    dashboard: "Dashboard", addProduct: "Add Product", products: "Products", backToStore: "Back to Store",
    dashboardDesc: "Quick overview of your store's performance",
    totalProducts: "Total Products", categories: "Categories", totalStock: "Total Stock", lowStock: "Low Stock",
    recentProducts: "Recent Products", image: "Image", productName: "Product Name", category: "Category",
    price: "Price", stock: "Stock", date: "Date", noProductsYet: "No Products Yet", startAddingProducts: "Start adding your first product",
    addNewProduct: "Add New Product", addProductDesc: "Enter product details to add it to the store",
    editModeBanner: "You are in edit mode - Editing product:", cancelEdit: "Cancel Edit", productData: "Product Data",
    selectCategory: "-- Select Category --", availableQuantity: "Available Quantity", productDescription: "Product Description",
    colorOpt: "Color (Optional)", weightOpt: "Weight (Optional)", skuOpt: "SKU (Optional)", brandOpt: "Brand (Optional)",
    productImage: "Product Image", dragImage: "Drag image here or ", browseFile: "Browse File", uploadLimit: "PNG, JPG, WEBP — Max 5MB",
    btnAddProduct: "Add Product", clearFields: "Clear Fields", manageProducts: "Manage Products", saveEdits: "Save Edits",
    manageProductsDesc: "View, edit, and delete products", searchProductPh: "Search for a product...", actions: "Actions",
    deleteProductTitle: "Delete Product", deleteProductConfirm: "Are you sure you want to delete", noUndo: "This action cannot be undone.",
    yesDelete: "Yes, Delete", cancelBtn: "Cancel", successTitle: "Success!", successMsg: "Product added successfully",
    loadingShort: "Loading...",
    recentOrders: "Recent Orders", viewAll: "View All", topProducts: "Top Products by Price",
    quickActions: "Quick Actions", categoryDistribution: "Product Distribution by Category",

    // Profile specific
    myAccount: "My Account", accountInfo: "Account Info", myOrders: "My Orders", addresses: "Addresses", security: "Security",
    myStats: "My Stats", specialMember: "Special Member", manageProfileDesc: "Manage and edit your personal information",
    basicInfo: "Basic Information", editBtn: "Edit", username: "Username", registrationDate: "Registration Date",
    notAddedYet: "Not added yet", saveChanges: "Save Changes", totalOrders: "Total Orders",
    favorites: "Favorites", totalPurchases: "Total Purchases", orderTracking: "Track your current and previous orders",
    allOrders: "All", pending: "Pending", processing: "Processing", shipped: "Shipped", delivered: "Delivered",
    noOrdersYet: "No orders yet", startShopping: "Start shopping now and enjoy best offers!", shopNowArrow: "Shop Now",
    savedAddresses: "Saved Addresses", manageAddresses: "Manage your shipping addresses", defaultAddress: "Default Address",
    noAddressYet: "No address added yet", deleteBtn: "Delete", addNewAddressBtn: "Add New Address",
    addEditAddress: "Add / Edit Address", cityPh: "City", areaPh: "Area", streetPh: "Street",
    saveBtn: "Save", securityPrivacy: "Security & Privacy", manageSecurity: "Manage your password and security settings",
    changePassword: "Change Password", currentPassword: "Current Password", newPassword: "New Password",
    updatePassword: "Update Password", sessionInfo: "Session Info", currentDevice: "Current Device",
    lastLogin: "Last Login", overviewStats: "Overview of your store activity", completedOrder: "Completed Order",
    totalSpent: "Total Spent", recentOrdersTitle: "Recent Orders", noDataYet: "No data available yet",
    orderNum: "Order ID", orderStatus: "Status", orderTotal: "Total",

    // Compare feature
    compare: "Compare", compareProducts: "⚖️ Compare Products", compareNow: "Compare Now",
    clearCompare: "Clear All", addToCompare: "Add to Compare", removeCompare: "Remove from Compare",
    maxCompareReached: "Maximum 4 products to compare", compareEmpty: "Select products to compare",
    addAllToCart: "🛒 Add All to Cart", closeCompare: "Close",
    inStock: "✅ In Stock", outOfStock: "❌ Out of Stock",

    // Technical specs labels
    specPrice: "💰 Price", specScreen: "📱 Screen", specProcessor: "⚡ Processor",
    specCamera: "📷 Camera", specBattery: "🔋 Battery", specRam: "💾 RAM",
    specStorage: "💿 Storage", specOs: "📲 OS", specStock: "📦 Stock",
    specCategory: "📂 Category", noSpec: "—",

    // Admin spec fields
    screenLabel: "Screen", processorLabel: "Processor", cameraLabel: "Camera",
    batteryLabel: "Battery", ramLabel: "RAM", storageLabel: "Storage", osLabel: "Operating System",
    techSpecs: "Technical Specifications",

    // Product Type Selector
    selectProductType: "Select Product Type",
    typePhone: "Phone / Mobile",
    typePhoneDesc: "Full technical specifications",
    typeAccessory: "Accessories",
    typeAccessoryDesc: "AirPods, Covers, Chargers",
    selectAccessoryType: "Select Accessory Type",
    accAirpods: "AirPods / Headphones",
    accCovers: "Cases & Covers",
    accChargers: "Chargers",
    selectAccTypeError: "Please select accessory type",
    isLatestProduct: "Add to 'Latest Products' (Home Page)",

    // Wishlist
    wishlist: "Wishlist", wishlistTitle: "❤️ Wishlist", wishlistEmpty: "Wishlist is empty",
    addToWishlist: "Add to Wishlist", removeFromWishlist: "Removed from Wishlist",
    addedToWishlist: "Added to Wishlist ❤️", alreadyInWishlist: "Already in Wishlist",
    loginForWishlist: "Login to add to Wishlist", wishlistRemoveBtn: "Remove",

    // Order Management (Admin)
    ordersTab: "Orders", manageOrders: "Order Management", manageOrdersDesc: "View and manage all customer orders",
    customer: "Customer", orderItems: "Items", orderDate: "Order Date", updateStatus: "Update Status",
    statusPending: "Pending", statusProcessing: "Processing", statusShipped: "Shipped",
    statusDelivered: "Delivered", statusCompleted: "Completed", statusCancelled: "Cancelled",
    orderDetailTitle: "Order Details", noOrdersFound: "No Orders Found", noOrdersDesc: "No orders have been received yet",
    orderUpdated: "Order status updated successfully", orderUpdateError: "Error updating order status",
    totalOrdersAdmin: "Total Orders", pendingOrders: "Pending Orders", processingOrders: "Processing",
    deliveredOrders: "Delivered", ordersRevenue: "Total Revenue",
    searchOrderPh: "Search by order # or customer name...", viewOrderDetails: "View Details",
    closeModal: "Close", orderSummary: "Order Summary", productCol: "Product", qtyCol: "Qty", priceCol: "Price",
    heroTitle: "Huge Discounts on Phones", heroDesc: "Best Prices – Easy Installments", shopNow: "Shop Now",
    featShipping: "Fast Shipping", featShippingDesc: "Delivery to all governorates", featWarranty: "Real Warranty", featWarrantyDesc: "100% Original Products",
    featSupport: "24/7 Support", featSupportDesc: "Customer service around the clock", featPayment: "Secure Payment", featPaymentDesc: "Multiple convenient payment options",
    latestProducts: "Latest Products", searchPlaceholder: "Search for a product...", all: "All", loading: "Loading products...",
    cartTitle: "🛒 Shopping Cart", cartEmpty: "Cart is empty", totalLabel: "Total:", checkout: "Checkout",
    checkoutTitle: "Complete Order & Payment", shippingSection: "1. Shipping & Contact Details", fullName: "Full Name",
    phoneNumber: "Primary Phone Number", emailOptional: "Email (Optional)", fullAddress: "Detailed Address (Governorate - Area - Street)",
    paymentSection: "2. Choose Payment Method", cashOnDelivery: "Cash on Delivery", valuInstall: "valU Installments", halanInstall: "Halan Installments", vodafoneCash: "Vodafone Cash",
    cashMsg: "The full amount will be collected in cash upon delivery.", valuName: "Registered Name in valU", valuPhone: "valU Account Phone",
    halanName: "Registered Name in Halan", halanPhone: "Halan Account Phone", nationalId: "National ID (14 digits)",
    instapayMsg: "Please transfer to the following payment address:<br> <strong>username@instapay</strong>", paymentAddress: "Your Payment Address",
    transactionId: "Transaction ID", vodafoneMsg: "Please transfer to the number: <strong>010XXXXXXXX</strong>", walletNumber: "Transfer from Wallet Number",
    screenshotOptional: "Attach transfer screenshot (Optional)", couponCode: "Discount Code", applyCoupon: "Apply", confirmOrder: "Confirm Order Now",
    supportTitle: "Technical Support", supportDesc: "For any inquiries or issues, contact us via the form below:", name: "Name", email: "Email",
    writeMessage: "Write your message here...", send: "Send", phones: 'Phones ▾', accessories: 'Accessories ▾',
    accAirpods: "AirPods", accCovers: "Covers & Cases", accChargers: "Chargers", wishlistTitle: "❤️ Wishlist",
    loadingError: "Error loading product", loadingReviews: "Loading reviews...",
    loginToReview: "You must login to add a review.", noReviews: "No reviews yet. Be the first to review this product!",
    reviewsTitle: "Customer Reviews", writeReview: "Write a Review", submitReview: "Submit Review",
    reviewPlaceholder: "Share your thoughts about the product...",
    addToCart: "Add to Cart", whatsapp: "Order via WhatsApp",
    specs: "Technical Specs", shipping: "Shipping Info",
    shippingText: "Free shipping to all governorates within 3-5 business days.",
    selectColor: "Select Color:", notFound: "Sorry, Product not found.", returnHome: "Return Home",
    currency: "EGP", save: "Save",
    addToWishlist: "Add to Wishlist", removeFromWishlist: "Removed from Wishlist",
    addedToWishlist: "Added to Wishlist ❤️", loginForWishlist: "Login to add to Wishlist",
    wishlistEmpty: "Wishlist is empty", wishlistRemoveBtn: "Remove",
    addToCompare: "Add to Compare", removeCompare: "Remove from Compare",

    // JS Dynamic Texts
    toastLoginSuccess: "Logged in successfully ✅", toastLoginError: "Invalid credentials ❌",
    toastServerError: "Server error occurred ⚠️", toastRegSuccess: "Account created successfully ✅",
    toastRegError: "Username or email already exists ❌",

    noCustomers: "No customers", roleAdmin: "Admin", roleUser: "User", premiumBadgeTooltip: "Premium Customer",
    toastPremiumUp: "Customer upgraded to Premium", toastPremiumDown: "Premium badge removed",
    toastUpdateError: "Error during update", toastConnError: "Connection error",
    toastNoCoupons: "No coupons", toastCouponActive: "Active", toastCouponInactive: "Inactive",
    toastCouponDisableTitle: "Disable", toastCouponEnableTitle: "Enable", noExpiration: "No expiration date",
    deleteCouponConfirm: "Are you sure you want to permanently delete this coupon?", couponDeleted: "Coupon deleted successfully",
    couponAddSuccess: "Coupon added successfully", couponAddError: "Error, code might already exist",
    couponAdding: "Adding...",

    // Admin - Coupons
    couponsTab: "Coupons", manageCoupons: "Manage Coupons", manageCouponsDesc: "Add, edit, and delete discount coupons",
    addNewCoupon: "Add New Coupon", couponCodeAdmin: "Discount Code", discountPercent: "Discount (%)",
    validUntilOpt: "Valid Until (Optional)", btnAddCoupon: "Add Coupon", couponCodeCol: "Code",
    discountCol: "Discount", validUntilCol: "Valid Until", statusCol: "Status", actionsCol: "Actions",

    // Admin - Customers
    customersTab: "Customers", manageCustomers: "Manage Customers", manageCustomersDesc: "View registered customers and set Premium badges",
    searchCustomerPh: "Search by customer name or email...", hashCol: "#", customerNameCol: "Customer Name",
    emailCol: "Email", regDateCol: "Registration Date", premiumCol: "Premium Customer", roleCol: "Role",

    // Login/Register
    loginTitle: "Login", usernamePh: "Username", passwordPh: "Password", confirmPasswordPh: "Confirm Password", forgotPassword: "Forgot Password?",
    loginWithSocial: "or login with social platforms", registerTitle: "Registration", emailPh: "Email",
    registerBtnText: "Register", registerWithSocial: "or register with social platforms",
    helloWelcome: "Hello, Welcome!", noAccount: "Don't have an account?", welcomeBack: "Welcome Back!", hasAccount: "Already have an account?",
    toastPasswordMismatch: "Passwords do not match ❌", toastPasswordTooShort: "Password must be at least 6 characters ❌"
  }
};

function applyLanguage() {
  const html = document.documentElement;
  html.setAttribute("lang", currentLang);
  html.setAttribute("dir", currentLang === "ar" ? "rtl" : "ltr");

  // Update toggle button text if it exists
  const langBtns = document.querySelectorAll(".lang-btn");
  langBtns.forEach(btn => {
    const textSpan = btn.querySelector('.lang-text');
    if (textSpan) {
      textSpan.innerText = currentLang === "ar" ? "EN" : "AR";
    } else {
      btn.innerText = currentLang === "ar" ? "EN" : "AR";
    }
  });

  // Update elements with data-lang-key
  document.querySelectorAll("[data-lang-key]").forEach(el => {
    const key = el.getAttribute("data-lang-key");
    if (translations[currentLang][key]) {
      if (translations[currentLang][key].includes('<')) {
        el.innerHTML = translations[currentLang][key];
      } else {
        el.textContent = translations[currentLang][key];
      }
    }
  });

  // Update placeholders with data-lang-placeholder
  document.querySelectorAll("[data-lang-placeholder]").forEach(el => {
    const key = el.getAttribute("data-lang-placeholder");
    if (translations[currentLang][key]) {
      el.placeholder = translations[currentLang][key];
    }
  });

  // Re-render products in index if it exists
  if (typeof renderProductsFromAPI === 'function' && typeof productsData !== 'undefined' && productsData.length > 0) {
    renderProductsFromAPI();
  }

  // Update Cart if it exists
  if (typeof renderCart === 'function' && typeof cart !== 'undefined') {
    if (cart.length === 0) {
      const cartItemsEl = document.getElementById("cart-items");
      if (cartItemsEl) cartItemsEl.innerHTML = `<p class="empty">${translations[currentLang].cartEmpty}</p>`;
    } else {
      renderCart();
    }
  }

  // Check auth and update UI if the function exists
  if (typeof checkUserAuth === 'function') {
    checkUserAuth();
  }

  // Trigger custom event for other scripts to respond
  document.dispatchEvent(new Event('languageChanged'));
}

function toggleLanguage() {
  currentLang = currentLang === "ar" ? "en" : "ar";
  localStorage.setItem('lang', currentLang);
  applyLanguage();
}

document.addEventListener('DOMContentLoaded', () => {
  applyLanguage();
});
