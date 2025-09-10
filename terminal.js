const { Terminal } = window.Terminal;
const term = new Terminal({ cursorBlink: true });
term.open(document.getElementById('terminal'));

const ws = new WebSocket(`ws://${location.host}`);

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === 'terminal') term.write(msg.data);
  if (msg.type === 'sysinfo') {
    document.getElementById('cpu').innerText = `CPU: ${msg.cpu}%`;
    document.getElementById('ram').innerText = `RAM: ${msg.ramUsed} / ${msg.ramTotal} MB`;
  }
  if (msg.type === 'filelist') {
    const list = document.getElementById('filelist');
    list.innerHTML = '';
    msg.files.forEach(f => {
      const li = document.createElement('li');
      li.textContent = f.dir ? `[${f.name}]` : f.name;
      li.onclick = () => {
        if (f.dir) ws.send(JSON.stringify({ type: 'listdir', path: `${msg.cwd}/${f.name}` }));
      };
      list.appendChild(li);
    });
  }
};

term.onData(data => ws.send(JSON.stringify({ type: 'input', data })));
setInterval(() => ws.send(JSON.stringify({ type: 'sysinfo' })), 2000);
ws.onopen = () => ws.send(JSON.stringify({ type: 'listdir', path: '/' }));
