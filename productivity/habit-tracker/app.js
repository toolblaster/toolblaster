/**
 * Checks if a habit is scheduled for a given date object.
 * @param {Object} habit 
 * @param {Date} date 
 * @returns {Boolean}
 */
function isScheduledDay(habit, date) {
    if (!habit || !date) return false;
    if (habit.frequency === 'daily') return true;
    const day = date.getDay(); // Sunday is 0, Monday is 1, etc.
    return Array.isArray(habit.customDays) && habit.customDays.includes(day);
}

/**
 * Checks if a habit was completed successfully on a target date string.
 * @param {Object} habit 
 * @param {String} dateStr 
 * @returns {Boolean}
 */
function isCompletedDay(habit, dateStr) {
    return !!(habit && habit.history && habit.history[dateStr] && habit.history[dateStr].completed);
}

/**
 * Checks if a habit was manually set as skipped/paused (streak safe).
 * @param {Object} habit 
 * @param {String} dateStr 
 * @returns {Boolean}
 */
function isSkippedDay(habit, dateStr) {
    return !!(habit && habit.history && habit.history[dateStr] && habit.history[dateStr].skipped);
}

/**
 * Iterates backward dynamically to calculate the active consecutive streak.
 * Handles custom days and skipped status without breaking user flow.
 * @param {Object} habit 
 * @param {Function} formatFn 
 * @returns {Number}
 */
function calculateActiveStreak(habit, formatFn) {
    if (!habit || !habit.history) return 0;
    const today = new Date();
    const todayStr = formatFn(today);
    const createdDate = new Date(habit.created);

    let activeStreak = 0;
    let currentDate = new Date(today);
    let safetyBreak = 0;

    // If scheduled today and has not been logged or skipped, start evaluating from yesterday.
    if (isScheduledDay(habit, today)) {
        const status = habit.history[todayStr];
        if (!status) {
            currentDate.setDate(currentDate.getDate() - 1);
        }
    }

    while (currentDate >= createdDate && safetyBreak < 365) {
        const dateString = formatFn(currentDate);
        const scheduled = isScheduledDay(habit, currentDate);

        if (scheduled) {
            if (isCompletedDay(habit, dateString)) {
                activeStreak++;
            } else if (isSkippedDay(habit, dateString)) {
                // Skip Day keeps the chain alive without increasing value
            } else {
                break;
            }
        } else {
            // Extra credit: completed even on rest days counts
            if (isCompletedDay(habit, dateString)) {
                activeStreak++;
            }
        }
        currentDate.setDate(currentDate.getDate() - 1);
        safetyBreak++;
    }
    return activeStreak;
}

/**
 * Iterates forward from creation date to today to find the longest historical streak.
 * @param {Object} habit 
 * @param {Function} formatFn 
 * @returns {Number}
 */
function calculateMaxStreak(habit, formatFn) {
    if (!habit || !habit.history) return 0;
    const today = new Date();
    const createdDate = new Date(habit.created);

    let maxStreak = 0;
    let runningStreak = 0;
    let iterDate = new Date(createdDate);
    const endDate = new Date(today);
    let safetyBreak = 0;

    while (iterDate <= endDate && safetyBreak < 365) {
        const dateString = formatFn(iterDate);
        const scheduled = isScheduledDay(habit, iterDate);

        if (scheduled) {
            if (isCompletedDay(habit, dateString)) {
                runningStreak++;
                if (runningStreak > maxStreak) maxStreak = runningStreak;
            } else if (isSkippedDay(habit, dateString)) {
                // Skip Day passes streak state forward
            } else {
                runningStreak = 0;
            }
        } else {
            if (isCompletedDay(habit, dateString)) {
                runningStreak++;
                if (runningStreak > maxStreak) maxStreak = runningStreak;
            }
        }
        iterDate.setDate(iterDate.getDate() + 1);
        safetyBreak++;
    }
    return maxStreak;
}


class StreakState {
    constructor() {
        this.storageKey = 'toolblaster_streak_state';
        this.load();
    }

    load() {
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                this.habits = parsed.habits || [];
                this.audioTheme = parsed.audioTheme || 'bowl';
            } catch (e) {
                this.habits = [];
                this.audioTheme = 'bowl';
            }
        } else {
            this.habits = this.getDefaultHabits();
            this.audioTheme = 'bowl';
        }
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify({ 
            habits: this.habits,
            audioTheme: this.audioTheme
        }));
        this.dispatchUpdate();
    }

    dispatchUpdate() {
        document.dispatchEvent(new CustomEvent('streak-state-updated'));
    }

    getDefaultHabits() {
        const todayStr = this.getLocalDateString(new Date());
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = this.getLocalDateString(yesterday);

        const d2 = new Date(); d2.setDate(d2.getDate() - 2); const d2Str = this.getLocalDateString(d2);
        const d3 = new Date(); d3.setDate(d3.getDate() - 3); const d3Str = this.getLocalDateString(d3);

        return [
            {
                id: 'h-1',
                name: 'Deep Work Session',
                emoji: '💻',
                color: 'indigo',
                strategy: 'build', 
                created: this.getLocalDateString(new Date(Date.now() - 15 * 86400000)),
                frequency: 'daily', 
                customDays: [1, 2, 3, 4, 5, 6, 0], 
                reminderTime: '09:00',
                history: { 
                    [yesterdayStr]: { completed: true, note: "Completed 2 Pomodoro blocks." }, 
                    [d2Str]: { completed: true, note: "Wrote core algorithms." }, 
                    [d3Str]: { completed: true, note: "Set workspace setup up." } 
                }
            },
            {
                id: 'h-2',
                name: 'Avoid Fast Food',
                emoji: '🍔',
                color: 'rose',
                strategy: 'break',
                created: this.getLocalDateString(new Date(Date.now() - 5 * 86400000)),
                frequency: 'daily',
                customDays: [1, 2, 3, 4, 5, 6, 0],
                reminderTime: '21:00',
                history: { 
                    [todayStr]: { completed: true, note: "Resisted burger craving!" }, 
                    [yesterdayStr]: { completed: true, note: "Cooked fresh dinner." } 
                }
            }
        ];
    }

    addHabit(name, emoji, color, strategy, frequency, customDays, reminderTime) {
        if (this.habits.length >= 5) {
            return false;
        }
        const newHabit = {
            id: 'h-' + Date.now(),
            name: name.trim(),
            emoji: emoji.trim() || '🧘',
            color: color,
            strategy: strategy || 'build',
            created: this.getLocalDateString(new Date()),
            frequency: frequency,
            customDays: customDays,
            reminderTime: reminderTime || null,
            history: {}
        };
        this.habits.push(newHabit);
        this.save();
        return true;
    }

    editHabit(id, name, emoji, color, strategy, frequency, customDays, reminderTime) {
        const habit = this.habits.find(h => h.id === id);
        if (habit) {
            habit.name = name.trim();
            habit.emoji = emoji.trim() || '🧘';
            habit.color = color;
            habit.strategy = strategy || 'build';
            habit.frequency = frequency;
            habit.customDays = customDays;
            habit.reminderTime = reminderTime || null;
            this.save();
            return true;
        }
        return false;
    }

    deleteHabit(id) {
        this.habits = this.habits.filter(h => h.id !== id);
        this.save();
    }

    moveHabit(index, direction) {
        if (direction === 'up' && index > 0) {
            const temp = this.habits[index];
            this.habits[index] = this.habits[index - 1];
            this.habits[index - 1] = temp;
        } else if (direction === 'down' && index < this.habits.length - 1) {
            const temp = this.habits[index];
            this.habits[index] = this.habits[index + 1];
            this.habits[index + 1] = temp;
        }
        this.save();
    }

    toggleCheck(habitId, dateStr, optionalNote = null, isSkipped = false) {
        const habit = this.habits.find(h => h.id === habitId);
        if (habit) {
            let logState = '';
            if (habit.history[dateStr] && !isSkipped) {
                delete habit.history[dateStr];
                logState = 'unchecked';
            } else {
                habit.history[dateStr] = {
                    completed: !isSkipped,
                    skipped: isSkipped,
                    note: optionalNote ? optionalNote.trim() : ""
                };
                logState = isSkipped ? 'skipped' : 'checked';
            }
            this.save();
            return logState;
        }
        return null;
    }

    getLocalDateString(date) {
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        return adjustedDate.toISOString().split('T')[0];
    }

    calculateStreaks(habit) {
        const formatBound = this.getLocalDateString.bind(this);
        return {
            active: calculateActiveStreak(habit, formatBound),
            max: calculateMaxStreak(habit, formatBound)
        };
    }

    evaluateAchievements() {
        const totalClears = this.habits.reduce((acc, h) => {
            return acc + Object.keys(h.history).filter(k => h.history[k].completed).length;
        }, 0);
        
        let maxActiveStreak = 0;
        this.habits.forEach(h => {
            const streaks = this.calculateStreaks(h);
            if (streaks.active > maxActiveStreak) maxActiveStreak = streaks.active;
        });

        let perfectWeek = false;
        if (this.habits.length > 0) {
            const today = new Date();
            let perfectDays = 0;
            for (let i = 0; i < 7; i++) {
                const checkDate = new Date();
                checkDate.setDate(today.getDate() - i);
                const dateStr = this.getLocalDateString(checkDate);
                
                let dayScheduledHabits = 0;
                let completedDayHabits = 0;
                
                this.habits.forEach(h => {
                    const day = checkDate.getDay();
                    const isScheduled = (h.frequency === 'daily' || h.customDays.includes(day));
                    if (isScheduled) {
                        dayScheduledHabits++;
                        if (h.history[dateStr] && h.history[dateStr].completed) {
                            completedDayHabits++;
                        }
                    }
                });
                
                if (dayScheduledHabits > 0 && dayScheduledHabits === completedDayHabits) {
                    perfectDays++;
                }
            }
            if (perfectDays === 7) perfectWeek = true;
        }

        let totalNotes = 0;
        this.habits.forEach(h => {
            Object.values(h.history).forEach(day => {
                if (day.note && day.note.length > 0) totalNotes++;
            });
        });

        return [
            {
                id: 'ach-1',
                title: 'First Step Locked',
                desc: 'Complete any habit once.',
                unlocked: totalClears >= 1,
                icon: 'fa-shoe-prints',
                color: 'indigo'
            },
            {
                id: 'ach-2',
                title: 'Weekly Warrior',
                desc: 'Reach a 7-day streak on any scheduled habit.',
                unlocked: maxActiveStreak >= 7,
                icon: 'fa-shield-halved',
                color: 'rose'
            },
            {
                id: 'ach-3',
                title: 'Consistent Anchor',
                desc: 'Reach a 30-day streak on any habit.',
                unlocked: maxActiveStreak >= 30,
                icon: 'fa-anchor',
                color: 'emerald'
            },
            {
                id: 'ach-4',
                title: 'Perfect Week',
                desc: 'Clear all scheduled habits for 7 consecutive days.',
                unlocked: perfectWeek,
                icon: 'fa-calendar-check',
                color: 'amber'
            },
            {
                id: 'ach-5',
                title: 'Habit Centurion',
                desc: 'Complete 100 historical clears across all anchors.',
                unlocked: totalClears >= 100,
                icon: 'fa-crown',
                color: 'purple'
            },
            {
                id: 'ach-6',
                title: 'Mindful Logger',
                desc: 'Add 5 customized check-in notes to your logs.',
                unlocked: totalNotes >= 5,
                icon: 'fa-pen-clip',
                color: 'teal'
            }
        ];
    }
}


class ChimeEngine {
    static playZenChime(theme) {
        if (theme === 'silent') return;
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            
            if (theme === 'bowl') {
                const baseFreq = 180; 
                const harmonics = [1, 2.76, 5.4, 8.1, 11.2];
                const gains = [0.4, 0.25, 0.15, 0.08, 0.04];
                
                harmonics.forEach((h, index) => {
                    const osc = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();
                    osc.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(baseFreq * h, audioCtx.currentTime);
                    
                    gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(gains[index], audioCtx.currentTime + 0.1);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.5 - (index * 0.2));
                    
                    osc.start(audioCtx.currentTime);
                    osc.stop(audioCtx.currentTime + 3.0);
                });
            } 
            else if (theme === 'wood') {
                const osc = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                osc.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(800, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(500, audioCtx.currentTime + 0.05);
                
                gainNode.gain.setValueAtTime(0.6, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
                
                osc.start(audioCtx.currentTime);
                osc.stop(audioCtx.currentTime + 0.15);
            }
            else if (theme === 'chord') {
                const notes = [261.63, 329.63, 392.00, 523.25]; 
                notes.forEach((freq, idx) => {
                    const osc = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();
                    osc.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                    
                    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.8 + (idx * 0.1));
                    
                    osc.start(audioCtx.currentTime);
                    osc.stop(audioCtx.currentTime + 2.2);
                });
            }
            else {
                const osc = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                osc.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); 
                osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); 
                
                gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
                
                osc.start(audioCtx.currentTime);
                osc.stop(audioCtx.currentTime + 1.3);
            }
        } catch (e) {
            // blocked
        }
    }
}


class AppController {
    constructor() {
        this.state = new StreakState();
        this.lastActiveElement = null;
        this.focusTrapHandlers = {};
        this.initElements();
        this.bindEvents();
        this.render();
    }

    announce(message) {
        const announcer = document.getElementById('sr-announcer');
        if (announcer) {
            announcer.textContent = '';
            setTimeout(() => {
                announcer.textContent = message;
            }, 50);
        }
    }

    getFocusableElements(container) {
        return Array.from(container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )).filter(el => !el.disabled && el.offsetParent !== null);
    }

    openAccessibleModal(modalId, initialFocusSelector = null) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        this.lastActiveElement = document.activeElement;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        modal.setAttribute('aria-hidden', 'false');
        
        let focusTarget = null;
        if (initialFocusSelector) {
            focusTarget = modal.querySelector(initialFocusSelector);
        }
        if (!focusTarget) {
            const focusables = this.getFocusableElements(modal);
            if (focusables.length > 0) focusTarget = focusables[0];
        }
        if (focusTarget) {
            setTimeout(() => focusTarget.focus(), 50);
        }

        this.removeFocusTrap(modalId);
        this.focusTrapHandlers[modalId] = (e) => {
            if (e.key === 'Escape') {
                this.closeAccessibleModal(modalId);
                return;
            }
            if (e.key === 'Tab') {
                const focusables = this.getFocusableElements(modal);
                if (focusables.length === 0) {
                    e.preventDefault();
                    return;
                }
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        last.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === last) {
                        first.focus();
                        e.preventDefault();
                    }
                }
            }
        };
        modal.addEventListener('keydown', this.focusTrapHandlers[modalId]);
    }

    closeAccessibleModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        modal.setAttribute('aria-hidden', 'true');
        if (this.focusTrapHandlers && this.focusTrapHandlers[modalId]) {
            modal.removeEventListener('keydown', this.focusTrapHandlers[modalId]);
            delete this.focusTrapHandlers[modalId];
        }
        if (this.lastActiveElement) {
            this.lastActiveElement.focus();
            this.lastActiveElement = null;
        }
    }

    removeFocusTrap(modalId) {
        const modal = document.getElementById(modalId);
        if (modal && this.focusTrapHandlers && this.focusTrapHandlers[modalId]) {
            modal.removeEventListener('keydown', this.focusTrapHandlers[modalId]);
            delete this.focusTrapHandlers[modalId];
        }
    }

    initElements() {
        this.habitsContainer = document.getElementById('habits-container');
        this.btnAddHabit = document.getElementById('btn-add-habit');
        this.addHabitModal = document.getElementById('add-habit-modal');
        this.addHabitForm = document.getElementById('add-habit-form');
        this.btnCancelAdd = document.getElementById('btn-cancel-add');
        this.habitCountBadge = document.getElementById('habit-count-badge');
        
        this.freqDaily = document.getElementById('freq-daily');
        this.freqCustom = document.getElementById('freq-custom');
        this.weekdaySelectorWrapper = document.getElementById('weekday-selector-wrapper');
        this.customDaysSelection = [1, 2, 3, 4, 5, 6, 0]; 
        
        this.stratBuild = document.getElementById('strat-build');
        this.stratBreak = document.getElementById('strat-break');
        this.activeStrategy = 'build';

        this.checkinNoteModal = document.getElementById('checkin-note-modal');
        this.checkinHabitIdInput = document.getElementById('checkin-habit-id');
        this.checkinNoteInput = document.getElementById('checkin-note-input');
        this.btnCancelNote = document.getElementById('btn-cancel-note');
        this.btnSaveNote = document.getElementById('btn-save-note');

        this.detailModal = document.getElementById('detail-habit-modal');
        this.btnCloseDetail = document.getElementById('btn-close-detail');
        this.btnCloseDetailModalBtn = document.getElementById('btn-close-detail-modal');
        this.btnDeleteHabit = document.getElementById('btn-delete-habit');
        this.detailHabitTitle = document.getElementById('detail-habit-title');
        this.detailCategory = document.getElementById('detail-category');
        this.detailScheduleText = document.getElementById('detail-habit-schedule-text');
        this.btnEditHabitTrigger = document.getElementById('btn-edit-habit-trigger');
        
        this.achievementsModal = document.getElementById('achievements-modal');
        this.btnViewAchievements = document.getElementById('btn-view-achievements');
        this.btnCloseAchievements = document.getElementById('btn-close-achievements');
        this.badgeCountUnlocked = document.getElementById('badge-count-unlocked');
        this.achievementsGrid = document.getElementById('achievements-grid');

        // Analytics Elements
        this.analyticsModal = document.getElementById('analytics-modal');
        this.btnViewAnalytics = document.getElementById('btn-view-analytics');
        this.btnCloseAnalytics = document.getElementById('btn-close-analytics');
        this.btnCloseAnalyticsModalBtn = document.getElementById('btn-close-analytics-modal');
        this.btnAnalWeekly = document.getElementById('btn-anal-weekly');
        this.btnAnalMonthly = document.getElementById('btn-anal-monthly');
        this.analyticsContentBox = document.getElementById('analytics-content-box');
        this.activeAnalyticsTab = 'weekly';

        this.detailActiveStreak = document.getElementById('detail-stat-active-streak');
        this.detailMaxStreak = document.getElementById('detail-stat-max-streak');
        this.detailTotal = document.getElementById('detail-stat-total');
        this.detailRate = document.getElementById('detail-stat-rate');
        this.detailContributionGrid = document.getElementById('detail-contribution-grid');
        this.detailReflectionLogs = document.getElementById('detail-reflection-logs');
        
        this.backupModal = document.getElementById('backup-modal');
        this.btnBackupMenu = document.getElementById('btn-export-backup');
        this.btnCloseBackup = document.getElementById('btn-close-backup');
        this.btnBackupJson = document.getElementById('btn-backup-json');
        this.btnExportCsv = document.getElementById('btn-export-csv');
        this.importStateJsonInput = document.getElementById('import-state-json');

        this.audioThemeSelector = document.getElementById('audio-theme-selector');

        this.activeHabitId = null;
        this.activeFrequencyMode = 'daily';
        
        this.deleteStep = 0; 
        this.deleteTimeout = null;
    }

    bindEvents() {
        this.audioThemeSelector.value = this.state.audioTheme;
        this.audioThemeSelector.addEventListener('change', (e) => {
            this.state.audioTheme = e.target.value;
            this.state.save();
            ChimeEngine.playZenChime(this.state.audioTheme);
            this.announce(`Chime theme changed to ${e.target.value}`);
        });

        document.querySelectorAll('.emoji-select-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.emoji-select-btn').forEach(b => {
                    b.classList.remove('border-stone-900', 'scale-105');
                    b.classList.add('border-stone-200');
                });
                btn.classList.add('border-stone-900', 'scale-105');
                btn.classList.remove('border-stone-200');
                
                document.getElementById('habit-emoji').value = btn.dataset.emoji;
                this.announce(`Icon changed to ${btn.dataset.emoji}`);
            });
        });

        this.freqDaily.addEventListener('click', () => {
            this.setFrequencyMode('daily');
        });
        this.freqCustom.addEventListener('click', () => {
            this.setFrequencyMode('custom');
        });

        this.stratBuild.addEventListener('click', () => {
            this.setStrategyMode('build');
        });
        this.stratBreak.addEventListener('click', () => {
            this.setStrategyMode('break');
        });

        document.querySelectorAll('.day-select-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const day = parseInt(btn.dataset.day);
                if (this.customDaysSelection.includes(day)) {
                    if (this.customDaysSelection.length > 1) {
                        this.customDaysSelection = this.customDaysSelection.filter(d => d !== day);
                        btn.classList.remove('bg-stone-900', 'text-white', 'border-stone-900');
                        btn.classList.add('text-stone-700', 'border-stone-200');
                        this.announce(`Removed ${btn.getAttribute('aria-label')} from schedule`);
                    }
                } else {
                    this.customDaysSelection.push(day);
                    btn.classList.add('bg-stone-900', 'text-white', 'border-stone-900');
                    btn.classList.remove('text-stone-700', 'border-stone-200');
                    this.announce(`Added ${btn.getAttribute('aria-label')} to schedule`);
                }
            });
        });

        this.btnAddHabit.addEventListener('click', () => {
            if (this.state.habits.length >= 5) {
                this.showToast('Focus Mode active (5 habits max). Complete these first!');
                this.announce('Focus Mode active. 5 habits maximum reached.');
                return;
            }
            this.openFormModal();
        });

        this.btnCancelAdd.addEventListener('click', () => {
            this.closeAccessibleModal('add-habit-modal');
            this.addHabitForm.reset();
        });

        this.addHabitForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-habit-id').value;
            const name = document.getElementById('habit-name').value;
            const emoji = document.getElementById('habit-emoji').value;
            const color = document.querySelector('input[name="habit-color"]:checked').value;
            const reminder = document.getElementById('habit-reminder').value;
            
            let success;
            if (id) {
                success = this.state.editHabit(id, name, emoji, color, this.activeStrategy, this.activeFrequencyMode, this.customDaysSelection, reminder);
                if (success) {
                    this.showToast('Anchor habit updated.');
                    this.announce(`Habit ${name} updated successfully.`);
                }
            } else {
                success = this.state.addHabit(name, emoji, color, this.activeStrategy, this.activeFrequencyMode, this.customDaysSelection, reminder);
                if (success) {
                    this.showToast('Anchor habit locked.');
                    this.announce(`Habit ${name} created successfully.`);
                }
            }

            if (success) {
                this.closeAccessibleModal('add-habit-modal');
                this.addHabitForm.reset();
            }
        });

        this.btnCancelNote.addEventListener('click', () => {
            this.closeAccessibleModal('checkin-note-modal');
        });

        this.btnSaveNote.addEventListener('click', () => {
            const habitId = this.checkinHabitIdInput.value;
            const todayStr = this.state.getLocalDateString(new Date());
            const note = this.checkinNoteInput.value;
            const habit = this.state.habits.find(h => h.id === habitId);
            
            // Direct completion update with reflection note
            this.state.toggleCheck(habitId, todayStr, note, false);
            ChimeEngine.playZenChime(this.state.audioTheme);
            this.closeAccessibleModal('checkin-note-modal');
            this.announce(`Reflection note logged for ${habit ? habit.name : ''}`);
            this.showToast('Reflection note saved.');
        });

        const closeDetail = () => {
            this.closeAccessibleModal('detail-habit-modal');
            this.activeHabitId = null;
            this.resetDeleteButton();
        };
        this.btnCloseDetail.addEventListener('click', closeDetail);
        this.btnCloseDetailModalBtn.addEventListener('click', closeDetail);

        this.btnEditHabitTrigger.addEventListener('click', () => {
            const habit = this.state.habits.find(h => h.id === this.activeHabitId);
            if (habit) {
                closeDetail();
                this.openFormModal(habit);
            }
        });

        this.btnDeleteHabit.addEventListener('click', () => {
            if (this.activeHabitId) {
                const habit = this.state.habits.find(h => h.id === this.activeHabitId);
                if (this.deleteStep === 0) {
                    this.deleteStep = 1;
                    this.btnDeleteHabit.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-[9px]" aria-hidden="true"></i> Confirm Delete?';
                    this.btnDeleteHabit.classList.add('text-amber-800', 'hover:text-amber-955');
                    this.btnDeleteHabit.classList.remove('text-red-850', 'hover:text-red-955');
                    this.announce(`Confirm delete for ${habit ? habit.name : ''}. Click again to verify.`);
                    
                    this.deleteTimeout = setTimeout(() => {
                        this.resetDeleteButton();
                    }, 3000);
                } else {
                    this.state.deleteHabit(this.activeHabitId);
                    closeDetail();
                    this.showToast('Habit cleared.');
                    this.announce(`Habit ${habit ? habit.name : ''} deleted successfully.`);
                    this.resetDeleteButton();
                }
            }
        });

        this.btnViewAchievements.addEventListener('click', () => {
            this.openAchievementsModal();
        });
        this.btnCloseAchievements.addEventListener('click', () => {
            this.closeAccessibleModal('achievements-modal');
        });

        // Analytics Events
        this.btnViewAnalytics.addEventListener('click', () => {
            this.openAnalyticsModal();
        });
        this.btnCloseAnalytics.addEventListener('click', () => {
            this.closeAccessibleModal('analytics-modal');
        });
        this.btnCloseAnalyticsModalBtn.addEventListener('click', () => {
            this.closeAccessibleModal('analytics-modal');
        });
        this.btnAnalWeekly.addEventListener('click', () => {
            this.setAnalyticsTab('weekly');
        });
        this.btnAnalMonthly.addEventListener('click', () => {
            this.setAnalyticsTab('monthly');
        });

        this.btnBackupMenu.addEventListener('click', () => {
            this.openAccessibleModal('backup-modal');
        });
        
        const closeBackup = () => this.closeAccessibleModal('backup-modal');
        this.btnCloseBackup.addEventListener('click', closeBackup);
        
        this.btnBackupJson.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `habit_tracker_backup_${this.state.getLocalDateString(new Date())}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            this.announce('JSON configuration backup downloaded.');
        });

        this.btnExportCsv.addEventListener('click', () => {
            let csvContent = "data:text/csv;charset=utf-8,Habit Name,Emoji,Strategy,Date Completed,Status,Reflection Note\n";
            this.state.habits.forEach(h => {
                Object.keys(h.history).forEach(date => {
                    const entry = h.history[date];
                    const noteStr = entry.note ? entry.note.replace(/"/g, '""') : '';
                    const statusStr = entry.skipped ? "SKIPPED" : (entry.completed ? "COMPLETED" : "MISSED");
                    csvContent += `"${h.name.replace(/"/g, '""')}",${h.emoji},${h.strategy || 'build'},${date},${statusStr},"${noteStr}"\n`;
                });
            });
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `habit_consistency_report_${this.state.getLocalDateString(new Date())}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            this.announce('CSV report file downloaded.');
        });

        this.importStateJsonInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsed = JSON.parse(event.target.result);
                    if (parsed && Array.isArray(parsed.habits)) {
                        this.state.habits = parsed.habits;
                        this.state.audioTheme = parsed.audioTheme || 'bowl';
                        this.state.save();
                        closeBackup();
                        this.showToast('Ecosystem state restored.');
                        this.announce('Ecosystem state configuration restored successfully.');
                    } else {
                        this.showToast('Invalid backup file structure.');
                    }
                } catch (err) {
                    this.showToast('Failed to parse backup.');
                }
            };
            reader.readAsText(file);
        });

        document.dispatchEvent(new CustomEvent('streak-state-updated'));
        document.addEventListener('streak-state-updated', () => this.render());
    }

    resetDeleteButton() {
        clearTimeout(this.deleteTimeout);
        this.deleteStep = 0;
        this.btnDeleteHabit.innerHTML = '<i class="fa-solid fa-trash-can text-[9px]" aria-hidden="true"></i> Delete Habit';
        this.btnDeleteHabit.classList.add('text-red-850', 'hover:text-red-955');
        this.btnDeleteHabit.classList.remove('text-amber-800', 'hover:text-amber-955');
    }

    setFrequencyMode(mode) {
        this.activeFrequencyMode = mode;
        if (mode === 'daily') {
            this.freqDaily.className = "py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border-2 border-stone-950 bg-stone-900 text-white transition-all";
            this.freqCustom.className = "py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border-2 border-stone-200 text-stone-700 bg-transparent transition-all";
            this.weekdaySelectorWrapper.classList.add('hidden');
            this.announce('Frequency mode set to daily.');
        } else {
            this.freqCustom.className = "py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border-2 border-stone-955 bg-stone-900 text-white transition-all";
            this.freqDaily.className = "py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border-2 border-stone-200 text-stone-700 bg-transparent transition-all";
            this.weekdaySelectorWrapper.classList.remove('hidden');
            this.announce('Frequency mode set to specific custom weekdays.');
        }
    }

    setStrategyMode(mode) {
        this.activeStrategy = mode;
        if (mode === 'build') {
            this.stratBuild.className = "py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border-2 border-stone-955 bg-stone-900 text-white transition-all flex items-center justify-center gap-1";
            this.stratBreak.className = "py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border-2 border-stone-200 text-stone-700 bg-transparent transition-all flex items-center justify-center gap-1";
            this.announce('Strategy set to build habit.');
        } else {
            this.stratBreak.className = "py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border-2 border-stone-955 bg-stone-900 text-white transition-all flex items-center justify-center gap-1";
            this.stratBuild.className = "py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border-2 border-stone-200 text-stone-700 bg-transparent transition-all flex items-center justify-center gap-1";
            this.announce('Strategy set to break habit.');
        }
    }

    openFormModal(existingHabit = null) {
        this.addHabitForm.reset();
        if (existingHabit) {
            document.getElementById('modal-form-title').innerText = "Edit Anchor Habit";
            document.getElementById('edit-habit-id').value = existingHabit.id;
            document.getElementById('habit-name').value = existingHabit.name;
            document.getElementById('habit-emoji').value = existingHabit.emoji || '🧘';
            document.getElementById('habit-reminder').value = existingHabit.reminderTime || '';
            
            const radio = document.querySelector(`input[name="habit-color"][value="${existingHabit.color}"]`);
            if (radio) radio.checked = true;

            this.setStrategyMode(existingHabit.strategy || 'build');
            this.setFrequencyMode(existingHabit.frequency || 'daily');
            this.customDaysSelection = existingHabit.customDays || [1, 2, 3, 4, 5, 6, 0];
        } else {
            document.getElementById('modal-form-title').innerText = "Create Anchor Habit";
            document.getElementById('edit-habit-id').value = "";
            document.getElementById('habit-emoji').value = "🧘";
            this.setStrategyMode('build');
            this.setFrequencyMode('daily');
            this.customDaysSelection = [1, 2, 3, 4, 5, 6, 0];
        }

        document.querySelectorAll('.day-select-btn').forEach(btn => {
            const day = parseInt(btn.dataset.day);
            if (this.customDaysSelection.includes(day)) {
                btn.className = "day-select-btn py-1 text-[10px] font-black rounded-md border border-stone-900 bg-stone-900 text-white";
            } else {
                btn.className = "day-select-btn py-1 text-[10px] font-black rounded-md border border-stone-200 text-stone-700 hover:border-stone-400";
            }
        });

        this.openAccessibleModal('add-habit-modal', '#habit-name');
    }

    openAchievementsModal() {
        const badges = this.state.evaluateAchievements();
        const unlockedCount = badges.filter(b => b.unlocked).length;
        this.badgeCountUnlocked.innerText = `${unlockedCount}/6`;

        this.achievementsGrid.innerHTML = '';
        badges.forEach(b => {
            const card = document.createElement('div');
            card.className = `p-3 border rounded-2xl flex flex-col items-center text-center transition-all duration-300 ${
                b.unlocked 
                ? 'bg-white border-stone-200 shadow-sm opacity-100 scale-100' 
                : 'bg-stone-50/50 border-stone-200/40 opacity-55 saturate-50'
            }`;

            const textColors = {
                indigo: 'text-indigo-850 bg-indigo-50 border-indigo-100',
                rose: 'text-rose-850 bg-rose-50 border-rose-100',
                emerald: 'text-emerald-850 bg-emerald-50 border-emerald-100',
                amber: 'text-amber-850 bg-amber-50 border-amber-100',
                purple: 'text-purple-850 bg-purple-50 border-purple-100',
                teal: 'text-teal-850 bg-teal-50 border-teal-100'
            }[b.color] || 'text-stone-700 bg-stone-50';

            card.innerHTML = `
                <div class="w-8 h-8 rounded-full flex items-center justify-center border text-xs mb-2 ${textColors}">
                    <i class="fa-solid ${b.icon}" aria-hidden="true"></i>
                </div>
                <h3 class="text-[10px] font-black text-stone-900 uppercase tracking-tight leading-tight mb-0.5">${b.title}</h3>
                <p class="text-[9px] text-stone-700 font-semibold leading-relaxed max-w-[120px]">${b.desc}</p>
                ${b.unlocked 
                    ? `<span class="mt-1.5 text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">Unlocked</span>`
                    : `<span class="mt-1.5 text-[9px] font-black uppercase tracking-widest bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-full">Locked</span>`
                }
            `;
            this.achievementsGrid.appendChild(card);
        });

        this.openAccessibleModal('achievements-modal');
    }

    openAnalyticsModal() {
        this.setAnalyticsTab('weekly');
        this.openAccessibleModal('analytics-modal');
    }

    setAnalyticsTab(tab) {
        this.activeAnalyticsTab = tab;
        if (tab === 'weekly') {
            this.btnAnalWeekly.className = "flex-1 py-1.5 rounded-lg bg-white text-stone-900 shadow transition-all";
            this.btnAnalMonthly.className = "flex-1 py-1.5 rounded-lg text-stone-700 transition-all";
            this.renderWeeklyAnalytics();
        } else {
            this.btnAnalMonthly.className = "flex-1 py-1.5 rounded-lg bg-white text-stone-900 shadow transition-all";
            this.btnAnalWeekly.className = "flex-1 py-1.5 rounded-lg text-stone-700 transition-all";
            this.renderMonthlyAnalytics();
        }
    }

    renderWeeklyAnalytics() {
        this.analyticsContentBox.innerHTML = '';
        if (this.state.habits.length === 0) {
            this.analyticsContentBox.innerHTML = `<p class="text-xs text-stone-700 italic text-center py-6">Create habits first to analyze consistency loops.</p>`;
            return;
        }

        const today = new Date();
        
        // 1. Calculate Live Weekly Consistency (Last 7 Days)
        let totalScheduledLast7 = 0;
        let totalCompletedLast7 = 0;
        for (let i = 6; i >= 0; i--) {
            const checkDate = new Date();
            checkDate.setDate(today.getDate() - i);
            const dateStr = this.state.getLocalDateString(checkDate);
            this.state.habits.forEach(h => {
                if (isScheduledDay(h, checkDate)) {
                    totalScheduledLast7++;
                    if (isCompletedDay(h, dateStr)) {
                        totalCompletedLast7++;
                    }
                }
            });
        }
        const weeklyConsistency = totalScheduledLast7 > 0 ? Math.round((totalCompletedLast7 / totalScheduledLast7) * 100) : 0;

        // 2. Calculate Success Rates per Habit & find Best Performer
        let bestHabitName = "None";
        let bestHabitRate = -1;
        let bestHabitEmoji = "🧘";
        
        const habitRates = this.state.habits.map(h => {
            let schedCount = 0;
            let compCount = 0;
            for (let i = 29; i >= 0; i--) {
                const checkDate = new Date();
                checkDate.setDate(today.getDate() - i);
                const dateStr = this.state.getLocalDateString(checkDate);
                if (isScheduledDay(h, checkDate)) {
                    schedCount++;
                    if (isCompletedDay(h, dateStr)) {
                        compCount++;
                    }
                }
            }
            const successRate = schedCount > 0 ? Math.round((compCount / schedCount) * 100) : 0;
            
            if (successRate > bestHabitRate && compCount > 0) {
                bestHabitRate = successRate;
                bestHabitName = h.name;
                bestHabitEmoji = h.emoji || "🧘";
            }

            return {
                habit: h,
                rate: successRate,
                completed: compCount,
                scheduled: schedCount
            };
        });

        const contentWrapper = document.createElement('div');
        contentWrapper.className = "space-y-4 fade-in";

        contentWrapper.innerHTML = `
            <div class="grid grid-cols-2 gap-3 mb-2">
                <div class="bg-stone-50 border border-stone-200/50 p-3 rounded-2xl text-center">
                    <span class="block text-[10px] font-black text-stone-700 uppercase tracking-widest mb-0.5">Weekly Consistency</span>
                    <span class="text-xl font-black text-indigo-850">${weeklyConsistency}%</span>
                    <span class="block text-[10px] text-stone-600 font-semibold mt-0.5">${totalCompletedLast7} of ${totalScheduledLast7} targets met</span>
                </div>
                <div class="bg-stone-50 border border-stone-200/50 p-3 rounded-2xl flex flex-col justify-center text-center">
                    <span class="block text-[10px] font-black text-stone-700 uppercase tracking-widest mb-0.5">Best Performing Anchor</span>
                    ${bestHabitRate >= 0 && bestHabitName !== "None" ? `
                        <span class="text-xs font-black text-stone-900 truncate flex items-center justify-center gap-1">
                            <span>${bestHabitEmoji}</span> <span class="truncate">${bestHabitName}</span>
                        </span>
                        <span class="block text-[10px] text-stone-755 font-bold mt-0.5 uppercase tracking-wider">${bestHabitRate}% Success Rate</span>
                    ` : `
                        <span class="text-xs font-bold text-stone-600 italic">No clear data yet</span>
                    `}
                </div>
            </div>

            <!-- Habit success rates breakdown -->
            <div class="space-y-2.5">
                <span class="block text-[10px] font-black text-stone-700 uppercase tracking-widest border-b border-stone-100 pb-1">Success Rates per Habit (Last 30 Days)</span>
                <div class="space-y-2.5">
                    ${habitRates.map(item => {
                        const activeColorClass = {
                            indigo: 'bg-indigo-700',
                            emerald: 'bg-emerald-700',
                            rose: 'bg-rose-700',
                            amber: 'bg-amber-500',
                            purple: 'bg-purple-700'
                        }[item.habit.color] || 'bg-stone-900';

                        return `
                            <div class="text-xs space-y-1">
                                <div class="flex justify-between font-bold text-stone-850">
                                    <span class="truncate flex items-center gap-1">
                                        <span>${item.habit.emoji || '🧘'}</span> <span class="truncate">${item.habit.name}</span>
                                    </span>
                                    <span class="font-black text-stone-900">${item.rate}% <span class="text-[10px] text-stone-755 font-semibold">(${item.completed}/${item.scheduled})</span></span>
                                </div>
                                <div class="w-full bg-stone-100 h-2 rounded-full overflow-hidden relative border border-stone-200/40">
                                    <div class="h-full rounded-full ${activeColorClass} transition-all duration-500" style="width: ${item.rate}%"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        this.analyticsContentBox.appendChild(contentWrapper);
    }

    renderMonthlyAnalytics() {
        this.analyticsContentBox.innerHTML = '';
        if (this.state.habits.length === 0) {
            this.analyticsContentBox.innerHTML = `<p class="text-xs text-stone-700 italic text-center py-6">Create habits first to analyze trend records.</p>`;
            return;
        }

        const today = new Date();
        const contentWrapper = document.createElement('div');
        contentWrapper.className = "space-y-5 fade-in";

        // 1. Build a stunning 30-Day Missed-Day Heatmap Month-Matrix
        const heatmapWrapper = document.createElement('div');
        heatmapWrapper.className = "bg-stone-50/50 border border-stone-200/40 p-3 rounded-2xl text-left";
        
        let heatmapHTML = `
            <span class="block text-[10px] font-black text-stone-700 uppercase tracking-widest mb-2.5">30-Day Missed & Sickness Heatmap</span>
            <div class="grid grid-cols-7 gap-1.5 max-w-[280px] mx-auto mb-2">
        `;

        // Calculate daily checks over past 30 days
        const last30Days = [];
        for (let i = 29; i >= 0; i--) {
            const checkDate = new Date();
            checkDate.setDate(today.getDate() - i);
            const dateStr = this.state.getLocalDateString(checkDate);
            
            let schedCount = 0;
            let compCount = 0;
            let skipCount = 0;

            this.state.habits.forEach(h => {
                if (isScheduledDay(h, checkDate)) {
                    schedCount++;
                    if (isCompletedDay(h, dateStr)) {
                        compCount++;
                    } else if (isSkippedDay(h, dateStr)) {
                        skipCount++;
                    }
                }
            });

            last30Days.push({
                date: dateStr,
                scheduled: schedCount,
                completed: compCount,
                skipped: skipCount
            });
        }

        // Render Heatmap Dots
        last30Days.forEach(day => {
            let colorClass = "bg-stone-100 border border-stone-200/50"; // default unscheduled
            let iconHTML = "";
            let tooltip = `${day.date} : Rest Day`;

            if (day.scheduled > 0) {
                if (day.skipped === day.scheduled) {
                    colorClass = "bg-amber-100 border border-amber-300 text-amber-700";
                    tooltip = `${day.date} : Skipped/Paused Moratorium`;
                    iconHTML = `<i class="fa-solid fa-forward text-[5px]"></i>`;
                } else if (day.completed === day.scheduled) {
                    colorClass = "bg-indigo-850 border border-indigo-700 text-white shadow-sm";
                    tooltip = `${day.date} : Perfect Completion (${day.completed}/${day.scheduled})`;
                } else if (day.completed > 0) {
                    colorClass = "bg-indigo-200 border border-indigo-300 text-indigo-800 font-bold";
                    tooltip = `${day.date} : Partial Success (${day.completed}/${day.scheduled})`;
                } else {
                    colorClass = "bg-rose-50 border border-rose-200 text-rose-800 font-bold";
                    tooltip = `${day.date} : Missed all targets (0/${day.scheduled})`;
                    iconHTML = `<i class="fa-solid fa-xmark text-[6px]"></i>`;
                }
            }

            heatmapHTML += `
                <div class="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] cursor-help relative group transition-all hover:scale-110 ${colorClass}" title="${tooltip}">
                    ${iconHTML}
                </div>
            `;
        });

        heatmapHTML += `
            </div>
            <!-- Minimalist Heatmap Legend -->
            <div class="flex flex-wrap gap-2.5 justify-center items-center text-[9px] font-black uppercase tracking-wider text-stone-600 mt-2 border-t border-stone-100 pt-2">
                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-indigo-850 block"></span> Perfect</span>
                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-indigo-200 block"></span> Partial</span>
                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-rose-50 border border-rose-200 block"></span> Missed</span>
                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-amber-100 border border-amber-300 block"></span> Skipped</span>
                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-stone-100 border border-stone-200/50 block"></span> Rest</span>
            </div>
        `;

        heatmapWrapper.innerHTML = heatmapHTML;
        contentWrapper.appendChild(heatmapWrapper);

        // 2. Build the Monthly Trend Chart (Weekly blocks consistency over last 4 weeks)
        const trendWrapper = document.createElement('div');
        trendWrapper.className = "bg-stone-50/50 border border-stone-200/40 p-3 rounded-2xl";
        
        let trendHTML = `
            <span class="block text-[10px] font-black text-stone-700 uppercase tracking-widest mb-3">4-Week Completion Trend Chart</span>
            <div class="flex items-end justify-around h-24 pt-2 border-b border-stone-200/80">
        `;

        // Calculate rates for Week 1 (Days 0-6 ago), Week 2 (Days 7-13 ago), etc.
        for (let w = 3; w >= 0; w--) {
            let weekScheduled = 0;
            let weekCompleted = 0;

            for (let d = 6; d >= 0; d--) {
                const checkDate = new Date();
                checkDate.setDate(today.getDate() - (w * 7 + d));
                const dateStr = this.state.getLocalDateString(checkDate);

                this.state.habits.forEach(h => {
                    if (isScheduledDay(h, checkDate)) {
                        weekScheduled++;
                        if (isCompletedDay(h, dateStr)) {
                            weekCompleted++;
                        }
                    }
                });
            }

            const weekRate = weekScheduled > 0 ? Math.round((weekCompleted / weekScheduled) * 100) : 0;
            const weekLabel = w === 0 ? 'This Week' : `Week -${w}`;

            trendHTML += `
                <div class="flex flex-col items-center gap-1.5 flex-1 max-w-[50px] group">
                    <span class="text-[9px] font-black text-stone-850 opacity-0 group-hover:opacity-100 transition-opacity leading-none">${weekRate}%</span>
                    <div class="w-4 bg-stone-200 group-hover:bg-indigo-850 rounded-t-sm transition-all duration-500 h-16 flex items-end relative overflow-hidden">
                        <div class="bg-indigo-850 rounded-t-sm w-full transition-all duration-700" style="height: ${weekRate}%"></div>
                    </div>
                    <span class="text-[9px] font-bold text-stone-700 uppercase tracking-wider leading-none truncate w-full text-center">${weekLabel}</span>
                </div>
            `;
        }

        trendHTML += `</div>`;
        trendWrapper.innerHTML = trendHTML;
        contentWrapper.appendChild(trendWrapper);

        this.analyticsContentBox.appendChild(contentWrapper);
    }

    render() {
        this.habitCountBadge.innerText = `(${this.state.habits.length}/5)`;
        
        const todayStr = this.state.getLocalDateString(new Date());
        const today = new Date();
        const currentDayOfWeek = today.getDay(); 

        let totalTodayChecked = 0;
        let totalTodayScheduled = 0;
        let maxStreak = 0;
        let totalCompletions = 0;

        this.habitsContainer.innerHTML = '';

        if (this.state.habits.length === 0) {
            this.habitsContainer.innerHTML = `
                <div class="py-8 px-6 sm:px-8 border-2 border-dashed border-stone-300 rounded-[2rem] bg-stone-50/40 text-left fade-in shadow-inner relative overflow-hidden">
                    <div class="text-center mb-6">
                        <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-stone-900 text-white mb-3 shadow-md">
                            <i class="fa-solid fa-seedling text-lg" aria-hidden="true"></i>
                        </div>
                        <h2 class="text-base sm:text-lg font-black text-stone-900 uppercase tracking-tight mb-1">Begin Your Consistency Chain</h2>
                        <p class="text-xs text-stone-700 font-semibold max-w-sm mx-auto leading-relaxed">Let's build long-term compound momentum. Here is how to start effectively:</p>
                    </div>
                    
                    <div class="space-y-4 max-w-md mx-auto mb-6">
                        <div class="bg-white/80 p-4 rounded-2xl border border-stone-200/60 shadow-sm transition-all hover:border-stone-300">
                            <h3 class="text-xs font-black text-stone-955 uppercase tracking-wide flex items-center gap-2 mb-1.5">
                                <span class="w-5 h-5 rounded-full bg-stone-900 text-white text-[9px] font-black flex items-center justify-center" aria-hidden="true">1</span>
                                Focus Mode (5 habits max)
                            </h3>
                            <p class="text-xs text-stone-750 font-medium leading-relaxed mb-2.5">
                                Planning fatigue is the biggest killer of consistency. Focus Mode limits you to exactly 5 high-value routines so you don't burn out.
                            </p>
                            
                            <!-- Good Examples Sub-Panel -->
                            <div class="bg-stone-50 border border-stone-200/50 p-3 rounded-xl space-y-1.5">
                                <span class="block text-[10px] font-black text-stone-600 uppercase tracking-widest mb-1">Good examples:</span>
                                <div class="flex items-center gap-2 text-xs font-bold text-stone-850">
                                    <span class="text-indigo-800" aria-hidden="true">•</span> <span>Read 10 pages</span>
                                </div>
                                <div class="flex items-center gap-2 text-xs font-bold text-stone-850">
                                    <span class="text-emerald-800" aria-hidden="true">•</span> <span>Walk 10 minutes</span>
                                </div>
                                <div class="flex items-center gap-2 text-xs font-bold text-stone-850">
                                    <span class="text-rose-800" aria-hidden="true">•</span> <span>Drink water after waking</span>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white/80 p-4 rounded-2xl border border-stone-200/60 shadow-sm transition-all hover:border-stone-300">
                            <h3 class="text-xs font-black text-stone-955 uppercase tracking-wide flex items-center gap-2 mb-1.5">
                                <span class="w-5 h-5 rounded-full bg-stone-900 text-white text-[9px] font-black flex items-center justify-center" aria-hidden="true">2</span>
                                Showing up is the goal
                            </h3>
                            <p class="text-xs text-stone-750 font-medium leading-relaxed mb-0">
                                <strong class="text-stone-955 font-black">The goal isn't perfection. The goal is showing up tomorrow.</strong> Missing once is an accident; missing twice is the start of a bad habit. Tap the checkmark to lock in your daily win.
                            </p>
                        </div>
                    </div>
                    
                    <div class="text-center">
                        <button onclick="document.getElementById('btn-add-habit').click()" class="bg-stone-900 text-white font-black uppercase text-[10px] tracking-widest px-6 py-3 rounded-xl hover:bg-stone-850 transition-all inline-flex items-center gap-2 active:scale-95 shadow-md" aria-label="Add your first habit card">
                            <i class="fa-solid fa-plus text-[9px]" aria-hidden="true"></i> Create Your First Habit
                        </button>
                    </div>
                </div>
            `;
        }

        const badges = this.state.evaluateAchievements();
        const unlockedCount = badges.filter(b => b.unlocked).length;
        this.badgeCountUnlocked.innerText = `${unlockedCount}/6`;

        this.state.habits.forEach((h, idx) => {
            const isScheduledToday = isScheduledDay(h, today);
            if (isScheduledToday) {
                totalTodayScheduled++;
            }

            const checkedToday = isCompletedDay(h, todayStr);
            const skippedToday = isSkippedDay(h, todayStr);
            
            if (checkedToday) {
                totalTodayChecked++;
            }

            const streaks = this.state.calculateStreaks(h);
            if (streaks.max > maxStreak) maxStreak = streaks.max;
            
            const completionsCount = Object.keys(h.history).filter(date => h.history[date].completed).length;
            totalCompletions += completionsCount;

            const habitCard = document.createElement('div');
            habitCard.className = `bg-white/80 backdrop-blur-md border border-stone-200/50 rounded-2xl p-3.5 shadow-sm flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between transition-all duration-300 hover:shadow-md ${!isScheduledToday ? 'opacity-55' : ''}`;
            
            const checkColorClasses = {
                indigo: 'bg-indigo-700',
                emerald: 'bg-emerald-700',
                rose: 'bg-rose-700',
                amber: 'bg-amber-500',
                purple: 'bg-purple-700'
            };
            const activeColor = checkColorClasses[h.color] || 'bg-stone-900';

            habitCard.innerHTML = `
                <!-- Row 1: Core Action & Title, utilizing maximum width on mobile -->
                <div class="flex items-center gap-3 min-w-0">
                    <!-- Drag & Order Sorting control buttons with touch target (13px) -->
                    <div class="flex flex-col gap-0.5 items-center flex-shrink-0 text-stone-500 hover:text-stone-700 transition-colors">
                        <button type="button" class="btn-move-up hover:text-stone-900 p-0.5 text-[13px] leading-none" title="Move Up" aria-label="Move ${h.name} up in priority">
                            <i class="fa-solid fa-chevron-up" aria-hidden="true"></i>
                        </button>
                        <button type="button" class="btn-move-down hover:text-stone-900 p-0.5 text-[13px] leading-none" title="Move Down" aria-label="Move ${h.name} down in priority">
                            <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
                        </button>
                    </div>

                    <!-- Custom Checklist Button - Instantly checks off -->
                    <button class="cb-ripple w-6 h-6 rounded-lg border-2 border-stone-300 flex items-center justify-center flex-shrink-0 transition-all duration-300 focus:outline-none ${checkedToday ? activeColor + ' border-transparent' : (skippedToday ? 'bg-amber-500 border-transparent' : 'bg-transparent')} ${!isScheduledToday ? 'cursor-not-allowed opacity-40' : ''}" 
                        data-toggle-id="${h.id}" ${!isScheduledToday ? 'disabled' : ''} role="checkbox" aria-checked="${checkedToday ? 'true' : 'false'}" aria-label="Mark checkin for ${h.name} as complete">
                        ${skippedToday 
                            ? `<i class="fa-solid fa-forward text-[8px] text-white" aria-hidden="true"></i>` 
                            : `<i class="fa-solid fa-check text-[10px] text-white transition-opacity duration-300 ${checkedToday ? 'opacity-100' : 'opacity-0'}" aria-hidden="true"></i>`
                        }
                    </button>
                    
                    <!-- Information Details triggers -->
                    <div class="text-left min-w-0 flex-grow cursor-pointer" data-detail-id="${h.id}" role="button" aria-haspopup="dialog" aria-label="View history analysis metrics for ${h.name}">
                        <div class="flex items-center gap-1.5 flex-wrap">
                            <span class="text-xs select-none" aria-hidden="true">${h.emoji || '🧘'}</span>
                            <h2 class="text-xs sm:text-sm font-black text-stone-900 leading-tight truncate ${checkedToday ? 'line-through text-stone-500' : ''}">${h.name}</h2>
                            ${h.strategy === 'break' 
                                ? `<span class="text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-800 border border-rose-100 px-1 py-0.5 rounded flex-shrink-0">Break</span>`
                                : `<span class="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-800 border border-indigo-100 px-1 py-0.5 rounded flex-shrink-0">Build</span>`
                            }
                        </div>
                    </div>
                </div>

                <!-- Row 2: Secondary Metadata, Action Triggers & Sparkline (Indented to align perfectly under the text block on mobile) -->
                <div class="pl-12 sm:pl-0 flex flex-wrap items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                    <!-- Stats & Badges -->
                    <div class="flex items-center flex-wrap gap-1.5 text-left cursor-pointer" data-detail-id="${h.id}">
                        <span class="text-[10px] font-black uppercase tracking-wider text-rose-800 flex items-center gap-1">
                            <i class="fa-solid fa-fire text-[7px]" aria-hidden="true"></i> ${streaks.active}d streak
                        </span>
                        <span class="text-stone-500 text-[10px]" aria-hidden="true">•</span>
                        <span class="text-[10px] font-bold text-stone-700">${completionsCount} clears</span>
                        ${skippedToday 
                            ? `<span class="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Skipped</span>`
                            : ''
                        }
                        ${!isScheduledToday 
                            ? `<span class="text-[10px] font-black uppercase tracking-wider bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">Rest Day</span>`
                            : ''
                        }
                    </div>

                    <!-- Quick Action Buttons & Sparkline -->
                    <div class="flex items-center gap-2.5 ml-auto sm:ml-0">
                        <!-- Quick Reflection Note -->
                        <button type="button" class="btn-quick-note text-stone-500 hover:text-stone-900 p-1 text-xs focus:outline-none" title="Log Reflection Note" aria-label="Log Reflection Note for ${h.name}">
                            <i class="fa-regular fa-pen-to-square" aria-hidden="true"></i>
                        </button>
                        
                        <!-- Quick Skip Day -->
                        <button type="button" class="btn-quick-skip text-amber-700 hover:text-amber-900 p-1 text-xs focus:outline-none" title="Skip/Pause Day" aria-label="Skip/Pause day for ${h.name}">
                            <i class="fa-solid fa-forward" aria-hidden="true"></i>
                        </button>

                        <!-- Mini sparkline -->
                        <div class="flex items-center gap-0.5 bg-stone-50 border border-stone-100 px-1 py-1 rounded cursor-pointer" data-detail-id="${h.id}" role="button" aria-haspopup="dialog" aria-label="View history sparklines for ${h.name}">
                            ${this.getMiniSparklineHTML(h)}
                        </div>
                    </div>
                </div>
            `;

            // Move Up/Down actions
            habitCard.querySelector('.btn-move-up').addEventListener('click', (e) => {
                e.stopPropagation();
                this.state.moveHabit(idx, 'up');
                this.announce(`Moved ${h.name} up in list.`);
            });
            habitCard.querySelector('.btn-move-down').addEventListener('click', (e) => {
                e.stopPropagation();
                this.state.moveHabit(idx, 'down');
                this.announce(`Moved ${h.name} down in list.`);
            });

            // Checklist Toggle - Instant action
            habitCard.querySelector('[data-toggle-id]').addEventListener('click', (e) => {
                e.stopPropagation();
                const nextState = this.state.toggleCheck(h.id, todayStr);
                if (nextState === 'checked') {
                    ChimeEngine.playZenChime(this.state.audioTheme);
                    this.showToast('Checked off!');
                    this.announce(`Checked checkin log state for ${h.name}`);
                } else {
                    this.showToast('Cleared.');
                    this.announce(`Cleared checkin log state for ${h.name}`);
                }
            });

            // Quick Note trigger
            habitCard.querySelector('.btn-quick-note').addEventListener('click', (e) => {
                e.stopPropagation();
                this.checkinHabitIdInput.value = h.id;
                this.checkinNoteInput.value = h.history[todayStr]?.note || "";
                this.openAccessibleModal('checkin-note-modal', '#checkin-note-input');
            });

            // Quick Skip trigger
            habitCard.querySelector('.btn-quick-skip').addEventListener('click', (e) => {
                e.stopPropagation();
                const wasSkipped = skippedToday;
                this.state.toggleCheck(h.id, todayStr, wasSkipped ? "" : "Skipped Day override", !wasSkipped);
                this.showToast(wasSkipped ? 'Skip cleared.' : 'Day Paused.');
                this.announce(wasSkipped ? `Cleared skip day for ${h.name}` : `Paused day for ${h.name}`);
            });

            // Details trigger
            habitCard.querySelectorAll('[data-detail-id]').forEach(elem => {
                elem.addEventListener('click', () => {
                    this.openDetailModal(h.id);
                });
            });

            this.habitsContainer.appendChild(habitCard);
        });

        const rate = totalTodayScheduled > 0 ? Math.round((totalTodayChecked / totalTodayScheduled) * 100) : 0;
        document.getElementById('stat-today-completion').innerText = `${rate}%`;
        document.getElementById('stat-longest-streak').innerText = `${maxStreak}d`;
        document.getElementById('stat-total-completions').innerText = totalCompletions;
    }

    getMiniSparklineHTML(habit) {
        let html = '';
        const today = new Date();
        
        for (let i = 4; i >= 0; i--) {
            const checkDate = new Date();
            checkDate.setDate(today.getDate() - i);
            const dateStr = this.state.getLocalDateString(checkDate);
            
            const isScheduled = isScheduledDay(habit, checkDate);
            const completed = isCompletedDay(habit, dateStr);
            const skipped = isSkippedDay(habit, dateStr);
            
            const activeColorClass = {
                indigo: 'bg-indigo-700',
                emerald: 'bg-emerald-700',
                rose: 'bg-rose-700',
                amber: 'bg-amber-500',
                purple: 'bg-purple-700'
            }[habit.color] || 'bg-stone-900';

            let dotClass = 'bg-stone-200';
            let titleText = `${dateStr} : Rest Day`;
            if (isScheduled) {
                if (skipped) {
                    dotClass = 'bg-amber-500';
                    titleText = `${dateStr} : Skipped`;
                } else {
                    dotClass = completed ? activeColorClass : 'bg-stone-200 border border-stone-300/40';
                    titleText = `${dateStr} : ${completed ? 'Completed' : 'Missed'}`;
                }
            } else if (completed) {
                dotClass = activeColorClass;
                titleText = `${dateStr} : Completed (Rest Day)`;
            }

            html += `
                <span class="w-1.5 h-3.5 rounded-[1px] block ${dotClass}" title="${titleText}"></span>
            `;
        }
        return html;
    }

    openDetailModal(habitId) {
        const habit = this.state.habits.find(h => h.id === habitId);
        if (!habit) return;

        this.activeHabitId = habitId;
        this.detailHabitTitle.innerText = (habit.emoji || '🧘') + ' ' + habit.name;
        
        const colors = {
            indigo: 'bg-indigo-50 text-indigo-800 border-indigo-100',
            emerald: 'bg-emerald-50 text-emerald-800 border-emerald-100',
            rose: 'bg-rose-50 text-rose-800 border-rose-100',
            amber: 'bg-amber-50 text-amber-800 border-amber-100',
            purple: 'bg-purple-50 text-purple-800 border-purple-100'
        };
        this.detailCategory.innerText = habit.color.toUpperCase();
        this.detailCategory.className = `inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 border rounded ${colors[habit.color] || 'bg-stone-100 text-stone-750 border-stone-200'}`;

        if (habit.frequency === 'daily') {
            this.detailScheduleText.innerText = "Scheduled: Every Single Day";
        } else {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const mappedDays = habit.customDays.map(d => days[d]).join(', ');
            this.detailScheduleText.innerText = `Scheduled Days: ${mappedDays}`;
        }

        const streaks = this.state.calculateStreaks(habit);
        const completionsCount = Object.keys(habit.history).filter(k => habit.history[k].completed).length;
        
        const createdDate = new Date(habit.created);
        const diffTime = Math.abs(new Date() - createdDate);
        const totalActiveDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        const successRate = Math.round((completionsCount / totalActiveDays) * 100);

        this.detailActiveStreak.innerText = `${streaks.active}d`;
        this.detailMaxStreak.innerText = `${streaks.max}d`;
        this.detailTotal.innerText = completionsCount;
        this.detailRate.innerText = `${Math.min(100, successRate)}%`;

        this.renderContributionMap(habit);
        this.renderReflectionLogs(habit);

        this.openAccessibleModal('detail-habit-modal');
        this.announce(`Opened details and metrics analysis for ${habit.name}`);
        
        // Track horizontal scroll state discovery
        const scrollContainer = document.getElementById('heatmap-scroll-container');
        const fadeIndicator = document.getElementById('scroll-fade-indicator');
        if (scrollContainer && fadeIndicator) {
            scrollContainer.scrollLeft = scrollContainer.scrollWidth; // Start scroll from right (recent dates)
            scrollContainer.addEventListener('scroll', () => {
                const totalScrollable = scrollContainer.scrollWidth - scrollContainer.clientWidth;
                if (scrollContainer.scrollLeft >= totalScrollable - 5) {
                    fadeIndicator.style.opacity = '0';
                } else {
                    fadeIndicator.style.opacity = '1';
                }
            });
        }
    }

    renderReflectionLogs(habit) {
        this.detailReflectionLogs.innerHTML = '';
        const entries = Object.keys(habit.history)
            .filter(date => habit.history[date].note && habit.history[date].note.length > 0)
            .sort((a,b) => new Date(b) - new Date(a));

        if (entries.length === 0) {
            this.detailReflectionLogs.innerHTML = `<p class="text-[10px] text-stone-600 italic font-semibold leading-relaxed">No custom log notes added yet. Notes help reinforce mental motivation loops.</p>`;
            return;
        }

        entries.forEach(date => {
            const log = document.createElement('div');
            log.className = "border-b border-stone-100 pb-1.5 mb-1.5 last:border-b-0 last:mb-0";
            log.innerHTML = `
                <div class="flex justify-between text-[10px] font-black text-stone-600 uppercase tracking-tight mb-0.5">
                    <span>${date}</span>
                </div>
                <p class="text-[10px] text-stone-755 font-medium italic m-0">"${habit.history[date].note}"</p>
            `;
            this.detailReflectionLogs.appendChild(log);
        });
    }

    renderContributionMap(habit) {
        this.detailContributionGrid.innerHTML = '';
        
        const totalDays = 26 * 7;
        const cells = [];
        const today = new Date();

        for (let i = totalDays - 1; i >= 0; i--) {
            const cellDate = new Date();
            cellDate.setDate(today.getDate() - i);
            const dateStr = this.state.getLocalDateString(cellDate);
            
            const isScheduled = isScheduledDay(habit, cellDate);
            const completed = isCompletedDay(habit, dateStr);
            const skipped = isSkippedDay(habit, dateStr);

            cells.push({
                date: dateStr,
                completed: completed,
                skipped: skipped,
                isScheduled: isScheduled
            });
        }

        const cellColors = {
            indigo: 'bg-indigo-700',
            emerald: 'bg-emerald-700',
            rose: 'bg-rose-700',
            amber: 'bg-amber-500',
            purple: 'bg-purple-700'
        };
        const activeColor = cellColors[habit.color] || 'bg-stone-900';

        cells.forEach(cell => {
            const dot = document.createElement('button');
            dot.type = 'button';
            
            let cellBg = 'bg-stone-100 border border-stone-200/50';
            if (cell.isScheduled) {
                if (cell.skipped) {
                    cellBg = 'bg-amber-500 hover:bg-amber-600';
                } else {
                    cellBg = cell.completed ? activeColor : 'bg-stone-200/80 hover:bg-stone-300';
                }
            } else if (cell.completed) {
                cellBg = activeColor;
            }

            // Tapping target scale verified
            dot.className = `w-3.5 h-3.5 sm:w-2.5 sm:h-2.5 rounded-[3px] sm:rounded-[2px] transition-all hover:scale-125 cursor-pointer ${cellBg}`;
            const statusText = cell.completed ? 'Checked' : (cell.skipped ? 'Skipped' : (cell.isScheduled ? 'Missed' : 'Rest Day'));
            dot.setAttribute('aria-label', `${cell.date}: ${statusText}`);
            dot.setAttribute('title', `${cell.date} : ${statusText}`);
            
            // Live Inspector Interaction Block
            const inspectHandler = () => {
                const inspector = document.getElementById('heatmap-inspector');
                if (inspector) {
                    const formattedDate = new Date(cell.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                    });
                    
                    const badgeColors = cell.completed 
                        ? 'bg-indigo-100 text-indigo-800' 
                        : (cell.skipped ? 'bg-amber-100 text-amber-800' : (cell.isScheduled ? 'bg-red-100 text-red-800' : 'bg-stone-200 text-stone-700'));
                    
                    inspector.innerHTML = `<span class="text-stone-900 font-black">${formattedDate}</span>: <span class="uppercase tracking-wider text-[10px] font-black px-1.5 py-0.5 rounded ${badgeColors}">${statusText}</span>`;
                }
            };

            dot.addEventListener('mouseenter', inspectHandler);
            dot.addEventListener('focus', inspectHandler);

            dot.addEventListener('click', () => {
                this.state.toggleCheck(habit.id, cell.date);
                this.announce(`Toggled checkin log state for date ${cell.date}`);
                this.openDetailModal(habit.id);
            });

            this.detailContributionGrid.appendChild(dot);
        });
    }

    showToast(msg) {
        const toast = document.getElementById('toast-notification');
        toast.innerText = msg;
        toast.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
        toast.classList.add('opacity-100', 'translate-y-0');
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
            toast.classList.remove('opacity-100', 'translate-y-0');
        }, 3000);
    }
}


window.onload = function() {
    new AppController();
}