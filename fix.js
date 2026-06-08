const fs = require('fs');
let c = fs.readFileSync('components/WLApplication.tsx', 'utf8');
c = c.replace(
  "export function WLApplication() {",
  "export function WLApplication({ tweetUrl = 'https://twitter.com/TheChillBugs' }: { tweetUrl?: string }) {"
);
fs.writeFileSync('components/WLApplication.tsx', c, 'utf8');
console.log('done');