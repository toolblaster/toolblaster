 const fundPresets = {
            index: { 
                title: "Index Fund Calculator",
                desc: "Calculate growth based on broad basket market tracker indices (like Nifty 50) with lower costs.",
                return: 12.0, expense: 0.15, taxClass: "equity", 
                benchmark: "Nifty 50 Tri", cap: 15.0
            },
            large: { 
                title: "Large Cap Fund Calculator",
                desc: "Simulate investments in India's top 100 bluechip companies representing stable active options.",
                return: 13.0, expense: 0.95, taxClass: "equity", 
                benchmark: "Nifty 100 Tri", cap: 15.0
            },
            mid: { 
                title: "Mid Cap Fund Calculator",
                desc: "Model dynamic medium-sized active business enterprises which carry medium-high risk with elevated potential returns.",
                return: 15.0, expense: 1.15, taxClass: "equity", 
                benchmark: "Nifty Midcap 150 Tri", cap: 20.0
            },
            small: { 
                title: "Small Cap Fund Calculator",
                desc: "Simulate highly volatile active schemes concentrating capital in early emerging micro corporations.",
                return: 17.0, expense: 1.35, taxClass: "equity", 
                benchmark: "Nifty Smallcap 250 Tri", cap: 25.0
            },
            multi: { 
                title: "Multi Cap Fund Calculator",
                desc: "Calculate diversified portfolios maintaining strict allocations of 25% each to Large, Mid, and Small Cap assets.",
                return: 14.0, expense: 1.25, taxClass: "equity", 
                benchmark: "Nifty 500 Multicap 50:25:25", cap: 18.0
            },
            flexi: { 
                title: "Flexi Cap Fund Calculator",
                desc: "Active dynamic strategy where fund managers allocate capital freely across various sized businesses according to trends.",
                return: 13.5, expense: 1.10, taxClass: "equity", 
                benchmark: "Nifty 500 Tri", cap: 17.0
            },
            hybrid: { 
                title: "Balanced / Hybrid Fund Calculator",
                desc: "Calculations based on a combination of equity allocations (for growth) and debt placements (for stability).",
                return: 11.0, expense: 1.05, taxClass: "equity", 
                benchmark: "Crisil Hybrid 35+65", cap: 14.0
            },
            equity: { 
                title: "General Equity Fund Calculator",
                desc: "General purpose diversified active equity schemes compounding capital over market cycles.",
                return: 12.5, expense: 1.20, taxClass: "equity", 
                benchmark: "Nifty 500 Tri", cap: 16.0
            },
            debt: { 
                title: "Debt Fund Calculator",
                desc: "Model standard capital preservation fixed income securities including corporate and sovereign debt bonds.",
                return: 7.0, expense: 0.45, taxClass: "debt", 
                benchmark: "Crisil Composite Debt", cap: 9.5
            }
        };

        let currentAsset = 'index';
        let currentInvestType = 'sip';
        let currentPlanType = 'direct';
        let currentMethod = 'standard';
        let currentRiskProfile = 'custom';
        let compoundedChart;
        let yearlyTableData = [];

        // --- Core Helpers ---
        function formatVal(val) {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency', currency: 'INR', maximumFractionDigits: 0
            }).format(Math.round(val));
        }

        // Modified logic supporting clean 2 Crore scale formats
        function formatIndianShort(value) {
            if (value >= 10000000) {
                return (value / 10000000).toFixed(2).replace(/\.00$/, '').replace(/(\.[0-9])0$/, '$1') + ' Crore';
            } else if (value >= 100000) {
                return (value / 100000).toFixed(2).replace(/\.00$/, '').replace(/(\.[0-9])0$/, '$1') + ' Lakh';
            } else if (value >= 1000) {
                return (value / 1000).toFixed(1).replace(/\.0$/, '') + ' Thousand';
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

        function syncAmountSlider() {
            const slider = document.getElementById('amountSlider');
            const input = document.getElementById('amountInput');
            input.value = slider.value;
            updateSliderIndicator('amountSlider');
            runSimulation();
        }

        function syncAmountInput() {
            const slider = document.getElementById('amountSlider');
            const input = document.getElementById('amountInput');
            let maxVal = 100000; // SIP default standard limit
            if (currentMethod === 'goal_seek') {
                maxVal = 100000000; // 10 Crore for Goal Seek
            } else if (currentInvestType === 'lumpsum') {
                maxVal = 20000000; // Raised to 2 Crore for Lumpsum Standard
            }
            let val = Math.max(500, Math.min(maxVal, parseInt(input.value) || 500));
            input.value = val;
            slider.value = Math.min(slider.max, val);
            updateSliderIndicator('amountSlider');
            runSimulation();
        }

        function adjustAmount(step) {
            const input = document.getElementById('amountInput');
            let val = (parseInt(input.value) || 0) + step;
            input.value = Math.max(500, val);
            syncAmountInput();
        }

        function setAmountPreset(val) {
            document.getElementById('amountInput').value = val;
            syncAmountInput();
        }

        function syncReturnSlider() {
            const slider = document.getElementById('returnSlider');
            const input = document.getElementById('returnInput');
            input.value = slider.value;
            updateSliderIndicator('returnSlider');
            checkAndSetCustomRiskProfile(parseFloat(slider.value));
            runSimulation();
        }

        function syncReturnInput() {
            const slider = document.getElementById('returnSlider');
            const input = document.getElementById('returnInput');
            let val = Math.max(2, Math.min(30, parseFloat(input.value) || 2));
            input.value = val;
            slider.value = val;
            updateSliderIndicator('returnSlider');
            checkAndSetCustomRiskProfile(val);
            runSimulation();
        }

        function adjustReturn(step) {
            const input = document.getElementById('returnInput');
            let val = (parseFloat(input.value) || 0) + step;
            input.value = parseFloat(val.toFixed(1));
            syncReturnInput();
        }

        function updateSliderIndicator(id) {
            const el = document.getElementById(id);
            if (!el) return;
            const pct = ((el.value - el.min) / (el.max - el.min)) * 100;
            el.style.setProperty('--fill-percentage', `${pct}%`);
        }

        // --- Risk Profiles Presets System ---
        function setRiskProfile(profile, runSim = true) {
            currentRiskProfile = profile;
            
            const consBtn = document.getElementById('riskProfileCons');
            const modBtn = document.getElementById('riskProfileMod');
            const aggrBtn = document.getElementById('riskProfileAggr');
            const customBtn = document.getElementById('riskProfileCustom');
            
            if (!consBtn || !modBtn || !aggrBtn || !customBtn) return;

            const btns = [consBtn, modBtn, aggrBtn, customBtn];
            btns.forEach(btn => {
                btn.className = "py-1 text-[9px] sm:text-[10px] font-bold rounded-lg transition-all text-center";
            });

            const activeClass = "bg-red-700 text-white shadow-sm";
            const inactiveClass = "text-stone-750 hover:text-stone-900";
            const customInactiveClass = "text-stone-400 cursor-default";

            if (profile === 'conservative') {
                consBtn.className += " " + activeClass;
                modBtn.className += " " + inactiveClass;
                aggrBtn.className += " " + inactiveClass;
                customBtn.className += " " + customInactiveClass;
                
                document.getElementById('returnInput').value = 10;
                document.getElementById('returnSlider').value = 10;
                updateSliderIndicator('returnSlider');
            } else if (profile === 'moderate') {
                consBtn.className += " " + inactiveClass;
                modBtn.className += " " + activeClass;
                aggrBtn.className += " " + inactiveClass;
                customBtn.className += " " + customInactiveClass;
                
                document.getElementById('returnInput').value = 12;
                document.getElementById('returnSlider').value = 12;
                updateSliderIndicator('returnSlider');
            } else if (profile === 'aggressive') {
                consBtn.className += " " + inactiveClass;
                modBtn.className += " " + inactiveClass;
                aggrBtn.className += " " + activeClass;
                customBtn.className += " " + customInactiveClass;
                
                document.getElementById('returnInput').value = 15;
                document.getElementById('returnSlider').value = 15;
                updateSliderIndicator('returnSlider');
            } else { // custom
                consBtn.className += " " + inactiveClass;
                modBtn.className += " " + inactiveClass;
                aggrBtn.className += " " + inactiveClass;
                customBtn.className += " bg-stone-300 text-stone-850 shadow-sm";
            }

            if (runSim) runSimulation();
        }

        function checkAndSetCustomRiskProfile(rate) {
            if (rate === 10) {
                setRiskProfile('conservative', false);
            } else if (rate === 12) {
                setRiskProfile('moderate', false);
            } else if (rate === 15) {
                setRiskProfile('aggressive', false);
            } else {
                setRiskProfile('custom', false);
            }
        }

        // --- Core UI State Switchers ---
        function setAssetClass(mode) {
            currentAsset = mode;
            document.querySelectorAll('.loan-tab-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            const activeBtn = document.getElementById(`btn-${mode}`);
            if (activeBtn) {
                activeBtn.classList.add('active');
                activeBtn.setAttribute('aria-selected', 'true');
            }

            const preset = fundPresets[mode];
            document.getElementById('calculatorTitle').textContent = preset.title;
            document.getElementById('calculatorDescription').textContent = preset.desc;

            // Set assumed defaults
            document.getElementById('returnInput').value = preset.return;
            document.getElementById('returnSlider').value = preset.return;
            document.getElementById('expenseInput').value = preset.expense;
            document.getElementById('expenseSlider').value = preset.expense;

            // Show appropriate tax UI
            document.getElementById('debtTaxGroup').classList.toggle('hidden', preset.taxClass !== 'debt');

            updateSliderIndicator('returnSlider');
            updateSliderIndicator('expenseSlider');
            
            // Sync current risk profile switcher selection seamlessly
            checkAndSetCustomRiskProfile(preset.return);
            runSimulation();
        }

        function setInvestType(type) {
            currentInvestType = type;
            document.querySelectorAll('.tab-mode-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            const activeBtn = document.getElementById(`${type}ModeBtn`);
            if (activeBtn) {
                activeBtn.classList.add('active');
                activeBtn.setAttribute('aria-selected', 'true');
            }

            const label = document.getElementById('amountLabelText');
            const slider = document.getElementById('amountSlider');
            const input = document.getElementById('amountInput');

            // Handle step-up greyed-out visual warnings without element deletion
            const stepUpContainer = document.getElementById('sipStepUpContainer');
            const stepUpToggle = document.getElementById('stepUpToggle');
            const stepUpDisabledMsg = document.getElementById('stepUpDisabledMessage');

            if (currentMethod === 'standard') {
                if (type === 'sip') {
                    label.textContent = "Monthly SIP Contribution (₹)";
                    slider.min = 500; slider.max = 100000; slider.step = 500;
                    input.value = 10000;
                    
                    // Enable Step-up UI controls cleanly
                    stepUpContainer.style.opacity = "1";
                    stepUpContainer.style.pointerEvents = "auto";
                    stepUpToggle.disabled = false;
                    stepUpDisabledMsg.classList.add('hidden');
                    document.getElementById('stepUpInputGroup').classList.toggle('hidden', !stepUpToggle.checked);
                } else {
                    label.textContent = "One-Time Lumpsum Contribution (₹)";
                    slider.min = 5000; slider.max = 20000000; slider.step = 5000; // Raised max boundary dynamically to 2 Crore
                    input.value = 100000;
                    
                    // Gracefully grey-out step-up container instead of hiding
                    stepUpContainer.style.opacity = "0.5";
                    stepUpContainer.style.pointerEvents = "none";
                    stepUpToggle.disabled = true;
                    stepUpDisabledMsg.classList.remove('hidden');
                    document.getElementById('stepUpInputGroup').classList.add('hidden');
                }
            } else {
                label.textContent = "Target Goal Wealth Corpus (₹)";
                slider.min = 50000; slider.max = 100000000; slider.step = 50000;
                input.value = 5000000;
                
                // Gracefully grey-out step-up container instead of hiding
                stepUpContainer.style.opacity = "0.5";
                stepUpContainer.style.pointerEvents = "none";
                stepUpToggle.disabled = true;
                stepUpDisabledMsg.classList.remove('hidden');
                document.getElementById('stepUpInputGroup').classList.add('hidden');
            }

            syncAmountInput();
        }

        function setPlanType(type) {
            currentPlanType = type;
            document.getElementById('planTypeDirect').className = type === 'direct' 
                ? "px-2 py-0.5 rounded-md bg-red-700 text-white shadow-sm transition-all" 
                : "px-2 py-0.5 rounded-md text-stone-600 hover:text-stone-850 ml-0.5 transition-all";
            document.getElementById('planTypeRegular').className = type === 'regular' 
                ? "px-2 py-0.5 rounded-md bg-red-700 text-white shadow-sm transition-all" 
                : "px-2 py-0.5 rounded-md text-stone-600 hover:text-stone-850 ml-0.5 transition-all";
            runSimulation();
        }

        function setCalcMethod(method) {
            currentMethod = method;
            
            const standardBtn = document.getElementById('methodStandardBtn');
            const goalSeekBtn = document.getElementById('methodGoalSeekBtn');
            
            standardBtn.className = method === 'standard'
                ? "flex-1 text-center py-1 text-xxs font-bold rounded-lg transition-all bg-red-700 text-white shadow-sm font-semibold flex items-center justify-center gap-1"
                : "flex-1 text-center py-1 text-xxs font-bold rounded-lg transition-all text-stone-600 hover:text-stone-855 font-semibold flex items-center justify-center gap-1";
            
            goalSeekBtn.className = method === 'goal_seek'
                ? "flex-1 text-center py-1 text-xxs font-bold rounded-lg transition-all bg-red-700 text-white shadow-sm font-semibold flex items-center justify-center gap-1"
                : "flex-1 text-center py-1 text-xxs font-bold rounded-lg transition-all text-stone-600 hover:text-stone-855 font-semibold flex items-center justify-center gap-1";

            standardBtn.setAttribute('aria-selected', method === 'standard' ? 'true' : 'false');
            goalSeekBtn.setAttribute('aria-selected', method === 'goal_seek' ? 'true' : 'false');

            const presetRow = document.getElementById('amountPresetRow');
            const mainTitle = document.getElementById('mainMetricCardTitle');

            if (method === 'standard') {
                presetRow.classList.remove('hidden');
                mainTitle.textContent = "Total Value";
            } else {
                presetRow.classList.add('hidden');
                mainTitle.textContent = "Target Goal";
            }

            setInvestType(currentInvestType);
        }

        // --- Core Inverse Goal Seek Math Solvers ---
        function solveStartingSIP(targetM, expectedCAGR, expenseRatio, years, isStepUp, stepUpPct, planType) {
            const drag = planType === 'regular' ? 1.0 : 0;
            const netCAGR = Math.max(0.1, expectedCAGR - (expenseRatio + drag)) / 100;
            const effNetRate = Math.pow(1 + netCAGR, 1/12) - 1; // Effective monthly compounding rate
            
            let low = 1;
            let high = targetM;
            for (let iter = 0; iter < 30; iter++) {
                let mid = (low + high) / 2;
                let runningNet = 0;
                let monthlyContrib = mid;
                for (let y = 1; y <= years; y++) {
                    for (let m = 1; m <= 12; m++) {
                        runningNet = (runningNet + monthlyContrib) * (1 + effNetRate);
                    }
                    if (isStepUp) {
                        monthlyContrib = monthlyContrib * (1 + stepUpPct);
                    }
                }
                if (runningNet < targetM) {
                    low = mid;
                } else {
                    high = mid;
                }
            }
            return (low + high) / 2;
        }

        function solveStartingLumpsum(targetM, expectedCAGR, expenseRatio, years, planType) {
            const drag = planType === 'regular' ? 1.0 : 0;
            const netCAGR = Math.max(0.1, expectedCAGR - (expenseRatio + drag)) / 100;
            return targetM / Math.pow(1 + netCAGR, years);
        }

        function runCompoundingCalc(investAmount, expectedCAGR, expenseRatio, years, isStepUp, stepUpPct, currentInvestType, planType) {
            if (years <= 0) return 0;
            const drag = planType === 'regular' ? 1.0 : 0;
            const netCAGR = Math.max(0.1, expectedCAGR - (expenseRatio + drag)) / 100;
            const effNetRate = Math.pow(1 + netCAGR, 1/12) - 1; // Effective monthly compounding rate
            
            let runningNet = 0;
            if (currentInvestType === 'sip') {
                let monthlyContrib = investAmount;
                for (let y = 1; y <= years; y++) {
                    for (let m = 1; m <= 12; m++) {
                        runningNet = (runningNet + monthlyContrib) * (1 + effNetRate);
                    }
                    if (isStepUp) {
                        monthlyContrib = monthlyContrib * (1 + stepUpPct);
                    }
                }
            } else {
                runningNet = investAmount * Math.pow(1 + netCAGR, years);
            }
            return runningNet;
        }

        function runSimulation() {
            const preset = fundPresets[currentAsset];
            let sliderVal = parseFloat(document.getElementById('amountInput').value) || 0;
            const expectedCAGR = parseFloat(document.getElementById('returnInput').value) || 0;
            const expenseRatio = parseFloat(document.getElementById('expenseInput').value) || 0;
            const years = parseInt(document.getElementById('periodInput').value) || 5;

            const isStepUp = document.getElementById('stepUpToggle')?.checked;
            const stepUpPct = isStepUp ? parseFloat(document.getElementById('stepUpInput').value) / 100 : 0;

            const isInflation = document.getElementById('inflationToggle')?.checked;
            const inflationRate = isInflation ? parseFloat(document.getElementById('inflationInput').value) / 100 : 0;

            const isTaxEnabled = document.getElementById('taxToggle')?.checked;

            // Strict visual synchronization of the input label
            const labelEl = document.getElementById('amountLabelText');
            if (labelEl) {
                if (currentMethod === 'standard') {
                    labelEl.textContent = currentInvestType === 'sip' 
                        ? "Monthly SIP Contribution (₹)" 
                        : "One-Time Lumpsum Contribution (₹)";
                } else {
                    labelEl.textContent = "Target Goal Wealth Corpus (₹)";
                }
            }

            // Display dynamic numbers as words using clean Indian formatting values
            if (currentMethod === 'standard') {
                document.getElementById('amountInWords').textContent = currentInvestType === 'sip' 
                    ? `(₹${formatIndianShort(sliderVal)} / month)`
                    : `(₹${formatIndianShort(sliderVal)})`;
            } else {
                document.getElementById('amountInWords').textContent = `Target: ₹${formatIndianShort(sliderVal)}`;
            }

            // Expense plan drag addition
            const planDrag = currentPlanType === 'regular' ? 1.0 : 0;
            const netCAGR = Math.max(0.1, expectedCAGR - (expenseRatio + planDrag)) / 100;
            const grossCAGR = expectedCAGR / 100;

            // Effective monthly rates for precise beginning-of-month mathematical projections
            const effNetRate = Math.pow(1 + netCAGR, 1/12) - 1;
            const effGrossRate = Math.pow(1 + grossCAGR, 1/12) - 1;

            let solvedAmount = 0;
            let investAmount = sliderVal;

            if (currentMethod === 'goal_seek') {
                if (currentInvestType === 'sip') {
                    solvedAmount = solveStartingSIP(sliderVal, expectedCAGR, expenseRatio, years, isStepUp, stepUpPct, currentPlanType);
                } else {
                    solvedAmount = solveStartingLumpsum(sliderVal, expectedCAGR, expenseRatio, years, currentPlanType);
                }
                investAmount = solvedAmount;
            }

            let grossWealth = 0;
            let netWealth = 0;
            let totalInvested = 0;

            yearlyTableData = [];

            // Tracking annual capital gains to calculate realistic Section 112A annual tax harvesting
            let accruedTaxPool = 0;
            let lastYearNetValue = 0;
            let lastYearInvested = 0;

            if (currentInvestType === 'sip') {
                let monthlyContrib = investAmount;
                let runningGross = 0;
                let runningNet = 0;

                for (let y = 1; y <= years; y++) {
                    let yearInvested = 0;
                    for (let m = 1; m <= 12; m++) {
                        yearInvested += monthlyContrib;
                        runningGross = (runningGross + monthlyContrib) * (1 + effGrossRate);
                        runningNet = (runningNet + monthlyContrib) * (1 + effNetRate);
                    }

                    totalInvested += yearInvested;
                    const yearLoss = (runningGross - totalInvested) - (runningNet - totalInvested);

                    // Mathematical modeling of annual LTCG tax harvesting (Section 112A) or income slab taxation
                    if (isTaxEnabled) {
                        const annualNetIncrease = runningNet - lastYearNetValue;
                        const annualInvestedIncrease = totalInvested - lastYearInvested;
                        const annualGainsAccrued = Math.max(0, annualNetIncrease - annualInvestedIncrease);

                        if (preset.taxClass === 'equity') {
                            // Deduct 12.5% tax strictly on gains exceeding the standard ₹1.25 Lakh annual exemption
                            if (annualGainsAccrued > 125000) {
                                const annualTaxDue = (annualGainsAccrued - 125000) * 0.125;
                                accruedTaxPool += annualTaxDue;
                            }
                        } else {
                            // Debt Fund taxation: added to annual income, taxed entirely at standard slab rates
                            const slabRate = parseFloat(document.getElementById('taxSlab').value) || 0.3;
                            const annualTaxDue = annualGainsAccrued * slabRate;
                            accruedTaxPool += annualTaxDue;
                        }
                    }

                    yearlyTableData.push({
                        year: y,
                        invested: totalInvested,
                        grossGains: Math.max(0, runningGross - totalInvested),
                        netGains: Math.max(0, runningNet - totalInvested),
                        expenseLoss: Math.max(0, yearLoss),
                        netWealth: runningNet
                    });

                    lastYearNetValue = runningNet;
                    lastYearInvested = totalInvested;

                    if (isStepUp) {
                        monthlyContrib = monthlyContrib * (1 + stepUpPct);
                    }
                }
                grossWealth = runningGross;
                netWealth = runningNet;
            } else {
                totalInvested = investAmount;
                let runningGross = investAmount;
                let runningNet = investAmount;

                for (let y = 1; y <= years; y++) {
                    runningGross = runningGross * (1 + grossCAGR);
                    runningNet = runningNet * (1 + netCAGR);

                    if (isTaxEnabled) {
                        const annualNetIncrease = runningNet - lastYearNetValue;
                        const annualGainsAccrued = y === 1 ? Math.max(0, runningNet - totalInvested) : Math.max(0, annualNetIncrease);

                        if (preset.taxClass === 'equity') {
                            if (annualGainsAccrued > 125000) {
                                const annualTaxDue = (annualGainsAccrued - 125000) * 0.125;
                                accruedTaxPool += annualTaxDue;
                            }
                        } else {
                            const slabRate = parseFloat(document.getElementById('taxSlab').value) || 0.3;
                            const annualTaxDue = annualGainsAccrued * slabRate;
                            accruedTaxPool += annualTaxDue;
                        }
                    }

                    yearlyTableData.push({
                        year: y,
                        invested: totalInvested,
                        grossGains: Math.max(0, runningGross - totalInvested),
                        netGains: Math.max(0, runningNet - totalInvested),
                        expenseLoss: Math.max(0, runningGross - runningNet),
                        netWealth: runningNet
                    });

                    lastYearNetValue = runningNet;
                }
                grossWealth = runningGross;
                netWealth = runningNet;
            }

            // --- frictional deductions computation ---
            const totalGains = Math.max(0, netWealth - totalInvested);
            const expenseLoss = Math.max(0, grossWealth - netWealth);

            let calculatedTax = accruedTaxPool;
            let postTaxInflationValue = netWealth - calculatedTax;

            let inflationDragAmount = 0;
            if (isInflation && inflationRate > 0) {
                const discountedCorpus = postTaxInflationValue / Math.pow(1 + inflationRate, years);
                inflationDragAmount = postTaxInflationValue - discountedCorpus;
                postTaxInflationValue = discountedCorpus;
            }

            // Render Master Metric Boards
            document.getElementById('investedAmount').textContent = formatVal(totalInvested);
            document.getElementById('gainsAmount').textContent = formatVal(totalGains);
            document.getElementById('totalValue').textContent = currentMethod === 'goal_seek' ? formatVal(sliderVal) : formatVal(netWealth);

            // Output Precise mathematical rates (XIRR beginning-of-month and Absolute returns ratios)
            const absoluteGainsPct = totalInvested > 0 ? (totalGains / totalInvested) * 100 : 0;
            document.getElementById('personalXirrVal').textContent = `${expectedCAGR.toFixed(1)}% p.a.`;
            document.getElementById('absoluteReturnVal').textContent = `${absoluteGainsPct.toFixed(1)}%`;

            // Compute direct vs regular wealth leakage values
            let directNetWealth = runCompoundingCalc(investAmount, expectedCAGR, expenseRatio, years, isStepUp, stepUpPct, currentInvestType, 'direct');
            let regularLeakageDifference = Math.max(0, directNetWealth - netWealth);

            if (currentPlanType === 'direct') {
                document.getElementById('grossWealthLabel').textContent = "Wealth generated without Fees:";
                document.getElementById('grossWealthVal').textContent = formatVal(grossWealth);
                document.getElementById('leakageLabel').textContent = "Lost to Expense Ratio:";
                document.getElementById('expenseLossVal').textContent = formatVal(expenseLoss);
                document.getElementById('leakageAlertDescription').innerHTML = "Even small decimal changes in Expense Ratios lock away massive compounded chunks of wealth. Opting for Direct Plan Equity Mutual Funds can save lakhs.";
            } else {
                document.getElementById('grossWealthLabel').textContent = "Wealth with Direct Plan (No Broker Commission):";
                document.getElementById('grossWealthVal').textContent = formatVal(directNetWealth);
                document.getElementById('leakageLabel').textContent = "Lost to Regular Plan Agent Fees:";
                document.getElementById('expenseLossVal').textContent = formatVal(regularLeakageDifference);
                document.getElementById('leakageAlertDescription').innerHTML = `Toggling Regular Plan adds 1.0% p.a. broker commission drag, losing you an extra <strong class="text-rose-900">${formatVal(regularLeakageDifference)}</strong> over Direct Plan options!`;
            }

            // Expense Ratio Category Badge Setup
            const expText = document.getElementById('expenseClassText');
            const totalDragRatio = expenseRatio + planDrag;
            if (totalDragRatio <= 0.4) {
                expText.textContent = "Ultra Low (Passive)"; expText.className = "text-[9px] font-black text-emerald-800 uppercase tracking-wider";
            } else if (totalDragRatio <= 1.0) {
                expText.textContent = "Low Cost Direct"; expText.className = "text-[9px] font-black text-blue-800 uppercase tracking-wider";
            } else {
                expText.textContent = "Active Regular Fees"; expText.className = "text-[9px] font-black text-red-800 uppercase tracking-wider";
            }

            // Tax & Inflation breakdown display updates
            const extraContainer = document.getElementById('taxInflationBreakdownCard');
            const taxRow = document.getElementById('taxRow');
            const inflationRow = document.getElementById('inflationRow');

            if (isTaxEnabled || isInflation) {
                extraContainer.classList.remove('hidden');
                
                if (isTaxEnabled) {
                    taxRow.classList.remove('hidden');
                    document.getElementById('taxLabel').textContent = preset.taxClass === 'equity' 
                        ? 'Est. Annualized Equity Tax (12.5%):'
                        : `Est. Annualized Debt Tax (${(parseFloat(document.getElementById('taxSlab').value)*100).toFixed(0)}%):`;
                    document.getElementById('taxDeductionVal').textContent = `-${formatVal(calculatedTax)}`;
                } else { taxRow.classList.add('hidden'); }

                if (isInflation) {
                    inflationRow.classList.remove('hidden');
                    document.getElementById('inflationDeductionVal').textContent = `-${formatVal(inflationDragAmount)}`;
                } else { inflationRow.classList.add('hidden'); }

                document.getElementById('postTaxInflationVal').textContent = formatVal(postTaxInflationValue);
            } else {
                extraContainer.classList.add('hidden');
            }

            // Cost of Delay Calculation Logic
            const delayCard = document.getElementById('delaySimulatorCard');
            const delay1 = document.getElementById('delay1Loss');
            const delay3 = document.getElementById('delay3Loss');
            const delay5 = document.getElementById('delay5Loss');
            const delayExplanation = document.getElementById('delayExplanation');

            if (currentMethod === 'standard') {
                let w1 = runCompoundingCalc(investAmount, expectedCAGR, expenseRatio, years - 1, isStepUp, stepUpPct, currentInvestType, currentPlanType);
                let w3 = runCompoundingCalc(investAmount, expectedCAGR, expenseRatio, years - 3, isStepUp, stepUpPct, currentInvestType, currentPlanType);
                let w5 = runCompoundingCalc(investAmount, expectedCAGR, expenseRatio, years - 5, isStepUp, stepUpPct, currentInvestType, currentPlanType);

                delay1.textContent = years > 1 ? formatVal(netWealth - w1) : 'N/A';
                delay3.textContent = years > 3 ? formatVal(netWealth - w3) : 'N/A';
                delay5.textContent = years > 5 ? formatVal(netWealth - w5) : 'N/A';
                delayExplanation.innerHTML = years > 3 
                    ? `Delaying your investment start by 3 years will cost you <strong class="text-amber-955">${formatVal(netWealth - w3)}</strong> in lost returns.` 
                    : "Increase your tenure duration to check delay leakage effects.";
            } else {
                // Goal Seek Mode: display required contribution additions if starting delayed
                let c1 = 0, c3 = 0, c5 = 0;
                if (currentInvestType === 'sip') {
                    c1 = solveStartingSIP(sliderVal, expectedCAGR, expenseRatio, years - 1, isStepUp, stepUpPct, currentPlanType);
                    c3 = solveStartingSIP(sliderVal, expectedCAGR, expenseRatio, years - 3, isStepUp, stepUpPct, currentPlanType);
                    c5 = solveStartingSIP(sliderVal, expectedCAGR, expenseRatio, years - 5, isStepUp, stepUpPct, currentPlanType);
                } else {
                    c1 = solveStartingLumpsum(sliderVal, expectedCAGR, expenseRatio, years - 1, currentPlanType);
                    c3 = solveStartingLumpsum(sliderVal, expectedCAGR, expenseRatio, years - 3, currentPlanType);
                    c5 = solveStartingLumpsum(sliderVal, expectedCAGR, expenseRatio, years - 5, currentPlanType);
                }

                const suffix = currentInvestType === 'sip' ? '/mo' : '';

                delay1.textContent = years > 1 ? `+${formatVal(c1 - solvedAmount)}${suffix}` : 'N/A';
                delay3.textContent = years > 3 ? `+${formatVal(c3 - solvedAmount)}${suffix}` : 'N/A';
                delay5.textContent = years > 5 ? `+${formatVal(c5 - solvedAmount)}${suffix}` : 'N/A';
                delayExplanation.innerHTML = years > 3 
                    ? `Delaying by 3 years means you must invest <strong class="text-amber-955">+${formatVal(c3 - solvedAmount)}${suffix}</strong> more to hit your goal.` 
                    : "Increase tenure duration to check delay parameters.";
            }

            // Dynamic Chart Rendering
            renderBreakdownChart([totalInvested, totalGains], ['Principal', 'Returns']);

            // Build Yearly Growth table rows
            renderTableRecords(yearlyTableData);

            // Inject Custom Smart Actionable Advisors
            generateSmartFinancialAdvice(years, expectedCAGR, expenseRatio, solvedAmount);
        }

        // --- Render Visuals & Tables ---
        function renderBreakdownChart(data, labels) {
            const canvas = document.getElementById('compoundingDoughnutChart');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');

            if (typeof Chart === 'undefined') {
                // Fallback retry block if library load is delayed on mobile networks
                setTimeout(() => renderBreakdownChart(data, labels), 300);
                return;
            }

            if (compoundedChart) {
                compoundedChart.data.datasets[0].data = data;
                compoundedChart.update();
            } else {
                compoundedChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: data,
                            backgroundColor: ['#1e293b', '#b91c1c'],
                            hoverOffset: 6,
                            borderRadius: 4,
                            spacing: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '70%',
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: { label: (c) => ` ${c.label}: ${formatVal(c.parsed)}` },
                                bodyFont: { family: 'Inter', size: 11 },
                                cornerRadius: 8,
                                backgroundColor: '#0f172a'
                            }
                        }
                    }
                });
            }
        }

        function renderTableRecords(schedule) {
            const body = document.getElementById('growthTableBody');
            if (!body) return;
            body.innerHTML = '';

            const maxWealth = schedule[schedule.length - 1].netWealth;

            schedule.forEach(row => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-50 transition-colors";
                tr.innerHTML = `
                    <td class="p-3 font-semibold text-slate-800">${row.year}</td>
                    <td class="p-3 font-medium text-slate-600">${formatVal(row.invested)}</td>
                    <td class="p-3 font-medium text-emerald-800">${formatVal(row.netGains)}</td>
                    <td class="p-3 text-red-700 font-semibold">${formatVal(row.expenseLoss)}</td>
                    <td class="p-3 font-extrabold text-slate-900 text-center">
                        ${formatVal(row.netWealth)}
                        <div class="progress-bar-bg h-1 w-full bg-slate-100 rounded-full mt-1 overflow-hidden print-hide">
                            <div class="bg-red-700 h-full" style="width: ${Math.min(100, (row.netWealth / maxWealth) * 100)}%"></div>
                        </div>
                    </td>
                `;
                body.appendChild(tr);
            });
        }

        function generateSmartFinancialAdvice(years, returnRate, expenseRatio, solvedAmount) {
            const insightBox = document.getElementById('smartInsight');
            const textEl = document.getElementById('smartInsightText');
            if (!insightBox || !textEl) return;

            insightBox.classList.remove('hidden');
            let text = "";

            if (currentMethod === 'goal_seek') {
                const typeText = currentInvestType === 'sip' ? 'Monthly SIP' : 'One-Time Lumpsum';
                text = `<strong>Goal Finder Resolved:</strong> To reach your target wealth goal over ${years} years, you must start a ${typeText} of <strong>${formatVal(solvedAmount)}</strong>.`;
            } else if (currentAsset === 'small') {
                if (years < 7) {
                    text = `⚠️ <strong>Investment Risk Flag:</strong> Small Cap equity schemes exhibit extreme volatility cycles. Compounding over a short term of <strong class="text-red-955">${years} years</strong> increases probability of negative/sub-par results. Standard planning models suggest a <strong>7-10+ year time-horizon</strong>.`;
                } else {
                    text = `🟢 <strong>Aggressive Wealth Accrual Plan:</strong> Over ${years} years, Small Cap equity allocations are modeled to outpace core retail inflation indices effectively. High standard volatility risks diminish as the holding term lengthens.`;
                }
            } else if (currentAsset === 'index') {
                if (expenseRatio > 0.4) {
                    text = `💡 <strong>Expense Ratio Optimizer Alert:</strong> Index funds are passive trackers. An expense ratio of <strong class="text-red-800">${expenseRatio}%</strong> is unusually high for passive funds. Look for cheaper direct funds (~0.1% to 0.2%) to maximize long-term yields.`;
                } else {
                    text = `🟢 <strong>Optimized Passive Execution:</strong> Standard passive index tracker mapped with low fees of ${expenseRatio}% p.a. guarantees you capture exact market cap returns with negligible leakage.`;
                }
            } else if (currentAsset === 'debt') {
                if (returnRate > 9.0) {
                    text = `⚠️ <strong>Inflated Debt Expectation:</strong> Sovereign and corporate debt indices yield between 6% and 8% in standard scenarios. Projections above 9% are volatile and typically involve high-risk credit-risk corporate placements.`;
                } else {
                    text = `🟢 <strong>Stable Preservation Portfolio:</strong> Fixed income allocations preserve capital from direct stock fluctuations, matching baseline liquidity curves.`;
                }
            } else {
                const doublingYears = (72 / returnRate).toFixed(1);
                text = `At an anticipated CAGR of ${returnRate}%, active compounding logic estimates that your capital corpus doubles in value roughly every <strong>${doublingYears} years</strong> (before fees/taxes).`;
            }

            textEl.innerHTML = text;

            // Alert indicators based on expectations
            const warnBox = document.getElementById('smartFinancialValidation');
            warnBox.innerHTML = '';
            warnBox.classList.add('hidden');

            if (returnRate > 18.0) {
                warnBox.classList.remove('hidden');
                warnBox.innerHTML = `
                    <div class="p-2 bg-amber-50 border border-amber-250 text-amber-900 rounded-xl text-[10px] flex items-start gap-1.5 leading-relaxed">
                        <span>⚠️</span>
                        <span><strong>Highly Optimistic Return Assumption (${returnRate}%):</strong> Compounded portfolio growths exceeding 18% p.a. are generally non-sustainable over long-term intervals (10+ years). Adjust rates downwards to maintain realistic wealth plans.</span>
                    </div>
                `;
            }
        }

        // --- Tabular growth ledger toggle logic ---
        function toggleGrowthTable() {
            const container = document.getElementById('growthTableContainer');
            const btn = document.getElementById('toggleGrowthTableBtn');
            if (!container || !btn) return;

            const isHidden = container.classList.toggle('hidden');
            btn.textContent = isHidden ? "Show Yearly Growth" : "Hide Yearly Growth";

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
            csvContent += "Year,Invested Principal (INR),Gains Generated (INR),Expense Ratio Friction Loss (INR),Net Compounded Wealth (INR)\n";
            
            yearlyTableData.forEach(row => {
                csvContent += `${row.year},${Math.round(row.invested)},${Math.round(row.netGains)},${Math.round(row.expenseLoss)},${Math.round(row.netWealth)}\n`;
            });
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `Mutual_Fund_Wealth_Progression_Schedule_${currentAsset}_${currentInvestType}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            displayToast("Progression Ledger CSV downloaded successfully!");
        }

        // --- Setup Range Sliders dynamically ---
        function setupComponentSynchronizers() {
            // Setup Expense Ratio Controls
            const expSlider = document.getElementById('expenseSlider');
            const expInput = document.getElementById('expenseInput');
            const expDec = document.getElementById('expenseDecrement');
            const expInc = document.getElementById('expenseIncrement');

            const syncExp = () => {
                let val = parseFloat(expInput.value);
                if (isNaN(val) || val < 0.05) val = 0.05;
                if (val > 3.0) val = 3.0;
                expInput.value = parseFloat(val.toFixed(2));
                expSlider.value = val;
                updateSliderIndicator('expenseSlider');
                runSimulation();
            };

            expSlider.addEventListener('input', () => {
                expInput.value = expSlider.value;
                updateSliderIndicator('expenseSlider');
                runSimulation();
            });
            expInput.addEventListener('change', syncExp);
            expDec.addEventListener('click', () => {
                let v = Math.max(0.05, (parseFloat(expInput.value) || 0) - 0.05);
                expInput.value = parseFloat(v.toFixed(2));
                syncExp();
            });
            expInc.addEventListener('click', () => {
                let v = Math.min(3.0, (parseFloat(expInput.value) || 0) + 0.05);
                expInput.value = parseFloat(v.toFixed(2));
                syncExp();
            });

            // Setup Period Controls
            const perSlider = document.getElementById('periodSlider');
            const perInput = document.getElementById('periodInput');
            const perDec = document.getElementById('periodDecrement');
            const perInc = document.getElementById('periodIncrement');

            const syncPer = () => {
                let val = parseInt(perInput.value);
                if (isNaN(val) || val < 1) val = 1;
                if (val > 40) val = 40;
                perInput.value = val;
                perSlider.value = val;
                updateSliderIndicator('periodSlider');
                runSimulation();
            };

            perSlider.addEventListener('input', () => {
                perInput.value = perSlider.value;
                updateSliderIndicator('periodSlider');
                runSimulation();
            });
            perInput.addEventListener('change', syncPer);
            perDec.addEventListener('click', () => {
                perInput.value = Math.max(1, (parseInt(perInput.value) || 0) - 1);
                syncPer();
            });
            perInc.addEventListener('click', () => {
                perInput.value = Math.min(40, (parseInt(perInput.value) || 0) + 1);
                syncPer();
            });

            // Setup Step-up Controls
            const suSlider = document.getElementById('stepUpSlider');
            const suInput = document.getElementById('stepUpInput');
            const suDec = document.getElementById('stepUpDecrement');
            const suInc = document.getElementById('stepUpIncrement');

            const syncSu = () => {
                let val = parseInt(suInput.value);
                if (isNaN(val) || val < 1) val = 1;
                if (val > 25) val = 25;
                suInput.value = val;
                suSlider.value = val;
                updateSliderIndicator('stepUpSlider');
                runSimulation();
            };

            suSlider.addEventListener('input', () => {
                suInput.value = suSlider.value;
                updateSliderIndicator('stepUpSlider');
                runSimulation();
            });
            suInput.addEventListener('change', syncSu);
            suDec.addEventListener('click', () => {
                suInput.value = Math.max(1, (parseInt(suInput.value) || 0) - 1);
                syncSu();
            });
            suInc.addEventListener('click', () => {
                suInput.value = Math.min(25, (parseInt(suInput.value) || 0) + 1);
                syncSu();
            });

            // Setup Inflation Controls
            const infSlider = document.getElementById('inflationSlider');
            const infInput = document.getElementById('inflationInput');
            const infDec = document.getElementById('inflationDecrement');
            const infInc = document.getElementById('inflationIncrement');

            const syncInf = () => {
                let val = parseFloat(infInput.value);
                if (isNaN(val) || val < 2) val = 2;
                if (val > 15) val = 15;
                infInput.value = parseFloat(val.toFixed(1));
                infSlider.value = val;
                updateSliderIndicator('inflationSlider');
                runSimulation();
            };

            infSlider.addEventListener('input', () => {
                infInput.value = infSlider.value;
                updateSliderIndicator('inflationSlider');
                runSimulation();
            });
            infInput.addEventListener('change', syncInf);
            infDec.addEventListener('click', () => {
                let v = Math.max(2, (parseFloat(infInput.value) || 0) - 0.1);
                infInput.value = parseFloat(v.toFixed(1));
                syncInf();
            });
            infInc.addEventListener('click', () => {
                let v = Math.min(15, (parseFloat(infInput.value) || 0) + 0.1);
                infInput.value = parseFloat(v.toFixed(1));
                syncInf();
            });

            // Setup Toggles visibility triggers
            document.getElementById('stepUpToggle').addEventListener('change', (e) => {
                document.getElementById('stepUpInputGroup').classList.toggle('hidden', !e.target.checked);
                runSimulation();
            });

            document.getElementById('inflationToggle').addEventListener('change', (e) => {
                document.getElementById('inflationInputGroup').classList.toggle('hidden', !e.target.checked);
                runSimulation();
            });

            document.getElementById('taxToggle').addEventListener('change', (e) => {
                // If tax enabled and current fund class is debt, show debtTaxGroup options
                document.getElementById('debtTaxGroup').classList.toggle('hidden', !e.target.checked || currentAsset !== 'debt');
                runSimulation();
            });

            updateSliderIndicator('expenseSlider');
            updateSliderIndicator('periodSlider');
            updateSliderIndicator('stepUpSlider');
            updateSliderIndicator('inflationSlider');
        }

        // Run Onload Initiators
        window.onload = function() {
            setupComponentSynchronizers();
            setAssetClass('index');
            setInvestType('sip');
            updateSliderIndicator('amountSlider');
            updateSliderIndicator('returnSlider');
        };