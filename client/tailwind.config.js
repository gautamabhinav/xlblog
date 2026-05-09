/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // <- important!
  content: [ "./src/**/*.{html,js,jsx,ts,tsx}", "./index.html",],
  theme: {
    extend: {
      colors: {
        premium: {
          black: "#050608",
          panel: "#0d1117",
          muted: "#151923",
          red: "#e50914",
          blue: "#00a8ff",
        },
        theme: {
          primary: "#f8fafc",
          secondary: "#94a3b8",
          muted: "#64748b",
          bg: "#050608",
          card: "rgba(255,255,255,.055)",
          border: "rgba(255,255,255,.10)",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        premium: "8px",
      },
      boxShadow: {
        premium: "0 24px 80px rgba(0,0,0,.35)",
        "glow-red": "0 18px 50px rgba(229,9,20,.28)",
        "glow-blue": "0 18px 50px rgba(0,168,255,.24)",
      },
      backgroundImage: {
        cinematic:
          "linear-gradient(180deg, rgba(5,6,8,.66), #050608 72%), linear-gradient(110deg, rgba(229,9,20,.12), transparent 38%, rgba(0,168,255,.12))",
      },
    },
  },
  plugins: [require("daisyui")],
}

