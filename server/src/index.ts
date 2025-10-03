import https from 'https';
import fs from 'fs';
import path from 'path';
import app from './app';  // your existing app.ts

const port = process.env.PORT || 5000;

// Correct paths to certs in project root
const keyPath = path.join(__dirname, '..', 'cert', 'key.pem');
const certPath = path.join(__dirname, '..', 'cert', 'cert.pem');

const httpsOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

https.createServer(httpsOptions, app).listen(port, () => {
});
