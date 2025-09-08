// geolocation.js

// ------------------------
// API AYARLARI
// ------------------------
const GEO_API_KEY = 'YOUR_IPGEOLOCATION_API_KEY'; // https://ipgeolocation.io/
const GEO_API_URL = `https://api.ipgeolocation.io/ipgeo?apiKey=${GEO_API_KEY}`;

// ------------------------
// KONUM GETİRME
// ------------------------
export async function getUserLocation() {
    try {
        const response = await fetch(GEO_API_URL);
        if (!response.ok) throw new Error('Konum alınamadı.');
        const data = await response.json();

        return {
            ip: data.ip,
            city: data.city,
            country: data.country_name,
            countryCode: data.country_code2,
            currency: data.currency.code,
            timezone: data.time_zone.name,
            latitude: data.latitude,
            longitude: data.longitude
        };
    } catch (error) {
        console.error('Geolocation hatası:', error);
        return null;
    }
}

// ------------------------
// Para birimini ekranda göster
// ------------------------
export function displayCurrency(currencyCode, element) {
    if (!element) return;
    element.textContent = currencyCode;
}

// ------------------------
// Kullanıcının bulunduğu şehri döndür (Weather.js için)
// ------------------------
export async function getDefaultCity() {
    const location = await getUserLocation();
    return location ? location.city : "Istanbul"; // fallback default
}

/* ------------------------
Örnek kullanım (main.js içinde)
------------------------- */
/*
import { getDefaultCity } from './geolocation.js';

getDefaultCity().then(city => {
    console.log("Varsayılan şehir:", city);
    // buradan weather.js'e city gönderilebilir
});
*/
