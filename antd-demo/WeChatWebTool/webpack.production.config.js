var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var commonsPlugin = new webpack.optimize.CommonsChunkPlugin({
  // chunk name
  name: 'common',
  // require两次才提取
  minChunks: 2
});

var newHtmlPlugin = function(title, filename, chunks, tpl){
  return new HtmlWebpackPlugin({
    filename: filename + ".html",
    hash: true,
    inject: 'body',
    title: title,
    chunks: chunks,
    template: tpl,
    // 压缩HTML文件
    /*minify: {
      //移除HTML中的注释
      removeComments: true,
      //删除空白符与换行符
      collapseWhitespace: true
    }*/
  });
}

var cssExtractor = new ExtractTextPlugin("[name].[contenthash:8].css", {
  allChunks: true,
  hash: true
})

module.exports = function (webpackConfig) {
  webpackConfig.entry = {
    "index": path.resolve(__dirname, './src/entries/index.js')
  };
  webpackConfig.output = {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[chunkhash:8].js',
    chunkFilename: "[name].[chunkhash:8].js"
  }
  webpackConfig.module.loaders = [
    { test: /\.jsx?$/, exclude: /node_modules/, loader: "babel-loader" },
    { test: /\.css/, loader: cssExtractor.extract("style-loader", "css-loader") },
    { test: /\.less$/, loader: cssExtractor.extract("style-loader", "css-loader!less-loader") },
    { test: /\.(png|jpg|gif|woff|svg|eot|ttf)\??.*$/, loader: 'url?limit=25000'},
    { test: /\.(swf|xap)/, loader: 'file'}
  ];
  webpackConfig.resolve = {
    extensions: ['', '.js', '.jsx', '.json']
  },
  webpackConfig.plugins.push(commonsPlugin);
  webpackConfig.plugins.push(cssExtractor);
  webpackConfig.plugins.push(newHtmlPlugin('首页', 'index', ['common', 'index'], "tpl.html"));

  webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
      drop_debugger: true,
      drop_console: true
    },
    output: {
      comments: false,
    },
    except: ['$super', '$', 'exports', 'require']    //排除关键字
  }))
  webpackConfig.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
  webpackConfig.plugins.push(new webpack.optimize.DedupePlugin());
  return webpackConfig;
}
