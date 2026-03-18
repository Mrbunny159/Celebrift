const container = document.getElementById('decor-container');

async function fetchDecorations(category = 'all') {
    container.innerHTML = '<div class="col-span-full text-center py-10 text-xl animate-pulse text-pink-500 font-bold">Loading products...</div>';

    try {
        let apiUrl = category !== 'all' ? `/api/decorations?category=${category}` : '/api/decorations';
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center py-10 text-gray-500">No products found.</div>';
            return;
        }

        let htmlContent = '';
        data.forEach(item => {
            // Generate Stars based on DB rating
            let starsHtml = '';
            const rating = Math.round(item.average_rating || 5);
            for(let i = 1; i <= 5; i++) {
                starsHtml += `<svg class="w-3 h-3 md:w-4 md:h-4 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'} fill-current" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>`;
            }

            htmlContent += `
                <a href="details.html?id=${item.slug}" class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 flex flex-col h-full group">
                    <div class="relative w-full pb-[100%] overflow-hidden bg-gray-50">
                        <img src="${item.image_url}" alt="${item.title}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    </div>
                    <div class="p-3 md:p-4 flex flex-col flex-grow">
                        <h3 class="text-sm md:text-base font-semibold text-gray-800 line-clamp-2 mb-1">${item.title}</h3>
                        <div class="flex items-center gap-1 mb-2">
                            ${starsHtml}
                            <span class="text-xs text-gray-500 ml-1">(${item.average_rating})</span>
                        </div>
                        <div class="mt-auto flex justify-between items-end">
                            <span class="text-base md:text-lg font-bold text-gray-900">${item.price_range}</span>
                        </div>
                    </div>
                </a>
            `;
        });

        container.innerHTML = htmlContent;
        updateActiveButton(category);
    } catch (error) {
        container.innerHTML = '<div class="col-span-full text-center py-10 text-red-500 font-bold">Error loading products.</div>';
    }
}

function updateActiveButton(activeCategory) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick').includes(activeCategory)) {
            btn.className = "filter-btn shrink-0 bg-pink-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-sm transition-all";
        } else {
            btn.className = "filter-btn shrink-0 bg-white text-gray-700 border border-pink-200 px-5 py-2 rounded-full text-sm font-semibold transition-all";
        }
    });
}

window.onload = () => fetchDecorations('all');