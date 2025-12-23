/**
 * Toolblaster Global Components (Header, Sidebar, Footer, Modals, Ads, Back to Top, Share Widget)
 * Handles injection of shared UI elements to ensure consistency across pages.
 */

// CENTRALIZED REVIEW DATA
// Logic: The widgets below will automatically display the first 5 items from this list.
// INSTRUCTION: Add new reviews to the BEGINNING (TOP) of this array.
const recentReviews = [
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

document.addEventListener('DOMContentLoaded', () => {
    injectHeader();
    injectAdSpace(); 
    injectSidebar();
    injectMobileTOC(); 
    injectShareWidget(); 
    injectFooterAndModals();
    injectBackToTop();
    injectMobileRelated(); 
});

/**
 * Injects the Navigation Bar into the #app-header element.
 */
function injectHeader() {
    const headerContainer = document.getElementById('app-header');
    if (!headerContainer) return;

    // FOUC (Flash of Unstyled Content) FIX:
    // 1. Added style="display: none;" to #mobile-menu-drawer. 
    //    This completely removes it from the layout tree on load, preventing ANY visual glitch/reflection.
    // 2. We remove this inline style via JS only when the menu is opened.

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

        <!-- Mobile Menu Overlay (Backdrop) -->
        <div id="mobile-menu-overlay" class="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm opacity-0 invisible transition-all duration-300 md:hidden" aria-hidden="true"></div>

        <!-- Mobile Menu Drawer (Slide-in) -->
        <!-- FIXED: Added style="display: none;" here. This prevents the reflection bug. -->
        <div id="mobile-menu-drawer" style="display: none;" class="fixed top-0 right-0 z-[100] w-[85%] max-w-[300px] h-full bg-[#161b22] border-l border-white/10 shadow-2xl transform translate-x-full invisible md:hidden flex flex-col">
            
            <!-- Drawer Header -->
            <div class="flex justify-between items-center p-5 border-b border-white/5">
                <span class="text-white font-bold text-xl tracking-tight flex items-center gap-3">
                    <i class="fa-solid fa-bolt text-accent-main"></i> Toolblaster
                </span>
                <button id="mobile-menu-close" class="text-gray-400 hover:text-white transition-colors focus:outline-none p-2" aria-label="Close Menu">
                    <i class="fa-solid fa-xmark text-2xl"></i>
                </button>
            </div>
            
            <!-- Drawer Links -->
            <div class="flex flex-col p-4 gap-2 text-lg text-gray-200 font-bold overflow-y-auto">
                <a href="/" class="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition-all mobile-link active:scale-[0.98]">
                    <i class="fa-solid fa-house w-6 text-center text-accent-main text-lg"></i> 
                    <span>Home</span>
                </a>
                <a href="/#projects" class="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition-all mobile-link active:scale-[0.98]">
                    <i class="fa-solid fa-toolbox w-6 text-center text-accent-main text-lg"></i> 
                    <span>Tools</span>
                </a>
                <a href="/blog/" class="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition-all mobile-link active:scale-[0.98]">
                    <i class="fa-solid fa-newspaper w-6 text-center text-accent-main text-lg"></i> 
                    <span>Blog</span>
                </a>
                <a href="/reviews/" class="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition-all mobile-link active:scale-[0.98]">
                    <i class="fa-solid fa-star w-6 text-center text-accent-main text-lg"></i> 
                    <span>Reviews</span>
                </a>
            </div>
            
            <!-- Drawer Footer -->
            <div class="mt-auto p-6 border-t border-white/5 bg-black/20">
                <p class="text-xs text-gray-400 text-center mb-2">Designed for performance.</p>
                <p class="text-xs text-gray-400 text-center">&copy; 2026 Toolblaster</p>
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
        if (!drawer) return;

        // DYNAMIC TRANSITION INJECTION
        // Add classes only when interacting.
        if (!drawer.classList.contains('transition-transform')) {
            drawer.classList.add('transition-transform', 'duration-300', 'ease-in-out');
        }

        if (show) {
            // CRITICAL FIX: Remove display: none to allow rendering
            drawer.style.display = '';

            // Double requestAnimationFrame ensures the 'display' change is registered
            // by the browser BEFORE we trigger the transform, preventing a jump.
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    overlay.classList.remove('opacity-0', 'invisible');
                    overlay.classList.add('opacity-100', 'visible');
                    
                    drawer.classList.remove('translate-x-full', 'invisible');
                    drawer.classList.add('translate-x-0');
                });
            });
            
            document.body.style.overflow = 'hidden'; 
        } else {
            overlay.classList.remove('opacity-100', 'visible');
            overlay.classList.add('opacity-0', 'invisible');
            
            drawer.classList.remove('translate-x-0');
            drawer.classList.add('translate-x-full');
            
            document.body.style.overflow = ''; 
        }
    }

    if (openBtn) openBtn.addEventListener('click', () => toggleMenu(true));
    if (closeBtn) closeBtn.addEventListener('click', () => toggleMenu(false));
    if (overlay) overlay.addEventListener('click', () => toggleMenu(false));
    
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
 * Generates the HTML for review list items dynamically.
 * LOGIC: Slices the top 5 items from recentReviews and excludes the current page.
 */
function getReviewListHTML(isMobile = false) {
    const currentPath = window.location.pathname;
    
    // Dynamic Logic:
    // 1. Filter: Remove the review that matches the current page URL.
    // 2. Slice: Take only the first 5 items.
    const displayReviews = recentReviews.filter(r => !currentPath.includes(r.url)).slice(0, 5);
    
    if (displayReviews.length === 0) {
        // Placeholder State if no other reviews exist
        return `
            <li class="opacity-70">
                <div class="flex items-center gap-3 p-2 bg-gray-50 rounded border border-dashed border-gray-300">
                    <div class="flex-shrink-0 w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                        <i class="fa-regular fa-clock"></i>
                    </div>
                    <div>
                        <span class="block text-[11px] font-bold text-gray-600 leading-tight">More reviews coming soon</span>
                        <span class="block text-[9px] text-gray-400">Stay tuned for updates</span>
                    </div>
                </div>
            </li>
        `;
    }

    // Dynamic HTML Generation
    return displayReviews.map(review => `
        <li>
            <a href="${review.url}" class="group flex items-start gap-3 p-2 rounded hover:bg-gray-50 transition-colors">
                <div class="flex-shrink-0 w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-accent-main group-hover:bg-accent-main group-hover:text-white transition-colors">
                    <i class="fa-solid fa-star text-[10px]"></i>
                </div>
                <div>
                    <span class="block text-[11px] font-bold text-gray-800 group-hover:text-accent-main leading-tight transition-colors line-clamp-2">${review.title}</span>
                    <span class="block text-[9px] text-gray-400 mt-0.5">${review.date} • ${review.category}</span>
                </div>
            </a>
        </li>
    `).join('');
}

/**
 * Injects the Sidebar Content into #app-sidebar.
 */
function injectSidebar() {
    const sidebarContainer = document.getElementById('app-sidebar');
    if (!sidebarContainer) return;

    // 1. Popular Tools Widget
    const toolsWidgetHTML = `
        <div class="card-section !p-3 !mb-0 shadow-sm border-gray-300 bg-gray-50/50 w-full max-w-full">
            <h3 class="text-[12px] font-extrabold text-gray-900 mb-3 uppercase tracking-widest border-b border-gray-200 pb-2">
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

    // 2. Related Reviews Widget (Sidebar Version)
    // Uses the dynamic getReviewListHTML() function
    // UPDATED: Changed Title from 'Latest Reviews' to 'Other Reviews'
    const reviewsWidgetHTML = `
        <div class="card-section !p-3 !mb-0 shadow-sm border-gray-300 bg-white w-full max-w-full">
            <h3 class="text-[12px] font-extrabold text-gray-900 mb-3 uppercase tracking-widest border-b border-gray-200 pb-2">
                <i class="fa-solid fa-book-open text-accent-main mr-1.5"></i> Other Reviews
            </h3>
            <ul class="space-y-2">
                ${getReviewListHTML(false)}
            </ul>
        </div>
    `;

    // 3. Table of Contents Widget
    // UPDATED: Added width constraint classes (w-full max-w-full) to wrapper
    // UPDATED: Changed width calculation logic to better constrain within sidebar
    const article = document.querySelector('article');
    let indexWidgetHTML = '';

    if (article) {
        const headings = article.querySelectorAll('h2');
        if (headings.length > 0) {
            indexWidgetHTML = `
                <div id="review-index-wrapper" class="sticky top-24 self-start card-section !p-3 shadow-md border-gray-300 flex flex-col max-h-[calc(100vh-120px)] transition-all duration-300 w-full max-w-full overflow-hidden">
                    <h3 class="text-[14px] font-extrabold text-gray-900 mb-3 uppercase tracking-widest border-b border-gray-200 pb-2 flex-shrink-0">
                        <i class="fa-solid fa-list-ul text-accent-main mr-1.5"></i> Review Index
                    </h3>
                    <div id="review-index-scroll-container" class="overflow-y-auto pr-1 flex-grow scrollbar-thin scrollbar-thumb-gray-200">
                        <ul class="space-y-2" id="review-index-list">
                            ${Array.from(headings).map((h, i) => {
                                if (!h.id) h.id = `section-${i}`;
                                const num = (i + 1).toString().padStart(2, '0');
                                return `
                                <li class="group">
                                    <a href="#${h.id}" class="toc-link flex items-center justify-between p-1 rounded hover:bg-gray-50 transition-colors" data-target="${h.id}">
                                        <span class="toc-text text-[11px] font-semibold text-gray-600 group-hover:text-accent-main transition-colors line-clamp-1 pr-2 truncate">${h.innerText}</span>
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

    sidebarContainer.innerHTML = `
        <div class="flex flex-col gap-5 h-full w-full"> 
            ${toolsWidgetHTML}
            ${reviewsWidgetHTML}
            ${indexWidgetHTML}
        </div>
    `;

    if (article) {
        initScrollSpy();
    }
}

/**
 * Injects Related Reviews at the end of the article on Mobile.
 * Uses a unique design to differentiate from the main content.
 */
function injectMobileRelated() {
    const articleContent = document.querySelector('article');
    // Only inject if on mobile (screen width check or CSS class check) AND article exists
    // We stick to CSS hiding logic for reliability on resize
    if (!articleContent) return;
    
    if (document.getElementById('mobile-related-widget')) return;

    // TARGET PARENT ELEMENT TO INSERT AFTER SIBLING CTA
    const parentContainer = articleContent.parentElement;

    // Uses the dynamic getReviewListHTML() function
    const mobileRelatedHTML = `
        <div id="mobile-related-widget" class="mt-10 pt-6 border-t-4 border-gray-100 lg:hidden">
            <h3 class="flex items-center gap-2 text-[14px] font-black text-gray-900 mb-4 uppercase tracking-tight">
                <span class="w-1 h-5 bg-accent-main rounded-r"></span>
                You might also like
            </h3>
            <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-3">
                <ul class="space-y-3">
                    ${getReviewListHTML(true)}
                </ul>
            </div>
        </div>
    `;

    // Append to the end of the parent container
    if (parentContainer) {
        parentContainer.insertAdjacentHTML('beforeend', mobileRelatedHTML);
    } else {
        // Fallback if no parent exists (edge case)
        articleContent.insertAdjacentHTML('afterend', mobileRelatedHTML);
    }
}

/**
 * Injects a Mobile-Only Table of Contents.
 */
function injectMobileTOC() {
    const article = document.querySelector('article');
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

    article.insertAdjacentHTML('afterbegin', mobileTocHTML);
}

/**
 * Injects a small, compact share widget into the Author block.
 * UPDATED: Uses querySelectorAll to find ALL share-widget containers and injects into them.
 */
function injectShareWidget() {
    // New Logic: Find ANY container with class .share-widget, not just authorBlock injection
    // This supports manual placement in the HTML (like in Review Template)
    const shareContainers = document.querySelectorAll('.share-widget');
    
    // Fallback: If no .share-widget container exists, try to inject into the author header block
    // This supports older pages (like ZeroSSL) that rely on JS injection into 'header .flex.border-t.border-b'
    const authorBlock = document.querySelector('header .flex.border-t.border-b');

    const canonical = document.querySelector('link[rel="canonical"]');
    const pageUrl = canonical ? canonical.href : window.location.href.split('?')[0];
    const pageTitle = document.title;
    
    window.copyToClipboard = function(btn) {
        const textArea = document.createElement("textarea");
        textArea.value = pageUrl;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            const icon = btn.querySelector('i');
            const originalClass = icon.className;
            icon.className = 'fa-solid fa-check text-[14px] text-green-600';
            setTimeout(() => {
                icon.className = originalClass;
            }, 2000);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textArea);
    };

    const shareItems = [
        { icon: 'fa-brands fa-whatsapp', color: 'hover:bg-[#25D366]', url: `https://api.whatsapp.com/send?text=${encodeURIComponent(pageTitle + ' ' + pageUrl)}`, label: 'WhatsApp' },
        { icon: 'fa-brands fa-facebook-f', color: 'hover:bg-[#1877F2]', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, label: 'Facebook' },
        { icon: 'fa-brands fa-telegram', color: 'hover:bg-[#0088cc]', url: `https://t.me/share/url?url=${encodeURIComponent(pageTitle)}`, label: 'Telegram' },
        { icon: 'fa-brands fa-linkedin-in', color: 'hover:bg-[#0077b5]', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`, label: 'LinkedIn' }
    ];

    let buttonsHTML = shareItems.map(item => `
        <a href="${item.url}" 
           target="_blank" rel="noopener noreferrer" 
           class="w-8 h-8 rounded-full bg-gray-100 ${item.color} hover:text-white text-gray-700 transition-all flex items-center justify-center shadow-sm" 
           aria-label="Share on ${item.label}">
            <i class="${item.icon} text-[14px]"></i>
        </a>
    `).join('');

    buttonsHTML += `
        <button onclick="window.copyToClipboard(this)" 
           class="w-8 h-8 rounded-full bg-gray-100 hover:bg-accent-main hover:text-white text-gray-700 transition-all flex items-center justify-center shadow-sm" 
           aria-label="Copy Link">
            <i class="fa-solid fa-link text-[14px]"></i>
        </button>
    `;

    const widgetHTML = `
        <div class="flex items-center gap-2">
            <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden md:block mr-1">Share</span>
            ${buttonsHTML}
        </div>
    `;

    // 1. Inject into dedicated containers first
    if (shareContainers.length > 0) {
        shareContainers.forEach(container => {
            if (!container.innerHTML.trim()) { 
                container.innerHTML = widgetHTML;
            }
        });
    } 
    // 2. Fallback: Dynamic injection for pages without .share-widget div (ZeroSSL compatibility)
    else if (authorBlock && !authorBlock.querySelector('.share-buttons-container')) {
        
        // Wrapper for author info
        const leftWrapper = document.createElement('div');
        leftWrapper.className = 'flex items-center space-x-3 mb-2 sm:mb-0'; 
        while (authorBlock.firstChild) {
            leftWrapper.appendChild(authorBlock.firstChild);
        }
        authorBlock.appendChild(leftWrapper);

        // Adjust parent layout
        authorBlock.classList.remove('justify-center', 'sm:justify-start', 'space-x-3');
        authorBlock.classList.add('justify-between', 'flex-wrap', 'gap-y-2'); 

        // Insert widget
        const shareWidgetDiv = document.createElement('div');
        shareWidgetDiv.className = 'share-buttons-container';
        shareWidgetDiv.innerHTML = widgetHTML;
        authorBlock.appendChild(shareWidgetDiv);
    }
}

/**
 * Initializes ScrollSpy logic.
 */
function initScrollSpy() {
    const links = document.querySelectorAll('.toc-link');
    const sections = Array.from(links).map(link => document.getElementById(link.dataset.target));
    const scrollContainer = document.getElementById('review-index-scroll-container');

    if (links.length === 0 || sections.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: '-100px 0px -60% 0px', 
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
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
                    
                    if (scrollContainer) {
                        const activeRect = activeLink.getBoundingClientRect();
                        const containerRect = scrollContainer.getBoundingClientRect();

                        if (activeRect.top < containerRect.top) {
                            scrollContainer.scrollTop -= (containerRect.top - activeRect.top + 10);
                        } 
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
 * Injects the Footer.
 */
function injectFooterAndModals() {
    const footerContainer = document.getElementById('app-footer');
    if (!footerContainer) return;

    // CONTRAST FIX: Changed text-gray-400 to text-gray-300 for footer text
    const footerHTML = `
        <footer class="bg-gray-800 text-gray-300 text-center py-6 px-4 mt-8 rounded-t-[2.5rem]">
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
