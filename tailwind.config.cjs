const radixColors = require("@radix-ui/colors");

/**
 * sm = mobile
 * md = tablet
 * lg = laptop
 * xl = ultrawide
 */
const screens = {
  sm: "332px",
  md: "684px",
  lg: "1036px",
  xl: "1388px",
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens,
    colors: {
      ...radixColors.sandDark,
      ...radixColors.orangeDark,
      ...radixColors.blueDark,
      ...radixColors.grassDark,
      ...radixColors.amberDark,
      ...radixColors.tomatoDark,
      ...radixColors.blackA,
      ...radixColors.whiteA,
    },
    extend: {},
  },
  plugins: [],
};
