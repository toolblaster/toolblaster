/**
 * Toolblaster Global Components (Header, Sidebar, Footer, Modals, Ads, Back to Top, Share Widget)
 * Handles injection of shared UI elements to ensure consistency across pages.
 */

document.addEventListener('DOMContentLoaded', () => {
    injectHeader();
    injectAdSpace(); 
    injectSidebar();
    injectMobileTOC(); 
    injectShareWidget(); 
    injectFooterAndModals();
    injectBackToTop();
});

/**
 * Injects the Navigation Bar into the #app-header element.
 */
function injectHeader() {
    const headerContainer = document.getElementById('app-header');
    if (!headerContainer) return;

    const path = window.location.pathname;
    const rootPath = path.includes('/blog/') || path.includes('/reviews/') ? '../' : './';

    // NOTE: The overlay and drawer are placed OUTSIDE the <nav> tag.
    // This is crucial because 'backdrop-blur' on <nav> creates a containing block
    // that traps 'fixed' elements, preventing them from covering the full screen.
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
                    <a href="/" class="hover:text-white transition-colors">Home</a>
                    <a href="/#projects" class="hover:text-white transition-colors">Tools</a>
                    <a href="/blog/" class="hover:text-white transition-colors">Blog</a>
                    <a href="/reviews/" class="hover:text-white transition-colors">Reviews</a>
                </div>

                <!-- Mobile Menu Button -->
                <button id="mobile-menu-btn" class="md:hidden text-gray-300 hover:text-white focus:outline-none p-2 relative z-30" aria-label="Open Menu">
                    <i class="fa-solid fa-bars text-xl"></i>
                </button>
            </div>
        </nav>

        <!-- Mobile Menu Overlay (Backdrop) - MOVED OUTSIDE NAV -->
        <div id="mobile-menu-overlay" class="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm opacity-0 invisible transition-all duration-300 md:hidden" aria-hidden="true"></div>

        <!-- Mobile Menu Drawer (Slide-in) - MOVED OUTSIDE NAV -->
        <div id="mobile-menu-drawer" class="fixed top-0 right-0 z-[100] w-[75%] max-w-[300px] h-full bg-[#161b22] border-l border-white/10 shadow-2xl transform translate-x-full transition-transform duration-300 ease-in-out md:hidden flex flex-col">
            
            <!-- Drawer Header -->
            <div class="flex justify-between items-center p-5 border-b border-white/5">
                <span class="text-white font-bold text-lg tracking-tight flex items-center gap-2">
                    <i class="fa-solid fa-bolt text-accent-main"></i> Toolblaster
                </span>
                <button id="mobile-menu-close" class="text-gray-400 hover:text-white transition-colors focus:outline-none p-1" aria-label="Close Menu">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>
            
            <!-- Drawer Links -->
            <div class="flex flex-col p-5 gap-4 text-sm text-gray-300 font-medium overflow-y-auto">
                <a href="/" class="flex items-center gap-3 hover:text-white transition-colors p-3 rounded-lg hover:bg-white/5 mobile-link">
                    <i class="fa-solid fa-house w-5 text-center text-accent-main"></i> 
                    <span>Home</span>
                </a>
                <a href="/#projects" class="flex items-center gap-3 hover:text-white transition-colors p-3 rounded-lg hover:bg-white/5 mobile-link">
                    <i class="fa-solid fa-toolbox w-5 text-center text-accent-main"></i> 
                    <span>Tools</span>
                </a>
                <a href="/blog/" class="flex items-center gap-3 hover:text-white transition-colors p-3 rounded-lg hover:bg-white/5 mobile-link">
                    <i class="fa-solid fa-newspaper w-5 text-center text-accent-main"></i> 
                    <span>Blog</span>
                </a>
                <a href="/reviews/" class="flex items-center gap-3 hover:text-white transition-colors p-3 rounded-lg hover:bg-white/5 mobile-link">
                    <i class="fa-solid fa-star w-5 text-center text-accent-main"></i> 
                    <span>Reviews</span>
                </a>
            </div>
            
            <!-- Drawer Footer -->
            <div class="mt-auto p-6 border-t border-white/5">
                <p class="text-xs text-gray-500 text-center mb-2">Designed for performance.</p>
                <p class="text-xs text-gray-600 text-center">&copy; 2026 Toolblaster</p>
            </div>
        </div>
    `;

    headerContainer.innerHTML = headerHTML;

    // Mobile Menu Logic
    const openBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('mobile-menu-close');
    const overlay = document.getElementById('mobile-menu-overlay');
    const drawer = document.getElementById('mobile-menu-drawer');
    const links = document.querySelectorAll('.mobile-link');

    function toggleMenu(show) {
        if (show) {
            overlay.classList.remove('opacity-0', 'invisible');
            overlay.classList.add('opacity-100', 'visible');
            drawer.classList.remove('translate-x-full');
            drawer.classList.add('translate-x-0');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        } else {
            overlay.classList.remove('opacity-100', 'visible');
            overlay.classList.add('opacity-0', 'invisible');
            drawer.classList.remove('translate-x-0');
            drawer.classList.add('translate-x-full');
            document.body.style.overflow = ''; // Restore background scrolling
        }
    }

    if (openBtn) openBtn.addEventListener('click', () => toggleMenu(true));
    if (closeBtn) closeBtn.addEventListener('click', () => toggleMenu(false));
    if (overlay) overlay.addEventListener('click', () => toggleMenu(false));
    
    // Close menu when a link is clicked
    links.forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });
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

    // 1. Popular Tools Widget (Static Top - Not Sticky)
    const toolsWidgetHTML = `
        <div class="card-section !p-3 !mb-0 shadow-sm border-gray-300 bg-gray-50/50">
            <h3 class="text-[14px] font-extrabold text-gray-900 mb-3 uppercase tracking-widest border-b border-gray-200 pb-2">
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
                <div id="review-index-wrapper" class="sticky top-24 self-start card-section !p-3 shadow-md border-gray-300 flex flex-col max-h-[calc(100vh-120px)] transition-all duration-300">
                    <h3 class="text-[14px] font-extrabold text-gray-900 mb-3 uppercase tracking-widest border-b border-gray-200 pb-2 flex-shrink-0">
                        <i class="fa-solid fa-list-ul text-accent-main mr-1.5"></i> Review Index
                    </h3>
                    
                    <!-- Internal Scrollable Area for the Index -->
                    <div id="review-index-scroll-container" class="overflow-y-auto pr-1 flex-grow scrollbar-thin scrollbar-thumb-gray-200">
                        <ul class="space-y-2" id="review-index-list">
                            ${Array.from(headings).map((h, i) => {
                                if (!h.id) h.id = `section-${i}`;
                                const num = (i + 1).toString().padStart(2, '0');
                                return `
                                <li class="group">
                                    <a href="#${h.id}" class="toc-link flex items-center justify-between p-1 rounded hover:bg-gray-50 transition-colors" data-target="${h.id}">
                                        <span class="toc-text text-[11px] font-semibold text-gray-600 group-hover:text-accent-main transition-colors line-clamp-1 pr-2">${h.innerText}</span>
                                        <span class="toc-badge flex-shrink-0 w-6 h-4 flex items-center justify-center bg-gray-100 text-[9px] font-black text-gray-400 rounded group-hover:bg-accent-main group-hover:text-white transition-all">${num}</span>
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

    // Combine Widgets with h-full on the wrapper to ensure sticky behavior works
    sidebarContainer.innerHTML = `
        <div class="flex flex-col gap-5 h-full"> 
            ${toolsWidgetHTML}
            ${indexWidgetHTML}
        </div>
    `;

    // Initialize the active highlighting logic
    if (article) {
        initScrollSpy();
    }
}

/**
 * Injects a Mobile-Only Table of Contents at the top of the article.
 * This is hidden on Desktop (lg:hidden) and visible on Mobile.
 */
function injectMobileTOC() {
    const article = document.querySelector('article');
    // Ensure we have an article and haven't already injected the TOC
    if (!article || document.getElementById('mobile-toc-widget')) return;

    const headings = article.querySelectorAll('h2');
    if (headings.length === 0) return;

    const mobileTocHTML = `
        <div id="mobile-toc-widget" class="lg:hidden mb-6">
            <details class="bg-gray-50 border-2 border-gray-200 rounded-lg shadow-sm group">
                <summary class="list-none flex items-center justify-between p-3 cursor-pointer select-none">
                    <div class="flex items-center gap-2 text-[13px] font-extrabold text-gray-900 uppercase tracking-widest">
                        <i class="fa-solid fa-list-ul text-accent-main"></i>
                        <span>Review Index</span>
                    </div>
                    <span class="transition-transform duration-300 group-open:rotate-180 text-gray-500 text-xs bg-white w-6 h-6 rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
                        <i class="fa-solid fa-chevron-down"></i>
                    </span>
                </summary>
                <nav class="p-3 border-t border-gray-200 bg-white rounded-b-lg">
                    <ul class="space-y-3">
                        ${Array.from(headings).map((h, i) => {
                            // Ensure ID exists (sidebar might have set it, or not yet)
                            if (!h.id) h.id = `section-${i}`;
                            const num = (i + 1).toString().padStart(2, '0');
                            return `
                            <li>
                                <a href="#${h.id}" class="flex items-start gap-3 text-article-p text-gray-700 hover:text-accent-main transition-colors" onclick="document.getElementById('mobile-toc-widget').querySelector('details').removeAttribute('open')">
                                    <span class="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-gray-100 text-[10px] font-black text-gray-500 rounded mt-0.5 border border-gray-200">${num}</span>
                                    <span class="leading-tight font-medium">${h.innerText}</span>
                                </a>
                            </li>`;
                        }).join('')}
                    </ul>
                </nav>
            </details>
        </div>
    `;

    // Insert as the very first element inside the article tag
    article.insertAdjacentHTML('afterbegin', mobileTocHTML);
}

/**
 * Injects a small, compact share widget into the Author block in the header.
 * Restructures the author block to use flex justify-between.
 */
function injectShareWidget() {
    // Target the author block by its unique structure class combination in the header
    const authorBlock = document.querySelector('header .flex.border-t.border-b');
    
    // Safety check: if block doesn't exist or we already injected (check for our widget class), exit
    if (!authorBlock || authorBlock.querySelector('.share-widget')) return;

    // 1. Create a wrapper for the existing author content (Avatar + Text)
    // This ensures they stay grouped on the left when we switch parent to justify-between
    const leftWrapper = document.createElement('div');
    leftWrapper.className = 'flex items-center space-x-3 mb-2 sm:mb-0'; // Added margin-bottom for mobile wrapping

    // Move existing children into the new left wrapper
    while (authorBlock.firstChild) {
        leftWrapper.appendChild(authorBlock.firstChild);
    }
    authorBlock.appendChild(leftWrapper);

    // 2. Adjust parent container classes
    // Remove centering/start alignment, add space-between alignment and wrapping for mobile
    authorBlock.classList.remove('justify-center', 'sm:justify-start', 'space-x-3');
    authorBlock.classList.add('justify-between', 'flex-wrap', 'gap-y-2'); // Added wrap and gap

    // 3. Create the Share Widget
    // USE CANONICAL URL Logic: 
    // Checks for <link rel="canonical"> first. If not found, uses window.location.href splitting query params.
    const canonical = document.querySelector('link[rel="canonical"]');
    const pageUrl = canonical ? canonical.href : window.location.href.split('?')[0];
    const pageTitle = document.title;
    
    // Copy to Clipboard logic using legacy execCommand for iframe compatibility
    window.copyToClipboard = function(btn) {
        const textArea = document.createElement("textarea");
        textArea.value = pageUrl;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            const icon = btn.querySelector('i');
            const originalClass = icon.className;
            // Added text-[14px] text-green-600 to maintain size and show success color
            icon.className = 'fa-solid fa-check text-[14px] text-green-600';
            setTimeout(() => {
                icon.className = originalClass;
            }, 2000);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textArea);
    };

    const shareWidget = document.createElement('div');
    // Using gap-1.5 for mobile compactness, gap-2 for desktop
    shareWidget.className = 'share-widget flex items-center gap-2'; // Slightly increased gap for touch targets
    
    // Social Media Items Configuration
    const shareItems = [
        { icon: 'fa-brands fa-whatsapp', color: 'hover:bg-[#25D366]', url: `https://api.whatsapp.com/send?text=${encodeURIComponent(pageTitle + ' ' + pageUrl)}`, label: 'WhatsApp' },
        { icon: 'fa-brands fa-facebook-f', color: 'hover:bg-[#1877F2]', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, label: 'Facebook' },
        { icon: 'fa-brands fa-telegram', color: 'hover:bg-[#0088cc]', url: `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(pageTitle)}`, label: 'Telegram' },
        { icon: 'fa-brands fa-linkedin-in', color: 'hover:bg-[#0077b5]', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`, label: 'LinkedIn' }
    ];

    // Generate Buttons HTML
    // Mobile: w-8 h-8 (32px) for better touch/visibility, Icon size bumped to text-[14px]
    let buttonsHTML = shareItems.map(item => `
        <a href="${item.url}" 
           target="_blank" rel="noopener noreferrer" 
           class="w-8 h-8 rounded-full bg-gray-100 ${item.color} hover:text-white text-gray-700 transition-all flex items-center justify-center shadow-sm" 
           aria-label="Share on ${item.label}">
            <i class="${item.icon} text-[14px]"></i>
        </a>
    `).join('');

    // Add Copy Link Button
    buttonsHTML += `
        <button onclick="window.copyToClipboard(this)" 
           class="w-8 h-8 rounded-full bg-gray-100 hover:bg-accent-main hover:text-white text-gray-700 transition-all flex items-center justify-center shadow-sm" 
           aria-label="Copy Link">
            <i class="fa-solid fa-link text-[14px]"></i>
        </button>
    `;

    shareWidget.innerHTML = `
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden md:block mr-1">Share</span>
        ${buttonsHTML}
    `;

    authorBlock.appendChild(shareWidget);
}

/**
 * Initializes ScrollSpy logic to highlight sidebar items based on scroll position.
 */
function initScrollSpy() {
    const links = document.querySelectorAll('.toc-link');
    const sections = Array.from(links).map(link => document.getElementById(link.dataset.target));
    const scrollContainer = document.getElementById('review-index-scroll-container');

    if (links.length === 0 || sections.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: '-100px 0px -60% 0px', // Activate when section is near top
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active class from all
                links.forEach(l => {
                    l.classList.remove('bg-gray-100');
                    const text = l.querySelector('.toc-text');
                    const badge = l.querySelector('.toc-badge');
                    
                    if(text) text.classList.remove('text-accent-main');
                    if(badge) {
                        badge.classList.remove('bg-accent-main', 'text-white');
                        badge.classList.add('bg-gray-100', 'text-gray-400');
                    }
                });

                // Add active class to current
                const activeLink = document.querySelector(`.toc-link[data-target="${entry.target.id}"]`);
                if (activeLink) {
                    activeLink.classList.add('bg-gray-100');
                    const text = activeLink.querySelector('.toc-text');
                    const badge = activeLink.querySelector('.toc-badge');

                    if(text) text.classList.add('text-accent-main');
                    if(badge) {
                        badge.classList.remove('bg-gray-100', 'text-gray-400');
                        badge.classList.add('bg-accent-main', 'text-white');
                    }
                    
                    // Auto-scroll the sidebar internal list to keep active item in view
                    if (scrollContainer) {
                        const activeRect = activeLink.getBoundingClientRect();
                        const containerRect = scrollContainer.getBoundingClientRect();

                        // Scroll up if item is above container view
                        if (activeRect.top < containerRect.top) {
                            scrollContainer.scrollTop -= (containerRect.top - activeRect.top + 10);
                        } 
                        // Scroll down if item is below container view
                        else if (activeRect.bottom > containerRect.bottom) {
                            scrollContainer.scrollTop += (activeRect.bottom - containerRect.bottom + 10);
                        }
                    }
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        if(section) observer.observe(section);
    });
}

/**
 * Injects the Footer and shared Modals into the #app-footer element.
 */
function injectFooterAndModals() {
    const footerContainer = document.getElementById('app-footer');
    if (!footerContainer) return;

    const footerHTML = `
        <footer class="bg-gray-800 text-gray-400 text-center py-6 px-4 mt-8 rounded-t-[2.5rem]">
            <div class="container mx-auto max-w-site flex flex-col md:flex-row justify-between items-center gap-4">
                <p class="text-article-p">&copy; 2026 Toolblaster.com. All Rights Reserved.</p>
                <nav class="flex flex-wrap justify-center gap-4 text-article-p">
                    <a href="/terms/about.html" class="hover:text-white transition duration-200">About</a>
                    <a href="/terms/privacy.html" class="hover:text-white transition duration-200">Privacy</a>
                    <a href="/terms/terms.html" class="hover:text-white transition duration-200">Terms</a>
                </nav>
            </div>
        </footer>
    `;

    footerContainer.innerHTML = footerHTML;
    
    // Legacy modal logic (removed call to initModals as we now use pages)
}

/**
 * Injects a global 'Back to Top' button.
 */
function injectBackToTop() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'back-to-top';
    backToTopBtn.className = 'fixed bottom-8 right-8 w-12 h-12 bg-accent-main text-white rounded-full shadow-lg z-50 hover:bg-accent-dark hover:scale-110 transition-all duration-300 opacity-0 invisible translate-y-4 flex items-center justify-center';
    backToTopBtn.setAttribute('aria-label', 'Back to Top');
    backToTopBtn.innerHTML = '<i class="fa-solid fa-arrow-up text-lg"></i>';

    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.remove('opacity-0', 'invisible', 'translate-y-4');
            backToTopBtn.classList.add('opacity-100', 'visible', 'translate-y-0');
        } else {
            backToTopBtn.classList.remove('opacity-100', 'visible', 'translate-y-0');
            backToTopBtn.classList.add('opacity-0', 'invisible', 'translate-y-4');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
