const { Terminal } = require('xterm');
const pty = require('node-pty');
const os = require('os');

const shell = process.env.SHELL || 'bash';
const term = new Terminal({ cursorBlink: true });
term.open(document.getElementById('terminal'));

let currentCwd = process.env.HOME;

const ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: 80,
  rows: 24,
  cwd: currentCwd,
  env: process.env
});

ptyProcess.onData(data => {
  term.write(data);
  if (data.includes('\n') || data.includes('\r')) {
    require('child_process').exec('pwd', { cwd: currentCwd }, (err, stdout) => {
      if (!err) {
        currentCwd = stdout.trim();
        window.electronAPI.cwdChanged(currentCwd);
      }
    });
  }
});

term.onData(data => ptyProcess.write(data));
