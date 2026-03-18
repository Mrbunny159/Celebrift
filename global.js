// global.js
function injectGlobalUI() {
    const isDetailsPage = window.location.pathname.includes('details.html');

    const style = document.createElement('style');
    style.innerHTML = `
        .fab-container { position: fixed; bottom: 30px; right: 20px; z-index: 999; display: flex; flex-direction: column; gap: 15px; }
        .cute-btn { width: 58px; height: 58px; border-radius: 20px; display: flex; align-items: center; justify-content: center; shadow: 0 8px 20px rgba(0,0,0,0.15); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); color: white; text-decoration: none; font-size: 24px; }
        .cute-btn:hover { transform: scale(1.15) rotate(5deg); }
        .fab-call { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .fab-whatsapp { background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); }
    `;
    document.head.appendChild(style);

    // Header & Footer Injections (Keep these from previous version)
    // ... (same header/footer HTML as before)

    // Floating Buttons (Only show WhatsApp here if NOT on details page)
    const fabHTML = `
    <div class="fab-container">
        <a href="tel:+919594328008" class="cute-btn fab-call">📞</a>
        ${!isDetailsPage ? '<a href="https://wa.me/919594328008" target="_blank" class="cute-btn fab-whatsapp">💬</a>' : ''}
    </div>`;
    document.body.insertAdjacentHTML('beforeend', fabHTML);
}
injectGlobalUI();