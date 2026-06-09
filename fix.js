const fs = require('fs');
let c = fs.readFileSync('app/api/tasks/route.ts', 'utf8');
// Fix the broken line - add newline after points declaration
c = c.replace(
  '  const updateData: any = { bug_points: user.bug_points + points }  if (type === \'daily_checkin\')',
  '  const updateData: any = { bug_points: user.bug_points + points }\n  if (type === \'daily_checkin\')'
);
fs.writeFileSync('app/api/tasks/route.ts', c, 'utf8');
console.log('done');