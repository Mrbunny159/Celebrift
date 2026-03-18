const urlParams = new URLSearchParams(window.location.search);
const decorId = urlParams.get('id'); // e.g., 'premium-birthday-decor'

async function fetchProductDetails() {
    try {
        const response = await fetch(`/api/decorations/${decorId}`);
        const data = await response.json();

        if (response.ok) {
            document.getElementById('loading-state').classList.add('hidden');
            document.getElementById('detail-container').classList.remove('hidden');

            // 1. Basic Details
            document.getElementById('decor-image').src = data.image_url;
            document.getElementById('decor-title').textContent = data.title;
            document.getElementById('decor-desc').textContent = data.description;
            document.getElementById('decor-price').textContent = data.price_range;

            // Rating Stars
            let starsHtml = '';
            const rating = Math.round(data.average_rating || 5);
            for(let i = 1; i <= 5; i++) {
                starsHtml += `<svg class="w-5 h-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'} fill-current" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>`;
            }
            document.getElementById('decor-rating-stars').innerHTML = `${starsHtml} <span class="text-sm text-gray-500 ml-2">(${data.average_rating})</span>`;

            // 2. WhatsApp Link
            const whatsappNumber = "919594328008"; 
            const message = `Hi Celebrift! I am interested in booking the *${data.title}*. Can you provide more details?`;
            document.getElementById('whatsapp-btn').href = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;

            // 3. Package Includes (JSON Array)
            const packageList = document.getElementById('package-list');
            const includes = typeof data.package_includes === 'string' ? JSON.parse(data.package_includes) : data.package_includes;
            if(includes && includes.length > 0) {
                includes.forEach(item => {
                    packageList.innerHTML += `<li class="flex items-start gap-2"><svg class="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> ${item}</li>`;
                });
            } else {
                packageList.innerHTML = "<p class="text-gray-500">Standard setup included.</p>";
            }

            // 4. FAQs (JSON Array)
            const faqList = document.getElementById('faq-list');
            const faqs = typeof data.faqs === 'string' ? JSON.parse(data.faqs) : data.faqs;
            if(faqs && faqs.length > 0) {
                faqs.forEach(faq => {
                    faqList.innerHTML += `
                        <div class="border-b border-gray-100 pb-3">
                            <h4 class="font-semibold text-gray-800 text-sm md:text-base">${faq.q}</h4>
                            <p class="text-gray-600 text-sm mt-1">${faq.a}</p>
                        </div>
                    `;
                });
            } else {
                faqList.innerHTML = "<p class='text-gray-500'>No FAQs available.</p>";
            }

            // 5. Reviews
            const reviewsList = document.getElementById('reviews-list');
            if (data.reviews && data.reviews.length > 0) {
                data.reviews.forEach(rev => {
                    let revStars = '';
                    for(let i=1; i<=5; i++) { revStars += `<svg class="w-3 h-3 ${i <= rev.rating ? 'text-yellow-400' : 'text-gray-300'} fill-current" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>`; }
                    
                    reviewsList.innerHTML += `
                        <div class="bg-gray-50 p-4 rounded-xl">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="font-semibold text-gray-800 text-sm">${rev.reviewer_name}</span>
                                <div class="flex">${revStars}</div>
                            </div>
                            <p class="text-gray-600 text-sm">"${rev.review_text}"</p>
                        </div>
                    `;
                });
            } else {
                reviewsList.innerHTML = "<p class='text-gray-500 text-sm'>No reviews yet. Be the first to book!</p>";
            }

        } else {
            document.getElementById('loading-state').textContent = "Product not found.";
        }
    } catch (error) {
        document.getElementById('loading-state').textContent = "Error loading details.";
    }
}

fetchProductDetails();