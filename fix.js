const fs = require('fs');
let c = fs.readFileSync('app/dashboard/game/BugCatcherGame.tsx', 'utf8');

// Add local level state that updates immediately
c = c.replace(
  'const [selectedLevel, setSelectedLevel] = useState(userLevel)',
  'const [selectedLevel, setSelectedLevel] = useState(userLevel)\n  const [currentLevel, setCurrentLevel] = useState(userLevel)'
);

// Update currentLevel after claiming
c = c.replace(
  "if (selectedLevel === userLevel && selectedLevel < 10) {\n          await fetch('/api/user/level', {\n            method: 'POST',\n            headers: { 'Content-Type': 'application/json' },\n            body: JSON.stringify({ level: selectedLevel + 1 }),\n          })\n        }",
  "if (selectedLevel === currentLevel && selectedLevel < 10) {\n          await fetch('/api/user/level', {\n            method: 'POST',\n            headers: { 'Content-Type': 'application/json' },\n            body: JSON.stringify({ level: selectedLevel + 1 }),\n          })\n          setCurrentLevel(selectedLevel + 1)\n        }"
);

// Use currentLevel instead of userLevel for lock checks
c = c.replace(/locked = lvl\.level > userLevel/g, 'locked = lvl.level > currentLevel');
c = c.replace(/completed = lvl\.level < userLevel/g, 'completed = lvl.level < currentLevel');
c = c.replace(/current = lvl\.level === userLevel/g, 'current = lvl.level === currentLevel');
c = c.replace("selectedLevel > userLevel", "selectedLevel > currentLevel");
c = c.replace("Your current level: <span", "Your current level: <span id='current-level'");
c = c.replace(">Level {userLevel}<", ">Level {currentLevel}<");

fs.writeFileSync('app/dashboard/game/BugCatcherGame.tsx', c, 'utf8');
console.log('done');