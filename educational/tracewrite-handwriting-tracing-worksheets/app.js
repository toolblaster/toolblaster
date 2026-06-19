// STREAMING_CHUNK: Initializing state and historical tracing log systems...
        let currentMode = 'drill'; 
        let activeTracerLetter = 'A'; 
        let audioCtx = null;
        let isTracingDrawing = false;
        let activeTheme = 'chalk'; 
         
        let canvas = null;
        let ctx = null;

        let userRewardsPoints = parseInt(localStorage.getItem('tracewrite_rewards_points')) || 0;

        let chalkOscNode = null;
        let chalkNoiseNode = null;
        let chalkFilterNode = null;
        let chalkGainNode = null;

        // Custom coordinates mapping standard letter paths onto on-screen blackboard tracking grid
        const svgLetterCoordinates = {
            'A': 'M 40,165 L 100,25 L 160,165 M 65,110 L 135,110',
            'B': 'M 50,25 L 50,165 M 50,25 C 130,25 130,90 50,90 M 50,90 C 140,90 140,165 50,165',
            'C': 'M 155,50 C 120,20 60,20 50,95 C 40,150 120,170 155,140',
            'D': 'M 50,25 L 50,165 M 50,25 C 170,25 170,165 50,165',
            'E': 'M 50,25 L 50,165 M 50,25 L 150,25 M 50,90 L 130,90 M 50,165 L 150,165',
            'F': 'M 50,25 L 50,165 M 50,25 L 150,25 M 50,90 L 130,90',
            'G': 'M 155,55 C 135,25 65,25 50,95 C 40,145 120,165 155,135 L 155,95 L 110,95',
            'H': 'M 50,25 L 50,165 M 150,25 L 150,165 M 50,90 L 150,90',
            'I': 'M 50,25 L 150,25 M 100,25 L 100,165 M 50,165 L 150,165',
            'J': 'M 50,25 L 150,25 M 100,25 L 100,130 C 100,165 50,165 50,130',
            'K': 'M 50,25 L 50,165 M 140,25 L 50,90 L 145,165',
            'L': 'M 50,25 L 50,165 M 50,165 L 140,165',
            'M': 'M 35,165 L 35,25 L 100,105 L 165,25 L 165,165',
            'N': 'M 40,165 L 40,25 L 160,165 L 160,25',
            'O': 'M 100,25 C 30,25 30,165 100,165 C 170,165 170,25 100,25 Z',
            'P': 'M 50,25 L 50,165 M 50,25 C 150,25 150,95 50,95',
            'Q': 'M 100,25 C 30,25 30,165 100,165 C 170,165 170,25 100,25 Z M 130,130 L 175,170',
            'R': 'M 50,25 L 50,165 M 50,25 C 150,25 150,90 50,90 M 50,90 L 145,165',
            'S': 'M 150,45 C 130,15 70,15 50,55 C 30,105 160,110 140,140 C 120,165 60,160 45,135',
            'T': 'M 40,25 L 160,25 M 100,25 L 100,165',
            'U': 'M 50,25 L 50,120 C 50,165 150,165 150,120 L 150,25',
            'V': 'M 35,25 L 100,165 L 165,25',
            'W': 'M 35,25 L 55,165 L 100,75 L 145,165 L 165,25',
            'X': 'M 40,25 L 160,165 M 160,25 L 40,165',
            'Y': 'M 35,25 L 100,95 L 165,25 M 100,95 L 100,165',
            'Z': 'M 45,25 L 155,25 L 45,165 L 155,165',
            'a': 'M 150,90 L 150,160 M 150,120 C 150,90 90,90 90,125 C 90,160 150,160 150,160',
            'b': 'M 60,30 L 60,160 M 60,110 C 130,110 130,160 60,160',
            'c': 'M 140,115 C 100,90 70,100 70,130 C 70,160 110,165 140,145',
            'd': 'M 140,30 L 140,160 M 140,110 C 70,110 70,160 140,160',
            'e': 'M 60,130 L 140,130 C 140,90 60,95 60,130 C 60,165 125,165 140,150',
            'f': 'M 120,40 C 100,30 80,40 80,60 L 80,160 M 55,85 L 105,85',
            'g': 'M 140,90 L 140,160 C 140,200 60,200 60,170 M 140,115 C 140,90 70,90 70,115 C 70,145 140,145 140,145',
            'h': 'M 60,30 L 60,160 M 60,120 C 90,95 135,95 135,130 L 135,160',
            'i': 'M 100,85 L 100,160 M 100,50 L 100,55',
            'j': 'M 115,85 L 115,175 C 115,200 60,200 60,180 M 115,50 L 115,55',
            'k': 'M 60,30 L 60,160 M 130,85 L 60,125 L 135,160',
            'l': 'M 100,30 L 100,160',
            'm': 'M 40,85 L 40,160 M 40,110 C 65,90 90,90 90,120 L 90,160 M 90,110 C 115,90 145,90 145,120 L 145,160',
            'n': 'M 60,85 L 60,160 M 60,110 C 90,90 135,90 135,125 L 135,160',
            'o': 'M 100,90 C 60,90 60,160 100,160 C 140,160 140,90 100,90 Z',
            'p': 'M 60,90 L 60,200 M 60,110 C 130,110 130,160 60,160',
            'q': 'M 140,90 L 140,200 M 140,110 C 70,110 70,160 140,160',
            'r': 'M 60,85 L 60,160 M 60,120 C 85,95 110,95 125,110',
            's': 'M 130,100 C 115,80 85,85 75,110 C 65,135 135,135 125,150 C 115,165 85,160 70,145',
            't': 'M 100,45 L 100,160 M 70,80 L 130,80',
            'u': 'M 60,85 L 60,140 C 60,165 130,165 130,140 L 130,85 M 130,130 L 130,160',
            'v': 'M 50,85 L 100,160 L 150,85',
            'w': 'M 40,85 L 60,160 L 100,110 L 140,160 L 160,85',
            'x': 'M 60,90 L 140,160 M 140,90 L 60,160',
            'y': 'M 50,85 L 100,150 L 150,85 M 100,150 L 50,200',
            'z': 'M 60,95 L 140,95 L 60,160 L 140,160',
            '0': 'M 100,30 C 50,30 50,160 100,160 C 150,160 150,30 100,30 Z',
            '1': 'M 65,55 L 100,30 L 100,160 M 65,160 L 135,160',
            '2': 'M 55,60 C 55,20 145,20 145,65 C 145,100 55,140 55,160 L 145,160',
            '3': 'M 55,40 L 135,40 L 95,95 C 145,95 145,160 85,160 C 60,160 45,145 45,130',
            '4': 'M 120,160 L 120,25 L 45,115 L 145,115',
            '5': 'M 135,35 L 65,35 L 65,90 C 80,80 140,80 140,125 C 140,165 75,165 55,145',
            '6': 'M 125,45 C 110,30 85,30 75,65 C 65,95 65,160 100,160 C 135,160 135,110 100,110 C 70,110 70,160 100,160',
            '7': 'M 55,35 L 145,35 L 85,160',
            '8': 'M 100,95 C 140,95 140,30 100,30 C 60,30 60,95 100,95 C 145,95 145,160 100,160 C 55,160 55,95 100,95 Z',
            '9': 'M 100,95 C 135,95 135,30 100,30 C 65,30 65,95 100,95 L 100,160 C 100,165 65,165 55,155',
            '10': 'M 55,55 L 90,30 L 90,160 M 55,160 L 125,160 M 150,30 C 110,30 110,160 150,160 C 190,160 190,30 150,30 Z'
        };

        const phonicsDictionary = {
            'A': 'A is for Apple', 'B': 'B is for Ball', 'C': 'C is for Cat', 'D': 'D is for Doll',
            'E': 'E is for Elephant', 'F': 'F is for Fish', 'G': 'G is for Grapes', 'H': 'H is for Horse',
            'I': 'I is for Igloo', 'J': 'J is for Jug', 'K': 'K is for Kite', 'L': 'L is for Lion',
            'M': 'M is for Monkey', 'N': 'N is for Nest', 'O': 'O is for Orange', 'P': 'P is for Peacock',
            'Q': 'Q is for Queen', 'R': 'R is for Rabbit', 'S': 'S is for Sun', 'T': 'T is for Tiger',
            'U': 'U is for Umbrella', 'V': 'V is for Van', 'W': 'W is for Watch', 'X': 'X is for Xylophone',
            'Y': 'Y is for Yak', 'Z': 'Z is for Zebra',
            'a': 'a is for ant', 'b': 'b is for banana', 'c': 'c is for cup', 'd': 'd is for drum',
            'e': 'e is for egg', 'f': 'f is for fan', 'g': 'g is for goat', 'h': 'h is for hat',
            'i': 'i is for ink', 'j': 'j is for jam', 'k': 'k is for kiwi', 'l': 'l is for log',
            'm': 'm is for mug', 'n': 'n is for nut', 'o': 'o is for owl', 'p': 'p is for pen',
            'q': 'q is for quilt', 'r': 'r is for rose', 's': 's is for star', 't': 't is for toy',
            'u': 'u is for urn', 'v': 'v is for vase', 'w': 'w is for wall', 'x': 'x is for box',
            'y': 'y is for yo-yo', 'z': 'z is for zoo',
            '1': 'One little duck', '2': 'Two golden stars', '3': 'Three sweet candies', '4': 'Four fast cars',
            '5': 'Five color balloons', '6': 'Six little bees', '7': 'Seven soft apples', '8': 'Eight cute puppies',
            '9': 'Nine toy blocks', '10': 'Ten tall trees'
        };

        const badgeCollection = [
            { points: 10, icon: '🐣', label: 'Sprout Trace' },
            { points: 30, icon: '🐰', label: 'Bunny Pencil' },
            { points: 60, icon: '🦊', label: 'Clever Fox' },
            { points: 100, icon: '🦁', label: 'Lion Writer' },
            { points: 150, icon: '🦉', label: 'Wise Scholar' },
            { points: 210, icon: '🦄', label: 'Dream Maker' },
            { points: 300, icon: '👑', label: 'Tracing Royalty' }
        ];

        let tracingCheckpoints = [];
        let visitedCheckpointsCount = 0;

        // STREAMING_CHUNK: Managing 15-day localStorage retention and analytics models...
        function getAnalyticsLogs() {
            let logs = [];
            try {
                logs = JSON.parse(localStorage.getItem('tracewrite_analytics_history')) || [];
            } catch (e) {
                logs = [];
            }
            return logs;
        }

        function saveAnalyticsLogs(logs) {
            localStorage.setItem('tracewrite_analytics_history', JSON.stringify(logs));
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
            if (dot) {
                dot.classList.remove('hidden');
            }
        }

        function clearAnalyticsNotificationDot() {
            const dot = document.getElementById('analytics-notif-dot');
            if (dot) {
                dot.classList.add('hidden');
            }
        }

        function clearAnalyticsLogHistory() {
            localStorage.removeItem('tracewrite_analytics_history');
            showToast("Activity history logs have been securely wiped.");
            populateAnalyticsDashboard();
        }

        // STREAMING_CHUNK: Populating Parent Dashboard Analytics view...
        function populateAnalyticsDashboard() {
            const logs = pruneOldActivityLogs();
            
            // Calculate Stats
            const traces = logs.filter(l => l.type === 'trace');
            const totalTraced = traces.length;
            const avgAccuracy = totalTraced > 0 
                ? Math.round(traces.reduce((sum, current) => sum + current.accuracy, 0) / totalTraced) 
                : 0;
            const totalSheets = logs.filter(l => l.type === 'print').length;

            // Day Calculation (Find Unique Days Logged)
            const activeDates = new Set();
            logs.forEach(l => {
                const dayString = new Date(l.timestamp).toDateString();
                activeDates.add(dayString);
            });
            const activeDaysCount = activeDates.size;

            // Inject metrics labels
            document.getElementById('stats-total-traced').textContent = totalTraced;
            document.getElementById('stats-avg-accuracy').textContent = `${avgAccuracy}%`;
            document.getElementById('stats-total-sheets').textContent = totalSheets;
            document.getElementById('stats-active-days').textContent = `${activeDaysCount} Days`;

            // Build Daily History Timeline Rows
            const container = document.getElementById('analytics-timeline-container');
            if (!container) return;

            if (logs.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-6 text-[11px] font-semibold text-stone-400 italic">
                        No activity recorded yet! Ask your student to trace letters or print custom sheets to populate logs.
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
                    <div class="border-b border-stone-200/60 pb-2 mb-2 last:border-none last:pb-0 last:mb-0">
                        <span class="text-[10px] font-black uppercase text-stone-500 block mb-1.5">${dateString}</span>
                        <div class="space-y-1.5 pl-2 border-l border-stone-200">
                `;
                groups[dateString].forEach(item => {
                    const timeStr = new Date(item.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                    if (item.type === 'trace') {
                        timelineHtml += `
                            <div class="flex justify-between items-center text-[10.5px]">
                                <span class="text-stone-700 font-bold">🖌️ Traced Letter '${item.char}'</span>
                                <div class="flex items-center gap-2">
                                    <span class="text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded">${item.accuracy}% Acc</span>
                                    <span class="text-stone-400 font-medium">${timeStr}</span>
                                </div>
                            </div>
                        `;
                    } else if (item.type === 'print') {
                        timelineHtml += `
                            <div class="flex justify-between items-center text-[10.5px]">
                                <span class="text-stone-700 font-bold">📝 Printed standard worksheet (${item.style === 'custom_name' ? 'Name Repeat' : 'Custom Sentence'})</span>
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

        // Modal triggers for analytics view
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

        // STREAMING_CHUNK: Setting up audio synth parameters and voice configurations...
        function initAudio() {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        }

        function startChalkSound() {
            initAudio();
            if (!audioCtx) return;
             
            try {
                chalkOscNode = audioCtx.createOscillator();
                chalkOscNode.type = 'triangle';
                chalkOscNode.frequency.setValueAtTime(140, audioCtx.currentTime);

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
                    chalkFilterNode.frequency.setValueAtTime(1100, audioCtx.currentTime);
                    chalkFilterNode.Q.setValueAtTime(4.0, audioCtx.currentTime);
                } else {
                    chalkFilterNode.frequency.setValueAtTime(3000, audioCtx.currentTime);
                    chalkFilterNode.Q.setValueAtTime(1.5, audioCtx.currentTime);
                }
                 
                chalkGainNode = audioCtx.createGain();
                chalkGainNode.gain.setValueAtTime(activeTheme === 'chalk' ? 0.03 : 0.015, audioCtx.currentTime);
                 
                chalkOscNode.connect(chalkFilterNode);
                chalkNoiseNode.connect(chalkFilterNode);
                chalkFilterNode.connect(chalkGainNode);
                chalkGainNode.connect(audioCtx.destination);
                 
                chalkOscNode.start();
                chalkNoiseNode.start();
            } catch(e) {
                console.warn("Sound synth failed to initialize:", e);
            }
        }

        function stopChalkSound() {
            if (chalkOscNode) {
                try { chalkOscNode.stop(); } catch(e){}
                chalkOscNode = null;
            }
            if (chalkNoiseNode) {
                try { chalkNoiseNode.stop(); } catch(e){}
                chalkNoiseNode = null;
            }
        }

        function playChimeSound() {
            initAudio();
            if (!audioCtx) return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); 
            osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); 
            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.5);
        }

        function speakPhonicsText(txt) {
            if (!('speechSynthesis' in window)) return;
            window.speechSynthesis.cancel(); 
             
            const accent = document.getElementById('drill-voice-select')?.value || 'US';
            const rate = parseFloat(document.getElementById('drill-speed-select')?.value || '0.9');
             
            const utterance = new SpeechSynthesisUtterance(txt);
            utterance.rate = rate;
            utterance.pitch = 1.15; 

            const voices = window.speechSynthesis.getVoices();
            if (accent === 'UK') {
                const ukVoice = voices.find(v => v.lang.includes('en-GB'));
                if (ukVoice) utterance.voice = ukVoice;
            } else if (accent === 'IN') {
                const inVoice = voices.find(v => v.lang.includes('en-IN'));
                if (inVoice) utterance.voice = inVoice;
            } else {
                const usVoice = voices.find(v => v.lang.includes('en-US'));
                if (usVoice) utterance.voice = usVoice;
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
            for (let i = 0; i < 75; i++) {
                confettiParticles.push({
                    x: Math.random() * canvasEl.width,
                    y: Math.random() * -canvasEl.height,
                    size: Math.random() * 5 + 4,
                    color: `hsl(${Math.random() * 360}, 85%, 65%)`,
                    speedX: Math.random() * 4 - 2,
                    speedY: Math.random() * 4 + 2,
                    rotation: Math.random() * 360,
                    rotationSpeed: Math.random() * 12 - 6
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
            setTimeout(() => { stopConfettiCelebration(); }, 4000);
        }

        function stopConfettiCelebration() {
            isConfettiActive = false;
            if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
        }

        function switchMode(mode) {
            currentMode = mode;
            stopConfettiCelebration();

            const card = document.getElementById('main-tool-card');

            document.getElementById('tab-drill').className = `mode-tab text-center py-2 text-[10px] sm:text-xs font-extrabold rounded-lg transition-all ${mode === 'drill' ? 'active bg-red-800 text-white shadow-md' : 'text-stone-700 hover:text-stone-900 bg-transparent'} relative group`;
            document.getElementById('tab-worksheet').className = `mode-tab text-center py-2 text-[10px] sm:text-xs font-extrabold rounded-lg transition-all ${mode === 'worksheet' ? 'active bg-red-800 text-white shadow-md' : 'text-stone-700 hover:text-stone-900 bg-transparent'} relative group`;

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

        // STREAMING_CHUNK: Setting up interactive tracer configurations...
        function populateAlphabetGrids() {
            const upperContainer = document.getElementById('alphabet-uppercase-grid');
            const lowerContainer = document.getElementById('alphabet-lowercase-grid');
            const numbersContainer = document.getElementById('numbers-grid');

            if (!upperContainer || !lowerContainer || !numbersContainer) return;

            upperContainer.innerHTML = '';
            lowerContainer.innerHTML = '';
            numbersContainer.innerHTML = '';

            for (let i = 65; i <= 90; i++) {
                const char = String.fromCharCode(i);
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'p-2 bg-white hover:bg-red-50 border border-stone-200 hover:border-red-600 rounded-lg text-xs font-black transition-all hover:scale-105 select-none';
                btn.textContent = char;
                btn.onclick = () => selectLetterForOnScreenTracer(char);
                upperContainer.appendChild(btn);
            }

            for (let i = 97; i <= 122; i++) {
                const char = String.fromCharCode(i);
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'p-2 bg-white hover:bg-red-50 border border-stone-200 hover:border-red-600 rounded-lg text-xs font-black transition-all hover:scale-105 select-none';
                btn.textContent = char;
                btn.onclick = () => selectLetterForOnScreenTracer(char);
                lowerContainer.appendChild(btn);
            }

            for (let i = 1; i <= 10; i++) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'p-2 bg-white hover:bg-red-50 border border-stone-200 hover:border-red-600 rounded-lg text-xs font-black transition-all hover:scale-105 select-none';
                btn.textContent = i;
                btn.onclick = () => selectLetterForOnScreenTracer(String(i));
                numbersContainer.appendChild(btn);
            }
        }

        function calculateActiveLetterCheckpoints() {
            tracingCheckpoints = [];
            const pathData = svgLetterCoordinates[activeTracerLetter];
            if (!pathData) return;

            const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
            pathEl.setAttribute("d", pathData);
            const pathLength = pathEl.getTotalLength();
            
            const segmentsCount = 30; 
            for (let i = 0; i <= segmentsCount; i++) {
                const pt = pathEl.getPointAtLength((i / segmentsCount) * pathLength);
                tracingCheckpoints.push({
                    x: pt.x, 
                    y: pt.y,
                    visited: false
                });
            }
            visitedCheckpointsCount = 0;
            updateAccuracyStatusLabel();
        }

        function triggerCheckpointValidation(canvasX, canvasY) {
            const svgX = (canvasX / canvas.width) * 200;
            const svgY = (canvasY / canvas.height) * 200;

            let checkOccurred = false;
            tracingCheckpoints.forEach(cp => {
                if (!cp.visited) {
                    const dx = cp.x - svgX;
                    const dy = cp.y - svgY;
                    const distance = Math.sqrt(dx*dx + dy*dy);
                    if (distance < 18) {
                        cp.visited = true;
                        visitedCheckpointsCount++;
                        checkOccurred = true;
                    }
                }
            });

            if (checkOccurred) {
                updateAccuracyStatusLabel();
            }
        }

        function updateAccuracyStatusLabel() {
            const pct = Math.min(100, Math.round((visitedCheckpointsCount / tracingCheckpoints.length) * 100));
            const counter = document.getElementById('realtime-accuracy-counter');
            const cue = document.getElementById('realtime-status-message-cue');
            if (counter) {
                counter.textContent = `${pct}% Checked`;
            }
            if (cue) {
                if (pct > 80) {
                    cue.textContent = "Almost complete! Perfect alignment.";
                    cue.className = "text-emerald-700 font-extrabold";
                } else if (pct > 40) {
                    cue.textContent = "Writing nicely! Follow standard paths.";
                    cue.className = "text-amber-700 font-extrabold";
                } else {
                    cue.textContent = "Follow the numbered star guide!";
                    cue.className = "text-red-700 font-extrabold";
                }
            }
        }

        function runGuideStrokeAnimation() {
            const hand = document.getElementById('hand-guide-pointer');
            const pathData = svgLetterCoordinates[activeTracerLetter];
            if (!hand || !pathData) return;

            const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
            pathEl.setAttribute("d", pathData);
            const pathLength = pathEl.getTotalLength();

            hand.classList.remove('hidden');
            let progress = 0;
             
            function animateStep() {
                if (progress > pathLength) {
                    hand.classList.add('hidden');
                    return;
                }
                const pt = pathEl.getPointAtLength(progress);
                hand.style.left = `calc(${ (pt.x / 200) * 100 }% - 16px)`;
                hand.style.top = `calc(${ (pt.y / 200) * 100 }% - 16px)`;
                progress += 2;
                requestAnimationFrame(animateStep);
            }
            animateStep();
        }

        function selectLetterForOnScreenTracer(char) {
            activeTracerLetter = char;
             
            document.getElementById('drill-setup-screen').classList.add('hidden');
            document.getElementById('drill-active-screen').classList.remove('hidden');

            document.getElementById('current-tracer-letter-label').textContent = `Practice Mode: Tracing Letter '${char}'`;
            document.getElementById('tracer-bg-guide').textContent = char;

            setTimeout(() => {
                initTracerCanvasBoard();
                drawGuidesOverlay();
            }, 100);

            const guideSpeech = phonicsDictionary[char] || `${char}`;
            speakPhonicsText(guideSpeech);
        }

        function resetTracerMode() {
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

            ctx.strokeStyle = activeTheme === 'chalk' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(30, 41, 59, 0.85)';
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
            ctx.beginPath();
            const rect = canvas.getBoundingClientRect();
            const drawX = (e.clientX - rect.left) * (canvas.width / rect.width);
            const drawY = (e.clientY - rect.top) * (canvas.height / rect.height);
            ctx.moveTo(drawX, drawY);
            triggerCheckpointValidation(drawX, drawY);
            startChalkSound();
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
            ctx.beginPath();
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const drawX = (touch.clientX - rect.left) * (canvas.width / rect.width);
            const drawY = (touch.clientY - rect.top) * (canvas.height / rect.height);
            ctx.moveTo(drawX, drawY);
            triggerCheckpointValidation(drawX, drawY);
            startChalkSound();
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
            stopChalkSound();
        }

        function clearTracerCanvas() {
            if (ctx && canvas) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            calculateActiveLetterCheckpoints();
        }

        // STREAMING_CHUNK: Validating strokes and committing results to historical log entries...
        function validateTracedLetter() {
            const pct = Math.min(100, Math.round((visitedCheckpointsCount / tracingCheckpoints.length) * 100));
             
            if (pct < 50) {
                speakPhonicsText("Try drawing inside the guide dots!");
                showToast("Keep going! Trace closer to the guidelines.");
                return;
            }

            playChimeSound();
            triggerConfettiBurst();

            userRewardsPoints += 10;
            localStorage.setItem('tracewrite_rewards_points', userRewardsPoints);
            refreshStickerShelfDisplay();

            showRewardNotification();

            // Commit to 15-day parent tracking history
            addActivityLog({
                type: 'trace',
                char: activeTracerLetter,
                accuracy: pct,
                points: 10
            });

            const ph = phonicsDictionary[activeTracerLetter] || `${activeTracerLetter}`;
            speakPhonicsText(`${ph}. Wonderful tracing practice!`);

            showToast(`Accuracy: ${pct}%! Awarded +10 Points! Check your Rewards Shelf!`);
             
            let streak = parseInt(localStorage.getItem('tracewrite_streak_val')) || 0;
            streak++;
            localStorage.setItem('tracewrite_streak_val', streak);
            document.getElementById('drill-streak-count').textContent = `${streak} Days`;
        }

        function setTracerTheme(theme) {
            activeTheme = theme;
            const wrap = document.getElementById('chalkboard-wrap-box');
            const guide = document.getElementById('tracer-bg-guide');
            const btnChalk = document.getElementById('btn-theme-chalk');
            const btnPencil = document.getElementById('btn-theme-pencil');

            if (!wrap || !guide || !btnChalk || !btnPencil) return;

            if (theme === 'chalk') {
                wrap.className = "relative w-full max-w-lg aspect-square rounded-2xl p-1 bg-stone-900 border-4 border-stone-700 overflow-hidden flex items-center justify-center shadow-inner theme-chalkboard";
                guide.className = "font-bold text-[220px] sm:text-[280px] font-mono tracking-tighter leading-none select-none text-white/10";
                btnChalk.className = "px-2 py-1 rounded bg-stone-900 text-white shadow";
                btnPencil.className = "px-2 py-1 rounded text-stone-700 ml-0.5";
            } else {
                wrap.className = "relative w-full max-w-lg aspect-square rounded-2xl p-1 bg-white border-4 border-stone-300 overflow-hidden flex items-center justify-center shadow-inner theme-paper-desk";
                guide.className = "font-bold text-[220px] sm:text-[280px] font-mono tracking-tighter leading-none select-none text-blue-900/10";
                btnPencil.className = "px-2 py-1 rounded bg-stone-900 text-white shadow";
                btnChalk.className = "px-2 py-1 rounded text-stone-700 ml-0.5";
            }

            initTracerCanvasBoard();
        }

        function drawGuidesOverlay() {
            const overlay = document.getElementById('tracer-guides-overlay');
            if (!overlay) return;
            overlay.innerHTML = '';

            const pathData = svgLetterCoordinates[activeTracerLetter];
            if (!pathData) return;

            const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
            pathEl.setAttribute("d", pathData);
            const pathLength = pathEl.getTotalLength();

            const checkpoints = [0.05, 0.5, 0.95];
            checkpoints.forEach((fraction, index) => {
                const pt = pathEl.getPointAtLength(fraction * pathLength);
                const indicator = document.createElement('div');
                indicator.className = "absolute w-6 h-6 rounded-full text-white font-black text-xs flex items-center justify-center shadow-lg guide-dot-pulse transform -translate-x-1/2 -translate-y-1/2 z-20 bg-emerald-400";
                 
                if (index === 1) indicator.className = indicator.className.replace('bg-emerald-400', 'bg-amber-400');
                if (index === 2) indicator.className = indicator.className.replace('bg-emerald-400', 'bg-red-400');
                 
                indicator.style.left = `${(pt.x / 200) * 100}%`;
                indicator.style.top = `${(pt.y / 200) * 100}%`;
                indicator.textContent = index + 1;
                overlay.appendChild(indicator);
            });

            runGuideStrokeAnimation();
        }

        function launchDailyChallengeLetter() {
            const list = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const char = list[Math.floor(Math.random() * list.length)];
            selectLetterForOnScreenTracer(char);
            showToast(`Today's writing challenge: Letter ${char}!`);
        }

        function showRewardNotification() {
            const dot = document.getElementById('reward-notif-dot');
            if (dot) {
                dot.classList.remove('hidden');
            }
        }

        function clearRewardNotification() {
            const dot = document.getElementById('reward-notif-dot');
            if (dot) {
                dot.classList.add('hidden');
            }
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
                localStorage.setItem(`tracewrite_milestone_${id}`, document.getElementById(`chk-milestone-${id}`).checked ? 'true' : 'false');
            }

            if (count === 3) {
                msg.textContent = "🏆 Amazing! All milestones reached. Your child is making stellar writing progress!";
                triggerConfettiBurst();
                userRewardsPoints += 30;
                localStorage.setItem('tracewrite_rewards_points', userRewardsPoints);
                showRewardNotification();
                showToast("Earned +30 points for completing all homeschooling milestones!");
            } else if (count > 0) {
                msg.textContent = `💪 Progress: ${count} of 3 milestones checked off. Keep tracing daily!`;
            } else {
                msg.textContent = "";
            }
        }

        function loadMilestoneStates() {
            for (let i = 1; i <= 3; i++) {
                const checked = localStorage.getItem(`tracewrite_milestone_${i}`) === 'true';
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
                let unlocked = false;
                if (badge.points && userRewardsPoints >= badge.points) unlocked = true;

                const block = document.createElement('div');
                block.className = `p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                    unlocked ? 'bg-amber-100 border-amber-300 scale-100' : 'bg-stone-100 border-stone-200 opacity-40 grayscale scale-95'
                }`;
                block.style.minWidth = "80px";
                 
                block.innerHTML = `
                    <span class="text-3xl">${badge.icon}</span>
                    <span class="text-[10px] font-black leading-tight text-stone-700 mt-1 truncate block w-full">${badge.label}</span>
                `;
                shelf.appendChild(block);
            });
        }

        function handleWorksheetStyleSelect() {
            const style = document.getElementById('ws-style-select').value;
            const label = document.getElementById('ws-input-label-text');
            const input = document.getElementById('ws-text-input');
            const cursiveContainer = document.getElementById('ws-cursive-toggle-container');

            if (!label || !input) return;

            if (style === 'custom_name') {
                label.textContent = "Enter Child's Name";
                input.value = "AARAV SHARMA";
                input.closest('.space-y-1').classList.remove('hidden');
                cursiveContainer.classList.remove('hidden');
            } else if (style === 'custom_sentence') {
                label.textContent = "Enter Custom Sentence";
                input.value = "KINDNESS IS A SUPERPOWER.";
                input.closest('.space-y-1').classList.remove('hidden');
                cursiveContainer.classList.remove('hidden');
            } else {
                input.closest('.space-y-1').classList.add('hidden');
                cursiveContainer.classList.add('hidden');
            }

            updateWorksheetPreview();
        }

        function updateWorksheetPreview() {
            const style = document.getElementById('ws-style-select').value;
            const textRaw = document.getElementById('ws-text-input').value.toUpperCase() || "TRACE";
            const fontStyle = document.getElementById('ws-cursive-select').value;
            const rowsCount = parseInt(document.getElementById('ws-rows-select').value) || 8; 
            const previewBox = document.getElementById('screen-worksheet-preview');
            const printBox = document.getElementById('print-sheet');

            if (!previewBox || !printBox) return;

            let rowsHtml = '';
            let printRowsHtml = '';

            const rowHeight = 120;
            const textY = 75; 

            if (style === 'custom_name') {
                for (let i = 0; i < rowsCount; i++) {
                    const traceStyle = (i === 0) ? 'bold' : (i < 4 ? 'dotted' : 'empty'); 
                    rowsHtml += generateWorksheetSVGRow(textRaw, fontStyle, traceStyle, i + 1, rowHeight, textY);
                    printRowsHtml += generateWorksheetSVGRow(textRaw, fontStyle, traceStyle, i + 1, rowHeight, textY, true);
                }
            } else if (style === 'custom_sentence') {
                const words = textRaw.split(' ');
                let currentLineText = '';
                let lineIdx = 1;

                words.forEach(word => {
                    if ((currentLineText + word).length > 22) {
                        rowsHtml += generateWorksheetSVGRow(currentLineText.trim(), fontStyle, 'dotted', lineIdx, rowHeight, textY);
                        printRowsHtml += generateWorksheetSVGRow(currentLineText.trim(), fontStyle, 'dotted', lineIdx, rowHeight, textY, true);
                        currentLineText = word + ' ';
                        lineIdx++;
                    } else {
                        currentLineText += word + ' ';
                    }
                });

                if (currentLineText.trim() !== '') {
                    rowsHtml += generateWorksheetSVGRow(currentLineText.trim(), fontStyle, 'dotted', lineIdx, rowHeight, textY);
                    printRowsHtml += generateWorksheetSVGRow(currentLineText.trim(), fontStyle, 'dotted', lineIdx, rowHeight, textY, true);
                    lineIdx++;
                }

                for (let j = lineIdx; j <= rowsCount; j++) {
                    rowsHtml += generateWorksheetSVGRow('', fontStyle, 'empty', j, rowHeight, textY);
                    printRowsHtml += generateWorksheetSVGRow('', fontStyle, 'empty', j, rowHeight, textY, true);
                }
            } else if (style === 'preset_letters_upper') {
                const linesChars = ["A B C D E F", "G H I J K L M", "N O P Q R S", "T U V W X Y Z"];
                linesChars.forEach((grp, idx) => {
                    rowsHtml += generateWorksheetSVGRow(grp, 'print', 'dotted', idx + 1, rowHeight, textY);
                    printRowsHtml += generateWorksheetSVGRow(grp, 'print', 'dotted', idx + 1, rowHeight, textY, true);
                });
                for (let idx = 5; idx <= rowsCount; idx++) {
                    rowsHtml += generateWorksheetSVGRow('', 'print', 'empty', idx, rowHeight, textY);
                    printRowsHtml += generateWorksheetSVGRow('', 'print', 'empty', idx, rowHeight, textY, true);
                }
            } else if (style === 'preset_letters_lower') {
                const linesChars = ["a b c d e f", "g h i j k l m", "n o p q r s", "t u v w x y z"];
                linesChars.forEach((grp, idx) => {
                    rowsHtml += generateWorksheetSVGRow(grp, 'print', 'dotted', idx + 1, rowHeight, textY);
                    printRowsHtml += generateWorksheetSVGRow(grp, 'print', 'dotted', idx + 1, rowHeight, textY, true);
                });
                for (let idx = 5; idx <= rowsCount; idx++) {
                    rowsHtml += generateWorksheetSVGRow('', 'print', 'empty', idx, rowHeight, textY);
                    printRowsHtml += generateWorksheetSVGRow('', 'print', 'empty', idx, rowHeight, textY, true);
                }
            } else if (style === 'preset_numbers') {
                const numLines = ["1 2 3 4 5", "6 7 8 9 10"];
                numLines.forEach((grp, idx) => {
                    rowsHtml += generateWorksheetSVGRow(grp, 'print', 'dotted', idx + 1, rowHeight, textY);
                    printRowsHtml += generateWorksheetSVGRow(grp, 'print', 'dotted', idx + 1, rowHeight, textY, true);
                });
                for (let idx = 3; idx <= rowsCount; idx++) {
                    rowsHtml += generateWorksheetSVGRow('', 'print', 'empty', idx, rowHeight, textY);
                    printRowsHtml += generateWorksheetSVGRow('', 'print', 'empty', idx, rowHeight, textY, true);
                }
            } else if (style === 'preset_sight_words') {
                const words = ["THE", "AND", "YOU", "THAT", "WAS", "FOR"];
                words.forEach((w, idx) => {
                    const traceStyle = idx < 2 ? 'bold' : 'dotted';
                    rowsHtml += generateWorksheetSVGRow(w, fontStyle, traceStyle, idx + 1, rowHeight, textY);
                    printRowsHtml += generateWorksheetSVGRow(w, fontStyle, traceStyle, idx + 1, rowHeight, textY, true);
                });
                for (let idx = 7; idx <= rowsCount; idx++) {
                    rowsHtml += generateWorksheetSVGRow('', fontStyle, 'empty', idx, rowHeight, textY);
                    printRowsHtml += generateWorksheetSVGRow('', fontStyle, 'empty', idx, rowHeight, textY, true);
                }
            } else {
                for (let k = 0; k < rowsCount; k++) {
                    rowsHtml += generateWorksheetSVGRow('', fontStyle, 'empty', k + 1, rowHeight, textY);
                    printRowsHtml += generateWorksheetSVGRow('', fontStyle, 'empty', k + 1, rowHeight, textY, true);
                }
            }

            const docHeader = `
                <div class="text-center pb-4 mb-4 border-b-2 border-stone-800">
                    <h2 class="text-sm font-bold uppercase tracking-wider">${document.getElementById('ws-school-input').value}</h2>
                    <p class="text-[10px] font-black uppercase text-stone-600 tracking-widest mt-0.5">Handwriting & Tracing Progress Sheet</p>
                </div>
                <div class="grid grid-cols-2 gap-4 text-[10px] font-bold mb-4 pb-2 border-b">
                    <div>STUDENT NAME: ___________________________</div>
                    <div class="text-right">DATE: _______________________</div>
                </div>
            `;

            previewBox.innerHTML = docHeader + `<div class="space-y-2">${rowsHtml}</div>`;
            printBox.innerHTML = docHeader + `<div class="space-y-4">${printRowsHtml}</div>`;
        }

        // STREAMING_CHUNK: Processing worksheet print metadata for logging...
        function triggerWorksheetPrint() {
            const style = document.getElementById('ws-style-select').value;
            const textRaw = document.getElementById('ws-text-input').value.toUpperCase() || "TRACE";
            
            // Log to historical parent records
            addActivityLog({
                type: 'print',
                style: style,
                text: textRaw
            });

            window.print();
        }

        function generateWorksheetSVGRow(text, fontStyle, traceStyle, rowIdx, height, textY, isForPrint = false) {
            const country = document.getElementById('ws-country-select')?.value || 'IN';
            const fontFam = fontStyle === 'cursive' ? "'Caveat', cursive" : "'Montserrat', sans-serif";
            
            let fontSize = fontStyle === 'cursive' ? '46px' : '34px';
            let letterSpacing = '10px';
            
            let linesHtml = '';
            let computedY = textY;

            if (country === 'US') {
                const topBlue = 30;
                const midDashedRed = 62;
                const bottomBlue = 95;
                computedY = fontStyle === 'cursive' ? 88 : 91; 

                linesHtml = `
                    <line x1="10" y1="${topBlue}" x2="790" y2="${topBlue}" stroke="#2563eb" stroke-width="1.2" />
                    <line x1="10" y1="${midDashedRed}" x2="790" y2="${midDashedRed}" stroke="#dc2626" stroke-width="1.2" stroke-dasharray="5,4" />
                    <line x1="10" y1="${bottomBlue}" x2="790" y2="${bottomBlue}" stroke="#2563eb" stroke-width="1.5" />
                `;
            } else if (country === 'UK') {
                const redTop = 25;
                const greyMid1 = 48;
                const greyMid2 = 71;
                const redBottom = 94;
                computedY = 71; 

                linesHtml = `
                    <line x1="10" y1="${redTop}" x2="790" y2="${redTop}" stroke="#dc2626" stroke-width="1.2" />
                    <line x1="10" y1="${greyMid1}" x2="790" y2="${greyMid1}" stroke="#78716c" stroke-width="1" />
                    <line x1="10" y1="${greyMid2}" x2="790" y2="${greyMid2}" stroke="#78716c" stroke-width="1" />
                    <line x1="10" y1="${redBottom}" x2="790" y2="${redBottom}" stroke="#dc2626" stroke-width="1.2" />
                `;
            } else if (country === 'AU') {
                const blueTop = 25;
                const brownMid1 = 48;
                const brownMid2 = 71;
                const blueBottom = 94;
                computedY = 71;

                linesHtml = `
                    <line x1="10" y1="${blueTop}" x2="790" y2="${blueTop}" stroke="#1e40af" stroke-width="1.2" />
                    <line x1="10" y1="${brownMid1}" x2="790" y2="${brownMid1}" stroke="#a16207" stroke-width="1" stroke-dasharray="4,4" />
                    <line x1="10" y1="${brownMid2}" x2="790" y2="${brownMid2}" stroke="#a16207" stroke-width="1" stroke-dasharray="4,4" />
                    <line x1="10" y1="${blueBottom}" x2="790" y2="${blueBottom}" stroke="#1e40af" stroke-width="1.2" />
                `;
            } else {
                const redTop = 25;
                const blueMid1 = 45;
                const blueMid2 = 75;
                const redBottom = 95;
                computedY = 75; 

                linesHtml = `
                    <line x1="10" y1="${redTop}" x2="790" y2="${redTop}" stroke="#dc2626" stroke-width="1.2" />
                    <line x1="10" y1="${blueMid1}" x2="790" y2="${blueMid1}" stroke="#2563eb" stroke-width="1" />
                    <line x1="10" y1="${blueMid2}" x2="790" y2="${blueMid2}" stroke="#2563eb" stroke-width="1" />
                    <line x1="10" y1="${redBottom}" x2="790" y2="${redBottom}" stroke="#dc2626" stroke-width="1.2" />
                `;
            }

            let textElement = '';
            if (traceStyle === 'bold') {
                textElement = `<text x="35" y="${computedY}" font-family="${fontFam}" font-size="${fontSize}" fill="#1c1917" font-weight="900" letter-spacing="${letterSpacing}">${text}</text>`;
            } else if (traceStyle === 'dotted') {
                textElement = `<text x="35" y="${computedY}" font-family="${fontFam}" font-size="${fontSize}" fill="none" stroke="#78716c" stroke-width="1.8" stroke-dasharray="2,3" font-weight="700" letter-spacing="${letterSpacing}">${text}</text>`;
            }

            return `
                <svg viewBox="0 0 800 ${height}" class="w-full bg-white" style="display: block;">
                    ${linesHtml}
                    ${textElement}
                    <text x="12" y="${country === 'US' ? 62 : 65}" font-family="'Inter', sans-serif" font-size="9px" fill="#78716c" font-weight="800">${rowIdx}</text>
                </svg>
            `;
        }

        function clearWorksheetSettings() {
            document.getElementById('ws-school-input').value = "TRACEWRITE HANDWRITING DRILL";
            document.getElementById('ws-style-select').value = "custom_name";
            document.getElementById('ws-cursive-select').value = "print";
            document.getElementById('ws-rows-select').value = "8"; 
            document.getElementById('ws-country-select').value = "IN";
             
            handleWorksheetStyleSelect();
            showToast("Options reset to default parameters.");
        }

        function applyEvergreenPreset(style, fontStyle, rows, country, customText = null) {
            toggleMilestonesModal();
            switchMode('worksheet');

            document.getElementById('ws-style-select').value = style;
            document.getElementById('ws-cursive-select').value = fontStyle;
            document.getElementById('ws-rows-select').value = rows;
            document.getElementById('ws-country-select').value = country;

            if (customText) {
                document.getElementById('ws-text-input').value = customText;
            }

            handleWorksheetStyleSelect();
            updateWorksheetPreview();
            showToast("Preset parameters configured successfully!");
        }

        // STREAMING_CHUNK: Bootstrapping application on window ready...
        document.addEventListener('DOMContentLoaded', () => {
            populateAlphabetGrids();
            switchMode('drill'); 
            loadMilestoneStates();
            refreshStickerShelfDisplay(); 
            pruneOldActivityLogs(); // automatically prune legacy data older than 15 days on mount

            document.getElementById('tracer-interactive-canvas')?.addEventListener('touchmove', (e) => {
                e.preventDefault();
            }, { passive: false });
        });