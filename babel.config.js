module.exports = {
  presets: ['@babel/env', '@babel/react'],
  plugins: [
    '@babel/plugin-transform-async-to-generator',
    '@babel/plugin-proposal-object-rest-spread',
  ],
  env: {
    test: {
      plugins: [
        '@babel/plugin-transform-modules-commonjs',
        '@babel/plugin-transform-runtime',
      ],
    },
  },
};
