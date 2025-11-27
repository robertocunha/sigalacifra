# Webpack

## O que é o Webpack?

**Webpack** é um *module bundler* (empacotador de módulos) para JavaScript. Mas o que isso significa na prática?

Quando desenvolvemos uma aplicação web moderna, nosso código fica espalhado em vários arquivos: múltiplos arquivos `.js`, arquivos `.css`, imagens, etc. Além disso, usamos bibliotecas externas (como o Firebase neste projeto) que também são compostas de vários módulos.

O problema é que navegadores tradicionalmente não lidam bem com dezenas ou centenas de arquivos separados. Cada arquivo significa uma requisição HTTP adicional, e gerenciar dependências entre arquivos manualmente é trabalhoso e propenso a erros.

O Webpack resolve isso:

1. **Analisa as dependências** - Começa pelos arquivos de entrada (*entry points*) e segue todos os `import` e `require` para descobrir do que seu código depende
2. **Empacota tudo** - Junta os módulos relacionados em poucos arquivos (*bundles*)
3. **Transforma quando necessário** - Pode processar CSS, converter TypeScript para JS, otimizar imagens, etc.

O resultado é uma pasta `dist/` com arquivos otimizados, prontos para deploy.

### Analogia simples

Pense no Webpack como um chef que:
- Recebe uma lista de receitas (entry points)
- Vai ao mercado buscar todos os ingredientes necessários (dependências)
- Prepara e empacota as marmitas (bundles) prontas para entrega

---

## O arquivo `webpack.config.js`

Este arquivo configura o comportamento do Webpack. Vamos analisar cada seção:

### Imports

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
```

- **path** - Módulo nativo do Node.js para manipular caminhos de arquivos de forma cross-platform
- **HtmlWebpackPlugin** - Gera arquivos HTML e injeta os bundles automaticamente
- **MiniCssExtractPlugin** - Extrai CSS para arquivos separados (ao invés de embutir no JS)
- **CleanWebpackPlugin** - Limpa a pasta `dist/` antes de cada build

### Entry (Pontos de Entrada)

```javascript
entry: {
  index: './src/scripts/index.js',
  createSong: './src/scripts/createSong.js',
  song: './src/scripts/song.js',
  archived: './src/scripts/archived.js',
},
```

Aqui definimos **4 entry points**, um para cada página da aplicação. O Webpack vai analisar cada um desses arquivos e criar um bundle separado contendo:
- O código do próprio arquivo
- Todas as suas dependências (imports)

**Por que múltiplos entry points?** Este é um projeto *multi-page* (MPA), não um *single-page app* (SPA). Cada página HTML é independente e carrega apenas o JavaScript que precisa. Se o usuário está na página de músicas arquivadas, não precisa carregar o código de criação de músicas.

### Output (Saída)

```javascript
output: {
  path: path.resolve(__dirname, 'dist'),
  filename: '[name].bundle.js',
},
```

- **path** - Pasta onde os arquivos serão gerados. `__dirname` é o diretório atual, então `dist/` fica na raiz do projeto
- **filename** - Template para nomear os bundles. `[name]` é substituído pelo nome do entry point

Resultado:
- `dist/index.bundle.js`
- `dist/createSong.bundle.js`
- `dist/song.bundle.js`
- `dist/archived.bundle.js`

### Module Rules (Regras de Módulos)

```javascript
module: {
  rules: [
    {
      test: /\.css$/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
      ],
    },
  ],
},
```

As *rules* dizem ao Webpack como processar diferentes tipos de arquivo.

- **test** - Expressão regular que define quais arquivos essa regra afeta (aqui, todos os `.css`)
- **use** - *Loaders* a aplicar, **de baixo para cima**:
  1. `css-loader` - Interpreta `@import` e `url()` dentro do CSS
  2. `MiniCssExtractPlugin.loader` - Extrai o CSS para um arquivo separado

**Nota:** Se não usássemos `MiniCssExtractPlugin`, o CSS ficaria embutido no JavaScript e seria injetado via `<style>` tags em runtime. Extrair para arquivos `.css` é melhor para caching e performance.

### DevServer (Servidor de Desenvolvimento)

```javascript
devServer: {
  static: {
    directory: path.resolve(__dirname, 'dist'),
  },
  open: true,
  hot: true,
},
```

Configuração do servidor de desenvolvimento local (`webpack-dev-server`):

- **static.directory** - Pasta com arquivos estáticos a servir
- **open** - Abre o navegador automaticamente ao iniciar
- **hot** - *Hot Module Replacement* - atualiza módulos sem recarregar a página inteira (quando possível)

Usado com `npm run dev` ou similar para desenvolvimento local.

### Plugins

```javascript
plugins: [
  new CleanWebpackPlugin(),
  // ... HtmlWebpackPlugin instances ...
  new MiniCssExtractPlugin({
    filename: '[name].css',
  }),
],
```

Plugins estendem as capacidades do Webpack. Diferente dos *loaders* (que transformam arquivos individuais), plugins podem afetar todo o processo de build.

#### CleanWebpackPlugin

```javascript
new CleanWebpackPlugin(),
```

Limpa a pasta `dist/` antes de cada build. Sem isso, arquivos antigos poderiam se acumular (ex: se você renomear um entry point).

#### HtmlWebpackPlugin (×4)

```javascript
new HtmlWebpackPlugin({
  template: './src/index.html',
  filename: 'index.html',
  inject: 'body',
  chunks: ['index'],
}),
```

Uma instância para cada página HTML:

- **template** - Arquivo HTML fonte
- **filename** - Nome do arquivo gerado em `dist/`
- **inject** - Onde inserir as tags `<script>` (`'body'` = antes do `</body>`)
- **chunks** - Quais bundles incluir nesta página

O `chunks: ['index']` é crucial: garante que `index.html` só carregue `index.bundle.js`, não os outros bundles.

#### MiniCssExtractPlugin

```javascript
new MiniCssExtractPlugin({
  filename: '[name].css',
}),
```

Gera arquivos CSS separados. O `[name]` corresponde ao entry point que importou o CSS.

### Devtool (Source Maps)

```javascript
devtool: 'eval-source-map',
```

*Source maps* permitem debugar o código original no navegador, mesmo após o Webpack ter empacotado tudo. `'eval-source-map'` é uma boa opção para desenvolvimento: rebuild rápido e source maps de qualidade.

**Para produção**, você usaria algo como `'source-map'` (mais lento, mas maps mais precisos) ou desabilitaria completamente para esconder o código fonte.

---

## Fluxo Completo

Quando você roda `npm run build`:

1. **CleanWebpackPlugin** limpa `dist/`
2. Webpack lê os 4 entry points
3. Para cada um, segue os imports e monta a árvore de dependências
4. **css-loader** + **MiniCssExtractPlugin** processam os arquivos CSS
5. Webpack gera os bundles JS em `dist/`
6. **MiniCssExtractPlugin** gera os arquivos CSS em `dist/`
7. **HtmlWebpackPlugin** copia os HTMLs e injeta as tags `<script>` e `<link>`

Resultado final em `dist/`:
```
dist/
├── index.html          (com <script src="index.bundle.js">)
├── index.bundle.js
├── index.css
├── createSong.html
├── createSong.bundle.js
├── createSong.css
├── song.html
├── song.bundle.js
├── song.css
├── archived.html
├── archived.bundle.js
└── archived.css
```

---

## Referências

- [Documentação oficial do Webpack](https://webpack.js.org/concepts/)
- [HtmlWebpackPlugin](https://webpack.js.org/plugins/html-webpack-plugin/)
- [MiniCssExtractPlugin](https://webpack.js.org/plugins/mini-css-extract-plugin/)
