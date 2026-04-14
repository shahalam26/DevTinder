const http = require('https');

const options = {
  hostname: 'developerstinder.onrender.com',
  path: '/me',
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://dev-tinder-orpin.vercel.app',
    'Access-Control-Request-Method': 'GET',
    'Access-Control-Request-Headers': 'content-type'
  }
};

const req = http.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
});

req.on('error', (e) => {
  console.error(e);
});
req.end();
