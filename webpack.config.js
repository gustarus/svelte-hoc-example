const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const rootDir = path.resolve(__dirname);

const config = isProduction => ({
  entry: {
    index: path.resolve(rootDir, 'src', 'index.js')
  },

  output: {
    path: path.resolve(rootDir, 'build'),
    filename: isProduction ? '[name].[hash].js' : '[name].js',
    publicPath: '/'
  },

  resolve: {
    extensions: ['.mjs', '.js', '.svelte', '.json']
  },

  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: [
          {
            loader: 'svelte-loader',
            options: {
              preprocess: require('svelte-preprocess')(),
              hotReload: true
            }
          }
        ]
      }
    ]
  },

  plugins: [
    new CleanWebpackPlugin(),

    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(rootDir, 'src', 'index.html')
    })
  ],

  devServer: {
    publicPath: '/',
    overlay: true,
    compress: true,
    historyApiFallback: {
      disableDotRule: true
    }
  }
});

module.exports = (_, { mode }) => {
  const isProduction = mode === 'production';
  return config(isProduction);
};
