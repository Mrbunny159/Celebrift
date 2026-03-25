const urlParams = new URLSearchParams(window.location.search);
const filterCat = urlParams.get('category');

async function renderHeroSection() {
    try {
        const res = await fetch('/api/settings');
        const settings = await res.json();
        
        if (settings['hero_title']) document.getElementById('hero-main-title').textContent = settings['hero_title'];
        if (settings['hero_subtitle']) document.getElementById('hero-sub-title').textContent = settings['hero_subtitle'];
        
        const track = document.getElementById('hero-categories-track');
        if (settings['hero_items']) {
            const items = JSON.parse(settings['hero_items']);
            if (items.length === 0) return;

            const buildItemHTML = (item) => {
                let shapeClasses = "w-24 h-24 md:w-32 md:h-32 rounded-full"; 
                if (item.shape === 'square') shapeClasses = "w-24 h-24 md:w-32 md:h-32 rounded-none";
                if (item.shape === 'rounded-square') shapeClasses = "w-24 h-24 md:w-32 md:h-32 rounded-2xl";
                if (item.shape === 'rectangle') shapeClasses = "w-32 h-24 md:w-40 md:h-32 rounded-none";
                if (item.shape === 'rounded-rectangle') shapeClasses = "w-32 h-24 md:w-40 md:h-32 rounded-3xl";

                return `
                <div onclick="window.location.href='index.html?category=${item.target}'" class="flex flex-col items-center gap-3 cursor-pointer group flex-none mx-4 md:mx-6">
                    <img src="${item.image}" class="${shapeClasses} object-cover border-4 border-white shadow-lg group-hover:border-pink-400 transition-all bg-white">
                    <span class="text-sm font-bold text-indigo-900 text-center w-24 md:w-32 line-clamp-2 leading-tight">${item.title}</span>
                </div>`;
            };

            const repeatedItems = [...items, ...items, ...items, ...items, ...items, ...items];
            track.innerHTML = repeatedItems.map(buildItemHTML).join('');
        }
    } catch (e) { console.error("Hero error", e); }
}

async function loadHome() {
    try {
        const res = await fetch('/api/decorations');
        const allItems = await res.json();
        
        if (allItems.length === 0) {
            document.getElementById('rows-container').innerHTML = "<p class='text-center text-gray-500 font-bold py-10'>No decorations added yet. Add some in the admin panel!</p>";
            return;
        }

        let categories = [...new Set(allItems.map(i => i.category))];
        if(filterCat) categories = [filterCat]; 

        document.getElementById('rows-container').innerHTML = categories.map(cat => {
            const items = allItems.filter(i => i.category === cat);
            const title = cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            
            return `
                <section>
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl md:text-3xl font-black text-indigo-900">${title}</h2>
                        ${!filterCat ? `<a href="index.html?category=${cat}" class="text-pink-500 font-bold text-sm border-b-2 border-pink-500 pb-0.5">View All &rarr;</a>` : ''}
                    </div>
                    <div class="flex overflow-x-auto flex-nowrap gap-6 pb-8 hide-scroll-bar px-2 snap-x">
                        ${items.map(item => {
                            let primaryImg = item.image_url;
                            if (item.images) { try { primaryImg = JSON.parse(item.images)[0] || item.image_url; } catch(e) {} }

                            return `
                            <a href="details.html?id=${item.slug}" class="flex-none w-64 md:w-80 group snap-center">
                                <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all group-hover:shadow-xl">
                                    <div class="h-48 overflow-hidden">
                                        <img src="${primaryImg}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                                    </div>
                                    <div class="p-5">
                                        <h4 class="font-bold text-gray-800 line-clamp-1">${item.title}</h4>
                                        <div class="flex justify-between mt-2">
                                            <span class="text-pink-600 font-black">₹${item.price_range}</span>
                                            <span class="text-sm text-yellow-500 font-bold">★ ${item.average_rating || '5.0'}</span>
                                        </div>
                                    </div>
                                </div>
                            </a>`
                        }).join('')}
                    </div>
                </section>`;
        }).join('');

        // HOME REVIEWS RENDERING WITH MEDIA SUPPORT
        const revRes = await fetch('/api/settings');
        const settings = await revRes.json();
        if (settings['home_reviews']) {
            const revs = JSON.parse(settings['home_reviews']);
            if (revs.length > 0) {
                document.getElementById('home-reviews-section').classList.remove('hidden');
                document.getElementById('home-reviews-container').innerHTML = revs.map(r => {
                    
                    let mediaHTML = '';
                    if (r.media) {
                        if (r.media.startsWith('data:video')) {
                            mediaHTML = `<video src="${r.media}" autoplay loop muted playsinline class="w-full h-48 object-cover rounded-2xl mb-4 shadow-sm border border-gray-100"></video>`;
                        } else {
                            mediaHTML = `<img src="${r.media}" class="w-full h-48 object-cover rounded-2xl mb-4 shadow-sm border border-gray-100">`;
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
    } catch (e) { document.getElementById('rows-container').innerHTML = "Error loading data."; }
}

document.addEventListener('DOMContentLoaded', () => {
    renderHeroSection(); 
    loadHome(); 
});