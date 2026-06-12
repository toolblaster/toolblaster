// ==========================================
// UTILITY ROUTINES (Hinglish comments)
// ==========================================

// local storage safe-run check
function safeGetLocalStorage(key) {
    try { return localStorage.getItem(key); } catch(e) { return null; }
}
function safeSetLocalStorage(key, val) {
    try { localStorage.setItem(key, val); } catch(e) {}
}

// Rupee formatting function
function formatCurrency(num) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(num));
}

// Indian terms conversion system
function convertToIndianWords(value) {
    if (isNaN(value) || value <= 0) return "";
    if (value >= 10000000) return `(₹${(value / 10000000).toFixed(1)} Cr)`;
    if (value >= 100000) return `(₹${(value / 100000).toFixed(1)} L)`;
    if (value >= 1000) return `(₹${(value / 1000).toFixed(1)} K)`;
    return `(₹${value})`;
}

// dynamic slider background track color fills
function updateSliderFill(slider) {
    if (!slider) return;
    const percentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty('--fill-percentage', `${percentage}%`);
}

// ==========================================
// DYNAMIC STATE VARIABLES
// ==========================================
let currentActiveMode = 'tab-rev-sip';
let chartInstance;
let xirrLedger = [];
let doughnutCtx = null; // doughnutCtx is defined globally

// ==========================================
// DYNAMIC PRESETS
// ==========================================
const sliderPresets = {
    'tab-rev-sip': {
        s1: { label: 'Target Corpus (₹)', min: 50000, max: 100000000, val: 5000000, step: 50000, word: true, tooltip: 'Aapki target saving value jo aapko future me achhi life/retirement ke liye chahiye.' },
        s2: { label: 'Expected Growth returns (% p.a.)', min: 1, max: 30, val: 12, step: 0.1, word: false, tooltip: 'Scheme se milne wala estimated interest ya annual compounding returns rate.' },
        s3: { label: 'Holding Period Duration (Years)', min: 1, max: 40, val: 10, step: 1, word: false, tooltip: 'Kitne samay tak aap regular contribution continue karenge.' }
    },
    'tab-rev-lump': {
        s1: { label: 'Target Corpus (₹)', min: 50000, max: 100000000, val: 10000000, step: 50000, word: true, tooltip: 'Aapka total single target wealth budget.' },
        s2: { label: 'Expected Growth returns (% p.a.)', min: 1, max: 30, val: 12, step: 0.1, word: false, tooltip: 'Scheme se milne wala estimated interest ya annual compounding returns rate.' },
        s3: { label: 'Investment Horizon Tenure (Years)', min: 1, max: 40, val: 10, step: 1, word: false, tooltip: 'Kitne saalon tak aap lumpsum cash lock rakhna chahte hain.' }
    },
    'tab-cagr': {
        s1: { label: 'Invested Principal Amount (₹)', min: 10000, max: 50000000, val: 1000000, step: 10000, word: true, tooltip: 'Initial starting amount jo aapne policy ya gold me shuru me lagaya tha.' },
        s2: { label: 'Final Maturity Value Received (₹)', min: 10000, max: 100000000, val: 1800000, step: 10000, word: true, tooltip: 'Maturity poori hone par aapko bank ya policy se mila hua final amount.' },
        s3: { label: 'Actual Maturity Duration (Years)', min: 1, max: 45, val: 8, step: 1, word: false, tooltip: 'Aapka paisa policy me kitne saal tak compound hua.' }
    },
    'tab-xirr': {
        s1: { label: 'XIRR Solver Threshold Offset (%)', min: 1, max: 20, val: 10, step: 0.5, word: false, tooltip: 'Newton-Raphson initial starting guess rate factor (Standard base is 10%).' },
        s2: null,
        s3: null
    }
};

// ==========================================
// DYNAMIC TRANSLATION WRAPPER SWITCHER
// ==========================================
function handleModeSwitch(modeId) {
    currentActiveMode = modeId;
    
    // Switch tabs
    document.querySelectorAll('.mode-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });
    const clickedTab = document.getElementById(modeId);
    clickedTab.classList.add('active');
    clickedTab.setAttribute('aria-selected', 'true');

    // Hide/Show Extra Containers based on active states
    const inflationPanel = document.getElementById('extra-inflation-panel');
    const xirrPanel = document.getElementById('xirr-audit-panel');
    const slider2Row = document.getElementById('dynamic-slider-2-container');
    const slider3Row = document.getElementById('dynamic-slider-3-container');

    if (modeId === 'tab-xirr') {
        xirrPanel.classList.remove('hidden');
        inflationPanel.classList.add('hidden');
        slider2Row.classList.add('hidden');
        slider3Row.classList.add('hidden');
        document.getElementById('inputs-section-title').textContent = "XIRR Compounding Parameters";
        document.getElementById('printActiveMode').textContent = "Mode: XIRR Audit Trail";
    } else {
        xirrPanel.classList.add('hidden');
        inflationPanel.classList.remove('hidden');
        slider2Row.classList.remove('hidden');
        slider3Row.classList.remove('hidden');
        document.getElementById('inputs-section-title').textContent = "Target Wealth Variables";
        
        if (modeId === 'tab-rev-sip') {
            document.getElementById('printActiveMode').textContent = "Mode: Reverse SIP Planner";
        } else if (modeId === 'tab-rev-lump') {
            document.getElementById('printActiveMode').textContent = "Mode: Reverse Lumpsum Planner";
        } else if (modeId === 'tab-cagr') {
            document.getElementById('printActiveMode').textContent = "Mode: CAGR Return Finder";
        }
    }

    // Sync preset variables smoothly
    const config = sliderPresets[modeId];
    
    const syncSliderPreset = (num, configObj) => {
        const slider = document.getElementById(`slider${num}`);
        const input = document.getElementById(`slider${num}Input`);
        const label = document.getElementById(`slider${num}Label`);
        const tooltipText = document.getElementById(`slider${num}Tooltip`);
        const wordLabel = document.getElementById(`slider${num}Word`);

        if (configObj) {
            label.closest('.relative').classList.remove('hidden');
            label.textContent = configObj.label;
            tooltipText.textContent = configObj.tooltip;
            slider.min = configObj.min;
            slider.max = configObj.max;
            slider.step = configObj.step;
            slider.value = configObj.val;
            input.min = configObj.min;
            input.max = configObj.max;
            input.step = configObj.step;
            input.value = configObj.val;
            updateSliderFill(slider);

            if (wordLabel) {
                if (configObj.word) {
                    wordLabel.classList.remove('hidden');
                    wordLabel.textContent = convertToIndianWords(configObj.val);
                } else {
                    wordLabel.classList.add('hidden');
                    wordLabel.textContent = '';
                }
            }
        } else {
            label.closest('.relative').classList.add('hidden');
        }
    };

    syncSliderPreset(1, config.s1);
    syncSliderPreset(2, config.s2);
    syncSliderPreset(3, config.s3);

    triggerCalculation();
}

// ==========================================
// REVERSE COMPLEMENTARY CALCULATION MOTHER ENGINE
// ==========================================
function triggerCalculation() {
    const errorBox = document.getElementById('errorAlertBox');
    errorBox.classList.add('hidden');
    errorBox.textContent = '';

    const s1Val = parseFloat(document.getElementById('slider1Input').value) || 0;
    const s2Val = parseFloat(document.getElementById('slider2Input').value) || 0;
    const s3Val = parseFloat(document.getElementById('slider3Input').value) || 0;

    const isInflationActive = document.getElementById('inflationToggle').checked;
    const inflationRate = isInflationActive ? (parseFloat(document.getElementById('inflationRateInput').value) || 0) : 0;

    let metric1Label = "";
    let metric2Label = "";
    let largeCalloutLabel = "";
    let secondaryInfoLabel = "";

    let metric1Val = 0;
    let metric2Val = 0;
    let largeCalloutVal = 0;
    let secondaryInfoVal = 0;

    let chartData = [1, 0];
    let chartLabels = ['Capital', 'Returns'];

    // Define updateOutputs first inside function scope so we can safely invoke it inside conditionals
    // updateOutputs update output variables dynamically
    function updateOutputs() {
        document.getElementById('cardMetric1Label').textContent = metric1Label;
        document.getElementById('cardMetric2Label').textContent = metric2Label;
        document.getElementById('largeCalloutLabel').textContent = largeCalloutLabel;
        document.getElementById('secInfoLabel').textContent = secondaryInfoLabel;

        document.getElementById('cardMetric1Value').textContent = formatCurrency(metric1Val);
        document.getElementById('cardMetric2Value').textContent = formatCurrency(metric2Val);
        document.getElementById('largeCalloutValue').textContent = largeCalloutVal;
        document.getElementById('secInfoValue').textContent = formatCurrency(secondaryInfoVal);
        
        // --- BINDING TO THE PRINT PREVIEW statement dynamically ---
        populatePrintDocument();
    }

    // Sync values to the hidden Print preview DOM structure
    function populatePrintDocument() {
        const printIn1Label = document.getElementById('printInput1Label');
        const printIn1Value = document.getElementById('printInput1Value');
        const printIn2Row = document.getElementById('printInput2Row');
        const printIn2Label = document.getElementById('printInput2Label');
        const printIn2Value = document.getElementById('printInput2Value');
        const printIn3Row = document.getElementById('printInput3Row');
        const printIn3Label = document.getElementById('printInput3Label');
        const printIn3Value = document.getElementById('printInput3Value');
        const printInfRow = document.getElementById('printInflationRow');
        const printInfValue = document.getElementById('printInflationValue');

        const printM1Label = document.getElementById('printMetric1Label');
        const printM1Value = document.getElementById('printMetric1Value');
        const printM2Label = document.getElementById('printMetric2Label');
        const printM2Value = document.getElementById('printMetric2Value');
        const printM3Row = document.getElementById('printMetric3Row');
        const printM3Value = document.getElementById('printMetric3Value');
        
        const printOutLabel = document.getElementById('printOutputLabel');
        const printOutValue = document.getElementById('printOutputValue');
        const printLedgerContainer = document.getElementById('printLedgerContainer');

        if (currentActiveMode === 'tab-rev-sip') {
            printIn1Label.textContent = "Target Corpus:";
            printIn1Value.textContent = formatCurrency(s1Val) + " " + convertToIndianWords(s1Val);
            printIn2Row.classList.remove('hidden');
            printIn2Label.textContent = "Expected Return Rate:";
            printIn2Value.textContent = s2Val + "% p.a.";
            printIn3Row.classList.remove('hidden');
            printIn3Label.textContent = "Tenure Duration:";
            printIn3Value.textContent = s3Val + " Years";
            printInfRow.classList.remove('hidden');
            printInfValue.textContent = isInflationActive ? (inflationRate + "% p.a.") : "Not Adjusted";

            printM1Label.textContent = isInflationActive ? "Inflation-Adjusted Goal:" : "Target Corpus:";
            printM1Value.textContent = formatCurrency(metric1Val);
            printM2Label.textContent = "Estimated Returns:";
            printM2Value.textContent = formatCurrency(metric2Val);
            printM3Row.classList.remove('hidden');
            printM3Value.textContent = formatCurrency(secondaryInfoVal);
            
            printOutLabel.textContent = "Required Monthly SIP contribution:";
            printOutValue.textContent = largeCalloutVal;
            printLedgerContainer.classList.add('hidden');

        } else if (currentActiveMode === 'tab-rev-lump') {
            printIn1Label.textContent = "Target Corpus:";
            printIn1Value.textContent = formatCurrency(s1Val) + " " + convertToIndianWords(s1Val);
            printIn2Row.classList.remove('hidden');
            printIn2Label.textContent = "Expected Return Rate:";
            printIn2Value.textContent = s2Val + "% p.a.";
            printIn3Row.classList.remove('hidden');
            printIn3Label.textContent = "Lock-in Period:";
            printIn3Value.textContent = s3Val + " Years";
            printInfRow.classList.remove('hidden');
            printInfValue.textContent = isInflationActive ? (inflationRate + "% p.a.") : "Not Adjusted";

            printM1Label.textContent = isInflationActive ? "Inflation-Adjusted Goal:" : "Target Corpus:";
            printM1Value.textContent = formatCurrency(metric1Val);
            printM2Label.textContent = "Estimated Compound Interest:";
            printM2Value.textContent = formatCurrency(metric2Val);
            printM3Row.classList.remove('hidden');
            printM3Value.textContent = formatCurrency(secondaryInfoVal);
            
            printOutLabel.textContent = "Required Lumpsum Investment Today:";
            printOutValue.textContent = largeCalloutVal;
            printLedgerContainer.classList.add('hidden');

        } else if (currentActiveMode === 'tab-cagr') {
            printIn1Label.textContent = "Invested Principal:";
            printIn1Value.textContent = formatCurrency(s1Val) + " " + convertToIndianWords(s1Val);
            printIn2Row.classList.remove('hidden');
            printIn2Label.textContent = "Maturity Received:";
            printIn2Value.textContent = formatCurrency(s2Val) + " " + convertToIndianWords(s2Val);
            printIn3Row.classList.remove('hidden');
            printIn3Label.textContent = "Tenure Duration:";
            printIn3Value.textContent = s3Val + " Years";
            printInfRow.classList.add('hidden');

            printM1Label.textContent = "Received Proceeds:";
            printM1Value.textContent = formatCurrency(metric1Val);
            printM2Label.textContent = "Net Gains Accrued:";
            printM2Value.textContent = formatCurrency(metric2Val);
            printM3Row.classList.remove('hidden');
            printM3Value.textContent = formatCurrency(secondaryInfoVal);
            
            printOutLabel.textContent = "Computed Annualized CAGR Rate:";
            printOutValue.textContent = largeCalloutVal;
            printLedgerContainer.classList.add('hidden');

        } else if (currentActiveMode === 'tab-xirr') {
            printIn1Label.textContent = "Newton Threshold Guess:";
            printIn1Value.textContent = s1Val + "%";
            printIn2Row.classList.add('hidden');
            printIn3Row.classList.add('hidden');
            printInfRow.classList.add('hidden');

            printM1Label.textContent = "Total Inflows (Capital Outlays):";
            printM1Value.textContent = formatCurrency(metric1Val);
            printM2Label.textContent = "Total Outflows (Received Payouts):";
            printM2Value.textContent = formatCurrency(metric2Val);
            printM3Row.classList.remove('hidden');
            printM3Value.textContent = formatCurrency(secondaryInfoVal);
            
            printOutLabel.textContent = "Calculated Portfolio XIRR Yield:";
            printOutValue.textContent = largeCalloutVal;
            
            // Show transaction trail inside print report
            printLedgerContainer.classList.remove('hidden');
            const printLedgerBody = document.getElementById('printLedgerBody');
            if (printLedgerBody) {
                printLedgerBody.innerHTML = '';
                if (xirrLedger.length === 0) {
                    printLedgerBody.innerHTML = `<tr><td colspan="3" class="p-2 text-center text-gray-500">No transactions recorded</td></tr>`;
                } else {
                    xirrLedger.forEach(item => {
                        const tr = document.createElement('tr');
                        const typeLabel = item.type === 'debit' ? 'Invested (-)' : 'Received (+)';
                        tr.innerHTML = `
                            <td class="p-2 border">${item.date}</td>
                            <td class="p-2 border">${typeLabel}</td>
                            <td class="p-2 border text-right font-bold">${formatCurrency(item.amount)}</td>
                        `;
                        printLedgerBody.appendChild(tr);
                    });
                }
            }
        }
    }

    if (currentActiveMode === 'tab-rev-sip') {
        metric1Label = "Target Corpus Goal";
        metric2Label = "Est. Growth Returns";
        largeCalloutLabel = "Monthly SIP Required";
        secondaryInfoLabel = "Total Principal Capital Invested";

        const targetGoal = s1Val;
        const cagr = s2Val;
        const years = s3Val;

        // Adjust for inflation
        const adjustedGoal = targetGoal * Math.pow(1 + (inflationRate / 100), years);

        const monthlyRate = (cagr / 12) / 100;
        const months = years * 12;

        let requiredMonthlySip = 0;
        if (monthlyRate === 0) {
            requiredMonthlySip = adjustedGoal / months;
        } else {
            requiredMonthlySip = adjustedGoal / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
        }

        const totalPrincipal = requiredMonthlySip * months;
        const estGains = Math.max(0, adjustedGoal - totalPrincipal);

        metric1Val = adjustedGoal;
        metric2Val = estGains;
        largeCalloutVal = `${formatCurrency(requiredMonthlySip)} / Month`;
        secondaryInfoVal = totalPrincipal;

        chartData = [totalPrincipal, estGains];

        // Dynamic metric labels updates
        document.getElementById('cardMetric1Label').textContent = isInflationActive ? "Inflation-Adjusted Goal" : "Target Corpus Goal";

    } else if (currentActiveMode === 'tab-rev-lump') {
        metric1Label = "Target Corpus Goal";
        metric2Label = "Est. Growth Interest";
        largeCalloutLabel = "Lumpsum Needed Today";
        secondaryInfoLabel = "Lumpsum Invested Principal";

        const targetGoal = s1Val;
        const cagr = s2Val;
        const years = s3Val;

        const adjustedGoal = targetGoal * Math.pow(1 + (inflationRate / 100), years);

        const requiredLumpsum = adjustedGoal / Math.pow(1 + (cagr / 100), years);
        const estGains = Math.max(0, adjustedGoal - requiredLumpsum);

        metric1Val = adjustedGoal;
        metric2Val = estGains;
        largeCalloutVal = formatCurrency(requiredLumpsum);
        secondaryInfoVal = requiredLumpsum;

        chartData = [requiredLumpsum, estGains];

        document.getElementById('cardMetric1Label').textContent = isInflationActive ? "Inflation-Adjusted Goal" : "Target Corpus Goal";

    } else if (currentActiveMode === 'tab-cagr') {
        metric1Label = "Maturity Proceeds Received";
        metric2Label = "Total Interest Accrued";
        largeCalloutLabel = "Calculated CAGR Return Rate";
        secondaryInfoLabel = "Invested Capital Principal";

        const invested = s1Val;
        const received = s2Val;
        const years = s3Val;

        if (invested <= 0) {
            errorBox.classList.remove('hidden');
            errorBox.textContent = 'Invested Principal must be greater than ₹0.';
            return;
        }

        if (received < invested) {
            errorBox.classList.remove('hidden');
            errorBox.textContent = 'Maturity proceeds should typically be greater than Invested Capital.';
        }

        const calculatedCagr = (Math.pow(received / invested, 1 / years) - 1) * 100;
        const estGains = Math.max(0, received - invested);

        metric1Val = received;
        metric2Val = estGains;
        largeCalloutVal = `${calculatedCagr.toFixed(2)}% p.a.`;
        secondaryInfoVal = invested;

        chartData = [invested, estGains];
        document.getElementById('cardMetric1Label').textContent = "Maturity Proceeds Received";

    } else if (currentActiveMode === 'tab-xirr') {
        // Newton-Raphson powered XIRR Finder logic
        metric1Label = "Total Portfolio Inflows (-)";
        metric2Label = "Total Portfolio Outflows (+)";
        largeCalloutLabel = "Computed Extended XIRR Yield";
        secondaryInfoLabel = "Total Absolute Cash Surplus";

        const debugGuessOffset = s1Val / 100;

        let sumDebits = 0; // Negative flow (out of wallet)
        let sumCredits = 0; // Positive flow (into wallet)

        // process data points
        const processedFlows = xirrLedger.map(item => {
            const parsedAmt = item.type === 'debit' ? -item.amount : item.amount;
            if (item.type === 'debit') sumDebits += item.amount;
            else sumCredits += item.amount;

            return {
                date: new Date(item.date),
                amount: parsedAmt
            };
        });

        // XIRR must contain at least one positive and one negative value
        if (processedFlows.length < 2 || sumDebits === 0 || sumCredits === 0) {
            errorBox.classList.remove('hidden');
            errorBox.innerHTML = `⚠️ <strong>XIRR Validation:</strong> Ledger history requires at least one Invested (-) and one Received (+) value. Use inputs panel to log transaction history.`;
            
            metric1Val = sumDebits;
            metric2Val = sumCredits;
            largeCalloutVal = "Requires Data";
            secondaryInfoVal = sumCredits - sumDebits;

            chartData = [sumDebits, sumCredits];
            chartLabels = ['Principal', 'Returns']; // Uniform chart Labels applied to XIRR!

            updateOutputs();
            updateVisualizationChart(chartData, chartLabels);
            return;
        }

        // Sort flows by date ascending
        processedFlows.sort((a,b) => a.date - b.date);

        // Newton-Raphson algorithm solver
        let r = debugGuessOffset; // standard seed
        const maxSteps = 1000;
        const tolerance = 1e-6;
        let isSolved = false;

        const firstDate = processedFlows[0].date;

        for (let step = 0; step < maxSteps; step++) {
            let npv = 0;
            let dNpv = 0;

            for (let i = 0; i < processedFlows.length; i++) {
                const dayDiff = (processedFlows[i].date - firstDate) / (1000 * 60 * 60 * 24);
                const yearFraction = dayDiff / 365;

                // NPV and NPV derivative calculation formula
                const discountFactor = Math.pow(1 + r, yearFraction);
                npv += processedFlows[i].amount / discountFactor;
                dNpv -= (yearFraction * processedFlows[i].amount) / (discountFactor * (1 + r));
            }

            if (Math.abs(dNpv) < 1e-12) break;

            const nextR = r - (npv / dNpv);
            if (Math.abs(nextR - r) < tolerance) {
                r = nextR;
                isSolved = true;
                break;
            }
            r = nextR;
        }

        const finalXirrVal = r * 100;

        metric1Val = sumDebits;
        metric2Val = sumCredits;
        largeCalloutVal = isSolved ? `${finalXirrVal.toFixed(2)}% p.a.` : "Convergence Failed";
        secondaryInfoVal = sumCredits - sumDebits;

        chartData = [sumDebits, Math.max(0, sumCredits - sumDebits)];
        chartLabels = ['Principal', 'Returns']; // Uniform chart Labels applied to XIRR!
    }

    updateOutputs();
    updateVisualizationChart(chartData, chartLabels);
}

// ==========================================
// CHART VISUALIZATION HANDLING
// ==========================================
function updateVisualizationChart(dataPoints, labels) {
    if (!doughnutCtx) return; // Safely references global doughnutCtx

    // FIXED: Deeper visual configurations are now 100% uniform across all 4 modes!
    const chartColors = ['#1E3A8A', '#16A34A']; // Uniform Blue (Invested) vs Green (Gains) across ALL modes!

    const chartData = {
        labels: labels,
        datasets: [{
            data: dataPoints,
            backgroundColor: chartColors,
            hoverOffset: 4,
            borderWidth: 1
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return ` ${context.label}: ${formatCurrency(context.parsed)}`;
                    }
                }
            }
        }
    };

    if (chartInstance) {
        chartInstance.data = chartData;
        chartInstance.options.plugins.tooltip.callbacks.label = function(context) {
            return ` ${context.label}: ${formatCurrency(context.parsed)}`;
        };
        chartInstance.update();
    } else {
        chartInstance = new Chart(doughnutCtx, {
            type: 'doughnut',
            data: chartData,
            options: chartOptions
        });
    }

    // Sync HTML text Legend displays
    document.getElementById('legendLabel1').textContent = `${labels[0]}:`;
    document.getElementById('legendVal1').textContent = formatCurrency(dataPoints[0]);
    document.getElementById('legendLabel2').textContent = `${labels[1]}:`;
    document.getElementById('legendVal2').textContent = formatCurrency(dataPoints[1]);
}

// ==========================================
// TRANS TRANSACTION LEDGER INJECTION ROUTINES
// ==========================================
function injectXirrLedgerRow(item) {
    const tableBody = document.getElementById('xirrLedgerBody');
    if (!tableBody) return;

    const tr = document.createElement('tr');
    tr.className = "hover:bg-stone-50 transition-colors border-b";
    tr.id = `flow-row-${item.id}`;

    const badgeBg = item.type === 'debit' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700';
    const badgeLabel = item.type === 'debit' ? 'Invested (-)' : 'Received (+)';

    tr.innerHTML = `
        <td class="p-2 font-medium">${item.date}</td>
        <td class="p-2"><span class="px-2 py-0.5 rounded text-[10px] font-bold border ${badgeBg}">${badgeLabel}</span></td>
        <td class="p-2 text-right font-bold text-stone-900">${formatCurrency(item.amount)}</td>
        <td class="p-2 text-center">
            <button type="button" onclick="removeLedgerRow('${item.id}')" class="text-stone-400 hover:text-red-700 font-extrabold" aria-label="Delete ledger transaction">&times; Remove</button>
        </td>
    `;

    tableBody.appendChild(tr);
}

// Remove row helper (Exposed on window)
window.removeLedgerRow = function(id) {
    xirrLedger = xirrLedger.filter(item => item.id !== id);
    safeSetLocalStorage('TB_REVERSE_XIRR_LEDGER', JSON.stringify(xirrLedger));
    
    const tr = document.getElementById(`flow-row-${id}`);
    if (tr) tr.remove();

    showNotification("Transaction deleted successfully!");
    triggerCalculation();
};

// ==========================================
// SYNCHRONIZATION AND BINDING FRAMEWORK
// ==========================================
function setupParameterBinders(sliderId, inputId, decId, incId, wordId) {
    const slider = document.getElementById(sliderId);
    const input = document.getElementById(inputId);
    const decBtn = document.getElementById(decId);
    const incBtn = document.getElementById(incId);

    const syncFromInput = () => {
        let val = parseFloat(input.value);
        const min = parseFloat(input.min) || 0;
        const max = parseFloat(input.max) || Infinity;

        if (!isNaN(val) && (val < min || val > max)) {
            input.closest('.input-stepper-group').classList.add('input-error');
        } else {
            input.closest('.input-stepper-group').classList.remove('input-error');
        }

        if (!isNaN(val) && val >= min && val <= max) {
            slider.value = val;
            updateSliderFill(slider);
            if (wordId) {
                const wordLabel = document.getElementById(wordId);
                if (wordLabel && !wordLabel.classList.contains('hidden')) {
                    wordLabel.textContent = convertToIndianWords(val);
                }
            }
            triggerCalculation();
        } else if (!isNaN(val)) {
            if (wordId) {
                const wordLabel = document.getElementById(wordId);
                if (wordLabel && !wordLabel.classList.contains('hidden')) {
                    wordLabel.textContent = convertToIndianWords(val);
                }
            }
        }
    };

    const enforceLimits = () => {
        let val = parseFloat(input.value);
        const min = parseFloat(input.min) || 0;
        const max = parseFloat(input.max) || Infinity;
        const step = parseFloat(input.step) || 1;

        const decimals = (String(step).split('.')[1] || '').length;

        if (isNaN(val) || input.value.trim() === '') {
            val = min;
        } else {
            val = Math.max(min, Math.min(max, val));
        }

        const sanitized = parseFloat(val.toFixed(decimals));
        input.value = sanitized;
        slider.value = sanitized;
        updateSliderFill(slider);
        if (wordId) {
            const wordLabel = document.getElementById(wordId);
            if (wordLabel && !wordLabel.classList.contains('hidden')) {
                wordLabel.textContent = convertToIndianWords(sanitized);
            }
        }

        input.closest('.input-stepper-group').classList.remove('input-error');
        triggerCalculation();
    };

    slider.addEventListener('input', () => {
        input.value = slider.value;
        syncFromInput();
    });

    input.addEventListener('input', () => {
        let cleaned = input.value.replace(/[^0-9.]/g, '');
        if (input.value !== cleaned) input.value = cleaned;
        syncFromInput();
    });

    input.addEventListener('blur', enforceLimits);

    decBtn.addEventListener('click', () => {
        const min = parseFloat(input.min) || 0;
        const step = parseFloat(input.step) || 1;
        let val = parseFloat(input.value) || min;
        val = Math.max(min, val - step);
        
        const decimals = (String(step).split('.')[1] || '').length;
        input.value = parseFloat(val.toFixed(decimals));
        slider.value = input.value;
        updateSliderFill(slider);
        if (wordId) {
            const wordLabel = document.getElementById(wordId);
            if (wordLabel && !wordLabel.classList.contains('hidden')) {
                wordLabel.textContent = convertToIndianWords(parseFloat(input.value));
            }
        }
        triggerCalculation();
    });

    incBtn.addEventListener('click', () => {
        const min = parseFloat(input.min) || 0;
        const max = parseFloat(input.max) || Infinity;
        const step = parseFloat(input.step) || 1;
        let val = parseFloat(input.value) || min;
        val = Math.min(max, val + step);

        const decimals = (String(step).split('.')[1] || '').length;
        input.value = parseFloat(val.toFixed(decimals));
        slider.value = input.value;
        updateSliderFill(slider);
        if (wordId) {
            const wordLabel = document.getElementById(wordId);
            if (wordLabel && !wordLabel.classList.contains('hidden')) {
                wordLabel.textContent = convertToIndianWords(parseFloat(input.value));
            }
        }
        triggerCalculation();
    });

    updateSliderFill(slider);
}

function showNotification(message) {
    const toast = document.getElementById('notification-toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// ==========================================
// INITIAL RUNTIME INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // Fixed ReferenceError: Initialize global doughnutCtx safely before calling chart updates
    const doughnutCanvas = document.getElementById('breakdownDoughnutChart');
    if (doughnutCanvas) {
        doughnutCtx = doughnutCanvas.getContext('2d');
    }

    // Sync default slider binders
    setupParameterBinders('slider1', 'slider1Input', 'slider1Dec', 'slider1Inc', 'slider1Word');
    setupParameterBinders('slider2', 'slider2Input', 'slider2Dec', 'slider2Inc', 'slider2Word');
    setupParameterBinders('slider3', 'slider3Input', 'slider3Dec', 'slider3Inc', 'slider3Word');
    setupParameterBinders('inflationRateSlider', 'inflationRateInput', 'inflationRateDec', 'inflationRateInc', null);

    // Tab listeners
    document.querySelectorAll('.mode-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleModeSwitch(e.target.id));
    });

    // Inflation change triggers
    document.getElementById('inflationToggle').addEventListener('change', (e) => {
        document.getElementById('inflationGroup').classList.toggle('hidden', !e.target.checked);
        triggerCalculation();
    });

    // XIRR Ledger Load and Save
    const savedLedger = safeGetLocalStorage('TB_REVERSE_XIRR_LEDGER');
    if (savedLedger) {
        try {
            xirrLedger = JSON.parse(savedLedger);
            xirrLedger.forEach(injectXirrLedgerRow);
        } catch(e) {
            xirrLedger = [];
        }
    } else {
        // Pre-populate realistic investment flows for XIRR mode
        const defaultFlows = [
            { id: '1', date: '2024-01-15', type: 'debit', amount: 10000 },
            { id: '2', date: '2024-06-20', type: 'debit', amount: 15000 },
            { id: '3', date: '2025-01-10', type: 'debit', amount: 12000 },
            { id: '4', date: '2026-06-11', type: 'credit', amount: 48000 } // current value today
        ];
        xirrLedger = defaultFlows;
        safeSetLocalStorage('TB_REVERSE_XIRR_LEDGER', JSON.stringify(xirrLedger));
        xirrLedger.forEach(injectXirrLedgerRow);
    }

    // New cash flow validation and logging btn trigger
    document.getElementById('addNewFlowBtn').addEventListener('click', () => {
        const fDate = document.getElementById('newFlowDate').value;
        const fType = document.getElementById('newFlowType').value;
        const fAmount = parseFloat(document.getElementById('newFlowAmount').value) || 0;

        if (!fDate) {
            showNotification("Please select a valid transaction Date.");
            return;
        }
        if (fAmount <= 0) {
            showNotification("Please enter a valid Cash Flow Amount.");
            return;
        }

        const newFlowItem = {
            id: Math.random().toString(36).substring(2, 9),
            date: fDate,
            type: fType,
            amount: fAmount
        };

        xirrLedger.push(newFlowItem);
        safeSetLocalStorage('TB_REVERSE_XIRR_LEDGER', JSON.stringify(xirrLedger));

        injectXirrLedgerRow(newFlowItem);

        document.getElementById('newFlowDate').value = '';
        document.getElementById('newFlowAmount').value = '';

        showNotification("Transaction logged successfully!");
        triggerCalculation();
    });

    // Initial calculate trigger
    handleModeSwitch('tab-rev-sip');
});