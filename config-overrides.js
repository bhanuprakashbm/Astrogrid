const path = require('path');
const webpack = require('webpack');

module.exports = function override(config, env) {
    // Add Node.js polyfills
    config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        path: require.resolve('path-browserify'),
        os: require.resolve('os-browserify/browser'),
        zlib: require.resolve('browserify-zlib'),
        timers: require.resolve('timers-browserify'),
        assert: require.resolve('assert/'),
        util: require.resolve('util/'),
        url: require.resolve('url/'),
        net: false,
        tls: false,
        fs: false,
        buffer: require.resolve('buffer/'),
        process: require.resolve('process/browser')
    };

    // Add process and Buffer polyfills
    config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ];

    // Enable these options to help with debugging module resolution
    config.resolve.symlinks = false;
    if (env === 'development') {
        config.resolve.preferRelative = true;
    }

    return config;
}; 