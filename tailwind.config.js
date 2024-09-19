/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
          scrollbar: {
            thumb: '#4A5568',
            track: '#E2E8F0',
            height: '8px',
          },
        },
      },
    plugins: [],
}
  