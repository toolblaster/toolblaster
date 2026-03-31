/**
 * Toolblaster Global Components (Header, Footer, Tool Nav, Back to Top)
 * QuillBot Style: Dynamic Center Title detection for better UX.
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
 * Header inject karne wala function
 * Center mein dynamic page/tool ka naam dikhayega
 * Mobile ke liye Hamburger Slide-over Menu add kiya gaya hai
 */
function injectHeader() {
    const headerContainer = document.getElementById('app-header');
    if (!headerContainer) return;

    const currentPath = window.location.pathname;
    const currentHost = window.location.hostname;

    // Logic: URL ke hisab se center title decide karna
    let centerTitle = "TOOLBLASTER"; // Default title
    
    if (currentPath.includes('/decide/')) {
        centerTitle = "DECIDE.";
    } else if (currentPath.includes('/reviews/')) {
        centerTitle = "REVIEWS";
    } else if (currentHost.includes('gstbilling')) {
        centerTitle = "GST BILLING";
    } else if (currentHost.includes('agriquiz')) {
        centerTitle = "AGRI QUIZ";
    } else if (currentHost.includes('onlinenotepad')) {
        centerTitle = "NOTEPAD";
    } else if (currentPath === '/' || currentPath === '/index.html') {
        centerTitle = "HOME";
    }

    headerContainer.innerHTML = `
        <nav class="w-full bg-white/95 backdrop-blur-md border-b border-stone-300 shadow-[0_2px_15px_-3px_rgba(239,68,68,0.12)] sticky top-0 z-[100] transition-all">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between relative">
                
                <!-- Baayen (Left): Logo -->
                <div class="flex items-center flex-shrink-0">
                    <a href="https://toolblaster.com/" aria-label="Toolblaster Home" class="flex items-center gap-2 group transition-transform hover:scale-105">
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

                <!-- Beech mein (Center): Dynamic Page Name -->
                <div class="absolute left-1/2 -translate-x-1/2 text-center">
                    <span class="font-inter font-extrabold text-[13px] md:text-sm tracking-[0.15em] text-stone-900 uppercase pointer-events-none whitespace-nowrap">
                        ${centerTitle}
                    </span>
                </div>

                <!-- Daayen (Right): Desktop Action Button & Mobile Hamburger -->
                <div class="flex items-center gap-3">
                    <!-- Desktop Button (Hidden on Mobile) -->
                    <a href="https://toolblaster.com/#tools" class="hidden sm:inline-flex bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-lg transition-all shadow-md active:scale-95 whitespace-nowrap flex-shrink-0">
                        Tools ki List
                    </a>
                    <!-- Mobile Hamburger Button (Visible only on Mobile) -->
                    <button id="mobile-menu-btn" aria-label="Menu kholen" class="sm:hidden text-stone-600 hover:text-stone-900 focus:outline-none transition-colors p-1">
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
                <button id="close-sidebar-btn" aria-label="Menu band karein" class="text-stone-500 hover:text-red-500 p-1 transition-colors">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>
            <div class="flex flex-col px-3 py-4 gap-2">
                <!-- Home Link with Icon -->
                <a href="https://toolblaster.com/" class="flex items-center gap-3 text-sm font-bold text-stone-700 hover:text-red-500 transition-colors px-3 py-2.5 rounded-lg hover:bg-stone-50 border border-transparent hover:border-stone-200">
                    <i class="fa-solid fa-house w-4 text-center text-base"></i> Home
                </a>
                
                <!-- Tools List Button inside Mobile Menu -->
                <a href="https://toolblaster.com/#tools" class="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white text-[11px] font-black uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all shadow-sm active:scale-95 w-full mt-1">
                    Tools ki List
                </a>
            </div>
        </div>
    `;

    // Mobile menu open/close karne ka JS logic
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('close-sidebar-btn');
    const sidebar = document.getElementById('mobile-sidebar');
    const overlay = document.getElementById('mobile-sidebar-overlay');

    if(menuBtn && sidebar && overlay) {
        const openMenu = () => {
            overlay.classList.remove('opacity-0', 'pointer-events-none');
            overlay.classList.add('opacity-100');
            sidebar.classList.remove('translate-x-full');
            document.body.style.overflow = 'hidden'; // Background scroll rokne ke liye
        };

        const closeMenu = () => {
            overlay.classList.remove('opacity-100');
            overlay.classList.add('opacity-0', 'pointer-events-none');
            sidebar.classList.add('translate-x-full');
            document.body.style.overflow = ''; // Scroll wapas chalu karne ke liye
        };

        menuBtn.addEventListener('click', openMenu);
        closeBtn?.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);
    }
}

/**
 * Secondary Nav (Tools switching menu)
 */
function injectToolNav() {
    const navContainer = document.getElementById('app-tool-nav');
    if (!navContainer) return;

    const currentPath = window.location.pathname;

    const style = `
        <style>
            .hide-nav-scrollbar::-webkit-scrollbar { display: none; }
            .hide-nav-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        </style>
    `;

    navContainer.innerHTML = style + `
        <div class="w-full bg-stone-50 border-b border-stone-200 shadow-sm z-40 relative">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <nav class="flex items-center md:justify-center gap-6 md:gap-8 h-10 overflow-x-auto whitespace-nowrap hide-nav-scrollbar text-stone-600">
                    <span class="text-[10px] font-bold text-stone-400 uppercase tracking-widest hidden sm:block sticky left-0 bg-stone-50 pr-2 z-10">Apps</span>
                    
                    <a href="/decide/" class="flex items-center gap-2 text-sm transition-colors duration-200 ${currentPath.includes('/decide/') ? 'text-red-500 font-bold' : 'font-medium hover:text-stone-900'}">
                        <i class="fa-solid fa-bullseye"></i> DECIDE.
                    </a>
                    
                    <!-- NOTE: Reviews link temporarily removed untill it is fully ready -->
                    
                </nav>
            </div>
        </div>
    `;
}

/**
 * Global Footer - Modernized Layout for Mobile
 */
function injectFooterAndModals() {
    const footerContainer = document.getElementById('app-footer');
    if (!footerContainer) return;

    // Mobile me modern look ke liye grid structure change kiya gaya hai.
    // Ab links ek side-by-side grid me aayenge taaki scroll kam karna pade.
    // UPDATE: Header ki tarah dark border-stone-300 aur top shadow add ki gayi hai.
    footerContainer.innerHTML = `
        <footer class="bg-white border-t border-stone-300 shadow-[0_-2px_15px_-3px_rgba(239,68,68,0.12)] py-12 mt-auto relative z-50">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8">
                    
                    <!-- Brand Section (1st Column) -->
                    <div class="lg:col-span-1">
                        <div class="flex items-center gap-2 mb-4">
                            <svg class="w-6 h-6 drop-shadow-sm" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M256 32C190 32 160 128 160 192V288L128 320V352H192L256 32V32Z" fill="#EF4444"/>
                                <path d="M256 32C322 32 352 128 352 192V288L384 320V352H320L256 32V32Z" fill="#EF4444" opacity="0.9"/>
                                <circle cx="256" cy="200" r="45" fill="white" stroke="#EF4444" stroke-width="12"/>
                                <circle cx="256" cy="200" r="15" fill="#EF4444"/>
                                <path d="M160 250L96 320V384H160V250Z" fill="#EF4444"/>
                                <path d="M352 250L416 320V384H352V250Z" fill="#EF4444"/>
                                <rect x="224" y="352" width="64" height="20" fill="#EF4444"/>
                                <path d="M235 380 L256 460 L277 380 Z" fill="#EF4444"/>
                            </svg>
                            <span class="font-black text-base tracking-tighter text-stone-900 uppercase">Toolblaster</span>
                        </div>
                        <p class="text-sm text-stone-500 leading-relaxed max-w-xs">
                            Empowering your digital journey with smart utilities, financial calculators, and expert software analysis.
                        </p>
                    </div>
                    
                    <!-- Links Section (Ab mobile par 2-columns me dikhega space bachane ke liye) -->
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:col-span-3">
                        
                        <!-- Quick Links -->
                        <div>
                            <h3 class="text-stone-900 text-xs font-bold uppercase tracking-widest mb-4">Quick Links</h3>
                            <ul class="space-y-3">
                                <li><a href="https://onlinenotepad.toolblaster.com" class="text-sm text-stone-600 hover:text-red-500 transition-colors font-medium">Online Notepad</a></li>
                                <li><a href="https://gstbilling.toolblaster.com" class="text-sm text-stone-600 hover:text-red-500 transition-colors font-medium">GST Billing</a></li>
                                <li><a href="/decide/" class="text-sm text-stone-600 hover:text-red-500 transition-colors font-medium">Daily Focus</a></li>
                            </ul>
                        </div>

                        <!-- NEW: Reviews Section -->
                        <div>
                            <h3 class="text-stone-900 text-xs font-bold uppercase tracking-widest mb-4">Top Reviews</h3>
                            <ul class="space-y-3">
                                <li><a href="https://toolblaster.com/reviews/hosting/verpex-hosting-review.html" class="text-sm text-stone-600 hover:text-red-500 transition-colors font-medium">Hosting Reviews</a></li>
                                <li><a href="https://toolblaster.com/reviews/seo/semrush-review.html" class="text-sm text-stone-600 hover:text-red-500 transition-colors font-medium">SEO Tools</a></li>
                                <li><a href="https://toolblaster.com/reviews/security/zerossl-review.html" class="text-sm text-stone-600 hover:text-red-500 transition-colors font-medium">Security & SSL</a></li>
                            </ul>
                        </div>

                        <!-- Legal -->
                        <div>
                            <h3 class="text-stone-900 text-xs font-bold uppercase tracking-widest mb-4">Legal</h3>
                            <ul class="space-y-3">
                                <li><a href="https://toolblaster.com/terms/privacy.html" class="text-sm text-stone-600 hover:text-red-500 transition-colors font-medium">Privacy Policy</a></li>
                                <li><a href="https://toolblaster.com/terms/terms.html" class="text-sm text-stone-600 hover:text-red-500 transition-colors font-medium">Terms of Service</a></li>
                                <li><a href="https://toolblaster.com/terms/about.html" class="text-sm text-stone-600 hover:text-red-500 transition-colors font-medium">About Us</a></li>
                            </ul>
                        </div>
                    </div>

                </div>
                
                <div class="mt-12 pt-8 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p class="text-xs text-stone-500 font-medium tracking-wide">© ${new Date().getFullYear()} TOOLBLASTER. ALL RIGHTS RESERVED.</p>
                </div>
            </div>
        </footer>
    `;
}

function injectBackToTop() {
    const btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.className = 'fixed bottom-12 right-6 w-10 h-10 bg-red-500 text-white rounded-full shadow-xl z-50 hover:bg-red-600 hover:-translate-y-1 transition-all duration-300 opacity-0 invisible flex items-center justify-center';
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
