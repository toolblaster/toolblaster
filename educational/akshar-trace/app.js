       // --- SECURE STORAGE AND VERSIONED SCHEMA MANAGER ---
        const STORAGE_VERSION = 1;
        const StorageManager = {
            get(key, defaultValue) {
                try {
                    const raw = localStorage.getItem(key);
                    if (!raw) return defaultValue;
                    const parsed = JSON.parse(raw);
                    if (parsed && typeof parsed === 'object' && 'version' in parsed) {
                        if (parsed.version === STORAGE_VERSION) {
                            return parsed.data;
                        } else {
                            console.warn(`Upgrading/Cleaning storage keys for: ${key}. Found version ${parsed.version}`);
                            return defaultValue;
                        }
                    }
                    return parsed;
                } catch (e) {
                    console.error(`Local sandbox read parsing failed for key: ${key}. Falling back safely.`, e);
                    return defaultValue;
                }
            },
            set(key, val) {
                try {
                    const envelope = {
                        version: STORAGE_VERSION,
                        data: val
                    };
                    localStorage.setItem(key, JSON.stringify(envelope));
                    return true;
                } catch (e) {
                    console.error(`Local sandbox save operation crashed for key: ${key}`, e);
                    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22) {
                        try {
                            console.warn("Storage Quota Exceeded. Automatic pruning in progress...");
                            const currentLogs = this.get('akshartrace_analytics_history', []);
                            if (currentLogs.length > 5) {
                                this.set('akshartrace_analytics_history', currentLogs.slice(-5));
                                const envelope = { version: STORAGE_VERSION, data: val };
                                localStorage.setItem(key, JSON.stringify(envelope));
                                return true;
                            }
                        } catch (pruningError) {
                            console.error("Quota self-recovery routine failed:", pruningError);
                        }
                    }
                    return false;
                }
            },
            remove(key) {
                try {
                    localStorage.removeItem(key);
                    return true;
                } catch (e) {
                    console.error(`Wiping key failed: ${key}`, e);
                    return false;
                }
            }
        };

        let currentMode = 'drill'; 
        let activeTracerLetter = 'अ'; 
        let audioCtx = null;
        let isTracingDrawing = false;
        let activeTheme = 'chalk'; 
        let activeDifficultyLevel = 'beginner'; 
        
        let canvas = null;
        let ctx = null;

        // Accessibility Support Variables
        let isAssistMode = false;
        let assistTargetIndex = 0;
        let virtualCursorX = 100;
        let virtualCursorY = 100;

        // Micro-SaaS UX Improvements: Color Palette & Mute Trigger States
        let activeChalkColor = "rgba(255, 255, 255, 0.95)";
        let isSoundMuted = false;
        let isDemonstrating = false;

        let userRewardsPoints = parseInt(StorageManager.get('akshartrace_rewards_points', 0)) || 0;

        let chalkOscNode = null;
        let chalkNoiseNode = null;
        let chalkFilterNode = null;
        let chalkGainNode = null;

        // HIGH-FIDELITY DEVANAGARI COORDINATE MAPPING (200x200 viewport grid)
        const devanagariCoordinates = {
            'अ': 'M 50,60 C 85,50 85,85 55,85 C 90,85 90,120 50,120 M 72,85 L 120,85 M 120,50 L 120,135 M 40,50 L 150,50',
            'आ': 'M 45,60 C 80,50 80,85 50,85 C 85,85 85,120 45,120 M 67,85 L 115,85 M 115,50 L 115,135 M 130,50 L 130,135 M 35,50 L 160,50',
            'इ': 'M 100,50 L 100,60 C 70,60 70,85 100,85 C 130,85 130,110 100,110 C 80,110 70,120 80,135 L 95,125 M 60,50 L 140,50',
            'ई': 'M 100,50 L 100,60 C 70,60 70,85 100,85 C 130,85 130,110 100,110 C 80,110 70,120 80,135 L 95,125 M 100,50 C 100,25 125,25 125,40 M 60,50 L 140,50',
            'उ': 'M 60,60 C 105,50 105,85 65,85 C 110,85 110,120 60,120 M 40,50 L 140,50',
            'ऊ': 'M 60,60 C 105,50 105,85 65,85 C 110,85 110,120 60,120 M 65,85 C 95,85 95,115 80,130 M 40,50 L 140,50',
            'ए': 'M 70,50 L 70,90 L 105,135 M 110,50 L 115,85 C 115,85 90,95 80,95 M 50,50 L 135,50',
            'ऐ': 'M 70,50 L 70,90 L 105,135 M 110,50 L 115,85 C 115,85 90,95 80,95 M 70,50 C 70,25 95,25 95,40 M 50,50 L 135,50',
            'ओ': 'M 45,60 C 80,50 80,85 50,85 C 85,85 85,120 45,120 M 67,85 L 115,85 M 115,50 L 115,135 M 130,50 L 130,135 M 130,50 C 130,25 155,25 155,40 M 35,50 L 160,50',
            'औ': 'M 45,60 C 80,50 80,85 50,85 C 85,85 85,120 45,120 M 67,85 L 115,85 M 115,50 L 115,135 M 130,50 L 130,135 M 130,50 C 130,25 155,25 155,40 M 130,50 C 120,25 145,15 145,30 M 35,50 L 160,50',
            'क': 'M 100,50 L 100,140 M 100,85 C 65,85 65,115 100,115 C 135,115 135,85 100,85 C 115,85 140,85 140,115 L 140,125 M 40,50 L 160,50',
            'ख': 'M 50,65 C 50,45 80,45 80,75 L 80,105 C 80,130 50,130 50,115 M 80,105 L 130,105 M 130,50 L 130,135 M 130,92 C 100,92 100,118 130,118 M 35,50 L 160,50',
            'ग': 'M 75,50 L 75,110 C 75,130 50,130 50,110 M 120,50 L 120,135 M 35,50 L 145,50',
            'घ': 'M 55,60 C 85,60 85,85 60,85 C 95,85 95,110 115,110 M 115,50 L 115,135 M 35,50 L 145,50',
            'च': 'M 55,90 L 105,90 C 70,130 120,130 120,90 M 120,50 L 120,140 M 35,50 L 145,50',
            'छ': 'M 55,65 C 85,65 85,85 60,85 C 95,85 95,115 70,115 C 70,115 80,125 80,115 L 80,50 M 35,50 L 115,50',
            'ज': 'M 50,105 C 50,125 80,125 80,105 L 115,105 M 115,50 L 115,135 M 35,50 L 135,50',
            'झ': 'M 65,50 L 65,60 C 40,60 40,85 65,85 C 90,85 90,105 65,105 C 45,105 35,115 45,130 L 55,120 M 65,85 L 115,85 M 115,50 L 115,135 M 35,50 L 135,50',
            'ट': 'M 100,50 L 100,70 C 60,70 60,130 100,130 C 130,130 140,110 140,100 M 50,50 L 150,50',
            'ठ': 'M 100,50 L 100,70 C 65,70 65,130 100,130 C 135,130 135,70 100,70 M 50,50 L 150,50',
            'ड': 'M 100,50 L 100,65 C 70,65 70,95 100,95 C 130,95 130,125 100,125 C 80,125 70,115 75,105 M 50,50 L 150,50',
            'ढ': 'M 100,50 L 100,70 C 70,70 70,125 100,125 C 120,125 125,110 120,100 C 115,95 105,95 105,105 M 50,50 L 150,50',
            'ण': 'M 60,50 L 60,110 C 60,130 90,130 90,110 L 90,50 M 120,50 L 120,135 M 40,50 L 140,50',
            'त': 'M 115,50 L 115,135 M 115,85 L 75,85 C 60,85 60,135 60,135 M 40,50 L 150,50',
            'थ': 'M 65,70 C 65,55 85,55 85,75 C 85,90 65,105 85,115 M 120,50 L 120,135 M 85,115 L 120,115 M 40,50 L 150,50',
            'द': 'M 100,50 L 100,70 C 70,70 70,110 100,110 C 120,110 120,130 105,145 M 50,50 L 150,50',
            'ध': 'M 65,65 C 65,55 80,55 80,70 C 80,85 65,95 85,115 M 120,50 L 120,135 M 85,115 L 120,115 M 40,50 L 150,50',
            'न': 'M 120,50 L 120,135 M 120,90 L 70,90 C 50,90 50,110 70,110 C 80,110 80,90 70,90',
            'प': 'M 60,50 L 60,110 C 60,135 120,135 120,110 L 120,50 M 120,100 L 120,135 M 40,50 L 140,50',
            'फ': 'M 60,50 L 60,110 C 60,135 120,135 120,110 L 120,50 M 120,100 C 140,110 155,125 155,140 M 40,50 L 140,50',
            'ब': 'M 60,50 L 60,140 M 60,95 C 110,95 110,140 60,140 M 60,95 L 110,140 M 40,50 L 140,50',
            'भ': 'M 60,50 C 60,65 75,75 90,75 L 90,140 M 130,50 L 130,140 M 90,95 L 130,95 M 40,50 L 140,50',
            'म': 'M 60,50 L 60,110 C 60,125 75,125 90,125 L 130,125 M 130,50 L 130,140 M 40,50 L 145,50',
            'य': 'M 60,55 C 80,55 90,75 90,95 C 90,125 130,125 130,125 M 130,50 L 130,140 M 40,50 L 145,50',
            'र': 'M 60,55 C 105,55 105,95 60,95 M 60,95 L 115,140 M 40,50 L 135,50',
            'ल': 'M 60,50 L 60,140 M 60,95 C 85,75 110,95 110,110 C 110,125 130,135 130,140 M 130,50 L 130,140 M 40,50 L 145,50',
            'व': 'M 60,50 L 60,140 M 60,95 C 110,95 110,140 60,140 M 40,50 L 140,50',
            'श': 'M 60,55 C 85,55 85,95 60,95 M 60,95 L 105,140 M 120,50 L 120,140 M 40,50 L 135,50',
            'ष': 'M 60,50 L 60,140 M 60,95 C 110,95 110,140 60,140 M 60,95 L 110,140 M 120,50 L 120,140 M 40,50 L 140,50',
            'स': 'M 60,55 C 105,55 105,95 60,95 M 60,95 L 115,140 M 90,95 L 130,95 M 130,50 L 130,140 M 40,50 L 145,50',
            'ह': 'M 60,50 L 100,50 L 100,85 C 100,105 60,105 60,125 C 60,145 100,145 100,145 M 40,50 L 120,50',
            'क्ष': 'M 60,50 L 60,140 M 60,95 C 100,80 100,60 80,60 C 60,60 60,95 90,110 L 90,140 M 110,50 L 110,140 M 40,50 L 130,50',
            'त्र': 'M 60,95 L 110,65 M 60,95 L 110,125 M 110,50 L 110,140 M 40,50 L 130,50',
            'ज्ञ': 'M 60,95 L 100,95 C 100,125 60,125 60,140 M 110,50 L 110,140 M 40,50 L 130,50',
            'का': 'M 60,50 L 60,140 M 60,95 C 100,95 100,140 60,140 M 40,50 L 150,50 M 130,50 L 130,140',
            'कि': 'M 100,50 L 100,140 M 100,95 C 130,95 130,140 100,140 M 50,50 L 150,50 M 60,50 L 60,140 M 60,50 C 60,25 100,25 100,50',
            'की': 'M 60,50 L 60,140 M 60,95 C 100,95 100,140 60,140 M 40,50 L 160,50 M 130,50 L 130,140 M 130,50 C 130,25 155,25 155,50',
            'कु': 'M 100,50 L 100,130 M 100,90 C 130,90 130,130 100,130 M 40,50 L 150,50 M 100,130 C 80,130 70,145 80,155',
            'कू': 'M 100,50 L 100,130 M 100,90 C 130,90 130,130 100,130 M 40,50 L 150,50 M 100,130 C 120,130 130,145 120,155'
        };

        const phonicsDictionary = {
            'अ': 'अ से अनार (Anar)', 'आ': 'आ से आम (Aam)', 'इ': 'इ से इमली (Imli)', 'ई': 'ई से ईख (Eekh)',
            'उ': 'उ से उल्लू (Ullu)', 'ऊ': 'ऊ से ऊन (Oon)', 'ए': 'ए से एड़ी (Edi)', 'ऐ': 'ऐ से ऐनक (Ainak)',
            'ओ': 'ओ से ओखली (Okhli)', 'औ': 'औ से औरत (Aurat)',
            'क': 'क से कबूतर (Kabutar)', 'ख': 'ख से खरगोश (Khargosh)', 'ग': 'ग से गमला (Gamla)', 'घ': 'घ से घड़ी (Ghadi)',
            'च': 'च से चम्मच (Chamach)', 'छ': 'छ से छतरी (Chhatri)', 'ज': 'ज से जग (Jag)', 'झ': 'झ से झंडा (Jhanda)',
            'ट': 'ट से टमाटर (Tamatar)', 'ठ': 'ठ से ठठेरा (Thathera)', 'ड': 'ड से डमरू (Damru)', 'ढ': 'ढ से ढक्कन (Dhakkan)',
            'ण': 'ण खाली', 'त': 'त से तरबूज (Tarbuz)', 'थ': 'थ से tharmaameetar', 'द': 'द से दवात (Dawat)', 'ध': 'ध से धनुष (Dhanush)',
            'न': 'न से नल (Nal)', 'प': 'प से पतंग (Patang)', 'फ': 'फ से फल (Fal)', 'ब': 'ब से बत्तख (Batakh)',
            'भ': 'भ से भालू (Bhalu)', 'म': 'म से मछली (Machli)', 'य': 'य से यज्ञ (Yajna)', 'र': 'र से रथ (Rath)',
            'ल': 'ल से लट्टू (Lattu)', 'व': 'व से वन (Van)', 'श': 'श से शलजम (Shaljam)', 'ष': 'ष से षटकोण (Shatkon)', 
            'स': 'स से सपेरा (Sapera)', 'ह': 'ह से हल (Hal)', 'क्ष': 'क्ष से क्षत्रिय', 'त्र': 'त्र से त्रिशूल', 'ज्ञ': 'ज्ञ से ज्ञानी',
            'का': 'क पर आ की मात्रा: का', 'कि': 'क पर छोटी इ की मात्रा: कि', 'की': 'क पर बड़ी ई की मात्रा: की',
            'कु': 'क पर छोटे उ की मात्रा: ku', 'कू': 'क पर बड़े ऊ की मात्रा: koo'
        };

        const badgeCollection = [
            { points: 10, icon: '🐭', label: 'Chulbula Chuha' },
            { points: 30, icon: '🦜', label: 'Pyara Tota' },
            { points: 60, icon: '🐒', label: 'Natkhat Bandar' },
            { points: 100, icon: '🦁', label: 'Sher Raja' },
            { points: 150, icon: '🦉', label: 'Sayana Ullu' },
            { points: 210, icon: '🦚', label: 'Sunehra Mor' }
        ];

        // Structured Tracing states mapped sequentially to individual stroke segments
        let strokeCheckpoints = []; // Stores separated checkpoints per stroke
        let activeStrokeIndex = 0;   // Sequential trace enforcer tracking index
        let totalActiveStrokes = 0;

        function getAnalyticsLogs() {
            return StorageManager.get('akshartrace_analytics_history', []);
        }

        function saveAnalyticsLogs(logs) {
            StorageManager.set('akshartrace_analytics_history', logs);
        }

        function pruneOldActivityLogs() {
            const logs = getAnalyticsLogs();
            const fifteenDaysAgo = Date.now() - (15 * 24 * 60 * 60 * 1000);
            const filtered = logs.filter(log => log.timestamp >= fifteenDaysAgo);
            saveAnalyticsLogs(filtered);
            return filtered;
        }

        function addActivityLog(entry) {
            const logs = getAnalyticsLogs();
            const logEntry = {
                timestamp: Date.now(),
                ...entry
            };
            logs.push(logEntry);
            saveAnalyticsLogs(logs);
            pruneOldActivityLogs();
            showAnalyticsNotificationDot();
        }

        function showAnalyticsNotificationDot() {
            const dot = document.getElementById('analytics-notif-dot');
            if (dot) dot.classList.remove('hidden');
        }

        function clearAnalyticsNotificationDot() {
            const dot = document.getElementById('analytics-notif-dot');
            if (dot) dot.classList.add('hidden');
        }

        function clearAnalyticsLogHistory() {
            StorageManager.remove('akshartrace_analytics_history');
            StorageManager.remove('akshartrace_difficult_letters');
            showToast("Performance logs securely cleared.");
            populateAnalyticsDashboard();
        }

        function getDifficultLetters() {
            return StorageManager.get('akshartrace_difficult_letters', []);
        }

        function flagDifficultLetter(char) {
            let list = getDifficultLetters();
            if (!list.includes(char)) {
                list.push(char);
                StorageManager.set('akshartrace_difficult_letters', list);
            }
        }

        function removeDifficultLetter(char) {
            let list = getDifficultLetters();
            list = list.filter(c => c !== char);
            StorageManager.set('akshartrace_difficult_letters', list);
            populateAnalyticsDashboard();
        }

        function populateAnalyticsDashboard() {
            const logs = pruneOldActivityLogs();
            
            // Stats computations
            const traces = logs.filter(l => l.type === 'trace');
            const totalTraced = traces.length;
            const avgAccuracy = totalTraced > 0 
                ? Math.round(traces.reduce((sum, curr) => sum + curr.accuracy, 0) / totalTraced) 
                : 0;
            const totalSheets = logs.filter(l => l.type === 'print').length;

            const activeDates = new Set();
            logs.forEach(l => {
                const dateStr = new Date(l.timestamp).toDateString();
                activeDates.add(dateStr);
            });
            const activeDaysCount = activeDates.size;

            document.getElementById('stats-total-traced').textContent = totalTraced;
            document.getElementById('stats-avg-accuracy').textContent = `${avgAccuracy}%`;
            document.getElementById('stats-total-sheets').textContent = totalSheets;
            document.getElementById('stats-active-days').textContent = `${activeDaysCount} Days`;

            // Display Certificate Button if User points >= 100
            const certBox = document.getElementById('certificate-claim-box');
            if (certBox) {
                if (userRewardsPoints >= 100) {
                    certBox.classList.remove('hidden');
                } else {
                    certBox.classList.add('hidden');
                }
            }

            // Display Difficult Letters focus space
            const diffContainer = document.getElementById('difficult-letters-badges');
            const printRedemptionBtn = document.getElementById('btn-print-redemption');
            if (diffContainer) {
                diffContainer.innerHTML = '';
                const diffList = getDifficultLetters();
                if (diffList.length === 0) {
                    diffContainer.innerHTML = `<span class="text-stone-500 italic text-[11px]">No difficult letters logged yet. Fantastic tracing speed!</span>`;
                    if (printRedemptionBtn) printRedemptionBtn.classList.add('hidden');
                } else {
                    if (printRedemptionBtn) printRedemptionBtn.classList.remove('hidden');
                    diffList.forEach(char => {
                        const badge = document.createElement('div');
                        badge.className = "flex items-center gap-1.5 bg-red-100 border border-red-200 text-red-955 font-bold px-2 py-0.5 rounded-lg text-xs font-sans";
                        badge.innerHTML = `
                            <span>${char}</span>
                            <button type="button" class="text-red-700 hover:text-red-900 transition-colors focus:outline-none" aria-label="Clear letter ${char}">
                                &times;
                            </button>
                        `;
                        badge.querySelector('button').addEventListener('click', () => {
                            removeDifficultLetter(char);
                        });
                        diffContainer.appendChild(badge);
                    });
                }
            }

            const container = document.getElementById('analytics-timeline-container');
            if (!container) return;

            if (logs.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-6 text-[11px] font-semibold text-stone-400 italic">
                        No activity recorded yet!
                    </div>
                `;
                return;
            }

            // Group logs by Date
            const groups = {};
            logs.sort((a,b) => b.timestamp - a.timestamp).forEach(log => {
                const dayKey = new Date(log.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                if (!groups[dayKey]) groups[dayKey] = [];
                groups[dayKey].push(log);
            });

            let timelineHtml = '';
            for (const dateString in groups) {
                timelineHtml += `
                    <div class="border-b border-stone-200/65 pb-2 mb-2 last:border-none last:pb-0 last:mb-0">
                        <span class="text-[10px] font-black uppercase text-stone-500 block mb-1">${dateString}</span>
                        <div class="space-y-1.5 pl-2 border-l border-stone-300">
                `;
                groups[dateString].forEach(item => {
                    const timeStr = new Date(item.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                    if (item.type === 'trace') {
                        timelineHtml += `
                            <div class="flex justify-between items-center text-[10.5px]">
                                <span class="text-stone-700 font-bold">🖌| Traced Hindi Letter '${item.char}'</span>
                                <div class="flex items-center gap-2">
                                    <span class="text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded">${item.accuracy}% Acc</span>
                                    <span class="text-stone-400 font-medium">${timeStr}</span>
                                </div>
                            </div>
                        `;
                    } else if (item.type === 'print') {
                        timelineHtml += `
                            <div class="flex justify-between items-center text-[10.5px]">
                                <span class="text-stone-700 font-bold">📝 Generated printable worksheets (${item.style === 'custom_name' ? 'Custom Repeated Word' : 'Custom Words'})</span>
                                <span class="text-stone-400 font-medium">${timeStr}</span>
                            </div>
                        `;
                    }
                });
                timelineHtml += `
                        </div>
                    </div>
                `;
            }
            container.innerHTML = timelineHtml;
        }

        // Toggle Analytics view
        function toggleAnalyticsModal() {
            const modal = document.getElementById('analytics-modal');
            if (modal) {
                const isHidden = modal.classList.toggle('hidden');
                if (!isHidden) {
                    clearAnalyticsNotificationDot();
                    populateAnalyticsDashboard();
                    document.body.style.overflow = 'hidden';
                    document.documentElement.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                    document.documentElement.style.overflow = '';
                }
            }
        }

        function closeAnalyticsOnClickOutside(event) {
            const modal = document.getElementById('analytics-modal');
            const modalContent = document.getElementById('analytics-modal-content');
            if (modal && modalContent && !modalContent.contains(event.target)) {
                toggleAnalyticsModal();
            }
        }

        function playSlateChalkSound() {
            if (isSoundMuted) return;
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            if (!audioCtx) return;

            try {
                chalkOscNode = audioCtx.createOscillator();
                chalkOscNode.type = 'triangle';
                chalkOscNode.frequency.setValueAtTime(160, audioCtx.currentTime);

                const bufferSize = audioCtx.sampleRate * 1;
                const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const output = noiseBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    output[i] = Math.random() * 2 - 1;
                }

                chalkNoiseNode = audioCtx.createBufferSource();
                chalkNoiseNode.buffer = noiseBuffer;
                chalkNoiseNode.loop = true;

                chalkFilterNode = audioCtx.createBiquadFilter();
                chalkFilterNode.type = 'bandpass';
                if (activeTheme === 'chalk') {
                    chalkFilterNode.frequency.setValueAtTime(950, audioCtx.currentTime);
                    chalkFilterNode.Q.setValueAtTime(5.0, audioCtx.currentTime);
                } else {
                    chalkFilterNode.frequency.setValueAtTime(2500, audioCtx.currentTime);
                    chalkFilterNode.Q.setValueAtTime(2.0, audioCtx.currentTime);
                }

                chalkGainNode = audioCtx.createGain();
                chalkGainNode.gain.setValueAtTime(activeTheme === 'chalk' ? 0.04 : 0.02, audioCtx.currentTime);

                chalkOscNode.connect(chalkFilterNode);
                chalkNoiseNode.connect(chalkFilterNode);
                chalkFilterNode.connect(chalkGainNode);
                chalkGainNode.connect(audioCtx.destination);

                chalkOscNode.start();
                chalkNoiseNode.start();
            } catch (e) {
                console.warn("Sensory sound initialization failed:", e);
            }
        }

        function stopSlateChalkSound() {
            if (chalkOscNode) {
                try { chalkOscNode.stop(); } catch(e){}
                chalkOscNode = null;
            }
            if (chalkNoiseNode) {
                try { chalkNoiseNode.stop(); } catch(e){}
                chalkNoiseNode = null;
            }
        }

        function playVictorySound() {
            if (isSoundMuted) return;
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
            osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); 
            osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); 
            osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.3); 
            
            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.65);
        }

        function speakHindiPhonics(txt) {
            if (!('speechSynthesis' in window)) return;
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(txt);
            utterance.rate = 0.85;
            utterance.pitch = 1.2;

            const voices = window.speechSynthesis.getVoices();
            const hindiVoice = voices.find(v => v.lang.includes('hi-IN'));
            if (hindiVoice) {
                utterance.voice = hindiVoice;
            } else {
                utterance.lang = 'hi-IN';
            }
            window.speechSynthesis.speak(utterance);
        }

        function showToast(msg) {
            const toast = document.getElementById('notification-toast');
            if (toast) {
                toast.textContent = msg;
                toast.className = "fixed bottom-5 left-1/2 -translate-x-1/2 bg-stone-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xl z-[2000] show transition-all duration-300";
                setTimeout(() => {
                    toast.className = "hidden";
                }, 3000);
            }
        }

        let confettiParticles = [];
        let isConfettiActive = false;
        let confettiAnimationId = null;

        function triggerConfettiBurst() {
            const canvasEl = document.getElementById('confetti-canvas');
            if (!canvasEl) return;
            const ctxEl = canvasEl.getContext('2d');
            const rect = canvasEl.parentElement.getBoundingClientRect();
            canvasEl.width = rect.width;
            canvasEl.height = rect.height;

            confettiParticles = [];
            isConfettiActive = true;
            for (let i = 0; i < 65; i++) {
                confettiParticles.push({
                    x: Math.random() * canvasEl.width,
                    y: Math.random() * -canvasEl.height,
                    size: Math.random() * 5 + 3,
                    color: `hsl(${Math.random() * 360}, 90%, 65%)`,
                    speedX: Math.random() * 4 - 2,
                    speedY: Math.random() * 4 + 2,
                    rotation: Math.random() * 360,
                    rotationSpeed: Math.random() * 10 - 5
                });
            }

            function animateConfetti() {
                if (!isConfettiActive) {
                    ctxEl.clearRect(0, 0, canvasEl.width, canvasEl.height);
                    return;
                }
                ctxEl.clearRect(0, 0, canvasEl.width, canvasEl.height);
                confettiParticles.forEach(p => {
                    p.x += p.speedX;
                    p.y += p.speedY;
                    p.rotation += p.rotationSpeed;
                    if (p.y > canvasEl.height) {
                        p.y = -10;
                        p.x = Math.random() * canvasEl.width;
                    }
                    ctxEl.save();
                    ctxEl.translate(p.x, p.y);
                    ctxEl.rotate((p.rotation * Math.PI) / 180);
                    ctxEl.fillStyle = p.color;
                    ctxEl.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                    ctxEl.restore();
                });
                confettiAnimationId = requestAnimationFrame(animateConfetti);
            }
            animateConfetti();
            setTimeout(() => { stopConfettiCelebration(); }, 3500);
        }

        function stopConfettiCelebration() {
            isConfettiActive = false;
            if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
            const canvasEl = document.getElementById('confetti-canvas');
            if (canvasEl) {
                const ctxEl = canvasEl.getContext('2d');
                ctxEl.clearRect(0, 0, canvasEl.width, canvasEl.height);
            }
        }

        function switchMode(mode) {
            currentMode = mode;
            stopConfettiCelebration();

            const card = document.getElementById('main-tool-card');

            document.getElementById('tab-drill').className = `mode-tab text-center py-2 text-[10px] sm:text-xs font-extrabold rounded-lg transition-all ${mode === 'drill' ? 'active bg-red-800 text-white shadow' : 'text-stone-700 hover:text-stone-900 bg-transparent'} relative group`;
            document.getElementById('tab-worksheet').className = `mode-tab text-center py-2 text-[10px] sm:text-xs font-extrabold rounded-lg transition-all ${mode === 'worksheet' ? 'active bg-red-800 text-white shadow' : 'text-stone-700 hover:text-stone-900 bg-transparent'} relative group`;

            document.getElementById('tab-drill').setAttribute('aria-selected', mode === 'drill' ? 'true' : 'false');
            document.getElementById('tab-worksheet').setAttribute('aria-selected', mode === 'worksheet' ? 'true' : 'false');

            document.getElementById('drill-mode-panel').classList.toggle('hidden', mode !== 'drill');
            document.getElementById('worksheet-mode-panel').classList.toggle('hidden', mode !== 'worksheet');

            if (mode === 'worksheet') {
                if (card) {
                    card.classList.remove('max-w-3xl');
                    card.classList.add('max-w-[1080px]');
                }
                updateWorksheetPreview();
            } else {
                if (card) {
                    card.classList.remove('max-w-[1080px]');
                    card.classList.add('max-w-3xl');
                }
                resetTracerMode();
            }
        }

        function populateVarnamalaGrids() {
            const vowelsContainer = document.getElementById('vowels-grid');
            const consonantsContainer = document.getElementById('consonants-grid');
            const familiesContainer = document.getElementById('families-grid');

            if (!vowelsContainer || !consonantsContainer || !familiesContainer) return;

            vowelsContainer.innerHTML = '';
            consonantsContainer.innerHTML = '';
            familiesContainer.innerHTML = '';

            const vowels = ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ'];
            vowels.forEach(char => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'p-2 bg-white hover:bg-red-50 border border-stone-200 hover:border-red-600 rounded-lg text-xs font-black transition-all hover:scale-105 select-none hindi-font';
                btn.textContent = char;
                btn.addEventListener('click', () => selectLetterForOnScreenTracer(char));
                vowelsContainer.appendChild(btn);
            });

            const consonants = [
                'क', 'ख', 'ग', 'घ', 'च', 'छ', 'ज', 'झ', 'ट', 'ठ', 
                'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 
                'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह', 'क्ष', 'त्र', 'ज्ञ'
            ];
            consonants.forEach(char => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'p-2 bg-white hover:bg-red-50 border border-stone-200 hover:border-red-600 rounded-lg text-xs font-black transition-all hover:scale-105 select-none hindi-font';
                btn.textContent = char;
                btn.addEventListener('click', () => selectLetterForOnScreenTracer(char));
                consonantsContainer.appendChild(btn);
            });

            const families = ['क', 'का', 'कि', 'की', 'कु', 'कू'];
            families.forEach(char => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'p-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 hover:border-indigo-600 rounded-lg text-xs font-black transition-all hover:scale-105 select-none hindi-font text-indigo-950';
                btn.textContent = char;
                btn.addEventListener('click', () => selectLetterForOnScreenTracer(char));
                familiesContainer.appendChild(btn);
            });
        }

        function transliteratePhoneticEngToHindi(textVal) {
            let words = textVal.split(/(\s+)/);
            let result = [];

            // Contextual Indian Vocabulary dictionary to guarantee 100% accurate fallback matches
            const dictionary = {
                "aarav": "आरव",
                "amit": "अमित",
                "bharat": "भारत",
                "vikas": "विकास",
                "vikram": "विक्रम",
                "sharma": "शर्मा",
                "kumar": "कुमार",
                "singh": "सिंह",
                "namaste": "नमस्ते",
                "rahul": "राहुल",
                "rohit": "रोहित",
                "priya": "प्रिया",
                "neha": "नेहा",
                "pooja": "पूजा",
                "ajay": "अजय",
                "sanjay": "संजय",
                "vijay": "विजय",
                "anil": "अनिल",
                "sunil": "सुनील",
                "deepak": "दीपक",
                "raj": "राज",
                "verma": "वर्मा",
                "gupta": "गुप्ता",
                "devi": "देवी"
            };

            for (let word of words) {
                if (word.trim() === "") {
                    result.push(word);
                    continue;
                }

                let cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
                let punctuation = word.replace(/[a-zA-Z]/g, "");

                if (dictionary[cleanWord]) {
                    result.push(dictionary[cleanWord] + punctuation);
                    continue;
                }

                // Sophisticated Context-Aware Left-to-Right Syllabic Tokenizer
                let i = 0;
                let parsedWord = "";
                let lastCharWasConsonant = false;

                const vowels = [
                    { key: "ai", ind: "ऐ", matra: "ै" },
                    { key: "au", ind: "औ", matra: "ौ" },
                    { key: "ou", ind: "औ", matra: "ौ" },
                    { key: "aa", ind: "आ", matra: "ा" },
                    { key: "ee", ind: "ई", matra: "ी" },
                    { key: "oo", ind: "ऊ", matra: "ू" },
                    { key: "a", ind: "अ", matra: "" },
                    { key: "e", ind: "ए", matra: "े" },
                    { key: "i", ind: "इ", matra: "ि" },
                    { key: "o", ind: "ओ", matra: "ो" },
                    { key: "u", ind: "उ", matra: "ु" }
                ];

                const consonants = [
                    { key: "sn", val: "स्न" },
                    { key: "sh", val: "श" },
                    { key: "kh", val: "ख" },
                    { key: "gh", val: "घ" },
                    { key: "ch", val: "च" },
                    { key: "jh", val: "झ" },
                    { key: "th", val: "थ" },
                    { key: "dh", val: "ध" },
                    { key: "ph", val: "फ" },
                    { key: "bh", val: "भ" },
                    { key: "gy", val: "ज्ञ" },
                    { key: "tr", val: "त्र" },
                    { key: "ks", val: "क्ष" },
                    { key: "b", val: "ब" },
                    { key: "d", val: "द" },
                    { key: "f", val: "फ़" },
                    { key: "g", val: "ग" },
                    { key: "h", val: "ह" },
                    { key: "j", val: "ज" },
                    { key: "k", val: "क" },
                    { key: "l", val: "ल" },
                    { key: "m", val: "म" },
                    { key: "n", val: "न" },
                    { key: "p", val: "प" },
                    { key: "r", val: "र" },
                    { key: "s", val: "स" },
                    { key: "t", val: "त" },
                    { key: "v", val: "व" },
                    { key: "w", val: "व" },
                    { key: "y", val: "य" },
                    { key: "z", val: "ज़" }
                ];

                while (i < cleanWord.length) {
                    let matched = false;

                    // Evaluate Vowel Sequences
                    for (let v of vowels) {
                        if (cleanWord.startsWith(v.key, i)) {
                            if (lastCharWasConsonant) {
                                parsedWord += v.matra;
                            } else {
                                parsedWord += v.ind;
                            }
                            i += v.key.length;
                            lastCharWasConsonant = false;
                            matched = true;
                            break;
                        }
                    }
                    if (matched) continue;

                    // Evaluate Consonants
                    for (let c of consonants) {
                        if (cleanWord.startsWith(c.key, i)) {
                            parsedWord += c.val;
                            i += c.key.length;
                            lastCharWasConsonant = true;
                            matched = true;
                            break;
                        }
                    }
                    if (matched) continue;

                    parsedWord += cleanWord[i];
                    i++;
                    lastCharWasConsonant = false;
                }

                result.push(parsedWord + punctuation);
            }

            return result.join("");
        }

        function handleCustomTextInputChange() {
            const input = document.getElementById('ws-text-input');
            if (!input) return;

            // Commit customized string history
            let rawStr = input.value.trim();
            if (rawStr) {
                let history = StorageManager.get('akshartrace_word_history', ['आरव', 'भारत', 'विकास']);
                if (!history.includes(rawStr)) {
                    history.unshift(rawStr);
                    history = history.slice(0, 3); // Keeps last 3 items
                    StorageManager.set('akshartrace_word_history', history);
                    renderWordHistoryChips();
                }
            }

            updateWorksheetPreview();
        }

        function renderWordHistoryChips() {
            const container = document.getElementById('history-chips-container');
            if (!container) return;
            container.innerHTML = '';

            let history = StorageManager.get('akshartrace_word_history', ['आरव', 'भारत', 'विकास']);
            history.forEach(word => {
                const chip = document.createElement('button');
                chip.type = 'button';
                chip.className = "px-2 py-0.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded text-[10px] font-bold text-stone-700 hindi-font focus:outline-none transition-all";
                chip.textContent = word;
                chip.addEventListener('click', () => {
                    const input = document.getElementById('ws-text-input');
                    if (input) {
                        input.value = word;
                        input.dataset.rawEnglish = ""; // Reset custom phonetics to use tapped unicode
                        updateWorksheetPreview();
                    }
                });
                container.appendChild(chip);
            });
        }

        function populateVirtualKeyboardTray() {
            const pad = document.getElementById('devanagari-tap-keypad');
            if (!pad) return;
            pad.innerHTML = '';

            const hindiCharacters = [
                'अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ',
                'क', 'ख', 'ग', 'घ', 'च', 'छ', 'ज', 'झ', 'ट', 'ठ',
                'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब',
                'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह',
                'ा', 'ि', 'ी', 'ु', 'ू', 'े', 'ै', 'ो', 'ौ', 'ं'
            ];

            hindiCharacters.forEach(char => {
                const key = document.createElement('button');
                key.type = 'button';
                key.className = 'p-1.5 bg-white hover:bg-stone-200 border border-stone-200 rounded-lg text-[11px] font-black text-stone-900 text-center transition-all active:scale-95 hindi-font';
                key.textContent = char;
                key.addEventListener('click', () => {
                    const input = document.getElementById('ws-text-input');
                    if (input) {
                        const start = input.selectionStart;
                        const end = input.selectionEnd;
                        const oldVal = input.value;
                        input.value = oldVal.substring(0, start) + char + oldVal.substring(end);
                        input.selectionStart = input.selectionEnd = start + char.length;
                        input.focus();
                        handleCustomTextInputChange();
                    }
                });
                pad.appendChild(key);
            });
        }

        function calculateActiveLetterCheckpoints() {
            tracingCheckpoints = [];
            strokeCheckpoints = [];
            activeStrokeIndex = 0;

            const pathData = devanagariCoordinates[activeTracerLetter];
            if (!pathData) return;

            // Sequential Stroke Enforcer: Segment coordinates by sub-stroke "M" entries
            const strokesList = pathData.split(/(?=M)/i).filter(s => s.trim() !== "");
            totalActiveStrokes = strokesList.length;

            strokesList.forEach(strokeStr => {
                const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
                pathEl.setAttribute("d", strokeStr);
                const strokeLength = pathEl.getTotalLength();
                
                const segmentsCount = 12; 
                let strokeCps = [];
                for (let i = 0; i <= segmentsCount; i++) {
                    const pt = pathEl.getPointAtLength((i / segmentsCount) * strokeLength);
                    strokeCps.push({
                        x: pt.x,
                        y: pt.y,
                        visited: false
                    });
                }
                strokeCheckpoints.push(strokeCps);
            });

            // Set current checkpoints reference array directly to Stroke 0
            tracingCheckpoints = strokeCheckpoints[0] || [];
            visitedCheckpointsCount = 0;
            assistTargetIndex = 0;
            updateAccuracyStatusLabel();
        }

        function triggerCheckpointValidation(canvasX, canvasY) {
            const svgX = (canvasX / canvas.width) * 200;
            const svgY = (canvasY / canvas.height) * 200;

            let boundsRadius = 22; 
            if (activeDifficultyLevel === 'intermediate') {
                boundsRadius = 14;
            } else if (activeDifficultyLevel === 'advanced') {
                boundsRadius = 16;
            }

            let checkOccurred = false;
            tracingCheckpoints.forEach(cp => {
                if (!cp.visited) {
                    const dx = cp.x - svgX;
                    const dy = cp.y - svgY;
                    const distance = Math.sqrt(dx*dx + dy*dy);
                    if (distance < boundsRadius) {
                        cp.visited = true;
                        visitedCheckpointsCount++;
                        checkOccurred = true;
                    }
                }
            });

            if (checkOccurred) {
                updateAccuracyStatusLabel();
                evaluateStrokeSequenceProgression();
            }
        }

        // Sequential Stroke Enforcer Step Evaluation
        function evaluateStrokeSequenceProgression() {
            const currentRatio = visitedCheckpointsCount / tracingCheckpoints.length;
            if (currentRatio >= 0.75) {
                if (activeStrokeIndex < totalActiveStrokes - 1) {
                    activeStrokeIndex++;
                    tracingCheckpoints = strokeCheckpoints[activeStrokeIndex];
                    visitedCheckpointsCount = 0;
                    assistTargetIndex = 0;
                    showToast(`Stroke ${activeStrokeIndex} completed! Keep going!`);
                    speakHindiPhonics("बहुत अच्छे");
                    drawGuidesOverlay();
                }
            }
        }

        function getPenColor() {
            if (activeTheme === 'chalk') {
                return activeChalkColor;
            } else {
                // Adapt neon chalk shades onto high-contrast pencil desk inkwells
                if (activeChalkColor.includes('253, 224, 71')) return '#b45309'; // Ochre Gold
                if (activeChalkColor.includes('134, 239, 172')) return '#047857'; // Forest Green
                if (activeChalkColor.includes('244, 114, 182')) return '#be185d'; // Crimson Rose
                return '#1e293b'; // Slate Charcoal Ink
            }
        }

        function updateAccuracyStatusLabel() {
            const calculatedTotalPoints = strokeCheckpoints.reduce((sum, current) => sum + current.length, 0);
            const calculatedVisitedPoints = strokeCheckpoints.reduce((sum, current, sIdx) => {
                if (sIdx < activeStrokeIndex) return sum + current.length;
                if (sIdx === activeStrokeIndex) return sum + visitedCheckpointsCount;
                return sum;
            }, 0);

            const pct = Math.min(100, Math.round((calculatedVisitedPoints / calculatedTotalPoints) * 100));
            const counter = document.getElementById('realtime-accuracy-counter');
            const cue = document.getElementById('realtime-status-message-cue');
            if (counter) {
                counter.textContent = `${pct}% Checked`;
            }
            if (cue) {
                if (pct > 80) {
                    cue.textContent = "Almost done! Trace the Shirorekha baseline to finish.";
                    cue.className = "text-emerald-500 font-extrabold block leading-tight text-xs";
                } else if (pct > 40) {
                    cue.textContent = "Writing nicely. Drag smoothly along guided strokes.";
                    cue.className = "text-amber-500 font-extrabold block leading-tight text-xs";
                } else {
                    if (isShiftModeActive()) {
                        cue.textContent = "Assistive Mode active. Tap sequential coordinates or use Arrow Keys.";
                    } else {
                        if (activeDifficultyLevel === 'advanced') {
                            cue.textContent = "Advanced Mode: Rule guidelines only! Trace the letter from memory.";
                        } else {
                            cue.textContent = `Trace Stroke ${activeStrokeIndex + 1} of ${totalActiveStrokes}.`;
                        }
                    }
                    cue.className = "text-amber-500 font-extrabold block leading-tight text-xs";
                }
            }
        }

        function isShiftModeActive() {
            return isAssistMode;
        }

        function runGuideStrokeAnimation() {
            const hand = document.getElementById('hand-guide-pointer');
            const pathData = devanagariCoordinates[activeTracerLetter];
            if (!hand || !pathData || activeDifficultyLevel === 'advanced' || isDemonstrating) {
                if (hand) hand.classList.add('hidden');
                return;
            }

            // Guide animated cursor strictly along the currently active stroke path
            const strokesList = pathData.split(/(?=M)/i).filter(s => s.trim() !== "");
            const currentStrokeStr = strokesList[activeStrokeIndex] || strokesList[0];

            const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
            pathEl.setAttribute("d", currentStrokeStr);
            const pathLength = pathEl.getTotalLength();

            hand.classList.remove('hidden');
            let progress = 0;
             
            function animateStep() {
                if (progress > pathLength || activeStrokeIndex === totalActiveStrokes || isDemonstrating) {
                    hand.classList.add('hidden');
                    return;
                }
                const pt = pathEl.getPointAtLength(progress);
                hand.style.left = `calc(${ (pt.x / 200) * 100 }% - 16px)`;
                hand.style.top = `calc(${ (pt.y / 200) * 100 }% - 16px)`;
                progress += 2.5;
                requestAnimationFrame(animateStep);
            }
            animateStep();
        }

        // Animated Ghost-Demonstration Routine
        function runDemonstrateStrokeFlow() {
            if (isDemonstrating) return;
            isDemonstrating = true;
            clearTracerCanvas();
            showToast("Watch the stroke trace demonstration...");

            const pathData = devanagariCoordinates[activeTracerLetter];
            if (!pathData) return;

            const strokesList = pathData.split(/(?=M)/i).filter(s => s.trim() !== "");
            let sIdx = 0;

            function demoNextStroke() {
                if (sIdx >= strokesList.length || !isDemonstrating) {
                    isDemonstrating = false;
                    clearTracerCanvas();
                    showToast("Demonstration complete! Now try drawing yourself!");
                    return;
                }

                const strokeStr = strokesList[sIdx];
                const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                tempPath.setAttribute("d", strokeStr);
                const length = tempPath.getTotalLength();
                let progress = 0;

                ctx.beginPath();
                ctx.strokeStyle = activeTheme === 'chalk' ? 'rgba(253, 224, 71, 0.95)' : '#be185d';
                ctx.lineWidth = 14;

                const pStart = tempPath.getPointAtLength(0);
                const startX = (pStart.x / 200) * canvas.width;
                const startY = (pStart.y / 200) * canvas.height;
                ctx.moveTo(startX, startY);

                function step() {
                    if (progress > length || !isDemonstrating) {
                        sIdx++;
                        setTimeout(demoNextStroke, 300);
                        return;
                    }
                    const pt = tempPath.getPointAtLength(progress);
                    const cX = (pt.x / 200) * canvas.width;
                    const cY = (pt.y / 200) * canvas.height;
                    ctx.lineTo(cX, cY);
                    ctx.stroke();
                    progress += 4.5;
                    requestAnimationFrame(step);
                }
                step();
            }
            demoNextStroke();
        }

        function selectLetterForOnScreenTracer(char) {
            activeTracerLetter = char;
            isDemonstrating = false;
            stopConfettiCelebration();

            document.getElementById('drill-setup-screen').classList.add('hidden');
            document.getElementById('drill-active-screen').classList.remove('hidden');

            document.getElementById('current-tracer-letter-label').textContent = `Practice: '${char}'`;
            document.getElementById('tracer-bg-guide').textContent = char;

            setTimeout(() => {
                initTracerCanvasBoard();
                drawGuidesOverlay();
            }, 100);

            const guideSpeech = phonicsDictionary[char] || `${char}`;
            speakHindiPhonics(guideSpeech);
        }

        function resetTracerMode() {
            isDemonstrating = false;
            stopConfettiCelebration();
            document.getElementById('drill-active-screen').classList.add('hidden');
            document.getElementById('drill-setup-screen').classList.remove('hidden');
        }

        function initTracerCanvasBoard() {
            canvas = document.getElementById('tracer-interactive-canvas');
            if (!canvas) return;

            const newCanvas = canvas.cloneNode(true);
            canvas.parentNode.replaceChild(newCanvas, canvas);
            canvas = newCanvas;

            ctx = canvas.getContext('2d');

            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;

            ctx.strokeStyle = getPenColor();
            ctx.lineWidth = 14;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.shadowColor = activeTheme === 'chalk' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.15)';
            ctx.shadowBlur = 8;

            canvas.addEventListener('mousedown', startTracerDraw);
            canvas.addEventListener('mousemove', traceDrawPath);
            canvas.addEventListener('mouseup', stopTracerDraw);
            canvas.addEventListener('mouseleave', stopTracerDraw);

            canvas.addEventListener('touchstart', startTracerDrawTouch, { passive: false });
            canvas.addEventListener('touchmove', traceDrawPathTouch, { passive: false });
            canvas.addEventListener('touchend', stopTracerDraw);

            calculateActiveLetterCheckpoints();
        }

        function startTracerDraw(e) {
            isTracingDrawing = true;
            isDemonstrating = false;
            ctx.beginPath();
            ctx.strokeStyle = getPenColor();
            const rect = canvas.getBoundingClientRect();
            const drawX = (e.clientX - rect.left) * (canvas.width / rect.width);
            const drawY = (e.clientY - rect.top) * (canvas.height / rect.height);
            ctx.moveTo(drawX, drawY);
            triggerCheckpointValidation(drawX, drawY);
            playSlateChalkSound();
        }

        function traceDrawPath(e) {
            if (!isTracingDrawing) return;
            const rect = canvas.getBoundingClientRect();
            const drawX = (e.clientX - rect.left) * (canvas.width / rect.width);
            const drawY = (e.clientY - rect.top) * (canvas.height / rect.height);
            ctx.lineTo(drawX, drawY);
            ctx.stroke();
            triggerCheckpointValidation(drawX, drawY);
        }

        function startTracerDrawTouch(e) {
            isTracingDrawing = true;
            isDemonstrating = false;
            ctx.beginPath();
            ctx.strokeStyle = getPenColor();
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const drawX = (touch.clientX - rect.left) * (canvas.width / rect.width);
            const drawY = (touch.clientY - rect.top) * (canvas.height / rect.height);
            ctx.moveTo(drawX, drawY);
            triggerCheckpointValidation(drawX, drawY);
            playSlateChalkSound();
            e.preventDefault();
        }

        function traceDrawPathTouch(e) {
            if (!isTracingDrawing) return;
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const drawX = (touch.clientX - rect.left) * (canvas.width / rect.width);
            const drawY = (touch.clientY - rect.top) * (canvas.height / rect.height);
            ctx.lineTo(drawX, drawY);
            ctx.stroke();
            triggerCheckpointValidation(drawX, drawY);
            e.preventDefault();
        }

        function stopTracerDraw() {
            isTracingDrawing = false;
            stopSlateChalkSound();
        }

        function clearTracerCanvas() {
            isDemonstrating = false;
            stopConfettiCelebration();
            if (ctx && canvas) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            calculateActiveLetterCheckpoints();
        }

        function validateTracedLetter() {
            isDemonstrating = false;
            const calculatedTotalPoints = strokeCheckpoints.reduce((sum, current) => sum + current.length, 0);
            const calculatedVisitedPoints = strokeCheckpoints.reduce((sum, current, sIdx) => {
                if (sIdx < activeStrokeIndex) return sum + current.length;
                if (sIdx === activeStrokeIndex) return sum + visitedCheckpointsCount;
                return sum;
            }, 0);

            const pct = Math.min(100, Math.round((calculatedVisitedPoints / calculatedTotalPoints) * 100));
             
            if (pct < 55) {
                speakHindiPhonics("Try drawing inside the guide dots!");
                showToast("Trace closer to the guidelines.");
                flagDifficultLetter(activeTracerLetter);
                return;
            }

            playVictorySound();
            triggerConfettiBurst();

            userRewardsPoints += 10;
            StorageManager.set('akshartrace_rewards_points', userRewardsPoints);
            refreshStickerShelfDisplay();
            showRewardNotification();

            addActivityLog({
                type: 'trace',
                char: activeTracerLetter,
                accuracy: pct,
                points: 10
            });

            const ph = phonicsDictionary[activeTracerLetter] || `${activeTracerLetter}`;
            speakHindiPhonics(`${ph}. Great tracing practice!`);

            showToast(`Accuracy: ${pct}%! Awarded +10 Points! Check your Rewards Shelf!`);
             
            let streak = parseInt(StorageManager.get('akshartrace_streak_val', 0)) || 0;
            streak++;
            StorageManager.set('akshartrace_streak_val', streak);
            document.getElementById('drill-streak-count').textContent = streak;
        }

        function setTracerTheme(theme) {
            activeTheme = theme;
            const wrap = document.getElementById('chalkboard-wrap-box');
            const guide = document.getElementById('tracer-bg-guide');
            const btnChalk = document.getElementById('btn-theme-chalk');
            const btnPencil = document.getElementById('btn-theme-pencil');

            if (!wrap || !guide || !btnChalk || !btnPencil) return;

            if (theme === 'chalk') {
                wrap.className = "relative w-full max-w-sm aspect-square rounded-2xl p-1 bg-stone-950 border-4 border-stone-700 overflow-hidden flex items-center justify-center shadow-inner theme-slate";
                btnChalk.className = "px-2.5 py-1 rounded bg-stone-900 text-white shadow";
                btnPencil.className = "px-2.5 py-1 rounded text-stone-400 ml-0.5";
            } else {
                wrap.className = "relative w-full max-w-sm aspect-square rounded-2xl p-1 bg-white border-4 border-stone-300 overflow-hidden flex items-center justify-center shadow-inner theme-hindi-five-line";
                btnPencil.className = "px-2.5 py-1 rounded bg-stone-900 text-white shadow";
                btnChalk.className = "px-2.5 py-1 rounded text-stone-400 ml-0.5";
            }

            initTracerCanvasBoard();
            drawGuidesOverlay();
        }

        function selectDifficultyLevel(level) {
            activeDifficultyLevel = level;
            const levels = ['beginner', 'intermediate', 'advanced'];
            levels.forEach(lvl => {
                const btn = document.getElementById(`btn-diff-${lvl}`);
                if (btn) {
                    if (lvl === level) {
                        btn.className = "px-3 py-1 rounded bg-indigo-700 text-white text-[10px] transition-all";
                    } else {
                        btn.className = "px-3 py-1 rounded text-stone-400 text-[10px] ml-0.5 transition-all";
                    }
                }
            });
            clearTracerCanvas();
            drawGuidesOverlay();
        }

        function drawGuidesOverlay() {
            const overlay = document.getElementById('tracer-guides-overlay');
            if (!overlay) return;
            overlay.innerHTML = '';

            const pathData = devanagariCoordinates[activeTracerLetter];
            if (!pathData) return;

            const bgText = document.getElementById('tracer-bg-guide');
            if (bgText) {
                if (activeDifficultyLevel === 'beginner') {
                    bgText.textContent = activeTracerLetter;
                    bgText.style.display = 'block';
                } else {
                    bgText.style.display = 'none';
                }
            }

            // Draw only the currently active stroke path beautifully in the guides overlay
            const strokesList = pathData.split(/(?=M)/i).filter(s => s.trim() !== "");
            const currentStrokeStr = strokesList[activeStrokeIndex] || strokesList[0];

            const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
            pathEl.setAttribute("d", currentStrokeStr);
            const pathLength = pathEl.getTotalLength();

            if (activeDifficultyLevel !== 'advanced') {
                const svgVisual = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svgVisual.setAttribute("viewBox", "0 0 200 200");
                svgVisual.setAttribute("class", "absolute inset-0 w-full h-full pointer-events-none z-10");
                
                const solidPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                solidPath.setAttribute("d", currentStrokeStr);
                solidPath.setAttribute("fill", "none");
                
                let trackStrokeColor = activeTheme === 'chalk' ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";
                if (activeDifficultyLevel === 'intermediate') {
                    trackStrokeColor = activeTheme === 'chalk' ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)";
                }
                solidPath.setAttribute("stroke", trackStrokeColor);
                solidPath.setAttribute("stroke-width", activeDifficultyLevel === 'beginner' ? "26" : "14");
                solidPath.setAttribute("stroke-linecap", "round");
                solidPath.setAttribute("stroke-linejoin", "round");
                svgVisual.appendChild(solidPath);

                const dashedPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                dashedPath.setAttribute("d", currentStrokeStr);
                dashedPath.setAttribute("fill", "none");
                
                let dashedStrokeColor = activeTheme === 'chalk' ? "rgba(255,255,255,0.6)" : "rgba(15,23,42,0.5)";
                if (activeDifficultyLevel === 'intermediate') {
                    dashedStrokeColor = activeTheme === 'chalk' ? "rgba(255,255,255,0.25)" : "rgba(15,23,42,0.15)";
                }
                dashedPath.setAttribute("stroke", dashedStrokeColor);
                dashedPath.setAttribute("stroke-width", activeDifficultyLevel === 'beginner' ? "4" : "2");
                dashedPath.setAttribute("stroke-linecap", "round");
                dashedPath.setAttribute("stroke-linejoin", "round");
                dashedPath.setAttribute("stroke-dasharray", activeDifficultyLevel === 'beginner' ? "6, 10" : "4, 12");
                svgVisual.appendChild(dashedPath);

                overlay.appendChild(svgVisual);
            }

            if (activeDifficultyLevel !== 'advanced' || isAssistMode) {
                const checkpoints = [0.05, 0.5, 0.95];
                checkpoints.forEach((fraction, index) => {
                    const pt = pathEl.getPointAtLength(fraction * pathLength);
                    
                    if (isAssistMode) {
                        const indicator = document.createElement('button');
                        indicator.type = 'button';
                        indicator.className = `absolute w-8 h-8 rounded-full text-white font-black text-xs flex items-center justify-center shadow-lg transition-transform focus:ring-2 focus:ring-red-400 z-30 transform -translate-x-1/2 -translate-y-1/2 ${
                            index === assistTargetIndex ? 'bg-red-600 scale-125 animate-pulse' : 'bg-stone-700 opacity-60'
                        }`;
                        indicator.style.left = `${(pt.x / 200) * 100}%`;
                        indicator.style.top = `${(pt.y / 200) * 100}%`;
                        indicator.textContent = index + 1;
                        indicator.setAttribute('aria-label', `Syllable stroke checkpoint ${index + 1}`);
                        
                        indicator.addEventListener('click', () => {
                            if (index === assistTargetIndex) {
                                executeAssistiveConnect(pt.x, pt.y);
                            }
                        });

                        overlay.appendChild(indicator);
                    } else {
                        const indicator = document.createElement('div');
                        
                        if (activeDifficultyLevel === 'intermediate') {
                            indicator.className = "absolute w-4 h-4 rounded-full text-white font-black text-[8px] flex items-center justify-center shadow-md transform -translate-x-1/2 -translate-y-1/2 z-20 opacity-40 bg-emerald-500";
                        } else {
                            indicator.className = "absolute w-6 h-6 rounded-full text-white font-black text-[11px] flex items-center justify-center shadow-lg guide-dot-pulse transform -translate-x-1/2 -translate-y-1/2 z-20 bg-emerald-500";
                        }
                        
                        if (index === 1) indicator.className = indicator.className.replace('bg-emerald-500', 'bg-amber-500');
                        if (index === 2) indicator.className = indicator.className.replace('bg-emerald-500', 'bg-red-500');
                         
                        indicator.style.left = `${(pt.x / 200) * 100}%`;
                        indicator.style.top = `${(pt.y / 200) * 100}%`;
                        indicator.textContent = index + 1;
                        overlay.appendChild(indicator);
                    }
                });
            }

            runGuideStrokeAnimation();
        }

        function executeAssistiveConnect(targetX, targetY) {
            if (!ctx || !canvas) return;

            const cX = (targetX / 200) * canvas.width;
            const cY = (targetY / 200) * canvas.height;

            ctx.beginPath();
            ctx.strokeStyle = getPenColor();
            ctx.moveTo(virtualCursorX, virtualCursorY);
            ctx.lineTo(cX, cY);
            ctx.stroke();

            let steps = 15;
            for (let i = 0; i <= steps; i++) {
                let checkX = virtualCursorX + ((cX - virtualCursorX) * (i / steps));
                let checkY = virtualCursorY + ((cY - virtualCursorY) * (i / steps));
                triggerCheckpointValidation(checkX, checkY);
            }

            virtualCursorX = cX;
            virtualCursorY = cY;

            playSlateChalkSound();
            setTimeout(stopSlateChalkSound, 250);

            assistTargetIndex++;
            if (assistTargetIndex > 2) {
                assistTargetIndex = 0;
            }

            drawGuidesOverlay();
        }

        function handleKeyboardTracing(e) {
            if (!isAssistMode || !canvas || !ctx) return;

            let stepSize = 10;
            let prevX = virtualCursorX;
            let prevY = virtualCursorY;

            if (e.key === 'ArrowUp') {
                virtualCursorY = Math.max(0, virtualCursorY - stepSize);
                e.preventDefault();
            } else if (e.key === 'ArrowDown') {
                virtualCursorY = Math.min(canvas.height, virtualCursorY + stepSize);
                e.preventDefault();
            } else if (e.key === 'ArrowLeft') {
                virtualCursorX = Math.max(0, virtualCursorX - stepSize);
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                virtualCursorX = Math.min(canvas.width, virtualCursorX + stepSize);
                e.preventDefault();
            } else {
                return; 
            }

            ctx.beginPath();
            ctx.strokeStyle = getPenColor();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(virtualCursorX, virtualCursorY);
            ctx.stroke();

            triggerCheckpointValidation(virtualCursorX, virtualCursorY);

            playSlateChalkSound();
            setTimeout(stopSlateChalkSound, 80);
        }

        function toggleAssistiveMode() {
            isAssistMode = !isAssistMode;
            const btn = document.getElementById('btn-toggle-assist');
            const hud = document.getElementById('assist-keys-hud');
            
            if (isAssistMode) {
                btn.textContent = "♿ Assist Mode: ON";
                btn.className = "bg-red-700 hover:bg-red-600 text-white font-extrabold px-3 py-1 rounded-lg uppercase transition-all focus:ring-1 focus:ring-red-400";
                hud.classList.remove('hidden');
                showToast("Keyboard and Click Assistive mode active.");
            } else {
                btn.textContent = "♿ Assist Mode: OFF";
                btn.className = "bg-stone-700 hover:bg-stone-600 text-stone-100 font-extrabold px-3 py-1 rounded-lg uppercase transition-all focus:ring-1 focus:ring-red-400";
                hud.classList.add('hidden');
            }

            clearTracerCanvas();
        }

        function launchRandomChallenge() {
            const list = Object.keys(devanagariCoordinates);
            const char = list[Math.floor(Math.random() * list.length)];
            selectLetterForOnScreenTracer(char);
            showToast(`Challenge: Trace Devanagari character '${char}'!`);
        }

        function showRewardNotification() {
            const dot = document.getElementById('reward-notif-dot');
            if (dot) dot.classList.remove('hidden');
        }

        function clearRewardNotification() {
            const dot = document.getElementById('reward-notif-dot');
            if (dot) dot.classList.add('hidden');
        }

        function toggleRewardsModal() {
            const modal = document.getElementById('sticker-book-modal');
            if (modal) {
                const isHidden = modal.classList.toggle('hidden');
                if (!isHidden) {
                    clearRewardNotification(); 
                    refreshStickerShelfDisplay();
                    document.body.style.overflow = 'hidden';
                    document.documentElement.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                    document.documentElement.style.overflow = '';
                }
            }
        }

        function closeStickerBookOnClickOutside(event) {
            const modal = document.getElementById('sticker-book-modal');
            const modalContent = document.getElementById('sticker-book-modal-content');
            if (modal && modalContent && !modalContent.contains(event.target)) {
                toggleRewardsModal();
            }
        }

        function toggleMilestonesModal() {
            const modal = document.getElementById('milestones-modal');
            if (modal) {
                const isHidden = modal.classList.toggle('hidden');
                if (!isHidden) {
                    document.body.style.overflow = 'hidden';
                    document.documentElement.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                    document.documentElement.style.overflow = '';
                }
            }
        }

        function closeMilestonesOnClickOutside(event) {
            const modal = document.getElementById('milestones-modal');
            const modalContent = document.getElementById('milestones-modal-content');
            if (modal && modalContent && !modalContent.contains(event.target)) {
                toggleMilestonesModal();
            }
        }

        function toggleMilestoneCheck(id) {
            const chk1 = document.getElementById('chk-milestone-1')?.checked;
            const chk2 = document.getElementById('chk-milestone-2')?.checked;
            const chk3 = document.getElementById('chk-milestone-3')?.checked;
            const msg = document.getElementById('milestone-status-message');

            let count = 0;
            if (chk1) count++;
            if (chk2) count++;
            if (chk3) count++;

            if (id) {
                StorageManager.set(`akshartrace_milestone_${id}`, document.getElementById(`chk-milestone-${id}`).checked ? 'true' : 'false');
            }

            if (count === 3) {
                msg.textContent = "🏆 All milestones completed successfully!";
                triggerConfettiBurst();
                userRewardsPoints += 30;
                StorageManager.set('akshartrace_rewards_points', userRewardsPoints);
                showRewardNotification();
                showToast("Streak bonus unlocked!");
            } else if (count > 0) {
                msg.textContent = `Progress: ${count} of 3 milestones checked.`;
            } else {
                msg.textContent = "";
            }
        }

        function loadMilestoneStates() {
            for (let i = 1; i <= 3; i++) {
                const checked = StorageManager.get(`akshartrace_milestone_${i}`, false) === true || StorageManager.get(`akshartrace_milestone_${i}`, false) === 'true';
                const chk = document.getElementById(`chk-milestone-${i}`);
                if (chk) {
                    chk.checked = checked;
                }
            }
            toggleMilestoneCheck(); 
        }

        function refreshStickerShelfDisplay() {
            const shelf = document.getElementById('reward-sticker-shelf');
            const pointsLabel = document.getElementById('reward-total-points');
            if (!shelf) return;

            shelf.innerHTML = '';
            if (pointsLabel) pointsLabel.textContent = `${userRewardsPoints} Pts`;

            badgeCollection.forEach(badge => {
                let unlocked = userRewardsPoints >= badge.points;

                const block = document.createElement('div');
                block.className = `p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                    unlocked ? 'bg-amber-100 border-amber-300 scale-100' : 'bg-stone-100 border-stone-200 opacity-40 grayscale scale-95'
                }`;
                block.style.minWidth = "80px";
                 
                block.innerHTML = `
                    <span class="text-3xl">${badge.icon}</span>
                    <span class="text-[10px] font-black leading-tight text-stone-700 mt-1 truncate block w-full text-center">${badge.label}</span>
                `;
                shelf.appendChild(block);
            });
        }

        function handleWorksheetStyleSelect() {
            const style = document.getElementById('ws-style-select').value;
            const label = document.getElementById('ws-input-label-text');
            const input = document.getElementById('ws-text-input');

            if (!label || !input) return;

            if (style === 'custom_name') {
                label.textContent = "Worksheet Word Repeating Grid";
                input.value = "आरव";
                input.closest('.space-y-1.5').classList.remove('hidden');
            } else if (style === 'custom_sentence') {
                label.textContent = "Custom Sentence Input Box";
                input.value = "भारत मेरा देश है";
                input.closest('.space-y-1.5').classList.remove('hidden');
            } else {
                input.closest('.space-y-1.5').classList.add('hidden');
            }

            updateWorksheetPreview();
        }

        function printMasterAchievementCertificate() {
            const printBox = document.getElementById('print-sheet');
            if (!printBox) return;

            const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
            
            printBox.innerHTML = `
                <div class="border-[16px] border-amber-600 p-8 text-center bg-white min-h-[90vh] flex flex-col justify-between" style="font-family: 'Inter', sans-serif;">
                    <div class="space-y-3">
                        <span class="text-6xl">🏆</span>
                        <h1 class="text-3xl font-black uppercase text-amber-800 tracking-wider font-sans">DIPLOMA OF EXCELLENCE</h1>
                        <p class="text-xs uppercase text-stone-500 tracking-widest font-sans font-extrabold">Devanagari Master Writing Milestone</p>
                    </div>

                    <div class="space-y-4 my-8">
                        <p class="text-xs italic text-stone-600 font-semibold font-sans">This highly commemorative credential certifies that</p>
                        <h2 class="text-3xl font-black text-stone-900 border-b-2 border-stone-300 pb-2 w-4/5 mx-auto hindi-font" style="font-family: 'Noto Sans Devanagari', sans-serif;">आरव</h2>
                        <p class="text-xs leading-relaxed text-stone-700 w-3/4 mx-auto font-medium font-sans">
                            has completed physical writing benchmarks and interactive tactile tracing matrices under 
                            the five-line ruled Devanagari layout guidelines with consistent accuracy.
                        </p>
                    </div>

                    <div class="grid grid-cols-2 gap-8 w-4/5 mx-auto text-xs font-bold text-stone-600 pt-6 border-t font-sans">
                        <div>
                            <p>DATE OF ISSUANCE</p>
                            <p class="text-stone-900 font-black mt-1">${dateStr}</p>
                        </div>
                        <div>
                            <p>EVALUATION MASTER</p>
                            <p class="text-amber-800 font-black mt-1 text-sm">🕉️ AksharTrace Suite</p>
                        </div>
                    </div>
                </div>
            `;
            window.print();
        }

        function printTargetedRedemptionWorksheet() {
            const printBox = document.getElementById('print-sheet');
            if (!printBox) return;

            const diffList = getDifficultLetters();
            if (diffList.length === 0) return;

            let rowsHtml = '';
            diffList.forEach((char, idx) => {
                rowsHtml += generateHindiSVGRow((char + "  ").repeat(5).trim(), 'dotted', idx + 1, 120, 72, true);
            });

            printBox.innerHTML = `
                <div class="text-center pb-4 mb-4 border-b-2 border-stone-850">
                    <h1 class="text-base sm:text-lg font-bold uppercase tracking-wider">TARGETED REDEMPTION WORKSHEET</h1>
                    <p class="text-[10px] text-stone-600 font-semibold mt-1 font-sans">Focused Practice Worksheet</p>
                </div>
                <div class="grid grid-cols-2 gap-4 text-xs font-bold mb-6 border-b pb-3">
                    <div>STUDENT NAME: ___________________________</div>
                    <div class="text-right">DATE: _______________________</div>
                </div>
                <div class="space-y-4">${rowsHtml}</div>
            `;

            window.print();
        }

        function updateWorksheetPreview() {
            const style = document.getElementById('ws-style-select').value;
            const textRaw = document.getElementById('ws-text-input').value || "आरव";
            const rowsCount = parseInt(document.getElementById('ws-rows-select').value) || 7; 
            const previewBox = document.getElementById('screen-worksheet-preview');
            const printBox = document.getElementById('print-sheet');

            if (!previewBox || !printBox) return;

            let rowsHtml = '';
            let printRowsHtml = '';

            const rowHeight = 120;
            const textY = 80; 

            if (style === 'custom_name') {
                for (let i = 0; i < rowsCount; i++) {
                    const traceStyle = (i === 0) ? 'bold' : 'dotted'; 
                    rowsHtml += generateHindiSVGRow(textRaw, traceStyle, i + 1, rowHeight, textY);
                    printRowsHtml += generateHindiSVGRow(textRaw, traceStyle, i + 1, rowHeight, textY, true);
                }
            } else if (style === 'preset_vowels') {
                const vowels = ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ'];
                vowels.forEach((v, i) => {
                    if (i < rowsCount) {
                        rowsHtml += generateHindiSVGRow((v + "  ").repeat(5).trim(), 'dotted', i + 1, rowHeight, textY);
                        printRowsHtml += generateHindiSVGRow((v + "  ").repeat(5).trim(), 'dotted', i + 1, rowHeight, textY, true);
                    }
                });
            } else if (style === 'preset_consonants') {
                const consonants = ['क', 'ख', 'ग', 'घ', 'च', 'छ', 'ज', 'झ'];
                consonants.forEach((c, i) => {
                    if (i < rowsCount) {
                        rowsHtml += generateHindiSVGRow((c + "  ").repeat(5).trim(), 'dotted', i + 1, rowHeight, textY);
                        printRowsHtml += generateHindiSVGRow((c + "  ").repeat(5).trim(), 'dotted', i + 1, rowHeight, textY, true);
                    }
                });
            } else if (style === 'custom_sentence') {
                for (let i = 0; i < rowsCount; i++) {
                    const traceStyle = (i === 0) ? 'bold' : 'dotted';
                    rowsHtml += generateHindiSVGRow(textRaw, traceStyle, i + 1, rowHeight, textY);
                    printRowsHtml += generateHindiSVGRow(textRaw, traceStyle, i + 1, rowHeight, textY, true);
                }
            } else { 
                for (let k = 0; k < rowsCount; k++) {
                    rowsHtml += generateHindiSVGRow('', 'empty', k + 1, rowHeight, textY);
                    printRowsHtml += generateHindiSVGRow('', 'empty', k + 1, rowHeight, textY, true);
                }
            }

            const docHeader = `
                <div class="text-center pb-4 mb-4 border-b-2 border-stone-850">
                    <h1 class="text-sm font-bold uppercase tracking-wider">${document.getElementById('ws-school-input').value}</h1>
                    <p class="text-[10px] font-black uppercase text-stone-600 tracking-widest mt-0.5 font-sans">Devanagari Handwriting Practice Book</p>
                </div>
                <div class="grid grid-cols-2 gap-4 text-[10px] font-bold mb-4 pb-2 border-b">
                    <div>STUDENT NAME: ___________________________</div>
                    <div class="text-right">DATE: _______________________</div>
                </div>
            `;

            previewBox.innerHTML = docHeader + `<div class="space-y-3">${rowsHtml}</div>`;
            printBox.innerHTML = docHeader + `<div class="space-y-4">${printRowsHtml}</div>`;
        }

        // HIGH PERFORMANCE INK-SAFE DIRECT RENDERING TRICK FOR AUTHENTIC 5-LINE WRITING
        function generateHindiSVGRow(text, traceStyle, rowIdx, height, textY, isForPrint = false) {
            // Precise vertical grid alignments mapping standard 5-line rulings symmetrical to 20px spacing
            const yLine1 = 20; // Topmost Red Limit modifier
            const yLine2 = 40; // Shirorekha Anchor Line (Blue)
            const yLine3 = 60; // Central guideline loop division (Blue)
            const yLine4 = 80; // Baseline Vertical Stem anchor limit (Blue)
            const yLine5 = 100; // Bottommost Red Limit modifier

            // Micro-SaaS double-sided page spacing offsets
            const isDoubleSidedChecked = document.getElementById('chk-double-sided')?.checked || false;
            let textOffsetMarginX = 40;
            let lineStartBoundaryX = 10;
            let lineEndBoundaryX = 790;

            if (isDoubleSidedChecked) {
                if (rowIdx % 2 === 0) {
                    textOffsetMarginX = 65;
                    lineStartBoundaryX = 35;
                    lineEndBoundaryX = 790;
                } else {
                    textOffsetMarginX = 15;
                    lineStartBoundaryX = 10;
                    lineEndBoundaryX = 765;
                }
            }

            // Standard school-grade 5-line ruling guidelines
            let linesHtml = `
                <line x1="${lineStartBoundaryX}" y1="${yLine1}" x2="${lineEndBoundaryX}" y2="${yLine1}" class="print-line-outer" />
                <line x1="${lineStartBoundaryX}" y1="${yLine2}" x2="${lineEndBoundaryX}" y2="${yLine2}" class="print-line-shirorekha" />
                <line x1="${lineStartBoundaryX}" y1="${yLine3}" x2="${lineEndBoundaryX}" y2="${yLine3}" class="print-line-body" />
                <line x1="${lineStartBoundaryX}" y1="${yLine4}" x2="${lineEndBoundaryX}" y2="${yLine4}" class="print-line-body" />
                <line x1="${lineStartBoundaryX}" y1="${yLine5}" x2="${lineEndBoundaryX}" y2="${yLine5}" class="print-line-outer" />
            `;

            let lettersPathsHtml = '';
            if (traceStyle !== 'empty') {
                if (traceStyle === 'bold') {
                    // Standard solid reference line perfectly scaled to fit within lines 2 and 4
                    lettersPathsHtml = `
                        <text x="${textOffsetMarginX}" y="${textY}" font-family="'Noto Sans Devanagari', sans-serif" font-size="54px" fill="#1c1917" font-weight="700" letter-spacing="4px">${text}</text>
                    `;
                } else if (traceStyle === 'dotted') {
                    // Dotted line for young kids to write directly within the 5-line space
                    lettersPathsHtml = `
                        <text x="${textOffsetMarginX}" y="${textY}" font-family="'Noto Sans Devanagari', sans-serif" font-size="54px" fill="none" stroke="#4b5563" stroke-width="1.5" stroke-dasharray="2,3" font-weight="700" letter-spacing="4px">${text}</text>
                    `;
                }
            }

            return `
                <svg viewBox="0 0 800 ${height}" class="w-full bg-white" style="display: block;">
                    <!-- Highlight central tracking column warm pink background similar to premium textbooks -->
                    <rect x="${lineStartBoundaryX}" y="${yLine1}" width="${lineEndBoundaryX - lineStartBoundaryX}" height="${yLine5 - yLine1}" fill="#fef2f2" opacity="0.4" />
                    ${linesHtml}
                    ${lettersPathsHtml}
                    <text x="${lineStartBoundaryX + 2}" y="58" font-family="'Inter', sans-serif" font-size="9px" fill="#94a3b8" font-weight="800">${rowIdx}</text>
                </svg>
            `;
        }

        function triggerWorksheetPrint() {
            addActivityLog({
                type: 'print',
                style: document.getElementById('ws-style-select').value,
                text: document.getElementById('ws-text-input').value
            });
            window.print();
        }

        function clearWorksheetSettings() {
            document.getElementById('ws-school-input').value = "अक्षर अभ्यास लेखन माला";
            document.getElementById('ws-style-select').value = "custom_name";
            document.getElementById('ws-rows-select').value = "7";
            document.getElementById('ws-text-input').value = "आरव";
            const input = document.getElementById('ws-text-input');
            if (input) input.dataset.rawEnglish = "aarav";
            handleWorksheetStyleSelect();
            showToast("Worksheet options reset.");
        }

        function applyPreset(style, rows, customText) {
            const modal = document.getElementById('milestones-modal');
            if (modal) modal.classList.add('hidden');
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';

            switchMode('worksheet');

            document.getElementById('ws-style-select').value = style;
            document.getElementById('ws-rows-select').value = rows;
            if (customText) {
                document.getElementById('ws-text-input').value = customText;
                const input = document.getElementById('ws-text-input');
                if (input) {
                    if (customText === "भारत") input.dataset.rawEnglish = "bharat";
                    else if (customText === "आरव") input.dataset.rawEnglish = "aarav";
                    else input.dataset.rawEnglish = "";
                }
            }

            handleWorksheetStyleSelect();
            updateWorksheetPreview();
            showToast("Worksheet preset applied.");
        }

        document.addEventListener('DOMContentLoaded', () => {
            // Core Tab Switching via dynamic bindings
            document.getElementById('tab-drill').addEventListener('click', () => switchMode('drill'));
            document.getElementById('tab-worksheet').addEventListener('click', () => switchMode('worksheet'));

            // Top Toolbar Navigation Buttons
            document.getElementById('btn-presets').addEventListener('click', toggleMilestonesModal);
            document.getElementById('btn-rewards').addEventListener('click', toggleRewardsModal);
            document.getElementById('btn-analytics').addEventListener('click', toggleAnalyticsModal);

            // Assistive Control Toggles
            document.getElementById('btn-toggle-assist').addEventListener('click', toggleAssistiveMode);

            // Audio Mute and Demonstration Buttons Binding
            document.getElementById('btn-toggle-sound').addEventListener('click', () => {
                isSoundMuted = !isSoundMuted;
                const muteBtn = document.getElementById('btn-toggle-sound');
                if (isSoundMuted) {
                    muteBtn.textContent = "🔇 Sound: OFF";
                    showToast("Slate audio effects muted.");
                } else {
                    muteBtn.textContent = "🔊 Sound: ON";
                    showToast("Slate audio effects unmuted.");
                }
            });

            document.getElementById('btn-show-me').addEventListener('click', runDemonstrateStrokeFlow);

            // Rainbow Palette click configurations
            document.querySelectorAll('#chalk-palette-container > button').forEach(paletteBtn => {
                paletteBtn.addEventListener('click', (e) => {
                    document.querySelectorAll('#chalk-palette-container > button').forEach(b => {
                        b.classList.remove('scale-110');
                        b.classList.add('border-transparent');
                        b.classList.remove('border-stone-600');
                        b.setAttribute('aria-checked', 'false');
                    });
                    
                    e.target.classList.add('scale-110');
                    e.target.classList.remove('border-transparent');
                    e.target.classList.add('border-stone-600');
                    e.target.setAttribute('aria-checked', 'true');

                    activeChalkColor = e.target.getAttribute('data-color');
                    showToast("Chalk drawing color changed!");
                    
                    if (ctx) {
                        ctx.strokeStyle = getPenColor();
                    }
                });
            });

            // Difficulty Level Controls
            document.getElementById('btn-diff-beginner').addEventListener('click', () => selectDifficultyLevel('beginner'));
            document.getElementById('btn-diff-intermediate').addEventListener('click', () => selectDifficultyLevel('intermediate'));
            document.getElementById('btn-diff-advanced').addEventListener('click', () => selectDifficultyLevel('advanced'));

            // Setup Screen Buttons
            document.getElementById('btn-random-challenge').addEventListener('click', launchRandomChallenge);

            // Chalkboard Interactive Screen Buttons
            document.getElementById('btn-back-setup').addEventListener('click', resetTracerMode);
            document.getElementById('btn-theme-chalk').addEventListener('click', () => setTracerTheme('chalk'));
            document.getElementById('btn-theme-pencil').addEventListener('click', () => setTracerTheme('pencil'));
            document.getElementById('btn-clear-canvas').addEventListener('click', clearTracerCanvas);
            document.getElementById('btn-validate-trace').addEventListener('click', validateTracedLetter);

            // Worksheet Controls Binding
            document.getElementById('ws-school-input').addEventListener('input', updateWorksheetPreview);
            document.getElementById('ws-style-select').addEventListener('change', handleWorksheetStyleSelect);
            document.getElementById('chk-double-sided').addEventListener('change', updateWorksheetPreview);
            
            // Re-engineered Left-to-Right Syllabic Hinglish dynamic listen hooks with live-updating validation
            const inputField = document.getElementById('ws-text-input');
            if (inputField) {
                inputField.dataset.rawEnglish = "aarav";
                inputField.addEventListener('keydown', (e) => {
                    const autoHinglish = document.getElementById('chk-hinglish-auto')?.checked || false;
                    if (!autoHinglish) return;

                    // Allow backspace & modify raw English buffer state
                    if (e.key === 'Backspace') {
                        let curRaw = inputField.dataset.rawEnglish || "";
                        inputField.dataset.rawEnglish = curRaw.slice(0, -1);
                    } else if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
                        let curRaw = inputField.dataset.rawEnglish || "";
                        inputField.dataset.rawEnglish = curRaw + e.key;
                        e.preventDefault();
                        
                        inputField.value = transliteratePhoneticEngToHindi(inputField.dataset.rawEnglish);
                        handleCustomTextInputChange();
                    }
                });
                
                inputField.addEventListener('input', (e) => {
                    const autoHinglish = document.getElementById('chk-hinglish-auto')?.checked || false;
                    if (!autoHinglish || !/[a-zA-Z]/.test(inputField.value)) {
                        handleCustomTextInputChange();
                    }
                });
            }

            document.getElementById('ws-rows-select').addEventListener('change', updateWorksheetPreview);
            document.getElementById('chk-hinglish-auto').addEventListener('change', () => {
                const input = document.getElementById('ws-text-input');
                if (input) {
                    input.value = "आरव";
                    input.dataset.rawEnglish = "aarav";
                }
                updateWorksheetPreview();
            });
            document.getElementById('btn-reset-worksheet').addEventListener('click', clearWorksheetSettings);
            document.getElementById('btn-print-worksheet').addEventListener('click', triggerWorksheetPrint);

            // Modals Close Buttons
            document.getElementById('btn-close-milestones').addEventListener('click', toggleMilestonesModal);
            document.getElementById('btn-close-rewards').addEventListener('click', toggleRewardsModal);
            document.getElementById('btn-close-analytics').addEventListener('click', toggleAnalyticsModal);
            document.getElementById('btn-wipe-analytics').addEventListener('click', clearAnalyticsLogHistory);
            document.getElementById('btn-print-certificate').addEventListener('click', printMasterAchievementCertificate);
            document.getElementById('btn-print-redemption').addEventListener('click', printTargetedRedemptionWorksheet);

            // Modal Clicking Outside Listeners
            document.getElementById('milestones-modal').addEventListener('click', closeMilestonesOnClickOutside);
            document.getElementById('sticker-book-modal').addEventListener('click', closeStickerBookOnClickOutside);
            document.getElementById('analytics-modal').addEventListener('click', closeAnalyticsOnClickOutside);

            // Milestone Checks
            document.getElementById('chk-milestone-1').addEventListener('change', () => toggleMilestoneCheck('1'));
            document.getElementById('chk-milestone-2').addEventListener('change', () => toggleMilestoneCheck('2'));
            document.getElementById('chk-milestone-3').addEventListener('change', () => toggleMilestoneCheck('3'));

            // Preset Trigger Actions inside Milestones Modal
            document.getElementById('btn-preset-blank').addEventListener('click', () => applyPreset('preset_blank', 7, ''));
            document.getElementById('btn-preset-vowels').addEventListener('click', () => applyPreset('preset_vowels', 7, ''));
            document.getElementById('btn-preset-consonants').addEventListener('click', () => applyPreset('preset_consonants', 7, ''));
            document.getElementById('btn-preset-india').addEventListener('click', () => applyPreset('custom_name', 7, 'भारत'));

            // Keyboard Assistive & Escape Key Listener
            window.addEventListener('keydown', (e) => {
                // Assistive canvas drawing controls
                handleKeyboardTracing(e);

                // Global ESC key to close all active popup modals instantly
                if (e.key === 'Escape' || e.key === 'Esc') {
                    const modals = ['milestones-modal', 'sticker-book-modal', 'analytics-modal'];
                    let wasAnyModalOpen = false;

                    modals.forEach(id => {
                        const el = document.getElementById(id);
                        if (el && !el.classList.contains('hidden')) {
                            el.classList.add('hidden');
                            wasAnyModalOpen = true;
                        }
                    });

                    if (wasAnyModalOpen) {
                        document.body.style.overflow = '';
                        document.documentElement.style.overflow = '';
                        showToast("Popup closed");
                    }
                }
            });

            // Initializations
            populateVarnamalaGrids();
            populateVirtualKeyboardTray();
            renderWordHistoryChips();
            switchMode('drill'); 
            loadMilestoneStates();
            refreshStickerShelfDisplay();
            pruneOldActivityLogs();

            // Prevent window elasticity
            document.getElementById('tracer-interactive-canvas')?.addEventListener('touchmove', (e) => {
                e.preventDefault();
            }, { passive: false });
        });