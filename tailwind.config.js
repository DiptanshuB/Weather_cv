module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        rain: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        snow: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        cloud: {
          '0%': { transform: 'translateX(-50vw)' },
          '100%': { transform: 'translateX(100vw)' },
        },
        lightning: {
          '0%, 97%, 100%': { opacity: '0' },
          '98%': { opacity: '1' },
          '99%': { opacity: '0' },
        },
      },
      animation: {
        rain: 'rain 1.2s linear infinite',
        snow: 'snow 3s linear infinite',
        cloud: 'cloud 20s linear infinite',
        lightning: 'lightning 3s linear infinite',
      },
    },
  },
  plugins: [],
}; 