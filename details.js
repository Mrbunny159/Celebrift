const starSpans = document.querySelectorAll('#star-selector span');
const ratingInput = document.getElementById('rev-rating');
if (starSpans.length > 0) { starSpans.forEach(star => { star.addEventListener('click', () => { const val = parseInt(star.dataset.val); ratingInput.value = val; starSpans.forEach((s, idx) => { if (idx < val) { s.classList.remove('text-gray-300'); s.classList.add('text-yellow-400'); } else { s.classList.remove('text-yellow-400'); s.classList.add('text-gray-300'); } }); }); }); }

const urlParams = new URLSearchParams(window.location.search);
const decorId = urlParams.get('id');
let imagesArray = [];

window.updateActiveThumb = function(activeIndex) { imagesArray.forEach((_, idx) => { const el = document.getElementById(`thumb-${idx}`); if (el) { el.classList.remove('border-pink-500'); el.classList.add('border-transparent'); if (idx === activeIndex) { el.classList.remove('border-transparent'); el.classList.add('border-pink-500'); } } }); }

async function fetchProductDetails() {
    try {
        const response = await fetch(`/api/decorations/${decorId}`);
        if (!response.ok) throw new Error('Not found');
        const data = await response.json();
        
        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('detail-container').classList.remove('hidden');
        document.getElementById('detail-footer')?.classList.remove('hidden');
        
        try { if (data.images && typeof data.images === 'string') { imagesArray = JSON.parse(data.images); } else if (Array.isArray(data.images)) { imagesArray = data.images; } else if (data.image_url) { imagesArray = [data.image_url]; } } catch (e) { imagesArray = data.image_url ? [data.image_url] : []; }
        const mainImg = document.getElementById('decor-image'); if (mainImg && imagesArray.length > 0) mainImg.src = imagesArray[0];
        const thumbContainer = document.getElementById('decor-thumbnails');
        if (thumbContainer && imagesArray.length > 1) { thumbContainer.innerHTML = imagesArray.map((img, index) => `<img src="${img}" onclick="document.getElementById('decor-image').src='${img}'; updateActiveThumb(${index})" id="thumb-${index}" class="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover cursor-pointer border-2 ${index === 0 ? 'border-pink-500' : 'border-transparent'} hover:border-pink-400 transition-all flex-none shadow-sm snap-center bg-gray-50">`).join(''); }

        if(document.getElementById('decor-title')) document.getElementById('decor-title').textContent = data.title || 'Beautiful Decoration';
        if(document.getElementById('decor-price')) document.getElementById('decor-price').textContent = data.price_range || '';
        
        // FEATURE 4: Inject HTML so Quill.js formatting (bold, italic, bullets) works perfectly!
        if(document.getElementById('decor-desc')) {
            document.getElementById('decor-desc').innerHTML = data.description || '';
            // Add some base styling so the bullet points and bold text show up correctly
            document.getElementById('decor-desc').className = "text-gray-600 mb-8 leading-relaxed text-lg prose"; 
        }
        
        const rating = Math.round(data.average_rating || 5);
        if(document.getElementById('decor-rating-stars')) { document.getElementById('decor-rating-stars').innerHTML = '★'.repeat(rating) + '☆'.repeat(5-rating) + `<span class="text-sm text-gray-500 ml-2 font-bold text-indigo-900">(${data.average_rating || 5})</span>`; }

        const whatsappBtn = document.getElementById('whatsapp-btn');
        if(whatsappBtn && data.title) { const pageUrl = window.location.href; const msg = encodeURIComponent(`Hi Celebrift! I want to book the ${data.title} setup.\n\nLink: ${pageUrl}`); whatsappBtn.href = `https://wa.me/919594328008?text=${msg}`; }

        const pkgList = document.getElementById('desktop-package-list');
        if (pkgList) { let includes = []; try { includes = typeof data.package_includes === 'string' ? JSON.parse(data.package_includes) : data.package_includes; } catch(e){} if (includes && includes.length > 0) { pkgList.innerHTML = includes.map(item => `<li class="flex items-center gap-2 mb-2"><span class="text-pink-500 font-bold">✓</span> ${item}</li>`).join(''); } else { pkgList.innerHTML = "<p>Standard package inclusions apply. Contact us for details.</p>"; } }

        const faqList = document.getElementById('desktop-faq-list');
        if (faqList) { let faqs = []; try { faqs = typeof data.faqs === 'string' ? JSON.parse(data.faqs) : data.faqs; } catch(e){} if (faqs && faqs.length > 0) { faqList.innerHTML = faqs.map(f => `<div class="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100"><p class="font-bold text-indigo-900 mb-1">Q: ${f.q}</p><p class="text-gray-600">A: ${f.a}</p></div>`).join(''); } else { faqList.innerHTML = "<p>No specific FAQs for this setup.</p>"; } }

        renderReviews(data.reviews || []); await loadRelated();
    } catch (e) { if(document.getElementById('loading-state')) { document.getElementById('loading-state').textContent = "Failed to load product details. Please refresh the page."; } }
}

async function loadRelated() {
    try {
        const res = await fetch('/api/decorations'); const data = await res.json(); const related = data.filter(i => i.slug !== decorId).slice(0, 8); const container = document.getElementById('related-products-container');
        if (related.length === 0) { if(container) container.innerHTML = ""; return; }
        if(container) { container.innerHTML = `<h3 class="text-3xl font-black mb-8 px-2 text-indigo-900">More Designs for You</h3><div class="flex overflow-x-auto gap-6 pb-10 hide-scroll-bar px-2 snap-x">${related.map(item => { let primaryImg = item.image_url; if (item.images) { try { primaryImg = JSON.parse(item.images)[0] || item.image_url; } catch(e) {} } return `<a href="details.html?id=${item.slug}" class="flex-none w-64 bg-white rounded-3xl shadow-sm border border-gray-100 group overflow-hidden snap-center"><img src="${primaryImg}" class="w-full h-48 object-cover group-hover:scale-105 transition duration-700"><div class="p-5"><h4 class="font-bold text-gray-800 line-clamp-1">${item.title}</h4><p class="text-pink-600 font-black mt-1">${item.price_range}</p></div></a>`; }).join('')}</div>`; }
    } catch (e) { }
}

function renderReviews(reviews) {
    const container = document.getElementById('reviews-list'); if(!container) return;
    if (reviews.length === 0) { container.innerHTML = "<p class='text-gray-500 font-medium italic bg-gray-50 p-6 rounded-2xl border border-gray-100'>No reviews yet. Be the first to review!</p>"; return; }
    container.innerHTML = reviews.map(r => `<div class="border border-gray-100 bg-gray-50 p-6 rounded-2xl"><div class="flex justify-between items-center mb-3"><span class="font-black text-indigo-900">${r.reviewer_name}</span><span class="text-yellow-400 text-lg">${'★'.repeat(r.rating)}</span></div><p class="text-gray-600 italic">"${r.review_text}"</p></div>`).join('');
}

document.getElementById('review-form')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const btn = document.getElementById('rev-submit'); btn.textContent = "Submitting...";
    const payload = { name: document.getElementById('rev-name').value, rating: parseInt(document.getElementById('rev-rating').value), review: document.getElementById('rev-text').value };
    try { const res = await fetch(`/api/reviews/${decorId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (res.ok) { location.reload(); } else { alert("Failed to submit review."); btn.textContent = "Submit Review"; } } catch (err) { alert("Server connection failed."); btn.textContent = "Submit Review"; }
});

fetchProductDetails();