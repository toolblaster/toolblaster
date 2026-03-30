/**
 * Toolblaster Global Components (Header, Footer, Tool Nav, Back to Top)
 * New Style: Compact, Premium Shadow, and Distinct Border.
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
 * Injects the Main Navigation Bar (Global Branding)
 * Compact Header (h-12), Distinct Border, and Premium Accent Shadow
 */
function injectHeader() {
    const headerContainer = document.getElementById('app-header');
    if (!headerContainer) return;

    headerContainer.innerHTML = `
        <nav class="w-full bg-white/95 backdrop-blur-md border-b border-stone-300 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.2)] sticky top-0 z-[100] transition-all">
            <!-- UNIFORM WIDTH APPLIED HERE -->
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
                
                <!-- Logo -->
                <a href="https://toolblaster.com/" class="flex items-center gap-2 group transition-transform hover:scale-105">
                    <div class="flex items-center justify-center">
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
                    </div>
                    <span class="font-inter font-black text-lg tracking-tighter text-stone-900">TOOL<span class="text-accent-main">BLASTER</span></span>
                </a>

                <!-- Desktop Action Links -->
                <div class="hidden md:flex items-center gap-8">
                    <a href="https://toolblaster.com/#tools" class="text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors">All Tools</a>
                    <a href="https://toolblaster.com/reviews/" class="text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors">Reviews</a>
                </div>

                <!-- Action Button (Removed About Link, Fixed button styles for CDN support) -->
                <div class="flex items-center gap-4">
                    <a href="https://toolblaster.com/#tools" class="bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-lg transition-all shadow-md active:scale-95 whitespace-nowrap flex-shrink-0">
                        Tools List
                    </a>
                </div>
            </div>
        </nav>
    `;
}

/**
 * Centralized Horizontal Tool Navigation
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
            <!-- UNIFORM WIDTH APPLIED HERE -->
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <nav class="flex items-center md:justify-center gap-6 md:gap-8 h-10 overflow-x-auto whitespace-nowrap hide-nav-scrollbar">
                    <span class="text-[10px] font-bold text-stone-400 uppercase tracking-widest hidden sm:block sticky left-0 bg-stone-50 pr-2 z-10">Apps</span>
                    
                    <a href="/decide/" class="flex items-center gap-2 text-sm transition-colors duration-200 ${currentPath.includes('/decide/') ? 'text-red-500 font-bold' : 'text-stone-600 font-medium hover:text-stone-900'}">
                        <i class="fa-solid fa-bullseye"></i> DECIDE.
                    </a>

                    <div class="h-4 w-px bg-stone-300 mx-0.5"></div>

                    <a href="https://toolblaster.com/reviews/" class="flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
                        <i class="fa-solid fa-star"></i> Software Reviews
                    </a>
                </nav>
            </div>
        </div>
    `;
}

/**
 * Injects the Global Footer (Clean Light Mode Design)
 */
function injectFooterAndModals() {
    const footerContainer = document.getElementById('app-footer');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
        <footer class="bg-white border-t border-stone-200 py-12 mt-auto">
            <!-- UNIFORM WIDTH APPLIED HERE -->
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div>
                        <div class="flex items-center gap-2 mb-4">
                            <!-- Official Rocket Logo -->
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
                        <h4 class="text-stone-900 text-xs font-bold uppercase tracking-widest mb-4">Quick Links</h4>
                        <ul class="space-y-3">
                            <li><a href="https://onlinenotepad.toolblaster.com" class="text-sm text-stone-600 hover:text-red-500 transition-colors font-medium">Online Notepad</a></li>
                            <li><a href="/decide/" class="text-sm text-stone-600 hover:text-red-500 transition-colors font-medium">Daily Focus Tool</a></li>
                            <li><a href="https://agriquiz.toolblaster.com" class="text-sm text-stone-600 hover:text-red-500 transition-colors font-medium">Agri Mock Test</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="text-stone-900 text-xs font-bold uppercase tracking-widest mb-4">Legal</h4>
                        <ul class="space-y-3">
                            <li><a href="https://toolblaster.com/terms/privacy.html" class="text-sm text-stone-600 hover:text-red-500 transition-colors font-medium">Privacy Policy</a></li>
                            <li><a href="https://toolblaster.com/terms/terms.html" class="text-sm text-stone-600 hover:text-red-500 transition-colors font-medium">Terms of Service</a></li>
                            <!-- About Us accurately placed here with Legal Links -->
                            <li><a href="https://toolblaster.com/terms/about.html" class="text-sm text-stone-600 hover:text-red-500 transition-colors font-medium">About Us</a></li>
                        </ul>
                    </div>
                </div>
                
                <div class="mt-12 pt-8 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p class="text-xs text-stone-500 font-medium tracking-wide">© ${new Date().getFullYear()} TOOLBLASTER. ALL RIGHTS RESERVED.</p>
                    <div class="flex gap-5">
                        <i class="fa-brands fa-x-twitter text-stone-400 hover:text-stone-900 cursor-pointer transition-colors text-lg"></i>
                        <i class="fa-brands fa-github text-stone-400 hover:text-stone-900 cursor-pointer transition-colors text-lg"></i>
                    </div>
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
