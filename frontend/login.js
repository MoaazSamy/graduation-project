
// ================= SOCIAL AUTH CALLBACK =================
// لما الباك إند يرجع المستخدم بعد تسجيل الدخول بـ GitHub أو LinkedIn
// بيحط التوكنز وبيانات المستخدم في الـ URL كـ query params
(async function handleSocialAuthCallback() {
    const params = new URLSearchParams(window.location.search);
    const access = params.get('access');
    const refresh = params.get('refresh');

    if (access && refresh) {
        // ✅ حفظ التوكنز في API_BASE
        localStorage.setItem('access', access);
        localStorage.setItem('refresh', refresh);

        // ✅ نجيب بيانات المستخدم من الـ URL params أو من الـ API
        const userId = params.get('user_id');
        const userName = params.get('user_name');
        const userEmail = params.get('user_email');
        const isAdmin = params.get('is_admin') === 'true';

        if (userId && userName) {
            // البيانات موجودة في الـ URL — نحفظها مباشرة
            localStorage.setItem('currentUser', JSON.stringify({
                id: parseInt(userId),
                name: userName,
                email: userEmail || '',
                is_admin: isAdmin,
                is_premium: params.get('is_premium') === 'true'
            }));
        } else {
            // لو مش موجودة — نجيبها من الـ API
            try {
                const res = await fetch('https://web-production-2a731.up.railway.app/api/users/profile/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${access}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (res.ok) {
                    const userData = await res.json();
                    localStorage.setItem('currentUser', JSON.stringify({
                        id: userData.id,
                        name: userData.username,
                        email: userData.email,
                        is_admin: false,
                        is_premium: userData.is_premium || false
                    }));
                }
            } catch (err) {
                console.error('خطأ في جلب بيانات المستخدم:', err);
            }
        }

        // ✅ ننظف الـ URL من التوكنز (عشان الأمان)
        window.history.replaceState({}, document.title, window.location.pathname);

        // ✅ نحول المستخدم للصفحة الرئيسية
        showToast(translations[currentLang].toastLoginSuccess || 'تم تسجيل الدخول بنجاح ✅');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
        return;
    }
})();

const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
})

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
})

// ================= LOGIN (تسجيل الدخول) =================

// بنمسك فورم اللوجين عن طريق الـ id
document.getElementById("login-form").addEventListener("submit", async function(e) {

    // نمنع الريفريش الافتراضي للصفحة
    e.preventDefault();

    // نجيب القيم اللي المستخدم كتبها
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    try {
        // نبعت request للباك إند (Django API)
        const res = await fetch("https://web-production-2a731.up.railway.app/api/users/login/", {
            method: "POST", // نوع الطلب
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        // نحول الرد لـ JSON
        const data = await res.json();

        // لو فيه خطأ (يوزر غلط مثلاً)
        if (!res.ok) {
            showToast(translations[currentLang].toastLoginError, "#dc2626");
            return;
        }

        // ✅ حفظ التوكن في API_BASE
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);

        // ✅ حفظ بيانات المستخدم
        localStorage.setItem("currentUser", JSON.stringify({
            id: data.user_id,
            name: data.user_name,
            email: data.user_email,
            is_admin: data.is_admin,
            is_premium: data.is_premium
        }));

        showToast(translations[currentLang].toastLoginSuccess);

        // نديه ثانية صغيرة قبل التحويل
        setTimeout(() => {
            window.location.href = "index.html";
        }, 500);

    } catch (err) {
        // لو السيرفر واقع أو فيه مشكلة
        console.error(err);
        showToast(translations[currentLang].toastServerError, "#f59e0b");
    }
});


// ================= REGISTER (إنشاء حساب جديد) =================

// بنمسك فورم التسجيل
document.getElementById("register-form").addEventListener("submit", async function(e) {

    // نمنع الريفريش
    e.preventDefault();

    // نجيب البيانات من الفورم
    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("register-confirm-password").value;

    // التحقق من تطابق الباسوردين
    if (password !== confirmPassword) {
        showToast(translations[currentLang].toastPasswordMismatch || "كلمتا المرور غير متطابقتين ❌", "#dc2626");
        return;
    }

    // التحقق من طول الباسورد
    if (password.length < 6) {
        showToast(translations[currentLang].toastPasswordTooShort || "كلمة المرور يجب أن تكون 6 أحرف على الأقل ❌", "#dc2626");
        return;
    }

    try {
        // نبعت البيانات للباك إند عشان نسجل المستخدم
        const res = await fetch("https://web-production-2a731.up.railway.app/api/users/register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });

        // لو حصل خطأ
        if (!res.ok) {
            showToast(translations[currentLang].toastRegError, "#dc2626");
            return;
        }

        showToast(translations[currentLang].toastRegSuccess);

        // يرجع للوجين تلقائي
        setTimeout(() => {
            container.classList.remove('active');
        }, 500);

        // يرجعه تلقائي لفورم اللوجين
        container.classList.remove('active');

    } catch (err) {
        console.error(err);
        showToast(translations[currentLang].toastServerError, "#f59e0b");
    }
});

// ================= TOAST =================
function showToast(msg) {
    const toast = document.createElement("div");

    toast.innerText = msg;
    toast.style = `
        position:fixed;
        bottom:20px;
        left:20px;
        background:#0f172a;
        color:white;
        padding:10px 20px;
        border-radius:10px;
        z-index:9999;
    `;

    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2000);
}