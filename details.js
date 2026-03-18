const urlParams = new URLSearchParams(window.location.search);
const decorId = urlParams.get('id');

async function fetchProductDetails() {
    try {
        const response = await fetch(`/api/decorations/${decorId}`);
        if (!response.ok) throw new Error('Not found');
        const data = await response.json();
        
        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('detail-container').classList.remove('hidden');
        
        // Populate main details
        document.getElementById('decor-image').src = data.image_url;
        document.getElementById('decor-title').textContent = data.title;
        document.getElementById('decor-price').textContent = data.price_range;
        document.getElementById('decor-desc').textContent = data.description;

        // WhatsApp Button
        const whatsappBtn = document.getElementById('whatsapp-btn');
        const msg = encodeURIComponent(`Hi Celebrift! I want to book the ${data.title} setup.`);
        whatsappBtn.href = `https://wa.me/919594328008?text=${msg}`;

        // Safely Render Package Includes
        const pkgList = document.getElementById('desktop-package-list');
        if (data.package_includes && data.package_includes.length > 0) {
            pkgList.innerHTML = `<ul class="list-disc pl-5 space-y-1 text-gray-600">${data.package_includes.map(item => `<li>${item}</li>`).join('')}</ul>`;
        } else {
            pkgList.innerHTML = "<p>Standard package inclusions apply. Contact us for details.</p>";
        }

        // Safely Render FAQs
        const faqList = document.getElementById('desktop-faq-list');
        if (data.faqs && data.faqs.length > 0) {
            faqList.innerHTML = data.faqs.map(f => `<div class="mb-3"><p class="font-bold text-gray-800">Q: ${f.q}</p><p class="text-gray-600">A: ${f.a}</p></div>`).join('');
        } else {
            faqList.innerHTML = "<p>No specific FAQs for this setup.</p>";
        }

        // Render sections independently
        renderReviews(data.reviews || []);
        await loadRelated();

    } catch (e) { 
        console.error("Data fetch failed:", e);
        document.getElementById('loading-state').textContent = "Failed to load product details.";
    }
}

async function loadRelated() {
    try {
        const res = await fetch('/api/decorations');
        const data = await res.json();
        
        // Filter out current item and limit to 8 items to create 2 rows of 4
        const related = data.filter(i => i.slug !== decorId).slice(0, 8); 
        const container = document.getElementById('related-products-container');
        
        if (related.length === 0) {
            container.innerHTML = ""; 
            return;
        }

        container.innerHTML = `
            <h3 class="text-3xl font-black mb-8 text-center text-gray-900 border-t border-gray-200 pt-16">More Designs for You</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
                ${related.map(item => `
                    <a href="details.html?id=${item.slug}" class="bg-white rounded-2xl shadow-sm border group overflow-hidden hover:shadow-lg transition-all">
                        <div class="h-48 overflow-hidden bg-gray-100">
                            <img src="${item.image_url}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                        </div>
                        <div class="p-4">
                            <h4 class="font-bold text-indigo-900 line-clamp-1">${item.title}</h4>
                            <p class="text-pink-600 font-extrabold mt-1">${item.price_range}</p>
                        </div>
                    </a>
                `).join('')}
            </div>`;
    } catch (e) {
        console.error("Failed to load related products", e);
    }
}

function renderReviews(reviews) {
    const container = document.getElementById('reviews-list');
    if (reviews.length === 0) {
        container.innerHTML = "<p class='text-gray-500 font-medium italic'>No reviews yet. Be the first to review!</p>";
        return;
    }
    container.innerHTML = reviews.map(r => `
        <div class="border-b pb-4 mb-4 last:border-0">
            <div class="flex justify-between items-center mb-2">
                <span class="font-bold text-gray-800">${r.reviewer_name}</span>
                <span class="text-yellow-400 text-lg">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span>
            </div>
            <p class="text-gray-600">${r.review_text}</p>
        </div>
    `).join('');
}

// Review Submission Logic
document.getElementById('review-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('rev-submit');
    btn.textContent = "Submitting...";
    
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
        if (res.ok) {
            alert("Review submitted successfully!");
            location.reload(); 
        }
    } catch (err) {
        alert("Failed to submit review.");
        btn.textContent = "Submit Feedback";
    }
});

// Initialize the page
fetchProductDetails();