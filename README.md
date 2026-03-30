Toolblaster Utility Hub

Toolblaster is a professional digital utility hub and software analysis platform. It combines in-depth, unbiased reviews of web hosting and cybersecurity tools with a suite of lightweight, high-performance web applications designed for creators, students, and professionals.

🚀 Project Vision

To become a consolidated "Utility Hub" (similar to the QuillBot model), where multiple tools live under a single root domain to build massive SEO authority, user trust, and streamlined monetization via AdSense.

🏗️ Architecture

Toolblaster is built as a Static Utility Suite.

Frontend: Vanilla HTML5, JavaScript (ES6+).

Styling: Tailwind CSS (configured via js/tailwind-config.js).

Data Pattern: Local-First (Privacy-focused, no server-side databases for user data).

Global Components: Shared navigation and footers are injected via js/header-footer.js for site-wide consistency and "DRY" (Don't Repeat Yourself) development.

📂 Directory Structure

/ (Root)
├── index.html              # Main Hub Homepage
├── robots.txt              # Global search engine instructions
├── sitemap.xml             # Main sitemap linking sub-tools
├── js/
│   ├── tailwind-config.js  # Central brand styling & colors
│   ├── header-footer.js    # Global navigation injection logic
│   └── global-script.js    # Ad management & UI interactions
├── decide/                 # DECIDE Tool Subfolder (Umbrella Pattern)
│   ├── index.html          # Main tool interface
│   ├── app.js              # Local storage & logic for DECIDE
│   ├── sitemap.xml         # Tool-specific sitemap
│   └── pages/              # Content-rich SEO subpages
│       ├── about.html      # Project story
│       └── why-three.html  # Philosophical/Scientific context
└── reviews/                # Software Analysis Directory
    ├── hosting/            # Hosting review categories
    └── security/           # Cybersecurity review categories


🎯 The "Umbrella" SEO Strategy

We have transitioned from subdomains (e.g., decide.toolblaster.com) to a Subfolder Structure (e.g., toolblaster.com/decide/).

Benefits:

Consolidated Domain Authority: Backlinks to individual tools now power the entire toolblaster.com domain.

Instant AdSense Approval: A single site verification covers all internal tools.

User Retention: Shared headers and footers keep users within the Toolblaster ecosystem.

🛠️ Featured Tool: DECIDE.

DECIDE. is a minimalist daily priority tool. Unlike traditional planners that create overwhelm, DECIDE forces clarity by limiting users to exactly three priorities per day.

Privacy: 100% Local-first. No data ever leaves the user's device.

Performance: Sub-100ms load times.

PWA Ready: Installable on iOS and Android for offline use.

🎨 Development Standards

Mobile-First: All components are designed for mobile interaction first, scaling up to desktop.

Typography: Strict enforcement of the official Inter brand font.

SEO Limits: - Titles: < 60 characters.

Descriptions: < 160 characters.

Accessibility: Targeted WCAG AA compliance with high-contrast stone-palette themes.

📜 Legal

Toolblaster and its associated tools are provided "as-is". User data for tools like DECIDE is stored in localStorage; users are responsible for their own backups using the built-in JSON export features.

© 2026 Toolblaster. All Rights Reserved.
