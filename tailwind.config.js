/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    minHeight: {
      '1/2': '545px',
    },
  },
  plugins: [
    require("daisyui")
  ],
  daisyui: {
    themes: [
      {
        viho: {
          ...require('daisyui/src/colors/themes')['[data-theme=viho]'],
          "primary": "#d97f3d",
          "secondary": "#f25f4c",
          "accent": "#d97f3d",
          "neutral": "#ffffff",
          "base-100": "#202938",
          "base-200": "#111727",
          "base-300": "#343e4d",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
          '.btn-primary': {
            'color': '#fff',
          },
          '.btn-primary:hover': {
            'color': '#fff',
            'background-color': '#d97f3d',
            'border-color': '#d97f3d',
          },
          'a': {
            'color': '#d97f3d',
          },
          'a.btn': {
            'color' : '#ffffff',
          },
          'a.btn:hover': {
            'color' : '#ffffff',
            'background-color' : '#d97f3d',
            'border-color' : '#d97f3d',
          },
          'li a': {
            'color' : '#ffffff',
          },
          'li a:hover': {
            'color' : '#ffffff',
            'background-color' : '#d97f3d',
            'border-color' : '#d97f3d',
          },
        },
      },
      "light",
      "dark",
      "halloween",
    ],
  },
}