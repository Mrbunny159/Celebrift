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

// 2. Get the ID from the URL (e.g., ?id=birthday-decor)
const urlParams = new URLSearchParams(window.location.search);
const decorId = urlParams.get('id');

// 3. Find the matching decoration in our data
const selectedDecor = decorData.find(item => item.id === decorId);

// 4. Update the Page HTML
if (selectedDecor) {
    // Un-hide the content container
    document.getElementById('detail-container').classList.remove('hidden');
    document.getElementById('detail-container').classList.add('flex');

    // Inject the data into the HTML elements
    document.getElementById('decor-image').src = selectedDecor.image;
    document.getElementById('decor-image').alt = selectedDecor.title;
    document.getElementById('decor-title').textContent = selectedDecor.title;
    document.getElementById('decor-desc').textContent = selectedDecor.description;
    document.getElementById('decor-price').textContent = selectedDecor.priceRange;

    // 5. Set up the WhatsApp Link
    const whatsappNumber = "919594328008"; 
    const message = `Hi Celebrift! I am interested in booking the *${selectedDecor.title}*. Can you provide more details?`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
    
    document.getElementById('whatsapp-btn').href = whatsappUrl;
} else {
    // Show error state if someone messes with the URL
    document.getElementById('error-state').classList.remove('hidden');
}