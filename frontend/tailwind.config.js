/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {50:'#eef2ff',100:'#e0e7ff',200:'#c7d2fe',300:'#a5b4fc',400:'#818cf8',500:'#6366f1',600:'#5b4def',700:'#4f46e5',800:'#4338ca',900:'#3730a3',950:'#1e1b4b'},
        navy: {50:'#f8fafc',900:'#0f172a',950:'#020617'},
        accent: {50:'#fdf2f8',500:'#d946ef',600:'#c026d3'},
        dark: {300:'#334155',400:'#1e293b',500:'#0f172a',600:'#0b1120'}
      },
      fontFamily: {sans:['Inter','system-ui','sans-serif'],display:['Plus Jakarta Sans','Inter','sans-serif']},
      borderRadius: {'2xl':'1rem','3xl':'1.25rem'},
      animation: {'fade-in':'fadeIn 0.3s ease-out','slide-up':'slideUp 0.3s ease-out'},
      keyframes: {fadeIn:{'0%':{opacity:'0'},'100%':{opacity:'1'}},slideUp:{'0%':{opacity:'0',transform:'translateY(8px)'},'100%':{opacity:'1',transform:'translateY(0)'}}},
      boxShadow: {glass:'0 8px 32px rgba(15,23,42,0.06)',card:'0 4px 24px rgba(15,23,42,0.07)',glow:'0 0 20px rgba(91,77,239,0.25)'}
    },
  },
  plugins: [],
}
