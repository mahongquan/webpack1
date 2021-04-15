const path = require('path');
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
         loader: 'swc-loader',
         exclude: /(node_modules|bower_components)/,
       },
      ],
    },
  devServer: {
    proxy: {
      '/rest': 'http://localhost:8000/',
    },
  },    
};

