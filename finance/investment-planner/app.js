// ==========================================
// MODULE: UTILS.JS - Sahaya paddhatulu
// ==========================================
function formatCurrency(num) {
    if (isNaN(num) || num === Infinity || num === -Infinity) return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(Math.round(num));
}

// Debounce paddhati
function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function updateSliderFill(slider) {
    if (!slider) return;
    const percentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty('--fill-percentage', `${percentage}%`);
}

// Dynamic, accessible slider synchronizer
function syncSliderAndInput({ sliderId, inputId, decrementId, incrementId, updateCallback }) {
    const slider = document.getElementById(sliderId);
    const input = document.getElementById(inputId);
    const decrementBtn = decrementId ? document.getElementById(decrementId) : null;
    const incrementBtn = incrementId ? document.getElementById(incrementId) : null;
    const errorElement = document.getElementById(inputId.replace('Input', 'Error'));

    if (!slider || !input) return;

    const instantUpdate = () => { if (updateCallback) updateCallback(); };
    const debouncedUpdate = debounce(instantUpdate, 250);

    const updateAriaValueText = () => {
        const value = parseFloat(input.value);
        if (!isNaN(value)) {
            const isCurrency = inputId.toLowerCase().includes('amount') || inputId.toLowerCase().includes('corpus') || inputId.toLowerCase().includes('withdrawal') || (parseFloat(input.step) >= 100);
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
        if (errorElement) { errorElement.classList.toggle('hidden', isValid); }
        if (decrementBtn) decrementBtn.disabled = isNaN(value) || value <= min;
        if (incrementBtn) incrementBtn.disabled = isNaN(value) || value >= max;

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
        if (validate()) { instantUpdate(); }
    };

    input.addEventListener('keydown', (e) => {
        if (['e', 'E', '+', '-'].includes(e.key)) {
            e.preventDefault();
        }
    });

    slider.addEventListener('input', () => {
        const newValue = parseFloat(slider.value);
        if (!isNaN(newValue)) {
            input.value = newValue;
            updateSliderFill(slider);
            updateAriaValueText();
            if (validate()) { instantUpdate(); }
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

        if (isNaN(value) || value < min || input.value.trim() === '') { value = min; } 
        else if (value > max) { value = max; }

        const correctedValue = step < 1
            ? parseFloat(value).toFixed(String(step).split('.')[1]?.length || 1)
            : Math.round(value / step) * step;

        value = Math.max(min, Math.min(max, parseFloat(correctedValue)));
        input.value = value;
        slider.value = value;

        updateSliderFill(slider);
        updateAriaValueText();
        validate();
        instantUpdate();
    });

    if (decrementBtn) {
        decrementBtn.addEventListener('click', () => {
            const currentValue = parseFloat(input.value);
            const step = parseFloat(slider.step) || 1;
            if (!isNaN(currentValue)) { updateValue(currentValue - step); }
        });
    }
    if (incrementBtn) {
        incrementBtn.addEventListener('click', () => {
            const currentValue = parseFloat(input.value);
            const step = parseFloat(slider.step) || 1;
            if (!isNaN(currentValue)) { updateValue(currentValue + step); }
        });
    }

    validate();
    updateSliderFill(slider);
    updateAriaValueText();
}

// ==========================================
// FACTORY PATTERN IMPLEMENTATION - Factory vidhanam amalu
// ==========================================

function createTooltipHtml(text) {
    if (!text) return '';
    return `
        <span class="tooltip-icon relative inline-block cursor-pointer ml-1 select-none">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span class="tooltip-text">${text}</span>
        </span>
    `;
}

function createSliderGroup(config) {
    let presetsHtml = '';
    if (config.presets) {
        // Dynamic preset generation to use red high-contrast classes to prevent gray overwrite
        presetsHtml = `<div class="flex flex-wrap gap-1.5 mt-1.5">` + 
            config.presets.map(p => `<button type="button" class="preset-btn px-2.5 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded text-[10px] font-bold hover:bg-red-100" data-target="${config.id}Input" data-val="${p.val}" title="Quickly add ₹${p.label} to your investment amount">+ ₹${p.label}</button>`).join('') + 
            `</div>`;
    }

    let toggleHtml = '';
    if (config.toggleId) {
        toggleHtml = `
        <div class="step-up-toggle-container">
            <label class="step-up-toggle" for="${config.toggleId}">
                <input type="checkbox" id="${config.toggleId}" class="sr-only" role="switch" aria-checked="false" aria-label="Toggle rate type for annual increase">
                <div class="toggle-track">
                    <div class="toggle-thumb">
                        <span class="toggle-icon toggle-icon-percent">%</span>
                        <span class="toggle-icon toggle-icon-rupee">₹</span>
                    </div>
                </div>
            </label>
        </div>`;
    }

    let tooltipHtml = config.infoTitle ? createTooltipHtml(config.infoTitle) : '';
    // Converted to text-xxs class to strictly follow 11.52px sizing criteria
    let labelHtml = `<label for="${config.id}Input" class="block text-xxs font-bold flex items-center ${toggleHtml ? '' : 'mb-1'}" id="${config.id}Label">
        <span id="${config.id}LabelText">${config.label}</span> ${tooltipHtml}
    </label>`;
    let headerHtml = toggleHtml ? `<div class="flex justify-between items-center mb-1">${labelHtml}${toggleHtml}</div>` : labelHtml;

    return `
        <div>
            ${headerHtml}
            <div class="input-group flex items-center space-x-2">
                <input type="range" id="${config.id}Slider" min="${config.min}" max="${config.max}" value="${config.value}" step="${config.step}" class="w-full range-slider flex-grow" aria-label="${config.label.replace(/<[^>]*>?/gm, '')}">
                <div class="input-stepper-group flex-shrink-0 rounded-xl">
                    <button type="button" id="${config.id}Decrement" class="stepper-button decrement" aria-label="Decrease value">-</button>
                    <input type="number" id="${config.id}Input" class="manual-input" value="${config.value}" min="${config.min}" max="${config.max}" step="${config.step}" aria-label="Enter ${config.label.replace(/<[^>]*>?/gm, '')}">
                    <button type="button" id="${config.id}Increment" class="stepper-button increment" aria-label="Increase value">+</button>
                </div>
            </div>
            ${presetsHtml}
            <p id="${config.id}Error" class="input-error-message hidden" role="alert">${config.errorMsg}</p>
        </div>
    `;
}

function createSelectGroup(config) {
    const optionsHtml = config.options.map(opt => `<option value="${opt.value}" ${opt.selected ? 'selected' : ''}>${opt.label}</option>`).join('');
    return `
        <div>
            <label for="${config.id}" class="block text-xxs font-bold mb-1">${config.label}</label>
            <select id="${config.id}" class="modern-select w-full p-1 border border-stone-300 rounded-xl text-xxs font-semibold text-stone-700 focus:ring-red-500 focus:border-red-500 bg-stone-50 shadow-sm h-8">
                ${optionsHtml}
            </select>
        </div>
    `;
}

function createToggleSection(config) {
    return `
        <div class="pt-1">
            <label class="flex items-center justify-between cursor-pointer" for="${config.id}">
                <span class="text-xxs font-bold flex items-center">
                    ${config.label} ${config.infoTitle ? createTooltipHtml(config.infoTitle) : ''}
                </span>
                <div class="relative inline-flex items-center">
                    <input type="checkbox" id="${config.id}" class="sr-only peer" role="switch" aria-checked="false" aria-label="${config.label}">
                    <div class="w-9 h-5 bg-stone-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-stone-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                </div>
            </label>
            <div id="${config.groupId}" class="hidden mt-2 space-y-3">
                ${config.innerHtml}
            </div>
        </div>
    `;
}

function createTaxRegimeMarkup(prefix) {
    return `
        <div class="space-y-3 border-t border-stone-200/50 pt-2">
            <div class="flex items-center justify-between pb-1">
                <span class="text-xxs font-bold text-stone-600">Tax Regime Slabs</span>
                <div class="inline-flex bg-stone-200 p-0.5 rounded-lg text-[10px] font-bold text-stone-900">
                    <button type="button" id="${prefix}TaxRegimeNew" class="px-2 py-0.5 rounded bg-white text-stone-900 shadow-sm focus:outline-none" aria-label="Select New Income Tax Regime">New Regime</button>
                    <button type="button" id="${prefix}TaxRegimeOld" class="px-2 py-0.5 rounded text-stone-600 hover:text-stone-900 focus:outline-none" aria-label="Select Old Income Tax Regime">Old Regime</button>
                </div>
            </div>
            <div id="${prefix}NewRegimeSlabs">
                ${createSelectGroup({ id: `${prefix}TaxSlabSelectNew`, label: 'Select Annual Income Bracket (New Regime)', options: [
                    {label:'Up to ₹3 Lakh (0% Tax)', value:'0'},
                    {label:'₹3 - ₹6 Lakh (5% Tax)', value:'0.05'},
                    {label:'₹6 - ₹9 Lakh (10% Tax)', value:'0.1'},
                    {label:'₹9 - ₹12 Lakh (15% Tax)', value:'0.15'},
                    {label:'₹12 - ₹15 Lakh (20% Tax)', value:'0.2'},
                    {label:'Above ₹15 Lakh (30% Tax)', value:'0.3', selected: true}
                ]})}
            </div>
            <div id="${prefix}OldRegimeSlabs" class="hidden">
                ${createSelectGroup({ id: `${prefix}TaxSlabSelectOld`, label: 'Select Annual Income Bracket (Old Regime)', options: [
                    {label:'Up to ₹2.5 Lakh (0% Tax)', value:'0'},
                    {label:'₹2.5 - ₹5 Lakh (5% Tax)', value:'0.05'},
                    {label:'₹5 - ₹10 Lakh (20% Tax)', value:'0.2'},
                    {label:'Above ₹10 Lakh (30% Tax)', value:'0.3', selected: true}
                ]})}
            </div>
        </div>
    `;
}

function createSummaryCard(config) {
    const gridItems = config.grid.map(item => `
        <div class="summary-item rounded-xl">
            <span class="summary-label">${item.label}</span>
            <span id="${item.id}" class="summary-value ${item.colorClass}">₹0</span>
        </div>
    `).join('');

    const extrasHtml = (config.extras || []).map(ext => `
        <div id="${ext.containerId}" class="summary-extra ${ext.hidden ? 'hidden' : ''}">
            <span class="summary-label" ${ext.title ? `title="${ext.title}"` : ''}>${ext.label}</span>
            <span id="${ext.id}" class="summary-value ${ext.colorClass}">${ext.default || '₹0'}</span>
        </div>
    `).join('');

    const totalHtml = config.total ? `
        <div class="summary-total rounded-xl">
            <span class="summary-label">${config.total.label}</span>
            <span id="${config.total.id}" class="summary-value ${config.total.colorClass}">₹0</span>
        </div>
    ` : '';

    return `
        <div id="${config.id}" class="summary-card ${config.cardClass} ${config.hidden ? 'hidden' : ''}" aria-live="polite">
            <div class="summary-header">
                <h2 class="text-xs font-extrabold">${config.title}</h2>
                <button class="share-btn rounded-full p-1 bg-white/40 hover:bg-white/70 transition-colors" aria-label="Share ${config.title} results" title="Share calculation details with friends">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 8.81C7.5 8.31 6.79 8 6 8c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"></path></svg>
                </button>
            </div>
            <div class="summary-grid ${config.isSwp ? 'swp-grid' : ''}">${gridItems}</div>
            ${totalHtml}
            ${extrasHtml}
        </div>
    `;
}

// --- Configurations for Inputs ---
const allInputConfigs = [
    { id: 'sipAmount', label: 'Monthly SIP Amount (₹)', min: 500, max: 50000, value: 10000, step: 500, errorMsg: 'Amount must be between ₹500 - ₹50,000.', presets: [{label: '5K', val: 5000}, {label: '10K', val: 10000}, {label: '25K', val: 25000}, {label: '50K', val: 50000}] },
    { id: 'sipInitialLumpsum', label: 'Initial Lumpsum Amount (₹)', min: 5000, max: 10000000, value: 50000, step: 1000, errorMsg: 'Amount must be between ₹5,000 - ₹1 Crore.' },
    { id: 'sipIncreaseRate', label: 'Annual Increase (%)', min: 0, max: 20, value: 0, step: 1, errorMsg: 'Value must be between 0 and 20.', toggleId: 'sipIncreaseTypeToggle', infoTitle: 'The percentage rate at which you plan to scale up your monthly SIP amount every year.' },
    
    { id: 'lumpsumAmount', label: 'Lumpsum Amount (₹)', min: 5000, max: 10000000, value: 500000, step: 1000, errorMsg: 'Amount must be between ₹5,000 - ₹1 Crore.', presets: [{label: '50K', val: 50000}, {label: '1L', val: 100000}, {label: '5L', val: 500000}] },
    
    { id: 'rdAmount', label: 'Monthly RD Amount (₹)', min: 100, max: 50000, value: 5000, step: 100, errorMsg: 'Amount must be between ₹100 - ₹50,000.' },
    { id: 'rdIncreaseRate', label: 'Annual Increase (%)', min: 0, max: 20, value: 0, step: 1, errorMsg: 'Value must be between 0 and 20.', toggleId: 'rdIncreaseTypeToggle', infoTitle: 'The percentage rate at which you plan to scale up your Recurring Deposit amount every year.' },
    
    { id: 'fdAmount', label: 'FD Amount (₹)', min: 1000, max: 10000000, value: 100000, step: 1000, errorMsg: 'Amount must be between ₹1,000 - ₹1 Crore.' },
    
    { id: 'initialCorpus', label: 'Initial Investment (₹)', min: 100000, max: 50000000, value: 2000000, step: 10000, errorMsg: 'Amount must be between ₹1 Lac - ₹5 Crore.' },
    { id: 'withdrawalAmount', label: 'Monthly Withdrawal (₹)', min: 1000, max: 100000, value: 20000, step: 500, errorMsg: 'Amount must be between ₹1,000 - ₹1 Lac.' },
    { id: 'withdrawalIncrease', label: 'Annual Withdrawal Increase (%)', min: 0, max: 10, value: 0, step: 1, errorMsg: 'Value must be between 0 and 10.', toggleId: 'withdrawalIncreaseTypeToggle', infoTitle: 'The rate at which you plan to increase your monthly withdrawals annually to adjust for inflation during the withdrawal phase.' },
    
    { id: 'targetAmount', label: 'Target Amount (₹)', infoTitle: 'How much money you need in total to achieve this goal', min: 100000, max: 100000000, value: 5000000, step: 10000, errorMsg: 'Amount must be between ₹1 Lac - ₹10 Crore.' },
    { id: 'goalReturnRate', label: 'Expected Return Rate (p.a. %)', min: 1, max: 30, value: 12, step: 0.1, errorMsg: 'Rate must be between 1.0% - 30.0%.' },
    { id: 'goalPeriod', label: 'Investment Period (Years)', min: 1, max: 40, value: 10, step: 1, errorMsg: 'Period must be between 1 - 40 years.' },
    
    { id: 'returnRate', label: 'Expected Return Rate (p.a. %)', min: 1, max: 30, value: 12, step: 0.1, errorMsg: 'Rate must be between 1.0% - 30.0%.' },
    { id: 'investmentPeriod', label: 'Investment Period (Years)', min: 1, max: 40, value: 10, step: 1, errorMsg: 'Period must be between 1 - 40 years.', labelId: 'periodLabel' },
    { id: 'inflationRate', label: 'Inflation Rate (p.a. %)', min: 0, max: 15, value: 5, step: 0.1, errorMsg: 'Rate must be between 0.0% - 15.0%.' },
    
    // Advanced gatisheela bridge inputs
    { id: 'bridgePeriod', label: 'Pension Duration (Years)', min: 5, max: 40, value: 20, step: 1, errorMsg: 'Pension duration must be between 5 - 40 years.', infoTitle: 'The number of years you plan to withdraw your monthly pension after retirement.' },
    { id: 'bridgeRate', label: 'Conservative Pension Yield (% p.a.)', min: 4, max: 12, value: 8, step: 0.5, errorMsg: 'Expected yield must be between 4% - 12%.', infoTitle: 'The expected annual return rate on your accumulated wealth during the pension/withdrawal phase (typically conservative, e.g., 6% to 8% in debt/arbitrage funds).' }
];

const freqSelectHtml = (id) => createSelectGroup({ id: id, label: 'Frequency', options: [{label:'Monthly', value:'monthly'}, {label:'Quarterly', value:'quarterly'}, {label:'Half-Yearly', value:'half-yearly'}] });

// Injecting HTML Inputs Configurations Dynamically with context-sensitive collapsible toggles
document.getElementById('sipSection').innerHTML = 
    createSliderGroup(allInputConfigs[0]) + 
    freqSelectHtml('sipFrequency') + 
    createToggleSection({ id: 'sipInitialLumpsumToggle', label: 'Add Initial Lumpsum', groupId: 'sipInitialLumpsumGroup', innerHtml: createSliderGroup(allInputConfigs[1]), infoTitle: 'Add a one-time initial amount' }) +
    createToggleSection({ id: 'sipStepUpToggle', label: 'Enable Annual Step-up', groupId: 'sipStepUpGroup', innerHtml: createSliderGroup(allInputConfigs[2]), infoTitle: 'Automatically increase SIP amount' }) +
    createToggleSection({ id: 'sipEquityTaxToggle', label: 'Estimate MF Capital Gains Tax (LTCG)', groupId: 'sipEquityTaxGroup', innerHtml: `
        <div class="p-2 bg-stone-100 rounded-lg text-[10px] text-stone-600 leading-relaxed border border-stone-200">
            <strong class="text-stone-800">FY 2024-25/25-26 Rules:</strong> Long Term Capital Gains (LTCG) on Equity mutual funds are taxed at <strong class="text-stone-800">12.5%</strong> on gains exceeding <strong class="text-stone-800">₹1.25 Lakh</strong> per financial year (holding > 12 months).
        </div>
    ` }) +
    createToggleSection({ 
        id: 'sipSwpBridgeToggle', 
        label: 'Plan Retirement (SIP to SWP Pension Bridge)', 
        groupId: 'sipSwpBridgeGroup', 
        innerHtml: `
            <div class="space-y-3 border-t border-emerald-200/40 pt-2">
                ${createSliderGroup(allInputConfigs[16])}
                ${createSliderGroup(allInputConfigs[17])}
            </div>
        `,
        infoTitle: 'Transition your accumulated SIP wealth smoothly into a monthly pension (SWP) to fund your retirement years securely.'
    });

document.getElementById('lumpsumSection').innerHTML = 
    createSliderGroup(allInputConfigs[3]) +
    createToggleSection({ id: 'lumpsumEquityTaxToggle', label: 'Estimate MF Capital Gains Tax (LTCG)', groupId: 'lumpsumEquityTaxGroup', innerHtml: `
        <div class="p-2 bg-stone-100 rounded-lg text-[10px] text-stone-600 leading-relaxed border border-stone-200">
            <strong class="text-stone-800">FY 2024-25/25-26 Rules:</strong> Long Term Capital Gains (LTCG) on Equity mutual funds are taxed at <strong class="text-stone-800">12.5%</strong> on gains exceeding <strong class="text-stone-800">₹1.25 Lakh</strong> per financial year.
        </div>
    ` });

document.getElementById('rdSection').innerHTML = 
    createSliderGroup(allInputConfigs[4]) + freqSelectHtml('rdFrequency') +
    createToggleSection({ id: 'rdStepUpToggle', label: 'Enable Annual Step-up', groupId: 'rdStepUpGroup', innerHtml: createSliderGroup(allInputConfigs[5]), infoTitle: 'Automatically increase RD investment amount' }) +
    createToggleSection({ id: 'rdTaxToggle', label: 'Calculate Post-Tax Returns (Slab Wise)', groupId: 'rdTaxGroup', innerHtml: createTaxRegimeMarkup('rd') });

document.getElementById('fdSection').innerHTML = 
    createSliderGroup(allInputConfigs[6]) +
    createToggleSection({ id: 'fdTaxToggle', label: 'Calculate Post-Tax Returns (Slab Wise)', groupId: 'fdTaxGroup', innerHtml: createTaxRegimeMarkup('fd') });

document.getElementById('swpSection').innerHTML = 
    createSliderGroup(allInputConfigs[7]) + createSliderGroup(allInputConfigs[8]) +
    createToggleSection({ id: 'swpStepUpToggle', label: 'Enable Annual Step-up', groupId: 'swpStepUpGroup', innerHtml: createSliderGroup(allInputConfigs[9]), infoTitle: 'Automatically increase withdrawal amount' }) +
    createSelectGroup({ id: 'withdrawalFrequency', label: 'Withdrawal Frequency', options: [{label:'Monthly', value:'monthly'}, {label:'Quarterly', value:'quarterly'}, {label:'Half-Yearly', value:'half-yearly'}, {label:'Yearly', value:'yearly'}] }) +
    createToggleSection({ id: 'swpEquityTaxToggle', label: 'Estimate Annual MF Capital Gains Tax (LTCG)', groupId: 'swpEquityTaxGroup', innerHtml: `
        <div class="p-2 bg-stone-100 rounded-lg text-[10px] text-stone-600 leading-relaxed border border-stone-200">
            Estimates estimated annual capital gains tax liability of <strong class="text-stone-800">12.5%</strong> on withdrawal yields exceeding the threshold of <strong class="text-stone-800">₹1.25 Lakh</strong> per FY.
        </div>
    ` });

document.getElementById('goalDynamicInputs').innerHTML = 
    createSliderGroup(allInputConfigs[10]) + createSliderGroup(allInputConfigs[11]) + createSliderGroup(allInputConfigs[12]) +
    createToggleSection({ id: 'goalEquityTaxToggle', label: 'Estimate MF Capital Gains Tax (LTCG)', groupId: 'goalEquityTaxGroup', innerHtml: `
        <div class="p-2 bg-stone-100 rounded-lg text-[10px] text-stone-600 leading-relaxed border border-stone-200">
            Estimates capital gains liability using current equity mutual fund rules of <strong class="text-stone-800">12.5%</strong> taxation on cumulative gains exceeding <strong class="text-stone-800">₹1.25 Lakh</strong>.
        </div>
    ` });

document.getElementById('generalInputsSection').innerHTML = createSliderGroup(allInputConfigs[13]) + createSliderGroup(allInputConfigs[14]);

document.getElementById('inflationInputGroup').innerHTML = createSliderGroup(allInputConfigs[15]);

// Build Output Summaries Card Grid Templates with custom targeted collapsible nodes (Integrated with compliance gradients)
const summaryConfigs = [
    { id: 'sipSummary', title: 'SIP Summary', cardClass: 'bg-gradient-to-br from-emerald-50 to-teal-50/50 border-emerald-100 text-emerald-950', grid: [{label:'Invested', id:'investedAmountSIP', colorClass:'invested'}, {label:'Returns', id:'estimatedReturnsSIP', colorClass:'returns'}], total: {label:'Total Value', id:'totalValueSIP', colorClass:'total'}, extras: [
        {id:'realTotalValueSIP', containerId:'realValueSectionSIP', label:'Real Value (Today\'s Worth) ℹ', colorClass:'real', hidden:true, title:'Value after adjusting expected inflation'},
        {id:'ltcgTaxSIP', containerId:'ltcgTaxSectionSIP', label:'Estimated LTCG Tax (12.5%) ⚖', colorClass:'tax', hidden:true, title:'Equity LTCG tax estimation at 12.5% on returns above ₹1.25 Lakh exemption threshold'},
        {id:'postTaxCorpusSIP', containerId:'postTaxSectionSIP', label:'Post-Tax Accumulated Corpus 💰', colorClass:'returns font-bold text-emerald-800', hidden:true},
        {id:'monthlyPensionSIP', containerId:'bridgeSectionSIP', label:'Est. Monthly Retirement Pension 🚀', colorClass:'withdrawn font-bold text-red-600', hidden:true, title:'Monthly pension yielded by transitioning accumulated SIP corpus directly into a conservative SWP scheme'},
        {id:'realMonthlyPensionSIP', containerId:'realBridgeSectionSIP', label:'Real Pension (Today\'s Worth) ℹ', colorClass:'real', hidden:true, title:'Monthly retirement SWP pension adjusted for historical inflation'}
    ] },
    { id: 'lumpsumSummary', title: 'Lumpsum Summary', cardClass: 'bg-gradient-to-br from-blue-50 to-indigo-50/50 border-blue-100 text-indigo-950', hidden: true, grid: [{label:'Invested', id:'investedAmountLumpsum', colorClass:'invested'}, {label:'Returns', id:'estimatedReturnsLumpsum', colorClass:'returns'}], total: {label:'Total Value', id:'totalValueLumpsum', colorClass:'total'}, extras: [
        {id:'realTotalValueLumpsum', containerId:'realValueSectionLumpsum', label:'Real Value (Today\'s Worth) ℹ', colorClass:'real', hidden:true},
        {id:'ltcgTaxLumpsum', containerId:'ltcgTaxSectionLumpsum', label:'Estimated LTCG Tax (12.5%) ⚖', colorClass:'tax', hidden:true},
        {id:'postTaxCorpusLumpsum', containerId:'postTaxSectionLumpsum', label:'Post-Tax Lumpsum Corpus 💰', colorClass:'returns font-bold text-emerald-800', hidden:true}
    ] },
    { id: 'rdSummary', title: 'RD Summary', cardClass: 'bg-gradient-to-br from-slate-50 to-stone-50/50 border-stone-200 text-stone-900', hidden: true, grid: [{label:'Invested', id:'investedAmountRD', colorClass:'invested'}, {label:'Returns', id:'estimatedReturnsRD', colorClass:'returns'}], total: {label:'Total Value', id:'totalValueRD', colorClass:'total'}, extras: [{id:'postTaxTotalValueRD', containerId:'postTaxSectionRD', label:'Post-Tax Total (Slab Deducted)', colorClass:'tax', hidden:true}, {id:'realTotalValueRD', containerId:'realValueSectionRD', label:'Real Value', colorClass:'real', hidden:true}] },
    { id: 'fdSummary', title: 'FD Summary', cardClass: 'bg-gradient-to-br from-slate-50 to-stone-50/50 border-stone-200 text-stone-900', hidden: true, grid: [{label:'Invested', id:'investedAmountFD', colorClass:'invested'}, {label:'Returns', id:'estimatedReturnsFD', colorClass:'returns'}], total: {label:'Total Value', id:'totalValueFD', colorClass:'total'}, extras: [{id:'postTaxTotalValueFD', containerId:'postTaxSectionFD', label:'Post-Tax Total (Slab Deducted)', colorClass:'tax', hidden:true}, {id:'realTotalValueFD', containerId:'realValueSectionFD', label:'Real Value', colorClass:'real', hidden:true}] },
    { id: 'swpSummary', title: 'SWP Summary', cardClass: 'bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-150 text-amber-950', hidden: true, isSwp: true, grid: [{label:'Initial Corpus', id:'initialCorpusSWP', colorClass:'invested'}, {label:'Total Withdrawn', id:'totalWithdrawnSWP', colorClass:'withdrawn'}, {label:'Total Interest', id:'totalInterestSWP', colorClass:'interest'}, {label:'Remaining', id:'remainingCorpusSWP', colorClass:'remaining'}], extras: [
        {id:'exhaustionPeriodSWP', containerId:'corpusExhaustedInfo', label:'Corpus Exceeded After', colorClass:'real', hidden:true, default:''}, 
        {id:'realRemainingCorpusSWP', containerId:'realValueSectionSWP', label:'Real Remaining', colorClass:'real', hidden:true},
        {id:'ltcgTaxSWP', containerId:'ltcgTaxSectionSWP', label:'Annual Est. LTCG Tax on Withdrawals ⚖', colorClass:'tax', hidden:true, title:'Est. annualized 12.5% taxation on systematic equity mutual fund gains withdrawals'}
    ] },
    { id: 'goalSummary', title: 'Goal Planner Summary', cardClass: 'bg-gradient-to-br from-purple-50 to-pink-50/50 border-purple-100 text-purple-950', hidden: true, grid: [{label:'Target Amount', id:'targetAmountGoal', colorClass:'total'}, {label:'Total Investment', id:'totalInvestmentGoal', colorClass:'invested'}], total: {label:'Monthly Investment Needed', id:'monthlyInvestmentGoal', colorClass:'goal'}, extras: [
        {id:'expectedReturnsGoal', containerId:'', label:'Expected Returns', colorClass:'returns'},
        {id:'ltcgTaxGoal', containerId:'ltcgTaxSectionGoal', label:'Estimated LTCG Tax (12.5%) ⚖', colorClass:'tax', hidden:true},
        {id:'postTaxCorpusGoal', containerId:'postTaxSectionGoal', label:'Post-Tax Goal Value 💰', colorClass:'returns font-bold text-emerald-800', hidden:true}
    ] }
];

document.getElementById('dynamicSummariesContainer').innerHTML = summaryConfigs.map(createSummaryCard).join('');

// ==========================================
// MODULE: FINANCIAL-CALCULATOR.JS - Lekkaise paddhati
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.calculator-container')) {
        initializeCalculator();
    }
});

function showNotification(message) {
    const toast = document.getElementById('notification-toast');
    if (toast) {
        toast.textContent = message; toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); }, 3000);
    }
}

function initializeCalculator() {
    'use strict';
    const getElem = (id) => document.getElementById(id);

    let investmentDoughnutChart;
    const doughnutCanvas = getElem('investmentDoughnutChart');
    let doughnutCtx = doughnutCanvas ? doughnutCanvas.getContext('2d') : null;
    let currentMode = 'sip';

    // Risk pranthala bhatti Smart Insight Box Shailini gatisheelamga marchu function
    function updateSmartInsightColorTheme(themeClass) {
        const insightBox = getElem('smartInsight');
        if (!insightBox) return;
        
        // Unna background/border/text rangu prabhavalanu tholaginchandi
        insightBox.classList.remove(
            'bg-blue-50', 'border-blue-200', 'text-blue-900',
            'bg-teal-50', 'border-teal-200', 'text-teal-900',
            'bg-amber-50', 'border-amber-200', 'text-amber-900',
            'bg-orange-50', 'border-orange-200', 'text-orange-950',
            'bg-red-50', 'border-red-200', 'text-red-900'
        );
        
        if (themeClass === 'teal') {
            insightBox.classList.add('bg-teal-50', 'border-teal-200', 'text-teal-900');
        } else if (themeClass === 'amber') {
            insightBox.classList.add('bg-amber-50', 'border-amber-200', 'text-amber-900');
        } else if (themeClass === 'orange') {
            insightBox.classList.add('bg-orange-50', 'border-orange-200', 'text-orange-950');
        } else if (themeClass === 'red') {
            insightBox.classList.add('bg-red-50', 'border-red-200', 'text-red-900');
        } else {
            insightBox.classList.add('bg-blue-50', 'border-blue-200', 'text-blue-900');
        }
    }

    // Accessibility Switchlanu pramanikarinchandi
    document.querySelectorAll('input[role="switch"]').forEach(toggle => {
        toggle.addEventListener('change', (e) => e.target.setAttribute('aria-checked', e.target.checked));
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.target.dataset.target;
            const inputEl = getElem(targetId);
            const sliderEl = getElem(targetId.replace('Input', 'Slider'));
            if (inputEl && sliderEl) {
                let currentVal = parseFloat(inputEl.value) || 0;
                const newVal = Math.min(currentVal + parseInt(e.target.dataset.val), parseFloat(inputEl.max));
                inputEl.value = newVal; sliderEl.value = newVal;
                updateSliderFill(sliderEl); 
                updateCalculator();
            }
        });
    });

    if(getElem('printReportBtn')){
        getElem('printReportBtn').addEventListener('click', () => {
            const printContent = getElem('printInputSummaryContent');
            if (printContent) {
                printContent.innerHTML = '';
                const addDetail = (label, value) => { printContent.innerHTML += `<div class="mb-1"><span class="font-semibold text-stone-900">${label}:</span> ${value}</div>`; };
                const formatPct = (val) => `${val}%`;
                
                // Samacharam surakshitamga pondadaniki sahaya paddhatulu
                const getVal = (id) => getElem(id) ? getElem(id).value : '0';
                const isChecked = (id) => getElem(id) ? getElem(id).checked : false;
                const getSelectText = (id) => {
                    const el = getElem(id);
                    return el && el.options ? el.options[el.selectedIndex].text : '';
                };

                // Active mode bhatti vivaralanu gatisheelamga cherchandi
                if (currentMode === 'sip') {
                    addDetail('Mode', 'SIP (Systematic Investment Plan)');
                    addDetail('Monthly Amount', formatCurrency(getVal('sipAmountInput')));
                    addDetail('Frequency', getSelectText('sipFrequency'));
                    addDetail('Expected Return', formatPct(getVal('returnRateInput')));
                    addDetail('Time Period', `${getVal('investmentPeriodInput')} Years`);
                    if(isChecked('sipInitialLumpsumToggle')) addDetail('Initial Lumpsum', formatCurrency(getVal('sipInitialLumpsumInput')));
                    if(isChecked('sipStepUpToggle')) addDetail('Annual Step-up', isChecked('sipIncreaseTypeToggle') ? formatCurrency(getVal('sipIncreaseRateInput')) : formatPct(getVal('sipIncreaseRateInput')));
                } else if (currentMode === 'lumpsum') {
                    addDetail('Mode', 'One-time Investment (Lumpsum)');
                    addDetail('Investment Amount', formatCurrency(getVal('lumpsumAmountInput')));
                    addDetail('Expected Return', formatPct(getVal('returnRateInput')));
                    addDetail('Time Period', `${getVal('investmentPeriodInput')} Years`);
                } else if (currentMode === 'rd') {
                    addDetail('Mode', 'Recurring Deposit (RD)');
                    addDetail('Monthly Amount', formatCurrency(getVal('rdAmountInput')));
                    addDetail('Frequency', getSelectText('rdFrequency'));
                    addDetail('Expected Return', formatPct(getVal('returnRateInput')));
                    addDetail('Time Period', `${getVal('investmentPeriodInput')} Years`);
                    if(isChecked('rdStepUpToggle')) addDetail('Annual Step-up', isChecked('rdIncreaseTypeToggle') ? formatCurrency(getVal('rdIncreaseRateInput')) : formatPct(getVal('rdIncreaseRateInput')));
                } else if (currentMode === 'fd') {
                    addDetail('Mode', 'Fixed Deposit (FD)');
                    addDetail('Investment Amount', formatCurrency(getVal('fdAmountInput')));
                    addDetail('Expected Return', formatPct(getVal('returnRateInput')));
                    addDetail('Time Period', `${getVal('investmentPeriodInput')} Years`);
                } else if (currentMode === 'swp') {
                    addDetail('Mode', 'Systematic Withdrawal Plan (SWP)');
                    addDetail('Initial Corpus', formatCurrency(getVal('initialCorpusInput')));
                    addDetail('Withdrawal Amount', formatCurrency(getVal('withdrawalAmountInput')));
                    addDetail('Frequency', getSelectText('withdrawalFrequency'));
                    addDetail('Expected Return', formatPct(getVal('returnRateInput')));
                    addDetail('Time Period', `${getVal('investmentPeriodInput')} Years`);
                    if(isChecked('swpStepUpToggle')) addDetail('Annual Step-up', isChecked('withdrawalIncreaseTypeToggle') ? formatCurrency(getVal('withdrawalIncreaseInput')) : formatPct(getVal('withdrawalIncreaseInput')));
                } else if (currentMode === 'goal') {
                    addDetail('Mode', 'Goal Planner');
                    addDetail('Target Amount', formatCurrency(getVal('targetAmountInput')));
                    addDetail('Expected Return', formatPct(getVal('goalReturnRateInput')));
                    addDetail('Time Period', `${getVal('goalPeriodInput')} Years`);
                }

                // Toggles
                if(isChecked('inflationToggle')) addDetail('Inflation Adjusted', `Yes (${getVal('inflationRateInput')}%)`);
                if(currentMode==='rd' && isChecked('rdTaxToggle')) {
                    const isNew = getElem('rdTaxRegimeNew')?.classList.contains('bg-white');
                    const rateEl = isNew ? getElem('rdTaxSlabSelectNew') : getElem('rdTaxSlabSelectOld');
                    addDetail('RD Slab-Tax', `${isNew ? 'New Regime' : 'Old Regime'} (${parseFloat(rateEl.value)*100}%)`);
                }
                if(currentMode==='fd' && isChecked('fdTaxToggle')) {
                    const isNew = getElem('fdTaxRegimeNew')?.classList.contains('bg-white');
                    const rateEl = isNew ? getElem('fdTaxSlabSelectNew') : getElem('fdTaxSlabSelectOld');
                    addDetail('FD Slab-Tax', `${isNew ? 'New Regime' : 'Old Regime'} (${parseFloat(rateEl.value)*100}%)`);
                }
            }
            setTimeout(() => { window.print(); }, 150);
        });
    }

    function updateDoughnutChart(data, labels, colors) {
      if (!doughnutCtx) return;
      const chartData = { labels: labels, datasets: [{ data, backgroundColor: colors, hoverOffset: 8, borderRadius: 4, spacing: 2 }] };
      const chartOptions = { 
        responsive: true, maintainAspectRatio: false, cutout: '65%', 
        plugins: { 
            legend: { display: false }, 
            tooltip: { 
                callbacks: { label: (context) => ` ${context.label}: ${formatCurrency(context.parsed)}` }, 
                bodyFont: { family: 'Inter', size: window.innerWidth < 640 ? 10 : 12 }, 
                padding: window.innerWidth < 640 ? 8 : 12, cornerRadius: 8, backgroundColor: 'rgba(28, 25, 23, 0.9)'
            } 
        }
      };
      if (investmentDoughnutChart) { investmentDoughnutChart.data = chartData; investmentDoughnutChart.update(); }
      else { investmentDoughnutChart = new Chart(doughnutCtx, { type: 'doughnut', data: chartData, options: chartOptions }); }

      // Accessibility fallback setup
      const formatTextSummary = labels.map((label, idx) => `${label}: ${formatCurrency(data[idx])}`).join(', ');
      getElem('investmentDoughnutChart').setAttribute('aria-label', `Investment Breakdown doughnut chart displaying: ${formatTextSummary}`);
    }

    function generateGrowthTable(data, maxValue) {
      const tbody = getElem('growthTableBody');
      if (!tbody) return;
      tbody.innerHTML = '';
      data.forEach((yearData, index) => { 
          const rowClass = index % 2 === 0 ? 'bg-white hover:bg-stone-50' : 'bg-stone-50 hover:bg-stone-100';
          const row = document.createElement('tr'); 
          row.className = `${rowClass} transition-colors`;
          if (currentMode === 'swp') {
              row.innerHTML = `<td class="px-2 py-1.5 whitespace-nowrap text-left border-b border-stone-100">${yearData.year}</td>
                               <td class="px-2 py-1.5 whitespace-nowrap font-medium text-stone-600 text-left border-b border-stone-100">${formatCurrency(yearData.openingBalance)}</td>
                               <td class="px-2 py-1.5 whitespace-nowrap font-medium text-emerald-800 text-left border-b border-stone-100">${formatCurrency(yearData.interestEarned)}</td>
                               <td class="px-2 py-1.5 whitespace-nowrap font-medium text-red-600 text-left border-b border-stone-100">${formatCurrency(yearData.withdrawn)}</td>
                               <td class="px-2 py-1.5 whitespace-nowrap font-bold text-stone-800 text-center border-b border-stone-100">
                                  ${formatCurrency(yearData.closingBalance)}
                                  <div class="progress-bar-bg print-hide mx-auto"><div class="progress-bar-fill" style="width: ${Math.min(100, (yearData.closingBalance / maxValue)*100)}%;"></div></div>
                               </td>`;
          } else {
              row.innerHTML = `<td class="px-2 py-1.5 whitespace-nowrap text-left border-b border-stone-100">${yearData.year}</td>
                               <td class="px-2 py-1.5 whitespace-nowrap font-medium text-stone-600 text-left border-b border-stone-100">${formatCurrency(yearData.invested)}</td>
                               <td class="px-2 py-1.5 whitespace-nowrap font-medium text-emerald-800 text-left border-b border-stone-100">${formatCurrency(yearData.returns)}</td>
                               <td class="px-2 py-1.5 whitespace-nowrap font-bold text-stone-800 text-center border-b border-stone-100">
                                  ${formatCurrency(yearData.total)}
                                  <div class="progress-bar-bg print-hide mx-auto"><div class="progress-bar-fill" style="width: ${Math.min(100, (yearData.total / maxValue)*100)}%;"></div></div>
                               </td>`;
          }
          tbody.appendChild(row); 
      });
    }

    let yearlyGrowthData = [];

    // Dynamic Real-time expectations validator engine (SEBI compliant)
    function checkRealFinancialValidation(annualReturnRate, annualInflationRate) {
        const warningBox = getElem('smartFinancialValidation');
        if (!warningBox) return;

        warningBox.innerHTML = '';
        warningBox.classList.add('hidden');

        const warnings = [];
        const returnPercent = (annualReturnRate * 100).toFixed(1);
        const inflationPercent = (annualInflationRate * 100).toFixed(1);

        // Return rules logic based on Indian finance context
        if (currentMode === 'sip' || currentMode === 'lumpsum' || currentMode === 'goal') {
            if (parseFloat(returnPercent) > 15.0) {
                warnings.push({
                    type: 'warning',
                    text: `<strong>High Equity Yield Assumption (${returnPercent}%):</strong> Indian stock benchmarks (Nifty 50) have historically yielded a 12% to 14% CAGR over active 10+ year intervals. Sustained returns exceeding 15% are highly optimistic, volatile, and expose capital to significant market risk.`
                });
            } else if (parseFloat(returnPercent) < 5.0) {
                warnings.push({
                    type: 'info',
                    text: `<strong>Ultra-Conservative Equity Rate (${returnPercent}%):</strong> Historically, diversified Indian equity mutual funds outperform standard debt yields and core inflation over long horizons.`
                });
            }
        } else if (currentMode === 'rd' || currentMode === 'fd') {
            if (parseFloat(returnPercent) > 8.0) {
                warnings.push({
                    type: 'warning',
                    text: `<strong>Atypical Fixed Income Yield (${returnPercent}%):</strong> Scheduled commercial banks in India (SBI, HDFC, ICICI) typically cap FD/RD interest rates between 6.0% and 7.5% p.a. Assumed rates above 8% generally involve Corporate FDs or Small Finance Banks, which feature higher credit risk.`
                });
            }
        } else if (currentMode === 'swp') {
            if (parseFloat(returnPercent) > 12.0) {
                warnings.push({
                    type: 'warning',
                    text: `<strong>Risk of Sequence of Returns (${returnPercent}%):</strong> Anticipating high mutual fund returns of >12% during a systematic withdrawal phase is hazardous. A market downturn during your early retirement years can deplete your principal portfolio permanently.`
                });
            }
        }

        // Inflation guidelines validation
        const inflationToggle = getElem('inflationToggle');
        if (inflationToggle && inflationToggle.checked) {
            if (parseFloat(inflationPercent) < 4.0) {
                warnings.push({
                    type: 'info',
                    text: `<strong>Optimistic Inflation Projection (${inflationPercent}%):</strong> India's historical retail Consumer Price Index (CPI) averages around 5% to 6%. The RBI officially targets keeping core inflation at 4.0% with a variance band of +/-2%.`
                });
            } else if (parseFloat(inflationPercent) > 8.0) {
                warnings.push({
                    type: 'warning',
                    text: `<strong>Hyper-conservative Inflation (${inflationPercent}%):</strong> Modeling inflation above 8% p.a. results in aggressive erosion of your real future purchasing power. Highly useful for stress-testing, but may demand an unmanageable monthly savings burden.`
                });
            }
        }

        // Render warning panels
        if (warnings.length > 0) {
            warningBox.classList.remove('hidden');
            warnings.forEach(w => {
                const alertDiv = document.createElement('div');
                alertDiv.className = `p-1.5 rounded-lg text-[10px] flex items-start gap-1.5 border bg-amber-50/70 border-amber-200 text-amber-900 shadow-sm`;
                alertDiv.innerHTML = `
                    <span class="text-xs leading-none select-none">${w.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                    <span class="leading-relaxed">${w.text}</span>
                `;
                warningBox.appendChild(alertDiv);
            });
        }
    }

    // Helper to get slab-based tax rate contextually for RD/FD
    function getSlabTaxRate(prefix) {
        if (!getElem(`${prefix}TaxToggle`)?.checked) return 0;
        const isNew = getElem(`${prefix}TaxRegimeNew`)?.classList.contains('bg-white');
        const selectId = isNew ? `${prefix}TaxSlabSelectNew` : `${prefix}TaxSlabSelectOld`;
        return parseFloat(getElem(selectId)?.value || 0);
    }

    function updateCalculator() {
        try {
            yearlyGrowthData = [];
            const annualReturnRate = parseFloat(getElem(currentMode === 'goal' ? 'goalReturnRateInput' : 'returnRateInput').value) / 100;
            const investmentPeriodYears = parseFloat(getElem(currentMode === 'goal' ? 'goalPeriodInput' : 'investmentPeriodInput').value);
            const annualInflationRate = getElem('inflationToggle')?.checked ? parseFloat(getElem('inflationRateInput').value) / 100 : 0;
            const smartInsight = getElem('smartInsight');
            smartInsight.classList.add('hidden');
            updateSmartInsightColorTheme('default'); // reset default

            // Trigger SEBI-style expectation validation check
            checkRealFinancialValidation(annualReturnRate, annualInflationRate);

            if (currentMode === 'sip') {
              const sipAmount = parseFloat(getElem('sipAmountInput').value);
              const isStepUpEnabled = getElem('sipStepUpToggle')?.checked;
              const isIncreaseAmountMode = getElem('sipIncreaseTypeToggle')?.checked;
              const increaseValue = isStepUpEnabled ? parseFloat(getElem('sipIncreaseRateInput').value) : 0;
              const initialLumpsum = getElem('sipInitialLumpsumToggle')?.checked ? parseFloat(getElem('sipInitialLumpsumInput').value) : 0;
              const frequency = { monthly: 12, quarterly: 4, 'half-yearly': 2 }[getElem('sipFrequency').value] || 12;
              const periodicReturnRate = annualReturnRate / frequency;
              
              let currentSipAmount = sipAmount, investedAmount = initialLumpsum, currentCorpus = initialLumpsum;

              for (let year = 1; year <= investmentPeriodYears; year++) {
                let yearInvested = 0;
                for (let i = 0; i < frequency; i++) { 
                    yearInvested += currentSipAmount; 
                    currentCorpus = currentCorpus * (1 + periodicReturnRate) + currentSipAmount; 
                }
                investedAmount += yearInvested;
                if (isStepUpEnabled) {
                    if (isIncreaseAmountMode) currentSipAmount += increaseValue; 
                    else currentSipAmount *= (1 + (increaseValue / 100));
                }
                yearlyGrowthData.push({ year, invested: investedAmount, returns: currentCorpus - investedAmount, total: currentCorpus });
              }
              
              getElem('investedAmountSIP').textContent = formatCurrency(investedAmount);
              getElem('estimatedReturnsSIP').textContent = formatCurrency(currentCorpus - investedAmount);
              getElem('totalValueSIP').textContent = formatCurrency(currentCorpus);

              // 1. MF LTCG Tax Estimator
              let isMFTaxActive = getElem('sipEquityTaxToggle')?.checked;
              let postTaxCorpus = currentCorpus;
              if (isMFTaxActive) {
                  const gains = Math.max(0, currentCorpus - investedAmount);
                  const ltcgTax = gains > 125000 ? (gains - 125000) * 0.125 : 0;
                  postTaxCorpus = currentCorpus - ltcgTax;
                  
                  getElem('ltcgTaxSIP').textContent = formatCurrency(ltcgTax);
                  getElem('postTaxCorpusSIP').textContent = formatCurrency(postTaxCorpus);
                  getElem('ltcgTaxSectionSIP').classList.remove('hidden');
                  getElem('postTaxSectionSIP').classList.remove('hidden');
              } else {
                  getElem('ltcgTaxSectionSIP').classList.add('hidden');
                  getElem('postTaxSectionSIP').classList.add('hidden');
              }
              
              // 2. SIP-to-SWP Retirement Pension Bridge
              let isBridgeActive = getElem('sipSwpBridgeToggle')?.checked;
              if (isBridgeActive) {
                  const baseCorpus = isMFTaxActive ? postTaxCorpus : currentCorpus;
                  const pensionYears = parseFloat(getElem('bridgePeriodInput').value);
                  const conservativeRate = parseFloat(getElem('bridgeRateInput').value) / 100;
                  
                  const bridgeMonths = pensionYears * 12;
                  const monthlyRate = conservativeRate / 12;
                  
                  let monthlyPension = 0;
                  if (monthlyRate === 0) {
                      monthlyPension = baseCorpus / bridgeMonths;
                  } else {
                      monthlyPension = (baseCorpus * monthlyRate * Math.pow(1 + monthlyRate, bridgeMonths)) / (Math.pow(1 + monthlyRate, bridgeMonths) - 1);
                  }
                  
                  getElem('monthlyPensionSIP').textContent = formatCurrency(monthlyPension);
                  getElem('bridgeSectionSIP').classList.remove('hidden');
                  
                  if (getElem('inflationToggle').checked) {
                      const realMonthlyPension = monthlyPension / Math.pow(1 + annualInflationRate, investmentPeriodYears);
                      getElem('realMonthlyPensionSIP').textContent = formatCurrency(realMonthlyPension);
                      getElem('realBridgeSectionSIP').classList.remove('hidden');
                  } else {
                      getElem('realBridgeSectionSIP').classList.add('hidden');
                  }
              } else {
                  getElem('bridgeSectionSIP').classList.add('hidden');
                  getElem('realBridgeSectionSIP').classList.add('hidden');
              }
              
              if (getElem('inflationToggle').checked) {
                getElem('realTotalValueSIP').textContent = formatCurrency(currentCorpus / Math.pow(1 + annualInflationRate, investmentPeriodYears));
                getElem('realValueSectionSIP').classList.remove('hidden');
              } else { getElem('realValueSectionSIP').classList.add('hidden'); }
              
              // Dynamic Premium Green/Teal Chart Colors for Wealth Generation
              updateDoughnutChart([investedAmount, Math.max(0, currentCorpus - investedAmount)], ['Invested', 'Returns'], ['#334155', '#0d9488']); 
              generateGrowthTable(yearlyGrowthData, currentCorpus);

              // Real-time Insights (Rule of 72 compound speed details)
              const doublingYears = (72 / (annualReturnRate * 100)).toFixed(1);
              getElem('smartInsightText').innerHTML = `At this rate, compounding speeds will double your principal sum approximately every <strong>${doublingYears} years</strong>!`;
              smartInsight.classList.remove('hidden');

            } else if (currentMode === 'lumpsum') {
                const investedAmount = parseFloat(getElem('lumpsumAmountInput').value);
                const totalValue = investedAmount * Math.pow(1 + annualReturnRate, investmentPeriodYears);
                
                getElem('investedAmountLumpsum').textContent = formatCurrency(investedAmount);
                getElem('estimatedReturnsLumpsum').textContent = formatCurrency(totalValue - investedAmount);
                getElem('totalValueLumpsum').textContent = formatCurrency(totalValue);

                // MF LTCG Tax Estimator
                if (getElem('lumpsumEquityTaxToggle')?.checked) {
                    const gains = Math.max(0, totalValue - investedAmount);
                    const ltcgTax = gains > 125000 ? (gains - 125000) * 0.125 : 0;
                    getElem('ltcgTaxLumpsum').textContent = formatCurrency(ltcgTax);
                    getElem('postTaxCorpusLumpsum').textContent = formatCurrency(totalValue - ltcgTax);
                    getElem('ltcgTaxSectionLumpsum').classList.remove('hidden');
                    getElem('postTaxSectionLumpsum').classList.remove('hidden');
                } else {
                    getElem('ltcgTaxSectionLumpsum').classList.add('hidden');
                    getElem('postTaxSectionLumpsum').classList.add('hidden');
                }

                if (getElem('inflationToggle').checked) {
                  const realReturnRate = ((1 + annualReturnRate) / (1 + annualInflationRate)) - 1;
                  getElem('realTotalValueLumpsum').textContent = formatCurrency(investedAmount * Math.pow(1 + realReturnRate, investmentPeriodYears));
                  getElem('realValueSectionLumpsum').classList.remove('hidden');
                } else { getElem('realValueSectionLumpsum').classList.add('hidden'); }
                
                // Dynamic Indigo/Royal Blue Chart Colors for Core Capital
                updateDoughnutChart([investedAmount, Math.max(0, totalValue - investedAmount)], ['Invested', 'Returns'], ['#1e3a8a', '#3b82f6']);
                let currentCorpus = investedAmount;
                for (let year = 1; year <= investmentPeriodYears; year++) { currentCorpus *= (1 + annualReturnRate); yearlyGrowthData.push({ year, invested: investedAmount, returns: currentCorpus - investedAmount, total: currentCorpus }); }
                generateGrowthTable(yearlyGrowthData, totalValue);

                // Dynamic Doubling Speed Nudge
                const doublingYears = (72 / (annualReturnRate * 100)).toFixed(1);
                getElem('smartInsightText').innerHTML = `Compounding logic estimates that your lumpsum initial capital will double itself every <strong>${doublingYears} years</strong>.`;
                smartInsight.classList.remove('hidden');

            } else if (currentMode === 'rd') {
                const rdAmount = parseFloat(getElem('rdAmountInput').value);
                const isStepUpEnabled = getElem('rdStepUpToggle')?.checked;
                const isIncreaseAmountMode = getElem('rdIncreaseTypeToggle')?.checked;
                const increaseValue = isStepUpEnabled ? (parseFloat(getElem('rdIncreaseRateInput').value) || 0) : 0;
                const frequency = { monthly: 12, quarterly: 4, 'half-yearly': 2 }[getElem('rdFrequency').value] || 12;
                const periodicReturnRate = annualReturnRate / frequency;
                let currentRdAmount = rdAmount, investedAmount = 0, currentCorpus = 0;

                for (let year = 1; year <= investmentPeriodYears; year++) {
                  let yearInvested = 0;
                  for (let i = 0; i < frequency; i++) { yearInvested += currentRdAmount; currentCorpus = currentCorpus * (1 + periodicReturnRate) + currentRdAmount; }
                  investedAmount += yearInvested;
                  if (isStepUpEnabled) {
                    if (isIncreaseAmountMode) { currentRdAmount += increaseValue; } 
                    else { currentRdAmount *= (1 + (increaseValue / 100)); }
                  }
                  yearlyGrowthData.push({ year, invested: investedAmount, returns: currentCorpus - investedAmount, total: currentCorpus });
                }
                
                const estimatedReturns = currentCorpus - investedAmount;
                getElem('investedAmountRD').textContent = formatCurrency(investedAmount);
                getElem('estimatedReturnsRD').textContent = formatCurrency(estimatedReturns);
                getElem('totalValueRD').textContent = formatCurrency(currentCorpus);

                let finalCorpusRD = currentCorpus;
                if (getElem('rdTaxToggle')?.checked) {
                    const taxRate = getSlabTaxRate('rd');
                    const taxPayable = estimatedReturns * taxRate;
                    finalCorpusRD = investedAmount + (estimatedReturns - taxPayable);
                    getElem('postTaxTotalValueRD').textContent = formatCurrency(finalCorpusRD);
                    getElem('postTaxSectionRD').classList.remove('hidden');
                } else { getElem('postTaxSectionRD').classList.add('hidden'); }

                if (getElem('inflationToggle').checked) {
                  getElem('realTotalValueRD').textContent = formatCurrency(finalCorpusRD / Math.pow(1 + annualInflationRate, investmentPeriodYears));
                  getElem('realValueSectionRD').classList.remove('hidden');
                } else { getElem('realValueSectionRD').classList.add('hidden'); }
                
                // Slate / Gray Chart Colors for RD
                updateDoughnutChart([investedAmount, Math.max(0, estimatedReturns)], ['Invested', 'Returns'], ['#334155', '#64748b']); 
                generateGrowthTable(yearlyGrowthData, currentCorpus);

                // Dynamic compounding target speed alert
                const doublingYears = (72 / (annualReturnRate * 100)).toFixed(1);
                getElem('smartInsightText').innerHTML = `Under current recurring deposits parameters, your investment yield compound doubles cycles speed is approx. <strong>${doublingYears} years</strong>.`;
                smartInsight.classList.remove('hidden');

            } else if (currentMode === 'fd') {
                const investedAmount = parseFloat(getElem('fdAmountInput').value);
                const totalValue = investedAmount * Math.pow(1 + annualReturnRate, investmentPeriodYears);
                const estimatedReturns = totalValue - investedAmount;
                
                getElem('investedAmountFD').textContent = formatCurrency(investedAmount);
                getElem('estimatedReturnsFD').textContent = formatCurrency(estimatedReturns);
                getElem('totalValueFD').textContent = formatCurrency(totalValue);

                let finalCorpusFD = totalValue;
                if (getElem('fdTaxToggle')?.checked) {
                    const taxRate = getSlabTaxRate('fd');
                    finalCorpusFD = investedAmount + (estimatedReturns - (estimatedReturns * taxRate));
                    getElem('postTaxTotalValueFD').textContent = formatCurrency(finalCorpusFD);
                    getElem('postTaxSectionFD').classList.remove('hidden');
                } else { getElem('postTaxSectionFD').classList.add('hidden'); }

                if (getElem('inflationToggle').checked) {
                  getElem('realTotalValueFD').textContent = formatCurrency(finalCorpusFD / Math.pow(1 + annualInflationRate, investmentPeriodYears));
                  getElem('realValueSectionFD').classList.remove('hidden');
                } else { getElem('realValueSectionFD').classList.add('hidden'); }
                
                // Slate / Gray Chart Colors for FD
                updateDoughnutChart([investedAmount, Math.max(0, estimatedReturns)], ['Invested', 'Returns'], ['#334155', '#64748b']);
                let currentCorpus = investedAmount;
                for (let year = 1; year <= investmentPeriodYears; year++) { currentCorpus *= (1 + annualReturnRate); yearlyGrowthData.push({ year, invested: investedAmount, returns: currentCorpus - investedAmount, total: currentCorpus }); }
                generateGrowthTable(yearlyGrowthData, totalValue);

                // FD Color-Coded Advisories
                const fdRatePercentage = annualReturnRate * 100;
                let postTaxYieldRate = fdRatePercentage;
                if (getElem('fdTaxToggle')?.checked) {
                    const taxRate = getSlabTaxRate('fd');
                    postTaxYieldRate = fdRatePercentage * (1 - taxRate);
                }

                if (fdRatePercentage < 6.0) {
                    updateSmartInsightColorTheme('red');
                    getElem('smartInsightText').innerHTML = `⚠️ <strong>Inflation Risk Zone:</strong> At ${fdRatePercentage.toFixed(1)}%, your growth does not beat core inflation. True purchasing power is shrinking!`;
                } else if (postTaxYieldRate < 5.0) {
                    updateSmartInsightColorTheme('orange');
                    getElem('smartInsightText').innerHTML = `⚖️ <strong>Tax Drag Zone:</strong> Post-tax return rate drops to <strong class="text-orange-950">${postTaxYieldRate.toFixed(1)}%</strong>. Consider other debt options to optimize yield!`;
                } else if (fdRatePercentage >= 7.5) {
                    updateSmartInsightColorTheme('teal');
                    getElem('smartInsightText').innerHTML = `🟢 <strong>High Yield Zone:</strong> A solid interest rate of ${fdRatePercentage.toFixed(1)}% beats major core inflations and secures compound safety!`;
                } else {
                    updateSmartInsightColorTheme('amber');
                    getElem('smartInsightText').innerHTML = `🟡 <strong>Moderate Yield Zone:</strong> Standard savings rate of ${fdRatePercentage.toFixed(1)}% is stable, doubling capital safely in ${(72/fdRatePercentage).toFixed(1)} years.`;
                }
                smartInsight.classList.remove('hidden');

            } else if (currentMode === 'swp') {
                let corpus = parseFloat(getElem('initialCorpusInput').value);
                const initialCorpus = corpus;
                const initialWithdrawalAmount = parseFloat(getElem('withdrawalAmountInput').value);
                const isStepUpEnabled = getElem('swpStepUpToggle')?.checked;
                const isIncreaseAmountMode = getElem('withdrawalIncreaseTypeToggle')?.checked;
                const increaseValue = isStepUpEnabled ? (parseFloat(getElem('withdrawalIncreaseInput').value) || 0) : 0;
                const applyInflationToWithdrawals = getElem('inflationToggle')?.checked;

                const frequency = { monthly: 12, quarterly: 4, 'half-yearly': 2, yearly: 1 }[getElem('withdrawalFrequency').value] || 12;
                const periodicReturnRate = annualReturnRate / 12;

                let totalWithdrawn = 0; let totalInterest = 0; let exhaustionYear = 0;
                let currentWithdrawalAmountPerPeriod = initialWithdrawalAmount * (12 / frequency);

                for (let year = 1; year <= investmentPeriodYears; year++) {
                    let yearOpeningBalance = corpus; let yearInterest = 0; let yearWithdrawn = 0;

                    for (let period = 1; period <= frequency; period++) {
                        const monthsInPeriod = 12 / frequency;
                        for (let m = 0; m < monthsInPeriod; m++) {
                             if (corpus <= 0) break;
                             const interestThisMonth = corpus * periodicReturnRate;
                             yearInterest += interestThisMonth; corpus += interestThisMonth;
                        }
                         if (corpus <= 0) break;
                        const withdrawalThisPeriod = Math.min(corpus, currentWithdrawalAmountPerPeriod);
                        corpus -= withdrawalThisPeriod; yearWithdrawn += withdrawalThisPeriod;
                    }

                    totalWithdrawn += yearWithdrawn; totalInterest += yearInterest;
                    yearlyGrowthData.push({ year: year, openingBalance: yearOpeningBalance, interestEarned: yearInterest, withdrawn: yearWithdrawn, closingBalance: Math.max(0, corpus) });

                    if (corpus <= 0 && exhaustionYear === 0) { exhaustionYear = year; }
                    
                    if (isStepUpEnabled) {
                        if (isIncreaseAmountMode) { currentWithdrawalAmountPerPeriod += increaseValue / frequency; } 
                        else { currentWithdrawalAmountPerPeriod *= (1 + (increaseValue / 100)); }
                    }
                    
                    if (applyInflationToWithdrawals && annualInflationRate > 0) {
                         currentWithdrawalAmountPerPeriod *= (1 + annualInflationRate);
                    }
                }

                getElem('initialCorpusSWP').textContent = formatCurrency(initialCorpus);
                getElem('totalWithdrawnSWP').textContent = formatCurrency(totalWithdrawn);
                getElem('totalInterestSWP').textContent = formatCurrency(totalInterest);
                getElem('remainingCorpusSWP').textContent = formatCurrency(Math.max(0, corpus));
                
                if (getElem('corpusExhaustedInfo')) getElem('corpusExhaustedInfo').classList.toggle('hidden', exhaustionYear === 0);
                if (exhaustionYear > 0 && getElem('exhaustionPeriodSWP')) { getElem('exhaustionPeriodSWP').textContent = `${exhaustionYear} Yrs`; }

                if (getElem('inflationToggle').checked) {
                  getElem('realRemainingCorpusSWP').textContent = formatCurrency(Math.max(0, corpus) / Math.pow(1 + annualInflationRate, investmentPeriodYears));
                  getElem('realValueSectionSWP').classList.remove('hidden');
                } else { getElem('realValueSectionSWP').classList.add('hidden'); }

                // SWP Annual MF LTCG Estimator
                if (getElem('swpEquityTaxToggle')?.checked) {
                    const gainsRatio = totalInterest / (totalWithdrawn + corpus || 1);
                    const annualEstGains = (initialWithdrawalAmount * 12) * gainsRatio;
                    const annualLtcgTax = annualEstGains > 125000 ? (annualEstGains - 125000) * 0.125 : 0;
                    getElem('ltcgTaxSWP').textContent = `${formatCurrency(annualLtcgTax)} / Year`;
                    getElem('ltcgTaxSectionSWP').classList.remove('hidden');
                } else {
                    getElem('ltcgTaxSectionSWP').classList.add('hidden');
                }

                // SWP Drawdown Amber/Orange Custom Chart Shades
                updateDoughnutChart([totalWithdrawn, Math.max(0, totalInterest), Math.max(0, corpus)], ['Withdrawn', 'Interest', 'Remaining'], ['#b45309', '#f59e0b', '#78716c']); 
                generateGrowthTable(yearlyGrowthData, initialCorpus);
                
                // SWP 4% Safe Withdrawal Rate (SWR) Dynamic Color Analytics Engine
                const swrPercentage = ((initialWithdrawalAmount * 12) / initialCorpus) * 100;

                if (exhaustionYear > 0) {
                    updateSmartInsightColorTheme('red');
                    getElem('smartInsightText').innerHTML = `🚨 <strong>Danger Zone:</strong> Capital is running dry! Your portfolio is projected to be completely exhausted in <strong>Year ${exhaustionYear}</strong>. Reduce withdrawals immediately.`;
                } else if (swrPercentage <= 4.0) {
                    updateSmartInsightColorTheme('teal');
                    getElem('smartInsightText').innerHTML = `🟢 <strong>Safe Zone:</strong> Your annual withdrawal rate of <strong>${swrPercentage.toFixed(1)}%</strong> fits comfortably inside the safe 4% Sustainable Withdrawal Rate (SWR) limit!`;
                } else if (swrPercentage > 4.0 && swrPercentage <= 6.0) {
                    updateSmartInsightColorTheme('amber');
                    getElem('smartInsightText').innerHTML = `🟡 <strong>Caution Zone:</strong> Withdrawal speed of <strong>${swrPercentage.toFixed(1)}%</strong> is slightly aggressive. Monitor your market performance to avoid rapid capital decline.`;
                } else if (swrPercentage > 4.0 && swrPercentage <= 6.0) {
                    updateSmartInsightColorTheme('orange');
                    getElem('smartInsightText').innerHTML = `🟠 <strong>High Risk Zone:</strong> An annual withdrawal rate of <strong>${swrPercentage.toFixed(1)}%</strong> exceeds typical safe parameters. High risk of principal erosion!`;
                } else {
                    updateSmartInsightColorTheme('red');
                    getElem('smartInsightText').innerHTML = `🔴 <strong>Danger Zone:</strong> Annual withdrawal speed is at a critical <strong>${swrPercentage.toFixed(1)}%</strong>. High speed of depletion detected!`;
                }
                smartInsight.classList.remove('hidden');

            } else if (currentMode === 'goal') {
                let targetAmount = parseFloat(getElem('targetAmountInput').value);
                const years = investmentPeriodYears; 
                const months = years * 12;
                const monthlyRate = annualReturnRate / 12;
                let monthlyInvestment;

                let inflatedTargetAmount = targetAmount;
                if (getElem('inflationToggle').checked) {
                    inflatedTargetAmount = targetAmount * Math.pow(1 + annualInflationRate, years);
                }

                if (monthlyRate === 0) { monthlyInvestment = inflatedTargetAmount / months; } 
                else { monthlyInvestment = inflatedTargetAmount / ( ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate) ); }

                const totalInvestment = monthlyInvestment * months;
                const expectedReturns = inflatedTargetAmount - totalInvestment;

                getElem('targetAmountGoal').textContent = formatCurrency(inflatedTargetAmount);
                getElem('totalInvestmentGoal').textContent = formatCurrency(totalInvestment);
                getElem('expectedReturnsGoal').textContent = formatCurrency(expectedReturns); 
                getElem('monthlyInvestmentGoal').textContent = formatCurrency(monthlyInvestment);

                // Goal MF LTCG Estimator
                if (getElem('goalEquityTaxToggle')?.checked) {
                    const gains = Math.max(0, inflatedTargetAmount - totalInvestment);
                    const ltcgTax = gains > 125000 ? (gains - 125000) * 0.125 : 0;
                    getElem('ltcgTaxGoal').textContent = formatCurrency(ltcgTax);
                    getElem('postTaxCorpusGoal').textContent = formatCurrency(inflatedTargetAmount - ltcgTax);
                    getElem('ltcgTaxSectionGoal').classList.remove('hidden');
                    getElem('postTaxSectionGoal').classList.remove('hidden');
                } else {
                    getElem('ltcgTaxSectionGoal').classList.add('hidden');
                    getElem('postTaxSectionGoal').classList.add('hidden');
                }

                // Goal Purple / Fuchsia Custom Chart Shades
                updateDoughnutChart([Math.max(0, totalInvestment), Math.max(0, expectedReturns)], ['Total Investment', 'Expected Returns'], ['#581c87', '#a21caf']); 

                // Delay Procrastination alert sandharbham
                const nextDelayedMonths = (years - 2) * 12;
                let delayedMonthlyNeeded = monthlyInvestment;
                if (years > 2) {
                    if (monthlyRate === 0) { delayedMonthlyNeeded = inflatedTargetAmount / nextDelayedMonths; }
                    else { delayedMonthlyNeeded = inflatedTargetAmount / ( ((Math.pow(1 + monthlyRate, nextDelayedMonths) - 1) / monthlyRate) * (1 + monthlyRate) ); }
                    const neededIncreasePct = (((delayedMonthlyNeeded - monthlyInvestment) / monthlyInvestment) * 100).toFixed(0);
                    getElem('smartInsightText').innerHTML = `⏱️ <strong>Procrastination cost:</strong> Delaying this investment goal by just 2 years will increase your monthly requirement by <strong class="text-red-800">${neededIncreasePct}%</strong> (from ${formatCurrency(monthlyInvestment)} to ${formatCurrency(delayedMonthlyNeeded)})!`;
                    smartInsight.classList.remove('hidden');
                }
            }
        } catch (error) {
            console.log("Calculation Error:", error);
        }
    }

    function switchMode(newMode) {
        currentMode = newMode;

        try {
            const url = new URL(window.location);
            url.searchParams.set('mode', newMode);
            window.history.pushState({}, '', url);
        } catch (e) {
            // Safe bypass if blocked inside cross-origin iframe context
        }

        ['sip', 'lumpsum', 'rd', 'fd', 'swp', 'goal'].forEach(el => {
            getElem(el+'Section')?.classList.add('hidden');
            getElem(el+'Summary')?.classList.add('hidden');
        });
        getElem('generalInputsSection')?.classList.toggle('hidden', newMode === 'goal');

        const activeClasses = 'bg-red-600 text-white shadow-md shadow-red-100 scale-[1.03]'.split(' ');
        const inactiveClasses = 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/50'.split(' ');
        
        ['sip', 'lumpsum', 'rd', 'fd', 'swp', 'goal'].forEach(m => {
            const btn = getElem(m+'ModeBtn');
            if(btn) {
                btn.classList.remove(...activeClasses, ...inactiveClasses);
                if(m === newMode) { 
                    btn.classList.add(...activeClasses); 
                    btn.setAttribute('aria-selected', 'true');
                    btn.setAttribute('tabindex', '0');
                    btn.focus();
                } else { 
                    btn.classList.add(...inactiveClasses); 
                    btn.setAttribute('aria-selected', 'false');
                    btn.setAttribute('tabindex', '-1');
                }
            }
        });

        if (newMode === 'goal') { 
            getElem('growthTableContainer')?.classList.add('hidden'); 
            getElem('toggleGrowthTableBtn')?.classList.add('hidden'); 
            getElem('exportCsvBtn')?.classList.add('hidden');
        } else { 
            getElem('toggleGrowthTableBtn')?.classList.remove('hidden'); 
            getElem('exportCsvBtn')?.classList.remove('hidden');
        }

        getElem(`${newMode}Section`)?.classList.remove('hidden');
        getElem(`${newMode}Summary`)?.classList.remove('hidden');

        const calculatorTitle = getElem('calculatorTitle');
        const calculatorDescription = getElem('calculatorDescription');
        const periodLabel = getElem('investmentPeriodLabel'); 
        const growthTableHeader = getElem('growthTableHeader');

        if (newMode === 'sip') { 
            if(calculatorTitle) calculatorTitle.textContent = 'SIP Calculator with Inflation'; 
            if(calculatorDescription) calculatorDescription.textContent = 'Plan your investments with our advanced SIP Calculator.'; 
            if(periodLabel) periodLabel.textContent = 'Investment Period (Years)'; 
        }
        else if (newMode === 'lumpsum') { 
            if(calculatorTitle) calculatorTitle.textContent = 'Lumpsum Calculator'; 
            if(calculatorDescription) calculatorDescription.textContent = 'Calculate the future value of your one-time investment.'; 
            if(periodLabel) periodLabel.textContent = 'Investment Period (Years)'; 
        }
        else if (newMode === 'rd') { 
            if(calculatorTitle) calculatorTitle.textContent = 'RD Calculator'; 
            if(calculatorDescription) calculatorDescription.textContent = 'Calculate the maturity amount of your Recurring Deposit.'; 
            if(periodLabel) periodLabel.textContent = 'Investment Period (Years)'; 
        }
        else if (newMode === 'fd') { 
            if(calculatorTitle) calculatorTitle.textContent = 'FD Calculator'; 
            if(calculatorDescription) calculatorDescription.textContent = 'Calculate the maturity amount of your Fixed Deposit.'; 
            if(periodLabel) periodLabel.textContent = 'Investment Period (Years)'; 
        }
        else if (newMode === 'swp') {
            if(calculatorTitle) calculatorTitle.textContent = 'SWP Calculator'; 
            if(calculatorDescription) calculatorDescription.textContent = 'Plan post-retirement income with a Systematic Withdrawal Plan.'; 
            if(periodLabel) periodLabel.textContent = 'Withdrawal Period (Years)';
        }
        else if (newMode === 'goal') { 
            if(calculatorTitle) calculatorTitle.textContent = 'Goal Planner'; 
            if(calculatorDescription) calculatorDescription.textContent = 'Calculate the monthly investment needed to reach your financial goal.'; 
        }

        if (newMode !== 'swp' && growthTableHeader) {
            const mainHeader = (newMode === 'fd' || newMode === 'lumpsum') ? 'Principal' : 'Invested';
            growthTableHeader.innerHTML = `<tr>
                <th class="px-3 py-2 text-left text-[10px] font-black text-stone-700 uppercase tracking-wider w-[15%]">Year</th>
                <th class="px-3 py-2 text-left text-[10px] font-black text-stone-700 uppercase tracking-wider w-[25%]">${mainHeader}</th>
                <th class="px-3 py-2 text-left text-[10px] font-black text-stone-700 uppercase tracking-wider w-[25%]">Returns</th>
                <th class="px-3 py-2 text-center text-[10px] font-black text-stone-700 uppercase tracking-wider w-[35%]">Total Value</th>
            </tr>`;
        } else if (newMode === 'swp' && growthTableHeader) {
            growthTableHeader.innerHTML = `<tr>
                <th class="px-3 py-2 text-left text-[10px] font-black text-stone-700 uppercase tracking-wider">Year</th>
                <th class="px-3 py-2 text-left text-[10px] font-black text-stone-700 uppercase tracking-wider">Opening Balance</th>
                <th class="px-3 py-2 text-left text-[10px] font-black text-stone-700 uppercase tracking-wider">Interest Earned</th>
                <th class="px-3 py-2 text-left text-[10px] font-black text-stone-700 uppercase tracking-wider">Withdrawn</th>
                <th class="px-3 py-2 text-center text-[10px] font-black text-stone-700 uppercase tracking-wider">Closing Balance</th>
            </tr>`;
        }

        updateCalculator();
    }

    function setupIncreaseToggle(toggle, label, slider, input) {
        if (!toggle || !label || !slider || !input) return;
        const labelTextSpan = getElem(label.id + 'Text') || label;
        toggle.addEventListener('change', () => {
            const isAmountMode = toggle.checked;
            let currentValue = parseFloat(input.value) || 0;
            let labelTextPrefix = label.id.includes('withdrawal') ? 'Annual Withdrawal Increase' : 'Annual Increase';
            let maxAmount = 5000; let maxPercent = label.id.includes('withdrawal') ? 10 : 20;
            
            if (labelTextSpan) {
                labelTextSpan.textContent = isAmountMode ? `${labelTextPrefix} (₹)` : `${labelTextPrefix} (%)`;
            }
            slider.max = input.max = isAmountMode ? maxAmount : maxPercent;
            slider.step = input.step = isAmountMode ? 100 : 1;
            if (currentValue > parseFloat(input.max)) currentValue = 0;
            slider.value = input.value = currentValue; updateSliderFill(slider);
            updateCalculator();
        });
    }

    function exportToCSV() {
        if (yearlyGrowthData.length === 0) {
            showNotification("No data available to export.");
            return;
        }

        let csvRows = [];
        let headers = [];

        if (currentMode === 'swp') {
            headers = ['Year', 'Opening Balance (INR)', 'Interest Earned (INR)', 'Withdrawn (INR)', 'Closing Balance (INR)'];
        } else {
            const investmentLabel = (currentMode === 'fd' || currentMode === 'lumpsum') ? 'Principal (INR)' : 'Invested (INR)';
            headers = ['Year', investmentLabel, 'Returns (INR)', 'Total Value (INR)'];
        }

        csvRows.push(headers.join(','));

        yearlyGrowthData.forEach(row => {
            let rowData = [];
            if (currentMode === 'swp') {
                rowData = [
                    row.year,
                    Math.round(row.openingBalance),
                    Math.round(row.interestEarned),
                    Math.round(row.withdrawn),
                    Math.round(row.closingBalance)
                ];
            } else {
                rowData = [
                    row.year,
                    Math.round(row.invested),
                    Math.round(row.returns),
                    Math.round(row.total)
                ];
            }
            csvRows.push(rowData.join(','));
        });

        const csvContent = csvRows.join('\n');
        const BOM = "\uFEFF"; // Excel compatible UTF-8 marker byte
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `InvestmentPlanner_${currentMode.toUpperCase()}_Breakdown.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification(`CSV Exported successfully for ${currentMode.toUpperCase()} breakdown!`);
    }

    // Global delegate for tax regime buttons (RD and FD contextual toggles)
    document.body.addEventListener('click', (e) => {
        if (e.target.id && (e.target.id.endsWith('TaxRegimeNew') || e.target.id.endsWith('TaxRegimeOld'))) {
            const isNew = e.target.id.endsWith('TaxRegimeNew');
            const prefix = e.target.id.startsWith('rd') ? 'rd' : 'fd';
            
            const btnNew = getElem(`${prefix}TaxRegimeNew`);
            const btnOld = getElem(`${prefix}TaxRegimeOld`);
            const slabNew = getElem(`${prefix}NewRegimeSlabs`);
            const slabOld = getElem(`${prefix}OldRegimeSlabs`);
            
            if (isNew) {
                btnNew.className = "px-2 py-0.5 rounded bg-white text-stone-900 shadow-sm focus:outline-none";
                btnOld.className = "px-2 py-0.5 rounded text-stone-600 hover:text-stone-900 focus:outline-none";
                slabNew.classList.remove('hidden');
                slabOld.classList.add('hidden');
            } else {
                btnOld.className = "px-2 py-0.5 rounded bg-white text-stone-900 shadow-sm focus:outline-none";
                btnNew.className = "px-2 py-0.5 rounded text-stone-600 hover:text-stone-900 focus:outline-none";
                slabOld.classList.remove('hidden');
                slabNew.classList.add('hidden');
            }
            updateCalculator();
        }
    });

    function setupEventListeners() {
        allInputConfigs.forEach(config => {
            if (getElem(config.id+'Slider')) {
                syncSliderAndInput({ sliderId: config.id+'Slider', inputId: config.id+'Input', decrementId: config.id+'Decrement', incrementId: config.id+'Increment', updateCallback: updateCalculator });
            }
        });

        // Handle keydown arrow-keys navigation on mode tabs
        const tabButtons = ['sip', 'lumpsum', 'rd', 'fd', 'swp', 'goal'];
        tabButtons.forEach((tabId, index) => {
            const btn = getElem(tabId+'ModeBtn');
            if (btn) {
                btn.addEventListener('keydown', (e) => {
                    let targetIdx = -1;
                    if (e.key === 'ArrowRight') {
                        targetIdx = (index + 1) % tabButtons.length;
                    } else if (e.key === 'ArrowLeft') {
                        targetIdx = (index - 1 + tabButtons.length) % tabButtons.length;
                    }
                    if (targetIdx !== -1) {
                        switchMode(tabButtons[targetIdx]);
                    }
                });
            }
        });

        ['sipFrequency', 'rdFrequency', 'withdrawalFrequency', 'inflationToggle', 'rdTaxSlabSelectNew', 'rdTaxSlabSelectOld', 'fdTaxSlabSelectNew', 'fdTaxSlabSelectOld'].forEach(elId => {
            const el = getElem(elId);
            if (el) {
              el.addEventListener('change', () => {
                if (el.id === 'inflationToggle') getElem('inflationInputGroup')?.classList.toggle('hidden', !el.checked);
                updateCalculator(); 
              });
            }
        });

        ['sipInitialLumpsumToggle', 'sipStepUpToggle', 'rdStepUpToggle', 'swpStepUpToggle', 'sipEquityTaxToggle', 'sipSwpBridgeToggle', 'rdTaxToggle', 'fdTaxToggle', 'lumpsumEquityTaxToggle', 'swpEquityTaxToggle', 'goalEquityTaxToggle'].forEach(elId => {
             const el = getElem(elId);
             if (el) el.addEventListener('change', () => {
                 const group = getElem(elId.replace('Toggle', 'Group'));
                 if (group) group.classList.toggle('hidden', !el.checked);
                 updateCalculator();
             });
        });

        ['sip', 'lumpsum', 'rd', 'fd', 'swp', 'goal'].forEach(m => {
            getElem(m+'ModeBtn')?.addEventListener('click', () => switchMode(m));
        });

        if (getElem('exportCsvBtn')) {
            getElem('exportCsvBtn').addEventListener('click', () => {
                exportToCSV();
            });
        }

        if(getElem('toggleGrowthTableBtn')) getElem('toggleGrowthTableBtn').addEventListener('click', () => { 
            getElem('growthTableContainer')?.classList.toggle('hidden'); 
            const btn = getElem('toggleGrowthTableBtn');
            btn.textContent = getElem('growthTableContainer')?.classList.contains('hidden') ? 'Show Yearly Growth' : 'Hide Yearly Growth';
        });

        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const shareData = {
                    title: 'Investment Planner',
                    text: `Calculate compound savings on India's easiest multi-utility Investment Planner! Mode: ${currentMode.toUpperCase()}`,
                    url: window.location.href
                };

                // Check if native sharing module is active
                if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                    try {
                        await navigator.share(shareData);
                        showNotification("System share opened successfully!");
                        return;
                    } catch (err) {
                        if (err.name !== 'AbortError') {
                            console.log("Native Share Failed. Using Fallback Clipboard copy:", err);
                        } else {
                            return; // User cancelled
                        }
                    }
                }

                // System Clipboard Backup Fallback
                const dummyInput = document.createElement('input');
                document.body.appendChild(dummyInput);
                dummyInput.value = window.location.href;
                dummyInput.select();
                document.execCommand('copy');
                showNotification("Copied shareable calculation URL link to clipboard!");
                document.body.removeChild(dummyInput);
            });
        });

        document.querySelectorAll('.goal-template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const goal = e.currentTarget.dataset.goal;
                document.querySelectorAll('.goal-template-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');

                const targetAmountSliderEl = getElem('targetAmountSlider');
                const goalPeriodSliderEl = getElem('goalPeriodSlider');
                const goalReturnRateSliderEl = getElem('goalReturnRateSlider');
                const targetAmountInput = getElem('targetAmountInput');
                const goalPeriodInput = getElem('goalPeriodInput');
                const goalReturnRateInput = getElem('goalReturnRateInput');

                if (goal === 'retirement') {
                    if(targetAmountSliderEl) targetAmountSliderEl.value = 10000000;
                    if(goalPeriodSliderEl) goalPeriodSliderEl.value = 25;
                    if(goalReturnRateSliderEl) goalReturnRateSliderEl.value = 12;
                } else if (goal === 'education') {
                    if(targetAmountSliderEl) targetAmountSliderEl.value = 2500000;
                    if(goalPeriodSliderEl) goalPeriodSliderEl.value = 15;
                    if(goalReturnRateSliderEl) goalReturnRateSliderEl.value = 11;
                } else if (goal === 'car') {
                    if(targetAmountSliderEl) targetAmountSliderEl.value = 1000000;
                    if(goalPeriodSliderEl) goalPeriodSliderEl.value = 5;
                    if(goalReturnRateSliderEl) goalReturnRateSliderEl.value = 9;
                } else if (goal === 'house') {
                    if(targetAmountSliderEl) targetAmountSliderEl.value = 15000000;
                    if(goalPeriodSliderEl) goalPeriodSliderEl.value = 10;
                    if(goalReturnRateSliderEl) goalReturnRateSliderEl.value = 12;
                } else if (goal === 'emergency') {
                    if(targetAmountSliderEl) targetAmountSliderEl.value = 500000;
                    if(goalPeriodSliderEl) goalPeriodSliderEl.value = 1;
                    if(goalReturnRateSliderEl) goalReturnRateSliderEl.value = 7;
                } else if (goal === 'fire') {
                    if(targetAmountSliderEl) targetAmountSliderEl.value = 50000000;
                    if(goalPeriodSliderEl) goalPeriodSliderEl.value = 15;
                    if(goalReturnRateSliderEl) goalReturnRateSliderEl.value = 12;
                }

                if(targetAmountInput && targetAmountSliderEl) targetAmountInput.value = targetAmountSliderEl.value;
                if(goalPeriodInput && goalPeriodSliderEl) goalPeriodInput.value = goalPeriodSliderEl.value;
                if(goalReturnRateInput && goalReturnRateSliderEl) goalReturnRateInput.value = goalReturnRateSliderEl.value;
                document.querySelectorAll('.range-slider').forEach(updateSliderFill);
                updateCalculator(); 
            });
        });

        setupIncreaseToggle(getElem('sipIncreaseTypeToggle'), getElem('sipIncreaseRateLabel'), getElem('sipIncreaseRateSlider'), getElem('sipIncreaseRateInput'));
        setupIncreaseToggle(getElem('rdIncreaseTypeToggle'), getElem('rdIncreaseRateLabel'), getElem('rdIncreaseRateSlider'), getElem('rdIncreaseRateInput'));
        setupIncreaseToggle(getElem('withdrawalIncreaseTypeToggle'), getElem('withdrawalIncreaseLabel'), getElem('withdrawalIncreaseSlider'), getElem('withdrawalIncreaseInput'));
    }

    try {
        setupEventListeners();
        
        // URL parameter state nundi prarambha modeni thasdeeq cheyandi
        const params = new URLSearchParams(window.location.search);
        const urlMode = params.get('mode');
        if (urlMode) {
            switchMode(urlMode);
        } else {
            switchMode('sip');
        }
    } catch (error) { console.log("Calc Error:", error); }
}

// Stop tooltip click event from bubbling up to parent label elements (preventing accidental toggle activation)
document.addEventListener('click', (e) => {
    if (e.target.closest('.tooltip-icon')) {
        e.preventDefault();
        e.stopPropagation();
    }
}, { capture: true });

document.addEventListener('touchstart', (e) => {
    if (e.target.closest('.tooltip-icon')) {
        e.stopPropagation();
    }
}, { capture: true, passive: true });
