const DB_KEY='decide_data_v1', META_KEY='decide_meta_v1', THEME_KEY='decide_theme_v1', DRAFT_KEY='decide_drafts_v1';
const CURRENT_VERSION = 3; 
const ENABLE_V3 = true; 

const store = {
    data: {}, 
    meta: { version: 1, streak: 0, lastOpened: null, isPremium: false, v3Enabled: false, events: { yesterday: false, closure: false, weekly: false }, lastWeeklySummary: null },
    
    init() {
        try {
            // Safely parse Data
            const rD = localStorage.getItem(DB_KEY);
            if (rD) {
                const parsed = JSON.parse(rD);
                if (parsed && typeof parsed === 'object') this.data = parsed;
                localStorage.setItem(DB_KEY + '_bak', rD); 
            } else {
                const bD = localStorage.getItem(DB_KEY + '_bak');
                if (bD) {
                    const parsed = JSON.parse(bD);
                    if (parsed && typeof parsed === 'object') this.data = parsed;
                }
            }
            
            // Safely parse Meta
            const rM = localStorage.getItem(META_KEY);
            if (rM) {
                const parsed = JSON.parse(rM);
                if (parsed && typeof parsed === 'object') this.meta = parsed;
                localStorage.setItem(META_KEY + '_bak', rM);
            } else {
                const bM = localStorage.getItem(META_KEY + '_bak');
                if (bM) {
                    const parsed = JSON.parse(bM);
                    if (parsed && typeof parsed === 'object') this.meta = parsed;
                }
            }
        } catch (e) {
            // Fallback catch block with added object safety checks to prevent silent crash
            try {
                const bD = localStorage.getItem(DB_KEY + '_bak');
                if (bD) {
                    const parsed = JSON.parse(bD);
                    if (parsed && typeof parsed === 'object') this.data = parsed;
                }
                const bM = localStorage.getItem(META_KEY + '_bak');
                if (bM) {
                    const parsed = JSON.parse(bM);
                    if (parsed && typeof parsed === 'object') this.meta = parsed;
                }
            } catch (e2) {
                this.data = {};
            }
        }
        this.migrateData();
    },

    migrateData() {
        // Ultimate fallback to guarantee the app renders even if localStorage is fatally corrupted
        if (!this.meta || typeof this.meta !== 'object') {
            this.meta = { version: 1, streak: 0, lastOpened: null, isPremium: false, v3Enabled: false, events: { yesterday: false, closure: false, weekly: false }, lastWeeklySummary: null };
        }
        if (!this.data || typeof this.data !== 'object') {
            this.data = {};
        }

        if (!this.meta.version) this.meta.version = 1;
        
        if (this.meta.version < 2) {
            if (this.meta.v3Enabled === undefined) this.meta.v3Enabled = false;
            if (!this.meta.events) this.meta.events = { yesterday: false, closure: false, weekly: false };
            this.meta.version = 2;
        }
        if (this.meta.version < 3) {
            Object.keys(this.data).forEach(date => {
                if (!this.data[date].completed) {
                    this.data[date].completed = [false, false, false];
                }
            });
            this.meta.version = 3;
            this.save();
        }
    },

    save() {
        try {
            localStorage.setItem(DB_KEY, JSON.stringify(this.data));
            localStorage.setItem(META_KEY, JSON.stringify(this.meta));
        } catch (e) {
            console.error('Storage Save Failed:', e);
        }
    },

    getDraft() {
        try { 
            const draft = JSON.parse(localStorage.getItem(DRAFT_KEY));
            return Array.isArray(draft) ? draft : [];
        } catch { 
            return []; 
        }
    },
    saveDraft(draftArray) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftArray));
    },
    clearDraft() {
        localStorage.removeItem(DRAFT_KEY);
    },
    
    getLocalYMD(d=new Date()) { 
        return d.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' }); 
    },
    getToday() { const t = this.getLocalYMD(); return { date: t, entry: this.data[t] }; },
    getYesterday() { 
        const d = new Date(); d.setDate(d.getDate()-1); 
        const y = this.getLocalYMD(d); return { date: y, entry: this.data[y] }; 
    },
    
    saveDay(p) {
        const {date} = this.getToday();
        this.data[date] = { priorities: p, completed: [false, false, false], decidedAt: Date.now(), closure: null };
        
        if (this.meta.lastOpened) {
            const diffDays = Math.floor((new Date(date) - new Date(this.meta.lastOpened)) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                this.meta.streak++;
            } else if (diffDays > 1) {
                this.meta.streak = 1; 
            } 
        } else {
            this.meta.streak = 1;
        }

        this.meta.lastOpened = date; 
        this.save();
        this.checkV3Eligibility(); 
    },
    
    toggleTaskCompletion(index) {
        const { entry } = this.getToday();
        if (entry && entry.completed) {
            entry.completed[index] = !entry.completed[index];
            this.save();
        }
    },

    saveClosure(r) { const {date,entry}=this.getToday(); if(entry){ entry.closure=r; this.save(); } },
    
    trackEvent(eventName) {
        if (this.meta.events[eventName] === true) return;
        this.meta.events[eventName] = true;
        this.save();
        this.checkV3Eligibility();
    },
    
    checkV3Eligibility() {
        if (this.meta.v3Enabled) return; 
        const dates = Object.keys(this.data).sort();
        if (dates.length < 7) return;

        const first = new Date(dates[0]);
        const last = new Date(dates[dates.length - 1]);
        const diffDays = Math.ceil(Math.abs(last - first) / (1000 * 60 * 60 * 24)); 
        if (diffDays < 6) return; 

        const e = this.meta.events;
        if (e.yesterday && e.closure && e.weekly) {
            this.meta.v3Enabled = true;
            this.meta.isPremium = true; 
            this.save();
        }
    }
};

const ui = {
    renderedDate: null,
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.render();
        
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                document.title = "DECIDE. | Daily Priority Tool for Focus";
                const currentYMD = store.getLocalYMD();
                if (this.renderedDate && this.renderedDate !== currentYMD) {
                    this.render();
                }
            } else {
                const { entry } = store.getToday();
                if (entry && entry.priorities && entry.priorities[0] && !this.isEditing) {
                    document.title = `🎯 1. ${entry.priorities[0]}`;
                }
            }
        });
    },
    cacheDOM() {
        this.dom = {
            dateDisplay: document.getElementById('current-date-display'),
            greetingLabel: document.getElementById('greeting-label'),
            form: document.getElementById('priority-form'),
            inputs: [document.getElementById('p1'), document.getElementById('p2'), document.getElementById('p3')],
            mainBtn: document.getElementById('main-action-btn'),
            trustBadges: document.getElementById('trust-badges'),
            streakMsg: document.getElementById('streak-msg'),
            readonlyView: document.getElementById('readonly-view'),
            readonlyList: document.getElementById('readonly-list'),
            yesterdaySection: document.getElementById('yesterday-section'),
            yesterdayList: document.getElementById('yesterday-list'),
            closureSection: document.getElementById('closure-section'),
            footerStatus: document.getElementById('footer-status'),
            statusText: document.getElementById('status-text-container'),
            controls: document.getElementById('footer-controls'),
            themeBtn: document.getElementById('theme-toggle'),
            editBtn: document.getElementById('edit-btn'),
            copyBtn: document.getElementById('copy-btn'),
            copyText: document.getElementById('copy-text'),
            editModal: document.getElementById('edit-modal'),
            cancelEdit: document.getElementById('cancel-edit-btn'),
            confirmEdit: document.getElementById('confirm-edit-btn'),
            exportModal: document.getElementById('export-options-modal'),
            closeExport: document.getElementById('export-close-btn'),
            exportJsonBtn: document.getElementById('export-json'),
            importJsonInput: document.getElementById('import-json'),
            introBlock: document.getElementById('intro-block') 
        };
    },
    bindEvents() {
        this.dom.themeBtn?.addEventListener('click', () => this.toggleTheme());
        this.dom.form?.addEventListener('submit', (e) => this.handleSubmit(e));
        
        this.dom.inputs.forEach((input, index) => {
            input?.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault(); 
                    if (index < 2) {
                        this.dom.inputs[index + 1]?.focus();
                    } else {
                        this.handleSubmit(new Event('submit', { cancelable: true }));
                    }
                }
            });
            input?.addEventListener('input', () => {
                if (!this.isEditing) store.saveDraft(this.dom.inputs.map(i => i?.value || ''));
            });
        });

        this.dom.editBtn?.addEventListener('click', () => this.enterEditMode()); 
        this.dom.copyBtn?.addEventListener('click', () => this.copyToClipboard());
        this.dom.cancelEdit?.addEventListener('click', () => this.dom.editModal?.classList.remove('modal-active'));
        this.dom.confirmEdit?.addEventListener('click', () => this.enterEditMode());
        
        document.querySelectorAll('.closure-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const val = e.target.getAttribute('data-val');
                if (val === 'yes') this.fireRewardConfetti();
                store.saveClosure(val);
                this.render();
            });
        });
        
        this.dom.closeExport?.addEventListener('click', () => this.dom.exportModal?.classList.remove('modal-active'));
        document.getElementById('export-csv')?.addEventListener('click', () => this.exportToCSV());
        document.getElementById('export-pdf')?.addEventListener('click', () => this.exportToPDF('all'));
        this.dom.exportJsonBtn?.addEventListener('click', () => this.exportToJSON());
        this.dom.importJsonInput?.addEventListener('change', (e) => this.importFromJSON(e));

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModals = document.querySelectorAll('.modal-active');
                if (activeModals.length > 0) {
                    activeModals.forEach(modal => modal.classList.remove('modal-active'));
                } else if (this.isEditing) {
                    this.isEditing = false;
                    this.render();
                }
            }
        });
    },

    fireRewardConfetti() {
        const duration = 2500;
        const end = Date.now() + duration;
        const colors = ['#e7e5e4', '#a8a29e', '#57534e']; 

        const frame = () => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.width = Math.random() > 0.5 ? '8px' : '6px';
            confetti.style.height = Math.random() > 0.5 ? '8px' : '14px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            confetti.style.zIndex = '9999';
            confetti.style.pointerEvents = 'none';
            document.body.appendChild(confetti);

            const animation = confetti.animate([
                { transform: `translate3d(0, 0, 0) rotate(0deg)`, opacity: 1 },
                { transform: `translate3d(${Math.random()*200 - 100}px, 100vh, 0) rotate(${Math.random()*360}deg)`, opacity: 0 }
            ], { duration: Math.random() * 1000 + 1500, easing: 'cubic-bezier(.37,0,.63,1)' });

            animation.onfinish = () => confetti.remove();
            if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame(); 
    },

    copyToClipboard() {
        const { entry } = store.getToday();
        if (!entry || !entry.priorities) return;
        
        const formattedTasks = entry.priorities.map((p, i) => {
            const isDone = entry.completed && entry.completed[i];
            return `${i+1}. ${isDone ? '✓ ' : ''}${p}`;
        }).join('\n');

        const textToCopy = `🎯 My top 3 priorities for today:\n${formattedTasks}\n\nMade with DECIDE: https://toolblaster.com/decide/`;
        
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            if (this.dom.copyText && this.dom.copyBtn) {
                const originalText = this.dom.copyText.innerText;
                this.dom.copyText.innerText = "Copied!";
                this.dom.copyBtn.classList.add("text-green-600", "dark:text-green-400");
                setTimeout(() => {
                    this.dom.copyText.innerText = originalText;
                    this.dom.copyBtn.classList.remove("text-green-600", "dark:text-green-400");
                }, 2000);
            }
        } catch (err) {}
        textArea.remove();
    },

    carryOverTask(taskText) {
        const emptyInput = this.dom.inputs.find(input => input && !input.value.trim());
        if (emptyInput) {
            emptyInput.value = taskText;
            emptyInput.focus();
            if (!this.isEditing) store.saveDraft(this.dom.inputs.map(i => i?.value || ''));
        } else {
            alert("All three priorities are already filled for today.");
        }
    },

    exportToJSON() {
        const exportObj = { data: store.data, meta: store.meta, exportedAt: new Date().toISOString() };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `decide_backup_${store.getLocalYMD()}.json`);
        document.body.appendChild(dlAnchorElem);
        dlAnchorElem.click();
        document.body.removeChild(dlAnchorElem);
        this.dom.exportModal?.classList.remove('modal-active');
    },

    importFromJSON(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (imported.data && imported.meta) {
                    if (confirm("This will overwrite your current history. Are you sure you want to proceed?")) {
                        store.data = imported.data;
                        store.meta = imported.meta;
                        store.save();
                        this.render();
                        this.dom.exportModal?.classList.remove('modal-active');
                        alert("Backup restored successfully.");
                    }
                } else {
                    alert("Invalid backup file format. Missing data or meta attributes.");
                }
            } catch (err) {
                alert("Error reading backup file. Make sure it is a valid .json file.");
            }
            event.target.value = ''; 
        };
        reader.readAsText(file);
    },

    exportToCSV() {
        const dates = Object.keys(store.data).sort();
        if (dates.length === 0) return alert("No data to export.");
        
        let csvContent = "data:text/csv;charset=utf-8,Date,Priority 1,Priority 2,Priority 3,Closure\n";
        dates.forEach(date => {
            const entry = store.data[date];
            const p1 = (entry.priorities[0] || "").replace(/"/g, '""');
            const p2 = (entry.priorities[1] || "").replace(/"/g, '""');
            const p3 = (entry.priorities[2] || "").replace(/"/g, '""');
            const closure = entry.closure || "none";
            csvContent += `"${date}","${p1}","${p2}","${p3}","${closure}"\n`;
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `decide_export_${store.getLocalYMD()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.dom.exportModal?.classList.remove('modal-active');
    },

    exportToPDF(range = 'all') {
        if (!window.jspdf) return alert("PDF library is still loading or failed to load. Please try again.");
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("DECIDE. Priority History", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        
        let dateText = "All Time";
        if (range === 'weekly') dateText = "Last 7 Days";
        if (range === 'monthly') dateText = "Last 30 Days";
        
        doc.text(`Generated on: ${new Date().toLocaleDateString()} (${dateText})`, 14, 30);
        
        let dates = Object.keys(store.data).sort((a, b) => new Date(b) - new Date(a)); 
        if (range === 'weekly' || range === 'monthly') {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - (range === 'weekly' ? 7 : 30));
            cutoffDate.setHours(0,0,0,0); 
            dates = dates.filter(date => new Date(date) >= cutoffDate);
        }

        if (dates.length === 0) {
            alert(`No data found for the selected timeframe (${dateText}).`);
            this.dom.exportModal?.classList.remove('modal-active');
            return;
        }

        const tableData = dates.map(date => {
            const entry = store.data[date];
            const pList = entry.priorities.map((p, i) => {
                const isDone = entry.completed && entry.completed[i];
                return `${i+1}. ${isDone ? '✓ ' : ''}${p}`;
            }).join('\n');
            const closureMap = { 'yes': '✓ Yes', 'partial': '~ Partial', 'no': '✗ No', 'null': '-' };
            return [date, pList, closureMap[String(entry.closure)] || '-'];
        });

        doc.autoTable({
            startY: 40,
            head: [['Date', 'Priorities', 'Closure']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 4 },
            headStyles: { fillColor: [28, 25, 23] }, 
            columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 30 } }
        });
        
        doc.save(`decide_export_${store.getLocalYMD()}.pdf`);
        this.dom.exportModal?.classList.remove('modal-active');
    },

    toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
        this.updateThemeIcon(isDark);
    },
    updateThemeIcon(isDark) {
        const sun = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`;
        const moon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`;
        if (this.dom.themeBtn) this.dom.themeBtn.innerHTML = isDark ? sun : moon;
    },
    handleSubmit(e) {
        e.preventDefault();
        const p = this.dom.inputs.map(i => i?.value?.trim()).filter(v => v);
        if (p.length === 3) {
            store.saveDay(p);
            store.clearDraft(); 
            this.render(this.isEditing ? "✓ Priorities updated." : null);
            this.isEditing = false;
        }
    },
    
    enterEditMode(focusIndex = 0) {
        const doEdit = () => {
            this.dom.editModal?.classList.remove('modal-active');
            this.isEditing = true;
            const { entry } = store.getToday();
            
            if (entry) {
                entry.priorities.forEach((val, i) => { if (this.dom.inputs[i]) this.dom.inputs[i].value = val; });
            }
            
            this.dom.form?.classList.remove('hidden-app');
            this.dom.readonlyView?.classList.add('hidden-app');
            this.dom.introBlock?.classList.remove('hidden-app'); 
            if (this.dom.mainBtn) this.dom.mainBtn.innerHTML = "Save changes";
            this.dom.trustBadges?.classList.add('hidden-app'); 
            
            setTimeout(() => {
                if (this.dom.inputs[focusIndex]) {
                    this.dom.inputs[focusIndex].focus();
                    const length = this.dom.inputs[focusIndex].value.length;
                    this.dom.inputs[focusIndex].setSelectionRange(length, length);
                }
            }, 450); 
        };

        if (document.startViewTransition) {
            document.startViewTransition(() => doEdit());
        } else {
            doEdit();
        }
    },
    
    render(customMsg = null) {
        if (document.startViewTransition) {
            document.startViewTransition(() => this.updateUI(customMsg));
        } else {
            this.updateUI(customMsg);
        }
    },

    updateUI(customMsg) {
        store.init();
        const { date, entry } = store.getToday();
        this.renderedDate = date; 
        const yesterday = store.getYesterday();
        const now = new Date();

        if (this.dom.dateDisplay) {
            this.dom.dateDisplay.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        }
        this.updateThemeIcon(document.documentElement.classList.contains('dark'));

        if (this.dom.greetingLabel && !this.isEditing) {
            const h = now.getHours();
            let greet = "What matters today?";
            if (h >= 5 && h < 12) greet = "Good morning. What matters today?";
            else if (h >= 12 && h < 17) greet = "Good afternoon. What matters today?";
            else if (h >= 17 || h < 5) greet = "Good evening. What matters today?";
            this.dom.greetingLabel.textContent = greet;
        }

        if (!entry || this.isEditing) {
            this.dom.form?.classList.remove('hidden-app');
            this.dom.readonlyView?.classList.add('hidden-app');
            this.dom.introBlock?.classList.remove('hidden-app'); 
            
            if (yesterday.entry && !this.isEditing && this.dom.yesterdaySection) {
                this.dom.yesterdaySection.classList.remove('hidden-app');
                if (this.dom.yesterdayList) {
                    this.dom.yesterdayList.innerHTML = yesterday.entry.priorities.map((p, i) => {
                        const isDone = yesterday.entry.completed && yesterday.entry.completed[i];
                        const escapedTask = p.replace(/"/g, '&quot;');
                        
                        const carryOverBtn = isDone ? '' : `
                            <button type="button" title="Carry over to today" class="carry-over-btn flex-shrink-0 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800" data-task="${escapedTask}">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                            </button>
                        `;

                        return `
                        <li class="flex items-center justify-between text-stone-600 dark:text-stone-400">
                            <span class="${isDone ? 'line-through decoration-stone-300 dark:decoration-stone-700 opacity-50' : ''} truncate pr-2">${p}</span>
                            ${carryOverBtn}
                        </li>
                        `;
                    }).join('');

                    document.querySelectorAll('.carry-over-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const taskText = e.currentTarget.getAttribute('data-task');
                            this.carryOverTask(taskText);
                            e.currentTarget.style.opacity = '0.3';
                            e.currentTarget.style.pointerEvents = 'none';
                        });
                    });
                }
                store.trackEvent('yesterday'); 
            } else {
                this.dom.yesterdaySection?.classList.add('hidden-app');
            }
            
            if (!this.isEditing) {
                const drafts = store.getDraft();
                if (this.dom.mainBtn) this.dom.mainBtn.innerHTML = 'Decide Today <span>&rarr;</span>';
                this.dom.trustBadges?.classList.remove('hidden-app');
                this.dom.inputs.forEach((i, idx) => { if(i) i.value = drafts[idx] || ''; }); 
            }

        } else {
            this.dom.form?.classList.add('hidden-app');
            this.dom.readonlyView?.classList.remove('hidden-app');
            this.dom.yesterdaySection?.classList.add('hidden-app');
            this.dom.closureSection?.classList.add('hidden-app'); 

            if (this.dom.readonlyList) {
                this.dom.readonlyList.innerHTML = entry.priorities.map((p, i) => {
                    const isDone = entry.completed && entry.completed[i];
                    return `
                    <div class="priority-item flex items-baseline space-x-4 py-3 cursor-pointer select-none rounded-lg px-2 -mx-2 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-300 group" data-index="${i}">
                        <span class="text-stone-500 font-mono text-sm transition-opacity duration-300 ${isDone ? 'opacity-40' : ''}">0${i+1}</span>
                        <span class="text-lg font-medium transition-all duration-300 ${isDone ? 'line-through text-stone-400 dark:text-stone-600 decoration-stone-300 dark:decoration-stone-600' : 'text-stone-900 dark:text-stone-100 group-hover:text-stone-700 dark:group-hover:text-stone-300'}">${p}</span>
                    </div>
                    `;
                }).join('');

                document.querySelectorAll('.priority-item').forEach(item => {
                    let clickTimer = null;
                    const index = parseInt(item.getAttribute('data-index'), 10);
                    
                    item.addEventListener('click', (e) => {
                        if (e.detail === 1) {
                            clickTimer = setTimeout(() => {
                                if (navigator.vibrate) navigator.vibrate(40);
                                store.toggleTaskCompletion(index);
                                this.render();
                            }, 250); 
                        }
                    });
                    
                    item.addEventListener('dblclick', (e) => {
                        clearTimeout(clickTimer); 
                        this.enterEditMode(index); 
                    });
                });
            }

            if (now.getHours() >= 18 && !entry.closure) {
                this.dom.closureSection?.classList.remove('hidden-app');
                this.dom.footerStatus?.classList.add('hidden-app');
                store.trackEvent('closure'); 
            } else {
                this.dom.footerStatus?.classList.remove('hidden-app');
                const msg = customMsg || (entry.closure ? "Day complete." : "Come back tomorrow.");
                if (this.dom.statusText) this.dom.statusText.innerHTML = `<svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span>${msg}</span>`;
                
                if (this.dom.controls) {
                    this.dom.controls.innerHTML = '';
                    if (store.meta.v3Enabled || ENABLE_V3) { 
                            const btn = document.createElement('button');
                            btn.className = "hover:text-stone-600 dark:hover:text-stone-300 underline decoration-stone-200";
                            btn.innerText = "Export & Backup";
                            btn.onclick = () => this.dom.exportModal?.classList.add('modal-active');
                            this.dom.controls.appendChild(btn);
                    }
                }
            }
        }
    },
    scrollToTool() {
        document.getElementById('date-header')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => this.dom.inputs[0]?.focus(), 800);
    }
};

document.addEventListener('DOMContentLoaded', () => ui.init());
