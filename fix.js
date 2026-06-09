const fs = require('fs');
let c = fs.readFileSync('app/dashboard/game/BugCatcherGame.tsx', 'utf8');

// After claiming, go to select screen and advance to next level
c = c.replace(
  "setTimeout(() => { setGameState('select'); setClaimed(false) }, 2000)",
  `setTimeout(() => {
          setGameState('select')
          setClaimed(false)
          if (selectedLevel === currentLevel && selectedLevel < 10) {
            setCurrentLevel(prev => prev + 1)
            setSelectedLevel(selectedLevel + 1)
          }
        }, 2000)`
);

fs.writeFileSync('app/dashboard/game/BugCatcherGame.tsx', c, 'utf8');
console.log('done');