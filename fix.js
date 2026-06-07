const fs = require('fs');
fs.writeFileSync('.npmrc', 'legacy-peer-deps=true\n', 'utf8');
fs.unlinkSync('package-lock.json');
console.log('done');