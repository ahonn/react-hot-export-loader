const HtmlwebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: ['./index.js'],

  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js',
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
          require.resolve('../'),
        ],
      },
    ],
  },

  plugins: [
    new HtmlwebpackPlugin({
      template: __dirname + '/index.ejs',
    }),
  ],
};
