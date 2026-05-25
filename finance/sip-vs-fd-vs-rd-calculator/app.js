// ==========================================
// MODULE: UTILS.JS - Reusable helpers
// ==========================================
function formatCurrency(num) {
    if (isNaN(num) || num === Infinity || num === -Infinity) return '₹0';
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
            errorElement.classList.toggle('invisible', isValid); // CLS FIX: "invisible" toggle blocks layout shift
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
                debouncedUpdate();
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

// ==========================================
// MODULE: NOTIFICATION TOAST
// ==========================================
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

// ==========================================
// MODULE: CALCULATOR MATH ENGINE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const getElem = (id) => document.getElementById(id);

    // Inputs
    const initialLumpsumInput = getElem('initialLumpsumInput');
    const monthlyInvestmentInput = getElem('monthlyInvestmentInput');
    const investmentPeriodInput = getElem('investmentPeriodInput');
    const sipReturnInput = getElem('sipReturnInput');
    const rdReturnInput = getElem('rdReturnInput');
    const fdReturnInput = getElem('fdReturnInput');
    const debtReturnInput = getElem('debtReturnInput');
    const taxSlabSelect = getElem('taxSlabSelect');
    const inflationToggle = getElem('inflationToggle');
    const inflationRateInput = getElem('inflationRateInput');
    const sipIncreaseRateInput = getElem('sipIncreaseRateInput');
    const sipIncreaseTypeToggle = getElem('sipIncreaseTypeToggle');
    const rdIncreaseRateInput = getElem('rdIncreaseRateInput');
    const rdIncreaseTypeToggle = getElem('rdIncreaseTypeToggle');

    // Outputs - SIP
    const sipInvestedElem = getElem('sipInvested');
    const sipReturnsElem = getElem('sipReturns');
    const sipTotalElem = getElem('sipTotal');
    const sipTotalPostTaxElem = getElem('sipTotalPostTax');
    const sipRealValueElem = getElem('sipRealValue');
    const sipRealValueItem = getElem('sipRealValueItem');

    // Outputs - RD
    const rdInvestedElem = getElem('rdInvested');
    const rdReturnsElem = getElem('rdReturns');
    const rdReturnsPostTaxElem = getElem('rdReturnsPostTax');
    const rdTotalElem = getElem('rdTotal');
    const rdTotalPostTaxElem = getElem('rdTotalPostTax');
    const rdRealValueElem = getElem('rdRealValue');
    const rdRealValueItem = getElem('rdRealValueItem');

    // Outputs - Lumpsum
    const lumpsumInvestedElem = getElem('lumpsumInvested');
    const lumpsumReturnsElem = getElem('lumpsumReturns');
    const lumpsumTotalElem = getElem('lumpsumTotal');
    const lumpsumTotalPostTaxElem = getElem('lumpsumTotalPostTax');
    const lumpsumRealValueElem = getElem('lumpsumRealValue');
    const lumpsumRealValueItem = getElem('lumpsumRealValueItem');

    // Outputs - FD vs Debt (Post Tax)
    const fdReturnsPostTaxElem = getElem('fdReturnsPostTax');
    const fdTotalPostTaxElem = getElem('fdTotalPostTax');
    const fdRealValueElem = getElem('fdRealValue');
    const fdRealValueItem = getElem('fdRealValueItem');
    const debtReturnsPostTaxElem = getElem('debtReturnsPostTax');
    const debtTotalPostTaxElem = getElem('debtTotalPostTax');
    const debtRealValueElem = getElem('debtRealValue');
    const debtRealValueItem = getElem('debtRealValueItem');

    // Charts canvases
    const finalValueCanvas = getElem('finalValueChart');
    const growthCanvas = getElem('growthChart');
    let finalValueChart;
    let growthChart;
    let growthChartData = {};

    const chartToggleButtons = document.querySelectorAll('.toggle-btn');
    let activeChartDataset = 'sip';

    // Share Elements
    const shareReportBtn = getElem('shareReportBtn');
    const shareModal = getElem('shareModal');
    const closeModalBtn = getElem('closeModalBtn');
    const modalReportContent = getElem('modalReportContent');
    const shareUrlInput = getElem('shareUrlInput');
    const copyUrlBtn = getElem('copyUrlBtn');

    // --- Calculation Routines incorporating precise Indian Tax logic ---

    // SIP calculation with year-by-year milestone compilation
    function calculateSIP(initialLumpsum, monthlyPrincipal, years, rate, taxSlab, inflationRate, increaseValue, isIncreaseAmount) {
        const monthlyRate = rate / 12 / 100;
        let totalInvested = initialLumpsum;
        let preTaxBalance = initialLumpsum;
        let currentMonthlyInvestment = monthlyPrincipal;
        
        let yearlyMilestones = [{
            year: 0,
            invested: initialLumpsum,
            preTaxValue: initialLumpsum,
            taxLiability: 0,
            postTaxValue: initialLumpsum,
            realValue: initialLumpsum
        }];

        for (let year = 1; year <= years; year++) {
            let yearDeposits = 0;
            for (let month = 1; month <= 12; month++) {
                preTaxBalance = preTaxBalance * (1 + monthlyRate) + currentMonthlyInvestment;
                yearDeposits += currentMonthlyInvestment;
            }
            totalInvested += yearDeposits;

            // Indian Capital Gains logic for Equity Mutual Funds
            const cumulativeGains = preTaxBalance - totalInvested;
            let taxLiability = 0;

            if (year <= 1) {
                // Short-Term Capital Gains (STCG) = 20% flat
                taxLiability = Math.max(0, cumulativeGains * 0.20);
            } else {
                // Long-Term Capital Gains (LTCG) = 12.5% on gains above ₹1.25 Lakh
                taxLiability = Math.max(0, (cumulativeGains - 125000) * 0.125);
            }

            const postTaxValue = preTaxBalance - taxLiability;
            const realValue = postTaxValue / Math.pow(1 + inflationRate / 100, year);

            yearlyMilestones.push({
                year: year,
                invested: totalInvested,
                preTaxValue: preTaxBalance,
                taxLiability: taxLiability,
                postTaxValue: postTaxValue,
                realValue: realValue
            });

            // Step up
            if (isIncreaseAmount) {
                currentMonthlyInvestment += increaseValue;
            } else {
                currentMonthlyInvestment *= (1 + (increaseValue / 100));
            }
        }

        const finalRecord = yearlyMilestones[years];
        return {
            totalInvested: finalRecord.invested,
            totalReturns: finalRecord.preTaxValue - finalRecord.invested,
            futureValue: finalRecord.preTaxValue,
            taxLiability: finalRecord.taxLiability,
            futureValuePostTax: finalRecord.postTaxValue,
            yearlyData: yearlyMilestones.map(m => ({ year: m.year, value: m.preTaxValue })),
            yearlyDataPostTax: yearlyMilestones.map(m => ({ year: m.year, value: m.postTaxValue })),
            milestones: yearlyMilestones
        };
    }

    // Lumpsum calculation with year-by-year milestone compilation
    function calculateLumpsum(principal, years, rate, taxSlab, inflationRate) {
        const annualRate = rate / 100;
        let preTaxBalance = principal;
        
        let yearlyMilestones = [{
            year: 0,
            invested: principal,
            preTaxValue: principal,
            taxLiability: 0,
            postTaxValue: principal,
            realValue: principal
        }];

        for (let year = 1; year <= years; year++) {
            preTaxBalance *= (1 + annualRate);
            const cumulativeGains = preTaxBalance - principal;
            let taxLiability = 0;

            if (year <= 1) {
                taxLiability = Math.max(0, cumulativeGains * 0.20);
            } else {
                taxLiability = Math.max(0, (cumulativeGains - 125000) * 0.125);
            }

            const postTaxValue = preTaxBalance - taxLiability;
            const realValue = postTaxValue / Math.pow(1 + inflationRate / 100, year);

            yearlyMilestones.push({
                year: year,
                invested: principal,
                preTaxValue: preTaxBalance,
                taxLiability: taxLiability,
                postTaxValue: postTaxValue,
                realValue: realValue
            });
        }

        const finalRecord = yearlyMilestones[years];
        return {
            totalInvested: principal,
            totalReturns: finalRecord.preTaxValue - principal,
            futureValue: finalRecord.preTaxValue,
            taxLiability: finalRecord.taxLiability,
            futureValuePostTax: finalRecord.postTaxValue,
            yearlyData: yearlyMilestones.map(m => ({ year: m.year, value: m.preTaxValue })),
            yearlyDataPostTax: yearlyMilestones.map(m => ({ year: m.year, value: m.postTaxValue })),
            milestones: yearlyMilestones
        };
    }

    // RD calculation with compounding tax logic (TDS/Accrued interest taxed annually)
    function calculateRD(initialLumpsum, monthlyPrincipal, years, rate, taxSlab, inflationRate, increaseValue, isIncreaseAmount) {
        const monthlyRate = rate / 12 / 100;
        let totalInvested = initialLumpsum;
        let preTaxCompounded = initialLumpsum; 
        let postTaxCompounded = initialLumpsum; 
        let currentMonthlyInvestment = monthlyPrincipal;

        let yearlyMilestones = [{
            year: 0,
            invested: initialLumpsum,
            preTaxValue: initialLumpsum,
            taxLiability: 0,
            postTaxValue: initialLumpsum,
            realValue: initialLumpsum
        }];

        for (let year = 1; year <= years; year++) {
            let yearDeposits = 0;
            let yearlyStartPreTax = preTaxCompounded;
            let yearlyStartPostTax = postTaxCompounded;

            for (let month = 1; month <= 12; month++) {
                preTaxCompounded = preTaxCompounded * (1 + monthlyRate) + currentMonthlyInvestment;
                postTaxCompounded = postTaxCompounded * (1 + monthlyRate) + currentMonthlyInvestment;
                yearDeposits += currentMonthlyInvestment;
            }
            totalInvested += yearDeposits;

            // Standard Pre-tax interest earned in current year
            const interestPreTax = preTaxCompounded - yearlyStartPreTax - yearDeposits;
            // Accrued post-tax interest deduction (Slab-based annual TDS math)
            const interestPostTax = postTaxCompounded - yearlyStartPostTax - yearDeposits;
            const annualTaxLiability = Math.max(0, interestPostTax * taxSlab);
            postTaxCompounded -= annualTaxLiability; 

            const cumulativeTaxPaid = (yearlyMilestones[year-1]?.taxLiability || 0) + annualTaxLiability;
            const realValue = postTaxCompounded / Math.pow(1 + inflationRate / 100, year);

            yearlyMilestones.push({
                year: year,
                invested: totalInvested,
                preTaxValue: preTaxCompounded,
                taxLiability: cumulativeTaxPaid,
                postTaxValue: postTaxCompounded,
                realValue: realValue
            });

            // Step up
            if (isIncreaseAmount) {
                currentMonthlyInvestment += increaseValue;
            } else {
                currentMonthlyInvestment *= (1 + (increaseValue / 100));
            }
        }

        const finalRecord = yearlyMilestones[years];
        return {
            totalInvested: finalRecord.invested,
            totalReturns: finalRecord.preTaxValue - finalRecord.invested,
            futureValue: finalRecord.preTaxValue,
            taxLiability: finalRecord.taxLiability,
            futureValuePostTax: finalRecord.postTaxValue,
            yearlyData: yearlyMilestones.map(m => ({ year: m.year, value: m.preTaxValue })),
            yearlyDataPostTax: yearlyMilestones.map(m => ({ year: m.year, value: m.postTaxValue })),
            milestones: yearlyMilestones
        };
    }

    // FD calculation compounding post-tax interest annually
    function calculateFD(principal, years, rate, taxSlab, inflationRate) {
        const annualRate = rate / 100;
        let preTaxCompounded = principal;
        let postTaxCompounded = principal;

        let yearlyMilestones = [{
            year: 0,
            invested: principal,
            preTaxValue: principal,
            taxLiability: 0,
            postTaxValue: principal,
            realValue: principal
        }];

        for (let year = 1; year <= years; year++) {
            const prevPreTax = preTaxCompounded;
            const prevPostTax = postTaxCompounded;

            preTaxCompounded *= (1 + annualRate);
            postTaxCompounded *= (1 + annualRate);

            const annualInterestPostTax = postTaxCompounded - prevPostTax;
            const annualTaxLiability = Math.max(0, annualInterestPostTax * taxSlab);
            postTaxCompounded -= annualTaxLiability;

            const cumulativeTaxPaid = (yearlyMilestones[year-1]?.taxLiability || 0) + annualTaxLiability;
            const realValue = postTaxCompounded / Math.pow(1 + inflationRate / 100, year);

            yearlyMilestones.push({
                year: year,
                invested: principal,
                preTaxValue: preTaxCompounded,
                taxLiability: cumulativeTaxPaid,
                postTaxValue: postTaxCompounded,
                realValue: realValue
            });
        }

        const finalRecord = yearlyMilestones[years];
        return {
            totalInvested: principal,
            totalReturns: finalRecord.preTaxValue - principal,
            futureValue: finalRecord.preTaxValue,
            taxLiability: finalRecord.taxLiability,
            futureValuePostTax: finalRecord.postTaxValue,
            yearlyData: yearlyMilestones.map(m => ({ year: m.year, value: m.preTaxValue })),
            yearlyDataPostTax: yearlyMilestones.map(m => ({ year: m.year, value: m.postTaxValue })),
            milestones: yearlyMilestones
        };
    }

    // Debt mutual funds (Indian tax: flat slab rate on cumulative returns upon redemption)
    function calculateDebtFund(principal, years, rate, taxSlab, inflationRate) {
        const annualRate = rate / 100;
        let preTaxCompounded = principal;

        let yearlyMilestones = [{
            year: 0,
            invested: principal,
            preTaxValue: principal,
            taxLiability: 0,
            postTaxValue: principal,
            realValue: principal
        }];

        for (let year = 1; year <= years; year++) {
            preTaxCompounded *= (1 + annualRate);
            const cumulativeGains = preTaxCompounded - principal;
            const taxLiability = Math.max(0, cumulativeGains * taxSlab); 
            const postTaxValue = preTaxCompounded - taxLiability;
            const realValue = postTaxValue / Math.pow(1 + inflationRate / 100, year);

            yearlyMilestones.push({
                year: year,
                invested: principal,
                preTaxValue: preTaxCompounded,
                taxLiability: taxLiability,
                postTaxValue: postTaxValue,
                realValue: realValue
            });
        }

        const finalRecord = yearlyMilestones[years];
        return {
            totalInvested: principal,
            totalReturns: finalRecord.preTaxValue - principal,
            futureValue: finalRecord.preTaxValue,
            taxLiability: finalRecord.taxLiability,
            futureValuePostTax: finalRecord.postTaxValue,
            yearlyData: yearlyMilestones.map(m => ({ year: m.year, value: m.preTaxValue })),
            yearlyDataPostTax: yearlyMilestones.map(m => ({ year: m.year, value: m.postTaxValue })),
            milestones: yearlyMilestones
        };
    }

    // Global calculated milestones container for dynamic ledger switching
    let globalCalculatedMilestones = {};

    // Render dynamic table inside Year-on-Year Growth Ledger
    function renderLedgerTable(selectedTab) {
        const milestones = globalCalculatedMilestones[selectedTab];
        const tableBody = getElem('ledgerTableBody');
        if (!tableBody || !milestones) return;

        tableBody.innerHTML = '';
        milestones.forEach(record => {
            const row = document.createElement('tr');
            row.className = "hover:bg-gray-50/75 border-b border-gray-100 transition-colors";
            row.innerHTML = `
                <td class="p-3 font-semibold text-gray-900">Year ${record.year}</td>
                <td class="p-3 text-gray-700">${formatCurrency(record.invested)}</td>
                <td class="p-3 text-gray-700 font-medium">${formatCurrency(record.preTaxValue)}</td>
                <td class="p-3 text-red-600 font-medium">${formatCurrency(record.taxLiability)}</td>
                <td class="p-3 text-indigo-900 font-bold">${formatCurrency(record.postTaxValue)}</td>
                <td class="p-3 text-amber-700 font-bold">${formatCurrency(record.realValue)}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // --- Main Controller for update triggering ---
    function updateComparison() {
        let isValid = true;
        const validateInput = (inputId, min, max, errorMessageElemId) => {
            const inputElem = getElem(inputId);
            const value = parseFloat(inputElem.value);
            const errorElem = getElem(errorMessageElemId);
            if (isNaN(value) || value < min || value > max) {
                errorElem?.classList.remove('invisible'); 
                return false;
            } else {
                errorElem?.classList.add('invisible'); 
                return true;
            }
        };

        isValid &= validateInput('initialLumpsumInput', 0, 5000000, 'initialLumpsumError');
        isValid &= validateInput('monthlyInvestmentInput', 500, 100000, 'monthlyInvestmentError');
        isValid &= validateInput('investmentPeriodInput', 1, 40, 'investmentPeriodError');
        isValid &= validateInput('sipReturnInput', 1, 25, 'sipReturnError');
        isValid &= validateInput('rdReturnInput', 1, 10, 'rdReturnError');
        isValid &= validateInput('fdReturnInput', 1, 10, 'fdReturnError');
        isValid &= validateInput('debtReturnInput', 1, 12, 'debtReturnError');
        isValid &= validateInput('inflationRateInput', 0, 15, 'inflationRateError');

        const isSipIncreaseAmount = sipIncreaseTypeToggle.checked;
        const sipIncreaseMax = isSipIncreaseAmount ? 5000 : 20;
        isValid &= validateInput('sipIncreaseRateInput', 0, sipIncreaseMax, 'sipIncreaseRateError');

        const isRdIncreaseAmount = rdIncreaseTypeToggle.checked;
        const rdIncreaseMax = isRdIncreaseAmount ? 5000 : 20;
        isValid &= validateInput('rdIncreaseRateInput', 0, rdIncreaseMax, 'rdIncreaseRateError');

        if (!isValid) {
            [sipInvestedElem, sipReturnsElem, sipTotalElem, sipTotalPostTaxElem, sipRealValueElem,
             rdInvestedElem, rdReturnsElem, rdReturnsPostTaxElem, rdTotalElem, rdTotalPostTaxElem, rdRealValueElem,
             lumpsumInvestedElem, lumpsumReturnsElem, lumpsumTotalElem, lumpsumTotalPostTaxElem, lumpsumRealValueElem,
             fdReturnsPostTaxElem, fdTotalPostTaxElem, fdRealValueElem,
             debtReturnsPostTaxElem, debtTotalPostTaxElem, debtRealValueElem].forEach(el => el.textContent = '-');

            [sipRealValueItem, rdRealValueItem, lumpsumRealValueItem, fdRealValueItem, debtRealValueItem].forEach(el => {
                el.style.opacity = '0.5';
                el.querySelector('.result-value.real').textContent = '-';
            });

            updateFinalValueChart([0,0,0,0,0]);
            growthChartData = {};
            updateGrowthChart();
            return;
        }

        // Gather Inputs
        const initialLumpsum = parseFloat(initialLumpsumInput.value) || 0;
        const monthlyInvestment = parseFloat(monthlyInvestmentInput.value) || 10000;
        const years = parseInt(investmentPeriodInput.value) || 15;
        const sipRate = parseFloat(sipReturnInput.value) || 13;
        const rdRate = parseFloat(rdReturnInput.value) || 7.0;
        const fdRate = parseFloat(fdReturnInput.value) || 7.2;
        const debtRate = parseFloat(debtReturnInput.value) || 7.5;
        const taxRate = parseFloat(taxSlabSelect.value) || 0.3;
        const applyInflation = inflationToggle.checked;
        const inflationRate = applyInflation ? (parseFloat(inflationRateInput.value) || 0) : 0;
        const sipIncreaseValue = parseFloat(sipIncreaseRateInput.value) || 0;
        const rdIncreaseValue = parseFloat(rdIncreaseRateInput.value) || 0;

        // Perform core calculations
        const sipData = calculateSIP(initialLumpsum, monthlyInvestment, years, sipRate, taxRate, inflationRate, sipIncreaseValue, isSipIncreaseAmount);
        const rdData = calculateRD(initialLumpsum, monthlyInvestment, years, rdRate, taxRate, inflationRate, rdIncreaseValue, isRdIncreaseAmount);
        const lumpsumData = calculateLumpsum(sipData.totalInvested, years, sipRate, taxRate, inflationRate);
        const fdData = calculateFD(sipData.totalInvested, years, fdRate, taxRate, inflationRate);
        const debtData = calculateDebtFund(sipData.totalInvested, years, debtRate, taxRate, inflationRate);

        // Compile global milestones for the Year-on-Year ledger switcher
        globalCalculatedMilestones = {
            sip: sipData.milestones,
            rd: rdData.milestones,
            lumpsum: lumpsumData.milestones,
            fd: fdData.milestones,
            debt: debtData.milestones
        };

        // Render default ledger tab
        const activeLedgerTab = document.querySelector('.ledger-tab-btn.active').dataset.ledger;
        renderLedgerTable(activeLedgerTab);

        // Update DOM text elements with formatted rupee strings
        sipInvestedElem.textContent = formatCurrency(sipData.totalInvested);
        sipReturnsElem.textContent = formatCurrency(sipData.totalReturns);
        sipTotalElem.textContent = formatCurrency(sipData.futureValue);
        sipTotalPostTaxElem.textContent = formatCurrency(sipData.futureValuePostTax);
        sipRealValueElem.textContent = formatCurrency(sipData.milestones[years].realValue);
        sipRealValueItem.style.opacity = applyInflation ? '1' : '0.5';

        rdInvestedElem.textContent = formatCurrency(rdData.totalInvested);
        rdReturnsElem.textContent = formatCurrency(rdData.totalReturns);
        rdReturnsPostTaxElem.textContent = formatCurrency(rdData.returnsPostTax);
        rdTotalElem.textContent = formatCurrency(rdData.futureValue);
        rdTotalPostTaxElem.textContent = formatCurrency(rdData.futureValuePostTax);
        rdRealValueElem.textContent = formatCurrency(rdData.milestones[years].realValue);
        rdRealValueItem.style.opacity = applyInflation ? '1' : '0.5';

        lumpsumInvestedElem.textContent = formatCurrency(lumpsumData.totalInvested);
        lumpsumReturnsElem.textContent = formatCurrency(lumpsumData.totalReturns);
        lumpsumTotalElem.textContent = formatCurrency(lumpsumData.futureValue);
        lumpsumTotalPostTaxElem.textContent = formatCurrency(lumpsumData.futureValuePostTax);
        lumpsumRealValueElem.textContent = formatCurrency(lumpsumData.milestones[years].realValue);
        lumpsumRealValueItem.style.opacity = applyInflation ? '1' : '0.5';

        fdReturnsPostTaxElem.textContent = formatCurrency(fdData.futureValuePostTax - lumpsumData.totalInvested);
        fdTotalPostTaxElem.textContent = formatCurrency(fdData.futureValuePostTax);
        fdRealValueElem.textContent = formatCurrency(fdData.milestones[years].realValue);
        fdRealValueItem.style.opacity = applyInflation ? '1' : '0.5';

        debtReturnsPostTaxElem.textContent = formatCurrency(debtData.futureValuePostTax - lumpsumData.totalInvested);
        debtTotalPostTaxElem.textContent = formatCurrency(debtData.futureValuePostTax);
        debtRealValueElem.textContent = formatCurrency(debtData.milestones[years].realValue);
        debtRealValueItem.style.opacity = applyInflation ? '1' : '0.5';

        growthChartData = {
            sip: applyInflation ? sipData.milestones.map(m => ({ year: m.year, value: m.realValue })) : sipData.yearlyDataPostTax,
            rd: applyInflation ? rdData.milestones.map(m => ({ year: m.year, value: m.realValue })) : rdData.yearlyDataPostTax,
            lumpsum: applyInflation ? lumpsumData.milestones.map(m => ({ year: m.year, value: m.realValue })) : lumpsumData.yearlyDataPostTax,
            fd: applyInflation ? fdData.milestones.map(m => ({ year: m.year, value: m.realValue })) : fdData.yearlyDataPostTax,
            debt: applyInflation ? debtData.milestones.map(m => ({ year: m.year, value: m.realValue })) : debtData.yearlyDataPostTax
        };

        updateFinalValueChart(applyInflation ? [
            sipData.milestones[years].realValue,
            rdData.milestones[years].realValue,
            lumpsumData.milestones[years].realValue,
            fdData.milestones[years].realValue,
            debtData.milestones[years].realValue
        ] : [
            sipData.futureValuePostTax,
            rdData.futureValuePostTax,
            lumpsumData.futureValuePostTax,
            fdData.futureValuePostTax,
            debtData.futureValuePostTax
        ]);
        updateGrowthChart();
    }

    // ACCESSIBILITY: Set disabled states of nested range inputs gracefully without disappearing check row
    function updateInflationSectionState() {
        const isChecked = inflationToggle.checked;
        const label = document.querySelector('label[for="inflationRateInput"]');
        const sliderRow = getElem('inflationRateSlider')?.parentElement;

        if (label) {
            if (!isChecked) {
                label.classList.add('opacity-40');
            } else {
                label.classList.remove('opacity-40');
            }
        }

        if (sliderRow) {
            if (!isChecked) {
                sliderRow.classList.add('opacity-40', 'pointer-events-none');
            } else {
                sliderRow.classList.remove('opacity-40', 'pointer-events-none');
            }
            const inputs = sliderRow.querySelectorAll('input, button');
            inputs.forEach(input => input.disabled = !isChecked);
        }
    }

    function updateFinalValueChart(finalValues) {
        const data = {
            labels: ['SIP', 'RD', 'Lumpsum', 'FD', 'Debt Fund'],
            datasets: [{
                label: inflationToggle.checked ? 'Final Real Value' : 'Final Post-Tax Value',
                data: finalValues,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(234, 179, 8, 0.7)',
                    'rgba(34, 197, 94, 0.7)',
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(168, 85, 247, 0.7)'
                ],
                borderColor: [
                     'rgba(37, 99, 235, 1)',
                     'rgba(202, 138, 4, 1)',
                     'rgba(22, 163, 74, 1)',
                     'rgba(220, 38, 38, 1)',
                     'rgba(147, 51, 234, 1)'
                ],
                borderWidth: 1,
                borderRadius: 3
            }]
        };

        const options = {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.x)}`
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: '#1f2937',
                        callback: (value) => new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short' }).format(value),
                        font:{size:8, weight: 600}
                    }
                },
                 y: { 
                     ticks: { 
                         color: '#1f2937',
                         font: {size: 9, weight: 600} 
                     } 
                 }
            }
        };

        if (finalValueChart) {
            finalValueChart.data = data;
            finalValueChart.options.plugins.tooltip.callbacks.label = (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.x)}`;
            finalValueChart.update();
        } else if (finalValueCanvas) {
            finalValueChart = new Chart(finalValueCanvas, { type: 'bar', data, options });
        }
    }

    // Charts growth configurations
    function updateGrowthChart() {
        const years = parseInt(investmentPeriodInput.value) || 0;
        if (years <= 0 || !activeChartDataset || !growthChartData[activeChartDataset]) {
             if (growthChart) {
                 growthChart.data.labels = [];
                 growthChart.data.datasets = [];
                 growthChart.update();
             }
             return;
        }

        const yearlyData = growthChartData[activeChartDataset];
        if (!Array.isArray(yearlyData) || yearlyData.length === 0) {
             if (growthChart) {
                 growthChart.data.labels = [];
                 growthChart.data.datasets = [];
                 growthChart.update();
             }
            return;
        }

        const labels = yearlyData.map(d => `Yr ${d.year}`);
        const dataPoints = yearlyData.map(d => d.value);

        const data = {
            labels: labels,
            datasets: [{
                label: `${activeChartDataset.toUpperCase()} Growth ${inflationToggle.checked ? '(Real Value)' : '(Adj. Value)'}`,
                data: dataPoints,
                borderColor: getChartColor(activeChartDataset).border,
                backgroundColor: getChartColor(activeChartDataset).background,
                fill: true,
                tension: 0.15,
                pointRadius: years <= 10 ? 3 : 0
            }]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `Value: ${formatCurrency(context.parsed.y)}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#1f2937',
                        callback: (value) => new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short' }).format(value),
                         font:{size:8, weight: 600}
                    }
                },
                x: {
                    ticks: {
                        color: '#1f2937',
                        font: {size: 8, weight: 600},
                        maxRotation: 0,
                        autoSkipPadding: 15
                    }
                }
            }
        };

        if (growthChart) {
            growthChart.data = data;
            growthChart.options.plugins.tooltip.callbacks.label = (context) => `Value: ${formatCurrency(context.parsed.y)}`;
            growthChart.update();
        } else if (growthCanvas) {
            growthChart = new Chart(growthCanvas, { type: 'line', data, options });
        }
    }

    // Chart color selection based on types
    function getChartColor(type) {
        switch(type) {
            case 'sip': return { border: 'rgba(59, 130, 246, 1)', background: 'rgba(59, 130, 246, 0.08)' };
            case 'rd': return { border: 'rgba(202, 138, 4, 1)', background: 'rgba(234, 179, 8, 0.08)' };
            case 'lumpsum': return { border: 'rgba(22, 163, 74, 1)', background: 'rgba(34, 197, 94, 0.08)' };
            case 'fd': return { border: 'rgba(220, 38, 38, 1)', background: 'rgba(239, 68, 68, 0.08)' };
            case 'debt': return { border: 'rgba(147, 51, 234, 1)', background: 'rgba(168, 85, 247, 0.08)' };
            default: return { border: 'rgba(107, 114, 128, 1)', background: 'rgba(107, 114, 128, 0.08)' };
        }
    }

    // --- Share Report Generator ---
    function populateAndShowModal() {
        const isInflationOn = inflationToggle.checked;
        const realValueLabel = 'Real Value';
        const postTaxLabel = '(Post-Tax)';

        modalReportContent.innerHTML = `
            <!-- ACCESSIBILITY FIX: Upgraded nested report title from h3 to h2 -->
            <h2>Investment Projection Report</h2>
            <ul>
                <li><span>Monthly Investment:</span> <span>${formatCurrency(monthlyInvestmentInput.value)}</span></li>
                <li><span>Initial Lumpsum:</span> <span>${formatCurrency(initialLumpsumInput.value)}</span></li>
                <li><span>Period:</span> <span>${investmentPeriodInput.value} Years</span></li>

                <li data-type="sip" style="margin-top: 5px; padding-top: 5px; border-top: 1px solid #f3f4f6;">
                    <span>SIP Final Value:</span> <span class="sip-color font-bold">${sipTotalElem.textContent}</span>
                </li>
                 ${isInflationOn ? `<li data-type="sip"><span>SIP ${realValueLabel}:</span> <span class="sip-real-color font-semibold">${sipRealValueElem.textContent}</span></li>` : ''}

                <li data-type="rd">
                    <span>RD Final Value ${postTaxLabel}:</span> <span class="rd-color post-tax-color font-bold">${rdTotalPostTaxElem.textContent}</span>
                </li>
                 ${isInflationOn ? `<li data-type="rd"><span>RD ${realValueLabel} ${postTaxLabel}:</span> <span class="rd-real-color font-semibold">${rdRealValueElem.textContent}</span></li>` : ''}

                <li data-type="lumpsum">
                    <span>Lumpsum Value:</span> <span class="lumpsum-color font-bold">${lumpsumTotalElem.textContent}</span>
                </li>
                 ${isInflationOn ? `<li data-type="lumpsum"><span>Lumpsum ${realValueLabel}:</span> <span class="lumpsum-real-color font-semibold">${lumpsumRealValueElem.textContent}</span></li>` : ''}

                <li data-type="fd">
                    <span>FD Value ${postTaxLabel}:</span> <span class="fd-color post-tax-color font-bold">${fdTotalPostTaxElem.textContent}</span>
                </li>
                 ${isInflationOn ? `<li data-type="fd"><span>FD ${realValueLabel} ${postTaxLabel}:</span> <span class="fd-real-color font-semibold">${fdRealValueElem.textContent}</span></li>` : ''}

                <li data-type="debt">
                    <span>Debt Fund Value ${postTaxLabel}:</span> <span class="debt-color post-tax-color font-bold">${debtTotalPostTaxElem.textContent}</span>
                </li>
                 ${isInflationOn ? `<li data-type="debt"><span>Debt Fund ${realValueLabel} ${postTaxLabel}:</span> <span class="debt-real-color font-semibold">${debtRealValueElem.textContent}</span></li>` : ''}
            </ul>
        `;

        const params = new URLSearchParams();
        params.set('init', initialLumpsumInput.value);
        params.set('monthly', monthlyInvestmentInput.value);
        params.set('period', investmentPeriodInput.value);
        params.set('sipRate', sipReturnInput.value);
        params.set('rdRate', rdReturnInput.value);
        params.set('fdRate', fdReturnInput.value);
        params.set('debtRate', debtReturnInput.value);
        params.set('tax', taxSlabSelect.value);
        params.set('sipInc', sipIncreaseRateInput.value);
        params.set('sipIncType', sipIncreaseTypeToggle.checked ? 'amt' : 'pct');
        params.set('rdInc', rdIncreaseRateInput.value);
        params.set('rdIncType', rdIncreaseTypeToggle.checked ? 'amt' : 'pct');
        if (inflationToggle.checked) {
            params.set('inf', inflationRateInput.value);
        }

        shareUrlInput.value = `https://toolblaster.com/finance/sip-vs-fd-vs-rd-calculator?${params.toString()}`;
        shareModal.classList.remove('hidden');
    }

    // URL handling on dynamic load
    function loadFromUrl() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('monthly')) {
            initialLumpsumInput.value = params.get('init') || 0;
            monthlyInvestmentInput.value = params.get('monthly') || 10000;
            investmentPeriodInput.value = params.get('period') || 15;
            sipReturnInput.value = params.get('sipRate') || 13;
            rdReturnInput.value = params.get('rdRate') || 7.0;
            fdReturnInput.value = params.get('fdRate') || 7.2;
            debtReturnInput.value = params.get('debtRate') || 7.5;
            taxSlabSelect.value = params.get('tax') || 0.3;
            sipIncreaseRateInput.value = params.get('sipInc') || 0;
            if (params.get('sipIncType') === 'amt') sipIncreaseTypeToggle.checked = true;
            rdIncreaseRateInput.value = params.get('rdInc') || 0;
            if (params.get('rdIncType') === 'amt') rdIncreaseTypeToggle.checked = true;

            if (params.has('inf')) {
                inflationToggle.checked = true;
                inflationRateInput.value = params.get('inf') || 6;
            } else {
                 inflationToggle.checked = false;
            }

            document.querySelectorAll('input[type="range"]').forEach(slider => {
                const inputId = slider.id.replace('Slider', 'Input');
                const input = getElem(inputId);
                if (input && slider) {
                    slider.value = input.value;
                    updateSliderFill(slider);
                }
            });
             sipIncreaseTypeToggle.dispatchEvent(new Event('change'));
             rdIncreaseTypeToggle.dispatchEvent(new Event('change'));
             inflationToggle.dispatchEvent(new Event('change'));
        }
         updateComparison();
    }

    // --- Preset Helper logic ---
    function applyPreset(presetType) {
        const presets = {
            conservative: { sip: 11, rd: 6.5, fd: 7.0, debt: 6.5 },
            balanced: { sip: 13, rd: 7.0, fd: 7.2, debt: 7.5 },
            aggressive: { sip: 16, rd: 7.5, fd: 7.5, debt: 8.5 }
        };
        
        const selected = presets[presetType];
        if (!selected) return;

        sipReturnInput.value = selected.sip;
        rdReturnInput.value = selected.rd;
        fdReturnInput.value = selected.fd;
        debtReturnInput.value = selected.debt;

        const sliderMap = [
            { s: 'sipReturnSlider', i: 'sipReturnInput' },
            { s: 'rdReturnSlider', i: 'rdReturnInput' },
            { s: 'fdReturnSlider', i: 'fdReturnInput' },
            { s: 'debtReturnSlider', i: 'debtReturnInput' }
        ];

        sliderMap.forEach(item => {
            const slider = getElem(item.s);
            const input = getElem(item.i);
            if (slider && input) {
                slider.value = input.value;
                updateSliderFill(slider);
            }
        });

        // Update active preset styling
        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
        const targetBtnId = 'preset' + presetType.charAt(0).toUpperCase() + presetType.slice(1);
        getElem(targetBtnId)?.classList.add('active');

        updateComparison();
    }

    // --- EXPORT FUNCTIONALITIES IMPLEMENTATION (CSV Exporter) ---
    function exportToCSV() {
        const activeTab = document.querySelector('.ledger-tab-btn.active').dataset.ledger;
        const milestones = globalCalculatedMilestones[activeTab];
        if (!milestones || milestones.length === 0) {
            showNotification("No data available to export!");
            return;
        }

        let csvRows = [
            ["Year", "Invested Capital (INR)", "Pre-Tax Value (INR)", "Est. Tax Liability (INR)", "Maturity Post-Tax (INR)", "Real Value Post-Tax (INR)"]
        ];

        milestones.forEach(m => {
            csvRows.push([
                `Year ${m.year}`,
                Math.round(m.invested),
                Math.round(m.preTaxValue),
                Math.round(m.taxLiability),
                Math.round(m.postTaxValue),
                Math.round(m.realValue)
            ]);
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `FinCalc_${activeTab.toUpperCase()}_Yearly_Ledger.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification(`CSV for ${activeTab.toUpperCase()} exported successfully!`);
    }

    // Print / Save PDF utility triggers native print window with targeted style blocks
    function printPDFReport() {
        const activeTab = document.querySelector('.ledger-tab-btn.active').dataset.ledger;
        showNotification(`Preparing PDF report for ${activeTab.toUpperCase()}...`);
        // Short timeout to let notifications resolve, then trigger native print flow
        setTimeout(() => {
            window.print();
        }, 400);
    }

    // --- Event Bindings Setup ---
    function setupEventListeners() {
        const debouncedUpdate = debounce(updateComparison, 300);

        syncSliderAndInput({ sliderId: 'initialLumpsumSlider', inputId: 'initialLumpsumInput', decrementId: 'initialLumpsumDecrement', incrementId: 'initialLumpsumIncrement', updateCallback: debouncedUpdate });
        syncSliderAndInput({ sliderId: 'monthlyInvestmentSlider', inputId: 'monthlyInvestmentInput', decrementId: 'monthlyInvestmentDecrement', incrementId: 'monthlyInvestmentIncrement', updateCallback: debouncedUpdate });
        syncSliderAndInput({ sliderId: 'investmentPeriodSlider', inputId: 'investmentPeriodInput', decrementId: 'investmentPeriodDecrement', incrementId: 'investmentPeriodIncrement', updateCallback: debouncedUpdate });
        syncSliderAndInput({ sliderId: 'sipReturnSlider', inputId: 'sipReturnInput', decrementId: 'sipReturnDecrement', incrementId: 'sipReturnIncrement', updateCallback: debouncedUpdate });
        syncSliderAndInput({ sliderId: 'rdReturnSlider', inputId: 'rdReturnInput', decrementId: 'rdReturnDecrement', incrementId: 'rdReturnIncrement', updateCallback: debouncedUpdate });
        syncSliderAndInput({ sliderId: 'fdReturnSlider', inputId: 'fdReturnInput', decrementId: 'fdReturnDecrement', incrementId: 'fdReturnIncrement', updateCallback: debouncedUpdate });
        syncSliderAndInput({ sliderId: 'debtReturnSlider', inputId: 'debtReturnInput', decrementId: 'debtReturnDecrement', incrementId: 'debtReturnIncrement', updateCallback: debouncedUpdate });
        syncSliderAndInput({ sliderId: 'inflationRateSlider', inputId: 'inflationRateInput', decrementId: 'inflationRateDecrement', incrementId: 'inflationRateIncrement', updateCallback: debouncedUpdate });
        syncSliderAndInput({ sliderId: 'sipIncreaseRateSlider', inputId: 'sipIncreaseRateInput', decrementId: 'sipIncreaseRateDecrement', incrementId: 'sipIncreaseRateIncrement', updateCallback: debouncedUpdate });
        syncSliderAndInput({ sliderId: 'rdIncreaseRateSlider', inputId: 'rdIncreaseRateInput', decrementId: 'rdIncreaseRateDecrement', incrementId: 'rdIncreaseRateIncrement', updateCallback: debouncedUpdate });

        taxSlabSelect.addEventListener('change', updateComparison);
        inflationToggle.addEventListener('change', () => {
             updateInflationSectionState();
             updateComparison();
        });

        function setupIncreaseToggle(toggle, label, slider, input, modePrefix) {
             if (!toggle || !label || !slider || !input) return;
             toggle.addEventListener('change', () => {
                const isAmountMode = toggle.checked;
                let currentValue = parseFloat(input.value) || 0;
                let maxAmount = 5000;
                let maxPercent = 20;
                let stepAmount = 100;
                let stepPercent = 1;

                if (modePrefix === 'sip' || modePrefix === 'rd') {
                     label.textContent = `${modePrefix.toUpperCase()} Annual Increase (${isAmountMode ? '₹' : '%'})`;
                     slider.max = isAmountMode ? maxAmount : maxPercent;
                     input.max = isAmountMode ? maxAmount : maxPercent;
                     slider.step = isAmountMode ? stepAmount : stepPercent;
                     input.step = isAmountMode ? stepAmount : stepPercent;
                     if (currentValue > parseFloat(input.max)) {
                         currentValue = 0;
                     }
                     const errorElem = getElem(`${modePrefix}IncreaseRateError`);
                     if (errorElem) {
                          errorElem.textContent = `Value must be between 0 and ${isAmountMode ? formatCurrency(maxAmount) : maxPercent + '%'}.`;
                     }
                }
                slider.value = currentValue;
                input.value = currentValue;
                updateSliderFill(slider);
                updateComparison();
            });
             const event = new Event('change');
             toggle.dispatchEvent(event);
        }
        setupIncreaseToggle(sipIncreaseTypeToggle, getElem('sipIncreaseLabel'), getElem('sipIncreaseRateSlider'), sipIncreaseRateInput, 'sip');
        setupIncreaseToggle(rdIncreaseTypeToggle, getElem('rdIncreaseLabel'), getElem('rdIncreaseRateSlider'), rdIncreaseRateInput, 'rd');

        chartToggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                activeChartDataset = button.dataset.chart;
                chartToggleButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                updateGrowthChart();
            });
        });

        // Preset button clicks
        getElem('presetConservative').addEventListener('click', () => applyPreset('conservative'));
        getElem('presetBalanced').addEventListener('click', () => applyPreset('balanced'));
        getElem('presetAggressive').addEventListener('click', () => applyPreset('aggressive'));

        // Collapsible accordion table ledger logic
        const toggleLedgerBtn = getElem('toggleLedgerBtn');
        const ledgerContent = getElem('ledgerContent');
        const ledgerChevron = getElem('ledgerChevron');

        toggleLedgerBtn.addEventListener('click', () => {
            const isHidden = ledgerContent.classList.toggle('hidden');
            ledgerChevron.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
        });

        // Ledger Tab switching logic
        const ledgerTabs = document.querySelectorAll('.ledger-tab-btn');
        ledgerTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                ledgerTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderLedgerTable(tab.dataset.ledger);
            });
        });

        // Bind Export Utilites buttons
        getElem('exportCsvBtn').addEventListener('click', exportToCSV);
        getElem('printPdfBtn').addEventListener('click', printPDFReport);

        window.addEventListener('resize', debounce(() => {
            if(finalValueChart) finalValueChart.resize();
            if(growthChart) growthChart.resize();
        }, 250));

        if(shareReportBtn) shareReportBtn.addEventListener('click', populateAndShowModal);
        if(closeModalBtn) closeModalBtn.addEventListener('click', () => shareModal.classList.add('hidden'));
        window.addEventListener('click', (event) => { if (event.target == shareModal) shareModal.classList.add('hidden'); });
        if(copyUrlBtn) copyUrlBtn.addEventListener('click', () => {
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

    // --- Initialization ---
    setupEventListeners();
    loadFromUrl();
    updateInflationSectionState();
    updateComparison();
});