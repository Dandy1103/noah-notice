const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({

  name: 'noah-notice',

  exposes: {
    './routes': './src/app/remote.routes.ts',
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

  skip: [
    '@file-viewer/core',
    '@file-viewer/doc',
    '@file-viewer/renderer-presentation',
    '@file-viewer/renderer-spreadsheet',
    'mammoth',
    'pdfjs-dist',
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    // Add further packages you don't need at runtime
  ]

  // Please read our FAQ about sharing libs:
  // https://shorturl.at/jmzH0
  
});
