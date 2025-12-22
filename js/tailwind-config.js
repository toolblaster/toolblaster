/**
 * Toolblaster Shared Design System (Tailwind CSS Configuration)
 * -------------------------------------------------------------
 * Central Source of Truth for Design & Accessibility.
 * Usage: Include this script AFTER the Tailwind CDN script in every HTML file.
 */

tailwind.config = {
    theme: {
        // Global Container Configuration
        container: {
            center: true,
            padding: '1rem',
            screens: {
                sm: '640px',
                md: '768px',
                lg: '1024px',
                xl: '1150px',
                '2xl': '1150px', // Locked to 1150px
            },
        },
        extend: {
            // Custom Max Widths
            maxWidth: {
                'site': '1150px',
            },
            // Custom Colors - WCAG AA Compliant High Contrast Palette
            colors: {
                // Optimized Red: Darkened slightly to pass 4.5:1 contrast ratio on white
                'accent-main': '#D9261F', 
                'accent-dark': '#B91C1C', // Darker shade for hover states
                
                'hero-bg': '#121212',
                'icon-bg': '#fcebeb',
                
                // HIGH CONTRAST GRAYS (Zinc/Neutral basis)
                // Lighter backgrounds kept for card contrast
                'gray-50': '#FAFAFA', 
                'gray-100': '#F4F4F5', 
                'gray-200': '#E4E4E7',
                'gray-300': '#D4D4D8', // Borders
                
                // Darkened text colors for readability
                'gray-400': '#71717A', // Footer text / Meta text (Passes AA large)
                'gray-500': '#52525B', // Subtitles / Secondary text (Passes AA)
                'gray-600': '#3F3F46', // Body text (Strong contrast)
                'gray-700': '#27272A', // Headings / High priority text
                'gray-800': '#18181B', // Almost black
                'gray-900': '#09090B', // Pitch black
            },
            // Custom Shadows
            boxShadow: {
                'custom-hover': '0 10px 40px -10px rgba(0,0,0,0.15)',
                'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            // Font Families
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
                sans: ['Inter', 'sans-serif'],
                heading: ['Hind', 'sans-serif'],
            },
            // GLOBAL TYPOGRAPHY SYSTEM
            fontSize: {
                // Paragraph - 12px (Base)
                'article-p':    ['12px', { lineHeight: '1.6', fontWeight: '400' }], 
                
                // Large Paragraph/Intro - 12px (Updated per request)
                'article-p-lg': ['12px', { lineHeight: '1.6', fontWeight: '400' }],
                
                // Override default 'text-sm' to 12px (For tables/auxiliary content)
                'sm':           ['12px', { lineHeight: '1.5', fontWeight: '400' }],

                // Headings
                'heading-1':    ['36px', { lineHeight: '1.1', fontWeight: '900' }], 
                'heading-2':    ['22px', { lineHeight: '1.3', fontWeight: '800' }], 
                'heading-3':    ['14px', { lineHeight: '1.4', fontWeight: '800' }], 
            },
            // Animations
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
    // Global Component Plugin
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
