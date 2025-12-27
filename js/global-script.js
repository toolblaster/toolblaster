/**
 * Toolblaster Secondary Global Script
 * Handles non-critical UI interactions: Image Modals, Sidebar Widgets (Reviews), and general utility styles.
 * Loaded after the main header/footer script.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Image Modal System
    initImageModal();

    // 2. Inject Sidebar Widgets (if sidebar exists)
    // Only runs if header-footer.js has already created the container, or if we are late.
    // We try immediately, and also set a small timeout to catch race conditions if header-footer is slow.
    injectSidebarWidgets();
    setTimeout(injectSidebarWidgets, 100); 

    // 3. Initialize Global Ad Manager
    initAdManager();
});

/**
 * ------------------------------------------------------------------------
 * 1. GLOBAL IMAGE MODAL SYSTEM
 * ------------------------------------------------------------------------
 * Automatically adds click-to-zoom functionality to specific review images.
 */
function initImageModal() {
    // Inject Modal HTML if it doesn't exist
    if (!document.getElementById('image-modal')) {
        const modalHTML = `
            <div id="image-modal" class="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm hidden flex items-center justify-center p-4 transition-opacity duration-300 opacity-0" onclick="closeImageModal()">
                <div class="relative max-w-7xl w-full max-h-screen flex flex-col items-center justify-center" onclick="event.stopPropagation()">
                    <button class="absolute -top-12 right-0 text-white text-4xl hover:text-gray-300 transition-colors focus:outline-none" onclick="closeImageModal()" aria-label="Close Modal">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                    <img id="modal-image" src="" alt="Full size screenshot" class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl">
                    <p class="text-gray-400 text-sm mt-3 text-center">Click outside or press Esc to close</p>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Expose functions globally so onclick="" attributes in HTML work
    window.openImageModal = function(src) {
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-image');
        if (!modal || !modalImg) return;

        modalImg.src = src;
        modal.classList.remove('hidden');
        
        // Small delay to allow display:block to apply before opacity transition
        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
        });
        
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        document.addEventListener('keydown', handleEscKey);
    };

    window.closeImageModal = function() {
        const modal = document.getElementById('image-modal');
        if (!modal) return;

        modal.classList.add('opacity-0');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            const img = document.getElementById('modal-image');
            if(img) img.src = ''; // Clear src to stop memory leaks
        }, 300); // Match transition duration
        
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscKey);
    };
}

function handleEscKey(e) {
    if (e.key === 'Escape') {
        window.closeImageModal();
    }
}


/**
 * ------------------------------------------------------------------------
 * 2. SIDEBAR WIDGETS (REVIEWS ONLY)
 * ------------------------------------------------------------------------
 * Centralized logic to inject these widgets into #app-sidebar > .flex-col
 */

// CENTRALIZED REVIEW DATA (Moved from header-footer.js for better consolidation)
// Add new reviews to the TOP of this array ONLY when they are published.
const recentReviewsGlobal = [
    { 
        title: "Verpex Hosting Review", 
        url: "/reviews/hosting/verpex-hosting-review.html", 
        category: "Hosting", 
        date: "Feb 2026" 
    },
    { 
        title: "KWFinder Review 2026", 
        url: "/reviews/seo/kwfinder-review.html", 
        category: "SEO Tools", 
        date: "Jan 2026" 
    },
    { 
        title: "Semrush Review 2026", 
        url: "/reviews/seo/semrush-review.html", 
        category: "SEO Tools", 
        date: "Jan 2025" 
    },
    { 
        title: "ZeroSSL Review", 
        url: "/reviews/security/zerossl-review.html", 
        category: "Security", 
        date: "Dec 2025" 
    }
    // NOTE: Add future published reviews here. Do not add dummies.
];

/**
 * Fisher-Yates Shuffle Utility
 * Randomizes an array in-place.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function injectSidebarWidgets() {
    const sidebarContainer = document.getElementById('app-sidebar');
    if (!sidebarContainer) return;
    
    let flexWrapper = sidebarContainer.querySelector('.flex.flex-col');
    if (!flexWrapper) return;

    if (document.getElementById('widget-related-reviews')) return;

    // 2. Related Reviews Widget HTML
    const reviewsListHTML = getReviewListHTMLGlobal();
    
    const reviewsWidgetHTML = `
        <div id="widget-related-reviews" class="card-section !p-2.5 !mb-0 shadow-sm border-gray-300 bg-white w-full max-w-full order-1">
            <h3 class="text-[11px] font-extrabold text-gray-900 mb-2 uppercase tracking-widest border-b border-gray-200 pb-1.5">
                <i class="fa-solid fa-book-open text-accent-main mr-1.5"></i> Other Reviews
            </h3>
            <ul class="space-y-1">
                ${reviewsListHTML}
            </ul>
        </div>
    `;

    flexWrapper.insertAdjacentHTML('afterbegin', reviewsWidgetHTML);
}

/**
 * Helper to generate the reviews list HTML
 * Implements "3 Related + 3 Other" logic.
 */
function getReviewListHTMLGlobal() {
    const currentPath = window.location.pathname;
    
    // UPDATED: Max limits for the "3 + 3" logic
    const MAX_RELATED = 3;
    const MAX_OTHERS = 3; 

    // 1. Identify Current Context (Category)
    const currentReview = recentReviewsGlobal.find(r => currentPath.endsWith(r.url) || (r.url !== '/' && currentPath.includes(r.url)));
    const currentCategory = currentReview ? currentReview.category : null;

    // 2. Filter Available Reviews (Exclude current page)
    const availableReviews = recentReviewsGlobal.filter(r => !currentPath.includes(r.url));
    
    let finalSelection = [];

    if (currentCategory) {
        // --- LOGIC: Contextual Mix (3 Same + 3 Other) ---
        
        const sameCategory = availableReviews.filter(r => r.category === currentCategory);
        const otherCategory = availableReviews.filter(r => r.category !== currentCategory);

        // Shuffle both pools
        shuffleArray(sameCategory);
        shuffleArray(otherCategory);

        // Select up to 3 Related
        const selectedRelated = sameCategory.slice(0, MAX_RELATED);
        
        // Select up to 3 Others
        const selectedOthers = otherCategory.slice(0, MAX_OTHERS);
        
        // Combine them
        finalSelection = [...selectedRelated, ...selectedOthers];

    } else {
        // --- LOGIC: Random Mix (Homepage/Unknown) ---
        // Just take random 6 if no category context exists
        shuffleArray(availableReviews);
        finalSelection = availableReviews.slice(0, MAX_RELATED + MAX_OTHERS);
    }

    // 3. Final Shuffle
    // Shuffle the final combined list so "Related" items aren't always stacked at the top.
    shuffleArray(finalSelection);

    // 4. Generate HTML
    if (finalSelection.length === 0) {
        return `
            <li class="opacity-70">
                <div class="flex items-center gap-2 p-1.5 bg-gray-50 rounded border border-dashed border-gray-300">
                    <div class="flex-shrink-0 w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                        <i class="fa-regular fa-clock text-[10px]"></i>
                    </div>
                    <div>
                        <span class="block text-[11px] font-bold text-gray-600 leading-tight">More reviews coming</span>
                        <span class="block text-[9px] text-gray-400">Stay tuned</span>
                    </div>
                </div>
            </li>
        `;
    }

    return finalSelection.map(review => `
        <li>
            <a href="${review.url}" class="group flex items-center gap-2 p-1 rounded hover:bg-gray-50 transition-colors">
                <div class="flex-shrink-0 w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-accent-main group-hover:bg-accent-main group-hover:text-white transition-colors">
                    <i class="fa-solid fa-star text-[9px]"></i>
                </div>
                <div class="min-w-0">
                    <span class="block text-[11px] font-bold text-gray-800 group-hover:text-accent-main leading-none transition-colors truncate">${review.title}</span>
                    <span class="block text-[9px] text-gray-400 leading-none mt-0.5">${review.date} • ${review.category}</span>
                </div>
            </a>
        </li>
    `).join('');
}

/**
 * ------------------------------------------------------------------------
 * 3. GLOBAL AD MANAGER
 * ------------------------------------------------------------------------
 * Centralized logic to inject ads into specific placeholders (e.g. #app-ad-space)
 */
function initAdManager() {
    const adContainer = document.getElementById("app-ad-space");
    
    // Only try to insert ads if the container exists on the current page
    if (adContainer) {
        // PASTE YOUR ADSENSE/AD CODE INSIDE THE BACKTICKS ` ` BELOW
        const adCode = `
            <!-- Place your AdSense or Ad Network code here in the future -->
        `;
        
        adContainer.innerHTML = adCode;
    }
}
