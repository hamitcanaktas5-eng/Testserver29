const PW_LIMIT = 7 * 24 * 60 * 60 * 1000;

// ─── PANEL AÇ ───
async function openPasswordPanel() {
    const lastChange = localStorage.getItem('roxy_last_password');
    if (lastChange) {
        const diff = Date.now() - parseInt(lastChange);
        if (diff < PW_LIMIT) {
            const remaining = PW_LIMIT - diff;
            const days  = Math.floor(remaining / (24 * 60 * 60 * 1000));
            const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
            const kalan = days > 0 ? days + ' gün ' + hours + ' saat' : hours + ' saat';
            await RoxyUI.alert('İşlem Sınırı',
                'Şifrenizi haftada 1 kez değiştirebilirsiniz.<br><br>⏳ Kalan süre: <strong>' + kalan + '</strong>',
                'warning');
            return;
        }
    }
    document.getElementById('profileMain').style.display   = 'none';
    document.getElementById('passwordPanel').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── PANEL KAPAT ───
function closePasswordPanel() {
    document.getElementById('passwordPanel').style.display = 'none';
    document.getElementById('profileMain').style.display   = 'block';
    resetPasswordForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── ŞİFRE GÖSTER/GİZLE ───
function togglePw(inputId, btn) {
    var input = document.getElementById(inputId);
    var icon  = btn.querySelector('i');
    if (input.type === 'password') {
        input.type     = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type     = 'password';
        icon.className = 'fas fa-eye';
    }
}

// ─── FORM KONTROL ───
function checkPasswordForm() {
    var oldPw  = document.getElementById('oldPassword').value;
    var newPw  = document.getElementById('newPassword').value;
    var confPw = document.getElementById('confirmPassword').value;
    var btn    = document.getElementById('btnSavePassword');
    var hint   = document.getElementById('matchHint');

    var reqs = {
        len:   newPw.length >= 8,
        upper: /[A-Z]/.test(newPw),
        lower: /[a-z]/.test(newPw),
        num:   /\d/.test(newPw)
    };

    setReq('req-len',   reqs.len,   'En az 8 karakter');
    setReq('req-upper', reqs.upper, 'Büyük harf');
    setReq('req-lower', reqs.lower, 'Küçük harf');
    setReq('req-num',   reqs.num,   'Rakam');

    var allValid = reqs.len && reqs.upper && reqs.lower && reqs.num;

    if (confPw.length > 0) {
        if (newPw === confPw) {
            hint.textContent = '✓ Şifreler eşleşiyor';
            hint.className   = 'match-hint ok';
        } else {
            hint.textContent = '✗ Şifreler eşleşmiyor';
            hint.className   = 'match-hint error';
        }
    } else {
        hint.textContent = '';
        hint.className   = 'match-hint';
    }

    btn.disabled = !(oldPw.length >= 6 && allValid && newPw === confPw);
}

function setReq(id, valid, text) {
    var el = document.getElementById(id);
    if (!el) return;
    el.className = 'req' + (valid ? ' valid' : '');
    el.innerHTML = '<i class="fas fa-' + (valid ? 'check-circle' : 'times-circle') + '"></i> ' + text;
}

// ─── ŞİFRE KAYDET ───
function savePassword() {
    var oldPw  = document.getElementById('oldPassword').value;
    var newPw  = document.getElementById('newPassword').value;
    var confPw = document.getElementById('confirmPassword').value;
    if (!oldPw || !newPw || newPw !== confPw) return;

    // TODO: Firebase Auth
    localStorage.setItem('roxy_last_password', Date.now().toString());
    updateLastChange();
    RoxyUI.toast('Şifreniz başarıyla güncellendi!', 'success');
    closePasswordPanel();
}

// ─── ÇIKIŞ ───
async function handleLogout() {
    var ok = await RoxyUI.confirm(
        'Çıkış Yap',
        'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
        'Evet, Çıkış Yap', 'İptal', true
    );
    if (ok) {
        window.location.href = 'auth.html';
    }
}

// ─── SIFIRLA ───
function resetPasswordForm() {
    ['oldPassword', 'newPassword', 'confirmPassword'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) { el.value = ''; el.type = 'password'; }
        var btn = el && el.parentNode && el.parentNode.querySelector('.toggle-pw i');
        if (btn) btn.className = 'fas fa-eye';
    });
    var hint = document.getElementById('matchHint');
    if (hint) { hint.textContent = ''; hint.className = 'match-hint'; }
    var btn = document.getElementById('btnSavePassword');
    if (btn) btn.disabled = true;
    ['req-len', 'req-upper', 'req-lower', 'req-num'].forEach(function(id) {
        var texts = { 'req-len': 'En az 8 karakter', 'req-upper': 'Büyük harf', 'req-lower': 'Küçük harf', 'req-num': 'Rakam' };
        setReq(id, false, texts[id]);
    });
}

// ─── SON DEĞİŞİKLİK ───
function updateLastChange() {
    var el = document.getElementById('lastPasswordChange');
    if (!el) return;
    var ts = localStorage.getItem('roxy_last_password');
    if (ts) {
        var d = new Date(parseInt(ts));
        el.textContent = 'Son değişiklik: ' + d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateLastChange();
});
