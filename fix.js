const fs = require('fs');
let c = fs.readFileSync('app/dashboard/game/BugCatcherGame.tsx', 'utf8');
c = c.replace(/\x00/g, '');
// Remove any trailing blank lines
c = c.trimEnd() + '\n';
fs.writeFileSync('app/dashboard/game/BugCatcherGame.tsx', c, 'utf8');
console.log('done');