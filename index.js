const app = require('./src/app');
// const WebSocket = require('ws');
// const wss = new WebSocket.Server({ noServer: true });
// app.clients = new Set();

// wss.on('connection', (ws) => {
//     app.clients.add(ws);
//     ws.on('close', () => app.clients.delete(ws));
// });

const PORT = 3000;

app.server = app.listen(PORT, () => {
    console.log(`App listening to port ${PORT}`);
});

// app.server.on('upgrade', (request, socket, head) => {
//     wss.handleUpgrade(request, socket, head, (ws) => wss.emit('connection', ws, request));
// });