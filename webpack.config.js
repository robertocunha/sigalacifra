const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/scripts/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
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
      inject: 'body',                // Injeta o script bundle.js no <body>
    }),
    new MiniCssExtractPlugin({
      filename: 'main.css'           // O CSS gerado será nomeado como main.css
    })
  ],
  devtool: 'eval-source-map',
};
