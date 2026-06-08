const fs = require('fs');
let c = fs.readFileSync('components/WLApplication.tsx', 'utf8');

// Fix image paths
c = c.replace(/\.\/chillbug2-clean\.jpeg/g, '/chillbug-clean.png');
c = c.replace(/\.\/chillbug-clean\.png/g, '/chillbug-clean.png');

// Replace 4 image boxes with single centered image
c = c.replace(
  `<div style={{ display:'flex', gap:'10px', justifyContent:'center', marginBottom:'20px' }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ width:'52px', height:'52px', background:'#0a0a0a', border:'1px solid #2a2a2a', borderRadius:'12px', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <img src="/chillbug-clean.png" alt="Chill Bug" style={{ width:'44px', height:'44px', objectFit:'contain', opacity: 0.6 + (i * 0.1) }} />
                </div>
              ))}
            </div>`,
  `<div style={{ display:'flex', justifyContent:'center', marginBottom:'20px' }}>
                <img src="/chillbug-clean.png" alt="Chill Bug" style={{ width:'120px', height:'120px', objectFit:'contain' }} />
              </div>`
);

fs.writeFileSync('components/WLApplication.tsx', c, 'utf8');
console.log('done');