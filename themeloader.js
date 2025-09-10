const themeDir = path.join(__dirname, 'themes');

function loadThemeList() {
  fs.readdir(themeDir, (err, files) => {
    if (err) return;
    const select = document.getElementById('themeSelect');
    files.filter(f => f.endsWith('.json')).forEach(file => {
      const opt = document.createElement('option');
      opt.value = file;
      opt.textContent = file.replace('.json', '');
      select.appendChild(opt);
    });
    select.onchange = () => applyTheme(select.value);
  });
}

function applyTheme(themeFile) {
  fs.readFile(path.join(themeDir, themeFile), 'utf8', (err, data) => {
    if (err) return;
    const theme = JSON.parse(data);
    for (const key in theme) {
      document.documentElement.style.setProperty(`--${key}`, theme[key]);
    }
  });
}

loadThemeList();
applyTheme('default.json');
