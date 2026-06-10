const fs = require('fs');
let c = fs.readFileSync('app/dashboard/DashboardClient.tsx', 'utf8');
// Add settings to Props interface
c = c.replace(
  'interface Props {',
  'interface Props {\n  settings: Record<string, boolean>'
);
fs.writeFileSync('app/dashboard/DashboardClient.tsx', c, 'utf8');
console.log('done');