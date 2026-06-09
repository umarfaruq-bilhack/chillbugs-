const fs = require('fs');
let c = fs.readFileSync('lib/auth.ts', 'utf8');
c = c.replace(
  'pages: {',
  `session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {`
);
fs.writeFileSync('lib/auth.ts', c, 'utf8');
console.log('done');