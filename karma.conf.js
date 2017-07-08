module.exports = function(config) {
  config.set({
    browsers: ['Chrome'],
    files: [
      { pattern: 'specs.webpack.js', watched: false }
    ],
    frameworks: ['jasmine'],
    preprocessors: {
      'specs.webpack.js': ['webpack']
    },
    reporters: ['mocha'],
    singleRun: false,
    webpack: {
      module: {
        rules: [{ 
          test: /\.js$/,
          use: [{
            loader: 'babel-loader',
            options: {
              ignore: '/node_modules/'
            }
          }]
        }]
      },
      watch: false
    },
    webpackServer: {
      noInfo: true
    }
  });
};