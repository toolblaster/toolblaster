/**
 * Toolblaster Secondary Global Script
 * Handles non-critical UI interactions: Image Modals, Sidebar Widgets (Reviews/Tools), and general utility styles.
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
 * 2. SIDEBAR WIDGETS (POPULAR TOOLS & OTHER REVIEWS)
 * ------------------------------------------------------------------------
 * Centralized logic to inject these widgets into #app-sidebar > .flex-col
 */

// CENTRALIZED REVIEW DATA (Moved from header-footer.js for better consolidation)
// Add new reviews to the TOP of this array.
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
    },
];

function injectSidebarWidgets() {
    const sidebarContainer = document.getElementById('app-sidebar');
    // We look for the inner flex container created by header-footer.js
    // If it doesn't exist yet, we can't inject.
    if (!sidebarContainer) return;
    
    let flexWrapper = sidebarContainer.querySelector('.flex.flex-col');
    
    // Safety check: If header-footer.js hasn't run yet, wait.
    if (!flexWrapper) return;

    // Check if widgets already exist to prevent duplicate injection
    if (document.getElementById('widget-popular-tools')) return;

    // 1. Popular Tools Widget HTML
    const toolsWidgetHTML = `
        <div id="widget-popular-tools" class="card-section !p-2.5 !mb-0 shadow-sm border-gray-300 bg-gray-50/50 w-full max-w-full order-1">
            <h3 class="text-[11px] font-extrabold text-gray-900 mb-2 uppercase tracking-widest border-b border-gray-200 pb-1.5">
                <i class="fa-solid fa-fire text-accent-main mr-1.5"></i> Popular Tools
            </h3>
            <ul class="space-y-1">
                <li>
                    <a href="https://bestseotools.toolblaster.com" class="group flex items-center gap-2 p-1.5 rounded hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
                        <div class="flex-shrink-0 w-7 h-7 rounded bg-white border border-gray-200 flex items-center justify-center text-accent-main group-hover:bg-accent-main group-hover:text-white group-hover:border-accent-main transition-colors">
                            <i class="fa-solid fa-magnifying-glass-chart text-[10px]"></i>
                        </div>
                        <div>
                            <span class="block text-[11px] font-bold text-gray-800 group-hover:text-accent-main leading-tight transition-colors">SEO Tools Guide</span>
                            <span class="block text-[9px] text-gray-500 leading-none mt-0.5">Performance Comparison</span>
                        </div>
                    </a>
                </li>
                <li>
                    <a href="https://sipcalculatorwithinflation.toolblaster.com" class="group flex items-center gap-2 p-1.5 rounded hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
                        <div class="flex-shrink-0 w-7 h-7 rounded bg-white border border-gray-200 flex items-center justify-center text-accent-main group-hover:bg-accent-main group-hover:text-white group-hover:border-accent-main transition-colors">
                            <i class="fa-solid fa-calculator text-[10px]"></i>
                        </div>
                        <div>
                            <span class="block text-[11px] font-bold text-gray-800 group-hover:text-accent-main leading-tight transition-colors">SIP Calculator</span>
                            <span class="block text-[9px] text-gray-500 leading-none mt-0.5">Inflation Adjusted</span>
                        </div>
                    </a>
                </li>
            </ul>
        </div>
    `;

    // 2. Related Reviews Widget HTML
    const reviewsListHTML = getReviewListHTMLGlobal();
    const reviewsWidgetHTML = `
        <div id="widget-related-reviews" class="card-section !p-2.5 !mb-0 shadow-sm border-gray-300 bg-white w-full max-w-full order-2">
            <h3 class="text-[11px] font-extrabold text-gray-900 mb-2 uppercase tracking-widest border-b border-gray-200 pb-1.5">
                <i class="fa-solid fa-book-open text-accent-main mr-1.5"></i> Other Reviews
            </h3>
            <ul class="space-y-1">
                ${reviewsListHTML}
            </ul>
        </div>
    `;

    // Insert to the TOP of the flex wrapper
    flexWrapper.insertAdjacentHTML('afterbegin', toolsWidgetHTML + reviewsWidgetHTML);
}

/**
 * Helper to generate the reviews list HTML
 */
function getReviewListHTMLGlobal() {
    const currentPath = window.location.pathname;
    
    // Dynamic Logic: Filter out current page, take top 5
    const displayReviews = recentReviewsGlobal.filter(r => !currentPath.includes(r.url)).slice(0, 5);
    
    if (displayReviews.length === 0) {
        return `
            <li class="opacity-70">
                <div class="flex items-center gap-2 p-1.5 bg-gray-50 rounded border border-dashed border-gray-300">
                    <div class="flex-shrink-0 w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                        <i class="fa-regular fa-clock text-[10px]"></i>
                    </div>
                    <div>
                        <span class="block text-[11px] font-bold text-gray-600 leading-tight">Reviews coming soon</span>
                        <span class="block text-[9px] text-gray-400">Stay tuned</span>
                    </div>
                </div>
            </li>
        `;
    }

    return displayReviews.map(review => `
        <li>
            <a href="${review.url}" class="group flex items-start gap-2 p-1.5 rounded hover:bg-gray-50 transition-colors">
                <div class="flex-shrink-0 w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-accent-main group-hover:bg-accent-main group-hover:text-white transition-colors">
                    <i class="fa-solid fa-star text-[9px]"></i>
                </div>
                <div class="min-w-0">
                    <span class="block text-[11px] font-bold text-gray-800 group-hover:text-accent-main leading-tight transition-colors truncate">${review.title}</span>
                    <span class="block text-[9px] text-gray-400 leading-none mt-0.5">${review.date} • ${review.category}</span>
                </div>
            </a>
        </li>
    `).join('');
}
