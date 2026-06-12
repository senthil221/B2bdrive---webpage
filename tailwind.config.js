/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./404.html"],
  theme: {
    extend: {
      colors: {
        paper: "#ffffff",
        mist: "#f4f6f1",
        "mist-alt": "#eef1e8",
        ink: "#0d0f0e",
        "ink-2": "#15181a",
        "ink-soft": "#5b625f",
        "ink-mute": "#8a918d",
        line: "#e4e7df",
        "line-dark": "#262a28",
        azure: "#2f6bff",
        "azure-deep": "#1e50d6",
        "azure-soft": "#e8effe"
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"]
      },
      boxShadow: {
        card: "0 12px 40px rgba(13,15,14,.06)",
        soft: "0 6px 24px rgba(13,15,14,.05)",
        lift: "0 20px 60px rgba(13,15,14,.10)"
      },
      maxWidth: {
        shell: "1200px"
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};
