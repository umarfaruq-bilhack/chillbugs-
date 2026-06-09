const fs = require('fs');
let c = fs.readFileSync('app/dashboard/game/BugCatcherGame.tsx', 'utf8');
c = c.replace(/\x00/g, '').replace(/\/\/ .*\d{4}.*\n?/g, '');
fs.writeFileSync('app/dashboard/game/BugCatcherGame.tsx', c, 'utf8');
console.log('done');