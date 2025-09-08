// ------------------------
// GLOBAL DEĞİŞKENLER
// ------------------------
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
const WEATHER_API_KEY = "9104392eee8c8812bf572eb06ec34dd7";

// ------------------------
// DOM ELEMENTLERİ
// ------------------------
const addBtn = document.getElementById('open-add-modal');
const modal = document.getElementById('add-modal');
const closeBtn = document.getElementById('close-add-modal');
const cancelBtn = document.getElementById('cancel-add');
const addForm = document.getElementById('add-transaction-form');
const totalBalanceEl = document.getElementById('total-balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const transactionsList = document.getElementById('transactions-list');
const periodFilter = document.getElementById('period-filter');
const categoryFilter = document.getElementById('category-filter');
const themeBtn = document.getElementById('toggle-theme');
const exportBtn = document.getElementById('export-data');
const importBtn = document.getElementById('import-data');
const importInput = document.getElementById('import-file');

// ------------------------
// UTILITY FONKSİYONLAR
// ------------------------
function calculateIncome(arr){
    return arr.filter(t => t.amount > 0).reduce((sum,t) => sum + t.amount,0);
}
function calculateExpense(arr){
    return arr.filter(t => t.amount < 0).reduce((sum,t) => sum + t.amount,0);
}
function calculateBalance(arr){
    return calculateIncome(arr) + calculateExpense(arr);
}
function filterByCategory(arr,cat){
    return cat==='all'?arr:arr.filter(t=>t.category===cat);
}
function filterByPeriod(arr,period){
    const now = new Date();
    return arr.filter(t=>{
        const txDate = new Date(t.date);
        if(period==='month') return txDate.getMonth()===now.getMonth() && txDate.getFullYear()===now.getFullYear();
        if(period==='week'){
            const oneJan = new Date(now.getFullYear(),0,1);
            const currentWeek = Math.ceil((((now-oneJan)/86400000)+oneJan.getDay()+1)/7);
            const txWeek = Math.ceil((((txDate-oneJan)/86400000)+oneJan.getDay()+1)/7);
            return currentWeek===txWeek && txDate.getFullYear()===now.getFullYear();
        }
        return true;
    });
}
function addTransaction(arr,tx){
    arr.push(tx);
    localStorage.setItem('transactions',JSON.stringify(arr));
}
function deleteTransactionById(arr,id){
    const newArr = arr.filter(t=>t.id!==id);
    localStorage.setItem('transactions',JSON.stringify(newArr));
    return newArr;
}
function updateSummaryDOM(arr,incEl,expEl,balanceEl){
    const income = calculateIncome(arr);
    const expense = calculateExpense(arr);
    const balance = calculateBalance(arr);
    incEl.textContent = `₺${income.toFixed(2)}`;
    expEl.textContent = `₺${Math.abs(expense).toFixed(2)}`;
    balanceEl.textContent = `₺${balance.toFixed(2)}`;
}

// ------------------------
// MODAL FONKSİYONLARI
// ------------------------
function showModal(){ modal.style.display='flex'; modal.setAttribute('aria-hidden','false'); }
function hideModal(){ modal.style.display='none'; modal.setAttribute('aria-hidden','true'); }
addBtn?.addEventListener('click', showModal);
closeBtn?.addEventListener('click', hideModal);
cancelBtn?.addEventListener('click', hideModal);
modal?.addEventListener('click', e => { if(e.target===modal) hideModal(); });

// ------------------------
// RENDER TRANSACTIONS
// ------------------------
function renderTransactions(){
    transactionsList.innerHTML='';
    let filtered = filterByPeriod(transactions, periodFilter.value);
    filtered = filterByCategory(filtered, categoryFilter.value);
    filtered.forEach(t=>{
        const tr = document.createElement('tr');
        tr.innerHTML=`
            <td>${t.date}</td>
            <td>${t.description}</td>
            <td>${t.category}</td>
            <td>${t.amount>0? '₺'+t.amount.toFixed(2) : '-₺'+Math.abs(t.amount).toFixed(2)}</td>
            <td><button class="delete-btn" title="Sil">🗑️</button></td>
        `;
        const deleteBtn = tr.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', ()=>{ transactions = deleteTransactionById(transactions, t.id); renderTransactions(); });
        transactionsList.appendChild(tr);
    });
    updateSummaryDOM(transactions,totalIncomeEl,totalExpenseEl,totalBalanceEl);
}

// ------------------------
// FORM SUBMIT
// ------------------------
addForm?.addEventListener('submit',e=>{
    e.preventDefault();
    const txDate = document.getElementById('tx-date').value;
    const txDesc = document.getElementById('tx-desc').value;
    const txCategory = document.getElementById('tx-category').value;
    const txAmount = parseFloat(document.getElementById('tx-amount').value);
    if(!txDate||!txDesc||!txCategory||isNaN(txAmount)) return alert('Lütfen tüm alanları doldurun.');
    const newTx = {id:Date.now(), date:txDate, description:txDesc, category:txCategory, amount:txAmount};
    addTransaction(transactions,newTx);
    transactions = JSON.parse(localStorage.getItem('transactions'));
    renderTransactions();
    addForm.reset();
    hideModal();
});

// ------------------------
// FILTERS
// ------------------------
periodFilter?.addEventListener('change', renderTransactions);
categoryFilter?.addEventListener('change', renderTransactions);

// ------------------------
// THEME
// ------------------------
themeBtn?.addEventListener('click', ()=>{
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme',document.body.classList.contains('dark-mode')?'dark':'light');
});
if(localStorage.getItem('theme')==='dark') document.body.classList.add('dark-mode');

// ------------------------
// EXPORT / IMPORT JSON
// ------------------------
exportBtn?.addEventListener('click', ()=>{
    const blob = new Blob([JSON.stringify(transactions,null,2)], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download='transactions.json'; a.click();
});
importBtn?.addEventListener('click', ()=>importInput.click());
importInput?.addEventListener('change', e=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (event)=>{
        try{
            const importedData = JSON.parse(event.target.result);
            if(Array.isArray(importedData)){
                transactions = importedData;
                localStorage.setItem('transactions', JSON.stringify(transactions));
                renderTransactions();
            } else { alert('Geçersiz JSON formatı'); }
        } catch(err){ alert('JSON okunamadı: '+err.message); }
    };
    reader.readAsText(file);
});

// ------------------------
// WEATHER
// ------------------------
async function getLocationWeather(){
    if(!navigator.geolocation){ alert("Tarayıcınız konum servisini desteklemiyor."); return; }
    navigator.geolocation.getCurrentPosition(async pos=>{
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try{
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=tr`);
            if(!res.ok) throw new Error("Hava durumu alınamadı");
            const data = await res.json();
            showWeather(data);
        } catch(err){
            console.error(err);
            document.getElementById('weather-city').textContent="-";
            document.getElementById('weather-temp').textContent="-";
            document.getElementById('weather-desc').textContent="-";
        }
    });
}
function showWeather(data){
    document.getElementById('weather-city').textContent = data.name;
    document.getElementById('weather-temp').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('weather-desc').textContent = data.weather[0].description;
    const iconEl = document.getElementById('weather-icon');
    iconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    iconEl.alt = data.weather[0].description;
}

// ------------------------
// INITIALIZATION
// ------------------------
window.addEventListener('DOMContentLoaded', ()=>{
    renderTransactions();
    getLocationWeather();
});
