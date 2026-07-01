        const STORAGE_VERSION = 1;
        const StorageProxy = {
            get(key, defaultValue) {
                try {
                    const raw = localStorage.getItem(key);
                    if (!raw) return defaultValue;
                    const parsed = JSON.parse(raw);
                    if (parsed && typeof parsed === 'object' && 'version' in parsed) {
                        if (parsed.version === STORAGE_VERSION) return parsed.data;
                    }
                    return parsed;
                } catch (e) {
                    console.error("StorageProxy read error:", e);
                    return defaultValue;
                }
            },
            set(key, val) {
                try {
                    const envelope = { version: STORAGE_VERSION, data: val };
                    localStorage.setItem(key, JSON.stringify(envelope));
                    return true;
                } catch (e) {
                    console.error("StorageProxy write error:", e);
                    return false;
                }
            }
        };

        // ENCAPSULATED KEYBOARD REGISTRY
        var KEYBOARD_REGISTRY = {
            charToCodeMap: {
                'q': 'KeyQ', 'w': 'KeyW', 'e': 'KeyE', 'r': 'KeyR', 't': 'KeyT', 'y': 'KeyY', 'u': 'KeyU', 'i': 'KeyI', 'o': 'KeyO', 'p': 'KeyP', '[': 'BracketLeft', ']': 'BracketRight',
                'a': 'KeyA', 's': 'KeyS', 'd': 'KeyD', 'f': 'KeyF', 'g': 'KeyG', 'h': 'KeyH', 'j': 'KeyJ', 'k': 'KeyK', 'l': 'KeyL', ';': 'Semicolon', "'": 'Quote',
                'z': 'KeyZ', 'x': 'KeyX', 'c': 'KeyC', 'v': 'KeyV', 'b': 'KeyB', 'n': 'KeyN', 'm': 'KeyM', ',': 'Comma', '.': 'Period', '/': 'Slash',
                'Q': 'KeyQ', 'W': 'KeyW', 'E': 'KeyE', 'R': 'KeyR', 'T': 'KeyT', 'Y': 'KeyY', 'U': 'KeyU', 'I': 'KeyI', 'O': 'KeyO', 'P': 'KeyP', '{': 'BracketLeft', '}': 'BracketRight',
                'A': 'KeyA', 'S': 'KeyS', 'D': 'KeyD', 'F': 'KeyF', 'G': 'KeyG', 'H': 'KeyH', 'J': 'KeyJ', 'K': 'KeyK', 'L': 'KeyL', ':': 'Semicolon', '"': 'Quote',
                'Z': 'KeyZ', 'X': 'KeyX', 'C': 'KeyC', 'V': 'KeyV', 'B': 'KeyB', 'N': 'KeyN', 'M': 'KeyM', '<': 'Comma', '>': 'Period', '?': 'Slash'
            },
            layouts: {
                english_qwerty: {
                    displayName: "English QWERTY",
                    forwardMap: {},
                    backwardMap: {},
                    forwardMapShifted: {}
                },
                hindi_inscript: {
                    displayName: "Hindi Inscript (Mangal)",
                    forwardMap: {
                        'KeyQ': 'ौ', 'KeyW': 'ै', 'KeyE': 'ा', 'KeyR': 'ी', 'KeyT': 'ू', 'KeyY': 'भ', 'KeyU': 'ह', 'KeyI': 'ग', 'KeyO': 'द', 'KeyP': 'ज', 'BracketLeft': 'ड', 'BracketRight': 'ृ',
                        'KeyA': 'ो', 'KeyS': 'े', 'KeyD': '्', 'KeyF': 'ि', 'KeyG': 'ु', 'KeyH': 'प', 'KeyJ': 'र', 'KeyK': 'क', 'KeyL': 'त', 'Semicolon': 'च', 'Quote': 'ट',
                        'KeyZ': '़', 'KeyX': 'ं', 'KeyC': 'म', 'KeyV': 'न', 'KeyB': 'व', 'KeyN': 'ल', 'KeyM': 'स', 'Comma': ',', 'Period': '.', 'Slash': 'य',
                        'Space': ' '
                    },
                    forwardMapShifted: {
                        'KeyQ': 'औ', 'KeyW': 'ऐ', 'KeyE': 'आ', 'KeyR': 'ई', 'KeyT': 'ऊ', 'KeyY': 'भ', 'KeyU': 'ङ', 'KeyI': 'घ', 'KeyO': 'ध', 'KeyP': 'झ', 'BracketLeft': 'ढ', 'BracketRight': 'ञ',
                        'KeyA': 'ओ', 'KeyS': 'ए', 'KeyD': 'अ', 'KeyF': 'इ', 'KeyG': 'उ', 'KeyH': 'फ', 'KeyJ': 'ऱ', 'KeyK': 'ख', 'KeyL': 'थ', 'Semicolon': 'छ', 'Quote': 'ठ',
                        'KeyZ': 'ॐ', 'KeyX': 'ँ', 'KeyC': 'ण', 'KeyV': 'न', 'KeyB': 'ष', 'KeyN': 'ळ', 'KeyM': 'श', 'Comma': 'ष', 'Period': '।', 'Slash': 'य',
                        'Digit1': '१', 'Digit2': '२', 'Digit3': '३', 'Digit4': '४', 'Digit5': '५', 'Digit6': '६', 'Digit7': '७', 'Digit8': '८', 'Digit9': '९', 'Digit0': '०'
                    },
                    backwardMap: {
                        'क': 'k', 'ख': 'K', 'ग': 'i', 'घ': 'I', 'च': ';', 'छ': ':', 'ज': 'p', 'झ': 'P', 'ट': "'", 'ठ': '"', 'ड': '[', 'ढ': '{', 'ण': 'C',
                        'त': 'l', 'थ': 'L', 'द': 'o', 'ध': 'O', 'न': 'v', 'प': 'h', 'फ': 'H', 'ब': 'y', 'भ': 'Y', 'म': 'c', 'य': '/', 'र': 'j', 'ल': 'n',
                        'व': 'b', 'श': 'M', 'ष': 'K', 'स': 'm', 'ह': 'u', 'ा': 'e', 'ि': 'f', 'ी': 'r', 'ु': 'g', 'ू': 't', 'े': 's', 'ै': 'w', 'ो': 'a', 'ौ': 'q', '्': 'd', 'ं': 'x'
                    }
                },
                hindi_remington: {
                    displayName: "Hindi Remington (Krutidev Legacy)",
                    forwardMap: {
                        'KeyQ': 'ु', 'KeyW': 'ू', 'KeyE': 'म', 'KeyR': 'त', 'KeyT': 'ज', 'KeyY': 'ल', 'KeyU': 'न', 'KeyI': 'प', 'KeyO': 'व', 'KeyP': 'च', 'BracketLeft': 'ख', 'BracketRight': 'ह',
                        'KeyA': 'ं', 'KeyS': 'क', 'KeyD': 'ि', 'KeyF': 'ह', 'KeyG': 'ी', 'KeyH': 'अ', 'KeyJ': 'र', 'KeyK': 'ा', 'KeyL': 'स', 'Semicolon': 'य', 'Quote': 'श',
                        'KeyZ': '्र', 'KeyX': 'ग', 'KeyC': 'ब', 'KeyV': 'अ', 'KeyB': 'इ', 'KeyN': 'द', 'KeyM': 'ध', 'Comma': 'ए', 'Period': 'ण', 'Slash': 'ध',
                        'Space': ' '
                    },
                    forwardMapShifted: {
                        'KeyQ': 'फ', 'KeyW': 'ॅ', 'KeyE': 'म्', 'KeyR': 'त्', 'KeyT': 'ज्', 'KeyY': 'ल्', 'KeyU': 'न्', 'KeyI': 'प्', 'KeyO': 'व्', 'KeyP': 'च्', 'BracketLeft': 'ख्', 'BracketRight': 'ऋ',
                        'KeyA': 'ा', 'KeyS': 'क्', 'KeyD': 'ध', 'KeyF': '्ह', 'KeyG': 'घ', 'KeyH': 'न्भ', 'KeyJ': 'श्र', 'KeyK': 'ा', 'KeyL': 'स्', 'Semicolon': '्य', 'Quote': 'ष',
                        'KeyZ': 'र्र', 'KeyX': 'ग्', 'KeyC': 'ब्', 'KeyV': 'ट', 'KeyB': 'ठ', 'KeyN': 'छ', 'KeyM': 'ड', 'Comma': 'श्', 'Period': '।', 'Slash': '?',
                        'Equal': 'ृ', 'Digit5': 'ज्ञ', 'Digit6': 'त्र', 'Digit7': 'क्ष', 'Digit8': 'श्र'
                    },
                    backwardMap: {
                        'क': 's', 'ख': '[', 'ग': 'x', 'घ': '?', 'च': 'p', 'छ': 'N', 'ज': 't', 'झ': 'I', 'ट': 'v', 'ठ': 'V', 'ड': 'f', 'ढ': 'F', 'ण': 'C',
                        'त': 'r', 'थ': 'F', 'द': 'n', 'ध': 'm', 'न': 'u', 'प': 'i', 'फ': 'o', 'ब': 'c', 'भ': 'y', 'म': 'e', 'य': ';', 'र': 'j', 'ल': 'y',
                        'व': 'o', 'श': 'C', 'ष': '"', 'स': 'l', 'ह': 'g', 'ा': 'k', 'ि': 'd', 'ी': 'h', 'ु': 'q', 'ू': 'w', 'े': 's', 'ै': '`', 'ो': 'a', '्': 'd'
                    }
                }
            }
        };
        window.KEYBOARD_REGISTRY = KEYBOARD_REGISTRY;

        var keyboardKeysDefinitions = {
            row1: [
                { key: '`', label: '`', class: 'key-pinky', code: 'Backquote' },
                { key: '1', label: '1', class: 'key-pinky', code: 'Digit1' },
                { key: '2', label: '2', class: 'key-ring', code: 'Digit2' },
                { key: '3', label: '3', class: 'key-middle', code: 'Digit3' },
                { key: '4', label: '4', class: 'key-index-l', code: 'Digit4' },
                { key: '5', label: '5', class: 'key-index-l', code: 'Digit5' },
                { key: '6', label: '6', class: 'key-index-r', code: 'Digit6' },
                { key: '7', label: '7', class: 'key-index-r', code: 'Digit7' },
                { key: '8', label: '8', class: 'key-middle', code: 'Digit8' },
                { key: '9', label: '9', class: 'key-ring', code: 'Digit9' },
                { key: '0', label: '0', class: 'key-pinky', code: 'Digit0' },
                { key: '-', label: '-', class: 'key-pinky', code: 'Minus' },
                { key: '=', label: '=', class: 'key-pinky', code: 'Equal' },
                { key: 'Backspace', label: 'Backspace', class: 'key-pinky w-20 text-[10px]', code: 'Backspace' }
            ],
            row2: [
                { key: 'Tab', label: 'Tab', class: 'key-pinky w-14 text-[10px]', code: 'Tab' },
                { key: 'q', label: 'Q', class: 'key-pinky', code: 'KeyQ' },
                { key: 'w', label: 'W', class: 'key-ring', code: 'KeyW' },
                { key: 'e', label: 'E', class: 'key-middle', code: 'KeyE' },
                { key: 'r', label: 'R', class: 'key-index-l', code: 'KeyR' },
                { key: 't', label: 'T', class: 'key-index-l', code: 'KeyT' },
                { key: 'y', label: 'Y', class: 'key-index-r', code: 'KeyY' },
                { key: 'u', label: 'U', class: 'key-index-r', code: 'KeyU' },
                { key: 'i', label: 'I', class: 'key-middle', code: 'KeyI' },
                { key: 'o', label: 'O', class: 'key-ring', code: 'KeyO' },
                { key: 'p', label: 'P', class: 'key-pinky', code: 'KeyP' },
                { key: '[', label: '[', class: 'key-pinky', code: 'BracketLeft' },
                { key: ']', label: ']', class: 'key-pinky', code: 'BracketRight' },
                { key: '\\', label: '\\', class: 'key-pinky w-12', code: 'Backslash' }
            ],
            row3: [
                { key: 'CapsLock', label: 'Caps', class: 'key-pinky w-16 text-[10px]', code: 'CapsLock' },
                { key: 'a', label: 'A', class: 'key-pinky', code: 'KeyA' },
                { key: 's', label: 'S', class: 'key-ring', code: 'KeyS' },
                { key: 'd', label: 'D', class: 'key-middle', code: 'KeyD' },
                { key: 'f', label: 'F', class: 'key-index-l', code: 'KeyF' },
                { key: 'g', label: 'G', class: 'key-index-l', code: 'KeyG' },
                { key: 'h', label: 'H', class: 'key-index-r', code: 'KeyH' },
                { key: 'j', label: 'J', class: 'key-index-r', code: 'KeyJ' },
                { key: 'k', label: 'K', class: 'key-middle', code: 'KeyK' },
                { key: 'l', label: 'L', class: 'key-ring', code: 'KeyL' },
                { key: ';', label: ';', class: 'key-pinky', code: 'Semicolon' }, // FIXED: Restored Semicolon code mapping to resolve 'Cha' loading
                { key: '\'', label: '\'', class: 'key-pinky', code: 'Quote' },
                { key: 'Enter', label: 'Enter', class: 'key-pinky w-20 text-[10px]', code: 'Enter' }
            ],
            row4: [
                { key: 'ShiftLeft', label: 'Shift', class: 'key-pinky w-20 text-[10px]', code: 'ShiftLeft' },
                { key: 'z', label: 'Z', class: 'key-pinky', code: 'KeyZ' },
                { key: 'x', label: 'X', class: 'key-ring', code: 'KeyX' },
                { key: 'c', label: 'C', class: 'key-middle', code: 'KeyC' },
                { key: 'v', label: 'V', class: 'key-index-l', code: 'KeyV' }, 
                { key: 'b', label: 'B', class: 'key-index-l', code: 'KeyB' }, 
                { key: 'n', label: 'N', class: 'key-index-r', code: 'KeyN' },
                { key: 'm', label: 'M', class: 'key-index-r', code: 'KeyM' },
                { key: ',', label: ',', class: 'key-middle', code: 'Comma' },
                { key: '.', label: '.', class: 'key-ring', code: 'Period' },
                { key: '/', label: '/', class: 'key-pinky', code: 'Slash' },
                { key: 'ShiftRight', label: 'Shift', class: 'key-pinky w-24 text-[10px]', code: 'ShiftRight' }
            ],
            row5: [
                { key: 'ControlLeft', label: 'Ctrl', class: 'key-pinky w-12 text-[10px]', code: 'ControlLeft' },
                { key: 'AltLeft', label: 'Alt', class: 'key-thumb w-12 text-[10px]', code: 'AltLeft' },
                { key: ' ', label: 'Space Bar', class: 'key-thumb flex-1 h-10', code: 'Space' },
                { key: 'AltRight', label: 'Alt', class: 'key-thumb w-12 text-[10px]', code: 'AltRight' },
                { key: 'ControlRight', label: 'Ctrl', class: 'key-pinky w-12 text-[10px]', code: 'ControlRight' }
            ]
        };
        window.keyboardKeysDefinitions = keyboardKeysDefinitions;

        var GOVT_EXAMS_PRESETS = {
            english_qwerty: {
                test_1: "Touch typing is a skill that uses muscle memory to go super fast on key rows without looking. Speed builds up dynamically over time.",
                test_2: "Staff Selection Commission standards require typing over 35 Words Per Minute. Focus strictly on maintaining 97% accuracy continuously.",
                test_3: "Judiciary examinations verify rigorous speed benchmarks. Eliminate friction keys by utilizing local feedback graphs to pass clerk posts.",
                test_4: "We, the people of India, having solemnly resolved to constitute India into a Sovereign Socialist Secular Democratic Republic."
            },
            hindi_inscript: {
                test_1: "भारत हमारा महान देश है। हम सब इसके गौरवशाली इतिहास और समृद्ध संस्कृति का सम्मान करते हैं। निरंतर अभ्यास से हमारी टंकण गति और सटीकता में सुधार होगा।",
                test_2: "सरकारी लिपिकीय परीक्षा में सफलता पाने के लिए न्यूनतम पैंटीस शब्द प्रति minute की गति होना आवश्यक है। अपनी एकाग्रता बनाए रखें और अभ्यास करें।",
                test_3: "उच्च न्यायालय लिपिक वर्ग परीक्षा में सटीकता पर विशेष ध्यान दिया जाता है। प्रत्येक सही टंकण आपके आत्मविश्वास को बढ़ाएगा और लक्ष्य के निकट ले जाएगा।",
                test_4: "हम भारत के लोग, भारत को एक संपूर्ण प्रभुत्व-संपन्न, समाजवादी, पंथनिरपेक्ष, लोकतंत्रात्मक गणराज्य बनाने के लिए तथा उसके समस्त नागरिकों को न्याय दिलाने का संकल्प लेते हैं।"
            },
            hindi_remington: {
                test_1: "भारत हमारा महान देश है। हम सब इसके गौरवशाली इतिहास और समृद्ध संस्कृति का सम्मान करते हैं। निरंतर अभ्यास से हमारी टंकण गति और सटीकता में सुधार होगा।",
                test_2: "सरकारी लिपिकीय परीक्षा में सफलता पाने के लिए न्यूनतम पैंटीस शब्द प्रति minute की गति होना आवश्यक है। अपनी एकाग्रता बनाए रखें और अभ्यास करें।",
                test_3: "उच्च न्यायालय लिपिक वर्ग परीक्षा में सटीकता पर विशेष ध्यान दिया जाता है। प्रत्येक सही टंकण आपके आत्मविश्वास को बढ़ाएगा और लक्ष्य के निकट ले जाएगा।",
                test_4: "हम भारत के लोग, भारत को एक संपूर्ण प्रभुत्व-संपन्न, समाजवादी, पंथनिरपेक्ष, लोकतंत्रात्मक गणराज्य बनाने के लिए तथा उसके समस्त नागरिकों को न्याय दिलाने का संकल्प लेते हैं।"
            }
        };
        window.GOVT_EXAMS_PRESETS = GOVT_EXAMS_PRESETS;

        var GENERATOR_CHARSETS = {
            english_qwerty: {
                home_row: "asdfghjkl",
                top_row: "qwertyuiop",
                bottom_row: "zxcvbnm"
            },
            hindi_inscript: {
                home_row: "कतरपजचटमरनस",
                top_row: "ौैाीूभहगदजडृ",
                bottom_row: "़ंममवल्सय"
            },
            hindi_remington: {
                home_row: "ककिकहरीजसश",
                top_row: "ुूममत्तज्जल्ल",
                bottom_row: "र्रगबअइद्ध"
            }
        };
        window.GENERATOR_CHARSETS = GENERATOR_CHARSETS;

        class DevnagariKeyMasterApp {
            constructor() {
                this.state = {
                    currentLayout: 'hindi_inscript',
                    currentCategory: 'home_row',
                    currentActiveLessonWords: [],
                    activeWordIndex: 0,
                    typedKeystrokesBuffer: "",
                    incorrectKeystrokesCount: 0,
                    totalKeystrokesCount: 0,
                    practiceStartTime: null,
                    isPracticeActive: false,
                    acousticSwitchType: 'blue', 
                    isHeatmapActive: false,
                    currentTimerDuration: 0, 
                    timeRemainingSeconds: 0,
                    isShiftActive: false, 
                    isKeyboardVisible: true,
                    bestWpmRecord: parseInt(StorageProxy.get('keymaster_best_wpm', 0)) || 0,
                    bestAccuracyRecord: parseInt(StorageProxy.get('keymaster_best_accuracy', 0)) || 0,
                    
                    streakCurrent: parseInt(StorageProxy.get('keymaster_streak_current', 0)) || 0,
                    streakBest: parseInt(StorageProxy.get('keymaster_streak_best', 0)) || 0,
                    streakLastDate: StorageProxy.get('keymaster_streak_last_date', null),

                    practiceHistory: StorageProxy.get('keymaster_practice_history', []) || [],
                    cumulativeKeyStats: StorageProxy.get('keymaster_cumulative_key_stats', {}) || {},

                    metrics: {
                        errorsPerKey: {},
                        keyPressCounter: {}
                    }
                };

                this.timerIntervalId = null;
                this.audioContext = null;

                this.keyDOMElements = {};
                this.activeHighlightedKeys = [];
                this.activeHighlightedFingers = [];

                this.progressChartInstance = null;
                this.weakKeysChartInstance = null;
            }

            init() {
                const todayStr = this.getTodaysDateString();
                const yesterdayStr = this.getYesterdaysDateString();
                const lastDate = this.state.streakLastDate;

                if (lastDate && lastDate !== todayStr && lastDate !== yesterdayStr) {
                    this.state.streakCurrent = 0;
                    StorageProxy.set('keymaster_streak_current', 0);
                }

                // Apply saved Contrast/Theme setting
                const savedTheme = StorageProxy.get('keymaster_dark_theme', false);
                if (savedTheme) {
                    document.documentElement.classList.add('dark');
                }

                this.renderKeyboardStructure();
                this.updateKeyboardLabels();
                this.loadPracticeSyllabusString();
                this.registerEventListeners();
                this.updateStreakVisuals();

                this.initAnalyticsCharts();
                
                // Initialize default Mode (Beginner) from Storage or defaults
                const savedMode = StorageProxy.get('keymaster_user_mode', 'beginner');
                this.switchApplicationMode(savedMode);
            }

            getTodaysDateString() {
                const d = new Date();
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd}`;
            }

            getYesterdaysDateString() {
                const d = new Date();
                d.setDate(d.getDate() - 1);
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd}`;
            }

            // Performance: Assistive Technology Voice Feedback Engine
            announceToSR(text) {
                const srAnnounce = document.getElementById('sr-announcements');
                if (srAnnounce) {
                    srAnnounce.textContent = '';
                    setTimeout(() => {
                        srAnnounce.textContent = text;
                    }, 50);
                }
            }

            registerEventListeners() {
                const typingContainer = document.getElementById('typing-words-container');
                const hiddenInput = document.getElementById('hidden-typing-input');

                window.addEventListener('keydown', (e) => {
                    if (e.key === 'Shift') {
                        this.state.isShiftActive = true;
                        this.updateShiftBtnState();
                        this.updateKeyboardLabels();
                        this.highlightNextVirtualKey();
                        return; // FIXED: Prevent Shift modifier itself from passing down to typing parser
                    }

                    // FIXED: Block all browser/system operational keyboard shortcuts from typing parser
                    if (e.ctrlKey || e.altKey || e.metaKey) {
                        return;
                    }

                    // FIXED: Allow hidden-typing-input to bypass the active focus early returns, but lock standard input fields (name, sandbox)
                    if (document.activeElement.tagName === 'INPUT' && document.activeElement.id !== 'hidden-typing-input') {
                        return;
                    }
                    if (document.activeElement.tagName === 'TEXTAREA') {
                        return;
                    }
                    
                    // FIXED: Explicitly ignore standard system keys to prevent registering them as typing errors
                    const ignoredKeys = [
                        'Control', 'Alt', 'Meta', 'CapsLock', 'Escape', 
                        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 
                        'NumLock', 'ScrollLock', 'Pause', 'Insert', 'Delete', 'Home', 'End', 'PageUp', 'PageDown',
                        'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
                    ];
                    if (ignoredKeys.includes(e.key)) {
                        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            e.preventDefault();
                        }
                        return; 
                    }

                    // Intercept Backspace directly in keydown to support both focused and unfocused modes reliably
                    if (e.key === 'Backspace') {
                        e.preventDefault();
                        this.handlePhysicalTypingInput(e);
                        return;
                    }

                    // Let the input event handle standard key down characters on mobile virtual inputs, but bypass duplication on desktop
                    if (document.activeElement.id === 'hidden-typing-input') {
                        return;
                    }

                    if (e.key === ' ' || e.key.length === 1) {
                        e.preventDefault();
                        this.handlePhysicalTypingInput(e);
                    }
                });

                window.addEventListener('keyup', (e) => {
                    if (e.key === 'Shift') {
                        this.state.isShiftActive = false;
                        this.updateShiftBtnState();
                        this.updateKeyboardLabels();
                        this.highlightNextVirtualKey();
                    }
                });

                typingContainer.addEventListener('click', () => {
                    hiddenInput.focus();
                    this.showToast("Typing arena active. Start typing!");
                });

                hiddenInput.addEventListener('input', (e) => {
                    const typedChar = e.target.value.slice(-1);
                    if (!typedChar) return; // Ignore clear operations and keyboard buffer resets
                    
                    const simulatedEvent = {
                        key: typedChar,
                        preventDefault: () => {}
                    };
                    this.handlePhysicalTypingInput(simulatedEvent);
                    hiddenInput.value = '';
                });

                document.getElementById('keyboard-layout-select').addEventListener('change', (e) => {
                    e.currentTarget.blur();
                    this.state.currentLayout = e.target.value;
                    this.updateKeyboardLabels();
                    this.loadPracticeSyllabusString();
                    const layoutText = (window.KEYBOARD_REGISTRY || KEYBOARD_REGISTRY).layouts[this.state.currentLayout]?.displayName || this.state.currentLayout;
                    this.showToast(`Layout changed to: ${layoutText}`);
                    this.announceToSR(`Layout changed to ${layoutText}`);
                    this.updateAnalyticsCharts();
                });

                document.getElementById('lesson-category-select').addEventListener('change', (e) => {
                    e.currentTarget.blur();
                    this.loadPracticeSyllabusString();
                });
                
                document.getElementById('mock-exam-subselect').addEventListener('change', (e) => {
                    e.currentTarget.blur();
                    this.loadPracticeSyllabusString();
                });

                document.getElementById('btn-load-custom-text').addEventListener('click', (e) => {
                    e.currentTarget.blur();
                    this.loadPracticeSyllabusString();
                });

                document.getElementById('btn-reset-practice').addEventListener('click', (e) => {
                    e.currentTarget.blur();
                    this.resetActivePracticeStates();
                });

                document.getElementById('switch-sound-select').addEventListener('change', (e) => {
                    e.currentTarget.blur();
                    this.state.acousticSwitchType = e.target.value;
                    this.showToast(`Switch acoustics adjusted to: ${e.target.options[e.target.selectedIndex].text}`);
                });

                document.getElementById('btn-toggle-heatmap').addEventListener('click', (e) => {
                    e.currentTarget.blur();
                    this.state.isHeatmapActive = !this.state.isHeatmapActive;
                    const lbl = document.getElementById('heatmap-toggle-lbl');
                    if (this.state.isHeatmapActive) {
                        lbl.textContent = "Friction Heatmap: ON";
                        this.showToast("Keyboard error distribution active.");
                    } else {
                        lbl.textContent = "Friction Heatmap: OFF";
                        this.showToast("Keyboard overlay reset.");
                    }
                    this.applyLiveHeatmapOverlays();
                });

                document.getElementById('btn-practice-weak-keys').addEventListener('click', (e) => {
                    e.currentTarget.blur();
                    this.compileWeakKeysCustomDrill();
                });

                document.getElementById('chk-strict-mock').addEventListener('change', (e) => {
                    e.currentTarget.blur();
                    const isStrict = e.target.checked;
                    const lockSelect = document.getElementById('backspace-lock-select');
                    const timerSelect = document.getElementById('mock-timer-select');
                    
                    if (isStrict) {
                        lockSelect.value = 'disable';
                        timerSelect.value = '600'; 
                        this.showToast("Exam Simulator: Backspace locked | 10 Min limit");
                    } else {
                        lockSelect.value = 'allow';
                        timerSelect.value = '0';
                        this.showToast("Standard practice restored.");
                    }
                    this.resetActivePracticeStates();
                });

                document.getElementById('btn-toggle-lessons-modal').addEventListener('click', (e) => {
                    e.currentTarget.blur();
                    this.toggleCertModal();
                });

                document.getElementById('btn-close-cert-modal').addEventListener('click', (e) => {
                    e.currentTarget.blur();
                    this.toggleCertModal();
                });

                document.getElementById('btn-print-certificate').addEventListener('click', (e) => {
                    e.currentTarget.blur();
                    this.handleCertificatePrintAction();
                });

                document.getElementById('btn-download-certificate-png').addEventListener('click', (e) => {
                    e.currentTarget.blur();
                    this.handleCertificateCanvasDownload();
                });

                document.getElementById('btn-toggle-kb-visibility').addEventListener('click', (e) => {
                    e.currentTarget.blur();
                    this.state.isKeyboardVisible = !this.state.isKeyboardVisible;
                    const wrapper = document.getElementById('keyboard-overlay-outer');
                    const hands = document.getElementById('hands-finger-guide-outer');
                    const btn = document.getElementById('btn-toggle-kb-visibility');
                    if (this.state.isKeyboardVisible) {
                        wrapper.classList.remove('hidden');
                        hands.classList.remove('hidden');
                        btn.innerHTML = `<i class="fa-regular fa-eye-slash"></i> Hide Key Overlay`;
                    } else {
                        wrapper.classList.add('hidden');
                        hands.classList.add('hidden');
                        btn.innerHTML = `<i class="fa-regular fa-eye"></i> Show Key Overlay`;
                    }
                });

                document.getElementById('btn-quick-analytics-jump').addEventListener('click', (e) => {
                    e.currentTarget.blur();
                    this.toggleAnalyticsModal();
                });

                document.getElementById('btn-close-analytics-modal').addEventListener('click', (e) => {
                    e.currentTarget.blur();
                    this.toggleAnalyticsModal();
                });

                document.getElementById('btn-clear-analytics').addEventListener('click', (e) => {
                    e.currentTarget.blur();
                    this.clearAnalyticsHistory();
                });

                document.getElementById('btn-screen-shift').addEventListener('click', (e) => {
                    e.currentTarget.blur();
                    this.state.isShiftActive = !this.state.isShiftActive;
                    this.updateShiftBtnState();
                    this.updateKeyboardLabels();
                    this.highlightNextVirtualKey();
                });

                // Mode switch bindings
                document.getElementById('btn-mode-beginner').addEventListener('click', (e) => {
                    e.currentTarget.blur();
                    this.switchApplicationMode('beginner');
                });
                document.getElementById('btn-mode-advanced').addEventListener('click', (e) => {
                    e.currentTarget.blur();
                    this.switchApplicationMode('advanced');
                });

                // Contrast Mode Theme Switch implementation
                document.getElementById('theme-toggle').addEventListener('click', (e) => {
                    e.currentTarget.blur();
                    const isDark = document.documentElement.classList.toggle('dark');
                    StorageProxy.set('keymaster_dark_theme', isDark);
                    this.updateChartColorsForTheme(isDark);
                    this.showToast(isDark ? "Contrast Theme Engaged" : "Standard Theme Engaged");
                });

                window.addEventListener('click', (e) => {
                    const certModal = document.getElementById('cert-claim-modal');
                    if (e.target === certModal) {
                        this.toggleCertModal();
                    }
                    const analyticsModal = document.getElementById('analytics-modal');
                    if (e.target === analyticsModal) {
                        this.toggleAnalyticsModal();
                    }
                });

                window.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        const certModal = document.getElementById('cert-claim-modal');
                        if (certModal && !certModal.classList.contains('hidden')) {
                            this.toggleCertModal();
                        }
                        const analyticsModal = document.getElementById('analytics-modal');
                        if (analyticsModal && !analyticsModal.classList.contains('hidden')) {
                            this.toggleAnalyticsModal();
                        }
                    }
                });
            }

            switchApplicationMode(mode) {
                const beginnerBtn = document.getElementById('btn-mode-beginner');
                const advancedBtn = document.getElementById('btn-mode-advanced');
                const advancedPanel = document.getElementById('advanced-config-panel');
                const govLessonsOpt = document.getElementById('opt-gov-lessons');
                const lessonSelector = document.getElementById('lesson-category-select');

                StorageProxy.set('keymaster_user_mode', mode);

                if (mode === 'beginner') {
                    // Update trigger styling with fixed height ratios (sleek aspect ratio under 30%)
                    if (beginnerBtn) beginnerBtn.className = "px-6 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 focus:outline-none bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm border border-stone-200 dark:border-stone-700";
                    if (advancedBtn) advancedBtn.className = "px-6 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 focus:outline-none text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200";
                    
                    // Hide advanced sections
                    if (advancedPanel) advancedPanel.classList.add('hidden');
                    if (govLessonsOpt) govLessonsOpt.classList.add('hidden');

                    // If gov paragraph is selected, rollback beginner back to safe home row lessons
                    if (lessonSelector && lessonSelector.value === 'government_exams') {
                        lessonSelector.value = 'home_row';
                        this.loadPracticeSyllabusString();
                    }
                    this.showToast("Beginner Mode: Standard training canvas active");
                } else {
                    // Update trigger styling with fixed height ratios (sleek aspect ratio under 30%)
                    if (advancedBtn) advancedBtn.className = "px-6 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 focus:outline-none bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm border border-stone-200 dark:border-stone-700";
                    if (beginnerBtn) beginnerBtn.className = "px-6 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 focus:outline-none text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200";

                    // Expand dashboard features
                    if (advancedPanel) advancedPanel.classList.remove('hidden');
                    if (govLessonsOpt) govLessonsOpt.classList.remove('hidden');
                    
                    this.showToast("Advanced Mode: Settings and logs loaded");
                }
            }

            updateShiftBtnState() {
                const btn = document.getElementById('btn-screen-shift');
                const lbl = document.getElementById('lbl-screen-shift');
                if (this.state.isShiftActive) {
                    if (btn) btn.className = "w-full bg-red-800 hover:bg-red-900 text-white font-extrabold py-2.5 px-3 rounded-xl text-[10px] uppercase transition-all flex items-center justify-center gap-1 shadow-sm";
                    if (lbl) lbl.textContent = "Shift: ON";
                } else {
                    if (btn) btn.className = "w-full bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-900 dark:text-white font-extrabold py-2.5 px-3 rounded-xl text-[10px] uppercase transition-all flex items-center justify-center gap-1 shadow-sm";
                    if (lbl) lbl.textContent = "Shift: OFF";
                }
            }

            playKeyClickSound() {
                if (this.state.acousticSwitchType === 'mute') return;
                if (!this.audioContext) {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                try {
                    const now = this.audioContext.currentTime;
                    
                    // Synthesize switch properties dynamically based on mechanical profile
                    let clickFreq = 2400;
                    let clickDecay = 0.012;
                    let clickVolume = 0.06;
                    let thumpFreq = 160;
                    let thumpDecay = 0.035;
                    let thumpVolume = 0.12;

                    if (this.state.acousticSwitchType === 'brown') {
                        // Silent bump: Dampened haptic resonance
                        clickFreq = 1600;
                        clickDecay = 0.008;
                        clickVolume = 0.04;
                        thumpFreq = 120;
                        thumpDecay = 0.025;
                        thumpVolume = 0.12;
                    } else if (this.state.acousticSwitchType === 'red') {
                        // Linear switches: Dampened top-stroke click
                        clickVolume = 0;
                        thumpFreq = 100;
                        thumpDecay = 0.04;
                        thumpVolume = 0.15;
                    }

                    if (clickVolume > 0) {
                        const oscClick = this.audioContext.createOscillator();
                        const gainClick = this.audioContext.createGain();
                        oscClick.type = 'triangle';
                        oscClick.frequency.setValueAtTime(clickFreq, now);
                        oscClick.frequency.exponentialRampToValueAtTime(800, now + clickDecay);
                        
                        gainClick.gain.setValueAtTime(clickVolume, now);
                        gainClick.gain.exponentialRampToValueAtTime(0.001, now + clickDecay);
                        
                        oscClick.connect(gainClick);
                        gainClick.connect(this.audioContext.destination);
                        
                        oscClick.start(now);
                        oscClick.stop(now + clickDecay + 0.01);
                    }

                    const oscRes = this.audioContext.createOscillator();
                    const gainRes = this.audioContext.createGain();
                    oscRes.type = 'sine';
                    oscRes.frequency.setValueAtTime(thumpFreq, now);
                    oscRes.frequency.exponentialRampToValueAtTime(thumpFreq / 2, now + thumpDecay);
                    
                    gainRes.gain.setValueAtTime(thumpVolume, now);
                    gainRes.gain.exponentialRampToValueAtTime(0.001, now + thumpDecay);
                    
                    oscRes.connect(gainRes);
                    gainRes.connect(this.audioContext.destination);
                    
                    oscRes.start(now);
                    oscRes.stop(now + thumpDecay + 0.01);
                } catch (e) {
                    console.warn("Mechanical switch sound generation failed:", e);
                }
            }

            playMistakeBuzzerSound() {
                if (this.state.acousticSwitchType === 'mute') return;
                if (!this.audioContext) {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                try {
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(140, this.audioContext.currentTime);
                    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
                    osc.connect(gain);
                    gain.connect(this.audioContext.destination);
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.18);
                } catch (e) {
                    console.warn("Audio context buzzer generation failed:", e);
                }
            }

            getUnicodeCharacterForKey(char, layoutName) {
                const registry = window.KEYBOARD_REGISTRY || KEYBOARD_REGISTRY;
                const code = registry.charToCodeMap[char];
                if (!code) return char;

                const layout = registry.layouts[layoutName];
                if (!layout) return char;

                const isShifted = char !== char.toLowerCase() || ['{', '}', ':', '"', '<', '>', '?', '~', '_', '+', '|'].includes(char);

                if (isShifted && layout.forwardMapShifted && layout.forwardMapShifted[code]) {
                    return layout.forwardMapShifted[code];
                }
                return layout.forwardMap[code] || char;
            }

            krutidevKeystrokesToUnicode(keysStr) {
                let chars = [];
                for (let i = 0; i < keysStr.length; i++) {
                    let char = keysStr[i];
                    let unicodeChar = this.getUnicodeCharacterForKey(char, 'hindi_remington');
                    chars.push(unicodeChar);
                }

                // Pass 1: Combined characters cleanup (् + ा) via array reconstruction
                let pass1 = [];
                for (let i = 0; i < chars.length; i++) {
                    if (chars[i] === '्' && chars[i+1] === 'ा') {
                        i++; // Skip both elements safely
                    } else {
                        pass1.push(chars[i]);
                    }
                }
                chars = pass1;

                // Pass 2: Vowel Reordering for Chhoti Ee matra ('ि') via projection (no in-place mutative splicing)
                let pass2 = [];
                let i = 0;
                while (i < chars.length) {
                    if (chars[i] === 'ि') {
                        let clusterStart = i + 1;
                        let clusterEnd = clusterStart;
                        
                        // Scan the consonant cluster following the 'ि' matra
                        while (clusterEnd < chars.length) {
                            if (clusterEnd + 1 < chars.length && chars[clusterEnd + 1] === '्') {
                                clusterEnd += 2;
                            } else {
                                break;
                            }
                        }
                        
                        // Include base consonant
                        if (clusterEnd < chars.length) {
                            clusterEnd++;
                        }
                        
                        // Project the cluster first, then append the 'ि' matra logically
                        if (clusterEnd > clusterStart) {
                            for (let k = clusterStart; k < clusterEnd; k++) {
                                pass2.push(chars[k]);
                            }
                            pass2.push('ि');
                            i = clusterEnd;
                        } else {
                            pass2.push('ि');
                            i++;
                        }
                    } else {
                        pass2.push(chars[i]);
                        i++;
                    }
                }
                chars = pass2;

                // Pass 3: backward reordering for half-R / reph ('र' + '्') past base clusters and vowel matras
                let rephResult = [];
                let j = 0;
                while (j < chars.length) {
                    if (j + 1 < chars.length && chars[j] === 'र' && chars[j+1] === '्') {
                        let insertIdx = rephResult.length;
                        const matras = ['ा', 'ि', 'ी', 'ु', 'ू', 'ृ', 'े', 'ै', 'ो', 'ौ', 'ं'];
                        
                        // Skip past trailing vowel matras in the processed array
                        while (insertIdx > 0 && matras.includes(rephResult[insertIdx - 1])) {
                            insertIdx--;
                        }
                        // Skip past base consonant
                        if (insertIdx > 0) {
                            insertIdx--;
                        }
                        // Skip past preceding half-consonants (consonants followed by halant '्')
                        while (insertIdx >= 2) {
                            if (rephResult[insertIdx - 1] === '्') {
                                insertIdx -= 2;
                            } else {
                                break;
                            }
                        }
                        // Place reph sequence safely at calculated anchor index
                        rephResult.splice(insertIdx, 0, 'र', '्');
                        j += 2;
                    } else {
                        rephResult.push(chars[j]);
                        j++;
                    }
                }
                chars = rephResult;

                return chars.join("");
            }

            inscriptKeystrokesToUnicode(keysStr) {
                let chars = [];
                for (let i = 0; i < keysStr.length; i++) {
                    let char = keysStr[i];
                    let unicodeChar = this.getUnicodeCharacterForKey(char, 'hindi_inscript');
                    chars.push(unicodeChar);
                }
                return chars.join("");
            }

            convertBufferToLivePreview(keysStr) {
                if (this.state.currentLayout === 'english_qwerty') {
                    return keysStr;
                } else if (this.state.currentLayout === 'hindi_remington') {
                    return this.krutidevKeystrokesToUnicode(keysStr);
                } else {
                    return this.inscriptKeystrokesToUnicode(keysStr);
                }
            }

            transliterateDevanagariBackward(unicodeText) {
                let compiledWords = [];
                const rawWords = unicodeText.split(/\s+/);
                const registry = window.KEYBOARD_REGISTRY || KEYBOARD_REGISTRY;

                rawWords.forEach(word => {
                    if (!word.trim()) return;

                    let keystrokeRepresentation = "";
                    for (let i = 0; i < word.length; i++) {
                        const char = word[i];
                        if (this.state.currentLayout === 'english_qwerty') {
                            keystrokeRepresentation += char;
                        } else if (this.state.currentLayout === 'hindi_remington') {
                            keystrokeRepresentation += registry.layouts.hindi_remington.backwardMap[char] || char;
                        } else {
                            keystrokeRepresentation += registry.layouts.hindi_inscript.backwardMap[char] || char;
                        }
                    }
                    compiledWords.push({
                        display: word,
                        keys: keystrokeRepresentation
                    });
                });
                return compiledWords;
            }

            renderKeyboardStructure() {
                const kb = document.getElementById('virtual-keyboard');
                if (!kb) return;

                kb.innerHTML = '';
                this.keyDOMElements = {};

                ['row1', 'row2', 'row3', 'row4', 'row5'].forEach(rowKey => {
                    const rowEl = document.createElement('div');
                    rowEl.className = "flex justify-center gap-1 w-full";
                    
                    const keyDefs = window.keyboardKeysDefinitions || keyboardKeysDefinitions;
                    keyDefs[rowKey].forEach(kDef => {
                        const keyEl = document.createElement('div');
                        keyEl.id = `vkey-${kDef.code}`;
                        keyEl.className = `flex flex-col items-center justify-center border-2 border-stone-300 dark:border-stone-700 rounded-lg p-1.5 transition-all text-center select-none shadow-sm cursor-pointer ${kDef.class || ''}`;
                        keyEl.style.minWidth = kDef.class && kDef.class.includes('w-') ? '' : '38px';
                        keyEl.style.height = '42px';

                        const mainTextSpan = document.createElement('span');
                        mainTextSpan.className = "text-[12px] font-black tracking-tight leading-none hindi-font text-stone-900 dark:text-white main-label";
                        keyEl.appendChild(mainTextSpan);

                        const subTextSpan = document.createElement('span');
                        subTextSpan.className = "text-[8px] text-stone-750 dark:text-stone-400 font-black block mt-0.5 leading-none sub-label hidden";
                        keyEl.appendChild(subTextSpan);

                        // FIXED: Replaced raw Click simulation handler to safely support modifier keys, caps lock, backspace, and spaces without mistyped beeps
                        keyEl.addEventListener('click', () => {
                            if (kDef.code === 'ShiftLeft' || kDef.code === 'ShiftRight') {
                                this.state.isShiftActive = !this.state.isShiftActive;
                                this.updateShiftBtnState();
                                this.updateKeyboardLabels();
                                this.highlightNextVirtualKey();
                                return;
                            }
                            if (kDef.code === 'CapsLock') {
                                return;
                            }
                            if (kDef.code === 'Backspace') {
                                const simulatedEvent = { key: 'Backspace', preventDefault: () => {} };
                                this.handlePhysicalTypingInput(simulatedEvent);
                                return;
                            }
                            if (kDef.code === 'Space') {
                                const simulatedEvent = { key: ' ', preventDefault: () => {} };
                                this.handlePhysicalTypingInput(simulatedEvent);
                                return;
                            }
                            if (kDef.key === 'Tab' || kDef.key === 'Enter' || kDef.key.includes('Control') || kDef.key.includes('Alt')) {
                                return;
                            }

                            const simulatedEvent = { key: kDef.key, preventDefault: () => {} };
                            this.handlePhysicalTypingInput(simulatedEvent);
                        });

                        rowEl.appendChild(keyEl);

                        this.keyDOMElements[kDef.code] = {
                            element: keyEl,
                            mainLabelSpan: mainTextSpan,
                            subLabelSpan: subTextSpan,
                            def: kDef
                        };
                    });
                    kb.appendChild(rowEl);
                });
                this.applyLiveHeatmapOverlays();
            }

            updateKeyboardLabels() {
                const registry = window.KEYBOARD_REGISTRY || KEYBOARD_REGISTRY;
                const layout = registry.layouts[this.state.currentLayout];
                const currentActiveKeymap = (this.state.isShiftActive && layout?.forwardMapShifted) ? layout.forwardMapShifted : layout?.forwardMap;

                for (const code in this.keyDOMElements) {
                    const cache = this.keyDOMElements[code];
                    let primaryLabel = cache.def.label;
                    let subLabel = "";

                    if (currentActiveKeymap && currentActiveKeymap[code]) {
                        primaryLabel = currentActiveKeymap[code];
                        subLabel = cache.def.label;
                    }

                    cache.mainLabelSpan.textContent = primaryLabel;

                    if (subLabel && subLabel !== primaryLabel) {
                        cache.subLabelSpan.textContent = subLabel;
                        cache.subLabelSpan.classList.remove('hidden');
                    } else {
                        cache.subLabelSpan.classList.add('hidden');
                    }
                }
            }

            applyLiveHeatmapOverlays() {
                for (const code in this.keyDOMElements) {
                    const cache = this.keyDOMElements[code];
                    if (cache && cache.element) {
                        cache.element.style.backgroundColor = '';
                        cache.element.style.borderColor = '';
                    }
                }

                if (!this.state.isHeatmapActive) return;

                for (const keycode in this.state.metrics.errorsPerKey) {
                    const errorCount = this.state.metrics.errorsPerKey[keycode] || 0;
                    const totalClicks = this.state.metrics.keyPressCounter[keycode] || 1;
                    const ratio = errorCount / totalClicks;

                    if (errorCount > 0) {
                        const cache = this.keyDOMElements[keycode];
                        if (cache && cache.element) {
                            const opacity = Math.min(0.9, 0.2 + (ratio * 0.7));
                            cache.element.style.backgroundColor = `rgba(185, 28, 28, ${opacity})`;
                            cache.element.style.borderColor = `rgba(153, 27, 27, ${opacity + 0.1})`;
                        }
                    }
                }
            }

            generateInfiniteSyllables(layoutName, categoryName) {
                const charsets = window.GENERATOR_CHARSETS || GENERATOR_CHARSETS;
                const charSource = charsets[layoutName]?.[categoryName] || "asdf";
                const generatedWordsList = [];
                
                for (let i = 0; i < 25; i++) {
                    let wordLen = Math.floor(Math.random() * 3) + 3; 
                    let syllableBuffer = "";
                    for (let j = 0; j < wordLen; j++) {
                        const randCharIndex = Math.floor(Math.random() * charSource.length);
                        syllableBuffer += charSource[randCharIndex];
                    }
                    
                    if (layoutName === 'english_qwerty') {
                        generatedWordsList.push({
                            display: syllableBuffer,
                            keys: syllableBuffer
                        });
                    } else {
                        const translatedDisplay = this.convertBufferToLivePreview(syllableBuffer);
                        generatedWordsList.push({
                            display: translatedDisplay,
                            keys: syllableBuffer
                        });
                    }
                }
                return generatedWordsList;
            }

            loadPracticeSyllabusString() {
                const selectEl = document.getElementById('lesson-category-select');
                if (!selectEl) return;

                const selectVal = selectEl.value;
                const sandboxBox = document.getElementById('custom-practice-sandbox');
                const subselectWrap = document.getElementById('mock-exam-subselect-wrap');

                if (selectVal === 'custom_practice') {
                    if (sandboxBox) sandboxBox.classList.remove('hidden');
                    if (subselectWrap) subselectWrap.classList.add('hidden');
                    const customTextEl = document.getElementById('custom-typed-text');
                    const rawText = (customTextEl ? customTextEl.value.trim() : "") || "भारत हमारा महान देश है।";
                    this.state.currentActiveLessonWords = this.transliterateDevanagariBackward(rawText);
                } else if (selectVal === 'government_exams') {
                    if (sandboxBox) sandboxBox.classList.add('hidden');
                    if (subselectWrap) subselectWrap.classList.remove('hidden');
                    const examSubEl = document.getElementById('mock-exam-subselect');
                    const examPreset = examSubEl ? examSubEl.value : 'test_1';
                    const presets = window.GOVT_EXAMS_PRESETS || GOVT_EXAMS_PRESETS;
                    const text = presets[this.state.currentLayout]?.[examPreset] || "भारत हमारा महान देश है।";
                    this.state.currentActiveLessonWords = this.transliterateDevanagariBackward(text);
                } else {
                    if (sandboxBox) sandboxBox.classList.add('hidden');
                    if (subselectWrap) subselectWrap.classList.add('hidden');
                    this.state.currentActiveLessonWords = this.generateInfiniteSyllables(this.state.currentLayout, selectVal);
                }
                this.resetActivePracticeStates();
            }

            resetActivePracticeStates() {
                this.stopCountdownTimer();
                this.state.activeWordIndex = 0;
                this.state.typedKeystrokesBuffer = "";
                this.state.incorrectKeystrokesCount = 0;
                this.state.totalKeystrokesCount = 0;
                this.state.practiceStartTime = null;
                this.state.isPracticeActive = false;

                this.state.metrics.errorsPerKey = {};
                this.state.metrics.keyPressCounter = {};
                const alertBar = document.getElementById('weak-keys-alert-bar');
                if (alertBar) alertBar.classList.add('hidden');

                const wpmSpan = document.getElementById('stat-wpm');
                if (wpmSpan) wpmSpan.textContent = "0 WPM";

                const netWpmSpan = document.getElementById('stat-net-wpm');
                if (netWpmSpan) netWpmSpan.textContent = "0 WPM";

                const accuracySpan = document.getElementById('stat-accuracy');
                if (accuracySpan) accuracySpan.textContent = "100%";

                const errorsSpan = document.getElementById('stat-errors');
                if (errorsSpan) errorsSpan.textContent = "0 Keys";

                const flowIndicator = document.getElementById('live-flow-indicator');
                if (flowIndicator) flowIndicator.style.width = "0%";

                const countdownSpan = document.getElementById('stat-countdown');
                const timerSelect = document.getElementById('mock-timer-select');
                const timerSelectVal = timerSelect ? parseInt(timerSelect.value) : 0;
                if (timerSelectVal > 0) {
                    this.state.currentTimerDuration = timerSelectVal;
                    this.state.timeRemainingSeconds = timerSelectVal;
                    const displayTime = formatSecondsToTimeStr(timerSelectVal);
                    if (countdownSpan) countdownSpan.textContent = displayTime;
                } else {
                    this.state.currentTimerDuration = 0;
                    if (countdownSpan) countdownSpan.textContent = "-";
                }

                this.renderTypingWordsArea(true); // Force DOM rebuild on clean reset
                this.updateLivePreviewHUD();
                this.highlightNextVirtualKey();

                // Announce session start to screen reader users
                const firstWord = this.state.currentActiveLessonWords[0]?.display || "";
                this.announceToSR(`Practice drill loaded. First word: ${firstWord}. Start typing when ready.`);
            }

            startCountdownTimer() {
                if (this.state.currentTimerDuration <= 0) return;
                this.stopCountdownTimer();

                const countdownSpan = document.getElementById('stat-countdown');
                this.state.timeRemainingSeconds = this.state.currentTimerDuration;
                this.timerIntervalId = setInterval(() => {
                    this.state.timeRemainingSeconds--;
                    const displayTime = formatSecondsToTimeStr(this.state.timeRemainingSeconds);
                    if (countdownSpan) countdownSpan.textContent = displayTime;

                    if (this.state.timeRemainingSeconds <= 0) {
                        this.stopCountdownTimer();
                        this.concludePracticeDrillRun();
                    } else {
                        this.calculateRealTimePracticeMetrics();
                    }
                }, 1000);
            }

            stopCountdownTimer() {
                if (this.timerIntervalId) {
                    clearInterval(this.timerIntervalId);
                    this.timerIntervalId = null;
                }
            }

            // High Performance: Non-destructive O(1) Class-switching render cycle
            renderTypingWordsArea(forceRebuild = false) {
                const container = document.getElementById('typing-words-container');
                if (!container) return;

                const childrenCount = container.children.length;
                const wordsCount = this.state.currentActiveLessonWords.length;

                // Rebuild complete DOM list only on fresh load, resets, or layout toggles
                if (forceRebuild || childrenCount !== wordsCount) {
                    container.innerHTML = '';
                    this.state.currentActiveLessonWords.forEach((wordDef, idx) => {
                        const span = document.createElement('span');
                        span.id = `word-${idx}`;
                        span.textContent = wordDef.display;
                        this.setWordSpanClass(span, idx);
                        container.appendChild(span);
                    });
                    container.scrollTop = 0;
                } else {
                    // Ultra-fast updates path targeting only the exact active transitions (Previous and Current Spans)
                    const prevActiveIdx = this.state.activeWordIndex - 1;
                    const currentActiveIdx = this.state.activeWordIndex;
                    
                    if (prevActiveIdx >= 0) {
                        const prevSpan = container.children[prevActiveIdx];
                        if (prevSpan) this.setWordSpanClass(prevSpan, prevActiveIdx);
                    }
                    if (currentActiveIdx < wordsCount) {
                        const activeSpan = container.children[currentActiveIdx];
                        if (activeSpan) {
                            this.setWordSpanClass(activeSpan, currentActiveIdx);
                            
                            // Expert auto-scroll handler avoiding standard window scrollIntoView bugs
                            const containerHeight = container.clientHeight;
                            const spanTop = activeSpan.offsetTop;
                            const spanHeight = activeSpan.offsetHeight;
                            const currentScrollTop = container.scrollTop;
                            
                            if (spanTop + spanHeight > currentScrollTop + containerHeight - 20 || spanTop < currentScrollTop + 20) {
                                container.scrollTo({
                                    top: spanTop - (containerHeight / 2) + (spanHeight / 2),
                                    behavior: 'smooth'
                                });
                            }
                        }
                    }
                }
            }

            setWordSpanClass(span, idx) {
                const baseClass = "transition-all duration-150 px-2 py-0.5 rounded-lg hindi-font inline-block";
                if (idx === this.state.activeWordIndex) {
                    span.className = `${baseClass} text-white border-b-2 border-red-500 font-extrabold bg-stone-850 shadow-md scale-105`;
                } else if (idx < this.state.activeWordIndex) {
                    span.className = `${baseClass} text-emerald-400 font-bold opacity-90`;
                } else {
                    span.className = `${baseClass} text-stone-600 dark:text-stone-300 opacity-80`;
                }
            }

            updateLivePreviewHUD() {
                const currentWordDef = this.state.currentActiveLessonWords[this.state.activeWordIndex];
                const liveLabel = document.getElementById('user-live-word-typed');
                const expectedLabel = document.getElementById('expected-key-indicator');

                if (!currentWordDef) {
                    if (liveLabel) liveLabel.textContent = "";
                    if (expectedLabel) {
                        expectedLabel.textContent = "-";
                    }
                    return;
                }

                if (liveLabel) {
                    liveLabel.textContent = this.convertBufferToLivePreview(this.state.typedKeystrokesBuffer);
                }

                if (expectedLabel) {
                    const nextExpectedChar = currentWordDef.keys[this.state.typedKeystrokesBuffer.length];
                    const keyStr = nextExpectedChar === " " ? "Space" : nextExpectedChar || "Space";
                    expectedLabel.textContent = keyStr;
                }
            }

            isExpectedKeyShifted(nextExpectedChar) {
                if (this.state.currentLayout === 'english_qwerty') {
                    return nextExpectedChar && nextExpectedChar === nextExpectedChar.toUpperCase() && nextExpectedChar !== nextExpectedChar.toLowerCase();
                }
                const registry = window.KEYBOARD_REGISTRY || KEYBOARD_REGISTRY;
                const layout = registry.layouts[this.state.currentLayout];
                if (layout && layout.forwardMapShifted) {
                    return Object.values(layout.forwardMapShifted).includes(nextExpectedChar);
                }
                return false;
            }

            highlightNextVirtualKey() {
                if (this.activeHighlightedKeys) {
                    this.activeHighlightedKeys.forEach(k => k.classList.remove('key-active'));
                }
                this.activeHighlightedKeys = [];

                if (this.activeHighlightedFingers) {
                    this.activeHighlightedFingers.forEach(f => f.classList.remove('finger-active'));
                }
                this.activeHighlightedFingers = [];

                const currentWordDef = this.state.currentActiveLessonWords[this.state.activeWordIndex];
                if (!currentWordDef) return;

                const registry = window.KEYBOARD_REGISTRY || KEYBOARD_REGISTRY;
                const nextExpectedChar = currentWordDef.keys[this.state.typedKeystrokesBuffer.length];
                const codeToHighlight = registry.charToCodeMap[nextExpectedChar] || (nextExpectedChar === " " ? "Space" : null);

                if (codeToHighlight) {
                    const cache = this.keyDOMElements[codeToHighlight];
                    if (cache && cache.element) {
                        cache.element.classList.add('key-active');
                        this.activeHighlightedKeys.push(cache.element);
                    }

                    if (this.isExpectedKeyShifted(nextExpectedChar)) {
                        const leftShift = this.keyDOMElements['ShiftLeft'];
                        const rightShift = this.keyDOMElements['ShiftRight'];
                        if (leftShift && leftShift.element) {
                            leftShift.element.classList.add('key-active');
                            this.activeHighlightedKeys.push(leftShift.element);
                        }
                        if (rightShift && rightShift.element) {
                            rightShift.element.classList.add('key-active');
                            this.activeHighlightedKeys.push(rightShift.element);
                        }
                    }

                    const activeFingerId = mapKeycodeToFingerGuide(codeToHighlight);
                    if (activeFingerId) {
                        const fingerBubble = document.getElementById(activeFingerId);
                        if (fingerBubble) {
                            fingerBubble.classList.add('finger-active');
                            this.activeHighlightedFingers.push(fingerBubble);
                        }
                    }
                }
            }

            handlePhysicalTypingInput(e) {
                // FIXED: Safety guard for empty event payloads (such as layout load triggers or browser autofills)
                if (!e || !e.key) return; 

                // FIXED: Strict ignore list preventing modifier keys and operational control codes from beeping inside matching conditions
                const ignoredKeysInParser = [
                    'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Escape', 'Tab', 'Enter',
                    'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight'
                ];
                if (ignoredKeysInParser.includes(e.key)) {
                    return;
                }

                const currentWordDef = this.state.currentActiveLessonWords[this.state.activeWordIndex];
                if (!currentWordDef) return;

                if (!this.state.isPracticeActive) {
                    this.state.isPracticeActive = true;
                    this.state.practiceStartTime = Date.now();
                    this.startCountdownTimer();
                }

                const registry = window.KEYBOARD_REGISTRY || KEYBOARD_REGISTRY;
                const expectedKey = currentWordDef.keys[this.state.typedKeystrokesBuffer.length];
                const code = registry.charToCodeMap[expectedKey] || (expectedKey === " " ? "Space" : null);

                const backspaceSelect = document.getElementById('backspace-lock-select');
                const backspaceSetting = backspaceSelect ? backspaceSelect.value : 'allow';
                if (e.key === 'Backspace') {
                    if (backspaceSetting === 'disable') {
                        this.playMistakeBuzzerSound();
                        this.triggerVisualMistakeFlash();
                        this.announceToSR("Backspace restricted.");
                        return; 
                    }
                    if (this.state.typedKeystrokesBuffer.length > 0) {
                        const deletedChar = this.state.typedKeystrokesBuffer.slice(-1);
                        this.state.typedKeystrokesBuffer = this.state.typedKeystrokesBuffer.slice(0, -1);
                        this.playKeyClickSound();
                        this.updateLivePreviewHUD();
                        this.highlightNextVirtualKey();
                        this.announceToSR(`Deleted ${this.getUnicodeCharacterForKey(deletedChar, this.state.currentLayout)}`);
                    }
                    return;
                }

                this.state.totalKeystrokesCount++;
                if (code) {
                    this.state.metrics.keyPressCounter[code] = (this.state.metrics.keyPressCounter[code] || 0) + 1;
                }

                if (e.key === ' ') {
                    if (this.state.typedKeystrokesBuffer === currentWordDef.keys) {
                        this.state.activeWordIndex++;
                        this.state.typedKeystrokesBuffer = "";
                        this.playKeyClickSound();
                        
                        if (this.state.activeWordIndex >= this.state.currentActiveLessonWords.length) {
                            this.concludePracticeDrillRun();
                            this.announceToSR("Drill completed.");
                        } else {
                            this.renderTypingWordsArea(); // Triggers direct class mutations instead of full innerHTML wipe
                            this.updateLivePreviewHUD();
                            this.highlightNextVirtualKey();
                            this.calculateRealTimePracticeMetrics();
                            
                            const nextWord = this.state.currentActiveLessonWords[this.state.activeWordIndex].display;
                            this.announceToSR(`Correct space. Next word: ${nextWord}`);
                        }
                    } else {
                        this.state.incorrectKeystrokesCount++;
                        if (code) {
                            this.state.metrics.errorsPerKey[code] = (this.state.metrics.errorsPerKey[code] || 0) + 1;
                        }
                        this.playMistakeBuzzerSound();
                        this.triggerVisualMistakeFlash();
                        this.calculateRealTimePracticeMetrics();
                        this.announceToSR("Incorrect space. Word incomplete.");
                    }
                    this.applyLiveHeatmapOverlays();
                    return;
                }

                if (e.key === expectedKey) {
                    this.state.typedKeystrokesBuffer += e.key;
                    this.playKeyClickSound();
                    this.updateLivePreviewHUD();
                    this.highlightNextVirtualKey();
                    this.calculateRealTimePracticeMetrics();
                    
                    const announcedChar = this.getUnicodeCharacterForKey(e.key, this.state.currentLayout);
                    this.announceToSR(announcedChar);
                } else {
                    this.state.incorrectKeystrokesCount++;
                    if (code) {
                        this.state.metrics.errorsPerKey[code] = (this.state.metrics.errorsPerKey[code] || 0) + 1;
                    }
                    this.playMistakeBuzzerSound();
                    this.triggerVisualMistakeFlash();
                    this.calculateRealTimePracticeMetrics();
                    
                    const expectedAnnounce = this.getUnicodeCharacterForKey(expectedKey, this.state.currentLayout);
                    this.announceToSR(`Mistake. Expected ${expectedAnnounce}, typed ${e.key}`);
                }
                this.applyLiveHeatmapOverlays();
            }

            triggerVisualMistakeFlash() {
                const container = document.getElementById('typing-words-container');
                if (container) {
                    container.classList.add('bg-red-950/40', 'border-red-600');
                    setTimeout(() => {
                        container.classList.remove('bg-red-950/40', 'border-red-600');
                    }, 150);
                }
            }

            calculateRealTimePracticeMetrics() {
                if (!this.state.practiceStartTime) return;

                let elapsedMinutes = (Date.now() - this.state.practiceStartTime) / 60000;
                if (elapsedMinutes <= 0) return;

                if (this.state.currentTimerDuration > 0) {
                    const elapsedSeconds = this.state.currentTimerDuration - this.state.timeRemainingSeconds;
                    elapsedMinutes = Math.max(0.01, elapsedSeconds / 60);
                }

                const correctKeystrokes = Math.max(0, this.state.totalKeystrokesCount - this.state.incorrectKeystrokesCount);
                const grossWordsCount = this.state.totalKeystrokesCount / 5;
                const grossWpm = Math.round(grossWordsCount / elapsedMinutes) || 0;

                const accuracyVal = Math.max(0, Math.round((correctKeystrokes / this.state.totalKeystrokesCount) * 100)) || 100;

                const errorsCount = this.state.incorrectKeystrokesCount;
                // FIXED: Direct algebraic representation conforming exactly to standard Indian government guidelines
                const netWpm = Math.max(0, Math.round((this.state.totalKeystrokesCount / 5 / elapsedMinutes) - (errorsCount / elapsedMinutes))) || 0;

                const grossLabel = document.getElementById('stat-wpm');
                if (grossLabel) grossLabel.textContent = `${grossWpm} WPM`;

                const netLabel = document.getElementById('stat-net-wpm');
                if (netLabel) netLabel.textContent = `${netWpm} WPM`;
                
                const accuracySpan = document.getElementById('stat-accuracy');
                if (accuracySpan) accuracySpan.textContent = `${accuracyVal}%`;

                const errorsSpan = document.getElementById('stat-errors');
                if (errorsSpan) errorsSpan.textContent = `${errorsCount} Keys`;

                const flowIndicator = document.getElementById('live-flow-indicator');
                const flowWidth = Math.min(100, Math.round((netWpm / 80) * 100));
                if (flowIndicator) flowIndicator.style.width = `${flowWidth}%`;

                if (accuracySpan) {
                    if (accuracyVal < 90) {
                        accuracySpan.className = "text-red-500 text-base sm:text-lg font-black";
                    } else if (accuracyVal < 95) {
                        accuracySpan.className = "text-amber-500 text-base sm:text-lg font-black";
                    } else {
                        accuracySpan.className = "text-emerald-400 text-base sm:text-lg font-black";
                    }
                }
            }

            concludePracticeDrillRun() {
                this.stopCountdownTimer();
                this.state.isPracticeActive = false;

                const elapsedMinutes = this.state.currentTimerDuration > 0 
                    ? (this.state.currentTimerDuration - this.state.timeRemainingSeconds) / 60 
                    : (Date.now() - this.state.practiceStartTime) / 60000;

                const correctKeystrokes = Math.max(0, this.state.totalKeystrokesCount - this.state.incorrectKeystrokesCount);
                const grossWpm = Math.round((this.state.totalKeystrokesCount / 5) / elapsedMinutes) || 0;
                // FIXED: Direct algebraic representation conforming exactly to standard Indian government guidelines
                const finalWpm = Math.max(0, Math.round((this.state.totalKeystrokesCount / 5 / elapsedMinutes) - (this.state.incorrectKeystrokesCount / elapsedMinutes))) || 0;
                const finalAccuracy = Math.max(0, Math.round((correctKeystrokes / this.state.totalKeystrokesCount) * 100)) || 100;

                const grossLabel = document.getElementById('stat-wpm');
                if (grossLabel) grossLabel.textContent = `${grossWpm} WPM`;

                const netLabel = document.getElementById('stat-net-wpm');
                if (netLabel) netLabel.textContent = `${finalWpm} WPM`;

                const accuracySpan = document.getElementById('stat-accuracy');
                if (accuracySpan) accuracySpan.textContent = `${finalAccuracy}%`;

                this.renderTypingWordsArea(true); // Force clear layout classes highlight on final stop
                this.updateDailyStreakOnCompletion();

                this.showToast(`Drill complete! Net Speed: ${finalWpm} WPM | Accuracy: ${finalAccuracy}%`);
                this.announceToSR(`Practice finished. Your net speed was ${finalWpm} words per minute with ${finalAccuracy} percent accuracy.`);

                if (finalWpm > this.state.bestWpmRecord && finalAccuracy >= 95) {
                    this.state.bestWpmRecord = finalWpm;
                    StorageProxy.set('keymaster_best_wpm', this.state.bestWpmRecord);
                }
                if (finalAccuracy > this.state.bestAccuracyRecord) {
                    this.state.bestAccuracyRecord = finalAccuracy;
                    StorageProxy.set('keymaster_best_accuracy', this.state.bestAccuracyRecord);
                }

                if (this.state.bestWpmRecord >= 35 && this.state.bestAccuracyRecord >= 95) {
                    const badge = document.getElementById('cert-badge-dot');
                    if (badge) badge.classList.remove('hidden');
                }

                this.evaluateFrictionAlertKeys();

                const runRecord = {
                    timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
                    wpm: finalWpm,
                    accuracy: finalAccuracy,
                    layout: this.state.currentLayout
                };
                this.state.practiceHistory.push(runRecord);
                if (this.state.practiceHistory.length > 15) {
                    this.state.practiceHistory.shift(); 
                }
                StorageProxy.set('keymaster_practice_history', this.state.practiceHistory);

                for (const keycode in this.state.metrics.keyPressCounter) {
                    if (!this.state.cumulativeKeyStats[keycode]) {
                        this.state.cumulativeKeyStats[keycode] = { errors: 0, presses: 0 };
                    }
                    this.state.cumulativeKeyStats[keycode].presses += this.state.metrics.keyPressCounter[keycode];
                    this.state.cumulativeKeyStats[keycode].errors += (this.state.metrics.errorsPerKey[keycode] || 0);
                }
                StorageProxy.set('keymaster_cumulative_key_stats', this.state.cumulativeKeyStats);

                this.updateAnalyticsCharts();
            }

            initAnalyticsCharts() {
                const ctxTrend = document.getElementById('progressTrendChart');
                const ctxFriction = document.getElementById('weakKeysFrictionChart');

                if (!ctxTrend || !ctxFriction) return;

                this.progressChartInstance = new Chart(ctxTrend, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [
                            {
                                label: 'Speed (Net WPM)',
                                data: [],
                                borderColor: '#b91c1c',
                                backgroundColor: 'rgba(185, 28, 28, 0.1)',
                                borderWidth: 2.5,
                                tension: 0.3,
                                yAxisID: 'yWpm'
                            },
                            {
                                label: 'Accuracy (%)',
                                data: [],
                                borderColor: '#10b981',
                                backgroundColor: 'transparent',
                                borderWidth: 2.5,
                                tension: 0.3,
                                yAxisID: 'yAcc'
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            x: {
                                grid: { display: false },
                                ticks: { font: { size: 9, weight: 'bold', family: 'Inter' }, color: '#44403c' }
                            },
                            yWpm: {
                                position: 'left',
                                grid: { color: 'rgba(28, 25, 23, 0.08)' },
                                ticks: { font: { size: 9, weight: 'bold' }, color: '#b91c1c' },
                                title: { display: true, text: 'WPM', font: { size: 9, weight: 'extrabold' }, color: '#b91c1c' }
                            },
                            yAcc: {
                                position: 'right',
                                min: 0,
                                max: 100,
                                grid: { drawOnChartArea: false },
                                ticks: { font: { size: 9, weight: 'bold' }, color: '#10b981' },
                                title: { display: true, text: 'Accuracy %', font: { size: 9, weight: 'extrabold' }, color: '#10b981' }
                            }
                        }
                    }
                });

                this.weakKeysChartInstance = new Chart(ctxFriction, {
                    type: 'bar',
                    data: {
                        labels: [],
                        datasets: [{
                            data: [],
                            backgroundColor: 'rgba(185, 28, 28, 0.85)',
                            borderRadius: 6,
                            borderWidth: 0
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            x: {
                                min: 0,
                                max: 1.0,
                                grid: { color: 'rgba(28, 25, 23, 0.08)' },
                                ticks: { font: { size: 9, weight: 'bold', family: 'Inter' }, color: '#44403c' },
                                title: { display: true, text: 'Friction Ratio (Errors/Presses)', font: { size: 9, weight: 'extrabold' }, color: '#44403c' }
                            },
                            y: {
                                grid: { display: false },
                                ticks: { font: { size: 10, weight: 'black', family: 'Inter' }, color: '#1c1917' }
                            }
                        }
                    }
                });

                // Apply initial contrast settings depending on the active layout
                const isDark = document.documentElement.classList.contains('dark');
                this.updateChartColorsForTheme(isDark);
            }

            // High Performance: Dynamic chart color controller on the fly
            updateChartColorsForTheme(isDark) {
                if (!this.progressChartInstance || !this.weakKeysChartInstance) return;
                const textColor = isDark ? '#d6d3d1' : '#44403c';
                const gridColor = isDark ? 'rgba(245, 245, 244, 0.08)' : 'rgba(28, 25, 23, 0.08)';
                
                // Update progress chart ticks/grids
                this.progressChartInstance.options.scales.x.ticks.color = textColor;
                this.progressChartInstance.options.scales.yWpm.grid.color = gridColor;
                this.progressChartInstance.options.scales.yWpm.ticks.color = isDark ? '#ef4444' : '#b91c1c';
                this.progressChartInstance.options.scales.yAcc.ticks.color = isDark ? '#34d399' : '#10b981';
                
                // Update weak keys chart ticks/grids
                this.weakKeysChartInstance.options.scales.x.ticks.color = textColor;
                this.weakKeysChartInstance.options.scales.x.grid.color = gridColor;
                this.weakKeysChartInstance.options.scales.x.title.color = textColor;
                this.weakKeysChartInstance.options.scales.y.ticks.color = isDark ? '#ef4444' : '#1c1917';
                
                this.progressChartInstance.update();
                this.weakKeysChartInstance.update();
            }

            updateAnalyticsCharts() {
                if (!this.progressChartInstance || !this.weakKeysChartInstance) return;

                const history = this.state.practiceHistory;
                const overlayTrend = document.getElementById('no-history-overlay');

                if (history && history.length > 0) {
                    if (overlayTrend) overlayTrend.classList.add('hidden');
                    
                    const labels = history.map((run, i) => `#${i + 1}`);
                    const wpmData = history.map(run => run.wpm);
                    const accData = history.map(run => run.accuracy);

                    this.progressChartInstance.data.labels = labels;
                    this.progressChartInstance.data.datasets[0].data = wpmData;
                    this.progressChartInstance.data.datasets[1].data = accData;
                    this.progressChartInstance.update();
                } else {
                    if (overlayTrend) overlayTrend.classList.remove('hidden');
                    this.progressChartInstance.data.labels = [];
                    this.progressChartInstance.data.datasets[0].data = [];
                    this.progressChartInstance.data.datasets[1].data = [];
                    this.progressChartInstance.update();
                }

                const cumulative = this.state.cumulativeKeyStats;
                const overlayWeak = document.getElementById('no-weakkeys-overlay');

                const sortedWeakKeys = Object.keys(cumulative)
                    .map(code => {
                        const stats = cumulative[code];
                        const ratio = stats.presses >= 3 ? (stats.errors / stats.presses) : 0;
                        return { code, ratio, errors: stats.errors };
                    })
                    .filter(item => item.ratio > 0.05) 
                    .sort((a, b) => b.ratio - a.ratio) 
                    .slice(0, 7); 

                if (sortedWeakKeys.length > 0) {
                    if (overlayWeak) overlayWeak.classList.add('hidden');

                    const barLabels = sortedWeakKeys.map(item => {
                        let charRepr = item.code.replace('Key', '').toUpperCase();
                        const registry = window.KEYBOARD_REGISTRY || KEYBOARD_REGISTRY;
                        const layout = registry.layouts[this.state.currentLayout];
                        if (layout && layout.forwardMap && layout.forwardMap[item.code]) {
                            charRepr = layout.forwardMap[item.code];
                        }
                        return `${charRepr} (${item.code.replace('Key', '')})`;
                    });
                    const barData = sortedWeakKeys.map(item => Math.min(1.0, item.ratio));

                    this.weakKeysChartInstance.data.labels = barLabels;
                    this.weakKeysChartInstance.data.datasets[0].data = barData;
                    this.weakKeysChartInstance.update();
                } else {
                    if (overlayWeak) overlayWeak.className = "";
                    this.weakKeysChartInstance.data.labels = [];
                    this.weakKeysChartInstance.data.datasets[0].data = [];
                    this.weakKeysChartInstance.update();
                }
            }

            showCustomConfirm(message, proceedCallback) {
                const modal = document.getElementById('custom-confirm-modal');
                const messageEl = document.getElementById('custom-confirm-message');
                const cancelBtn = document.getElementById('btn-confirm-cancel');
                const proceedBtn = document.getElementById('btn-confirm-proceed');

                if (!modal || !messageEl) return;

                messageEl.textContent = message;
                modal.classList.remove('hidden');

                const cleanup = () => {
                    modal.classList.add('hidden');
                    cancelBtn.removeEventListener('click', onCancel);
                    proceedBtn.removeEventListener('click', onProceed);
                };

                const onCancel = () => {
                    cleanup();
                };

                const onProceed = () => {
                    cleanup();
                    proceedCallback();
                };

                cancelBtn.addEventListener('click', onCancel);
                proceedBtn.addEventListener('click', onProceed);
            }

            clearAnalyticsHistory() {
                this.showCustomConfirm(
                    "Are you sure you want to clear your local performance trends and cumulative error history? This cannot be undone.",
                    () => {
                        this.state.practiceHistory = [];
                        this.state.cumulativeKeyStats = {};
                        StorageProxy.set('keymaster_practice_history', []);
                        StorageProxy.set('keymaster_cumulative_key_stats', {});
                        this.updateAnalyticsCharts();
                        this.showToast("Practice database reset complete.");
                    }
                );
            }

            toggleAnalyticsModal() {
                const modal = document.getElementById('analytics-modal');
                if (!modal) return;
                const isHidden = modal.classList.toggle('hidden');
                if (!isHidden) {
                    document.body.style.overflow = 'hidden';
                    document.documentElement.style.overflow = 'hidden';
                    setTimeout(() => {
                        this.updateAnalyticsCharts();
                    }, 50);
                } else {
                    document.body.style.overflow = '';
                    document.documentElement.style.overflow = '';
                }
            }

            updateDailyStreakOnCompletion() {
                const todayStr = this.getTodaysDateString();
                const yesterdayStr = this.getYesterdaysDateString();
                const lastDate = this.state.streakLastDate;

                if (!lastDate) {
                    this.state.streakCurrent = 1;
                    this.state.streakLastDate = todayStr;
                    this.showStreakMilestoneCelebration(1);
                } else if (lastDate === todayStr) {
                    this.showToast("Practice session logged for today! Streak is secure.");
                } else if (lastDate === yesterdayStr) {
                    this.state.streakCurrent += 1;
                    this.state.streakLastDate = todayStr;
                    this.showStreakMilestoneCelebration(this.state.streakCurrent);
                } else {
                    this.state.streakCurrent = 1;
                    this.state.streakLastDate = todayStr;
                    this.showToast("New daily streak started today! Let's build consistency.");
                }

                if (this.state.streakCurrent > this.state.streakBest) {
                    this.state.streakBest = this.state.streakCurrent;
                    StorageProxy.set('keymaster_streak_best', this.state.streakBest);
                }

                StorageProxy.set('keymaster_streak_current', this.state.streakCurrent);
                StorageProxy.set('keymaster_streak_last_date', this.state.streakLastDate);

                this.updateStreakVisuals();
            }

            showStreakMilestoneCelebration(days) {
                if (days === 7) {
                    this.showToast("🔥 Consistent! You achieved a 7-Day Typing Streak! Keep it up!");
                } else if (days === 30) {
                    this.showToast("🏆 Milestone Streak! 30 Days of consistent touch typing!");
                } else {
                    this.showToast("🔥 Daily Streak Updated: " + days + " " + (days === 1 ? 'Day' : 'Days') + "!");
                }
            }

            updateStreakVisuals() {
                const countBadge = document.getElementById('streak-count-badge');
                const bestBadge = document.getElementById('streak-best-badge');
                const countDesktop = document.getElementById('streak-count-desktop');
                const badgeContainer = document.getElementById('streak-badge-container');
                const pillDesktop = document.getElementById('streak-pill-desktop');

                if (countBadge) countBadge.textContent = `${this.state.streakCurrent} Day Streak`;
                if (bestBadge) bestBadge.textContent = this.state.streakBest;
                if (countDesktop) countDesktop.textContent = `${this.state.streakCurrent} Day Streak`;

                if (badgeContainer) {
                    if (this.state.streakCurrent >= 30) {
                        badgeContainer.className = "mt-2 inline-flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-amber-500 border border-red-400 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase text-white tracking-wide shadow-md cursor-help";
                    } else if (this.state.streakCurrent >= 7) {
                        badgeContainer.className = "mt-2 inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-yellow-500 border border-orange-400 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase text-white tracking-wide shadow-sm cursor-help";
                    } else {
                        badgeContainer.className = "mt-2 inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase text-amber-950 dark:text-amber-300 tracking-wide shadow-sm cursor-help";
                    }
                }

                if (pillDesktop) {
                    if (this.state.streakCurrent >= 30) {
                        pillDesktop.className = "flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-amber-500 text-white border border-red-400 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest";
                    } else if (this.state.streakCurrent >= 7) {
                        pillDesktop.className = "flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-yellow-500 text-white border border-orange-400 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest";
                    } else {
                        pillDesktop.className = "flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest";
                    }
                }
            }

            evaluateFrictionAlertKeys() {
                let errorKeysExist = false;
                for (const keycode in this.state.metrics.errorsPerKey) {
                    if (this.state.metrics.errorsPerKey[keycode] >= 2) {
                        errorKeysExist = true;
                        break;
                    }
                }
                const bar = document.getElementById('weak-keys-alert-bar');
                if (bar) {
                    if (errorKeysExist) {
                        bar.classList.remove('hidden');
                    } else {
                        bar.classList.add('hidden');
                    }
                }
            }

            compileWeakKeysCustomDrill() {
                let weakCharacters = [];
                const registry = window.KEYBOARD_REGISTRY || KEYBOARD_REGISTRY;
                for (const keycode in this.state.metrics.errorsPerKey) {
                    if (this.state.metrics.errorsPerKey[keycode] >= 2) {
                        let character = "";
                        if (this.state.currentLayout === 'hindi_inscript') {
                            character = registry.layouts.hindi_inscript.forwardMap[keycode];
                        } else if (this.state.currentLayout === 'hindi_remington') {
                            character = registry.layouts.hindi_remington.forwardMap[keycode];
                        } else {
                            for (const char in registry.charToCodeMap) {
                                if (registry.charToCodeMap[char] === keycode) {
                                    character = char;
                                    break;
                                }
                            }
                        }
                        if (character && !weakCharacters.includes(character)) {
                            weakCharacters.push(character);
                        }
                    }
                }

                if (weakCharacters.length === 0) {
                    this.showToast("Perfect score! No weak keys detected.");
                    return;
                }

                let builtDrillWords = [];
                weakCharacters.forEach(char => {
                    const triple = (char + char + char);
                    builtDrillWords.push(triple);
                    builtDrillWords.push(char);
                });

                const joinedStr = builtDrillWords.join(" ");
                
                const categorySelect = document.getElementById('lesson-category-select');
                if (categorySelect) categorySelect.value = 'custom_practice';
                
                const customText = document.getElementById('custom-typed-text');
                if (customText) customText.value = joinedStr;

                this.loadPracticeSyllabusString();
                this.showToast("Weak characters loaded into Practice Sandbox!");
            }

            showToast(msg) {
                const toast = document.getElementById('notification-toast');
                if (toast) {
                    toast.textContent = msg;
                    toast.className = "fixed bottom-5 left-1/2 -translate-x-1/2 bg-stone-900 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xl z-[2000] show transition-all duration-300";
                    setTimeout(() => {
                        toast.className = "hidden";
                    }, 3000);
                }
            }

            toggleCertModal() {
                const modal = document.getElementById('cert-claim-modal');
                const errorMsg = document.getElementById('cert-status-error-msg');
                const speedLbl = document.getElementById('best-speed-lbl');
                const accLbl = document.getElementById('best-accuracy-lbl');

                if (!modal) return;

                const isHidden = modal.classList.toggle('hidden');
                if (!isHidden) {
                    if (speedLbl) speedLbl.textContent = `${this.state.bestWpmRecord} WPM`;
                    if (accLbl) accLbl.textContent = `${this.state.bestAccuracyRecord}%`;

                    if (errorMsg) {
                        if (this.state.bestWpmRecord >= 35 && this.state.bestAccuracyRecord >= 95) {
                            errorMsg.textContent = "🏆 Eligible! You are qualified to claim your certificate.";
                            errorMsg.className = "text-[11px] text-emerald-800 dark:text-emerald-400 font-bold italic text-center";
                        } else {
                            errorMsg.textContent = "🔒 Locked. Reach 35+ WPM speed with 95% accuracy to unlock.";
                            errorMsg.className = "text-[11px] text-red-800 dark:text-red-400 font-bold italic text-center";
                        }
                    }

                    const ach7Icon = document.getElementById('achieve-7day-icon');
                    const ach7Status = document.getElementById('achieve-7day-status');
                    const ach7Box = document.getElementById('achieve-7day');
                    if (this.state.streakCurrent >= 7) {
                        if (ach7Icon) ach7Icon.textContent = "🔥";
                        if (ach7Status) ach7Status.textContent = "Unlocked & Activated!";
                        if (ach7Box) ach7Box.className = "flex items-center gap-2 bg-orange-50 border border-orange-300 rounded-xl p-2 text-orange-950 dark:bg-stone-800 dark:border-orange-850 dark:text-orange-300";
                    } else {
                        if (ach7Icon) ach7Icon.textContent = "🔒";
                        if (ach7Status) ach7Status.textContent = `${7 - this.state.streakCurrent} days remaining`;
                        if (ach7Box) ach7Box.className = "flex items-center gap-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2";
                    }

                    const ach30Icon = document.getElementById('achieve-30day-icon');
                    const ach30Status = document.getElementById('achieve-30day-status');
                    const ach30Box = document.getElementById('achieve-30day');
                    if (this.state.streakCurrent >= 30) {
                        if (ach30Icon) ach30Icon.textContent = "👑";
                        if (ach30Status) ach30Status.textContent = "Consistent Practice Active!";
                        if (ach30Box) ach30Box.className = "flex items-center gap-2 bg-red-50 border border-red-300 rounded-xl p-2 text-red-950 dark:bg-stone-800 dark:border-red-850 dark:text-red-350";
                    } else {
                        if (ach30Icon) ach30Icon.textContent = "🔒";
                        if (ach30Status) ach30Status.textContent = `${30 - this.state.streakCurrent} days remaining`;
                        if (ach30Box) ach30Box.className = "flex items-center gap-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2";
                    }

                    document.body.style.overflow = 'hidden';
                    document.documentElement.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                    document.documentElement.style.overflow = '';
                }
            }

            handleCertificatePrintAction() {
                if (this.state.bestWpmRecord < 35 || this.state.bestAccuracyRecord < 95) {
                    this.showToast("Typing speed milestone of 35 WPM with 95% accuracy not met yet.");
                    return;
                }

                const rawName = document.getElementById('student-name-input').value || "Candidate Master";
                const candidateName = escapeHTML(rawName);
                const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
                
                const layoutName = this.state.currentLayout === 'hindi_inscript' 
                    ? 'Hindi Inscript (Mangal Unicode)' 
                    : this.state.currentLayout === 'hindi_remington' 
                        ? 'Hindi Remington (Krutidev Gail)' 
                        : 'English Classic QWERTY';

                const printShelf = document.getElementById('print-certificate-shelf');
                if (!printShelf) return;

                printShelf.innerHTML = `
                    <div class="relative w-full min-h-screen bg-[#faf8f5] p-12 flex flex-col justify-between items-center overflow-hidden print:p-8" style="font-family: 'Playfair Display', serif; box-sizing: border-box;">
                        <div class="absolute inset-4 border-[3px] border-[#c5a880] pointer-events-none"></div>
                        <div class="absolute inset-6 border border-[#c5a880]/60 pointer-events-none"></div>
                        
                        <div class="absolute top-8 left-8 text-[#c5a880] w-12 h-12 opacity-80">
                            <svg viewBox="0 0 100 100" class="fill-current"><path d="M0 0 h100 v10 H20 v90 H0 z"/></svg>
                        </div>
                        <div class="absolute top-8 right-8 text-[#c5a880] w-12 h-12 opacity-80 transform rotate-90">
                            <svg viewBox="0 0 100 100" class="fill-current"><path d="M0 0 h100 v10 H20 v90 H0 z"/></svg>
                        </div>

                        <div class="text-center z-10 mt-6 space-y-2">
                            <h1 class="text-4xl font-bold tracking-[0.25em] text-[#2e2a24] uppercase" style="font-family: 'Cinzel', serif;">Certificate of Mastery</h1>
                            <p class="text-xs tracking-[0.3em] text-[#9c805e] uppercase font-bold">Devanagari KeyMaster Typing Academy</p>
                        </div>

                        <div class="text-center z-10 my-4 max-w-2xl space-y-4">
                            <p class="text-sm italic text-stone-700 font-sans">This document certifies that</p>
                            <h2 class="text-4xl font-extrabold text-stone-900 border-b border-[#c5a880]/50 pb-2.5 my-3 px-8 italic" style="font-family: 'Playfair Display', serif;">${candidateName}</h2>
                            <p class="text-sm leading-relaxed text-stone-800 font-sans font-medium">
                                has completed the touch typing speed and accuracy milestones on the keyboard layout:
                            </p>
                            <p class="text-xs text-[#9c805e] font-black uppercase tracking-widest">
                                Layout Standard: <span class="text-stone-900 font-black">${layoutName}</span>
                            </p>
                        </div>

                        <div class="w-full max-w-3xl grid grid-cols-3 gap-4 items-center z-10 mb-6 text-center">
                            <div class="space-y-1.5 text-left pl-6 border-l-2 border-[#c5a880]/30 font-sans">
                                <p class="text-[10px] text-stone-500 uppercase tracking-widest font-black leading-none mb-1">Academic Scores</p>
                                <p class="text-xs text-[#2e2a24] font-bold leading-normal">Speed: <span class="text-stone-950 font-black">${this.state.bestWpmRecord} Net WPM</span></p>
                                <p class="text-xs text-[#2e2a24] font-bold leading-normal">Accuracy: <span class="text-stone-950 font-black">${this.state.bestAccuracyRecord}%</span></p>
                                <p class="text-[10px] text-[#9c805e] font-black tracking-wide mt-1.5">Date: ${dateStr}</p>
                            </div>

                            <div class="flex flex-col items-center justify-center relative">
                                <svg class="w-20 h-20 text-[#d4af37]" viewBox="0 0 100 100" fill="currentColor">
                                    <path d="M50 5 L53 14 L62 9 L61 19 L70 16 L66 25 L75 24 L69 32 L78 33 L71 40 L79 43 L71 49 L77 56 L68 59 L77 56 L68 59 L73 67 L63 68 L66 77 L57 76 L58 85 L49 82 L48 91 L40 86 L38 95 L31 88 L27 96 L22 88 L16 94 L13 85 L6 89 L6 79 L0 74 L8 67 L2 60 L10 55 L5 47 L13 44 L10 35 L19 34 L17 25 L26 26 L26 16 L35 19 L36 9 L44 14 Z" opacity="0.9" />
                                    <circle cx="50" cy="50" r="34" fill="#c5a880" stroke="#b3966a" stroke-width="2" />
                                    <circle cx="50" cy="50" r="30" fill="none" stroke="#faf8f5" stroke-dasharray="2" stroke-width="1.5" opacity="0.8" />
                                    <text x="50" y="44" font-family="'Cinzel', serif" font-weight="900" font-size="6" fill="#faf8f5" text-anchor="middle" letter-spacing="1">TYPING</text>
                                    <text x="50" y="53" font-family="'Cinzel', serif" font-weight="900" font-size="10" fill="#faf8f5" text-anchor="middle" letter-spacing="1">KEY</text>
                                    <text x="50" y="62" font-family="'Cinzel', serif" font-weight="900" font-size="6" fill="#faf8f5" text-anchor="middle" letter-spacing="1">VERIFIED</text>
                                </svg>
                            </div>

                            <div class="space-y-1 pr-6 flex flex-col items-end">
                                <span class="text-3xl text-[#2e2a24] italic pr-2" style="font-family: 'Pinyon Script', cursive; transform: rotate(-4deg); transform-origin: bottom right;">Devendra Sharma</span>
                                <div class="w-36 border-t border-stone-400"></div>
                                <p class="text-[9px] text-[#9c805e] uppercase tracking-widest font-black leading-none mt-1">Registrar Authority</p>
                            </div>
                        </div>
                    </div>
                `;

                window.print();
            }

            handleCertificateCanvasDownload() {
                if (this.state.bestWpmRecord < 35 || this.state.bestAccuracyRecord < 95) {
                    this.showToast("Typing speed milestone of 35 WPM with 95% accuracy not met yet.");
                    return;
                }

                this.showToast("Generating certificate...");

                const rawName = document.getElementById('student-name-input').value || "Candidate Master";
                const candidateName = rawName.toUpperCase();
                const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
                
                const layoutName = this.state.currentLayout === 'hindi_inscript' 
                    ? 'Hindi Inscript (Mangal Unicode)' 
                    : this.state.currentLayout === 'hindi_remington' 
                        ? 'Hindi Remington (Krutidev Gail)' 
                        : 'English Classic QWERTY';

                const canvas = document.createElement('canvas');
                canvas.width = 1200;
                canvas.height = 800;
                const ctx = canvas.getContext('2d');

                // Draw Background
                ctx.fillStyle = '#faf8f5';
                ctx.fillRect(0, 0, 1200, 800);

                // Draw Gold Border Frame
                ctx.strokeStyle = '#c5a880';
                ctx.lineWidth = 6;
                ctx.strokeRect(20, 20, 1160, 760);

                ctx.strokeStyle = 'rgba(197, 168, 128, 0.4)';
                ctx.lineWidth = 2;
                ctx.strokeRect(30, 30, 1140, 740);

                // Draw Corner Ornaments
                ctx.fillStyle = '#c5a880';
                // Top-Left Corner
                ctx.fillRect(35, 35, 50, 6);
                ctx.fillRect(35, 35, 6, 50);
                // Top-Right Corner
                ctx.fillRect(1115, 35, 50, 6);
                ctx.fillRect(1159, 35, 6, 50);
                // Bottom-Left Corner
                ctx.fillRect(35, 759, 50, 6);
                ctx.fillRect(35, 715, 6, 50);
                // Bottom-Right Corner
                ctx.fillRect(1115, 759, 50, 6);
                ctx.fillRect(1159, 715, 6, 50);

                // Title Text
                ctx.textAlign = 'center';
                ctx.fillStyle = '#1c1917';
                ctx.font = "bold 42px 'Cinzel', serif";
                ctx.fillText("CERTIFICATE OF MASTERY", 600, 150);

                ctx.fillStyle = '#9c805e';
                ctx.font = "bold 14px 'Inter', sans-serif";
                ctx.fillText("DEVNAGARI KEYMASTER TYPING ACADEMY", 600, 190);

                // Certificate Prose
                ctx.fillStyle = '#44403c';
                ctx.font = "italic 16px 'Playfair Display', serif";
                ctx.fillText("This document certifies that", 600, 270);

                ctx.fillStyle = '#1c1917';
                ctx.font = "bold 38px 'Playfair Display', serif";
                ctx.fillText(candidateName, 600, 340);

                // Draw Accent line below name
                ctx.strokeStyle = '#c5a880';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(400, 360);
                ctx.lineTo(800, 360);
                ctx.stroke();

                ctx.fillStyle = '#44403c';
                ctx.font = "15px 'Inter', sans-serif";
                ctx.fillText("has successfully completed the typing speed and accuracy milestones", 600, 420);
                ctx.fillText("on the standard keyboard layout standard:", 600, 445);

                ctx.fillStyle = '#9c805e';
                ctx.font = "bold 15px 'Inter', sans-serif";
                ctx.fillText(`LAYOUT: ${layoutName.toUpperCase()}`, 600, 495);

                // Bottom Metadata - Scores
                ctx.textAlign = 'left';
                ctx.fillStyle = '#57534e';
                ctx.font = "bold 11px 'Inter', sans-serif";
                ctx.fillText("ACADEMIC SCORES", 120, 590);

                ctx.fillStyle = '#1c1917';
                ctx.font = "bold 15px 'Inter', sans-serif";
                ctx.fillText(`SPEED: ${this.state.bestWpmRecord} Net WPM`, 120, 620);
                ctx.fillText(`ACCURACY: ${this.state.bestAccuracyRecord}%`, 120, 645);
                
                ctx.fillStyle = '#9c805e';
                ctx.font = "bold 12px 'Inter', sans-serif";
                ctx.fillText(`DATE: ${dateStr.toUpperCase()}`, 120, 680);

                // Bottom Metadata - Seal Symbol
                ctx.fillStyle = '#c5a880';
                ctx.beginPath();
                ctx.arc(600, 630, 45, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#faf8f5';
                ctx.textAlign = 'center';
                ctx.font = "bold 10px 'Cinzel', serif";
                ctx.fillText("TYPING", 600, 615);
                ctx.font = "bold 16px 'Cinzel', serif";
                ctx.fillText("TUTOR", 600, 634);
                ctx.font = "bold 9px 'Cinzel', serif";
                ctx.fillText("VERIFIED", 600, 650);

                // Bottom Metadata - Signatures
                ctx.textAlign = 'right';
                ctx.fillStyle = '#1c1917';
                ctx.font = "italic 24px 'Pinyon Script', cursive";
                ctx.fillText("Devendra Sharma", 1080, 615);

                ctx.strokeStyle = '#a8a29e';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(900, 630);
                ctx.lineTo(1080, 630);
                ctx.stroke();

                ctx.fillStyle = '#57534e';
                ctx.font = "bold 11px 'Inter', sans-serif";
                ctx.fillText("REGISTRAR AUTHORITY", 1080, 650);

                // Convert Canvas content to downloadable file instantly
                try {
                    const dataURL = canvas.toDataURL('image/png');
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.href = dataURL;
                    downloadAnchor.download = `KeyMaster_Certificate_${candidateName.replace(/\s+/g, '_')}.png`;
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    document.body.removeChild(downloadAnchor);
                    this.showToast("Certificate saved successfully!");
                } catch(err) {
                    console.error("Canvas export failed: ", err);
                    this.showToast("Canvas rendering failed. Please try printing.");
                }
            }
        }

        // Helper string sanitizers
        function escapeHTML(str) {
            return str.replace(/[&<>'"]/g, 
                tag => ({
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    "'": '&#39;',
                    '"': '&quot;'
                }[tag] || tag)
            );
        }

        function formatSecondsToTimeStr(seconds) {
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            return `${m}:${s < 10 ? '0' : ''}${s}`;
        }

        // Map keycode sequence to relevant active fingers
        function mapKeycodeToFingerGuide(keycode) {
            const lookup = {
                // Left Hand
                'KeyQ': 'finger-L-pink', 'KeyA': 'finger-L-pink', 'KeyZ': 'finger-L-pink', 'Digit1': 'finger-L-pink', 'Backquote': 'finger-L-pink',
                'KeyW': 'finger-L-ring', 'KeyS': 'finger-L-ring', 'KeyX': 'finger-L-ring', 'Digit2': 'finger-L-ring',
                'KeyE': 'finger-L-middle', 'KeyD': 'finger-L-middle', 'KeyC': 'finger-L-middle', 'Digit3': 'finger-L-middle',
                'KeyR': 'finger-L-index', 'KeyF': 'finger-L-index', 'KeyV': 'finger-L-index', 'Digit4': 'finger-L-index',
                'KeyT': 'finger-L-index', 'KeyG': 'finger-L-index', 'KeyB': 'finger-L-index', 'Digit5': 'finger-L-index',
                'AltLeft': 'finger-L-thumb',
                
                // Space Bar mapping
                'Space': 'finger-R-thumb',
                
                // Right Hand
                'AltRight': 'finger-R-thumb',
                'KeyY': 'finger-R-index', 'KeyH': 'finger-R-index', 'KeyN': 'finger-R-index', 'Digit6': 'finger-R-index',
                'KeyU': 'finger-R-index', 'KeyJ': 'finger-R-index', 'KeyM': 'finger-R-index', 'Digit7': 'finger-R-index',
                'KeyI': 'finger-R-middle', 'KeyK': 'finger-R-middle', 'Comma': 'finger-R-middle', 'Digit8': 'finger-R-middle',
                'KeyO': 'finger-R-ring', 'KeyL': 'finger-R-ring', 'Period': 'finger-R-ring', 'Digit9': 'finger-R-ring',
                'KeyP': 'finger-R-pinky', 'Semicolon': 'finger-R-pinky', 'Slash': 'finger-R-pinky', 'Digit0': 'finger-R-pinky',
                'BracketLeft': 'finger-R-pinky', 'BracketRight': 'finger-R-pinky', 'Quote': 'finger-R-pinky', 'Minus': 'finger-R-pinky', 'Equal': 'finger-R-pinky'
            };
            return lookup[keycode] || null;
        }

        // Initialize the optimized application
        document.addEventListener('DOMContentLoaded', () => {
            window.keyMasterApp = new DevnagariKeyMasterApp();
            window.keyMasterApp.init();
        });