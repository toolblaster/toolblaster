 let compoundedChart;
        let yearlyTableData = [];

        // Global Currency configurations
        const CURRENCIES = {
            INR: { symbol: '₹', locale: 'en-IN', formatType: 'indian', defaultSwr: 3.5 },
            USD: { symbol: '$', locale: 'en-US', formatType: 'western', defaultSwr: 4.0 },
            EUR: { symbol: '€', locale: 'de-DE', formatType: 'western', defaultSwr: 4.0 },
            GBP: { symbol: '£', locale: 'en-GB', formatType: 'western', defaultSwr: 4.0 },
            AUD: { symbol: 'A$', locale: 'en-AU', formatType: 'western', defaultSwr: 4.0 },
            CAD: { symbol: 'C$', locale: 'en-CA', formatType: 'western', defaultSwr: 4.0 },
            JPY: { symbol: '¥', locale: 'ja-JP', formatType: 'western', defaultSwr: 4.0 },
            RUB: { symbol: '₽', locale: 'ru-RU', formatType: 'western', defaultSwr: 4.5 },
            ILS: { symbol: '₪', locale: 'he-IL', formatType: 'western', defaultSwr: 3.5 }
        };

        let currentCurrency = CURRENCIES.INR;

        // Change currency event listener
        function changeActiveCurrency() {
            const select = document.getElementById('currencySelect');
            if (!select) return;
            const code = select.value;
            currentCurrency = CURRENCIES[code] || CURRENCIES.INR;

            // Dynamically change visual labels on UI
            const symbols = document.querySelectorAll('.currency-symbol');
            symbols.forEach(el => {
                el.textContent = currentCurrency.symbol;
            });

            // Adjust SWR based on currency default safety rules when toggle is Off
            const swrInput = document.getElementById('swrInput');
            const swrSlider = document.getElementById('swrSlider');
            if (swrInput && swrSlider && !document.getElementById('swrToggle').checked) {
                swrInput.value = currentCurrency.defaultSwr;
                swrSlider.value = currentCurrency.defaultSwr;
                updateSliderIndicator('swrSlider');
            }

            updateBenchmarkIndexes(code);
            runSimulation();
        }

        function updateBenchmarkIndexes(code) {
            const container = document.getElementById('benchmarkContainer');
            const compliance = document.getElementById('complianceText');
            if (!container) return;

            if (code === 'INR') {
                container.innerHTML = `
                    <div><strong class="text-stone-855 block">Nifty 50 Index:</strong> <span class="text-red-900 font-bold">12% - 14% p.a.</span></div>
                    <div><strong class="text-stone-855 block">Midcap 150 Index:</strong> <span class="text-red-900 font-bold">14% - 16% p.a.</span></div>
                    <div><strong class="text-stone-855 block">Nifty Hybrid 35:65 Index:</strong> <span class="text-red-900 font-bold">10% - 11.5% p.a.</span></div>
                    <div><strong class="text-stone-855 block">Conservative Debt:</strong> <span class="text-blue-900 font-bold">6% - 7.5% p.a.</span></div>
                `;
                compliance.innerHTML = `Retirement projections are strictly illustrative estimates. Under SEBI regulations, historical CAGR parameters are not guarantees of future performance. Past performance is not indicative of future returns.`;
            } else if (code === 'RUB') {
                container.innerHTML = `
                    <div><strong class="text-stone-855 block">MOEX Russia Index:</strong> <span class="text-red-900 font-bold">11% - 14% p.a.</span></div>
                    <div><strong class="text-stone-855 block">Russian Corporate Bonds:</strong> <span class="text-red-900 font-bold">8% - 10% p.a.</span></div>
                    <div><strong class="text-stone-855 block">OFZ Govt Bonds:</strong> <span class="text-red-900 font-bold">7.5% - 9% p.a.</span></div>
                    <div><strong class="text-stone-855 block">Sberbank Savings:</strong> <span class="text-blue-900 font-bold">4% - 6% p.a.</span></div>
                `;
                compliance.innerHTML = `Retirement projections are strictly illustrative estimates. MOEX and local deposit yield profiles carry specific inflationary and macroeconomic risk profiles. Past performance is not indicative of future returns.`;
            } else if (code === 'ILS') {
                container.innerHTML = `
                    <div><strong class="text-stone-855 block">TA-125 Index (Israel):</strong> <span class="text-red-900 font-bold">7% - 9% p.a.</span></div>
                    <div><strong class="text-stone-855 block">S&P 500 Hedged (ILS):</strong> <span class="text-red-900 font-bold">8% - 10% p.a.</span></div>
                    <div><strong class="text-stone-855 block">Tel-Gov State Bonds:</strong> <span class="text-red-900 font-bold">3% - 4.5% p.a.</span></div>
                    <div><strong class="text-stone-855 block">Local Shekel Deposit:</strong> <span class="text-blue-900 font-bold">2.5% - 3.8% p.a.</span></div>
                `;
                compliance.innerHTML = `Retirement projections are strictly illustrative estimates. Local Bank of Israel rate benchmarks and TA-125 indexing profiles carry macroeconomic yield risks.`;
            } else {
                // General global (USD, EUR, GBP, AUD, CAD etc)
                container.innerHTML = `
                    <div><strong class="text-stone-855 block">S&P 500 Index (US):</strong> <span class="text-red-900 font-bold">9% - 11% p.a.</span></div>
                    <div><strong class="text-stone-855 block">MSCI World Index:</strong> <span class="text-red-900 font-bold">7.5% - 9.5% p.a.</span></div>
                    <div><strong class="text-stone-855 block">Moderate Balanced Port:</strong> <span class="text-red-900 font-bold">6% - 8% p.a.</span></div>
                    <div><strong class="text-stone-855 block">Safe Treasury Bonds:</strong> <span class="text-blue-900 font-bold">3.5% - 5% p.a.</span></div>
                `;
                compliance.innerHTML = `Retirement projections are strictly illustrative estimates based on compounding principles. Historical benchmark index returns are not guarantees of future portfolio results.`;
            }
        }

        function formatVal(val) {
            return new Intl.NumberFormat(currentCurrency.locale, {
                style: 'currency', currency: document.getElementById('currencySelect').value || 'INR', maximumFractionDigits: 0
            }).format(Math.round(val));
        }

        // --- Core Formatting Helpers ---
        function formatIndianShort(value) {
            if (currentCurrency.formatType === 'indian') {
                if (value >= 10000000) {
                    return (value / 10000000).toFixed(2).replace(/\.00$/, '').replace(/(\.[0-9])0$/, '$1') + ' Crore';
                } else if (value >= 100000) {
                    return (value / 100000).toFixed(2).replace(/\.00$/, '').replace(/(\.[0-9])0$/, '$1') + ' Lakh';
                } else if (value >= 1000) {
                    return (value / 1000).toFixed(1).replace(/\.0$/, '') + ' Thousand';
                }
            } else {
                if (value >= 1000000000) {
                    return (value / 1000000000).toFixed(2).replace(/\.00$/, '').replace(/(\.[0-9])0$/, '$1') + ' Billion';
                } else if (value >= 1000000) {
                    return (value / 1000000).toFixed(2).replace(/\.00$/, '').replace(/(\.[0-9])0$/, '$1') + ' Million';
                } else if (value >= 1000) {
                    return (value / 1000).toFixed(1).replace(/\.0$/, '') + ' K';
                }
            }
            return value.toString();
        }

        function displayToast(msg) {
            const toast = document.getElementById('notification-toast');
            if (toast) {
                toast.textContent = msg;
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 3000);
            }
        }

        // --- Core Value Adjusters ---
        function adjustValue(id, step, fallbackMin, fallbackMax) {
            const el = document.getElementById(id);
            if (!el) return;
            // Dynamically read min and max properties directly from DOM attributes rather than relying on stale hardcoded step limits
            const min = el.hasAttribute('min') ? parseInt(el.min) : fallbackMin;
            const max = el.hasAttribute('max') ? parseInt(el.max) : fallbackMax;
            let val = (parseInt(el.value) || 0) + step;
            el.value = Math.max(min, Math.min(max, val));
            if (id === 'ageInput' || id === 'retireAgeInput' || id === 'lifeExpectancyInput') {
                validateAgeSettings();
            } else {
                if (id === 'stepUpInput') {
                    document.getElementById('stepUpSlider').value = el.value;
                    updateSliderIndicator('stepUpSlider');
                }
                runSimulation();
            }
        }

        function adjustValueFloat(id, step, fallbackMin, fallbackMax) {
            const el = document.getElementById(id);
            if (!el) return;
            const min = el.hasAttribute('min') ? parseFloat(el.min) : fallbackMin;
            const max = el.hasAttribute('max') ? parseFloat(el.max) : fallbackMax;
            let val = (parseFloat(el.value) || 0) + step;
            el.value = parseFloat(Math.max(min, Math.min(max, val)).toFixed(1));
            
            // Sync with corresponding sliders if applicable
            if (id === 'inflationInput') {
                document.getElementById('inflationSlider').value = el.value;
                updateSliderIndicator('inflationSlider');
            } else if (id === 'stepUpInput') {
                document.getElementById('stepUpSlider').value = el.value;
                updateSliderIndicator('stepUpSlider');
            } else if (id === 'swrInput') {
                document.getElementById('swrSlider').value = el.value;
                updateSliderIndicator('swrSlider');
            }
            runSimulation();
        }

        function adjustReturnRate(id, step) {
            const el = document.getElementById(id);
            if (!el) return;
            let val = (parseFloat(el.value) || 0) + step;
            el.value = parseFloat(val.toFixed(1));
            runSimulation();
        }

        function validateAgeSettings() {
            const currentAgeEl = document.getElementById('ageInput');
            const retireAgeEl = document.getElementById('retireAgeInput');
            const lifeExpectancyEl = document.getElementById('lifeExpectancyInput');
            let cAge = parseInt(currentAgeEl.value) || 28;
            let rAge = parseInt(retireAgeEl.value) || 45;
            let lAge = parseInt(lifeExpectancyEl.value) || 85;

            // Enforce sequential boundaries dynamically on DOM attributes to prevent stepper conflicts
            retireAgeEl.min = cAge + 1;
            lifeExpectancyEl.min = rAge + 1;

            if (rAge <= cAge) {
                rAge = cAge + 1;
                retireAgeEl.value = Math.min(75, rAge);
            }
            if (lAge <= rAge) {
                lAge = rAge + 1;
                lifeExpectancyEl.value = Math.min(100, lAge);
            }
            runSimulation();
        }

        // Monthly Expense Synchronization
        function syncExpenseSlider() {
            const slider = document.getElementById('expenseSlider');
            const input = document.getElementById('expenseInput');
            input.value = slider.value;
            updateSliderIndicator('expenseSlider');
            runSimulation();
        }

        function syncExpenseInput() {
            const slider = document.getElementById('expenseSlider');
            const input = document.getElementById('expenseInput');
            let val = Math.max(10000, Math.min(500000, parseInt(input.value) || 10000));
            input.value = val;
            slider.value = val;
            updateSliderIndicator('expenseSlider');
            runSimulation();
        }

        function adjustExpense(step) {
            const input = document.getElementById('expenseInput');
            let val = (parseInt(input.value) || 0) + step;
            input.value = Math.max(10000, val);
            syncExpenseInput();
        }

        // Portfolio networth synchronization
        function syncNetworthSlider() {
            const slider = document.getElementById('networthSlider');
            const input = document.getElementById('networthInput');
            input.value = slider.value;
            updateSliderIndicator('networthSlider');
            runSimulation();
        }

        function syncNetworthInput() {
            const slider = document.getElementById('networthSlider');
            const input = document.getElementById('networthInput');
            let val = Math.max(0, parseInt(input.value) || 0);
            input.value = val;
            slider.value = Math.min(slider.max, val);
            updateSliderIndicator('networthSlider');
            runSimulation();
        }

        function adjustNetworth(step) {
            const input = document.getElementById('networthInput');
            let val = (parseInt(input.value) || 0) + step;
            input.value = Math.max(0, val);
            syncNetworthInput();
        }

        // Monthly Savings Slider synchronization
        function syncSavingsSlider() {
            const slider = document.getElementById('savingsSlider');
            const input = document.getElementById('savingsInput');
            input.value = slider.value;
            updateSliderIndicator('savingsSlider');
            runSimulation();
        }

        function syncSavingsInput() {
            const slider = document.getElementById('savingsSlider');
            const input = document.getElementById('savingsInput');
            let val = Math.max(1000, Math.min(250000, parseInt(input.value) || 1000));
            input.value = val;
            slider.value = val;
            updateSliderIndicator('savingsSlider');
            runSimulation();
        }

        // --- Inflation parameter synchronizer ---
        function syncInflationSlider() {
            const slider = document.getElementById('inflationSlider');
            const input = document.getElementById('inflationInput');
            input.value = slider.value;
            updateSliderIndicator('inflationSlider');
            runSimulation();
        }

        function syncInflationInput() {
            const slider = document.getElementById('inflationSlider');
            const input = document.getElementById('inflationInput');
            let val = Math.max(2, Math.min(12, parseFloat(input.value) || 2));
            input.value = val;
            slider.value = val;
            updateSliderIndicator('inflationSlider');
            runSimulation();
        }

        // Step up synchronizer
        function syncStepUpSlider() {
            const slider = document.getElementById('stepUpSlider');
            const input = document.getElementById('stepUpInput');
            input.value = slider.value;
            updateSliderIndicator('stepUpSlider');
            runSimulation();
        }

        function syncStepUpInput() {
            const slider = document.getElementById('stepUpSlider');
            const input = document.getElementById('stepUpInput');
            let val = Math.max(0, Math.min(25, parseInt(input.value) || 0));
            input.value = val;
            slider.value = val;
            updateSliderIndicator('stepUpSlider');
            runSimulation();
        }

        // SWR synchronizer
        function syncSwrSlider() {
            const slider = document.getElementById('swrSlider');
            const input = document.getElementById('swrInput');
            input.value = slider.value;
            updateSliderIndicator('swrSlider');
            runSimulation();
        }

        function syncSwrInput() {
            const slider = document.getElementById('swrSlider');
            const input = document.getElementById('swrInput');
            let val = Math.max(2, Math.min(8, parseFloat(input.value) || 2));
            input.value = val;
            slider.value = val;
            updateSliderIndicator('swrSlider');
            runSimulation();
        }

        function adjustSavings(step) {
            const input = document.getElementById('savingsInput');
            let val = (parseInt(input.value) || 0) + step;
            input.value = Math.max(1000, val);
            syncSavingsInput();
        }

        function updateSliderIndicator(id) {
            const el = document.getElementById(id);
            if (!el) return;
            const pct = ((el.value - el.min) / (el.max - el.min)) * 100;
            el.style.setProperty('--fill-percentage', `${pct}%`);
        }

        // Control the styling, interaction lock, and form focus elements of advanced assumptions groups
        function toggleFrictionGroup(type) {
            const toggle = document.getElementById(`${type}Toggle`);
            const group = document.getElementById(`${type}Group`);
            const input = document.getElementById(`${type}Input`);
            const slider = document.getElementById(`${type}Slider`);
            const steppers = group.querySelectorAll('.stepper-button');

            if (toggle.checked) {
                group.classList.remove('opacity-50', 'pointer-events-none');
                if (input) input.disabled = false;
                if (slider) slider.disabled = false;
                steppers.forEach(btn => btn.disabled = false);
            } else {
                group.classList.add('opacity-50', 'pointer-events-none');
                if (input) input.disabled = true;
                if (slider) slider.disabled = true;
                steppers.forEach(btn => btn.disabled = true);
                
                // Reset visual defaults immediately upon toggle unchecking to ensure absolute transparency
                if (type === 'swr') {
                    if (input) input.value = currentCurrency.defaultSwr;
                    if (slider) slider.value = currentCurrency.defaultSwr;
                } else if (type === 'inflation') {
                    if (input) input.value = 6;
                    if (slider) slider.value = 6;
                } else if (type === 'stepUp') {
                    if (input) input.value = 10;
                    if (slider) slider.value = 10;
                }
            }
            updateSliderIndicator(`${type}Slider`);
            runSimulation();
        }

        // ACCORDION TOGGLE MECHANICS
        function toggleAdvancedAccordion() {
            const accordionBody = document.getElementById('advancedAccordionBody');
            const arrow = document.getElementById('accordionArrow');
            if (!accordionBody || !arrow) return;

            const isHidden = accordionBody.classList.toggle('hidden');
            if (isHidden) {
                arrow.style.transform = 'rotate(0deg)';
            } else {
                arrow.style.transform = 'rotate(180deg)';
                // Re-sync visual sliders upon opening to prevent rendering discrepancies
                updateSliderIndicator('inflationSlider');
                updateSliderIndicator('stepUpSlider');
                updateSliderIndicator('swrSlider');
            }
        }

        // --- CORE FIRE ENGINE MATHEMATICS ---
        function runSimulation() {
            const currentAge = parseInt(document.getElementById('ageInput').value) || 28;
            const retireAge = parseInt(document.getElementById('retireAgeInput').value) || 45;
            const lifeExpectancy = parseInt(document.getElementById('lifeExpectancyInput').value) || 85;
            const currentExpenses = parseFloat(document.getElementById('expenseInput').value) || 50000;
            const startPortfolio = parseFloat(document.getElementById('networthInput').value) || 0;
            const startSavings = parseFloat(document.getElementById('savingsInput').value) || 0;

            const preRetireReturn = parseFloat(document.getElementById('preReturnInput').value) || 12;
            const postRetireReturn = parseFloat(document.getElementById('postReturnInput').value) || 8;
            
            // Check Toggles status and override values mathematically
            const isInflationActive = document.getElementById('inflationToggle').checked;
            const inflation = isInflationActive ? (parseFloat(document.getElementById('inflationInput').value) || 6) : 0;

            const isStepUpActive = document.getElementById('stepUpToggle').checked;
            const stepUpRate = isStepUpActive ? (parseFloat(document.getElementById('stepUpInput').value) || 10) : 0;

            const isSwrActive = document.getElementById('swrToggle').checked;
            const swr = isSwrActive ? (parseFloat(document.getElementById('swrInput').value) || 4) : currentCurrency.defaultSwr;

            const curSymbol = currentCurrency.symbol;

            // Sync Slider Display word annotations
            document.getElementById('expenseWords').textContent = `(${curSymbol}${formatIndianShort(currentExpenses)} / month)`;
            document.getElementById('networthWords').textContent = `(${curSymbol}${formatIndianShort(startPortfolio)})`;
            document.getElementById('savingsWords').textContent = `(${curSymbol}${formatIndianShort(startSavings)} / month)`;

            const yearsToRetire = retireAge - currentAge;
            const annualExpenses = currentExpenses * 12;

            // Inflation-adjusted annual expenses at target retirement age
            const adjustedAnnualExpensesAtRetire = annualExpenses * Math.pow(1 + (inflation / 100), yearsToRetire);
            
            // Traditional, Lean, and Fat FIRE targets
            const targetCorpusFloor = adjustedAnnualExpensesAtRetire / (swr / 100);
            const leanFireTarget = targetCorpusFloor * 0.75;
            const fatFireTarget = targetCorpusFloor * 1.25;

            // Coast FIRE target today calculation
            const coastFireTargetToday = targetCorpusFloor / Math.pow(1 + (preRetireReturn / 100), yearsToRetire);

            // Accumulation Phase Compounding Loop
            let runningPortfolio = startPortfolio;
            let currentMonthlySavings = startSavings;
            let totalInvested = startPortfolio;

            yearlyTableData = [];

            // Add Initial Year Record
            yearlyTableData.push({
                age: currentAge,
                phase: "Accumulation",
                annualInput: 0,
                annualGains: 0,
                closingNetworth: startPortfolio,
                isDepleted: false
            });

            // Tracking Milestone Achieved Ages
            let leanFireAchievedAge = null;
            let traditionalFireAchievedAge = null;
            let fatFireAchievedAge = null;

            // Pre-retirement compounding loop (yearly)
            const preMonthlyRate = (preRetireReturn / 12) / 100;
            for (let y = 1; y <= yearsToRetire; y++) {
                let annualSavingsInjected = 0;
                let preYearStarting = runningPortfolio;

                // Model beginning-of-month monthly deposits compounding
                for (let m = 1; m <= 12; m++) {
                    runningPortfolio = (runningPortfolio + currentMonthlySavings) * (1 + preMonthlyRate);
                    annualSavingsInjected += currentMonthlySavings;
                }

                totalInvested += annualSavingsInjected;
                const yearGains = runningPortfolio - preYearStarting - annualSavingsInjected;

                yearlyTableData.push({
                    age: currentAge + y,
                    phase: "Accumulation",
                    annualInput: annualSavingsInjected,
                    annualGains: yearGains,
                    closingNetworth: runningPortfolio,
                    isDepleted: false
                });

                // Check milestone progress dynamically during the timeline using the exact, active SWR
                const currentAgeLoop = currentAge + y;
                const adjustedExpensesLoop = annualExpenses * Math.pow(1 + (inflation / 100), y);
                const localTargetFloor = adjustedExpensesLoop / (swr / 100);

                if (runningPortfolio >= (localTargetFloor * 0.75) && !leanFireAchievedAge) {
                    leanFireAchievedAge = currentAgeLoop;
                }
                if (runningPortfolio >= localTargetFloor && !traditionalFireAchievedAge) {
                    traditionalFireAchievedAge = currentAgeLoop;
                }
                if (runningPortfolio >= (localTargetFloor * 1.25) && !fatFireAchievedAge) {
                    fatFireAchievedAge = currentAgeLoop;
                }

                // Apply Annual Savings Step-up
                currentMonthlySavings = currentMonthlySavings * (1 + (stepUpRate / 100));
            }

            const projectedCorpusValueAtRetire = runningPortfolio;

            // Drawdown / Distribution Phase Loop (Up to Dynamic Life Expectancy or Depletion)
            let retirementRunningPortfolio = projectedCorpusValueAtRetire;
            let retirementYearlyExpenses = adjustedAnnualExpensesAtRetire;
            const maxRetirementAge = lifeExpectancy; // Dynamically bound to User Input
            const yearsInRetirement = maxRetirementAge - retireAge;

            let ageCompletedDrawdown = retireAge;
            let ranOutOfMoney = false;

            // Mathematical drawdown simulates prudent Beginning-Of-Year withdrawals (conservative asset-safe convention)
            for (let y = 1; y <= yearsInRetirement; y++) {
                const age = retireAge + y;
                if (retirementRunningPortfolio <= 0) {
                    if (!ranOutOfMoney) {
                        ranOutOfMoney = true;
                        yearlyTableData.push({
                            age: age,
                            phase: "Depleted",
                            annualInput: 0,
                            annualGains: 0,
                            closingNetworth: 0,
                            isDepleted: true
                        });
                    }
                    break; // Stop rendering extra empty/negative timeline periods
                }

                const postYearStarting = retirementRunningPortfolio;
                
                // Systematic Withdrawal occurs at beginning of the year
                const actualWithdrawal = Math.min(retirementRunningPortfolio, retirementYearlyExpenses);
                retirementRunningPortfolio -= actualWithdrawal;

                // Remaining funds compound annually at post-retirement rate
                retirementRunningPortfolio = retirementRunningPortfolio * (1 + (postRetireReturn / 100));
                
                const yearGains = retirementRunningPortfolio - postYearStarting + actualWithdrawal;

                yearlyTableData.push({
                    age: age,
                    phase: "Drawdown",
                    annualInput: -actualWithdrawal,
                    annualGains: yearGains,
                    closingNetworth: retirementRunningPortfolio,
                    isDepleted: false
                });

                // Expenses adjust upwards with inflation each year
                retirementYearlyExpenses = retirementYearlyExpenses * (1 + (inflation / 100));
                ageCompletedDrawdown = age;
            }

            // Output Primary Metrics
            document.getElementById('projectedCorpus').textContent = formatVal(projectedCorpusValueAtRetire);
            document.getElementById('targetCorpus').textContent = formatVal(targetCorpusFloor);

            // Determine FIRE status and display details
            const fireStatusEl = document.getElementById('fireStatusVal');
            if (projectedCorpusValueAtRetire >= targetCorpusFloor) {
                fireStatusEl.textContent = "🎉 Achieved!";
                fireStatusEl.className = "text-xs sm:text-[11px] font-black text-emerald-800 mt-0.5";
            } else if (projectedCorpusValueAtRetire >= leanFireTarget) {
                fireStatusEl.textContent = "⛺ Lean FIRE Ready";
                fireStatusEl.className = "text-xs sm:text-[11px] font-black text-amber-700 mt-0.5";
            } else {
                const deficit = targetCorpusFloor - projectedCorpusValueAtRetire;
                fireStatusEl.textContent = `${formatIndianShort(deficit)} Gap`;
                fireStatusEl.className = "text-xs sm:text-[11px] font-black text-red-700 mt-0.5";
            }

            // Display Milestone Values, Progress bars, and Dynamic Milestones Ages
            document.getElementById('leanFireCorpus').textContent = formatVal(leanFireTarget);
            const leanProgress = Math.min(100, (projectedCorpusValueAtRetire / leanFireTarget) * 100);
            const leanAgeInfo = leanFireAchievedAge ? ` (Achieved at Age ${leanFireAchievedAge})` : " (At target)";
            document.getElementById('leanFireProgress').textContent = `${leanProgress.toFixed(0)}% Achieved${leanAgeInfo}`;

            document.getElementById('fatFireCorpus').textContent = formatVal(fatFireTarget);
            const fatProgress = Math.min(100, (projectedCorpusValueAtRetire / fatFireTarget) * 100);
            const fatAgeInfo = fatFireAchievedAge ? ` (Achieved at Age ${fatFireAchievedAge})` : " (At target)";
            document.getElementById('fatFireProgress').textContent = `${fatProgress.toFixed(0)}% Achieved${fatAgeInfo}`;

            // Coast FIRE Progression Logic
            document.getElementById('coastFireTarget').textContent = formatVal(coastFireTargetToday);
            const coastProgress = Math.min(100, (startPortfolio / coastFireTargetToday) * 100);
            document.getElementById('coastFireProgress').textContent = `${coastProgress.toFixed(0)}% Achieved`;

            const coastAdvice = document.getElementById('coastFireAdvice');
            if (startPortfolio >= coastFireTargetToday) {
                coastAdvice.textContent = "🎉 Coast FIRE Achieved! Compounding is locked in.";
                coastAdvice.className = "text-[9px] text-emerald-800 font-black mt-0.5 leading-tight";
            } else {
                const coastDeficit = coastFireTargetToday - startPortfolio;
                coastAdvice.textContent = `Need ${curSymbol}${formatIndianShort(coastDeficit)} more today to coast smoothly.`;
                coastAdvice.className = "text-[9px] text-rose-800 font-extrabold mt-0.5 leading-tight";
            }

            // Calculate the Procrastination Penalty (3-Year Delay Cost)
            let delayedPortfolio = startPortfolio;
            let delayedSavings = startSavings;
            // Delay by 3 years, so wealth accumulation is modeled only for (yearsToRetire - 3) years
            const accumulationYearsDelayed = Math.max(0, yearsToRetire - 3);
            for (let y = 1; y <= accumulationYearsDelayed; y++) {
                for (let m = 1; m <= 12; m++) {
                    delayedPortfolio = (delayedPortfolio + delayedSavings) * (1 + preMonthlyRate);
                }
                delayedSavings = delayedSavings * (1 + (stepUpRate / 100));
            }
            const delayLossPenalty = Math.max(0, projectedCorpusValueAtRetire - delayedPortfolio);

            // Dynamic Actionable advisor reports
            const insightBox = document.getElementById('smartInsight');
            const textEl = document.getElementById('smartInsightText');
            if (insightBox && textEl) {
                insightBox.classList.remove('hidden');
                let advice = "";

                if (projectedCorpusValueAtRetire >= targetCorpusFloor) {
                    if (ranOutOfMoney) {
                        advice = `🎉 <strong>Congratulations:</strong> You hit your FIRE target at Age <strong>${retireAge}</strong>. Your retirement savings compound nicely and sustain your lifestyle until Age <strong>${ageCompletedDrawdown}</strong> before depletion occurs.`;
                    } else {
                        advice = `🚀 <strong>Outstanding Profile!</strong> You achieve full financial freedom by Age <strong>${retireAge}</strong>. Your investments compound faster than withdrawals, creating infinite wealth.`;
                    }
                } else {
                    const extraSavingsNeeded = solveRequiredMonthlySavings(targetCorpusFloor, startPortfolio, preRetireReturn, yearsToRetire, stepUpRate);
                    advice = `💡 <strong>FIRE Optimization Plan:</strong> Based on current monthly savings (${curSymbol}${formatIndianShort(startSavings)}), you will face a deficit of <strong>${formatVal(targetCorpusFloor - projectedCorpusValueAtRetire)}</strong> at age ${retireAge}. Increasing your monthly savings to <strong>${curSymbol}${formatIndianShort(extraSavingsNeeded)}</strong> will help you achieve full financial independence on time.`;
                }

                // Append the procrastination penalty insights dynamically
                if (delayLossPenalty > 0) {
                    advice += `<br><span class="text-stone-600 block mt-2 text-[10px] border-t border-stone-200/50 pt-2"><i class="fa-solid fa-hourglass-half text-amber-600"></i> <strong>Procrastination Penalty:</strong> Delaying your retirement savings plan by just 3 years will cost you <strong>${formatVal(delayLossPenalty)}</strong> in lost compounding gains at retirement. Start today!</span>`;
                }

                textEl.innerHTML = advice;

                // Alert indicators based on expectations
                const warnBox = document.getElementById('smartFinancialValidation');
                warnBox.innerHTML = '';
                warnBox.classList.add('hidden');

                if (preRetireReturn > 18.0) {
                    warnBox.classList.remove('hidden');
                    warnBox.innerHTML = `
                        <div class="p-2 bg-amber-50 border border-amber-250 text-amber-900 rounded-xl text-[10px] flex items-start gap-1.5 leading-relaxed">
                            <span>⚠️</span>
                            <span><strong>Highly Optimistic Return Assumption (${preRetireReturn}%):</strong> Compounded portfolio growths exceeding 18% p.a. are generally non-sustainable over long-term intervals (10+ years). Adjust rates downwards to maintain realistic wealth plans.</span>
                        </div>
                    `;
                }
            }

            renderChartTimeline(yearlyTableData, retireAge);
            renderTableLedger(yearlyTableData);
        }

        // --- Dynamic Reverse Solver (Monthly Savings Needed) ---
        function solveRequiredMonthlySavings(targetM, startNet, expectedCAGR, years, stepUpPct) {
            const netCAGR = expectedCAGR / 100;
            const effNetRate = Math.pow(1 + netCAGR, 1/12) - 1;
            const stepUpFactor = stepUpPct / 100;

            let low = 1;
            let high = targetM;
            for (let iter = 0; iter < 30; iter++) {
                let mid = (low + high) / 2;
                let runningNet = startNet;
                let monthlyContrib = mid;
                for (let y = 1; y <= years; y++) {
                    for (let m = 1; m <= 12; m++) {
                        runningNet = (runningNet + monthlyContrib) * (1 + effNetRate);
                    }
                    monthlyContrib = monthlyContrib * (1 + stepUpFactor);
                }
                if (runningNet < targetM) {
                    low = mid;
                } else {
                    high = mid;
                }
            }
            return (low + high) / 2;
        }

        // --- Render Visuals & Charts ---
        function renderChartTimeline(schedule, retireAge) {
            const canvas = document.getElementById('fireDrawdownChart');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');

            if (typeof Chart === 'undefined') {
                setTimeout(() => renderChartTimeline(schedule, retireAge), 300);
                return;
            }

            const labels = schedule.map(row => `Age ${row.age}`);
            const values = schedule.map(row => Math.round(row.closingNetworth));
            const pointColors = schedule.map(row => row.age === retireAge ? '#b91c1c' : 'transparent');
            const pointRadii = schedule.map(row => row.age === retireAge ? 6 : 0);

            if (compoundedChart) {
                compoundedChart.data.labels = labels;
                compoundedChart.data.datasets[0].data = values;
                compoundedChart.data.datasets[0].pointBackgroundColor = pointColors;
                compoundedChart.data.datasets[0].pointRadius = pointRadii;
                compoundedChart.update();
            } else {
                compoundedChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: values,
                            borderColor: '#b91c1c',
                            backgroundColor: 'rgba(185, 28, 28, 0.05)',
                            borderWidth: 2,
                            fill: true,
                            pointBackgroundColor: pointColors,
                            pointRadius: pointRadii,
                            pointHoverRadius: 8,
                            tension: 0.15
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: { label: (c) => ` Portfolio: ${formatVal(c.parsed.y)}` },
                                bodyFont: { family: 'Inter', size: 10 },
                                cornerRadius: 8,
                                backgroundColor: '#0f172a'
                            }
                        },
                        scales: {
                            x: { grid: { display: false }, ticks: { font: { size: 9 } } },
                            y: { ticks: { font: { size: 9 }, callback: (v) => formatIndianShort(v) } }
                        }
                    }
                });
            }
        }

        function renderTableLedger(schedule) {
            const body = document.getElementById('growthTableBody');
            if (!body) return;
            body.innerHTML = '';

            const maxPortfolio = Math.max(...schedule.map(r => r.closingNetworth));

            schedule.forEach(row => {
                const tr = document.createElement('tr');
                
                if (row.isDepleted) {
                    // Striking Visual indicator marker row for fully depleted retirement savings
                    tr.className = "bg-amber-50 hover:bg-amber-100 transition-colors font-semibold text-stone-900 border-l-4 border-amber-500";
                    tr.innerHTML = `
                        <td class="p-3 font-semibold text-amber-900">${row.age}</td>
                        <td class="p-3">
                            <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-200 text-amber-900">
                                ⚠ Depleted
                            </span>
                        </td>
                        <td class="p-3 text-[10px] sm:text-xs leading-normal italic text-amber-800" colspan="3">
                            Portfolio completely exhausted. Supportable retirement lifestyle ends.
                        </td>
                    `;
                } else {
                    tr.className = row.phase === 'Drawdown' ? "bg-red-50/20 hover:bg-red-50/40 transition-colors" : "hover:bg-stone-50 transition-colors";
                    const formattedInput = row.annualInput === 0 ? '0' : formatVal(row.annualInput);
                    const isDrawdown = row.annualInput < 0;

                    tr.innerHTML = `
                        <td class="p-3 font-semibold text-slate-800">${row.age}</td>
                        <td class="p-3">
                            <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${row.phase === 'Drawdown' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}">
                                ${row.phase}
                            </span>
                        </td>
                        <td class="p-3 font-medium ${isDrawdown ? 'text-rose-700 font-extrabold' : 'text-slate-600'}">
                            ${formattedInput}
                        </td>
                        <td class="p-3 font-medium text-emerald-800">${formatVal(row.annualGains)}</td>
                        <td class="p-3 font-extrabold text-slate-900 text-center">
                            ${formatVal(row.closingNetworth)}
                            <div class="progress-bar-bg h-1 w-full bg-slate-100 rounded-full mt-1 overflow-hidden print-hide">
                                <div class="bg-red-700 h-full" style="width: ${Math.min(100, (row.closingNetworth / maxPortfolio) * 100)}%"></div>
                            </div>
                        </td>
                    `;
                }
                body.appendChild(tr);
            });
        }

        function toggleGrowthTable() {
            const container = document.getElementById('growthTableContainer');
            const btn = document.getElementById('toggleGrowthTableBtn');
            if (!container || !btn) return;

            const isHidden = container.classList.toggle('hidden');
            btn.textContent = isHidden ? "Show Year-by-Year Ledger" : "Hide Year-by-Year Ledger";

            if (!isHidden) {
                container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        function exportSimulationToCSV() {
            if (yearlyTableData.length === 0) {
                displayToast("No simulation ledger available to export!");
                return;
            }
            
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Age,Phase,Annual Savings or Withdrawal,Gains Generated,Closing Net Worth\n";
            
            yearlyTableData.forEach(row => {
                if (row.isDepleted) {
                    csvContent += `${row.age},DEPLETED,0,0,0\n`;
                } else {
                    csvContent += `${row.age},${row.phase},${Math.round(row.annualInput)},${Math.round(row.annualGains)},${Math.round(row.closingNetworth)}\n`;
                }
            });
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `FIRE_Retirement_Plan_Ledger.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            displayToast("Progression Ledger CSV downloaded successfully!");
        }

        // Onload Initiators
        window.onload = function() {
            setupComponentSynchronizers();
            validateAgeSettings();
            updateSliderIndicator('expenseSlider');
            updateSliderIndicator('networthSlider');
            updateSliderIndicator('savingsSlider');
            
            // Sync with default Off states and ensure their slider colors are filled accurately
            toggleFrictionGroup('inflation');
            toggleFrictionGroup('stepUp');
            toggleFrictionGroup('swr');
        };

        function setupComponentSynchronizers() {
            // Bind sliders with manual entries directly
            document.getElementById('expenseSlider').value = 50000;
            document.getElementById('networthSlider').value = 500000;
            document.getElementById('savingsSlider').value = 25000;
            document.getElementById('inflationSlider').value = 6;
            document.getElementById('stepUpSlider').value = 10;
            document.getElementById('swrSlider').value = 4;
        }