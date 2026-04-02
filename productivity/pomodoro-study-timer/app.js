/**
 * Pomodoro Study Timer - Core Logic
 * Includes Advanced features: Auto-start, Web Audio Synthesis (Alarms & Focus Sounds),
 * Browser Notifications, Screen Wake Lock API, and Keyboard Shortcuts.
 */

document.addEventListener('DOMContentLoaded', () => {
    let timerInterval;
    let isRunning = false;
    let currentMode = 'pomodoro'; // 'pomodoro', 'shortBreak', 'longBreak'
    let pomodoroCount = 0; // Tracks completed sessions for Long Break logic
    
    // --- Settings State Management ---
    let savedSettings = JSON.parse(localStorage.getItem('pomodoro_adv_settings')) || {};
    
    // Default fallback values
    const defaultSettings = {
        pomodoro: 25,
        shortBreak: 5,
        longBreak: 15,
        longBreakInterval: 4,
        autoStartBreak: false,
        autoStartPomodoro: false,
        alarmSound: 'bell',
        focusSound: 'none'
    };

    // Merge saved settings with defaults
    savedSettings = { ...defaultSettings, ...savedSettings };
    
    let timeLeft = savedSettings.pomodoro * 60; 

    // --- DOM Elements ---
    const display = document.getElementById('timer-display');
    const startPauseBtn = document.getElementById('start-pause-btn');
    const startPauseText = document.getElementById('start-pause-text');
    const playIcon = document.getElementById('play-icon');
    const resetBtn = document.getElementById('reset-btn');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const timerPulse = document.getElementById('timer-pulse');
    const counterDisplay = document.getElementById('pomodoro-counter');
    
    // Settings Elements
    const settingsModal = document.getElementById('settings-modal');
    const settingsBtn = document.getElementById('settings-btn');
    const closeSettingsX = document.getElementById('close-settings-x');
    const cancelSettingsBtn = document.getElementById('cancel-settings-btn');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    
    const inpPomodoro = document.getElementById('setting-pomodoro');
    const inpShort = document.getElementById('setting-short-break');
    const inpLong = document.getElementById('setting-long-break');
    const inpInterval = document.getElementById('setting-long-break-interval');
    const inpAutoBreak = document.getElementById('auto-start-break');
    const inpAutoPom = document.getElementById('auto-start-pomodoro');
    const selAlarm = document.getElementById('setting-alarm-sound');
    const selFocus = document.getElementById('setting-focus-sound');
    
    const orb1 = document.getElementById('orb-1');
    const orb2 = document.getElementById('orb-2');
    const orb3 = document.getElementById('orb-3');

    // Add UI Tooltips for Shortcuts automatically
    document.querySelector('[data-mode="pomodoro"]').title = "Pomodoro (Alt+P)";
    document.querySelector('[data-mode="shortBreak"]').title = "Short Break (Alt+S)";
    document.querySelector('[data-mode="longBreak"]').title = "Long Break (Alt+L)";
    startPauseBtn.title = "Start/Pause (Space)";
    settingsBtn.title = "Settings (Alt+O)";
    
    // --- DECIDE Integration ---
    const taskInput = document.getElementById('focus-task-input');
    try {
        const dbData = localStorage.getItem('decide_data_v1');
        if(dbData && taskInput) {
            const parsedDb = JSON.parse(dbData);
            const d = new Date();
            const today = d.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' });
            
            if (parsedDb[today] && parsedDb[today].priorities) {
                const priorities = parsedDb[today].priorities;
                const completed = parsedDb[today].completed || [false, false, false];
                let activeTask = priorities[0]; 
                for(let i=0; i<priorities.length; i++) {
                    if(!completed[i]) { activeTask = priorities[i]; break; }
                }
                if(activeTask && activeTask.trim() !== "") {
                    taskInput.value = activeTask;
                }
            }
        }
    } catch(e) { /* Standalone fallback */ }

    if(taskInput) taskInput.title = "Focus Task (T)";

    // --- PRO FEATURE 1: Browser Notifications ---
    function requestNotificationPermission() {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }

    function showNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '/js/favicon/android-chrome-192x192.png',
                vibrate: [200, 100, 200]
            });
        }
    }

    // --- PRO FEATURE 2: Screen Wake Lock API (Keep mobile screen ON) ---
    let wakeLock = null;
    async function requestWakeLock() {
        if ('wakeLock' in navigator) {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
            } catch (err) {
                console.log('Wake Lock error:', err.name, err.message);
            }
        }
    }

    function releaseWakeLock() {
        if (wakeLock !== null) {
            wakeLock.release().then(() => { wakeLock = null; });
        }
    }

    // Re-acquire wake lock if user switches tabs and comes back
    document.addEventListener('visibilitychange', async () => {
        if (wakeLock !== null && document.visibilityState === 'visible' && isRunning) {
            requestWakeLock();
        }
    });

    // --- Web Audio API Engine (Offline Sounds) ---
    let audioCtx;
    let focusNoiseNode;
    let focusFilterNode;

    function initAudio() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playAlarm(type) {
        if (type === 'none') return;
        initAudio();

        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (type === 'bell') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now);
            gainNode.gain.setValueAtTime(0.6, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
            osc.start(now);
            osc.stop(now + 1.5);
        } 
        else if (type === 'digital') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(600, now);
            gainNode.gain.setValueAtTime(0.3, now);
            for(let i=0; i<3; i++) {
                gainNode.gain.setValueAtTime(0.3, now + i*0.2);
                gainNode.gain.setValueAtTime(0, now + i*0.2 + 0.1);
            }
            osc.start(now);
            osc.stop(now + 0.6);
        }
        else if (type === 'kitchen') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            for(let i=0; i<10; i++) {
                gainNode.gain.setValueAtTime(0.2, now + i*0.1);
                gainNode.gain.setValueAtTime(0, now + i*0.1 + 0.05);
            }
            osc.start(now);
            osc.stop(now + 1);
        }
        else if (type === 'chime') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now);
            gainNode.gain.setValueAtTime(0.7, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 3);
            osc.start(now);
            osc.stop(now + 3);
        }
        else if (type === 'retro') {
            osc.type = 'square';
            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(554.37, now + 0.15);
            osc.frequency.setValueAtTime(659.25, now + 0.3);
            osc.frequency.setValueAtTime(880, now + 0.45);
            osc.start(now);
            osc.stop(now + 0.6);
        }
    }

    function startFocusSound(type) {
        if (type === 'none') return;
        initAudio();
        stopFocusSound(); 

        const bufferSize = audioCtx.sampleRate * 2; 
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1; 
        }

        focusNoiseNode = audioCtx.createBufferSource();
        focusNoiseNode.buffer = noiseBuffer;
        focusNoiseNode.loop = true;

        focusFilterNode = audioCtx.createBiquadFilter();
        
        if (type === 'rain') {
            focusFilterNode.type = 'lowpass';
            focusFilterNode.frequency.value = 400; 
        } else if (type === 'brown') {
            focusFilterNode.type = 'lowpass';
            focusFilterNode.frequency.value = 150; 
        } else if (type === 'pink') {
            focusFilterNode.type = 'lowpass';
            focusFilterNode.frequency.value = 600;
        } else {
            focusFilterNode.type = 'bandpass';
            focusFilterNode.frequency.value = 1000;
        }

        const gainNode = audioCtx.createGain();
        gainNode.gain.value = type === 'brown' ? 0.3 : 0.15; 

        focusNoiseNode.connect(focusFilterNode);
        focusFilterNode.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        focusNoiseNode.start();
    }

    function stopFocusSound() {
        if (focusNoiseNode) {
            try { focusNoiseNode.stop(); } catch(e){}
            focusNoiseNode.disconnect();
            focusNoiseNode = null;
        }
    }

    // --- Core Timer Logic ---

    function applySettingsToButtons() {
        document.querySelector('[data-mode="pomodoro"]').dataset.time = savedSettings.pomodoro;
        document.querySelector('[data-mode="shortBreak"]').dataset.time = savedSettings.shortBreak;
        document.querySelector('[data-mode="longBreak"]').dataset.time = savedSettings.longBreak;
    }
    
    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        display.textContent = formattedTime;
        
        let modeText = currentMode === 'pomodoro' ? 'Focus' : 'Break';
        document.title = `${formattedTime} - ${modeText} | Pomodoro`;
        
        counterDisplay.textContent = `#${pomodoroCount + 1} Focus Session`;
    }

    function switchMode(newMode) {
        currentMode = newMode;
        
        modeBtns.forEach(b => {
            b.classList.remove('active', 'bg-stone-900', 'text-white', 'border-stone-900', 'hover:bg-stone-800', 'shadow-[0_4px_14px_rgba(28,25,23,0.3)]');
            b.classList.add('bg-white/60', 'text-stone-600', 'border-white/80', 'hover:bg-white');
            if(b.dataset.mode === newMode) {
                b.classList.remove('bg-white/60', 'text-stone-600', 'border-white/80', 'hover:bg-white');
                b.classList.add('active', 'bg-stone-900', 'text-white', 'border-stone-900', 'hover:bg-stone-800', 'shadow-[0_4px_14px_rgba(28,25,23,0.3)]');
            }
        });

        orb1.className = "ambient-orb absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px]";
        orb2.className = "ambient-orb absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full blur-[100px]";
        orb3.className = "ambient-orb absolute top-[20%] right-[10%] w-[30vw] h-[30vw] rounded-full blur-[80px]";
        
        if (newMode === 'pomodoro') {
            orb1.classList.add('bg-stone-200/50'); orb2.classList.add('bg-orange-100/40'); orb3.classList.add('bg-rose-100/30');
        } else if (newMode === 'shortBreak') {
            orb1.classList.add('bg-blue-100/50'); orb2.classList.add('bg-cyan-100/40'); orb3.classList.add('bg-sky-100/30');
        } else if (newMode === 'longBreak') {
            orb1.classList.add('bg-green-100/50'); orb2.classList.add('bg-emerald-100/40'); orb3.classList.add('bg-teal-100/30');
        }

        resetTimer(savedSettings[newMode]);
    }

    function timerComplete() {
        clearInterval(timerInterval);
        isRunning = false;
        timerPulse.classList.remove('opacity-100');
        
        playAlarm(savedSettings.alarmSound);
        stopFocusSound();
        releaseWakeLock(); // Release screen lock when done

        // Flash screen logic
        document.body.style.backgroundColor = "#fee2e2"; 
        setTimeout(() => { document.body.style.backgroundColor = "var(--bg-color)"; }, 400);

        // Native Push Notification Trigger
        if (currentMode === 'pomodoro') {
            showNotification("Focus Session Complete!", "Great job! Time to take a break.");
        } else {
            showNotification("Break is Over!", "Time to get back to focus.");
        }

        // Automation & Flow Logic
        if (currentMode === 'pomodoro') {
            pomodoroCount++;
            let nextMode = (pomodoroCount % savedSettings.longBreakInterval === 0) ? 'longBreak' : 'shortBreak';
            switchMode(nextMode);
            
            if (savedSettings.autoStartBreak) {
                setTimeout(toggleTimer, 1500);
            }
        } else {
            switchMode('pomodoro');
            if (savedSettings.autoStartPomodoro) {
                setTimeout(toggleTimer, 1500);
            }
        }
    }

    function toggleTimer() {
        initAudio(); 
        requestNotificationPermission(); // Ask for notification permission on first interaction
        
        if (isRunning) {
            clearInterval(timerInterval);
            startPauseText.textContent = "Resume";
            playIcon.className = "fa-solid fa-play";
            timerPulse.classList.remove('opacity-100');
            stopFocusSound();
            releaseWakeLock(); // User paused, screen can sleep
        } else {
            timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateDisplay();
                } else {
                    timerComplete();
                }
            }, 1000);
            
            startPauseText.textContent = "Pause";
            playIcon.className = "fa-solid fa-pause";
            timerPulse.classList.add('opacity-100');
            requestWakeLock(); // Start timer, keep screen awake
            
            if (currentMode === 'pomodoro') {
                startFocusSound(savedSettings.focusSound);
            }
        }
        isRunning = !isRunning;
    }

    function resetTimer(newTime = null) {
        clearInterval(timerInterval);
        isRunning = false;
        startPauseText.textContent = currentMode === 'pomodoro' ? "Start Focus" : "Start Break";
        playIcon.className = "fa-solid fa-play";
        timerPulse.classList.remove('opacity-100');
        stopFocusSound();
        releaseWakeLock();
        
        if(newTime !== null) {
            timeLeft = newTime * 60;
        } else {
            timeLeft = savedSettings[currentMode] * 60;
        }
        updateDisplay();
    }

    // --- Event Listeners ---
    startPauseBtn.addEventListener('click', toggleTimer);
    resetBtn.addEventListener('click', () => resetTimer());

    modeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchMode(e.target.dataset.mode);
        });
    });

    // --- Settings Modal Logic ---
    function openSettings() {
        inpPomodoro.value = savedSettings.pomodoro;
        inpShort.value = savedSettings.shortBreak;
        inpLong.value = savedSettings.longBreak;
        inpInterval.value = savedSettings.longBreakInterval || 4; 
        inpAutoBreak.checked = savedSettings.autoStartBreak;
        inpAutoPom.checked = savedSettings.autoStartPomodoro;
        selAlarm.value = savedSettings.alarmSound;
        selFocus.value = savedSettings.focusSound;
        
        settingsModal.classList.add('modal-active');
    }

    function closeSettings() {
        settingsModal.classList.remove('modal-active');
    }

    function saveSettings() {
        const newPomodoro = parseInt(inpPomodoro.value);
        const newShort = parseInt(inpShort.value);
        const newLong = parseInt(inpLong.value);
        const newInterval = parseInt(inpInterval.value);

        if (newPomodoro > 0 && newShort > 0 && newLong > 0 && newInterval > 0) {
            savedSettings = {
                pomodoro: newPomodoro,
                shortBreak: newShort,
                longBreak: newLong,
                longBreakInterval: newInterval,
                autoStartBreak: inpAutoBreak.checked,
                autoStartPomodoro: inpAutoPom.checked,
                alarmSound: selAlarm.value,
                focusSound: selFocus.value
            };
            localStorage.setItem('pomodoro_adv_settings', JSON.stringify(savedSettings));
            applySettingsToButtons();
            
            playAlarm(savedSettings.alarmSound);
            
            resetTimer(); 
            closeSettings();
        } else {
            alert("Time and Interval values must be greater than 0.");
        }
    }

    settingsBtn.addEventListener('click', openSettings);
    closeSettingsX.addEventListener('click', closeSettings);
    cancelSettingsBtn.addEventListener('click', closeSettings);
    saveSettingsBtn.addEventListener('click', saveSettings);
    
    // --- KEYBOARD SHORTCUTS INTEGRATION ---
    document.addEventListener('keydown', (e) => {
        // Handling when Settings Modal is open
        if (settingsModal.classList.contains('modal-active')) {
            if (e.key === 'Escape') closeSettings();
            if (e.key === 'Enter') { e.preventDefault(); saveSettings(); }
            return;
        }

        // CRITICAL: Do NOT trigger shortcuts if user is typing in an input field
        const isInputFocused = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        if (isInputFocused) {
            // Allow user to escape out of the input field easily
            if (e.key === 'Escape') {
                e.target.blur();
            }
            return;
        }

        // Play/Pause on Spacebar (No modifier needed, industry standard)
        if (e.key === ' ' && !e.altKey && !e.ctrlKey && !e.metaKey) {
            e.preventDefault(); // Prevents page from scrolling down
            toggleTimer();
            return;
        }

        // Alt + Key combinations for App Commands
        if (e.altKey) {
            switch(e.key.toLowerCase()) {
                case 'p':
                    e.preventDefault();
                    switchMode('pomodoro');
                    break;
                case 's':
                    e.preventDefault();
                    switchMode('shortBreak');
                    break;
                case 'l':
                    e.preventDefault();
                    switchMode('longBreak');
                    break;
                case 't':
                    e.preventDefault();
                    if(taskInput) taskInput.focus();
                    break;
                case 'o':
                    e.preventDefault();
                    openSettings();
                    break;
            }
        }
    });

    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeSettings();
    });

    // --- Initialization ---
    applySettingsToButtons();
    updateDisplay();
});
