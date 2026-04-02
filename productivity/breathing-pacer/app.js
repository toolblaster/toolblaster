document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration & State ---
    const programs = {
        box: { name: 'Box Breathing (4-4-4-4)', pattern: [4, 4, 4, 4] },
        relaxing: { name: 'Relaxing (4-7-8)', pattern: [4, 7, 8, 0] },
        equal: { name: 'Equal Breathing (4-4)', pattern: [4, 0, 4, 0] },
        measured: { name: 'Measured (4-1-7)', pattern: [4, 1, 7, 0] },
        triangle: { name: 'Triangle (4-4-4)', pattern: [4, 0, 4, 4] },
        hrv: { name: 'HRV Resonance (5-7)', pattern: [5, 0, 7, 0] },
        custom: { name: 'Custom Pattern', pattern: [4, 4, 4, 4] } // Naya Custom program add kiya
    };

    const phaseNames = ["Inhale", "Hold", "Exhale", "Hold"];
    const phaseColors = ["blue", "stone", "teal", "stone"]; // For glow

    let isActive = false;
    let currentTimer = null;
    let sessionEndTimer = null;
    
    // State
    let currentProgram = 'box';
    let currentPattern = programs.box.pattern;
    let phaseIndex = 0;
    let phaseTimeLeft = 0;
    let completedCycles = 0; // Navin variable cycles track karnyasaathi
    
    let useVoice = false;
    let useBell = true;
    let useVib = true;
    let useCountdown = true; // Naya Countdown state
    let sessionDuration = 0; // 0 means endless
    let sessionStartTime = 0;

    // --- DOM Elements ---
    const circle = document.getElementById('breathing-circle');
    const glow = document.getElementById('breathing-circle-glow');
    const counterDisp = document.getElementById('seconds-counter');
    const instruction = document.getElementById('instruction-text');
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn'); // Naya Reset Button
    const cycleCounterContainer = document.getElementById('cycle-counter-container'); // Navin Container for Laps
    const cycleCounterEl = document.getElementById('cycle-counter'); // Navin Laps Text
    
    const settingsModal = document.getElementById('settings-modal');
    const progSelect = document.getElementById('setting-program');
    
    // Naye custom inputs DOM mein cache kiye gaye
    const customSettingsDiv = document.getElementById('custom-pattern-settings');
    const customInhale = document.getElementById('custom-inhale');
    const customHold1 = document.getElementById('custom-hold1');
    const customExhale = document.getElementById('custom-exhale');
    const customHold2 = document.getElementById('custom-hold2');
    
    const durSelect = document.getElementById('setting-duration');
    const toggleCountdownInput = document.getElementById('toggle-countdown'); // Naya Countdown Input
    const progNameDisplay = document.getElementById('current-program-name');
    const countdownOverlay = document.getElementById('countdown-overlay');
    const countdownNumber = document.getElementById('countdown-number');
    
    const sessionTimerDisplay = document.getElementById('session-timer-display');
    const sessionTimeLeftDisplay = document.getElementById('session-time-left');

    // --- Audio Engine ---
    let audioCtx = null;
    function playBell() {
        if (!useBell) return;
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.frequency.setValueAtTime(432, audioCtx.currentTime); // Calming frequency
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 3);
    }

    function playVoice(text) {
        if (!useVoice || !('speechSynthesis' in window)) return;
        
        // AUDIO SYNC FIX: Force-cancel previous delayed voice to keep new phase perfectly synced
        window.speechSynthesis.cancel();
        
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.9;
        u.pitch = 0.9;
        window.speechSynthesis.speak(u);
    }

    // --- Settings Logic ---
    document.getElementById('settings-btn').addEventListener('click', () => {
        // Settings kholte waqt existing state inputs me show karein
        toggleCountdownInput.checked = useCountdown;
        settingsModal.classList.add('modal-active');
    });
    
    document.getElementById('close-settings-x').addEventListener('click', () => settingsModal.classList.remove('modal-active'));
    
    // Agar user custom select karta hai toh inputs show/hide karne ka logic
    progSelect.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            customSettingsDiv.classList.remove('hidden');
        } else {
            customSettingsDiv.classList.add('hidden');
        }
    });

    document.getElementById('save-settings-btn').addEventListener('click', () => {
        currentProgram = progSelect.value;
        
        // Custom program ke liye values inputs se read karo
        if (currentProgram === 'custom') {
            const i = parseInt(customInhale.value) || 4;
            const h1 = parseInt(customHold1.value) || 0;
            const e = parseInt(customExhale.value) || 4;
            const h2 = parseInt(customHold2.value) || 0;
            
            programs.custom.pattern = [i, h1, e, h2];
            programs.custom.name = `Custom (${i}-${h1}-${e}-${h2})`;
        }
        
        currentPattern = programs[currentProgram].pattern;
        sessionDuration = parseInt(durSelect.value);
        
        useCountdown = toggleCountdownInput.checked; // Countdown state save karo
        useVoice = document.getElementById('toggle-voice').checked;
        useBell = document.getElementById('toggle-bell').checked;
        useVib = document.getElementById('toggle-vibration').checked;
        
        progNameDisplay.textContent = programs[currentProgram].name;
        
        settingsModal.classList.remove('modal-active');
        if (isActive) stopSession(); // Reset if running
    });

    // --- Core Logic ---
    function updateUIForPhase(isStart = false) {
        instruction.textContent = phaseNames[phaseIndex];
        counterDisp.textContent = phaseTimeLeft;

        // Update Highlight Labels
        document.querySelectorAll('.phase-label').forEach(l => l.classList.remove('step-active'));
        document.getElementById(`phase-${phaseIndex}`)?.classList.add('step-active');

        // Update Glow Color
        glow.className = `absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full blur-2xl transition-all duration-1000 bg-${phaseColors[phaseIndex]}-400/20`;

        // Handle Animation & Voice only at the START of a phase
        if (isStart) {
            playVoice(phaseNames[phaseIndex]);
            if (useVib && navigator.vibrate) navigator.vibrate(40);

            // Dynamic CSS Transition
            circle.style.transitionDuration = `${currentPattern[phaseIndex]}s`;
            
            if (phaseIndex === 0) { // Inhale
                circle.classList.remove('exhale');
                circle.classList.add('inhale');
            } else if (phaseIndex === 2) { // Exhale
                circle.classList.remove('inhale');
                circle.classList.add('exhale');
            }
            // Holds do not change the scale class, they just stay at 1.1 or 0.5
        }
    }

    function tick() {
        // Check Session Timer
        if (sessionDuration > 0) {
            const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
            const left = sessionDuration - elapsed;
            if (left <= 0) {
                stopSession(true);
                return;
            }
            const m = Math.floor(left / 60);
            const s = left % 60;
            sessionTimeLeftDisplay.textContent = `${m}:${s.toString().padStart(2,'0')} left`;
        }

        // Phase Timer Logic
        if (phaseTimeLeft > 1) {
            phaseTimeLeft--;
            counterDisp.textContent = phaseTimeLeft;
        } else {
            // Move to next valid phase
            let oldPhaseIndex = phaseIndex;
            do {
                phaseIndex = (phaseIndex + 1) % 4;
            } while (currentPattern[phaseIndex] === 0); // Skip 0s phases (like hold in 4-7-8)
            
            // Cycle completion check (Agar index wrap round houn 0 kiva tyahun kami zala)
            if (phaseIndex <= oldPhaseIndex) {
                completedCycles++;
                if (cycleCounterEl) cycleCounterEl.textContent = completedCycles;
            }
            
            phaseTimeLeft = currentPattern[phaseIndex];
            updateUIForPhase(true);
        }
    }

    // Ek common variable countdown interval ke liye
    let cdTimer = null; 

    // Function banaya taaki direct start kar sakein
    function startActualSession() {
        // Initialize first phase
        phaseIndex = 0; 
        phaseTimeLeft = currentPattern[0];
        
        // Reset cycles on new session start
        completedCycles = 0; 
        if (cycleCounterEl) cycleCounterEl.textContent = '0';
        
        sessionStartTime = Date.now();
        
        if (sessionDuration > 0) sessionTimerDisplay.classList.remove('hidden');
        
        updateUIForPhase(true);
        currentTimer = setInterval(tick, 1000);
    }

    function startCountdownAndRun() {
        isActive = true;
        
        // UI updates for Start
        startBtn.textContent = "Stop Session";
        startBtn.classList.replace('bg-stone-900', 'bg-red-500');
        startBtn.classList.replace('border-stone-800', 'border-red-600');
        
        // Reset button ko enable karna
        resetBtn.disabled = false;
        resetBtn.classList.remove('text-stone-400', 'cursor-not-allowed');
        resetBtn.classList.add('text-stone-600', 'hover:text-stone-900', 'hover:bg-white', 'active:scale-95');
        
        // AUDIO WARM-UP FIX: Wake up voice engine to prevent delay on 1st phase
        if (useVoice && 'speechSynthesis' in window) {
            const warmup = new SpeechSynthesisUtterance('');
            warmup.volume = 0;
            window.speechSynthesis.speak(warmup);
        }

        if (useCountdown) {
            countdownOverlay.classList.remove('hidden');
            let count = 3;
            countdownNumber.textContent = count;
            playBell();

            cdTimer = setInterval(() => {
                count--;
                if (count > 0) {
                    countdownNumber.textContent = count;
                } else {
                    clearInterval(cdTimer);
                    countdownOverlay.classList.add('hidden');
                    startActualSession();
                }
            }, 1000);
        } else {
            playBell();
            startActualSession();
        }
    }

    function stopSession(completed = false) {
        isActive = false;
        clearInterval(currentTimer);
        clearInterval(cdTimer); // Agar user countdown ke beech mein hi stop daba de
        countdownOverlay.classList.add('hidden'); // Overlay hatana
        
        phaseIndex = 0;
        phaseTimeLeft = 0;
        counterDisp.textContent = "0";
        
        if (completed) {
            instruction.textContent = "Session Complete";
            playBell();
            if (useVoice && 'speechSynthesis' in window) {
                window.speechSynthesis.speak(new SpeechSynthesisUtterance("Session complete. Great job."));
            }
        } else {
            instruction.textContent = "Ready?";
        }
        
        // UI updates for Stop
        startBtn.textContent = "Start Session";
        startBtn.classList.replace('bg-red-500', 'bg-stone-900');
        startBtn.classList.replace('border-red-600', 'border-stone-800');
        
        // Reset button ko wapas disable karna
        resetBtn.disabled = true;
        resetBtn.classList.add('text-stone-400', 'cursor-not-allowed');
        resetBtn.classList.remove('text-stone-600', 'hover:text-stone-900', 'hover:bg-white', 'active:scale-95');
        
        circle.style.transitionDuration = '1s';
        circle.classList.remove('inhale', 'exhale');
        sessionTimerDisplay.classList.add('hidden');
        
        document.querySelectorAll('.phase-label').forEach(l => l.classList.remove('step-active'));
        document.getElementById('phase-0')?.classList.add('step-active');
    }

    // Navin Restart Logic
    function restartSession() {
        if (isActive) {
            stopSession(false); // Pehle purana session clear karein
            setTimeout(() => {
                startCountdownAndRun(); // Phir naya session start karein
            }, 300); // 300ms ka delay smooth transition ke liye
        }
    }

    startBtn.addEventListener('click', () => {
        if (!isActive) startCountdownAndRun();
        else stopSession(false);
    });
    
    resetBtn.addEventListener('click', restartSession);
});