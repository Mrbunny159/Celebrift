const urlParams = new URLSearchParams(window.location.search);
const decorId = urlParams.get('id');

// 5. STAR RATING INTERACTIVITY
const starSpans = document.querySelectorAll('#star-selector span');
const ratingInput = document.getElementById('rev-rating');

starSpans.forEach(star => {
    star.addEventListener('click', () => {
        const val = parseInt(star.dataset.val);
        ratingInput.value = val;
        starSpans.forEach((s, idx) => {
            if (idx < val) {
                s.classList.replace('text-gray-300', 'text-yellow-400');
            } else {
                s.classList.replace('text-yellow-400', 'text-gray-300');
            }
        });
    });
});

async function fetchProductDetails() {
    try {
        const response = await fetch(`/api/decorations/${decorId}`);
        const data = await response.json();
        if(!response.ok) return;

        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('detail-container').classList.remove('hidden');
        
        // 4. MAIN IMAGE & THUMBNAILS
        document.getElementById('main-image').src = data.images[0];
        const thumbContainer = document.getElementById('thumbnail-container');
        if(data.images.length > 1) {
            thumbContainer.innerHTML = data.images.map(img => `
                <img src="${img}" onclick="document.getElementById('main-image').src='${img}'" 
                     class="w-20 h-20 rounded-xl object-cover cursor-pointer border-2 border-transparent hover:border-pink-500 transition-all flex-none">
            `).join('');
        }

        document.getElementById('decor-title').textContent = data.title;
        document.getElementById('decor-price').textContent = data.price_range;
        document.getElementById('decor-desc').textContent = data.description;
        
        // Stars
        const rating = Math.round(data.average_rating || 5);
        document.getElementById('decor-rating-stars').innerHTML = '★'.repeat(rating) + '☆'.repeat(5-rating) + `<span class="text-sm text-gray-500 ml-2">(${data.average_rating || 5})</span>`;
        
        // WhatsApp Button
        const msg = encodeURIComponent(`Hi Celebrift! I want to book the ${data.title} setup.`);
        document.getElementById('whatsapp-btn').href = `https://wa.me/919594328008?text=${msg}`;

        // Lists
        let includes = [];
        try { includes = typeof data.package_includes === 'string' ? JSON.parse(data.package_includes) : data.package_includes; } catch(e){}
        document.getElementById('desktop-package-list').innerHTML = includes.map(i => `<li class="mb-1">✓ ${i}</li>`).join('');

        // Reviews
        const revList = document.getElementById('reviews-list');
        revList.innerHTML = data.reviews.length ? data.reviews.map(r => `
            <div class="bg-gray-50 p-5 rounded-2xl border">
                <p class="text-yellow-400 mb-2 text-lg">${'★'.repeat(r.rating)}</p>
                <p class="text-gray-700 italic mb-2">"${r.review_text}"</p>
                <p class="font-bold text-gray-900 text-sm">- ${r.reviewer_name}</p>
            </div>
        `).join('') : '<p class="text-gray-500">No reviews yet. Be the first!</p>';

        // Related Products
        const res = await fetch('/api/decorations');
        const all = await res.json();
        const related = all.filter(i => i.slug !== decorId).slice(0, 12);
        document.getElementById('related-products-container').innerHTML = `
            <h3 class="text-2xl font-black mb-8 px-2 text-indigo-900">More Designs for You</h3>
            <div class="flex overflow-x-auto gap-6 pb-10 hide-scroll-bar px-2">
                ${related.map(item => `
                    <a href="details.html?id=${item.slug}" class="flex-none w-64 bg-white rounded-3xl shadow-sm border border-gray-100 group overflow-hidden">
                        <img src="${item.images[0]}" class="w-full h-40 object-cover group-hover:scale-105 transition duration-700">
                        <div class="p-5"><h4 class="font-bold text-gray-800 line-clamp-1">${item.title}</h4><p class="text-pink-600 font-bold mt-1">${item.price_range}</p></div>
                    </a>`).join('')}
            </div>`;
    } catch (e) { console.error(e); }
}

document.getElementById('review-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('rev-submit');
    btn.textContent = 'Submitting...';
    
    await fetch(`/api/reviews/${decorId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: document.getElementById('rev-name').value,
            rating: parseInt(document.getElementById('rev-rating').value),
            review: document.getElementById('rev-text').value
        })
    });
    window.location.reload();
});

fetchProductDetails();