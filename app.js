const urlParams = new URLSearchParams(window.location.search);
const filterCat = urlParams.get('category');
const filterSubCat = urlParams.get('sub');

let globalSettings = null;
let globalCategoryMap = {};
let categoryOrder = [];

let allDecorations = [];
let currentSearch = "";
let currentSort = "default";

// Helper function to detect if a URL is a video
function isVideoFile(url) {
    if (!url) return false;
    return url.startsWith('data:video') || url.match(/\.(mp4|webm|ogg)$/i);
}

async function initPage() {
    try {
        const res = await fetch('/api/settings');
        globalSettings = await res.json();
        
        if (globalSettings['global_offer']) {
            const banner = document.getElementById('global-announcement');
            banner.textContent = globalSettings['global_offer'];
            banner.classList.remove('hidden');
        }

        if (globalSettings['promo_media']) {
            const promoSection = document.getElementById('promo-banner-section');
            const promoContainer = document.getElementById('promo-banner-container');
            const mediaUrl = globalSettings['promo_media'];
            
            if (isVideoFile(mediaUrl)) {
                promoContainer.innerHTML = `<video src="${mediaUrl}" autoplay loop muted playsinline class="w-full h-full object-cover"></video>`;
            } else {
                promoContainer.innerHTML = `<img src="${mediaUrl}" class="w-full h-full object-cover">`;
            }
            promoSection.classList.remove('hidden');
        }

        if (globalSettings['site_categories']) {
            const lines = globalSettings['site_categories'].split('\n');
            let navDropdownHTML = ''; 
            
            lines.forEach(line => {
                if(!line.trim()) return;
                const parts = line.split('|');
                const catName = parts[0].trim();
                const catSlug = catName.toLowerCase().replace(/ /g, '-');
                const subCats = parts[1] ? parts[1].split(',').map(s => s.trim()).filter(s => s !== '') : [];
                
                navDropdownHTML += `<a href="index.html?category=${catSlug}" class="px-5 py-3 hover:bg-pink-50 hover:text-pink-500 border-b border-gray-50 font-bold text-sm text-gray-700 transition-colors">${catName}</a>`;
                
                categoryOrder.push(catSlug);
                globalCategoryMap[catSlug] = subCats.map(sc => ({ name: sc, slug: sc.toLowerCase().replace(/ /g, '-') }));
            });
            
            const navDropdown = document.getElementById('nav-categories-dropdown');
            if (navDropdown && navDropdownHTML !== '') navDropdown.innerHTML = navDropdownHTML;
        }
        
        renderHeroSection();
        renderHomeReviews();
    } catch (e) {}
    
    await fetchDecorations();
    
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            currentSearch = e.target.value.toLowerCase();
            renderDecorationsGrid();
        });
    }
    
    const sortBar = document.getElementById('sort-bar');
    if(sortBar) {
        sortBar.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderDecorationsGrid();
        });
    }
}

function renderHeroSection() {
    if (!globalSettings || !globalSettings['hero_items']) return;
    const track = document.getElementById('hero-categories-track');
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

function renderHomeReviews() {
    if (!globalSettings || !globalSettings['home_reviews']) return;
    const revs = JSON.parse(globalSettings['home_reviews']);
    if (revs.length > 0) {
        document.getElementById('home-reviews-section').classList.remove('hidden');
        document.getElementById('home-reviews-container').innerHTML = revs.map(r => {
            let mediaHTML = '';
            if (r.media) {
                if (isVideoFile(r.media)) {
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
            </div>`;
        }).join('');
    }
}

async function fetchDecorations() {
    const container = document.getElementById('rows-container');
    container.innerHTML = `
        <section class="animate-pulse">
            <div class="h-8 bg-pink-100 rounded-lg w-48 mb-6"></div>
            <div class="flex overflow-x-hidden gap-6 pb-8">
                <div class="w-64 md:w-80 h-64 bg-pink-50 rounded-3xl flex-none"></div>
                <div class="w-64 md:w-80 h-64 bg-pink-50 rounded-3xl flex-none"></div>
            </div>
        </section>`;
    try {
        const res = await fetch('/api/decorations');
        allDecorations = await res.json();
        renderDecorationsGrid();
    } catch (e) { 
        container.innerHTML = "<p class='text-center text-red-500 font-bold'>Error loading data.</p>"; 
    }
}

function renderDecorationsGrid() {
    const container = document.getElementById('rows-container');
    if (allDecorations.length === 0) {
        container.innerHTML = "<p class='text-center text-gray-500 font-bold py-10'>No decorations added yet.</p>";
        return;
    }

    let activeItems = allDecorations.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(currentSearch) || item.category.replace(/-/g, ' ').includes(currentSearch) || (item.sub_category || '').replace(/-/g, ' ').includes(currentSearch);
        const matchesCat = filterCat ? item.category === filterCat : true;
        const matchesSubCat = filterSubCat ? item.sub_category === filterSubCat : true;
        return matchesSearch && matchesCat && matchesSubCat;
    });

    if (currentSort === 'price_asc') {
        activeItems.sort((a,b) => (parseInt(a.price_range.replace(/[^0-9]/g, '')) || 0) - (parseInt(b.price_range.replace(/[^0-9]/g, '')) || 0));
    } else if (currentSort === 'price_desc') {
        activeItems.sort((a,b) => (parseInt(b.price_range.replace(/[^0-9]/g, '')) || 0) - (parseInt(a.price_range.replace(/[^0-9]/g, '')) || 0));
    } else if (currentSort === 'rating') {
        activeItems.sort((a,b) => (b.average_rating || 0) - (a.average_rating || 0));
    }

    if (activeItems.length === 0) {
        container.innerHTML = "<p class='text-center text-gray-500 font-bold py-10 text-xl'>Oops! No decorations found for that search. 🕵️</p>";
        return;
    }

    const isGridMode = !!filterCat || currentSearch !== "" || currentSort !== "default";
    
    if (currentSearch !== "" || currentSort !== "default") {
        container.innerHTML = `
            <h2 class="text-2xl font-black text-indigo-900 mb-6">Search Results</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 pb-8">
                ${activeItems.map(item => generateCardHTML(item, true)).join('')}
            </div>
        `;
        return;
    }

    let categories = [...new Set(activeItems.map(i => i.category))];
    
    const fallbackOrder = ['birthday-decor', 'baby-shower-decor', 'anniversary-decor', 'naming-ceremony', 'store-decor', 'romantic-decor'];
    const activeOrder = categoryOrder.length > 0 ? categoryOrder : fallbackOrder;

    categories.sort((a, b) => {
        let indexA = activeOrder.indexOf(a); let indexB = activeOrder.indexOf(b);
        if (indexA === -1) indexA = 999; if (indexB === -1) indexB = 999;
        return indexA === indexB ? a.localeCompare(b) : indexA - indexB;
    });

    container.innerHTML = categories.map(cat => {
        const catItems = activeItems.filter(i => i.category === cat);
        const title = cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const wrapperClasses = isGridMode ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 pb-8" : "flex overflow-x-auto flex-nowrap gap-4 md:gap-6 pb-8 hide-scroll-bar px-2 snap-x";
            
        let subCategoryPillsHTML = '';
        if (isGridMode && globalCategoryMap[cat] && globalCategoryMap[cat].length > 0) {
            const subs = globalCategoryMap[cat];
            subCategoryPillsHTML = `
            <div class="flex overflow-x-auto gap-3 pb-6 hide-scroll-bar px-2 md:px-0">
                <a href="index.html?category=${cat}" class="${!filterSubCat ? 'bg-pink-600 text-white border-pink-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-pink-50'} border px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all">${!filterSubCat ? '✓ All' : 'All'}</a>
                ${subs.map(sub => `
                    <a href="index.html?category=${cat}&sub=${sub.slug}" class="${filterSubCat === sub.slug ? 'bg-pink-600 text-white border-pink-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-pink-50'} border px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all">${filterSubCat === sub.slug ? '✓ ' + sub.name : sub.name}</a>
                `).join('')}
            </div>`;
        }

        return `
            <section>
                <div class="flex justify-between items-center mb-4 px-2 md:px-0">
                    <h2 class="text-2xl md:text-3xl font-black text-indigo-900">${title}</h2>
                    ${!isGridMode ? `<a href="index.html?category=${cat}" class="text-pink-700 font-bold text-sm border-b-2 border-pink-700 pb-0.5 hover:text-indigo-900 transition-colors">View All &rarr;</a>` : ''}
                </div>
                ${isGridMode ? subCategoryPillsHTML : ''}
                <div class="${wrapperClasses}">
                    ${catItems.map(item => generateCardHTML(item, isGridMode)).join('')}
                </div>
            </section>`;
    }).join('');
}

function generateCardHTML(item, isGridMode) {
    let primaryImg = item.image_url;
    if (item.images) { try { primaryImg = JSON.parse(item.images)[0] || item.image_url; } catch(e) {} }

    const cardClasses = isGridMode ? "w-full group" : "flex-none w-60 md:w-80 group snap-center";
    const imgHeightClasses = isGridMode ? "h-40 md:h-48" : "h-48";
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
    </a>`;
}

document.addEventListener('DOMContentLoaded', initPage);