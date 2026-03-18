// 1. Our Data Store
const decorData = [
    {
        id: "birthday-decor",
        title: "Birthday Decor",
        image: "https://images.unsplash.com/photo-1530103862676-de3c9de59f9e?auto=format&fit=crop&q=80&w=800",
        description: "Make birthdays unforgettable with our custom balloon arches, banners, and thematic setups.",
        priceRange: "Starting from ₹1,499"
    },
    {
        id: "baby-shower",
        title: "Baby Shower Decor",
        image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800",
        description: "Welcome the little one with soft pastels, floral arrangements, and beautiful backdrops.",
        priceRange: "Starting from ₹2,499"
    },
    {
        id: "store-decor",
        title: "Store Decor",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800",
        description: "Attract customers with eye-catching storefront balloon garlands and grand opening setups.",
        priceRange: "Starting from ₹3,000"
    },
    {
        id: "naming-ceremony",
        title: "Naming Ceremony",
        image: "https://images.unsplash.com/photo-1522771930-78848d926053?auto=format&fit=crop&q=80&w=800",
        description: "Traditional and elegant decorations to bless the newest member of your family.",
        priceRange: "Starting from ₹2,000"
    },
    {
        id: "anniversary",
        title: "Anniversary Decor",
        image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800",
        description: "Celebrate milestones with elegant romantic setups, LED lights, and floral pathways.",
        priceRange: "Starting from ₹1,999"
    },
    {
        id: "romantic-decor",
        title: "Romantic Decor",
        image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=800",
        description: "Surprise your partner with canopy cabanas, rose petals, and candle-lit room transformations.",
        priceRange: "Starting from ₹2,500"
    }
];

// 2. Render Logic
const container = document.getElementById('decor-container');

// Loop through data and create HTML for each card
let htmlContent = '';

decorData.forEach(item => {
    // Notice how we pass the ID to the details.html page via the URL query parameter (?id=...)
    htmlContent += `
        <a href="details.html?id=${item.id}" class="group block">
            <div class="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-pink-100 h-full flex flex-col">
                <div class="overflow-hidden">
                    <img src="${item.image}" alt="${item.title}" class="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-500">
                </div>
                <div class="p-6 flex-grow flex flex-col justify-between">
                    <div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-2">${item.title}</h3>
                        <p class="text-gray-600 text-sm leading-relaxed">${item.description}</p>
                    </div>
                    <div class="mt-4 inline-flex items-center text-pink-500 font-semibold group-hover:text-pink-600 transition-colors">
                        View Details 
                        <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                </div>
            </div>
        </a>
    `;
});

// Inject the HTML into the page
container.innerHTML = htmlContent;