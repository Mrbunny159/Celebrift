const urlParams = new URLSearchParams(window.location.search);
const decorId = urlParams.get('id');

async function fetchProductDetails() {
    try {
        const response = await fetch(`/api/decorations/${decorId}`);
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('loading-state').classList.add('hidden');
            document.getElementById('detail-container').classList.remove('hidden');
            
            document.getElementById('decor-image').src = data.image_url;
            document.getElementById('decor-title').textContent = data.title;
            document.getElementById('decor-price').textContent = data.price_range;
            document.getElementById('decor-desc').textContent = data.description;

            // RESTORED WHATSAPP LOGIC
            const whatsappBtn = document.getElementById('whatsapp-btn');
            const msg = encodeURIComponent(`Hi Celebrift! I want to book the ${data.title} setup.`);
            whatsappBtn.href = `https://wa.me/919594328008?text=${msg}`;

            renderLists(data);
            renderReviews(data.reviews);
            loadRelated();
        }
    } catch (e) { console.error("Data fetch failed"); }
}

async function loadRelated() {
    const res = await fetch('/api/decorations');
    const data = await res.json();
    // Fetch up to 8 items to create exactly 2 rows of 4 items on desktop
    const related = data.filter(i => i.slug !== decorId).slice(0, 8); 
    
    document.getElementById('related-products-container').innerHTML = `
        <h3 class="text-3xl font-black mb-8 text-center text-gray-900 border-t pt-16">More Designs for You</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
            ${related.map(item => `
                <a href="details.html?id=${item.slug}" class="bg-white rounded-2xl shadow-sm border group overflow-hidden hover:shadow-lg transition-all">
                    <div class="h-48 overflow-hidden">
                        <img src="${item.image_url}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                    </div>
                    <div class="p-4">
                        <h4 class="font-bold text-indigo-900 line-clamp-1">${item.title}</h4>
                        <p class="text-pink-600 font-extrabold mt-1">${item.price_range}</p>
                    </div>
                </a>
            `).join('')}
        </div>`;
}
// ... (keep renderLists and renderReviews)
fetchProductDetails();