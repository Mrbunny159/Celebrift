async function renderHeroSection() {
    try {
        const res = await fetch('/api/settings');
        const settings = await res.json();
        
        if (settings['hero_title']) document.getElementById('hero-main-title').textContent = settings['hero_title'];
        if (settings['hero_subtitle']) document.getElementById('hero-sub-title').textContent = settings['hero_subtitle'];
        
        const container = document.getElementById('hero-categories-container');
        
        if (settings['hero_items']) {
            const items = JSON.parse(settings['hero_items']);
            
            if (items.length === 0) {
                container.innerHTML = "<p class='text-gray-400 font-bold'>No categories added yet.</p>";
                return;
            }

            container.innerHTML = items.map(item => {
                // Determine Tailwind classes based on the chosen shape
                let shapeClasses = "w-28 h-28 md:w-36 md:h-36 rounded-full"; // Default Circle
                
                if (item.shape === 'square') shapeClasses = "w-28 h-28 md:w-36 md:h-36";
                if (item.shape === 'rounded-square') shapeClasses = "w-28 h-28 md:w-36 md:h-36 rounded-2xl";
                if (item.shape === 'rectangle') shapeClasses = "w-40 h-28 md:w-56 md:h-36";
                if (item.shape === 'rounded-rectangle') shapeClasses = "w-40 h-28 md:w-56 md:h-36 rounded-3xl";

                return `
                <div onclick="document.getElementById('cat-${item.target}')?.scrollIntoView({behavior:'smooth'})" class="flex flex-col items-center gap-3 cursor-pointer group flex-shrink-0">
                    <img src="${item.image}" class="${shapeClasses} border-4 border-white shadow-lg group-hover:border-pink-500 transition-all object-cover">
                    <span class="font-bold text-gray-700 whitespace-nowrap">${item.title}</span>
                </div>
                `;
            }).join('');
        }
    } catch (e) {
        console.error("Failed to load hero section", e);
    }
}

// Call the function to load it when the page opens
renderHeroSection();
async function renderNetflixHome() {
    const container = document.getElementById('rows-container');
    try {
        const response = await fetch('/api/decorations');
        const allItems = await response.json();
        
        // Group data
        const categories = [...new Set(allItems.map(item => item.category))];
        
        container.innerHTML = categories.map(cat => {
            const items = allItems.filter(i => i.category === cat);
            const title = cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            
            return `
                <section id="cat-${cat}" class="scroll-mt-32">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-extrabold text-indigo-900">${title} Balloon Decoration</h2>
                        <a href="index.html?category=${cat}" class="text-pink-500 font-bold text-sm border-b-2 border-pink-500 pb-0.5">View All &rarr;</a>
                    </div>
                    <div class="flex overflow-x-auto gap-5 pb-6 hide-scroll-bar">
                        ${items.map(item => `
                            <a href="details.html?id=${item.slug}" class="flex-none w-64 md:w-80 group">
                                <div class="bg-white rounded-2xl shadow-sm border overflow-hidden transition-all group-hover:shadow-lg">
                                    <div class="h-48 overflow-hidden">
                                        <img src="${item.image_url}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                                    </div>
                                    <div class="p-4">
                                        <h4 class="font-bold text-indigo-900 line-clamp-1">${item.title}</h4>
                                        <div class="flex justify-between items-center mt-2">
                                            <span class="text-pink-600 font-extrabold">${item.price_range}</span>
                                            <span class="text-xs text-yellow-500">★ ${item.average_rating || '5.0'}</span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        `).join('')}
                    </div>
                </section>`;
        }).join('');
    } catch (e) {
        container.innerHTML = "<p class='text-center text-red-500 font-bold'>Failed to load data.</p>";
    }
}
renderNetflixHome();