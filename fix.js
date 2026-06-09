const fs = require('fs');
let c = fs.readFileSync('app/api/tasks/route.ts', 'utf8');

// Remove the duplicate const points declaration
c = c.replace('\n  const points = TASK_POINTS[type]\n', '\n');

// Fix let vs const issue
c = c.replace('  const points = TASK_POINTS[type]\n  if (type === \'bug_catcher_game\'', '  let points = TASK_POINTS[type]\n  if (type === \'bug_catcher_game\'');

fs.writeFileSync('app/api/tasks/route.ts', c, 'utf8');
console.log('done');