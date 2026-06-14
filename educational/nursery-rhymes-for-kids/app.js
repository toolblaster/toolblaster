/**
 * Interactive Nursery Rhymes Tool for Kids
 * Dedicated Logic Layer decoupled from presentation HTML
 * Toolblaster Learning Station © 2026
 */

// Fallback Sandbox-Safe Storage Wrapper to prevent SecurityError in restricted iframes
const safeStorage = {
    getItem(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn("localStorage read blocked by browser sandbox policy. Using in-memory fallback.", e);
            return this._memoryStore[key] || null;
        }
    },
    setItem(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn("localStorage write blocked by browser sandbox policy. Using in-memory fallback.", e);
            this._memoryStore[key] = value;
        }
    },
    _memoryStore: {}
};

// Safe variables fetching from our sandbox-safe wrapper
let favoriteData = [];
try {
    const storedFavs = safeStorage.getItem('favoriteRhymes');
    favoriteData = storedFavs ? JSON.parse(storedFavs) : [];
} catch(e) { favoriteData = []; }

let playlistData = [];
try {
    const storedPlaylist = safeStorage.getItem('playlist');
    playlistData = (storedPlaylist ? JSON.parse(storedPlaylist) : []).filter(i => i && i.type === 'rhyme');
} catch(e) { playlistData = []; }

// Global Application namespace state tracking
window.TB = {
    allRhymes: [],
    currentRhymeList: [],
    favorites: favoriteData,
    playlist: playlistData,
    currentRhyme: null,
    isPlaylistMode: false,
    currentPlaylistIndex: -1,
    isBedtimeMode: false,
    soundEffectsEnabled: true
};

// Web Audio Synthesizer for 100% self-contained micro sound feedback
let audioCtx = null;
function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

// Play Sensory Feedback - Pop Sound Effect
function playPopSound() {
    if (!window.TB.soundEffectsEnabled) return;
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
    } catch(e) { console.warn("Audio Synthesizer block bypassed:", e); }
}

// Play Sensory Feedback - Chime Sound Effect
function playChimeSound() {
    if (!window.TB.soundEffectsEnabled) return;
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        
        const playNote = (freq, delay, dur) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
            gain.gain.setValueAtTime(0.08, ctx.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + delay);
            osc.stop(ctx.currentTime + delay + dur);
        };
        
        playNote(523.25, 0, 0.3);      // C5
        playNote(659.25, 0.08, 0.3);   // E5
        playNote(783.99, 0.16, 0.4);   // G5
    } catch(e) { console.warn("Audio Synthesizer block bypassed:", e); }
}

// Floating emoji sparkles particle burst generator
function triggerSparkles(x, y, emojiSymbol) {
    const count = 12;
    const container = document.body;
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'emoji-particle';
        particle.textContent = emojiSymbol;
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 120;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance - 80;
        const rot = -180 + Math.random() * 360;
        
        particle.style.setProperty('--dx', `${dx}px`);
        particle.style.setProperty('--dy', `${dy}px`);
        particle.style.setProperty('--rot', `${rot}deg`);
        
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        container.appendChild(particle);
        setTimeout(() => particle.remove(), 1200);
    }
}

// UTILITY: Generate SEO-friendly slug from title
function generateSlug(text) {
    if (!text) return '';
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

// Safe Start Application sequence with direct checks for iframe/sandbox readyState configurations
function startApp() {
    const rhymeGalleryView = document.getElementById('rhyme-gallery');
    const rhymeDetailView = document.getElementById('rhyme-detail');
    const rhymeOfTheDaySection = document.getElementById('rhyme-of-the-day');
    const rhymeGrid = document.getElementById('rhyme-grid');
    const controlsSection = document.getElementById('controls-section');
    const searchBar = document.getElementById('search-bar');
    
    // Interactive playroom controls nodes
    const speedSelectButton = document.getElementById('speed-toggle-btn');
    const speedMenu = document.getElementById('speed-dropdown-menu');
    const speedChevron = document.getElementById('speed-chevron');
    const speedDisplay = document.getElementById('speed-display');
    const bedtimeBtn = document.getElementById('bedtime-mode-btn');
    const audioFxBtn = document.getElementById('audio-fx-btn');

    if (rhymeGrid) rhymeGrid.classList.add('content-start');

    let isReading = false;
    let readingQueue = [];
    let englishVoice = null;
    let hindiVoice = null;

    function initVoices() {
        if (!window.speechSynthesis) return;
        const voices = window.speechSynthesis.getVoices();
        englishVoice = voices.find(v => v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Zira'))) || voices.find(v => v.lang === 'en-US');
        hindiVoice = voices.find(v => v.lang === 'hi-IN' && v.name.includes('Google')) || voices.find(v => v.lang === 'hi-IN');
    }
    
    if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = initVoices;
        initVoices();
    }

    // Dynamic Extraction of embedded DOM Nursery Rhymes Data (Single Source of Truth)
    function extractRhymesFromDOM() {
        const entries = document.querySelectorAll('#rhyme-database-dom .rhyme-entry');
        const list = [];
        entries.forEach(entry => {
            const id = parseInt(entry.dataset.id);
            const tagsAttr = entry.dataset.tags || '';
            const lyricsAttr = entry.dataset.lyrics || '';
            const lyricsHiAttr = entry.dataset.lyricsHi || '';
            
            list.push({
                id: id,
                title: entry.dataset.title || '',
                title_hi: entry.dataset.titleHi || '',
                category: entry.dataset.category || '',
                tags: tagsAttr ? tagsAttr.split(',') : [],
                icon: entry.dataset.icon || '\u{1F3B5}',
                lyrics: lyricsAttr.replace(/\\n/g, '\n'),
                lyrics_hi: lyricsHiAttr.replace(/\\n/g, '\n'),
                funFact: entry.dataset.funFact || '',
                funFact_hi: entry.dataset.funFactHi || '',
                isExclusive: entry.dataset.isExclusive === 'true',
                learningFocus: entry.dataset.learningFocus || ''
            });
        });
        return list;
    }

    function init() {
        window.TB.allRhymes = extractRhymesFromDOM();
        window.TB.currentRhymeList = [...window.TB.allRhymes];
        handleUrlParams();
        renderPlaylist();
        addBasicEventListeners();
        window.TB.speechRate = 1.0;
        
        // Initial render of gallery
        window.TB.filterRhymes();
    }

    // Attach all dynamic interface operations to the global window context
    window.TB.hideAllViews = function() {
        if (rhymeGalleryView) rhymeGalleryView.classList.add('hidden');
        if (rhymeDetailView) rhymeDetailView.classList.add('hidden');
        if (rhymeOfTheDaySection) rhymeOfTheDaySection.classList.add('hidden');
        if (controlsSection) controlsSection.classList.add('hidden');
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        isReading = false;
    };

    // Client-side search and render directly from embedded DOM Database
    window.TB.filterRhymes = function() {
        const val = searchBar.value.toLowerCase().trim();
        const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'Rhymes';
        
        if (!rhymeGrid) return;
        rhymeGrid.innerHTML = '';

        const rhymesToDisplay = window.TB.allRhymes.filter(details => {
            const titleMatch = details.title.toLowerCase().includes(val) || details.title_hi.toLowerCase().includes(val);
            const lyricsMatch = details.lyrics.toLowerCase().includes(val) || details.lyrics_hi.toLowerCase().includes(val);
            const searchMatch = !val || titleMatch || lyricsMatch;

            let categoryMatch = false;
            if (activeCategory === 'Rhymes') {
                categoryMatch = true;
            } else if (activeCategory === 'Favorites') {
                categoryMatch = window.TB.favorites.includes(details.id);
            } else if (activeCategory === 'Lullaby') {
                categoryMatch = details.tags.includes('lullaby');
            } else {
                categoryMatch = (details.category === activeCategory);
            }

            return searchMatch && categoryMatch;
        });

        if (rhymesToDisplay.length === 0) {
            rhymeGrid.innerHTML = '<p class="text-stone-500 col-span-full text-center py-12 font-medium">No rhymes found matching your criteria. Try another search or filter!</p>';
            return;
        }

        // Dynamically render filtered cards (using FontAwesome heart vectors)
        rhymesToDisplay.forEach(rhyme => {
            const card = document.createElement('div');
            card.className = 'rhyme-card h-max bg-white border border-stone-200 rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer hover:border-red-500 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative transition-colors duration-450';
            card.dataset.rhymeId = rhyme.id;
            
            const slug = generateSlug(rhyme.title);
            const isFav = window.TB.favorites.includes(rhyme.id);

            card.innerHTML = `
                <a href="?rhyme=${rhyme.id}-${slug}" class="flex-grow flex flex-col items-center justify-center no-underline text-stone-900 w-full h-full pb-2">
                    <div class="w-14 h-14 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-2xl mb-3 shadow-inner transition-all duration-400">
                        ${rhyme.icon || '\u{1F3B5}'}
                    </div>
                    <h3 class="text-xs font-bold text-stone-850 leading-snug px-1 transition-colors duration-450">${rhyme.title}</h3>
                    ${rhyme.title_hi ? `<span class="text-[10px] text-stone-500 font-hindi mt-1 px-1">${rhyme.title_hi}</span>` : ''}
                </a>
                <button class="fav-icon-grid absolute top-2 right-2 text-sm w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm border border-stone-200 flex items-center justify-center shadow-sm hover:scale-115 transition-transform" onclick="window.TB.toggleGridFavorite(${rhyme.id}, event)" title="Toggle Favorite">
                    <i class="${isFav ? 'fa-solid text-red-500' : 'fa-regular text-stone-300'} fa-heart"></i>
                </button>
            `;

            card.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                playPopSound();
                window.TB.showRhymeDetail(rhyme.id);
            });

            rhymeGrid.appendChild(card);
        });

        window.TB.currentRhymeList = rhymesToDisplay;
        applyThemeClasses();

        const galleryTitleEl = document.getElementById('gallery-title');
        if (galleryTitleEl) {
            const icons = { 'Animal': '\u{1F43E}', 'Learning': '\u{1F393}', 'Classic': '\u{1F4DC}', 'Indian': '\u{1F1EE}\u{1F1F3}', 'Lullaby': '\u{1F319}', 'Favorites': '\u{2764}\u{FE0F}' };
            if (val) {
                galleryTitleEl.textContent = `Results for "${val}" (${rhymesToDisplay.length})`;
            } else if (activeCategory !== 'Rhymes') {
                galleryTitleEl.textContent = `${activeCategory} Collection ${icons[activeCategory] || ''}`;
            } else {
                galleryTitleEl.textContent = "All Rhymes";
            }
        }
    };

    window.TB.showMainView = function(viewName) {
        window.TB.hideAllViews();
        if (controlsSection) controlsSection.classList.remove('hidden');
        resetMetaTags();

        if (rhymeGalleryView) rhymeGalleryView.classList.remove('hidden');
        if (rhymeOfTheDaySection) rhymeOfTheDaySection.classList.remove('hidden');
        
        updateActiveCategoryButton(viewName);
        window.TB.filterRhymes();
        displayRhymeOfTheDay();
    };

    function goHome() {
        playPopSound();
        if (searchBar) searchBar.value = '';
        window.TB.isPlaylistMode = false;
        window.TB.currentPlaylistIndex = -1;
        resetMetaTags();
        window.TB.showMainView('Rhymes');
        updateUrl({ category: 'Rhymes' });
    }

    function goBackToGallery() {
        playPopSound();
        window.TB.isPlaylistMode = false;
        const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'Rhymes';
        resetMetaTags();
        window.TB.showMainView(activeCategory);
        updateUrl({ category: activeCategory });
        
        setTimeout(() => {
            if (controlsSection) {
                const topPos = controlsSection.getBoundingClientRect().top + window.scrollY - 30;
                window.scrollTo({ top: Math.max(0, topPos), behavior: 'smooth' });
            }
        }, 50);
    }

    window.TB.toggleGridFavorite = function(id, event) {
        if (event) event.stopPropagation();
        playChimeSound();
        if (event && event.clientX && event.clientY) {
            triggerSparkles(event.clientX, event.clientY, '\u{2B50}'); // Unicode escaped stars sequence
        }
        
        const idx = window.TB.favorites.indexOf(id);
        if (idx > -1) {
            window.TB.favorites.splice(idx, 1);
        } else {
            window.TB.favorites.push(id);
        }
        safeStorage.setItem('favoriteRhymes', JSON.stringify(window.TB.favorites));
        
        const card = document.querySelector(`.rhyme-card[data-rhyme-id="${id}"]`);
        if (card) {
            const cardFav = card.querySelector('.fav-icon-grid');
            if (cardFav) {
                const isFavNow = window.TB.favorites.includes(id);
                cardFav.innerHTML = `<i class="${isFavNow ? 'fa-solid text-red-500' : 'fa-regular text-stone-300'} fa-heart"></i>`;
            }
        }
        
        // Vector icon dynamically passed to resolve broken diamond bug
        window.TB.showToast(idx > -1 ? 'Removed from Favorites <i class="fa-regular fa-heart ml-1 text-stone-400"></i>' : 'Added to Favorites! <i class="fa-solid fa-heart text-red-500 ml-1"></i>');
    };

    window.TB.showRhymeDetail = function(rhymeId, fromPlaylist = false, playlistIndex = -1) {
        window.TB.currentRhyme = window.TB.allRhymes.find(r => r.id === rhymeId);
        if (!window.TB.currentRhyme || !rhymeDetailView) return;
        window.TB.hideAllViews();
        rhymeDetailView.classList.remove('hidden');

        const slug = generateSlug(window.TB.currentRhyme.title);
        const seoUrlParam = `${rhymeId}-${slug}`;
        const rhymeUrl = `https://toolblaster.com/educational/nursery-rhymes-for-kids/?rhyme=${seoUrlParam}`;
        
        updateMetaTags(`${window.TB.currentRhyme.title} | Toolblaster Learning`, `Listen and read ${window.TB.currentRhyme.title}. Toolblaster's interactive learning station.`, rhymeUrl);
        updateUrl({ rhyme: seoUrlParam });
        
        window.TB.isPlaylistMode = fromPlaylist;
        window.TB.currentPlaylistIndex = fromPlaylist ? playlistIndex : -1;
        
        document.getElementById('rhyme-title-en').textContent = window.TB.currentRhyme.title;
        document.getElementById('rhyme-lyrics-en').textContent = window.TB.currentRhyme.lyrics;
        const titleHi = document.getElementById('rhyme-title-hi');
        const hindiCol = document.getElementById('hindi-column');
        if (window.TB.currentRhyme.title_hi) {
            titleHi.textContent = window.TB.currentRhyme.title_hi;
            document.getElementById('rhyme-lyrics-hi').textContent = window.TB.currentRhyme.lyrics_hi;
            if (hindiCol) hindiCol.classList.remove('hidden');
        } else {
            titleHi.textContent = '';
            if (hindiCol) hindiCol.classList.add('hidden');
        }

        const learning = document.getElementById('learning-focus-badge-container');
        if (window.TB.currentRhyme.learningFocus) {
            document.getElementById('learning-focus-badge').textContent = `Educational Focus: ${window.TB.currentRhyme.learningFocus}`;
            if (learning) learning.classList.remove('hidden');
        } else { if (learning) learning.classList.add('hidden'); }

        const funFact = document.getElementById('fun-fact-container');
        if (window.TB.currentRhyme.funFact) {
            document.getElementById('fun-fact-text-en').textContent = window.TB.currentRhyme.funFact;
            const hiText = document.getElementById('fun-fact-text-hi');
            if (window.TB.currentRhyme.funFact_hi) {
                hiText.textContent = window.TB.currentRhyme.funFact_hi;
                hiText.classList.remove('hidden');
            } else {
                hiText.classList.add('hidden');
            }
            if (funFact) funFact.classList.remove('hidden');
        } else { if (funFact) funFact.classList.add('hidden'); }

        const copyText = document.getElementById('copyright-text');
        copyText.textContent = window.TB.currentRhyme.isExclusive ? `Copyright \u{00A9} Toolblaster. Original Content.` : `Public Domain Learning Content.`;
        document.getElementById('copyright-notice-container').classList.remove('hidden');

        // Detail favorite button with standard FA Heart support
        const favBtn = document.getElementById('favorite-btn');
        if (favBtn) {
            const isFav = window.TB.favorites.includes(rhymeId);
            favBtn.innerHTML = `<i class="${isFav ? 'fa-solid text-red-500' : 'fa-regular text-stone-400 dark-theme-friendly'} fa-heart"></i>`;
            favBtn.title = isFav ? 'Remove from Favorites' : 'Add to Favorites';
        }
        
        const listToUse = window.TB.currentRhymeList.find(r => r.id === rhymeId) ? window.TB.currentRhymeList : window.TB.allRhymes;
        const idx = listToUse.findIndex(r => r.id === rhymeId);
        document.getElementById('previous-detail-rhyme-btn').disabled = idx <= 0;
        document.getElementById('next-detail-rhyme-btn').disabled = idx >= listToUse.length - 1;

        updateReadAloudBtn(document.getElementById('read-aloud-btn-rhyme'), false);
        updatePlaylistBtns();
        updatePlaylistNav();
        applyThemeClasses();

        const topPos = rhymeDetailView.getBoundingClientRect().top + window.scrollY - 30;
        window.scrollTo({ top: Math.max(0, topPos), behavior: 'smooth' });
    };

    function displayRhymeOfTheDay() {
        const day = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const rhyme = window.TB.allRhymes[day % window.TB.allRhymes.length];
        if (!rhyme) return;
        const iconEl = document.getElementById('rotd-icon');
        const titleEl = document.getElementById('rotd-title');
        const cardEl = document.getElementById('rotd-card');
        if (iconEl) iconEl.textContent = rhyme.icon || '\u{1F3B5}';
        if (titleEl) titleEl.textContent = rhyme.title;
        if (cardEl) {
            cardEl.onclick = () => {
                playPopSound();
                window.TB.showRhymeDetail(rhyme.id);
            };
        }
    }

    function toggleReadAloud(event) {
        if (!('speechSynthesis' in window)) { window.TB.showToast("TTS not supported in this browser."); return; }
        
        const btn = document.getElementById('read-aloud-btn-rhyme');

        if (isReading) { 
            window.speechSynthesis.cancel(); 
            isReading = false; 
            readingQueue = [];
            updateReadAloudBtn(btn, false);
            return; 
        }

        if (!window.TB.currentRhyme) return;

        playPopSound();
        if (event && event.clientX && event.clientY) {
            triggerSparkles(event.clientX, event.clientY, window.TB.currentRhyme.icon || '\u{1F3B5}');
        }

        let enParts = [window.TB.currentRhyme.lyrics]; 
        let hiParts = window.TB.currentRhyme.lyrics_hi ? [window.TB.currentRhyme.lyrics_hi] : [];

        readingQueue = [];

        const addToQueue = (textArray, lang, voice) => {
            if (!textArray) return;
            textArray.forEach(text => {
                if (!text || !text.trim()) return;
                const u = new SpeechSynthesisUtterance(text);
                u.lang = lang;
                if (voice) u.voice = voice;
                u.rate = window.TB.speechRate || 1.0;
                readingQueue.push(u);
            });
        };

        addToQueue(enParts, 'en-US', englishVoice);
        addToQueue(hiParts, 'hi-IN', hindiVoice);

        if (readingQueue.length === 0) return;

        isReading = true;
        updateReadAloudBtn(btn, true);
        
        let currentIdx = 0;

        const playNext = () => {
            if (!isReading) return; 
            if (currentIdx >= readingQueue.length) {
                isReading = false;
                updateReadAloudBtn(btn, false);
                return;
            }
            const utterance = readingQueue[currentIdx];
            utterance.onend = () => { currentIdx++; playNext(); };
            utterance.onerror = (e) => { console.error("TTS Error", e); currentIdx++; playNext(); };
            window.speechSynthesis.speak(utterance);
        };

        playNext();
    }

    function updateReadAloudBtn(btn, active) {
        if(btn) {
            btn.innerHTML = active ? '\u{23F8}\u{FE0F}' : '\u{1F4E2}';
            btn.classList.toggle('text-red-500', active);
            btn.classList.toggle('border-red-500', active);
            btn.title = active ? 'Stop' : 'Read Aloud';
        }
    }

    function toggleFavorite(id, btn, event) {
        playChimeSound();
        animateBtn(btn);
        
        if (event && event.clientX && event.clientY) {
            triggerSparkles(event.clientX, event.clientY, '\u{2764}\u{FE0F}');
        }

        const idx = window.TB.favorites.indexOf(id);
        if (idx > -1) window.TB.favorites.splice(idx, 1);
        else window.TB.favorites.push(id);
        
        safeStorage.setItem('favoriteRhymes', JSON.stringify(window.TB.favorites));
        
        const isFav = window.TB.favorites.includes(id);
        btn.innerHTML = `<i class="${isFav ? 'fa-solid text-red-500' : 'fa-regular text-stone-400 dark-theme-friendly'} fa-heart"></i>`;
        
        const card = document.querySelector(`.rhyme-card[data-rhyme-id="${id}"]`);
        if (card) {
            const cardFav = card.querySelector('.fav-icon-grid');
            if (cardFav) {
                cardFav.innerHTML = `<i class="${isFav ? 'fa-solid text-red-500' : 'fa-regular'} fa-heart"></i>`;
            }
        }
        
        // Sync toast to trigger smoothly inside main rhyme details view as well
        window.TB.showToast(idx > -1 ? 'Removed from Favorites <i class="fa-regular fa-heart ml-1 text-stone-400"></i>' : 'Added to Favorites! <i class="fa-solid fa-heart text-red-500 ml-1"></i>');
    }

    // Toggle Sidebar Playlist visibility
    function togglePlaylistView() {
        playPopSound();
        const overlay = document.getElementById('playlist-view');
        const sidebar = document.getElementById('playlist-sidebar');
        if (!overlay || !sidebar) return;
        
        if (overlay.classList.contains('hidden')) {
            renderPlaylist();
            overlay.classList.remove('hidden');
            
            document.body.classList.add('overflow-hidden');
            document.documentElement.classList.add('overflow-hidden');
            
            setTimeout(() => {
                sidebar.classList.remove('translate-x-full');
            }, 10);
        } else {
            sidebar.classList.add('translate-x-full');
            
            document.body.classList.remove('overflow-hidden');
            document.documentElement.classList.remove('overflow-hidden');
            
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 300);
        }
    }

    function renderPlaylist() {
        const countEl = document.getElementById('playlist-count');
        if (countEl) {
            countEl.textContent = window.TB.playlist.length;
            countEl.classList.toggle('hidden', window.TB.playlist.length === 0);
        }

        const container = document.getElementById('playlist-items');
        if (!container) return;
        container.innerHTML = '';
        
        const clearBtn = document.getElementById('clear-playlist-btn');
        if (clearBtn) clearBtn.disabled = window.TB.playlist.length === 0;

        if (window.TB.playlist.length === 0) {
            container.innerHTML = '<div class="text-center text-stone-400 py-10"><i class="fa-solid fa-list-ul text-3xl mb-3"></i><p class="font-medium text-sm">Your queue is empty.</p></div>';
            return;
        }

        window.TB.playlist.forEach((item, idx) => {
            let details = window.TB.allRhymes.find(r => r.id === item.id);
            if (!details) return;
            
            const div = document.createElement('div');
            const themeTextClass = window.TB.isBedtimeMode ? 'text-slate-300' : 'text-stone-850';
            const activeRowClass = window.TB.isPlaylistMode && idx === window.TB.currentPlaylistIndex 
                ? 'bg-red-500/10 border-red-400' 
                : (window.TB.isBedtimeMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-stone-200 hover:border-stone-300');
            
            div.className = `flex justify-between items-center p-3 rounded-xl border transition-all duration-400 ${activeRowClass}`;
            div.innerHTML = `
                <div class="cursor-pointer flex-grow flex items-center gap-3" onclick="window.TB.playFromPlaylist(${idx})">
                    <div class="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-sm shadow-inner text-stone-900">
                        ${window.TB.isPlaylistMode && idx === window.TB.currentPlaylistIndex ? '\u{1F50A}' : (details.icon || '\u{1F3B5}')}
                    </div>
                    <span class="font-bold text-sm ${themeTextClass}">${details.title}</span>
                </div>
                <button class="text-stone-400 hover:text-red-500 w-8 h-8 flex items-center justify-center transition-colors" onclick="window.TB.removeFromPlaylist(${item.id})"><i class="fa-solid fa-trash-can text-xs"></i></button>
            `;
            container.appendChild(div);
        });
    }

    window.TB.playFromPlaylist = function(idx) {
        togglePlaylistView();
        const item = window.TB.playlist[idx];
        window.TB.showRhymeDetail(item.id, true, idx);
    };

    window.TB.removeFromPlaylist = function(id) {
        playPopSound();
        window.TB.playlist = window.TB.playlist.filter(i => i.id !== id);
        safeStorage.setItem('playlist', JSON.stringify(window.TB.playlist));
        renderPlaylist();
        if (window.TB.currentRhyme && window.TB.currentRhyme.id === id) updatePlaylistBtns();
    };

    function addToPlaylist(id, btn, event) {
        playChimeSound();
        animateBtn(btn);
        
        if (event && event.clientX && event.clientY) {
            triggerSparkles(event.clientX, event.clientY, '\u{1F3B5}');
        }

        const exists = window.TB.playlist.some(i => i.id === id);
        if (exists) {
            window.TB.playlist = window.TB.playlist.filter(i => i.id !== id);
            window.TB.showToast('Removed from queue <i class="fa-solid fa-trash-can ml-1 text-stone-400"></i>');
        } else {
            window.TB.playlist.push({ id, type: 'rhyme' });
            window.TB.showToast('Added to queue! <i class="fa-solid fa-circle-check text-green-500 ml-1"></i>');
        }
        safeStorage.setItem('playlist', JSON.stringify(window.TB.playlist));
        renderPlaylist(); 
        updatePlaylistBtns();
    }

    function updatePlaylistBtns() {
        if(window.TB.currentRhyme) {
            const inList = window.TB.playlist.some(i => i.id === window.TB.currentRhyme.id);
            const btn = document.getElementById('add-to-playlist-btn');
            if (btn) btn.innerHTML = inList ? '<i class="fa-solid fa-check text-green-500"></i>' : '<i class="fa-solid fa-plus text-stone-600 dark-theme-friendly"></i>';
        }
    }

    function updatePlaylistNav() {
        const rNav = document.getElementById('playlist-nav-buttons');
        if (!rNav) return;
        rNav.classList.add('hidden'); 
        
        if (window.TB.isPlaylistMode && window.TB.playlist.length > 0) {
            const pos = document.getElementById('playlist-position');
            const prev = document.getElementById('prev-rhyme-btn');
            const next = document.getElementById('next-rhyme-btn');
            
            rNav.classList.remove('hidden');
            if (pos) pos.textContent = `Queue: ${window.TB.currentPlaylistIndex + 1} of ${window.TB.playlist.length}`;
            
            if (prev && next) {
                const newPrev = prev.cloneNode(true); prev.parentNode.replaceChild(newPrev, prev);
                const newNext = next.cloneNode(true); next.parentNode.replaceChild(newNext, next);
                
                newPrev.onclick = () => { if(window.TB.currentPlaylistIndex > 0) window.TB.playFromPlaylist(window.TB.currentPlaylistIndex - 1); };
                newNext.onclick = () => { if(window.TB.currentPlaylistIndex < window.TB.playlist.length - 1) window.TB.playFromPlaylist(window.TB.currentPlaylistIndex + 1); };
                
                newPrev.disabled = window.TB.currentPlaylistIndex <= 0;
                newNext.disabled = window.TB.currentPlaylistIndex >= window.TB.playlist.length - 1;
            }
        }
    }

    // Sleepy Bedtime Mode theme styling classes manipulator
    function applyThemeClasses() {
        const isBedtime = window.TB.isBedtimeMode;
        document.body.classList.toggle('theme-bedtime', isBedtime);
        
        const orb1 = document.getElementById('orb-1');
        const orb2 = document.getElementById('orb-2');
        const orb3 = document.getElementById('orb-3');
        const orb4 = document.getElementById('orb-4');
        if (orb1) {
            orb1.className = isBedtime
                ? "absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-900/20 blur-[120px]"
                : "absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-red-100/10 blur-[120px]";
        }
        if (orb2) {
            orb2.className = isBedtime
                ? "absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-900/30 blur-[100px]"
                : "absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-50/20 blur-[100px]";
        }
        if (orb3) {
            orb3.className = isBedtime
                ? "absolute top-[30%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-slate-900/20 blur-[80px]"
                : "absolute top-[30%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-yellow-50/10 blur-[80px]";
        }
        if (orb4) {
            orb4.className = isBedtime
                ? "absolute bottom-[20%] left-[20%] w-[25vw] h-[25vw] rounded-full bg-fuchsia-900/20 blur-[90px]"
                : "absolute bottom-[20%] left-[20%] w-[25vw] h-[25vw] rounded-full bg-pink-100/10 blur-[90px]";
        }
    }

    function toggleBedtimeMode() {
        playChimeSound();
        window.TB.isBedtimeMode = !window.TB.isBedtimeMode;
        
        const icon = document.getElementById('theme-btn-icon');
        const text = document.getElementById('theme-btn-text');
        if (icon) icon.textContent = window.TB.isBedtimeMode ? '\u{2600}\u{FE0F}' : '\u{1F319}';
        if (text) text.textContent = window.TB.isBedtimeMode ? 'Day Mode' : 'Bedtime Mode';
        
        applyThemeClasses();
        window.TB.showToast(window.TB.isBedtimeMode ? 'Sleepy Bedtime Mode Activated! <i class="fa-solid fa-moon text-yellow-300 ml-1"></i>' : 'Daylight Mode Restored! <i class="fa-solid fa-sun text-yellow-500 ml-1"></i>');
    }

    function toggleAudioFx() {
        window.TB.soundEffectsEnabled = !window.TB.soundEffectsEnabled;
        playPopSound();
        
        const icon = document.getElementById('audio-fx-icon');
        const text = document.getElementById('audio-fx-text');
        if (icon) icon.textContent = window.TB.soundEffectsEnabled ? '\u{1F50A}' : '\u{1F507}';
        if (text) text.textContent = window.TB.soundEffectsEnabled ? 'Magical Sounds' : 'Muted Sounds';
        
        window.TB.showToast(window.TB.soundEffectsEnabled ? 'Sensory Audio Enabled! <i class="fa-solid fa-volume-high ml-1"></i>' : 'Magical Sounds Muted! <i class="fa-solid fa-volume-xmark ml-1"></i>');
    }

    function shareContent() {
        let shareUrl = 'https://toolblaster.com/educational/nursery-rhymes-for-kids/';
        if (window.TB.currentRhyme && !document.getElementById('rhyme-detail').classList.contains('hidden')) {
            const slug = generateSlug(window.TB.currentRhyme.title);
            shareUrl += `?rhyme=${window.TB.currentRhyme.id}-${slug}`;
        }

        if (navigator.share) {
            navigator.share({ title: document.title, url: shareUrl }).catch(console.error);
        } else {
            navigator.clipboard.writeText(shareUrl);
            window.TB.showToast('Link copied to clipboard! <i class="fa-solid fa-circle-check text-green-500 ml-1"></i>');
        }
    }

    function surpriseMe() {
        const list = window.TB.allRhymes;
        const item = list[Math.floor(Math.random() * list.length)];
        window.TB.showRhymeDetail(item.id);
    }

    function addBasicEventListeners() {
        const backBtn = document.getElementById('back-button');
        if (backBtn) backBtn.addEventListener('click', goBackToGallery);
        
        if (searchBar) {
            searchBar.addEventListener('input', window.TB.filterRhymes);
        }

        const catFilters = document.getElementById('category-filters');
        if (catFilters) {
            catFilters.addEventListener('click', (e) => {
                const btn = e.target.closest('.category-btn');
                if (btn) {
                    playPopSound();
                    const cat = btn.dataset.category;
                    updateActiveCategoryButton(cat);
                    window.TB.showMainView(cat);
                    updateUrl({ category: cat });
                }
            });
        }

        const prevDetailBtn = document.getElementById('previous-detail-rhyme-btn');
        if (prevDetailBtn) {
            prevDetailBtn.addEventListener('click', () => {
                playPopSound();
                const list = window.TB.currentRhymeList.length ? window.TB.currentRhymeList : window.TB.allRhymes;
                const idx = list.findIndex(r => r.id === window.TB.currentRhyme.id) - 1;
                if(idx >= 0 && idx < list.length) window.TB.showRhymeDetail(list[idx].id);
            });
        }

        const nextDetailBtn = document.getElementById('next-detail-rhyme-btn');
        if (nextDetailBtn) {
            nextDetailBtn.addEventListener('click', () => {
                playPopSound();
                const list = window.TB.currentRhymeList.length ? window.TB.currentRhymeList : window.TB.allRhymes;
                const idx = list.findIndex(r => r.id === window.TB.currentRhyme.id) + 1;
                if(idx >= 0 && idx < list.length) window.TB.showRhymeDetail(list[idx].id);
            });
        }

        const readAloudBtn = document.getElementById('read-aloud-btn-rhyme');
        if (readAloudBtn) readAloudBtn.addEventListener('click', toggleReadAloud);
        
        const favBtn = document.getElementById('favorite-btn');
        if (favBtn) {
            favBtn.addEventListener('click', (e) => {
                toggleFavorite(window.TB.currentRhyme.id, e.currentTarget, e);
            });
        }
        
        const addPlaylistBtn = document.getElementById('add-to-playlist-btn');
        if (addPlaylistBtn) {
            addPlaylistBtn.addEventListener('click', (e) => {
                addToPlaylist(window.TB.currentRhyme.id, e.currentTarget, e);
            });
        }
        
        const playlistToggleBtn = document.getElementById('playlist-toggle-btn');
        if (playlistToggleBtn) playlistToggleBtn.addEventListener('click', togglePlaylistView);

        const closePlaylistBtn = document.getElementById('close-playlist-btn');
        if (closePlaylistBtn) closePlaylistBtn.addEventListener('click', togglePlaylistView);
        
        // Custom speed selector triggers with snappy rendering animations
        if (speedSelectButton) {
            speedSelectButton.addEventListener('click', (e) => {
                e.stopPropagation();
                playPopSound();
                const isHidden = speedMenu.classList.contains('hidden');
                if (isHidden) {
                    speedMenu.classList.remove('hidden');
                    requestAnimationFrame(() => {
                        speedMenu.classList.remove('scale-95', 'opacity-0');
                        speedMenu.classList.add('scale-100', 'opacity-100');
                    });
                    if (speedChevron) speedChevron.classList.add('rotate-180');
                    speedSelectButton.setAttribute('aria-expanded', 'true');
                } else {
                    closeSpeedDropdown();
                }
            });
        }

        // Dropdown speed option items selection
        document.querySelectorAll('.speed-option-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const targetVal = parseFloat(item.dataset.value);
                window.TB.speechRate = targetVal;
                playPopSound();
                
                document.querySelectorAll('.speed-option-item').forEach(opt => {
                    opt.classList.remove('selected-active', 'bg-red-500', 'text-white');
                    opt.classList.add('hover:bg-red-50', 'hover:text-red-700', 'text-stone-700');
                });
                item.classList.remove('hover:bg-red-50', 'hover:text-red-700', 'text-stone-700');
                item.classList.add('selected-active', 'bg-red-500', 'text-white');

                const speedEmojis = { 0.7: '\u{1F422} Slow', 1.0: '\u{23F1} Normal', 1.3: '\u{1F680} Fast' };
                if (speedDisplay) speedDisplay.textContent = speedEmojis[targetVal] || `\u{23F1} ${targetVal}x`;
                
                window.TB.showToast(`Reading Speed Set to: ${item.textContent.trim()} <i class="fa-solid fa-gauge-high ml-1"></i>`);
                closeSpeedDropdown();
            });
        });

        // Global outside click listeners to auto close speed dropdown menu
        document.addEventListener('click', (e) => {
            const speedWrapper = document.getElementById('speed-wrapper');
            if (speedWrapper && !speedWrapper.contains(e.target)) {
                closeSpeedDropdown();
            }
        });

        function closeSpeedDropdown() {
            if (speedMenu && !speedMenu.classList.contains('hidden')) {
                speedMenu.classList.remove('scale-100', 'opacity-100');
                speedMenu.classList.add('scale-95', 'opacity-0');
                if (speedChevron) speedChevron.classList.remove('rotate-180');
                if (speedSelectButton) speedSelectButton.setAttribute('aria-expanded', 'false');
                setTimeout(() => {
                    speedMenu.classList.add('hidden');
                }, 150);
            }
        }
        
        if (bedtimeBtn) bedtimeBtn.addEventListener('click', toggleBedtimeMode);
        if (audioFxBtn) audioFxBtn.addEventListener('click', toggleAudioFx);
        
        const playlistOverlay = document.getElementById('playlist-view');
        if (playlistOverlay) {
            playlistOverlay.addEventListener('click', (e) => {
                if (e.target.id === 'playlist-view') {
                    togglePlaylistView();
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (playlistOverlay && !playlistOverlay.classList.contains('hidden')) {
                togglePlaylistView();
            }
        });

        const clearPlaylistBtn = document.getElementById('clear-playlist-btn');
        if (clearPlaylistBtn) {
            clearPlaylistBtn.addEventListener('click', () => { 
                window.TB.playlist = []; 
                safeStorage.setItem('playlist', '[]'); 
                renderPlaylist(); 
                window.TB.showToast('Cleared Playback Queue <i class="fa-solid fa-trash-can ml-1 text-stone-400"></i>');
            });
        }

        const shareBtn = document.getElementById('share-rhyme-btn');
        if (shareBtn) shareBtn.addEventListener('click', shareContent);

        const printBtn = document.getElementById('print-rhyme-btn');
        if (printBtn) {
            printBtn.addEventListener('click', () => { 
                document.body.classList.add('printing-rhyme'); 
                window.print(); 
                document.body.classList.remove('printing-rhyme'); 
            });
        }

        const surpriseBtn = document.getElementById('surprise-button');
        if (surpriseBtn) surpriseBtn.addEventListener('click', surpriseMe);
    }

    function updateActiveCategoryButton(cat) {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`.category-btn[data-category="${cat}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    const origTitle = document.title;
    const origDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    function updateMetaTags(t, d, url) {
        document.title = t;
        const descMeta = document.querySelector('meta[name="description"]');
        if (descMeta) descMeta.setAttribute('content', d);
        
        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute('content', url);
        
        let link = document.querySelector('link[rel="canonical"]');
        if (!link) {
            link = document.createElement('link');
            link.rel = 'canonical';
            document.head.appendChild(link);
        }
        link.setAttribute('href', url);
    }
    
    function resetMetaTags() { updateMetaTags(origTitle, origDesc, 'https://toolblaster.com/educational/nursery-rhymes-for-kids/'); }
    
    function updateUrl(params) {
        let isDetail = false;
        try {
            const url = new URL(window.location);
            url.search = '';
            for (const k in params) { 
                if(params[k]) { 
                    url.searchParams.set(k, params[k]); 
                    if(['rhyme'].includes(k)) isDetail = true; 
                } 
            }
            if (window.location.protocol !== 'blob:' && window.location.protocol !== 'about:') {
                window.history.pushState({}, '', url.pathname + url.search);
            }
        } catch (e) {
            console.warn("URL history updates skipped in sandbox environment:", e.message);
        }
        const currentParams = new URLSearchParams(params);
        const searchStr = currentParams.toString() ? '?' + currentParams.toString() : '';
        const canonicalUrl = isDetail ? `https://toolblaster.com/educational/nursery-rhymes-for-kids/${searchStr}` : 'https://toolblaster.com/educational/nursery-rhymes-for-kids/';
        const currentDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || origDesc;
        updateMetaTags(isDetail ? document.title : origTitle, currentDesc, canonicalUrl);
    }

    function handleUrlParams() {
        const p = new URLSearchParams(window.location.search);
        if (p.get('rhyme')) window.TB.showRhymeDetail(parseInt(p.get('rhyme')));
        else if (p.get('category')) { updateActiveCategoryButton(p.get('category')); window.TB.showMainView(p.get('category')); }
        else { resetMetaTags(); window.TB.showMainView('Rhymes'); }
    }
    
    function animateBtn(btn) {
        btn.classList.add('animate-pop');
        setTimeout(() => btn.classList.remove('animate-pop'), 300);
    }

    // Completely reworked to render safe HTML layouts dynamically bypassing native system font encoding issues
    window.TB.showToast = function(msg) {
        const t = document.getElementById('toast-notification');
        if (t) {
            t.innerHTML = msg;
            t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 2500);
        }
    };

    init();
}

// Fallback robust start execution to prevent DOMContentLoaded mismatch in dynamic frame environments
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}
