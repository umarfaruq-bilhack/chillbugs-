const fs = require('fs');
const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));

// Remove all windows-specific tailwind packages
Object.keys(lock.packages).forEach(key => {
  if (key.includes('win32') || key.includes('darwin') || key.includes('oxide-win') || key.includes('oxide-darwin')) {
    delete lock.packages[key];
  }
});

fs.writeFileSync('package-lock.json', JSON.stringify(lock, null, 2));
console.log('Removed windows packages. Remaining oxide packages:');
Object.keys(lock.packages).filter(k => k.includes('oxide')).forEach(k => console.log(' -', k));