🚀 Toolblaster

Smart Tools for Business, Finance & Life

A high-performance digital utility station designed for speed, privacy, and precision.

🧠 The Philosophy

Toolblaster was born from a simple frustration: essential digital utilities and financial calculators are often over-engineered, riddled with invasive ads, or hidden behind monthly paywalls. We believe that managing daily priorities, executing deep focus work, or planning your long-term compound wealth shouldn't require a subscription or compromise your personal privacy.

Our Core Pillars:

🔒 Privacy-First (Local Storage): What happens on your device stays on your device. All our productivity and calculation tools run completely client-side. We do not track, upload, or process your private inputs on central servers.

⚡ Built for Speed: Zero bloat, instant load times, and vanilla JavaScript compiled logic for a seamless user experience.

🎯 No Distractions: 100% free tools with no forced logins, no paywalls, and no annoying pop-ups.

📱 Mobile-First Responsive Design: Every interface is built to adapt dynamically to all modern mobile viewports with highly compact, thumb-friendly UI components.

🛠️ Tool Ecosystem & Directory

Toolblaster operates as a centralized hub, hosting specialized applications categorized into targeted suites.

⚡ Productivity Suite

DECIDE. (/productivity/decide/)

Daily Priority Tool for Mental Clarity & Focus

Feature: Limits you to strictly 3 daily priorities to eliminate task overload, cognitive fatigue, and anxiety.

Tech: localStorage persistence, custom JSON imports/exports, and high-fidelity PDF/CSV print generations.

Smart Word Counter (/productivity/word-counter/)

Advanced Text Analyzer & Word Counter

Feature: Real-time multilingual counting, SEO keyword density audits, live grammar suggestions, reading time estimation, and custom goal trackers.

Tech: Intl.Segmenter for seamless CJK (Chinese, Japanese, Korean) language parsing, advanced regex highlighting.

Pomodoro Study Timer (/productivity/pomodoro-study-timer/)

Distraction-Free Deep Focus Timer

Feature: Auto-start intervals, customizable break rules, and native keyboard hotkey bindings (Alt + P, Space).

Tech: Web Audio API for synthetic ambient sounds (Brown/Pink/White noise), native push notifications, and Screen Wake Lock API.

Minimalist Box Breathing & Meditation Guide

Feature: Visual pacing for the 4-7-8 method, classic Box Breathing, and custom cycles. Leverages Zen-inspired sound blocks.

Tech: CSS custom keyframes, Navigator Vibration API.

Habit Tracker (/productivity/habit-tracker/)

Atomic Daily Routine Builder

Feature: Helps users build and maintain life-changing daily routines with visual check-ins and streaks.

Tech: Local state sync, weekly completion metrics tracking.

📈 Finance Suite

Unified High-Precision Portfolio & Compound Yield Simulator

Unified Asset Classes: Calculate and compare compound interest curves across 9 distinct Indian mutual fund asset classes—Index, Large Cap, Mid Cap, Small Cap, Multi Cap, Flexi Cap, Balanced/Hybrid, Equity Basket, and Debt Funds.

Precision Mathematical Compounding: Replaces standard naive linear compounding ($R/12$) with the mathematically precise Effective Monthly Compounding Rate formula based on beginning-of-month periodic deposits:


$$i = (1 + R)^{1/12} - 1$$

Direct vs. Regular Wealth Leakage: Models real-time compounding erosion triggered by mutual fund expense ratios and regular plan broker commission trailing fees (~1.0% p.a. added drag), visually projecting absolute wealth loss in rupees.

Annualised Tax Harvesting (Sec 112A): Models realistic portfolio tax liability by harvesting long-term capital gains (LTCG) up to the statutory ₹1.25 Lakh exemption threshold every financial year of the tenure, rather than overestimating tax with a flat maturity calculation.

Reverse Goal Seek Mode: Allows users to input a target milestone corpus (e.g., ₹1 Crore) and backwards-solves the exact starting monthly SIP or up-front lumpsum required.

Cost of Delay (Procrastination) Simulator: Calculates the exact financial penalty of delaying an investment start by 1, 3, or 5 years.

Personal Yield Rates: Displays true cash-flow adjusted XIRR (Extended Internal Rate of Return) alongside simple absolute percentage returns.

Tech: Chart.js visual dough-mapping, year-by-year incremental progression schedules with built-in tabular progress gauges, custom CSV spreadsheet exporters, and fully optimized A4 @media print sheets.

PPF Calculator (/finance/ppf-calculator/)

Sovereign Wealth Maturity, Loan & Extension Planner

Feature: Plan extensions in blocks of 5 years (up to 20 years) with or without fresh contributions. Includes a government-rule loan auditor (eligible Years 3-6) and tax-free partial withdrawal thresholds tracker (eligible Year 7+).

Advanced Logic: Built-in "April 5th" interest timing optimisation algorithm to compare lump-sum yield losses against late deposits. Includes an editable YoY growth ledger allowing users to input specific custom annual investments.

Tech: Chart.js dynamic doughnut mapping, custom CSV exports, tax bracket slab selectors (Section 80C integration), and high-contrast print layouts.

Advanced 5-in-1 Multi-Loan Repayment & Amortisation Suite

Feature: Unified calculator supporting Home, Car, Bike, Personal, and Mobile loans. Includes a toggle to check "Max Loan Eligibility" based on target budgets.

Power-User Controls: Simulate step-up annual repayment increments, skipped moratorium months (payment holidays), ancillary fee bundling, and floating rate interest shocks. Features a foreclosure part-payment/lumpsum scheduler.

Tech: Dual-chart visualizers (Doughnut split and stacked YoY Bar charts), Old vs. New Income Tax regime calculators (Section 24b/80C tax saved mapping), and automated PDF statements generator.

Safe-to-Spend Calculator (/finance/safe-to-spend-calculator/)

Dynamic Daily Budget Planner & Impulse Buy Shield

Feature: Instantly isolates rent, bills, and monthly savings goals to turn your remaining net monthly pool into a single, stress-free daily spending limit. Features an Interactive Impulse Buy Simulator to test the immediate drop in your daily spending limits for the rest of the cycle before tapping "Buy Now."

Safety Buffers: Allows fine-tuning of price cushions (inflation buffers), unexpected windfalls, medical emergency reserves, and upcoming pre-planned one-off spends.

Advanced Logic: Implements client-side linear amortization. If you overspend your limit today, the engine dynamically recalibrates and re-amortizes the remaining balance over the rest of the calendar month or payday reset cycle.


$$\text{STS}_{\text{daily}} = \frac{(I + W) - (F + S + C_{\text{inf}} + E_{\text{res}} + P_{\text{spend}}) - \sum \text{Exp}}{D_{\text{rem}}}$$

Tech: Chart.js dynamic visualizers (Doughnut split and daily spends curve bar chart switcher), html2canvas high-resolution card generator for clean sharing, LocalStorage-persisted itemized ledger schedule, real-time mini spends logger, and raw CSV/PDF report exporter.

Compare Investment (/finance/sip-vs-fd-vs-rd-calculator/)

Visual Compound Yield Comparison

Feature: Compare Mutual Fund SIPs, Recurring Deposits, Lumpsum investments, and Fixed Deposits side-by-side.

Investment Planner (/finance/investment-planner/)

Comprehensive Pension & Goal Tracker

Feature: Plan long-term wealth milestones, calculate compound yields, and structure Systematic Withdrawal Plans (SWP).

🎓 Educational Suite

Kids Rhymes (/educational/nursery-rhymes-for-kids/)

Interactive Nursery Rhymes & Playlist Manager

Feature: Interactive Read Aloud, customizable playlist queue, and dual-language (English/Hindi) text structures.

Tech: Web Speech API integration.

💻 Tech Stack & Architecture

This project is built using a modern, lightweight, and framework-agnostic stack for maximum performance:

Frontend: HTML5, Vanilla JavaScript (ES6+).

Styling: Tailwind CSS (configured for rapid CDN compilation and utility-first delivery).

Charts & Graphs: Chart.js CDN for robust rendering of amortization schedules and compound interest arcs.

Typography: Google Fonts: Inter (Primary brand typography) and Hind (Secondary readable script).

Icons: FontAwesome 6 (Solid & Brands) and carefully crafted custom inline SVGs.

Browser APIs Leveraged: localStorage, Web Audio API, Web Speech API, Screen Wake Lock API, Canvas API, Navigator.vibrate().

Global Components Strategy

To maintain a highly DRY (Don't Repeat Yourself) codebase across static HTML directories, global structural modules are injected dynamically:

js/header-footer.js: The brain of the design system layout. Dynamically injects:

The primary brand header.

A category-based secondary navigation bar (Top sub-nav) that auto-scrolls to center active items and sticky-locks (fixed top-0) on mobile and desktop scroll.

An off-screen sidebar Mega Menu App Drawer (powered by TOOLBLASTER_APPS centralized array directory).

Centered social sharing integrations and legal footers.

🚦 Running Locally

Because Toolblaster is a client-side static application, running it locally is simple:

Clone the repository to your local machine.

Open the project folder in your preferred code editor (e.g., VS Code).

Use an extension like Live Server to serve the index.html file from the root directory.

⚠️ Note: Because several tools rely on ES modules, external assets, and absolute/relative path queries, launching static files via the file:// protocol directly in the browser will cause CORS or broken pathing issues. Always serve using a local web server.

🛡️ Accessibility (WCAG AA) & SEO

WCAG AA Compliance: Color pairings are reviewed meticulously. Headings, labels, and text colors have been upgraded (e.g., from stone-400 to high-contrast stone-600 or stone-900 against light backgrounds) to meet the strict 4.5:1 contrast ratio benchmark. Input boxes feature precise aria labels and step validations.

Print Optimization: Custom @media print style sheets swap out interactive controls and sliders with high-contrast, clean-cut statement templates (#print-report and table structures) specifically designed for neat A4 PDF saving.

SEO & Structure: Implemented standardized meta titles (strictly capped at 60 characters for SERP) and meta descriptions under 160 characters. Backed by extensive Schema.org JSON-LD structured data graphs (WebApplication, HowTo, and FAQPage configurations) for rich snippet results.

✉️ Contact & Creator

Built with focus and precision by Vikas Rana.

X (Twitter): @Vikasrana03

Email: hello@toolblaster.com

Website: Toolblaster.com

Copyright © 2026 Toolblaster.com | All Rights Reserved.
