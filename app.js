const urlParams = new URLSearchParams(window.location.search);
const filterCat = urlParams.get('category');
const filterSubCat = urlParams.get('sub');
const initialSearch = urlParams.get('search') || "";

let globalSettings = null;
let globalCategoryMap = {};
let categoryOrder = [];

let allDecorations = [];
let currentSearch = initialSearch.toLowerCase();
let currentSort = "default";

function isVideoFile(url) {
    if (!url) return false;
    return url.startsWith('data:video') || url.match(/\.(mp4|webm|ogg)$/i);
}

function formatPrice(price) {
    if (!price) return '';
    const p = String(price).trim();
    if (p.includes('₹') || p.toLowerCase().includes('rs')) return p;
    return '₹' + p; 
}

function startAutoScroll(containerId, speed = 1) {
    const container = document.getElementById(containerId);
    if (!container) return;
    let isHovered = false; let isTouching = false;
    container.addEventListener('mouseenter', () => isHovered = true);
    container.addEventListener('mouseleave', () => isHovered = false);
    container.addEventListener('touchstart', () => isTouching = true, {passive: true});
    container.addEventListener('touchend', () => setTimeout(() => isTouching = false, 1500));
    setInterval(() => {
        if (!isHovered && !isTouching) {
            container.scrollLeft += speed;
            if (container.scrollLeft >= (container.scrollWidth - container.clientWidth - 1)) container.scrollLeft = 0;
        }
    }, 25);
}

function executeGlobalSearch() {
    const searchInput = document.getElementById('globalSearchInput');
    if (!searchInput) return;
    const query = searchInput.value.toLowerCase();
    
    if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/' && !window.location.pathname.includes('index')) {
        window.location.href = `index.html?search=${encodeURIComponent(query)}`;
        return;
    }
    
    currentSearch = query;
    renderDecorationsGrid();
}

async function initPage() {
    const searchInput = document.getElementById('globalSearchInput');
    if(searchInput && initialSearch) searchInput.value = initialSearch;

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value.toLowerCase();
            renderDecorationsGrid();
        });
    }

    try {
        const res = await fetch('/api/settings');
        globalSettings = await res.json();
        
        if (globalSettings['promo_media']) {
            const promoSection = document.getElementById('promo-banner-section');
            const promoContainer = document.getElementById('promo-banner-container');
            const mediaUrl = globalSettings['promo_media'];
            
            // --- NEW PRELOAD LOGIC ---
            const preloadLink = document.createElement("link");
            preloadLink.rel = "preload";
            preloadLink.as = isVideoFile(mediaUrl) ? "video" : "image";
            preloadLink.href = mediaUrl;
            document.head.appendChild(preloadLink);
            // -------------------------

            if (isVideoFile(mediaUrl)) {
                promoContainer.innerHTML = `<video src="${mediaUrl}" autoplay loop muted playsinline class="w-full h-full object-cover"></video>`;
            } else {
                promoContainer.innerHTML = `<img src="${mediaUrl}" class="w-full h-full object-cover">`;
            }
            promoSection.classList.remove('hidden');
        }

        if (globalSettings['promo_media']) {
            const promoSection = document.getElementById('promo-banner-section');
            const promoContainer = document.getElementById('promo-banner-container');
            const mediaUrl = globalSettings['promo_media'];
            if(promoSection && promoContainer) {
                if (isVideoFile(mediaUrl)) {
                    promoContainer.innerHTML = `<video src="${mediaUrl}" autoplay loop muted playsinline class="w-full h-full object-cover"></video>`;
                } else {
                    promoContainer.innerHTML = `<img src="${mediaUrl}" class="w-full h-full object-cover">`;
                }
                promoSection.classList.remove('hidden');
            }
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

        setTimeout(() => {
            startAutoScroll('hero-categories-track', 1);
            startAutoScroll('home-reviews-container', 1);
        }, 500);

    } catch (e) {}
    
    await fetchDecorations();
    
    const sortBar = document.getElementById('sort-bar');
    const mobileSortBar = document.getElementById('mobile-sort-bar');
    
    const handleSortChange = (e) => {
        currentSort = e.target.value;
        if(sortBar) sortBar.value = currentSort;
        if(mobileSortBar) mobileSortBar.value = currentSort;
        renderDecorationsGrid();
    };

    if(sortBar) sortBar.addEventListener('change', handleSortChange);
    if(mobileSortBar) mobileSortBar.addEventListener('change', handleSortChange);
}

function renderHeroSection() {
    if (!globalSettings || !globalSettings['hero_items']) return;
    const track = document.getElementById('hero-categories-track');
    if (!track) return;
    const items = JSON.parse(globalSettings['hero_items']);
    if (items.length === 0) return;
    
    const buildItemHTML = (item) => {
        let shapeClasses = "w-24 h-24 md:w-28 md:h-28 rounded-full"; 
        if (item.shape === 'square') shapeClasses = "w-24 h-24 md:w-28 md:h-28 rounded-none";
        if (item.shape === 'rounded-square') shapeClasses = "w-24 h-24 md:w-28 md:h-28 rounded-2xl";
        if (item.shape === 'rectangle') shapeClasses = "w-32 h-24 md:w-36 md:h-28 rounded-none";
        if (item.shape === 'rounded-rectangle') shapeClasses = "w-32 h-24 md:w-36 md:h-28 rounded-3xl";
        return `
        <a href="index.html?category=${item.target}" aria-label="View ${item.title} category" class="flex flex-col items-center gap-3 cursor-pointer group flex-none mx-4 md:mx-6">
            <img src="${item.image}" alt="${item.title} Decoration Category" class="${shapeClasses} object-cover border-[3px] border-white shadow-md group-hover:shadow-lg group-hover:border-pink-300 transition-all bg-white">
            <span class="text-sm md:text-base font-bold text-indigo-900 text-center w-24 md:w-28 line-clamp-2 leading-tight">${item.title}</span>
        </a>`;
    };
    
    const repeatedItems = Array(10).fill(items).flat();
    track.innerHTML = repeatedItems.map(buildItemHTML).join('');
}

function renderHomeReviews() {
    if (!globalSettings || !globalSettings['home_reviews']) return;
    const revs = JSON.parse(globalSettings['home_reviews']);
    if (revs.length > 0) {
        const section = document.getElementById('home-reviews-section');
        if (section) section.classList.remove('hidden');
        
        const buildReviewHTML = (r) => {
            let mediaHTML = '';
            if (r.media) {
                if (isVideoFile(r.media)) {
                    mediaHTML = `<video src="${r.media}" autoplay loop muted playsinline class="w-full h-48 object-cover rounded-2xl mb-4 shadow-sm border border-gray-100"></video>`;
                } else {
                    mediaHTML = `<img src="${r.media}" alt="Review from ${r.name}" loading="lazy" class="w-full h-48 object-cover rounded-2xl mb-4 shadow-sm border border-gray-100">`;
                }
            }
            return `
            <div class="flex-none w-80 md:w-96 bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-sm border border-pink-100 relative flex flex-col hover:shadow-lg transition-shadow">
                <span class="absolute top-4 right-6 text-4xl text-pink-100">"</span>
                <div class="flex text-yellow-400 mb-4 text-xl">${'★'.repeat(r.rating)}</div>
                ${mediaHTML}
                <p class="text-gray-600 italic mb-6 relative z-10 flex-grow text-lg">"${r.text}"</p>
                <p class="font-black text-indigo-900 border-t border-gray-50 pt-4">- ${r.name}</p>
            </div>`;
        };

        const container = document.getElementById('home-reviews-container');
        if (container) {
            const repeatedRevs = Array(5).fill(revs).flat();
            container.innerHTML = repeatedRevs.map(buildReviewHTML).join('');
        }
    }
}

async function fetchDecorations() {
    const container = document.getElementById('rows-container');
    if (!container) return;
    try {
        const res = await fetch('/api/decorations');
        allDecorations = await res.json();
        
        allDecorations.forEach(item => {
            try { item.categoryArray = JSON.parse(item.category); } 
            catch(e) { item.categoryArray = [item.category]; }
            
            try { item.subCategoryArray = JSON.parse(item.sub_category); } 
            catch(e) { item.subCategoryArray = item.sub_category ? [item.sub_category] : []; }
        });
        
        renderDecorationsGrid();
    } catch (e) { 
        container.innerHTML = "<p class='text-center text-red-500 font-bold'>Error loading data.</p>"; 
    }
}

function renderDecorationsGrid() {
    const container = document.getElementById('rows-container');
    if (!container) return;
    if (allDecorations.length === 0) {
        container.innerHTML = "<p class='text-center text-gray-500 font-bold py-10'>No decorations added yet.</p>";
        return;
    }

    let activeItems = allDecorations.filter(item => {
        const joinedCategories = item.categoryArray.join(' ').replace(/-/g, ' ');
        const joinedSubCategories = item.subCategoryArray.join(' ').replace(/-/g, ' ');
        
        const matchesSearch = item.title.toLowerCase().includes(currentSearch) || 
                              joinedCategories.includes(currentSearch) || 
                              joinedSubCategories.includes(currentSearch);
                              
        const matchesCat = filterCat ? item.categoryArray.includes(filterCat) : true;
        const matchesSubCat = filterSubCat ? item.subCategoryArray.includes(filterSubCat) : true;
        
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
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 pb-8">
                ${activeItems.map(item => generateCardHTML(item, true)).join('')}
            </div>
        `;
        return;
    }

    let categories = [...new Set(activeItems.flatMap(i => i.categoryArray))];
    
    const fallbackOrder = ['birthday-decor', 'baby-shower-decor', 'anniversary-decor', 'naming-ceremony', 'store-decor', 'romantic-decor'];
    const activeOrder = categoryOrder.length > 0 ? categoryOrder : fallbackOrder;

    categories.sort((a, b) => {
        let indexA = activeOrder.indexOf(a); let indexB = activeOrder.indexOf(b);
        if (indexA === -1) indexA = 999; if (indexB === -1) indexB = 999;
        return indexA === indexB ? a.localeCompare(b) : indexA - indexB;
    });

    container.innerHTML = categories.map(cat => {
        const catItems = activeItems.filter(i => i.categoryArray.includes(cat));
        if (catItems.length === 0) return '';
        
        const title = cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const wrapperClasses = isGridMode ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 pb-8" : "flex overflow-x-auto flex-nowrap gap-4 md:gap-6 pb-8 hide-scroll-bar px-2 snap-x";
            
        let subCategoryPillsHTML = '';
        if (isGridMode && globalCategoryMap[cat] && globalCategoryMap[cat].length > 0) {
            const subs = globalCategoryMap[cat];
            subCategoryPillsHTML = `
            <div class="flex overflow-x-auto gap-3 pb-6 hide-scroll-bar px-2 md:px-0">
                <a href="index.html?category=${cat}" class="${!filterSubCat ? 'bg-pink-600 text-white border-pink-600 shadow-md' : 'bg-white/80 backdrop-blur-sm text-gray-600 border-gray-200 hover:bg-pink-50'} border px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all">${!filterSubCat ? '✓ All' : 'All'}</a>
                ${subs.map(sub => `
                    <a href="index.html?category=${cat}&sub=${sub.slug}" class="${filterSubCat === sub.slug ? 'bg-pink-600 text-white border-pink-600 shadow-md' : 'bg-white/80 backdrop-blur-sm text-gray-600 border-gray-200 hover:bg-pink-50'} border px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all">${filterSubCat === sub.slug ? '✓ ' + sub.name : sub.name}</a>
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
                    ${catItems.map((item, index) => generateCardHTML(item, isGridMode, index)).join('')}
                </div>
            </section>`;
    }).join('');
}

// Add index as the third parameter with a default of 999
function generateCardHTML(item, isGridMode, index = 999) {
    let primaryImg = item.image_url;
    if (item.images) { try { primaryImg = JSON.parse(item.images)[0] || item.image_url; } catch(e) {} }

    const cardClasses = isGridMode ? "w-full group" : "flex-none w-64 md:w-72 group snap-center";
    const imgHeightClasses = "h-40 md:h-48";
    const offerBadge = item.offer_text ? `<div class="absolute top-3 left-3 bg-red-600 text-white font-black text-[10px] md:text-xs px-3 py-1 rounded-full shadow-lg z-10 uppercase tracking-widest animate-pulse border border-red-400">${item.offer_text}</div>` : '';

    // --- NEW SMART LOADING LOGIC ---
    // If it's one of the first 4 items, load it immediately. Otherwise, lazy load it.
    const imageLoading = index < 4 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';

    return `
    <a href="details.html?id=${item.slug}" aria-label="View details for ${item.title}" class="${cardClasses}">
        <div class="bg-white/90 backdrop-blur-sm rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1 h-full flex flex-col relative">
            ${offerBadge}
            <div class="${imgHeightClasses} overflow-hidden w-full bg-gray-50 relative">
                
                <img src="${primaryImg}" ${imageLoading} alt="${item.title} Setup" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div class="p-4 md:p-5 flex-grow flex flex-col justify-between">
                <h3 class="font-bold text-gray-800 text-sm md:text-base line-clamp-2 leading-snug">${item.title}</h3>
                <div class="flex justify-between items-center mt-4 border-t border-gray-50 pt-3">
                    <span class="text-pink-600 font-black text-sm md:text-lg">${formatPrice(item.price_range)}</span>
                    <span class="text-xs text-yellow-500 font-black bg-yellow-50 px-2 py-1 rounded-md">★ ${item.average_rating || '5.0'}</span>
                </div>
            </div>
        </div>
    </a>`;
}

document.addEventListener('DOMContentLoaded', initPage);