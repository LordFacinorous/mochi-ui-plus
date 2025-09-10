const fs = require('fs');
const path = require('path');

function loadFiles(dir) {
  const fileListElem = document.getElementById('filelist');
  fileListElem.innerHTML = '';
  fs.readdir(dir, { withFileTypes: true }, (err, files) => {
    if (err) return;
    files.forEach(file => {
      const li = document.createElement('li');
      li.textContent = file.isDirectory() ? `[${file.name}]` : file.name;
      li.onclick = () => {
        if (file.isDirectory()) {
          loadFiles(path.join(dir, file.name));
        } else {
          term.write(`\r\n${path.join(dir, file.name)}\r\n`);
        }
      };
      fileListElem.appendChild(li);
    });
  });
}

window.electronAPI.onUpdateFileBrowser((cwd) => {
  loadFiles(cwd);
});

loadFiles(process.env.HOME);
