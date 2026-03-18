// global.js - Seamless Master UI Controller for Celebrift

function injectGlobalUI() {
    // 1. INJECT CUTE STYLES
    const style = document.createElement('style');
    style.innerHTML = `
        .fab-container { position: fixed; bottom: 30px; right: 20px; z-index: 999; display: flex; flex-direction: column; gap: 15px; }
        .cute-btn { width: 58px; height: 58px; border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.15); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); color: white; text-decoration: none; font-size: 24px; }
        .cute-btn:hover { transform: scale(1.15) rotate(5deg); }
        .fab-call { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .fab-whatsapp { background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); }
        .nav-link { position: relative; font-weight: 700; color: #4b5563; transition: color 0.2s; }
        .nav-link:hover { color: #db2777; }
    `;
    document.head.appendChild(style);

    // 2. INJECT HEADER (NAVBAR)
    const headerHTML = `
    <nav class="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-pink-100">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <a href="index.html" class="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight">
                <span class="text-pink-500">Celebr</span>ift 👑
            </a>
            <div class="hidden md:flex gap-8 text-sm">
                <a href="index.html" class="nav-link">Home</a>
                <a href="index.html#rows-container" class="nav-link">Categories</a>
                <a href="admin-login.html" class="nav-link">Admin Portal</a>
            </div>
            <a href="index.html" class="md:hidden text-pink-500 font-bold text-sm bg-pink-50 px-3 py-1 rounded-full">🏠 Home</a>
        </div>
    </nav>`;
    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    // 3. INJECT FOOTER (Matching your screenshot)
    const footerHTML = `
    <footer class="bg-gradient-to-b from-white to-blue-50 pt-20 pb-10 px-6 mt-auto border-t border-blue-100">
        <div class="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-sm text-gray-600 mb-16">
            <div>
                <h4 class="font-bold text-gray-900 text-lg mb-6">Important Links</h4>
                <ul class="space-y-3">
                    <li><a href="#" class="hover:text-pink-500">Terms & Conditions</a></li>
                    <li><a href="#" class="hover:text-pink-500">Return & Refund</a></li>
                    <li><a href="#" class="hover:text-pink-500">About Us</a></li>
                </ul>
            </div>
            <div>
                <h4 class="font-bold text-gray-900 text-lg mb-6">Top Categories</h4>
                <ul class="space-y-3">
                    <li><a href="index.html" class="hover:text-pink-500">Birthday</a></li>
                    <li><a href="index.html" class="hover:text-pink-500">Anniversary</a></li>
                    <li><a href="index.html" class="hover:text-pink-500">Baby Shower</a></li>
                </ul>
            </div>
            <div>
                <h4 class="font-bold text-gray-900 text-lg mb-6">Top Cities</h4>
                <ul class="space-y-3">
                    <li><a href="#" class="hover:text-pink-500">Mira Bhayandar</a></li>
                    <li><a href="#" class="hover:text-pink-500">Mumbai</a></li>
                    <li><a href="#" class="hover:text-pink-500">Pune</a></li>
                </ul>
            </div>
            <div>
                <h4 class="font-bold text-gray-900 text-lg mb-6">Info</h4>
                <ul class="space-y-3">
                    <li><a href="#" class="hover:text-pink-500">Contact Us</a></li>
                    <li><a href="#" class="hover:text-pink-500">Privacy Policy</a></li>
                    <li><a href="#" class="hover:text-pink-500">Sitemap</a></li>
                </ul>
            </div>
        </div>
        <div class="text-center border-t border-blue-100 pt-8">
            <p class="text-xs text-gray-400 font-bold tracking-widest uppercase">© 2026 Celebrift.com - All Rights Reserved</p>
        </div>
    </footer>`;
    document.body.insertAdjacentHTML('beforeend', footerHTML);

    // 4. INJECT CUTE FLOATING BUTTONS
    const fabHTML = `
    <div class="fab-container">
        <a href="tel:+919594328008" class="cute-btn fab-call" title="Call Us">📞</a>
        <a href="https://wa.me/919594328008" target="_blank" class="cute-btn fab-whatsapp" title="WhatsApp Chat">💬</a>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', fabHTML);
}

// Initial Run
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectGlobalUI);
} else {
    injectGlobalUI();
}