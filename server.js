const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const pty = require('node-pty');
const si = require('systeminformation');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(__dirname));

wss.on('connection', (ws) => {
  // Spawn shell
  const shell = process.env.SHELL || 'bash';
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME,
    env: process.env
  });

  // Terminal output to client
  ptyProcess.onData(data => ws.send(JSON.stringify({ type: 'terminal', data })));

  // Client messages
  ws.on('message', async (msg) => {
    const parsed = JSON.parse(msg);
    if (parsed.type === 'input') {
      ptyProcess.write(parsed.data);
    }
    if (parsed.type === 'sysinfo') {
      const cpu = await si.currentLoad();
      const mem = await si.mem();
      ws.send(JSON.stringify({
        type: 'sysinfo',
        cpu: cpu.currentLoad.toFixed(1),
        ramUsed: (mem.active / 1024 / 1024).toFixed(0),
        ramTotal: (mem.total / 1024 / 1024).toFixed(0)
      }));
    }
    if (parsed.type === 'listdir') {
      fs.readdir(parsed.path, { withFileTypes: true }, (err, files) => {
        if (err) return;
        ws.send(JSON.stringify({
          type: 'filelist',
          cwd: parsed.path,
          files: files.map(f => ({ name: f.name, dir: f.isDirectory() }))
        }));
      });
    }
  });
});

server.listen(8080, () => console.log('Mochi-UI-Plus server running on :8080'));
