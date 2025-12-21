/**
 * Toolblaster Global Components (Header, Footer, Modals)
 * Handles injection of shared UI elements to ensure consistency across pages.
 * * * DESIGN RULES:
 * - Do NOT hardcode colors or font sizes.
 * - Use global classes from 'js/tailwind-config.js':
 * - Text: text-article-p (13px)
 * - Headings: text-heading-1 (40px), text-heading-2 (24px), text-heading-3 (16px)
 * - Do NOT use H4, H5, H6.
 * * * CLS PREVENTION (MANDATORY):
 * To prevent layout shifts (CLS) as this JS loads, ALL pages must reserve space in HTML:
 * 1. Header Container: <div id="app-header" class="min-h-[56px] w-full relative z-20"></div>
 * 2. Footer Container: <div id="app-footer" class="min-h-[80px]"></div>
 */

document.addEventListener('DOMContentLoaded', () => {
    injectHeader();
    injectFooterAndModals();
});

/**
 * Injects the Navigation Bar into the #app-header element.
 * Includes the Mobile Menu logic.
 */
function injectHeader() {
    const headerContainer = document.getElementById('app-header');
    if (!headerContainer) return;

    // Determine current path for active state (simple logic)
    const path = window.location.pathname;
    
    // Logic to handle root relative paths
    // If we are in a subfolder (e.g. /articles/), we need to go up one level for assets if not using absolute paths.
    // For simplicity, we assume root relative paths works (requires a local server).
    const rootPath = path.includes('/articles/') || path.includes('/reviews/') ? '../' : './';

    // UPDATED: Used Clean URLs (removed index.html) where possible
    const headerHTML = `
        <nav class="relative z-20 border-b border-white/5 bg-[#0f1115]/50 backdrop-blur-sm w-full">
            <div class="container mx-auto max-w-site px-4 sm:px-6 py-3 flex justify-between items-center h-full">
                <!-- Brand / Logo - UPDATED: Point to root '/' for canonical consistency -->
                <a href="/" class="flex items-center gap-2 group">
                    <i class="fa-solid fa-bolt text-accent-main text-lg group-hover:text-white transition-colors"></i>
                    <span class="text-white font-bold text-lg tracking-tight">Toolblaster</span>
                </a>

                <!-- Desktop Menu Links -->
                <div class="hidden md:flex gap-8 text-sm font-medium text-gray-300">
                    <a href="/#projects" class="hover:text-white transition-colors">Tools</a>
                    <a href="/articles/" class="hover:text-white transition-colors">Articles</a>
                    <a href="/reviews/" class="hover:text-white transition-colors">Reviews</a>
                </div>

                <!-- Mobile Menu Button -->
                <button id="mobile-menu-btn" class="md:hidden text-gray-300 hover:text-white focus:outline-none p-2">
                    <i class="fa-solid fa-bars text-xl"></i>
                </button>
            </div>

            <!-- Mobile Menu Dropdown (Hidden by default) -->
            <div id="mobile-menu" class="hidden md:hidden bg-[#161b22] border-t border-white/10 absolute w-full left-0 top-full shadow-xl z-30">
                <div class="flex flex-col p-4 gap-4 text-sm text-gray-300 font-medium">
                    <a href="/#projects" class="hover:text-white mobile-link">Tools</a>
                    <a href="/articles/" class="hover:text-white mobile-link">Articles</a>
                    <a href="/reviews/" class="hover:text-white mobile-link">Reviews</a>
                </div>
            </div>
        </nav>
    `;

    headerContainer.innerHTML = headerHTML;

    // Re-attach Event Listeners for Mobile Menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

/**
 * Injects the Footer and shared Modals into the #app-footer element.
 */
function injectFooterAndModals() {
    const footerContainer = document.getElementById('app-footer');
    if (!footerContainer) return;

    const footerHTML = `
        <footer class="bg-gray-800 text-gray-400 text-center py-6 px-4 mt-8 rounded-t-[2.5rem]">
            <div class="container mx-auto max-w-site flex flex-col sm:flex-row justify-between items-center">
                <p class="text-article-p mb-2 sm:mb-0">&copy; 2025 Toolblaster.com by Vikas Rana. All Rights Reserved.</p>
                <nav class="flex gap-4">
                    <a id="contact-link" class="text-article-p hover:text-white transition duration-200 cursor-pointer">Contact Us</a>
                </nav>
            </div>
        </footer>

        <!-- Shared Modals (Contact) -->
        <div id="page-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 hidden">
            <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col relative animate-fade-in">
                <!-- Modal Header -->
                <div class="flex justify-between items-center p-4 border-b border-gray-300">
                    <h3 id="modal-title" class="text-heading-3 font-bold text-gray-800"></h3>
                    <button id="modal-close-btn" class="text-accent-main hover:text-accent-dark transition duration-200 p-1">
                        <i class="fa-solid fa-xmark text-2xl"></i>
                    </button>
                </div>
                
                <!-- Modal Content -->
                <div class="p-6 overflow-y-auto space-y-4 text-article-p text-gray-700">
                    <!-- Contact Content -->
                    <div id="contact-content" class="modal-page hidden">
                        <h3 class="text-heading-3 font-semibold mb-2 text-gray-900">Contact Us</h3>
                        <p class="mb-2">Have a question? We'd love to hear from you.</p>
                        <p>Email: <strong class="text-accent-main">hello@toolblaster.com</strong></p>
                    </div>
                </div>
            </div>
        </div>
    `;

    footerContainer.innerHTML = footerHTML;

    // Initialize Modal Logic after injection
    initModals();
}

function initModals() {
    const modal = document.getElementById('page-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const allModalPages = document.querySelectorAll('.modal-page');

    const openModal = (type) => {
        if (!modal) return;
        
        // Hide all contents
        allModalPages.forEach(p => p.classList.add('hidden'));
        
        // Setup content based on type
        let contentId = '';
        let title = '';

        if (type === 'contact') { contentId = 'contact-content'; title = 'Contact Us'; }

        const contentEl = document.getElementById(contentId);
        if (contentEl) {
            contentEl.classList.remove('hidden');
            modalTitle.textContent = title;
            modal.classList.remove('hidden');
        }
    };

    const closeModal = () => {
        if (modal) modal.classList.add('hidden');
    };

    // Attach listeners to Footer Links
    document.getElementById('contact-link')?.addEventListener('click', () => openModal('contact'));

    // Close buttons
    modalCloseBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}
