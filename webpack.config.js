module.exports = {
    entry: __dirname + '/sequencer/sequencer.js',
    output: {
        path: __dirname + '/dist',
        publicPath: '/dist/',
        filename: 'sequencer.js'
    },
    module: {
        rules: [{
          test: /\.js/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {
            presets: ['es2015']
          }
        }]
    }
};
