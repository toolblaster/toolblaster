// CORE CONFIGURATIONS
let activeGradeLevel = 1;
let selectedSprintTimerSeconds = 60;
let drillTimerId = null;
let drillCountdownSeconds = 0;
let activeScore = 0;
let totalQuestionsAsked = 0;
let activeCorrectAnswers = 0;
let currentSprintAnswer = "";
let currentSprintInputString = "";
let sprintStartTimeStamp = 0;
let currentMode = 'drill'; 
let currentCombo = 0; 

// GLOBAL STATES & NEW ALIGNMENTS
let currentCurriculum = 'CBSE'; 
let selectedAvatar = '🏃‍♂️'; 
let missedQuestionsThisRun = []; 
let printingCorrectionWorksheetOnly = false; 
let lastWorksheetConfig = ""; // Track worksheet math parameter changes to clear cache

// MULTI-STUDENT PROFILE SYSTEM
let studentsList = [];
let activeStudentId = 'guest';

// ADAPTIVE DIFFICULTY REAL-TIME ENGINE STATE
let dynamicGradeLevel = 1;
let adaptiveDampingAnswers = 0; // Number of questions solved in current adaptive adjustment step

// Web Audio API context
let audioCtx = null;
let cachedWorksheetQuestionsList = [];

const gradeDescriptions = {
    1: "Addition & Subtraction within 20. Simple numbers without carrying or borrowing.",
    3: "Numbers 1 to 100. Double-digit carrying additions, and single-digit times tables.",
    4: "Holding times tables up to 20. Division equations without remainders.",
    5: "Triple-digit additions, double-digit multiplications, and large-range divisions."
};

// --- AUDIO & VOICE SYNTHESIS ENGINE ---
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playCorrectSound() {
    if (document.getElementById('sound-toggle-select').value !== 'on') return;
    initAudio();
    if (!audioCtx) return;
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
    osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); 
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);
    osc1.start();
    osc2.start();
    osc1.stop(audioCtx.currentTime + 0.35);
    osc2.stop(audioCtx.currentTime + 0.35);
}

function playIncorrectSound() {
    if (document.getElementById('sound-toggle-select').value !== 'on') return;
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
}

function playHeartbeatSound() {
    if (document.getElementById('sound-toggle-select').value !== 'on') return;
    initAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.exponentialRampToValueAtTime(10, now + 0.12);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
}

function speakText(txt) {
    if (document.getElementById('voice-toggle-select').value !== 'on' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(txt);
    utterance.rate = 1.05;
    utterance.pitch = 1.15; 
    window.speechSynthesis.speak(utterance);
}

// --- VISUAL Dopamine Confetti Particle Engine ---
let confettiParticles = [];
let isConfettiActive = false;
let confettiAnimationId = null;

function startConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    confettiParticles = [];
    isConfettiActive = true;
    for (let i = 0; i < 75; i++) {
        confettiParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height,
            size: Math.random() * 6 + 4,
            color: `hsl(${Math.random() * 360}, 80%, 60%)`,
            speedX: Math.random() * 4 - 2,
            speedY: Math.random() * 3 + 2,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5
        });
    }

    function animateConfetti() {
        if (!isConfettiActive) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confettiParticles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.rotation += p.rotationSpeed;
            if (p.y > canvas.height) {
                p.y = -10;
                p.x = Math.random() * canvas.width;
            }
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });
        confettiAnimationId = requestAnimationFrame(animateConfetti);
    }
    animateConfetti();
}

// Clean memory before new bursts
function stopConfetti() {
    isConfettiActive = false;
    if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
}

function startComboSparkleConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    confettiParticles = [];
    isConfettiActive = true;
    for (let i = 0; i < 60; i++) {
        confettiParticles.push({
            x: canvas.width / 2,
            y: canvas.height * 0.7,
            size: Math.random() * 8 + 4,
            color: `hsl(${Math.random() * 60 + 30}, 100%, 65%)`, 
            speedX: Math.random() * 10 - 5,
            speedY: Math.random() * -8 - 4,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 15 - 7
        });
    }

    function animateSparkles() {
        if (!isConfettiActive) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confettiParticles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.speedY += 0.2; 
            p.rotation += p.rotationSpeed;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            for (let j = 0; j < 5; j++) {
                ctx.lineTo(0, -p.size);
                ctx.rotate(Math.PI / 5);
                ctx.lineTo(0, -p.size / 3);
                ctx.rotate(Math.PI / 5);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });
        confettiAnimationId = requestAnimationFrame(animateSparkles);
        setTimeout(() => { stopConfetti(); }, 1500);
    }
    animateSparkles();
}

// --- MULTI-STANDARD CURRICULUM SELECTOR ---
function selectCurriculum(currCode) {
    currentCurriculum = currCode;
    const dropdown = document.getElementById('curriculum-selector');
    if (dropdown && dropdown.value !== currCode) {
        dropdown.value = currCode;
    }
    const title = document.getElementById('grade-selection-title');
    const g1 = document.getElementById('grade-label-1');
    const g2 = document.getElementById('grade-label-2');
    const g3 = document.getElementById('grade-label-3');
    const g4 = document.getElementById('grade-label-4');

    if (currCode === 'CBSE') {
        title.textContent = "Choose Academic Class Level:";
        g1.textContent = "Class 1 & 2"; g2.textContent = "Class 3"; g3.textContent = "Class 4"; g4.textContent = "Class 5";
    } else if (currCode === 'ICSE') {
        title.textContent = "Choose Standard Benchmark:";
        g1.textContent = "Standard 1-2"; g2.textContent = "Standard 3"; g3.textContent = "Standard 4"; g4.textContent = "Standard 5";
    } else { 
        title.textContent = "Choose Common Core Grade Level:";
        g1.textContent = "Grade 1 & 2"; g2.textContent = "Grade 3"; g3.textContent = "Grade 4"; g4.textContent = "Grade 5";
    }
}

function selectRacerAvatar(emojiCode, cardId) {
    const card = document.getElementById(cardId);
    if (card && card.classList.contains('locked')) {
        showToast("This avatar is locked! Raise your highest scores to unlock.");
        return;
    }
    selectedAvatar = emojiCode;
    document.querySelectorAll('#avatars-group > button').forEach(c => {
        c.classList.remove('selected', 'bg-red-50/50');
        c.classList.add('bg-white');
    });
    if (card) {
        card.classList.add('selected');
        card.classList.remove('bg-white');
    }
    document.getElementById('runner-emoji').textContent = emojiCode;
}

function evaluateAvatarUnlocks() {
    let activeHistory = getActiveStudentHistory();
    const avOwl = document.getElementById('av-owl');
    const avTurtle = document.getElementById('av-turtle');
    const avRocket = document.getElementById('av-rocket');
    const avRobot = document.getElementById('av-robot');

    let bestScore = 0;
    let totalRuns = activeHistory.length;
    let maxAcc = 0;

    activeHistory.forEach(run => {
        if (run.score > bestScore) bestScore = run.score;
        if (run.accuracy > maxAcc) maxAcc = run.accuracy;
    });

    if (avOwl) {
        if (totalRuns >= 1) avOwl.classList.remove('locked');
        else avOwl.classList.add('locked');
    }
    if (avTurtle) {
        if (bestScore >= 50) avTurtle.classList.remove('locked');
        else avTurtle.classList.add('locked');
    }
    if (avRocket) {
        if (bestScore >= 120) avRocket.classList.remove('locked');
        else avRocket.classList.add('locked');
    }
    if (avRobot) {
        if (maxAcc >= 90 && totalRuns >= 1) avRobot.classList.remove('locked');
        else avRobot.classList.add('locked');
    }

    let instructions = "Unlock naye avatars by raising your high scores!";
    if (totalRuns === 0) {
        instructions = "🔒 Complete 1st run to unlock Einstein Owl 🦉";
    } else if (bestScore < 50) {
        instructions = "🔒 Score 50+ points to unlock Speedy Turtle 🐢";
    } else if (bestScore < 120) {
        instructions = "🔒 Score 120+ points to unlock Rocket 🚀";
    } else if (maxAcc < 90) {
        instructions = "🔒 Achieve 90%+ accuracy in any run to unlock Robo-Pi 🤖";
    } else {
        instructions = "🎉 Congratulations! All avatars unlocked.";
    }
    document.getElementById('avatar-unlock-instructions').textContent = instructions;
}

// --- MATHEMATICS EXTREME GENERATOR ENGINE ---
function generateMathProblem(grade, allowedOps) {
    if (!allowedOps || allowedOps.length === 0) allowedOps = ['+', '-'];
    const op = allowedOps[Math.floor(Math.random() * allowedOps.length)];
    let x = 0, y = 0, ans = "";

    // Dynamic Decimals, Fractions, and Percentages routing
    if (op === 'frac') {
        const denom = Math.floor(Math.random() * 6) + 3; 
        const num1 = Math.floor(Math.random() * (denom - 1)) + 1;
        const num2 = Math.floor(Math.random() * (denom - num1)) + 1;
        const action = Math.random() > 0.5 ? '+' : '-';
        if (action === '+') {
            ans = `${num1 + num2}/${denom}`;
            return { text: `${num1}/${denom} + ${num2}/${denom}`, answer: ans };
        } else {
            const largerNum = Math.max(num1, num2);
            const smallerNum = Math.min(num1, num2);
            ans = `${largerNum - smallerNum}/${denom}`;
            return { text: `${largerNum}/${denom} - ${smallerNum}/${denom}`, answer: ans };
        }
    } else if (op === 'dec') {
        x = parseFloat((Math.random() * 8 + 1).toFixed(1));
        y = parseFloat((Math.random() * 5 + 1).toFixed(1));
        const action = Math.random() > 0.5 ? '+' : '-';
        if (action === '+') {
            ans = (x + y).toFixed(1);
            return { text: `${x} + ${y}`, answer: ans };
        } else {
            const larger = Math.max(x, y);
            const smaller = Math.min(x, y);
            ans = (larger - smaller).toFixed(1);
            return { text: `${larger} - ${smaller}`, answer: ans };
        }
    } else if (op === 'perc') {
        const percentageOptions = [10, 20, 25, 50, 75];
        const pct = percentageOptions[Math.floor(Math.random() * percentageOptions.length)];
        const total = (Math.floor(Math.random() * 8) + 1) * (pct === 25 ? 40 : 20); 
        ans = Math.round((pct / 100) * total).toString();
        return { text: `${pct}% of ${total}`, answer: ans };
    }

    // Traditional Integer Arithmetic
    if (grade === 1) {
        if (op === '+') {
            do {
                x = Math.floor(Math.random() * 15) + 1;
                y = Math.floor(Math.random() * 9) + 1;
            } while ((x % 10) + y >= 10 || x + y > 20);
            ans = (x + y).toString();
        } else if (op === '-') {
            do {
                x = Math.floor(Math.random() * 16) + 5; 
                y = Math.floor(Math.random() * 9) + 1;
            } while (x < y || (x % 10) < y);
            ans = (x - y).toString();
        } else if (op === '*') {
            x = Math.floor(Math.random() * 5) + 1;
            y = 2;
            ans = (x * y).toString();
        } else {
            const temp = Math.floor(Math.random() * 5) + 1;
            y = 2;
            x = temp * y;
            ans = temp.toString();
        }
    } else if (grade === 3) {
        if (op === '+') {
            x = Math.floor(Math.random() * 70) + 10;
            y = Math.floor(Math.random() * 70) + 10;
            ans = (x + y).toString();
        } else if (op === '-') {
            x = Math.floor(Math.random() * 90) + 10;
            y = Math.floor(Math.random() * (x - 5)) + 5;
            ans = (x - y).toString();
        } else if (op === '*') {
            x = Math.floor(Math.random() * 8) + 2; 
            y = Math.floor(Math.random() * 8) + 2;
            ans = (x * y).toString();
        } else {
            y = Math.floor(Math.random() * 8) + 2;
            const temp = Math.floor(Math.random() * 8) + 2;
            x = temp * y;
            ans = temp.toString();
        }
    } else if (grade === 4) {
        if (op === '+') {
            x = Math.floor(Math.random() * 400) + 100;
            y = Math.floor(Math.random() * 400) + 100;
            ans = (x + y).toString();
        } else if (op === '-') {
            x = Math.floor(Math.random() * 800) + 200;
            y = Math.floor(Math.random() * (x - 50)) + 50;
            ans = (x - y).toString();
        } else if (op === '*') {
            x = Math.floor(Math.random() * 11) + 2; 
            y = Math.floor(Math.random() * 11) + 2;
            ans = (x * y).toString();
        } else {
            y = Math.floor(Math.random() * 11) + 2;
            const temp = Math.floor(Math.random() * 11) + 2;
            x = temp * y;
            ans = temp.toString();
        }
    } else { 
        if (op === '+') {
            x = Math.floor(Math.random() * 800) + 100;
            y = Math.floor(Math.random() * 800) + 100;
            ans = (x + y).toString();
        } else if (op === '-') {
            x = Math.floor(Math.random() * 1500) + 500;
            y = Math.floor(Math.random() * (x - 100)) + 100;
            ans = (x - y).toString();
        } else if (op === '*') {
            x = Math.floor(Math.random() * 20) + 11; 
            y = Math.floor(Math.random() * 10) + 3;  
            ans = (x * y).toString();
        } else {
            y = Math.floor(Math.random() * 15) + 3;
            const temp = Math.floor(Math.random() * 20) + 5;
            x = temp * y;
            ans = temp.toString();
        }
    }

    const opSymbols = { '+': '+', '-': '-', '*': '×', '/': '÷' };
    return {
        text: `${x} ${opSymbols[op]} ${y}`,
        answer: ans
    };
}

// Switch modes with clean, perfectly aligned styling transitions
function switchMode(mode) {
    currentMode = mode;
    stopConfetti();
    if (drillTimerId) clearInterval(drillTimerId);

    const toolCard = document.getElementById('main-tool-card');

    // Accessibly update button state classes & selected tags
    document.getElementById('tab-drill').className = `mode-tab text-center py-2 text-[10px] sm:text-xs font-extrabold rounded-lg transition-all ${mode === 'drill' ? 'active bg-red-800 text-white shadow-md' : 'text-stone-700 hover:text-stone-900 bg-transparent'} relative group`;
    document.getElementById('tab-worksheet').className = `mode-tab text-center py-2 text-[10px] sm:text-xs font-extrabold rounded-lg transition-all ${mode === 'worksheet' ? 'active bg-red-800 text-white shadow-md' : 'text-stone-700 hover:text-stone-900 bg-transparent'} relative group`;
    document.getElementById('tab-dashboard').className = `mode-tab text-center py-2 text-[10px] sm:text-xs font-extrabold rounded-lg transition-all ${mode === 'dashboard' ? 'active bg-red-800 text-white shadow-md' : 'text-stone-700 hover:text-stone-900 bg-transparent'} relative group`;

    document.getElementById('tab-drill').setAttribute('aria-selected', mode === 'drill' ? 'true' : 'false');
    document.getElementById('tab-worksheet').setAttribute('aria-selected', mode === 'worksheet' ? 'true' : 'false');
    document.getElementById('tab-dashboard').setAttribute('aria-selected', mode === 'dashboard' ? 'true' : 'false');

    document.getElementById('drill-mode-panel').classList.toggle('hidden', mode !== 'drill');
    document.getElementById('worksheet-mode-panel').classList.toggle('hidden', mode !== 'worksheet');
    document.getElementById('dashboard-mode-panel').classList.toggle('hidden', mode !== 'dashboard');

    if (mode === 'worksheet') {
        if (toolCard) {
            toolCard.classList.remove('max-w-2xl');
            toolCard.classList.add('max-w-[1080px]');
        }
        updateWorksheetPreview();
    } else if (mode === 'dashboard') {
        if (toolCard) {
            toolCard.classList.remove('max-w-2xl');
            toolCard.classList.add('max-w-[1080px]');
        }
        renderDashboard();
    } else {
        if (toolCard) {
            toolCard.classList.remove('max-w-[1080px]');
            toolCard.classList.add('max-w-2xl');
        }
        resetSprintDrill();
    }
}

// Toggle Consolidated Settings Modal with Strict Dual Scroll Lock
function toggleConsolidatedSettings() {
    const modal = document.getElementById('settings-modal');
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

function closeSettingsOnClickOutside(event) {
    const modal = document.getElementById('settings-modal');
    const modalContent = document.getElementById('settings-modal-content');
    if (modal && modalContent && !modalContent.contains(event.target)) {
        toggleConsolidatedSettings();
    }
}

// --- DRILL PLAY GAMEPLAY LOGIC ---
function selectSprintGrade(grade) {
    activeGradeLevel = grade;
    dynamicGradeLevel = grade; // Sync adaptive initial state
    adaptiveDampingAnswers = 0;
    document.querySelectorAll('.grade-btn').forEach(btn => {
        btn.classList.remove('bg-red-800', 'text-white', 'border-red-800');
        btn.classList.add('bg-white', 'text-stone-700', 'border-stone-300');
    });

    const activeIdx = { 1: 0, 3: 1, 4: 2, 5: 3 };
    const selectedBtn = document.querySelectorAll('.grade-btn')[activeIdx[grade]];
    if (selectedBtn) {
        selectedBtn.classList.remove('bg-white', 'text-stone-700');
        selectedBtn.classList.add('bg-red-800', 'text-white', 'border-red-800');
    }

    document.getElementById('grade-sprint-desc').textContent = gradeDescriptions[grade];
}

// --- WORKSPACE INITIALIZATION & HISTORY CHECKS ---
function startSprintDrill() {
    initAudio();
    stopConfetti();
    
    const activeOps = [];
    document.querySelectorAll('#drill-operators-group input:checked').forEach(cb => {
        activeOps.push(cb.value);
    });

    if (activeOps.length === 0) {
        showToast("Please choose at least one mathematics operation.");
        return;
    }

    // Release scroll locks explicitly
    const modal = document.getElementById('settings-modal');
    if (modal && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
    }

    selectedSprintTimerSeconds = parseInt(document.getElementById('timer-select').value) || 60;
    drillCountdownSeconds = selectedSprintTimerSeconds;
    activeScore = 0;
    totalQuestionsAsked = 0;
    activeCorrectAnswers = 0;
    currentSprintInputString = "";
    currentCombo = 0; 
    missedQuestionsThisRun = []; 
    dynamicGradeLevel = activeGradeLevel; 
    adaptiveDampingAnswers = 0;

    document.getElementById('live-combo-badge').textContent = "0 Hits";
    document.getElementById('live-combo-badge').className = "text-sm font-black text-stone-700 mt-0.5";
    document.getElementById('live-combo-fire').classList.add('hidden');
    document.getElementById('live-accuracy-badge').textContent = "100%";
    document.getElementById('live-accuracy-badge').className = "text-sm font-black text-stone-700 mt-0.5";
    document.getElementById('hud-combo-card').className = "bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 flex items-center justify-between transition-all duration-200 shadow-sm";
    document.getElementById('hud-accuracy-card').className = "bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 flex items-center justify-between transition-all duration-200 shadow-sm";
    document.getElementById('live-hud-message').textContent = "Focus & build your combo! 🚀";
    document.getElementById('live-hud-message').className = "text-center text-[11px] font-bold text-blue-700 h-5 mb-1 transition-all leading-tight";
    document.getElementById('adaptive-alert-hud').classList.add('hidden');

    document.getElementById('drill-setup-screen').classList.add('hidden');
    document.getElementById('drill-report-screen').classList.add('hidden');
    document.getElementById('drill-active-screen').classList.remove('hidden');

    document.getElementById('drill-points-disp').textContent = activeScore;
    document.getElementById('drill-time-disp').textContent = `${drillCountdownSeconds}s`;
    document.getElementById('drill-progress').style.width = '100%';
    updateRunnerPosition(100);

    nextSprintQuestion(activeOps);
    sprintStartTimeStamp = Date.now();

    if (drillTimerId) clearInterval(drillTimerId);
    drillTimerId = setInterval(() => {
        drillCountdownSeconds--;
        document.getElementById('drill-time-disp').textContent = `${drillCountdownSeconds}s`;
        
        const pct = (drillCountdownSeconds / selectedSprintTimerSeconds) * 100;
        document.getElementById('drill-progress').style.width = `${pct}%`;
        updateRunnerPosition(pct);

        if (drillCountdownSeconds <= 10 && drillCountdownSeconds > 0) {
            playHeartbeatSound();
        }

        if (drillCountdownSeconds <= 0) {
            clearInterval(drillTimerId);
            endSprintDrill();
        }
    }, 1000);
}

function updateRunnerPosition(percentage) {
    const runner = document.getElementById('runner-emoji');
    if (runner) {
        runner.style.transform = `translateX(-${(100 - percentage) * 0.9}%)`;
    }
}

function nextSprintQuestion(activeOps) {
    currentSprintInputString = "";
    const inputField = document.getElementById('drill-input-field');
    if (inputField) {
        inputField.value = "";
        inputField.placeholder = "?";
        inputField.className = "bg-stone-50 px-4 py-2 rounded-xl border border-stone-200 font-extrabold text-stone-900 text-2xl shadow-inner w-44 text-center focus:outline-none focus:ring-2 focus:ring-red-800 transition-all";
        inputField.focus(); 
    }

    const problem = generateMathProblem(dynamicGradeLevel, activeOps);
    document.getElementById('drill-equation').textContent = `${problem.text} = ?`;
    currentSprintAnswer = problem.answer;

    let spokenEq = problem.text.replace('+', 'plus').replace('-', 'minus').replace('*', 'times').replace('/', 'divided by');
    speakText(`${spokenEq} equals?`);
}

function pressNumpad(key) {
    if (key === 'back') {
        currentSprintInputString = currentSprintInputString.slice(0, -1);
    } else if (key === 'clear') {
        currentSprintInputString = "";
    } else if (key === 'submit') {
        submitSprintAnswer();
        return;
    } else {
        if (currentSprintInputString.length < 8) {
            currentSprintInputString += key;
        }
    }
    const inputField = document.getElementById('drill-input-field');
    if (inputField) {
        inputField.value = currentSprintInputString;
    }
}

function submitSprintAnswer() {
    const typedVal = document.getElementById('drill-input-field').value.trim();
    if (typedVal !== "") {
        currentSprintInputString = typedVal;
    }
    if (currentSprintInputString === "") return;
    totalQuestionsAsked++;
    adaptiveDampingAnswers++;

    const val = currentSprintInputString; 
    const inputField = document.getElementById('drill-input-field');
    const equationCard = document.getElementById('drill-equation-card');
    const comboCard = document.getElementById('hud-combo-card');
    const accuracyCard = document.getElementById('hud-accuracy-card');
    const liveMessage = document.getElementById('live-hud-message');
    const comboBadge = document.getElementById('live-combo-badge');
    const comboFire = document.getElementById('live-combo-fire');
    const accuracyBadge = document.getElementById('live-accuracy-badge');

    const currentEqText = document.getElementById('drill-equation').textContent.replace(' = ?', '');

    if (val === currentSprintAnswer) {
        activeCorrectAnswers++;
        activeScore += 10;
        currentCombo++; 

        let comboBonus = 0;
        if (currentCombo >= 3) {
            comboBonus = Math.min(20, (currentCombo - 2) * 5); 
            activeScore += comboBonus;
        }

        document.getElementById('drill-points-disp').textContent = activeScore;
        playCorrectSound();

        const encouragements = ["Excellent!", "Awesome!", "Spot on!", "Perfect!"];
        const pick = encouragements[Math.floor(Math.random() * encouragements.length)];
        speakText(pick);

        if (currentCombo === 1) {
            liveMessage.textContent = "Nice hit! Keep it up! 🎯";
            liveMessage.className = "text-center text-[11px] font-bold text-emerald-600 h-5 mb-1";
        } else if (currentCombo === 3) {
            liveMessage.textContent = "Triple Combo! 🔥 You are on fire!";
            liveMessage.className = "text-center text-[11px] font-extrabold text-orange-600 h-5 mb-1 scale-105 transition-all";
        } else if (currentCombo >= 5) {
            liveMessage.textContent = `Unstoppable! 🔥 x${currentCombo} Combo (+${comboBonus} bonus!)`;
            liveMessage.className = "text-center text-[11px] font-black text-red-700 h-5 mb-1 scale-110 transition-all";
            if (currentCombo % 5 === 0) {
                startComboSparkleConfetti();
            }
        } else {
            liveMessage.textContent = `Combo Streak: ${currentCombo} active! ⚡`;
            liveMessage.className = "text-center text-[11px] font-bold text-emerald-700 h-5 mb-1";
        }

        comboBadge.textContent = `${currentCombo} Hits`;
        if (currentCombo >= 3) {
            comboCard.className = "bg-orange-50 border-orange-300 rounded-xl px-3 py-2 flex items-center justify-between transition-all duration-200 scale-105 shadow-sm";
            comboBadge.className = "text-sm font-black text-orange-700 mt-0.5";
            comboFire.classList.remove('hidden');
            comboFire.style.transform = `scale(${1 + currentCombo * 0.05})`;
        } else {
            comboCard.className = "bg-emerald-50 border-emerald-200 rounded-xl px-3 py-2 flex items-center justify-between transition-all duration-200 shadow-sm";
            comboBadge.className = "text-sm font-black text-emerald-700 mt-0.5";
        }

        if (inputField) {
            inputField.className = "bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-300 font-black text-emerald-955 text-2xl shadow-inner w-44 text-center focus:outline-none transition-all";
        }
        if (equationCard) {
            equationCard.className = "bg-white border border-emerald-400 shadow-lg rounded-2xl py-8 px-6 text-center mb-5 relative z-10 transition-all duration-150 scale-[1.01]";
        }
    } else {
        playIncorrectSound();
        speakText("Focus on the next one!");
        
        missedQuestionsThisRun.push({
            text: currentEqText,
            answer: currentSprintAnswer,
            userVal: val
        });

        if (currentCombo >= 3) {
            liveMessage.textContent = `Combo Broke at ${currentCombo}! Focus & win the next Redemption! 💥`;
            liveMessage.className = "text-center text-[11px] font-bold text-red-600 h-5 mb-1 transition-all";
        } else {
            liveMessage.textContent = "Incorrect! Get ready to crush the next one! ⚡";
            liveMessage.className = "text-center text-[11px] font-bold text-stone-700 h-5 mb-1 transition-all";
        }

        currentCombo = 0; 
        comboBadge.textContent = "0 Hits";
        comboBadge.className = "text-sm font-black text-stone-700 mt-0.5";
        comboCard.className = "bg-red-50 border-red-200 rounded-xl px-3 py-2 flex items-center justify-between transition-all duration-200 shadow-sm";
        comboFire.classList.add('hidden');

        if (inputField) {
            inputField.className = "bg-red-100 px-4 py-2 rounded-xl border border-red-300 font-black text-red-955 text-2xl shadow-inner w-44 text-center focus:outline-none transition-all";
        }
        if (equationCard) {
            equationCard.className = "bg-white border border-red-400 shadow-lg rounded-2xl py-8 px-6 text-center mb-5 relative z-10 transition-all duration-150 shake-element";
            setTimeout(() => {
                equationCard.classList.remove('shake-element');
            }, 400);
        }
    }

    // Real-time Accuracy tracking
    const liveAcc = Math.round((activeCorrectAnswers / totalQuestionsAsked) * 100);
    accuracyBadge.textContent = `${liveAcc}%`;
    if (liveAcc >= 90) {
        accuracyCard.className = "bg-blue-50 border-blue-200 rounded-xl px-3 py-2 flex items-center justify-between transition-all duration-200 shadow-sm";
        accuracyBadge.className = "text-sm font-black text-blue-800 mt-0.5";
    } else if (liveAcc >= 70) {
        accuracyCard.className = "bg-amber-50 border-amber-200 rounded-xl px-3 py-2 flex items-center justify-between transition-all duration-200 shadow-sm";
        accuracyBadge.className = "text-sm font-black text-amber-800 mt-0.5";
    } else {
        accuracyCard.className = "bg-red-50 border-red-100 rounded-xl px-3 py-2 flex items-center justify-between transition-all duration-200 shadow-sm";
        accuracyBadge.className = "text-sm font-black text-red-800 mt-0.5";
    }

    // Real-time ADAPTIVE DIFFICULTY ENGINE Algorithm
    const adaptiveAlert = document.getElementById('adaptive-alert-hud');
    if (adaptiveDampingAnswers >= 4) {
        adaptiveDampingAnswers = 0; 
        if (liveAcc >= 90 && dynamicGradeLevel < 5) {
            const oldLvl = dynamicGradeLevel;
            if (dynamicGradeLevel === 1) dynamicGradeLevel = 3;
            else if (dynamicGradeLevel === 3) dynamicGradeLevel = 4;
            else if (dynamicGradeLevel === 4) dynamicGradeLevel = 5;
            
            if (dynamicGradeLevel !== oldLvl) {
                adaptiveAlert.textContent = `🔥 Level Up! Questions got harder! (Class ${dynamicGradeLevel})`;
                adaptiveAlert.classList.remove('hidden');
                speakText("Level up! Dynamic calculation steps increased.");
            }
        } else if (liveAcc < 60 && dynamicGradeLevel > 1) {
            const oldLvl = dynamicGradeLevel;
            if (dynamicGradeLevel === 5) dynamicGradeLevel = 4;
            else if (dynamicGradeLevel === 4) dynamicGradeLevel = 3;
            else if (dynamicGradeLevel === 3) dynamicGradeLevel = 1;

            if (dynamicGradeLevel !== oldLvl) {
                adaptiveAlert.textContent = `⚡ Adapting... Getting easier! (Class ${dynamicGradeLevel})`;
                adaptiveAlert.classList.remove('hidden');
                speakText("Pacing adjusted.");
            }
        } else {
            adaptiveAlert.classList.add('hidden');
        }
    }

    const activeOps = [];
    document.querySelectorAll('#drill-operators-group input:checked').forEach(cb => {
        activeOps.push(cb.value);
    });

    setTimeout(() => {
        if (drillCountdownSeconds > 0) {
            nextSprintQuestion(activeOps);
            if (equationCard) {
                equationCard.className = "bg-white border border-stone-200 shadow-inner rounded-2xl py-8 px-6 text-center mb-5 relative z-10 transition-all duration-150";
            }
        }
    }, 350);
}

function endSprintDrill() {
    const typedVal = document.getElementById('drill-input-field').value.trim();
    if (typedVal !== "" && typedVal !== currentSprintInputString) {
        currentSprintInputString = typedVal;
        submitSprintAnswer();
    }

    document.getElementById('drill-active-screen').classList.add('hidden');
    document.getElementById('drill-report-screen').classList.remove('hidden');

    const accuracy = totalQuestionsAsked > 0 ? Math.round((activeCorrectAnswers / totalQuestionsAsked) * 100) : 0;
    const durationUsed = selectedSprintTimerSeconds;
    const avgSpeed = activeCorrectAnswers > 0 ? parseFloat((durationUsed / activeCorrectAnswers).toFixed(1)) : 0;

    document.getElementById('stat-correct').textContent = `${activeCorrectAnswers} Correct`;
    document.getElementById('stat-accuracy').textContent = `${accuracy}%`;
    document.getElementById('stat-speed').textContent = `${avgSpeed}s`;

    const redemptionCard = document.getElementById('redemption-analysis-card');
    const weaknessText = document.getElementById('weakness-alert-text');
    const redemptionList = document.getElementById('redemption-list');

    if (missedQuestionsThisRun.length === 0) {
        redemptionCard.className = "bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-left space-y-2.5 shadow-sm";
        weaknessText.textContent = "🏆 FLAWLESS RUN! No weaknesses spotted. Student solved every question correctly!";
        weaknessText.className = "text-xs text-emerald-955 font-bold leading-relaxed bg-emerald-100 p-2.5 rounded-lg border border-emerald-200";
        document.getElementById('redemption-list-container').classList.add('hidden');
        document.getElementById('targeted-print-btn').classList.add('hidden');
    } else {
        redemptionCard.className = "bg-amber-50 border border-amber-200 p-4 rounded-xl text-left space-y-2.5 shadow-sm";
        document.getElementById('redemption-list-container').classList.remove('hidden');
        document.getElementById('targeted-print-btn').classList.remove('hidden');

        let weakSpot = "Math drill completed.";
        const hasSub = missedQuestionsThisRun.some(q => q.text.includes('-'));
        const hasAdd = missedQuestionsThisRun.some(q => q.text.includes('+'));
        const hasMult = missedQuestionsThisRun.some(q => q.text.includes('×'));
        const hasDiv = missedQuestionsThisRun.some(q => q.text.includes('÷'));
        const hasFrac = missedQuestionsThisRun.some(q => q.text.includes('/'));

        if (hasFrac) {
            weakSpot = "💡 Parents Alert: Fractions logic concepts and same-denominator arithmetic require targeted study.";
        } else if (hasSub && activeGradeLevel >= 3) {
            weakSpot = "💡 Parents Alert: Student is struggling with double-digit Subtractions carrying/borrowing limits.";
        } else if (hasMult) {
            weakSpot = "💡 Parents Alert: Multiplication tables/speed need targeted practice.";
        } else if (hasDiv) {
            weakSpot = "💡 Parents Alert: Division calculations / remainders concept needs review.";
        } else if (hasAdd) {
            weakSpot = "💡 Parents Alert: Multi-digit carrying Additions need focused standard practice.";
        } else {
            weakSpot = "💡 Concept Spotted: General speed limits or typing errors spotted. Recommend standard revision.";
        }

        weaknessText.textContent = weakSpot;
        weaknessText.className = "text-xs text-amber-955 font-semibold leading-relaxed bg-amber-100 p-2.5 rounded-lg border border-amber-200";

        redemptionList.innerHTML = '';
        missedQuestionsThisRun.forEach(q => {
            const row = document.createElement('div');
            row.className = "flex justify-between items-center text-xs border-b border-stone-150 py-1 font-bold";
            row.innerHTML = `
                <span class="text-stone-850">${q.text} = </span>
                <div class="space-x-1.5 flex items-center">
                    <span class="text-red-750 bg-red-50 px-1.5 py-0.2 rounded border">Entered: ${q.userVal}</span>
                    <span class="text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border">Correct: ${q.answer}</span>
                </div>
            `;
            redemptionList.appendChild(row);
        });
    }

    saveRunToHistory(activeScore, activeCorrectAnswers, totalQuestionsAsked, accuracy, avgSpeed, activeGradeLevel);

    const gradeBanner = document.getElementById('drill-performance-grade');
    if (activeCorrectAnswers >= 15 && accuracy >= 85) {
        gradeBanner.textContent = "🏆 EXCELLENT! High Accuracy & Pace. Target achieved.";
        gradeBanner.className = "p-3 border rounded-xl font-bold text-xs bg-emerald-100 border-emerald-300 text-emerald-955";
        startConfetti();
    } else if (activeCorrectAnswers >= 8 && accuracy >= 70) {
        gradeBanner.textContent = "👍 GOOD PACING. Keep practicing to increase computation accuracy.";
        gradeBanner.className = "p-3 border rounded-xl font-bold text-xs bg-blue-100 border-blue-300 text-blue-950";
    } else {
        gradeBanner.textContent = "💡 FOCUS TARGET. Set simpler difficulty benchmarks and re-train.";
        gradeBanner.className = "p-3 border rounded-xl font-bold text-xs bg-amber-100 border-amber-300 text-amber-955";
    }
}

function resetSprintDrill() {
    stopConfetti();
    if (drillTimerId) clearInterval(drillTimerId);
    document.getElementById('drill-report-screen').classList.add('hidden');
    document.getElementById('drill-active-screen').classList.add('hidden');
    document.getElementById('drill-setup-screen').classList.remove('hidden');
}

// --- PRINT TARGETED REDEMPTION SHEET ---
function printCorrectionWorksheet() {
    if (missedQuestionsThisRun.length === 0) return;
    printingCorrectionWorksheetOnly = true;

    const schoolName = "TARGETED REDEMPTION WORKSHEET";
    const grade = activeGradeLevel;

    const docHTML = generateWorksheetHTML(schoolName, grade, missedQuestionsThisRun, false, true);
    document.getElementById('screen-worksheet-preview').innerHTML = docHTML;

    const printHTML = generateWorksheetHTML(schoolName, grade, missedQuestionsThisRun, true, true);
    document.getElementById('print-sheet').innerHTML = printHTML;

    window.print();
    printingCorrectionWorksheetOnly = false;
}

// --- WORKSHEET MAKER CORE ENGINE ---
function handleWorksheetGradeSelect() {
    const grade = parseInt(document.getElementById('ws-grade-select').value) || 3;
    const addCheck = document.querySelector('#ws-operators-group input[value="+"]');
    const subCheck = document.querySelector('#ws-operators-group input[value="-"]');
    const fillCheck = document.querySelector('#ws-operators-group input[value="*"]');
    const divCheck = document.querySelector('#ws-operators-group input[value="/"]');

    if (grade === 1) {
        addCheck.checked = true; subCheck.checked = true;
        fillCheck.checked = false; divCheck.checked = false;
    } else {
        addCheck.checked = true; subCheck.checked = true;
        fillCheck.checked = true; divCheck.checked = true;
    }
    updateWorksheetPreview();
}

function shuffleWorksheet() {
    cachedWorksheetQuestionsList = [];
    updateWorksheetPreview();
}

function updateWorksheetPreview() {
    if (printingCorrectionWorksheetOnly) return; 
    
    const schoolName = document.getElementById('ws-school-input').value.trim() || "MATHEMATICS PACER HOME DRILL";
    const grade = parseInt(document.getElementById('ws-grade-select').value) || 3;
    const count = parseInt(document.getElementById('ws-count-select').value) || 40;
    const topic = document.getElementById('ws-topic-select').value;
    const showAnswersOnScreen = document.getElementById('ws-show-answers')?.checked || false;

    let activeOps = [];
    document.querySelectorAll('#ws-operators-group input:checked').forEach(cb => {
        activeOps.push(cb.value);
    });

    // Adjust operators dynamically if specialized topic chosen
    if (topic === 'fractions_basic') activeOps = ['frac'];
    else if (topic === 'decimals_basic') activeOps = ['dec'];

    // Clear cache if key mathematical parameters have changed
    const currentConfigKey = `${grade}_${count}_${topic}_${activeOps.join(',')}`;
    if (lastWorksheetConfig !== currentConfigKey) {
        cachedWorksheetQuestionsList = [];
        lastWorksheetConfig = currentConfigKey;
    }

    if (activeOps.length === 0) {
        document.getElementById('screen-worksheet-preview').innerHTML = `<p class="text-center text-red-700 font-bold p-10">Choose at least one math operation from options panel.</p>`;
        return;
    }

    if (cachedWorksheetQuestionsList.length !== count) {
        cachedWorksheetQuestionsList = [];
        for (let i = 0; i < count; i++) {
            cachedWorksheetQuestionsList.push(generateMathProblem(grade, activeOps));
        }
    }

    const docHTML = generateWorksheetHTML(schoolName, grade, cachedWorksheetQuestionsList, false, showAnswersOnScreen);
    document.getElementById('screen-worksheet-preview').innerHTML = docHTML;

    const printHTML = generateWorksheetHTML(schoolName, grade, cachedWorksheetQuestionsList, true, true);
    document.getElementById('print-sheet').innerHTML = printHTML;
}

function generateWorksheetHTML(school, grade, questions, isForPhysicalPrint, showAnswersOnScreen) {
    let html = '';
    const setsCount = parseInt(document.getElementById('ws-sets-select').value) || 1;
    const colsClass = "grid grid-cols-2 gap-x-12 gap-y-5";
    const fontScale = isForPhysicalPrint ? "text-sm" : "text-xs";
    const dateString = new Date().toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'});

    for (let setIdx = 1; setIdx <= setsCount; setIdx++) {
        const setLetter = String.fromCharCode(64 + setIdx); // A, B, C...
        const titleSlab = setsCount > 1 ? `${school} — Set ${setLetter}` : school;

        // PAGE 1: Question paper
        html += `
            <div class="worksheet-page text-black font-serif relative py-4 ${setIdx > 1 ? 'page-break' : ''}">
                <div class="text-center border-b-2 border-black pb-3 mb-4">
                    <h1 class="text-base sm:text-lg font-bold uppercase tracking-wider">${titleSlab}</h1>
                    <p class="text-xs font-semibold uppercase tracking-wider mt-0.5">Academic Evaluation Sheet — Class ${grade}</p>
                </div>

                <!-- Student Info Meta indicators -->
                <div class="grid grid-cols-2 gap-4 text-xs font-bold mb-6 border-b pb-3">
                    <div>STUDENT NAME: ___________________________</div>
                    <div class="text-right">DATE: _______________________</div>
                    <div>SCHOOL UNIT: ____________________________</div>
                    <div class="text-right">ACCURACY SCORE: _________ / ${questions.length}</div>
                </div>

                <!-- Structured grid layout with dots avoiding underscores breaking -->
                <div class="${colsClass} ${fontScale} py-2 mb-8">
        `;

        questions.forEach((q, idx) => {
            html += `
                <div class="flex items-center justify-between border-b border-dashed border-stone-200 pb-1 w-full min-w-0">
                    <span class="font-extrabold text-stone-900 whitespace-nowrap mr-2">${idx + 1}) &nbsp;&nbsp; ${q.text} &nbsp;=</span>
                    <div class="flex-grow border-b border-dotted border-stone-400 mx-2 h-4"></div>
                </div>
            `;
        });

        html += `
                </div>

                <!-- Subtle watermark footer -->
                <div class="pt-2 border-t border-stone-300 flex justify-between items-center text-[10px] text-stone-700 font-sans mt-auto print:absolute print:bottom-0 print:left-0 print:right-0">
                    <span>Generated on <strong class="text-stone-900 font-bold">toolblaster.com</strong> - MathSprint Learning Suite</span>
                    <span>Printed: ${dateString}</span>
                </div>
            </div>
        `;

        // PAGE 2: Match Answer Key (Show if printing OR if user toggled on-screen show option)
        if (isForPhysicalPrint || showAnswersOnScreen) {
            html += `
                <div class="page-break border-t-2 border-dashed border-stone-400 my-8 pt-8 print:border-none print:my-0 print:pt-0"></div>
                <div class="worksheet-page text-black font-serif relative mt-4 print:mt-0 py-4">
                    <div class="text-center border-b-2 border-black pb-3 mb-4">
                        <h2 class="text-base font-bold uppercase tracking-wider">Answer Key Verification Sheet — Set ${setLetter}</h2>
                        <p class="text-xs font-semibold uppercase tracking-wider mt-0.5">Strictly for parent or teacher evaluations</p>
                    </div>

                    <div class="${colsClass} ${fontScale} py-2 mb-8">
            `;

            questions.forEach((q, idx) => {
                html += `
                    <div class="flex items-center justify-between border-b border-stone-200 pb-1 w-full min-w-0">
                        <span class="font-bold text-stone-850 mr-2">${idx + 1}) &nbsp;&nbsp; ${q.text} &nbsp;=</span>
                        <span class="font-black text-red-800 tracking-wider text-xs">${q.answer}</span>
                    </div>
                `;
            });

            html += `
                    </div>

                    <!-- Subtle watermark footer -->
                    <div class="pt-2 border-t border-stone-300 flex justify-between items-center text-[10px] text-stone-700 font-sans mt-auto print:absolute print:bottom-0 print:left-0 print:right-0">
                        <span>Generated on <strong class="text-stone-900 font-bold">toolblaster.com</strong> - Answer Verification Key</span>
                        <span>Printed: ${dateString}</span>
                    </div>
                </div>
            `;
        }
    }

    return html;
}

function showToast(msg) {
    const toast = document.getElementById('notification-toast');
    if (toast) {
        toast.textContent = msg;
        toast.className = "fixed bottom-5 left-1/2 -translate-x-1/2 bg-stone-900 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xl z-[2000] show transition-all duration-300";
        setTimeout(() => {
            toast.className = "hidden";
        }, 3000);
    }
}

// --- TEACHER & CLASS PROFILE MANAGER DATABASE ---
function loadStudentsData() {
    try {
        studentsList = JSON.parse(localStorage.getItem('mathsprint_students')) || [];
        activeStudentId = localStorage.getItem('mathsprint_active_student') || 'guest';
    } catch(e) {
        studentsList = [];
        activeStudentId = 'guest';
    }

    // Sync dynamic visual badges
    updateActiveStudentHeader();
}

function saveStudentsData() {
    localStorage.setItem('mathsprint_students', JSON.stringify(studentsList));
    localStorage.setItem('mathsprint_active_student', activeStudentId);
    updateActiveStudentHeader();
}

function updateActiveStudentHeader() {
    const badge = document.getElementById('active-student-badge');
    if (activeStudentId === 'guest') {
        if (badge) badge.textContent = "🏃‍♂️ Guest Student";
    } else {
        const s = studentsList.find(item => item.id === activeStudentId);
        if (s && badge) badge.textContent = `🏃‍♂️ ${s.name}`;
    }
}

function addStudentProfile() {
    const input = document.getElementById('new-student-name');
    const name = input.value.trim();
    if (!name) {
        showToast("Please enter a valid student name.");
        return;
    }

    const newStudent = {
        id: Math.random().toString(36).substr(2, 9),
        name: name,
        history: []
    };

    studentsList.push(newStudent);
    saveStudentsData();
    input.value = '';
    showToast(`Student profile '${name}' added!`);
    renderDashboard();
}

function selectActiveStudent(studentId) {
    activeStudentId = studentId;
    saveStudentsData();
    showToast("Switched active profile!");
    
    // Reload historical achievements dashboard immediately
    loadProgressFromStorage();
    renderDashboard();
}

function deleteStudentProfile(id) {
    studentsList = studentsList.filter(s => s.id !== id);
    if (activeStudentId === id) activeStudentId = 'guest';
    saveStudentsData();
    showToast("Student profile removed.");
    loadProgressFromStorage();
    renderDashboard();
}

function getActiveStudentHistory() {
    if (activeStudentId === 'guest') {
        try {
            return JSON.parse(localStorage.getItem('mathsprint_guest_history')) || [];
        } catch(e) { return []; }
    } else {
        const s = studentsList.find(item => item.id === activeStudentId);
        return s ? s.history : [];
    }
}

function saveActiveStudentHistory(history) {
    if (activeStudentId === 'guest') {
        localStorage.setItem('mathsprint_guest_history', JSON.stringify(history));
    } else {
        const idx = studentsList.findIndex(s => s.id === activeStudentId);
        if (idx > -1) {
            studentsList[idx].history = history;
            saveStudentsData();
        }
    }
}

// --- DASHBOARD ANALYTICAL DATA ENGINE ---
function renderDashboard() {
    const body = document.getElementById('dashboard-students-body');
    if (!body) return;
    body.innerHTML = '';

    // 1. Add Guest Student Roster row
    const guestHistory = getGuestHistoryDirectly();
    let guestBest = 0, guestTotalAcc = 0;
    let guestTotalSpeed = 0;
    guestHistory.forEach(run => {
        if (run.score > guestBest) guestBest = run.score;
        guestTotalAcc += run.accuracy;
        guestTotalSpeed += run.speed;
    });
    let guestAvgAcc = guestHistory.length > 0 ? Math.round(guestTotalAcc / guestHistory.length) : 0;
    let guestAvgSpeed = guestHistory.length > 0 ? (guestTotalSpeed / guestHistory.length).toFixed(1) : '0';

    const guestRow = document.createElement('tr');
    guestRow.className = `border-b ${activeStudentId === 'guest' ? 'bg-red-50/50' : 'hover:bg-stone-50'}`;
    guestRow.innerHTML = `
        <td class="p-3 text-center">
            <input type="radio" name="activeStudentRadio" ${activeStudentId === 'guest' ? 'checked' : ''} onchange="selectActiveStudent('guest')" class="w-4 h-4 text-red-600 border-stone-300 focus:ring-red-500" aria-label="Select Guest Student">
        </td>
        <td class="p-3 font-extrabold text-stone-900">Guest Student (Unregistered)</td>
        <td class="p-3 text-center font-bold text-stone-700">${guestHistory.length} Runs</td>
        <td class="p-3 text-center font-bold text-amber-700">${guestBest} pts</td>
        <td class="p-3 text-center font-bold text-blue-900">${guestAvgAcc}%</td>
        <td class="p-3 text-center font-bold text-purple-955">${guestAvgSpeed}s</td>
        <td class="p-3 text-center text-stone-500 italic">Static Guest</td>
    `;
    body.appendChild(guestRow);

    // 2. Add Register student rosters
    studentsList.forEach(s => {
        let best = 0, totalAcc = 0;
        let totalSpeed = 0;
        s.history.forEach(run => {
            if (run.score > best) best = run.score;
            totalAcc += run.accuracy;
            totalSpeed += run.speed;
        });
        let avgAcc = s.history.length > 0 ? Math.round(totalAcc / s.history.length) : 0;
        let avgSpeed = s.history.length > 0 ? (totalSpeed / s.history.length).toFixed(1) : '0';

        const row = document.createElement('tr');
        row.className = `border-b ${activeStudentId === s.id ? 'bg-red-50/50' : 'hover:bg-stone-50'}`;
        row.innerHTML = `
            <td class="p-3 text-center">
                <input type="radio" name="activeStudentRadio" ${activeStudentId === s.id ? 'checked' : ''} onchange="selectActiveStudent('${s.id}')" class="w-4 h-4 text-red-600 border-stone-300 focus:ring-red-500" aria-label="Select ${s.name}">
            </td>
            <td class="p-3 font-extrabold text-stone-900">${s.name}</td>
            <td class="p-3 text-center font-bold text-stone-700">${s.history.length} Runs</td>
            <td class="p-3 text-center font-bold text-amber-700">${best} pts</td>
            <td class="p-3 text-center font-bold text-blue-900">${avgAcc}%</td>
            <td class="p-3 text-center font-bold text-purple-955">${avgSpeed}s</td>
            <td class="p-3 text-center">
                <button type="button" class="text-stone-500 hover:text-red-700 font-extrabold transition-all" onclick="deleteStudentProfile('${s.id}')">
                    Remove &times;
                </button>
            </td>
        `;
        body.appendChild(row);
    });
}

function getGuestHistoryDirectly() {
    try {
        return JSON.parse(localStorage.getItem('mathsprint_guest_history')) || [];
    } catch(e) { return []; }
}

function exportClassCSV() {
    let csvRows = [];
    csvRows.push(["Student Profile Name", "Runs Completed", "Highest Score achieved", "Average Accuracy", "Average Speed Per Question"]);

    // 1. Export guest
    const guestHistory = getGuestHistoryDirectly();
    let guestBest = 0, guestTotalAcc = 0, guestTotalSpeed = 0;
    guestHistory.forEach(run => {
        if (run.score > guestBest) guestBest = run.score;
        guestTotalAcc += run.accuracy;
        guestTotalSpeed += run.speed;
    });
    let guestAvgAcc = guestHistory.length > 0 ? Math.round(guestTotalAcc / guestHistory.length) : 0;
    let guestAvgSpeed = guestHistory.length > 0 ? (guestTotalSpeed / guestHistory.length).toFixed(1) : '0';
    csvRows.push(["Guest Student", guestHistory.length, guestBest, `${guestAvgAcc}%`, `${guestAvgSpeed}s`]);

    // 2. Export students
    studentsList.forEach(s => {
        let best = 0, totalAcc = 0, totalSpeed = 0;
        s.history.forEach(run => {
            if (run.score > best) best = run.score;
            totalAcc += run.accuracy;
            totalSpeed += run.speed;
        });
        let avgAcc = s.history.length > 0 ? Math.round(totalAcc / s.history.length) : 0;
        let avgSpeed = s.history.length > 0 ? (totalSpeed / s.history.length).toFixed(1) : '0';
        csvRows.push([s.name, s.history.length, best, `${avgAcc}%`, `${avgSpeed}s`]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Class_Performance_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Classroom metrics exported to CSV!");
}

// --- PROGRESSION & ACHIEVEMENTS SYSTEM ---
function loadProgressFromStorage() {
    loadStudentsData();
    let history = getActiveStudentHistory();

    let streak = parseInt(localStorage.getItem(`mathsprint_streak_${activeStudentId}`)) || 0;
    let lastPlayed = localStorage.getItem(`mathsprint_last_played_${activeStudentId}`) || '';
    let todayStr = new Date().toISOString().split('T')[0];

    if (lastPlayed) {
        let lastDate = new Date(lastPlayed);
        let todayDate = new Date(todayStr);
        let diffDays = Math.ceil(Math.abs(todayDate - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
            streak = 0;
            localStorage.setItem(`mathsprint_streak_${activeStudentId}`, 0);
        }
    }

    document.getElementById('user-streak-count').textContent = streak;
    document.getElementById('lifetime-runs').textContent = history.length;

    let bestScore = 0;
    let totalAccuracy = 0;
    history.forEach(run => {
        if (run.score > bestScore) bestScore = run.score;
        totalAccuracy += run.accuracy;
    });
    let avgAccuracy = history.length > 0 ? Math.round(totalAccuracy / history.length) : 0;

    document.getElementById('lifetime-best-score').textContent = bestScore;
    document.getElementById('lifetime-avg-accuracy').textContent = `${avgAccuracy}%`;

    renderBadges(history);
    evaluateAvatarUnlocks();
}

function evaluateUnlocks(history) {
    let unlocked = [];
    if (history.length >= 1) unlocked.push('badge-first');
    if (history.some(r => r.accuracy === 100 && r.total >= 8)) unlocked.push('badge-accuracy');
    if (history.some(r => r.speed > 0 && r.speed <= 2.0 && r.correct >= 8)) unlocked.push('badge-speed');
    if (history.some(r => r.grade === 5 && r.accuracy >= 80)) unlocked.push('badge-grandmaster');
    if (history.some(r => r.score >= 150)) unlocked.push('badge-points');
    if (history.length >= 5) unlocked.push('badge-streak');
    return unlocked;
}

function renderBadges(history) {
    const unlockedList = evaluateUnlocks(history);
    document.querySelectorAll('#badges-grid > div').forEach(b => {
        b.classList.add('locked-badge');
        b.classList.remove('unlocked-badge');
    });
    unlockedList.forEach(badgeId => {
        const el = document.getElementById(badgeId);
        if (el) {
            el.classList.remove('locked-badge');
            el.classList.add('unlocked-badge');
        }
    });
}

function saveRunToHistory(score, correct, total, accuracy, speed, grade) {
    let history = getActiveStudentHistory();
    const newRun = {
        id: Date.now(),
        score: score,
        correct: correct,
        total: total,
        accuracy: accuracy,
        speed: speed,
        grade: grade
    };

    history.push(newRun);
    saveActiveStudentHistory(history);

    let streak = parseInt(localStorage.getItem(`mathsprint_streak_${activeStudentId}`)) || 0;
    let lastPlayed = localStorage.getItem(`mathsprint_last_played_${activeStudentId}`) || '';
    let todayStr = new Date().toISOString().split('T')[0];

    if (lastPlayed !== todayStr) {
        if (lastPlayed) {
            let lastDate = new Date(lastPlayed);
            let todayDate = new Date(todayStr);
            let diffDays = Math.ceil(Math.abs(todayDate - lastDate) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) streak++;
            else if (diffDays > 1) streak = 1;
        } else {
            streak = 1;
        }
        localStorage.setItem(`mathsprint_streak_${activeStudentId}`, streak);
        localStorage.setItem(`mathsprint_last_played_${activeStudentId}`, todayStr);
    }

    let oldUnlocks = [];
    try {
        oldUnlocks = JSON.parse(localStorage.getItem(`mathsprint_unlocked_badges_${activeStudentId}`)) || [];
    } catch(e) { oldUnlocks = []; }

    let newUnlocks = evaluateUnlocks(history);
    let freshlyUnlocked = newUnlocks.filter(b => !oldUnlocks.includes(b));
    
    if (freshlyUnlocked.length > 0) {
        localStorage.setItem(`mathsprint_unlocked_badges_${activeStudentId}`, JSON.stringify(newUnlocks));
        freshlyUnlocked.forEach(badgeId => {
            triggerBadgeUnlockCelebration(badgeId);
        });
    }

    loadProgressFromStorage();
}

function triggerBadgeUnlockCelebration(badgeId) {
    const badgeDetails = {
        'badge-first': { name: 'Baby Steps 👣', desc: 'Completed your first dynamic speed sprint!' },
        'badge-accuracy': { name: 'Sharpshooter 🎯', desc: 'Achieved a perfect 100% accuracy run!' },
        'badge-speed': { name: 'Speed Demon ⚡', desc: 'Solved equations under 2 seconds per question!' },
        'badge-grandmaster': { name: 'Grandmaster 👑', desc: 'Completed Class 5 sprint with excellent accuracy!' },
        'badge-points': { name: 'Super Score 🔥', desc: 'Accumulated over 150 points in a single run!' },
        'badge-streak': { name: 'Elite Racer 📅', desc: 'Finished 5 full sprints to cement your math routine!' }
    };

    const b = badgeDetails[badgeId];
    if (!b) return;

    const alertDiv = document.createElement('div');
    alertDiv.className = "fixed inset-0 flex items-center justify-center bg-black/60 z-[3000] p-4";
    alertDiv.id = `unlock-popup-${badgeId}`;
    alertDiv.innerHTML = `
        <div class="bg-white rounded-3xl p-6 text-center max-w-sm w-full border-4 border-amber-400 shadow-2xl space-y-4 scale-95 transition-transform duration-300">
            <div class="text-5xl animate-bounce">🎉</div>
            <h3 class="text-sm font-black text-amber-600 uppercase tracking-widest leading-tight">Achievement Unlocked!</h3>
            <div class="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                <span class="text-3xl block mb-1">${b.name.split(' ').slice(1).join(' ') || '🏅'}</span>
                <span class="text-xs font-black text-stone-900 uppercase tracking-wide block">${b.name.split(' ')[0]}</span>
                <p class="text-[11px] text-stone-700 font-semibold mt-1">${b.desc}</p>
            </div>
            <button type="button" class="w-full bg-red-800 hover:bg-red-955 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl shadow-md transition-all active:scale-95" onclick="document.getElementById('unlock-popup-${badgeId}').remove()">
                AWESOME!
            </button>
        </div>
    `;
    document.body.appendChild(alertDiv);
    startConfetti();
    setTimeout(() => { stopConfetti(); }, 4000);
}

// --- NOSTALGIC WORKSPACE THEME TOGGLER ---
function changeWorkspaceTheme(themeName) {
    const body = document.body;
    body.className = "flex flex-col min-h-screen relative overflow-x-hidden"; 
    if (themeName === 'notebook') {
        body.classList.add('theme-notebook');
    }
    localStorage.setItem('mathsprint_theme', themeName);
}

// --- WHATSAPP REPORT CARD GENERATION ---
function shareWhatsAppReportCard() {
    const accuracy = totalQuestionsAsked > 0 ? Math.round((activeCorrectAnswers / totalQuestionsAsked) * 100) : 0;
    const streak = document.getElementById('user-streak-count').textContent || "0";
    
    let message = `🧮 *MathSprint Academic Drill Report*\n`;
    message += `--------------------------------------\n`;
    message += `👤 *Racer Avatar:* ${selectedAvatar}\n`;
    message += `🎯 *Academic Standard:* ${currentCurriculum} Class ${activeGradeLevel}\n`;
    message += `⭐ *Accuracy:* ${accuracy}% (${activeCorrectAnswers}/${totalQuestionsAsked} Correct)\n`;
    message += `⚡ *Streak Points:* ${activeScore} pts\n`;
    message += `🔥 *Active Daily Streak:* ${streak} Days\n\n`;
    message += `_Calculated securely on toolblaster.com_`;

    // Copy to clipboard
    navigator.clipboard.writeText(message).then(() => {
        showToast("🏆 WhatsApp Report Card text copied successfully! Open WhatsApp and paste it.");
    }).catch(err => {
        console.error("Clipboard copy failed:", err);
        showToast("Could not copy report card text.");
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Apply default saved theme or math notebook grid standard
    const savedTheme = localStorage.getItem('mathsprint_theme') || 'notebook';
    const themeSel = document.getElementById('theme-selector');
    if (themeSel) themeSel.value = savedTheme;
    changeWorkspaceTheme(savedTheme);

    selectSprintGrade(3); 
    loadProgressFromStorage(); 

    document.addEventListener('keydown', (e) => {
        if (currentMode === 'drill' && !document.getElementById('drill-active-screen').classList.contains('hidden')) {
            if (e.key === 'Enter') {
                submitSprintAnswer();
            } else if (e.key === 'Escape') {
                resetSprintDrill();
            }
        }
    });
});
