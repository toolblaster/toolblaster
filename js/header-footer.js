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
                    <a href="https://toolblaster.com/" class="flex items-center gap-2 group transition-transform hover:scale-105">
                        <svg class="w-6 h-6 drop-shadow-sm group-hover:scale-110 transition-transform duration-300" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
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

                <!-- Daayen (Right): Action Button -->
                <div class="flex items-center gap-3">
                    <a href="https://toolblaster.com/#tools" class="bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-lg transition-all shadow-md active:scale-95 whitespace-nowrap flex-shrink-0">
                        Tools ki List
                    </a>
                </div>
            </div>
        </nav>
    `;
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
 * Global Footer
 */
function injectFooterAndModals() {
    const footerContainer = document.getElementById('app-footer');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
        <footer class="bg-white border-t border-stone-200 py-12 mt-auto">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div>
                        <div class="flex items-center gap-2 mb-4">
                            <svg class="w-6 h-6 drop-shadow-sm" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                    
                    <div>
                        <!-- FIXED: Changed h4 to h3 to fix heading hierarchy order for PageSpeed -->
                        <h3 class="text-stone-900 text-xs font-bold uppercase tracking-widest mb-4">Quick Links</h3>
                        <ul class="space-y-3">
                            <li><a href="https://onlinenotepad.toolblaster.com" class="text-sm text-stone-600 hover:text-red-500 transition-colors font-medium">Online Notepad</a></li>
                            <li><a href="https://gstbilling.toolblaster.com" class="text-sm text-stone-600 hover:text-red-500 transition-colors font-medium">GST Billing</a></li>
                            <li><a href="/decide/" class="text-sm text-stone-600 hover:text-red-500 transition-colors font-medium">Daily Focus</a></li>
                        </ul>
                    </div>

                    <div>
                        <!-- FIXED: Changed h4 to h3 to fix heading hierarchy order for PageSpeed -->
                        <h3 class="text-stone-900 text-xs font-bold uppercase tracking-widest mb-4">Legal</h3>
                        <ul class="space-y-3">
                            <li><a href="https://toolblaster.com/terms/privacy.html" class="text-sm text-stone-600 hover:text-red-500 transition-colors font-medium">Privacy Policy</a></li>
                            <li><a href="https://toolblaster.com/terms/terms.html" class="text-sm text-stone-600 hover:text-red-500 transition-colors font-medium">Terms of Service</a></li>
                            <li><a href="https://toolblaster.com/terms/about.html" class="text-sm text-stone-600 hover:text-red-500 transition-colors font-medium">About Us</a></li>
                        </ul>
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
