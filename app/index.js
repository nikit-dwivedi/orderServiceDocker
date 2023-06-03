const http = require('http');
const app = require('./app');
require('dotenv').config()
process.env.TZ = 'Asia/Calcutta';
const port = process.env.APPID;
const IP = process.env.IP || '127.0.0.1';
const server = http.createServer(app);
server.listen(port, () => {
    console.log(`Fablo listening at http://${IP}:${port}`)
});
