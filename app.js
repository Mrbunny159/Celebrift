const urlParams = new URLSearchParams(window.location.search);
const filterCat = urlParams.get('category');

let globalSettings = null;

async function initPage() {
    try {
        const res = await fetch('/api/settings');
        globalSettings = await res.json();
        
        // --- PROMOTIONS ACTIVATION ---
        if (globalSettings['global_offer']) {
            const banner = document.getElementById('global-announcement');
            banner.textContent = globalSettings['global_offer'];
            banner.classList.remove('hidden');
        }

        if (globalSettings['promo_media']) {
            const promoSection = document.getElementById('promo-banner-section');
            const promoContainer = document.getElementById('promo-banner-container');
            const mediaUrl = globalSettings['promo_media'];
            
            if (mediaUrl.startsWith('data:video')) {
                promoContainer.innerHTML = `<video src="${mediaUrl}" autoplay loop muted playsinline class="w-full h-full object-cover"></video>`;
            } else {
                promoContainer.innerHTML = `<img src="${mediaUrl}" class="w-full h-full object-cover">`;
            }
            promoSection.classList.remove('hidden');
        }
        
        renderHeroSection();
        renderHomeReviews();
    } catch (e) {
        console.error("Settings fetch error:", e);
    }
    loadHome();
}

function renderHeroSection() {
    if (!globalSettings) return;
    
    if (globalSettings['hero_title']) document.getElementById('hero-main-title').textContent = globalSettings['hero_title'];
    if (globalSettings['hero_subtitle']) document.getElementById('hero-sub-title').textContent = globalSettings['hero_subtitle'];
    
    const track = document.getElementById('hero-categories-track');
    if (globalSettings['hero_items']) {
        const items = JSON.parse(globalSettings['hero_items']);
        if (items.length === 0) return;

        const buildItemHTML = (item) => {
            let shapeClasses = "w-24 h-24 md:w-32 md:h-32 rounded-full"; 
            if (item.shape === 'square') shapeClasses = "w-24 h-24 md:w-32 md:h-32 rounded-none";
            if (item.shape === 'rounded-square') shapeClasses = "w-24 h-24 md:w-32 md:h-32 rounded-2xl";
            if (item.shape === 'rectangle') shapeClasses = "w-32 h-24 md:w-40 md:h-32 rounded-none";
            if (item.shape === 'rounded-rectangle') shapeClasses = "w-32 h-24 md:w-40 md:h-32 rounded-3xl";

            return `
            <a href="index.html?category=${item.target}" aria-label="View ${item.title} category" class="flex flex-col items-center gap-3 cursor-pointer group flex-none mx-4 md:mx-6">
                <img src="${item.image}" alt="${item.title} Decoration Category" class="${shapeClasses} object-cover border-4 border-white shadow-lg group-hover:border-pink-400 transition-all bg-white">
                <span class="text-sm font-bold text-indigo-900 text-center w-24 md:w-32 line-clamp-2 leading-tight">${item.title}</span>
            </a>`;
        };

        const repeatedItems = [...items, ...items, ...items, ...items, ...items, ...items];
        track.innerHTML = repeatedItems.map(buildItemHTML).join('');
    }
}

function renderHomeReviews() {
    if (!globalSettings || !globalSettings['home_reviews']) return;
    
    const revs = JSON.parse(globalSettings['home_reviews']);
    if (revs.length > 0) {
        document.getElementById('home-reviews-section').classList.remove('hidden');
        document.getElementById('home-reviews-container').innerHTML = revs.map(r => {
            
            let mediaHTML = '';
            if (r.media) {
                if (r.media.startsWith('data:video')) {
                    mediaHTML = `<video src="${r.media}" autoplay loop muted playsinline class="w-full h-48 object-cover rounded-2xl mb-4 shadow-sm border border-gray-100"></video>`;
                } else {
                    mediaHTML = `<img src="${r.media}" alt="Review from ${r.name}" class="w-full h-48 object-cover rounded-2xl mb-4 shadow-sm border border-gray-100">`;
                }
            }

            return `
            <div class="flex-none w-80 md:w-96 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-pink-100 snap-center relative flex flex-col">
                <span class="absolute top-4 right-6 text-4xl text-pink-100">"</span>
                <div class="flex text-yellow-400 mb-4 text-xl">${'★'.repeat(r.rating)}</div>
                
                ${mediaHTML}
                
                <p class="text-gray-600 italic mb-6 relative z-10 flex-grow text-lg">"${r.text}"</p>
                <p class="font-black text-indigo-900 border-t pt-4">- ${r.name}</p>
            </div>
            `;
        }).join('');
    }
}

async function loadHome() {
    const container = document.getElementById('rows-container');
    
    container.innerHTML = `
        <section class="animate-pulse">
            <div class="h-8 bg-pink-100 rounded-lg w-48 mb-6"></div>
            <div class="flex overflow-x-hidden gap-6 pb-8">
                <div class="w-64 md:w-80 h-64 bg-pink-50 rounded-3xl flex-none"></div>
                <div class="w-64 md:w-80 h-64 bg-pink-50 rounded-3xl flex-none"></div>
                <div class="w-64 md:w-80 h-64 bg-pink-50 rounded-3xl flex-none hidden md:block"></div>
                <div class="w-64 md:w-80 h-64 bg-pink-50 rounded-3xl flex-none hidden lg:block"></div>
            </div>
        </section>
    `;

    try {
        const res = await fetch('/api/decorations');
        const allItems = await res.json();
        
        if (allItems.length === 0) {
            container.innerHTML = "<p class='text-center text-gray-500 font-bold py-10'>No decorations added yet.</p>";
            return;
        }

        let categories = [...new Set(allItems.map(i => i.category))];
        const preferredOrder = ['birthday-decor','baby-shower-decor','anniversary-decor','naming-ceremony','store-decor','romantic-decor'];
        categories.sort((a, b) => {
            let indexA = preferredOrder.indexOf(a); let indexB = preferredOrder.indexOf(b);
            if (indexA === -1) indexA = 999; if (indexB === -1) indexB = 999;
            return indexA === indexB ? a.localeCompare(b) : indexA - indexB;
        });

        const isGridMode = !!filterCat; 
        if(isGridMode) categories = [filterCat]; 

        container.innerHTML = categories.map(cat => {
            const items = allItems.filter(i => i.category === cat);
            const title = cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            const wrapperClasses = isGridMode ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 pb-8" : "flex overflow-x-auto flex-nowrap gap-4 md:gap-6 pb-8 hide-scroll-bar px-2 snap-x";
                
            return `
                <section>
                    <div class="flex justify-between items-center mb-6 px-2 md:px-0">
                        <h2 class="text-2xl md:text-3xl font-black text-indigo-900">${title}</h2>
                        ${!isGridMode ? `<a href="index.html?category=${cat}" class="text-pink-700 font-bold text-sm border-b-2 border-pink-700 pb-0.5 hover:text-indigo-900 transition-colors">View All &rarr;</a>` : ''}
                    </div>
                    <div class="${wrapperClasses}">
                        ${items.map(item => {
                            let primaryImg = item.image_url;
                            if (item.images) { try { primaryImg = JSON.parse(item.images)[0] || item.image_url; } catch(e) {} }

                            const cardClasses = isGridMode ? "w-full group" : "flex-none w-60 md:w-80 group snap-center";
                            const imgHeightClasses = isGridMode ? "h-40 md:h-48" : "h-48";
                            
                            // NEW: INDIVIDUAL OFFER BADGE
                            const offerBadge = item.offer_text ? `<div class="absolute top-3 left-3 bg-red-600 text-white font-black text-xs md:text-sm px-3 py-1 rounded-full shadow-lg z-10 uppercase tracking-widest animate-pulse border border-red-400">${item.offer_text}</div>` : '';

                            return `
                            <a href="details.html?id=${item.slug}" aria-label="View details for ${item.title}" class="${cardClasses}">
                                <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all group-hover:shadow-xl h-full flex flex-col relative">
                                    ${offerBadge}
                                    <div class="${imgHeightClasses} overflow-hidden w-full bg-gray-50">
                                        <img src="${primaryImg}" alt="${item.title} Setup" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                                    </div>
                                    <div class="p-3 md:p-5 flex-grow flex flex-col justify-between">
                                        <h3 class="font-bold text-gray-800 text-sm md:text-base line-clamp-2 leading-tight">${item.title}</h3>
                                        <div class="flex justify-between items-center mt-3">
                                            <span class="text-pink-600 font-black text-sm md:text-base">${item.price_range}</span>
                                            <span class="text-xs text-yellow-500 font-bold">★ ${item.average_rating || '5.0'}</span>
                                        </div>
                                    </div>
                                </div>
                            </a>`
                        }).join('')}
                    </div>
                </section>`;
        }).join('');

    } catch (e) { container.innerHTML = "<p class='text-center text-red-500 font-bold'>Error loading data.</p>"; }
}

document.addEventListener('DOMContentLoaded', initPage);