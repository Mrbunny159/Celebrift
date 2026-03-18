// global.js - Master UI Controller for Celebrift

function injectGlobalUI() {
    // --- 1. INJECT SHARED STYLES ---
    const style = document.createElement('style');
    style.innerHTML = `
        .fab-container { position: fixed; bottom: 80px; right: 20px; z-index: 999; display: flex; flex-direction: column; gap: 12px; }
        .fab-button { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; shadow: 0 10px 15px -3px rgba(0,0,0,0.1); transition: transform 0.2s; color: white; }
        .fab-button:hover { transform: scale(1.1); }
        .fab-call { background-color: #5c4ac7; }
        .fab-whatsapp { background-color: #25D366; }
        footer a:hover { color: #ec4899; transition: color 0.2s; }
    `;
    document.head.appendChild(style);

    // --- 2. INJECT HEADER (NAVBAR) ---
    const headerHTML = `
    <nav class="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-pink-100">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <a href="index.html" class="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight">
                <span class="text-pink-500">Celebr</span>ift 👑
            </a>
            <div class="hidden md:flex gap-6 text-sm font-bold text-gray-600">
                <a href="index.html">Home</a>
                <a href="index.html#rows-container">Categories</a>
                <a href="admin-login.html">Admin</a>
            </div>
            <a href="index.html" class="md:hidden text-pink-500 font-bold text-sm">🏠 Home</a>
        </div>
    </nav>`;
    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    // --- 3. INJECT FOOTER ---
    const footerHTML = `
    <footer class="bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100 pt-16 pb-8 px-4 mt-auto border-t border-gray-200/60">
        <div class="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-gray-600 mb-12">
            <div><h4 class="font-bold text-gray-900 text-lg mb-4">Important Links</h4><a href="#" class="block mb-2">Terms & Conditions</a><a href="#" class="block mb-2">About Us</a></div>
            <div><h4 class="font-bold text-gray-900 text-lg mb-4">Top Categories</h4><a href="index.html" class="block mb-2">Birthday</a><a href="index.html" class="block mb-2">Anniversary</a></div>
            <div><h4 class="font-bold text-gray-900 text-lg mb-4">Top Cities</h4><a href="#" class="block mb-2">Mumbai</a><a href="#" class="block mb-2">Mira Bhayandar</a></div>
            <div><h4 class="font-bold text-gray-900 text-lg mb-4">Info</h4><a href="#" class="block mb-2">Contact Us</a><a href="#" class="block mb-2">Sitemap</a></div>
        </div>
        <div class="max-w-7xl mx-auto flex flex-col items-center border-t border-gray-300/50 pt-8">
            <p class="text-xs text-gray-500 font-bold">© 2026 Celebrift.com - All Rights Reserved</p>
        </div>
    </footer>`;
    document.body.insertAdjacentHTML('beforeend', footerHTML);

    // --- 4. INJECT FLOATING BUTTONS ---
    const fabHTML = `
    <div class="fab-container">
        <a href="tel:+919594328008" class="fab-button fab-call">📞</a>
        <a href="https://wa.me/919594328008" target="_blank" class="fab-button fab-whatsapp">💬</a>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', fabHTML);
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectGlobalUI);
} else {
    injectGlobalUI();
}