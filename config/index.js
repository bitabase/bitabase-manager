const path = require('path');

const config = {
  dev: {
    dataPath: path.resolve(__dirname, '../data'),
    secret: 'not-the-closest-kept-secret-in-the-world',
    port: 8081,
    allowedCrossOriginDomains: [
      'http://localhost:8080'
    ]
  },

  production: {
    dataPath: '/var/data',
    secret: process.env.BB_INTERNAL_SECRET,
    port: 80,
    allowedCrossOriginDomains: [
      'https://bitabase.com',
      'https://www.bitabase.com'
    ]
  }
};

module.exports = config[process.env.NODE_ENV || 'dev'];
