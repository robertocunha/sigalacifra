const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');  // Adicione esta linha

module.exports = {
  entry: {
    index: './src/scripts/index.js',
    createSong: './src/scripts/createSong.js',
    song: './src/scripts/song.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    open: true,
    hot: true,
  },
  plugins: [
    new CleanWebpackPlugin(),  // Adicione esta linha
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      inject: 'body',
      chunks: ['index']
    }),
    new HtmlWebpackPlugin({
      template: './src/createSong.html',
      filename: 'createSong.html',
      inject: 'body',
      chunks: ['createSong']
    }),
    new HtmlWebpackPlugin({
      template: './src/song.html',
      filename: 'song.html',
      inject: 'body',
      chunks: ['song']
    }),
    new MiniCssExtractPlugin({
      filename: 'main.css'
    })
  ],
  devtool: 'eval-source-map',
};
