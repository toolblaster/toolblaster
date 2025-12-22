Toolblaster Hub ⚡

Financial Calculators, SEO Tools & In-Depth Software Reviews

Toolblaster is a high-performance, mobile-first digital hub designed to host precision financial calculators, expert-reviewed SEO tools, and comprehensive software reviews. Built with standard HTML5, Tailwind CSS (via CDN), and vanilla JavaScript for maximum speed and zero build-step complexity.

🚀 Key Features

Mobile-First Design: Fully responsive layouts with dedicated mobile navigation drawers and touch-friendly UI.

SEO Optimized: Hand-tuned Meta tags, JSON-LD Schema markup, and semantic HTML structure (WCAG AA compliant).

Centralized UI Logic: Header, Footer, Sidebar, and Modals are injected via header-footer.js to maintain consistency across hundreds of pages.

Dynamic Review Widgets: Automatically populates "Latest Reviews" and "Related Articles" widgets from a single data source.

Performance: Uses system fonts (Inter/Hind) and CDN-hosted Tailwind to ensure high Core Web Vitals scores.

📂 Project Structure

/
├── index.html                 # Homepage (Hub)
├── js/
│   ├── header-footer.js       # Core UI injection (Header, Footer, Sidebar, Review Widgets)
│   ├── global-script.js       # Secondary logic & global event listeners (Overflow)
│   └── tailwind-config.js     # Shared Tailwind design system (Colors, Fonts)
├── reviews/
│   ├── index.html             # Reviews Hub
│   └── security/
│       └── zerossl-review.html # Example Deep-Dive Review
└── terms/                     # Legal pages (Privacy, Terms, About)


🛠️ How to Manage Content

Adding a New Review

To add a new review that automatically appears in the Sidebar and Mobile "You Might Also Like" widgets:

Create your HTML file in reviews/category/your-review.html.

Open js/header-footer.js.

Add the review metadata to the recentReviews array at the top of the file:

const recentReviews = [
    { 
        title: "New Tool Review", 
        url: "/reviews/category/new-tool.html", 
        category: "Productivity", 
        date: "Jan 2026" 
    },
    // ... existing reviews
];


The system automatically filters out the current page to prevent self-linking.

Global Scripting

js/header-footer.js: strictly for layout injection (Nav, Footer, Sidebar).

js/global-script.js: Use this for analytics, complex animations, or site-wide logic that doesn't involve layout injection.

🎨 Design System

Primary Color: #E34037 (Accent Red)

Background: #0f1115 (Dark Headers), #f9f9f9 (Body)

Fonts: Hind (Headings), Inter (Body Text)

📦 Deployment

This is a static site. No build process (npm/webpack) is required.
Simply upload the root folder to Cloudflare Pages, Netlify, or Vercel.

Maintained by Toolblaster Team
