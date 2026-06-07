const fs = require('fs');
let c = fs.readFileSync('app/dashboard/DashboardClient.tsx', 'utf8');
c = c.replace(/Creating bug art & tagging us/g, 'Create bug art & tag @TheChillBugs');
c = c.replace(/creating bug art & tagging us/g, 'Create bug art & tag @TheChillBugs');
fs.writeFileSync('app/dashboard/DashboardClient.tsx', c, 'utf8');
console.log('done');