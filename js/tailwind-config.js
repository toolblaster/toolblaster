/**
 * Toolblaster Shared Design System (Tailwind CSS Configuration)
 * -------------------------------------------------------------
 * Central Source of Truth for Design.
 * Usage: Include this script AFTER the Tailwind CDN script in every HTML file.
 */

tailwind.config = {
    theme: {
        extend: {
            maxWidth: {
                'site': '1150px',
            },
            colors: {
                'accent-main': '#E34037', 
                'accent-dark': '#c93a32',
                'hero-bg': '#121212',
                'icon-bg': '#fcebeb',
            },
            boxShadow: {
                'custom-hover': '0 12px 25px rgba(0, 0, 0, 0.15)',
                'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            fontFamily: {
                inter: ['Inter', 'Hind', 'sans-serif'], 
                sans: ['Inter', 'Hind', 'sans-serif'],
            },
            // GLOBAL TYPOGRAPHY SYSTEM
            fontSize: {
                'article-p': ['13px', { lineHeight: '1.6', letterSpacing: '0.01em' }],
                'article-p-lg': ['13px', { lineHeight: '1.7', letterSpacing: '0.01em' }],
                'heading-1':    ['40px', { lineHeight: '1.2', fontWeight: '900' }],
                'heading-2':    ['24px', { lineHeight: '1.3', fontWeight: '800' }],
                'heading-3':    ['16px', { lineHeight: '1.4', fontWeight: '700' }],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out forwards',
                'slide-up': 'slideUp 0.4s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(100%)' },
                    '100%': { transform: 'translateY(0)' },
                }
            }
        }
    },
    // NEW: Global Component Plugin
    plugins: [
        function({ addComponents }) {
            addComponents({
                '.card-section': {
                    'backgroundColor': '#ffffff',
                    'borderWidth': '2px',
                    'borderColor': '#d1d5db', // gray-300
                    'borderRadius': '0.75rem', // rounded-xl
                    'padding': '1.5rem', // p-6
                    'marginBottom': '2rem', // mb-8
                    'boxShadow': '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // shadow-sm
                }
            })
        }
    ]
}
