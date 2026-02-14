
// ─── FİYAT FORMATI ───
function formatPrice(amount) {
    return Math.round(amount).toLocaleString('tr-TR') + ' ₺';
}

// ─── FİYAT VERİSİ ───
const SERVICES = {
    instagram: {
        takipci: { label: 'Takipçi', pricePerK: 100, min: 200,  max: 10000,  status: 'active' },
        begeni:  { label: 'Beğeni',  pricePerK: 100, min: 500,  max: 50000,  status: 'active' },
        izlenme: { label: 'İzlenme', pricePerK: 0,   min: 0,    max: 0,      status: 'maintenance' }
    },
    tiktok: {
        takipci: { label: 'Takipçi', pricePerK: 150, min: 350,  max: 35000,  status: 'active' },
        begeni:  { label: 'Beğeni',  pricePerK: 80,  min: 200,  max: 100000, status: 'active' },
        izlenme: { label: 'İzlenme', pricePerK: 0,   min: 0,    max: 0,      status: 'maintenance' }
    }
};

// ─── SİDEBAR ───
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('active');
}

// ─── MESAİ ───
function isWorkingHours() {
    const now  = new Date();
    const day  = now.getDay();
    const time = now.getHours() + now.getMinutes() / 60;
    if (day === 0 || day === 6) return true;
    return time >= 17 && time < 24;
}

// ─── API DEĞİŞTİ ───
function onApiChange() {
    var api    = document.getElementById('apiSelect').value;
    var svcSel = document.getElementById('serviceSelect');

    svcSel.innerHTML = '<option value="">— Seçiniz —</option>';
    document.getElementById('amountGroup').style.display = 'none';
    hidePriceBox();
    hideScheduleCard();
    document.getElementById('buyBtn').disabled = true;

    if (!api) {
        svcSel.disabled = true;
        return;
    }

    svcSel.disabled = false;
    var icons = { takipci: '👥', begeni: '❤️', izlenme: '▶️' };
    var svcs  = SERVICES[api];

    for (var key in svcs) {
        var s   = svcs[key];
        var opt = document.createElement('option');
        opt.value = key;
        if (s.status === 'maintenance') {
            opt.textContent = icons[key] + ' ' + s.label + ' (🔧 Bakımda)';
            opt.disabled    = true;
        } else {
            opt.textContent = icons[key] + ' ' + s.label;
        }
        svcSel.appendChild(opt);
    }
}

// ─── SERVİS DEĞİŞTİ ───
function onServiceChange() {
    var api     = document.getElementById('apiSelect').value;
    var svc     = document.getElementById('serviceSelect').value;
    var amGroup = document.getElementById('amountGroup');
    var amInput = document.getElementById('amountInput');

    hidePriceBox();
    hideScheduleCard();
    document.getElementById('buyBtn').disabled      = true;
    document.getElementById('amountInfo').textContent = '';
    document.getElementById('amountInfo').className  = 'amount-info';

    if (!api || !svc) {
        amGroup.style.display = 'none';
        return;
    }

    var s = SERVICES[api][svc];
    document.getElementById('amountHint').textContent =
        'Min ' + s.min.toLocaleString('tr-TR') + ' – Maks ' + s.max.toLocaleString('tr-TR');
    amInput.min   = s.min;
    amInput.max   = s.max;
    amInput.value = '';
    amGroup.style.display = 'flex';
    setTimeout(function () { amInput.focus(); }, 100);
}

// ─── MİKTAR DEĞİŞTİ ───
function onAmountChange() {
    var api    = document.getElementById('apiSelect').value;
    var svc    = document.getElementById('serviceSelect').value;
    var amount = parseInt(document.getElementById('amountInput').value) || 0;
    var infoEl = document.getElementById('amountInfo');

    hidePriceBox();
    hideScheduleCard();
    document.getElementById('buyBtn').disabled = true;
    infoEl.className   = 'amount-info';
    infoEl.textContent = '';

    if (!api || !svc || !amount) return;

    var s = SERVICES[api][svc];

    if (amount < s.min) {
        infoEl.className   = 'amount-info error';
        infoEl.textContent = '⚠ En az ' + s.min.toLocaleString('tr-TR') + ' girilmelidir.';
        return;
    }
    if (amount > s.max) {
        infoEl.className   = 'amount-info error';
        infoEl.textContent = '⚠ En fazla ' + s.max.toLocaleString('tr-TR') + ' girilebilir.';
        return;
    }

    infoEl.className   = 'amount-info ok';
    infoEl.textContent = '✓ Geçerli miktar';

    var total = (amount / 1000) * s.pricePerK;
    document.getElementById('priceTotal').textContent = formatPrice(total);
    document.getElementById('priceBox').classList.add('show');

    updateScheduleCard();
    document.getElementById('buyBtn').disabled = false;
}

// ─── MESAİ KARTI ───
function updateScheduleCard() {
    var card    = document.getElementById('scheduleCard');
    var icon    = document.getElementById('scheduleIcon');
    var title   = document.getElementById('scheduleTitle');
    var text    = document.getElementById('scheduleText');
    var working = isWorkingHours();

    card.className = 'schedule-card show ' + (working ? 'mesai-ici' : 'mesai-disi');

    if (working) {
        icon.innerHTML    = '<i class="fas fa-check-circle"></i>';
        title.textContent = 'Mesai Saatlerindeyiz ✓';
        text.textContent  = 'Siparişiniz en geç 30 dakika içinde başlayacaktır.';
    } else {
        icon.innerHTML    = '<i class="fas fa-moon"></i>';
        title.textContent = 'Mesai Saati Dışı';
        text.innerHTML    =
            'Siparişiniz alınacak ve aşağıdaki mesai saatlerinde başlayacaktır:<br><br>' +
            '📅 <strong>Hafta içi:</strong> 17:00 – 00:00<br>' +
            '📅 <strong>Hafta sonu:</strong> 7/24 aktif';
    }
}

function hidePriceBox() {
    document.getElementById('priceBox').classList.remove('show');
}

function hideScheduleCard() {
    document.getElementById('scheduleCard').className = 'schedule-card';
}

// ─── SİPARİŞ VER ───
async function handleOrder() {
    var api    = document.getElementById('apiSelect').value;
    var svc    = document.getElementById('serviceSelect').value;
    var amount = parseInt(document.getElementById('amountInput').value) || 0;

    if (!api || !svc || !amount) return;

    var s       = SERVICES[api][svc];
    var total   = (amount / 1000) * s.pricePerK;
    var orderId = 'SMM' + Date.now();

    // TODO: Firebase bakiye kontrolü
    var balance = 0;
    if (balance < total) {
        await RoxyUI.alert('Yetersiz Bakiye',
            'Sipariş vermek için yeterli bakiyeniz bulunmuyor.<br><br>Bakiye eklemek için yönlendiriliyorsunuz.',
            'warning');
        window.location.href = 'balance.html';
        return;
    }

    var platformName = api === 'instagram' ? '📸 Instagram' : '🎵 TikTok';
    var working  = isWorkingHours();
    var timeMsg  = working
        ? 'Siparişiniz en geç 30 dakika içinde başlayacaktır.'
        : 'Siparişiniz mesai saatlerinde başlayacaktır.';

    var ok = await RoxyUI.confirm(
        'Sipariş Özeti',
        'Platform: <strong>' + platformName + '</strong><br>' +
        'Servis: <strong>' + s.label + '</strong><br>' +
        'Miktar: <strong>' + amount.toLocaleString('tr-TR') + '</strong><br>' +
        'Tutar: <strong>₺' + total.toFixed(2) + '</strong><br><br>' +
        'Sipariş No: <strong>' + orderId + '</strong><br><br>' + timeMsg,
        'Onayla', 'İptal'
    );

    if (ok) {
        // TODO: Firebase
        RoxyUI.toast('Siparişiniz alındı! No: ' + orderId, 'success', 5000);

        // Formu sıfırla
        document.getElementById('apiSelect').value       = '';
        document.getElementById('serviceSelect').value   = '';
        document.getElementById('serviceSelect').disabled = true;
        document.getElementById('serviceSelect').innerHTML = '<option value="">— Önce API seçin —</option>';
        document.getElementById('amountGroup').style.display = 'none';
        document.getElementById('amountInput').value      = '';
        document.getElementById('amountInfo').textContent = '';
        hidePriceBox();
        hideScheduleCard();
        document.getElementById('buyBtn').disabled = true;
    }
}
