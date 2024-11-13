const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    index: './src/scripts/index.js',        // Entrada para a página inicial
    createSong: './src/scripts/createSong.js' // Entrada para a página de criação de música
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'  // Define o nome do bundle com base no nome da entrada
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,  // Extrai CSS em arquivos separados
          'css-loader'                  // Carrega o CSS
        ]
      }
    ]
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'),  // Define o diretório onde os arquivos estáticos ficam
    },
    open: true,           // Para abrir automaticamente no navegador
    hot: true,            // Ativa o Hot Module Replacement
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',  // O Webpack usará este arquivo como modelo
      filename: 'index.html',        // O nome do arquivo de saída será index.html
      inject: 'body',                // Injeta o script bundle.js no <body>
      chunks: ['index']              // Este script será injetado apenas na página inicial
    }),
    new HtmlWebpackPlugin({
      template: './src/createSong.html', // O Webpack usará este arquivo como modelo
      filename: 'createSong.html',       // O nome do arquivo de saída será createSong.html
      inject: 'body',                   // Injeta o script bundle.js no <body>
      chunks: ['createSong']            // Este script será injetado apenas na página de criação de música
    }),
    new MiniCssExtractPlugin({
      filename: 'main.css'           // O CSS gerado será nomeado como main.css
    })
  ],
  devtool: 'eval-source-map',
};
