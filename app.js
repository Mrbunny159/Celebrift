const container = document.getElementById('decor-container');

// Function to fetch and display data from your Flask API
async function fetchDecorations(category = 'all') {
    // Show a loading state
    container.innerHTML = '<div class="col-span-full text-center py-10 text-2xl animate-pulse text-pink-500 font-bold">✨ Bringing the magic...</div>';

    try {
        // Construct the API URL based on the category
        let apiUrl = '/api/decorations';
        if (category !== 'all') {
            apiUrl += `?category=${category}`;
        }

        // Call the Flask Backend
        const response = await fetch(apiUrl);
        const data = await response.json();

        // If no data comes back
        if (data.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center py-10 text-gray-500">No decorations found for this category.</div>';
            return;
        }

        // Generate HTML for each item
        let htmlContent = '';
        data.forEach(item => {
            htmlContent += `
                <a href="details.html?id=${item.slug}" class="group block relative">
                    ${item.views > 5 ? `<span class="absolute top-4 right-4 z-20 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">🔥 Popular</span>` : ''}
                    
                    <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-pink-100 h-full flex flex-col relative z-10">
                        <div class="overflow-hidden">
                            <img src="${item.image_url}" alt="${item.title}" class="w-full h-60 object-cover group-hover:scale-110 transition-transform duration-700">
                        </div>
                        <div class="p-6 flex-grow flex flex-col justify-between">
                            <div>
                                <h3 class="text-2xl font-bold text-gray-800 mb-2">${item.title}</h3>
                                <p class="text-gray-600 text-sm leading-relaxed line-clamp-2">${item.description}</p>
                            </div>
                            <div class="mt-4 flex justify-between items-center">
                                <span class="text-pink-600 font-bold">${item.price_range}</span>
                                <div class="inline-flex items-center text-pink-500 font-semibold group-hover:text-pink-600 transition-colors">
                                    Book 
                                    <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>
            `;
        });

        // Inject the HTML
        container.innerHTML = htmlContent;

        // Update button styling to show which one is active
        updateActiveButton(category);

    } catch (error) {
        console.error("Error fetching decorations:", error);
        container.innerHTML = '<div class="col-span-full text-center py-10 text-red-500 font-bold">Oops! Could not load the decorations. Please try again later.</div>';
    }
}

// Function to handle the styling of the category buttons
function updateActiveButton(activeCategory) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick').includes(activeCategory)) {
            btn.classList.remove('bg-white', 'text-gray-700');
            btn.classList.add('bg-pink-500', 'text-white');
        } else {
            btn.classList.remove('bg-pink-500', 'text-white');
            btn.classList.add('bg-white', 'text-gray-700');
        }
    });
}

// Load all decorations when the page first loads
window.onload = () => {
    fetchDecorations('all');
};