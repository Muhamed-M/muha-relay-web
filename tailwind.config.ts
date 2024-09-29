module.exports = {
  theme: {
    extend: {
      keyframes: {
        typing: {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-5px)' },
        },
      },
      animation: {
        'typing-dot1': 'typing 1s infinite',
        'typing-dot2': 'typing 1s infinite 0.2s',
        'typing-dot3': 'typing 1s infinite 0.4s',
      },
    },
  },
  plugins: [],
};
