const path = require('path');
const { ESBuildPlugin } = require('esbuild-loader')
module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js',
    },
    module: {
      rules: [
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
       {
         test: /\.js$/,
         loader: 'esbuild-loader',
         options: {
           loader: 'jsx', // Remove this if you're not using JSX
           target: 'es2015' // Syntax to compile to (see options below for possible values)
         }
       },
      ],
    },
    plugins: [
     new ESBuildPlugin()
    ],
  devServer: {
    proxy: {
      '/rest': 'http://localhost:8000/',
    },
  },    
};

