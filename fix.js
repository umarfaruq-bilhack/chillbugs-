const fs = require('fs');
let c = fs.readFileSync('app/dashboard/game/BugCatcherGame.tsx', 'utf8');
c = c.replace(
  "setTimeout(() => router.push('/dashboard'), 2000)",
  "setTimeout(() => { setGameState('select'); setClaimed(false) }, 2000)"
);
fs.writeFileSync('app/dashboard/game/BugCatcherGame.tsx', c, 'utf8');
console.log('done');