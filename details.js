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
            // Un-hide UI
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
            document.getElementById('decor-rating-stars').innerHTML = `${starsHtml} <span class="text-sm text-gray-500 ml-2 font-medium">(${data.average_rating || 5})</span>`;

            // WhatsApp Link
            const whatsappNumber = "919594328008"; 
            const message = `Hi Celebrift! I am interested in booking the *${data.title}*. Can you provide more details?`;
            document.getElementById('whatsapp-btn').href = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;

            // Call functions to populate lists
            renderLists(data);
            renderReviews(data.reviews);
        } else {
            document.getElementById('loading-state').textContent = "Decoration not found.";
        }
    } catch (error) {
        document.getElementById('loading-state').textContent = "Error connecting to the server.";
    }
}

// Function to populate Package and FAQs safely
function renderLists(data) {
    // Safely parse JSON arrays from database
    let includes = [];
    try { includes = typeof data.package_includes === 'string' ? JSON.parse(data.package_includes) : (data.package_includes || []); } catch(e){}
    
    let faqs = [];
    try { faqs = typeof data.faqs === 'string' ? JSON.parse(data.faqs) : (data.faqs || []); } catch(e){}

    // Create Package HTML
    let packHtml = includes.length > 0 
        ? includes.map(item => `<li class="flex items-start gap-3"><svg class="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> <span>${item}</span></li>`).join('') 
        : "<p class='text-gray-500'>Standard decor setup included.</p>";
    
    document.getElementById('desktop-package-list').innerHTML = packHtml;
    document.getElementById('mobile-package-list').innerHTML = packHtml;

    // Create FAQ HTML
    let faqHtml = faqs.length > 0
        ? faqs.map(faq => `<div class="border-b border-gray-100 pb-3 last:border-0 last:pb-0"><h4 class="font-bold text-gray-800 text-sm md:text-base mb-1">${faq.q}</h4><p class="text-gray-600 text-sm leading-relaxed">${faq.a}</p></div>`).join('')
        : "<p class='text-gray-500 text-sm'>No FAQs available for this setup.</p>";

    document.getElementById('desktop-faq-list').innerHTML = faqHtml;
    document.getElementById('mobile-faq-list').innerHTML = faqHtml;
}

// Function to populate Customer Reviews
function renderReviews(reviews) {
    const reviewsList = document.getElementById('reviews-list');
    
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

// Start the fetch when the page loads
fetchProductDetails();

// Handle Review Submission
document.getElementById('review-form').addEventListener('submit', async (e) => {
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