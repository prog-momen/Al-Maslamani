const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === 'android' || file === 'ios' || file === '.expo') continue;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      replaceInDir(filePath);
    } else if (file.match(/\.(js|ts|tsx|jsx|json)$/)) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.match(/#84BD00/i)) {
        content = content.replace(/#84BD00/ig, '#84BD00');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated', filePath);
      }
    }
  }
}

replaceInDir(__dirname);
console.log('Done');
