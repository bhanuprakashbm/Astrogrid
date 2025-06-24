/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html",
    ],
    theme: {
        extend: {
            colors: {
                'space-blue': '#0B3D91',
                'space-red': '#FC3D21',
                'dark-space': '#111827',
                'space-gray': '#374151',
            },
        },
    },
    plugins: [],
} 