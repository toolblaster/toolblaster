Toolblaster Hub - Project Documentation

Toolblaster Hub is an all-in-one digital platform serving as a central gateway to various specialized verticals, including financial planning, government exam preparation, creative learning for kids, and digital marketing tools.

🏗️ Project Architecture

The website is built using a component-based architecture within a static HTML environment. It utilizes vanilla JavaScript to inject shared elements (Header, Footer) and a centralized configuration file for styling, ensuring consistency across all pages (Home, Articles, Reviews).

Core File Structure

index.html: The main entry point and landing page.

js/header-footer.js: Handles the injection of the Navigation Bar, Footer, and Modals. Also manages mobile menu logic.

js/tailwind-config.js: The central design system source of truth.

articles/: Directory for article content.

reviews/: Directory for review content.

🎨 Design System

The design is powered by Tailwind CSS (via CDN) but configured centrally to strictly enforce branding and typography.

1. Centralized Configuration (js/tailwind-config.js)

Instead of hardcoding styles in HTML, the site uses a custom configuration to define:

Global Max Width: 1150px (max-w-site)

Font Family: Inter (English) + Hind (Devanagari/Hindi fallback).

Brand Colors:

accent-main: #E34037 (Primary Red)

hero-bg: #121212 (Dark Theme Backgrounds)

2. Typography Hierarchy

A strict hierarchy is enforced to ensure readability across the hub and future articles.

Element

Size

Weight

Tailwind Class

Notes

H1

40px

Black (900)

text-heading-1

Main Page Titles

H2

24px

ExtraBold (800)

text-heading-2

Section Titles

H3

16px

Bold (700)

text-heading-3

Subsections

Body

13px

Normal

text-article-p

Standard text

Note: H4, H5, and H6 are intentionally avoided to maintain a clean visual depth.

3. Layout & CLS Prevention

To prevent Cumulative Layout Shift (CLS) caused by JavaScript injection, the layout reserves fixed vertical space in the HTML before scripts load:

Header: min-h-[56px]

Footer: min-h-[80px]

🚀 Live Tools & Verticals

The homepage currently features a dense grid layout showcasing the following active projects:

Inflation-Adjusted SIP Calculator: Financial planning tool.

Mortgage Planner: Home loan structuring and analysis.

Stories & Rhymes for Kids: Educational content platform.

Best SEO Tools Comparison: Expert reviews on digital marketing software.

🔜 Upcoming Projects

Financial Calculator's Hub: A complete suite of Indian financial tools.

HP Exam Prep Portal: Preparation resources for HPPSC, HPRCA, and other Himachal Pradesh government exams.

🔧 Technical Details

Framework: Vanilla HTML5 / JS.

Styling: Tailwind CSS (CDN Mode with Custom Config).

Icons: FontAwesome 6 (Solid style).

SEO: * Canonical tags implemented (https://toolblaster.com/).

Robots set to index, follow.

Clean URLs (no .html extensions in links).

Responsiveness: Mobile-first design philosophy.

📬 Contact & Support

Email: hello@toolblaster.com

Links: Privacy Policy and Contact forms are accessible via the global footer.
