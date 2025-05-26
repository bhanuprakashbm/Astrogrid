const path = require('path');

module.exports = {
    resolve: {
        fallback: {
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("stream-browserify"),
            "path": require.resolve("path-browserify"),
            "os": require.resolve("os-browserify/browser"),
            "zlib": require.resolve("browserify-zlib"),
            "timers": require.resolve("timers-browserify"),
            "net": false,
            "tls": false,
            "fs": false
        }
    }
}; 