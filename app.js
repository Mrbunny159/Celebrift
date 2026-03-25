const urlParams = new URLSearchParams(window.location.search);
const filterCat = urlParams.get('category');

async function loadHome() {
    try {
        const res = await fetch('/api/decorations');
        const allItems = await res.json();
        
        let categories = [...new Set(allItems.map(i => i.category))];
        if(filterCat) categories = [filterCat]; 

        document.getElementById('rows-container').innerHTML = categories.map(cat => {
            const items = allItems.filter(i => i.category === cat);
            const title = cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            
            // 7. FIX: Uses 'flex overflow-x-auto flex-nowrap' so it ALWAYS scrolls horizontally on mobile
            return `
                <section>
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl md:text-3xl font-black text-indigo-900">${title}</h2>
                        ${!filterCat ? `<a href="index.html?category=${cat}" class="text-pink-500 font-bold text-sm border-b-2 border-pink-500 pb-0.5">View All &rarr;</a>` : ''}
                    </div>
                    <div class="flex overflow-x-auto flex-nowrap gap-6 pb-8 hide-scroll-bar px-2">
                        ${items.map(item => `
                            <a href="details.html?id=${item.slug}" class="flex-none w-64 md:w-80 group">
                                <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all group-hover:shadow-xl">
                                    <div class="h-48 overflow-hidden">
                                        <img src="${item.images[0]}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                                    </div>
                                    <div class="p-5">
                                        <h4 class="font-bold text-gray-800 line-clamp-1">${item.title}</h4>
                                        <div class="flex justify-between mt-2">
                                            <span class="text-pink-600 font-black">${item.price_range}</span>
                                            <span class="text-sm text-yellow-500 font-bold">★ ${item.average_rating || '5.0'}</span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        `).join('')}
                    </div>
                </section>`;
        }).join('');

        // 3. FETCH HOME REVIEWS
        const revRes = await fetch('/api/home-reviews');
        if (revRes.ok) {
            const revs = await revRes.json();
            document.getElementById('home-reviews').innerHTML = revs.map(r => `
                <div class="flex-none w-72 md:w-80 bg-white p-6 rounded-3xl shadow-sm border border-pink-100 snap-center">
                    <div class="flex text-yellow-400 mb-3 text-lg">${'★'.repeat(r.rating)}</div>
                    <p class="text-gray-600 italic mb-4 line-clamp-3">"${r.review_text}"</p>
                    <p class="font-bold text-gray-900">- ${r.reviewer_name}</p>
                </div>
            `).join('');
        }
    } catch (e) { document.getElementById('rows-container').innerHTML = "Error loading data."; }
}

loadHome();