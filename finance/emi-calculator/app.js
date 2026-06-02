/**
 * EMI Calculator Application Logic
 * Integrates comprehensive loan amortization calculators, custom date logic,
 * visual data analysis charts, export routines, and high-fidelity print mappings.
 */

const configPresets = {
    'tab-home':     { minP: 500000, maxP: 50000000, valP: 3000000, stepP: 5000, minR: 7,   maxR: 15, valR: 8.5,  minT: 1, maxT: 30, valT: 20, stepT: 1, type: 'Y' },
    'tab-car':      { minP: 100000, maxP: 5000000,  valP: 800000,  stepP: 5000, minR: 8,   maxR: 18, valR: 9.5,  minT: 1, maxT: 7,  valT: 5,  stepT: 1, type: 'Y' },
    'tab-bike':     { minP: 20000,  maxP: 500000,   valP: 120000,  stepP: 1000,  minR: 9,   maxR: 24, valR: 12.5, minT: 1, maxT: 5,  valT: 3,  stepT: 1, type: 'Y' },
    'tab-personal': { minP: 50000,  maxP: 4000000,  valP: 500000,  stepP: 2000,  minR: 10,  maxR: 28, valR: 14.5, minT: 1, maxT: 5,  valT: 3,  stepT: 1, type: 'Y' },
    'tab-mobile':   { minP: 5000,   maxP: 200000,   valP: 45000,   stepP: 500,  minR: 0,   maxR: 35, valR: 16,   minT: 3, maxT: 36, valT: 12, stepT: 3, type: 'M' }
};

const eligibilityLimits = {
    'tab-home':     { minE: 5000, maxE: 500000, valE: 30000, stepE: 1000 },
    'tab-car':      { minE: 2000, maxE: 150000, valE: 15000, stepE: 500 },
    'tab-bike':     { minE: 1000, maxE: 30000,  valE: 5000,  stepE: 250 },
    'tab-personal': { minE: 20000, maxE: 200000, valE: 15000, stepE: 500 }, // Typo '20Q00' fixed to '20000'
    'tab-mobile':   { minE: 500,  maxE: 25000,  valE: 4000,  stepE: 250 }
};

let currentActiveTab = 'tab-home';
let emiDoughnutChart;
let emiBarChart;
let isPowerUserActive = false;
let selectedTaxRegime = 'old'; 
let cachedSchedule = [];
let isEligibilityMode = false; 
let ledgerViewMode = 'month';

// --- Utility Functions ---

function formatCurrency(num) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(num));
}

function convertToIndianWords(value) {
    if (isNaN(value) || value <= 0) return "";
    if (value >= 10000000) return `(₹${(value / 10000000).toFixed(2)} Crore)`;
    if (value >= 100000) return `(₹${(value / 100000).toFixed(2)} Lakh)`;
    if (value >= 1000) return `(₹${(value / 1000).toFixed(1)} K)`;
    return `(₹${value})`;
}

function updateSliderFill(slider) {
    if (!slider) return;
    const percentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty('--fill-percentage', `${percentage}%`);
}

function showNotification(message) {
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
}

// --- Repayment Compounding Calculations ---

function triggerCalculation() {
    const rawP = Math.max(0, parseFloat(document.getElementById('loanAmountInput').value) || 0);
    const annualR = Math.max(0, parseFloat(document.getElementById('loanInterestInput').value) || 0);
    const T = Math.max(1, parseFloat(document.getElementById('loanTenureInput').value) || 1);

    const isMonthlyTenure = configPresets[currentActiveTab].type === 'M';
    const totalMonths = isMonthlyTenure ? T : T * 12;
    const baseMonthlyR = (annualR / 12) / 100;

    let basicP = rawP;
    let targetEmi = 0;

    // Check Eligibility vs Calculate Standard EMI Mode
    if (isEligibilityMode) {
        const E = rawP;
        if (baseMonthlyR === 0) {
            basicP = E * totalMonths;
        } else {
            basicP = E * (Math.pow(1 + baseMonthlyR, totalMonths) - 1) / (baseMonthlyR * Math.pow(1 + baseMonthlyR, totalMonths));
        }
        targetEmi = E;
    } else {
        if (basicP > 0) {
            if (baseMonthlyR === 0) {
                targetEmi = basicP / totalMonths;
            } else {
                targetEmi = basicP * baseMonthlyR * Math.pow(1 + baseMonthlyR, totalMonths) / (Math.pow(1 + baseMonthlyR, totalMonths) - 1);
            }
        }
    }

    let ancillaryCostPct = 0;
    let stepUpRate = 0;
    let moratoriumMonths = 0;
    let rateShockAmount = 0;
    let rateShockYear = 3;
    let recurringPrepayment = 0;
    let lumpsumPrepayment = 0;
    let lumpsumYear = 2;

    if (isPowerUserActive) {
        ancillaryCostPct = Math.max(0, parseFloat(document.getElementById('ancillaryCostInput').value) || 0);
        stepUpRate = isEligibilityMode ? 0 : Math.max(0, parseFloat(document.getElementById('stepUpRateInput').value) || 0);
        moratoriumMonths = Math.max(0, parseInt(document.getElementById('moratoriumInput').value) || 0);
        rateShockAmount = Math.max(0, parseFloat(document.getElementById('rateShockAmountInput').value) || 0);
        rateShockYear = Math.max(1, parseInt(document.getElementById('rateShockYearInput').value) || 3);
        recurringPrepayment = Math.max(0, parseFloat(document.getElementById('recurringPrepayInput').value) || 0);
        lumpsumPrepayment = Math.max(0, parseFloat(document.getElementById('lumpsumPrepayInput').value) || 0);
        lumpsumYear = Math.max(1, parseInt(document.getElementById('lumpsumPrepayYearInput').value) || 2);
    }

    const P = basicP * (1 + (ancillaryCostPct / 100));
    const shockedAnnualR = annualR + rateShockAmount;
    const shockedMonthlyR = (shockedAnnualR / 12) / 100;

    let remainingBalance = P;
    let totalInterestPaid = 0;
    let schedule = [];
    let activeEmi = targetEmi;
    let finalMonthsElapsed = 0;

    // Moratorium skipped term calculation
    if (moratoriumMonths > 0 && moratoriumMonths < totalMonths) {
        for (let m = 1; m <= moratoriumMonths; m++) {
            let interestThisMonth = remainingBalance * baseMonthlyR;
            remainingBalance += interestThisMonth;
            totalInterestPaid += interestThisMonth;
            schedule.push({
                month: m,
                principalRepaid: 0,
                interestCharged: interestThisMonth,
                totalPaid: 0,
                balance: remainingBalance
            });
        }

        const remainingMonths = totalMonths - moratoriumMonths;
        if (baseMonthlyR === 0) {
            activeEmi = remainingBalance / remainingMonths;
        } else {
            activeEmi = remainingBalance * baseMonthlyR * Math.pow(1 + baseMonthlyR, remainingMonths) / (Math.pow(1 + baseMonthlyR, remainingMonths) - 1);
        }
    }

    const startMonth = moratoriumMonths + 1;
    let currentEmiPaid = activeEmi;

    // Main Amortization Loop execution
    for (let m = startMonth; m <= totalMonths; m++) {
        if (remainingBalance <= 0) break;

        finalMonthsElapsed = m;

        let currentMonthlyR = baseMonthlyR;
        if (rateShockAmount > 0 && m > (rateShockYear * 12)) {
            currentMonthlyR = shockedMonthlyR;
        }

        // Apply Step-Up rate annually
        if (stepUpRate > 0 && m > startMonth && ((m - startMonth) % 12 === 0)) {
            currentEmiPaid = currentEmiPaid * (1 + (stepUpRate / 100));
        }

        let interestThisMonth = remainingBalance * currentMonthlyR;
        let principalThisMonth = currentEmiPaid - interestThisMonth;

        let extraPrincipalRepayment = 0;
        if (recurringPrepayment > 0 && m > startMonth && ((m - startMonth) % 12 === 0)) {
            extraPrincipalRepayment += recurringPrepayment;
        }
        if (lumpsumPrepayment > 0 && m === (lumpsumYear * 12)) {
            extraPrincipalRepayment += lumpsumPrepayment;
        }

        principalThisMonth += extraPrincipalRepayment;

        if (principalThisMonth > remainingBalance) {
            principalThisMonth = remainingBalance;
            currentEmiPaid = principalThisMonth + interestThisMonth;
        } else {
            currentEmiPaid = (currentEmiPaid - extraPrincipalRepayment) + principalThisMonth;
        }

        remainingBalance -= principalThisMonth;
        totalInterestPaid += interestThisMonth;

        schedule.push({
            month: m,
            principalRepaid: principalThisMonth,
            interestCharged: interestThisMonth,
            totalPaid: currentEmiPaid,
            balance: Math.max(0, remainingBalance)
        });
    }

    cachedSchedule = schedule;

    // Configure analytical visual savings advisory badge
    const powerSavingsBadge = document.getElementById('powerSavingsBadge');
    if (isPowerUserActive && (stepUpRate > 0 || moratoriumMonths > 0 || recurringPrepayment > 0 || lumpsumPrepayment > 0)) {
        powerSavingsBadge.classList.remove('hidden');
        
        let normalInterest = 0;
        if (baseMonthlyR === 0) {
            normalInterest = 0;
        } else {
            const normalTotalRepayment = activeEmi * (totalMonths - moratoriumMonths);
            normalInterest = Math.max(0, normalTotalRepayment - P);
        }

        if ((stepUpRate > 0 || recurringPrepayment > 0 || lumpsumPrepayment > 0) && finalMonthsElapsed < totalMonths) {
            const monthsSaved = totalMonths - finalMonthsElapsed;
            const yearsSaved = Math.floor(monthsSaved / 12);
            const remainingMonthsSaved = monthsSaved % 12;
            let tenureSavedText = "";
            if (yearsSaved > 0) {
                tenureSavedText += `${yearsSaved} Year${yearsSaved > 1 ? 's' : ''} `;
            }
            if (remainingMonthsSaved > 0 || yearsSaved === 0) {
                tenureSavedText += `${remainingMonthsSaved} Month${remainingMonthsSaved !== 1 ? 's' : ''}`;
            }

            const interestSaved = Math.max(0, normalInterest - totalInterestPaid);
            powerSavingsBadge.innerHTML = `🚀 <strong>Foreclosure Accelerator Active!</strong> Interest Saved: <span class="font-black text-white px-1.5 py-0.5 rounded bg-emerald-800">${formatCurrency(interestSaved)}</span> | Tenure Reduced: <span class="font-black text-white px-1.5 py-0.5 rounded bg-indigo-900">${tenureSavedText}</span>`;
        } else if (moratoriumMonths > 0) {
            powerSavingsBadge.innerHTML = `🏖️ <strong>Moratorium Active!</strong> Skipping ${moratoriumMonths} months added <span class="font-extrabold">${formatCurrency(totalInterestPaid - normalInterest)}</span> to your total interest.`;
        } else {
            powerSavingsBadge.classList.add('hidden');
        }
    } else {
        powerSavingsBadge.classList.add('hidden');
    }

    // Update screen summaries
    document.getElementById('totalInvestment').textContent = formatCurrency(P);
    document.getElementById('totalInterest').textContent = formatCurrency(totalInterestPaid);
    
    let finalEmiOutput = activeEmi;
    if (isEligibilityMode) {
        document.getElementById('targetValueCardTitle').textContent = "Eligible Loan Principal";
        document.getElementById('maturityValue').textContent = formatCurrency(basicP);
        finalEmiOutput = targetEmi;
    } else {
        document.getElementById('targetValueCardTitle').textContent = "Calculated Monthly Loan EMI";
        document.getElementById('maturityValue').textContent = `${formatCurrency(activeEmi)} / Month`;
    }

    // Tax Benefit Calculator Logic
    const taxBenefitCard = document.getElementById('taxBenefitCard');
    let totalTaxSaved = 0;
    let interestTaxSaved = 0;
    let principalTaxSaved = 0;

    if (currentActiveTab === 'tab-home' && selectedTaxRegime === 'old') {
        taxBenefitCard.style.display = 'flex';
        const avgAnnualInterest = Math.min(200000, totalInterestPaid / (totalMonths / 12));
        interestTaxSaved = avgAnnualInterest * 0.312;

        const avgAnnualPrincipal = Math.min(150000, P / (totalMonths / 12));
        principalTaxSaved = avgAnnualPrincipal * 0.312;

        totalTaxSaved = interestTaxSaved + principalTaxSaved;

        document.getElementById('taxBenefitDetails').innerHTML = `Sec 24b: ${formatCurrency(interestTaxSaved)} | Sec 80C: ${formatCurrency(principalTaxSaved)}`;
        document.getElementById('taxBenefitDisplay').textContent = formatCurrency(totalTaxSaved);
    } else {
        taxBenefitCard.style.display = 'none';
    }

    // Debt Affordability Ratio Logic
    const monthlyIncome = Math.max(0, parseFloat(document.getElementById('monthlyIncomeInput').value) || 0);
    const affordabilityBadge = document.getElementById('affordabilityBadge');
    
    if (monthlyIncome > 0 && finalEmiOutput > 0) {
        const ratio = (finalEmiOutput / monthlyIncome) * 100;
        let statusText = "";
        let badgeClass = "";

        if (ratio < 30) {
            statusText = `🟢 Safe (${ratio.toFixed(1)}% of Income)`;
            badgeClass = "bg-green-100 text-green-900 border border-green-300";
        } else if (ratio >= 30 && ratio <= 50) {
            statusText = `🟡 Moderate (${ratio.toFixed(1)}% of Income)`;
            badgeClass = "bg-amber-100 text-amber-950 border border-amber-300";
        } else {
            statusText = `🔴 Risky (${ratio.toFixed(1)}% of Income)`;
            badgeClass = "bg-red-100 text-red-950 border border-red-300";
        }
        affordabilityBadge.innerHTML = `${statusText} — Debt Servicing Ratio`;
        affordabilityBadge.className = `p-2 rounded-xl text-center font-bold text-xxs transition-all duration-200 ${badgeClass}`;
        affordabilityBadge.style.display = "block";
    } else {
        affordabilityBadge.style.display = "none";
    }

    // Sync charts & schedule tables
    updateVisualizationCharts(P, totalInterestPaid, schedule, isMonthlyTenure);
    renderAmortizationLedger(schedule);

    // Sync print fields (PDF Mapping)
    document.getElementById('printEMIValue').textContent = `${formatCurrency(activeEmi)} / Month`;
    document.getElementById('printTotalPrincipal').textContent = formatCurrency(P);
    document.getElementById('printTotalInterest').textContent = formatCurrency(totalInterestPaid);
    document.getElementById('printTotalOutflow').textContent = formatCurrency(P + totalInterestPaid);

    if (currentActiveTab === 'tab-home' && selectedTaxRegime === 'old') {
        document.getElementById('printRowTax').classList.remove('hidden');
        document.getElementById('printTaxSaved').textContent = formatCurrency(totalTaxSaved);
    } else {
        document.getElementById('printRowTax').classList.add('hidden');
    }

    // Populate Print Parameters
    const printCat = document.getElementById('printLoanCategory');
    if (printCat) printCat.textContent = document.getElementById(currentActiveTab).textContent;
    
    const printReqP = document.getElementById('printRequestedPrincipal');
    if (printReqP) printReqP.textContent = formatCurrency(rawP);
    
    const printIR = document.getElementById('printInterestRate');
    if (printIR) printIR.textContent = `${annualR}% p.a.`;
    
    const printTen = document.getElementById('printTenure');
    if (printTen) printTen.textContent = T + (isMonthlyTenure ? " Months" : " Years");

    const showOrHidePrintRow = (rowId, valId, value, cond) => {
        const row = document.getElementById(rowId);
        const val = document.getElementById(valId);
        if (row && val) {
            if (cond) {
                row.classList.remove('hidden');
                val.textContent = value;
            } else {
                row.classList.add('hidden');
            }
        }
    };

    showOrHidePrintRow('printRowAncillary', 'printAncillary', `${ancillaryCostPct}% (₹${Math.round(basicP * ancillaryCostPct / 100)})`, ancillaryCostPct > 0);
    showOrHidePrintRow('printRowStepUp', 'printStepUp', `${stepUpRate}%`, stepUpRate > 0 && !isEligibilityMode);
    showOrHidePrintRow('printRowMoratorium', 'printMoratorium', `${moratoriumMonths} Months`, moratoriumMonths > 0);
    showOrHidePrintRow('printRowRateShock', 'printRateShock', `+${rateShockAmount}% starting Year ${rateShockYear}`, rateShockAmount > 0);
    showOrHidePrintRow('printRowPrepayments', 'printPrepaymentsApplied', 
        (recurringPrepayment > 0 ? `Recurring: ${formatCurrency(recurringPrepayment)}/yr` : "") + 
        (recurringPrepayment > 0 && lumpsumPrepayment > 0 ? " | " : "") + 
        (lumpsumPrepayment > 0 ? `One-time: ${formatCurrency(lumpsumPrepayment)} in Yr ${lumpsumYear}` : ""), 
        recurringPrepayment > 0 || lumpsumPrepayment > 0
    );
}

// --- Graphical Rendering with Chart.js ---

function updateVisualizationCharts(P, totalInterestPaid, schedule, isMonthlyTenure) {
    const graphContainer = document.getElementById('emiDoughnutChart');
    const chartData = [P, totalInterestPaid];
    
    // Doughnut Split Chart
    if (emiDoughnutChart) {
        emiDoughnutChart.data.datasets[0].data = chartData;
        emiDoughnutChart.update();
    } else {
        emiDoughnutChart = new Chart(graphContainer.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Principal Amount', 'Total Interest'],
                datasets: [{ data: chartData, backgroundColor: ['#2563EB', '#16A34A'], hoverOffset: 4 }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                let value = context.parsed || 0;
                                return label + ': ' + formatCurrency(value);
                            }
                        }
                    }
                } 
            }
        });
    }

    if (emiBarChart) {
        emiBarChart.destroy();
    }

    const barLabels = [];
    const barPrincipal = [];
    const barInterest = [];

    // Map schedule data to bar chart labels
    if (isMonthlyTenure) {
        schedule.forEach(row => {
            barLabels.push(`Month ${row.month}`);
            barPrincipal.push(row.principalRepaid);
            barInterest.push(row.interestCharged);
        });
    } else {
        let fyMap = {};
        const startMonthZeroBased = parseInt(document.getElementById('loanStartMonth').value);
        const startYear = parseInt(document.getElementById('loanStartYear').value);

        schedule.forEach(row => {
            let currentMonthIndex = startMonthZeroBased + row.month - 1;
            let calendarMonth = currentMonthIndex % 12;
            let calendarYear = startYear + Math.floor(currentMonthIndex / 12);
            let fiscalYearStart = (calendarMonth >= 3) ? calendarYear : calendarYear - 1;
            let fyLabel = `FY ${fiscalYearStart}-${String(fiscalYearStart + 1).slice(-2)}`;

            if (!fyMap[fyLabel]) {
                fyMap[fyLabel] = { principal: 0, interest: 0 };
            }
            fyMap[fyLabel].principal += row.principalRepaid;
            fyMap[fyLabel].interest += row.interestCharged;
        });

        Object.keys(fyMap).forEach(key => {
            barLabels.push(key);
            barPrincipal.push(fyMap[key].principal);
            barInterest.push(fyMap[key].interest);
        });
    }

    const barCtx = document.getElementById('emiBarChart').getContext('2d');
    emiBarChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: barLabels,
            datasets: [
                {
                    label: 'Principal Paid',
                    data: barPrincipal,
                    backgroundColor: '#2563EB',
                    borderRadius: 4
                },
                {
                    label: 'Interest Charged',
                    data: barInterest,
                    backgroundColor: '#16A34A',
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
                            return new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short' }).format(value);
                        }
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            let value = context.raw || 0;
                            return label + ': ' + formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

// --- Amortization Repayment Ledger Generation ---

function renderAmortizationLedger(schedule) {
    const tableBody = document.getElementById('ledgerTableBody');
    const printTableBody = document.getElementById('printLedgerBody');
    const totalRowsBadge = document.getElementById('totalRowsBadge');
    const scrollNoticeBadge = document.getElementById('scrollNoticeBadge');
    
    tableBody.innerHTML = '';
    printTableBody.innerHTML = '';

    if (schedule.length === 0) {
        totalRowsBadge.textContent = "0 rows";
        scrollNoticeBadge.textContent = "";
        return;
    }

    const startMonthZeroBased = parseInt(document.getElementById('loanStartMonth').value);
    const startYear = parseInt(document.getElementById('loanStartYear').value);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const isMonthlyTenure = configPresets[currentActiveTab].type === 'M';

    if (ledgerViewMode === 'year' && !isMonthlyTenure) {
        document.getElementById('ledgerPeriodHeader').textContent = "Year";
        document.getElementById('ledgerTotalHeader').textContent = "Total Payment";
        document.getElementById('ledgerBalanceHeader').textContent = "Balance";

        let fyMap = {};

        schedule.forEach(row => {
            let currentMonthIndex = startMonthZeroBased + row.month - 1;
            let calendarMonth = currentMonthIndex % 12;
            let calendarYear = startYear + Math.floor(currentMonthIndex / 12);
            let fiscalYearStart = (calendarMonth >= 3) ? calendarYear : calendarYear - 1;
            let fyLabel = `FY ${fiscalYearStart}-${String(fiscalYearStart + 1).slice(-2)}`;

            if (!fyMap[fyLabel]) {
                fyMap[fyLabel] = {
                    label: fyLabel,
                    principalPaid: 0,
                    interestCharged: 0,
                    totalOutflow: 0,
                    finalBalance: 0
                };
            }

            fyMap[fyLabel].principalPaid += row.principalRepaid;
            fyMap[fyLabel].interestCharged += row.interestCharged;
            fyMap[fyLabel].totalOutflow += row.totalPaid;
            fyMap[fyLabel].finalBalance = row.balance;
        });

        const keys = Object.keys(fyMap);
        totalRowsBadge.textContent = `Showing all ${keys.length} Fiscal Years`;
        
        if (keys.length > 8) {
            scrollNoticeBadge.textContent = "Scroll inside table to view all rows 👇";
        } else {
            scrollNoticeBadge.textContent = "";
        }

        keys.forEach(key => {
            const fy = fyMap[key];
            const rowHtml = `
                <td class="p-3 font-semibold text-gray-900">${fy.label}</td>
                <td class="p-3">${formatCurrency(fy.principalPaid)}</td>
                <td class="p-3 text-red-900">${formatCurrency(fy.interestCharged)}</td>
                <td class="p-3 font-medium">${formatCurrency(fy.totalOutflow)}</td>
                <td class="p-3 text-indigo-900 font-bold">${formatCurrency(fy.finalBalance)}</td>
            `;

            const screenTr = document.createElement('tr');
            screenTr.className = "hover:bg-gray-50 border-b border-gray-100 transition-colors";
            screenTr.innerHTML = rowHtml;
            tableBody.appendChild(screenTr);

            const printTr = document.createElement('tr');
            printTr.className = "border-b border-gray-200";
            printTr.innerHTML = rowHtml;
            printTableBody.appendChild(printTr);
        });
    } else {
        document.getElementById('ledgerPeriodHeader').textContent = "Month";
        document.getElementById('ledgerTotalHeader').textContent = "Total Payment";
        document.getElementById('ledgerBalanceHeader').textContent = "Balance";

        totalRowsBadge.textContent = `Showing all ${schedule.length} Months`;
        
        if (schedule.length > 8) {
            scrollNoticeBadge.textContent = "Scroll inside table to view all rows 👇";
        } else {
            scrollNoticeBadge.textContent = "";
        }

        schedule.forEach(row => {
            let currentMonthIndex = startMonthZeroBased + row.month - 1;
            let calendarMonth = currentMonthIndex % 12;
            let calendarYear = startYear + Math.floor(currentMonthIndex / 12);
            const monthDisplay = `${monthNames[calendarMonth]} ${calendarYear}`;

            const rowHtml = `
                <td class="p-3 font-semibold text-gray-900">${monthDisplay}</td>
                <td class="p-3">${formatCurrency(row.principalRepaid)}</td>
                <td class="p-3 text-red-900">${formatCurrency(row.interestCharged)}</td>
                <td class="p-3 font-medium">${formatCurrency(row.totalPaid)}</td>
                <td class="p-3 text-indigo-900 font-bold">${formatCurrency(row.balance)}</td>
            `;
            
            const screenTr = document.createElement('tr');
            screenTr.className = "hover:bg-gray-50 border-b border-gray-100 transition-colors";
            screenTr.innerHTML = rowHtml;
            tableBody.appendChild(screenTr);

            const printTr = document.createElement('tr');
            printTr.className = "border-b border-gray-200";
            printTr.innerHTML = rowHtml;
            printTableBody.appendChild(printTr);
        });
    }
}

// --- Platform Interaction Handlers ---

function switchLoanTab(tabId) {
    currentActiveTab = tabId;
    document.querySelectorAll('.loan-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });
    const clickedButton = document.getElementById(tabId);
    clickedButton.classList.add('active');
    clickedButton.setAttribute('aria-selected', 'true');

    const stepUpInput = document.getElementById('stepUpRateInput');
    if (stepUpInput) {
        if (isEligibilityMode) {
            stepUpInput.value = "0";
            stepUpInput.disabled = true;
            stepUpInput.closest('.card-indigo').classList.add('opacity-40');
        } else {
            stepUpInput.disabled = false;
            stepUpInput.closest('.card-indigo').classList.remove('opacity-40');
        }
    }

    const preset = configPresets[tabId];
    const eligPreset = eligibilityLimits[tabId];
    
    const tenureLabel = document.querySelector('label[for="loanTenureInput"]');
    tenureLabel.textContent = preset.type === 'M' ? 'Repayment Period Tenure (Months)' : 'Repayment Period Tenure (Years)';

    const pLabel = document.getElementById('loanAmountLabel');
    const pSlider = document.getElementById('loanAmountSlider');
    const pInput = document.getElementById('loanAmountInput');
    const pTooltip = document.getElementById('loanAmountTooltipText');

    if (isEligibilityMode) {
        pLabel.textContent = "Target Monthly Budget (₹)";
        pSlider.min = eligPreset.minE; pSlider.max = eligPreset.maxE; pSlider.value = eligPreset.valE; pSlider.step = eligPreset.stepE;
        pInput.min = eligPreset.minE; pInput.max = eligPreset.maxE; pInput.value = eligPreset.valE; pInput.step = eligPreset.stepE;
        document.getElementById('totalInvestmentCardTitle').textContent = "Calculated Sanctioned Principal";
        if (pTooltip) pTooltip.textContent = "Enter your desired target monthly EMI budget. The calculator will reverse-engineer the max eligible loan amount.";
    } else {
        pLabel.textContent = "Sanctioned Principal (₹)";
        pSlider.min = preset.minP; pSlider.max = preset.maxP; pSlider.value = preset.valP; pSlider.step = preset.stepP;
        pInput.min = preset.minP; pInput.max = preset.maxP; pInput.value = preset.valP; pInput.step = preset.stepP;
        document.getElementById('totalInvestmentCardTitle').textContent = "Sanctioned Principal";
        if (pTooltip) pTooltip.textContent = "The sanctioned loan principal capital sanctioned by the lending bank.";
    }

    const iSlider = document.getElementById('loanInterestSlider');
    const iInput = document.getElementById('loanInterestInput');
    iSlider.min = preset.minR; iSlider.max = preset.maxR; iSlider.value = preset.valR;
    iInput.min = preset.minR; iInput.max = preset.maxR; iInput.value = preset.valR;

    const tSlider = document.getElementById('loanTenureSlider');
    const tInput = document.getElementById('loanTenureInput');
    tSlider.min = preset.minT; tSlider.max = preset.maxT; tSlider.value = preset.valT; tSlider.step = preset.stepT;
    tInput.min = preset.minT; tInput.max = preset.maxT; tInput.value = preset.valT; tInput.step = preset.stepT;

    const currentVal = isEligibilityMode ? eligPreset.valE : preset.valP;
    document.getElementById('loanAmountWord').textContent = convertToIndianWords(currentVal);

    updateSliderFill(pSlider);
    updateSliderFill(iSlider);
    updateSliderFill(tSlider);

    triggerCalculation();
}

function setupSyncFramework(sliderId, inputId, decId, incId, wordId) {
    const slider = document.getElementById(sliderId);
    const input = document.getElementById(inputId);
    const dec = document.getElementById(decId);
    const inc = document.getElementById(incId);
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
                document.getElementById(wordId).textContent = convertToIndianWords(val);
            }
            triggerCalculation();
        } else if (!isNaN(val)) {
            if (wordId) {
                document.getElementById(wordId).textContent = convertToIndianWords(val);
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
            document.getElementById(wordId).textContent = convertToIndianWords(sanitizedVal);
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
            document.getElementById(wordId).textContent = convertToIndianWords(parseFloat(input.value));
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
            document.getElementById(wordId).textContent = convertToIndianWords(parseFloat(input.value));
        }
        triggerCalculation();
    });

    updateSliderFill(slider);
}

// --- Data Export Utilities ---

function exportToCSV() {
    if (cachedSchedule.length === 0) return;
    let csvRows = [["Month/Year", "Principal Paid (₹)", "Interest Charged (₹)", "Total Payment (₹)", "Balance (₹)"]];
    
    const startMonthZeroBased = parseInt(document.getElementById('loanStartMonth').value);
    const startYear = parseInt(document.getElementById('loanStartYear').value);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const isMonthlyTenure = configPresets[currentActiveTab].type === 'M';

    if (ledgerViewMode === 'year' && !isMonthlyTenure) {
        let fyMap = {};
        cachedSchedule.forEach(row => {
            let currentMonthIndex = startMonthZeroBased + row.month - 1;
            let calendarMonth = currentMonthIndex % 12;
            let calendarYear = startYear + Math.floor(currentMonthIndex / 12);
            let fiscalYearStart = (calendarMonth >= 3) ? calendarYear : calendarYear - 1;
            let fyLabel = `FY ${fiscalYearStart}-${String(fiscalYearStart + 1).slice(-2)}`;

            if (!fyMap[fyLabel]) {
                fyMap[fyLabel] = { label: fyLabel, principalPaid: 0, interestCharged: 0, totalOutflow: 0, finalBalance: 0 };
            }
            fyMap[fyLabel].principalPaid += row.principalRepaid;
            fyMap[fyLabel].interestCharged += row.interestCharged;
            fyMap[fyLabel].totalOutflow += row.totalPaid;
            fyMap[fyLabel].finalBalance = row.balance;
        });

        Object.keys(fyMap).forEach(key => {
            const fy = fyMap[key];
            csvRows.push([fy.label, Math.round(fy.principalPaid), Math.round(fy.interestCharged), Math.round(fy.totalOutflow), Math.round(fy.finalBalance)]);
        });
    } else {
        cachedSchedule.forEach(row => {
            let currentMonthIndex = startMonthZeroBased + row.month - 1;
            let calendarMonth = currentMonthIndex % 12;
            let calendarYear = startYear + Math.floor(currentMonthIndex / 12);
            const monthDisplay = `${monthNames[calendarMonth]} ${calendarYear}`;
            csvRows.push([monthDisplay, Math.round(row.principalRepaid), Math.round(row.interestCharged), Math.round(row.totalPaid), Math.round(row.balance)]);
        });
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.map(val => typeof val === 'string' ? `"${val}"` : val).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Amortization_Repayment_Schedule_${ledgerViewMode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function initializeDateDropdowns() {
    const startYearSelect = document.getElementById('loanStartYear');
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    startYearSelect.innerHTML = '';
    for (let y = currentYear - 10; y <= currentYear + 25; y++) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        if (y === currentYear) opt.selected = true;
        startYearSelect.appendChild(opt);
    }
    
    document.getElementById('loanStartMonth').value = currentMonth;
}

// --- Load configuration settings from URL parameters ---

function loadFromUrl() {
    const params = new URLSearchParams(window.location.search);
    
    const now = new Date();
    document.getElementById('loanStartYear').value = now.getFullYear();
    document.getElementById('loanStartMonth').value = now.getMonth();

    if (params.has('sd')) {
        const [y, m] = params.get('sd').split('-').map(Number);
        const yearSelect = document.getElementById('loanStartYear');
        const monthSelect = document.getElementById('loanStartMonth');
        
        if (!Array.from(yearSelect.options).some(opt => Number(opt.value) === y)) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            yearSelect.appendChild(opt);
        }
        yearSelect.value = y;
        monthSelect.value = m - 1;
    }

    if (params.get('mode') === 'eligibility') {
        isEligibilityMode = true;
        const modeEmiBtn = document.getElementById('modeEmiBtn');
        const modeEligibleBtn = document.getElementById('modeEligibleBtn');
        modeEmiBtn.className = "flex-1 py-1.5 text-xxs font-bold rounded-lg text-gray-800 text-center transition-all duration-200";
        modeEmiBtn.setAttribute('aria-pressed', 'false');
        modeEligibleBtn.className = "flex-1 py-1.5 text-xxs font-extrabold rounded-lg text-white bg-blue-900 shadow text-center transition-all duration-200";
        modeEligibleBtn.setAttribute('aria-pressed', 'true');
    }

    if (params.has('tab')) {
        const tabId = params.get('tab');
        if (configPresets[tabId]) {
            currentActiveTab = tabId;
        }
    }
    
    switchLoanTab(currentActiveTab);

    if (params.has('p')) {
        document.getElementById('loanAmountInput').value = params.get('p');
        document.getElementById('loanAmountSlider').value = params.get('p');
    }
    if (params.has('r')) {
        document.getElementById('loanInterestInput').value = params.get('r');
        document.getElementById('loanInterestSlider').value = params.get('r');
    }
    if (params.has('t')) {
        document.getElementById('loanTenureInput').value = params.get('t');
        document.getElementById('loanTenureSlider').value = params.get('t');
    }

    if (params.get('pu') === 'true') {
        document.getElementById('powerUserToggle').checked = true;
        isPowerUserActive = true;
        document.getElementById('advancedSettingsPanel').classList.remove('hidden');
        
        if (params.has('su')) document.getElementById('stepUpRateInput').value = params.get('su');
        if (params.has('mo')) document.getElementById('moratoriumInput').value = params.get('mo');
        if (params.has('ac')) document.getElementById('ancillaryCostInput').value = params.get('ac');
        if (params.has('rs')) document.getElementById('rateShockAmountInput').value = params.get('rs');
        if (params.has('ry')) document.getElementById('rateShockYearInput').value = params.get('ry');
        if (params.has('rcp')) document.getElementById('recurringPrepayInput').value = params.get('rcp');
        if (params.has('lsp')) document.getElementById('lumpsumPrepayInput').value = params.get('lsp');
        if (params.has('lsy')) document.getElementById('lumpsumPrepayYearInput').value = params.get('lsy');
        
        if (params.has('tr')) {
            selectedTaxRegime = params.get('tr');
            if (selectedTaxRegime === 'new') {
                document.getElementById('regimeNewBtn').click();
            } else {
                document.getElementById('regimeOldBtn').click();
            }
        }
    }

    updateSliderFill(document.getElementById('loanAmountSlider'));
    updateSliderFill(document.getElementById('loanInterestSlider'));
    updateSliderFill(document.getElementById('loanTenureSlider'));
    triggerCalculation();
}

// --- Event Bindings ---

document.addEventListener('DOMContentLoaded', () => {
    initializeDateDropdowns();

    setupSyncFramework('loanAmountSlider', 'loanAmountInput', 'loanAmountDecrement', 'loanAmountIncrement', 'loanAmountWord');
    setupSyncFramework('loanInterestSlider', 'loanInterestInput', 'loanInterestDecrement', 'loanInterestIncrement', null);
    setupSyncFramework('loanTenureSlider', 'loanTenureInput', 'loanTenureDecrement', 'loanTenureIncrement', null);

    document.querySelectorAll('.loan-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchLoanTab(e.target.id));
    });

    document.getElementById('loanStartMonth').addEventListener('change', triggerCalculation);
    document.getElementById('loanStartYear').addEventListener('change', triggerCalculation);

    const modeEmiBtn = document.getElementById('modeEmiBtn');
    const modeEligibleBtn = document.getElementById('modeEligibleBtn');

    modeEmiBtn.addEventListener('click', () => {
        if (isEligibilityMode) {
            isEligibilityMode = false;
            modeEmiBtn.className = "flex-1 py-1.5 text-xxs font-extrabold rounded-lg text-white bg-blue-900 shadow text-center transition-all duration-200";
            modeEmiBtn.setAttribute('aria-pressed', 'true');
            modeEligibleBtn.className = "flex-1 py-1.5 text-xxs font-bold rounded-lg text-gray-800 text-center transition-all duration-200";
            modeEligibleBtn.setAttribute('aria-pressed', 'false');
            switchLoanTab(currentActiveTab);
        }
    });

    modeEligibleBtn.addEventListener('click', () => {
        if (!isEligibilityMode) {
            isEligibilityMode = true;
            modeEligibleBtn.className = "flex-1 py-1.5 text-xxs font-extrabold rounded-lg text-white bg-blue-900 shadow text-center transition-all duration-200";
            modeEligibleBtn.setAttribute('aria-pressed', 'true');
            modeEmiBtn.className = "flex-1 py-1.5 text-xxs font-bold rounded-lg text-gray-800 text-center transition-all duration-200";
            modeEmiBtn.setAttribute('aria-pressed', 'false');
            switchLoanTab(currentActiveTab);
        }
    });

    const toggleViewMonthBtn = document.getElementById('toggleViewMonthBtn');
    const toggleViewYearBtn = document.getElementById('toggleViewYearBtn');

    toggleViewMonthBtn.addEventListener('click', () => {
        if (ledgerViewMode !== 'month') {
            ledgerViewMode = 'month';
            toggleViewMonthBtn.className = "px-3 py-1 rounded-md bg-blue-900 text-white shadow transition-all duration-150";
            toggleViewYearBtn.className = "px-3 py-1 rounded-md text-gray-700 hover:text-gray-900 transition-all duration-150";
            triggerCalculation();
        }
    });

    toggleViewYearBtn.addEventListener('click', () => {
        const isMonthlyTenure = configPresets[currentActiveTab].type === 'M';
        if (isMonthlyTenure) {
            showNotification("Year-wise consolidation is not applicable for short-term Mobile EMI loans.");
            return;
        }
        if (ledgerViewMode !== 'year') {
            ledgerViewMode = 'year';
            toggleViewYearBtn.className = "px-3 py-1 rounded-md bg-blue-900 text-white shadow transition-all duration-150";
            toggleViewMonthBtn.className = "px-3 py-1 rounded-md text-gray-700 hover:text-gray-900 transition-all duration-150";
            triggerCalculation();
        }
    });

    const chartToggleShare = document.getElementById('chartToggleShare');
    const chartToggleSchedule = document.getElementById('chartToggleSchedule');
    const doughnutContainer = document.getElementById('chartDoughnutContainer');
    const barContainer = document.getElementById('chartBarContainer');

    chartToggleShare.addEventListener('click', () => {
        doughnutContainer.classList.remove('hidden');
        barContainer.classList.add('hidden');
        chartToggleShare.className = "px-2 py-0.5 rounded-md bg-blue-900 text-white shadow";
        chartToggleSchedule.className = "px-2 py-0.5 text-gray-700 hover:text-gray-900 ml-0.5";
        if (emiDoughnutChart) emiDoughnutChart.resize();
    });

    chartToggleSchedule.addEventListener('click', () => {
        barContainer.classList.remove('hidden');
        doughnutContainer.classList.add('hidden');
        chartToggleSchedule.className = "px-2 py-0.5 rounded-md bg-blue-900 text-white shadow";
        chartToggleShare.className = "px-2 py-0.5 text-gray-700 hover:text-gray-900 ml-0.5";
        if (emiBarChart) emiBarChart.resize();
    });

    const powerUserToggle = document.getElementById('powerUserToggle');
    const advancedSettingsPanel = document.getElementById('advancedSettingsPanel');
    powerUserToggle.addEventListener('change', () => {
        isPowerUserActive = powerUserToggle.checked;
        advancedSettingsPanel.classList.toggle('hidden', !isPowerUserActive);
        triggerCalculation();
    });

    const regimeOldBtn = document.getElementById('regimeOldBtn');
    const regimeNewBtn = document.getElementById('regimeNewBtn');
    regimeOldBtn.addEventListener('click', () => {
        selectedTaxRegime = 'old';
        regimeOldBtn.classList.add('bg-emerald-800', 'text-white', 'shadow');
        regimeOldBtn.classList.remove('text-emerald-950');
        regimeNewBtn.classList.remove('bg-emerald-800', 'text-white', 'shadow');
        regimeNewBtn.classList.add('text-emerald-950');
        triggerCalculation();
    });
    regimeNewBtn.addEventListener('click', () => {
        selectedTaxRegime = 'new';
        regimeNewBtn.classList.add('bg-emerald-800', 'text-white', 'shadow');
        regimeNewBtn.classList.remove('text-emerald-950');
        regimeOldBtn.classList.remove('bg-emerald-800', 'text-white', 'shadow');
        regimeOldBtn.classList.add('text-emerald-950');
        triggerCalculation();
    });

    document.getElementById('monthlyIncomeInput').addEventListener('input', () => {
        let val = parseFloat(document.getElementById('monthlyIncomeInput').value);
        if (val < 0) {
            document.getElementById('monthlyIncomeInput').value = 0;
        }
        triggerCalculation();
    });

    const advControlIds = [
        { id: 'stepUpRateInput', wrapper: 'stepUpCardWrapper', pill: 'stepUpPillBox' },
        { id: 'moratoriumInput', wrapper: 'moratoriumCardWrapper', pill: 'moratoriumPillBox' },
        { id: 'ancillaryCostInput', wrapper: 'ancillaryCardWrapper', pill: 'ancillaryPillBox' },
        { id: 'rateShockAmountInput', wrapper: 'rateShockCardWrapper', pill: 'rateShockAmtPillBox' },
        { id: 'rateShockYearInput', wrapper: 'rateShockCardWrapper', pill: 'rateShockYrPillBox' },
        { id: 'recurringPrepayInput', wrapper: 'recurPrepayCardWrapper', pill: 'recurPrepayPillBox' },
        { id: 'lumpsumPrepayInput', wrapper: 'lumpsumPrepayCardWrapper', pill: 'lumpsumPrepayPillBox' },
        { id: 'lumpsumPrepayYearInput', wrapper: 'lumpsumPrepayCardWrapper', pill: 'lumpsumPrepayYrPillBox' }
    ];

    advControlIds.forEach(item => {
        const elem = document.getElementById(item.id);
        const pill = document.getElementById(item.pill);

        elem.addEventListener('input', () => {
            let val = parseFloat(elem.value);
            if (val < 0) {
                elem.value = 0;
                val = 0;
            }

            const min = parseFloat(elem.min) || 0;
            const max = parseFloat(elem.max) || Infinity;

            if (!isNaN(val) && (val < min || val > max)) {
                elem.style.color = '#b91c1c';
                if (pill) {
                    pill.style.borderColor = '#ef4444';
                    pill.style.backgroundColor = '#fef2f2';
                }
            } else {
                elem.style.color = '';
                if (pill) {
                    pill.style.borderColor = '';
                    pill.style.backgroundColor = '';
                }
            }
            triggerCalculation();
        });

        elem.addEventListener('blur', () => {
            let val = parseFloat(elem.value);
            const min = parseFloat(elem.min) || 0;
            const max = parseFloat(elem.max) || Infinity;
            const stepStr = elem.step || "1";
            const decimalPlaces = (stepStr.split('.')[1] || '').length;

            if (isNaN(val) || elem.value.trim() === '' || val < min) {
                elem.value = min;
            } else if (val > max) {
                elem.value = max;
            } else {
                elem.value = parseFloat(val.toFixed(decimalPlaces));
            }

            elem.style.color = '';
            if (pill) {
                pill.style.borderColor = '';
                pill.style.backgroundColor = '';
            }

            triggerCalculation();
        });
    });

    document.getElementById('toggleLedgerBtn').addEventListener('click', () => {
        const content = document.getElementById('ledgerContent');
        const isHidden = content.classList.toggle('hidden');
        document.getElementById('ledgerChevron').style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
        if (!isHidden && emiBarChart) {
            emiBarChart.resize();
        }
    });

    document.getElementById('exportCsvBtn').addEventListener('click', exportToCSV);
    document.getElementById('printPdfBtn').addEventListener('click', () => window.print());

    const modal = document.getElementById('shareModal');
    document.getElementById('shareReportBtn').addEventListener('click', () => {
        const params = new URLSearchParams();
        params.set('tab', currentActiveTab);
        params.set('p', document.getElementById('loanAmountInput').value);
        params.set('r', document.getElementById('loanInterestInput').value);
        params.set('t', document.getElementById('loanTenureInput').value);
        
        const sdYearVal = document.getElementById('loanStartYear').value;
        const sdMonthVal = String(Number(document.getElementById('loanStartMonth').value) + 1).padStart(2, '0');
        params.set('sd', `${sdYearVal}-${sdMonthVal}`);

        if (isEligibilityMode) {
            params.set('mode', 'eligibility');
        }
        
        if (isPowerUserActive) {
            params.set('pu', 'true');
            params.set('su', document.getElementById('stepUpRateInput').value);
            params.set('mo', document.getElementById('moratoriumInput').value);
            params.set('ac', document.getElementById('ancillaryCostInput').value);
            params.set('rs', document.getElementById('rateShockAmountInput').value);
            params.set('ry', document.getElementById('rateShockYearInput').value);
            params.set('rcp', document.getElementById('recurringPrepayInput').value);
            params.set('lsp', document.getElementById('lumpsumPrepayInput').value);
            params.set('lsy', document.getElementById('lumpsumPrepayYearInput').value);
            params.set('tr', selectedTaxRegime);
        }
        
        const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        document.getElementById('shareUrlInput').value = shareUrl;

        const activeTabName = document.getElementById(currentActiveTab).textContent;
        const inputLabelName = isEligibilityMode ? "Target Monthly Budget" : "Sanctioned Principal";
        const loanAmountVal = formatCurrency(parseFloat(document.getElementById('loanAmountInput').value));
        const interestRateVal = document.getElementById('loanInterestInput').value + "%";
        const tenureText = document.getElementById('loanTenureInput').value + (configPresets[currentActiveTab].type === 'M' ? " Months" : " Years");
        const mainTargetVal = document.getElementById('maturityValue').textContent.split(" / ")[0];
        const totalP = document.getElementById('totalInvestment').textContent;
        const totalI = document.getElementById('totalInterest').textContent;

        let extraReportHtml = '';
        if (isPowerUserActive) {
            const stepUpVal = document.getElementById('stepUpRateInput').value;
            const morMonths = document.getElementById('moratoriumInput').value;
            const shockAmount = document.getElementById('rateShockAmountInput').value;
            const recurPrepay = document.getElementById('recurringPrepayInput').value;
            const lumpPrepay = document.getElementById('lumpsumPrepayInput').value;

            if (parseFloat(stepUpVal) > 0 && !isEligibilityMode) extraReportHtml += `<li class="flex justify-between border-b border-gray-100 pb-1"><span class="text-xxs text-gray-900 font-extrabold">Annual Step-Up:</span><span class="text-xxs font-extrabold text-gray-900">${stepUpVal}%</span></li>`;
            if (parseInt(morMonths) > 0) extraReportHtml += `<li class="flex justify-between border-b border-gray-100 pb-1"><span class="text-xxs text-gray-900 font-extrabold">Moratorium skipped:</span><span class="text-xxs font-extrabold text-gray-900">${morMonths} months</span></li>`;
            if (parseFloat(shockAmount) > 0) extraReportHtml += `<li class="flex justify-between border-b border-gray-100 pb-1"><span class="text-xxs text-gray-900 font-extrabold">Interest Rate Shock:</span><span class="text-xxs font-extrabold text-gray-900">+${shockAmount}%</span></li>`;
            if (parseFloat(recurPrepay) > 0) extraReportHtml += `<li class="flex justify-between border-b border-gray-100 pb-1"><span class="text-xxs text-gray-900 font-extrabold">Recurring Prepay:</span><span class="text-xxs font-extrabold text-gray-900">${formatCurrency(recurPrepay)}/yr</span></li>`;
            if (parseFloat(lumpPrepay) > 0) extraReportHtml += `<li class="flex justify-between border-b border-gray-100 pb-1"><span class="text-xxs text-gray-900 font-extrabold">One-time Prepay:</span><span class="text-xxs font-extrabold text-gray-900">${formatCurrency(lumpPrepay)}</span></li>`;
        }

        const reportHtml = `
            <h3 class="text-xs font-bold text-gray-900 mb-2 font-extrabold">Summary of Loan Details</h3>
            <ul class="flex flex-col gap-2 mt-1">
                <li class="flex justify-between border-b border-gray-100 pb-1">
                    <span class="text-xxs text-gray-900 font-extrabold">Loan Category:</span> 
                    <span class="text-xxs font-extrabold text-gray-900">${activeTabName}</span>
                </li>
                <li class="flex justify-between border-b border-gray-100 pb-1">
                    <span class="text-xxs text-gray-900 font-extrabold">Mode:</span> 
                    <span class="text-xxs font-extrabold text-gray-900">${isEligibilityMode ? 'Loan Eligibility Mode' : 'Standard EMI Mode'}</span>
                </li>
                <li class="flex justify-between border-b border-gray-100 pb-1">
                    <span class="text-xxs text-gray-900 font-extrabold">${inputLabelName}:</span> 
                    <span class="text-xxs font-extrabold text-gray-900">${loanAmountVal}</span>
                </li>
                <li class="flex justify-between border-b border-gray-100 pb-1">
                    <span class="text-xxs text-gray-900 font-extrabold">Interest Rate:</span> 
                    <span class="text-xxs font-extrabold text-gray-900">${interestRateVal}</span>
                </li>
                <li class="flex justify-between border-b border-gray-100 pb-1">
                    <span class="text-xxs text-gray-900 font-extrabold">Tenure:</span> 
                    <span class="text-xxs font-extrabold text-gray-900">${tenureText}</span>
                </li>
                ${extraReportHtml}
                <li class="flex justify-between border-b border-gray-100 pb-1">
                    <span class="text-xxs text-gray-900 font-extrabold">Total Borrowed Principal:</span> 
                    <span class="text-xxs font-extrabold text-gray-900">${totalP}</span>
                </li>
                <li class="flex justify-between border-b border-gray-100 pb-1">
                    <span class="text-xxs text-gray-900 font-extrabold">Total Interest Paid:</span> 
                    <span class="text-xxs font-extrabold text-green-950">${totalI}</span>
                </li>
                <li class="flex justify-between pt-1">
                    <span class="text-xxs text-indigo-950 font-black">${isEligibilityMode ? 'Eligible Loan Principal' : 'Calculated Monthly EMI'}:</span> 
                    <span class="text-xxs font-black text-indigo-950">${mainTargetVal}</span>
                </li>
            </ul>
        `;

        document.getElementById('modalReportContent').innerHTML = reportHtml;
        modal.classList.add('active');
    });
    document.getElementById('closeModalBtn').addEventListener('click', () => modal.classList.remove('active'));

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });

    document.getElementById('copyUrlBtn').addEventListener('click', () => {
        try {
            const shareUrlInput = document.getElementById('shareUrlInput');
            shareUrlInput.select();
            document.execCommand('copy');
            showNotification('Link copied to clipboard!');
        } catch (err) {
            console.error('Copy failed:', err);
            showNotification('Could not copy link.');
        }
    });

    loadFromUrl();
});