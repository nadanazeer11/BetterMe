/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./modules/**/*.{js,jsx,ts,tsx}",
    "./shared/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        cream: "#FFF8F0",
        sage: { DEFAULT: "#B8D4C2", deep: "#7FB295", soft: "#DEEBE2" },
        blush: { DEFAULT: "#FFD6D6", deep: "#F8A5A5", soft: "#FFEAEA" },
        butter: { DEFAULT: "#FFF4C2", deep: "#F5D85C", soft: "#FFFAE0" },
        lavender: { DEFAULT: "#E0D4F8", deep: "#B8A4E8", soft: "#EFE9FB" },
        mint: { DEFAULT: "#D4F5E5", deep: "#8FD4B0", soft: "#E8FAF1" },
        peach: { DEFAULT: "#FFE0CC", deep: "#F8B088", soft: "#FFEEDF" },
        ink: { DEFAULT: "#4A3F4D", soft: "#8A7E92", faint: "#C4BCC8" },
      },
      fontFamily: {
        display: ["Quicksand_500Medium"],
        "display-semibold": ["Quicksand_600SemiBold"],
        "display-bold": ["Quicksand_700Bold"],
      },
      borderRadius: {
        soft: "20px",
        pillow: "28px",
      },
    },
  },
};
