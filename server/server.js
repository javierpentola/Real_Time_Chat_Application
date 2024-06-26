const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        fs.readFile(path.join(__dirname, '../public', 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (req.method === 'GET' && req.url === '/styles.css') {
        fs.readFile(path.join(__dirname, '../public', 'styles.css'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading styles.css');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/css' });
                res.end(data);
            }
        });
    } else if (req.method === 'GET' && req.url === '/main.js') {
        fs.readFile(path.join(__dirname, '../public', 'main.js'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading main.js');
            } else {
                res.writeHead(200, { 'Content-Type': 'application/javascript' });
                res.end(data);
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;

    // Enviar mensajes anteriores al cliente recién conectado
    fs.readFile(path.join(__dirname, 'messages.json'), (err, data) => {
        if (err) throw err;
        const messages = JSON.parse(data);
        ws.send(JSON.stringify({ type: 'history', data: messages }));
    });

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type !== 'heartbeat') {
            const fullMessage = { ip, text: parsedMessage.text };
            fs.readFile(path.join(__dirname, 'messages.json'), (err, data) => {
                if (err) throw err;
                const messages = JSON.parse(data);
                messages.push(fullMessage);
                fs.writeFile(path.join(__dirname, 'messages.json'), JSON.stringify(messages, null, 2), (err) => {
                    if (err) throw err;
                    wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify(fullMessage));
                        }
                    });
                });
            });
        }
    });
});

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
