const http = require('http');

const postData = JSON.stringify({
  apiKey: 'test-api-key'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/balance',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`API响应: ${data}`);
  });
});

req.on('error', (error) => {
  console.error(`请求错误: ${error.message}`);
});

req.write(postData);
req.end();