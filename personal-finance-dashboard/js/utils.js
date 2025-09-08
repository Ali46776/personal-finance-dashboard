// utils.js

// ------------------------
// Tarih formatlama
// ------------------------
export function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// ------------------------
// Para formatlama
// ------------------------
export function formatCurrency(amount, currency = '₺') {
    const sign = amount < 0 ? '-' : '';
    return `${sign}${currency}${Math.abs(amount).toFixed(2)}`;
}

// ------------------------
// Rastgele ID üretme (gerektiğinde)
// ------------------------
export function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// ------------------------
// Array filtreleme: tarih bazlı (hafta/ay)
// ------------------------
export function filterByPeriod(array, periodKey) {
    const now = new Date();
    return array.filter(item => {
        const itemDate = new Date(item.date);
        if (periodKey === 'month') return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
        if (periodKey === 'week') {
            const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);
            return diffDays <= 7;
        }
        return true; // 'all' dönmesi için
    });
}

// ------------------------
// Kategori filtreleme
// ------------------------
export function filterByCategory(array, category) {
    if (category === 'all') return array;
    return array.filter(item => item.category === category);
}

// ------------------------
// LocalStorage işlemleri
// ------------------------
export function saveToLocal(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

export function loadFromLocal(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
}

// ------------------------
// Tema kaydetme ve yükleme
// ------------------------
export function saveTheme(isDark) {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

export function loadTheme() {
    return localStorage.getItem('theme') === 'dark';
}
