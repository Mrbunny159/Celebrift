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