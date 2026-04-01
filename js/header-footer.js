/**
 * Toolblaster Global Components (Header, Footer, Tool Nav, Back to Top)
 * Premium "Utility Station" styling with Dynamic Title Detection.
 */

document.addEventListener('DOMContentLoaded', () => {
    safeRun(injectHeader);
    safeRun(injectToolNav);
    safeRun(injectFooterAndModals);
    safeRun(injectBackToTop);
});

function safeRun(fn) {
    try {
        fn();
    } catch (e) {
        console.error(`Error in ${fn.name}:`, e);
    }
}

/**
 * Header Injection
 * Center dynamically displays the active tool or page name.
 * Features a mobile-first slide-over hamburger menu.
 */
function injectHeader() {
    const headerContainer = document.getElementById('app-header');
    if (!headerContainer) return;

    // CRITICAL FIX: Ensure the placeholder keeps its height so the page doesn't jump
    headerContainer.style.minHeight = '48px';
    headerContainer.className = "w-full relative z-[100]";

    const currentPath = window.location.pathname;
    const currentHost = window.location.hostname;

    // Logic 1: URL-based explicit title matching
    let centerTitle = "TOOLBLASTER"; 
    
    if (currentPath.includes('/decide/')) {
        centerTitle = "DECIDE.";
    } else if (currentPath.includes('/educational/nursery-rhymes')) {
        centerTitle = "KIDS RHYMES";
    } else if (currentPath.includes('/reviews/')) {
        centerTitle = "REVIEWS";
    } else if (currentHost.includes('gstbilling')) {
        centerTitle = "GST BILLING";
    } else if (currentHost.includes('agriquiz')) {
        centerTitle = "AGRI QUIZ";
    } else if (currentHost.includes('onlinenotepad')) {
        centerTitle = "NOTEPAD";
    } else if (currentHost.includes('sipcalculator')) {
        centerTitle = "SIP PLANNER";
    } else if (currentHost.includes('percentagecalculator')) {
        centerTitle = "PERCENTAGE";
    } else if (currentPath === '/' || currentPath === '/index.html') {
        centerTitle = "HOME";
    }

    // Logic 2: DYNAMIC DESCRIPTION DETECTION (From document.title)
    let descTitle = "";
    if (document.title) {
        const titleParts = document.title.split(/\||-|:/);
        if (titleParts.length > 1) {
            let bestPart = "";
            titleParts.forEach(part => {
                const cleanPart = part.trim();
                if (cleanPart.toLowerCase() !== 'toolblaster' && cleanPart.length > bestPart.length) {
                    bestPart = cleanPart;
                }
            });
            descTitle = bestPart;
        } else {
            descTitle = document.title.trim();
        }
    }

    headerContainer.innerHTML = `
        <!-- RELATIVE POSITIONING ensures the header scrolls away naturally -->
        <nav class="relative w-full bg-white border-b border-stone-300 shadow-sm z-[100]">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between relative">
                
                <!-- Left: Brand Logo -->
                <div class="flex items-center flex-shrink-0">
                    <a href="/" aria-label="Toolblaster Home" class="flex items-center gap-2 group transition-transform hover:scale-105">
                        <svg class="w-6 h-6 drop-shadow-sm group-hover:scale-110 transition-transform duration-300" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M256 32C190 32 160 128 160 192V288L128 320V352H192L256 32V32Z" fill="#EF4444"/>
                            <path d="M256 32C322 32 352 128 352 192V288L384 320V352H320L256 32V32Z" fill="#EF4444" opacity="0.9"/>
                            <circle cx="256" cy="200" r="45" fill="white" stroke="#EF4444" stroke-width="12"/>
                            <circle cx="256" cy="200" r="15" fill="#EF4444"/>
                            <path d="M160 250L96 320V384H160V250Z" fill="#EF4444"/>
                            <path d="M352 250L416 320V384H352V250Z" fill="#EF4444"/>
                            <rect x="224" y="352" width="64" height="20" fill="#EF4444"/>
                            <path d="M235 380 L256 460 L277 380 Z" fill="#EF4444"/>
                        </svg>
                        <span class="font-inter font-black text-lg tracking-tighter text-stone-900 hidden sm:block">TOOL<span class="text-accent-main">BLASTER</span></span>
                    </a>
                </div>

                <!-- Center: Dynamic Page Name + Contextual Auto-Description -->
                <div class="absolute left-1/2 -translate-x-1/2 text-center flex flex-col sm:flex-row items-center justify-center w-full max-w-[55%] sm:max-w-[50%] md:max-w-xl pointer-events-none">
                    <span class="font-inter font-extrabold text-[11px] sm:text-[13px] md:text-sm tracking-[0.1em] sm:tracking-[0.15em] text-stone-900 uppercase whitespace-nowrap truncate leading-tight">
                        ${centerTitle}
                    </span>
                    ${descTitle ? `
                        <span class="hidden sm:inline text-stone-600 font-semibold tracking-widest text-[10px] ml-1.5 truncate">- ${descTitle}</span>
                        <span class="sm:hidden text-stone-600 font-semibold tracking-widest text-[8px] truncate w-full leading-tight mt-0.5">${descTitle}</span>
                    ` : ''}
                </div>

                <!-- Right: Desktop Action Button & Mobile Hamburger -->
                <div class="flex items-center gap-3">
                    <a href="/#tools" class="hidden sm:inline-flex bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-lg transition-all shadow-md active:scale-95 whitespace-nowrap flex-shrink-0">
                        Explore Tools
                    </a>
                    <button id="mobile-menu-btn" aria-label="Open Menu" class="sm:hidden text-stone-600 hover:text-stone-900 focus:outline-none transition-colors p-1">
                        <i class="fa-solid fa-bars text-xl"></i>
                    </button>
                </div>
            </div>
        </nav>

        <!-- Mobile Slide-over Menu (Sidebar) -->
        <div id="mobile-sidebar-overlay" class="fixed inset-0 bg-stone-900/50 z-[150] opacity-0 pointer-events-none transition-opacity duration-300"></div>
        <div id="mobile-sidebar" class="fixed inset-y-0 right-0 w-60 bg-white z-[200] transform translate-x-full transition-transform duration-300 flex flex-col shadow-2xl">
            <div class="flex items-center justify-between px-4 py-3 border-b border-stone-200">
                <span class="font-black text-stone-900 tracking-widest text-xs uppercase">Menu</span>
                <button id="close-sidebar-btn" aria-label="Close Menu" class="text-stone-500 hover:text-red-600 p-1 transition-colors">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>
            <div class="flex flex-col px-3 py-4 gap-2">
                <a href="/" class="flex items-center gap-3 text-sm font-bold text-stone-700 hover:text-red-600 transition-colors px-3 py-2.5 rounded-lg hover:bg-stone-50 border border-transparent hover:border-stone-200">
                    <i class="fa-solid fa-house w-4 text-center text-base"></i> Home
                </a>
                <a href="/#tools" class="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white text-[11px] font-black uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all shadow-sm active:scale-95 w-full mt-1">
                    Explore Tools
                </a>
            </div>
        </div>
    `;

    // Mobile Menu Handlers
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('close-sidebar-btn');
    const sidebar = document.getElementById('mobile-sidebar');
    const overlay = document.getElementById('mobile-sidebar-overlay');

    if(menuBtn && sidebar && overlay) {
        const openMenu = () => {
            overlay.classList.remove('opacity-0', 'pointer-events-none');
            overlay.classList.add('opacity-100');
            sidebar.classList.remove('translate-x-full');
            document.body.style.overflow = 'hidden';
        };

        const closeMenu = () => {
            overlay.classList.remove('opacity-100');
            overlay.classList.add('opacity-0', 'pointer-events-none');
            sidebar.classList.add('translate-x-full');
            document.body.style.overflow = '';
        };

        menuBtn.addEventListener('click', openMenu);
        closeBtn?.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);
    }
}

/**
 * Secondary Nav (Tool App Switcher)
 */
function injectToolNav() {
    const navContainer = document.getElementById('app-tool-nav');
    if (!navContainer) return;

    navContainer.style.minHeight = '48px';
    navContainer.className = "w-full relative z-[90]";

    const currentPath = window.location.pathname;
    const currentHost = window.location.hostname;

    const style = `
        <style>
            .hide-nav-scrollbar::-webkit-scrollbar { display: none; }
            .hide-nav-scrollbar { -ms-overflow-style: none; scrollbar-width: none; scroll-behavior: smooth; }
        </style>
    `;

    navContainer.innerHTML = style + `
        <div id="sec-nav-inner" class="w-full bg-stone-100/95 backdrop-blur-md border-b border-stone-200 shadow-sm z-[90] transition-none">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <nav id="secondary-scroll-nav" class="flex items-center md:justify-center gap-2 h-12 overflow-x-auto whitespace-nowrap hide-nav-scrollbar px-1">
                    <span class="text-[9px] font-black text-stone-400 uppercase tracking-widest hidden sm:block sticky left-0 bg-stone-100/95 backdrop-blur-md pr-3 z-10 py-3 shadow-[8px_0_10px_-5px_rgba(245,245,244,1)] flex-shrink-0">Apps</span>
                    
                    <a href="/decide/" class="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-xs transition-all duration-200 px-3 py-1.5 rounded-lg flex-shrink-0 ${currentPath.includes('/decide/') ? 'text-red-600 font-bold active-tool bg-white shadow-sm ring-1 ring-stone-200/60' : 'font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'}">
                        <i class="fa-solid fa-bullseye text-[12px]"></i> DECIDE.
                    </a>
                    
                    <a href="https://onlinenotepad.toolblaster.com" class="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-xs transition-all duration-200 px-3 py-1.5 rounded-lg flex-shrink-0 ${currentHost.includes('onlinenotepad') ? 'text-red-600 font-bold active-tool bg-white shadow-sm ring-1 ring-stone-200/60' : 'font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'}">
                        <i class="fa-solid fa-pen-to-square text-[12px]"></i> Notepad
                    </a>

                    <a href="/educational/nursery-rhymes-for-kids/" class="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-xs transition-all duration-200 px-3 py-1.5 rounded-lg flex-shrink-0 ${currentPath.includes('/educational/nursery-rhymes') ? 'text-red-600 font-bold active-tool bg-white shadow-sm ring-1 ring-stone-200/60' : 'font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'}">
                        <i class="fa-solid fa-music text-[12px]"></i> Kids Rhymes
                    </a>
                </nav>
            </div>
        </div>
    `;

    setTimeout(() => {
        const activeItem = document.querySelector('#secondary-scroll-nav .active-tool');
        if (activeItem) {
            activeItem.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
        }

        const innerNav = document.getElementById('sec-nav-inner');
        if (innerNav) {
            const handleScroll = () => {
                if (window.scrollY >= 48) {
                    innerNav.classList.add('fixed', 'top-0', 'left-0');
                } else {
                    innerNav.classList.remove('fixed', 'top-0', 'left-0');
                }
            };
            window.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll(); 
        }
    }, 100); 
}

/**
 * Global Footer
 * Ultra-Minimalist Redesign: Integrated dynamic Social Sharing, perfectly centered.
 */
function injectFooterAndModals() {
    const footerContainer = document.getElementById('app-footer');
    if (!footerContainer) return;

    footerContainer.className = "w-full mt-auto mb-0";

    // Auto-capture current page URL for sharing
    const currentUrl = encodeURIComponent(window.location.href);
    const shareMsg = encodeURIComponent("Check out this useful tool on Toolblaster: ");

    footerContainer.innerHTML = `
        <footer class="bg-white border-t border-stone-200 w-full relative z-50">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
                <!-- 3-Column Layout: Stacks naturally on mobile, spreads evenly on desktop -->
                <div class="flex flex-col md:flex-row justify-between items-center gap-5 md:gap-4 w-full">
                    
                    <!-- Left Group: Copyright (Order 3 on mobile, 1 on desktop) -->
                    <div class="w-full md:w-1/3 text-center md:text-left order-3 md:order-1 mt-1 md:mt-0">
                        <p class="text-[10px] text-stone-600 font-bold tracking-widest uppercase">
                            © ${new Date().getFullYear()} TOOLBLASTER.COM | ALL RIGHTS RESERVED.
                        </p>
                    </div>
                    
                    <!-- Center Group: Dynamic Social Share (Order 1 on mobile, 2 on desktop) -->
                    <div class="w-full md:w-1/3 flex items-center justify-center gap-3 order-1 md:order-2">
                        <span class="text-[9px] font-black text-stone-500 uppercase tracking-[0.2em]">Share:</span>
                        <div class="flex items-center gap-4">
                            <!-- WhatsApp -->
                            <a href="https://api.whatsapp.com/send?text=${shareMsg}${currentUrl}" target="_blank" rel="noopener noreferrer" class="text-stone-500 hover:text-[#25D366] hover:scale-110 transition-all duration-300" aria-label="Share on WhatsApp">
                                <i class="fa-brands fa-whatsapp text-sm"></i>
                            </a>
                            <!-- X (Twitter) -->
                            <a href="https://twitter.com/intent/tweet?url=${currentUrl}&text=${shareMsg}" target="_blank" rel="noopener noreferrer" class="text-stone-500 hover:text-stone-900 hover:scale-110 transition-all duration-300" aria-label="Share on X">
                                <i class="fa-brands fa-x-twitter text-sm"></i>
                            </a>
                            <!-- Facebook -->
                            <a href="https://www.facebook.com/sharer/sharer.php?u=${currentUrl}" target="_blank" rel="noopener noreferrer" class="text-stone-500 hover:text-[#1877F2] hover:scale-110 transition-all duration-300" aria-label="Share on Facebook">
                                <i class="fa-brands fa-facebook-f text-sm"></i>
                            </a>
                        </div>
                    </div>

                    <!-- Right Group: Legal Links (Order 2 on mobile, 3 on desktop) -->
                    <nav class="w-full md:w-1/3 flex items-center gap-5 justify-center md:justify-end order-2 md:order-3">
                        <a href="/terms/about.html" class="text-[10px] font-black text-stone-600 hover:text-red-600 uppercase tracking-widest transition-colors">About</a>
                        <a href="/terms/privacy.html" class="text-[10px] font-black text-stone-600 hover:text-red-600 uppercase tracking-widest transition-colors">Privacy</a>
                        <a href="/terms/terms.html" class="text-[10px] font-black text-stone-600 hover:text-red-600 uppercase tracking-widest transition-colors">Terms</a>
                    </nav>

                </div>
            </div>
        </footer>
    `;
}

function injectBackToTop() {
    if(document.getElementById('back-to-top')) return; 

    const btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.className = 'fixed bottom-12 right-6 w-10 h-10 bg-red-600 text-white rounded-full shadow-xl z-50 hover:bg-red-700 hover:-translate-y-1 transition-all duration-300 opacity-0 invisible flex items-center justify-center print:hidden';
    btn.innerHTML = '<i class="fa-solid fa-arrow-up text-sm"></i>';
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            btn.classList.remove('opacity-0', 'invisible');
            btn.classList.add('opacity-100', 'visible');
        } else {
            btn.classList.remove('opacity-100', 'visible');
            btn.classList.add('opacity-0', 'invisible');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
