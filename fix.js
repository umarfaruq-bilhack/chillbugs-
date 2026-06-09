const fs = require('fs');
let c = fs.readFileSync('app/dashboard/game/BugCatcherGame.tsx', 'utf8');

// Add currentLevel state after selectedLevel
c = c.replace(
  'const [selectedLevel, setSelectedLevel] = useState(userLevel)',
  'const [selectedLevel, setSelectedLevel] = useState(userLevel)\n  const [currentLevel, setCurrentLevel] = useState(userLevel)'
);

fs.writeFileSync('app/dashboard/game/BugCatcherGame.tsx', c, 'utf8');
console.log('done');