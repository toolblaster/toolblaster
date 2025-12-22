Toolblaster.com - Tech Review Platform

Toolblaster is a modern, performance-focused static website dedicated to in-depth software reviews and tech tools. This repository contains the source code, design system, and content templates for the platform.

Latest Update: December 2026 Standards (High Contrast, WCAG AA, Mobile-First)

📂 Project Structure

toolblaster/
├── index.html              # Homepage
├── js/
│   ├── header-footer.js    # Centralized UI logic (Header, Footer, Sidebar, Share Widget, TOC)
│   └── tailwind-config.js  # Global Design System (Typography, Colors, Layout)
├── reviews/
│   ├── index.html          # Reviews Hub
│   ├── review-template.html # GOLDEN MASTER Template for new reviews
│   └── security/
│       └── zerossl-review.html # Production example of the 2026 design standards
└── ...


🎨 Design System (2026 Standards)

The site utilizes a centralized Tailwind CSS configuration to ensure consistency across all pages.

Layout: Strict 75% Content / 25% Sidebar split on Desktop. Single column on Mobile.

Max Width: Locked to 1150px for optimal readability.

Typography:

H1: 38px (Extrabold 900)

H2: 22px (Bold 800)

H3: 14px (Bold 800)

Body Text: 12px (High legibility)

Colors: High-contrast palette compliant with WCAG AA standards.

Accent: #D9261F (Optimized Red)

Text: Slate/Zinc scale for better contrast against white backgrounds.

Configuration File

All styles are defined in js/tailwind-config.js. Do not write inline styles unless absolutely necessary. Use the utility classes defined there (e.g., text-article-p, text-heading-1).

🧩 Centralized Components (header-footer.js)

To maintain maintainability, key UI elements are injected via JavaScript. Do not hardcode these in HTML files.

Global Header & Footer: Automatically injected into #app-header and #app-footer.

Sticky Sidebar (Desktop):

Automatically generates a Table of Contents (TOC) based on <h2> tags in the article.

Includes "Popular Tools" widget.

Features ScrollSpy logic to highlight the active section while reading.

Mobile TOC: A foldable accordion menu injected at the very top of the article for mobile users.

Share Widget: Automatically injects high-contrast social icons (WhatsApp, Telegram, X, LinkedIn, Copy Link) into the author header block.

Back to Top: A floating button that appears after scrolling down 300px.

📝 How to Create a New Review

We have created a Golden Master template to streamline the creation of new content.

Duplicate the Template:
Copy reviews/review-template.html to your desired location (e.g., reviews/marketing/new-tool.html).

Fill in Metadata:
Update the <title>, <meta name="description">, and <link rel="canonical"> tags.

Update JSON-LD Schema:
Edit the structured data blocks at the top of the file with the specific tool name, author, and rating.

Write Content:

Replace [Tool Name] placeholders.

Use the Flexible Content Blocks provided in the template (commented out sections) for things like:

Comparison Tables (Compact style)

Feature Grids

Pricing Cards

Performance Benchmarks

Publish:
No extra JavaScript work is needed. The header-footer.js script will automatically detect your new headings, build the sidebar/mobile TOC, and attach the share widget.

🛠 Development & Testing

Tailwind: The project uses the CDN version of Tailwind for rapid prototyping, configured via js/tailwind-config.js.

Icons: FontAwesome (Free tier) is used for all UI icons.

Browser Support: Tested on Chrome, Firefox, Safari (Mobile & Desktop).

Accessibility Checklist (Manual)

[x] Ensure text contrast ratio is > 4.5:1.

[x] Touch targets on mobile must be at least 32px (Social icons are optimized).

[x] alt tags required for all images (or placeholders).

[x] Layout should never exceed 1150px width.

Maintained by Toolblaster Engineering Team
