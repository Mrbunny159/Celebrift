const urlParams = new URLSearchParams(window.location.search);
const decorId = urlParams.get('id');

async function fetchProductDetails() {
    if (!decorId) {
        document.getElementById('loading-state').textContent = "Product not found. Please return to the home page.";
        return;
    }

    try {
        const response = await fetch(`/api/decorations/${decorId}`);
        const data = await response.json();

        if (response.ok) {
            // Un-hide UI (REMOVED THE ROGUE FLEX CLASS HERE!)
            document.getElementById('loading-state').classList.add('hidden');
            document.getElementById('detail-container').classList.remove('hidden');

            // Set Data Safely
            document.getElementById('decor-image').src = data.image_url || '';
            document.getElementById('decor-title').textContent = data.title || 'Event Setup';
            document.getElementById('decor-desc').textContent = data.description || '';
            document.getElementById('decor-price').textContent = data.price_range || 'Price on request';

            // Generate Rating Stars
            const rating = Math.round(data.average_rating || 5);
            let starsHtml = '';
            for(let i = 1; i <= 5; i++) {
                starsHtml += `<svg class="w-5 h-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'} fill-current" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>`;
            }
            const starsContainer = document.getElementById('decor-rating-stars');
            if (starsContainer) {
                starsContainer.innerHTML = `${starsHtml} <span class="text-sm text-gray-500 ml-2 font-medium">(${data.average_rating || 5})</span>`;
            }

            // WhatsApp Link
            const whatsappNumber = "919594328008"; 
            const message = `Hi Celebrift! I am interested in booking the *${data.title}*. Can you provide more details?`;
            const btn = document.getElementById('whatsapp-btn');
            if (btn) btn.href = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;

            // --- THE CRUCIAL FUNCTION CALLS ---
            renderLists(data);
            renderReviews(data.reviews);
            loadRelatedProducts(); 
            
            // Show the footer only after the data is loaded
            const footer = document.getElementById('detail-footer');
            if (footer) footer.classList.remove('hidden');

        } else {
            document.getElementById('loading-state').textContent = "Decoration not found.";
        }
    } catch (error) {
        document.getElementById('loading-state').textContent = "Error connecting to the server.";
    }
}

// Function to populate Package and FAQs safely
function renderLists(data) {
    let includes = [];
    try { includes = typeof data.package_includes === 'string' ? JSON.parse(data.package_includes) : (data.package_includes || []); } catch(e){}
    
    let faqs = [];
    try { faqs = typeof data.faqs === 'string' ? JSON.parse(data.faqs) : (data.faqs || []); } catch(e){}

    let packHtml = includes.length > 0 
        ? includes.map(item => `<li class="flex items-start gap-3"><svg class="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> <span>${item}</span></li>`).join('') 
        : "<p class='text-gray-500'>Standard decor setup included.</p>";
    
    const dPack = document.getElementById('desktop-package-list');
    const mPack = document.getElementById('mobile-package-list');
    if (dPack) dPack.innerHTML = packHtml;
    if (mPack) mPack.innerHTML = packHtml;

    let faqHtml = faqs.length > 0
        ? faqs.map(faq => `<div class="border-b border-gray-100 pb-3 last:border-0 last:pb-0"><h4 class="font-bold text-gray-800 text-sm md:text-base mb-1">${faq.q}</h4><p class="text-gray-600 text-sm leading-relaxed">${faq.a}</p></div>`).join('')
        : "<p class='text-gray-500 text-sm'>No FAQs available for this setup.</p>";

    const dFaq = document.getElementById('desktop-faq-list');
    const mFaq = document.getElementById('mobile-faq-list');
    if (dFaq) dFaq.innerHTML = faqHtml;
    if (mFaq) mFaq.innerHTML = faqHtml;
}

// Function to populate Customer Reviews
function renderReviews(reviews) {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;
    
    if (reviews && reviews.length > 0) {
        let html = '';
        reviews.forEach(rev => {
            let revStars = '';
            for(let i=1; i<=5; i++) { revStars += `<svg class="w-4 h-4 ${i <= rev.rating ? 'text-yellow-400' : 'text-gray-300'} fill-current" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>`; }
            
            html += `
                <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <span class="font-bold text-gray-900">${rev.reviewer_name}</span>
                        <div class="flex">${revStars}</div>
                    </div>
                    <p class="text-gray-600 text-sm italic">"${rev.review_text}"</p>
                </div>
            `;
        });
        reviewsList.innerHTML = html;
    } else {
        reviewsList.innerHTML = "<p class='text-gray-500 text-sm bg-gray-50 p-4 rounded-lg text-center'>No reviews yet. Be the first to book!</p>";
    }
}

// Function to load Related Products
async function loadRelatedProducts() {
    const container = document.getElementById('related-products-container');
    if (!container) return;

    try {
        const res = await fetch('/api/decorations');
        const data = await res.json();
        
        const related = data.filter(item => item.slug !== decorId).slice(0, 12);

        if(related.length > 0) {
            let html = '<h3 class="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4 text-center">You Might Also Like</h3><div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">';
            related.forEach(item => {
                let starsHtml = '';
                const rating = Math.round(item.average_rating || 5);
                for(let i = 1; i <= 5; i++) {
                    starsHtml += `<svg class="w-3 h-3 md:w-4 md:h-4 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'} fill-current" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>`;
                }

                html += `
                    <a href="details.html?id=${item.slug}" class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 flex flex-col h-full group">
                        <div class="relative w-full pb-[100%] overflow-hidden bg-gray-50">
                            <img src="${item.image_url}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                        </div>
                        <div class="p-3 md:p-4 flex flex-col flex-grow">
                            <h3 class="text-sm md:text-base font-semibold text-gray-800 line-clamp-2 mb-1">${item.title}</h3>
                            <div class="flex items-center gap-1 mb-2">
                                ${starsHtml}
                                <span class="text-xs text-gray-500 ml-1">(${item.average_rating || 5})</span>
                            </div>
                            <div class="mt-auto flex justify-between items-end">
                                <span class="text-base md:text-lg font-bold text-gray-900">${item.price_range}</span>
                            </div>
                        </div>
                    </a>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        }
    } catch(e) {
        console.error("Could not load related products.");
    }
}

// Start the fetch when the page loads
fetchProductDetails();

// Handle Review Submission
const reviewForm = document.getElementById('review-form');
if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('rev-submit');
        const msg = document.getElementById('rev-msg');
        
        btn.textContent = 'Submitting...';
        btn.disabled = true;

        const payload = {
            name: document.getElementById('rev-name').value,
            rating: parseInt(document.getElementById('rev-rating').value),
            review: document.getElementById('rev-text').value
        };

        try {
            const res = await fetch(`/api/reviews/${decorId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if(res.ok) {
                msg.textContent = 'Review added successfully! Refreshing page...';
                msg.className = 'text-green-600 text-sm block mt-3 font-bold text-center';
                msg.classList.remove('hidden');
                setTimeout(() => window.location.reload(), 1500); 
            } else {
                throw new Error('Failed to submit');
            }
        } catch(err) {
            msg.textContent = 'Error submitting review. Please try again.';
            msg.className = 'text-red-600 text-sm block mt-3 font-bold text-center';
            msg.classList.remove('hidden');
            btn.textContent = 'Submit Review';
            btn.disabled = false;
        }
    });
}