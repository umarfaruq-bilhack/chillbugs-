const fs = require('fs')
let c = fs.readFileSync('components/WLApplication.tsx', 'utf8')

// Add follow founder task after follow ChillBugs
c = c.replace(
  "const [doneFollow, setDoneFollow] = useState(false)\n  const [doneRepost, setDoneRepost] = useState(false)",
  "const [doneFollow, setDoneFollow] = useState(false)\n  const [doneFounder, setDoneFounder] = useState(false)\n  const [clickedFounder, setClickedFounder] = useState(false)\n  const [doneRepost, setDoneRepost] = useState(false)"
)

// Update allTasksDone to include founder
c = c.replace(
  'const allTasksDone = doneFollow && doneRepost && doneQuote && doneTag && commentVerified',
  'const allTasksDone = doneFollow && doneFounder && doneRepost && doneQuote && doneTag && commentVerified'
)

// Add founder task after follow task mark button
c = c.replace(
  "              {/* Task 2 - Repost */}",
  `              {/* Task 1b - Follow Founder */}
              <div style={taskRow(doneFounder, !doneFollow ? 0.4 : 1)}>
                <div style={taskIcon(doneFounder)}>{doneFounder ? '✅' : '🐦'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>Follow the Founder</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Follow @y0itsnash on X</div>
                </div>
                {doneFollow && !doneFounder && <button onClick={() => { window.open('https://x.com/y0itsnash?s=21', '_blank'); setClickedFounder(true) }} style={goBtn}>Go →</button>}
                {doneFounder && <span style={{ color: '#00ff87', fontSize: '13px', fontWeight: 700 }}>Done ✓</span>}
              </div>
              {doneFollow && !doneFounder && clickedFounder && (
                <button onClick={() => setDoneFounder(true)} style={markBtn}>✓ I've followed @y0itsnash — mark as done</button>
              )}

              {/* Task 2 - Repost */}`
)

// Update repost opacity to depend on doneFounder
c = c.replace(
  'taskRow(doneRepost, !doneFollow ? 0.4 : 1)',
  'taskRow(doneRepost, !doneFounder ? 0.4 : 1)'
)

// Update repost go button condition
c = c.replace(
  '{doneFollow && !doneRepost && <button onClick={() => { window.open(tweetUrl',
  '{doneFounder && !doneRepost && <button onClick={() => { window.open(tweetUrl'
)

// Update repost mark done condition
c = c.replace(
  '{doneFollow && !doneRepost && clickedRepost',
  '{doneFounder && !doneRepost && clickedRepost'
)

// Update step 3 completed tasks list
c = c.replace(
  "['Followed @TheChillBugs', 'Liked & reposted pinned tweet', 'Quoted the tweet & tagged friends', 'Tagged 2 friends in comments', 'Comment link verified']",
  "['Followed @TheChillBugs', 'Followed @y0itsnash', 'Liked & reposted pinned tweet', 'Quoted the tweet & tagged friends', 'Tagged 2 friends in comments', 'Comment link verified']"
)

fs.writeFileSync('components/WLApplication.tsx', c, 'utf8')
console.log('done')