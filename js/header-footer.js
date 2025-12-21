/**
 * Toolblaster Global Components (Header, Sidebar, Footer, Modals, Ads)
 * Handles injection of shared UI elements to ensure consistency across pages.
 * * DESIGN RULES:
 * - Do NOT hardcode colors or font sizes.
 * - Use global classes from 'js/tailwind-config.js'.
 * * * CLS PREVENTION (MANDATORY):
 * To prevent layout shifts (CLS), ALL pages must reserve space in HTML:
 * 1. Header: <div id="app-header" class="min-h-[56px] w-full relative z-20 bg-[#0f1115]"></div>
 * 2. Ad Space (Optional): <div id="app-ad-space" class="min-h-[100px] mb-8"></div>
 * 3. Sidebar (Optional): <aside id="app-sidebar" class="w-full lg:w-[20%] hidden lg:block"></aside>
 * 4. Footer: <div id="app-footer" class="min-h-[80px]"></div>
 */

document.addEventListener('DOMContentLoaded', () => {
    injectHeader();
    injectAdSpace(); // New Global Ad Space Logic
    injectSidebar();
    injectFooterAndModals();
});

/**
 * Injects the Navigation Bar into the #app-header element.
 */
function injectHeader() {
    const headerContainer = document.getElementById('app-header');
    if (!headerContainer) return;

    // Determine current path for active state (simple logic)
    const path = window.location.pathname;
    const rootPath = path.includes('/blog/') || path.includes('/reviews/') ? '../' : './';

    const headerHTML = `
        <nav class="relative z-20 border-b border-white/5 bg-[#0f1115]/50 backdrop-blur-sm w-full">
            <div class="container mx-auto max-w-site px-4 sm:px-6 py-3 flex justify-between items-center h-full">
                <!-- Brand / Logo -->
                <a href="/" class="flex items-center gap-2 group">
                    <i class="fa-solid fa-bolt text-accent-main text-lg group-hover:text-white transition-colors"></i>
                    <span class="text-white font-bold text-lg tracking-tight">Toolblaster</span>
                </a>

                <!-- Desktop Menu Links -->
                <div class="hidden md:flex gap-8 text-sm font-medium text-gray-300">
                    <a href="/#projects" class="hover:text-white transition-colors">Tools</a>
                    <a href="/blog/" class="hover:text-white transition-colors">Blog</a>
                    <a href="/reviews/" class="hover:text-white transition-colors">Reviews</a>
                </div>

                <!-- Mobile Menu Button -->
                <button id="mobile-menu-btn" class="md:hidden text-gray-300 hover:text-white focus:outline-none p-2">
                    <i class="fa-solid fa-bars text-xl"></i>
                </button>
            </div>

            <!-- Mobile Menu Dropdown -->
            <div id="mobile-menu" class="hidden md:hidden bg-[#161b22] border-t border-white/10 absolute w-full left-0 top-full shadow-xl z-30">
                <div class="flex flex-col p-4 gap-4 text-sm text-gray-300 font-medium">
                    <a href="/#projects" class="hover:text-white mobile-link">Tools</a>
                    <a href="/blog/" class="hover:text-white mobile-link">Blog</a>
                    <a href="/reviews/" class="hover:text-white mobile-link">Reviews</a>
                </div>
            </div>
        </nav>
    `;

    headerContainer.innerHTML = headerHTML;

    // Mobile Menu Logic
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

/**
 * Injects the Global Ad Space content into #app-ad-space.
 * Ensures consistent styling for the placeholder across all pages.
 */
function injectAdSpace() {
    const adContainer = document.getElementById('app-ad-space');
    if (!adContainer) return;

    // Standard Ad Placeholder Styling - UPDATED: Removed text
    const adHTML = `
        <div class="w-full h-full bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center">
            <!-- Ad Space Text Removed -->
        </div>
    `;

    adContainer.innerHTML = adHTML;
}

/**
 * Injects the Sidebar Content into #app-sidebar.
 * Automatically generates a Table of Contents from <article> <h2> tags.
 */
function injectSidebar() {
    const sidebarContainer = document.getElementById('app-sidebar');
    if (!sidebarContainer) return;

    // 1. Auto-Generate Table of Contents (TOC)
    const article = document.querySelector('article');
    let tocHTML = '';

    if (article) {
        const headings = article.querySelectorAll('h2');
        if (headings.length > 0) {
            tocHTML = `
                <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h4 class="text-sm font-bold text-gray-900 mb-3 border-b pb-2">On This Page</h4>
                    <ul class="text-xs text-gray-600 space-y-2">
                        ${Array.from(headings).map((h, i) => {
                            // Ensure every heading has an ID for linking
                            if (!h.id) {
                                h.id = `section-${i}`;
                            }
                            return `<li><a href="#${h.id}" class="hover:text-accent-main transition-colors">${h.innerText}</a></li>`;
                        }).join('')}
                    </ul>
                </div>
            `;
        }
    }

    // 2. Global "Popular Tools" Widget
    const toolsWidgetHTML = `
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 class="text-sm font-bold text-gray-900 mb-3">Popular Tools</h4>
            <ul class="space-y-3">
                <li>
                    <a href="https://bestseotools.toolblaster.com" class="block group">
                        <span class="block text-xs font-semibold text-gray-800 group-hover:text-accent-main">SEO Tools Guide</span>
                        <span class="block text-[10px] text-gray-500">Compare Semrush vs Ahrefs</span>
                    </a>
                </li>
                <li>
                    <a href="https://sipcalculatorwithinflation.toolblaster.com" class="block group">
                        <span class="block text-xs font-semibold text-gray-800 group-hover:text-accent-main">SIP Calculator</span>
                        <span class="block text-[10px] text-gray-500">Plan your investments</span>
                    </a>
                </li>
            </ul>
        </div>
    `;

    // Inject Wrapper and Content
    sidebarContainer.innerHTML = `
        <div class="sticky top-24 space-y-8">
            ${tocHTML}
            ${toolsWidgetHTML}
        </div>
    `;
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
        allModalPages.forEach(p => p.classList.add('hidden'));
        
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

    document.getElementById('contact-link')?.addEventListener('click', () => openModal('contact'));
    modalCloseBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}
