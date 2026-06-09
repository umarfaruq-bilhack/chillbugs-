const fs = require('fs');
let c = fs.readFileSync('app/dashboard/game/BugCatcherGame.tsx', 'utf8');

// Fix: update currentLevel BEFORE the setTimeout so it's ready when select screen shows
c = c.replace(
  `if (selectedLevel === currentLevel && selectedLevel < 10) {
          await fetch('/api/user/level', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ level: selectedLevel + 1 }),
          })
          setCurrentLevel(prev => prev + 1)
        }
        setTimeout(() => {
          setGameState('select')
          setClaimed(false)
          if (selectedLevel < 10) setSelectedLevel(prev => prev + 1)
        }, 2000)`,
  `const nextLevel = selectedLevel + 1
        if (selectedLevel === currentLevel && selectedLevel < 10) {
          await fetch('/api/user/level', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ level: nextLevel }),
          })
          setCurrentLevel(nextLevel)
        }
        setTimeout(() => {
          setGameState('select')
          setClaimed(false)
          if (selectedLevel < 10) setSelectedLevel(nextLevel)
        }, 2000)`
);

fs.writeFileSync('app/dashboard/game/BugCatcherGame.tsx', c, 'utf8');
console.log('done');