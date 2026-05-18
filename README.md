🚀 Toolblaster

Smart Tools for Business, Finance & Life A high-performance digital utility station designed for speed, privacy, and precision.

🧠 The Philosophy

Toolblaster was born from a simple frustration: essential digital tools are often too complex, riddled with ads, or hidden behind paywalls. We believe that managing daily priorities, executing deep work, or analyzing text shouldn't require a subscription or compromise your privacy.

Our Core Pillars:

🔒 Privacy-First (Local Storage): What happens on your device stays on your device. All our productivity tools use local browser storage. We do not track or upload your private input data to central servers.

⚡ Built for Speed: Zero bloat, instant load times, and vanilla JavaScript for a seamless user experience.

🎯 No Distractions: 100% free tools with no forced logins, no paywalls, and no annoying pop-ups.

📱 Mobile-Optimized: Every interface is built mobile-first with highly compact, thumb-friendly UI components.

🛠️ Tool Ecosystem & Directory

Toolblaster operates as a central hub, hosting various native applications cleanly categorized into specific suites.

⚡ Productivity Suite

DECIDE. (/productivity/decide/)
Daily Priority Tool for Mental Clarity & Focus

Feature: Limits you to strictly 3 daily priorities to eliminate overwhelm.

Tech: LocalStorage for persistence, Custom JSON export/import, PDF/CSV generation.

Smart Word Counter (/productivity/word-counter/)
Advanced Text Analyzer & Word Counter

Feature: Real-time multilingual counting, SEO keyword density, live grammar hints, reading time estimation, and goal tracking.

Tech: Intl.Segmenter for CJK languages, advanced regex highlighting.

Pomodoro Study Timer (/productivity/pomodoro-study-timer/)
Distraction-Free Deep Focus Timer

Feature: Auto-start intervals, customizable break rules, and keyboard shortcuts (Alt+P, Space).

Tech: Web Audio API for ambient sounds (Brown/Pink noise), native push notifications, and Screen Wake Lock API.

Breathing Pacer (/productivity/breathing-pacer/)
Minimalist Box Breathing & Meditation Guide

Feature: Visual pacing for 4-7-8, Box Breathing, and custom patterns with haptic feedback and Zen sounds to reduce stress.

Tech: CSS custom keyframes, Navigator Vibration API.

🎓 Educational Suite

Kids Rhymes (/educational/nursery-rhymes-for-kids/)
Interactive Nursery Rhymes Tool

Feature: Read Aloud functionality, custom queue/playlist management, and dual-language (English/Hindi) support.

Tech: Web Speech API integration.

💻 Tech Stack & Architecture

This project is built using a modern, lightweight, and framework-agnostic stack:

Frontend: HTML5, Vanilla JavaScript (ES6+).

Styling: Tailwind CSS (loaded via CDN for rapid prototyping).

Typography: Official Brand Font: Inter (Google Fonts). Secondary Font: Hind.

Icons: FontAwesome 6 (Solid & Brands) and custom inline SVGs.

Browser APIs Leveraged: localStorage, Web Audio API, Web Speech API, Screen Wake Lock API, Navigator.vibrate().

Global Components Strategy

To maintain a DRY (Don't Repeat Yourself) codebase across static HTML files, global elements are injected via JavaScript:

js/header-footer.js: Dynamically injects the global navigation bar, contextual app switcher (Top Nav), mobile sidebar, a globally accessible Mega Menu App Drawer, and the footer. It dynamically detects categories and limits nav items intelligently.

js/tailwind-config.js: Centralized design system maintaining custom color palettes (e.g., stone-900, red-600), font settings, and glassmorphism shadows.

🚦 Running Locally

Because Toolblaster is a client-side static application, running it locally is incredibly simple:

Clone the repository to your local machine.

Open the project folder in your preferred code editor (e.g., VS Code).

Use an extension like Live Server to serve the index.html file from the root directory.

Note: Because some tools use modules and external CDNs, viewing them via the file:// protocol directly in the browser may cause CORS or pathing issues. Always use a local web server.

🛡️ Accessibility (WCAG AA) & SEO

Contrast: UI elements utilize high-contrast pairings (e.g., stone-600 to stone-900 against light backgrounds) to strictly meet or exceed the 4.5:1 contrast ratio required by WCAG AA standards.

SEO: Implementations include accurate canonical tags, JSON-LD structured data (WebApplication, HowTo, FAQPage), and optimized Meta Titles & Descriptions.

✉️ Contact & Creator

Built with focus and precision by Vikas Rana.

X (Twitter): @Vikasrana03

Email: hello@toolblaster.com

Website: Toolblaster.com

Copyright © 2026 Toolblaster.com | All Rights Reserved.
