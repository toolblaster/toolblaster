🚀 Toolblaster

Smart Tools for Business, Finance & Life A high-performance digital utility station designed for speed, privacy, and precision.

🧠 The Philosophy

Toolblaster was born from a simple frustration: essential digital tools are often too complex, riddled with ads, or hidden behind paywalls. We believe that calculating financial goals, managing daily priorities, or generating professional invoices shouldn't require a subscription or compromise your privacy.

Our Core Pillars:

🔒 Privacy-First (Local Storage): What happens on your device stays on your device. Tools like DECIDE use local browser storage. We do not track or upload your private input data to central servers.

⚡ Built for Speed: Zero bloat, instant load times, and vanilla JavaScript for a seamless user experience.

🎯 No Distractions: 100% free tools with no forced logins, no paywalls, and no annoying pop-ups.

📱 Mobile-Optimized: Every interface is built mobile-first with highly compact, thumb-friendly UI components.

🛠️ Tool Ecosystem & Directory

Toolblaster operates as a central hub, hosting various native applications and linking to specialized subdomains.

1. DECIDE (/decide/)

Daily Priority Tool for Mental Clarity & Focus
A minimalist daily planner designed to eliminate overwhelm.

Feature: Limits you to strictly 3 daily priorities.

Tech: Uses LocalStorage for data persistence, Custom JSON export/import for backups, PDF/CSV generation.

Design: Premium Glassmorphism UI, WCAG AA compliant contrast.

2. Kids Rhymes (/educational/nursery-rhymes-for-kids/)

Interactive Nursery Rhymes Tool
A safe, educational tool for kids featuring rhymes in English and Hindi.

Feature: Web Speech API integration for "Read Aloud" functionality, Custom queue/playlist management.

Design: Playful ambient glassmorphism backgrounds, categorized filtering.

3. Reviews Hub (/reviews/)

Expert Software & Service Reviews
Unbiased, data-driven analysis of digital tools powering the modern web.

Feature: Client-side category filtering, expandable image modals.

4. External Utility Stations (Subdomains)

Notepad: Distraction-free browser notepad.

SIP Planner: Advanced mutual fund returns calculator accounting for inflation.

GST Billing: Professional invoice generator for small businesses.

Agri Quiz: Mock exams and educational testing.

Percentage Calculator: Quick math utilities.

💻 Tech Stack & Architecture

This project is built using a modern, lightweight, and framework-agnostic stack:

Frontend: HTML5, Vanilla JavaScript (ES6+).

Styling: Tailwind CSS (loaded via CDN for rapid prototyping).

Typography: Official Brand Font: Inter (Google Fonts). Secondary Font: Hind.

Icons: FontAwesome 6 (Solid & Brands).

Utilities: jspdf and jspdf-autotable for client-side document generation.

State Management: Native window.localStorage API.

Global Components Strategy

To maintain a DRY (Don't Repeat Yourself) codebase across static HTML files, global elements are injected via JavaScript:

js/header-footer.js: Dynamically injects the global navigation bar, secondary app switcher, mobile sidebar, and global footer.

js/tailwind-config.js: Centralized design system maintaining custom color palettes (e.g., stone-900, red-500), font settings, and glassmorphism shadows.

🚦 Running Locally

Because Toolblaster is a client-side static application, running it locally is incredibly simple:

Clone the repository to your local machine.

Open the project folder in your preferred code editor (e.g., VS Code).

Use an extension like Live Server to serve the index.html file from the root directory.

Note: Because some tools use modules and external CDNs, viewing them via the file:// protocol directly in the browser may cause CORS or pathing issues. Always use a local web server.

🛡️ Accessibility (WCAG AA) & SEO

Contrast: UI elements utilize stone-600 to stone-900 against light backgrounds to strictly meet or exceed the 4.5:1 contrast ratio required by WCAG AA standards.

SEO: Implementations include accurate canonical tags, JSON-LD structured data (WebApplication & BreadcrumbList), and optimized Meta Titles (~60 chars) & Descriptions (~150 chars).

✉️ Contact & Creator

Built with focus and precision by Vikas Rana.

X (Twitter): @Vikasrana03

Email: hello@toolblaster.com

Website: Toolblaster.com

Copyright © 2026 Toolblaster.com | All Rights Reserved.
