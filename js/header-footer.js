/**
 * Toolblaster Shared Design System (Header, Footer, Tool Nav, Back to Top)
 * Premium "Utility Station" styling with Dynamic Title Detection and Global App Menu.
 */

// ==========================================
// 🚀 CENTRAL TOOLBLASTER APP DIRECTORY 🚀
// This array is 100% dynamic. Add any new tool here, and it will
// automatically render in both the App Drawer and Top Navigation!
// ==========================================
const TOOLBLASTER_APPS = [
    {
        category: "Productivity",
        icon: "fa-bolt-lightning",
        apps: [
            { name: "Daily Focus", url: "/productivity/decide/", icon: "fa-bullseye", classes: "bg-indigo-50 border-indigo-100 text-indigo-600 group-hover:text-indigo-600", matchPath: "/decide/" },
            { name: "Word Counter", url: "/productivity/word-counter/", icon: "fa-file-word", classes: "bg-red-50 border-red-100 text-red-600 group-hover:text-red-600", matchPath: "/word-counter/" },
            { name: "Study Timer", url: "/productivity/pomodoro-study-timer/", icon: "fa-stopwatch", classes: "bg-orange-50 border-orange-100 text-orange-600 group-hover:text-orange-600", matchPath: "/pomodoro-study-timer/" },
            { name: "Breathing Pacer", url: "/productivity/breathing-pacer/", icon: "fa-wind", classes: "bg-cyan-50 border-cyan-100 text-cyan-600 group-hover:text-cyan-600", matchPath: "/breathing-pacer/" },
            { name: "Habit Tracker", url: "/productivity/habit-tracker/", icon: "fa-calendar-check", classes: "bg-emerald-50 border-emerald-100 text-emerald-600 group-hover:text-emerald-600", matchPath: "/habit-tracker/" }
        ]
    },
    {
        category: "Finance",
        icon: "fa-wallet",
        apps: [
            { name: "Investment Planner", url: "/finance/investment-planner/", icon: "fa-chart-line", classes: "bg-emerald-50 border-emerald-100 text-emerald-600 group-hover:text-emerald-600", matchPath: "/investment-planner/" },
            { name: "Compare Investment", url: "/finance/sip-vs-fd-vs-rd-calculator/", icon: "fa-chart-simple", classes: "bg-red-50 border-red-100 text-red-600 group-hover:text-red-600", matchPath: "/sip-vs-fd-vs-rd-calculator/" },
            { name: "PPF Calculator", url: "/finance/ppf-calculator/", icon: "fa-piggy-bank", classes: "bg-blue-50 border-blue-100 text-blue-600 group-hover:text-blue-600", matchPath: "/ppf-calculator/" },
            { name: "EMI Calculator", url: "/finance/emi-calculator/", icon: "fa-calculator", classes: "bg-purple-50 border-purple-100 text-purple-600 group-hover:text-purple-600", matchPath: "/emi-calculator/" },
            { name: "Safe-to-Spend", url: "/finance/safe-to-spend-calculator/", icon: "fa-shield-halved", classes: "bg-amber-50 border-amber-100 text-amber-600 group-hover:text-amber-600", matchPath: "/safe-to-spend-calculator/" },
            { name: "Reverse Planner", url: "/finance/reverse-investment-planner/", icon: "fa-rotate-left", classes: "bg-rose-50 border-rose-100 text-rose-600 group-hover:text-rose-600", matchPath: "/reverse-investment-planner/" }
        ]
    },
    {
        category: "Educational",
        icon: "fa-graduation-cap",
        apps: [
            { name: "AksharTrace", url: "/educational/akshar-trace/", icon: "fa-feather-pointed", classes: "bg-red-50 border-red-100 text-red-600 group-hover:text-red-600", matchPath: "/educational/akshar-trace/" },
            { name: "Kids Rhymes", url: "/educational/nursery-rhymes-for-kids/", icon: "fa-music", classes: "bg-pink-50 border-pink-100 text-pink-600 group-hover:text-pink-600", matchPath: "/educational/nursery-rhymes-for-kids/" },
            { name: "Math Sprint", url: "/educational/math-sprint-speed-drill-worksheets/", icon: "fa-calculator", classes: "bg-red-50 border-red-100 text-red-600 group-hover:text-red-600", matchPath: "/educational/math-sprint-speed-drill-worksheets/" },
            { name: "TraceWrite", url: "/educational/tracewrite-handwriting-tracing-worksheets/", icon: "fa-pen-nib", classes: "bg-amber-50 border-amber-100 text-amber-600 group-hover:text-amber-600", matchPath: "/educational/tracewrite-handwriting-tracing-worksheets/" }
        ]
    }
];

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
 * Features a universal slide-over Global App Menu (Mega Menu style).
 */
function injectHeader() {
    const headerContainer = document.getElementById('app-header');
    if (!headerContainer) return;

    // Ensure the placeholder keeps its height so the page doesn't jump
    headerContainer.style.minHeight = '48px';
    headerContainer.className = "w-full relative z-[100]";

    const currentPath = window.location.pathname;
    const currentHost = window.location.hostname;

    // Read from HTML Meta tags automatically
    let centerTitle = "TOOLBLASTER"; 
    const appNameMeta = document.querySelector('meta[name="application-name"]');
    const iosAppNameMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');

    if (appNameMeta && appNameMeta.content) {
        centerTitle = appNameMeta.content.toUpperCase();
    } else if (iosAppNameMeta && iosAppNameMeta.content) {
        centerTitle = iosAppNameMeta.content.toUpperCase();
    } else {
        // Fallback for active pages
        if (currentPath.includes('/decide/')) centerTitle = "DECIDE.";
        else if (currentPath.includes('/pomodoro-study-timer/')) centerTitle = "STUDY TIMER";
        else if (currentPath.includes('/educational/akshar-trace/')) centerTitle = "AKSHARTRACE";
        else if (currentPath.includes('/educational/nursery-rhymes')) centerTitle = "KIDS RHYMES";
        else if (currentPath.includes('/educational/math-sprint-speed-drill-worksheets')) centerTitle = "MATH SPRINT";
        else if (currentPath.includes('/educational/tracewrite-handwriting-tracing-worksheets')) centerTitle = "TRACEWRITE";
        else if (currentPath.includes('/productivity/word-counter')) centerTitle = "WORD COUNTER";
        else if (currentPath.includes('/productivity/breathing-pacer')) centerTitle = "BREATHING PACER";
        else if (currentPath.includes('/productivity/habit-tracker')) centerTitle = "HABIT TRACKER";
        else if (currentPath.includes('/finance/investment-planner')) centerTitle = "INVESTMENT PLANNER";
        else if (currentPath.includes('/finance/sip-vs-fd-vs-rd-calculator')) centerTitle = "COMPARE INVESTMENT";
        else if (currentPath.includes('/finance/ppf-calculator')) centerTitle = "PPF CALCULATOR";
        else if (currentPath.includes('/finance/emi-calculator')) centerTitle = "EMI CALCULATOR";
        else if (currentPath.includes('/finance/safe-to-spend-calculator')) centerTitle = "SAFE-TO-SPEND";
        else if (currentPath.includes('/finance/reverse-investment-planner')) centerTitle = "REVERSE PLANNER";
        else if (currentPath === '/' || currentPath === '/index.html') centerTitle = "HOME";
        else if (document.title) {
            centerTitle = document.title.split(/\||-/)[0].trim().toUpperCase();
        }
    }

    // Dynamic Description detection
    let descTitle = "";
    if (document.title) {
        const titleParts = document.title.split(/\||-/);
        if (titleParts.length > 1) {
            let bestPart = "";
            let bestCleanedLength = 0;
            
            titleParts.forEach(part => {
                const cleanPart = part.trim();
                if (cleanPart.toLowerCase() === 'toolblaster') return;
                
                // Temp clean contents to test real description value
                let temp = cleanPart;
                const wordsToStrip = [centerTitle, "toolblaster"];
                if (centerTitle.includes(" ")) {
                    wordsToStrip.push(...centerTitle.split(" "));
                }
                wordsToStrip.forEach(word => {
                    if (word.length > 2) {
                        const regex = new RegExp(`\\b${word}\\b`, 'gi');
                        temp = temp.replace(regex, '');
                    }
                });
                const cleaned = temp.replace(/^[\s\-|:|,\/]+|[\s\-|:|,\/]+$/g, '').trim();
                
                if (cleaned.length > bestCleanedLength) {
                    bestPart = cleanPart;
                    bestCleanedLength = cleaned.length;
                }
            });
            
            if (!bestPart) {
                titleParts.forEach(part => {
                    const cleanPart = part.trim();
                    if (cleanPart.toLowerCase() !== 'toolblaster' && cleanPart.length > bestPart.length) {
                        bestPart = cleanPart;
                    }
                });
            }
            
            let tempDesc = bestPart;
            const wordsToStrip = [centerTitle, "toolblaster"];
            if (centerTitle.includes(" ")) {
                wordsToStrip.push(...centerTitle.split(" "));
            }
            wordsToStrip.forEach(word => {
                if (word.length > 2) {
                    const regex = new RegExp(`\\b${word}\\b`, 'gi');
                    tempDesc = tempDesc.replace(regex, '');
                }
            });
            
            descTitle = tempDesc.replace(/^[\s\-|:|,\/]+|[\s\-|:|,\/]+$/g, '').trim();
        } else {
            descTitle = document.title.trim();
        }
    }

    // --- DYNAMICALLY GENERATE APP DRAWER HTML ---
    let drawerCategoriesHtml = '';
    TOOLBLASTER_APPS.forEach((cat, index) => {
        if (index > 0) {
            drawerCategoriesHtml += `<div class="px-6 my-1 border-t border-stone-100"></div>`;
        }
        
        drawerCategoriesHtml += `
            <div class="px-4 py-2">
                <h3 class="text-[9px] font-black text-stone-600 uppercase tracking-widest mb-2 px-1 flex items-center gap-1.5">
                    <i class="fa-solid ${cat.icon}"></i> ${cat.category}
                </h3>
                <div class="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2">
        `;
        
        cat.apps.forEach(app => {
            drawerCategoriesHtml += `
                <a href="${app.url}" class="flex flex-col items-center justify-start p-1.5 rounded-lg hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-all group text-center">
                    <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${app.classes} flex items-center justify-center group-hover:scale-105 transition-transform mb-1 shadow-inner border">
                        <i class="fa-solid ${app.icon} text-[11px] sm:text-xs"></i>
                    </div>
                    <span class="text-[8px] sm:text-[9px] font-bold text-stone-700 leading-tight w-full line-clamp-2 ${app.classes.split(' ').find(c => c.startsWith('group-hover:text-'))} transition-colors">${app.name}</span>
                </a>
            `;
        });
        
        drawerCategoriesHtml += `</div></div>`;
    });

    headerContainer.innerHTML = `
        <style>
            @media (max-width: 639px) {
                .tb-mobile-only { display: block !important; }
                .tb-desktop-only { display: none !important; }
            }
            @media (min-width: 640px) {
                .tb-mobile-only { display: none !important; }
                .tb-desktop-only { display: block !important; }
            }
            #global-sidebar {
                visibility: hidden;
                transition: transform 320ms cubic-bezier(0.16, 1, 0.3, 1), visibility 320ms cubic-bezier(0.16, 1, 0.3, 1);
            }
            #global-sidebar.active {
                visibility: visible;
                transform: translateX(0) !important;
            }
        </style>
        
        <nav class="relative w-full bg-white border-b border-stone-300 shadow-sm z-[100]">
            <div class="mx-auto w-[95%] max-w-[1080px] h-12 flex items-center justify-between relative">
                
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
                        <span class="font-inter font-black text-lg tracking-tighter text-stone-900 tb-desktop-only sm:block">TOOL<span class="text-accent-main">BLASTER</span></span>
                    </a>
                </div>

                <!-- Center: Dynamic Page Name + Contextual Auto-Description -->
                <div class="absolute left-1/2 -translate-x-1/2 text-center flex flex-col sm:flex-row items-center justify-center w-full max-w-[55%] xs:max-w-[62%] sm:max-w-[70%] md:max-w-2xl pointer-events-none">
                    <span class="flex-shrink-0 font-inter font-extrabold text-[10px] xs:text-[11px] sm:text-[13px] md:text-sm tracking-[0.1em] sm:tracking-[0.15em] text-stone-900 uppercase sm:whitespace-nowrap leading-tight text-center">
                        ${centerTitle}
                    </span>
                    ${descTitle ? `
                        <span class="tb-desktop-only sm:inline-block text-stone-600 font-semibold tracking-widest text-[10px] ml-1.5 truncate flex-shrink min-w-0">- ${descTitle}</span>
                        <span class="tb-mobile-only text-stone-600 font-semibold tracking-widest text-[8px] truncate w-full leading-tight mt-0.5 flex-shrink min-w-0">${descTitle}</span>
                    ` : ''}
                </div>

                <!-- Right: Universal App Menu Button with Modern 9-Dot SVG -->
                <div class="flex items-center gap-3">
                    <button id="global-menu-btn" aria-label="Open App Menu" class="bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all active:scale-95 flex items-center gap-2">
                        <svg class="w-3.5 h-3.5 text-stone-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="4" cy="4" r="2"></circle>
                            <circle cx="12" cy="4" r="2"></circle>
                            <circle cx="20" cy="4" r="2"></circle>
                            <circle cx="4" cy="12" r="2"></circle>
                            <circle cx="12" cy="12" r="2"></circle>
                            <circle cx="20" cy="12" r="2"></circle>
                            <circle cx="4" cy="20" r="2"></circle>
                            <circle cx="12" cy="20" r="2"></circle>
                            <circle cx="20" cy="20" r="2"></circle>
                        </svg>
                        <span class="tb-desktop-only sm:inline">Explore Tools</span>
                    </button>
                </div>
            </div>
        </nav>

        <!-- Global Slide-over App Menu (Grid Drawer Style) -->
        <div id="global-sidebar-overlay" class="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[150] opacity-0 pointer-events-none transition-opacity duration-300"></div>
        <div id="global-sidebar" class="fixed inset-y-0 right-0 w-[300px] sm:w-[420px] bg-white z-[200] flex flex-col shadow-2xl border-l border-stone-200 translate-x-full">
            
            <!-- Sidebar Header with Perfectly Centered Home Link -->
            <div class="grid grid-cols-3 items-center px-4 py-3 sm:px-5 sm:py-4 border-b border-stone-100 bg-stone-50/50">
                <div class="flex justify-start">
                    <span class="font-black text-stone-900 tracking-widest text-xs uppercase flex items-center gap-2 whitespace-nowrap">
                        <i class="fa-solid fa-rocket text-red-500"></i> <span class="tb-desktop-only sm:inline">Drawer</span>
                    </span>
                </div>
                
                <div class="flex justify-center">
                    <a href="/" class="text-[10px] font-bold text-stone-600 hover:text-red-600 uppercase tracking-widest transition-colors flex items-center whitespace-nowrap">
                        Home
                    </a>
                </div>
                
                <div class="flex justify-end">
                    <button id="close-sidebar-btn" aria-label="Close Menu" class="text-stone-400 hover:text-red-600 w-7 h-7 flex items-center justify-center rounded-full bg-white border border-stone-200 shadow-sm transition-colors">
                        <i class="fa-solid fa-xmark text-sm"></i>
                    </button>
                </div>
            </div>
            
            <!-- Sidebar Scrollable Content (Dynamically Injected) -->
            <div class="flex-col overflow-y-auto pb-8 custom-scrollbar mt-2">
                ${drawerCategoriesHtml}
            </div>
            
        </div>
    `;

    // Global Menu Handlers
    const menuBtn = document.getElementById('global-menu-btn');
    const closeBtn = document.getElementById('close-sidebar-btn');
    const sidebar = document.getElementById('global-sidebar');
    const overlay = document.getElementById('global-sidebar-overlay');

    if(menuBtn && sidebar && overlay) {
        // Watertight mobile scroll-lock handling to prevent background scrolling
        const preventDefaultScroll = (e) => {
            if (sidebar.contains(e.target)) {
                return;
            }
            e.preventDefault();
        };

        const openMenu = () => {
            overlay.classList.remove('opacity-0', 'pointer-events-none');
            overlay.classList.add('opacity-100');
            sidebar.classList.add('active');
            
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            
            document.addEventListener('touchmove', preventDefaultScroll, { passive: false });
        };

        const closeMenu = () => {
            overlay.classList.remove('opacity-100');
            overlay.classList.add('opacity-0', 'pointer-events-none');
            sidebar.classList.remove('active');
            
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            
            document.removeEventListener('touchmove', preventDefaultScroll);
        };

        menuBtn.addEventListener('click', openMenu);
        closeBtn?.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);

        // Substantial Addition: ESC Key Listener to close overlay/drawer
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('active')) {
                closeMenu();
            }
        });
    }

    // Dynamic style inside sidebar
    const style = document.createElement('style');
    style.innerHTML = `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e7e5e4; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d6d3d1; }
    `;
    document.head.appendChild(style);
}

/**
 * Secondary Nav (Tool App Switcher) - Vertical & Horizontally Compact
 * DYNAMIC CONTEXT: Auto-detects current category and shows max 7 related tools.
 */
function injectToolNav() {
    const navContainer = document.getElementById('app-tool-nav');
    if (!navContainer) return;

    navContainer.style.minHeight = '36px';
    navContainer.className = "w-full relative z-[90]";

    const currentPath = window.location.pathname;
    const currentHost = window.location.hostname;

    // 1. Auto-Detect Current Active Category
    let activeCategory = null;
    for (const cat of TOOLBLASTER_APPS) {
        for (const tool of cat.apps) {
            if (tool.matchPath) {
                const cleanMatchPath = tool.matchPath.replace(/^\/|\/$/g, '');
                const cleanCurrentPath = currentPath.replace(/^\/|\/$/g, '');
                
                const boundaryRegex = new RegExp(`(^|\\/)${cleanMatchPath}($|\\/)`);
                if (boundaryRegex.test(cleanCurrentPath)) {
                    activeCategory = cat;
                    break;
                }
            }
            if (tool.matchHost && currentHost.includes(tool.matchHost)) {
                activeCategory = cat;
                break;
            }
        }
        if (activeCategory) break;
    }

    // 2. Select tools to show (Max 7 from active category, OR top 7 overall if on homepage)
    let toolsToShow = [];
    let categoryLabel = "Apps";
    
    if (activeCategory) {
        toolsToShow = activeCategory.apps.slice(0, 7);
        categoryLabel = activeCategory.category;
    } else {
        toolsToShow = TOOLBLASTER_APPS.flatMap(cat => cat.apps).slice(0, 7);
        categoryLabel = "Top Apps";
    }

    let linksHtml = '';
    
    // 3. Generate HTML for the selected tools with strict boundary checks
    toolsToShow.forEach(tool => {
        let isActive = false;
        if (tool.matchPath) {
            const cleanMatchPath = tool.matchPath.replace(/^\/|\/$/g, '');
            const cleanCurrentPath = currentPath.replace(/^\/|\/$/g, '');
            
            const boundaryRegex = new RegExp(`(^|\\/)${cleanMatchPath}($|\\/)`);
            if (boundaryRegex.test(cleanCurrentPath)) {
                isActive = true;
            }
        }
        if (tool.matchHost && currentHost.includes(tool.matchHost)) isActive = true;

        const activeClasses = "text-red-600 font-bold active-tool bg-white shadow-sm ring-1 ring-stone-200/60";
        const inactiveClasses = "font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/60";

        linksHtml += `
            <a href="${tool.url}" class="inline-flex items-center justify-center gap-1 text-[10px] transition-all duration-200 px-2 py-1 rounded-md flex-shrink-0 ${isActive ? activeClasses : inactiveClasses}">
                <i class="fa-solid ${tool.icon} text-[10px]"></i> ${tool.name}
            </a>
        `;
    });

    const style = `
        <style>
            .hide-nav-scrollbar::-webkit-scrollbar { display: none; }
            .hide-nav-scrollbar { -ms-overflow-style: none; scrollbar-width: none; scroll-behavior: smooth; }
        </style>
    `;

    navContainer.innerHTML = style + `
        <div id="sec-nav-inner" class="w-full bg-stone-100/95 backdrop-blur-md border-b border-stone-200 shadow-sm z-[90] transition-none">
            <div class="mx-auto w-[95%] max-w-[1080px]">
                <nav id="secondary-scroll-nav" class="flex items-center md:justify-center gap-1.5 h-9 overflow-x-auto whitespace-nowrap hide-nav-scrollbar px-1">
                    <span class="text-[9px] font-black text-stone-600 uppercase tracking-widest inline-block sticky left-0 bg-stone-100/95 backdrop-blur-md pr-2 z-10 py-2 shadow-[8px_0_10px_-5px_rgba(245,245,244,1)] flex-shrink-0">${categoryLabel}</span>
                    ${linksHtml}
                </nav>
            </div>
        </div>
    `;

    setTimeout(() => {
        const activeItem = document.querySelector('#secondary-scroll-nav .active-tool');
        const navScrollContainer = document.getElementById('secondary-scroll-nav');
        
        if (activeItem && navScrollContainer) {
            const containerRect = navScrollContainer.getBoundingClientRect();
            const itemRect = activeItem.getBoundingClientRect();
            
            const targetScrollLeft = navScrollContainer.scrollLeft + (itemRect.left - containerRect.left) - (containerRect.width / 2) + (itemRect.width / 2);
            navScrollContainer.scrollLeft = targetScrollLeft;
        }

        const innerNav = document.getElementById('sec-nav-inner');
        if (innerNav) {
            const handleScroll = () => {
                if (window.scrollY >= 48) {
                    innerNav.classList.add('fixed', 'top-0', 'left-0', 'right-0', 'w-full');
                } else {
                    innerNav.classList.remove('fixed', 'top-0', 'left-0', 'right-0', 'w-full');
                }
            };
            window.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll(); 
        }
    }, 100); 
}

/**
 * Global Footer
 * Dynamic Social Sharing, perfectly centered.
 */
function injectFooterAndModals() {
    const footerContainer = document.getElementById('app-footer');
    if (!footerContainer) return;

    footerContainer.className = "w-full mt-auto mb-0";

    const currentUrl = encodeURIComponent(window.location.href);
    const shareMsg = encodeURIComponent("Check out this useful tool on Toolblaster: ");

    footerContainer.innerHTML = `
        <footer class="bg-white border-t border-stone-200 w-full relative z-50">
            <div class="mx-auto w-[95%] max-w-[1080px] py-5">
                <div class="flex flex-col md:flex-row justify-between items-center gap-5 md:gap-4 w-full">
                    
                    <!-- Left Group: Copyright -->
                    <div class="w-full md:w-1/3 text-center md:text-left order-3 md:order-1 mt-1 md:mt-0">
                        <p class="text-[10px] text-stone-600 font-bold tracking-widest uppercase">
                            © ${new Date().getFullYear()} TOOLBLASTER.COM | ALL RIGHTS RESERVED.
                        </p>
                    </div>
                    
                    <!-- Center Group: Dynamic Social Share -->
                    <div class="w-full md:w-1/3 flex items-center justify-center gap-3 order-1 md:order-2">
                        <span class="text-[9px] font-black text-stone-500 uppercase tracking-[0.2em]">Share:</span>
                        <div class="flex items-center gap-4">
                            <!-- WhatsApp -->
                            <a href="https://api.whatsapp.com/send?text=${shareMsg}${currentUrl}" target="_blank" rel="noopener noreferrer" class="text-stone-500 hover:text-[#25D366] hover:scale-110 transition-all duration-300" aria-label="Share on WhatsApp">
                                <i class="fa-brands fa-whatsapp text-sm"></i>
                            </a>
                            <!-- Twitter / X -->
                            <a href="https://twitter.com/intent/tweet?text=${shareMsg}&url=${currentUrl}" target="_blank" rel="noopener noreferrer" class="text-stone-500 hover:text-stone-900 hover:scale-110 transition-all duration-300" aria-label="Share on X">
                                <svg class="w-3.5 h-3.5 fill-current inline-block pb-[1px]" viewBox="0 0 1200 1227" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"/>
                                </svg>
                            </a>
                            <!-- Facebook -->
                            <a href="https://www.facebook.com/sharer/sharer.php?u=${currentUrl}" target="_blank" rel="noopener noreferrer" class="text-stone-500 hover:text-[#1877F2] hover:scale-110 transition-all duration-300" aria-label="Share on Facebook">
                                <i class="fa-brands fa-facebook-f text-sm"></i>
                            </a>
                        </div>
                    </div>

                    <!-- Right Group: Legal Links -->
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
