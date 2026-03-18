async function renderNetflixHome() {
    const container = document.getElementById('rows-container');
    try {
        const response = await fetch('/api/decorations');
        const allItems = await response.json();
        const categories = [...new Set(allItems.map(item => item.category))];
        
        container.innerHTML = categories.map(cat => {
            const items = allItems.filter(i => i.category === cat);
            const title = cat.charAt(0).toUpperCase() + cat.slice(1);
            return `
                <section>
                    <div class="flex justify-between items-end mb-4">
                        <h2 class="text-2xl font-extrabold text-gray-800">${title} Decoration</h2>
                        <a href="#" class="text-pink-500 font-bold text-sm">View All &rarr;</a>
                    </div>
                    <div class="flex overflow-x-auto gap-4 pb-4 hide-scroll-bar">
                        ${items.map(item => `
                            <a href="details.html?id=${item.slug}" class="flex-none w-64 md:w-72 bg-white rounded-2xl shadow-sm border overflow-hidden">
                                <img src="${item.image_url}" class="w-full h-40 object-cover">
                                <div class="p-4"><h4 class="font-bold text-gray-800">${item.title}</h4><p class="text-pink-600 font-bold">${item.price_range}</p></div>
                            </a>
                        `).join('')}
                    </div>
                </section>`;
        }).join('');
    } catch (e) { container.innerHTML = "Error loading products."; }
}
renderNetflixHome();