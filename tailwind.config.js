/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#5CB85C",
        "page-background": "#212121",
        "editor-background": "#2E2E2E",
        "editor-text": "#F5F5F5",
        "header-text": "#E0E0E0",
        "toolbar-background": "#424242",
        "toolbar-hover": "#212121",
        "toolbar-text": "#F5F5F5",
        "toolbar-disabled": "#757575",
        "toolbar-clicked": "#161c18",
        "toolbar-danger": "#D9534F",
        "toolbar-success": "#5CB85C",
        "toolbar-unsaved": "#FFC107",
      },
    },
  },
  plugins: [],
};
