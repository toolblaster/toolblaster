/**
 * Toolblaster Global Components (Header, Sidebar, Footer, Modals, Ads)
 * Handles injection of shared UI elements to ensure consistency across pages.
 */

document.addEventListener('DOMContentLoaded', () => {
    injectHeader();
    injectAdSpace(); 
    injectSidebar();
    injectFooterAndModals();
});

/**
 * Injects the Navigation Bar into the #app-header element.
 */
function injectHeader() {
    const headerContainer = document.getElementById('app-header');
    if (!headerContainer) return;

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
 */
function injectAdSpace() {
    const adContainer = document.getElementById('app-ad-space');
    if (!adContainer) return;

    const adHTML = `
        <div class="w-full h-full bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center">
        </div>
    `;

    adContainer.innerHTML = adHTML;
}

/**
 * Injects the Sidebar Content into #app-sidebar.
 * Features: Static Tools widget + Sticky Numbered Index/TOC with internal scrolling.
 */
function injectSidebar() {
    const sidebarContainer = document.getElementById('app-sidebar');
    if (!sidebarContainer) return;

    // 1. Popular Tools Widget (Static Top)
    const toolsWidgetHTML = `
        <div class="card-section !p-3 !mb-0 shadow-sm border-gray-300 bg-gray-50/50">
            <h3 class="text-[12px] font-black text-gray-900 mb-3 uppercase tracking-widest border-b border-gray-200 pb-2">
                <i class="fa-solid fa-fire text-accent-main mr-1.5"></i> Popular Tools
            </h3>
            <ul class="space-y-3">
                <li>
                    <a href="https://bestseotools.toolblaster.com" class="block group">
                        <span class="block text-[12px] font-bold text-gray-800 group-hover:text-accent-main transition-colors">SEO Tools Guide</span>
                        <span class="block text-[10px] text-gray-500 leading-tight">Compare top platform performance.</span>
                    </a>
                </li>
                <li>
                    <a href="https://sipcalculatorwithinflation.toolblaster.com" class="block group">
                        <span class="block text-[12px] font-bold text-gray-800 group-hover:text-accent-main transition-colors">SIP Calculator</span>
                        <span class="block text-[10px] text-gray-500 leading-tight">Inflation-adjusted wealth planning.</span>
                    </a>
                </li>
            </ul>
        </div>
    `;

    // 2. Generate Numbered Index (Sticky Bottom with Internal Scroll)
    const article = document.querySelector('article');
    let indexWidgetHTML = '';

    if (article) {
        const headings = article.querySelectorAll('h2');
        if (headings.length > 0) {
            indexWidgetHTML = `
                <div class="sticky top-20 card-section !p-3 shadow-md border-gray-300 flex flex-col max-h-[calc(100vh-120px)]">
                    <h3 class="text-[12px] font-black text-gray-900 mb-3 uppercase tracking-widest border-b border-gray-200 pb-2 flex-shrink-0">
                        <i class="fa-solid fa-list-ul text-accent-main mr-1.5"></i> Review Index
                    </h3>
                    
                    <!-- Internal Scrollable Area for the Index -->
                    <div class="overflow-y-auto pr-1 flex-grow scrollbar-thin scrollbar-thumb-gray-200">
                        <ul class="space-y-2">
                            ${Array.from(headings).map((h, i) => {
                                if (!h.id) h.id = `section-${i}`;
                                const num = (i + 1).toString().padStart(2, '0');
                                return `
                                <li class="group">
                                    <a href="#${h.id}" class="flex items-center justify-between">
                                        <span class="text-[11px] font-semibold text-gray-600 group-hover:text-accent-main transition-colors line-clamp-1 pr-2">${h.innerText}</span>
                                        <span class="flex-shrink-0 w-6 h-4 flex items-center justify-center bg-gray-100 text-[9px] font-black text-gray-400 rounded group-hover:bg-accent-main group-hover:text-white transition-all">${num}</span>
                                    </a>
                                </li>`;
                            }).join('')}
                        </ul>
                    </div>
                    
                    <div class="mt-4 pt-3 border-t border-gray-100 text-center flex-shrink-0">
                        <p class="text-[10px] text-gray-400 italic">Updating daily for 2026</p>
                    </div>
                </div>
            `;
        }
    }

    // Combine Widgets
    sidebarContainer.innerHTML = `
        <div class="flex flex-col gap-5">
            ${toolsWidgetHTML}
            ${indexWidgetHTML}
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
                <p class="text-article-p mb-2 sm:mb-0">&copy; 2026 Toolblaster.com by Vikas Rana. All Rights Reserved.</p>
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
