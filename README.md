Toolblaster Reviews Project

This project is a static site for software and service reviews, focusing on SEO tools, hosting, and security. It uses Tailwind CSS (via CDN) for styling and vanilla JavaScript for dynamic components like headers, footers, and sidebars.

Project Structure

index.html: The main homepage listing categories or featured reviews.

reviews/: Directory containing individual review pages.

index.html: The main reviews index page with filtering logic.

review-template.html: The master template for creating new reviews (Updated with 2026 standards).

hosting/:

verpex-hosting-review.html: Detailed review of Verpex Hosting.

seo/:

semrush-review.html: In-depth review of Semrush.

kwfinder-review.html: Review of KWFinder by Mangools.

security/:

zerossl-review.html: Review of ZeroSSL certificate authority.

js/:

header-footer.js: Handles injection of the global navigation, footer, sidebar skeleton (TOC), modals, and back-to-top button. Contains the requestAnimationFrame fix for forced reflows.

global-script.js: Handles sidebar widgets (Popular Tools, Other Reviews) and dynamic content injection.

tailwind-config.js: Custom Tailwind configuration (colors, fonts).

terms/: Static pages for legal/info (about.html, privacy.html, terms.html).

Recent Updates (Dec 2025)

Core Improvements

CLS Prevention: All review images now use explicit width and height attributes alongside w-full h-auto classes to reserve layout space and prevent Cumulative Layout Shift.

Modern Pricing Cards: Pricing sections have been redesigned into compact, 3-column card grids with clear feature lists and "Recommended" badges.

Enhanced Verdicts: The "Final Verdict" sections now use a "Buy it if / Skip it if" grid layout for better scannability.

High Contrast: Text colors have been darkened (text-gray-800/900) across all reviews to ensure WCAG AA accessibility compliance.

Performance: js/header-footer.js now uses requestAnimationFrame for ScrollSpy initialization to prevent forced reflows during page load.

Updated Pages

Verpex Review: Added "Hidden Resource Limits" exclusive section and speed matrix graph.

Semrush Review: Added "Ghost Keyword Discovery" exclusive test and compact competitor comparison.

KWFinder Review: Modernized pricing with a 4th "Free Trial" column and added "Niche Site Test" data.

ZeroSSL Review: Updated pricing to reflect 2026 rates, added "Speed Test" benchmarks, and modernized the FAQ section.

How to Create a New Review

Duplicate reviews/review-template.html.

Update the SEO Meta Tags (Title, Description, Keywords) and JSON-LD Schema.

Fill in the Header details (Title, Rating, Date).

Write the Article Content:

Use <section class="card-section"> for main blocks.

Include an Exclusive Data section if possible.

Fill out the Comparison Table and Pricing Cards.

Complete the Final Verdict grid.

Ensure all images have width and height attributes.

Test on mobile to ensure the Sidebar TOC doesn't intrude (handled by <div> vs <article> structure in index pages).

Development Notes

Tailwind: Uses the Play CDN for prototyping. For production, this should be compiled.

Sidebar: The sidebar is dynamically injected. The TOC is generated automatically from <h2> tags within the <article> element.

Icons: Uses FontAwesome 6.4.0 via CDN.
