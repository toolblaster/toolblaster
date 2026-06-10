/**
 * Daily Safe-to-Spend Calculator Application Logic
 * Implements budget calculations, date estimations, local storage state persistence,
 * Chart.js rendering, html2canvas capture, and clean itemized logging features.
 */

function safeGetLocalStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        console.warn("localStorage read blocked in this environment (likely an iframe sandbox):", e);
        return null;
    }
}

function safeSetLocalStorage(key, value) {
    try {
        return localStorage.setItem(key, value);
    } catch (e) {
        console.warn("localStorage write blocked in this environment (likely an iframe sandbox):", e);
    }
}

// Exposing deleteExpenseItem globally on window so dynamically rendered HTML buttons can safely reach it
window.deleteExpenseItem = function(id) {
    loggedExpenses = loggedExpenses.filter(item => item.id !== id);
    safeSetLocalStorage('logged_spends_sts', JSON.stringify(loggedExpenses));
    showNotification("Expense removed from history.");
    triggerCalculation();
};

const currencies = {
    USD: { symbol: '$', locale: 'en-US', code: 'USD' },
    EUR: { symbol: '€', locale: 'de-DE', code: 'EUR' },
    GBP: { symbol: '£', locale: 'en-GB', code: 'GBP' },
    INR: { symbol: '₹', locale: 'en-IN', code: 'INR' },
    CAD: { symbol: 'CA$', locale: 'en-CA', code: 'CAD' },
    AUD: { symbol: 'A$', locale: 'en-AU', code: 'AUD' },
    ILS: { symbol: '₪', locale: 'he-IL', code: 'ILS' },
    RUB: { symbol: '₽', locale: 'ru-RU', code: 'RUB' }
};

const currencyRates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.78,
    INR: 83,
    CAD: 1.37,
    AUD: 1.51,
    ILS: 3.72,
    RUB: 90
};

const currencyPresets = {
    INR: { minI: 10000, maxI: 1000000, stepI: 5000, valI: 75000, minB: 0, maxB: 500000, stepB: 2000, valB: 25000, minS: 0, maxS: 500000, stepS: 1000, valS: 15000 },
    USD: { minI: 1000,  maxI: 50000,   stepI: 100,  valI: 5000,  minB: 0, maxB: 30000,  stepB: 100,  valB: 2000,  minS: 0, maxS: 25000,  stepS: 50,   valS: 1000 },
    EUR: { minI: 1000,  maxI: 50000,   stepI: 100,  valI: 4500,  minB: 0, maxB: 30000,  stepB: 100,  valB: 1800,  minS: 0, maxS: 25000,  stepS: 50,   valS: 800 },
    GBP: { minI: 1000,  maxI: 50000,   stepI: 100,  valI: 4000,  minB: 0, maxB: 30000,  stepB: 100,  valB: 1600,  minS: 0, maxS: 25000,  stepS: 50,   valS: 700 },
    CAD: { minI: 1000,  maxI: 50000,   stepI: 100,  valI: 5500,  minB: 0, maxB: 30000,  stepB: 100,  valB: 2200,  minS: 0, maxS: 25000,  stepS: 50,   valS: 1000 },
    AUD: { minI: 1000,  maxI: 50000,   stepI: 100,  valI: 5500,  minB: 0, maxB: 30000,  stepB: 100,  valB: 2200,  minS: 0, maxS: 25000,  stepS: 50,   valS: 1000 },
    ILS: { minI: 2000,  maxI: 100000,  stepI: 500,  valI: 15000, minB: 0, maxB: 60000,  stepB: 200,  valB: 6000,  minS: 0, maxS: 50000,  stepS: 100,  valS: 3000 },
    RUB: { minI: 20000, maxI: 2000000, stepI: 10000,valI: 150000,minB: 0, maxB: 1000000, stepB: 5000, valB: 60000, minS: 0, maxS: 1000000, stepS: 2000, valS: 30000 }
};

let selectedCurrency = 'INR'; 
let emiDoughnutChart;
let emiBarChart;
let cachedSchedule = [];
let ledgerViewMode = 'month'; 
let loggedExpenses = [];

function formatCurrency(num) {
    const cur = currencies[selectedCurrency];
    return new Intl.NumberFormat(cur.locale, { style: 'currency', currency: cur.code, maximumFractionDigits: 0 }).format(Math.round(num));
}

function convertToCompactWords(value) {
    if (isNaN(value) || value <= 0) return "";
    if (selectedCurrency === 'INR') {
        if (value >= 10000000) return `(₹${(value / 10000000).toFixed(2)} Crore)`;
        if (value >= 100000) return `(₹${(value / 100000).toFixed(2)} Lakh)`;
        if (value >= 1000) return `(₹${(value / 1000).toFixed(1)} K)`;
        return `(₹${value})`;
    }
    const cur = currencies[selectedCurrency];
    const formatted = new Intl.NumberFormat(cur.locale, { notation: 'compact', compactDisplay: 'short' }).format(value);
    return `(${formatted})`;
}

function updateSliderFill(slider) {
    if (!slider) return;
    const percentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty('--fill-percentage', `${percentage}%`);
}

function updateAllCurrencyPlaceholders() {
    const cur = currencies[selectedCurrency];
    document.querySelectorAll('.currency-symbol').forEach(elem => {
        elem.textContent = cur.symbol;
    });
}

function updateVisualizationCharts(surplus, outlays, schedule) {
    const remaining = Math.max(0, surplus - outlays);
    const chartData = [outlays, remaining];
    
    // Dynamically update custom HTML Legend values
    const spentLegend = document.getElementById('legendSpentVal');
    const poolLegend = document.getElementById('legendPoolVal');
    if (spentLegend) spentLegend.textContent = formatCurrency(outlays);
    if (poolLegend) poolLegend.textContent = formatCurrency(remaining);

    // 1. Handle Doughnut Chart
    const doughnutCanvas = document.getElementById('emiDoughnutChart');
    if (doughnutCanvas) {
        if (emiDoughnutChart) {
            emiDoughnutChart.data.datasets[0].data = chartData;
            emiDoughnutChart.update();
        } else {
            emiDoughnutChart = new Chart(doughnutCanvas.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Spent Balance', 'Remaining Spend Pool'],
                    datasets: [{ data: chartData, backgroundColor: ['#B91C1C', '#065F46'], hoverOffset: 4 }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }
    }

    // 2. Handle Bar Chart (Real-time updates if the Spends Curve tab is currently active)
    const barCanvas = document.getElementById('emiBarChart');
    if (barCanvas) {
        const barContainer = document.getElementById('chartBarContainer');
        const isBarVisible = barContainer && !barContainer.classList.contains('hidden');
        
        if (isBarVisible) {
            renderBarChartOnly(schedule);
        }
    }
}

// Standard Bar Chart draw method to handle the Canvas 404/0-width bug elegantly
function renderBarChartOnly(schedule) {
    const barCanvas = document.getElementById('emiBarChart');
    if (!barCanvas) return;

    if (emiBarChart) {
        emiBarChart.destroy();
    }

    const barLabels = [];
    const barBalances = [];
    const barSpends = [];

    schedule.forEach(row => {
        barLabels.push(`Day ${row.day}`);
        barBalances.push(row.balance);
        barSpends.push(row.spends);
    });

    emiBarChart = new Chart(barCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: barLabels,
            datasets: [
                {
                    label: 'Spent on this Day',
                    data: barSpends,
                    backgroundColor: '#B91C1C',
                    borderRadius: 4
                },
                {
                    label: 'Remaining Spending Pool',
                    data: barBalances,
                    backgroundColor: '#1E3A8A',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { stacked: true, grid: { display: false } },
                y: { 
                    stacked: true,
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat(currencies[selectedCurrency].locale, { notation: 'compact', compactDisplay: 'short' }).format(value);
                        }
                    }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function triggerCalculation() {
    const income = Math.max(0, parseFloat(document.getElementById('incomeInput')?.value) || 0);
    const bills = Math.max(0, parseFloat(document.getElementById('billsInput')?.value) || 0);
    const savings = Math.max(0, parseFloat(document.getElementById('savingsInput')?.value) || 0);

    const extraBuffersActive = document.getElementById('buffersToggle')?.checked || false;
    let inflationCushion = 0;
    let emergencyReserve = 0;
    let windfalls = 0;
    let plannedSpend = 0;

    if (extraBuffersActive) {
        const infPercent = Math.max(0, parseFloat(document.getElementById('inflationInput')?.value) || 0);
        inflationCushion = bills * (infPercent / 100);
        emergencyReserve = Math.max(0, parseFloat(document.getElementById('emergencyInput')?.value) || 0);
        windfalls = Math.max(0, parseFloat(document.getElementById('windfallInput')?.value) || 0);
        plannedSpend = Math.max(0, parseFloat(document.getElementById('plannedSpendInput')?.value) || 0);
    }

    const totalCommitments = bills + savings + inflationCushion + emergencyReserve + plannedSpend;
    const daysRemaining = Math.max(1, parseInt(document.getElementById('daysRemainingInput')?.value) || 1);

    const outlaysSum = loggedExpenses.reduce((acc, curr) => acc + curr.amt, 0);

    const initialSurplus = Math.max(0, (income + windfalls) - totalCommitments);
    const remainingSpendPool = Math.max(0, initialSurplus - outlaysSum);
    const dailySTS = remainingSpendPool / daysRemaining;

    const totalCommitmentsDisp = document.getElementById('totalCommitmentsDisp');
    const availableSurplusDisp = document.getElementById('availableSurplusDisp');
    const loggedOutlaysTotal = document.getElementById('loggedOutlaysTotal');
    const maturityValue = document.getElementById('maturityValue');

    if (totalCommitmentsDisp) totalCommitmentsDisp.textContent = formatCurrency(totalCommitments);
    if (availableSurplusDisp) availableSurplusDisp.textContent = formatCurrency(remainingSpendPool);
    if (loggedOutlaysTotal) loggedOutlaysTotal.textContent = formatCurrency(outlaysSum);
    if (maturityValue) maturityValue.textContent = `${formatCurrency(dailySTS)} / Day`;

    const affBadge = document.getElementById('affordabilityBadge');
    if (affBadge) {
        if (dailySTS <= 0) {
            affBadge.innerHTML = `🔴 CRITICAL — BUDGET OVERSPENT! (${daysRemaining} days left with spending pool empty)`;
            affBadge.className = "p-2 rounded-xl text-center font-bold text-xxs transition-all duration-200 bg-red-100 text-red-955 border border-red-350";
        } else if (dailySTS < (selectedCurrency === 'INR' ? 500 : 10)) {
            affBadge.innerHTML = `🟡 CAUTION — SPENDING LIMIT IS VERY LOW (${formatCurrency(dailySTS)}/day remaining)`;
            affBadge.className = "p-2 rounded-xl text-center font-bold text-xxs transition-all duration-200 bg-amber-100 text-amber-950 border border-amber-300";
        } else {
            affBadge.innerHTML = `🟢 SAFE — GOALS SECURED! (${formatCurrency(dailySTS)}/day remaining)`;
            affBadge.className = "p-2 rounded-xl text-center font-bold text-xxs transition-all duration-200 bg-green-150 text-green-955 border border-green-300"; 
        }
    }

    updateSliderFill(document.getElementById('incomeSlider'));
    updateSliderFill(document.getElementById('billsSlider'));
    updateSliderFill(document.getElementById('savingsSlider'));
    updateSliderFill(document.getElementById('daysRemainingSlider'));

    let schedule = [];
    let simulatedBalance = initialSurplus;

    for (let day = 1; day <= daysRemaining; day++) {
        const daySpends = (day === 1) ? outlaysSum : 0; 
        simulatedBalance -= daySpends;
        
        const daysLeftFromThisDay = Math.max(1, daysRemaining - day + 1);
        const projectedLimit = Math.max(0, (simulatedBalance + daySpends) / daysLeftFromThisDay);

        schedule.push({
            day: day,
            spends: daySpends,
            balance: Math.max(0, simulatedBalance),
            limit: projectedLimit
        });
    }

    cachedSchedule = schedule;

    const printIncome = document.getElementById('printIncome');
    const printBills = document.getElementById('printBills');
    const printSavings = document.getElementById('printSavings');
    const printDailySTS = document.getElementById('printDailySTS');
    const printTotalCommitments = document.getElementById('printTotalCommitments');
    const printSurplus = document.getElementById('printSurplus');
    const printTotalLogged = document.getElementById('printTotalLogged');

    if (printIncome) printIncome.textContent = formatCurrency(income);
    if (printBills) printBills.textContent = formatCurrency(bills);
    if (printSavings) printSavings.textContent = formatCurrency(savings);
    if (printDailySTS) printDailySTS.textContent = `${formatCurrency(dailySTS)} / Day`;
    if (printTotalCommitments) printTotalCommitments.textContent = formatCurrency(totalCommitments);
    if (printSurplus) printSurplus.textContent = formatCurrency(remainingSpendPool);
    if (printTotalLogged) printTotalLogged.textContent = formatCurrency(outlaysSum);

    const printRowInflation = document.getElementById('printRowInflation');
    const printInflation = document.getElementById('printInflation');
    if (printRowInflation && printInflation) {
        if (inflationCushion > 0) {
            printRowInflation.classList.remove('hidden');
            printInflation.textContent = formatCurrency(inflationCushion);
        } else {
            printRowInflation.classList.add('hidden');
        }
    }

    const printRowEmergency = document.getElementById('printRowEmergency');
    const printEmergency = document.getElementById('printEmergency');
    if (printRowEmergency && printEmergency) {
        if (emergencyReserve > 0) {
            printRowEmergency.classList.remove('hidden');
            printEmergency.textContent = formatCurrency(emergencyReserve);
        } else {
            printRowEmergency.classList.add('hidden');
        }
    }

    const printRowWindfall = document.getElementById('printRowWindfall');
    const printWindfall = document.getElementById('printWindfall');
    if (printRowWindfall && printWindfall) {
        if (windfalls > 0) {
            printRowWindfall.classList.remove('hidden');
            printWindfall.textContent = formatCurrency(windfalls);
        } else {
            printRowWindfall.classList.add('hidden');
        }
    }

    const printRowPlanned = document.getElementById('printRowPlanned');
    const printPlanned = document.getElementById('printPlanned');
    if (printRowPlanned && printPlanned) {
        if (plannedSpend > 0) {
            printRowPlanned.classList.remove('hidden');
            printPlanned.textContent = formatCurrency(plannedSpend);
        } else {
            printRowPlanned.classList.add('hidden');
        }
    }

    updateVisualizationCharts(initialSurplus, outlaysSum, schedule);
    renderAmortizationLedger(schedule, daysRemaining);
    updateRecentSpendsMiniList();
}

function renderAmortizationLedger(schedule, totalDays) {
    const tableBody = document.getElementById('ledgerTableBody');
    const printTableBody = document.getElementById('printLedgerBody');
    const totalRowsBadge = document.getElementById('totalRowsBadge');
    const scrollNoticeBadge = document.getElementById('scrollNoticeBadge');

    if (!tableBody) return;

    tableBody.innerHTML = '';
    if (printTableBody) printTableBody.innerHTML = '';

    const ledgerPeriodHeader = document.getElementById('ledgerPeriodHeader');
    const ledgerColPrincipal = document.getElementById('ledgerColPrincipal');
    const ledgerColInterest = document.getElementById('ledgerColInterest');
    const ledgerTotalHeader = document.getElementById('ledgerTotalHeader');
    const ledgerBalanceHeader = document.getElementById('ledgerBalanceHeader');

    if (ledgerViewMode === 'month') {
        if (ledgerPeriodHeader) ledgerPeriodHeader.textContent = "Item Description";
        if (ledgerColPrincipal) ledgerColPrincipal.textContent = "Category";
        if (ledgerColInterest) ledgerColInterest.textContent = "Amount";
        if (ledgerTotalHeader) ledgerTotalHeader.textContent = "Logged Date";
        if (ledgerBalanceHeader) ledgerBalanceHeader.textContent = "Action";

        if (totalRowsBadge) totalRowsBadge.textContent = `Showing ${loggedExpenses.length} Spends Logged`;
        if (scrollNoticeBadge) {
            if (loggedExpenses.length > 8) {
                scrollNoticeBadge.textContent = "Scroll inside table to view all spends 👇";
            } else {
                scrollNoticeBadge.textContent = "";
            }
        }

        if (loggedExpenses.length === 0) {
            const rowHtml = `
                <td colspan="5" class="p-8 text-center text-gray-700 font-semibold italic bg-stone-50 border border-stone-200">No spent items logged yet. Use the logger card above!</td>
            `;
            tableBody.innerHTML = rowHtml;
            if (printTableBody) printTableBody.innerHTML = rowHtml;
            return;
        }

        loggedExpenses.forEach((item) => {
            const rowHtml = `
                <td class="p-3 font-semibold text-gray-900">${item.desc}</td>
                <td class="p-3"><span class="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-150 border border-gray-300 uppercase">${item.cat}</span></td>
                <td class="p-3 text-red-955 font-bold">${formatCurrency(item.amt)}</td>
                <td class="p-3 text-gray-700 font-medium">${item.date}</td>
                <td class="p-3">
                    <button type="button" onclick="deleteExpenseItem('${item.id}')" class="text-red-800 hover:text-red-955 font-black flex items-center gap-0.5" aria-label="Delete spent outlay">
                        Delete &times;
                    </button>
                </td>
            `;
            const screenTr = document.createElement('tr');
            screenTr.className = "hover:bg-gray-50 border-b border-gray-150 transition-colors";
            screenTr.innerHTML = rowHtml;
            tableBody.appendChild(screenTr);

            if (printTableBody) {
                const printTr = document.createElement('tr');
                printTr.className = "border-b border-gray-200";
                printTr.innerHTML = `
                    <td class="p-2 border text-gray-955 font-semibold">${item.desc}</td>
                    <td class="p-2 border text-gray-900">${item.cat}</td>
                    <td class="p-2 border font-bold text-red-750">${formatCurrency(item.amt)}</td>
                    <td class="p-2 border text-gray-800">${item.date}</td>
                `;
                printTableBody.appendChild(printTr);
            }
        });
    } else {
        if (ledgerPeriodHeader) ledgerPeriodHeader.textContent = "Day";
        if (ledgerColPrincipal) ledgerColPrincipal.textContent = "Spent on this Day";
        if (ledgerColInterest) ledgerColInterest.textContent = "Cumulative Spends";
        if (ledgerTotalHeader) ledgerTotalHeader.textContent = "Remaining Spending Pool";
        if (ledgerBalanceHeader) ledgerBalanceHeader.textContent = "Revised Daily Limit";

        if (totalRowsBadge) totalRowsBadge.textContent = `Showing all ${totalDays} Calendar Days`;
        if (scrollNoticeBadge) {
            if (totalDays > 8) {
                scrollNoticeBadge.textContent = "Scroll inside table to view entire cycle 👇";
            } else {
                scrollNoticeBadge.textContent = "";
            }
        }

        let sumAcc = 0;
        schedule.forEach(row => {
            let sumAccVal = sumAcc + row.spends;
            sumAcc = sumAccVal;

            const rowHtml = `
                <td class="p-3 font-semibold text-gray-900">Day ${row.day}</td>
                <td class="p-3 text-red-955 font-bold">${row.spends > 0 ? formatCurrency(row.spends) : '-'}</td>
                <td class="p-3 text-gray-700 font-medium">${row.spends > 0 ? formatCurrency(sumAccVal) : '-'}</td>
                <td class="p-3 font-semibold text-gray-900">${formatCurrency(row.balance)}</td>
                <td class="p-3 text-indigo-955 font-extrabold">${formatCurrency(row.limit)} / Day</td>
            `;

            const screenTr = document.createElement('tr');
            screenTr.className = "hover:bg-gray-50 border-b border-gray-150 transition-colors";
            screenTr.innerHTML = rowHtml;
            tableBody.appendChild(screenTr);

            if (printTableBody) {
                const printTr = document.createElement('tr');
                printTr.className = "border-b border-gray-200";
                printTr.innerHTML = `
                    <td class="p-2 border font-bold">Day ${row.day}</td>
                    <td class="p-2 border font-semibold text-red-750">${row.spends > 0 ? formatCurrency(row.spends) : '-'}</td>
                    <td class="p-2 border text-gray-800">${row.spends > 0 ? formatCurrency(sumAccVal) : '-'}</td>
                    <td class="p-2 border font-bold text-indigo-950">${formatCurrency(row.limit)} / Day</td>
                `;
                printTableBody.appendChild(printTr);
            }
        });
    }
}

// --- NEW INSTANT CONFIRMATION LOG LIST (UX Solution to eliminate user confusion) ---
function updateRecentSpendsMiniList() {
    const container = document.getElementById('recentSpendsContainer');
    const list = document.getElementById('recentSpendsList');
    if (!container || !list) return;

    if (loggedExpenses.length === 0) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    list.innerHTML = '';

    // Extract last 3 spent outlays to output upfront
    const recentItems = [...loggedExpenses].reverse().slice(0, 3);

    recentItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = "flex items-center justify-between bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-150 text-xxs font-semibold";
        itemDiv.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="font-extrabold text-gray-900">${item.desc}</span>
                <span class="px-1.5 py-0.2 text-[9px] font-bold rounded bg-gray-200 text-gray-700 uppercase">${item.cat}</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="font-black text-red-800">${formatCurrency(item.amt)}</span>
                <button type="button" onclick="deleteExpenseItem('${item.id}')" class="text-gray-500 hover:text-red-800 font-bold text-sm leading-none transition-colors" aria-label="Delete item">&times;</button>
            </div>
        `;
        list.appendChild(itemDiv);
    });
}

function setupSyncFramework(sliderId, inputId, decId, incId, wordId) {
    const slider = document.getElementById(sliderId);
    const input = document.getElementById(inputId);
    const dec = document.getElementById(decId);
    const inc = document.getElementById(incId);
    
    if (!slider || !input || !dec || !inc) {
        console.warn(`Sync framework failed for: ${sliderId}, ${inputId}`);
        return;
    }

    const parentGroup = input.closest('.input-stepper-group');

    const getDecimalPlaces = () => {
        const stepStr = input.step || slider.step || "1";
        return (stepStr.split('.')[1] || '').length;
    };

    const syncFromInput = () => {
        const val = parseFloat(input.value);
        const min = parseFloat(input.min) || 0;
        const max = parseFloat(input.max) || Infinity;
        
        if (!isNaN(val) && (val < min || val > max)) {
            input.style.color = '#b91c1c';
            if (parentGroup) {
                parentGroup.style.borderColor = '#ef4444';
                parentGroup.style.backgroundColor = '#fef2f2';
            }
        } else {
            input.style.color = '#111827';
            if (parentGroup) {
                parentGroup.style.borderColor = '#94a3b8';
                parentGroup.style.backgroundColor = '#ffffff';
            }
        }

        if (!isNaN(val) && val >= min && val <= max) {
            slider.value = val;
            updateSliderFill(slider);
            if (wordId) {
                const wordElem = document.getElementById(wordId);
                if (wordElem) wordElem.textContent = convertToCompactWords(val);
            }
            triggerCalculation();
        } else if (!isNaN(val)) {
            if (wordId) {
                const wordElem = document.getElementById(wordId);
                if (wordElem) wordElem.textContent = convertToCompactWords(val);
            }
        }
    };

    const enforceLimits = () => {
        let val = parseFloat(input.value);
        const min = parseFloat(input.min) || 0;
        const max = parseFloat(input.max) || Infinity;
        const decimalPlaces = getDecimalPlaces();

        if (isNaN(val) || input.value.trim() === '') {
            val = min;
        } else {
            val = Math.max(min, Math.min(max, val));
        }

        const sanitizedVal = parseFloat(val.toFixed(decimalPlaces));
        input.value = sanitizedVal;
        slider.value = sanitizedVal;
        updateSliderFill(slider);
        if (wordId) {
            const wordElem = document.getElementById(wordId);
            if (wordElem) wordElem.textContent = convertToCompactWords(sanitizedVal);
        }

        input.style.color = '#111827';
        if (parentGroup) {
            parentGroup.style.borderColor = '#94a3b8';
            parentGroup.style.backgroundColor = '#ffffff';
        }

        triggerCalculation();
    };

    slider.addEventListener('input', () => {
        input.value = slider.value;
        syncFromInput();
    });

    input.addEventListener('input', () => {
        let cleaned = input.value.replace(/[^0-9.]/g, '');
        if (input.value !== cleaned) {
            input.value = cleaned;
        }
        syncFromInput();
    });

    input.addEventListener('blur', enforceLimits);

    dec.addEventListener('click', () => {
        const min = parseFloat(input.min) || 0;
        const step = parseFloat(input.step) || 1;
        let val = parseFloat(input.value) || min;
        val = Math.max(min, val - step);
        const decimalPlaces = getDecimalPlaces();
        input.value = parseFloat(val.toFixed(decimalPlaces));
        slider.value = input.value;
        updateSliderFill(slider);
        if (wordId) {
            const wordElem = document.getElementById(wordId);
            if (wordElem) wordElem.textContent = convertToCompactWords(parseFloat(input.value));
        }
        triggerCalculation();
    });

    inc.addEventListener('click', () => {
        const min = parseFloat(input.min) || 0;
        const max = parseFloat(input.max) || Infinity;
        const step = parseFloat(input.step) || 1;
        let val = parseFloat(input.value) || min;
        val = Math.min(max, val + step);
        const decimalPlaces = getDecimalPlaces();
        input.value = parseFloat(val.toFixed(decimalPlaces));
        slider.value = input.value;
        updateSliderFill(slider);
        if (wordId) {
            const wordElem = document.getElementById(wordId);
            if (wordElem) wordElem.textContent = convertToCompactWords(parseFloat(input.value));
        }
        triggerCalculation();
    });

    updateSliderFill(slider);
}

function calculateOrganicDaysLeft() {
    const now = new Date();
    const today = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const endMode = document.getElementById('cycleEndModeSelect')?.value || 'endOfMonth';
    const textAlert = document.getElementById('organicDaysLeftAlert');
    const slider = document.getElementById('daysRemainingSlider');
    const input = document.getElementById('daysRemainingInput');

    if (!textAlert || !slider || !input) return;

    let daysLeft = 1;

    if (endMode === 'endOfMonth') {
        const customDayContainer = document.getElementById('cycleCustomDayContainer');
        if (customDayContainer) customDayContainer.classList.add('hidden');
        const wrapper = document.getElementById('cycleEndModeWrapper');
        if (wrapper) wrapper.className = "w-full transition-all duration-200";
        const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        daysLeft = totalDaysInMonth - today + 1;
        textAlert.textContent = `Today is ${monthNames[currentMonth]} ${today}. There are exactly ${daysLeft} days remaining in this calendar month.`;
    } else {
        const customDayContainer = document.getElementById('cycleCustomDayContainer');
        if (customDayContainer) {
            customDayContainer.classList.remove('hidden');
            customDayContainer.className = "w-[30%] transition-all duration-200";
        }
        const wrapper = document.getElementById('cycleEndModeWrapper');
        if (wrapper) wrapper.className = "w-[70%] transition-all duration-200";
        const customDaySelect = document.getElementById('cycleCustomDaySelect');
        const customDay = parseInt(customDaySelect ? customDaySelect.value : 1) || 1;
        
        if (customDay >= today) {
            daysLeft = customDay - today + 1;
            textAlert.textContent = `Today is ${monthNames[currentMonth]} ${today}. Mapped until payday on the ${customDay}th of this month (${daysLeft} days left).`;
        } else {
            const totalDaysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const daysRemainingInCurrent = totalDaysInCurrentMonth - today + 1;
            daysLeft = daysRemainingInCurrent + customDay - 1;
            
            const nextMonthName = monthNames[(currentMonth + 1) % 12];
            textAlert.textContent = `Today is ${monthNames[currentMonth]} ${today}. Mapped until next paycheck on ${nextMonthName} ${customDay} (${daysLeft} days left).`;
        }
    }

    slider.max = Math.max(31, daysLeft);
    input.max = Math.max(31, daysLeft);
    slider.value = daysLeft;
    input.value = daysLeft;

    updateSliderFill(slider);
    triggerCalculation();
}

function populateCustomDayDropdown() {
    const select = document.getElementById('cycleCustomDaySelect');
    if (!select) return;
    select.innerHTML = '';
    for (let i = 1; i <= 31; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `${i}${getOrdinalSuffix(i)}`;
        if (i === 1) opt.selected = true; 
        select.appendChild(opt);
    }
}

function getOrdinalSuffix(i) {
    const j = i % 10, k = i % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
}

function changeCurrencyScaleAndValues(prevCurrency, newCurrency) {
    selectedCurrency = newCurrency;
    updateAllCurrencyPlaceholders();

    const conversionFactor = currencyRates[newCurrency] / currencyRates[prevCurrency];

    const syncInput = (inputId, sliderId, keyPrefix) => {
        const input = document.getElementById(inputId);
        const slider = document.getElementById(sliderId);
        if (!input || !slider) return;
        const oldVal = parseFloat(input.value) || 0;

        const newVal = Math.round(oldVal * conversionFactor);
        const preset = currencyPresets[newCurrency] || currencyPresets['INR'];

        slider.min = preset['min' + keyPrefix];
        slider.max = preset['max' + keyPrefix];
        slider.step = preset['step' + keyPrefix];
        slider.value = newVal;

        input.min = preset['min' + keyPrefix];
        input.max = preset['max' + keyPrefix];
        input.step = preset['step' + keyPrefix];
        input.value = newVal;

        updateSliderFill(slider);
    };

    syncInput('incomeInput', 'incomeSlider', 'I');
    syncInput('billsInput', 'billsSlider', 'B');
    syncInput('savingsInput', 'savingsSlider', 'S');

    const emergencyInput = document.getElementById('emergencyInput');
    if (emergencyInput) {
        emergencyInput.value = Math.round((parseFloat(emergencyInput.value) || 0) * conversionFactor);
    }

    const windfallInput = document.getElementById('windfallInput');
    if (windfallInput) {
        windfallInput.value = Math.round((parseFloat(windfallInput.value) || 0) * conversionFactor);
    }

    const plannedInput = document.getElementById('plannedSpendInput');
    if (plannedInput) {
        plannedInput.value = Math.round((parseFloat(plannedInput.value) || 0) * conversionFactor);
    }

    loggedExpenses = loggedExpenses.map(item => {
        return {
            ...item,
            amt: Math.round(item.amt * conversionFactor)
        };
    });
    safeSetLocalStorage('logged_spends_sts', JSON.stringify(loggedExpenses));

    const simulationInput = document.getElementById('simulationInput');
    if (simulationInput && simulationInput.value) {
        simulationInput.value = Math.round((parseFloat(simulationInput.value) || 0) * conversionFactor);
    }

    const incomeWord = document.getElementById('incomeWord');
    const billsWord = document.getElementById('billsWord');
    const savingsWord = document.getElementById('savingsWord');
    const incomeInputVal = document.getElementById('incomeInput');
    const billsInputVal = document.getElementById('billsInput');
    const savingsInputVal = document.getElementById('savingsInput');

    if (incomeWord && incomeInputVal) incomeWord.textContent = convertToCompactWords(parseFloat(incomeInputVal.value));
    if (billsWord && billsInputVal) billsWord.textContent = convertToCompactWords(parseFloat(billsInputVal.value));
    if (savingsWord && savingsInputVal) savingsWord.textContent = convertToCompactWords(parseFloat(savingsInputVal.value));

    triggerCalculation();
}

function exportToCSV() {
    if (cachedSchedule.length === 0) return;
    let csvRows = [];

    if (ledgerViewMode === 'year') {
        csvRows.push(["Day", "Spent on this Day", "Remaining Spending Pool", "Revised Daily Limit"]);
        cachedSchedule.forEach(row => {
            csvRows.push([`Day ${row.day}`, Math.round(row.spends), Math.round(row.balance), Math.round(row.limit)]);
        });
    } else {
        csvRows.push(["Expense Description", "Category", "Amount", "Date Logged"]);
        loggedExpenses.forEach(item => {
            csvRows.push([item.desc, item.cat, Math.round(item.amt), item.date]);
        });
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.map(val => typeof val === 'string' ? `"${val}"` : val).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Safe_To_Spend_Schedule_${ledgerViewMode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function loadFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const now = new Date();
    
    const savedSpends = safeGetLocalStorage('logged_spends_sts');
    if (savedSpends) {
        try {
            loggedExpenses = JSON.parse(savedSpends);
        } catch (e) {
            loggedExpenses = [];
        }
    } else {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const mockDate = `02 ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
        loggedExpenses = [
            { id: '1', desc: 'Grocery Bill', cat: 'Groceries', amt: 2500, date: mockDate }
        ];
        safeSetLocalStorage('logged_spends_sts', JSON.stringify(loggedExpenses));
    }

    const globalCurrencySelect = document.getElementById('globalCurrencySelect');
    if (params.has('curr')) {
        selectedCurrency = params.get('curr');
        if (globalCurrencySelect) globalCurrencySelect.value = selectedCurrency;
    } else {
        selectedCurrency = 'INR';
        if (globalCurrencySelect) globalCurrencySelect.value = 'INR';
    }

    updateAllCurrencyPlaceholders();

    const preset = currencyPresets[selectedCurrency];
    const incomeSlider = document.getElementById('incomeSlider');
    const incomeInput = document.getElementById('incomeInput');
    const billsSlider = document.getElementById('billsSlider');
    const billsInput = document.getElementById('billsInput');
    const savingsSlider = document.getElementById('savingsSlider');
    const savingsInput = document.getElementById('savingsInput');

    if (incomeSlider && incomeInput) {
        incomeSlider.min = preset.minI; incomeSlider.max = preset.maxI; incomeSlider.step = preset.stepI; incomeSlider.value = preset.valI;
        incomeInput.min = preset.minI; incomeInput.max = preset.maxI; incomeInput.step = preset.stepI; incomeInput.value = preset.valI;
    }

    if (billsSlider && billsInput) {
        billsSlider.min = preset.minB; billsSlider.max = preset.maxB; billsSlider.step = preset.stepB; billsSlider.value = preset.valB;
        billsInput.min = preset.minB; billsInput.max = preset.maxB; billsInput.step = preset.stepB; billsInput.value = preset.valB;
    }

    if (savingsSlider && savingsInput) {
        savingsSlider.min = preset.minS; savingsSlider.max = preset.maxS; savingsSlider.step = preset.stepS; savingsSlider.value = preset.valS;
        savingsInput.min = preset.minS; savingsInput.max = preset.maxS; savingsInput.step = preset.stepS; savingsInput.value = preset.valS;
    }

    if (params.has('income') && incomeInput && incomeSlider) {
        incomeInput.value = params.get('income');
        incomeSlider.value = params.get('income');
    }
    if (params.has('bills') && billsInput && billsSlider) {
        billsInput.value = params.get('bills');
        billsSlider.value = params.get('bills');
    }
    if (params.has('savings') && savingsInput && savingsSlider) {
        savingsInput.value = params.get('savings');
        savingsSlider.value = params.get('savings');
    }

    const buffersToggle = document.getElementById('buffersToggle');
    const buffersContainer = document.getElementById('buffersContainer');
    if (buffersToggle && buffersContainer) {
        if (params.get('eb') === 'true') {
            buffersToggle.checked = true;
            buffersContainer.classList.remove('hidden');
        } else {
            buffersToggle.checked = false;
            buffersContainer.classList.add('hidden');
        }
    }

    const loggerToggle = document.getElementById('loggerToggle');
    const loggerContainer = document.getElementById('loggerContainer');
    if (loggerToggle && loggerContainer) {
        const savedLoggerState = safeGetLocalStorage('logger_state_visible') === 'true';
        const urlLoggerState = params.get('el') === 'true';
        if (urlLoggerState || savedLoggerState) {
            loggerToggle.checked = true;
            loggerContainer.classList.remove('hidden');
        } else {
            loggerToggle.checked = false;
            loggerContainer.classList.add('hidden');
        }
    }

    const inflationInput = document.getElementById('inflationInput');
    const emergencyInput = document.getElementById('emergencyInput');
    const windfallInput = document.getElementById('windfallInput');
    const plannedSpendInput = document.getElementById('plannedSpendInput');

    if (params.has('inf') && inflationInput) inflationInput.value = params.get('inf');
    if (params.has('emg') && emergencyInput) emergencyInput.value = params.get('emg');
    if (params.has('wnd') && windfallInput) windfallInput.value = params.get('wnd');
    if (params.has('pln') && plannedSpendInput) plannedSpendInput.value = params.get('pln');

    updateSliderFill(incomeSlider);
    updateSliderFill(billsSlider);
    updateSliderFill(savingsSlider);
    
    const incomeWord = document.getElementById('incomeWord');
    const billsWord = document.getElementById('billsWord');
    const savingsWord = document.getElementById('savingsWord');

    if (incomeWord && incomeInput) incomeWord.textContent = convertToCompactWords(parseFloat(incomeInput.value));
    if (billsWord && billsInput) billsWord.textContent = convertToCompactWords(parseFloat(billsInput.value));
    if (savingsWord && savingsInput) savingsWord.textContent = convertToCompactWords(parseFloat(savingsInput.value));

    calculateOrganicDaysLeft();
}

function safeAddListener(id, event, callback) {
    const el = typeof id === 'string' ? document.getElementById(id) : id;
    if (el) {
        el.addEventListener(event, callback);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    populateCustomDayDropdown();

    setupSyncFramework('incomeSlider', 'incomeInput', 'incomeDecrement', 'incomeIncrement', 'incomeWord');
    setupSyncFramework('billsSlider', 'billsInput', 'billsDecrement', 'billsIncrement', 'billsWord');
    setupSyncFramework('savingsSlider', 'savingsInput', 'savingsDecrement', 'savingsIncrement', 'savingsWord');
    setupSyncFramework('daysRemainingSlider', 'daysRemainingInput', 'daysRemainingDecrement', 'daysRemainingIncrement', null);

    safeAddListener('cycleEndModeSelect', 'change', calculateOrganicDaysLeft);
    safeAddListener('cycleCustomDaySelect', 'change', calculateOrganicDaysLeft);

    const buffersToggle = document.getElementById('buffersToggle');
    const buffersContainer = document.getElementById('buffersContainer');
    if (buffersToggle && buffersContainer) {
        buffersToggle.addEventListener('change', () => {
            const isActive = buffersToggle.checked;
            buffersContainer.classList.toggle('hidden', !isActive);
            triggerCalculation();
        });
    }

    const loggerToggle = document.getElementById('loggerToggle');
    const loggerContainer = document.getElementById('loggerContainer');
    if (loggerToggle && loggerContainer) {
        loggerToggle.addEventListener('change', () => {
            const isVisible = loggerToggle.checked;
            loggerContainer.classList.toggle('hidden', !isVisible);
            safeSetLocalStorage('logger_state_visible', isVisible ? 'true' : 'false');
        });
    }

    const globalCurrencySelect = document.getElementById('globalCurrencySelect');
    if (globalCurrencySelect) {
        globalCurrencySelect.addEventListener('change', (e) => {
            const prev = selectedCurrency;
            const next = e.target.value;
            changeCurrencyScaleAndValues(prev, next);
        });
    }

    const toggleViewMonthBtn = document.getElementById('toggleViewMonthBtn');
    const toggleViewYearBtn = document.getElementById('toggleViewYearBtn');

    if (toggleViewMonthBtn) {
        toggleViewMonthBtn.addEventListener('click', () => {
            if (ledgerViewMode !== 'month') {
                ledgerViewMode = 'month';
                toggleViewMonthBtn.className = "px-3 py-1 rounded-md bg-blue-900 text-white shadow";
                if (toggleViewYearBtn) toggleViewYearBtn.className = "px-3 py-1 rounded-md text-gray-700 hover:text-gray-900";
                triggerCalculation();
            }
        });
    }

    if (toggleViewYearBtn) {
        toggleViewYearBtn.addEventListener('click', () => {
            if (ledgerViewMode !== 'year') {
                ledgerViewMode = 'year';
                toggleViewYearBtn.className = "px-3 py-1 rounded-md bg-blue-900 text-white shadow";
                if (toggleViewMonthBtn) toggleViewMonthBtn.className = "px-3 py-1 rounded-md text-gray-700 hover:text-gray-900";
                triggerCalculation();
            }
        });
    }

    const chartToggleShare = document.getElementById('chartToggleShare');
    const chartToggleSchedule = document.getElementById('chartToggleSchedule');
    const doughnutContainer = document.getElementById('chartDoughnutContainer');
    const barContainer = document.getElementById('chartBarContainer');

    if (chartToggleShare) {
        chartToggleShare.addEventListener('click', () => {
            if (doughnutContainer) doughnutContainer.classList.remove('hidden');
            if (barContainer) barContainer.classList.add('hidden');
            chartToggleShare.className = "px-2 py-0.5 rounded-md bg-blue-900 text-white shadow";
            if (chartToggleSchedule) chartToggleSchedule.className = "px-2 py-0.5 text-gray-700 hover:text-gray-900 ml-0.5";
            if (emiDoughnutChart) emiDoughnutChart.resize();
        });
    }

    if (chartToggleSchedule) {
        chartToggleSchedule.addEventListener('click', () => {
            if (barContainer) barContainer.classList.remove('hidden');
            if (doughnutContainer) doughnutContainer.classList.add('hidden');
            chartToggleSchedule.className = "px-2 py-0.5 rounded-md bg-blue-900 text-white shadow";
            if (chartToggleShare) chartToggleShare.className = "px-2 py-0.5 text-gray-700 hover:text-gray-900 ml-0.5";
            
            // CRITICAL BUG RESOLVED: Bar Tab switch triggers fresh canvas render immediately!
            renderBarChartOnly(cachedSchedule);
        });
    }

    safeAddListener('addExpenseBtn', 'click', () => {
        const descInput = document.getElementById('expenseDescInput');
        const amtInput = document.getElementById('expenseAmtInput');
        if (!descInput || !amtInput) return;

        const desc = descInput.value.trim() || "Spent Outlay";
        const amt = Math.max(0, parseFloat(amtInput.value) || 0);

        if (amt <= 0) {
            showNotification("Please enter a valid spent amount.");
            return;
        }

        const now = new Date();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dayDisplay = String(now.getDate()).padStart(2, '0');
        const formattedDate = `${dayDisplay} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;

        const newSpend = {
            id: Math.random().toString(36).substr(2, 9),
            desc: desc,
            cat: "Outlay",
            amt: amt,
            date: formattedDate
        };

        loggedExpenses.push(newSpend);
        safeSetLocalStorage('logged_spends_sts', JSON.stringify(loggedExpenses));

        descInput.value = '';
        amtInput.value = '';

        showNotification(`Logged spend of ${formatCurrency(amt)} successfully!`);
        triggerCalculation();
    });

    safeAddListener('goToFullLedgerBtn', 'click', () => {
        const content = document.getElementById('ledgerContent');
        const toggleBtn = document.getElementById('toggleLedgerBtn');
        if (content && content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            const chevron = document.getElementById('ledgerChevron');
            if (chevron) chevron.style.transform = 'rotate(180deg)';
            if (emiBarChart) emiBarChart.resize();
        }
        if (toggleBtn) toggleBtn.scrollIntoView({ behavior: 'smooth' });
    });

    safeAddListener('triggerSimulateBtn', 'click', () => {
        const simInput = document.getElementById('simulationInput');
        const display = document.getElementById('simulationBenefitDisplay');
        if (!simInput || !display) return;

        const simAmt = Math.max(0, parseFloat(simInput.value) || 0);

        if (simAmt <= 0) {
            showNotification("Please enter a valid price to simulate.");
            return;
        }

        const incomeVal = document.getElementById('incomeInput');
        const billsVal = document.getElementById('billsInput');
        const savingsVal = document.getElementById('savingsInput');
        const daysRemainingInput = document.getElementById('daysRemainingInput');

        const income = Math.max(0, parseFloat(incomeVal ? incomeVal.value : 0) || 0);
        const bills = Math.max(0, parseFloat(billsVal ? billsVal.value : 0) || 0);
        const savings = Math.max(0, parseFloat(savingsVal ? savingsVal.value : 0) || 0);

        const infPercentInput = document.getElementById('inflationInput');
        const infPercent = Math.max(0, parseFloat(infPercentInput ? infPercentInput.value : 0) || 0);
        const inflationCushion = bills * (infPercent / 100);
        
        const emergencyInput = document.getElementById('emergencyInput');
        const emergencyReserve = Math.max(0, parseFloat(emergencyInput ? emergencyInput.value : 0) || 0);
        
        const windfallInput = document.getElementById('windfallInput');
        const windfalls = Math.max(0, parseFloat(windfallInput ? windfallInput.value : 0) || 0);
        
        const plannedInput = document.getElementById('plannedSpendInput');
        const plannedSpend = Math.max(0, parseFloat(plannedInput ? plannedInput.value : 0) || 0);

        const totalCommitments = bills + savings + inflationCushion + emergencyReserve + plannedSpend;
        const daysRemaining = Math.max(1, parseInt(daysRemainingInput ? daysRemainingInput.value : 1) || 1);

        const outlaysSum = loggedExpenses.reduce((acc, curr) => acc + curr.amt, 0);

        const initialSurplus = Math.max(0, (income + windfalls) - totalCommitments);
        const remainingSpendPool = Math.max(0, initialSurplus - outlaysSum);
        const currentDaily = remainingSpendPool / daysRemaining;

        const simulatedCash = Math.max(0, remainingSpendPool - simAmt);
        const simulatedDaily = simulatedCash / daysRemaining;
        const percentageDrop = currentDaily > 0 ? ((currentDaily - simulatedDaily) / currentDaily) * 100 : 0;

        if (simAmt > remainingSpendPool) {
            display.innerHTML = `⚠️ <span class="text-red-750 font-extrabold">BUDGET CRASH!</span> Buying this item for ${formatCurrency(simAmt)} immediately wipes out your available spending pool and eats into savings target or bills!`;
        } else {
            display.innerHTML = `📉 <span class="text-blue-900 font-extrabold">Daily Limit Drops by -${Math.round(percentageDrop)}%!</span> Buying this today shrinks your Safe-to-Spend allowance from ${formatCurrency(currentDaily)} to ${formatCurrency(simulatedDaily)} / Day for the next ${daysRemaining} days.`;
        }
    });

    safeAddListener('toggleLedgerBtn', 'click', () => {
        const content = document.getElementById('ledgerContent');
        if (content) {
            const isHidden = content.classList.toggle('hidden');
            const chevron = document.getElementById('ledgerChevron');
            if (chevron) chevron.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
            if (!isHidden && emiBarChart) {
                emiBarChart.resize();
            }
        }
    });

    safeAddListener('exportCsvBtn', 'click', exportToCSV);
    safeAddListener('printPdfBtn', 'click', () => window.print());

    const modal = document.getElementById('shareModal');
    safeAddListener('shareReportBtn', 'click', () => {
        const incomeInput = document.getElementById('incomeInput');
        const billsInput = document.getElementById('billsInput');
        const savingsInput = document.getElementById('savingsInput');
        if (!incomeInput || !billsInput || !savingsInput) return;

        const params = new URLSearchParams();
        params.set('income', incomeInput.value);
        params.set('bills', billsInput.value);
        params.set('savings', savingsInput.value);
        params.set('curr', selectedCurrency);
        
        const buffersToggle = document.getElementById('buffersToggle');
        const extraBuffersActive = buffersToggle ? buffersToggle.checked : false;
        if (extraBuffersActive) {
            params.set('eb', 'true');
            const inflationInput = document.getElementById('inflationInput');
            const emergencyInput = document.getElementById('emergencyInput');
            const windfallInput = document.getElementById('windfallInput');
            const plannedSpendInput = document.getElementById('plannedSpendInput');

            if (inflationInput) params.set('inf', inflationInput.value);
            if (emergencyInput) params.set('emg', emergencyInput.value);
            if (windfallInput) params.set('wnd', windfallInput.value);
            if (plannedSpendInput) params.set('pln', plannedSpendInput.value);
        }

        const loggerToggle = document.getElementById('loggerToggle');
        if (loggerToggle && loggerToggle.checked) {
            params.set('el', 'true');
        }
        
        const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        const shareUrlInput = document.getElementById('shareUrlInput');
        if (shareUrlInput) shareUrlInput.value = shareUrl;

        const incomeVal = formatCurrency(parseFloat(incomeInput.value));
        const billsVal = formatCurrency(parseFloat(billsInput.value));
        const savingsVal = formatCurrency(parseFloat(savingsInput.value));
        const maturityValue = document.getElementById('maturityValue');
        const mainTargetVal = maturityValue ? maturityValue.textContent.split(" / ")[0] : '';
        const totalCommitmentsDisp = document.getElementById('totalCommitmentsDisp');
        const totalC = totalCommitmentsDisp ? totalCommitmentsDisp.textContent : '';
        const availableSurplusDisp = document.getElementById('availableSurplusDisp');
        const totalR = availableSurplusDisp ? availableSurplusDisp.textContent : '';

        let extraReportHtml = '';
        if (extraBuffersActive) {
            const stepUpVal = document.getElementById('inflationInput')?.value || '0';
            const morMonths = document.getElementById('emergencyInput')?.value || '0';
            const windfallVal = document.getElementById('windfallInput')?.value || '0';
            const plannedSpendVal = document.getElementById('plannedSpendInput')?.value || '0';

            if (parseFloat(stepUpVal) > 0) extraReportHtml += `<li class="flex justify-between border-b border-slate-700 pb-1"><span class="text-xxs text-indigo-200">Price Increase Cushion:</span><span class="text-xxs font-extrabold text-white">${stepUpVal}%</span></li>`;
            if (parseInt(morMonths) > 0) extraReportHtml += `<li class="flex justify-between border-b border-slate-700 pb-1"><span class="text-xxs text-indigo-200">Emergency Reserves:</span><span class="text-xxs font-extrabold text-white">${formatCurrency(morMonths)}</span></li>`;
            if (parseFloat(windfallVal) > 0) extraReportHtml += `<li class="flex justify-between border-b border-slate-700 pb-1"><span class="text-xxs text-indigo-200">Unexpected Inflows:</span><span class="text-xxs font-extrabold text-white">${formatCurrency(windfallVal)}</span></li>`;
            if (parseFloat(plannedSpendVal) > 0) extraReportHtml += `<li class="flex justify-between border-b border-slate-700 pb-1"><span class="text-xxs text-indigo-200">Upcoming Planned Spend:</span><span class="text-xxs font-extrabold text-white">${formatCurrency(plannedSpendVal)}</span></li>`;
        }

        const reportHtml = `
            <div class="space-y-4 text-left">
                <div class="text-center bg-slate-800/50 p-3.5 rounded-xl border border-slate-700 shadow-inner">
                    <span class="text-[9px] text-indigo-400 font-extrabold uppercase tracking-widest block mb-0.5">Recommended Allowance</span>
                    <span class="text-2xl font-black text-emerald-400">${mainTargetVal}</span>
                    <span class="text-[10px] text-slate-400 block mt-0.5">Securely calculated for the rest of your cycle</span>
                </div>
                <ul class="flex flex-col gap-2 mt-1">
                    <li class="flex justify-between border-b border-slate-800 pb-1">
                        <span class="text-xxs text-slate-300">Net Monthly Income:</span> 
                        <span class="text-xxs font-extrabold text-white">${incomeVal}</span>
                    </li>
                    <li class="flex justify-between border-b border-slate-800 pb-1">
                        <span class="text-xxs text-slate-300">Fixed Commitments:</span> 
                        <span class="text-xxs font-extrabold text-white">${billsVal}</span>
                    </li>
                    <li class="flex justify-between border-b border-slate-800 pb-1">
                        <span class="text-xxs text-slate-300">Savings Target:</span> 
                        <span class="text-xxs font-extrabold text-white">${savingsVal}</span>
                    </li>
                    ${extraReportHtml}
                    <li class="flex justify-between border-b border-slate-800 pb-1">
                        <span class="text-xxs text-slate-300">Total Commitments:</span> 
                        <span class="text-xxs font-extrabold text-white">${totalC}</span>
                    </li>
                    <li class="flex justify-between border-b border-slate-800 pb-1">
                        <span class="text-xxs text-slate-300">Remaining Spending Pool:</span> 
                        <span class="text-xxs font-extrabold text-emerald-400">${totalR}</span>
                    </li>
                </ul>
            </div>
        `;

        const modalReportContent = document.getElementById('modalReportContent');
        if (modalReportContent) modalReportContent.innerHTML = reportHtml;
        if (modal) modal.classList.add('active');
    });

    safeAddListener('closeModalBtn', 'click', () => {
        if (modal) modal.classList.remove('active');
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal && modal) {
            modal.classList.remove('active');
        }
    });

    document.getElementById('copyUrlBtn').addEventListener('click', () => {
        try {
            const shareUrlInput = document.getElementById('shareUrlInput');
            if (shareUrlInput) {
                shareUrlInput.select();
                document.execCommand('copy');
                showNotification('Link copied to clipboard!');
            }
        } catch (err) {
            console.error('Copy failed:', err);
            showNotification('Could not copy link.');
        }
    });

    document.getElementById('copyWhatsAppBtn').addEventListener('click', () => {
        const incomeInput = document.getElementById('incomeInput');
        const billsInput = document.getElementById('billsInput');
        const savingsInput = document.getElementById('savingsInput');
        const daysRemainingInput = document.getElementById('daysRemainingInput');
        const maturityValue = document.getElementById('maturityValue');

        if (!incomeInput || !billsInput || !savingsInput || !daysRemainingInput || !maturityValue) return;

        const incomeVal = parseFloat(incomeInput.value) || 0;
        const billsVal = parseFloat(billsInput.value) || 0;
        const savingsVal = parseFloat(savingsInput.value) || 0;
        const daysLeft = parseInt(daysRemainingInput.value) || 1;
        const limitStr = maturityValue.textContent.split(" / ")[0];
        
        let text = `🛡️ *Daily Safe-to-Spend (STS) Budget Audit*\n`;
        text += `===============================\n\n`;
        text += `💰 *Monthly Setup:*\n`;
        text += `• Net Income: ${formatCurrency(incomeVal)}\n`;
        text += `• Bills & Rent: ${formatCurrency(billsVal)}\n`;
        text += `• Savings Goal: ${formatCurrency(savingsVal)}\n\n`;
        
        const buffersToggle = document.getElementById('buffersToggle');
        const extraBuffersActive = buffersToggle ? buffersToggle.checked : false;
        if (extraBuffersActive) {
            text += `🛡️ *Active Safety Buffers:*\n`;
            const inflationInput = document.getElementById('inflationInput');
            const emergencyInput = document.getElementById('emergencyInput');
            const windfallInput = document.getElementById('windfallInput');
            const plannedSpendInput = document.getElementById('plannedSpendInput');

            const inflationPct = parseFloat(inflationInput ? inflationInput.value : 0) || 0;
            const emergency = parseFloat(emergencyInput ? emergencyInput.value : 0) || 0;
            const windfall = parseFloat(windfallInput ? windfallInput.value : 0) || 0;
            const planned = parseFloat(plannedSpendInput ? plannedSpendInput.value : 0) || 0;
            
            if (inflationPct > 0) text += `• Inflation Cushion: ${inflationPct}% (${formatCurrency(billsVal * (inflationPct / 100))})\n`;
            if (emergency > 0) text += `• Emergency Reserves: ${formatCurrency(emergency)}\n`;
            if (windfall > 0) text += `• Unexpected Inflows: ${formatCurrency(windfall)}\n`;
            if (planned > 0) text += `• Upcoming Planned Spends: ${formatCurrency(planned)}\n`;
            text += `\n`;
        }
        
        const totalCommitmentsDisp = document.getElementById('totalCommitmentsDisp');
        const availableSurplusDisp = document.getElementById('availableSurplusDisp');
        const commitmentsText = totalCommitmentsDisp ? totalCommitmentsDisp.textContent : '';
        const remainingText = availableSurplusDisp ? availableSurplusDisp.textContent : '';
        
        text += `📊 *Active Totals:*\n`;
        text += `• Total Commitments: ${commitmentsText}\n`;
        text += `• Remaining Spend Pool: ${remainingText}\n\n`;
        text += `🔥 *Today's Safe Quota:*\n`;
        text += `👉 *${limitStr} / Day* (safely for next ${daysLeft} days)\n\n`;
        text += `_Secure your monthly financial goals with toolblaster.com_`;

        const el = document.createElement('textarea');
        el.value = text;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        const copied = document.execCommand('copy');
        document.body.removeChild(el);

        if (copied) {
            showNotification('WhatsApp text copied to clipboard successfully!');
        } else {
            showNotification('Failed to copy text. Try selecting manually.');
        }
    });

    document.getElementById('downloadImageBtn').addEventListener('click', () => {
        const card = document.getElementById('shareReportCard');
        if (!card) return;
        
        showNotification('Generating high-res image...');

        html2canvas(card, {
            scale: 3, 
            backgroundColor: null, 
            logging: false,
            useCORS: true
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = imgData;
            link.download = `Safe-to-Spend-Report-${new Date().toISOString().split('T')[0]}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showNotification('Image downloaded successfully!');
        }).catch(err => {
            console.error('Error generating image:', err);
            showNotification('Error rendering image card. Try copying text!');
        });
    });

    const inputElements = ['inflationInput', 'emergencyInput', 'windfallInput', 'plannedSpendInput'];
    inputElements.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) {
            elem.addEventListener('input', () => {
                let val = parseFloat(elem.value);
                if (val < 0) {
                    elem.value = 0;
                }
                triggerCalculation();
            });
            elem.addEventListener('blur', () => {
                let val = parseFloat(elem.value);
                if (isNaN(val) || val < 0) {
                    elem.value = 0;
                }
                triggerCalculation();
            });
        }
    });

    loadFromUrl();
});

function showNotification(msg) {
    const toast = document.getElementById('notification-toast');
    if (toast) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}