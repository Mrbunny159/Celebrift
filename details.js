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
    const related = data.filter(i => i.slug !== decorId).slice(0, 12);
    
    document.getElementById('related-products-container').innerHTML = `
        <h3 class="text-2xl font-black mb-8 px-2">More Designs for You</h3>
        <div class="flex overflow-x-auto gap-6 pb-10 hide-scroll-bar px-2">
            ${related.map(item => `
                <a href="details.html?id=${item.slug}" class="flex-none w-64 bg-white rounded-2xl shadow-sm border group">
                    <img src="${item.image_url}" class="w-full h-40 object-cover group-hover:scale-105 transition">
                    <div class="p-4"><h4 class="font-bold truncate">${item.title}</h4><p class="text-pink-600 font-bold">${item.price_range}</p></div>
                </a>
            `).join('')}
        </div>`;
}
// ... (keep renderLists and renderReviews)
fetchProductDetails();