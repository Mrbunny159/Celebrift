// global.js - Shared UI components for Celebrift

function injectSharedUI() {
    // 1. CSS for the Floating Buttons (Injected once)
    const style = document.createElement('style');
    style.innerHTML = `
        .fab-container {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 999;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .fab-button {
            width: 56px;
            height: 56px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: transform 0.2s, background-color 0.2s;
            color: white;
            text-decoration: none;
        }
        .fab-button:hover {
            transform: scale(1.1);
        }
        .fab-call { background-color: #5c4ac7; }
        .fab-whatsapp { background-color: #25D366; }
    `;
    document.head.appendChild(style);

    // 2. HTML Structure for the Floating Buttons
    const fabHTML = `
        <div class="fab-container">
            <a href="tel:+919594328008" class="fab-button fab-call" title="Call Us">
                <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
            </a>
            <a href="https://wa.me/919594328008" target="_blank" class="fab-button fab-whatsapp" title="WhatsApp Chat">
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.126.554 4.153 1.579 5.952L.471 23.53l5.698-1.492c1.745.932 3.69 1.424 5.862 1.424 6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm0 21.439c-1.803 0-3.565-.483-5.11-1.397l-.367-.217-3.794.994.994-3.794-.217-.367C2.624 15.112 2.14 13.35 2.14 12.031c0-5.452 4.439-9.891 9.891-9.891 5.452 0 9.891 4.439 9.891 9.891 0 5.452-4.439 9.891-9.891 9.891zm5.422-7.41c-.297-.149-1.758-.868-2.031-.967-.272-.099-.471-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.882-.787-1.477-1.76-1.65-2.057-.173-.297-.018-.458.13-.606.134-.134.297-.347.446-.52.149-.173.198-.297.297-.495.099-.198.05-.371-.025-.52-.074-.149-.669-1.61-.916-2.205-.24-.583-.485-.504-.669-.513l-.57-.009c-.198 0-.52.074-.793.371-.272.297-1.04 1.016-1.04 2.478 0 1.462 1.065 2.875 1.214 3.074.149.198 2.095 3.2 5.077 4.487.71.307 1.264.49 1.694.627.714.227 1.365.195 1.881.118.574-.086 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.569-.347z"/>
                </svg>
            </a>
        </div>
    `;

    // 3. Inject into the body
    document.body.insertAdjacentHTML('beforeend', fabHTML);
}

// Run the function as soon as the DOM is ready
document.addEventListener('DOMContentLoaded', injectSharedUI);