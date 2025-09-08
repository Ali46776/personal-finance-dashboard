// finance.js

// ------------------------
// GELİR / GİDER İŞLEMLERİ
// ------------------------

// Toplam gelir hesapla (sadece Gelir kategorisi)
export function calculateIncome(transactions) {
    return transactions
        .filter(t => t.category === 'Gelir')
        .reduce((sum, t) => sum + t.amount, 0);
}

// Toplam gider hesapla (Gelir dışındaki tüm işlemler)
export function calculateExpense(transactions) {
    return transactions
        .filter(t => t.category !== 'Gelir')
        .reduce((sum, t) => sum + (t.amount > 0 ? t.amount * -1 : t.amount), 0);
}

// Bakiye hesapla
export function calculateBalance(transactions) {
    return calculateIncome(transactions) + calculateExpense(transactions);
}

// Belirli bir kategoriye göre filtrele
export function filterByCategory(transactions, category) {
    if (category === 'all') return transactions;
    return transactions.filter(t => t.category === category);
}

// Belirli bir süreye göre filtrele (month, week, all)
export function filterByPeriod(transactions, period) {
    if (period === 'all') return transactions;
    const now = new Date();
    return transactions.filter(t => {
        const txDate = new Date(t.date);
        if (period === 'month') return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
        if (period === 'week') {
            const diffDays = (now - txDate) / (1000 * 60 * 60 * 24);
            return diffDays <= 7;
        }
        return true;
    });
}

// Yeni işlem ekle (sisteme otomatik olarak gideri algıla)
export function addTransaction(transactions, transaction) {
    // Eğer gelir değilse amount pozitif olsa bile negatif yap
    if (transaction.category !== 'Gelir' && transaction.amount > 0) {
        transaction.amount = -transaction.amount;
    }
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// İşlem sil
export function deleteTransactionById(transactions, id) {
    const newTx = transactions.filter(t => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(newTx));
    return newTx;
}

// Özet güncelle
export function updateSummaryDOM(transactions, incomeEl, expenseEl, balanceEl) {
    const income = calculateIncome(transactions);
    const expense = calculateExpense(transactions);
    const balance = calculateBalance(transactions);

    incomeEl.textContent = `₺${income.toFixed(2)}`;
    expenseEl.textContent = `₺${Math.abs(expense).toFixed(2)}`;
    balanceEl.textContent = `₺${balance.toFixed(2)}`;
}
