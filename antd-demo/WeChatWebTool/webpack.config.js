var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

// 本机IP地址
const host = "192.168.96.251"
const port = 3000

var newHtmlPlugin = function(title, filename, chunks, tpl){
  return new HtmlWebpackPlugin({
    filename: filename + ".html",
    hash: true,
    inject: 'body',
    title: title,
    chunks: chunks,
    template: tpl,
  });
}

var cssExtractor = new ExtractTextPlugin("[name].css", {
  allChunks: true,
  hash: true
})

module.exports = {
  entry: {
    "index": path.resolve(__dirname, './src/entries/index.js')
  },
  devServer: {
    hot: false,
    port: port,
    host: host,
    proxy: {
      '/ccs-web': {
        target: 'http://127.0.0.1:8080/ccs-web',
        //target: 'http://114.55.108.206:8080/',
        //target: 'https://ykf.touchong.com/',
        secure: false,
        pathRewrite: {'^/ccs-web' : ''},
        bypass: function(req) {
          console.log("Proxy Http Request: ", req.url);
        }
      }
    }
  },
  output: {
  	path: './dist',
    filename: '[name].js',
    chunkFilename: "[id].js",
    pathinfo: true
  },
  module: {
  	loaders: [
      { test: /\.(js|jsx)$/, exclude: /node_modules/, loader: "babel-loader" },
      { test: /\.css/, loader: cssExtractor.extract("style-loader", "css-loader") },
      { test: /\.less$/, loader: cssExtractor.extract("style-loader", "css-loader!less-loader") },
      { test: /\.(png|jpg|gif|woff|svg|eot|ttf)\??.*$/, loader: 'url?limit=25000'},
      { test: /\.(swf|xap)/, loader: 'file'}
  	]
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.json']
  },
  plugins: [
    cssExtractor,
    newHtmlPlugin('首页', 'index', ['index'], "tpl.html"),
    new CaseSensitivePathsPlugin(),
    new webpack.DefinePlugin({
      'process.env':{
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ]
};
