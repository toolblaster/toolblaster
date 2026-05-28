// ==========================================
// MODULE: UTILS.JS - Reusable helpers
// ==========================================
function formatCurrency(num) {
    if (num === undefined || isNaN(num)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(Math.round(num));
}

// Real-time conversion into Indian words (Lakh / Crore)
function convertToIndianWords(value) {
    if (isNaN(value) || value <= 0) return "";
    if (value >= 10000000) {
        const cr = value / 10000000;
        return `(₹${cr % 1 === 0 ? cr : cr.toFixed(2)} Crore)`;
    }
    if (value >= 100000) {
        const lakh = value / 100000;
        return `(₹${lakh % 1 === 0 ? lakh : lakh.toFixed(2)} Lakh)`;
    }
    if (value >= 1000) {
        const k = value / 1000;
        return `(₹${k % 1 === 0 ? k : k.toFixed(1)} K)`;
    }
    return `(₹${value})`;
}

// Standard JS Debouncer logic
function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Custom Slider Visual Fill highlighted track
function updateSliderFill(slider) {
    if (!slider) return;
    const percentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty('--fill-percentage', `${percentage}%`);
}

// Double input slider and stepper binder
function syncSliderAndInput({ sliderId, inputId, decrementId, incrementId, updateCallback }) {
    const slider = document.getElementById(sliderId);
    const input = document.getElementById(inputId);
    const decrementBtn = decrementId ? document.getElementById(decrementId) : null;
    const incrementBtn = incrementId ? document.getElementById(incrementId) : null;
    const errorElement = document.getElementById(inputId.replace('Input', 'Error'));

    const debouncedUpdate = updateCallback ? debounce(updateCallback, 250) : () => {};

    if (!slider || !input) {
        console.warn(`Slider or Input not found for IDs: ${sliderId}, ${inputId}`);
        return;
    }

    const updateAriaValueText = () => {
        const value = parseFloat(input.value);
        if (!isNaN(value)) {
            const isCurrency = inputId.toLowerCase().includes('amount') || inputId.toLowerCase().includes('salary') || inputId.toLowerCase().includes('corpus') || inputId.toLowerCase().includes('savings') || inputId.toLowerCase().includes('investment') || inputId.toLowerCase().includes('withdrawal') || (parseFloat(input.step) >= 100);
            const formattedValue = isCurrency ? formatCurrency(value) : value.toString();
            slider.setAttribute('aria-valuetext', formattedValue);
        }
    };

    const validate = () => {
        const value = parseFloat(input.value);
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        const isValid = !isNaN(value) && value >= min && value <= max && input.value.trim() !== '';

        input.classList.toggle('input-error', !isValid);
        if (errorElement) {
            errorElement.classList.toggle('invisible', isValid);
        }
        if (decrementBtn) decrementBtn.disabled = isNaN(value) || value <= min;
        if (incrementBtn) incrementBtn.disabled = isNaN(value) || value >= max;

        // Sync live Indian numbering labels if applicable
        const wordLabel = document.getElementById(inputId.replace('Input', 'Word'));
        if (wordLabel) {
            wordLabel.textContent = isValid ? convertToIndianWords(value) : "";
        }

        return isValid;
    };

    const updateValue = (newValue) => {
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const step = parseFloat(slider.step) || 1;

        let clampedValue = Math.max(min, Math.min(max, newValue));
        const correctedValue = step < 1
            ? parseFloat(clampedValue).toFixed(String(step).split('.')[1]?.length || 1)
            : Math.round(clampedValue / step) * step;

        clampedValue = Math.max(min, Math.min(max, parseFloat(correctedValue)));

        input.value = clampedValue;
        slider.value = clampedValue;
        updateSliderFill(slider);
        updateAriaValueText();
        if (validate()) {
            if (updateCallback) updateCallback();
        }
    };

    slider.addEventListener('input', () => {
        const newValue = parseFloat(slider.value);
        if (!isNaN(newValue)) {
            input.value = newValue;
            updateSliderFill(slider);
            updateAriaValueText();
            if (validate()) {
                if (updateCallback) updateCallback();
            }
        }
    });

    input.addEventListener('input', () => {
        if (validate()) {
            slider.value = input.value;
            updateSliderFill(slider);
            updateAriaValueText();
            debouncedUpdate();
        }
    });

    input.addEventListener('blur', () => {
        let value = parseFloat(input.value);
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const step = parseFloat(slider.step) || 1;

        if (isNaN(value) || value < min || input.value.trim() === '') {
            value = min;
        } else if (value > max) {
            value = max;
        }

        const correctedValue = step < 1
            ? parseFloat(value).toFixed(String(step).split('.')[1]?.length || 1)
            : Math.round(value / step) * step;

        value = Math.max(min, Math.min(max, parseFloat(correctedValue)));

        input.value = value;
        slider.value = value;

        updateSliderFill(slider);
        updateAriaValueText();
        validate();
        if (updateCallback) updateCallback();
    });

    if (decrementBtn) {
        decrementBtn.addEventListener('click', () => {
            const currentValue = parseFloat(input.value);
            const step = parseFloat(slider.step) || 1;
            if (!isNaN(currentValue)) {
                updateValue(currentValue - step);
            }
        });
    }

    if (incrementBtn) {
        incrementBtn.addEventListener('click', () => {
            const currentValue = parseFloat(input.value);
            const step = parseFloat(slider.step) || 1;
            if (!isNaN(currentValue)) {
                updateValue(currentValue + step);
            }
        });
    }

    validate();
    updateSliderFill(slider);
    updateAriaValueText();
}

// --- 2. Notification Helper ---
const showNotification = function(message) {
    const toast = document.getElementById('notification-toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        toast.style.opacity = '1';
        toast.style.visibility = 'visible';
        setTimeout(() => {
            toast.classList.remove('show');
            toast.style.opacity = '0';
            toast.style.visibility = 'hidden';
        }, 3000);
    }
};

// --- 3. Core Calculation & UI logic ---
document.addEventListener('DOMContentLoaded', () => {
    const getElem = (id) => document.getElementById(id);

    // Inputs
    const annualInvestmentInput = getElem('annualInvestmentInput');
    const interestRateInput = getElem('interestRateInput');
    const extensionBlocksInput = getElem('extensionBlocksInput');
    const decreaseExtensionBtn = getElem('decreaseExtension');
    const increaseExtensionBtn = getElem('increaseExtension');
    const extensionContributionDiv = getElem('extensionContributionDiv');
    const contributionToggle = getElem('contributionToggle');
    const lwYearSlider = getElem('lwYearSlider');
    const lwYearDisplay = getElem('lwYearDisplay');
    const eligibleLoanAmountElem = getElem('eligibleLoanAmount');
    const maxWithdrawalAmountElem = getElem('maxWithdrawalAmount');
    const totalInvestmentElem = getElem('totalInvestment');
    const totalInterestElem = getElem('totalInterest');
    const maturityValueElem = getElem('maturityValue');
    const maturityTermDisplay = getElem('maturityTermDisplay');
    const doughnutCanvas = getElem('ppfDoughnutChart');
    
    // VALUE ELEMENTS
    const taxSlabSelect = getElem('taxSlabSelect');
    const taxSavedDisplay = getElem('taxSavedDisplay');
    const wealthMultiplierDisplay = getElem('wealthMultiplierDisplay');
    const optimizationBadge = getElem('optimizationBadge');

    let ppfDoughnutChart;
    let extensionBlocks = 0;
    const MAX_EXTENSIONS = 4;
    let yearlyDataCache = [];
    let prevExtensionBlocks = 0; // Tracks state transitions securely

    // INTEREST OPTIMIZATION STATE
    let isBeforeApril5th = true;

    // VARIABLE REAL-LIFE OVERRIDES state
    let customInvestments = {};

    // Helper function to run full compounding loop based on April 5th status
    function runCompoundingLoop(beforeApril5th) {
        const annualInvestmentValue = parseFloat(annualInvestmentInput.value) || 0;
        const interestRate = (parseFloat(interestRateInput.value) || 7.1) / 100;
        const continueContributions = contributionToggle.checked;
        const initialTerm = 15;
        const totalTerm = initialTerm + (extensionBlocks * 5);

        let balance = 0;
        let totalInvested = 0;
        let yearlyData = [];

        for (let year = 1; year <= totalTerm; year++) {
            let yearlyInvestment;
            
            if (customInvestments[year] !== undefined) {
                yearlyInvestment = customInvestments[year];
            } else {
                yearlyInvestment = (year <= initialTerm || (year > initialTerm && continueContributions)) ? annualInvestmentValue : 0;
                if (year > initialTerm && continueContributions) {
                    yearlyInvestment = Math.min(yearlyInvestment, 150000);
                }
            }

            totalInvested += yearlyInvestment;
            const openingBalance = year === 1 ? 0 : yearlyData[year - 2].closingBalance;
            
            // INTEREST COMPUTATION: 
            // If deposited after April 5th, the new deposit only earns interest for 11 months of that year.
            const depositInterestFactor = beforeApril5th ? 1.0 : (11.0 / 12.0);
            const interestEarned = (openingBalance * interestRate) + (yearlyInvestment * interestRate * depositInterestFactor);
            balance = openingBalance + yearlyInvestment + interestEarned;

            yearlyData.push({
                year: year,
                openingBalance: openingBalance,
                invested: yearlyInvestment,
                interest: interestEarned,
                closingBalance: balance
            });
        }

        return {
            balance,
            totalInvested,
            totalInterest: balance - totalInvested,
            yearlyData
        };
    }

    // --- Main Calculation Logic ---
    function updateCalculator() {
        const annualInvestmentValue = parseFloat(annualInvestmentInput.value);
        const interestRateValue = parseFloat(interestRateInput.value);
        let isValid = true;

        // Validate Inputs
        if (isNaN(annualInvestmentValue) || annualInvestmentValue < 500 || annualInvestmentValue > 150000) {
            getElem('annualInvestmentError')?.classList.remove('invisible');
            isValid = false;
        } else {
            getElem('annualInvestmentError')?.classList.add('invisible');
        }

        if (isNaN(interestRateValue) || interestRateValue < 5 || interestRateValue > 10) {
            getElem('interestRateError')?.classList.remove('invisible');
            isValid = false;
        } else {
             getElem('interestRateError')?.classList.add('invisible');
        }

        if (!isValid) {
            totalInvestmentElem.textContent = '-';
            totalInterestElem.textContent = '-';
            maturityValueElem.textContent = '-';
            wealthMultiplierDisplay.textContent = '-';
            taxSavedDisplay.textContent = '-';
            updateDoughnutChart([1], ['Invalid Input'], ['#E5E7EB']);
            eligibleLoanAmountElem.textContent = '-';
            maxWithdrawalAmountElem.textContent = '-';
            optimizationBadge.className = "hidden";
            return;
        }

        const initialTerm = 15;
        const totalTerm = initialTerm + (extensionBlocks * 5);

        lwYearSlider.max = totalTerm;
        getElem('lwYearMaxLabel').textContent = `Yr ${totalTerm}`;
        if (parseInt(lwYearSlider.value) > totalTerm) {
            lwYearSlider.value = totalTerm;
        }
        updateSliderFill(lwYearSlider);

        // Run active selected scenario
        const activeResults = runCompoundingLoop(isBeforeApril5th);
        const totalInvested = activeResults.totalInvested;
        const totalInterest = activeResults.totalInterest;
        const balance = activeResults.balance;
        yearlyDataCache = activeResults.yearlyData;

        // Calculate parallel interest optimization comparison (opposite scenario)
        const parallelResults = runCompoundingLoop(!isBeforeApril5th);
        const deltaMaturityLoss = Math.abs(balance - parallelResults.balance);

        // Configure optimization advisory badge metrics
        if (deltaMaturityLoss > 0) {
            optimizationBadge.className = isBeforeApril5th 
                ? "p-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-950 font-bold text-[11px] mb-2 text-center transition-all shadow-sm"
                : "p-2.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-950 font-bold text-[11px] mb-2 text-center transition-all shadow-sm";
            
            optimizationBadge.classList.remove('hidden');
            if (isBeforeApril5th) {
                optimizationBadge.innerHTML = `✓ <strong>Maximized Returns!</strong> By depositing on/before April 5th, you save <span class="text-emerald-800 font-extrabold">${formatCurrency(deltaMaturityLoss)}</span> in compounding interest loss compared to late deposits.`;
            } else {
                optimizationBadge.innerHTML = `⚠ <strong>Compounding Interest Loss!</strong> Depositing after April 5th reduces compounding efficiency. You lose <span class="text-rose-800 font-extrabold">${formatCurrency(deltaMaturityLoss)}</span> over your tenure.`;
            }
        } else {
            optimizationBadge.classList.add('hidden');
        }

        // Update Maturity Outputs
        totalInvestmentElem.textContent = formatCurrency(totalInvested);
        totalInterestElem.textContent = formatCurrency(totalInterest);
        maturityValueElem.textContent = formatCurrency(balance);
        maturityTermDisplay.textContent = `${totalTerm} Years`;

        const multiplier = totalInvested > 0 ? (balance / totalInvested) : 1.0;
        multiplierDisplay = multiplier.toFixed(2);
        wealthMultiplierDisplay.textContent = `${multiplierDisplay}x`;

        const taxableSlab = parseFloat(taxSlabSelect?.value || 0.2);
        const taxSavedYearly = Math.min(annualInvestmentValue, 150000) * taxableSlab;
        taxSavedDisplay.textContent = formatCurrency(taxSavedYearly);

        // Replaced chart colors with deeper equivalents for outstanding contrast
        updateDoughnutChart([totalInvested, totalInterest], ['Total Investment', 'Total Interest'], ['#2563EB', '#16A34A']);
        generateYearlyGrowthTable(yearlyDataCache);
        updateLoanAndWithdrawal();
    }

    // --- Loan and Withdrawal Logic ---
    function updateLoanAndWithdrawal() {
        const selectedYear = parseInt(lwYearSlider.value);
        lwYearDisplay.textContent = selectedYear;
        updateSliderFill(lwYearSlider);

        let eligibleLoan = 0;
        let maxWithdrawal = 0;

        if (yearlyDataCache.length === 0) {
            eligibleLoanAmountElem.textContent = '₹0';
            maxWithdrawalAmountElem.textContent = '₹0';
            return;
        }

        if (selectedYear >= 3 && selectedYear <= 6) {
            const balanceYearIndex = selectedYear - 3;
            if (yearlyDataCache[balanceYearIndex]) {
                eligibleLoan = yearlyDataCache[balanceYearIndex].closingBalance * 0.25;
            }
        }

        if (selectedYear >= 7) {
            const balancePrevYearIndex = selectedYear - 2;
            const balance4thPrevYearIndex = selectedYear - 5;

            const balanceAtPrevYear = yearlyDataCache[balancePrevYearIndex]?.closingBalance || 0;
            const balanceAt4thPrevYear = yearlyDataCache[balance4thPrevYearIndex]?.closingBalance || 0;

            maxWithdrawal = Math.min(balanceAtPrevYear * 0.5, balanceAt4thPrevYear * 0.5);
        }

        const currentBalanceIndex = selectedYear - 1;
        const currentBalance = yearlyDataCache[currentBalanceIndex]?.closingBalance || 0;
        maxWithdrawal = Math.min(maxWithdrawal, currentBalance);

        eligibleLoanAmountElem.textContent = formatCurrency(eligibleLoan);
        maxWithdrawalAmountElem.textContent = formatCurrency(maxWithdrawal);
    }

    // --- UI Update Functions ---
    function generateYearlyGrowthTable(data) {
        const tableBody = getElem('ledgerTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        data.forEach(row => {
            const tr = document.createElement('tr');
            
            // Highlight rows that have active custom override investments
            const hasOverride = customInvestments[row.year] !== undefined;
            const rowBgClass = hasOverride ? 'bg-blue-100/70 hover:bg-blue-200/70' : 'hover:bg-gray-50/75';
            tr.className = `${rowBgClass} border-b border-gray-100 transition-colors`;
            
            const inputClass = hasOverride 
                ? 'bg-blue-200 border-blue-500 font-extrabold text-blue-950 focus:border-blue-700'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-600';

            tr.innerHTML = `
                <td class="p-3 font-semibold text-gray-900">Year ${row.year}</td>
                <td class="p-3 text-gray-900 font-semibold">${formatCurrency(row.openingBalance)}</td>
                <td class="p-3 text-right">
                    <div class="inline-flex items-center space-x-1 justify-end">
                        <span class="text-gray-900 font-extrabold text-[11px]">₹</span>
                        <input type="number" 
                               class="yearly-invest-input w-24 px-1.5 py-0.5 border text-right font-semibold rounded text-[11px] outline-none ${inputClass}" 
                               value="${row.invested}" 
                               min="0" 
                               max="150000" 
                               step="500" 
                               data-year="${row.year}" 
                               aria-label="Investment Capital Year ${row.year}">
                    </div>
                </td>
                <td class="p-3 text-emerald-900 font-semibold">${formatCurrency(row.interest)}</td>
                <td class="p-3 text-indigo-900 font-bold">${formatCurrency(row.closingBalance)}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    function updateDoughnutChart(data, labels, colors) {
        const doughnutCtx = doughnutCanvas.getContext('2d');
        const chartData = { labels, datasets: [{ data, backgroundColor: colors, hoverOffset: 4, borderRadius: 3, spacing: 1 }] };
        const chartOptions = { responsive: true, maintainAspectRatio: false, cutout: '55%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${context.label}: ${formatCurrency(context.parsed)}` } } } };
        if (ppfDoughnutChart) { ppfDoughnutChart.data = chartData; ppfDoughnutChart.update(); }
        else { ppfDoughnutChart = new Chart(doughnutCtx, { type: 'doughnut', data: chartData, options: chartOptions }); }
    }

    // Handles state updates for PPF extensions
    function updateExtensionUI() {
        extensionBlocksInput.value = `${extensionBlocks} blocks (${extensionBlocks * 5} yrs)`;
        
        if (extensionBlocks > 0) {
            // Elevated disabled opacity to 70% to exceed WCAG AA contrast thresholds
            extensionContributionDiv.classList.remove('opacity-70', 'pointer-events-none');
            extensionContributionDiv.setAttribute('aria-disabled', 'false');
            contributionToggle.disabled = false;
            if (prevExtensionBlocks === 0) {
                contributionToggle.checked = true;
            }
        } else {
            contributionToggle.checked = false;
            contributionToggle.disabled = true;
            extensionContributionDiv.classList.add('opacity-70', 'pointer-events-none');
            extensionContributionDiv.setAttribute('aria-disabled', 'true');
        }
        
        prevExtensionBlocks = extensionBlocks; // Track previous state
        updateCalculator();
    }

    // SAFE SHARING MODAL CONTROLLER
    function handleShare() {
        const params = new URLSearchParams();
        params.set('investment', annualInvestmentInput.value);
        params.set('rate', interestRateInput.value);
        params.set('extensions', extensionBlocks);
        params.set('contributions', contributionToggle.checked);
        params.set('timing', isBeforeApril5th);
        params.set('maturity', maturityValueElem.textContent.replace(/[^0-9.]/g, ''));

        const shareUrl = `https://toolblaster.com/finance/ppf-calculator?${params.toString()}`;

        const shareUrlInput = getElem('shareUrlInput');
        const shareModal = getElem('shareModal');
        const modalReportContent = getElem('modalReportContent');

        if (shareUrlInput && shareModal && modalReportContent) {
            modalReportContent.innerHTML = `
                <h2 class="text-xs font-bold text-gray-900 mb-2 font-extrabold">Maturity Projection Report</h2>
                <ul class="flex flex-col gap-2 mt-1">
                    <li class="flex justify-between border-b border-gray-200 pb-1">
                        <span class="text-xxs text-gray-900 font-extrabold">Yearly Investment Base:</span> 
                        <span class="text-xxs font-extrabold text-gray-900">${formatCurrency(parseFloat(annualInvestmentInput.value))}</span>
                    </li>
                    <li class="flex justify-between border-b border-gray-200 pb-1">
                        <span class="text-xxs text-gray-900 font-extrabold">Deposit Timing:</span> 
                        <span class="text-xxs font-extrabold text-gray-900">${isBeforeApril5th ? 'On/Before April 5th' : 'After April 5th'}</span>
                    </li>
                    <li class="flex justify-between border-b border-gray-200 pb-1">
                        <span class="text-xxs text-gray-900 font-extrabold">Interest Rate:</span> 
                        <span class="text-xxs font-extrabold text-gray-900">${interestRateInput.value}% p.a.</span>
                    </li>
                    <li class="flex justify-between border-b border-gray-200 pb-1">
                        <span class="text-xxs text-gray-900 font-extrabold">Maturity Term:</span> 
                        <span class="text-xxs font-extrabold text-gray-900">${15 + (extensionBlocks * 5)} Years</span>
                    </li>
                    <li class="flex justify-between border-b border-gray-200 pb-1">
                        <span class="text-xxs text-gray-900 font-extrabold">Fresh Contributions?</span> 
                        <span class="text-xxs font-extrabold text-gray-900">${contributionToggle.checked ? 'Yes' : 'No'}</span>
                    </li>
                    <li class="flex justify-between border-b border-gray-200 pb-1">
                        <span class="text-xxs text-gray-900 font-extrabold">Total Invested Capital:</span> 
                        <span class="text-xxs font-extrabold text-gray-900">${totalInvestmentElem.textContent}</span>
                    </li>
                    <li class="flex justify-between border-b border-gray-200 pb-1">
                        <span class="text-xxs text-gray-900 font-extrabold">Accumulated Interest:</span> 
                        <span class="text-xxs font-extrabold text-green-950">${totalInterestElem.textContent}</span>
                    </li>
                    <li class="flex justify-between border-b border-gray-200 pb-1">
                        <span class="text-xxs text-gray-900 font-extrabold">Wealth Multiplier:</span> 
                        <span class="text-xxs font-extrabold text-amber-950">${wealthMultiplierDisplay.textContent}</span>
                    </li>
                    <li class="flex justify-between pt-1">
                        <span class="text-xxs text-indigo-950 font-black">Final Maturity Value:</span> 
                        <span class="text-xxs font-black text-indigo-950">${maturityValueElem.textContent}</span>
                    </li>
                </ul>
            `;
            shareUrlInput.value = shareUrl;
            shareModal.classList.add('active');
        }
    }

    // --- EXPORT UTILITY ROUTINES ---
    function exportToCSV() {
        if (yearlyDataCache.length === 0) {
            showNotification("No ledger data available to export!");
            return;
        }

        let csvRows = [
            ["Year", "Opening Balance (INR)", "Invested Capital (INR)", "Interest Earned (INR)", "Closing Balance (INR)"]
        ];

        yearlyDataCache.forEach(row => {
            csvRows.push([
                `Year ${row.year}`,
                Math.round(row.openingBalance),
                Math.round(row.invested),
                Math.round(row.interest),
                Math.round(row.closingBalance)
            ]);
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "PPF_Investment_Yearly_Ledger.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification("CSV ledger exported successfully!");
    }

    // Print / Save PDF utility triggers print window
    function printPDFReport() {
        showNotification("Preparing print preview layout...");
        setTimeout(() => {
            window.print();
        }, 400);
    }

    // Preset rate handler
    function applyPresetRate(rateValue, buttonId) {
        interestRateInput.value = rateValue;
        const slider = getElem('interestRateSlider');
        if (slider) {
            slider.value = rateValue;
            updateSliderFill(slider);
        }

        // Update preset buttons styling
        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
        getElem(buttonId)?.classList.add('active');
        updateCalculator();
    }

    function loadFromUrl() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('investment')) {
            annualInvestmentInput.value = params.get('investment') || 150000;
            interestRateInput.value = params.get('rate') || 7.1;
            extensionBlocks = parseInt(params.get('extensions')) || 0;
            extensionBlocks = Math.max(0, Math.min(extensionBlocks, MAX_EXTENSIONS));
            contributionToggle.checked = params.get('contributions') === 'true';
            
            if (params.has('timing')) {
                isBeforeApril5th = params.get('timing') === 'true';
                if (isBeforeApril5th) {
                    getElem('depositBeforeBtn').classList.add('active');
                    getElem('depositAfterBtn').classList.remove('active');
                } else {
                    getElem('depositBeforeBtn').classList.remove('active');
                    getElem('depositAfterBtn').classList.add('active');
                }
            }

            // Sync sliders
            getElem('annualInvestmentSlider').value = annualInvestmentInput.value;
            getElem('interestRateSlider').value = interestRateInput.value;
            updateSliderFill(getElem('annualInvestmentSlider'));
            updateSliderFill(getElem('interestRateSlider'));
            updateExtensionUI();
        } else {
             updateCalculator();
        }
    }

    // --- Event Bindings Setup ---
    function setupEventListeners() {
        const debouncedUpdate = debounce(updateCalculator, 250);

        syncSliderAndInput({
            sliderId: 'annualInvestmentSlider',
            inputId: 'annualInvestmentInput',
            decrementId: 'annualInvestmentDecrement',
            incrementId: 'annualInvestmentIncrement',
            updateCallback: debouncedUpdate
        });
        syncSliderAndInput({
            sliderId: 'interestRateSlider',
            inputId: 'interestRateInput',
            decrementId: 'interestRateDecrement',
            incrementId: 'interestRateIncrement',
            updateCallback: debouncedUpdate
        });

        // Toggle timing controllers
        getElem('depositBeforeBtn').addEventListener('click', () => {
            if (!isBeforeApril5th) {
                isBeforeApril5th = true;
                getElem('depositBeforeBtn').classList.add('active');
                getElem('depositAfterBtn').classList.remove('active');
                updateCalculator();
            }
        });

        getElem('depositAfterBtn').addEventListener('click', () => {
            if (isBeforeApril5th) {
                isBeforeApril5th = false;
                getElem('depositBeforeBtn').classList.remove('active');
                getElem('depositAfterBtn').classList.add('active');
                updateCalculator();
            }
        });

        increaseExtensionBtn.addEventListener('click', () => {
            if (extensionBlocks < MAX_EXTENSIONS) {
                extensionBlocks++;
                updateExtensionUI();
            }
        });

        decreaseExtensionBtn.addEventListener('click', () => {
            if (extensionBlocks > 0) {
                extensionBlocks--;
                updateExtensionUI();
            }
        });

        contributionToggle.addEventListener('change', updateCalculator);
        taxSlabSelect?.addEventListener('change', updateCalculator);

        // Collapsible accordion table ledger logic
        const toggleLedgerBtn = getElem('toggleLedgerBtn');
        const ledgerContent = getElem('ledgerContent');
        const ledgerChevron = getElem('ledgerChevron');

        toggleLedgerBtn.addEventListener('click', () => {
            const isHidden = ledgerContent.classList.toggle('hidden');
            ledgerChevron.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
        });

        // Bind Export ledger buttons
        getElem('exportCsvBtn').addEventListener('click', exportToCSV);
        getElem('printPdfBtn').addEventListener('click', printPDFReport);

        // Reset custom overrides button
        getElem('resetDefaultsBtn').addEventListener('click', () => {
            customInvestments = {};
            updateCalculator();
            showNotification("All years reset to default annual investment!");
        });

        // Preset rates buttons binding
        getElem('presetCurrent').addEventListener('click', () => applyPresetRate(7.1, 'presetCurrent'));
        getElem('presetHistHigh').addEventListener('click', () => applyPresetRate(8.0, 'presetHistHigh'));
        getElem('presetHistLow').addEventListener('click', () => applyPresetRate(6.5, 'presetHistLow'));

        const debouncedLoanUpdate = debounce(updateLoanAndWithdrawal, 150);
        lwYearSlider.addEventListener('input', () => {
            lwYearDisplay.textContent = lwYearSlider.value;
            updateSliderFill(lwYearSlider);
            debouncedLoanUpdate();
        });

        // Dynamic Table Investment Change Handlers via Event Delegation
        const tableBody = getElem('ledgerTableBody');
        tableBody.addEventListener('change', (e) => {
            if (e.target && e.target.classList.contains('yearly-invest-input')) {
                const year = parseInt(e.target.dataset.year);
                let val = parseFloat(e.target.value);

                if (isNaN(val) || val < 0) {
                    val = 0;
                }

                // PPF Rules validation: Either ₹0 or between statutory ₹500 and ₹1,50,000
                if (val > 0 && val < 500) {
                    val = 500;
                    showNotification("Investment must be at least ₹500 (or ₹0)");
                } else if (val > 150000) {
                    val = 150000;
                    showNotification("Annual statutory limit is capped at ₹1,50,000");
                }

                // Store override in global state
                customInvestments[year] = val;
                
                // Recalculate calculations & rebuild layout
                updateCalculator();
                showNotification(`Year ${year} investment modified to ${formatCurrency(val)}!`);
            }
        });

        // Bound click handler onto the Share Report Button
        const shareReportBtn = getElem('shareReportBtn');
        if (shareReportBtn) {
            shareReportBtn.addEventListener('click', handleShare);
        }

        const shareModal = getElem('shareModal');
        const closeModalBtn = getElem('closeModalBtn');
        const copyUrlBtn = getElem('copyUrlBtn');

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                shareModal.classList.remove('active');
            });
        }
        
        window.addEventListener('click', (event) => { 
            const shareModal = getElem('shareModal');
            if (shareModal && event.target == shareModal) {
                shareModal.classList.remove('active');
            } 
        });

        if (copyUrlBtn) {
            copyUrlBtn.addEventListener('click', () => {
                const shareUrlInput = getElem('shareUrlInput');
                shareUrlInput.select();
                try {
                    document.execCommand('copy');
                    showNotification('Link copied to clipboard!');
                } catch (err) {
                     console.error('Copy failed:', err);
                     showNotification('Could not copy link.');
                }
            });
        }
    }

    // --- Initialize Runtime ---
    setupEventListeners();
    loadFromUrl();
    updateInflationSectionState = function() {}; // Safe fallback
    updateCalculator();
});