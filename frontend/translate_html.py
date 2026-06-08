import re
import json

admin_map = {
    'الرئيسية': 'home',
    'لوحة التحكم': 'adminPanelTitle',
    'تسجيل الدخول': 'login',
    'لوحة إدارة المتجر': 'adminPanelTitle',
    'لوحة المعلومات': 'dashboard',
    'إضافة منتج': 'addProduct',
    'المنتجات': 'products',
    'العودة للمتجر': 'backToStore',
    'نظرة سريعة على أداء متجرك': 'dashboardDesc',
    'إجمالي المنتجات': 'totalProducts',
    'الأقسام': 'categories',
    'إجمالي المخزون': 'totalStock',
    'مخزون منخفض': 'lowStock',
    'آخر المنتجات المضافة': 'recentProducts',
    'الصورة': 'image',
    'اسم المنتج': 'productName',
    'القسم': 'category',
    'السعر': 'price',
    'المخزون': 'stock',
    'التاريخ': 'date',
    'إضافة منتج جديد': 'addNewProduct',
    'أدخل بيانات المنتج الجديد لإضافته للمتجر': 'addProductDesc',
    'أنت في وضع التعديل - تعديل المنتج:': 'editModeBanner',
    'إلغاء التعديل': 'cancelEdit',
    'بيانات المنتج': 'productData',
    '-- اختر القسم --': 'selectCategory',
    'الكمية المتاحة': 'availableQuantity',
    'وصف المنتج': 'productDescription',
    'اللون \\(اختياري\\)': 'colorOpt',
    'الوزن \\(اختياري\\)': 'weightOpt',
    'رمز المنتج SKU \\(اختياري\\)': 'skuOpt',
    'العلامة التجارية \\(اختياري\\)': 'brandOpt',
    'صورة المنتج': 'productImage',
    'اسحب الصورة هنا أو': 'dragImage',
    'اختر ملف': 'browseFile',
    'PNG, JPG, WEBP — حد أقصى 5MB': 'uploadLimit',
    'إضافة المنتج': 'btnAddProduct',
    'مسح الحقول': 'clearFields',
    'إدارة المنتجات': 'manageProducts',
    'عرض وتعديل وحذف المنتجات': 'manageProductsDesc',
    'إجراءات': 'actions',
    'حذف المنتج': 'deleteProductTitle',
    'هل أنت متأكد من حذف': 'deleteProductConfirm',
    'لا يمكن التراجع عن هذا الإجراء.': 'noUndo',
    'نعم، احذف': 'yesDelete',
    'إلغاء': 'cancelBtn',
    'تم بنجاح!': 'successTitle',
    'تم إضافة المنتج بنجاح': 'successMsg',
}

profile_map = {
    'الرئيسية': 'home',
    'تسجيل الدخول': 'login',
    'تسجيل الخروج': 'logout',
    'حسابي': 'myAccount',
    'معلومات الحساب': 'accountInfo',
    'طلباتي': 'myOrders',
    'العناوين': 'addresses',
    'الأمان': 'security',
    'إحصائياتي': 'myStats',
    'عضو مميز': 'specialMember',
    'إدارة بياناتك الشخصية والتعديل عليها': 'manageProfileDesc',
    'البيانات الأساسية': 'basicInfo',
    'تعديل': 'editBtn',
    'اسم المستخدم': 'username',
    'تاريخ التسجيل': 'registrationDate',
    'لم يتم الإضافة بعد': 'notAddedYet',
    'حفظ التغييرات': 'saveChanges',
    'إجمالي الطلبات': 'totalOrders',
    'المفضلة': 'favorites',
    'إجمالي المشتريات': 'totalPurchases',
    'تتبع حالة طلباتك السابقة والحالية': 'orderTracking',
    'الكل': 'allOrders',
    'قيد الانتظار': 'pending',
    'جاري التجهيز': 'processing',
    'تم الشحن': 'shipped',
    'تم التوصيل': 'delivered',
    'لا يوجد طلبات بعد': 'noOrdersYet',
    'ابدأ التسوق الآن واستمتع بأفضل العروض!': 'startShopping',
    'تسوق الآن': 'shopNowArrow',
    'العناوين المحفوظة': 'savedAddresses',
    'إدارة عناوين الشحن والتوصيل': 'manageAddresses',
    'العنوان الأساسي': 'defaultAddress',
    'لم يتم إضافة عنوان بعد': 'noAddressYet',
    'حذف': 'deleteBtn',
    'إضافة عنوان جديد': 'addNewAddressBtn',
    'إضافة / تعديل عنوان': 'addEditAddress',
    'المحافظة': 'cityPh',
    'المنطقة / الحي': 'areaPh',
    'الشارع ورقم المبنى': 'streetPh',
    'حفظ': 'saveBtn',
    'الأمان والخصوصية': 'securityPrivacy',
    'إدارة كلمة المرور وإعدادات الأمان': 'manageSecurity',
    'تغيير كلمة المرور': 'changePassword',
    'كلمة المرور الحالية': 'currentPassword',
    'كلمة المرور الجديدة': 'newPassword',
    'تحديث كلمة المرور': 'updatePassword',
    'معلومات الجلسة': 'sessionInfo',
    'الجهاز الحالي': 'currentDevice',
    'آخر تسجيل دخول': 'lastLogin',
    'نظرة شاملة على نشاطك في المتجر': 'overviewStats',
    'طلب تم تنفيذه': 'completedOrder',
    'إجمالي الإنفاق': 'totalSpent',
    'آخر الطلبات': 'recentOrdersTitle',
    'لا توجد بيانات حتى الآن': 'noDataYet',
    'رقم الطلب': 'orderNum',
    'الحالة': 'orderStatus',
    'الإجمالي': 'orderTotal',
    'البريد الإلكتروني': 'email',
    'رقم الموبايل': 'phoneNumber'
}

def process_file(filepath, text_map):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add data-lang-key to plain text inside tags
    for ar_text, key in text_map.items():
        # Handle exact matches inside tags
        content = re.sub(
            f'(>\\s*)({ar_text})(\\s*<)',
            f'\\g<1><span data-lang-key="{key}">\\g<2></span>\\g<3>',
            content
        )

    # Inject lang button and script
    if '<button class="lang-btn"' not in content:
        content = content.replace(
            '<div id="user-auth-area">',
            '<button class="lang-btn" onclick="toggleLanguage()">EN</button>\n    <div id="user-auth-area">'
        )
    
    if '<script src="lang.js"></script>' not in content:
        content = content.replace(
            f'<script src="{filepath.split("/")[-1].replace(".html", ".js")}"></script>',
            f'<script src="lang.js"></script>\n<script src="{filepath.split("/")[-1].replace(".html", ".js")}"></script>'
        )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

process_file('d:/Store Project/eccomerce-master/frontend/admin.html', admin_map)
process_file('d:/Store Project/eccomerce-master/frontend/profile.html', profile_map)
print("HTML translation processing complete.")
