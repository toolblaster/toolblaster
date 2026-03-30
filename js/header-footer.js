/**
 * Toolblaster Global Components (Header, Footer, Back to Top)
 * Restructured for "Subfolder Umbrella" SEO Strategy.
 * Matches QuillBot-style internal routing for better domain authority.
 */

document.addEventListener('DOMContentLoaded', () => {
    safeRun(injectHeader);
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
 * Injects the Navigation Bar
 * Optimized for Toolblaster's "Utility Hub" identity.
 */
function injectHeader() {
    const headerContainer = document.getElementById('app-header');
    if (!headerContainer) return;

    const currentPath = window.location.pathname;

    headerContainer.innerHTML = `
        <nav class="w-full bg-dark-950/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-[100]">
            <div class="container mx-auto max-w-site px-4 sm:px-6 h-14 flex items-center justify-between">
                
                <!-- Logo (Restored Official Rocket Logo) -->
                <a href="https://toolblaster.com/" class="flex items-center gap-2 group transition-transform hover:scale-105">
                    <div class="flex items-center justify-center">
                        <svg class="w-7 h-7 drop-shadow-md group-hover:scale-110 transition-transform duration-300" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                    <span class="font-inter font-black text-lg tracking-tighter text-white">TOOL<span class="text-accent-main">BLASTER</span></span>
                </a>

                <!-- Desktop Tools Navigation (Mixed Structure) -->
                <div class="hidden md:flex items-center gap-6">
                    <a href="https://onlinenotepad.toolblaster.com" class="text-xs font-bold uppercase tracking-widest ${window.location.hostname.includes('onlinenotepad') ? 'text-accent-main' : 'text-gray-400 hover:text-white'} transition-colors">Notepad</a>
                    <a href="https://agriquiz.toolblaster.com" class="text-xs font-bold uppercase tracking-widest ${window.location.hostname.includes('agriquiz') ? 'text-accent-main' : 'text-gray-400 hover:text-white'} transition-colors">Quiz</a>
                    <a href="/decide/" class="text-xs font-bold uppercase tracking-widest ${currentPath.includes('/decide/') ? 'text-accent-main' : 'text-gray-400 hover:text-white'} transition-colors">Decide</a>
                    <a href="https://toolblaster.com/#reviews" class="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Reviews</a>
                </div>

                <!-- Action Button -->
                <div class="flex items-center gap-3">
                    <a href="https://toolblaster.com/terms/about.html" class="hidden sm:block text-xs font-bold text-gray-400 hover:text-white transition-colors">About</a>
                    <button class="bg-accent-main hover:bg-accent-dark text-white text-[10px] font-black uppercase tracking-tighter px-4 py-2 rounded-lg transition-all shadow-lg active:scale-95">
                        Tools List
                    </button>
                </div>
            </div>
        </nav>
    `;
}

/**
 * Injects the Global Footer
 */
function injectFooterAndModals() {
    const footerContainer = document.getElementById('app-footer');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
        <footer class="bg-dark-950 border-t border-white/5 py-12">
            <div class="container mx-auto max-w-site px-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div>
                        <div class="flex items-center gap-2 mb-4">
                            <!-- Restored Official Rocket Logo -->
                            <svg class="w-5 h-5 drop-shadow-sm" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M256 32C190 32 160 128 160 192V288L128 320V352H192L256 32V32Z" fill="#EF4444"/>
                                <path d="M256 32C322 32 352 128 352 192V288L384 320V352H320L256 32V32Z" fill="#EF4444" opacity="0.9"/>
                                <circle cx="256" cy="200" r="45" fill="white" stroke="#EF4444" stroke-width="12"/>
                                <circle cx="256" cy="200" r="15" fill="#EF4444"/>
                                <path d="M160 250L96 320V384H160V250Z" fill="#EF4444"/>
                                <path d="M352 250L416 320V384H352V250Z" fill="#EF4444"/>
                                <rect x="224" y="352" width="64" height="20" fill="#EF4444"/>
                                <path d="M235 380 L256 460 L277 380 Z" fill="#EF4444"/>
                            </svg>
                            <span class="font-black text-sm tracking-tighter text-white uppercase">Toolblaster</span>
                        </div>
                        <p class="text-xs text-gray-500 leading-relaxed max-w-xs">
                            Empowering your digital journey with smart utilities, financial calculators, and expert software analysis.
                        </p>
                    </div>
                    
                    <div>
                        <h4 class="text-white text-xs font-bold uppercase tracking-widest mb-4">Quick Links</h4>
                        <ul class="space-y-2">
                            <li><a href="https://onlinenotepad.toolblaster.com" class="text-xs text-gray-500 hover:text-accent-main transition-colors">Online Notepad</a></li>
                            <li><a href="/decide/" class="text-xs text-gray-500 hover:text-accent-main transition-colors">Daily Focus</a></li>
                            <li><a href="https://agriquiz.toolblaster.com" class="text-xs text-gray-500 hover:text-accent-main transition-colors">Agri Mock Test</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="text-white text-xs font-bold uppercase tracking-widest mb-4">Legal</h4>
                        <ul class="space-y-2">
                            <li><a href="https://toolblaster.com/terms/privacy.html" class="text-xs text-gray-500 hover:text-accent-main transition-colors">Privacy Policy</a></li>
                            <li><a href="https://toolblaster.com/terms/terms.html" class="text-xs text-gray-500 hover:text-accent-main transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                
                <div class="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p class="text-[10px] text-gray-600 font-medium tracking-wide">© 2026 TOOLBLASTER. ALL RIGHTS RESERVED.</p>
                    <div class="flex gap-4">
                        <i class="fa-brands fa-x-twitter text-gray-600 hover:text-white cursor-pointer transition-colors"></i>
                        <i class="fa-brands fa-github text-gray-600 hover:text-white cursor-pointer transition-colors"></i>
                    </div>
                </div>
            </div>
        </footer>
    `;
}

function injectBackToTop() {
    const btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.className = 'fixed bottom-24 right-6 w-10 h-10 bg-accent-main text-white rounded-xl shadow-2xl z-50 hover:bg-accent-dark hover:scale-110 transition-all duration-300 opacity-0 invisible translate-y-4 flex items-center justify-center';
    btn.innerHTML = '<i class="fa-solid fa-arrow-up text-sm"></i>';
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            btn.classList.remove('opacity-0', 'invisible', 'translate-y-4');
            btn.classList.add('opacity-100', 'visible', 'translate-y-0');
        } else {
            btn.classList.remove('opacity-100', 'visible', 'translate-y-0');
            btn.classList.add('opacity-0', 'invisible', 'translate-y-4');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
